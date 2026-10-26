import React, { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { WorkflowAnimationModal } from './WorkflowAnimationModal';
import { VideoPlaybackWindow } from './VideoPlaybackWindow';
import {
  Layers,
  AlertOctagon,
  Sparkles,
  Activity,
  ArrowRight,
  Film,
} from 'lucide-react';

export const OverviewBanner: React.FC = () => {
  const { automations, runs, setActiveTab } = useDashboard();
  const [isAnimationOpen, setIsAnimationOpen] = useState<boolean>(false);
  const [isVideoOpen, setIsVideoOpen] = useState<boolean>(false);

  const totalRuns = runs.length;
  const activeRuns = runs.filter((r) => r.outcome === 'in_progress').length;
  const failureRuns = runs.filter((r) => r.outcome === 'failure').length;

  const totalHealedEvents = runs.reduce(
    (acc, r) => acc + r.selfHealingEvents.length,
    0
  );

  return (
    <div className="space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab('controls')}
          className="text-left p-4 sm:p-5 rounded-2xl glass-card-interactive flex flex-col justify-between group transition-all cursor-pointer relative overflow-hidden"
          title="Click to view and configure automations"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs uppercase font-mono tracking-wider font-semibold">Automations</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
              {automations.length}
            </span>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {automations.filter((a) => a.status === 'running').length} active
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className="text-left p-4 sm:p-5 rounded-2xl glass-card-interactive flex flex-col justify-between group transition-all cursor-pointer relative overflow-hidden"
          title="Click to inspect real-time execution runs"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs uppercase font-mono tracking-wider font-semibold">Active Runs</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-cyan-600 dark:text-cyan-400">
              {activeRuns}
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {totalRuns} total cycles
            </span>
          </div>
        </button>

        <button
          onClick={() => setIsAnimationOpen(true)}
          className="text-left p-4 sm:p-5 rounded-2xl glass-card-interactive flex flex-col justify-between group transition-all cursor-pointer relative overflow-hidden"
          title="Click to see autonomous self-healing loop"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs uppercase font-mono tracking-wider font-semibold">Self-Healed</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-300">
              {totalHealedEvents}
            </span>
            <span className="text-xs font-mono text-amber-600/80 dark:text-amber-400/80">
              Vision & DOM fixes
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('failures')}
          className="text-left p-4 sm:p-5 rounded-2xl glass-card-interactive flex flex-col justify-between group transition-all cursor-pointer relative overflow-hidden"
          title="Click to view failure reports and stack traces"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs uppercase font-mono tracking-wider font-semibold">Failures</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
              {failureRuns}
            </span>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-mono font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Investigate &rarr;
            </span>
          </div>
        </button>
      </div>

      {/* Multimodal Architecture Callout Card (Based on User's System Diagram) */}
      <div className="rounded-2xl glass-panel p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
              Multimodal RPA Agent Runtime
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              Continuous Loop: Observe &rarr; Plan &rarr; Execute &rarr; Verify &rarr; Self-Heal
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
            When UI selectors shift or dynamic popups occur, OmniSight compares the new screen and page structure, calculates multimodal confidence metrics, and attempts autonomous repair before escalating.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsVideoOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-500/25 transition-all flex items-center gap-1.5 active:scale-95"
            title="Open active agent session video playback"
          >
            <Film className="w-3.5 h-3.5" />
            <span>Video Playback</span>
          </button>
          <button
            onClick={() => setIsAnimationOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/25 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workflow Animation</span>
          </button>
          <button
            onClick={() => setActiveTab('controls')}
            className="px-3.5 py-2 rounded-xl glass-btn text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95 text-slate-800 dark:text-slate-200"
          >
            <span>Operator Controls</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Workflow Animation Modal */}
      <WorkflowAnimationModal
        isOpen={isAnimationOpen}
        onClose={() => setIsAnimationOpen(false)}
      />

      {/* Session Video Playback Window */}
      {isVideoOpen && (
        <VideoPlaybackWindow
          run={
            runs[0] || {
              id: 'RUN-LIVE',
              automationId: 'auto-preview',
              automationName: 'OmniSight Multimodal Session',
              startTime: new Date().toISOString(),
              durationSeconds: 24,
              outcome: 'success',
              progressPercent: 100,
              currentStepIndex: 7,
              steps: [],
              selfHealingEvents: [
                {
                  stepId: 5,
                  stepName: 'Verify Expected Result',
                  triggerReason: 'DOM visual discrepancy: target button relocated by 42px in new layout build.',
                  originalTarget: 'button#btn-submit',
                  healedTarget: 'button[role="button"][name="confirm-action"]',
                  confidenceScore: 95.8,
                  status: 'healed_and_retried',
                  timestamp: new Date().toISOString(),
                  evidence: 'Multimodal vision matched icon glyph & text context with 95.8% precision.',
                },
              ],
            }
          }
          isOpen={isVideoOpen}
          onClose={() => setIsVideoOpen(false)}
        />
      )}
    </div>
  );
};
