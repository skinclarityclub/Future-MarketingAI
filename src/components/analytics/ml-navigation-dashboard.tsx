"use client";

/**
 * ML Navigation Dashboard
 * Interface for managing and monitoring the ML navigation system
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Brain,
  TrendingUp,
  Users,
  Clock,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  RefreshCw,
} from "lucide-react";
import {
  ModelPerformanceMetrics,
  ModelTrainingJob,
  MLModelConfig,
  NavigationPrediction,
  UserSegment,
} from "@/lib/analytics/ml-navigation-types";

interface ModelStatus {
  loaded: boolean;
  version: string;
  performance: ModelPerformanceMetrics;
  needs_retraining: boolean;
}

interface TrainingJobStatus {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  started_at: string;
  completed_at?: string;
  metrics?: ModelPerformanceMetrics;
  error_message?: string;
  progress?: number;
}

export function MLNavigationDashboard() {
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [trainingJobs, setTrainingJobs] = useState<TrainingJobStatus[]>([]);
  const [activeJob, setActiveJob] = useState<TrainingJobStatus | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [recentPredictions, setRecentPredictions] = useState<
    NavigationPrediction[]
  >([]);
  const [userSegments, setUserSegments] = useState<UserSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch model status and data
  useEffect(() => {
    fetchModelStatus();
    fetchRecentPredictions();
    fetchUserSegments();

    // Set up polling for training jobs
    const interval = setInterval(() => {
      if (isTraining) {
        fetchTrainingJobs();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isTraining]);

  const fetchModelStatus = async () => {
    try {
      const response = await fetch("/api/ml/navigation/train");
      const data = await response.json();
      setModelStatus(data.model_status);
    } catch (err) {
      setError("Failed to fetch model status");
      if (process.env.NODE_ENV === "development") {
        console.error(err);
      }
    }
  };

  const fetchTrainingJobs = async () => {
    try {
      // This would fetch recent training jobs from your API
      // For now, we'll simulate some data
      const mockJobs: TrainingJobStatus[] = [
        {
          id: "train_123",
          status: "completed",
          started_at: new Date(Date.now() - 3600000).toISOString(),
          completed_at: new Date().toISOString(),
          metrics: {
            accuracy: 0.85,
            precision: 0.82,
            recall: 0.87,
            f1_score: 0.84,
            auc_roc: 0.89,
            confusion_matrix: [
              [120, 15],
              [18, 95],
            ],
            feature_importance: {
              time_on_page: 0.25,
              device_type: 0.18,
              session_duration: 0.15,
              page_category: 0.12,
              hour_of_day: 0.1,
            },
            cross_validation_scores: [0.83, 0.86, 0.84, 0.87, 0.85],
            training_time: 1245000,
            prediction_latency: 15,
            model_size: 2048,
            last_trained: new Date().toISOString(),
            training_data_size: 10000,
            validation_data_size: 2500,
          },
        },
      ];
      setTrainingJobs(mockJobs);
    } catch (err) {
      console.error("Failed to fetch training jobs:", err);
    }
  };

  const fetchRecentPredictions = async () => {
    try {
      // Mock data for recent predictions
      const mockPredictions: NavigationPrediction[] = [
        {
          predicted_page: "/reports/sales",
          confidence_score: 0.87,
          predicted_probability: 0.87,
          reasoning: [
            "High engagement with sales data",
            "Similar user patterns",
            "Current time matches typical usage",
          ],
          alternative_predictions: [
            {
              page: "/dashboard",
              probability: 0.65,
              reasoning: "Popular fallback page",
            },
            {
              page: "/analytics",
              probability: 0.54,
              reasoning: "Related to current context",
            },
          ],
          feature_importance: {
            time_on_page: 0.25,
            session_duration: 0.2,
            device_type: 0.15,
          },
          prediction_timestamp: new Date().toISOString(),
        },
      ];
      setRecentPredictions(mockPredictions);
    } catch (err) {
      console.error("Failed to fetch recent predictions:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSegments = async () => {
    try {
      // Mock user segments data
      const mockSegments: UserSegment[] = [
        {
          segment_id: "power_users",
          name: "Power Users",
          description: "Highly engaged users with long sessions",
          criteria: {
            device_types: ["desktop"],
            behavior_patterns: ["deep_navigation", "high_interaction"],
            engagement_level: "high",
            session_characteristics: {
              min_duration: 300,
              min_pages: 5,
            },
          },
          navigation_preferences: {
            preferred_paths: ["/analytics", "/reports", "/advanced"],
            avoided_pages: ["/help", "/getting-started"],
            optimal_timing: {
              hour_range: [9, 17],
              day_preferences: [
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
              ],
            },
          },
          model_performance: {
            accuracy: 0.92,
            sample_size: 1250,
          },
        },
        {
          segment_id: "casual_browsers",
          name: "Casual Browsers",
          description: "Users with shorter, exploratory sessions",
          criteria: {
            device_types: ["mobile", "tablet"],
            behavior_patterns: ["quick_browsing", "low_interaction"],
            engagement_level: "medium",
            session_characteristics: {
              max_duration: 180,
              max_pages: 3,
            },
          },
          navigation_preferences: {
            preferred_paths: ["/", "/overview", "/summary"],
            avoided_pages: ["/advanced", "/detailed-reports"],
            optimal_timing: {
              hour_range: [18, 23],
              day_preferences: ["saturday", "sunday"],
            },
          },
          model_performance: {
            accuracy: 0.78,
            sample_size: 2100,
          },
        },
      ];
      setUserSegments(mockSegments);
    } catch (err) {
      console.error("Failed to fetch user segments:", err);
    }
  };

  const startTraining = async () => {
    try {
      setIsTraining(true);
      const config: MLModelConfig = {
        model_type: "random_forest",
        parameters: {
          n_estimators: 100,
          max_depth: 10,
          min_samples_split: 5,
          random_state: 42,
        },
        feature_selection: {
          enabled: true,
          method: "variance_threshold",
          n_features: 20,
        },
        cross_validation: {
          enabled: true,
          folds: 5,
          scoring: "accuracy",
        },
        hyperparameter_tuning: {
          enabled: false,
          method: "grid_search",
          param_distributions: {},
        },
      };

      const response = await fetch("/api/ml/navigation/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model_config: config,
          data_range: {
            start_date: new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            end_date: new Date().toISOString(),
          },
          training_options: {
            min_session_duration: 30,
            exclude_bounce_sessions: true,
          },
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setActiveJob({
          id: result.job_id,
          status: "pending",
          started_at: new Date().toISOString(),
        });
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start training");
      setIsTraining(false);
      if (process.env.NODE_ENV === "development") {
        console.error("Training failed:", err);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "running":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            <Activity className="w-3 h-3 mr-1" />
            Running
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading ML Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8" />
            ML Navigation System
          </h1>
          <p className="text-muted-foreground mt-1">
            Machine learning powered navigation prediction and optimization
          </p>
        </div>
        <div className="flex gap-2">
          <NormalButton onClick={fetchModelStatus} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </NormalButton>
          <NormalButton onClick={startTraining} disabled={isTraining}>
            {isTraining ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Training...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Training
              </>
            )}
          </NormalButton>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Model Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Status</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {modelStatus?.loaded ? "Active" : "Inactive"}
            </div>
            <p className="text-xs text-muted-foreground">
              {modelStatus?.needs_retraining
                ? "Needs retraining"
                : "Up to date"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((modelStatus?.performance?.accuracy || 0) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Model prediction accuracy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predictions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">Made today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Segments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userSegments.length}</div>
            <p className="text-xs text-muted-foreground">Active segments</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="segments">User Segments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Model Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
                <CardDescription>
                  Key metrics for the current model
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {modelStatus?.performance && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Accuracy</span>
                        <span>
                          {(modelStatus.performance.accuracy * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={modelStatus.performance.accuracy * 100}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Precision</span>
                        <span>
                          {(modelStatus.performance.precision * 100).toFixed(1)}
                          %
                        </span>
                      </div>
                      <Progress
                        value={modelStatus.performance.precision * 100}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Recall</span>
                        <span>
                          {(modelStatus.performance.recall * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={modelStatus.performance.recall * 100} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>F1 Score</span>
                        <span>
                          {(modelStatus.performance.f1_score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={modelStatus.performance.f1_score * 100}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Feature Importance */}
            <Card>
              <CardHeader>
                <CardTitle>Feature Importance</CardTitle>
                <CardDescription>
                  Most influential features for predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {modelStatus?.performance?.feature_importance && (
                  <div className="space-y-3">
                    {Object.entries(modelStatus.performance.feature_importance)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .slice(0, 5)
                      .map(([feature, importance]) => (
                        <div key={feature} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">
                              {feature.replace(/_/g, " ")}
                            </span>
                            <span>
                              {((importance as number) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={(importance as number) * 100} />
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Jobs</CardTitle>
              <CardDescription>
                Monitor and manage model training
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trainingJobs.length > 0 ? (
                <div className="space-y-4">
                  {trainingJobs.map(job => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{job.id}</div>
                        <div className="text-sm text-muted-foreground">
                          Started: {new Date(job.started_at).toLocaleString()}
                        </div>
                        {job.completed_at && (
                          <div className="text-sm text-muted-foreground">
                            Completed:{" "}
                            {new Date(job.completed_at).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(job.status)}
                        {job.metrics && (
                          <Badge variant="outline">
                            Accuracy: {(job.metrics.accuracy * 100).toFixed(1)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No training jobs found. Start a new training job to begin.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Predictions</CardTitle>
              <CardDescription>
                Latest navigation predictions made by the model
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentPredictions.length > 0 ? (
                <div className="space-y-4">
                  {recentPredictions.map((prediction, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          {prediction.predicted_page}
                        </div>
                        <Badge variant="outline">
                          {(prediction.confidence_score * 100).toFixed(1)}%
                          confident
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {prediction.reasoning.join(", ")}
                      </div>
                      {prediction.alternative_predictions.length > 0 && (
                        <div className="text-sm">
                          <strong>Alternatives:</strong>{" "}
                          {prediction.alternative_predictions.map((alt, i) => (
                            <span key={i}>
                              {alt.page} ({(alt.probability * 100).toFixed(1)}%)
                              {i < prediction.alternative_predictions.length - 1
                                ? ", "
                                : ""}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent predictions found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {userSegments.map(segment => (
              <Card key={segment.segment_id}>
                <CardHeader>
                  <CardTitle>{segment.name}</CardTitle>
                  <CardDescription>{segment.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Performance</div>
                    <div className="flex justify-between text-sm">
                      <span>Accuracy</span>
                      <span>
                        {(segment.model_performance.accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={segment.model_performance.accuracy * 100}
                    />
                    <div className="text-xs text-muted-foreground">
                      Sample size:{" "}
                      {segment.model_performance.sample_size.toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Preferred Paths</div>
                    <div className="text-sm text-muted-foreground">
                      {segment.navigation_preferences.preferred_paths.join(
                        ", "
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Device Types</div>
                    <div className="flex gap-1">
                      {segment.criteria.device_types.map(device => (
                        <Badge
                          key={device}
                          variant="secondary"
                          className="text-xs"
                        >
                          {device}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
