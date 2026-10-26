import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { OutcomeBadge } from '@/components/common/OutcomeBadge';
import { WorkflowPipelineViewer } from '@/components/common/WorkflowPipelineViewer';
import { VideoPlaybackWindow } from './VideoPlaybackWindow';
import {
  X,
  Layers,
  AlertTriangle,
  ExternalLink,
  Film,
} from 'lucide-react';

export const RunDetailModal: React.FC = () => {
  const { runs, selectedRunId, selectRun, setActiveTab } = useDashboard();
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  if (!selectedRunId) return null;

  const run = runs.find((r) => r.id === selectedRunId);
  if (!run) return null;

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const rem = seconds % 60;
    return `${mins}m ${rem}s`;
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'Active / In Progress';
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="run-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => selectRun(null)}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] glass-modal rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800/80 bg-black/5 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-bold">
              {run.id}
            </span>
            <div>
              <h2 id="run-detail-title" className="text-base font-bold text-slate-900 dark:text-white">
                {run.automationName}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">Execution Pipeline Inspector</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsVideoOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/25 transition-all"
              title="Watch full session video recording"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Watch Video Replay</span>
            </button>

            <OutcomeBadge outcome={run.outcome} />
            <button
              onClick={() => selectRun(null)}
              className="p-2 rounded-xl glass-btn text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl glass-card text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Started At</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">{formatDateTime(run.startTime)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Completed At</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">{formatDateTime(run.endTime)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Elapsed Duration</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">{formatDuration(run.durationSeconds)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Pipeline Stage</span>
              <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                Step {run.currentStepIndex} of 7 ({run.progressPercent}%)
              </span>
            </div>
          </div>

          {/* 7-Step Workflow Pipeline Diagram Visualizer */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
              Runtime Execution Pipeline (7 Multimodal Stages)
            </h3>
            <WorkflowPipelineViewer
              steps={run.steps}
              currentStepIndex={run.currentStepIndex}
              selfHealingEvents={run.selfHealingEvents}
            />
          </div>

          {/* Failure Inspection if present */}
          {run.failure && (
            <div className="space-y-2 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Failure Incident Record
                </h4>
                <button
                  onClick={() => {
                    selectRun(run.id);
                    setActiveTab('failures');
                  }}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                >
                  <span>Open in Failure Reports</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-xs text-rose-800 dark:text-rose-200">
                <span className="font-semibold text-rose-900 dark:text-rose-300">Message: </span>
                {run.failure.errorMessage}
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400">
                <span className="font-medium text-slate-800 dark:text-slate-300">Breakpoint: </span>
                {run.failure.failedStep} ({formatDateTime(run.failure.timestamp)})
              </div>

              <pre className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-950/80 font-mono text-[11px] text-rose-300 overflow-x-auto leading-relaxed max-h-40 backdrop-blur-sm">
                {run.failure.stackExcerpt}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800/80 bg-black/5 dark:bg-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>OmniSight Multimodal RPA Inspector</span>
          <button
            onClick={() => selectRun(null)}
            className="px-4 py-2 rounded-xl glass-btn text-slate-800 dark:text-slate-200 font-semibold"
          >
            Close Inspector
          </button>
        </div>
      </div>

      {/* Embedded Video Playback Window */}
      {isVideoOpen && (
        <VideoPlaybackWindow
          run={run}
          isOpen={isVideoOpen}
          onClose={() => setIsVideoOpen(false)}
        />
      )}
    </div>
  );
};
