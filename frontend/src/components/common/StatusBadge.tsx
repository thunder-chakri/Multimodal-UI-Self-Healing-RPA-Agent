import React from 'react';
import { AutomationStatus } from '@/types/dashboard';
import { Activity, PauseCircle, StopCircle, AlertOctagon } from 'lucide-react';

interface Props {
  status: AutomationStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md', showIcon = true }) => {
  const config = {
    running: {
      label: 'Running',
      icon: Activity,
      classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      dotColor: 'bg-emerald-400',
      ariaLabel: 'Status: Running',
    },
    paused: {
      label: 'Paused',
      icon: PauseCircle,
      classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      dotColor: 'bg-amber-400',
      ariaLabel: 'Status: Paused',
    },
    stopped: {
      label: 'Stopped',
      icon: StopCircle,
      classes: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
      dotColor: 'bg-slate-400',
      ariaLabel: 'Status: Stopped',
    },
    errored: {
      label: 'Errored',
      icon: AlertOctagon,
      classes: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      dotColor: 'bg-rose-400',
      ariaLabel: 'Status: Errored',
    },
  }[status] || {
    label: status,
    icon: Activity,
    classes: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    dotColor: 'bg-slate-400',
    ariaLabel: `Status: ${status}`,
  };

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
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} ${status === 'running' ? 'animate-pulse' : ''}`} />
      {showIcon && <IconComponent className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
      <span>{config.label}</span>
    </span>
  );
};
