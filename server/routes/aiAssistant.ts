import { Router, Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "../db";
import {
  integrationSources, integrationRecords, supportTickets, projects,
  consultants, hospitals
} from "../../shared/schema";
import { eq, desc, and, or, ilike, sql, count, gte, lte } from "drizzle-orm";

const router = Router();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// ============================================================================
// TOOL DEFINITIONS - Functions the AI can call
// ============================================================================

const tools: Anthropic.Tool[] = [
  {
    name: "query_servicenow",
    description: "Query ServiceNow data including incidents, changes, and tasks. Use this when the user asks about IT tickets, incidents, service requests, or change management.",
    input_schema: {
      type: "object" as const,
      properties: {
        query_type: {
          type: "string",
          enum: ["incidents", "changes", "tasks", "summary"],
          description: "Type of ServiceNow data to query"
        },
        status: {
          type: "string",
          enum: ["open", "in_progress", "resolved", "closed", "all"],
          description: "Filter by status"
        },
        priority: {
          type: "string",
          enum: ["P1", "P2", "P3", "P4", "all"],
          description: "Filter by priority level"
        },
        limit: {
          type: "number",
          description: "Maximum number of results to return"
        }
      },
      required: ["query_type"]
    }
  },
  {
    name: "query_jira",
    description: "Query Jira data including issues, sprints, and projects. Use this when the user asks about development tasks, bugs, sprints, or project progress.",
    input_schema: {
      type: "object" as const,
      properties: {
        query_type: {
          type: "string",
          enum: ["issues", "sprints", "projects", "summary"],
          description: "Type of Jira data to query"
        },
        status: {
          type: "string",
          enum: ["open", "in_progress", "done", "blocked", "all"],
          description: "Filter by status"
        },
        priority: {
          type: "string",
          enum: ["highest", "high", "medium", "low", "lowest", "all"],
          description: "Filter by priority"
        },
        project_key: {
          type: "string",
          description: "Filter by Jira project key"
        },
        limit: {
          type: "number",
          description: "Maximum number of results"
        }
      },
      required: ["query_type"]
    }
  },
  {
    name: "query_asana",
    description: "Query Asana data including tasks, projects, and workspaces. Use this when the user asks about project tasks, assignments, or team workload.",
    input_schema: {
      type: "object" as const,
      properties: {
        query_type: {
          type: "string",
          enum: ["tasks", "projects", "summary"],
          description: "Type of Asana data to query"
        },
        status: {
          type: "string",
          enum: ["incomplete", "completed", "all"],
          description: "Filter by completion status"
        },
        assignee: {
          type: "string",
          description: "Filter by assignee name"
        },
        limit: {
          type: "number",
          description: "Maximum number of results"
        }
      },
      required: ["query_type"]
    }
  },
  {
    name: "query_fieldglass",
    description: "Query SAP Fieldglass data including SOWs, consultants, and workforce data. Use this for VMS queries about contractors, timesheets, or statements of work.",
    input_schema: {
      type: "object" as const,
      properties: {
        query_type: {
          type: "string",
          enum: ["sows", "consultants", "timesheets", "workforce_summary"],
          description: "Type of Fieldglass data to query"
        },
        status: {
          type: "string",
          enum: ["open", "active", "closed", "all"],
          description: "Filter by status"
        },
        include_matching: {
          type: "boolean",
          description: "Include consultant matching scores (admin only)"
        },
        limit: {
          type: "number",
          description: "Maximum number of results"
        }
      },
      required: ["query_type"]
    }
  },
  {
    name: "query_support_tickets",
    description: "Query NiceHR support tickets. Use this when the user asks about internal support requests, ticket status, or support metrics.",
    input_schema: {
      type: "object" as const,
      properties: {
        status: {
          type: "string",
          enum: ["open", "in_progress", "resolved", "closed", "all"],
          description: "Filter by ticket status"
        },
        priority: {
          type: "string",
          enum: ["critical", "high", "medium", "low", "all"],
          description: "Filter by priority"
        },
        assignee: {
          type: "string",
          description: "Filter by assignee name"
        },
        limit: {
          type: "number",
          description: "Maximum number of results"
        }
      },
      required: []
    }
  },
  {
    name: "query_projects",
    description: "Query NiceHR projects. Use this when the user asks about implementation projects, go-live status, or project metrics.",
    input_schema: {
      type: "object" as const,
      properties: {
        status: {
          type: "string",
          enum: ["planning", "active", "on_hold", "completed", "all"],
          description: "Filter by project status"
        },
        hospital_id: {
          type: "number",
          description: "Filter by hospital ID"
        },
        limit: {
          type: "number",
          description: "Maximum number of results"
        }
      },
      required: []
    }
  },
  {
    name: "query_consultants",
    description: "Query consultant information. Use this when the user asks about consultant availability, skills, or assignments.",
    input_schema: {
      type: "object" as const,
      properties: {
        status: {
          type: "string",
          enum: ["available", "assigned", "on_leave", "all"],
          description: "Filter by availability status"
        },
        skill: {
          type: "string",
          description: "Filter by skill or EHR system expertise"
        },
        limit: {
          type: "number",
          description: "Maximum number of results"
        }
      },
      required: []
    }
  }
];

// ============================================================================
// TOOL HANDLERS - Execute the actual queries
// ============================================================================

async function executeQueryServiceNow(params: any, userRole: string): Promise<string> {
  const { query_type, status, priority, limit = 10 } = params;

  // Query integration records for ServiceNow
  const records = await db
    .select()
    .from(integrationRecords)
    .innerJoin(integrationSources, eq(integrationRecords.sourceId, integrationSources.id))
    .where(eq(integrationSources.systemType, "servicenow"))
    .orderBy(desc(integrationRecords.createdAt))
    .limit(limit);

  if (records.length === 0) {
    // Return mock data for demo
    const mockData = {
      incidents: {
        total: 47,
        open: 12,
        in_progress: 8,
        resolved: 27,
        p1_count: 2,
        p2_count: 5,
        avg_resolution_hours: 4.2,
        recent: [
          { id: "INC0045", title: "Epic login issues", priority: "P1", status: "open", created: "2 hours ago" },
          { id: "INC0044", title: "Interface sync failure", priority: "P2", status: "in_progress", created: "5 hours ago" },
          { id: "INC0043", title: "Report generation slow", priority: "P3", status: "resolved", created: "1 day ago" }
        ]
      }
    };

    return JSON.stringify({
      source: "ServiceNow",
      data: mockData[query_type as keyof typeof mockData] || mockData.incidents,
      note: "Demo data - connect ServiceNow for live data"
    });
  }

  return JSON.stringify({
    source: "ServiceNow",
    data: records.map(r => r.integration_records),
    count: records.length
  });
}

async function executeQueryJira(params: any, userRole: string): Promise<string> {
  const { query_type, status, priority, project_key, limit = 10 } = params;

  const records = await db
    .select()
    .from(integrationRecords)
    .innerJoin(integrationSources, eq(integrationRecords.sourceId, integrationSources.id))
    .where(eq(integrationSources.systemType, "jira"))
    .orderBy(desc(integrationRecords.createdAt))
    .limit(limit);

  if (records.length === 0) {
    const mockData = {
      issues: {
        total: 156,
        open: 34,
        in_progress: 28,
        done: 94,
        blocked: 3,
        sprint_velocity: 42,
        recent: [
          { key: "EPB-234", title: "Beaker integration testing", status: "in_progress", priority: "high", assignee: "Sarah Chen" },
          { key: "EPB-233", title: "HL7 message parsing fix", status: "open", priority: "highest", assignee: "Marcus Williams" },
          { key: "EPB-232", title: "Training module updates", status: "done", priority: "medium", assignee: "Alex Johnson" }
        ]
      },
      sprints: {
        current: "Sprint 14",
        days_remaining: 5,
        committed: 45,
        completed: 38,
        burndown_on_track: true
      }
    };

    return JSON.stringify({
      source: "Jira",
      data: mockData[query_type as keyof typeof mockData] || mockData.issues,
      note: "Demo data - connect Jira for live data"
    });
  }

  return JSON.stringify({
    source: "Jira",
    data: records.map(r => r.integration_records),
    count: records.length
  });
}

async function executeQueryAsana(params: any, userRole: string): Promise<string> {
  const { query_type, status, assignee, limit = 10 } = params;

  const records = await db
    .select()
    .from(integrationRecords)
    .innerJoin(integrationSources, eq(integrationRecords.sourceId, integrationSources.id))
    .where(eq(integrationSources.systemType, "asana"))
    .orderBy(desc(integrationRecords.createdAt))
    .limit(limit);

  if (records.length === 0) {
    const mockData = {
      tasks: {
        total: 89,
        incomplete: 23,
        completed: 66,
        overdue: 4,
        recent: [
          { name: "Complete TDR checklist", status: "incomplete", due: "Tomorrow", assignee: "Project Team" },
          { name: "Finalize training schedule", status: "incomplete", due: "Mar 10", assignee: "Training Lead" },
          { name: "UAT sign-off documentation", status: "completed", due: "Mar 5", assignee: "QA Team" }
        ]
      },
      projects: {
        active: 8,
        on_track: 6,
        at_risk: 2
      }
    };

    return JSON.stringify({
      source: "Asana",
      data: mockData[query_type as keyof typeof mockData] || mockData.tasks,
      note: "Demo data - connect Asana for live data"
    });
  }

  return JSON.stringify({
    source: "Asana",
    data: records.map(r => r.integration_records),
    count: records.length
  });
}

async function executeQueryFieldglass(params: any, userRole: string): Promise<string> {
  const { query_type, status, include_matching, limit = 10 } = params;

  // Role-aware response
  const isAdmin = userRole === "admin";

  const records = await db
    .select()
    .from(integrationRecords)
    .innerJoin(integrationSources, eq(integrationRecords.sourceId, integrationSources.id))
    .where(eq(integrationSources.systemType, "fieldglass"))
    .orderBy(desc(integrationRecords.createdAt))
    .limit(limit);

  if (records.length === 0) {
    // Admin sees SOW management data
    if (isAdmin) {
      const adminData = {
        sows: {
          total: 12,
          open: 5,
          responded: 4,
          awarded: 3,
          pending_response: [
            { id: "SOW-2024-089", title: "Epic Beaker Analyst", hospital: "Northwell Health", match_score: 92, deadline: "Mar 15" },
            { id: "SOW-2024-088", title: "Cerner Integration Specialist", hospital: "Kaiser", match_score: 87, deadline: "Mar 18" }
          ]
        },
        consultants: {
          total: 45,
          available: 12,
          on_assignment: 33,
          top_matches: include_matching ? [
            { name: "Sarah Chen", skills: ["Epic Beaker", "HL7"], match_score: 95 },
            { name: "Marcus Williams", skills: ["Epic Radiant", "Integration"], match_score: 91 }
          ] : undefined
        }
      };

      return JSON.stringify({
        source: "SAP Fieldglass",
        data: adminData[query_type as keyof typeof adminData] || adminData.sows,
        note: "Demo data - provide Fieldglass credentials for live data"
      });
    } else {
      // Executive sees workforce overview
      const execData = {
        workforce_summary: {
          active_consultants: 33,
          total_hours_this_month: 5280,
          avg_utilization: 94,
          assignments: [
            { consultant: "Sarah Chen", hospital: "Northwell Health", role: "Epic Beaker Analyst", hours_this_week: 40 },
            { consultant: "Marcus Williams", hospital: "Kaiser", role: "Integration Specialist", hours_this_week: 38 },
            { consultant: "Alex Johnson", hospital: "Cleveland Clinic", role: "Training Lead", hours_this_week: 42 }
          ]
        },
        timesheets: {
          submitted: 45,
          approved: 42,
          pending: 3,
          total_hours: 1760
        }
      };

      return JSON.stringify({
        source: "SAP Fieldglass",
        data: execData[query_type as keyof typeof execData] || execData.workforce_summary,
        note: "Demo data - provide Fieldglass credentials for live data"
      });
    }
  }

  return JSON.stringify({
    source: "SAP Fieldglass",
    data: records.map(r => r.integration_records),
    count: records.length
  });
}

async function executeQuerySupportTickets(params: any, userRole: string): Promise<string> {
  const { status, priority, assignee, limit = 10 } = params;

  const conditions = [];
  if (status && status !== "all") {
    conditions.push(eq(supportTickets.status, status));
  }
  if (priority && priority !== "all") {
    conditions.push(eq(supportTickets.priority, priority));
  }

  const tickets = await db
    .select()
    .from(supportTickets)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(supportTickets.createdAt))
    .limit(limit);

  const [stats] = await db
    .select({
      total: count(),
      open: sql<number>`SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END)`,
      in_progress: sql<number>`SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END)`,
      resolved: sql<number>`SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END)`
    })
    .from(supportTickets);

  return JSON.stringify({
    source: "NiceHR Support Tickets",
    data: {
      stats: stats,
      recent: tickets.slice(0, 5).map(t => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        created: t.createdAt
      }))
    },
    count: tickets.length
  });
}

