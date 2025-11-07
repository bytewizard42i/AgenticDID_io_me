/**
 * Mutual Authentication Component
 * User ⟷ Comet (Local Agent)
 * 
 * Demonstrates bidirectional trust establishment:
 * 1. User proves identity to agent (biometric/2FA)
 * 2. Agent proves legitimacy to user (credential verification)
 */

import { useState } from 'react';
import { Shield, Fingerprint, Smartphone, CheckCircle, AlertCircle, Lock, User } from 'lucide-react';

type AuthStep = {
  id: string;
  actor: 'user' | 'agent';
  label: string;
  status: 'pending' | 'active' | 'success' | 'error';
  message?: string;
};

type SpeechOptions = {
  rate?: number;
  pitch?: number;
};

type Props = {
  speak: (text: string, options?: SpeechOptions) => Promise<void>;
  listenInMode: boolean;
};

export default function MutualAuth({ speak, listenInMode }: Props) {
  const [authState, setAuthState] = useState<'idle' | 'authenticating' | 'authenticated' | 'failed'>('idle');
  const [authSteps, setAuthSteps] = useState<AuthStep[]>([]);
  const [authMethod, setAuthMethod] = useState<'biometric' | 'totp' | null>(null);
  const [showZkpProof, setShowZkpProof] = useState(false);
  const [showProofLog, setShowProofLog] = useState(false);

  const updateStep = (id: string, updates: Partial<AuthStep>) => {
    setAuthSteps(prev => 
      prev.map(step => step.id === id ? { ...step, ...updates } : step)
    );
  };

  const addStep = (step: AuthStep) => {
    setAuthSteps(prev => [...prev, step]);
  };

  const startAgentProof = async () => {
    setAuthState('authenticating');
    setAuthSteps([]);
    setShowZkpProof(false);

    try {
      // Step 1: Agent proves itself
      addStep({
        id: 'agent-credential',
        actor: 'agent',
        label: 'Comet Presents Credential',
        status: 'active',
        message: 'Agent proving its legitimacy...'
      });

      if (listenInMode) {
        await speak("Comet agent presenting credentials for verification.", { rate: 1.1, pitch: 0.9 });
      }

      await sleep(800);

      updateStep('agent-credential', {
        status: 'success',
        message: 'Agent DID verified: did:midnight:comet:abc123...'
      });

      if (listenInMode) {
        await speak("Agent D.I.D. verified successfully.", { rate: 1.1 });
      }

      await sleep(500);

      // Step 2: Verify agent integrity
      addStep({
        id: 'agent-integrity',
        actor: 'agent',
        label: 'Integrity Check',
        status: 'active',
        message: 'Checking agent hasn\'t been tampered with...'
      });

      if (listenInMode) {
        await speak("Running integrity check. Verifying code signature.", { rate: 1.1, pitch: 0.9 });
      }

      await sleep(800);

      updateStep('agent-integrity', {
        status: 'success',
        message: 'Code signature valid, no tampering detected'
      });

      if (listenInMode) {
        await speak("Code signature valid. No tampering detected.", { rate: 1.1 });
      }

      // Show ZKP proof popup
      setShowZkpProof(true);

      if (listenInMode) {
        await speak("Zero-knowledge proof verified. Agent identity confirmed.", { rate: 1.1 });
      }

      await sleep(500);

      // Agent proof complete
      addStep({
        id: 'agent-verified',
        actor: 'agent',
        label: 'Agent Verified',
        status: 'success',
        message: '✅ Comet is legitimate and ready for your authentication'
      });

      if (listenInMode) {
        await speak("Comet is legitimate and ready for your authentication.", { rate: 1.1 });
      }

      setAuthState('authenticated');
    } catch (error) {
      setAuthState('failed');
      console.error('Agent proof failed:', error);
    }
  };

  const startMutualAuth = async (method: 'biometric' | 'totp') => {
    setAuthMethod(method);
    setAuthState('authenticating');
    setAuthSteps([]);

    try {
      // Step 1: Agent proves itself first
      addStep({
        id: 'agent-credential',
        actor: 'agent',
        label: 'Comet Presents Credential',
        status: 'active',
        message: 'Agent proving its legitimacy...'
      });

      if (listenInMode) {
        await speak("Comet agent presenting credentials for verification.", { rate: 1.1, pitch: 0.9 });
      }

      await sleep(800);

      updateStep('agent-credential', {
        status: 'success',
        message: 'Agent DID verified: did:midnight:comet:abc123...'
      });

      if (listenInMode) {
        await speak("Agent D.I.D. verified successfully.", { rate: 1.1 });
      }

      await sleep(500);

      // Step 2: Verify agent integrity
      addStep({
        id: 'agent-integrity',
        actor: 'agent',
        label: 'Integrity Check',
        status: 'active',
        message: 'Checking agent hasn\'t been tampered with...'
      });

      if (listenInMode) {
        await speak("Running integrity check. Verifying code signature.", { rate: 1.1, pitch: 0.9 });
      }

      await sleep(800);

      updateStep('agent-integrity', {
        status: 'success',
        message: 'Code signature valid, no tampering detected'
      });

      if (listenInMode) {
        await speak("Code signature valid. No tampering detected.", { rate: 1.1 });
      }

      await sleep(500);

      // Step 3: User authentication
      addStep({
        id: 'user-auth',
        actor: 'user',
        label: method === 'biometric' ? 'Biometric Authentication' : '2FA Code',
        status: 'active',
        message: method === 'biometric' 
          ? 'Waiting for fingerprint scan...' 
          : 'Enter your authenticator code...'
      });

      if (listenInMode) {
        if (method === 'biometric') {
          await speak("Waiting for biometric authentication. Place your finger on the sensor.", { rate: 1.1 });
        } else {
          await speak("Waiting for two factor authentication code from your authenticator app.", { rate: 1.1 });
        }
      }

      await sleep(1500);

      updateStep('user-auth', {
        status: 'success',
        message: method === 'biometric'
          ? 'Fingerprint verified ✓'
          : 'TOTP code verified ✓'
      });

      if (listenInMode) {
        if (method === 'biometric') {
          await speak("Biometric authentication verified successfully.", { rate: 1.1 });
        } else {
          await speak("Two factor authentication code verified successfully.", { rate: 1.1 });
        }
      }

      await sleep(500);

      // Step 4: Delegation established
      addStep({
        id: 'delegation',
        actor: 'user',
        label: 'Establish Delegation',
        status: 'active',
        message: 'Creating delegation certificate...'
      });

      if (listenInMode) {
        await speak("Creating delegation certificate.", { rate: 1.1, pitch: 0.9 });
      }

      await sleep(800);

      updateStep('delegation', {
        status: 'success',
        message: 'Delegation certificate signed and stored locally'
      });

      if (listenInMode) {
        await speak("Delegation certificate signed and stored locally. Trust established!", { rate: 1.1 });
      }

      setAuthState('authenticated');

    } catch (error) {
      setAuthState('failed');
      console.error('Mutual auth failed:', error);
    }
  };

  const reset = () => {
    setAuthState('idle');
    setAuthSteps([]);
    setAuthMethod(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <User className="w-8 h-8 text-blue-400" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-gradient-to-r from-blue-400 to-green-400" />
            <Shield className="w-6 h-6 text-purple-400" />
            <div className="w-8 h-0.5 bg-gradient-to-r from-green-400 to-blue-400" />
          </div>
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
              <span className="text-sm font-bold text-white">C</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-midnight-950 flex items-center justify-center">
              <span className="text-[8px]">✓</span>
            </div>
          </div>
        </div>
        <h3 className="text-xl font-bold text-midnight-100 mb-2">
          Establish Trust with Comet
        </h3>
        <p className="text-sm text-midnight-400 mb-3">
          Mutual authentication ensures both you and your agent are legitimate
        </p>
        
        {/* Security Notice / Agent Proof Button with ZKP Popup */}
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <button
            onClick={startAgentProof}
            disabled={authState !== 'idle'}
            className="flex-1 p-5 rounded-lg bg-gradient-to-br from-purple-950/50 to-purple-900/30 border-2 border-purple-700 hover:border-purple-500 hover:from-purple-900/60 hover:to-purple-800/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                <Shield className="w-6 h-6 text-purple-300 group-hover:text-purple-200 transition-colors" />
              </div>
              <div className="text-left flex-1">
                <p className="text-base text-purple-100 font-bold mb-2 flex items-center gap-2">
                  🛡️ Step 1: Let Comet Prove Itself
                  <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                    Click to Start
                  </span>
                </p>
                <p className="text-sm text-purple-200/90 mb-2">
                  Comet will <strong>automatically prove its legitimacy</strong> before asking for your authentication.
                </p>
                <p className="text-xs text-purple-300/70">
                  ⚡ This prevents malware from impersonating Comet and stealing your credentials
                </p>
              </div>
            </div>
          </button>

          {/* ZKP Proof Popup */}
          {showZkpProof && (
            <div className="flex-shrink-0 w-80 p-4 rounded-lg border-4 border-green-500 bg-gradient-to-br from-green-950/60 to-green-900/40 shadow-[0_0_30px_rgba(34,197,94,0.4)] animate-[slideIn_0.3s_ease-out]">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-green-100 font-bold text-sm mb-1">
                    ✅ Zero-Knowledge Proof Verified
                  </p>
                  <p className="text-xs text-green-200/80">
                    Agent identity confirmed without revealing private keys
                  </p>
                </div>
              </div>

              {/* Proof Details */}
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-green-950/50 border border-green-800/30">
                  <p className="text-green-300/70 mb-1">DID:</p>
                  <p className="text-green-100 font-mono break-all">
                    did:midnight:comet:abc123def456...
                  </p>
                </div>
                <div className="p-2 rounded bg-green-950/50 border border-green-800/30">
                  <p className="text-green-300/70 mb-1">Proof Hash:</p>
                  <p className="text-green-100 font-mono break-all">
                    0x7f9a2e...3c8d
                  </p>
                </div>
                <div className="p-2 rounded bg-green-950/50 border border-green-800/30">
                  <p className="text-green-300/70 mb-1">Signature:</p>
                  <p className="text-green-100 font-mono break-all">
                    Valid ✓
                  </p>
                </div>
              </div>

              <div className="mt-3 p-2 rounded bg-green-500/10 border border-green-500/30">
                <p className="text-xs text-green-200 flex items-center gap-2">
                  <Lock className="w-3 h-3" />
                  <span>Midnight Network Receipt Recorded</span>
                </p>
              </div>

              {/* View Proof Log Button */}
              <button
                onClick={() => setShowProofLog(true)}
                className="mt-3 w-full px-3 py-2 text-xs rounded bg-green-800/30 hover:bg-green-700/40 border border-green-600/50 hover:border-green-500 text-green-100 transition-all flex items-center justify-center gap-2"
              >
                <span>📄</span>
                <span>View Proof Log (Data Storage)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Authentication Methods */}
      {authState === 'idle' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => startMutualAuth('biometric')}
            className="group p-6 rounded-lg border-2 border-midnight-700 bg-midnight-900/30 hover:border-blue-500 hover:bg-midnight-800/50 transition-all text-left"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <Fingerprint className="w-8 h-8 text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">Biometric Auth</h4>
                <p className="text-sm text-midnight-400 mb-3">
                  Use fingerprint or face recognition
                </p>
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <Lock className="w-3 h-3" />
                  <span>Step-up security enabled</span>
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => startMutualAuth('totp')}
            className="group p-6 rounded-lg border-2 border-midnight-700 bg-midnight-900/30 hover:border-green-500 hover:bg-midnight-800/50 transition-all text-left"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <Smartphone className="w-8 h-8 text-green-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">Authenticator App</h4>
                <p className="text-sm text-midnight-400 mb-3">
                  Use Google Authenticator or Authy
                </p>
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <Lock className="w-3 h-3" />
                  <span>TOTP 2FA</span>
                </div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Authentication Flow */}
      {authState !== 'idle' && (
        <div className="space-y-4">
          {authSteps.map((step, index) => (
            <div 
              key={step.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                step.status === 'success' 
                  ? 'border-green-800 bg-green-950/20'
                  : step.status === 'error'
                  ? 'border-red-800 bg-red-950/20'
                  : step.status === 'active'
                  ? 'border-blue-700 bg-blue-950/20'
                  : 'border-midnight-800 bg-midnight-900/20'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Step Number */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  step.status === 'success'
                    ? 'bg-green-500 text-white'
                    : step.status === 'active'
                    ? 'bg-blue-500 text-white animate-pulse'
                    : 'bg-midnight-700 text-midnight-400'
                }`}>
                  {step.status === 'success' ? '✓' : index + 1}
                </div>

                {/* Actor Badge */}
                <div className={`px-2 py-1 rounded text-xs font-mono ${
                  step.actor === 'user'
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-green-500/20 text-green-300'
                }`}>
                  {step.actor === 'user' ? 'YOU' : 'COMET'}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className="font-semibold text-white mb-1">{step.label}</p>
                  <p className="text-sm text-midnight-400">{step.message}</p>
                </div>

                {/* Status Icon */}
                {step.status === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                {step.status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                {step.status === 'active' && (
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Success State */}
      {authState === 'authenticated' && (
        <div className="p-6 rounded-lg border-2 border-green-800 bg-gradient-to-br from-green-950/40 to-blue-950/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-full bg-green-500/20">
              <Shield className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h4 className="font-bold text-green-300 text-lg">Trust Established!</h4>
              <p className="text-sm text-midnight-300">
                You and Comet have mutually authenticated
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 rounded-lg bg-midnight-900/50">
              <p className="text-xs text-midnight-400 mb-1">Your Identity</p>
              <p className="text-sm text-white font-mono">did:midnight:user:xyz789...</p>
            </div>
            <div className="p-3 rounded-lg bg-midnight-900/50">
              <p className="text-xs text-midnight-400 mb-1">Comet's Identity</p>
              <p className="text-sm text-white font-mono">did:midnight:comet:abc123...</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/30">
            <p className="text-xs text-blue-300 mb-2">✅ What you can now do:</p>
            <ul className="text-xs text-midnight-300 space-y-1">
              <li>• Delegate permissions to Comet</li>
              <li>• Comet can act on your behalf with services</li>
              <li>• All actions are auditable and revocable</li>
              <li>• Comet will request step-up auth for sensitive operations</li>
            </ul>
          </div>

          <button
            onClick={reset}
            className="mt-4 w-full px-4 py-2 rounded-lg bg-midnight-700 hover:bg-midnight-600 text-white transition-colors"
          >
            Try Again with Different Method
          </button>
        </div>
      )}

      {/* Proof Log Modal Popup */}
      {showProofLog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowProofLog(false)}>
          <div 
            className="w-full max-w-2xl max-h-[80vh] bg-gradient-to-br from-midnight-900 to-midnight-950 rounded-lg border-2 border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.3)] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-green-800/50 bg-green-950/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-green-100">ZK Proof Log Document</h3>
                  <p className="text-xs text-green-300/70">Comet Agent Verification</p>
                </div>
              </div>
              <button
                onClick={() => setShowProofLog(false)}
                className="p-2 rounded hover:bg-midnight-800 transition-colors"
              >
                <span className="text-green-300 text-xl">×</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
              <pre className="text-green-200/90 whitespace-pre-wrap">
{`{
  "timestamp": "${new Date().toISOString()}",
  "proof_type": "AgenticDID_Agent_Verification",
  "agent": {
    "did": "did:midnight:comet:abc123def456789",
    "name": "Comet",
    "type": "local_agent",
    "version": "1.0.0"
  },
  "verification_request": {
    "user_did": "did:midnight:user:xyz789abc123",
    "challenge_nonce": "0x${Math.random().toString(16).slice(2, 18)}",
    "requested_at": "${new Date().toISOString()}"
  },
  "proof_data": {
    "proof_hash": "0x7f9a2e3c8d",
    "signature": "0x8f2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    "public_key": "0x04a8b5c...truncated",
    "algorithm": "ECDSA-secp256k1"
  },
  "integrity_check": {
    "code_signature": "valid",
    "tampering_detected": false,
    "last_modified": "2025-10-23T04:58:00Z",
    "checksum": "sha256:e3b0c44...truncated"
  },
  "zkp_circuit": {
    "type": "midnight_groth16",
    "public_inputs": [
      "did_hash",
      "timestamp",
      "challenge_nonce"
    ],
    "private_inputs": [
      "private_key",
      "signature_nonce",
      "randomness"
    ],
    "proof_size": "384 bytes",
    "verification_key_hash": "0xabc...123"
  },
  "midnight_network": {
    "contract_address": "0x1234567890abcdef1234567890abcdef12345678",
    "block_number": 1234567,
    "transaction_hash": "0xdef789abc123456789abc123456789abc123456789abc123456789abc123",
    "gas_used": 21000,
    "network": "devnet",
    "receipt_timestamp": "${new Date().toISOString()}"
  },
  "verification_result": {
    "status": "SUCCESS",
    "verified_at": "${new Date().toISOString()}",
    "verifier": "AgenticDID.io_Verifier_v1.0",
    "confidence_score": 1.0,
    "notes": "Agent identity confirmed via zero-knowledge proof"
  },
  "audit_trail": {
    "log_id": "log_${Date.now()}",
    "stored_at": "local://data/proofs/comet-${Date.now()}.json",
    "retention_period": "90_days",
    "access_level": "user_only"
  }
}`}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-green-800/50 bg-green-950/30 flex justify-between items-center">
              <p className="text-xs text-green-300/70">
                🔒 Stored locally • Not uploaded to any server
              </p>
              <button
                onClick={() => setShowProofLog(false)}
                className="px-4 py-2 rounded bg-green-700 hover:bg-green-600 text-white text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
