import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import AgentSelector from './components/AgentSelector';
import ActionPanel from './components/ActionPanel';
import Timeline, { TimelineStep } from './components/Timeline';
import ResultBanner from './components/ResultBanner';
import { AGENTS, AgentType, Action } from './agents';
import { getChallenge, presentVP } from './api';

// Mock SDK imports (will use real SDK when built)
// For demo, we'll create simple mock credentials
function createMockCredential(agentType: AgentType) {
  const agent = AGENTS[agentType];
  const credContent = JSON.stringify({
    role: agent.role,
    scopes: agent.scopes,
    isRogue: agent.isRogue || false,
  });
  
  // Simple hash for demo
  const hash = btoa(credContent);
  
  return {
    pid: `pid:${agentType}:${Math.random().toString(36).slice(2, 10)}`,
    role: agent.role,
    scopes: agent.scopes,
    cred_hash: agent.isRogue ? 'revoked-' + hash : hash,
  };
}

function createMockVP(credential: any, challenge: any, disclosed: any) {
  return {
    pid: credential.pid,
    proof: btoa(`${challenge.nonce}|${challenge.aud}|${challenge.exp}`),
    sd_proof: btoa(JSON.stringify(disclosed)),
    disclosed,
    receipt: {
      attestation: btoa(`midnight-${credential.cred_hash}-${Date.now()}`),
      cred_hash: credential.cred_hash,
    },
  };
}

export default function App() {
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('banker');
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const addTimelineStep = (step: Omit<TimelineStep, 'timestamp'>) => {
    setTimeline((prev) => [
      ...prev,
      { ...step, timestamp: Date.now() },
    ]);
  };

  const updateTimelineStep = (id: string, updates: Partial<TimelineStep>) => {
    setTimeline((prev) =>
      prev.map((step) => (step.id === id ? { ...step, ...updates } : step))
    );
  };

  const handleAction = async (action: Action) => {
    setIsProcessing(true);
    setResult(null);
    setTimeline([]);

    try {
      // Step 1: Request Challenge
      addTimelineStep({
        id: 'challenge',
        label: 'Request Challenge',
        status: 'loading',
        message: 'Requesting nonce from verifier...',
      });

      const challenge = await getChallenge();
      
      updateTimelineStep('challenge', {
        status: 'success',
        message: `Nonce: ${challenge.nonce.slice(0, 16)}...`,
      });

      await sleep(500);

      // Step 2: Build VP
      addTimelineStep({
        id: 'build-vp',
        label: 'Build Proof Bundle',
        status: 'loading',
        message: 'Creating verifiable presentation...',
      });

      const credential = createMockCredential(selectedAgent);
      const disclosed = {
        role: credential.role,
        scopes: credential.scopes,
      };
      const vp = createMockVP(credential, challenge, disclosed);

      updateTimelineStep('build-vp', {
        status: 'success',
        message: `PID: ${vp.pid.slice(0, 20)}...`,
      });

      await sleep(500);

      // Step 3: Present VP
      addTimelineStep({
        id: 'present',
        label: 'Present to Verifier',
        status: 'loading',
        message: 'Submitting proof bundle...',
      });

      const presentation = await presentVP(vp, challenge.nonce);

      if (presentation.status === 200) {
        updateTimelineStep('present', {
          status: 'success',
          message: `Token issued: ${presentation.data.scopes?.join(', ')}`,
        });

        await sleep(500);

        // Step 4: Execute Action
        addTimelineStep({
          id: 'action',
          label: 'Execute Action',
          status: 'loading',
          message: `Attempting: ${action.label}...`,
        });

        // Check authorization
        const hasRequiredRole = presentation.data.role === action.requiredRole;
        const hasRequiredScope = presentation.data.scopes?.includes(action.requiredScope);

        if (hasRequiredRole && hasRequiredScope) {
          updateTimelineStep('action', {
            status: 'success',
            message: `${action.label} completed successfully!`,
          });

          setResult({
            success: true,
            message: `Agent successfully executed: ${action.label}`,
          });
        } else {
          updateTimelineStep('action', {
            status: 'error',
            message: 'Insufficient permissions',
          });

          setResult({
            success: false,
            message: `Agent lacks required permissions for: ${action.label}`,
          });
        }
      } else {
        updateTimelineStep('present', {
          status: 'error',
          message: presentation.data.error || 'Verification failed',
        });

        addTimelineStep({
          id: 'action',
          label: 'Execute Action',
          status: 'error',
          message: 'Action blocked due to verification failure',
        });

        setResult({
          success: false,
          message: `Verification failed: ${presentation.data.error || 'Unknown error'}`,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <Hero />

        <div className="max-w-6xl mx-auto space-y-8 mt-12">
          <AgentSelector
            selectedAgent={selectedAgent}
            onSelect={setSelectedAgent}
          />

          <ActionPanel onAction={handleAction} disabled={isProcessing} />

          {result && (
            <ResultBanner
              success={result.success}
              message={result.message}
              onClose={() => setResult(null)}
            />
          )}

          <div className="border border-midnight-800 rounded-lg p-6 bg-midnight-950/30">
            <Timeline steps={timeline} />
          </div>
        </div>
      </main>

      <footer className="border-t border-midnight-800 mt-16 py-8">
        <div className="container mx-auto px-6 text-center text-midnight-500 text-sm">
          <p>Built with Midnight · Zero-Knowledge Proofs · Privacy-Preserving Identity</p>
          <p className="mt-2">AgenticDID.io © 2025</p>
        </div>
      </footer>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
