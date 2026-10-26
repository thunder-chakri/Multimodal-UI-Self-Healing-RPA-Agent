'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Pause,
  ArrowRight,
  Workflow,
} from 'lucide-react';

interface StageConfig {
  id: number;
  number: string;
  title: string;
  subtitle: string;
  example: string;
  type: 'main' | 'branch';
}

const MAIN_STAGES: StageConfig[] = [
  {
    id: 1,
    number: '1',
    title: 'Receive user task',
    subtitle: 'Task Input Ingestion',
    example: 'Example: download a report from a website',
    type: 'main',
  },
  {
    id: 2,
    number: '2',
    title: 'Observe the interface',
    subtitle: 'Multimodal Vision + DOM',
    example: 'Capture screenshot + page structure (DOM). Read visible text and identify controls',
    type: 'main',
  },
  {
    id: 3,
    number: '3',
    title: 'Plan the next action',
    subtitle: 'Autonomous AI Decisioning',
    example: 'AI selects the relevant UI element. Choose click, type, scroll or extract',
    type: 'main',
  },
  {
    id: 4,
    number: '4',
    title: 'Execute through the RPA agent',
    subtitle: 'Browser Action Dispatch',
    example: 'Run the action using browser automation. Example: click the Download button',
    type: 'main',
  },
  {
    id: 5,
    number: '5',
    title: 'Verify the expected result',
    subtitle: 'State Validation & Visual Diff',
    example: 'Did the action produce the intended outcome?',
    type: 'main',
  },
  {
    id: 6,
    number: '6',
    title: 'Check task completion',
    subtitle: 'Goal Assessment & Loop',
    example: 'More steps? Observe again and continue.',
    type: 'main',
  },
  {
    id: 7,
    number: '7',
    title: 'Return results & execution log',
    subtitle: 'Telemetry & Audit Persist',
    example: 'Provide output, action history and status. Record failures and successful repairs',
    type: 'main',
  },
];

const HEALING_STAGES = [
  {
    key: 'heal-1',
    stageRef: 5.1,
    title: 'UI changed or action failed',
    subtitle: 'Discrepancy Detection',
    description: 'Refresh screenshot + page structure. Check: moved button, changed label or selector',
  },
  {
    key: 'heal-2',
    stageRef: 5.2,
    title: 'Self-heal the target',
    subtitle: 'Multimodal Matching',
    description: 'Use visual + text + structural evidence. Select a new target and validate confidence',
  },
  {
    key: 'heal-3',
    stageRef: 5.3,
    title: 'Retry or request human help',
    subtitle: 'Confidence Gate',
    description: 'Confident + retries left: update target & retry. Uncertain / limit reached: pause for review',
  },
];

