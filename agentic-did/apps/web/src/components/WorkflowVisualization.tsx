import { Action, Agent } from '../agents';
import { ChevronRight } from 'lucide-react';
import { useEffect, useRef } from 'react';

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
};

export default function WorkflowVisualization({ 
  selectedAction, 
  selectedAgent, 
  selectedTI,
  arrowStyle = 'gradient',
  highlightedBox = null
}: Props) {
  const workflowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to workflow when it appears
    if (workflowRef.current) {
      workflowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

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
    <div ref={workflowRef} className="my-8 p-6 bg-midnight-950/50 rounded-xl border border-midnight-700">
      <h3 className="text-xl font-bold text-midnight-100 mb-6 text-center">
        🔄 Active Workflow
      </h3>
      
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
          ${highlightedBox === 'agent' 
            ? 'border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.6)]' 
            : 'border-midnight-600'}
        `}>
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
          ${highlightedBox === 'ti' 
            ? 'border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.6)]' 
            : 'border-midnight-600'}
        `}>
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
    </div>
  );
}
