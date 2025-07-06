"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Download,
  FileText,
  FileSpreadsheet,
  BarChart3,
  Calendar as CalendarIcon,
  Filter,
  Clock,
  Settings,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Activity,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { nl } from "date-fns/locale";

interface ExportOptions {
  format: "pdf" | "excel" | "csv";
  dateRange: {
    from: Date;
    to: Date;
  };
  includeCharts: boolean;
  includeData: boolean;
  includeSummary: boolean;
  selectedWidgets: string[];
  branding: boolean;
  layout: "executive" | "detailed" | "summary";
}

interface WidgetOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  dataSize: number;
  hasCharts: boolean;
}

const availableWidgets: WidgetOption[] = [
  {
    id: "roi-budget",
    name: "ROI & Budget Tracking",
    description: "Revenue, spending, en ROI-analyses",
    icon: <DollarSign className="h-4 w-4" />,
    dataSize: 150,
    hasCharts: true,
  },
  {
    id: "ab-testing",
    name: "A/B Testing Results",
    description: "Test prestaties en conversie data",
    icon: <Target className="h-4 w-4" />,
    dataSize: 200,
    hasCharts: true,
  },
  {
    id: "content-calendar",
    name: "Content Calendar",
    description: "Geplande content en workflow status",
    icon: <CalendarIcon className="h-4 w-4" />,
    dataSize: 75,
    hasCharts: false,
  },
  {
    id: "performance-forecast",
    name: "Performance Forecasting",
    description: "Predictive analytics en voorspellingen",
    icon: <TrendingUp className="h-4 w-4" />,
    dataSize: 300,
    hasCharts: true,
  },
  {
    id: "team-collaboration",
    name: "Team Collaboration",
    description: "Team status en rol-gebaseerde data",
    icon: <Users className="h-4 w-4" />,
    dataSize: 100,
    hasCharts: false,
  },
  {
    id: "alerts-system",
    name: "Marketing Alerts",
    description: "Kritieke waarschuwingen en kansen",
    icon: <AlertCircle className="h-4 w-4" />,
    dataSize: 50,
    hasCharts: true,
  },
];

const datePresets = [
  { label: "Laatste 7 dagen", days: 7 },
  { label: "Laatste 30 dagen", days: 30 },
  { label: "Laatste kwartaal", days: 90 },
  { label: "Laatste 6 maanden", days: 180 },
  { label: "Laatste jaar", days: 365 },
];

