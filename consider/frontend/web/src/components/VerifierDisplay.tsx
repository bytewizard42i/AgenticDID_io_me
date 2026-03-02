import { useEffect, useState, useRef } from 'react';
import { AGENTS, AgentType } from '../agents';
import { Shield } from 'lucide-react';

type SpeechOptions = {
  rate?: number;
  pitch?: number;
};

type Props = {
  selectedAgent: AgentType;
  isProcessing: boolean;
  isVerified: boolean;
  speak: (text: string, options?: SpeechOptions) => Promise<void>;
  listenInMode: boolean;
  animatingTI?: AgentType | null;
  animationType?: 'blink' | 'glow' | null;
  onShowTasksPrompt?: () => void;
};

// Generate TIs (Trusted Issuers) from AGENTS
// Include all issuers and trusted services
const TRUSTED_ISSUERS = Object.entries(AGENTS)
  .filter(([_, agent]) => agent.category === 'issuer' || agent.isTrustedService === true)
  .map(([key, agent]) => ({
    id: key,
    name: agent.issuerType ? `${agent.name} (TRUSTED ${agent.issuerType} ISSUER/VERIFIER)` : agent.name,
    // Remove hand emojis from TI icons and add gavel on right - TIs are organizations, not agents
    icon: `${agent.icon.replace(/👋|🤚/g, '').trim()}⚖️`,
    color: agent.color,
    category: agent.category,
    description: agent.description,
    isTrustedService: agent.isTrustedService,
  }));

export default function VerifierDisplay({ selectedAgent, isProcessing, isVerified, speak, listenInMode, animatingTI, animationType, onShowTasksPrompt }: Props) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);
  const hasAnnouncedVerifying = useRef(false);
  const hasAnnouncedVerified = useRef(false);

  // TIs are always shown, no longer need matching logic for active verifier
  // All TIs are displayed at all times

  // Note: Verifier TTS is now called directly in App.tsx at the right moment
  // This useEffect is disabled to prevent timing conflicts
  // useEffect(() => {
  //   if (isProcessing && activeVerifier && listenInMode && !hasAnnouncedVerifying.current) {
  //     hasAnnouncedVerifying.current = true;
  //     speak(`${activeVerifier.name} is now verifying the zero-knowledge proof.`, { rate: 1.1, pitch: 0.9 });
  //   }
  //   if (!isProcessing) {
  //     hasAnnouncedVerifying.current = false;
  //   }
  // }, [isProcessing, activeVerifier, speak, listenInMode]);

  // Trigger confetti when verification succeeds
  useEffect(() => {
    if (isVerified && !isProcessing) {
      setShowConfetti(true);
      
      // Generate confetti pieces
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.3,
        duration: 1 + Math.random() * 1,
      }));
      setConfettiPieces(pieces);

      // Announce verification success
      if (listenInMode && !hasAnnouncedVerified.current) {
        hasAnnouncedVerified.current = true;
        speak(`Agent verified successfully by trusted issuers!`, { rate: 1.1 });
      }

      // Clear confetti after animation
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
    if (!isVerified) {
      hasAnnouncedVerified.current = false;
    }
  }, [isVerified, isProcessing, speak, listenInMode]);

  // Always show TIs, even for rogue agent
  return (
    <div className="space-y-3 relative">
      <h3 className="text-lg font-semibold text-midnight-200">Trusted Issuer/Verifiers (TIs)</h3>
      <p className="text-sm text-midnight-400">Independent trusted issuer/verifiers validate agent credentials using zero-knowledge proofs</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {TRUSTED_ISSUERS.map((ti) => {
          const isAnimating = animatingTI === ti.id;
          const shouldBlink = isAnimating && animationType === 'blink';
          const shouldGlow = isAnimating && animationType === 'glow';
          
          return (
            <button
              key={ti.id}
              onClick={() => onShowTasksPrompt && onShowTasksPrompt()}
              className={`p-5 rounded-lg border transition-all min-h-[140px] flex flex-col text-left cursor-pointer ${
                shouldGlow
                  ? 'border-purple-400 bg-midnight-800/50 shadow-[0_0_30px_rgba(168,85,247,0.6)]'
                  : 'border-midnight-700 bg-midnight-900/50 hover:border-midnight-600'
              }`}
              style={shouldBlink ? { animation: 'border-blink 0.5s ease-in-out 3' } : undefined}
            >
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl flex-shrink-0">{ti.icon}</span>
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <Shield className={`w-3 h-3 mt-0.5 ${ti.color} flex-shrink-0`} />
                    <p className={`font-semibold text-sm ${ti.color} break-words leading-relaxed`}>
                      {/* Remove "Agent" suffix from TI names (they're organizations, not agents)
                          Examples: "Bank of America Agent" → "Bank of America"
                                    "Rogue Agent (Revoked)" → "Rogue (Revoked)" */}
                      {ti.name.replace(' Agent', '')}
                    </p>
                  </div>
                  <p className="text-xs text-midnight-400 break-words leading-relaxed">
                    {ti.description}
                  </p>
                  <div className="flex items-center gap-2 mt-auto pt-1">
                    {ti.category === 'issuer' ? (
                      <span className="px-2 py-0.5 rounded text-xs bg-indigo-950/50 border border-indigo-800 text-indigo-400 whitespace-nowrap">
                        Credential Issuer
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs bg-green-950/50 border border-green-800 text-green-400 whitespace-nowrap">
                        Trusted Service
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="absolute w-2 h-2 animate-confetti"
              style={{
                left: `${piece.left}%`,
                top: '-20px',
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][piece.id % 5],
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
