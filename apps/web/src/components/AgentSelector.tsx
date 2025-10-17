import { AGENTS, AgentType } from '../agents';

type Props = {
  selectedAgent: AgentType;
  onSelect: (agent: AgentType) => void;
};

export default function AgentSelector({ selectedAgent, onSelect }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-midnight-200">Select Agent Identity</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Object.entries(AGENTS).map(([key, agent]) => (
          <button
            key={key}
            onClick={() => onSelect(key as AgentType)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedAgent === key
                ? 'border-midnight-500 bg-midnight-800/50'
                : 'border-midnight-800 bg-midnight-900/30 hover:border-midnight-700'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{agent.icon}</span>
              <div className="flex-1">
                <p className={`font-semibold ${agent.color}`}>{agent.name}</p>
                <p className="text-xs text-midnight-400">Role: {agent.role}</p>
              </div>
            </div>
            <p className="text-xs text-midnight-500">{agent.description}</p>
            {agent.isRogue && (
              <div className="mt-2 px-2 py-1 rounded bg-red-900/30 border border-red-800 text-xs text-red-400">
                ⚠️ Credential Revoked
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
