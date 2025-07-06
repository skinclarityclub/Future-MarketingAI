import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/error-handling/error-config";

interface AlertRule {
  id: string;
  name: string;
  category: string;
  threshold: number;
  enabled: boolean;
  escalationLevel: number;
  recipients: string[];
  createdAt: string;
  lastTriggered?: string;
}

interface EscalationStep {
  level: number;
  delay: number;
  channels: string[];
  recipients: string[];
  description: string;
}

// Mock data storage - in production, this would be in a database
const alertRules: AlertRule[] = [
  {
    id: "1",
    name: "High Error Rate",
    category: "API_ERROR",
    threshold: 50,
    enabled: true,
    escalationLevel: 1,
    recipients: ["admin@example.com", "ops-team@example.com"],
    createdAt: new Date().toISOString(),
    lastTriggered: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  },
  {
    id: "2",
    name: "Critical System Errors",
    category: "SYSTEM_ERROR",
    threshold: 1,
    enabled: true,
    escalationLevel: 3,
    recipients: ["admin@example.com", "dev-team@example.com"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Database Connection Failures",
    category: "DATABASE_ERROR",
    threshold: 5,
    enabled: true,
    escalationLevel: 2,
    recipients: ["dba@example.com", "ops-team@example.com"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Validation Errors Spike",
    category: "VALIDATION_ERROR",
    threshold: 100,
    enabled: false,
    escalationLevel: 1,
    recipients: ["dev-team@example.com"],
    createdAt: new Date().toISOString(),
  },
];

const escalationSteps: EscalationStep[] = [
  {
    level: 1,
    delay: 0,
    channels: ["email"],
    recipients: ["ops-team@example.com"],
    description: "Immediate notification to operations team",
  },
  {
    level: 2,
    delay: 15,
    channels: ["email", "slack"],
    recipients: ["team-lead@example.com"],
    description: "Escalate to team lead after 15 minutes",
  },
  {
    level: 3,
    delay: 30,
    channels: ["email", "slack", "phone"],
    recipients: ["admin@example.com"],
    description: "Emergency escalation to admin after 30 minutes",
  },
];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    if (action === "escalation") {
      return NextResponse.json({ escalation: escalationSteps });
    }

    return NextResponse.json({
      rules: alertRules,
      escalation: escalationSteps,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logError(error as Error, "alert-rules-api", "API_ERROR");
    return NextResponse.json(
      {
        error: "Failed to fetch alert rules",
        rules: [],
        escalation: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ruleId, ruleData } = body;

    switch (action) {
      case "toggle":
        if (!ruleId) {
          return NextResponse.json(
            { error: "Rule ID is required" },
            { status: 400 }
          );
        }

        const ruleIndex = alertRules.findIndex(rule => rule.id === ruleId);
        if (ruleIndex === -1) {
          return NextResponse.json(
            { error: "Rule not found" },
            { status: 404 }
          );
        }

        alertRules[ruleIndex].enabled = !alertRules[ruleIndex].enabled;

        logError(
          new Error(
            `Alert rule ${alertRules[ruleIndex].name} ${alertRules[ruleIndex].enabled ? "enabled" : "disabled"}`
          ),
          "alert-rules-api",
          "SYSTEM_INFO"
        );

        return NextResponse.json({
          success: true,
          rule: alertRules[ruleIndex],
          message: `Rule ${alertRules[ruleIndex].enabled ? "enabled" : "disabled"}`,
        });

      case "create":
        if (!ruleData) {
          return NextResponse.json(
            { error: "Rule data is required" },
            { status: 400 }
          );
        }

        const newRule: AlertRule = {
          id: (alertRules.length + 1).toString(),
          name: ruleData.name,
          category: ruleData.category,
          threshold: ruleData.threshold,
          enabled: ruleData.enabled ?? true,
          escalationLevel: ruleData.escalationLevel ?? 1,
          recipients: ruleData.recipients || [],
          createdAt: new Date().toISOString(),
        };

        alertRules.push(newRule);

        logError(
          new Error(`New alert rule created: ${newRule.name}`),
          "alert-rules-api",
          "SYSTEM_INFO"
        );

        return NextResponse.json({
          success: true,
          rule: newRule,
          message: "Rule created successfully",
        });

      case "update":
        if (!ruleId || !ruleData) {
          return NextResponse.json(
            { error: "Rule ID and data are required" },
            { status: 400 }
          );
        }

        const updateIndex = alertRules.findIndex(rule => rule.id === ruleId);
        if (updateIndex === -1) {
          return NextResponse.json(
            { error: "Rule not found" },
            { status: 404 }
          );
        }

        alertRules[updateIndex] = {
          ...alertRules[updateIndex],
          ...ruleData,
          id: ruleId, // Ensure ID doesn't change
        };

        return NextResponse.json({
          success: true,
          rule: alertRules[updateIndex],
          message: "Rule updated successfully",
        });

      case "delete":
        if (!ruleId) {
          return NextResponse.json(
            { error: "Rule ID is required" },
            { status: 400 }
          );
        }

        const deleteIndex = alertRules.findIndex(rule => rule.id === ruleId);
        if (deleteIndex === -1) {
          return NextResponse.json(
            { error: "Rule not found" },
            { status: 404 }
          );
        }

        const deletedRule = alertRules.splice(deleteIndex, 1)[0];

        logError(
          new Error(`Alert rule deleted: ${deletedRule.name}`),
          "alert-rules-api",
          "SYSTEM_INFO"
        );

        return NextResponse.json({
          success: true,
          message: "Rule deleted successfully",
        });

      case "test":
        if (!ruleId) {
          return NextResponse.json(
            { error: "Rule ID is required" },
            { status: 400 }
          );
        }

        const testRule = alertRules.find(rule => rule.id === ruleId);
        if (!testRule) {
          return NextResponse.json(
            { error: "Rule not found" },
            { status: 404 }
          );
        }

        // Simulate triggering the alert
        logError(
          new Error(`Test alert triggered for rule: ${testRule.name}`),
          "alert-rules-api",
          "SYSTEM_INFO"
        );

        return NextResponse.json({
          success: true,
          message: "Test alert sent successfully",
          rule: testRule,
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    logError(error as Error, "alert-rules-api-post", "API_ERROR");
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { escalation } = body;

    if (escalation) {
      // Update escalation steps
      escalationSteps.splice(0, escalationSteps.length, ...escalation);

      logError(
        new Error("Escalation workflow updated"),
        "alert-rules-api",
        "SYSTEM_INFO"
      );

      return NextResponse.json({
        success: true,
        escalation: escalationSteps,
        message: "Escalation workflow updated successfully",
      });
    }

    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  } catch (error) {
    logError(error as Error, "alert-rules-api-put", "API_ERROR");
    return NextResponse.json(
      { error: "Failed to update configuration" },
      { status: 500 }
    );
  }
}
