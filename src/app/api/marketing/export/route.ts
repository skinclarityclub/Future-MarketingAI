import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import * as ExcelJS from "exceljs";

interface ExportRequest {
  format: "pdf" | "excel" | "csv";
  dateRange: {
    from: string;
    to: string;
  };
  includeCharts: boolean;
  includeData: boolean;
  includeSummary: boolean;
  selectedWidgets: string[];
  branding: boolean;
  layout: "executive" | "detailed" | "summary";
}

// Simulated data for demonstration
const generateMockData = (
  widgets: string[],
  dateRange: { from: string; to: string }
) => {
  const data: Record<string, any> = {};

  if (widgets.includes("roi-budget")) {
    data["roi-budget"] = {
      totalSpend: 125000,
      totalRevenue: 275000,
      averageROI: 120,
      roas: 2.2,
      campaigns: [
        { name: "Q1 Campaign", spend: 25000, revenue: 65000, roi: 160 },
        { name: "Brand Awareness", spend: 35000, revenue: 70000, roi: 100 },
        { name: "Product Launch", spend: 65000, revenue: 140000, roi: 115 },
      ],
    };
  }

  if (widgets.includes("ab-testing")) {
    data["ab-testing"] = {
      activeTests: 12,
      completedTests: 38,
      averageConversion: 3.8,
      totalImpressions: 2450000,
      tests: [
        {
          name: "Homepage CTA",
          conversion: 4.2,
          significance: 95,
          winner: "Variant B",
        },
        {
          name: "Email Subject Lines",
          conversion: 3.6,
          significance: 88,
          winner: "Variant A",
        },
        {
          name: "Product Page Layout",
          conversion: 5.1,
          significance: 92,
          winner: "Variant C",
        },
      ],
    };
  }

  if (widgets.includes("performance-forecast")) {
    data["performance-forecast"] = {
      nextMonthPrediction: {
        revenue: 325000,
        conversion: 4.2,
        traffic: 185000,
        leads: 850,
      },
      confidence: 87,
      trends: ["upward", "stable", "upward", "upward"],
    };
  }

  if (widgets.includes("content-calendar")) {
    data["content-calendar"] = {
      scheduledPosts: 45,
      approvedContent: 32,
      pendingApproval: 13,
      platforms: ["LinkedIn", "Instagram", "Twitter", "Facebook"],
    };
  }

  return data;
};

const generatePDF = async (
  data: any,
  options: ExportRequest
): Promise<Buffer> => {
  return new Promise(resolve => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", chunk => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    // Header
    if (options.branding) {
      doc
        .fontSize(24)
        .fillColor("#1e293b")
        .text("SKC Marketing Dashboard", 50, 50);
      doc.fontSize(14).fillColor("#64748b").text("Executive Report", 50, 80);
    }

    doc.moveDown(2);

    // Summary section
    if (options.includeSummary) {
      doc
        .fontSize(18)
        .fillColor("#1e293b")
        .text("Executive Summary", 50, doc.y);
      doc.moveDown();
      doc
        .fontSize(12)
        .fillColor("#374151")
        .text(
          `Report generated for period: ${new Date(options.dateRange.from).toLocaleDateString()} - ${new Date(options.dateRange.to).toLocaleDateString()}`
        );
      doc.moveDown();
    }

    // Data sections
    options.selectedWidgets.forEach(widget => {
      if (data[widget]) {
        doc.fontSize(16).fillColor("#1e293b").text(getWidgetTitle(widget));
        doc.moveDown();

        const widgetData = data[widget];
        Object.entries(widgetData).forEach(([key, value]) => {
          if (typeof value === "object" && !Array.isArray(value) && value !== null) {
            doc.fontSize(14).text(`${formatKey(key)}:`);
            Object.entries(value).forEach(([subKey, subValue]) => {
              doc
                .fontSize(12)
                .text(`  ${formatKey(subKey)}: ${formatValue(subValue)}`);
            });
          } else if (Array.isArray(value)) {
            doc.fontSize(14).text(`${formatKey(key)}:`);
            value.forEach((item: any, index: number) => {
              doc
                .fontSize(12)
                .text(
                  `  ${index + 1}. ${typeof item === "object" ? JSON.stringify(item) : item}`
                );
            });
          } else {
            doc.fontSize(12).text(`${formatKey(key)}: ${formatValue(value)}`);
          }
        });
        doc.moveDown(2);
      }
    });

    doc.end();
  });
};

