import { Shield } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-midnight-800 bg-midnight-950/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-midnight-400" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-midnight-300 to-midnight-500 bg-clip-text text-transparent">
                AgenticDID.io
              </h1>
              <p className="text-xs text-midnight-400">Powered by Midnight</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1 rounded-full bg-midnight-800/50 text-midnight-300">
              Live Demo
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
