"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import { useLocale } from "@/lib/i18n/context"; // Removed for pages outside locale directory
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Target,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Settings,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Clock,
  Users,
  Building,
  Briefcase,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ComposedChart,
  Legend,
  ScatterChart,
  Scatter,
} from "recharts";
import { ErrorBoundary } from "@/components/ui/error-boundary";

// Safe formatting functions to prevent [object Event] errors
function formatCurrency(value: unknown): string {
  if (value === null || value === undefined || typeof value === "object") {
    return "€0";
  }
  const numValue =
    typeof value === "string" ? parseFloat(value) : Number(value);
  if (isNaN(numValue)) {
    return "€0";
  }
  return `€${numValue.toLocaleString("nl-NL")}`;
}

function formatNumber(value: unknown): string {
  if (value === null || value === undefined || typeof value === "object") {
    return "0";
  }
  const numValue =
    typeof value === "string" ? parseFloat(value) : Number(value);
  if (isNaN(numValue)) {
    return "0";
  }
  return numValue.toLocaleString("nl-NL");
}

interface BudgetItem {
  id: string;
  category: string;
  department: string;
  subcategory: string;
  budgeted_amount: number;
  actual_amount: number;
  variance: number;
  variance_percentage: number;
  period: string;
  status: "on_track" | "over_budget" | "under_budget" | "critical";
  forecast: number;
  ytd_budgeted: number;
  ytd_actual: number;
  last_updated: string;
  responsible_person: string;
  notes?: string;
  tags: string[];
}

interface BudgetSummary {
  total_budgeted: number;
  total_actual: number;
  total_variance: number;
  variance_percentage: number;
  categories_over_budget: number;
  categories_under_budget: number;
  categories_on_track: number;
  forecast_accuracy: number;
  period: string;
}

interface ForecastData {
  period: string;
  budgeted: number;
  actual: number;
  forecast: number;
  confidence_interval_low: number;
  confidence_interval_high: number;
}

interface VarianceAlert {
  id: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  variance_amount: number;
  recommended_action: string;
  created_at: string;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
];

// Enterprise mock data with comprehensive budget tracking
const mockBudgetData: BudgetItem[] = [
  {
    id: "1",
    category: "Marketing",
    department: "Marketing & Sales",
    subcategory: "Digital Advertising",
    budgeted_amount: 50000,
    actual_amount: 47500,
    variance: -2500,
    variance_percentage: -5.0,
    period: "2024-Q1",
    status: "under_budget",
    forecast: 48000,
    ytd_budgeted: 150000,
    ytd_actual: 142500,
    last_updated: "2024-01-15T10:30:00Z",
    responsible_person: "Sarah Johnson",
    notes: "Optimized ad spend resulted in cost savings",
    tags: ["digital", "advertising", "performance"],
  },
  {
    id: "2",
    category: "Operations",
    department: "Operations",
    subcategory: "Software Licenses",
    budgeted_amount: 25000,
    actual_amount: 28500,
    variance: 3500,
    variance_percentage: 14.0,
    period: "2024-Q1",
    status: "over_budget",
    forecast: 29000,
    ytd_budgeted: 75000,
    ytd_actual: 85500,
    last_updated: "2024-01-14T14:20:00Z",
    responsible_person: "Mike Chen",
    notes: "Additional licenses required for new team members",
    tags: ["software", "licenses", "tools"],
  },
  {
    id: "3",
    category: "Human Resources",
    department: "HR",
    subcategory: "Recruitment",
    budgeted_amount: 15000,
    actual_amount: 15200,
    variance: 200,
    variance_percentage: 1.3,
    period: "2024-Q1",
    status: "on_track",
    forecast: 15100,
    ytd_budgeted: 45000,
    ytd_actual: 45600,
    last_updated: "2024-01-13T09:15:00Z",
    responsible_person: "Lisa Wang",
    notes: "Recruitment costs within expected range",
    tags: ["recruitment", "hiring", "talent"],
  },
  {
    id: "4",
    category: "Technology",
    department: "IT",
    subcategory: "Cloud Infrastructure",
    budgeted_amount: 35000,
    actual_amount: 42000,
    variance: 7000,
    variance_percentage: 20.0,
    period: "2024-Q1",
    status: "critical",
    forecast: 43000,
    ytd_budgeted: 105000,
    ytd_actual: 126000,
    last_updated: "2024-01-16T16:45:00Z",
    responsible_person: "David Rodriguez",
    notes: "Unexpected scaling requirements due to increased usage",
    tags: ["cloud", "infrastructure", "scaling"],
  },
  {
    id: "5",
    category: "Sales",
    department: "Marketing & Sales",
    subcategory: "Travel & Entertainment",
    budgeted_amount: 20000,
    actual_amount: 18500,
    variance: -1500,
    variance_percentage: -7.5,
    period: "2024-Q1",
    status: "under_budget",
    forecast: 19000,
    ytd_budgeted: 60000,
    ytd_actual: 55500,
    last_updated: "2024-01-12T11:30:00Z",
    responsible_person: "Emma Thompson",
    notes: "Reduced travel due to virtual meetings",
    tags: ["travel", "entertainment", "client"],
  },
];

