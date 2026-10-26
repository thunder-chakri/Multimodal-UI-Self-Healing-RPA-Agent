'use client';

import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import {
  Automation,
  AutomationRun,
  AutomationStatus,
  WorkflowStep,
  ThemeMode,
  ResolvedTheme,
} from '../types/dashboard';
import { loadDashboardData } from '../services/dataSource';
import { WORKFLOW_STAGES_TEMPLATE } from '../data/sampleData';

interface DashboardState {
  automations: Automation[];
  runs: AutomationRun[];
  selectedRunId: string | null;
  selectedAutomationId: string | null;
  isLoading: boolean;
  error: string | null;
  activeTab: 'all' | 'controls' | 'history' | 'failures' | 'reviews';
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  toast: { message: string; type: 'info' | 'success' | 'warning' | 'error' } | null;
}

type Action =
  | { type: 'LOAD_DATA_SUCCESS'; payload: { automations: Automation[]; runs: AutomationRun[] } }
  | { type: 'LOAD_DATA_ERROR'; payload: string }
  | { type: 'ADD_AUTOMATION'; payload: Automation }
  | { type: 'UPDATE_AUTOMATION_STATUS'; payload: { id: string; status: AutomationStatus } }
  | { type: 'TRIGGER_MANUAL_RUN'; payload: { automationId: string; newRun: AutomationRun } }
  | { type: 'PROGRESS_TICK'; payload: { runUpdates: Partial<AutomationRun>[] } }
  | { type: 'SELECT_RUN'; payload: string | null }
  | { type: 'SELECT_AUTOMATION'; payload: string | null }
  | { type: 'SET_TAB'; payload: 'all' | 'controls' | 'history' | 'failures' | 'reviews' }
  | { type: 'SET_THEME'; payload: ThemeMode }
  | { type: 'SET_RESOLVED_THEME'; payload: ResolvedTheme }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SHOW_TOAST'; payload: { message: string; type: 'info' | 'success' | 'warning' | 'error' } }
  | { type: 'CLEAR_TOAST' }
  | { type: 'CLEAR_ALL_DATA' };

const initialState: DashboardState = {
  automations: [],
  runs: [],
  selectedRunId: null,
  selectedAutomationId: null,
  isLoading: true,
  error: null,
  activeTab: 'all',
  theme: 'dark',
  resolvedTheme: 'dark',
  toast: null,
};

function dashboardReducer(state: DashboardState, action: Action): DashboardState {
  switch (action.type) {
    case 'LOAD_DATA_SUCCESS':
      return {
        ...state,
        automations: action.payload.automations,
        runs: action.payload.runs,
        isLoading: false,
        error: null,
      };

    case 'LOAD_DATA_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case 'ADD_AUTOMATION':
      return {
        ...state,
        automations: [action.payload, ...state.automations],
      };

    case 'CLEAR_ALL_DATA':
      return {
        ...state,
        automations: [],
        runs: [],
        selectedRunId: null,
        selectedAutomationId: null,
      };

    case 'UPDATE_AUTOMATION_STATUS': {
      const { id, status } = action.payload;
      const automations = state.automations.map((auto) => {
        if (auto.id === id) {
          return {
            ...auto,
            status,
            activeRunId: status === 'stopped' ? undefined : auto.activeRunId,
          };
        }
        return auto;
      });

      // If stopped, update any associated active run to stopped/failure if desired
      let updatedRuns = state.runs;
      if (status === 'stopped') {
        updatedRuns = state.runs.map((run) => {
          if (run.automationId === id && run.outcome === 'in_progress') {
            return {
              ...run,
              outcome: 'failure',
              endTime: new Date().toISOString(),
              failure: {
                errorMessage: 'ManualStopException: Run was manually terminated by the operator.',
                failedStep: `Step ${run.currentStepIndex || 1} - Execution aborted`,
                failedStepId: run.currentStepIndex || 1,
                timestamp: new Date().toISOString(),
                stackExcerpt: `ManualStopException: Operator dispatched hard stop signal at ${new Date().toLocaleTimeString()}.\n  at OmniSightController.stopAutomation\n  at UserSession.operatorRequest`,
                selfHealingAttempted: false,
                selfHealingOutcome: 'Aborted prior to self-healing trigger.',
              },
            };
          }
          return run;
        });
      }

      return {
        ...state,
        automations,
        runs: updatedRuns,
      };
    }

    case 'TRIGGER_MANUAL_RUN': {
      const { automationId, newRun } = action.payload;
      const automations = state.automations.map((auto) => {
        if (auto.id === automationId) {
          return {
            ...auto,
            status: 'running' as AutomationStatus,
            lastRunTime: newRun.startTime,
            runCount: auto.runCount + 1,
            activeRunId: newRun.id,
          };
        }
        return auto;
      });

      return {
        ...state,
        automations,
        runs: [newRun, ...state.runs],
        selectedRunId: newRun.id,
      };
    }

    case 'PROGRESS_TICK': {
      const updatesMap = new Map(action.payload.runUpdates.map((u) => [u.id, u]));
      let automationsUpdated = [...state.automations];

      const runs = state.runs.map((run) => {
        const update = updatesMap.get(run.id);
        if (update) {
          const merged = { ...run, ...update };
          // If the run transitioned to success or failure, reflect on the automation
          if (run.outcome === 'in_progress' && merged.outcome !== 'in_progress') {
            automationsUpdated = automationsUpdated.map((auto) => {
              if (auto.id === run.automationId) {
                return {
                  ...auto,
                  status: (merged.outcome === 'success' ? 'paused' : 'errored') as AutomationStatus,
                  activeRunId: undefined,
                  lastRunTime: merged.endTime || new Date().toISOString(),
                };
              }
              return auto;
            });
          }
          return merged;
        }
        return run;
      });

      return {
        ...state,
        runs,
        automations: automationsUpdated,
      };
    }

    case 'SELECT_RUN':
      return { ...state, selectedRunId: action.payload };

    case 'SELECT_AUTOMATION':
      return { ...state, selectedAutomationId: action.payload };

    case 'SET_THEME': {
      const newTheme = action.payload;
      return {
        ...state,
        theme: newTheme,
      };
    }

    case 'SET_RESOLVED_THEME':
      return { ...state, resolvedTheme: action.payload };

    case 'TOGGLE_THEME': {
      // Cycles light -> dark -> system -> light
      const nextTheme: ThemeMode =
        state.theme === 'light' ? 'dark' : state.theme === 'dark' ? 'system' : 'light';
      return { ...state, theme: nextTheme };
    }

    case 'SHOW_TOAST':
      return { ...state, toast: action.payload };

    case 'CLEAR_TOAST':
      return { ...state, toast: null };

    default:
      return state;
  }
}

