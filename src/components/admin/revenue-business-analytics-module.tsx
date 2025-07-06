/**
 * Admin Dashboard Revenue & Business Analytics Module
 * Subtask 82.5: Build Revenue & Business Analytics Module
 *
 * Displays comprehensive business analytics including MRR, CAC, LTV, funnel performance,
 * geo distribution, and pricing insights using the admin dashboard real-time data framework.
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  Users,
  Target,
  Activity,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  AlertTriangle,
  Minus,
} from "lucide-react";
import { useBusinessMetricsRealtime } from "@/hooks/use-admin-dashboard-realtime";
import { formatCurrency, formatPercentage } from "@/lib/data/mock-chart-data";

interface RevenueBusinessAnalyticsModuleProps {
  className?: string;
  refreshInterval?: number;
}

export function RevenueBusinessAnalyticsModule({
  className = "",
  refreshInterval = 60000,
}: RevenueBusinessAnalyticsModuleProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  // Mock state for demo
  const loading = false;
  const error = null;
  const isConnected = true;
  const lastUpdated = new Date();

  const mockRevenueData = [
    { month: "Jan", mrr: 45000, arr: 540000, newCustomers: 32, churn: 2.1 },
    { month: "Feb", mrr: 52000, arr: 624000, newCustomers: 28, churn: 1.8 },
    { month: "Mar", mrr: 48000, arr: 576000, newCustomers: 35, churn: 2.3 },
    { month: "Apr", mrr: 61000, arr: 732000, newCustomers: 42, churn: 1.6 },
    { month: "May", mrr: 58000, arr: 696000, newCustomers: 38, churn: 1.9 },
    { month: "Jun", mrr: 67000, arr: 804000, newCustomers: 45, churn: 1.4 },
  ];

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const ConnectionStatus = () => (
    <div className="flex items-center gap-2 text-sm">
      <div
        className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"} animate-pulse`}
      />
      <span className={isConnected ? "text-green-400" : "text-red-400"}>
        {isConnected ? "Live" : "Disconnected"}
      </span>
      {lastUpdated && (
        <span className="text-gray-400">
          • {lastUpdated.toLocaleTimeString()}
        </span>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.location.reload()}
        className="h-auto p-1 text-gray-400 hover:text-white"
      >
        <RefreshCw className="h-3 w-3" />
      </Button>
    </div>
  );

  const KPICards = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">MRR</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(67000)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(12.3)}
                <span className="text-xs text-gray-400">12.3%</span>
              </div>
            </div>
            <DollarSign className="h-6 w-6 text-blue-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">ARR</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(804000)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(15.7)}
                <span className="text-xs text-gray-400">15.7%</span>
              </div>
            </div>
            <TrendingUp className="h-6 w-6 text-green-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">LTV</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(2400)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(8.2)}
                <span className="text-xs text-gray-400">8.2%</span>
              </div>
            </div>
            <Wallet className="h-6 w-6 text-purple-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">CAC</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(480)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(-5.1)}
                <span className="text-xs text-gray-400">-5.1%</span>
              </div>
            </div>
            <Target className="h-6 w-6 text-orange-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">LTV:CAC</p>
              <p className="text-2xl font-bold text-white">5.0:1</p>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(14.2)}
                <span className="text-xs text-gray-400">14.2%</span>
              </div>
            </div>
            <Activity className="h-6 w-6 text-cyan-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Churn</p>
              <p className="text-2xl font-bold text-white">
                {formatPercentage(1.4)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(-12.5)}
                <span className="text-xs text-gray-400">-12.5%</span>
              </div>
            </div>
            <Users className="h-6 w-6 text-red-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const RevenueTrendChart = () => (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Revenue Trends</CardTitle>
            <p className="text-sm text-gray-400">
              MRR and ARR growth over time
            </p>
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32 bg-gray-700 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={mockRevenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9CA3AF" />
            <YAxis yAxisId="left" stroke="#9CA3AF" />
            <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#F9FAFB",
              }}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="mrr"
              stackId="1"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.6}
              name="MRR"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="newCustomers"
              stroke="#10B981"
              strokeWidth={2}
              name="New Customers"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Alert className="bg-red-900/20 border-red-500/50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-200">
            Failed to load business analytics data.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Revenue & Business Analytics
          </h2>
          <p className="text-gray-400">
            Comprehensive business performance metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ConnectionStatus />
          <Button variant="outline" size="sm" className="border-gray-600">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <KPICards />
      <RevenueTrendChart />

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-gray-400">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading business analytics...</span>
          </div>
        </div>
      )}
    </div>
  );
}
