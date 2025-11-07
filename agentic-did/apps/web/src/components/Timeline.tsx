import { CheckCircle, XCircle, Loader, ArrowRight } from 'lucide-react';

export type TimelineStep = {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  message?: string;
  timestamp?: number;
};

type Props = {
  steps: TimelineStep[];
};

export default function Timeline({ steps }: Props) {
  if (steps.length === 0) {
    return (
      <div className="text-center py-12 text-midnight-500">
        <p>No activity yet. Select an agent and try an action!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-midnight-200 mb-4">Request Timeline</h3>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {step.status === 'loading' && (
              <Loader className="h-5 w-5 text-midnight-400 animate-spin" />
            )}
            {step.status === 'success' && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {step.status === 'error' && (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            {step.status === 'pending' && (
              <div className="h-5 w-5 rounded-full border-2 border-midnight-700" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className={`font-medium ${
                step.status === 'success' ? 'text-green-400' :
                step.status === 'error' ? 'text-red-400' :
                'text-midnight-300'
              }`}>
                {step.label}
              </p>
              {step.timestamp && (
                <span className="text-xs text-midnight-600">
                  {new Date(step.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
            {step.message && (
              <p className="text-sm text-midnight-500 mt-1">{step.message}</p>
            )}
          </div>

          {index < steps.length - 1 && (
            <ArrowRight className="h-4 w-4 text-midnight-700 mt-1" />
          )}
        </div>
      ))}
    </div>
  );
}
