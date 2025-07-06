import { NextRequest, NextResponse } from "next/server";

interface LeadCaptureRule {
  id: string;
  name: string;
  trigger:
    | "form_submit"
    | "journey_complete"
    | "roi_calculated"
    | "demo_requested"
    | "waitlist_signup";
  action: "crm_create" | "email_send" | "webhook_call" | "database_store";
  config: Record<string, any>;
  enabled: boolean;
  lastTriggered?: Date;
  successCount: number;
  errorCount: number;
  conditions?: {
    field: string;
    operator: "equals" | "contains" | "greater_than" | "less_than";
    value: any;
  }[];
}

interface LeadCaptureEvent {
  id: string;
  ruleId: string;
  trigger: string;
  leadData: Record<string, any>;
  timestamp: Date;
  status: "pending" | "processed" | "failed";
  result?: any;
  error?: string;
}

// Mock lead capture rules
const mockLeadRules: LeadCaptureRule[] = [
  {
    id: "journey-complete",
    name: "Journey Completion Lead",
    trigger: "journey_complete",
    action: "crm_create",
    config: {
      crm: "hubspot",
      pipeline: "marketing-qualified",
      leadSource: "premium-journey-demo",
      assignTo: "sales-team-lead",
    },
    enabled: true,
    lastTriggered: new Date(Date.now() - 1800000),
    successCount: 156,
    errorCount: 2,
    conditions: [
      { field: "journeyStage", operator: "equals", value: "action" },
      { field: "roiCalculated", operator: "greater_than", value: 0 },
    ],
  },
  {
    id: "roi-calculation",
    name: "ROI Calculator Lead",
    trigger: "roi_calculated",
    action: "email_send",
    config: {
      template: "roi-follow-up",
      delay: 300,
      sender: "growth@yourcompany.com",
      subject: "Your ROI Calculation Results",
    },
    enabled: true,
    lastTriggered: new Date(Date.now() - 900000),
    successCount: 89,
    errorCount: 1,
    conditions: [
      { field: "roiAmount", operator: "greater_than", value: 10000 },
    ],
  },
  {
    id: "demo-request",
    name: "Demo Request Lead",
    trigger: "demo_requested",
    action: "webhook_call",
    config: {
      url: "https://hooks.zapier.com/demo-request",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    },
    enabled: true,
    lastTriggered: new Date(Date.now() - 300000),
    successCount: 34,
    errorCount: 0,
  },
  {
    id: "high-value-lead",
    name: "High Value Lead Capture",
    trigger: "roi_calculated",
    action: "database_store",
    config: {
      table: "high_value_leads",
      priorityLevel: "high",
      notifySlack: true,
      slackChannel: "#sales-alerts",
    },
    enabled: true,
    lastTriggered: new Date(Date.now() - 600000),
    successCount: 23,
    errorCount: 0,
    conditions: [
      { field: "roiAmount", operator: "greater_than", value: 50000 },
      { field: "company", operator: "contains", value: "" },
    ],
  },
  {
    id: "waitlist-signup",
    name: "Waitlist Signup Lead",
    trigger: "waitlist_signup",
    action: "email_send",
    config: {
      template: "waitlist-confirmation",
      delay: 60,
      sender: "hello@marketingmachine.com",
      subject: "Welcome to the MarketingMachine Waitlist!",
      adminNotification: true,
      adminEmail: "admin@marketingmachine.com",
    },
    enabled: true,
    lastTriggered: new Date(Date.now() - 1200000),
    successCount: 247,
    errorCount: 3,
    conditions: [
      { field: "email", operator: "contains", value: "@" },
      { field: "product", operator: "contains", value: "" },
    ],
  },
];

