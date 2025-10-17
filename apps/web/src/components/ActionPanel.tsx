import { ACTIONS, Action } from '../agents';

type Props = {
  onAction: (action: Action) => void;
  disabled: boolean;
};

export default function ActionPanel({ onAction, disabled }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-midnight-200">Try an Action</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action)}
            disabled={disabled}
            className="p-6 rounded-lg border border-midnight-700 bg-midnight-900/30 hover:bg-midnight-800/50 hover:border-midnight-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            <div className="text-4xl mb-3">{action.icon}</div>
            <p className="font-semibold text-white mb-1">{action.label}</p>
            <p className="text-xs text-midnight-400">
              Requires: {action.requiredRole}
            </p>
            <p className="text-xs text-midnight-500">
              Scope: {action.requiredScope}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
