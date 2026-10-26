import { Automation, AutomationRun, WorkflowStep } from '../types/dashboard';

export const WORKFLOW_STAGES_TEMPLATE: Omit<WorkflowStep, 'status' | 'timestamp' | 'details'>[] = [
  { id: 1, name: 'Receive User Task', description: 'Parse task input & initialize target session' },
  { id: 2, name: 'Observe Interface', description: 'Capture screenshot, DOM tree & interactive elements' },
  { id: 3, name: 'Plan Next Action', description: 'Multimodal AI selector & action prediction' },
  { id: 4, name: 'Execute via RPA Agent', description: 'Dispatch browser action (click, type, navigate)' },
  { id: 5, name: 'Verify Result', description: 'Validate expected visual state & DOM response' },
  { id: 6, name: 'Check Task Completion', description: 'Confirm goal fulfillment or prepare next step' },
  { id: 7, name: 'Log & Return Results', description: 'Persist run metrics, audit trace & telemetry' },
];

export const INITIAL_AUTOMATIONS: Automation[] = [
  {
    id: 'auto-101',
    name: 'Invoice Extractor & SAP Sync',
    description: 'Autonomous extraction and document intake across ERP portals with visual element diff verification.',
    targetApp: 'https://books.toscrape.com/',
    status: 'running',
    lastRunTime: new Date().toISOString(),
    runCount: 28,
    successRate: 96,
  },
  {
    id: 'auto-102',
    name: 'Customer KYC Document Verifier',
    description: 'Autonomous multimodal verification of product catalog, cart checkout flow, and UI self-healing.',
    targetApp: 'Internal ERP Portal',
    status: 'paused',
    lastRunTime: new Date().toISOString(),
    runCount: 14,
    successRate: 98,
  },
];

export const INITIAL_RUNS: AutomationRun[] = [
  {
    id: 'RUN-9104',
    automationId: 'auto-101',
    automationName: 'Invoice Extractor & SAP Sync',
    startTime: new Date(Date.now() - 360000).toISOString(),
    endTime: new Date().toISOString(),
    durationSeconds: 22,
    outcome: 'in_progress',
    progressPercent: 70,
    currentStepIndex: 5,
    videoPlaybackUrl: '/sample-run.mp4',
    steps: WORKFLOW_STAGES_TEMPLATE.map((stage, idx) => ({
      ...stage,
      status: idx < 4 ? 'completed' : idx === 4 ? 'active' : 'pending',
      timestamp: idx <= 4 ? new Date().toLocaleTimeString() : undefined,
      details: 'Stage executing with multimodal vision feedback.',
    })),
    selfHealingEvents: [],
  },
  {
    id: 'RUN-9099',
    automationId: 'auto-101',
    automationName: 'Invoice Extractor & SAP Sync',
    startTime: new Date(Date.now() - 720000).toISOString(),
    endTime: new Date(Date.now() - 700000).toISOString(),
    durationSeconds: 20,
    outcome: 'failure',
    progressPercent: 71,
    currentStepIndex: 5,
    videoPlaybackUrl: '/sample-run.mp4',
    steps: WORKFLOW_STAGES_TEMPLATE.map((stage, idx) => ({
      ...stage,
      status: idx < 4 ? 'completed' : idx === 4 ? 'failed' : 'pending',
      timestamp: idx <= 4 ? new Date().toLocaleTimeString() : undefined,
      details: idx === 4 ? 'Step 5 failed: Dynamic bot mitigation barrier detected.' : undefined,
    })),
    selfHealingEvents: [],
    failure: {
      errorMessage: 'VerificationFailedError: Dynamic bot mitigation barrier intercepted action',
      failedStep: '5 - Verify Expected Result',
      failedStepId: 5,
      timestamp: new Date(Date.now() - 700000).toISOString(),
      stackExcerpt: `VerificationFailedError: Dynamic bot mitigation barrier
    at BrowserAgent.verifyStep (agent.ts:184:11)
    at async Orchestrator.executeStage (engine.ts:312:9)
    at async WorkerPool.processTask (worker.ts:88:5)`,
      recommendedAction: 'Update target selector and add captcha avoidance heuristic.',
      selfHealingAttempted: true,
      selfHealingOutcome: 'Self-healing attempted but confidence score (42%) below 80% threshold',
    },
  },
  {
    id: 'RUN-9088',
    automationId: 'auto-102',
    automationName: 'Customer KYC Document Verifier',
    startTime: new Date(Date.now() - 1200000).toISOString(),
    endTime: new Date(Date.now() - 1180000).toISOString(),
    durationSeconds: 20,
    outcome: 'failure',
    progressPercent: 42,
    currentStepIndex: 3,
    videoPlaybackUrl: '/sample-run.mp4',
    steps: WORKFLOW_STAGES_TEMPLATE.map((stage, idx) => ({
      ...stage,
      status: idx < 2 ? 'completed' : idx === 2 ? 'failed' : 'pending',
      timestamp: idx <= 2 ? new Date().toLocaleTimeString() : undefined,
    })),
    selfHealingEvents: [],
    failure: {
      errorMessage: 'SelectorResolutionTimeout: Element not found within 15000ms',
      failedStep: '3 - Plan Next Action',
      failedStepId: 3,
      timestamp: new Date(Date.now() - 1180000).toISOString(),
      stackExcerpt: `SelectorResolutionTimeout: Element #upload-btn not found
    at DOMObserver.waitFor (observer.ts:92:7)`,
      selfHealingAttempted: false,
    },
  },
  {
    id: 'RUN-9201',
    automationId: 'auto-102',
    automationName: 'Customer KYC Document Verifier',
    startTime: new Date(Date.now() - 1800000).toISOString(),
    endTime: new Date(Date.now() - 1778000).toISOString(),
    durationSeconds: 22,
    outcome: 'success',
    progressPercent: 100,
    currentStepIndex: 7,
    videoPlaybackUrl: '/sample-run.mp4',
    steps: WORKFLOW_STAGES_TEMPLATE.map((stage) => ({
      ...stage,
      status: 'completed',
      timestamp: new Date().toLocaleTimeString(),
      details: 'Stage executed and verified with 100% multimodal confidence.',
    })),
    selfHealingEvents: [
      {
        stepId: 5,
        stepName: 'Verify Result',
        triggerReason: 'DOM visual discrepancy: target button relocated by 42px in new layout build.',
        originalTarget: 'button[id="btn-checkout"]',
        healedTarget: 'button[role="button"][name="confirm-order"]',
        confidenceScore: 96.4,
        status: 'healed_and_retried',
        timestamp: new Date().toISOString(),
        evidence: 'Multimodal vision matched icon glyph & text context with 96.4% precision.',
      },
    ],
  },
];