export const WorkflowAnimationModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  // Current active step in animation cycle
  // Steps: 1 -> 2 -> 3 -> 4 -> 5 -> (branch: heal-1 -> heal-2 -> heal-3 -> retry to 4) -> 5 -> 6 -> 7
  const [activeStage, setActiveStage] = useState<number | string>(1);
  const [isSelfHealingBranch, setIsSelfHealingBranch] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMs, setSpeedMs] = useState<number>(2200);

  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const timer = setInterval(() => {
      setActiveStage((prev) => {
        if (prev === 1) return 2;
        if (prev === 2) return 3;
        if (prev === 3) return 4;
        if (prev === 4) {
          // If returning from validated repair
          if (isSelfHealingBranch) {
            return 5;
          }
          return 5;
        }
        if (prev === 5) {
          // Trigger self-healing branch on first pass
          if (!isSelfHealingBranch) {
            setIsSelfHealingBranch(true);
            return 'heal-1';
          } else {
            // Already healed! Proceed to step 6
            setIsSelfHealingBranch(false);
            return 6;
          }
        }
        if (prev === 'heal-1') return 'heal-2';
        if (prev === 'heal-2') return 'heal-3';
        if (prev === 'heal-3') {
          // Validated repair: retry action back to step 4!
          return 4;
        }
        if (prev === 6) return 7;
        if (prev === 7) return 1; // Loop back
        return 1;
      });
    }, speedMs);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, isSelfHealingBranch, speedMs]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] glass-modal rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800/80 bg-black/5 dark:bg-white/5 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-mono">
                  OmniSight Runtime Workflow Simulator
                </h2>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                  Multimodal UI Self-Healing & RPA Agent
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Interactive real-time execution workflow tracing main execution and autonomous self-healing loops
              </p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-btn text-xs font-semibold"
              aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setActiveStage(1);
                setIsSelfHealingBranch(false);
              }}
              className="p-2 rounded-xl glass-btn text-xs"
              title="Restart from Step 1"
              aria-label="Restart animation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl glass-btn text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              Close
            </button>
          </div>
        </div>

        {/* Animation Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: 7 Main Stages */}
            <div className="lg:col-span-7 space-y-3 relative">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-cyan-600 dark:text-cyan-400">
                  Main Agent Execution Pipeline
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Current Step: <strong className="text-cyan-500">{String(activeStage).toUpperCase()}</strong>
                </span>
              </div>

              {MAIN_STAGES.map((st) => {
                const isActive = activeStage === st.id;
                const isPassed = typeof activeStage === 'number' && activeStage > st.id;

                let borderStyle = 'border-slate-200/80 dark:border-white/10 glass-card text-slate-600 dark:text-slate-400';
                if (isActive) {
                  borderStyle = 'border-cyan-500 bg-cyan-500/15 shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-500/40 text-slate-900 dark:text-white scale-[1.02]';
                } else if (isPassed) {
                  borderStyle = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300';
                }

                return (
                  <div
                    key={st.id}
                    onClick={() => setActiveStage(st.id)}
                    className={`rounded-2xl p-4 transition-all duration-300 cursor-pointer relative ${borderStyle}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                            isActive
                              ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/50 animate-pulse'
                              : isPassed
                              ? 'bg-emerald-500 text-white'
                              : 'bg-black/10 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {st.number}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold">{st.title}</h3>
                            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                              ({st.subtitle})
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                            {st.example}
                          </p>
                        </div>
                      </div>

                      {isActive && (
                        <span className="flex h-3 w-3 relative shrink-0 mt-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                        </span>
                      )}
                    </div>

                    {/* Animated Pulsing Connector to next step */}
                    {st.id < 7 && (
                      <div className="absolute -bottom-3 left-7 w-0.5 h-3 bg-gradient-to-b from-cyan-500 to-transparent z-10" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Column: Self-Healing Loop Branch & Real-World Example */}
            <div className="lg:col-span-5 space-y-4">
              {/* Branch Callout Box */}
              <div className="rounded-2xl glass-panel p-4.5 space-y-3.5 border-amber-500/30">
                <div className="flex items-center justify-between pb-1 border-b border-amber-500/20">
                  <span className="text-xs font-bold uppercase tracking-wider font-mono text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Self-Healing Subsystem Loop
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    Triggers on Step 5 Failure
                  </span>
                </div>

                <div className="space-y-3">
                  {HEALING_STAGES.map((hst, index) => {
                    const isBranchActive = activeStage === hst.key;

                    return (
                      <div
                        key={hst.key}
                        onClick={() => setActiveStage(hst.key)}
                        className={`rounded-xl p-3.5 transition-all duration-300 cursor-pointer ${
                          isBranchActive
                            ? 'bg-amber-500/20 border-2 border-amber-500 shadow-md shadow-amber-500/20 ring-1 ring-amber-400 text-slate-900 dark:text-white scale-[1.02]'
                            : 'glass-card border-amber-500/20 text-slate-600 dark:text-slate-400 hover:border-amber-500/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-amber-500/25 text-amber-800 dark:text-amber-300 shrink-0">
                              5.{index + 1}
                            </span>
                            <div>
                              <h4 className="text-xs font-bold">{hst.title}</h4>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-normal">
                                {hst.description}
                              </p>
                            </div>
                          </div>

                          {isBranchActive && (
                            <span className="flex h-2.5 w-2.5 relative shrink-0 mt-0.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Return path indicator */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                  <ArrowRight className="w-4 h-4 text-amber-500 shrink-0 rotate-180" />
                  <span className="leading-tight">
                    <strong>Validated repair:</strong> Retry action dispatched back to Step 4 (Execute through RPA agent).
                  </span>
                </div>
              </div>

              {/* Real World Example from the prompt diagram */}
              <div className="rounded-2xl glass-card p-4.5 space-y-2 border-cyan-500/30">
                <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Example of Self-Healing
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  The <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[11px]">Download button</code> moves or gets modified.
                  The old selector fails. OmniSight compares the new screen and page structure, finds the button again with multimodal confidence scoring, retries, and verifies the report.
                </p>
              </div>

              {/* Speed Controller */}
              <div className="glass-card rounded-2xl p-4 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Animation Speed:</span>
                <div className="flex items-center gap-1.5">
                  {[3000, 2000, 1000].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setSpeedMs(spd)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                        speedMs === spd
                          ? 'bg-cyan-500 text-white font-bold'
                          : 'glass-btn text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {spd === 3000 ? '0.7x' : spd === 2000 ? '1x' : '2x'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800/80 bg-black/5 dark:bg-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>OmniSight Multimodal Runtime Architecture Animation</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors shadow-md shadow-cyan-500/25"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
