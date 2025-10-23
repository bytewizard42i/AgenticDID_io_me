# AgenticDID.io Demo/Simulation Dockerfile
# Simple single-stage for running the demo

FROM oven/bun:1.2.22

WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN bun install

# Expose ports
# Frontend: 5173
# Backend: 8787
EXPOSE 5173 8787

# Run the demo (both frontend and backend)
CMD ["/app/start-demo.sh"]