// Mock recent events
const mockEvents: LeadCaptureEvent[] = [
  {
    id: "event_1",
    ruleId: "journey-complete",
    trigger: "journey_complete",
    leadData: {
      email: "john.doe@techcorp.com",
      name: "John Doe",
      company: "TechCorp",
      journeyStage: "action",
      roiCalculated: 25000,
    },
    timestamp: new Date(Date.now() - 300000),
    status: "processed",
    result: { leadId: "lead_12345", crmId: "hubspot" },
  },
  {
    id: "event_2",
    ruleId: "roi-calculation",
    trigger: "roi_calculated",
    leadData: {
      email: "sarah.smith@growthco.com",
      name: "Sarah Smith",
      roiAmount: 45000,
    },
    timestamp: new Date(Date.now() - 600000),
    status: "processed",
    result: { emailSent: true, messageId: "msg_67890" },
  },
  {
    id: "event_3",
    ruleId: "demo-request",
    trigger: "demo_requested",
    leadData: {
      email: "mike.johnson@startup.io",
      name: "Mike Johnson",
      company: "Startup.io",
      requestedTime: "2024-01-15T14:00:00Z",
    },
    timestamp: new Date(Date.now() - 900000),
    status: "failed",
    error: "Webhook timeout",
  },
];

// GET - Get lead capture rules and events
export async function GET() {
  return NextResponse.json({
    message: "Lead Capture API",
    endpoints: {
      "GET /api/integration/leads": "Get lead capture rules and events",
      "POST /api/integration/leads": "Trigger lead capture or create rule",
      "PUT /api/integration/leads": "Update lead capture rule",
      "DELETE /api/integration/leads": "Delete lead capture rule",
    },
  });
}

