"use client";

import React, { useState } from "react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Settings,
  BarChart3,
  Target,
  Users,
  TrendingUp,
  Activity,
  Eye,
  Share2,
  Save,
  Trash2,
  Grid3X3,
} from "lucide-react";
import { UltraPremiumCard } from "@/components/layout/ultra-premium-dashboard-layout";

interface CustomWidget {
  id: string;
  title: string;
  description: string;
  dataSource: string;
  metricType: string;
  visualization: "number" | "chart" | "gauge" | "trend";
  color: "blue" | "green" | "purple" | "orange" | "red" | "indigo";
  configuration: {
    showTrend?: boolean;
    showComparison?: boolean;
    timeframe?: string;
    format?: string;
    aggregation?: string;
  };
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WidgetTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: "marketing" | "sales" | "finance" | "operations";
  defaultConfig: Partial<CustomWidget>;
}

const widgetTemplates: WidgetTemplate[] = [
  {
    id: "campaign-roi",
    name: "Campaign ROI",
    description: "Track return on investment for specific campaigns",
    icon: <Target className="h-5 w-5" />,
    category: "marketing",
    defaultConfig: {
      title: "Campaign ROI",
      dataSource: "/api/marketing/roi",
      metricType: "roi_percentage",
      visualization: "number",
      color: "green",
      configuration: {
        showTrend: true,
        timeframe: "30d",
        format: "percentage",
      },
    },
  },
  {
    id: "conversion-rate",
    name: "Conversion Rate",
    description: "Monitor conversion rates across channels",
    icon: <TrendingUp className="h-5 w-5" />,
    category: "marketing",
    defaultConfig: {
      title: "Conversion Rate",
      dataSource: "/api/marketing/analytics",
      metricType: "conversion_rate",
      visualization: "gauge",
      color: "blue",
      configuration: {
        showComparison: true,
        timeframe: "7d",
        format: "percentage",
      },
    },
  },
  {
    id: "social-engagement",
    name: "Social Engagement",
    description: "Track social media engagement metrics",
    icon: <Share2 className="h-5 w-5" />,
    category: "marketing",
    defaultConfig: {
      title: "Social Engagement",
      dataSource: "/api/marketing/social-media",
      metricType: "engagement_rate",
      visualization: "chart",
      color: "purple",
      configuration: {
        showTrend: true,
        timeframe: "14d",
        aggregation: "average",
      },
    },
  },
  {
    id: "customer-acquisition",
    name: "Customer Acquisition Cost",
    description: "Monitor cost per customer acquisition",
    icon: <Users className="h-5 w-5" />,
    category: "marketing",
    defaultConfig: {
      title: "Customer Acquisition Cost",
      dataSource: "/api/marketing/roi",
      metricType: "cost_per_acquisition",
      visualization: "trend",
      color: "orange",
      configuration: {
        showComparison: true,
        timeframe: "30d",
        format: "currency",
      },
    },
  },
  {
    id: "ad-performance",
    name: "Ad Performance",
    description: "Track advertising campaign performance",
    icon: <Eye className="h-5 w-5" />,
    category: "marketing",
    defaultConfig: {
      title: "Ad Performance",
      dataSource: "/api/marketing/ads",
      metricType: "ctr",
      visualization: "chart",
      color: "indigo",
      configuration: { showTrend: true, timeframe: "7d", format: "percentage" },
    },
  },
  {
    id: "email-metrics",
    name: "Email Metrics",
    description: "Monitor email campaign effectiveness",
    icon: <Activity className="h-5 w-5" />,
    category: "marketing",
    defaultConfig: {
      title: "Email Open Rate",
      dataSource: "/api/marketing/email",
      metricType: "open_rate",
      visualization: "gauge",
      color: "red",
      configuration: {
        showComparison: true,
        timeframe: "30d",
        format: "percentage",
      },
    },
  },
];

