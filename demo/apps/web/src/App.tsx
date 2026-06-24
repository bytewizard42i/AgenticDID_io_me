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

import { useState, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import MutualAuth from './components/MutualAuth';
import AgentSelector from './components/AgentSelector';
import VerifierDisplay from './components/VerifierDisplay';
import ActionPanel from './components/ActionPanel';
import Timeline, { TimelineStep } from './components/Timeline';
import ResultBanner from './components/ResultBanner';
import WorkflowVisualization from './components/WorkflowVisualization';
import TasksPromptBanner from './components/TasksPromptBanner';
import { AGENTS, AgentType, Action, WORKFLOW_MAPPING } from './agents';
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

  // Simple hash for demo - include agentType so backend can extract policy
  const hash = btoa(`${agentType}:${credContent}`);

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
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSelectingAgent, setIsSelectingAgent] = useState(false);
  const [isVerifyingWithVerifier, setIsVerifyingWithVerifier] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [listenInMode, setListenInMode] = useState(true);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [rogueMode, setRogueMode] = useState(false);
  const [ipInfo, setIpInfo] = useState<any>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [workflowAgent, setWorkflowAgent] = useState<AgentType | null>(null);
  const [workflowTI, setWorkflowTI] = useState<AgentType | null>(null);
  const [highlightedBox, setHighlightedBox] = useState<'task' | 'agent' | 'ti' | null>(null);
  const [arrowStyle] = useState<'gradient' | 'animated'>('gradient');
  const [animatingRA, setAnimatingRA] = useState<'blink' | 'glow' | null>(null);
  const [animatingTI, setAnimatingTI] = useState<'blink' | 'glow' | null>(null);
  const actionPanelRef = useRef<HTMLDivElement>(null);
  const cancelledRef = useRef(false);
  const [showTasksPrompt, setShowTasksPrompt] = useState(false);
  const { speak, isSpeaking, isAvailable } = useSpeech();

  const addTimelineStep = (step: Omit<TimelineStep, 'timestamp'>) => {
    // Add to beginning for newest-on-top display
    setTimeline((prev) => [
      { ...step, timestamp: Date.now() },
      ...prev,
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

  const handleClearData = () => {
    setTimeline([]);
    setResult(null);
    setIpInfo(null);
    setExecutionTime(null);
    setRogueMode(false);
    setIsVerified(false);
    setSelectedAgent(null);
    setSelectedAction(null);
    setIsSelectingAgent(false);
    setIsVerifyingWithVerifier(false);
    setShowWorkflow(false);
    setWorkflowAgent(null);
    setWorkflowTI(null);
    setHighlightedBox(null);
    setAnimatingRA(null);
    setAnimatingTI(null);
  };

  const handleWorkflowCancel = () => {
    // Set cancellation flag to stop ongoing transaction
    cancelledRef.current = true;
    
    // Add cancellation message to timeline
    addTimelineStep({
      id: 'cancelled',
      label: '🛑 Transaction Cancelled',
      status: 'error',
      message: 'User cancelled the workflow',
    });
    
    // Clear all state
    setIsProcessing(false);
    setIsSelectingAgent(false);
    setIsVerifyingWithVerifier(false);
    
    // Show cancellation result
    setResult({
      success: false,
      message: 'Transaction cancelled by user',
    });
  };

  const handleNewAction = () => {
    // Clear selected action so nothing is pre-selected
    setSelectedAction(null);
    
    // Scroll to ActionPanel
    if (actionPanelRef.current) {
      actionPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleShowTasksPrompt = () => {
    setShowTasksPrompt(true);
  };

  const handleCloseTasksPrompt = () => {
    setShowTasksPrompt(false);
  };

  const handleGoToTasks = () => {
    setShowTasksPrompt(false);
    if (actionPanelRef.current) {
      actionPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAction = async (action: Action) => {
    const startTime = Date.now();
    setSelectedAction(action);

    // Reset cancellation flag for new transaction
    cancelledRef.current = false;

    // Auto-select the appropriate agent and TI based on action using workflow mapping
    const workflow = WORKFLOW_MAPPING[action.id];
    const appropriateAgent = rogueMode ? 'rogue' : (workflow?.agentKey || 'bank_agent');
    const appropriateTI = workflow?.tiKey || 'bank_agent';
    
    setIsProcessing(true);
    setResult(null);
    setTimeline([]);
    setExecutionTime(null);
    setIpInfo(null);
    setIsVerified(false);
    setIsSelectingAgent(true);
    setIsVerifyingWithVerifier(false);
    setSelectedAgent(appropriateAgent);
    
    // Show workflow visualization
    setShowWorkflow(true);
    setWorkflowAgent(appropriateAgent);
    setWorkflowTI(appropriateTI);
    setHighlightedBox('task');
    
    // Scroll to workflow after brief delay
    await sleep(300);
    
    // Check for cancellation
    if (cancelledRef.current) return;

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
        await sleep(800); // Longer delay to fully initialize speech and prevent cutoff
        await speak("Hello, I'm Comet, your local agent. I'm analyzing your request", { rate: 1.1 });
        await sleep(500);
        
        // Start RA blink animation when saying "selecting the appropriate agent"
        setAnimatingRA('blink');
        await speak("and selecting the appropriate agent.", { rate: 1.1 });
        await sleep(1500); // Wait for 3 blinks to complete
      } else {
        // Start RA blink immediately if no TTS
        setAnimatingRA('blink');
        await sleep(1500); // Time for 3 blinks at 0.5s each
      }
    }

    // Give UI time to show the selected agent
    await sleep(listenInMode ? 500 : 300);
    
    // Check for cancellation
    if (cancelledRef.current) return;

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
        await speak(`Requesting authorization code from Midnight Network security system.`, { rate: 1.1 });
      }

      await sleep(listenInMode ? 1000 : 100);

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
        await speak(`${agentName}: I've created my credential proof bundle with zero-knowledge proofs.`, { rate: 1.1, pitch: 0.9 });
      }

      await sleep(listenInMode ? 1500 : 100);
      
      // Check for cancellation
      if (cancelledRef.current) return;

      // Agent selection complete - make solid and change RA to glow
      setIsSelectingAgent(false);
      setAnimatingRA('glow');
      await sleep(500);
      
      // Check for cancellation
      if (cancelledRef.current) return;

      // Step 3: Present VP
      addTimelineStep({
        id: 'present',
        label: 'Present to Verifier',
        status: 'loading',
        message: 'Submitting proof bundle...',
      });

      // Start verifier flashing
      setIsVerifyingWithVerifier(true);

      // Announce verifier is checking
      if (listenInMode && appropriateAgent !== 'rogue') {
        const agentName = AGENTS[appropriateAgent].name;
        await speak(`${agentName} Trusted Issuer Verifier`, { rate: 1.1, pitch: 0.9 });
        await sleep(300);
        
        // Start TI blink animation when saying "is now verifying"
        setAnimatingTI('blink');
        await speak(`is now verifying the zero-knowledge proof.`, { rate: 1.1, pitch: 0.9 });
        await sleep(1500); // Time for 3 blinks to complete
      } else {
        // Start TI blink immediately if no TTS
        setAnimatingTI('blink');
        await sleep(1500); // Time for 3 blinks at 0.5s each
      }

      const presentation = await presentVP(vp, challenge.nonce);
      
      // Check for cancellation
      if (cancelledRef.current) return;

      if (presentation.status === 200) {
        // Verifier done - make solid only on success and change TI to glow
        setIsVerifyingWithVerifier(false);
        setAnimatingTI('glow');
        await sleep(500); // Show glow before continuing
        
        updateTimelineStep('present', {
          status: 'success',
          message: `Token issued: ${presentation.data.scopes?.join(', ')}`,
        });

        // Mark as verified for confetti
        setIsVerified(true);

        if (listenInMode) {
          await speak(`Verification successful! Credentials validated by the network.`, { rate: 1.1 });
          await sleep(1500); // Wait for verifier TTS to announce

          // Agent-specific connection messages
          if (appropriateAgent === 'banker') {
            await speak(`Connected to your bank agent and verified.`, { rate: 1.1, pitch: 0.9 });
          } else if (appropriateAgent === 'traveler') {
            await speak(`Connected to your airline and verified.`, { rate: 1.1, pitch: 0.9 });
          } else if (appropriateAgent === 'shopper') {
            await speak(`Connected to verified Amazon agent.`, { rate: 1.1, pitch: 0.9 });
          }
          await sleep(2000); // Wait for verifier completion TTS
        }

        await sleep(listenInMode ? 1000 : 100);

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

          setResult({
            success: true,
            message: `Agent successfully executed: ${action.label}`,
          });
          
          // Reset selected action so task buttons are cleared for next workflow
          setSelectedAction(null);
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
        // Verifier failed - stop flashing
        setIsVerifyingWithVerifier(false);
        
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
            <MutualAuth speak={speak} listenInMode={listenInMode} />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-midnight-700 to-transparent" />
            <span className="text-xs text-midnight-500 uppercase tracking-wider">Then Delegate Actions</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-midnight-700 to-transparent" />
          </div>

          {/* Step 2: Pick Action */}
          <div ref={actionPanelRef}>
            <ActionPanel
              onAction={handleAction}
              onRogueAttempt={handleRogueAttempt}
              onClearData={handleClearData}
              disabled={isProcessing}
              rogueMode={rogueMode}
              selectedAction={selectedAction}
            />
          </div>

          {/* Registered Agents (RAs) - Always Visible */}
          <AgentSelector
            selectedAgent={selectedAgent || 'comet'}
            onSelect={setSelectedAgent}
            isProcessing={isSelectingAgent}
            animatingAgent={workflowAgent}
            animationType={animatingRA}
            onShowTasksPrompt={handleShowTasksPrompt}
          />

          {/* Trusted Issuers (TIs) - Always Visible */}
          <VerifierDisplay
            selectedAgent={selectedAgent || 'comet'}
            isProcessing={isVerifyingWithVerifier}
            isVerified={isVerified}
            speak={speak}
            listenInMode={listenInMode}
            animatingTI={workflowTI}
            animationType={animatingTI}
            onShowTasksPrompt={handleShowTasksPrompt}
          />

          {/* Tasks Prompt Banner */}
          {showTasksPrompt && (
            <TasksPromptBanner
              onClose={handleCloseTasksPrompt}
              onGoToTasks={handleGoToTasks}
            />
          )}

          {/* Workflow Visualization - Shows when action is selected */}
          {showWorkflow && selectedAction && workflowAgent && workflowTI && (
            <WorkflowVisualization
              selectedAction={selectedAction}
              selectedAgent={AGENTS[workflowAgent]}
              selectedTI={{
                name: AGENTS[workflowTI].name,
                // Remove hand emojis from TI icon and add gavel - TIs are organizations, not agents
                icon: `${AGENTS[workflowTI].icon.replace(/👋|🤚/g, '').trim()}⚖️`,
                color: AGENTS[workflowTI].color,
              }}
              arrowStyle={arrowStyle}
              highlightedBox={highlightedBox}
              animatingRA={animatingRA}
              animatingTI={animatingTI}
              isVerified={isVerified}
              onCancel={handleWorkflowCancel}
              onNewAction={handleNewAction}
            />
          )}

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
                  <span className="text-red-500 font-bold ml-3">- DENIED</span>
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
