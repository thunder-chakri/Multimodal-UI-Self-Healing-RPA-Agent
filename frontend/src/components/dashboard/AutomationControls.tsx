import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AutomationRun } from '@/types/dashboard';
import { VideoPlaybackWindow } from './VideoPlaybackWindow';
import {
  Play,
  Pause,
  Square,
  Zap,
  Clock,
  CheckCircle,
  Layers,
  ArrowUpRight,
  Plus,
  Inbox,
  X,
  Film,
} from 'lucide-react';

export const AutomationControls: React.FC = () => {
  const {
    automations,
    runs,
    startAutomation,
    pauseAutomation,
    resumeAutomation,
    stopAutomation,
    triggerManualRun,
    createAutomation,
    selectRun,
    setActiveTab,
  } = useDashboard();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoModalRun, setVideoModalRun] = useState<AutomationRun | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetApp, setTargetApp] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createAutomation({
      name: name.trim(),
      description: description.trim() || 'Custom RPA process configured by operator',
      targetApp: targetApp.trim() || 'Internal Web Application',
    });
    setName('');
    setDescription('');
    setTargetApp('');
    setIsModalOpen(false);
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
            Automation Controls
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor state and control execution cycles for multimodal RPA agents
          </p>
        </div>
        <div className="flex items-center gap-2.5 text-xs">
          <button
            onClick={() => setIsModalOpen(true)}
            data-testid="btn-add-automation"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold shadow-md shadow-cyan-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Automation</span>
          </button>
          <span className="px-2.5 py-1 rounded-lg glass-card text-slate-700 dark:text-slate-300 font-mono">
            Total: <strong className="text-slate-900 dark:text-white">{automations.length}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-mono border border-emerald-500/30">
            Active: <strong className="text-emerald-800 dark:text-emerald-300">{automations.filter((a) => a.status === 'running').length}</strong>
          </span>
        </div>
      </div>

      {/* New Automation Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md glass-modal rounded-2xl shadow-2xl p-6 text-slate-900 dark:text-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-500" />
                Register New RPA Automation
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg glass-btn text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">Automation Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily Vendor Invoice Reconciler"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-card bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">Target Application / Environment</label>
                <input
                  type="text"
                  placeholder="e.g. SAP NetWeaver & Outlook Web"
                  value={targetApp}
                  onChange={(e) => setTargetApp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-card bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-slate-700 dark:text-slate-300">Task Objective Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the workflow tasks and multimodal vision actions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-card bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl glass-btn text-slate-700 dark:text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-md shadow-cyan-500/20"
                >
                  Create Automation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {automations.length === 0 ? (
        <div className="rounded-2xl glass-panel p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full glass-card mx-auto flex items-center justify-center text-cyan-500 border border-cyan-500/30">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Automations Registered</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You have removed all data. Click below to create your first RPA automation agent or trigger manual pipelines.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Automation</span>
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {automations.map((auto) => {
          const isRunning = auto.status === 'running';
          const isPaused = auto.status === 'paused';
          const isStopped = auto.status === 'stopped';
          const isErrored = auto.status === 'errored';
          const activeRun = runs.find((r) => r.id === auto.activeRunId || (r.automationId === auto.id && r.outcome === 'in_progress'));

          return (
            <div
              key={auto.id}
              data-testid={`automation-card-${auto.id}`}
              className="group relative rounded-2xl glass-card-interactive p-4 flex flex-col justify-between"
            >
              <div>
                {/* Header: Title and Status */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-mono font-medium text-slate-500 uppercase tracking-wider">
                      {auto.id}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {auto.name}
                    </h3>
                  </div>
                  <StatusBadge status={auto.status} size="sm" />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                  {auto.description}
                </p>

                {/* Target App Badge */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                  <span className="font-medium">Target:</span>
                  <span className="px-2 py-0.5 rounded-md glass-card text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                    {auto.targetApp}
                  </span>
                </div>

                {/* Metrics Meta */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl glass-card text-[11px] mb-4">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Last Run Time</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {formatTime(auto.lastRunTime)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Success Rate</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                      {auto.successRate}% ({auto.runCount})
                    </span>
                  </div>
                </div>

                {/* Active Run Link if running */}
                {auto.activeRunId && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <button
                      onClick={() => {
                        selectRun(auto.activeRunId || null);
                        setActiveTab('history');
                      }}
                      className="flex-1 flex items-center justify-between px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-700 dark:text-cyan-300 text-xs hover:bg-cyan-500/25 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                        Live Run in Progress: <strong className="font-mono">{auto.activeRunId}</strong>
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    {activeRun && (
                      <button
                        onClick={() => setVideoModalRun(activeRun)}
                        className="p-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/25 transition-all text-xs flex items-center gap-1"
                        title="Watch live agent video stream"
                        aria-label={`Watch live video for ${auto.name}`}
                      >
                        <Film className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline font-medium">Video</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons Toolbar */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1">
                  {/* Start / Resume */}
                  {isPaused && (
                    <button
                      onClick={() => resumeAutomation(auto.id)}
                      data-testid={`btn-resume-${auto.id}`}
                      className="p-2 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 transition-all shadow-sm"
                      title="Resume Automation"
                      aria-label={`Resume ${auto.name}`}
                    >
                      <Play className="w-4 h-4 fill-emerald-500/30" />
                    </button>
                  )}

                  {(isStopped || isErrored) && (
                    <button
                      onClick={() => startAutomation(auto.id)}
                      data-testid={`btn-start-${auto.id}`}
                      className="p-2 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 transition-all shadow-sm"
                      title="Start Automation"
                      aria-label={`Start ${auto.name}`}
                    >
                      <Play className="w-4 h-4 fill-emerald-500/30" />
                    </button>
                  )}

                  {/* Pause */}
                  {isRunning && (
                    <button
                      onClick={() => pauseAutomation(auto.id)}
                      data-testid={`btn-pause-${auto.id}`}
                      className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition-all shadow-sm"
                      title="Pause Automation"
                      aria-label={`Pause ${auto.name}`}
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  )}

                  {/* Stop */}
                  {(isRunning || isPaused) && (
                    <button
                      onClick={() => stopAutomation(auto.id)}
                      data-testid={`btn-stop-${auto.id}`}
                      className="p-2 rounded-xl bg-rose-500/20 text-rose-700 dark:text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 transition-all shadow-sm"
                      title="Stop Automation"
                      aria-label={`Stop ${auto.name}`}
                    >
                      <Square className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Manual Trigger Run Button */}
                <button
                  onClick={() => triggerManualRun(auto.id)}
                  data-testid={`btn-manual-run-${auto.id}`}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-md shadow-cyan-500/25 transition-all active:scale-95"
                  title="Trigger Manual Run"
                  aria-label={`Trigger manual run for ${auto.name}`}
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Run Now</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Embedded Live Video Playback Modal */}
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
