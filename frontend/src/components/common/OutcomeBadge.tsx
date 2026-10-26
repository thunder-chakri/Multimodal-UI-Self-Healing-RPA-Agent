import React from 'react';
import { RunOutcome } from '@/types/dashboard';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface Props {
  outcome: RunOutcome;
  size?: 'sm' | 'md' | 'lg';
}

export const OutcomeBadge: React.FC<Props> = ({ outcome, size = 'md' }) => {
  const config = {
    success: {
      label: 'Success',
      icon: CheckCircle2,
      classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      ariaLabel: 'Outcome: Success',
    },
    failure: {
      label: 'Failure',
      icon: XCircle,
      classes: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      ariaLabel: 'Outcome: Failure',
    },
    in_progress: {
      label: 'In Progress',
      icon: Loader2,
      classes: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      ariaLabel: 'Outcome: In Progress',
      spinning: true,
    },
  }[outcome];

  const IconComponent = config.icon;
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-medium px-3 py-1.5 gap-2',
  }[size];

  return (
    <span
      role="status"
      aria-label={config.ariaLabel}
      className={`inline-flex items-center rounded-full border tracking-wide uppercase font-semibold ${config.classes} ${sizeClasses}`}
    >
      <IconComponent
        className={`w-3.5 h-3.5 shrink-0 ${'spinning' in config && config.spinning ? 'animate-spin' : ''}`}
        aria-hidden="true"
      />
      <span>{config.label}</span>
    </span>
  );
};
