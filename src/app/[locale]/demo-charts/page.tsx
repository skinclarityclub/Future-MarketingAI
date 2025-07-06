"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DashboardLayout,
  DashboardSection,
  DashboardGrid,
  DashboardCard,
} from "@/components/layout/dashboard-layout";
import {
  EnhancedLineChart,
  EnhancedAreaChart,
  EnhancedBarChart,
  EnhancedKPICard,
  ENHANCED_CHART_COLORS,
} from "@/components/charts/enhanced-base-chart-components";
import {
  RealtimeChartWrapper,
  RealtimeStatusIndicator,
} from "@/components/charts/realtime-chart-wrapper";
import {
  EnhancedChartSkeleton,
  ChartLoadingSpinner,
  ShimmerCard,
  ProgressiveLoading,
  DataLoadingState,
  ChartErrorState,
} from "@/components/charts/enhanced-loading-states";
import {
  VisualConsistencyValidator,
  useVisualConsistencyValidation,
} from "@/components/charts/visual-consistency-validator";
import { Activity, DollarSign, Users, Target, Calendar } from "lucide-react";

// Demo data
const demoLineData = [
  { date: "Jan", revenue: 4000, target: 4500, forecast: 4200 },
  { date: "Feb", revenue: 3000, target: 4500, forecast: 3800 },
  { date: "Mar", revenue: 5000, target: 4500, forecast: 4900 },
  { date: "Apr", revenue: 4500, target: 4500, forecast: 4600 },
  { date: "May", revenue: 6000, target: 4500, forecast: 5800 },
  { date: "Jun", revenue: 5500, target: 4500, forecast: 5600 },
];

const demoAreaData = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 273, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
];

const demoBarData = [
  { name: "Product A", sales: 4000, target: 3500 },
  { name: "Product B", sales: 3000, target: 3200 },
  { name: "Product C", sales: 2000, target: 2800 },
  { name: "Product D", sales: 2780, target: 2500 },
  { name: "Product E", sales: 1890, target: 2200 },
  { name: "Product F", sales: 2390, target: 2600 },
];