export default function MarketingExportCapabilities() {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "pdf",
    dateRange: {
      from: subDays(new Date(), 30),
      to: new Date(),
    },
    includeCharts: true,
    includeData: true,
    includeSummary: true,
    selectedWidgets: ["roi-budget", "ab-testing", "performance-forecast"],
    branding: true,
    layout: "executive",
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const calculateEstimatedSize = () => {
    const baseSize = exportOptions.selectedWidgets.reduce((total, widgetId) => {
      const widget = availableWidgets.find(w => w.id === widgetId);
      return total + (widget?.dataSize || 0);
    }, 0);

    let multiplier = 1;
    if (exportOptions.includeCharts) multiplier += 0.5;
    if (exportOptions.includeSummary) multiplier += 0.2;
    if (exportOptions.format === "pdf") multiplier += 0.3;

    return Math.round(baseSize * multiplier);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simuleer export proces met progress updates
      const steps = [
        "Verzamelen van data...",
        "Genereren van grafieken...",
        "Formatteren van document...",
        "Finaliseren van export...",
      ];

      for (let i = 0; i < steps.length; i++) {
        toast.loading(steps[i], { id: "export-progress" });
        setExportProgress((i + 1) * 25);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Maak API call naar export endpoint
      const response = await fetch("/api/marketing/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...exportOptions,
          dateRange: {
            from: exportOptions.dateRange.from.toISOString(),
            to: exportOptions.dateRange.to.toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const fileName = `marketing-dashboard-${format(new Date(), "yyyy-MM-dd")}.${
        exportOptions.format === "excel" ? "xlsx" : exportOptions.format
      }`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Export succesvol voltooid!", { id: "export-progress" });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export mislukt. Probeer opnieuw.", {
        id: "export-progress",
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleDatePreset = (days: number) => {
    setExportOptions(prev => ({
      ...prev,
      dateRange: {
        from: subDays(new Date(), days),
        to: new Date(),
      },
    }));
  };

  const handleWidgetToggle = (widgetId: string) => {
    setExportOptions(prev => ({
      ...prev,
      selectedWidgets: prev.selectedWidgets.includes(widgetId)
        ? prev.selectedWidgets.filter(id => id !== widgetId)
        : [...prev.selectedWidgets, widgetId],
    }));
  };

  const estimatedSize = calculateEstimatedSize();

  return (
    <div className="space-y-6">
      {/* Export Header */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <Download className="h-6 w-6 text-blue-400" />
            Executive Export Capabilities
          </CardTitle>
          <p className="text-slate-300">
            Exporteer marketing dashboard data naar executive-vriendelijke
            formaten
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Format Selection */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" />
                Export Format
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <NormalButton
                  variant={
                    exportOptions.format === "pdf" ? "default" : "outline"
                  }
                  onClick={() =>
                    setExportOptions(prev => ({ ...prev, format: "pdf" }))
                  }
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <FileText className="h-6 w-6" />
                  <span>PDF Report</span>
                  <Badge variant="secondary" className="text-xs">
                    Executive
                  </Badge>
                </NormalButton>
                <NormalButton
                  variant={
                    exportOptions.format === "excel" ? "default" : "outline"
                  }
                  onClick={() =>
                    setExportOptions(prev => ({ ...prev, format: "excel" }))
                  }
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <FileSpreadsheet className="h-6 w-6" />
                  <span>Excel Workbook</span>
                  <Badge variant="secondary" className="text-xs">
                    Analysis
                  </Badge>
                </NormalButton>
                <NormalButton
                  variant={
                    exportOptions.format === "csv" ? "default" : "outline"
                  }
                  onClick={() =>
                    setExportOptions(prev => ({ ...prev, format: "csv" }))
                  }
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <BarChart3 className="h-6 w-6" />
                  <span>CSV Data</span>
                  <Badge variant="secondary" className="text-xs">
                    Raw Data
                  </Badge>
                </NormalButton>
              </div>
            </CardContent>
          </Card>

          {/* Date Range Selection */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-green-400" />
                Datum Bereik
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {datePresets.map(preset => (
                  <NormalButton
                    key={preset.days}
                    variant="outline"
                    size="sm"
                    onClick={() => handleDatePreset(preset.days)}
                    className="text-slate-300 hover:text-white"
                  >
                    {preset.label}
                  </NormalButton>
                ))}
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-sm">Van:</span>
                <Badge variant="outline">
                  {format(exportOptions.dateRange.from, "dd MMM yyyy", {
                    locale: nl,
                  })}
                </Badge>
                <span className="text-sm">Tot:</span>
                <Badge variant="outline">
                  {format(exportOptions.dateRange.to, "dd MMM yyyy", {
                    locale: nl,
                  })}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Widget Selection */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Filter className="h-5 w-5 text-purple-400" />
                Dashboard Componenten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableWidgets.map(widget => (
                  <div
                    key={widget.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      exportOptions.selectedWidgets.includes(widget.id)
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-slate-600 hover:border-slate-500"
                    }`}
                    onClick={() => handleWidgetToggle(widget.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={exportOptions.selectedWidgets.includes(
                          widget.id
                        )}
                        onChange={() => handleWidgetToggle(widget.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {widget.icon}
                          <span className="font-medium text-white">
                            {widget.name}
                          </span>
                          {widget.hasCharts && (
                            <Badge variant="secondary" className="text-xs">
                              <BarChart3 className="h-3 w-3 mr-1" />
                              Charts
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mb-2">
                          {widget.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Activity className="h-3 w-3" />~{widget.dataSize}KB
                          data
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Advanced Options */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle
                className="text-white flex items-center gap-2 cursor-pointer"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              >
                <Settings className="h-5 w-5 text-orange-400" />
                Geavanceerde Opties
                <NormalButton variant="ghost" size="sm">
                  {showAdvancedOptions ? "Verberg" : "Toon"}
                </NormalButton>
              </CardTitle>
            </CardHeader>
            {showAdvancedOptions && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-white">Content Opties</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="includeCharts"
                          checked={exportOptions.includeCharts}
                          onChange={() =>
                            setExportOptions(prev => ({
                              ...prev,
                              includeCharts: !prev.includeCharts,
                            }))
                          }
                        />
                        <Label
                          htmlFor="includeCharts"
                          className="text-slate-300"
                        >
                          Include Charts & Visualizations
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="includeData"
                          checked={exportOptions.includeData}
                          onChange={() =>
                            setExportOptions(prev => ({
                              ...prev,
                              includeData: !prev.includeData,
                            }))
                          }
                        />
                        <Label htmlFor="includeData" className="text-slate-300">
                          Include Raw Data Tables
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="includeSummary"
                          checked={exportOptions.includeSummary}
                          onChange={() =>
                            setExportOptions(prev => ({
                              ...prev,
                              includeSummary: !prev.includeSummary,
                            }))
                          }
                        />
                        <Label
                          htmlFor="includeSummary"
                          className="text-slate-300"
                        >
                          Include Executive Summary
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-white">Layout & Branding</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="branding"
                          checked={exportOptions.branding}
                          onChange={() =>
                            setExportOptions(prev => ({
                              ...prev,
                              branding: !prev.branding,
                            }))
                          }
                        />
                        <Label htmlFor="branding" className="text-slate-300">
                          Include SKC Branding
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Export Summary & Action */}
        <div className="space-y-6">
          {/* Export Summary */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                Export Samenvatting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Format:</span>
                  <Badge variant="outline" className="uppercase">
                    {exportOptions.format}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Componenten:</span>
                  <Badge variant="outline">
                    {exportOptions.selectedWidgets.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Geschatte grootte:</span>
                  <Badge variant="outline">~{estimatedSize}KB</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Periode:</span>
                  <Badge variant="outline">
                    {Math.ceil(
                      (exportOptions.dateRange.to.getTime() -
                        exportOptions.dateRange.from.getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    dagen
                  </Badge>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <Label className="text-white text-sm">
                  Geselecteerde Componenten:
                </Label>
                <div className="space-y-1 mt-2">
                  {exportOptions.selectedWidgets.map(widgetId => {
                    const widget = availableWidgets.find(
                      w => w.id === widgetId
                    );
                    return widget ? (
                      <div
                        key={widgetId}
                        className="flex items-center gap-2 text-sm text-slate-300"
                      >
                        {widget.icon}
                        {widget.name}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {isExporting && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400 animate-spin" />
                    <span className="text-sm text-slate-300">
                      Exporteren...
                    </span>
                  </div>
                  <Progress value={exportProgress} className="h-2" />
                  <p className="text-xs text-slate-400">
                    {exportProgress}% voltooid
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Export Actions */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border-slate-700/50">
            <CardContent className="pt-6">
              <NormalButton
                onClick={handleExport}
                disabled={
                  isExporting || exportOptions.selectedWidgets.length === 0
                }
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                {isExporting ? (
                  <>
                    <Clock className="h-5 w-5 mr-2 animate-spin" />
                    Exporteren...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    Start Export
                  </>
                )}
              </NormalButton>

              {exportOptions.selectedWidgets.length === 0 && (
                <p className="text-sm text-slate-400 mt-2 text-center">
                  Selecteer minimaal één component om te exporteren
                </p>
              )}
            </CardContent>
          </Card>

          {/* Export History */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-400" />
                Recente Exports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    date: "2025-01-15",
                    format: "PDF",
                    size: "2.3MB",
                    status: "success",
                  },
                  {
                    date: "2025-01-14",
                    format: "Excel",
                    size: "1.8MB",
                    status: "success",
                  },
                  {
                    date: "2025-01-13",
                    format: "CSV",
                    size: "0.5MB",
                    status: "success",
                  },
                ].map((export_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-green-400"></div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {export_.format} Report
                        </p>
                        <p className="text-xs text-slate-400">{export_.date}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {export_.size}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
