import { apiRequest } from "./queryClient";
import type {
  ChangeRequest,
  ChangeRequestImpact,
  ChangeRequestApproval,
  ChangeRequestComment,
} from "@shared/schema";

// =============================================================================
// Change Requests API
// =============================================================================

export async function getChangeRequests(projectId: string, filters?: {
  status?: string;
  category?: string;
  priority?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.priority) params.set('priority', filters.priority);

  const queryString = params.toString();
  const url = `/api/projects/${projectId}/change-requests${queryString ? `?${queryString}` : ''}`;
  const res = await apiRequest("GET", url);
  return res.json();
}

export async function getChangeRequest(projectId: string, id: string) {
  const res = await apiRequest("GET", `/api/projects/${projectId}/change-requests/${id}`);
  return res.json();
}

export async function createChangeRequest(projectId: string, data: Partial<ChangeRequest>) {
  const res = await apiRequest("POST", `/api/projects/${projectId}/change-requests`, data);
  return res.json();
}

export async function updateChangeRequest(projectId: string, id: string, data: Partial<ChangeRequest>) {
  const res = await apiRequest("PATCH", `/api/projects/${projectId}/change-requests/${id}`, data);
  return res.json();
}

export async function deleteChangeRequest(projectId: string, id: string) {
  await apiRequest("DELETE", `/api/projects/${projectId}/change-requests/${id}`);
}

// =============================================================================
// Workflow Actions API
// =============================================================================

export async function submitChangeRequest(id: string) {
  const res = await apiRequest("POST", `/api/change-requests/${id}/submit`, {});
  return res.json();
}

export async function startReviewChangeRequest(id: string) {
  const res = await apiRequest("POST", `/api/change-requests/${id}/start-review`, {});
  return res.json();
}

export async function approveChangeRequest(id: string, data: {
  approverId: string;
  approverName: string;
  approverRole: string;
  comments?: string;
}) {
  const res = await apiRequest("POST", `/api/change-requests/${id}/approve`, data);
  return res.json();
}

export async function rejectChangeRequest(id: string, data: {
  approverId: string;
  approverName: string;
  approverRole: string;
  comments?: string;
}) {
  const res = await apiRequest("POST", `/api/change-requests/${id}/reject`, data);
  return res.json();
}

export async function implementChangeRequest(id: string) {
  const res = await apiRequest("POST", `/api/change-requests/${id}/implement`, {});
  return res.json();
}

// =============================================================================
// Impacts API
// =============================================================================

export async function addImpact(changeRequestId: string, data: Partial<ChangeRequestImpact>) {
  const res = await apiRequest("POST", `/api/change-requests/${changeRequestId}/impacts`, data);
  return res.json();
}

export async function deleteImpact(impactId: string) {
  await apiRequest("DELETE", `/api/change-requests/impacts/${impactId}`);
}

// =============================================================================
// Comments API
// =============================================================================

export async function addComment(changeRequestId: string, data: Partial<ChangeRequestComment>) {
  const res = await apiRequest("POST", `/api/change-requests/${changeRequestId}/comments`, data);
  return res.json();
}

export async function deleteComment(commentId: string) {
  await apiRequest("DELETE", `/api/change-requests/comments/${commentId}`);
}

// =============================================================================
// Statistics API
// =============================================================================

export async function getChangeRequestStats(projectId: string) {
  const res = await apiRequest("GET", `/api/projects/${projectId}/change-requests/stats`);
  return res.json();
}