interface DashboardContextType extends DashboardState {
  startAutomation: (id: string) => void;
  pauseAutomation: (id: string) => void;
  resumeAutomation: (id: string) => void;
  stopAutomation: (id: string) => void;
  triggerManualRun: (id: string) => void;
  createAutomation: (auto: { name: string; description: string; targetApp: string }) => void;
  clearAllData: () => void;
  selectRun: (id: string | null) => void;
  selectAutomation: (id: string | null) => void;
  setActiveTab: (tab: 'all' | 'controls' | 'history' | 'failures' | 'reviews') => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  dismissToast: () => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial data through single source function
  useEffect(() => {
    let isMounted = true;
    loadDashboardData()
      .then((data) => {
        if (isMounted) {
          dispatch({ type: 'LOAD_DATA_SUCCESS', payload: data });
        }
      })
      .catch((err) => {
        if (isMounted) {
          dispatch({
            type: 'LOAD_DATA_ERROR',
            payload: err instanceof Error ? err.message : 'Failed to load dashboard data',
          });
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    dispatch({ type: 'SHOW_TOAST', payload: { message, type } });
    toastTimerRef.current = setTimeout(() => {
      dispatch({ type: 'CLEAR_TOAST' });
    }, 4000);
  };

  const dismissToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    dispatch({ type: 'CLEAR_TOAST' });
  };

  // Maintain stable ref to state.runs to avoid re-instantiating the interval on every single tick
  const runsRef = useRef(state.runs);
  useEffect(() => {
    runsRef.current = state.runs;
  }, [state.runs]);

  // Automated runtime progression simulator
  useEffect(() => {
    const interval = setInterval(() => {
      const activeRuns = runsRef.current.filter((r) => r.outcome === 'in_progress');
      if (activeRuns.length === 0) return;

      const runUpdates: Partial<AutomationRun>[] = [];

      for (const run of activeRuns) {
        // Increment duration
        const newDuration = run.durationSeconds + 2;
        const currentProgress = run.progressPercent;
        const nextProgress = Math.min(100, currentProgress + Math.floor(Math.random() * 8) + 4);
        const currentStep = Math.min(7, Math.floor((nextProgress / 100) * 7) + 1);

        // Advance steps status
        const updatedSteps: WorkflowStep[] = run.steps.map((st) => {
          if (st.id < currentStep) {
            return { ...st, status: st.status === 'pending' || st.status === 'active' ? 'completed' : st.status };
          } else if (st.id === currentStep) {
            return { ...st, status: 'active', timestamp: new Date().toLocaleTimeString() };
          }
          return st;
        });

        // Chance of self-healing simulation at step 4 or 5
        const updatedHealingEvents = [...run.selfHealingEvents];
        if ((currentStep === 4 || currentStep === 5) && updatedHealingEvents.length === 0 && Math.random() > 0.6) {
          updatedHealingEvents.push({
            stepId: currentStep,
            stepName: updatedSteps[currentStep - 1]?.name || 'Execute through RPA agent',
            triggerReason: 'DOM visual discrepancy: target button relocated by 42px in new layout build.',
            originalTarget: 'button[id="btn-submit"]',
            healedTarget: 'button[role="button"][name="confirm-action"]',
            confidenceScore: 95.8,
            status: 'healed_and_retried',
            timestamp: new Date().toISOString(),
            evidence: 'Multimodal vision matched icon glyph & text context with 95.8% precision. Successfully patched.',
          });
        }

        // Check if finished
        if (nextProgress >= 100) {
          // 85% success, 15% simulated failure to showcase full lifecycle
          const isSuccess = Math.random() > 0.2;
          const outcome = isSuccess ? 'success' : 'failure';
          const nowIso = new Date().toISOString();

          let failureObj = undefined;
          if (!isSuccess) {
            failureObj = {
              errorMessage: 'SelectorResolutionTimeout: Dynamic canvas element failed to settle within 30000ms.',
              failedStep: '5 - Verify Expected Result',
              failedStepId: 5,
              timestamp: nowIso,
              stackExcerpt: `SelectorResolutionTimeout: Target element could not be verified by multimodal visual matcher.
  at RPAWorkflowEngine.verifyExpectedResult (src/engine/agent.ts:412:11)
  at async RPAWorkflowEngine.executeTask (src/engine/agent.ts:114:7)
  --- Self-Healing Subsystem Trace ---
  [SelfHealing] Evaluated screen region: Target was obstructed by non-dismissable banner.
  [SelfHealing] Confidence threshold not satisfied (48.3% < 85%).
  [Status] Execution halted for human safety audit.`,
              recommendedAction: 'Verify DOM layout for step 5 or update automation target coordinates.',
              selfHealingAttempted: true,
              selfHealingOutcome: 'Aborted due to low confidence threshold (48.3%).',
            };
          }

          runUpdates.push({
            id: run.id,
            durationSeconds: newDuration,
            progressPercent: 100,
            currentStepIndex: isSuccess ? 7 : 5,
            outcome,
            endTime: nowIso,
            steps: updatedSteps.map((s) => ({
              ...s,
              status: isSuccess
                ? 'completed'
                : s.id === 5
                ? 'failed'
                : s.id < 5
                ? 'completed'
                : 'pending',
            })),
            selfHealingEvents: updatedHealingEvents,
            failure: failureObj,
          });
        } else {
          runUpdates.push({
            id: run.id,
            durationSeconds: newDuration,
            progressPercent: nextProgress,
            currentStepIndex: currentStep,
            steps: updatedSteps,
            selfHealingEvents: updatedHealingEvents,
          });
        }
      }

      if (runUpdates.length > 0) {
        dispatch({ type: 'PROGRESS_TICK', payload: { runUpdates } });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Action methods with toast notifications & instant UI state updates
  const startAutomation = (id: string) => {
    const auto = state.automations.find((a) => a.id === id);
    if (!auto) return;
    dispatch({ type: 'UPDATE_AUTOMATION_STATUS', payload: { id, status: 'running' } });
    showToast(`Started automation "${auto.name}"`, 'success');
  };

  const pauseAutomation = (id: string) => {
    const auto = state.automations.find((a) => a.id === id);
    if (!auto) return;
    dispatch({ type: 'UPDATE_AUTOMATION_STATUS', payload: { id, status: 'paused' } });
    showToast(`Paused automation "${auto.name}"`, 'warning');
  };

  const resumeAutomation = (id: string) => {
    const auto = state.automations.find((a) => a.id === id);
    if (!auto) return;
    dispatch({ type: 'UPDATE_AUTOMATION_STATUS', payload: { id, status: 'running' } });
    showToast(`Resumed automation "${auto.name}"`, 'info');
  };

  const stopAutomation = (id: string) => {
    const auto = state.automations.find((a) => a.id === id);
    if (!auto) return;
    dispatch({ type: 'UPDATE_AUTOMATION_STATUS', payload: { id, status: 'stopped' } });
    showToast(`Stopped automation "${auto.name}"`, 'error');
  };

  const triggerManualRun = (id: string) => {
    const auto = state.automations.find((a) => a.id === id);
    if (!auto) return;

    const runSeq = Math.floor(1000 + Math.random() * 9000);
    const newRunId = `RUN-${runSeq}`;
    const nowIso = new Date().toISOString();

    const newRun: AutomationRun = {
      id: newRunId,
      automationId: auto.id,
      automationName: auto.name,
      startTime: nowIso,
      durationSeconds: 1,
      outcome: 'in_progress',
      progressPercent: 12,
      currentStepIndex: 1,
      steps: WORKFLOW_STAGES_TEMPLATE.map((stage, idx) => ({
        ...stage,
        status: idx === 0 ? 'active' : 'pending',
        timestamp: idx === 0 ? new Date().toLocaleTimeString() : undefined,
        details: idx === 0 ? 'Manual run initialized by operator.' : undefined,
      })),
      selfHealingEvents: [],
      videoPlaybackUrl: '/sample-run.mp4',
    };

    dispatch({ type: 'TRIGGER_MANUAL_RUN', payload: { automationId: id, newRun } });
    showToast(`Dispatched manual run ${newRunId} for "${auto.name}"`, 'success');
  };

  const createAutomation = (input: { name: string; description: string; targetApp: string }) => {
    const id = `auto-${Math.floor(100 + Math.random() * 900)}`;
    const newAuto: Automation = {
      id,
      name: input.name,
      description: input.description,
      targetApp: input.targetApp,
      status: 'stopped',
      lastRunTime: new Date().toISOString(),
      runCount: 0,
      successRate: 100,
    };
    dispatch({ type: 'ADD_AUTOMATION', payload: newAuto });
    showToast(`Created automation "${newAuto.name}"`, 'success');
  };

  const clearAllData = () => {
    dispatch({ type: 'CLEAR_ALL_DATA' });
    showToast('All automations and execution logs cleared.', 'info');
  };

  const selectRun = (id: string | null) => {
    dispatch({ type: 'SELECT_RUN', payload: id });
  };

  const selectAutomation = (id: string | null) => {
    dispatch({ type: 'SELECT_AUTOMATION', payload: id });
  };

  const setActiveTab = (tab: 'all' | 'controls' | 'history' | 'failures' | 'reviews') => {
    dispatch({ type: 'SET_TAB', payload: tab });
  };

  // Theme synchronization with system preference and localStorage
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('omnisight-theme') as ThemeMode | null;
      if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
        dispatch({ type: 'SET_THEME', payload: storedTheme });
      }
    } catch {
      // Ignore localStorage exceptions in restricted contexts
    }
  }, []);

  useEffect(() => {
    const updateResolvedTheme = () => {
      let resolved: ResolvedTheme = 'dark';
      if (state.theme === 'system') {
        const isSystemDark =
          typeof window !== 'undefined' &&
          window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches;
        resolved = isSystemDark ? 'dark' : 'light';
      } else {
        resolved = state.theme;
      }

      dispatch({ type: 'SET_RESOLVED_THEME', payload: resolved });

      // Synchronize with root document element class and color-scheme
      if (typeof document !== 'undefined') {
        if (resolved === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
          document.documentElement.style.colorScheme = 'dark';
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
          document.documentElement.style.colorScheme = 'light';
        }
      }
    };

    updateResolvedTheme();

    if (state.theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        updateResolvedTheme();
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    }
  }, [state.theme]);

  const setTheme = (themeMode: ThemeMode) => {
    try {
      localStorage.setItem('omnisight-theme', themeMode);
    } catch {
      // Ignore
    }
    dispatch({ type: 'SET_THEME', payload: themeMode });
    showToast(
      `Theme set to ${themeMode === 'system' ? 'System Default' : themeMode === 'light' ? 'Light' : 'Dark'} mode`,
      'info'
    );
  };

  const toggleTheme = () => {
    const nextTheme: ThemeMode =
      state.theme === 'light' ? 'dark' : state.theme === 'dark' ? 'system' : 'light';
    setTheme(nextTheme);
  };

  return (
    <DashboardContext.Provider
      value={{
        ...state,
        startAutomation,
        pauseAutomation,
        resumeAutomation,
        stopAutomation,
        triggerManualRun,
        createAutomation,
        clearAllData,
        selectRun,
        selectAutomation,
        setActiveTab,
        setTheme,
        toggleTheme,
        dismissToast,
      }}
    >
      <div className={state.resolvedTheme === 'dark' ? 'dark' : ''} data-theme-mode={state.theme}>
        {children}
      </div>
    </DashboardContext.Provider>
  );
};

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
