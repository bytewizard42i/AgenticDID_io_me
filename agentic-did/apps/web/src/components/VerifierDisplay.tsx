import { useEffect, useState } from 'react';
import { AgentType } from '../agents';
import { Shield, CheckCircle } from 'lucide-react';

type Props = {
  selectedAgent: AgentType;
  isProcessing: boolean;
  isVerified: boolean;
};

type Verifier = {
  id: string;
  name: string;
  icon: string;
  color: string;
  matchesAgent: AgentType[];
};

const VERIFIERS: Verifier[] = [
  {
    id: 'bank-verifier',
    name: 'Bank Verifier',
    icon: '🏦',
    color: 'text-green-400',
    matchesAgent: ['banker'],
  },
  {
    id: 'airline-verifier',
    name: 'Airline Verifier',
    icon: '✈️',
    color: 'text-blue-400',
    matchesAgent: ['traveler'],
  },
  {
    id: 'retail-verifier',
    name: 'Retail Verifier',
    icon: '🛒',
    color: 'text-purple-400',
    matchesAgent: ['shopper'],
  },
];

export default function VerifierDisplay({ selectedAgent, isProcessing, isVerified }: Props) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);

  // Find the matching verifier
  const activeVerifier = VERIFIERS.find(v => v.matchesAgent.includes(selectedAgent));

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

      // Clear confetti after animation
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVerified, isProcessing]);

  if (selectedAgent === 'rogue') {
    return null; // Don't show verifiers for rogue agent
  }

  return (
    <div className="space-y-3 relative">
      <h3 className="text-lg font-semibold text-midnight-200">Zero-Knowledge Proof Verifiers</h3>
      <p className="text-sm text-midnight-400">Independent verifiers validate agent credentials</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {VERIFIERS.map((verifier) => {
          const isActive = verifier.id === activeVerifier?.id;
          const isVerifying = isActive && isProcessing;
          const isComplete = isActive && isVerified && !isProcessing;

          return (
            <div
              key={verifier.id}
              className={`p-4 rounded-lg border-2 transition-all text-left relative overflow-hidden ${
                isActive
                  ? 'border-midnight-500 bg-midnight-800/50'
                  : 'border-midnight-800 bg-midnight-900/30 opacity-50'
              }`}
              style={
                isVerifying
                  ? {
                      animation: 'blink-fast 0.5s ease-in-out infinite'
                    }
                  : undefined
              }
            >
              {/* Checkmark when verified */}
              {isComplete && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-6 h-6 text-green-400 animate-pulse" />
                </div>
              )}

              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{verifier.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Shield className={`w-4 h-4 ${verifier.color}`} />
                    <p className={`font-semibold ${verifier.color}`}>
                      {verifier.name}
                    </p>
                  </div>
                  <p className="text-xs text-midnight-400">
                    {isVerifying ? 'Verifying ZKP...' : isComplete ? 'Verified ✓' : 'Standby'}
                  </p>
                </div>
              </div>

              {/* Status indicator */}
              <div className="mt-2 text-xs">
                {isActive && (
                  <div className={`px-2 py-1 rounded ${
                    isComplete 
                      ? 'bg-green-950/50 border border-green-800 text-green-400'
                      : 'bg-blue-950/50 border border-blue-800 text-blue-400'
                  }`}>
                    {isComplete ? '✓ Proof Valid' : isVerifying ? '⚡ Verifying...' : 'Selected'}
                  </div>
                )}
              </div>
            </div>
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
