"use client";

import { useState, useCallback } from "react";
import {
  exportDashboardData,
  type ExportFormat,
  type ExportOptions,
  type ExportData,
} from "../export-utils";
import type { KPIMetric } from "./use-kpi-metrics";

interface UseExportOptions {
  onSuccess?: (format: ExportFormat) => void;
  onError?: (error: Error) => void;
}

interface UseExportReturn {
  isExporting: boolean;
  exportProgress: number;
  error: string | null;
  exportData: (
    metrics: KPIMetric[],
    format: ExportFormat,
    options?: Partial<ExportOptions>
  ) => Promise<void>;
  exportMultiple: (
    metrics: KPIMetric[],
    formats: ExportFormat[],
    options?: Partial<ExportOptions>
  ) => Promise<void>;
  clearError: () => void;
}

export function useExport(options: UseExportOptions = {}): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { onSuccess, onError } = options;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const exportData = useCallback(
    async (
      metrics: KPIMetric[],
      format: ExportFormat,
      exportOptions: Partial<ExportOptions> = {}
    ) => {
      if (isExporting) {
        throw new Error("Export already in progress");
      }

      setIsExporting(true);
      setExportProgress(0);
      setError(null);

      try {
        // Validate input
        if (!metrics || metrics.length === 0) {
          throw new Error("No metrics data available for export");
        }

        // Prepare export data
        const exportData: ExportData = {
          metrics,
          timestamp: new Date().toISOString(),
          dateRange: {
            from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
            to: new Date().toISOString(),
          },
          filters: {
            exportedMetrics: metrics.length,
            exportFormat: format,
          },
        };

        // Set progress to indicate start
        setExportProgress(25);

        // Prepare options
        const finalOptions: ExportOptions = {
          format,
          includeTimestamp: true,
          includeCharts: false,
          ...exportOptions,
        };

        // Update progress
        setExportProgress(50);

        // Perform export
        await exportDashboardData(exportData, finalOptions);

        // Complete progress
        setExportProgress(100);

        // Success callback
        onSuccess?.(format);

        console.log(`✅ Export completed successfully: ${format}`);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Export failed";
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
        console.error("❌ Export failed:", err);
      } finally {
        setIsExporting(false);
        // Reset progress after a delay
        setTimeout(() => setExportProgress(0), 1000);
      }
    },
    [isExporting, onSuccess, onError]
  );

  const exportMultiple = useCallback(
    async (
      metrics: KPIMetric[],
      formats: ExportFormat[],
      exportOptions: Partial<ExportOptions> = {}
    ) => {
      if (isExporting) {
        throw new Error("Export already in progress");
      }

      setIsExporting(true);
      setExportProgress(0);
      setError(null);

      try {
        const totalFormats = formats.length;
        let completedFormats = 0;

        for (const format of formats) {
          await exportData(metrics, format, {
            ...exportOptions,
            filename: exportOptions.filename
              ? `${exportOptions.filename}.${format}`
              : undefined,
          });

          completedFormats++;
          setExportProgress((completedFormats / totalFormats) * 100);

          // Small delay between exports to prevent overwhelming the browser
          if (completedFormats < totalFormats) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        console.log(`✅ Multiple export completed: ${formats.join(", ")}`);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Multiple export failed";
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
        console.error("❌ Multiple export failed:", err);
      } finally {
        setIsExporting(false);
        setTimeout(() => setExportProgress(0), 1000);
      }
    },
    [exportData, isExporting, onError]
  );

  return {
    isExporting,
    exportProgress,
    error,
    exportData,
    exportMultiple,
    clearError,
  };
}
