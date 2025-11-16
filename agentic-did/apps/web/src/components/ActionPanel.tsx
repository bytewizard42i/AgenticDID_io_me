import { ACTIONS, Action } from '../agents';
import { AlertTriangle, RotateCcw } from 'lucide-react';

type Props = {
  onAction: (action: Action) => void;
  onRogueAttempt: () => void;
  onClearData: () => void;
  disabled: boolean;
  rogueMode: boolean;
  selectedAction: Action | null;
};

export default function ActionPanel({ onAction, onRogueAttempt, onClearData, disabled, rogueMode, selectedAction }: Props) {
  return (
    <div className="space-y-4">
      {/* Big Heading */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-midnight-100 mb-2">
          Enabled Tasks I can perform for you...
        </h2>
        <p className="text-lg text-midnight-300">
          What do you want to do?
        </p>
      </div>
      
      {/* Status Message */}
      <p className="text-sm text-midnight-400 text-center">
        {rogueMode ? (
          <span className="text-red-400 font-medium">⚠️ Rogue Mode Active - Now select an action to attempt</span>
        ) : (
          "We'll automatically select the right agent for you"
        )}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {ACTIONS.map((action) => {
          const isSelected = selectedAction?.id === action.id;
          const isOtherSelected = selectedAction && selectedAction.id !== action.id;
          
          return (
          <button
            key={action.id}
            onClick={() => onAction(action)}
            disabled={disabled}
            className={`p-6 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left ${
              isSelected
                ? rogueMode
                  ? 'border-red-500 bg-red-900/50 shadow-[0_0_30px_rgba(239,68,68,0.5)] scale-105'
                  : 'border-midnight-400 bg-midnight-800/60 shadow-[0_0_30px_rgba(96,165,250,0.4)] scale-105'
                : isOtherSelected
                  ? 'opacity-40 blur-[1px] scale-95'
                  : rogueMode
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
        )})}
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

      {/* Clear Verification Data Button */}
      <div className="mt-3">
        <button
          onClick={onClearData}
          disabled={disabled}
          className="w-full p-3 rounded-lg border border-midnight-600 bg-midnight-900/30 hover:bg-midnight-800/50 hover:border-midnight-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
        >
          <div className="flex items-center gap-3">
            <RotateCcw className="w-6 h-6 text-midnight-400" />
            <div>
              <p className="font-semibold text-midnight-200 text-sm">Clear All Verification Data</p>
              <p className="text-xs text-midnight-500">
                Reset timeline and results
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
