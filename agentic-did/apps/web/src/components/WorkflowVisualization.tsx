import { Action, Agent } from '../agents';
import { ChevronRight, X, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type ArrowStyle = 'gradient' | 'animated';

type Props = {
  selectedAction: Action;
  selectedAgent: Agent;
  selectedTI: {
    name: string;
    icon: string;
    color: string;
  };
  arrowStyle?: ArrowStyle;
  highlightedBox?: 'task' | 'agent' | 'ti' | null;
  animatingRA?: 'blink' | 'glow' | null;
  animatingTI?: 'blink' | 'glow' | null;
  isVerified?: boolean;
  onCancel?: () => void;
  onNewAction?: () => void;
};

export default function WorkflowVisualization({ 
  selectedAction, 
  selectedAgent, 
  selectedTI,
  arrowStyle = 'gradient',
  highlightedBox = null,
  animatingRA = null,
  animatingTI = null,
  isVerified = false,
  onCancel,
  onNewAction
}: Props) {
  const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);
  const workflowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to workflow when it appears
    if (workflowRef.current) {
      workflowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Confetti effect when verified
  useEffect(() => {
    if (isVerified) {
      const pieces = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 500,
        duration: 2000 + Math.random() * 1000,
      }));
      setConfettiPieces(pieces);
      
      const timer = setTimeout(() => {
        setConfettiPieces([]);
      }, 3500);
      
      return () => clearTimeout(timer);
    }
  }, [isVerified]);

  const ArrowComponent = ({ style }: { style: ArrowStyle }) => {
    if (style === 'gradient') {
      return (
        <div className="flex items-center justify-center px-4">
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* Gradient Arrow */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-70 blur-sm rounded-full"></div>
            <ChevronRight className="w-12 h-12 text-white relative z-10 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" strokeWidth={3} />
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center px-4">
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* Animated Pulsing Arrow */}
            <div className="absolute inset-0 bg-blue-500 opacity-50 blur-md rounded-full animate-pulse"></div>
            <ChevronRight 
              className="w-12 h-12 text-blue-400 relative z-10 animate-[pulse_1s_ease-in-out_infinite]" 
              strokeWidth={4} 
            />
          </div>
        </div>
      );
    }
  };

  return (
    <div ref={workflowRef} className="relative my-8 p-6 bg-midnight-950/50 rounded-xl border border-midnight-700">
      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-900/20 hover:bg-red-900/40 border border-red-700 text-red-400 hover:text-red-300 transition-all shadow-lg hover:shadow-red-900/50"
          title="Cancel workflow and start over"
        >
          <X className="w-5 h-5" />
          <span className="text-sm font-semibold">Cancel</span>
        </button>
        
        <h3 className="text-xl font-bold text-midnight-100 text-center flex-1">
          🔄 Active Workflow
        </h3>
        
        <button
          onClick={onNewAction}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-900/20 hover:bg-cyan-900/40 border border-cyan-700 text-cyan-400 hover:text-cyan-300 transition-all shadow-lg hover:shadow-cyan-900/50"
          title="Choose another action"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-semibold">New Action</span>
        </button>
      </div>
      
      {/* Horizontal Flow */}
      <div className="flex items-center justify-center gap-2 flex-wrap md:flex-nowrap">
        
        {/* Task Button */}
        <div className={`
          relative p-6 rounded-xl border-2 bg-midnight-900/50 min-w-[200px]
          transition-all duration-300
          ${highlightedBox === 'task' 
            ? 'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.6)]' 
            : 'border-midnight-600'}
        `}>
          {/* LED Racing Border Effect */}
          <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
            <div className="absolute inset-0 animate-[spin_3s_linear_infinite]">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
              <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent"></div>
              <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-cyan-400 to-transparent"></div>
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-t from-transparent via-cyan-400 to-transparent"></div>
            </div>
          </div>
          
          <div className="text-center relative z-10">
            <div className="text-4xl mb-2">{selectedAction.icon}</div>
            <p className="text-sm font-semibold text-cyan-300">{selectedAction.label}</p>
            <p className="text-xs text-midnight-400 mt-1">Selected Task</p>
          </div>
        </div>

        <ArrowComponent style={arrowStyle} />

        {/* Agent Button */}
        <div className={`
          relative p-6 rounded-xl border-2 bg-midnight-900/50 min-w-[200px]
          transition-all duration-300
          ${animatingRA === 'glow'
            ? 'border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.6)]'
            : highlightedBox === 'agent' 
              ? 'border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.6)]' 
              : 'border-midnight-600'}
        `}
        style={animatingRA === 'blink' ? { animation: 'border-blink 0.5s ease-in-out 3' } : undefined}>
          <div className="text-center relative z-10">
            <div className="text-4xl mb-2">{selectedAgent.icon}</div>
            <p className={`text-sm font-semibold ${selectedAgent.color}`}>{selectedAgent.name}</p>
            <p className="text-xs text-midnight-400 mt-1">Auto-Selected Agent</p>
          </div>
        </div>

        <ArrowComponent style={arrowStyle} />

        {/* TI Button */}
        <div className={`
          relative p-6 rounded-xl border-2 bg-midnight-900/50 min-w-[200px]
          transition-all duration-300
          ${animatingTI === 'glow'
            ? 'border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.6)]'
            : highlightedBox === 'ti' 
              ? 'border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.6)]' 
              : 'border-midnight-600'}
        `}
        style={animatingTI === 'blink' ? { animation: 'border-blink 0.5s ease-in-out 3' } : undefined}>
          <div className="text-center relative z-10">
            <div className="text-4xl mb-2">{selectedTI.icon}</div>
            <p className={`text-sm font-semibold ${selectedTI.color}`}>{selectedTI.name}</p>
            <p className="text-xs text-midnight-400 mt-1">Trusted Issuer/Verifier</p>
          </div>
        </div>

      </div>

      {/* Comet Explanation Area */}
      <div className="mt-6 p-4 bg-midnight-900/30 rounded-lg border border-midnight-700">
        <div className="flex items-start gap-3">
          <div className="text-3xl">☄️</div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-purple-300 mb-1">Comet AI Assistant</p>
            <p className="text-sm text-midnight-300" id="comet-speech">
              Initiating transaction workflow...
            </p>
          </div>
        </div>
      </div>

      {/* Confetti - positioned over workflow area */}
      {confettiPieces.length > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="absolute w-2 h-2 animate-confetti"
              style={{
                left: `${piece.left}%`,
                top: '-10px',
                backgroundColor: ['#60A5FA', '#34D399', '#A78BFA', '#F472B6', '#FBBF24'][piece.id % 5],
                animationDelay: `${piece.delay}ms`,
                animationDuration: `${piece.duration}ms`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
