import React from 'react';
import { WorkflowStep, SelfHealingRecord } from '@/types/dashboard';
import {
  FileText,
  Eye,
  BrainCircuit,
  Play,
  CheckCircle,
  Flag,
  Database,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  steps: WorkflowStep[];
  currentStepIndex: number;
  selfHealingEvents?: SelfHealingRecord[];
  isCompact?: boolean;
}

export const WorkflowPipelineViewer: React.FC<Props> = ({
  steps,
  currentStepIndex,
  selfHealingEvents = [],
  isCompact = false,
}) => {
  const getStepIcon = (id: number) => {
    switch (id) {
      case 1:
        return FileText;
      case 2:
        return Eye;
      case 3:
        return BrainCircuit;
      case 4:
        return Play;
      case 5:
        return CheckCircle;
      case 6:
        return Flag;
      case 7:
        return Database;
      default:
        return CheckCircle;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Workflow Step Progression Rail */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
        {steps.map((step) => {
          const StepIcon = getStepIcon(step.id);
          const isCurrent = step.id === currentStepIndex;
          const isCompleted = step.status === 'completed';
          const isFailed = step.status === 'failed';
          const hasHealing = selfHealingEvents.some((e) => e.stepId === step.id);

          let borderClass = 'border-slate-200 dark:border-white/10 glass-card text-slate-500 dark:text-slate-400';
          let iconClass = 'text-slate-500 bg-slate-200/50 dark:bg-slate-800/80';

          if (isCurrent && !isFailed) {
            borderClass = 'border-cyan-500/50 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 ring-2 ring-cyan-500/30';
            iconClass = 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/20 animate-pulse';
          } else if (isCompleted) {
            borderClass = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
            iconClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/20';
          } else if (isFailed) {
            borderClass = 'border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/30';
            iconClass = 'text-rose-600 dark:text-rose-400 bg-rose-500/20';
          }

          return (
            <div
              key={step.id}
              className={`relative rounded-2xl border p-3.5 flex flex-col justify-between backdrop-blur-md transition-all duration-200 ${borderClass}`}
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/5 dark:bg-black/40 text-slate-700 dark:text-slate-300 font-semibold">
                    Step {step.id}
                  </span>
                  {hasHealing && (
                    <span
                      title="Self-healing triggered"
                      className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 font-semibold"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      Healed
                    </span>
                  )}
                  {isCurrent && !isFailed && (
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                  )}
                </div>

                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`p-1.5 rounded-xl shrink-0 ${iconClass}`}>
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-semibold leading-tight line-clamp-1 text-slate-900 dark:text-slate-200">
                    {step.name}
                  </h4>
                </div>

                {!isCompact && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2 mt-1">
                    {step.description}
                  </p>
                )}
              </div>

              {step.details && (
                <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/10 text-[10px] font-mono text-slate-600 dark:text-slate-400 truncate">
                  {step.details}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Multimodal Self-Healing Telemetry Callout */}
      {selfHealingEvents.length > 0 && (
        <div className="rounded-2xl glass-panel p-4.5 space-y-3 border-amber-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-medium text-sm">
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Multimodal Self-Healing & RPA Agent Telemetry</span>
            </div>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              Confidence Score System
            </span>
          </div>

          {selfHealingEvents.map((evt, idx) => (
            <div
              key={idx}
              className="glass-card rounded-xl p-3.5 space-y-2 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    Step {evt.stepId}: {evt.stepName}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 dark:text-slate-400">{evt.triggerReason}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      evt.status === 'healed_and_retried'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {evt.status === 'healed_and_retried'
                      ? 'Validated Repair: Action Retried'
                      : 'Escalated to Human Review'}
                  </span>
                  <span className="text-xs font-mono text-amber-700 dark:text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/25">
                    Confidence: {evt.confidenceScore}%
                  </span>
                </div>
              </div>

              {/* Selector Mutation Diff */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/25 text-rose-800 dark:text-rose-300">
                  <div className="text-[10px] text-rose-600 dark:text-rose-400 uppercase font-sans mb-1 flex items-center gap-1 font-semibold">
                    <AlertTriangle className="w-3 h-3" /> Original Stale Target
                  </div>
                  <code>{evt.originalTarget}</code>
                </div>
                <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/25 text-emerald-800 dark:text-emerald-300">
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-sans mb-1 flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3 h-3" /> Self-Healed New Selector
                  </div>
                  <code>{evt.healedTarget}</code>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                Evidence: {evt.evidence}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
