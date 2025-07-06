import Papa from "papaparse";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format as formatDate } from "date-fns";
import type { KPIMetric } from "./hooks/use-kpi-metrics";

export type ExportFormat = "csv" | "pdf" | "json";

export interface ExportData {
  metrics: KPIMetric[];
  timestamp: string;
  dateRange?: {
    from: string;
    to: string;
  };
  filters?: Record<string, any>;
}

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeTimestamp?: boolean;
  includeCharts?: boolean; // For PDF export
}

// Generate filename with timestamp
export function generateFilename(
  prefix: string,
  format: ExportFormat,
  includeTimestamp = true
): string {
  const timestamp = includeTimestamp
    ? formatDate(new Date(), "yyyy-MM-dd_HH-mm-ss")
    : "";
  const timestampPart = timestamp ? `_${timestamp}` : "";
  return `${prefix}${timestampPart}.${format}`;
}

// Export to CSV
export async function exportToCSV(
  data: ExportData,
  options: ExportOptions = { format: "csv" }
): Promise<void> {
  try {
    const filename =
      options.filename ||
      generateFilename("kpi-metrics", "csv", options.includeTimestamp);

    // Prepare data for CSV
    const csvData = data.metrics.map(metric => ({
      "Metric ID": metric.id,
      Title: metric.title,
      Value: metric.value,
      "Change (%)": (metric.change * 100).toFixed(2),
      Trend: metric.trend,
      Period: metric.period,
      "Last Updated": metric.lastUpdated,
      "Export Timestamp": data.timestamp,
    }));

    // Add summary row
    const totalValue = data.metrics.reduce(
      (sum, metric) => sum + metric.value,
      0
    );
    const avgChange =
      data.metrics.reduce((sum, metric) => sum + metric.change, 0) /
      data.metrics.length;

    csvData.push({
      "Metric ID": "SUMMARY",
      Title: "Total/Average",
      Value: totalValue,
      "Change (%)": (avgChange * 100).toFixed(2),
      Trend: avgChange > 0 ? "up" : "down",
      Period: "All",
      "Last Updated": data.timestamp,
      "Export Timestamp": data.timestamp,
    });

    // Convert to CSV
    const csv = Papa.unparse(csvData);

    // Download file
    downloadFile(csv, filename, "text/csv");

    console.log(`✅ CSV export completed: ${filename}`);
  } catch (error) {
    console.error("❌ CSV export failed:", error);
    throw new Error("Failed to export CSV");
  }
}

// Export to JSON
export async function exportToJSON(
  data: ExportData,
  options: ExportOptions = { format: "json" }
): Promise<void> {
  try {
    const filename =
      options.filename ||
      generateFilename("kpi-metrics", "json", options.includeTimestamp);

    // Prepare JSON data with metadata
    const jsonData = {
      exportMetadata: {
        exportedAt: data.timestamp,
        format: "json",
        version: "1.0",
        source: "SKC BI Dashboard",
      },
      summary: {
        totalMetrics: data.metrics.length,
        totalValue: data.metrics.reduce((sum, metric) => sum + metric.value, 0),
        averageChange:
          data.metrics.reduce((sum, metric) => sum + metric.change, 0) /
          data.metrics.length,
      },
      dateRange: data.dateRange,
      filters: data.filters,
      metrics: data.metrics,
    };

    const jsonString = JSON.stringify(jsonData, null, 2);

    // Download file
    downloadFile(jsonString, filename, "application/json");

    console.log(`✅ JSON export completed: ${filename}`);
  } catch (error) {
    console.error("❌ JSON export failed:", error);
    throw new Error("Failed to export JSON");
  }
}

// Export to PDF
export async function exportToPDF(
  data: ExportData,
  options: ExportOptions = { format: "pdf" },
  elementId?: string
): Promise<void> {
  try {
    const filename =
      options.filename ||
      generateFilename("kpi-dashboard", "pdf", options.includeTimestamp);

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Add header
    pdf.setFontSize(20);
    pdf.setTextColor(51, 51, 51);
    pdf.text("SKC BI Dashboard - KPI Metrics Report", 20, 25);

    // Add metadata
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `Generated: ${formatDate(new Date(data.timestamp), "PPP p")}`,
      20,
      35
    );
    pdf.text(`Total Metrics: ${data.metrics.length}`, 20, 42);

    // Add metrics table
    let yPosition = 55;

    // Table headers
    pdf.setFontSize(12);
    pdf.setTextColor(51, 51, 51);
    pdf.text("Metric", 20, yPosition);
    pdf.text("Value", 80, yPosition);
    pdf.text("Change", 120, yPosition);
    pdf.text("Trend", 150, yPosition);

    // Table rows
    pdf.setFontSize(10);
    yPosition += 10;

    data.metrics.forEach((metric, _index) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 25;
      }

      pdf.text(metric.title, 20, yPosition);
      pdf.text(formatValue(metric.value), 80, yPosition);
      pdf.text(`${(metric.change * 100).toFixed(1)}%`, 120, yPosition);

      // Color-coded trend
      if (metric.trend === "up") {
        pdf.setTextColor(34, 197, 94); // green
        pdf.text("↗", 150, yPosition);
      } else {
        pdf.setTextColor(239, 68, 68); // red
        pdf.text("↘", 150, yPosition);
      }

      pdf.setTextColor(51, 51, 51);
      yPosition += 8;
    });

    // Capture dashboard screenshot if element provided and option enabled
    if (options.includeCharts && elementId) {
      try {
        const element = document.getElementById(elementId);
        if (element) {
          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
          });

          const imgData = canvas.toDataURL("image/png");
          const imgWidth = pageWidth - 40;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Add new page for screenshot
          pdf.addPage();
          pdf.setFontSize(14);
          pdf.text("Dashboard Screenshot", 20, 25);
          pdf.addImage(imgData, "PNG", 20, 35, imgWidth, imgHeight);
        }
      } catch (screenshotError) {
        console.warn("Screenshot capture failed:", screenshotError);
      }
    }

    // Save PDF
    pdf.save(filename);

    console.log(`✅ PDF export completed: ${filename}`);
  } catch (error) {
    console.error("❌ PDF export failed:", error);
    throw new Error("Failed to export PDF");
  }
}

// Helper function to format values
function formatValue(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  } else if (value < 1) {
    return `${(value * 100).toFixed(1)}%`;
  } else {
    return value.toFixed(0);
  }
}

// Helper function to download files
function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Main export function
export async function exportDashboardData(
  data: ExportData,
  options: ExportOptions
): Promise<void> {
  switch (options.format) {
    case "csv":
      return exportToCSV(data, options);
    case "json":
      return exportToJSON(data, options);
    case "pdf":
      return exportToPDF(data, options);
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}
