#!/bin/bash
#
# Setup Cloud VM with Midnight Proof Server for Hackathon
# This provides REAL Midnight ZK proofs for development
#
# Prerequisites:
# - gcloud CLI installed and authenticated
# - SSH keys configured
#

set -e

PROJECT_ID=${GOOGLE_PROJECT_ID:-"agenticdid"}
ZONE="us-central1-a"
INSTANCE_NAME="midnight-proof-server"
MACHINE_TYPE="n2-standard-2"  # Has AVX-512

echo "🚀 Setting up Cloud Proof Server for Midnight Hackathon"
echo "=================================================="
echo ""
echo "Project: $PROJECT_ID"
echo "Zone: $ZONE"
echo "Instance: $INSTANCE_NAME"
echo ""

# Check if instance exists
if gcloud compute instances describe $INSTANCE_NAME --zone=$ZONE --project=$PROJECT_ID &>/dev/null; then
    echo "✅ Instance already exists"
    INSTANCE_EXISTS=true
else
    echo "📦 Creating new VM instance..."
    gcloud compute instances create $INSTANCE_NAME \
        --project=$PROJECT_ID \
        --zone=$ZONE \
        --machine-type=$MACHINE_TYPE \
        --boot-disk-size=50GB \
        --boot-disk-type=pd-standard \
        --image-family=ubuntu-2204-lts \
        --image-project=ubuntu-os-cloud \
        --tags=midnight-proof-server \
        --metadata=startup-script='#!/bin/bash
            apt-get update
            apt-get install -y docker.io
            systemctl start docker
            systemctl enable docker
            docker pull midnightnetwork/proof-server:latest
            docker run -d --name midnight-proof-server --restart unless-stopped \
                -p 6300:6300 \
                midnightnetwork/proof-server:latest \
                midnight-proof-server --network testnet
        '
    
    echo "✅ Instance created"
    INSTANCE_EXISTS=false
fi

# Create firewall rule for proof server
echo "🔥 Configuring firewall..."
gcloud compute firewall-rules create allow-midnight-proof-server \
    --project=$PROJECT_ID \
    --allow=tcp:6300 \
    --target-tags=midnight-proof-server \
    --source-ranges=0.0.0.0/0 \
    --description="Allow Midnight proof server access" \
    2>/dev/null || echo "ℹ️  Firewall rule already exists"

# Wait for instance to be ready
if [ "$INSTANCE_EXISTS" = false ]; then
    echo "⏳ Waiting for VM to initialize (60 seconds)..."
    sleep 60
fi

# Get external IP
EXTERNAL_IP=$(gcloud compute instances describe $INSTANCE_NAME \
    --zone=$ZONE \
    --project=$PROJECT_ID \
    --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

echo ""
echo "=================================================="
echo "✅ Cloud Proof Server Ready!"
echo "=================================================="
echo ""
echo "External IP: $EXTERNAL_IP"
echo "Proof Server URL: http://$EXTERNAL_IP:6300"
echo ""
echo "🔧 Configuration:"
echo "Add to your .env file:"
echo "PROOF_SERVER_URL=http://$EXTERNAL_IP:6300"
echo ""
echo "📋 Useful Commands:"
echo "# Check if proof server is running:"
echo "curl http://$EXTERNAL_IP:6300/health"
echo ""
echo "# SSH to the VM:"
echo "gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --project=$PROJECT_ID"
echo ""
echo "# View proof server logs:"
echo "gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --project=$PROJECT_ID \\"
echo "  --command 'docker logs -f midnight-proof-server'"
echo ""
echo "# Stop the VM (to save costs when not in use):"
echo "gcloud compute instances stop $INSTANCE_NAME --zone=$ZONE --project=$PROJECT_ID"
echo ""
echo "# Start the VM:"
echo "gcloud compute instances start $INSTANCE_NAME --zone=$ZONE --project=$PROJECT_ID"
echo ""
echo "💰 Cost: ~\$50/month if running 24/7, ~\$0.10/hour when running"
echo ""
echo "🎯 Ready for Midnight Hackathon development!"