const mockForecastData: ForecastData[] = [
  {
    period: "Jan",
    budgeted: 45000,
    actual: 43200,
    forecast: 44000,
    confidence_interval_low: 42000,
    confidence_interval_high: 46000,
  },
  {
    period: "Feb",
    budgeted: 47000,
    actual: 48500,
    forecast: 47500,
    confidence_interval_low: 45500,
    confidence_interval_high: 49500,
  },
  {
    period: "Mar",
    budgeted: 50000,
    actual: 49800,
    forecast: 50200,
    confidence_interval_low: 48200,
    confidence_interval_high: 52200,
  },
  {
    period: "Apr",
    budgeted: 52000,
    actual: 0,
    forecast: 51500,
    confidence_interval_low: 49500,
    confidence_interval_high: 53500,
  },
  {
    period: "May",
    budgeted: 54000,
    actual: 0,
    forecast: 53800,
    confidence_interval_low: 51800,
    confidence_interval_high: 55800,
  },
  {
    period: "Jun",
    budgeted: 56000,
    actual: 0,
    forecast: 56200,
    confidence_interval_low: 54200,
    confidence_interval_high: 58200,
  },
];

const mockVarianceAlerts: VarianceAlert[] = [
  {
    id: "1",
    category: "Technology - Cloud Infrastructure",
    severity: "critical",
    message: "Cloud infrastructure costs are 20% over budget",
    variance_amount: 7000,
    recommended_action:
      "Review scaling policies and optimize resource allocation",
    created_at: "2024-01-16T16:45:00Z",
  },
  {
    id: "2",
    category: "Operations - Software Licenses",
    severity: "medium",
    message: "Software license costs exceeded budget by 14%",
    variance_amount: 3500,
    recommended_action: "Audit license usage and negotiate volume discounts",
    created_at: "2024-01-14T14:20:00Z",
  },
];

