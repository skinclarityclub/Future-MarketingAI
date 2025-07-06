import { NextResponse } from "next/server";
import { errorDetectionService } from "@/lib/monitoring/error-detection";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, metrics, ruleId, rule } = body;

    switch (action) {
      case "detect":
        if (!metrics) {
          return NextResponse.json(
            { error: "Metrics required for detection" },
            { status: 400 }
          );
        }

        const anomalies = await errorDetectionService.detectAnomalies(metrics);
        return NextResponse.json({ anomalies });

      case "addRule":
        if (!rule) {
          return NextResponse.json(
            { error: "Rule required for adding" },
            { status: 400 }
          );
        }

        errorDetectionService.addRule(rule);
        return NextResponse.json({ message: "Rule added successfully" });

      case "removeRule":
        if (!ruleId) {
          return NextResponse.json(
            { error: "Rule ID required for removal" },
            { status: 400 }
          );
        }

        const removed = errorDetectionService.removeRule(ruleId);
        return NextResponse.json({ removed });

      case "enableRule":
        if (!ruleId) {
          return NextResponse.json(
            { error: "Rule ID required" },
            { status: 400 }
          );
        }

        const enabled = errorDetectionService.enableRule(ruleId);
        return NextResponse.json({ enabled });

      case "disableRule":
        if (!ruleId) {
          return NextResponse.json(
            { error: "Rule ID required" },
            { status: 400 }
          );
        }

        const disabled = errorDetectionService.disableRule(ruleId);
        return NextResponse.json({ disabled });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error detection API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const rules = errorDetectionService.getRules();
    const history = errorDetectionService.getRecoveryHistory();

    // Convert Map to object for JSON serialization
    const historyObj = Object.fromEntries(
      Array.from(history.entries()).map(([key, dates]) => [
        key,
        dates.map(date => date.toISOString()),
      ])
    );

    return NextResponse.json({
      rules,
      recoveryHistory: historyObj,
    });
  } catch (error) {
    console.error("Error detection API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
