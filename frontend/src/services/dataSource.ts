import { Automation, AutomationRun } from '../types/dashboard';
import { INITIAL_AUTOMATIONS, INITIAL_RUNS } from '../data/sampleData';

/**
 * OmniSight Initial Dashboard State Contract
 */
export interface DashboardDataSource {
  automations: Automation[];
  runs: AutomationRun[];
}

/**
 * SINGLE FUNCTION INTEGRATION POINT:
 * To swap the mock/sample dataset with a real backend or GraphQL/REST API,
 * simply change this function to fetch and return data from your server/endpoint.
 * 
 * Example:
 * export async function loadDashboardData(): Promise<DashboardDataSource> {
 *   const [automationsRes, runsRes] = await Promise.all([
 *     fetch('/api/v1/automations'),
 *     fetch('/api/v1/runs')
 *   ]);
 *   return {
 *     automations: await automationsRes.json(),
 *     runs: await runsRes.json(),
 *   };
 * }
 */
export async function loadDashboardData(): Promise<DashboardDataSource> {
  // Simulating async network fetch resolution for realistic hydration
  return new Promise((resolve) => {
    // Deep clone sample data to isolate mutations
    const automations = JSON.parse(JSON.stringify(INITIAL_AUTOMATIONS));
    const runs = JSON.parse(JSON.stringify(INITIAL_RUNS));
    resolve({ automations, runs });
  });
}
