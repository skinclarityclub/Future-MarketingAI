"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  BarChart3,
  Target,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Calendar,
  Users,
  DollarSign,
  Activity,
  ChevronRight,
  Info,
  Settings,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TestConclusion,
  WinnerSelection,
  ImplementationPlan,
  ImplementationPhase,
  RiskAssessment,
  BusinessImpact,
  RollbackPlan,
  TestConclusionEngine,
  createTestConclusionEngine,
} from "@/lib/ab-testing/test-conclusion-engine";
import {
  VariantData,
  StatisticalSignificanceEngine,
  PerformanceMonitor,
} from "@/lib/ab-testing/statistical-engine";

interface WinnerImplementationProps {
  testId: string;
  variants: VariantData[];
  onImplementation?: (conclusion: TestConclusion) => void;
  onRollback?: (testId: string) => void;
  className?: string;
}

interface ImplementationStatus {
  phase: string;
  progress: number;
  startTime: Date | null;
  currentPhase: ImplementationPhase | null;
  alerts: ImplementationAlert[];
  metrics: ImplementationMetrics;
  isActive: boolean;
  isPaused: boolean;
}

interface ImplementationAlert {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

interface ImplementationMetrics {
  conversionRate: number;
  conversionRateChange: number;
  revenue: number;
  revenueChange: number;
  errorRate: number;
  errorRateChange: number;
  userSatisfaction: number;
  userSatisfactionChange: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function WinnerImplementation({
  testId,
  variants,
  onImplementation,
  onRollback,
  className,
}: WinnerImplementationProps) {
  const [conclusion, setConclusion] = useState<TestConclusion | null>(null);
  const [implementationStatus, setImplementationStatus] =
    useState<ImplementationStatus | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isImplementing, setIsImplementing] = useState(false);
  const [showConclusionDialog, setShowConclusionDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");

  // Mock historical data for implementation monitoring
  const [implementationHistory, setImplementationHistory] = useState<any[]>([]);

  // Initialize conclusion engine
  const conclusionEngine = React.useMemo(() => {
    const statisticalEngine = new StatisticalSignificanceEngine();
    const performanceMonitor = new PerformanceMonitor();
    return createTestConclusionEngine(statisticalEngine, performanceMonitor);
  }, []);

  /**
   * Evaluate test for conclusion
   */
  const evaluateTestConclusion = useCallback(async () => {
    setIsEvaluating(true);
    try {
      const testConclusion = await conclusionEngine.evaluateTestConclusion(
        testId,
        variants
      );
      setConclusion(testConclusion);

      if (testConclusion && testConclusion.selectedWinner) {
        setShowConclusionDialog(true);
      }
    } catch (error) {
      console.error("Error evaluating test conclusion:", error);
    } finally {
      setIsEvaluating(false);
    }
  }, [conclusionEngine, testId, variants]);

  /**
   * Start implementation process
   */
  const startImplementation = useCallback(async () => {
    if (!conclusion?.selectedWinner) return;

    setIsImplementing(true);
    setShowConclusionDialog(false);

    // Initialize implementation status
    const firstPhase = conclusion.implementationPlan.phases[0];
    setImplementationStatus({
      phase: firstPhase?.id || "initialization",
      progress: 0,
      startTime: new Date(),
      currentPhase: firstPhase || null,
      alerts: [
        {
          id: `alert-${Date.now()}`,
          type: "info",
          title: "Implementation Started",
          message: `Started ${conclusion.implementationPlan.strategy} rollout for ${conclusion.selectedWinner.variantName}`,
          timestamp: new Date(),
          isRead: false,
        },
      ],
      metrics: generateBaselineMetrics(variants),
      isActive: true,
      isPaused: false,
    });

    // Simulate implementation progress
    simulateImplementationProgress(conclusion.implementationPlan);

    onImplementation?.(conclusion);
  }, [conclusion, variants, onImplementation]);

  /**
   * Simulate implementation progress
   */
  const simulateImplementationProgress = (plan: ImplementationPlan) => {
    let currentPhaseIndex = 0;
    let progress = 0;

    const updateProgress = () => {
      const currentPhase = plan.phases[currentPhaseIndex];
      if (!currentPhase) return;

      progress += 2; // 2% per update

      if (progress >= 100) {
        currentPhaseIndex++;
        progress = 0;

        if (currentPhaseIndex >= plan.phases.length) {
          // Implementation complete
          setImplementationStatus(prev =>
            prev
              ? {
                  ...prev,
                  progress: 100,
                  isActive: false,
                  alerts: [
                    ...prev.alerts,
                    {
                      id: `alert-${Date.now()}`,
                      type: "success",
                      title: "Implementation Complete",
                      message:
                        "Winner variant successfully deployed to 100% of traffic",
                      timestamp: new Date(),
                      isRead: false,
                    },
                  ],
                }
              : null
          );
          return;
        }
      }

      const nextPhase = plan.phases[currentPhaseIndex];
      setImplementationStatus(prev =>
        prev
          ? {
              ...prev,
              phase: nextPhase?.id || "complete",
              progress,
              currentPhase: nextPhase || null,
              metrics: generateProgressMetrics(prev.metrics, progress),
            }
          : null
      );

      // Generate random alerts occasionally
      if (Math.random() < 0.1) {
        const alertTypes: ImplementationAlert["type"][] = ["info", "warning"];
        const randomType =
          alertTypes[Math.floor(Math.random() * alertTypes.length)];

        setImplementationStatus(prev =>
          prev
            ? {
                ...prev,
                alerts: [
                  ...prev.alerts,
                  {
                    id: `alert-${Date.now()}`,
                    type: randomType,
                    title:
                      randomType === "warning"
                        ? "Performance Notice"
                        : "Progress Update",
                    message:
                      randomType === "warning"
                        ? "Minor variation in conversion rate detected"
                        : `Phase ${currentPhaseIndex + 1} progressing normally`,
                    timestamp: new Date(),
                    isRead: false,
                  },
                ],
              }
            : null
        );
      }

      // Continue progress
      setTimeout(updateProgress, 1000); // Update every second
    };

    setTimeout(updateProgress, 1000);
  };

  /**
   * Generate baseline metrics
   */
  const generateBaselineMetrics = (
    variants: VariantData[]
  ): ImplementationMetrics => {
    const controlVariant = variants.find(v => v.isControl);
    if (!controlVariant) {
      return {
        conversionRate: 0.05,
        conversionRateChange: 0,
        revenue: 50000,
        revenueChange: 0,
        errorRate: 0.02,
        errorRateChange: 0,
        userSatisfaction: 4.2,
        userSatisfactionChange: 0,
      };
    }

    const conversionRate =
      controlVariant.metrics.conversions / controlVariant.metrics.impressions;
    return {
      conversionRate,
      conversionRateChange: 0,
      revenue: controlVariant.metrics.revenue,
      revenueChange: 0,
      errorRate: 0.02, // Mock error rate
      errorRateChange: 0,
      userSatisfaction: 4.2, // Mock satisfaction
      userSatisfactionChange: 0,
    };
  };

  /**
   * Generate progress metrics
   */
  const generateProgressMetrics = (
    baseline: ImplementationMetrics,
    progress: number
  ): ImplementationMetrics => {
    const improvement = (progress / 100) * 0.15; // 15% improvement at completion
    const variance = (Math.random() - 0.5) * 0.02; // Small random variance

    return {
      conversionRate: baseline.conversionRate * (1 + improvement + variance),
      conversionRateChange: (improvement + variance) * 100,
      revenue: baseline.revenue * (1 + improvement + variance),
      revenueChange: (improvement + variance) * 100,
      errorRate: baseline.errorRate * (1 - improvement * 0.5 + variance),
      errorRateChange: -(improvement * 0.5 - variance) * 100,
      userSatisfaction: Math.min(
        5,
        baseline.userSatisfaction * (1 + improvement * 0.1 + variance * 0.1)
      ),
      userSatisfactionChange: (improvement * 0.1 + variance * 0.1) * 100,
    };
  };

  /**
   * Pause implementation
   */
  const pauseImplementation = () => {
    setImplementationStatus(prev =>
      prev
        ? {
            ...prev,
            isPaused: true,
            alerts: [
              ...prev.alerts,
              {
                id: `alert-${Date.now()}`,
                type: "warning",
                title: "Implementation Paused",
                message: "Implementation has been manually paused",
                timestamp: new Date(),
                isRead: false,
              },
            ],
          }
        : null
    );
  };

  /**
   * Resume implementation
   */
  const resumeImplementation = () => {
    if (!conclusion) return;
    setImplementationStatus(prev =>
      prev
        ? {
            ...prev,
            isPaused: false,
            alerts: [
              ...prev.alerts,
              {
                id: `alert-${Date.now()}`,
                type: "info",
                title: "Implementation Resumed",
                message: "Implementation has been resumed",
                timestamp: new Date(),
                isRead: false,
              },
            ],
          }
        : null
    );
    simulateImplementationProgress(conclusion.implementationPlan);
  };

  /**
   * Rollback implementation
   */
  const rollbackImplementation = () => {
    setImplementationStatus(prev =>
      prev
        ? {
            ...prev,
            isActive: false,
            isPaused: false,
            alerts: [
              ...prev.alerts,
              {
                id: `alert-${Date.now()}`,
                type: "error",
                title: "Implementation Rolled Back",
                message: "Traffic has been restored to control variant",
                timestamp: new Date(),
                isRead: false,
              },
            ],
          }
        : null
    );
    onRollback?.(testId);
  };

  // Auto-evaluate on mount and when variants change
  useEffect(() => {
    evaluateTestConclusion();
  }, [evaluateTestConclusion]);

  // Generate mock implementation history
  useEffect(() => {
    if (implementationStatus?.isActive) {
      const history = Array.from({ length: 24 }, (_, i) => ({
        time: new Date(Date.now() - (23 - i) * 60000).toLocaleTimeString(),
        conversionRate: 0.045 + Math.random() * 0.01,
        revenue: 45000 + Math.random() * 10000,
        errorRate: 0.015 + Math.random() * 0.005,
        traffic: Math.min(100, (i + 1) * 4.2), // Gradual traffic increase
      }));
      setImplementationHistory(history);
    }
  }, [implementationStatus?.isActive]);

  const getRiskBadgeColor = (score: number) => {
    if (score < 30) return "bg-green-100 text-green-700";
    if (score < 60) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const getMetricChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-400" />;
  };

  if (!conclusion) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Test Conclusion & Winner Implementation
          </CardTitle>
          <CardDescription>
            Evaluating test results for automatic conclusion and winner
            selection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">
                {isEvaluating
                  ? "Evaluating test conclusion..."
                  : "Ready to evaluate test"}
              </p>
              {!isEvaluating && (
                <NormalButton onClick={evaluateTestConclusion} className="mt-4">
                  <Target className="h-4 w-4 mr-2" />
                  Evaluate Test Conclusion
                </NormalButton>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Test Conclusion Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Test Concluded
              </CardTitle>
              <CardDescription>{conclusion.conclusionReason}</CardDescription>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              {conclusion.confidence.toFixed(1)}% Confidence
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-600" />
                <span className="font-medium">Selected Winner</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {conclusion.selectedWinner?.variantName || "No Winner"}
              </p>
              <p className="text-sm text-muted-foreground">
                {conclusion.selectedWinner?.selectionReason}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Expected Improvement</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {conclusion.selectedWinner?.expectedImprovement.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">
                Revenue Impact: $
                {conclusion.businessImpact.revenueImpact.toLocaleString()}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Risk Assessment</span>
              </div>
              <Badge
                className={getRiskBadgeColor(
                  conclusion.riskAssessment.overallRiskScore
                )}
              >
                {conclusion.riskAssessment.overallRiskScore.toFixed(0)}/100
              </Badge>
              <p className="text-sm text-muted-foreground">
                Strategy: {conclusion.selectedWinner?.implementationStrategy}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Status */}
      {implementationStatus && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Implementation Status
              </CardTitle>
              <div className="flex items-center gap-2">
                {implementationStatus.isActive &&
                  !implementationStatus.isPaused && (
                    <NormalButton
                      size="sm"
                      variant="outline"
                      onClick={pauseImplementation}
                    >
                      <PauseCircle className="h-4 w-4 mr-2" />
                      Pause
                    </NormalButton>
                  )}
                {implementationStatus.isPaused && (
                  <NormalButton
                    size="sm"
                    variant="outline"
                    onClick={resumeImplementation}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Resume
                  </NormalButton>
                )}
                <NormalButton
                  size="sm"
                  variant="destructive"
                  onClick={rollbackImplementation}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Rollback
                </NormalButton>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {implementationStatus.currentPhase?.name || "Complete"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {implementationStatus.progress.toFixed(0)}%
                  </span>
                </div>
                <Progress
                  value={implementationStatus.progress}
                  className="h-2"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="h-4 w-4 text-blue-600" />
                    {getMetricChangeIcon(
                      implementationStatus.metrics.conversionRateChange
                    )}
                  </div>
                  <p className="text-2xl font-bold">
                    {(
                      implementationStatus.metrics.conversionRate * 100
                    ).toFixed(2)}
                    %
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Conversion Rate
                  </p>
                  <p className="text-xs text-green-600">
                    {implementationStatus.metrics.conversionRateChange >= 0
                      ? "+"
                      : ""}
                    {implementationStatus.metrics.conversionRateChange.toFixed(
                      1
                    )}
                    %
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    {getMetricChangeIcon(
                      implementationStatus.metrics.revenueChange
                    )}
                  </div>
                  <p className="text-2xl font-bold">
                    $
                    {Math.round(
                      implementationStatus.metrics.revenue
                    ).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="text-xs text-green-600">
                    {implementationStatus.metrics.revenueChange >= 0 ? "+" : ""}
                    {implementationStatus.metrics.revenueChange.toFixed(1)}%
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    {getMetricChangeIcon(
                      -implementationStatus.metrics.errorRateChange
                    )}
                  </div>
                  <p className="text-2xl font-bold">
                    {(implementationStatus.metrics.errorRate * 100).toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Error Rate</p>
                  <p className="text-xs text-red-600">
                    {implementationStatus.metrics.errorRateChange >= 0
                      ? "+"
                      : ""}
                    {implementationStatus.metrics.errorRateChange.toFixed(1)}%
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-4 w-4 text-purple-600" />
                    {getMetricChangeIcon(
                      implementationStatus.metrics.userSatisfactionChange
                    )}
                  </div>
                  <p className="text-2xl font-bold">
                    {implementationStatus.metrics.userSatisfaction.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Satisfaction</p>
                  <p className="text-xs text-green-600">
                    {implementationStatus.metrics.userSatisfactionChange >= 0
                      ? "+"
                      : ""}
                    {implementationStatus.metrics.userSatisfactionChange.toFixed(
                      1
                    )}
                    %
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="plan">Implementation Plan</TabsTrigger>
              <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              <TabsTrigger value="rollback">Rollback Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Business Impact</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Revenue Impact</span>
                      <span className="font-medium">
                        $
                        {conclusion.businessImpact.revenueImpact.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Audience Reach</span>
                      <span className="font-medium">
                        {conclusion.businessImpact.audienceReach.toLocaleString()}{" "}
                        users
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Strategic Alignment</span>
                      <div className="flex items-center gap-1">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${conclusion.businessImpact.strategicAlignment * 10}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm">
                          {conclusion.businessImpact.strategicAlignment}/10
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">
                    Revenue Impact Distribution
                  </h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Expected Revenue",
                            value: conclusion.businessImpact.revenueImpact,
                            fill: COLORS[0],
                          },
                          {
                            name: "Conservative Estimate",
                            value:
                              conclusion.businessImpact.revenueImpactRange[0],
                            fill: COLORS[1],
                          },
                          {
                            name: "Optimistic Estimate",
                            value:
                              conclusion.businessImpact.revenueImpactRange[1],
                            fill: COLORS[2],
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[0, 1, 2].map(index => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={value =>
                          `$${(value as number).toLocaleString()}`
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="plan" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">
                    Implementation Strategy:{" "}
                    {conclusion.implementationPlan.strategy}
                  </h4>
                  <Badge variant="outline">
                    {conclusion.implementationPlan.phases.length} Phases
                  </Badge>
                </div>

                <div className="space-y-3">
                  {conclusion.implementationPlan.phases.map((phase, index) => (
                    <div key={phase.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{phase.name}</h5>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {phase.rolloutPercentage}% Traffic
                          </Badge>
                          <Badge variant="outline">
                            {phase.duration}h Duration
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {phase.description}
                      </p>

                      {implementationStatus?.currentPhase?.id === phase.id && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Activity className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">
                              Currently Active
                            </span>
                          </div>
                          <Progress
                            value={implementationStatus.progress}
                            className="h-2"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="risks" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Risk Assessment</h4>
                  <Badge
                    className={getRiskBadgeColor(
                      conclusion.riskAssessment.overallRiskScore
                    )}
                  >
                    {conclusion.riskAssessment.overallRiskScore.toFixed(0)}/100
                    Risk Score
                  </Badge>
                </div>

                <div className="space-y-3">
                  {conclusion.riskAssessment.riskFactors.map(
                    (factor, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize">
                            {factor.type} Risk
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              factor.severity === "critical"
                                ? "border-red-500 text-red-700"
                                : factor.severity === "high"
                                  ? "border-orange-500 text-orange-700"
                                  : factor.severity === "medium"
                                    ? "border-yellow-500 text-yellow-700"
                                    : "border-green-500 text-green-700"
                            }
                          >
                            {factor.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {factor.description}
                        </p>
                        {factor.mitigation && (
                          <div className="flex items-start gap-2">
                            <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                            <p className="text-sm text-blue-600">
                              {factor.mitigation}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>

                <div className="border rounded-lg p-4 bg-blue-50">
                  <h5 className="font-medium mb-2">Recommended Approach</h5>
                  <p className="text-sm">
                    {conclusion.riskAssessment.recommendedApproach}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-4">
              {implementationHistory.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">
                    Real-time Implementation Monitoring
                  </h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={implementationHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="conversionRate"
                        stroke="#0088FE"
                        strokeWidth={2}
                        name="Conversion Rate"
                      />
                      <Line
                        type="monotone"
                        dataKey="traffic"
                        stroke="#00C49F"
                        strokeWidth={2}
                        name="Traffic %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {implementationStatus &&
                implementationStatus.alerts.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">
                      Implementation Alerts
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {implementationStatus.alerts
                        .sort(
                          (a, b) =>
                            b.timestamp.getTime() - a.timestamp.getTime()
                        )
                        .map(alert => (
                          <Alert
                            key={alert.id}
                            className={
                              alert.type === "error"
                                ? "border-red-200"
                                : alert.type === "warning"
                                  ? "border-yellow-200"
                                  : alert.type === "success"
                                    ? "border-green-200"
                                    : "border-blue-200"
                            }
                          >
                            <div className="flex items-start gap-2">
                              {alert.type === "error" && (
                                <AlertCircle className="h-4 w-4 text-red-600" />
                              )}
                              {alert.type === "warning" && (
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              )}
                              {alert.type === "success" && (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              )}
                              {alert.type === "info" && (
                                <Info className="h-4 w-4 text-blue-600" />
                              )}
                              <div className="flex-1">
                                <AlertTitle className="text-sm">
                                  {alert.title}
                                </AlertTitle>
                                <AlertDescription className="text-xs">
                                  {alert.message}
                                </AlertDescription>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {alert.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </Alert>
                        ))}
                    </div>
                  </div>
                )}
            </TabsContent>

            <TabsContent value="rollback" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Rollback Plan</h4>
                  <Badge variant="outline">
                    {conclusion.rollbackPlan.timeToRollback} min rollback time
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium mb-2">Rollback Triggers</h5>
                    <div className="space-y-2">
                      {conclusion.rollbackPlan.triggers.map(
                        (trigger, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <span className="font-medium capitalize">
                                {trigger.metric.replace("_", " ")}
                              </span>
                              <Badge variant="destructive">
                                {trigger.action}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Threshold: {trigger.threshold}% over{" "}
                              {trigger.timeframe} minutes
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Rollback Procedure</h5>
                    <div className="space-y-2">
                      {conclusion.rollbackPlan.procedure.map(step => (
                        <div key={step.order} className="border rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className="w-8 h-8 rounded-full flex items-center justify-center p-0"
                            >
                              {step.order}
                            </Badge>
                            <div className="flex-1">
                              <p className="font-medium">
                                {step.action.replace("_", " ").toUpperCase()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {step.description}
                              </p>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-xs text-muted-foreground">
                                  Owner: {step.owner}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ETA: {step.estimatedTime} min
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Conclusion Dialog */}
      <Dialog
        open={showConclusionDialog}
        onOpenChange={setShowConclusionDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Test Ready for Conclusion
            </DialogTitle>
            <DialogDescription>
              Statistical analysis indicates this A/B test is ready for
              conclusion. Review the results and approve implementation of the
              winning variant.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {conclusion.selectedWinner && (
              <div className="border rounded-lg p-4 bg-green-50">
                <h4 className="font-semibold text-green-800 mb-2">
                  Selected Winner
                </h4>
                <p className="text-lg font-bold text-green-700">
                  {conclusion.selectedWinner.variantName}
                </p>
                <p className="text-sm text-green-600">
                  {conclusion.selectedWinner.selectionReason}
                </p>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <span className="text-sm font-medium">
                      Expected Improvement
                    </span>
                    <p className="text-xl font-bold text-green-700">
                      {conclusion.selectedWinner.expectedImprovement.toFixed(1)}
                      %
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">
                      Implementation Strategy
                    </span>
                    <p className="text-lg font-medium capitalize">
                      {conclusion.selectedWinner.implementationStrategy}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <NormalButton
                variant="outline"
                onClick={() => setShowConclusionDialog(false)}
              >
                Review Details
              </NormalButton>
              <NormalButton
                onClick={startImplementation}
                disabled={isImplementing}
              >
                {isImplementing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Starting Implementation...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Start Implementation
                  </>
                )}
              </NormalButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper component for trophy icon
function Trophy({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55.47.98.97 1.21C12.56 18.75 15.45 16.02 16 14.66" />
      <path d="M14 14.66V17c0 .55-.47.98-.97 1.21C11.44 18.75 8.55 16.02 8 14.66" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
