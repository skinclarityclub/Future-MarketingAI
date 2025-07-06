import React, { useState, useEffect } from "react";
import {
  DashboardCard,
  DashboardGrid,
} from "@/components/layout/dashboard-layout";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Clock,
  Target,
  Brain,
  Shield,
  Zap,
  Eye,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
} from "recharts";

interface ChurnPredictionData {
  totalAtRisk: number;
  riskLevels: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  predictedChurnRate: number;
  preventionOpportunities: number;
  estimatedRevenueLoss: number;
  confidence: number;
  averageRiskScore: number;
  modelInfo: {
    lastUpdate: string;
    modelType: string;
    customersAnalyzed: number;
    dataCompleteness: number;
  };
  trends?: {
    weekOverWeek: {
      totalAtRisk: number;
      critical: number;
      high: number;
      medium: number;
    };
  };
}

interface HighRiskCustomer {
  id: string;
  email: string;
  name: string;
  churnRiskScore: number;
  riskLevel: string;
  predictedChurnDate?: string;
  totalLifetimeValue: number;
  daysSinceLastPurchase: number;
  primaryConcerns: string[];
  recommendedActions: string[];
}

export function ChurnPredictionDashboard() {
  const [churnData, setChurnData] = useState<ChurnPredictionData | null>(null);
  const [highRiskCustomers, setHighRiskCustomers] = useState<
    HighRiskCustomer[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "customers" | "trends"
  >("overview");

  useEffect(() => {
    fetchChurnData();
    fetchHighRiskCustomers();
  }, []);

  const fetchChurnData = async () => {
    try {
      const response = await fetch(
        "/api/customer-intelligence?action=churn-prediction"
      );
      const result = await response.json();
      if (result.success) {
        setChurnData(result.data);
      }
    } catch (error) {
      console.error("Error fetching churn data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHighRiskCustomers = async () => {
    try {
      const response = await fetch(
        "/api/customer-intelligence/churn-prediction?action=high-risk"
      );
      const result = await response.json();
      if (result.success) {
        setHighRiskCustomers(result.data.customers);
      }
    } catch (error) {
      console.error("Error fetching high-risk customers:", error);
    }
  };

  if (loading || !churnData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const riskDistributionData = [
    {
      name: "Critical",
      value: churnData.riskLevels.critical,
      color: "#DC2626",
    },
    { name: "High", value: churnData.riskLevels.high, color: "#EA580C" },
    { name: "Medium", value: churnData.riskLevels.medium, color: "#D97706" },
    { name: "Low", value: churnData.riskLevels.low, color: "#059669" },
  ];

  const trendsData = churnData.trends
    ? [
        {
          category: "Critical",
          current: churnData.riskLevels.critical,
          change: churnData.trends.weekOverWeek.critical,
          color: "#DC2626",
        },
        {
          category: "High",
          current: churnData.riskLevels.high,
          change: churnData.trends.weekOverWeek.high,
          color: "#EA580C",
        },
        {
          category: "Medium",
          current: churnData.riskLevels.medium,
          change: churnData.trends.weekOverWeek.medium,
          color: "#D97706",
        },
      ]
    : [];

  const confidenceData = [
    {
      name: "Model Confidence",
      value: churnData.confidence * 100,
      fill: "#8B5CF6",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {[
          { id: "overview", label: "Overview", icon: Eye },
          { id: "customers", label: "High Risk Customers", icon: Users },
          { id: "trends", label: "Trends & Analytics", icon: TrendingUp },
        ].map(({ id, label, icon: Icon }) => (
          <NormalButton
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === id
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </NormalButton>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* Key Metrics */}
          <DashboardGrid>
            <DashboardCard
              title="Total At Risk"
              description="Customers with medium to critical churn risk"
              icon={<AlertTriangle className="h-4 w-4 text-orange-500" />}
            >
              <div className="space-y-2">
                <div className="text-2xl font-bold text-orange-600">
                  {churnData.totalAtRisk.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  {churnData.trends &&
                  churnData.trends.weekOverWeek.totalAtRisk < 0 ? (
                    <TrendingDown className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={
                      churnData.trends &&
                      churnData.trends.weekOverWeek.totalAtRisk < 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {churnData.trends
                      ? Math.abs(churnData.trends.weekOverWeek.totalAtRisk)
                      : 0}
                    %
                  </span>
                  <span className="text-muted-foreground">vs last week</span>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard
              title="Predicted Churn Rate"
              description="Percentage likely to churn"
              icon={<Target className="h-4 w-4 text-red-500" />}
            >
              <div className="space-y-2">
                <div className="text-2xl font-bold text-red-600">
                  {churnData.predictedChurnRate}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Based on {churnData.modelInfo.customersAnalyzed} customers
                </div>
              </div>
            </DashboardCard>

            <DashboardCard
              title="Revenue at Risk"
              description="Estimated loss from churn"
              icon={<DollarSign className="h-4 w-4 text-red-500" />}
            >
              <div className="space-y-2">
                <div className="text-2xl font-bold text-red-600">
                  ${churnData.estimatedRevenueLoss.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  From high-risk customers
                </div>
              </div>
            </DashboardCard>

            <DashboardCard
              title="Prevention Opportunities"
              description="Actionable intervention targets"
              icon={<Shield className="h-4 w-4 text-blue-500" />}
            >
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-600">
                  {churnData.preventionOpportunities}
                </div>
                <div className="text-sm text-muted-foreground">
                  Medium to high risk customers
                </div>
              </div>
            </DashboardCard>
          </DashboardGrid>

          {/* Risk Distribution and Model Info */}
          <DashboardGrid>
            <DashboardCard
              title="Risk Level Distribution"
              description="Customer churn risk breakdown"
              colSpan={3}
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [value, "Customers"]}
                      labelFormatter={label => `Risk Level: ${label}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                {riskDistributionData.map(item => (
                  <div key={item.name} className="text-center">
                    <div
                      className="w-4 h-4 rounded mx-auto mb-1"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>

            <DashboardCard
              title="Model Performance"
              description="AI prediction accuracy & confidence"
              icon={<Brain className="h-4 w-4 text-purple-500" />}
            >
              <div className="space-y-4">
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="40%"
                      outerRadius="80%"
                      data={confidenceData}
                    >
                      <RadialBar
                        dataKey="value"
                        cornerRadius={10}
                        fill="#8B5CF6"
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(churnData.confidence * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Confidence
                  </div>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div>Model: {churnData.modelInfo.modelType}</div>
                  <div>
                    Updated:{" "}
                    {new Date(
                      churnData.modelInfo.lastUpdate
                    ).toLocaleDateString()}
                  </div>
                  <div>
                    Avg Risk Score:{" "}
                    {(churnData.averageRiskScore * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </DashboardCard>
          </DashboardGrid>
        </>
      )}

      {/* High Risk Customers Tab */}
      {activeTab === "customers" && (
        <DashboardCard
          title="High-Risk Customers"
          description="Customers requiring immediate attention"
          icon={<Users className="h-4 w-4 text-red-500" />}
        >
          <div className="space-y-4">
            {highRiskCustomers.map(customer => (
              <div
                key={customer.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        customer.riskLevel === "critical"
                          ? "bg-red-500"
                          : "bg-orange-500"
                      }`}
                    />
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {customer.email}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">
                      {(customer.churnRiskScore * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {customer.riskLevel} Risk
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">LTV:</span>
                    <span className="ml-2 font-medium">
                      ${customer.totalLifetimeValue.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Days since purchase:
                    </span>
                    <span className="ml-2 font-medium">
                      {customer.daysSinceLastPurchase}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="text-sm font-medium text-red-600 mb-1">
                      Primary Concerns:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {customer.primaryConcerns.map((concern, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded"
                        >
                          {concern}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-blue-600 mb-1">
                      Recommended Actions:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {customer.recommendedActions.map((action, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                        >
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {customer.predictedChurnDate && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <Clock className="h-4 w-4" />
                      Predicted churn:{" "}
                      {new Date(
                        customer.predictedChurnDate
                      ).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DashboardCard>
      )}

      {/* Trends Tab */}
      {activeTab === "trends" && (
        <DashboardGrid>
          <DashboardCard
            title="Risk Level Trends"
            description="Week-over-week changes in risk distribution"
            colSpan={4}
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendsData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis dataKey="category" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      name === "current"
                        ? value
                        : `${value > 0 ? "+" : ""}${value}%`,
                      name === "current" ? "Current Count" : "Week Change",
                    ]}
                  />
                  <Bar dataKey="current" fill="#8B5CF6" name="current" />
                  <Bar dataKey="change" fill="#06B6D4" name="change" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>
        </DashboardGrid>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Zap className="h-4 w-4" />
          Predictions updated every 24 hours
        </div>
        <div className="flex gap-2">
          <NormalButton className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            Run Batch Prediction
          </NormalButton>
          <NormalButton className="px-4 py-2 border rounded-md hover:bg-muted transition-colors">
            Export Report
          </NormalButton>
        </div>
      </div>
    </div>
  );
}
