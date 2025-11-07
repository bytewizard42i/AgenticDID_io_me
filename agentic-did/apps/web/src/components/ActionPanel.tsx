import { ACTIONS, Action } from '../agents';
import { AlertTriangle } from 'lucide-react';

type Props = {
  onAction: (action: Action) => void;
  onRogueAttempt: () => void;
  disabled: boolean;
  rogueMode: boolean;
};

export default function ActionPanel({ onAction, onRogueAttempt, disabled, rogueMode }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-midnight-200">What do you want to do?</h3>
      <p className="text-sm text-midnight-400">
        {rogueMode ? (
          <span className="text-red-400 font-medium">⚠️ Rogue Mode Active - Now select an action to attempt</span>
        ) : (
          "We'll automatically select the right agent for you"
        )}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action)}
            disabled={disabled}
            className={`p-6 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left ${
              rogueMode
                ? 'border-red-700 bg-red-950/30 hover:bg-red-900/50 hover:border-red-600'
                : 'border-midnight-700 bg-midnight-900/30 hover:bg-midnight-800/50 hover:border-midnight-600'
            }`}
          >
            <div className="text-4xl mb-3">{action.icon}</div>
            <p className="font-semibold text-white mb-1">{action.label}</p>
            <p className="text-xs text-midnight-400">
              Requires: {action.requiredRole}
            </p>
            <p className="text-xs text-midnight-500">
              Scope: {action.requiredScope}
            </p>
            {rogueMode && (
              <p className="text-xs text-red-400 mt-2 font-medium">
                ⚠️ Will use Rogue Agent
              </p>
            )}
          </button>
        ))}
      </div>
      
      {/* Rogue Agent Button */}
      {!rogueMode && (
        <div className="mt-4">
          <button
            onClick={onRogueAttempt}
            disabled={disabled}
            className="w-full p-4 rounded-lg border-2 border-red-700 bg-red-950/30 hover:bg-red-900/50 hover:border-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <div>
                <p className="font-semibold text-red-200 mb-1">Try to Connect to Rogue Agent</p>
                <p className="text-xs text-red-400">
                  ⚠️ Simulate a bad actor attempt - System will detect and report
                </p>
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
