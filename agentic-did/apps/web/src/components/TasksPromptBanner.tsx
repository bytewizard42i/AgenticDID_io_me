import { X, ArrowDown } from 'lucide-react';

type Props = {
  onClose: () => void;
  onGoToTasks: () => void;
};

export default function TasksPromptBanner({ onClose, onGoToTasks }: Props) {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full mx-4 animate-[slideDown_0.3s_ease-out]">
      <div className="bg-gradient-to-r from-cyan-900/95 to-blue-900/95 backdrop-blur-lg border-2 border-cyan-400 rounded-xl shadow-[0_0_40px_rgba(34,211,238,0.5)] p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-cyan-400/20 flex items-center justify-center">
            <ArrowDown className="w-6 h-6 text-cyan-400 animate-bounce" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-cyan-100 mb-2">
              ☄️ Comet says: Start with a Task!
            </h3>
            <p className="text-sm text-cyan-200 mb-4">
              No need to select agents or verifiers manually! Just <strong>choose what you want to do</strong> from the Tasks area below, and I'll automatically select the right agent and verifier for you. 🎯
            </p>
            
            <button
              onClick={onGoToTasks}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-midnight-900 font-semibold transition-all shadow-lg hover:shadow-cyan-400/50"
            >
              <ArrowDown className="w-4 h-4" />
              <span>Go to Tasks</span>
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-cyan-800/50 flex items-center justify-center text-cyan-300 hover:text-cyan-100 transition-all"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
