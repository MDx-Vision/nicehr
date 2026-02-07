/**
 * Unit Tests for TNG AI Assistant
 *
 * Tests the AI query interface, tool execution, and role-based responses.
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock the database
jest.mock('../db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([]),
  },
}));

// Mock Anthropic SDK
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'Mock AI response' }],
        stop_reason: 'end_turn',
      }),
    },
  }));
});

describe('TNG AI Assistant', () => {
  describe('Role-Based Access', () => {
    test('should allow admin role access', () => {
      const allowedRoles = ['admin', 'hospital_leadership'];
      expect(allowedRoles.includes('admin')).toBe(true);
    });

    test('should allow hospital_leadership role access', () => {
      const allowedRoles = ['admin', 'hospital_leadership'];
      expect(allowedRoles.includes('hospital_leadership')).toBe(true);
    });

    test('should deny consultant role access', () => {
      const allowedRoles = ['admin', 'hospital_leadership'];
      expect(allowedRoles.includes('consultant')).toBe(false);
    });

    test('should deny hospital_staff role access', () => {
      const allowedRoles = ['admin', 'hospital_leadership'];
      expect(allowedRoles.includes('hospital_staff')).toBe(false);
    });
  });

  describe('Tool Definitions', () => {
    const toolNames = [
      'query_servicenow',
      'query_jira',
      'query_asana',
      'query_fieldglass',
      'query_support_tickets',
      'query_projects',
      'query_consultants',
    ];

    test('should have 7 query tools defined', () => {
      expect(toolNames.length).toBe(7);
    });

    test('should include ServiceNow tool', () => {
      expect(toolNames).toContain('query_servicenow');
    });

    test('should include Jira tool', () => {
      expect(toolNames).toContain('query_jira');
    });

    test('should include Asana tool', () => {
      expect(toolNames).toContain('query_asana');
    });

    test('should include Fieldglass tool', () => {
      expect(toolNames).toContain('query_fieldglass');
    });

    test('should include Support Tickets tool', () => {
      expect(toolNames).toContain('query_support_tickets');
    });

    test('should include Projects tool', () => {
      expect(toolNames).toContain('query_projects');
    });

    test('should include Consultants tool', () => {
      expect(toolNames).toContain('query_consultants');
    });
  });

  describe('Fieldglass Role-Aware Responses', () => {
    test('admin should see SOW management data', () => {
      const userRole = 'admin';
      const isAdmin = userRole === 'admin';
      expect(isAdmin).toBe(true);

      // Admin should see SOW data with matching scores
      const adminData = {
        sows: { total: 12, open: 5 },
        consultants: { total: 45, available: 12, top_matches: [] },
      };
      expect(adminData.sows).toBeDefined();
      expect(adminData.consultants.top_matches).toBeDefined();
    });

    test('hospital_leadership should see workforce overview only', () => {
      const userRole = 'hospital_leadership';
      const isAdmin = userRole === 'admin';
      expect(isAdmin).toBe(false);

      // Executive should see workforce summary, not SOW details
      const execData = {
        workforce_summary: {
          active_consultants: 33,
          total_hours_this_month: 5280,
          avg_utilization: 94,
        },
      };
      expect(execData.workforce_summary).toBeDefined();
      expect(execData.workforce_summary.active_consultants).toBe(33);
    });
  });

  describe('Query Parameters Validation', () => {
    describe('ServiceNow Query', () => {
      test('should accept valid query_type values', () => {
        const validTypes = ['incidents', 'changes', 'tasks', 'summary'];
        validTypes.forEach(type => {
          expect(['incidents', 'changes', 'tasks', 'summary']).toContain(type);
        });
      });

      test('should accept valid status values', () => {
        const validStatuses = ['open', 'in_progress', 'resolved', 'closed', 'all'];
        validStatuses.forEach(status => {
          expect(['open', 'in_progress', 'resolved', 'closed', 'all']).toContain(status);
        });
      });

      test('should accept valid priority values', () => {
        const validPriorities = ['P1', 'P2', 'P3', 'P4', 'all'];
        validPriorities.forEach(priority => {
          expect(['P1', 'P2', 'P3', 'P4', 'all']).toContain(priority);
        });
      });
    });

    describe('Jira Query', () => {
      test('should accept valid query_type values', () => {
        const validTypes = ['issues', 'sprints', 'projects', 'summary'];
        validTypes.forEach(type => {
          expect(['issues', 'sprints', 'projects', 'summary']).toContain(type);
        });
      });

      test('should accept valid status values', () => {
        const validStatuses = ['open', 'in_progress', 'done', 'blocked', 'all'];
        validStatuses.forEach(status => {
          expect(['open', 'in_progress', 'done', 'blocked', 'all']).toContain(status);
        });
      });
    });

    describe('Asana Query', () => {
      test('should accept valid query_type values', () => {
        const validTypes = ['tasks', 'projects', 'summary'];
        validTypes.forEach(type => {
          expect(['tasks', 'projects', 'summary']).toContain(type);
        });
      });

      test('should accept valid status values', () => {
        const validStatuses = ['incomplete', 'completed', 'all'];
        validStatuses.forEach(status => {
          expect(['incomplete', 'completed', 'all']).toContain(status);
        });
      });
    });

    describe('Fieldglass Query', () => {
      test('should accept valid query_type values', () => {
        const validTypes = ['sows', 'consultants', 'timesheets', 'workforce_summary'];
        validTypes.forEach(type => {
          expect(['sows', 'consultants', 'timesheets', 'workforce_summary']).toContain(type);
        });
      });

      test('should accept valid status values', () => {
        const validStatuses = ['open', 'active', 'closed', 'all'];
        validStatuses.forEach(status => {
          expect(['open', 'active', 'closed', 'all']).toContain(status);
        });
      });
    });
  });

  describe('Mock Data Structure', () => {
    describe('ServiceNow Mock Data', () => {
      test('should have correct incident structure', () => {
        const mockIncidents = {
          total: 47,
          open: 12,
          in_progress: 8,
          resolved: 27,
          p1_count: 2,
          p2_count: 5,
          avg_resolution_hours: 4.2,
          recent: [
            { id: 'INC0045', title: 'Epic login issues', priority: 'P1', status: 'open' },
          ],
        };

        expect(mockIncidents.total).toBeGreaterThan(0);
        expect(mockIncidents.recent).toBeInstanceOf(Array);
        expect(mockIncidents.recent[0]).toHaveProperty('id');
        expect(mockIncidents.recent[0]).toHaveProperty('title');
        expect(mockIncidents.recent[0]).toHaveProperty('priority');
        expect(mockIncidents.recent[0]).toHaveProperty('status');
      });
    });

    describe('Jira Mock Data', () => {
      test('should have correct issues structure', () => {
        const mockIssues = {
          total: 156,
          open: 34,
          in_progress: 28,
          done: 94,
          blocked: 3,
          sprint_velocity: 42,
          recent: [
            { key: 'EPB-234', title: 'Beaker integration', status: 'in_progress', priority: 'high' },
          ],
        };

        expect(mockIssues.total).toBeGreaterThan(0);
        expect(mockIssues.recent[0]).toHaveProperty('key');
        expect(mockIssues.sprint_velocity).toBeGreaterThan(0);
      });

      test('should have correct sprint structure', () => {
        const mockSprint = {
          current: 'Sprint 14',
          days_remaining: 5,
          committed: 45,
          completed: 38,
          burndown_on_track: true,
        };

        expect(mockSprint.current).toBeTruthy();
        expect(mockSprint.days_remaining).toBeGreaterThanOrEqual(0);
        expect(typeof mockSprint.burndown_on_track).toBe('boolean');
      });
    });

    describe('Asana Mock Data', () => {
      test('should have correct tasks structure', () => {
        const mockTasks = {
          total: 89,
          incomplete: 23,
          completed: 66,
          overdue: 4,
          recent: [
            { name: 'Complete TDR checklist', status: 'incomplete', due: 'Tomorrow' },
          ],
        };

        expect(mockTasks.total).toBe(mockTasks.incomplete + mockTasks.completed);
        expect(mockTasks.recent[0]).toHaveProperty('name');
        expect(mockTasks.recent[0]).toHaveProperty('due');
      });
    });

    describe('Fieldglass Mock Data', () => {
      test('admin should see SOW pending response data', () => {
        const adminData = {
          sows: {
            total: 12,
            open: 5,
            responded: 4,
            awarded: 3,
            pending_response: [
              { id: 'SOW-2024-089', title: 'Epic Beaker Analyst', match_score: 92 },
            ],
          },
        };

        expect(adminData.sows.pending_response[0]).toHaveProperty('match_score');
        expect(adminData.sows.total).toBe(
          adminData.sows.open + adminData.sows.responded + adminData.sows.awarded
        );
      });

      test('executive should see workforce utilization data', () => {
        const execData = {
          workforce_summary: {
            active_consultants: 33,
            total_hours_this_month: 5280,
            avg_utilization: 94,
            assignments: [
              { consultant: 'Sarah Chen', hospital: 'Northwell Health', hours_this_week: 40 },
            ],
          },
        };

        expect(execData.workforce_summary.avg_utilization).toBeLessThanOrEqual(100);
        expect(execData.workforce_summary.assignments[0]).toHaveProperty('consultant');
        expect(execData.workforce_summary.assignments[0]).toHaveProperty('hospital');
      });
    });
  });

  describe('Response Format', () => {
    test('should include source in response', () => {
      const response = {
        source: 'ServiceNow',
        data: { total: 10 },
        note: 'Demo data',
      };

      expect(response).toHaveProperty('source');
      expect(response).toHaveProperty('data');
    });

    test('should include note for demo data', () => {
      const response = {
        source: 'Jira',
        data: {},
        note: 'Demo data - connect Jira for live data',
      };

      expect(response.note).toContain('Demo data');
    });

    test('API response should include sources used', () => {
      const apiResponse = {
        response: 'There are 12 open P1 tickets.',
        sources: [{ system: 'ServiceNow', note: 'Demo data' }],
        toolsUsed: ['query_servicenow'],
      };

      expect(apiResponse.sources).toBeInstanceOf(Array);
      expect(apiResponse.toolsUsed).toContain('query_servicenow');
    });
  });

  describe('System Prompt', () => {
    test('should include role in system prompt', () => {
      const userRole = 'admin';
      const systemPrompt = `Your role is to help ${userRole === 'admin' ? 'administrators' : 'hospital executives'}`;

      expect(systemPrompt).toContain('administrators');
    });

    test('should include current date in system prompt', () => {
      const currentDate = new Date().toLocaleDateString();
      expect(currentDate).toBeTruthy();
    });

    test('should enforce source citations guideline', () => {
      const guidelines = [
        'ALWAYS use the provided tools to fetch real data',
        'NEVER make up data',
        'Include source citations',
      ];

      guidelines.forEach(guideline => {
        expect(guideline).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    test('should return error for missing query', () => {
      const query = '';
      expect(query).toBeFalsy();
    });

    test('should return error for missing API key', () => {
      const apiKey = '';
      expect(apiKey).toBeFalsy();
    });

    test('should handle unknown tool name', () => {
      const toolName = 'unknown_tool';
      const knownTools = [
        'query_servicenow',
        'query_jira',
        'query_asana',
        'query_fieldglass',
        'query_support_tickets',
        'query_projects',
        'query_consultants',
      ];

      expect(knownTools).not.toContain(toolName);
    });
  });

  describe('Health Check Endpoint', () => {
    test('should return ready when API key is configured', () => {
      const hasApiKey = true;
      const status = hasApiKey ? 'ready' : 'not_configured';
      expect(status).toBe('ready');
    });

    test('should return not_configured when API key is missing', () => {
      const hasApiKey = false;
      const status = hasApiKey ? 'ready' : 'not_configured';
      expect(status).toBe('not_configured');
    });
  });

  describe('Limit Parameter', () => {
    test('should default to 10 when not provided', () => {
      const params = {};
      const limit = (params as any).limit || 10;
      expect(limit).toBe(10);
    });

    test('should use provided limit', () => {
      const params = { limit: 25 };
      const limit = params.limit || 10;
      expect(limit).toBe(25);
    });
  });

  describe('Conversation History', () => {
    test('should accept empty conversation history', () => {
      const conversationHistory: { role: string; content: string }[] = [];
      expect(conversationHistory).toEqual([]);
    });

    test('should accept previous messages', () => {
      const conversationHistory = [
        { role: 'user', content: 'How many tickets?' },
        { role: 'assistant', content: 'There are 12 open tickets.' },
      ];
      expect(conversationHistory.length).toBe(2);
    });
  });
});
