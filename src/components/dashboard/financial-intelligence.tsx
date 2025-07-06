"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Target,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import MarketingOptimization from "./marketing-optimization";
import BudgetPerformanceTracker from "./budget-performance-tracker";
// AI Chat Widget imports
import { AIChatWidget } from "@/components/ai-assistant/ai-chat-widget";
import { ExpandableDataPanel } from "@/components/ai-assistant/expandable-data-panel";

interface FinancialMetric {
  id: string;
  metric_name: string;
  value: number;
  date: string;
  category: string;
  metadata?: Record<string, any>;
}

interface FinancialData {
  data: FinancialMetric[];
  metadata: {
    count: number;
    query_type: string;
    parameters: any;
    timestamp: string;
  };
}

export default function FinancialIntelligence() {
  const [financialData, setFinancialData] = useState<FinancialData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // AI Chat Widget state
  const [isDataPanelOpen, setIsDataPanelOpen] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/financial?type=general&limit=50");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FinancialData = await response.json();
      console.log("Financial API Response:", data);
      setFinancialData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch financial data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  // AI Chat Widget handlers
  const handleDataPanelOpen = (panelType: string) => {
    setSelectedPanel(panelType);
    setIsDataPanelOpen(true);
  };

  const handleDataPanelClose = () => {
    setIsDataPanelOpen(false);
    setSelectedPanel(null);
  };

  const calculateKPIs = () => {
    if (!financialData?.data || !Array.isArray(financialData.data)) {
      return { totalRevenue: 0, totalExpenses: 0, profit: 0, profitMargin: 0 };
    }

    const totals = financialData.data.reduce(
      (acc, item) => {
        // Add safety checks for item structure
        if (
          !item ||
          typeof item !== "object" ||
          !item.metric_name ||
          typeof item.value !== "number"
        ) {
          return acc;
        }

        const metricName = item.metric_name.toLowerCase();
        if (metricName.includes("revenue") || metricName.includes("income")) {
          acc.revenue += item.value;
        } else if (
          metricName.includes("expense") ||
          metricName.includes("cost")
        ) {
          acc.expenses += item.value;
        }
        return acc;
      },
      { revenue: 0, expenses: 0 }
    );

    const profit = totals.revenue - totals.expenses;
    const profitMargin =
      totals.revenue > 0 ? (profit / totals.revenue) * 100 : 0;

    return {
      totalRevenue: totals.revenue,
      totalExpenses: totals.expenses,
      profit,
      profitMargin,
    };
  };

  const kpis = calculateKPIs();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading financial data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Error Loading Financial Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <NormalButton
            onClick={fetchFinancialData}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </NormalButton>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Financial Intelligence Dashboard
        </h2>
        <p className="text-gray-600">
          Real-time financial performance and forecasting
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Financial Overview</TabsTrigger>
          <TabsTrigger value="marketing">Marketing Optimization</TabsTrigger>
          <TabsTrigger value="budget">Budget Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  €
                  {kpis.totalRevenue.toLocaleString("nl-NL", {
                    minimumFractionDigits: 2,
                  })}
                </div>
                <Badge variant="secondary" className="mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Revenue
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Expenses
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  €
                  {kpis.totalExpenses.toLocaleString("nl-NL", {
                    minimumFractionDigits: 2,
                  })}
                </div>
                <Badge variant="secondary" className="mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Expenses
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Net Profit
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${kpis.profit >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  €
                  {kpis.profit.toLocaleString("nl-NL", {
                    minimumFractionDigits: 2,
                  })}
                </div>
                <Badge
                  variant={kpis.profit >= 0 ? "default" : "destructive"}
                  className="mt-1"
                >
                  {kpis.profit >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  Profit
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Profit Margin
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${kpis.profitMargin >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {kpis.profitMargin.toFixed(1)}%
                </div>
                <Badge
                  variant={kpis.profitMargin >= 10 ? "default" : "secondary"}
                  className="mt-1"
                >
                  {kpis.profitMargin >= 10 ? "Healthy" : "Monitor"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Financial Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Financial Data</CardTitle>
              <CardDescription>
                Showing {financialData?.metadata.count || 0} records (
                {financialData?.metadata.query_type})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Metric</th>
                      <th className="text-left p-2">Category</th>
                      <th className="text-right p-2">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialData?.data.slice(0, 10).map((item, index) => (
                      <tr
                        key={item?.id || index}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-2">{item?.date || "N/A"}</td>
                        <td className="p-2">
                          {item?.metric_name || "Unknown"}
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">
                            {item?.category || "Other"}
                          </Badge>
                        </td>
                        <td className="p-2 text-right font-mono">
                          €
                          {(item?.value || 0).toLocaleString("nl-NL", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Data Status */}
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Last updated:{" "}
                  {financialData?.metadata.timestamp
                    ? new Date(financialData.metadata.timestamp).toLocaleString(
                        "nl-NL"
                      )
                    : "Never"}
                </span>
                <span>
                  Query type: {financialData?.metadata.query_type || "N/A"}
                </span>
                <span>Records: {financialData?.metadata.count || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Data Status */}
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Last updated:{" "}
                  {financialData?.metadata.timestamp
                    ? new Date(financialData.metadata.timestamp).toLocaleString(
                        "nl-NL"
                      )
                    : "Never"}
                </span>
                <span>
                  Query type: {financialData?.metadata.query_type || "N/A"}
                </span>
                <span>Records: {financialData?.metadata.count || 0}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing">
          <MarketingOptimization />
        </TabsContent>

        <TabsContent value="budget">
          <BudgetPerformanceTracker />
        </TabsContent>
      </Tabs>

      {/* AI Chat Widget with Expandable Data Panels */}
      <AIChatWidget
        currentPage="Financial Intelligence Dashboard"
        dashboardContext={{
          visibleMetrics: ["revenue", "expenses", "profit", "margin"],
          currentData: {
            demo: true,
            kpis: kpis,
            financialData: financialData,
          },
          userRole: "admin",
        }}
        useEnhancedIntegration={true}
        userId="financial-user"
        userRole="admin"
        userPermissions={["read", "write", "admin"]}
        onDataPanelOpen={handleDataPanelOpen}
      />

      {/* Expandable Data Panel */}
      {isDataPanelOpen && selectedPanel && (
        <ExpandableDataPanel
          isOpen={isDataPanelOpen}
          onClose={handleDataPanelClose}
          panelType={selectedPanel}
        />
      )}
    </div>
  );
}
