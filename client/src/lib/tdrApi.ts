import { apiRequest } from "./queryClient";
import type {
  TdrEvent,
  TdrChecklistItem,
  TdrTestScenario,
  TdrIssue,
  TdrIntegrationTest,
  TdrDowntimeTest,
  TdrReadinessScore,
} from "@shared/schema";

// =============================================================================
// TDR Events API
// =============================================================================

export async function createTdrEvent(projectId: string, data: Partial<TdrEvent>) {
  const res = await apiRequest("POST", `/api/projects/${projectId}/tdr/events`, data);
  return res.json();
}

export async function updateTdrEvent(id: string, data: Partial<TdrEvent>) {
  const res = await apiRequest("PATCH", `/api/tdr/events/${id}`, data);
  return res.json();
}

export async function deleteTdrEvent(id: string) {
  await apiRequest("DELETE", `/api/tdr/events/${id}`);
}

// =============================================================================
// TDR Checklist API
// =============================================================================

export async function createChecklistItem(projectId: string, data: Partial<TdrChecklistItem>) {
  const res = await apiRequest("POST", `/api/projects/${projectId}/tdr/checklist`, data);
  return res.json();
}

export async function updateChecklistItem(id: string, data: Partial<TdrChecklistItem>) {
  const res = await apiRequest("PATCH", `/api/tdr/checklist/${id}`, data);
  return res.json();
}

export async function completeChecklistItem(id: string, userId: string) {
  const res = await apiRequest("POST", `/api/tdr/checklist/${id}/complete`, { userId });
  return res.json();
}

export async function uncompleteChecklistItem(id: string) {
  const res = await apiRequest("POST", `/api/tdr/checklist/${id}/uncomplete`, {});
  return res.json();
}

export async function deleteChecklistItem(id: string) {
  await apiRequest("DELETE", `/api/tdr/checklist/${id}`);
}

export async function seedChecklist(projectId: string, tdrEventId?: string) {
  const res = await apiRequest("POST", `/api/projects/${projectId}/tdr/checklist/seed`, { tdrEventId });
  return res.json();
}

// =============================================================================
// TDR Test Scenarios API
// =============================================================================

export async function createTestScenario(projectId: string, data: Partial<TdrTestScenario>) {
  const res = await apiRequest("POST", `/api/projects/${projectId}/tdr/test-scenarios`, data);
  return res.json();
}

export async function updateTestScenario(id: string, data: Partial<TdrTestScenario>) {
  const res = await apiRequest("PATCH", `/api/tdr/test-scenarios/${id}`, data);
  return res.json();
}

export async function executeTestScenario(id: string, data: { status: string; actualResult?: string; userId: string }) {
  const res = await apiRequest("POST", `/api/tdr/test-scenarios/${id}/execute`, data);
  return res.json();
}

export async function deleteTestScenario(id: string) {
  await apiRequest("DELETE", `/api/tdr/test-scenarios/${id}`);
}

// =============================================================================
// TDR Issues API
// =============================================================================

export async function createIssue(projectId: string, data: Partial<TdrIssue>) {
  const res = await apiRequest("POST", `/api/projects/${projectId}/tdr/issues`, data);
  return res.json();
}

export async function updateIssue(id: string, data: Partial<TdrIssue>) {
  const res = await apiRequest("PATCH", `/api/tdr/issues/${id}`, data);
  return res.json();
}

export async function resolveIssue(id: string, resolution: string) {
  const res = await apiRequest("POST", `/api/tdr/issues/${id}/resolve`, { resolution });
  return res.json();
}

export async function deleteIssue(id: string) {
  await apiRequest("DELETE", `/api/tdr/issues/${id}`);
}

// =============================================================================
// TDR Integration Tests API
// =============================================================================

export async function createIntegrationTest(projectId: string, data: Partial<TdrIntegrationTest>) {
  const res = await apiRequest("POST", `/api/projects/${projectId}/tdr/integration-tests`, data);
  return res.json();
}

export async function updateIntegrationTest(id: string, data: Partial<TdrIntegrationTest>) {
  const res = await apiRequest("PATCH", `/api/tdr/integration-tests/${id}`, data);
  return res.json();
}

export async function deleteIntegrationTest(id: string) {
  await apiRequest("DELETE", `/api/tdr/integration-tests/${id}`);
}

// =============================================================================
// TDR Downtime Tests API
// =============================================================================

export async function createDowntimeTest(projectId: string, data: Partial<TdrDowntimeTest>) {
  const res = await apiRequest("POST", `/api/projects/${projectId}/tdr/downtime-tests`, data);
  return res.json();
}

export async function updateDowntimeTest(id: string, data: Partial<TdrDowntimeTest>) {
  const res = await apiRequest("PATCH", `/api/tdr/downtime-tests/${id}`, data);
  return res.json();
}

export async function deleteDowntimeTest(id: string) {
  await apiRequest("DELETE", `/api/tdr/downtime-tests/${id}`);
}

// =============================================================================
// TDR Readiness Score API
// =============================================================================

export async function calculateReadinessScore(projectId: string, tdrEventId?: string) {
  const res = await apiRequest("POST", `/api/projects/${projectId}/tdr/readiness-score/calculate`, { tdrEventId });
  return res.json();
}

export async function approveReadinessScore(id: string, userId: string, recommendation: string) {
  const res = await apiRequest("POST", `/api/tdr/readiness-score/${id}/approve`, { userId, recommendation });
  return res.json();
}

// =============================================================================
// Types for Summary
// =============================================================================

export interface TdrSummary {
  checklist: {
    total: number;
    completed: number;
    percentage: number;
  };
  testScenarios: {
    total: number;
    passed: number;
    failed: number;
    pending: number;
    percentage: number;
  };
  issues: {
    total: number;
    open: number;
    critical: number;
    blockers: number;
  };
  integrationTests: {
    total: number;
    passed: number;
    percentage: number;
  };
  downtimeTests: {
    total: number;
    passed: number;
    percentage: number;
  };
  upcomingEvents: TdrEvent[];
  latestScore: TdrReadinessScore | null;
}