const generateExcel = async (
  data: any,
  options: ExportRequest
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();

  // Summary sheet
  if (options.includeSummary) {
    const summarySheet = workbook.addWorksheet("Summary");
    summarySheet.addRow(["SKC Marketing Dashboard - Executive Report"]);
    summarySheet.addRow([
      `Period: ${new Date(options.dateRange.from).toLocaleDateString()} - ${new Date(options.dateRange.to).toLocaleDateString()}`,
    ]);
    summarySheet.addRow([]);
    summarySheet.addRow(["Generated on:", new Date().toLocaleString()]);
    summarySheet.addRow([
      "Selected Widgets:",
      options.selectedWidgets.join(", "),
    ]);
  }

  // Data sheets for each widget
  options.selectedWidgets.forEach(widget => {
    if (data[widget]) {
      const sheet = workbook.addWorksheet(getWidgetTitle(widget));
      const widgetData = data[widget];

      // Add headers and data
      if (typeof widgetData === "object") {
        const entries = Object.entries(widgetData);
        sheet.addRow(["Metric", "Value"]);

        entries.forEach(([key, value]) => {
          if (typeof value === "object" && !Array.isArray(value) && value !== null) {
            sheet.addRow([formatKey(key), ""]);
            Object.entries(value).forEach(([subKey, subValue]) => {
              sheet.addRow([`  ${formatKey(subKey)}`, formatValue(subValue)]);
            });
          } else if (Array.isArray(value)) {
            sheet.addRow([formatKey(key), `${value.length} items`]);
          } else {
            sheet.addRow([formatKey(key), formatValue(value)]);
          }
        });
      }
    }
  });

  return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
};

const generateCSV = (data: any, options: ExportRequest): string => {
  let csv = "Widget,Metric,Value\n";

  options.selectedWidgets.forEach(widget => {
    if (data[widget]) {
      const widgetData = data[widget];
      Object.entries(widgetData).forEach(([key, value]) => {
        if (typeof value === "object" && !Array.isArray(value) && value !== null) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            csv += `"${getWidgetTitle(widget)}","${formatKey(key)} - ${formatKey(subKey)}","${formatValue(subValue)}"\n`;
          });
        } else {
          csv += `"${getWidgetTitle(widget)}","${formatKey(key)}","${formatValue(value)}"\n`;
        }
      });
    }
  });

  return csv;
};

const getWidgetTitle = (widgetId: string): string => {
  const titles: Record<string, string> = {
    "roi-budget": "ROI & Budget Tracking",
    "ab-testing": "A/B Testing Results",
    "content-calendar": "Content Calendar",
    "performance-forecast": "Performance Forecasting",
    "team-collaboration": "Team Collaboration",
    "alerts-system": "Marketing Alerts",
  };
  return titles[widgetId] || widgetId;
};

const formatKey = (key: string): string => {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
};

const formatValue = (value: any): string => {
  if (typeof value === "number") {
    if (value > 1000) {
      return new Intl.NumberFormat("nl-NL", {
        style: "currency",
        currency: "EUR",
      }).format(value);
    }
    return value.toString();
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return String(value);
};

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json();

    // Validate request
    if (
      !body.format ||
      !body.selectedWidgets ||
      body.selectedWidgets.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid export request" },
        { status: 400 }
      );
    }

    // Generate mock data
    const data = generateMockData(body.selectedWidgets, body.dateRange);

    let buffer: Buffer;
    let contentType: string;
    let fileName: string;

    const timestamp = new Date().toISOString().split("T")[0];

    switch (body.format) {
      case "pdf":
        buffer = await generatePDF(data, body);
        contentType = "application/pdf";
        fileName = `marketing-dashboard-${timestamp}.pdf`;
        break;

      case "excel":
        buffer = await generateExcel(data, body);
        contentType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        fileName = `marketing-dashboard-${timestamp}.xlsx`;
        break;

      case "csv":
        const csvContent = generateCSV(data, body);
        buffer = Buffer.from(csvContent, "utf-8");
        contentType = "text/csv";
        fileName = `marketing-dashboard-${timestamp}.csv`;
        break;

      default:
        return NextResponse.json(
          { error: "Unsupported export format" },
          { status: 400 }
        );
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Internal server error during export" },
      { status: 500 }
    );
  }
}
