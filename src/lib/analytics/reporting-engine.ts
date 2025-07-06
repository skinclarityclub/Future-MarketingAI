// Reporting Engine
// Geavanceerde rapportage en export functionaliteit

import {
  RealTimeAnalyticsCore,
  MetricDataPoint,
  AnalyticsSnapshot,
  TimeFrame,
} from "./real-time-core";

export type ReportFormat = "pdf" | "excel" | "csv" | "json" | "html";
export type ChartType = "line" | "bar" | "area" | "pie" | "scatter";

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  metrics: string[];
  timeFrame: TimeFrame;
  charts: ChartConfig[];
  format: ReportFormat;
}

export interface ChartConfig {
  id: string;
  type: ChartType;
  title: string;
  metrics: string[];
  styling?: {
    colors?: string[];
    showLegend?: boolean;
  };
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  title: string;
  generatedAt: Date;
  format: ReportFormat;
  data: ReportData;
  charts: GeneratedChart[];
  summary: ReportSummary;
}

export interface ReportData {
  metrics: Array<{
    id: string;
    name: string;
    value: number;
    trend: "up" | "down" | "stable";
    unit: string;
  }>;
  timeSeriesData: Array<{
    timestamp: Date;
    values: Record<string, number>;
  }>;
}

export interface GeneratedChart {
  id: string;
  type: ChartType;
  title: string;
  data: any[];
  config: ChartConfig;
  insights?: string[];
}

export interface ReportSummary {
  keyInsights: string[];
  recommendations: string[];
  performanceScore: number;
}

export class ReportingEngine {
  private analyticsCore: RealTimeAnalyticsCore;
  private templates: Map<string, ReportTemplate> = new Map();
  private generatedReports: Map<string, GeneratedReport> = new Map();

  constructor(analyticsCore: RealTimeAnalyticsCore) {
    this.analyticsCore = analyticsCore;
    this.initializeDefaultTemplates();
  }