const dataSourceOptions = [
  { value: "/api/marketing/roi", label: "Campaign ROI Data" },
  { value: "/api/marketing/analytics", label: "Marketing Analytics" },
  { value: "/api/marketing/social-media", label: "Social Media Metrics" },
  { value: "/api/marketing/ads", label: "Advertising Performance" },
  { value: "/api/marketing/email", label: "Email Campaign Data" },
  { value: "/api/marketing/content-calendar", label: "Content Performance" },
  { value: "/api/marketing/ab-testing", label: "A/B Testing Results" },
  { value: "/api/marketing/automated-scheduling", label: "Automation Metrics" },
];

const metricTypeOptions = [
  { value: "roi_percentage", label: "ROI Percentage" },
  { value: "conversion_rate", label: "Conversion Rate" },
  { value: "cost_per_acquisition", label: "Cost Per Acquisition" },
  { value: "engagement_rate", label: "Engagement Rate" },
  { value: "click_through_rate", label: "Click Through Rate" },
  { value: "open_rate", label: "Open Rate" },
  { value: "bounce_rate", label: "Bounce Rate" },
  { value: "revenue", label: "Revenue" },
  { value: "spend", label: "Marketing Spend" },
  { value: "impressions", label: "Impressions" },
  { value: "clicks", label: "Clicks" },
  { value: "conversions", label: "Conversions" },
];

const colorOptions = [
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "green", label: "Green", class: "bg-green-500" },
  { value: "purple", label: "Purple", class: "bg-purple-500" },
  { value: "orange", label: "Orange", class: "bg-orange-500" },
  { value: "red", label: "Red", class: "bg-red-500" },
  { value: "indigo", label: "Indigo", class: "bg-indigo-500" },
];