export default function BudgetPerformanceTracker() {
  // const { t } = useLocale(); // Removed for pages outside locale directory
  const [budgetData, setBudgetData] = useState<BudgetItem[]>(mockBudgetData);
  const [forecastData] = useState<ForecastData[]>(mockForecastData);
  const [alerts] = useState<VarianceAlert[]>(mockVarianceAlerts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("2024-Q1");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [viewMode, setViewMode] = useState("summary");

  // Calculate summary metrics
  const calculateSummary = (): BudgetSummary => {
    const filteredData = budgetData.filter(
      item => selectedPeriod === "all" || item.period === selectedPeriod
    );

    const totalBudgeted = filteredData.reduce(
      (sum, item) => sum + item.budgeted_amount,
      0
    );
    const totalActual = filteredData.reduce(
      (sum, item) => sum + item.actual_amount,
      0
    );
    const totalVariance = totalActual - totalBudgeted;
    const variancePercentage =
      totalBudgeted > 0 ? (totalVariance / totalBudgeted) * 100 : 0;

    const categoriesOverBudget = filteredData.filter(
      item => item.status === "over_budget" || item.status === "critical"
    ).length;
    const categoriesUnderBudget = filteredData.filter(
      item => item.status === "under_budget"
    ).length;
    const categoriesOnTrack = filteredData.filter(
      item => item.status === "on_track"
    ).length;

    return {
      total_budgeted: totalBudgeted,
      total_actual: totalActual,
      total_variance: totalVariance,
      variance_percentage: variancePercentage,
      categories_over_budget: categoriesOverBudget,
      categories_under_budget: categoriesUnderBudget,
      categories_on_track: categoriesOnTrack,
      forecast_accuracy: 92.5,
      period: selectedPeriod,
    };
  };

  const summary = calculateSummary();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on_track":
        return "text-green-600";
      case "under_budget":
        return "text-blue-600";
      case "over_budget":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "on_track":
        return "default";
      case "under_budget":
        return "secondary";
      case "over_budget":
        return "outline";
      case "critical":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <ArrowUpRight className="h-4 w-4 text-red-500" />;
    if (variance < 0)
      return <ArrowDownRight className="h-4 w-4 text-green-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "medium":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <ErrorBoundary
      componentName="BudgetPerformanceTracker"
      enableReporting={true}
    >
      <div className="space-y-6">
        {/* Header with Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">
              Budget Performance Tracker
            </h2>
            <p className="text-gray-300">
              Enterprise budget vs. actual analysis with forecasting and
              variance alerts
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                <SelectItem value="2024-Q1">Q1 2024</SelectItem>
                <SelectItem value="2024-Q2">Q2 2024</SelectItem>
                <SelectItem value="2024-Q3">Q3 2024</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedDepartment}
              onValueChange={setSelectedDepartment}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Marketing & Sales">
                  Marketing & Sales
                </SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
              </SelectContent>
            </Select>

            <NormalButton variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </NormalButton>

            <NormalButton variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </NormalButton>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">
                                          Budgeted
              </CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                €{summary.total_budgeted?.toLocaleString("nl-NL") || "0"}
              </div>
              <Badge
                variant="secondary"
                className="mt-1 bg-blue-200 text-blue-800"
              >
                Planned Spend
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">
                                          Actual
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                €{summary.total_actual?.toLocaleString("nl-NL") || "0"}
              </div>
              <Badge
                variant="secondary"
                className="mt-1 bg-green-200 text-green-800"
              >
                Actual Spend
              </Badge>
            </CardContent>
          </Card>

          <Card
            className={`bg-gradient-to-br ${summary.total_variance >= 0 ? "from-red-50 to-red-100 border-red-200" : "from-emerald-50 to-emerald-100 border-emerald-200"}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className={`text-sm font-medium ${summary.total_variance >= 0 ? "text-red-800" : "text-emerald-800"}`}
              >
                Total Variance
              </CardTitle>
              {getVarianceIcon(summary.total_variance)}
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${summary.total_variance >= 0 ? "text-red-900" : "text-emerald-900"}`}
              >
                €{Math.abs(summary.total_variance || 0).toLocaleString("nl-NL")}
              </div>
              <Badge
                variant={
                  summary.total_variance >= 0 ? "destructive" : "default"
                }
                className="mt-1"
              >
                {summary.variance_percentage.toFixed(1)}%{" "}
                {summary.total_variance >= 0 ? "Over" : "Under"}
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">
                Forecast Accuracy
              </CardTitle>
              <Zap className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {summary.forecast_accuracy}%
              </div>
              <Badge
                variant="secondary"
                className="mt-1 bg-purple-200 text-purple-800"
              >
                Prediction Quality
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Budget vs. Actual Trend</CardTitle>
                  <CardDescription>
                    Monthly comparison with forecast projection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={forecastData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any) => [formatCurrency(value), ""]}
                      />
                      <Legend />
                      <Bar dataKey="budgeted" fill="#8884d8" name="Budgeted" />
                      <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
                      <Line
                        type="monotone"
                        dataKey="forecast"
                        stroke="#ff7300"
                        name="Forecast"
                        strokeWidth={2}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Performance Distribution</CardTitle>
                  <CardDescription>
                    Budget status across all categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">On Track</span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={
                            (summary.categories_on_track / budgetData.length) *
                            100
                          }
                          className="w-24 h-2"
                        />
                        <span className="text-sm text-gray-600">
                          {summary.categories_on_track}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Under Budget</span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={
                            (summary.categories_under_budget /
                              budgetData.length) *
                            100
                          }
                          className="w-24 h-2"
                        />
                        <span className="text-sm text-gray-600">
                          {summary.categories_under_budget}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Over Budget</span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={
                            (summary.categories_over_budget /
                              budgetData.length) *
                            100
                          }
                          className="w-24 h-2"
                        />
                        <span className="text-sm text-gray-600">
                          {summary.categories_over_budget}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid gap-4">
              {budgetData.map(item => (
                <Card
                  key={item.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-800/50 border border-gray-600/30">
                          <Briefcase className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {item.category}
                          </CardTitle>
                          <CardDescription>
                            {item.department} • {item.subcategory}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadge(item.status)}>
                          {item.status.replace("_", " ")}
                        </Badge>
                        {getVarianceIcon(item.variance)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Budgeted</p>
                        <p className="font-semibold">
                          €{item.budgeted_amount.toLocaleString("nl-NL")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Actual</p>
                        <p className="font-semibold">
                          €{item.actual_amount.toLocaleString("nl-NL")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Variance</p>
                        <p
                          className={`font-semibold ${item.variance >= 0 ? "text-red-600" : "text-green-600"}`}
                        >
                          €{Math.abs(item.variance).toLocaleString("nl-NL")} (
                          {item.variance_percentage.toFixed(1)}%)
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Forecast</p>
                        <p className="font-semibold">
                          €{item.forecast.toLocaleString("nl-NL")}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Budget Utilization</span>
                        <span>
                          {(
                            (item.actual_amount / item.budgeted_amount) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          (item.actual_amount / item.budgeted_amount) * 100
                        }
                        className="h-2"
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                      <span>Responsible: {item.responsible_person}</span>
                      <span>
                        Updated:{" "}
                        {new Date(item.last_updated).toLocaleDateString(
                          "nl-NL"
                        )}
                      </span>
                    </div>

                    {item.notes && (
                      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-600/30">
                        <p className="text-sm text-gray-700">{item.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="forecasting" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Forecasting Model</CardTitle>
                <CardDescription>
                  Predictive analysis with confidence intervals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => [formatCurrency(value), ""]}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="confidence_interval_high"
                      stackId="1"
                      stroke="none"
                      fill="#e3f2fd"
                      fillOpacity={0.3}
                      name="Confidence Interval"
                    />
                    <Area
                      type="monotone"
                      dataKey="confidence_interval_low"
                      stackId="1"
                      stroke="none"
                      fill="#ffffff"
                      fillOpacity={1}
                    />
                    <Line
                      type="monotone"
                      dataKey="budgeted"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="Budgeted"
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name="Actual"
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      stroke="#ff7300"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      name="Forecast"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <div className="grid gap-4">
              {alerts.map(alert => (
                <Card
                  key={alert.id}
                  className={`border-l-4 ${
                    alert.severity === "critical"
                      ? "border-l-red-500 bg-red-50"
                      : alert.severity === "high"
                        ? "border-l-orange-500 bg-orange-50"
                        : alert.severity === "medium"
                          ? "border-l-yellow-500 bg-yellow-50"
                          : "border-l-blue-500 bg-blue-50"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {getSeverityIcon(alert.severity)}
                        {alert.category}
                      </CardTitle>
                      <Badge
                        variant={
                          alert.severity === "critical"
                            ? "destructive"
                            : alert.severity === "high"
                              ? "destructive"
                              : alert.severity === "medium"
                                ? "outline"
                                : "secondary"
                        }
                      >
                        {alert.severity} priority
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">{alert.message}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Variance Amount</p>
                        <p className="font-semibold text-red-600">
                          €{alert.variance_amount.toLocaleString("nl-NL")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Created</p>
                        <p className="font-semibold">
                          {new Date(alert.created_at).toLocaleDateString(
                            "nl-NL"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-600/30">
                      <p className="text-sm font-medium text-gray-800 mb-1">
                        Recommended Action:
                      </p>
                      <p className="text-sm text-gray-700">
                        {alert.recommended_action}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Variance Analysis</CardTitle>
                  <CardDescription>
                    Budget variance distribution by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={budgetData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any) => [
                          formatCurrency(value),
                          "Variance",
                        ]}
                      />
                      <Bar dataKey="variance" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Spending</CardTitle>
                  <CardDescription>
                    Actual spending by department
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={budgetData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ department, percent }) =>
                          `${department} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="actual_amount"
                      >
                        {budgetData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => [
                          formatCurrency(value),
                          "Actual Spend",
                        ]}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}