  /**
   * Genereer rapport op basis van template
   */
  async generateReport(templateId: string): Promise<GeneratedReport> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error("Template " + templateId + " niet gevonden");
    }

    const snapshot = this.analyticsCore.getSnapshot(template.timeFrame);
    const reportData = this.collectReportData(template, snapshot);
    const charts = this.generateCharts(template.charts, reportData);
    const summary = this.generateSummary(reportData);

    const report: GeneratedReport = {
      id: "report_" + Date.now(),
      templateId,
      title: template.name,
      generatedAt: new Date(),
      format: template.format,
      data: reportData,
      charts,
      summary,
    };

    this.generatedReports.set(report.id, report);
    return report;
  }

  /**
   * Export rapport naar CSV
   */
  exportToCsv(reportId: string): string {
    const report = this.generatedReports.get(reportId);
    if (!report) {
      throw new Error("Rapport " + reportId + " niet gevonden");
    }

    const headers = ["Timestamp", ...report.data.metrics.map(m => m.name)];
    const rows = report.data.timeSeriesData.map(item => [
      item.timestamp.toISOString(),
      ...report.data.metrics.map(metric => item.values[metric.id] || 0),
    ]);

    return [headers, ...rows].map(row => row.join(",")).join("\n");
  }

  /**
   * Export rapport naar JSON
   */
  exportToJson(reportId: string): string {
    const report = this.generatedReports.get(reportId);
    if (!report) {
      throw new Error("Rapport " + reportId + " niet gevonden");
    }

    return JSON.stringify(report, null, 2);
  }

  /**
   * Registreer nieuwe rapport template
   */
  registerTemplate(template: ReportTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Krijg alle beschikbare templates
   */
  getTemplates(): ReportTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Krijg gegenereerde rapporten
   */
  getGeneratedReports(): GeneratedReport[] {
    const reports = Array.from(this.generatedReports.values());
    return reports.sort(
      (a, b) => b.generatedAt.getTime() - a.generatedAt.getTime()
    );
  }

  // Private helper methods

  private collectReportData(
    template: ReportTemplate,
    snapshot: AnalyticsSnapshot
  ): ReportData {
    const metrics = template.metrics.map(metricId => {
      const metricData = snapshot.metrics.get(metricId);
      const metricDef = this.analyticsCore
        .getMetrics()
        .find(m => m.id === metricId);

      return {
        id: metricId,
        name: metricDef?.name || metricId,
        value: metricData?.current || 0,
        trend: metricData?.trend || "stable",
        unit: metricDef?.unit || "",
      };
    });

    const timeSeriesData = this.generateTimeSeriesData(template);

    return {
      metrics,
      timeSeriesData,
    };
  }

  private generateTimeSeriesData(
    template: ReportTemplate
  ): Array<{ timestamp: Date; values: Record<string, number> }> {
    const data: Array<{ timestamp: Date; values: Record<string, number> }> = [];
    const now = new Date();
    const hoursBack = 24;

    for (let i = hoursBack; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const values: Record<string, number> = {};

      template.metrics.forEach(metricId => {
        values[metricId] = Math.random() * 100 + Math.sin(i / 4) * 20;
      });

      data.push({ timestamp, values });
    }

    return data;
  }

  private generateCharts(
    chartConfigs: ChartConfig[],
    reportData: ReportData
  ): GeneratedChart[] {
    const charts: GeneratedChart[] = [];

    for (const config of chartConfigs) {
      const chartData = this.prepareChartData(config, reportData);
      const insights = this.generateChartInsights(config, chartData);

      charts.push({
        id: config.id,
        type: config.type,
        title: config.title,
        data: chartData,
        config,
        insights,
      });
    }

    return charts;
  }

  private prepareChartData(config: ChartConfig, reportData: ReportData): any[] {
    switch (config.type) {
      case "line":
      case "area":
        return reportData.timeSeriesData.map(item => ({
          time: item.timestamp.toLocaleTimeString(),
          ...config.metrics.reduce(
            (acc, metric) => {
              acc[metric] = item.values[metric] || 0;
              return acc;
            },
            {} as Record<string, number>
          ),
        }));

      case "bar":
        return config.metrics.map(metric => {
          const metricData = reportData.metrics.find(m => m.id === metric);
          return {
            metric: metricData?.name || metric,
            value: metricData?.value || 0,
          };
        });

      case "pie":
        const total = config.metrics.reduce((sum, metric) => {
          const metricData = reportData.metrics.find(m => m.id === metric);
          return sum + (metricData?.value || 0);
        }, 0);

        return config.metrics.map(metric => {
          const metricData = reportData.metrics.find(m => m.id === metric);
          const value = metricData?.value || 0;
          return {
            name: metricData?.name || metric,
            value,
            percentage: total > 0 ? (value / total) * 100 : 0,
          };
        });

      default:
        return [];
    }
  }

  private generateChartInsights(config: ChartConfig, data: any[]): string[] {
    const insights: string[] = [];

    switch (config.type) {
      case "line":
        if (data.length > 1) {
          const firstValue = data[0]?.[config.metrics[0]] || 0;
          const lastValue = data[data.length - 1]?.[config.metrics[0]] || 0;
          const change = ((lastValue - firstValue) / firstValue) * 100;

          if (Math.abs(change) > 5) {
            insights.push(
              config.metrics[0] +
                " heeft een " +
                (change > 0 ? "stijging" : "daling") +
                " van " +
                Math.abs(change).toFixed(1) +
                "%"
            );
          }
        }
        break;

      case "pie":
        const maxItem = data.reduce(
          (max, item) => (item.value > max.value ? item : max),
          data[0]
        );
        if (maxItem) {
          insights.push(
            maxItem.name +
              " heeft het grootste aandeel met " +
              maxItem.percentage.toFixed(1) +
              "%"
          );
        }
        break;
    }

    return insights;
  }

  private generateSummary(reportData: ReportData): ReportSummary {
    const keyInsights: string[] = [];
    const recommendations: string[] = [];

    reportData.metrics.forEach(metric => {
      if (metric.id === "ctr" && metric.value < 2) {
        recommendations.push(
          "CTR is laag - overweeg A/B testing van advertentie creatives"
        );
      }
      if (metric.id === "engagement_rate" && metric.value < 5) {
        recommendations.push(
          "Engagement rate kan verbeterd worden met interactievere content"
        );
      }

      keyInsights.push(
        metric.name + " staat op " + metric.value.toFixed(1) + " " + metric.unit
      );
    });

    const performanceScore = this.calculatePerformanceScore(reportData.metrics);

    return {
      keyInsights,
      recommendations,
      performanceScore,
    };
  }

  private calculatePerformanceScore(metrics: ReportData["metrics"]): number {
    let score = 0;
    let validMetrics = 0;

    metrics.forEach(metric => {
      switch (metric.id) {
        case "ctr":
          score += metric.value > 3 ? 20 : metric.value > 1 ? 10 : 5;
          validMetrics++;
          break;
        case "engagement_rate":
          score += metric.value > 10 ? 20 : metric.value > 5 ? 10 : 5;
          validMetrics++;
          break;
        case "conversions":
          score += metric.value > 50 ? 20 : metric.value > 10 ? 10 : 5;
          validMetrics++;
          break;
      }
    });

    return validMetrics > 0 ? Math.min(100, (score / validMetrics) * 5) : 0;
  }

  private initializeDefaultTemplates(): void {
    this.registerTemplate({
      id: "marketing-overview",
      name: "Marketing Overview",
      description: "Dagelijks overzicht van marketing performance",
      metrics: ["ctr", "engagement_rate", "conversions", "revenue"],
      timeFrame: "24h",
      charts: [
        {
          id: "performance-trend",
          type: "line",
          title: "Performance Trend",
          metrics: ["ctr", "engagement_rate"],
          styling: { colors: ["#3b82f6", "#10b981"], showLegend: true },
        },
        {
          id: "conversion-revenue",
          type: "bar",
          title: "Conversions & Revenue",
          metrics: ["conversions", "revenue"],
        },
      ],
      format: "html",
    });

    this.registerTemplate({
      id: "weekly-performance",
      name: "Weekly Performance Report",
      description: "Wekelijks uitgebreid performance rapport",
      metrics: ["ctr", "engagement_rate", "conversions", "revenue", "reach"],
      timeFrame: "7d",
      charts: [
        {
          id: "weekly-overview",
          type: "area",
          title: "7-Day Performance Overview",
          metrics: ["ctr", "engagement_rate", "conversions"],
        },
      ],
      format: "pdf",
    });
  }
}

export function createReportingEngine(
  analyticsCore: RealTimeAnalyticsCore
): ReportingEngine {
  return new ReportingEngine(analyticsCore);
}
