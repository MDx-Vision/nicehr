// Executive Metrics API helpers

export interface ExecutiveMetric {
  id: string;
  projectId: string;
  hospitalId?: string;
  executiveRole: 'ceo' | 'cfo' | 'cio' | 'cto' | 'cmio' | 'cno';
  category: 'pre_golive' | 'at_golive' | 'post_golive' | 'long_term';
  metricName: string;
  description?: string;
  targetValue: string;
  targetUnit?: string;
  baselineValue?: string;
  currentValue?: string;
  status: 'not_started' | 'on_track' | 'at_risk' | 'achieved' | 'missed';
  dataSource?: string;
  lastUpdated?: string;
  updatedBy?: string;
  notes?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface ExecutiveMetricValue {
  id: string;
  metricId: string;
  value: string;
  recordedAt: string;
  recordedBy?: string;
  source?: string;
  notes?: string;
}

export interface ExecutiveSummary {
  role: string;
  summary: {
    total: number;
    achieved: number;
    onTrack: number;
    atRisk: number;
    missed: number;
    notStarted: number;
  };
  achievementRate: number;
  progressRate: number;
  byCategory: Record<string, ExecutiveMetric[]>;
  byRole: Record<string, ExecutiveMetric[]>;
  endorsements: {
    total: number;
    pending: number;
    received: number;
    published: number;
  };
  sowCriteria: {
    total: number;
    achieved: number;
    pending: number;
  };
  metrics: ExecutiveMetric[];
}

export interface SuccessEndorsement {
  id: string;
  projectId: string;
  hospitalId?: string;
  executiveRole: string;
  executiveName: string;
  executiveTitle?: string;
  endorsementType?: string;
  content?: string;
  status: 'pending' | 'approved' | 'received' | 'published' | 'declined';
  requestedAt?: string;
  receivedAt?: string;
  metricsAchieved?: any;
  permissionToUse: boolean;
  createdAt: string;
}

export interface SowCriterion {
  id: string;
  projectId: string;
  contractId?: string;
  executiveRole: string;
  criteriaText: string;
  metricId?: string;
  targetValue?: string;
  achievedValue?: string;
  status: 'pending' | 'achieved' | 'not_achieved' | 'waived';
  verifiedAt?: string;
  verifiedBy?: string;
  evidence?: string;
  createdAt: string;
}

export interface ExecutiveReport {
  id: string;
  projectId: string;
  executiveRole?: string;
  reportType: string;
  title: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  content?: any;
  generatedAt: string;
  generatedBy?: string;
  format: string;
  fileUrl?: string;
}

const API_BASE = '/api';

// Metrics
export async function fetchMetrics(projectId: string, role?: string, category?: string): Promise<ExecutiveMetric[]> {
  const params = new URLSearchParams();
  if (role) params.set('role', role);
  if (category) params.set('category', category);
  const res = await fetch(`${API_BASE}/projects/${projectId}/executive-metrics?${params}`);
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
}

export async function createMetric(projectId: string, data: Partial<ExecutiveMetric>): Promise<ExecutiveMetric> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/executive-metrics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create metric');
  return res.json();
}

