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

export default function MutualAuth() {
  const [authState, setAuthState] = useState<'idle' | 'authenticating' | 'authenticated' | 'failed'>('idle');
  const [authSteps, setAuthSteps] = useState<AuthStep[]>([]);
  const [authMethod, setAuthMethod] = useState<'biometric' | 'totp' | null>(null);
  const [showZkpProof, setShowZkpProof] = useState(false);

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

      await sleep(800);

      updateStep('agent-credential', {
        status: 'success',
        message: 'Agent DID verified: did:midnight:comet:abc123...'
      });

      await sleep(500);

      // Step 2: Verify agent integrity
      addStep({
        id: 'agent-integrity',
        actor: 'agent',
        label: 'Integrity Check',
        status: 'active',
        message: 'Checking agent hasn\'t been tampered with...'
      });

      await sleep(800);

      updateStep('agent-integrity', {
        status: 'success',
        message: 'Code signature valid, no tampering detected'
      });

      // Show ZKP proof popup
      setShowZkpProof(true);

      await sleep(500);

      // Agent proof complete
      addStep({
        id: 'agent-verified',
        actor: 'agent',
        label: 'Agent Verified',
        status: 'success',
        message: '✅ Comet is legitimate and ready for your authentication'
      });

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

      await sleep(800);

      updateStep('agent-credential', {
        status: 'success',
        message: 'Agent DID verified: did:midnight:comet:abc123...'
      });

      await sleep(500);

      // Step 2: Verify agent integrity
      addStep({
        id: 'agent-integrity',
        actor: 'agent',
        label: 'Integrity Check',
        status: 'active',
        message: 'Checking agent hasn\'t been tampered with...'
      });

      await sleep(800);

      updateStep('agent-integrity', {
        status: 'success',
        message: 'Code signature valid, no tampering detected'
      });

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

      await sleep(1500);

      updateStep('user-auth', {
        status: 'success',
        message: method === 'biometric'
          ? 'Fingerprint verified ✓'
          : 'TOTP code verified ✓'
      });

      await sleep(500);

      // Step 4: Delegation established
      addStep({
        id: 'delegation',
        actor: 'user',
        label: 'Establish Delegation',
        status: 'active',
        message: 'Creating delegation certificate...'
      });

      await sleep(800);

      updateStep('delegation', {
        status: 'success',
        message: 'Delegation certificate signed and stored locally'
      });

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
    </div>
  );
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
