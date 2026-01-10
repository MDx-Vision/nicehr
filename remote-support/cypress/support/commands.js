// Remote Support Custom Cypress Commands

const API_URL = Cypress.env('apiUrl') || 'http://localhost:3002';

// ===== User Authentication =====

Cypress.Commands.add('loginAs', (userType) => {
  const users = {
    hospitalStaff: { id: 5, name: 'John Smith', email: 'john.smith@metrogeneral.org', role: 'hospital_staff', hospitalId: 1 },
    hospitalStaff2: { id: 8, name: 'Anna Garcia', email: 'anna.garcia@stmarys.org', role: 'hospital_staff', hospitalId: 2 },
    consultant: { id: 1, name: 'Sarah Chen', email: 'sarah.chen@nicehr.com', role: 'consultant', hospitalId: null },
    consultant2: { id: 2, name: 'Marcus Johnson', email: 'marcus.johnson@nicehr.com', role: 'consultant', hospitalId: null },
    consultant3: { id: 3, name: 'Emily Rodriguez', email: 'emily.rodriguez@nicehr.com', role: 'consultant', hospitalId: null },
    admin: { id: 10, name: 'Admin User', email: 'admin@nicehr.com', role: 'admin', hospitalId: null },
  };

  const user = users[userType];
  if (!user) throw new Error(`Unknown user type: ${userType}`);

  cy.window().then((win) => {
    win.localStorage.setItem('user', JSON.stringify(user));
  });

  return cy.wrap(user);
});

// ===== API Helpers =====

