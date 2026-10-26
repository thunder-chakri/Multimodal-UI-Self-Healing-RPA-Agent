export type AutomationStatus = 'running' | 'paused' | 'stopped' | 'errored';
export type RunOutcome = 'in_progress' | 'success' | 'failure';

export interface WorkflowStep {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'self_healed';
  timestamp?: string;
  details?: string;
}

export interface SelfHealingRecord {
  stepId: number;
  stepName: string;
  triggerReason: string;
  originalTarget: string;
  healedTarget: string;
  confidenceScore: number; // e.g. 96%
  status: 'healed_and_retried' | 'escalated_to_human';
  timestamp: string;
  evidence: string;
}

export interface FailureDetail {
  errorMessage: string;
  failedStep: string;
  failedStepId: number;
  timestamp: string;
  stackExcerpt: string;
  recommendedAction?: string;
  selfHealingAttempted: boolean;
  selfHealingOutcome?: string;
}

export interface VideoChapter {
  timeSeconds: number;
  label: string;
  stepId: number;
}

export interface AutomationRun {
  id: string; // e.g. RUN-8041
  automationId: string;
  automationName: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  outcome: RunOutcome;
  progressPercent: number;
  currentStepIndex: number;
  steps: WorkflowStep[];
  selfHealingEvents: SelfHealingRecord[];
  failure?: FailureDetail;
  videoPlaybackUrl?: string;
  videoChapters?: VideoChapter[];
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  targetApp: string;
  status: AutomationStatus;
  lastRunTime: string;
  runCount: number;
  successRate: number; // percentage
  activeRunId?: string;
}

export type ViewFilterOutcome = 'all' | RunOutcome;
export type SortOrder = 'newest' | 'oldest' | 'duration_desc' | 'duration_asc';
export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
