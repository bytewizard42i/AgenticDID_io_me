import { CheckCircle, XCircle } from 'lucide-react';

type Props = {
  success: boolean;
  message: string;
  onClose: () => void;
};

export default function ResultBanner({ success, message, onClose }: Props) {
  return (
    <div
      className={`p-4 rounded-lg border-2 flex items-center gap-3 ${
        success
          ? 'bg-green-900/20 border-green-700 text-green-300'
          : 'bg-red-900/20 border-red-700 text-red-300'
      }`}
    >
      {success ? (
        <CheckCircle className="h-6 w-6 flex-shrink-0" />
      ) : (
        <XCircle className="h-6 w-6 flex-shrink-0" />
      )}
      <div className="flex-1">
        <p className="font-semibold">{success ? '✅ Success!' : '❌ Failed'}</p>
        <p className="text-sm opacity-90">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-sm underline hover:no-underline"
      >
        Close
      </button>
    </div>
  );
}
