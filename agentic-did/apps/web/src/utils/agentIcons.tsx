import {
  Sparkles, Gem, Landmark, Bitcoin, Package, Plane, Vote,
  Stethoscope, Building2, Baby, GraduationCap, HeartPulse,
  ClipboardList, ShieldAlert, DollarSign, Headphones,
  ClipboardEdit, ScrollText, BookOpen, Scale,
} from 'lucide-react';

/**
 * Maps agent keys to Lucide icons.
 * Replaces emoji strings that don't render consistently across browsers/environments.
 */
export const AGENT_ICONS: Record<string, typeof Sparkles> = {
  comet: Sparkles,
  agenticdid_agent: Gem,
  bank_agent: Landmark,
  cex_agent: Bitcoin,
  amazon_agent: Package,
  airline_agent: Plane,
  voting_agent: Vote,
  doctors_office_agent: Stethoscope,
  stanford_hospital_agent: Building2,
  stanford_ivf_agent: Baby,
  stanford_college_agent: GraduationCap,
  blue_cross_agent: HeartPulse,
  medical_records_agent: ClipboardList,
  rogue: ShieldAlert,
};

/**
 * Maps action IDs to Lucide icons.
 */
export const ACTION_ICONS: Record<string, typeof Sparkles> = {
  bank_transfer: DollarSign,
  crypto_trade: Bitcoin,
  amazon_shop: Headphones,
  book_flight: Plane,
  register_vote: ClipboardEdit,
  cast_ballot: Vote,
  book_appointment: Stethoscope,
  hospital_admit: Building2,
  ivf_consultation: Baby,
  view_transcript: ScrollText,
  enroll_course: BookOpen,
  check_coverage: HeartPulse,
  aggregate_records: ClipboardList,
};

/**
 * Renders an agent icon by agent key. Falls back to emoji string if no mapping exists.
 */
export function AgentIcon({ agentKey, className = 'w-8 h-8' }: { agentKey: string; className?: string }) {
  const Icon = AGENT_ICONS[agentKey];
  if (Icon) return <Icon className={className} />;
  return <span className={className}>?</span>;
}

/**
 * Renders an action icon by action ID. Falls back to emoji string if no mapping exists.
 */
export function ActionIcon({ actionId, className = 'w-9 h-9' }: { actionId: string; className?: string }) {
  const Icon = ACTION_ICONS[actionId];
  if (Icon) return <Icon className={className} />;
  return <span className={className}>?</span>;
}

/**
 * Trusted Issuer icon — same as agent icon but with Scale icon appended.
 * Used in VerifierDisplay and WorkflowVisualization for TI boxes.
 */
export function TrustedIssuerIcon({ agentKey, className = 'w-6 h-6' }: { agentKey: string; className?: string }) {
  const Icon = AGENT_ICONS[agentKey];
  return (
    <span className="inline-flex items-center gap-1">
      {Icon ? <Icon className={className} /> : <span>?</span>}
      <Scale className={className} />
    </span>
  );
}