async function executeQueryProjects(params: any, userRole: string): Promise<string> {
  const { status, hospital_id, limit = 10 } = params;

  const conditions = [];
  if (status && status !== "all") {
    conditions.push(eq(projects.status, status));
  }
  if (hospital_id) {
    conditions.push(eq(projects.hospitalId, hospital_id));
  }

  const projectList = await db
    .select()
    .from(projects)
    .leftJoin(hospitals, eq(projects.hospitalId, hospitals.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(projects.createdAt))
    .limit(limit);

  const [stats] = await db
    .select({
      total: count(),
      active: sql<number>`SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)`,
      completed: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`
    })
    .from(projects);

  return JSON.stringify({
    source: "NiceHR Projects",
    data: {
      stats: stats,
      projects: projectList.slice(0, 5).map(p => ({
        id: p.projects.id,
        name: p.projects.name,
        hospital: p.hospitals?.name,
        status: p.projects.status,
        phase: p.projects.currentPhase
      }))
    },
    count: projectList.length
  });
}

async function executeQueryConsultants(params: any, userRole: string): Promise<string> {
  const { status, skill, limit = 10 } = params;

  const consultantList = await db
    .select()
    .from(consultants)
    .orderBy(desc(consultants.createdAt))
    .limit(limit);

  const [stats] = await db
    .select({
      total: count(),
      available: sql<number>`SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END)`,
      on_assignment: sql<number>`SUM(CASE WHEN status = 'on_assignment' THEN 1 ELSE 0 END)`
    })
    .from(consultants);

  return JSON.stringify({
    source: "NiceHR Consultants",
    data: {
      stats: stats,
      consultants: consultantList.slice(0, 5).map(c => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        title: c.title,
        status: c.status,
        skills: c.ehrSystems
      }))
    },
    count: consultantList.length
  });
}

// Tool execution dispatcher
async function executeTool(toolName: string, params: any, userRole: string): Promise<string> {
  switch (toolName) {
    case "query_servicenow":
      return executeQueryServiceNow(params, userRole);
    case "query_jira":
      return executeQueryJira(params, userRole);
    case "query_asana":
      return executeQueryAsana(params, userRole);
    case "query_fieldglass":
      return executeQueryFieldglass(params, userRole);
    case "query_support_tickets":
      return executeQuerySupportTickets(params, userRole);
    case "query_projects":
      return executeQueryProjects(params, userRole);
    case "query_consultants":
      return executeQueryConsultants(params, userRole);
    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// POST /api/ai/query - Main AI query endpoint
router.post("/ai/query", async (req: Request, res: Response) => {
  try {
    const { query, conversationHistory = [] } = req.body;
    const user = (req as any).user;
    const userRole = user?.role || "hospital_leadership";

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({
        error: "AI service not configured",
        message: "Please configure ANTHROPIC_API_KEY in environment variables"
      });
    }

    // Build system prompt with role context
    const systemPrompt = `You are the TNG AI Assistant, an intelligent helper for NiceHR - an EHR Implementation Consulting Management Platform.

Your role is to help ${userRole === 'admin' ? 'administrators' : 'hospital executives'} query data from integrated systems and provide actionable insights.

Key guidelines:
1. ALWAYS use the provided tools to fetch real data before answering
2. NEVER make up data - only report what the tools return
3. If data is unavailable, clearly state "I don't have access to that data"
4. Include source citations in your responses (e.g., "[Source: ServiceNow]")
5. Be concise but thorough
6. For ${userRole === 'admin' ? 'administrators, you can show SOW details, matching scores, and configuration data' : 'executives, focus on high-level metrics, workforce summaries, and project status'}

Current user role: ${userRole}
Current date: ${new Date().toLocaleDateString()}`;

    // Build messages
    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory,
      { role: "user", content: query }
    ];

    // Initial API call with tools
    let response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      tools: tools,
      messages: messages
    });

    // Handle tool calls in a loop
    const toolResults: any[] = [];
    let finalResponse = response;

    while (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
      );

      const toolResultContents: Anthropic.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        const result = await executeTool(toolUse.name, toolUse.input, userRole);
        toolResults.push({
          tool: toolUse.name,
          input: toolUse.input,
          result: JSON.parse(result)
        });

        toolResultContents.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: result
        });
      }

      // Continue conversation with tool results
      response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        tools: tools,
        messages: [
          ...messages,
          { role: "assistant", content: response.content },
          { role: "user", content: toolResultContents }
        ]
      });

      finalResponse = response;
    }

    // Extract text response
    const textBlocks = finalResponse.content.filter(
      (block): block is Anthropic.TextBlock => block.type === "text"
    );
    const responseText = textBlocks.map(b => b.text).join("\n");

    // Log the query for audit
    console.log(`[AI Assistant] User: ${user?.email || 'unknown'}, Role: ${userRole}, Query: "${query.substring(0, 100)}..."`);

    res.json({
      response: responseText,
      sources: toolResults.map(t => ({
        system: t.result.source,
        note: t.result.note
      })),
      toolsUsed: toolResults.map(t => t.tool)
    });

  } catch (error: any) {
    console.error("[AI Assistant] Error:", error);
    res.status(500).json({
      error: "Failed to process query",
      message: error.message
    });
  }
});

// GET /api/ai/health - Check AI service status
router.get("/ai/health", async (req: Request, res: Response) => {
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
  res.json({
    status: hasApiKey ? "ready" : "not_configured",
    message: hasApiKey ? "AI Assistant is ready" : "ANTHROPIC_API_KEY not configured"
  });
});

export default router;
