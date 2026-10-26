# OmniSight Operations Dashboard

OmniSight is a high-reliability operations dashboard built with **React**, **Next.js**, and **TypeScript** for monitoring and controlling autonomous **Multimodal UI Self-Healing & RPA Agents**.

---

## Architecture Overview

OmniSight operationalizes the **7-Stage Multimodal Agent Lifecycle**:

```
1. Receive User Task
       │
       ▼
2. Observe Interface (DOM & Screenshot Capture)
       │
       ▼
3. Plan Next Action (Multimodal AI Selector & Action Prediction)
       │
       ▼
4. Execute via RPA Agent (Browser Automation)
       │
       ▼
5. Verify Expected Result ──[Failure / UI Changed]──► Self-Heal Target (Vision + DOM)
       │ (Success)                                              │
       ▼                                                        ▼
6. Check Task Completion ◄──────────────────────── Validated Repair: Retry Action
       │                                            (If confident; else human review)
       ▼
7. Return Results & Execution Log
```

---

## Features

### 1. Automation Controls
- **Real-Time State Transitions**: Start, pause, resume, and stop any automation instantly. Status changes are reflected synchronously across the entire dashboard.
- **Manual Triggering**: Trigger ad-hoc manual runs with live simulated pipeline execution.
- **Accessible Indicators**: Colorblind-friendly status badges pairing distinct colors with iconography (`Running`, `Paused`, `Stopped`, `Errored`).

### 2. Execution History
- **Chronological Audit Table**: Columns for Run ID, Automation Name, Start Time, Duration, Pipeline Stage, and Outcome (`Success`, `Failure`, `In Progress`).
- **Interactive Filtering & Sorting**: Filter by specific automation or outcome status; sort chronologically or by execution duration.
- **Live Progress Simulator**: Real-time timer simulation smoothly progresses active executions through all 7 stages.
- **Modal Inspector**: Clicking any row launches the execution pipeline inspector with detailed stage telemetry and self-healing logs.

### 3. Failure Reports & Diagnostics
- **Targeted Investigation**: Chronological failure log highlighting recent incidents first.
- **Diagnostics Stack**: Displays the error message, failed stage breakpoint, exact timestamp, and monospace stack trace excerpt with one-click clipboard copying.
- **Direct Cross-Linking**: Seamlessly jump from any failure report back to its execution history record.
- **Multimodal Self-Healing Telemetry**: Reports visual bounding box diffs, confidence scores, and safety threshold escalation decisions.

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                     # Next.js App Router (Layout & Root Page)
│   ├── components/
│   │   ├── common/              # StatusBadge, OutcomeBadge, WorkflowPipelineViewer
│   │   ├── dashboard/           # AutomationControls, ExecutionHistory, FailureReports, RunDetailModal, OverviewBanner
│   │   └── layout/              # Header with responsive navigation tabs & theme toggles
│   ├── context/                 # DashboardContext (centralized state management & simulator)
│   ├── data/                    # sampleData.ts (realistic domain datasets)
│   ├── services/                # dataSource.ts (Single-function backend integration point)
│   ├── types/                   # dashboard.ts (TypeScript interface contracts)
│   └── __tests__/               # Vitest test suite for state, filters, and reports
├── vitest.config.ts             # Vitest test configuration
└── README.md
```

---

## Setup & Running Locally

### 1. Prerequisites
- Node.js `v20+` or `v24+`
- npm `10+`

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Test Suite
```bash
npm test
```

### 5. Build for Production
```bash
npm run build
```

---

## How to Swap in a Real Data Source

All remote data hydration is decoupled through a **single function** in [src/services/dataSource.ts](file:///c:/Users/Rupesh%20Yarram/OneDrive/Desktop/frontend/src/services/dataSource.ts):

```typescript
// src/services/dataSource.ts
export async function loadDashboardData(): Promise<DashboardDataSource> {
  const [automationsRes, runsRes] = await Promise.all([
    fetch('https://api.yourdomain.com/v1/automations'),
    fetch('https://api.yourdomain.com/v1/runs')
  ]);

  if (!automationsRes.ok || !runsRes.ok) {
    throw new Error('Failed to retrieve live operations telemetry');
  }

  return {
    automations: await automationsRes.json(),
    runs: await runsRes.json(),
  };
}
```

No alterations are required in UI components or reducers—the entire dashboard automatically adapts to your live API.