export default function DemoChartsPage() {
  const [loadingStates, setLoadingStates] = useState({
    kpi: false,
    line: false,
    area: false,
    bar: false,
    error: false,
    realtime: false,
  });
  const [showValidator, setShowValidator] = useState(false);

  const { validate, overallScore, isValidating } =
    useVisualConsistencyValidation("[data-chart-component]");

  const toggleLoading = (key: keyof typeof loadingStates) => {
    setLoadingStates(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const simulateError = () => {
    setLoadingStates(prev => ({ ...prev, error: !prev.error }));
  };

  return (
    <DashboardLayout>
      <DashboardSection
        title="Enhanced Charts Demo"
        description="Comprehensive showcase of chart components with loading states and visual consistency"
      >
        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Demo Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Loading State Controls */}
              <div>
                <h4 className="font-medium mb-3">Loading State Controls</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(loadingStates).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Switch
                        checked={value}
                        onCheckedChange={() =>
                          toggleLoading(key as keyof typeof loadingStates)
                        }
                        id={`loading-${key}`}
                      />
                      <label
                        htmlFor={`loading-${key}`}
                        className="text-sm font-medium capitalize cursor-pointer"
                      >
                        {key} Loading
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Validation Controls */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={showValidator}
                      onCheckedChange={setShowValidator}
                      id="show-validator"
                    />
                    <label
                      htmlFor="show-validator"
                      className="text-sm font-medium"
                    >
                      Show Consistency Validator
                    </label>
                  </div>
                  <Button
                    onClick={validate}
                    disabled={isValidating}
                    variant="outline"
                    size="sm"
                  >
                    {isValidating ? "Validating..." : "Validate Design"}
                  </Button>
                </div>
                {overallScore > 0 && (
                  <Badge variant={overallScore >= 80 ? "default" : "secondary"}>
                    Consistency Score: {overallScore}%
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards Demo */}
        <DashboardCard title="Enhanced KPI Cards" colSpan={4}>
          <DashboardGrid>
            <EnhancedKPICard
              title="Total Revenue"
              value="€524,750"
              change={{ value: 12.5, label: "vs last month", trend: "up" }}
              icon={<DollarSign className="h-5 w-5 text-primary" />}
              loading={loadingStates.kpi}
              data-chart-component="kpi"
            />
            <EnhancedKPICard
              title="Active Users"
              value="12,847"
              change={{ value: -2.1, label: "vs last week", trend: "down" }}
              icon={<Users className="h-5 w-5 text-primary" />}
              loading={loadingStates.kpi}
              data-chart-component="kpi"
            />
            <EnhancedKPICard
              title="Conversion Rate"
              value="3.4%"
              change={{ value: 0.8, label: "this month", trend: "up" }}
              icon={<Target className="h-5 w-5 text-primary" />}
              loading={loadingStates.kpi}
              data-chart-component="kpi"
            />
            <EnhancedKPICard
              title="Avg. Session"
              value="4m 32s"
              change={{ value: 0, label: "no change", trend: "neutral" }}
              icon={<Calendar className="h-5 w-5 text-primary" />}
              loading={loadingStates.kpi}
              data-chart-component="kpi"
            />
          </DashboardGrid>
        </DashboardCard>

        {/* Enhanced Line Chart Demo */}
        <DashboardCard title="Enhanced Line Chart" colSpan={4}>
          <div data-chart-component="line">
            <EnhancedLineChart
              title="Revenue Trends"
              description="Monthly revenue vs targets and forecasts"
              data={demoLineData}
              xDataKey="date"
              height={300}
              loading={loadingStates.line}
              error={loadingStates.error ? "Failed to load revenue data" : null}
              lines={[
                {
                  dataKey: "revenue",
                  name: "Actual Revenue",
                  color: ENHANCED_CHART_COLORS.primary,
                  strokeWidth: 3,
                },
                {
                  dataKey: "target",
                  name: "Target",
                  color: ENHANCED_CHART_COLORS.secondary,
                  strokeWidth: 2,
                  strokeDasharray: "5 5",
                },
                {
                  dataKey: "forecast",
                  name: "Forecast",
                  color: ENHANCED_CHART_COLORS.accent,
                  strokeWidth: 2,
                },
              ]}
              retryFn={() =>
                setLoadingStates(prev => ({ ...prev, error: false }))
              }
            />
          </div>
        </DashboardCard>

        {/* Real-time Chart Demo */}
        <DashboardCard title="Real-time Integration" colSpan={2}>
          <div className="space-y-4" data-chart-component="realtime">
            <RealtimeStatusIndicator
              isRealtime={!loadingStates.realtime}
              lastUpdated={new Date()}
              error={loadingStates.error ? "Connection failed" : null}
            />
            <RealtimeChartWrapper
              chartType="revenue"
              showRealtimeStatus={false}
            >
              {(data, loading, error) => (
                <EnhancedLineChart
                  data={data.length > 0 ? data : demoLineData}
                  xDataKey="date"
                  height={200}
                  loading={loading || loadingStates.realtime}
                  error={error}
                  showLegend={false}
                  lines={[
                    {
                      dataKey: "revenue",
                      name: "Live Revenue",
                      color: ENHANCED_CHART_COLORS.success,
                      strokeWidth: 3,
                    },
                  ]}
                />
              )}
            </RealtimeChartWrapper>
          </div>
        </DashboardCard>

        {/* Enhanced Area Chart Demo */}
        <DashboardCard title="Enhanced Area Chart" colSpan={3}>
          <div data-chart-component="area">
            <EnhancedAreaChart
              title="Traffic Sources"
              description="Desktop vs Mobile traffic over time"
              data={demoAreaData}
              xDataKey="month"
              height={250}
              loading={loadingStates.area}
              areas={[
                {
                  dataKey: "desktop",
                  name: "Desktop",
                  color: ENHANCED_CHART_COLORS.primary,
                  fillOpacity: 0.6,
                },
                {
                  dataKey: "mobile",
                  name: "Mobile",
                  color: ENHANCED_CHART_COLORS.secondary,
                  fillOpacity: 0.6,
                },
              ]}
            />
          </div>
        </DashboardCard>

        {/* Enhanced Bar Chart Demo */}
        <DashboardCard title="Enhanced Bar Chart" colSpan={3}>
          <div data-chart-component="bar">
            <EnhancedBarChart
              title="Product Performance"
              description="Sales vs targets by product"
              data={demoBarData}
              xDataKey="name"
              height={250}
              loading={loadingStates.bar}
              bars={[
                {
                  dataKey: "sales",
                  name: "Sales",
                  color: ENHANCED_CHART_COLORS.primary,
                },
                {
                  dataKey: "target",
                  name: "Target",
                  color: ENHANCED_CHART_COLORS.muted,
                },
              ]}
            />
          </div>
        </DashboardCard>

        {/* Loading States Showcase */}
        <DashboardCard title="Loading States Showcase" colSpan={4}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Skeleton Loading */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Skeleton Loading</CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedChartSkeleton
                  variant="chart"
                  type="skeleton"
                  height={150}
                  animated={true}
                />
              </CardContent>
            </Card>

            {/* Spinner Loading */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Spinner Loading</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartLoadingSpinner
                  variant="chart"
                  message="Loading chart data..."
                  size="md"
                />
              </CardContent>
            </Card>

            {/* Shimmer Loading */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Shimmer Effect</CardTitle>
              </CardHeader>
              <CardContent>
                <ShimmerCard height={150} />
              </CardContent>
            </Card>

            {/* Progressive Loading */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Progressive Loading</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressiveLoading
                  stages={[
                    "Connecting...",
                    "Loading...",
                    "Processing...",
                    "Ready!",
                  ]}
                  currentStage={1}
                />
              </CardContent>
            </Card>
          </div>
        </DashboardCard>

        {/* Error States Demo */}
        <DashboardCard title="Error States Demo" colSpan={3}>
          <ChartErrorState
            error="Failed to connect to data source. Please check your connection."
            onRetry={() => simulateError()}
            retryCount={1}
            maxRetries={3}
          />
        </DashboardCard>

        {/* Data Loading State Demo */}
        <DashboardCard title="Data Loading State" colSpan={3}>
          <DataLoadingState
            dataPoints={75}
            expectedTotal={100}
            dataSource="Supabase"
            lastUpdated={new Date(Date.now() - 5000)}
          />
        </DashboardCard>

        {/* Visual Consistency Validator */}
        {showValidator && (
          <DashboardCard title="Visual Consistency Validation" colSpan={4}>
            <VisualConsistencyValidator
              target="[data-chart-component]"
              showDetails={true}
              onValidationComplete={results => {
                console.log("Validation completed:", results);
              }}
            />
          </DashboardCard>
        )}
      </DashboardSection>
    </DashboardLayout>
  );
}
