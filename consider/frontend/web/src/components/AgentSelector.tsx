import { AGENTS, AgentType } from '../agents';
import { useState, useEffect } from 'react';

type Props = {
  selectedAgent: AgentType;
  onSelect: (agent: AgentType) => void;
  isProcessing: boolean;
  animatingAgent?: AgentType | null;
  animationType?: 'blink' | 'glow' | null;
  onShowTasksPrompt?: () => void;
};

export default function AgentSelector({ selectedAgent, onSelect, isProcessing, animatingAgent, animationType, onShowTasksPrompt }: Props) {
  const [glitchText, setGlitchText] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Glitch effect for rogue agent
    const glitchMessages = [
      'Rogue Agent',
      'R̴o̷g̸u̴e̷ A̴g̷e̸n̴t̷',
      'R̵̰̈o̶̼͝g̴̯̈́u̷̥̐e̴̘͊ A̸͎̽g̷̱̈e̴̩͠n̶̰̈́t̷̳̀',
      '🚨 ROGUE 🚨',
      'R̷̢̛̳̻̥͎̝̈́͊͘o̴̧̢̱̤̻̾̌g̵̢̛̣̠̥̈́͑̄u̴̡̘̖̰̾ͅe̴̢̯͖̥̅ ̵̟͔̼̯̉̀A̵̛̺̞̮̟̰͛̈́g̴̢̝̘̗̔̀͛e̵̬͉̰̽̆̌n̸̙̜̥̿̀̏̚t̴̡̫͖̯̄',
      'R0GU3 4G3NT',
      '⚠️ REVOKED ⚠️',
      'Rogue Agent'
    ];
    
    const interval = setInterval(() => {
      setGlitchText({
        rogue: glitchMessages[Math.floor(Math.random() * glitchMessages.length)]
      });
    }, 150);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-midnight-200">Registered Agents (RAs)</h3>
      <p className="text-sm text-midnight-400">All registered agents in the AgenticDID network. The system automatically selects the appropriate agent for each action.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Object.entries(AGENTS)
          .filter(([key, agent]) => !agent.isRogue || key === selectedAgent) // Show rogue only if selected
          .map(([key, agent], index) => {
          const isRogue = agent.isRogue;
          const isLocked = key === 'comet' || key === 'agenticdid_agent';
          const isAnimating = animatingAgent === key;
          const shouldBlink = isAnimating && animationType === 'blink';
          const shouldGlow = isAnimating && animationType === 'glow';
          
          return (
            <button
              key={key}
              onClick={() => {
                if (isLocked) return;
                // Show prompt if clicking on non-system agents (not comet/agenticdid)
                if (key !== 'comet' && key !== 'agenticdid_agent' && onShowTasksPrompt) {
                  onShowTasksPrompt();
                } else {
                  onSelect(key as AgentType);
                }
              }}
              disabled={isLocked}
              className={`p-4 rounded-lg border-2 transition-all text-left relative overflow-hidden ${
                isLocked
                  ? 'border-yellow-300 bg-midnight-900/30 opacity-70 cursor-not-allowed shadow-[0_0_20px_rgba(253,224,71,0.5)]'
                  : shouldGlow
                    ? 'border-green-400 bg-midnight-800/50 shadow-[0_0_30px_rgba(34,197,94,0.6)]'
                    : isRogue
                      ? `border-red-900 bg-gradient-to-br from-red-950/40 to-black/60 hover:border-red-700 ${
                          selectedAgent === key ? 'border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.3)]' : 'shadow-[0_0_15px_rgba(220,38,38,0.15)]'
                        }`
                      : selectedAgent === key
                        ? 'border-midnight-500 bg-midnight-800/50'
                        : 'border-midnight-800 bg-midnight-900/30 hover:border-midnight-700'
              }`}
              style={
                shouldBlink
                  ? { animation: 'border-blink 0.5s ease-in-out 3' }
                  : selectedAgent === key && isProcessing
                    ? {
                        animation: isRogue 
                          ? 'blink-fast-red 0.5s ease-in-out infinite' 
                          : 'blink-fast 0.5s ease-in-out infinite'
                      }
                    : undefined
              }
            >
              {/* Locked indicator for comet and agenticdid_agent */}
              {isLocked && (
                <div className="absolute top-2 right-2 px-2 py-1 rounded bg-yellow-900/60 border border-yellow-300 text-xs text-yellow-300 font-bold shadow-[0_0_15px_rgba(253,224,71,0.6)] animate-pulse">
                  🔒 Locked
                </div>
              )}
              
              {/* Danger effects for rogue agent */}
              {isRogue && (
                <>
                  {/* Scanline effect */}
                  <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-900/20 to-transparent animate-[scan_2s_linear_infinite]" />
                  </div>
                  
                  {/* Crack overlay */}
                  <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0,20 L40,0 M30,40 L70,20 M60,0 L100,30" stroke="rgba(139,0,0,0.5)" strokeWidth="1" fill="none" />
                    </svg>
                  </div>
                  
                  {/* Warning corner badges */}
                  <div className="absolute top-1 right-1 text-xs text-red-500 animate-pulse">⚠️</div>
                  <div className="absolute bottom-1 left-1 text-xs text-red-500 animate-pulse">⚠️</div>
                </>
              )}
              
              <div className="flex items-center gap-3 mb-2 relative z-10">
                <span className={`text-3xl ${isRogue ? 'animate-pulse' : ''}`}>{agent.icon}</span>
                <div className="flex-1">
                  <p className={`font-semibold ${agent.color} ${isRogue ? 'font-mono tracking-wide' : ''}`}>
                    {isRogue ? (glitchText.rogue || agent.name) : agent.name}
                  </p>
                  <p className={`text-xs ${isRogue ? 'text-red-400/70' : 'text-midnight-400'}`}>
                    Role: {agent.role}
                  </p>
                </div>
              </div>
              <p className={`text-xs relative z-10 ${isRogue ? 'text-red-300/60' : 'text-midnight-500'}`}>
                {agent.description}
              </p>
              {agent.isRogue && (
                <div className="mt-2 px-2 py-1 rounded bg-red-950/50 border border-red-800 text-xs text-red-400 font-bold animate-pulse relative z-10 shadow-[0_0_10px_rgba(220,38,38,0.3)]">
                  ☠️ CREDENTIAL REVOKED ☠️
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
