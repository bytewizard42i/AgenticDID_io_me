import { Lock, Key, Eye, Zap } from 'lucide-react';

export default function Hero() {
  return (
    <div className="py-12 text-center">
      <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-midnight-200 to-midnight-400 bg-clip-text text-transparent">
        Privacy-Preserving Identity for AI Agents
      </h2>
      <p className="text-xl text-midnight-300 mb-8 max-w-3xl mx-auto">
        Prove authenticity and authorization using zero-knowledge proofs, verifiable credentials,
        and Midnight receipts—without exposing private data.
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
        <Feature icon={Lock} text="Privacy-preserving identifiers" />
        <Feature icon={Key} text="Verifiable credentials" />
        <Feature icon={Eye} text="Zero-knowledge proofs" />
        <Feature icon={Zap} text="Midnight receipts" />
      </div>
    </div>
  );
}

function Feature({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-midnight-900/30 border border-midnight-800/50">
      <Icon className="h-6 w-6 text-midnight-400" />
      <p className="text-sm text-midnight-300">{text}</p>
    </div>
  );
}