export default function CustomWidgetBuilder() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<WidgetTemplate | null>(null);
  const [customWidget, setCustomWidget] = useState<Partial<CustomWidget>>({
    title: "",
    description: "",
    dataSource: "",
    metricType: "",
    visualization: "number",
    color: "blue",
    configuration: {
      showTrend: true,
      showComparison: false,
      timeframe: "30d",
      format: "number",
      aggregation: "sum",
    },
    isVisible: true,
  });
  const [widgets, setWidgets] = useState<CustomWidget[]>([]);

  const resetBuilder = () => {
    setCustomWidget({
      title: "",
      description: "",
      dataSource: "",
      metricType: "",
      visualization: "number",
      color: "blue",
      configuration: {
        showTrend: true,
        showComparison: false,
        timeframe: "30d",
        format: "number",
        aggregation: "sum",
      },
      isVisible: true,
    });
    setSelectedTemplate(null);
  };

  const handleTemplateSelect = (template: WidgetTemplate) => {
    setSelectedTemplate(template);
    setCustomWidget({
      ...template.defaultConfig,
      description: template.description,
    });
  };

  const handleCreateWidget = () => {
    if (
      !customWidget.title ||
      !customWidget.dataSource ||
      !customWidget.metricType
    ) {
      return;
    }

    const newWidget: CustomWidget = {
      id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: customWidget.title,
      description: customWidget.description || "",
      dataSource: customWidget.dataSource,
      metricType: customWidget.metricType,
      visualization: customWidget.visualization || "number",
      color: customWidget.color || "blue",
      configuration: customWidget.configuration || {},
      isVisible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setWidgets(prev => [...prev, newWidget]);
    setIsBuilderOpen(false);
    resetBuilder();
  };

  const handleDeleteWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  };

  const getVisualizationIcon = (type: string) => {
    switch (type) {
      case "chart":
        return <BarChart3 className="h-4 w-4" />;
      case "gauge":
        return <Activity className="h-4 w-4" />;
      case "trend":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Grid3X3 className="h-4 w-4" />;
    }
  };

  return (
    <UltraPremiumCard>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Settings className="h-5 w-5" />
            Custom Widget Builder
          </CardTitle>
          <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
            <DialogTrigger asChild>
              <NormalButton variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Widget
              </NormalButton>
            </DialogTrigger>
            <DialogContent className="max-w-2xl dark">
              <DialogHeader>
                <DialogTitle className="text-white">
                  Create Custom Marketing Widget
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Build a custom widget to track specific marketing KPIs
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Widget Templates */}
                <div>
                  <Label className="text-white mb-3 block">
                    Quick Start Templates
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {widgetTemplates.map(template => (
                      <NormalButton
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className={`p-3 border rounded-lg text-left transition-all ${
                          selectedTemplate?.id === template.id
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-gray-600 hover:border-gray-500 bg-gray-800/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-blue-400">{template.icon}</div>
                          <span className="text-sm font-medium text-white">
                            {template.name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {template.description}
                        </p>
                      </NormalButton>
                    ))}
                  </div>
                </div>

                {/* Widget Configuration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="widget-title" className="text-white">
                      Widget Title
                    </Label>
                    <Input
                      id="widget-title"
                      value={customWidget.title || ""}
                      onChange={e =>
                        setCustomWidget(prev => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Enter widget title"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="widget-description" className="text-white">
                      Description
                    </Label>
                    <Input
                      id="widget-description"
                      value={customWidget.description || ""}
                      onChange={e =>
                        setCustomWidget(prev => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Widget description"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Data Source</Label>
                    <Select
                      value={customWidget.dataSource || ""}
                      onValueChange={value =>
                        setCustomWidget(prev => ({
                          ...prev,
                          dataSource: value,
                        }))
                      }
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Select data source" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {dataSourceOptions.map(option => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="text-white"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Metric Type</Label>
                    <Select
                      value={customWidget.metricType || ""}
                      onValueChange={value =>
                        setCustomWidget(prev => ({
                          ...prev,
                          metricType: value,
                        }))
                      }
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Select metric" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {metricTypeOptions.map(option => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="text-white"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Visualization</Label>
                    <Select
                      value={customWidget.visualization || "number"}
                      onValueChange={(value: any) =>
                        setCustomWidget(prev => ({
                          ...prev,
                          visualization: value,
                        }))
                      }
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="number" className="text-white">
                          Number Display
                        </SelectItem>
                        <SelectItem value="chart" className="text-white">
                          Chart
                        </SelectItem>
                        <SelectItem value="gauge" className="text-white">
                          Gauge
                        </SelectItem>
                        <SelectItem value="trend" className="text-white">
                          Trend Line
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Color Theme</Label>
                    <Select
                      value={customWidget.color || "blue"}
                      onValueChange={(value: any) =>
                        setCustomWidget(prev => ({ ...prev, color: value }))
                      }
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {colorOptions.map(color => (
                          <SelectItem
                            key={color.value}
                            value={color.value}
                            className="text-white"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${color.class}`}
                              />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <NormalButton
                    variant="outline"
                    onClick={() => {
                      setIsBuilderOpen(false);
                      resetBuilder();
                    }}
                  >
                    Cancel
                  </NormalButton>
                  <NormalButton
                    onClick={handleCreateWidget}
                    disabled={
                      !customWidget.title ||
                      !customWidget.dataSource ||
                      !customWidget.metricType
                    }
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Create Widget
                  </NormalButton>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription className="text-gray-400">
          Create and manage custom marketing KPI widgets
        </CardDescription>
      </CardHeader>
      <CardContent>
        {widgets.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white mb-3">
              Your Custom Widgets ({widgets.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {widgets.map(widget => (
                <div
                  key={widget.id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getVisualizationIcon(widget.visualization)}
                      <div
                        className={`w-3 h-3 rounded-full bg-${widget.color}-500`}
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {widget.title}
                      </div>
                      <div className="text-xs text-gray-400">
                        {widget.metricType}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {widget.visualization}
                    </Badge>
                    <NormalButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWidget(widget.id)}
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </NormalButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
              <Grid3X3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No Custom Widgets
            </h3>
            <p className="text-gray-400 mb-4">
              Create your first custom widget to track specific marketing KPIs
            </p>
            <NormalButton
              onClick={() => setIsBuilderOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Your First Widget
            </NormalButton>
          </div>
        )}
      </CardContent>
    </UltraPremiumCard>
  );
}