// POST - Trigger lead capture or create new rule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, trigger, leadData, ruleId, newRule } = body;

    if (action === "trigger_capture") {
      return await triggerLeadCapture(trigger, leadData);
    }

    if (action === "create_rule" && newRule) {
      return await createLeadRule(newRule);
    }

    if (action === "test_rule" && ruleId) {
      return await testLeadRule(ruleId, leadData);
    }

    return NextResponse.json(
      { success: false, error: "Invalid action or missing parameters" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Lead capture POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT - Update lead capture rule
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { ruleId, updates } = body;

    const rule = mockLeadRules.find(r => r.id === ruleId);
    if (!rule) {
      return NextResponse.json(
        { success: false, error: "Lead capture rule not found" },
        { status: 404 }
      );
    }

    // Update rule properties
    Object.assign(rule, updates);

    return NextResponse.json({
      success: true,
      message: "Lead capture rule updated successfully",
      rule,
    });
  } catch (error) {
    console.error("Lead capture PUT error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete lead capture rule
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get("ruleId");

    if (!ruleId) {
      return NextResponse.json(
        { success: false, error: "Rule ID is required" },
        { status: 400 }
      );
    }

    const ruleIndex = mockLeadRules.findIndex(r => r.id === ruleId);
    if (ruleIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Lead capture rule not found" },
        { status: 404 }
      );
    }

    mockLeadRules.splice(ruleIndex, 1);

    return NextResponse.json({
      success: true,
      message: "Lead capture rule deleted successfully",
    });
  } catch (error) {
    console.error("Lead capture DELETE error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper functions
async function triggerLeadCapture(trigger: string, leadData: any) {
  const applicableRules = mockLeadRules.filter(
    rule => rule.enabled && rule.trigger === trigger
  );

  if (applicableRules.length === 0) {
    return NextResponse.json({
      success: false,
      message: "No active rules found for this trigger",
      trigger,
    });
  }

  const results = [];

  for (const rule of applicableRules) {
    try {
      // Check conditions
      if (rule.conditions && !evaluateConditions(rule.conditions, leadData)) {
        continue;
      }

      const result = await executeLeadAction(rule, leadData);

      if (result.success) {
        rule.successCount += 1;
        rule.lastTriggered = new Date();
      } else {
        rule.errorCount += 1;
      }

      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        ...result,
      });

      // Create event record
      mockEvents.unshift({
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ruleId: rule.id,
        trigger,
        leadData,
        timestamp: new Date(),
        status: result.success ? "processed" : "failed",
        result: result.success ? result.data : undefined,
        error: result.success ? undefined : result.error,
      });
    } catch (error) {
      rule.errorCount += 1;
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    success: true,
    message: "Lead capture triggered",
    trigger,
    rulesProcessed: results.length,
    results,
  });
}

async function executeLeadAction(rule: LeadCaptureRule, leadData: any) {
  const { action, config } = rule;

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 200));

  switch (action) {
    case "crm_create":
      return await createCRMLead(config, leadData);
    case "email_send":
      return await sendEmail(config, leadData);
    case "webhook_call":
      return await callWebhook(config, leadData);
    case "database_store":
      return await storeInDatabase(config, leadData);
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

async function createCRMLead(config: any, leadData: any) {
  // Simulate CRM API call
  const success = Math.random() > 0.1; // 90% success rate

  if (success) {
    return {
      success: true,
      data: {
        leadId: `lead_${Date.now()}`,
        crm: config.crm,
        pipeline: config.pipeline,
      },
    };
  } else {
    return {
      success: false,
      error: "CRM API error or validation failed",
    };
  }
}

async function sendEmail(config: any, leadData: any) {
  // Simulate email service call
  const success = Math.random() > 0.05; // 95% success rate

  if (success) {
    return {
      success: true,
      data: {
        messageId: `msg_${Date.now()}`,
        template: config.template,
        recipient: leadData.email,
      },
    };
  } else {
    return {
      success: false,
      error: "Email service error or invalid recipient",
    };
  }
}

async function callWebhook(config: any, leadData: any) {
  // Simulate webhook call
  const success = Math.random() > 0.2; // 80% success rate

  if (success) {
    return {
      success: true,
      data: {
        webhookUrl: config.url,
        responseStatus: 200,
        responseTime: Math.random() * 500 + 100,
      },
    };
  } else {
    return {
      success: false,
      error: "Webhook timeout or server error",
    };
  }
}

async function storeInDatabase(config: any, leadData: any) {
  // Simulate database storage
  const success = Math.random() > 0.02; // 98% success rate

  if (success) {
    return {
      success: true,
      data: {
        recordId: `record_${Date.now()}`,
        table: config.table,
        priority: config.priorityLevel,
      },
    };
  } else {
    return {
      success: false,
      error: "Database connection error",
    };
  }
}

async function createLeadRule(newRule: Partial<LeadCaptureRule>) {
  const rule: LeadCaptureRule = {
    id: `rule_${Date.now()}`,
    name: newRule.name || "Untitled Rule",
    trigger: newRule.trigger || "form_submit",
    action: newRule.action || "database_store",
    config: newRule.config || {},
    enabled: newRule.enabled ?? true,
    successCount: 0,
    errorCount: 0,
    conditions: newRule.conditions || [],
  };

  mockLeadRules.push(rule);

  return NextResponse.json({
    success: true,
    message: "Lead capture rule created successfully",
    rule,
  });
}

async function testLeadRule(ruleId: string, testData: any) {
  const rule = mockLeadRules.find(r => r.id === ruleId);
  if (!rule) {
    return NextResponse.json(
      { success: false, error: "Rule not found" },
      { status: 404 }
    );
  }

  try {
    const result = await executeLeadAction(rule, testData);

    return NextResponse.json({
      success: true,
      message: "Rule test completed",
      ruleId,
      testResult: result,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Test failed",
      ruleId,
    });
  }
}

function evaluateConditions(conditions: any[], leadData: any): boolean {
  return conditions.every(condition => {
    const { field, operator, value } = condition;
    const fieldValue = leadData[field];

    switch (operator) {
      case "equals":
        return fieldValue === value;
      case "contains":
        return typeof fieldValue === "string" && fieldValue.includes(value);
      case "greater_than":
        return typeof fieldValue === "number" && fieldValue > value;
      case "less_than":
        return typeof fieldValue === "number" && fieldValue < value;
      default:
        return false;
    }
  });
}