Cypress.Commands.add('apiRequest', (method, endpoint, body) => {
  return cy.request({
    method,
    url: `${API_URL}${endpoint}`,
    body,
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('apiGet', (endpoint) => {
  return cy.apiRequest('GET', endpoint);
});

Cypress.Commands.add('apiPost', (endpoint, body) => {
  return cy.apiRequest('POST', endpoint, body);
});

Cypress.Commands.add('apiPatch', (endpoint, body) => {
  return cy.apiRequest('PATCH', endpoint, body);
});

Cypress.Commands.add('apiPut', (endpoint, body) => {
  return cy.apiRequest('PUT', endpoint, body);
});

Cypress.Commands.add('apiDelete', (endpoint, body) => {
  return cy.apiRequest('DELETE', endpoint, body);
});

// ===== Support Request Helpers =====

Cypress.Commands.add('createSupportRequest', (options = {}) => {
  const defaults = {
    requesterId: 5,
    hospitalId: 1,
    department: 'ER',
    urgency: 'normal',
    issueSummary: 'Test support request',
  };

  return cy.apiPost('/api/support/request', { ...defaults, ...options });
});

Cypress.Commands.add('cancelSupportRequest', (sessionId, userId) => {
  return cy.apiPost(`/api/support/cancel/${sessionId}`, { userId });
});

Cypress.Commands.add('acceptSupportRequest', (sessionId, consultantId) => {
  return cy.apiPost(`/api/support/accept/${sessionId}`, { consultantId });
});

Cypress.Commands.add('getActiveSession', (userId) => {
  return cy.apiGet(`/api/support/active?userId=${userId}`);
});

Cypress.Commands.add('getSupportQueue', () => {
  return cy.apiGet('/api/support/queue');
});

Cypress.Commands.add('getQueuePosition', (sessionId) => {
  return cy.apiGet(`/api/support/queue-position/${sessionId}`);
});

Cypress.Commands.add('endSupportSession', (sessionId, options = {}) => {
  return cy.apiPost(`/api/support/end/${sessionId}`, options);
});

Cypress.Commands.add('rateSupportSession', (sessionId, rating, feedback, userId) => {
  return cy.apiPost(`/api/support/rate/${sessionId}`, { rating, feedback, userId });
});

Cypress.Commands.add('getSupportHistory', (userId, role, limit = 20) => {
  return cy.apiGet(`/api/support/history?userId=${userId}&role=${role}&limit=${limit}`);
});

// ===== Consultant Helpers =====

Cypress.Commands.add('getAvailableConsultants', () => {
  return cy.apiGet('/api/consultants/available');
});

Cypress.Commands.add('getAllConsultants', () => {
  return cy.apiGet('/api/consultants');
});

Cypress.Commands.add('setConsultantStatus', (consultantId, status) => {
  return cy.apiPost('/api/consultants/status', { consultantId, status });
});

Cypress.Commands.add('getConsultantSpecialties', (consultantId) => {
  return cy.apiGet(`/api/consultants/${consultantId}/specialties`);
});

Cypress.Commands.add('updateConsultantSpecialties', (consultantId, specialties) => {
  return cy.apiPost(`/api/consultants/${consultantId}/specialties`, { specialties });
});

Cypress.Commands.add('getConsultantStats', (consultantId) => {
  return cy.apiGet(`/api/consultants/${consultantId}/stats`);
});

Cypress.Commands.add('getDepartments', () => {
  return cy.apiGet('/api/consultants/meta/departments');
});

// ===== Preference Helpers =====

Cypress.Commands.add('getStaffPreferences', (staffId) => {
  return cy.apiGet(`/api/consultants/preferences/${staffId}`);
});

Cypress.Commands.add('addStaffPreference', (staffId, consultantId) => {
  return cy.apiPost(`/api/consultants/preferences/${staffId}`, { consultantId });
});

Cypress.Commands.add('removeStaffPreference', (staffId, consultantId) => {
  return cy.apiDelete(`/api/consultants/preferences/${staffId}/${consultantId}`);
});

// ===== Analytics Helpers =====

Cypress.Commands.add('getAnalyticsOverview', () => {
  return cy.apiGet('/api/analytics/overview');
});

Cypress.Commands.add('getAnalyticsByDepartment', () => {
  return cy.apiGet('/api/analytics/by-department');
});

Cypress.Commands.add('getAnalyticsByHospital', () => {
  return cy.apiGet('/api/analytics/by-hospital');
});

Cypress.Commands.add('getAnalyticsByConsultant', () => {
  return cy.apiGet('/api/analytics/by-consultant');
});

Cypress.Commands.add('getAnalyticsByUrgency', () => {
  return cy.apiGet('/api/analytics/by-urgency');
});

Cypress.Commands.add('getAnalyticsHourly', () => {
  return cy.apiGet('/api/analytics/hourly');
});

Cypress.Commands.add('getAnalyticsDaily', () => {
  return cy.apiGet('/api/analytics/daily');
});

Cypress.Commands.add('getRecentSessions', (limit = 10) => {
  return cy.apiGet(`/api/analytics/recent-sessions?limit=${limit}`);
});

// ===== Schedule Helpers =====

Cypress.Commands.add('getScheduledSessions', (userId, role) => {
  return cy.apiGet(`/api/schedule?userId=${userId}&role=${role}`);
});

Cypress.Commands.add('getUpcomingSessions', (userId, minutes = 15) => {
  return cy.apiGet(`/api/schedule/upcoming?userId=${userId}&minutes=${minutes}`);
});

Cypress.Commands.add('createScheduledSession', (options) => {
  return cy.apiPost('/api/schedule', options);
});

Cypress.Commands.add('updateScheduledSession', (id, updates) => {
  return cy.apiPut(`/api/schedule/${id}`, updates);
});

Cypress.Commands.add('cancelScheduledSession', (id, userId, reason) => {
  return cy.apiPost(`/api/schedule/${id}/cancel`, { userId, reason });
});

Cypress.Commands.add('confirmScheduledSession', (id, consultantId) => {
  return cy.apiPost(`/api/schedule/${id}/confirm`, { consultantId });
});

Cypress.Commands.add('startScheduledSession', (id) => {
  return cy.apiPost(`/api/schedule/${id}/start`);
});

Cypress.Commands.add('getConsultantAvailability', (consultantId, date) => {
  const url = date
    ? `/api/schedule/consultant/${consultantId}/availability?date=${date}`
    : `/api/schedule/consultant/${consultantId}/availability`;
  return cy.apiGet(url);
});

Cypress.Commands.add('getStaffSchedule', (staffId) => {
  return cy.apiGet(`/api/schedule/staff/${staffId}/schedule`);
});

Cypress.Commands.add('updateStaffSchedule', (staffId, schedules) => {
  return cy.apiPut(`/api/schedule/staff/${staffId}/schedule`, { schedules });
});

Cypress.Commands.add('getStaffAvailability', (staffId, date) => {
  return cy.apiGet(`/api/schedule/staff/${staffId}/availability?date=${date}`);
});

// ===== Health Check =====

Cypress.Commands.add('checkHealth', () => {
  return cy.apiGet('/api/health');
});

// ===== UI Intercepts =====

Cypress.Commands.add('interceptSupportAPIs', () => {
  cy.intercept('POST', '**/api/support/request').as('createRequest');
  cy.intercept('GET', '**/api/support/queue').as('getQueue');
  cy.intercept('POST', '**/api/support/accept/**').as('acceptRequest');
  cy.intercept('POST', '**/api/support/cancel/**').as('cancelRequest');
  cy.intercept('GET', '**/api/support/active**').as('getActive');
  cy.intercept('POST', '**/api/support/end/**').as('endSession');
  cy.intercept('POST', '**/api/support/rate/**').as('rateSession');
});

Cypress.Commands.add('interceptConsultantAPIs', () => {
  cy.intercept('GET', '**/api/consultants/available').as('getAvailable');
  cy.intercept('GET', '**/api/consultants').as('getConsultants');
  cy.intercept('POST', '**/api/consultants/status').as('setStatus');
});

Cypress.Commands.add('interceptAnalyticsAPIs', () => {
  cy.intercept('GET', '**/api/analytics/overview').as('getOverview');
  cy.intercept('GET', '**/api/analytics/by-department').as('getByDepartment');
  cy.intercept('GET', '**/api/analytics/by-hospital').as('getByHospital');
  cy.intercept('GET', '**/api/analytics/by-consultant').as('getByConsultant');
});

// ===== Database Reset (if supported) =====

Cypress.Commands.add('resetDatabase', () => {
  // If we add a reset endpoint, use it here
  // return cy.apiPost('/api/admin/reset-database');
  cy.log('Database reset not implemented - tests should be idempotent');
});
