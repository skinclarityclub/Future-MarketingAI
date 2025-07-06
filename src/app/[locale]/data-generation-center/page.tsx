"use client";

/**
 * Data Generation Management Center
 * Task 72.4: Integreer synthetische en benchmark data generatie
 *
 * Centraal beheercentrum voor synthetische data generatie en benchmark data integratie
 * Built in locale directory voor internationalisatie ondersteuning
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Database,
  TrendingUp,
  Target,
  Zap,
  BarChart3,
  Settings,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Play,
  Pause,
  Trash2,
  Eye,
  Filter,
  Search,
  Clock,
  Award,
  Gauge,
  Activity,
  Users,
  Globe,
  Layers,
  Cpu,
  MemoryStick,
} from "lucide-react";

interface SyntheticGenerationJob {
  id: string;
  template: string;
  recordCount: number;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  startTime: string;
  completedTime?: string;
  qualityScore?: number;
  recordsGenerated?: number;
}

interface BenchmarkDataSource {
  id: string;
  name: string;
  provider: string;
  industry: string;
  status: "active" | "inactive" | "error";
  lastUpdate: string;
  dataFreshness: number;
  qualityScore: number;
  metricsCount: number;
}

interface MetricComparison {
  metric: string;
  userValue: number;
  benchmarkValue: number;
  percentile: number;
  category: "excellent" | "good" | "average" | "needs_improvement";
  improvement: number;
}

export default function DataGenerationCenter() {
  // State management
  const [activeTab, setActiveTab] = useState("overview");
  const [syntheticJobs, setSyntheticJobs] = useState<SyntheticGenerationJob[]>(
    []
  );
  const [benchmarkSources, setBenchmarkSources] = useState<
    BenchmarkDataSource[]
  >([]);
  const [metricComparisons, setMetricComparisons] = useState<
    MetricComparison[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generationConfig, setGenerationConfig] = useState({
    template: "social_media_content",
    recordCount: 1000,
    industry: "technology",
    companySize: "medium",
    useResearch: true,
    qualityTarget: 0.85,
  });

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Simulate loading synthetic generation jobs
      setSyntheticJobs([
        {
          id: "syn_001",
          template: "Social Media Content",
          recordCount: 2500,
          status: "completed",
          progress: 100,
          startTime: "2024-01-15T10:30:00Z",
          completedTime: "2024-01-15T10:45:00Z",
          qualityScore: 0.89,
          recordsGenerated: 2485,
        },
        {
          id: "syn_002",
          template: "Campaign Performance",
          recordCount: 1500,
          status: "running",
          progress: 67,
          startTime: "2024-01-15T11:00:00Z",
          qualityScore: 0.92,
        },
        {
          id: "syn_003",
          template: "Customer Analytics",
          recordCount: 3000,
          status: "pending",
          progress: 0,
          startTime: "2024-01-15T11:30:00Z",
        },
      ]);

      // Simulate loading benchmark data sources
      setBenchmarkSources([
        {
          id: "bench_001",
          name: "Social Media Industry Benchmarks",
          provider: "Industry Analytics Corp",
          industry: "Digital Marketing",
          status: "active",
          lastUpdate: "2024-01-15T08:00:00Z",
          dataFreshness: 95,
          qualityScore: 0.92,
          metricsCount: 15,
        },
        {
          id: "bench_002",
          name: "Marketing Campaign Benchmarks",
          provider: "Marketing Intelligence Hub",
          industry: "Digital Marketing",
          status: "active",
          lastUpdate: "2024-01-14T20:00:00Z",
          dataFreshness: 88,
          qualityScore: 0.88,
          metricsCount: 12,
        },
        {
          id: "bench_003",
          name: "Customer Experience Benchmarks",
          provider: "Customer Intelligence Network",
          industry: "Cross-Industry",
          status: "inactive",
          lastUpdate: "2024-01-12T15:30:00Z",
          dataFreshness: 72,
          qualityScore: 0.85,
          metricsCount: 18,
        },
      ]);

      // Simulate loading metric comparisons
      setMetricComparisons([
        {
          metric: "Engagement Rate",
          userValue: 4.2,
          benchmarkValue: 3.8,
          percentile: 78,
          category: "good",
          improvement: 0,
        },
        {
          metric: "Click-Through Rate",
          userValue: 1.9,
          benchmarkValue: 2.4,
          percentile: 42,
          category: "needs_improvement",
          improvement: 0.5,
        },
        {
          metric: "Conversion Rate",
          userValue: 3.1,
          benchmarkValue: 2.8,
          percentile: 68,
          category: "good",
          improvement: 0,
        },
        {
          metric: "Cost Per Engagement",
          userValue: 0.38,
          benchmarkValue: 0.45,
          percentile: 85,
          category: "excellent",
          improvement: 0,
        },
      ]);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startSyntheticGeneration = async () => {
    setIsLoading(true);
    try {
      const newJob: SyntheticGenerationJob = {
        id: `syn_${Date.now()}`,
        template: generationConfig.template,
        recordCount: generationConfig.recordCount,
        status: "running",
        progress: 0,
        startTime: new Date().toISOString(),
      };

      setSyntheticJobs(prev => [newJob, ...prev]);

      // Simulate generation progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          setSyntheticJobs(prev =>
            prev.map(job =>
              job.id === newJob.id
                ? {
                    ...job,
                    status: "completed",
                    progress: 100,
                    completedTime: new Date().toISOString(),
                    qualityScore: 0.85 + Math.random() * 0.1,
                    recordsGenerated: Math.floor(
                      generationConfig.recordCount *
                        (0.95 + Math.random() * 0.05)
                    ),
                  }
                : job
            )
          );
          clearInterval(interval);
        } else {
          setSyntheticJobs(prev =>
            prev.map(job => (job.id === newJob.id ? { ...job, progress } : job))
          );
        }
      }, 500);
    } catch (error) {
      console.error("Failed to start synthetic generation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBenchmarkData = async (sourceId: string) => {
    setBenchmarkSources(prev =>
      prev.map(source =>
        source.id === sourceId
          ? {
              ...source,
              lastUpdate: new Date().toISOString(),
              dataFreshness: Math.min(
                100,
                source.dataFreshness + Math.random() * 10
              ),
              status: "active",
            }
          : source
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "active":
        return "bg-green-500";
      case "running":
        return "bg-blue-500 animate-pulse";
      case "pending":
        return "bg-yellow-500";
      case "failed":
      case "error":
        return "bg-red-500";
      case "inactive":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "excellent":
        return "bg-green-100 text-green-800";
      case "good":
        return "bg-blue-100 text-blue-800";
      case "average":
        return "bg-yellow-100 text-yellow-800";
      case "needs_improvement":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateOverallStats = () => {
    const totalJobs = syntheticJobs.length;
    const completedJobs = syntheticJobs.filter(
      job => job.status === "completed"
    ).length;
    const totalRecordsGenerated = syntheticJobs
      .filter(job => job.recordsGenerated)
      .reduce((sum, job) => sum + (job.recordsGenerated || 0), 0);
    const avgQualityScore =
      syntheticJobs
        .filter(job => job.qualityScore)
        .reduce((sum, job) => sum + (job.qualityScore || 0), 0) /
        syntheticJobs.filter(job => job.qualityScore).length || 0;

    const activeBenchmarks = benchmarkSources.filter(
      source => source.status === "active"
    ).length;
    const totalMetrics = benchmarkSources.reduce(
      (sum, source) => sum + source.metricsCount,
      0
    );
    const avgDataFreshness =
      benchmarkSources.reduce((sum, source) => sum + source.dataFreshness, 0) /
        benchmarkSources.length || 0;

    return {
      totalJobs,
      completedJobs,
      totalRecordsGenerated,
      avgQualityScore,
      activeBenchmarks,
      totalMetrics,
      avgDataFreshness,
    };
  };

  const stats = calculateOverallStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Data Generation Center</h1>
          <p className="text-muted-foreground">
            Manage synthetic data generation and benchmark data integration
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadDashboardData}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Generations
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedJobs} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Records Generated
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRecordsGenerated.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg Quality: {(stats.avgQualityScore * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Benchmark Sources
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBenchmarks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalMetrics} total metrics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Data Freshness
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgDataFreshness.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average across sources
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="synthetic">Synthetic Data</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="comparisons">Comparisons</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Synthetic Jobs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Recent Synthetic Data Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {syntheticJobs.slice(0, 5).map(job => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${getStatusColor(job.status)}`}
                            />
                            <span className="font-medium">{job.template}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {job.recordCount.toLocaleString()} records
                            {job.recordsGenerated &&
                              ` • ${job.recordsGenerated.toLocaleString()} generated`}
                          </div>
                          {job.status === "running" && (
                            <Progress value={job.progress} className="mt-2" />
                          )}
                        </div>
                        {job.qualityScore && (
                          <Badge variant="secondary">
                            {(job.qualityScore * 100).toFixed(0)}% quality
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Benchmark Sources Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Benchmark Data Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {benchmarkSources.map(source => (
                      <div
                        key={source.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${getStatusColor(source.status)}`}
                            />
                            <span className="font-medium">{source.name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {source.provider} • {source.metricsCount} metrics
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              <span className="text-xs">
                                {source.dataFreshness}% fresh
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              <span className="text-xs">
                                {(source.qualityScore * 100).toFixed(0)}%
                                quality
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => refreshBenchmarkData(source.id)}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Quick Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metricComparisons.map(comparison => (
                  <div
                    key={comparison.metric}
                    className="text-center p-4 border rounded-lg"
                  >
                    <div className="text-sm font-medium mb-2">
                      {comparison.metric}
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {comparison.userValue}
                    </div>
                    <Badge className={getCategoryColor(comparison.category)}>
                      {comparison.percentile}th percentile
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      vs benchmark: {comparison.benchmarkValue}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Synthetic Data Tab */}
        <TabsContent value="synthetic" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Generation Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>New Generation Job</CardTitle>
                <CardDescription>
                  Configure synthetic data generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template">Template</Label>
                  <Select
                    value={generationConfig.template}
                    onValueChange={value =>
                      setGenerationConfig(prev => ({
                        ...prev,
                        template: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social_media_content">
                        Social Media Content
                      </SelectItem>
                      <SelectItem value="campaign_performance">
                        Campaign Performance
                      </SelectItem>
                      <SelectItem value="customer_analytics">
                        Customer Analytics
                      </SelectItem>
                      <SelectItem value="sales_data">Sales Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="record-count">Record Count</Label>
                  <Input
                    id="record-count"
                    type="number"
                    value={generationConfig.recordCount}
                    onChange={e =>
                      setGenerationConfig(prev => ({
                        ...prev,
                        recordCount: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={generationConfig.industry}
                    onValueChange={value =>
                      setGenerationConfig(prev => ({
                        ...prev,
                        industry: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">
                        Manufacturing
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="use-research"
                    checked={generationConfig.useResearch}
                    onCheckedChange={checked =>
                      setGenerationConfig(prev => ({
                        ...prev,
                        useResearch: checked,
                      }))
                    }
                  />
                  <Label htmlFor="use-research">Use Research Mode</Label>
                </div>

                <Button
                  onClick={startSyntheticGeneration}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Generation
                </Button>
              </CardContent>
            </Card>

            {/* Job Management */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Generation Jobs</CardTitle>
                  <CardDescription>
                    Manage synthetic data generation jobs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {syntheticJobs.map(job => (
                        <div
                          key={job.id}
                          className="p-4 border rounded-lg space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${getStatusColor(job.status)}`}
                              />
                              <span className="font-medium">
                                {job.template}
                              </span>
                              <Badge variant="outline">{job.status}</Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-3 w-3" />
                              </Button>
                              {job.status === "completed" && (
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Records:
                              </span>
                              <span className="ml-2 font-medium">
                                {job.recordsGenerated?.toLocaleString() ||
                                  job.recordCount.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Started:
                              </span>
                              <span className="ml-2">
                                {formatDate(job.startTime)}
                              </span>
                            </div>
                            {job.qualityScore && (
                              <div>
                                <span className="text-muted-foreground">
                                  Quality:
                                </span>
                                <span className="ml-2 font-medium">
                                  {(job.qualityScore * 100).toFixed(1)}%
                                </span>
                              </div>
                            )}
                            {job.completedTime && (
                              <div>
                                <span className="text-muted-foreground">
                                  Completed:
                                </span>
                                <span className="ml-2">
                                  {formatDate(job.completedTime)}
                                </span>
                              </div>
                            )}
                          </div>

                          {job.status === "running" && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{job.progress.toFixed(0)}%</span>
                              </div>
                              <Progress value={job.progress} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Benchmarks Tab */}
        <TabsContent value="benchmarks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benchmark Data Sources</CardTitle>
              <CardDescription>
                Manage external benchmark data integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {benchmarkSources.map(source => (
                  <div key={source.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${getStatusColor(source.status)}`}
                        />
                        <div>
                          <h3 className="font-medium">{source.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {source.provider}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => refreshBenchmarkData(source.id)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Refresh
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Industry:</span>
                        <div className="font-medium">{source.industry}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Metrics:</span>
                        <div className="font-medium">{source.metricsCount}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Data Freshness:
                        </span>
                        <div className="font-medium">
                          {source.dataFreshness}%
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Quality Score:
                        </span>
                        <div className="font-medium">
                          {(source.qualityScore * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">
                          Last Updated:
                        </span>
                        <div className="font-medium">
                          {formatDate(source.lastUpdate)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3 text-green-600" />
                        <span className="text-xs">Data Freshness</span>
                      </div>
                      <Progress
                        value={source.dataFreshness}
                        className="flex-1 max-w-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparisons Tab */}
        <TabsContent value="comparisons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance vs Benchmarks</CardTitle>
              <CardDescription>
                Compare your metrics with industry benchmarks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metricComparisons.map(comparison => (
                  <div
                    key={comparison.metric}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{comparison.metric}</h3>
                      <Badge className={getCategoryColor(comparison.category)}>
                        {comparison.category.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">
                          Your Value
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {comparison.userValue}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">
                          Benchmark
                        </div>
                        <div className="text-2xl font-bold text-gray-600">
                          {comparison.benchmarkValue}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">
                          Percentile
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {comparison.percentile}th
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Performance Position</span>
                        <span>{comparison.percentile}th percentile</span>
                      </div>
                      <Progress value={comparison.percentile} />
                    </div>

                    {comparison.improvement > 0 && (
                      <Alert className="mt-3">
                        <TrendingUp className="h-4 w-4" />
                        <AlertTitle>Improvement Opportunity</AlertTitle>
                        <AlertDescription>
                          Improve by {comparison.improvement} to reach industry
                          median
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
