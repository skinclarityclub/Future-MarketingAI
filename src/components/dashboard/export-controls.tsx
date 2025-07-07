"use client";

import React, { useState } from "react";
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  Settings,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useExport } from "@/lib/dashboard/hooks/use-export";
import type { KPIMetric } from "@/lib/dashboard/hooks/use-kpi-metrics";
import type { ExportFormat } from "@/lib/dashboard/export-utils";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/client-provider";
import NormalButton from "@/components/ui/normal-button";

interface ExportControlsProps {
  metrics?: KPIMetric[];
  className?: string;
  variant?: "button" | "dropdown" | "panel";
}

export function ExportControls({
  metrics = [],
  className,
  variant = "dropdown",
}: ExportControlsProps) {
  const { t } = useTranslation();
  const [showOptions, setShowOptions] = useState(false);
  const [showSuccess, setShowSuccess] = useState<ExportFormat | null>(null);

  const {
    isExporting,
    exportProgress,
    error,
    exportData,
    exportMultiple,
    clearError,
  } = useExport({
    onSuccess: (format: ExportFormat) => {
      setShowSuccess(format);
      setTimeout(() => setShowSuccess(null), 3000);
    },
    onError: (error: Error) => {
      console.error("Export error:", error);
    },
  });

  const formatConfigs = {
    csv: {
      label: "CSV",
      description: t("reports.csvDescription"),
      icon: FileSpreadsheet,
      color: "text-green-600",
      bgColor: "bg-green-50 hover:bg-green-100",
    },
    json: {
      label: "JSON",
      description: t("reports.jsonDescription"),
      icon: FileJson,
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100",
    },
    pdf: {
      label: "PDF",
      description: t("reports.pdfDescription"),
      icon: FileText,
      color: "text-red-600",
      bgColor: "bg-red-50 hover:bg-red-100",
    },
  } as const;

  const handleExport = async (format: ExportFormat) => {
    try {
      setShowOptions(false);
      await exportData(metrics, format, {
        includeTimestamp: true,
        includeCharts: format === "pdf",
      });
    } catch (error) {
      console.error("Export failed:", error);
      // Error handling will be managed by the export hook
    }
  };

  const handleExportAll = async () => {
    try {
      setShowOptions(false);
      await exportMultiple(metrics, ["csv", "json", "pdf"], {
        includeTimestamp: true,
        includeCharts: true,
      });
    } catch (error) {
      console.error("Export all failed:", error);
      // Error handling will be managed by the export hook
    }
  };

  if (variant === "button") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {Object.entries(formatConfigs).map(([format, config]) => {
          const Icon = config.icon;
          return (
            <NormalButton
              key={format}
              onClick={() => handleExport(format as ExportFormat)}
              disabled={isExporting || !metrics.length}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                config.bgColor,
                config.color,
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <Icon className="h-4 w-4" />
              {config.label}
            </NormalButton>
          );
        })}
      </div>
    );
  }

  if (variant === "panel") {
    return (
      <div className={cn("bg-card border rounded-lg p-4", className)}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Download className="h-5 w-5" />
          {t("buttons.exportData")}
        </h3>

        {/* Export Options */}
        <div className="space-y-3 mb-4">
          {Object.entries(formatConfigs).map(([format, config]) => {
            const Icon = config.icon;
            return (
              <NormalButton
                key={format}
                onClick={() => handleExport(format as ExportFormat)}
                disabled={isExporting || !metrics.length}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors border",
                  config.bgColor,
                  "disabled:opacity-50 disabled:cursor-not-allowed border-transparent hover:border-gray-200"
                )}
              >
                <Icon className={cn("h-5 w-5 mt-0.5", config.color)} />
                <div>
                  <div className={cn("font-medium", config.color)}>
                    {config.label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {config.description}
                  </div>
                </div>
              </NormalButton>
            );
          })}
        </div>

        {/* Export All Button */}
        <NormalButton
          onClick={handleExportAll}
          disabled={isExporting || !metrics.length}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          {t("buttons.exportAll")}
        </NormalButton>

        {/* Status Messages */}
        {isExporting && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("reports.exporting")}...{" "}
            {exportProgress > 0 && `${Math.round(exportProgress)}%`}
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-sm text-red-700">{error}</div>
            <NormalButton
              onClick={clearError}
              className="ml-auto text-red-600 hover:text-red-800"
              title="Clear error"
            >
              <X className="h-4 w-4" />
            </NormalButton>
          </div>
        )}

        {showSuccess && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div className="text-sm text-green-700">
              {formatConfigs[showSuccess].label} {t("reports.exportSuccess")}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={cn("relative", className)}>
      <NormalButton
        onClick={() => setShowOptions(!showOptions)}
        disabled={isExporting || !metrics.length}
        className={cn(
          "flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Export
        {exportProgress > 0 && isExporting && (
          <span className="text-xs">({Math.round(exportProgress)}%)</span>
        )}
      </NormalButton>

      {showOptions && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowOptions(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-72 bg-popover border rounded-lg shadow-lg z-50 p-2">
            <div className="flex items-center justify-between p-2 border-b">
              <h3 className="font-medium">Export Options</h3>
              <NormalButton
                onClick={() => setShowOptions(false)}
                className="text-muted-foreground hover:text-foreground"
                title="Close options"
              >
                <X className="h-4 w-4" />
              </NormalButton>
            </div>

            <div className="space-y-1 p-2">
              {Object.entries(formatConfigs).map(([format, config]) => {
                const Icon = config.icon;
                return (
                  <NormalButton
                    key={format}
                    onClick={() => handleExport(format as ExportFormat)}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted text-left transition-colors"
                  >
                    <Icon className={cn("h-4 w-4", config.color)} />
                    <div>
                      <div className="font-medium">{config.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {config.description}
                      </div>
                    </div>
                  </NormalButton>
                );
              })}

              <hr className="my-2" />

              <NormalButton
                onClick={handleExportAll}
                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted text-left transition-colors"
              >
                <Settings className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="font-medium">Export All</div>
                  <div className="text-xs text-muted-foreground">
                    Download CSV, JSON, and PDF
                  </div>
                </div>
              </NormalButton>
            </div>

            {/* Status in dropdown */}
            {error && (
              <div className="p-2 border-t">
                <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div className="text-xs text-red-700">{error}</div>
                </div>
              </div>
            )}

            {showSuccess && (
              <div className="p-2 border-t">
                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div className="text-xs text-green-700">
                    {formatConfigs[showSuccess].label} export completed!
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
