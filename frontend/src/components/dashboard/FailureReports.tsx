import React, { useMemo, useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { AutomationRun } from '@/types/dashboard';
import { VideoPlaybackWindow } from './VideoPlaybackWindow';
import {
  AlertTriangle,
  Clock,
  ExternalLink,
  Sparkles,
  ShieldAlert,
  Copy,
  Check,
  Terminal,
  HelpCircle,
  Film,
} from 'lucide-react';

export const FailureReports: React.FC = () => {
  const { runs, selectedRunId, selectRun, setActiveTab } = useDashboard();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [videoModalRun, setVideoModalRun] = useState<AutomationRun | null>(null);

  // Filter only failed runs and sort chronologically: most recent first
  const failedRuns = useMemo(() => {
    return runs
      .filter((r) => r.outcome === 'failure' && r.failure)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [runs]);

  const handleCopyLog = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500 dark:text-rose-400" />
            Failure Reports & Diagnostic Traces
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Investigate automation breakdowns, runtime exceptions, and multimodal self-healing telemetry
          </p>
        </div>
        <div className="text-xs font-mono px-3 py-1 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
          Total Failures: <strong>{failedRuns.length}</strong>
        </div>
      </div>

      {failedRuns.length === 0 ? (
        <div className="rounded-2xl glass-panel p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full glass-card mx-auto flex items-center justify-center text-emerald-500 border border-emerald-500/30">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Failure Reports</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All executed workflows have finished cleanly or are currently operating within nominal parameters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {failedRuns.map((run) => {
            const failure = run.failure!;
            const isSelected = selectedRunId === run.id;

            return (
              <div
                key={run.id}
                data-testid={`failure-card-${run.id}`}
                className={`rounded-2xl glass-panel transition-all p-5 ${
                  isSelected
                    ? 'border-rose-500/80 shadow-lg ring-2 ring-rose-500/30'
                    : 'hover:border-rose-500/40'
                }`}
              >
                {/* Failure Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold border border-rose-500/30">
                        {run.id}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {run.automationName}
                      </h3>
                    </div>
                    <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{failure.errorMessage}</span>
                    </p>
                  </div>

                  {/* Actions & Link to Execution */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setVideoModalRun(run)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-700 dark:text-cyan-300 text-xs font-medium transition-all shadow-xs"
                      title="Watch exact session video where failure happened"
                      aria-label={`Watch failure video replay for ${run.id}`}
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Replay</span>
                    </button>
                    <button
                      onClick={() => {
                        selectRun(run.id);
                        setActiveTab('history');
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl glass-btn text-slate-700 dark:text-slate-200 text-xs font-medium"
                      title="Jump to Execution Record"
                      aria-label={`View execution history for ${run.id}`}
                    >
                      <span>Execution Record</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Metadata Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl glass-card text-xs mb-3.5">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase tracking-wider block">
                      Failed Step
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {failure.failedStep}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase tracking-wider block">
                      Incident Timestamp
                    </span>
                    <span className="font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatTimestamp(failure.timestamp)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase tracking-wider block">
                      Self-Healing Status
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-medium ${
                        failure.selfHealingAttempted
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-500'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      {failure.selfHealingOutcome || (failure.selfHealingAttempted ? 'Attempted' : 'None')}
                    </span>
                  </div>
                </div>

                {/* Stack / Log Excerpt Block in Monospace */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Terminal className="w-3.5 h-3.5 text-slate-400" />
                      <span>Stack Trace & Agent Diagnostic Log</span>
                    </div>
                    <button
                      onClick={() => handleCopyLog(run.id, failure.stackExcerpt)}
                      className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-lg glass-btn"
                    >
                      {copiedId === run.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Trace</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 font-mono text-[11px] text-rose-300 overflow-x-auto leading-relaxed shadow-inner max-h-48 backdrop-blur-sm">
                    {failure.stackExcerpt}
                  </pre>
                </div>

                {/* Recommended Resolution hint */}
                {failure.recommendedAction && (
                  <div className="mt-3.5 flex items-start gap-2.5 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-xs text-indigo-800 dark:text-indigo-300">
                    <HelpCircle className="w-4 h-4 shrink-0 text-indigo-500 dark:text-indigo-400 mt-0.5" />
                    <div>
                      <strong className="text-indigo-900 dark:text-indigo-200">Recommended Operator Resolution: </strong>
                      {failure.recommendedAction}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Direct Session Video Playback Window for Failure Investigation */}
      {videoModalRun && (
        <VideoPlaybackWindow
          run={videoModalRun}
          isOpen={Boolean(videoModalRun)}
          onClose={() => setVideoModalRun(null)}
        />
      )}
    </div>
  );
};
