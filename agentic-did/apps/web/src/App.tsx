/**
 * AgenticDID.io - Main Application
 * 
 * Privacy-preserving identity protocol for AI agents
 * Built for Midnight Network Hackathon
 * 
 * Key Features:
 * - Results-focused UX (inspired by Charles Hoskinson)
 * - Mutual authentication (User ⟷ Agent)
 * - Zero-knowledge proof verification
 * - Auto-agent selection based on user intent
 * - Credential verification with Midnight receipts
 * 
 * Flow:
 * 1. Mutual Auth: User ⟷ Comet establish trust
 * 2. User picks goal: "Buy Headphones", "Send Money", etc.
 * 3. System auto-selects appropriate agent
 * 4. Verification flow executes with ZK proofs
 * 5. Success/failure based on permissions
 */

import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import MutualAuth from './components/MutualAuth';
import AgentSelector from './components/AgentSelector';
import ActionPanel from './components/ActionPanel';
import Timeline, { TimelineStep } from './components/Timeline';
import ResultBanner from './components/ResultBanner';
import { AGENTS, AgentType, Action } from './agents';
import { getChallenge, presentVP } from './api';
import { useSpeech } from './hooks/useSpeech';
import { Volume2, VolumeX, Zap } from 'lucide-react';

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
  const [listenInMode, setListenInMode] = useState(true);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [rogueMode, setRogueMode] = useState(false);
  const [ipInfo, setIpInfo] = useState<any>(null);
  const { speak, isSpeaking, isAvailable } = useSpeech();

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

  const handleRogueAttempt = () => {
    setRogueMode(true);
    setResult(null);
    setTimeline([]);
  };

  const handleAction = async (action: Action) => {
    const startTime = Date.now();
    
    // Auto-select the appropriate agent based on action
    const actionToAgent: Record<string, AgentType> = {
      'transfer': 'banker',
      'shop': 'shopper',
      'flight': 'traveler',
    };
    
    // If rogue mode is active, force rogue agent selection
    const appropriateAgent = rogueMode ? 'rogue' : (actionToAgent[action.id] || 'banker');
    setSelectedAgent(appropriateAgent);
    
    setIsProcessing(true);
    setResult(null);
    setTimeline([]);
    setExecutionTime(null);
    setIpInfo(null);
    
    // If rogue mode, show warning
    if (rogueMode) {
      addTimelineStep({
        id: 'rogue-warning',
        label: '⚠️ Bad Actor Detected',
        status: 'error',
        message: 'Bad Actor trying to connect',
      });
      
      if (listenInMode) {
        await speak("Alert! Bad actor attempting to connect. Initiating security protocol.", { rate: 1.2, pitch: 1.1 });
      }
      
      await sleep(500);
      
      // Collect IP information
      const mockIpInfo = {
        ip: '192.168.1.' + Math.floor(Math.random() * 255),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timestamp: new Date().toISOString(),
        attemptedAction: action.label,
      };
      setIpInfo(mockIpInfo);
      
      addTimelineStep({
        id: 'ip-collection',
        label: '🔍 Collecting Evidence',
        status: 'success',
        message: `IP: ${mockIpInfo.ip} | Platform: ${mockIpInfo.platform}`,
      });
      
      if (listenInMode) {
        await speak("Reporting I.P. information to authorities.", { rate: 1.0, pitch: 0.9 });
      }
      
      await sleep(1000);
    } else {
      // Comet speaks: Analyzing request
      if (listenInMode) {
        await speak("Comet here. I'm analyzing your request and selecting the appropriate agent.", { rate: 1.1 });
      }
    }
    
    // Give UI time to show the selected agent
    await sleep(300);

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

      if (listenInMode) {
        await speak(`Challenge received. Nonce obtained from verifier.`, { rate: 1.1 });
      }

      await sleep(listenInMode ? 500 : 100);

      // Step 2: Build VP
      addTimelineStep({
        id: 'build-vp',
        label: 'Build Proof Bundle',
        status: 'loading',
        message: 'Creating verifiable presentation...',
      });

      const credential = createMockCredential(appropriateAgent);
      const disclosed = {
        role: credential.role,
        scopes: credential.scopes,
      };
      const vp = createMockVP(credential, challenge, disclosed);

      updateTimelineStep('build-vp', {
        status: 'success',
        message: `PID: ${vp.pid.slice(0, 20)}...`,
      });

      if (listenInMode) {
        const agentName = AGENTS[appropriateAgent].name;
        await speak(`${agentName} agent: I've created my credential proof bundle with zero-knowledge proofs.`, { rate: 1.1, pitch: 0.9 });
      }

      await sleep(listenInMode ? 500 : 100);

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

        if (listenInMode) {
          await speak(`Verification successful! Credentials validated by the network.`, { rate: 1.1 });
          
          // Agent-specific connection messages
          if (appropriateAgent === 'banker') {
            await speak(`Connected to your bank agent and verified.`, { rate: 1.1, pitch: 0.9 });
          } else if (appropriateAgent === 'traveler') {
            await speak(`Connected to your airline and verified.`, { rate: 1.1, pitch: 0.9 });
          } else if (appropriateAgent === 'shopper') {
            await speak(`Connected to verified Amazon agent.`, { rate: 1.1, pitch: 0.9 });
          }
        }

        await sleep(listenInMode ? 500 : 100);

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

          const endTime = Date.now();
          const duration = (endTime - startTime) / 1000;
          setExecutionTime(duration);

          if (listenInMode) {
            await speak(`Success! ${action.label} completed. All operations verified with zero-knowledge proofs.`, { rate: 1.1 });
          }

          setResult({
            success: true,
            message: `Agent successfully executed: ${action.label}`,
          });
        } else {
          updateTimelineStep('action', {
            status: 'error',
            message: 'Insufficient permissions',
          });

          const endTime = Date.now();
          const duration = (endTime - startTime) / 1000;
          setExecutionTime(duration);

          if (listenInMode) {
            await speak(`Authorization failed. The agent lacks the required permissions.`, { rate: 1.0, pitch: 0.8 });
          }

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
          message: rogueMode ? '🚨 Rogue agent blocked and reported' : 'Action blocked due to verification failure',
        });

        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        setExecutionTime(duration);

        if (rogueMode && listenInMode) {
          await speak("Security breach prevented. Bad actor has been blocked and authorities have been notified.", { rate: 1.0, pitch: 0.9 });
          await speak("Get out of here with that garbage.", { rate: 1.2, pitch: 0.8 });
        }

        setResult({
          success: false,
          message: rogueMode ? '🚨 Rogue agent blocked! IP information reported to authorities.' : `Verification failed: ${presentation.data.error || 'Unknown error'}`,
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
      setRogueMode(false); // Reset rogue mode after attempt
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <Hero />

        {/* Listen In Mode Toggle */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="border border-midnight-700 rounded-lg p-6 bg-gradient-to-br from-midnight-900/50 to-midnight-950/50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-midnight-100 mb-2 flex items-center gap-2">
                  {listenInMode ? (
                    <><Volume2 className="w-5 h-5 text-blue-400" /> Listen In Mode</>
                  ) : (
                    <><Zap className="w-5 h-5 text-yellow-400" /> Fast Mode</>
                  )}
                </h3>
                <p className="text-sm text-midnight-400">
                  {listenInMode ? (
                    <>🎓 Educational: Hear agents communicate step-by-step (slower, ~10-15s)</>
                  ) : (
                    <>⚡ Efficient: Silent agent communication at machine speed (~2-3s)</>
                  )}
                </p>
                {executionTime && (
                  <p className="text-xs text-midnight-500 mt-2">
                    Last execution: {executionTime.toFixed(2)}s
                    {!listenInMode && <span className="text-green-400 ml-2">⚡ {((15 - executionTime) / 15 * 100).toFixed(0)}% faster!</span>}
                  </p>
                )}
              </div>
              <button
                onClick={() => setListenInMode(!listenInMode)}
                disabled={isProcessing}
                className={
                  `px-6 py-3 rounded-lg font-medium transition-all duration-300 ` +
                  `${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} ` +
                  `${listenInMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-yellow-500 hover:bg-yellow-600 text-black'}`
                }
              >
                {listenInMode ? (
                  <span className="flex items-center gap-2">
                    <VolumeX className="w-4 h-4" />
                    Switch to Fast Mode
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Switch to Listen In
                  </span>
                )}
              </button>
            </div>
            {!isAvailable && (
              <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded text-sm text-yellow-300">
                ⚠️ Text-to-speech not available in your browser. Listen In mode will work silently.
              </div>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto space-y-8 mt-12">
          {/* Step 1: Mutual Authentication */}
          <div className="border border-midnight-800 rounded-lg p-6 bg-midnight-950/30">
            <MutualAuth />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-midnight-700 to-transparent" />
            <span className="text-xs text-midnight-500 uppercase tracking-wider">Then Delegate Actions</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-midnight-700 to-transparent" />
          </div>

          {/* Step 2: Pick Action */}
          <ActionPanel 
            onAction={handleAction} 
            onRogueAttempt={handleRogueAttempt}
            disabled={isProcessing}
            rogueMode={rogueMode}
          />
          
          {/* Step 3: See Selected Agent */}
          <AgentSelector
            selectedAgent={selectedAgent}
            onSelect={setSelectedAgent}
          />

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

          {/* IP Information Display (shown when rogue attempt detected) */}
          {ipInfo && (
            <div className="border border-red-700 rounded-lg p-6 bg-red-950/30">
              <h3 className="text-lg font-semibold text-red-300 mb-4 flex items-center gap-2">
                🚨 IP Information Reported to Authorities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-red-400 font-medium">IP Address:</span>
                  <span className="text-red-200 ml-2">{ipInfo.ip}</span>
                </div>
                <div>
                  <span className="text-red-400 font-medium">Platform:</span>
                  <span className="text-red-200 ml-2">{ipInfo.platform}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-red-400 font-medium">User Agent:</span>
                  <span className="text-red-200 ml-2 text-xs break-all">{ipInfo.userAgent}</span>
                </div>
                <div>
                  <span className="text-red-400 font-medium">Language:</span>
                  <span className="text-red-200 ml-2">{ipInfo.language}</span>
                </div>
                <div>
                  <span className="text-red-400 font-medium">Timestamp:</span>
                  <span className="text-red-200 ml-2 text-xs">{ipInfo.timestamp}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-red-400 font-medium">Attempted Action:</span>
                  <span className="text-red-200 ml-2">{ipInfo.attemptedAction}</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-red-900/30 border border-red-700/50 rounded text-sm text-red-300">
                ⚠️ This information has been logged and reported to system administrators.
              </div>
            </div>
          )}
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
