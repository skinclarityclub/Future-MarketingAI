"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Zap,
  TrendingUp,
  Activity,
  Cpu,
  Target,
  BarChart3,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Eye,
  Gauge,
  Bot,
  Sparkles,
  Settings,
  Play,
  Pause,
  RefreshCw,
} from "lucide-react";

interface MetaLearningInsight {
  insight_id: string;
  learning_type:
    | "pattern_discovery"
    | "model_optimization"
    | "cross_domain_transfer"
    | "adaptation"
    | "ensemble_tuning";
  source_systems: string[];
  confidence_level: number;
  business_impact: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  performance_impact: {
    accuracy_improvement: number;
    efficiency_gain: number;
    prediction_quality: number;
    learning_speed_boost: number;
  };
  implementation_steps: Array<{
    step: number;
    action: string;
    expected_improvement: string;
    automation_level: "manual" | "assisted" | "automated";
  }>;
  discovered_at: Date;
}

interface SelfLearningSystemStatus {
  overall_intelligence_score: number;
  learning_velocity: number;
  adaptation_efficiency: number;
  prediction_accuracy: number;
  active_models: {
    total_models: number;
    learning_models: number;
    optimization_active: boolean;
    ensemble_performance: number;
  };
  learning_progress: {
    patterns_discovered: number;
    insights_generated: number;
    optimizations_applied: number;
    knowledge_transfer_events: number;
  };
  real_time_capabilities: {
    processing_speed_ms: number;
    memory_efficiency: number;
    parallel_learning_threads: number;
    real_time_adaptation: boolean;
  };
  business_intelligence: {
    revenue_prediction_accuracy: number;
    customer_behavior_insights: number;
    market_trend_detection: number;
    anomaly_detection_precision: number;
  };
}

const AdvancedSelfLearningDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [learningActive, setLearningActive] = useState(true);

  useEffect(() => {
    const fetchLearningData = async () => {
      setLoading(true);

      // Simulated data - replace with actual API call
      const mockData = {
        system_status: {
          overall_intelligence_score: 94.7,
          learning_velocity: 47.3,
          adaptation_efficiency: 89.2,
          prediction_accuracy: 91.8,
          active_models: {
            total_models: 12,
            learning_models: 8,
            optimization_active: true,
            ensemble_performance: 93.4,
          },
          learning_progress: {
            patterns_discovered: 1847,
            insights_generated: 234,
            optimizations_applied: 67,
            knowledge_transfer_events: 23,
          },
          real_time_capabilities: {
            processing_speed_ms: 23.7,
            memory_efficiency: 87.9,
            parallel_learning_threads: 6,
            real_time_adaptation: true,
          },
          business_intelligence: {
            revenue_prediction_accuracy: 89.3,
            customer_behavior_insights: 92.7,
            market_trend_detection: 87.1,
            anomaly_detection_precision: 94.8,
          },
        },
        insights: [
          {
            insight_id: "pattern_discovery_001",
            learning_type: "pattern_discovery",
            source_systems: [
              "content_analytics",
              "business_forecasts",
              "tactical_insights",
            ],
            confidence_level: 94,
            business_impact: "high",
            title: "Cross-Platform Engagement Synchronization Pattern",
            description:
              "Discovered that engagement patterns across platforms are 73% synchronized during certain time windows, enabling predictive cross-platform optimization.",
            performance_impact: {
              accuracy_improvement: 18.7,
              efficiency_gain: 34.2,
              prediction_quality: 28.9,
              learning_speed_boost: 41.3,
            },
            implementation_steps: [
              {
                step: 1,
                action: "Deploy cross-platform synchronization algorithm",
                expected_improvement: "+35% engagement across platforms",
                automation_level: "automated",
              },
              {
                step: 2,
                action: "Implement predictive cross-platform optimizer",
                expected_improvement: "+22% reach efficiency",
                automation_level: "automated",
              },
            ],
            discovered_at: new Date(),
          },
          {
            insight_id: "model_optimization_001",
            learning_type: "model_optimization",
            source_systems: [
              "advanced_ml_engine",
              "continuous_learning",
              "tactical_ml",
            ],
            confidence_level: 91,
            business_impact: "high",
            title: "Ensemble Model Synergy Optimization",
            description:
              "Identified optimal ensemble weights that improve prediction accuracy by 27% through dynamic model selection.",
            performance_impact: {
              accuracy_improvement: 27.3,
              efficiency_gain: 19.8,
              prediction_quality: 31.4,
              learning_speed_boost: 23.7,
            },
            implementation_steps: [
              {
                step: 1,
                action: "Deploy dynamic ensemble optimizer",
                expected_improvement: "+27% prediction accuracy",
                automation_level: "automated",
              },
            ],
            discovered_at: new Date(),
          },
        ],
        optimization_results: [
          {
            optimization_type: "ensemble_rebalancing",
            performance_improvement: 23.4,
            new_weights: {
              content_ml: 0.35,
              forecasting: 0.28,
              tactical: 0.22,
              continuous: 0.15,
            },
            confidence: 0.89,
            implementation_status: "active",
          },
          {
            optimization_type: "model_selection",
            performance_improvement: 15.7,
            selected_models: [
              "content_performance_v3",
              "engagement_predictor_v2",
              "timing_optimizer_v4",
            ],
            confidence: 0.84,
            implementation_status: "deployed",
          },
        ],
        performance_improvements: {
          overall_accuracy: 18.7,
          learning_speed: 34.2,
          prediction_quality: 28.9,
          efficiency_gain: 41.3,
          business_impact: 25.6,
        },
        real_time_intelligence: {
          next_hour_predictions: {
            engagement_rate: 0.087,
            conversion_count: 45,
            revenue_estimate: 2840,
          },
          adaptive_recommendations: [
            {
              recommendation_id: "adapt_001",
              priority: "high",
              title: "Real-Time Content Optimization",
              action:
                "Adjust content mix based on emerging engagement patterns",
              expected_impact: "+23% engagement boost",
            },
          ],
          learning_opportunities: [
            {
              opportunity_type: "data_gap",
              title: "Weekend Engagement Data Collection",
              potential_improvement: "+15% prediction accuracy",
              effort_required: "medium",
            },
          ],
        },
      };

      setTimeout(() => {
        setDashboardData(mockData);
        setLoading(false);
      }, 1000);
    };

    fetchLearningData();
  }, []);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getLearningTypeIcon = (type: string) => {
    switch (type) {
      case "pattern_discovery":
        return <Brain className="w-4 h-4" />;
      case "model_optimization":
        return <Cpu className="w-4 h-4" />;
      case "cross_domain_transfer":
        return <Target className="w-4 h-4" />;
      case "adaptation":
        return <Zap className="w-4 h-4" />;
      case "ensemble_tuning":
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 dark:bg-gray-900 min-h-screen">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-blue-500 animate-pulse" />
          <h1 className="text-3xl font-bold text-white">
            Advanced Self-Learning Engine
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="dark:bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-600 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="p-6 space-y-6 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-white">
            Advanced Self-Learning Engine
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-green-400 border-green-400">
            Intelligence Score:{" "}
            {dashboardData.system_status.overall_intelligence_score}%
          </Badge>
          <NormalButton
            variant={learningActive ? "secondary" : "default"}
            onClick={() => setLearningActive(!learningActive)}
            className="flex items-center space-x-2"
          >
            {learningActive ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>
              {learningActive ? "Learning Active" : "Learning Paused"}
            </span>
          </NormalButton>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="dark:bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Learning Velocity
                </p>
                <p className="text-2xl font-bold text-white">
                  {dashboardData.system_status.learning_velocity}
                </p>
                <p className="text-xs text-gray-500">patterns/hour</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
            <Progress
              value={dashboardData.system_status.learning_velocity * 2}
              className="mt-3"
            />
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Prediction Accuracy
                </p>
                <p className="text-2xl font-bold text-white">
                  {dashboardData.system_status.prediction_accuracy}%
                </p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
            <Progress
              value={dashboardData.system_status.prediction_accuracy}
              className="mt-3"
            />
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Active Models
                </p>
                <p className="text-2xl font-bold text-white">
                  {dashboardData.system_status.active_models.total_models}
                </p>
                <p className="text-xs text-gray-500">
                  {dashboardData.system_status.active_models.learning_models}{" "}
                  learning
                </p>
              </div>
              <Bot className="w-8 h-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2 space-x-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">
                Optimization Active
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Processing Speed
                </p>
                <p className="text-2xl font-bold text-white">
                  {
                    dashboardData.system_status.real_time_capabilities
                      .processing_speed_ms
                  }
                  ms
                </p>
              </div>
              <Gauge className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="flex items-center mt-2 space-x-1">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-yellow-500">Real-time Capable</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4 dark:bg-gray-800">
          <TabsTrigger value="overview" className="text-white">
            System Overview
          </TabsTrigger>
          <TabsTrigger value="insights" className="text-white">
            Learning Insights
          </TabsTrigger>
          <TabsTrigger value="optimization" className="text-white">
            Optimizations
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="text-white">
            Real-time Intelligence
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Learning Progress */}
            <Card className="dark:bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Learning Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Patterns Discovered</span>
                    <span className="text-white font-semibold">
                      {
                        dashboardData.system_status.learning_progress
                          .patterns_discovered
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Insights Generated</span>
                    <span className="text-white font-semibold">
                      {
                        dashboardData.system_status.learning_progress
                          .insights_generated
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Optimizations Applied</span>
                    <span className="text-white font-semibold">
                      {
                        dashboardData.system_status.learning_progress
                          .optimizations_applied
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Knowledge Transfers</span>
                    <span className="text-white font-semibold">
                      {
                        dashboardData.system_status.learning_progress
                          .knowledge_transfer_events
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Intelligence */}
            <Card className="dark:bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Business Intelligence Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Revenue Prediction</span>
                      <span className="text-white">
                        {
                          dashboardData.system_status.business_intelligence
                            .revenue_prediction_accuracy
                        }
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        dashboardData.system_status.business_intelligence
                          .revenue_prediction_accuracy
                      }
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Customer Behavior</span>
                      <span className="text-white">
                        {
                          dashboardData.system_status.business_intelligence
                            .customer_behavior_insights
                        }
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        dashboardData.system_status.business_intelligence
                          .customer_behavior_insights
                      }
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Market Trends</span>
                      <span className="text-white">
                        {
                          dashboardData.system_status.business_intelligence
                            .market_trend_detection
                        }
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        dashboardData.system_status.business_intelligence
                          .market_trend_detection
                      }
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Anomaly Detection</span>
                      <span className="text-white">
                        {
                          dashboardData.system_status.business_intelligence
                            .anomaly_detection_precision
                        }
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        dashboardData.system_status.business_intelligence
                          .anomaly_detection_precision
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Recent Learning Insights
            </h3>
            {dashboardData.insights.map((insight: MetaLearningInsight) => (
              <Card
                key={insight.insight_id}
                className="dark:bg-gray-800 border-gray-700"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getLearningTypeIcon(insight.learning_type)}
                      <div>
                        <h4 className="font-semibold text-white">
                          {insight.title}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={getImpactColor(insight.business_impact)}
                      >
                        {insight.business_impact}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-blue-400 border-blue-400"
                      >
                        {insight.confidence_level}% confidence
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-400">Accuracy</p>
                      <p className="text-green-400 font-semibold">
                        +{insight.performance_impact.accuracy_improvement}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Efficiency</p>
                      <p className="text-blue-400 font-semibold">
                        +{insight.performance_impact.efficiency_gain}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Quality</p>
                      <p className="text-yellow-400 font-semibold">
                        +{insight.performance_impact.prediction_quality}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Learning Speed</p>
                      <p className="text-purple-400 font-semibold">
                        +{insight.performance_impact.learning_speed_boost}%
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <h5 className="font-medium text-white mb-2">
                      Implementation Steps
                    </h5>
                    <div className="space-y-2">
                      {insight.implementation_steps.map((step, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 text-sm"
                        >
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                            {step.step}
                          </span>
                          <span className="text-gray-300">{step.action}</span>
                          <Badge
                            variant="outline"
                            className="text-green-400 border-green-400"
                          >
                            {step.expected_improvement}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-purple-400 border-purple-400"
                          >
                            {step.automation_level}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Active Optimizations
            </h3>
            {dashboardData.optimization_results.map(
              (optimization: any, index: number) => (
                <Card key={index} className="dark:bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-white capitalize">
                          {optimization.optimization_type.replace("_", " ")}
                        </h4>
                        <p className="text-sm text-gray-400">
                          Performance improvement: +
                          {optimization.performance_improvement}%
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={
                            optimization.implementation_status === "active"
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }
                        >
                          {optimization.implementation_status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-blue-400 border-blue-400"
                        >
                          {Math.round(optimization.confidence * 100)}%
                          confidence
                        </Badge>
                      </div>
                    </div>

                    {optimization.new_weights && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-white">
                          Model Weights
                        </h5>
                        {Object.entries(optimization.new_weights).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between"
                            >
                              <span className="text-gray-400 capitalize">
                                {key.replace("_", " ")}
                              </span>
                              <div className="flex items-center space-x-2">
                                <div className="w-24 bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{
                                      width: `${(value as number) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-white text-sm">
                                  {((value as number) * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {optimization.selected_models && (
                      <div>
                        <h5 className="font-medium text-white mb-2">
                          Selected Models
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {optimization.selected_models.map((model: string) => (
                            <Badge
                              key={model}
                              variant="outline"
                              className="text-cyan-400 border-cyan-400"
                            >
                              {model}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </TabsContent>

        <TabsContent value="intelligence" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="dark:bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Next Hour Predictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Engagement Rate</span>
                    <span className="text-green-400 font-semibold">
                      {(
                        dashboardData.real_time_intelligence
                          .next_hour_predictions.engagement_rate * 100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Expected Conversions</span>
                    <span className="text-blue-400 font-semibold">
                      {
                        dashboardData.real_time_intelligence
                          .next_hour_predictions.conversion_count
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Revenue Estimate</span>
                    <span className="text-yellow-400 font-semibold">
                      €
                      {
                        dashboardData.real_time_intelligence
                          .next_hour_predictions.revenue_estimate
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Adaptive Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.real_time_intelligence.adaptive_recommendations.map(
                    (rec: any) => (
                      <div
                        key={rec.recommendation_id}
                        className="p-3 rounded-lg bg-gray-700"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-white">
                            {rec.title}
                          </h5>
                          <Badge
                            className={
                              rec.priority === "high"
                                ? "bg-orange-500"
                                : "bg-yellow-500"
                            }
                          >
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">
                          {rec.action}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-green-400 text-sm font-semibold">
                            {rec.expected_impact}
                          </span>
                          <NormalButton size="sm" className="text-xs">
                            Implement
                          </NormalButton>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="dark:bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                Learning Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.real_time_intelligence.learning_opportunities.map(
                  (opp: any, index: number) => (
                    <div key={index} className="p-4 rounded-lg bg-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-white">{opp.title}</h5>
                        <Badge
                          variant="outline"
                          className="text-blue-400 border-blue-400"
                        >
                          {opp.effort_required} effort
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        {opp.potential_improvement}
                      </p>
                      <Badge className="bg-green-500">
                        {opp.opportunity_type}
                      </Badge>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedSelfLearningDashboard;