export async function updateMetric(id: string, data: Partial<ExecutiveMetric>): Promise<ExecutiveMetric> {
  const res = await fetch(`${API_BASE}/executive-metrics/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update metric');
  return res.json();
}

export async function deleteMetric(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/executive-metrics/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete metric');
}

export async function updateMetricValue(id: string, value: string, userId?: string, notes?: string): Promise<ExecutiveMetric> {
  const res = await fetch(`${API_BASE}/executive-metrics/${id}/update-value`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value, userId, notes }),
  });
  if (!res.ok) throw new Error('Failed to update metric value');
  return res.json();
}

export async function seedMetrics(projectId: string, executiveRole: string): Promise<ExecutiveMetric[]> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/executive-metrics/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ executiveRole }),
  });
  if (!res.ok) throw new Error('Failed to seed metrics');
  return res.json();
}

export async function fetchMetricHistory(id: string): Promise<ExecutiveMetricValue[]> {
  const res = await fetch(`${API_BASE}/executive-metrics/${id}/history`);
  if (!res.ok) throw new Error('Failed to fetch metric history');
  return res.json();
}

// Summary
export async function fetchSummary(projectId: string, role?: string): Promise<ExecutiveSummary> {
  const params = new URLSearchParams();
  if (role) params.set('role', role);
  const res = await fetch(`${API_BASE}/projects/${projectId}/executive-summary?${params}`);
  if (!res.ok) throw new Error('Failed to fetch summary');
  return res.json();
}

// Endorsements
export async function fetchEndorsements(projectId: string): Promise<SuccessEndorsement[]> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/endorsements`);
  if (!res.ok) throw new Error('Failed to fetch endorsements');
  return res.json();
}

export async function createEndorsement(projectId: string, data: Partial<SuccessEndorsement>): Promise<SuccessEndorsement> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/endorsements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create endorsement');
  return res.json();
}

export async function updateEndorsement(id: string, data: Partial<SuccessEndorsement>): Promise<SuccessEndorsement> {
  const res = await fetch(`${API_BASE}/endorsements/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update endorsement');
  return res.json();
}

export async function deleteEndorsement(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/endorsements/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete endorsement');
}

// SOW Criteria
export async function fetchSowCriteria(projectId: string): Promise<SowCriterion[]> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/sow-criteria`);
  if (!res.ok) throw new Error('Failed to fetch SOW criteria');
  return res.json();
}

export async function createSowCriterion(projectId: string, data: Partial<SowCriterion>): Promise<SowCriterion> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/sow-criteria`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create SOW criterion');
  return res.json();
}

export async function verifySowCriterion(id: string, achievedValue: string, evidence?: string, userId?: string): Promise<SowCriterion> {
  const res = await fetch(`${API_BASE}/sow-criteria/${id}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ achievedValue, evidence, userId }),
  });
  if (!res.ok) throw new Error('Failed to verify SOW criterion');
  return res.json();
}

export async function deleteSowCriterion(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/sow-criteria/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete SOW criterion');
}

// Reports
export async function fetchReports(projectId: string): Promise<ExecutiveReport[]> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/executive-reports`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function generateReport(projectId: string, data: { executiveRole?: string; reportType?: string; title?: string }): Promise<ExecutiveReport> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/executive-reports/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to generate report');
  return res.json();
}

// Role display helpers
export const EXECUTIVE_ROLES = [
  { value: 'ceo', label: 'CEO', title: 'Chief Executive Officer' },
  { value: 'cfo', label: 'CFO', title: 'Chief Financial Officer' },
  { value: 'cio', label: 'CIO', title: 'Chief Information Officer' },
  { value: 'cto', label: 'CTO', title: 'Chief Technology Officer' },
  { value: 'cmio', label: 'CMIO', title: 'Chief Medical Information Officer' },
  { value: 'cno', label: 'CNO', title: 'Chief Nursing Officer' },
] as const;

export const METRIC_CATEGORIES = [
  { value: 'pre_golive', label: 'Pre-Go-Live', color: 'blue' },
  { value: 'at_golive', label: 'At Go-Live', color: 'orange' },
  { value: 'post_golive', label: 'Post Go-Live', color: 'green' },
  { value: 'long_term', label: 'Long-Term', color: 'purple' },
] as const;

export const METRIC_STATUSES = [
  { value: 'not_started', label: 'Not Started', color: 'gray' },
  { value: 'on_track', label: 'On Track', color: 'green' },
  { value: 'at_risk', label: 'At Risk', color: 'yellow' },
  { value: 'achieved', label: 'Achieved', color: 'emerald' },
  { value: 'missed', label: 'Missed', color: 'red' },
] as const;
