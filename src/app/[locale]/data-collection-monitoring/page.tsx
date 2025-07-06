/**
 * Data Collection Monitoring Dashboard
 * Task 72.2: Ontwikkel unified data collection pipeline
 *
 * Real-time monitoring dashboard voor de unified data collection pipeline
 * Toont status, metrics, en health van alle data sources en connectors
 */

import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  Database,
  Globe,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Shield,
  Users,
} from "lucide-react";

interface DataCollectionStatus {
  pipeline_id: string;
  status: "active" | "idle" | "error" | "maintenance";
  active_collections: number;
  registered_sources: number;
  registered_strategies: number;
  recent_collections: Array<{
    source_id: string;
    source_type: string;
    success: boolean;
    records_collected: number;
    quality_score: number;
    data_size_mb: number;
    collection_time_ms: number;
    timestamp: string;
    error_message?: string;
  }>;
  performance_metrics: {
    success_rate: number;
    avg_collection_time: number;
    avg_quality_score: number;
    total_records_today: number;
    total_data_size_mb: number;
  };
  source_health: Array<{
    source_id: string;
    platform: string;
    status: "healthy" | "warning" | "error";
    last_collection: string;
    consecutive_errors: number;
    rate_limit_status: number; // 0-1
  }>;
}

// Mock data voor development - in productie komt dit van de API
const mockCollectionStatus: DataCollectionStatus = {
  pipeline_id: "unified_pipeline_001",
  status: "active",
  active_collections: 3,
  registered_sources: 12,
  registered_strategies: 5,
  recent_collections: [
    {
      source_id: "instagram_business_api",
      source_type: "api",
      success: true,
      records_collected: 1247,
      quality_score: 0.92,
      data_size_mb: 18.5,
      collection_time_ms: 12340,
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      source_id: "linkedin_api",
      source_type: "api",
      success: true,
      records_collected: 856,
      quality_score: 0.89,
      data_size_mb: 11.2,
      collection_time_ms: 8920,
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
      source_id: "competitor_content_scraping",
      source_type: "webscraping",
      success: false,
      records_collected: 0,
      quality_score: 0,
      data_size_mb: 0,
      collection_time_ms: 45000,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      error_message: "Rate limit exceeded, retrying in 30 minutes",
    },
    {
      source_id: "supabase_content_posts",
      source_type: "database",
      success: true,
      records_collected: 2341,
      quality_score: 0.95,
      data_size_mb: 45.8,
      collection_time_ms: 3450,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
  ],
  performance_metrics: {
    success_rate: 0.87,
    avg_collection_time: 12500,
    avg_quality_score: 0.91,
    total_records_today: 15420,
    total_data_size_mb: 342.7,
  },
  source_health: [
    {
      source_id: "instagram_business_api",
      platform: "Instagram",
      status: "healthy",
      last_collection: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      consecutive_errors: 0,
      rate_limit_status: 0.65,
    },
    {
      source_id: "linkedin_api",
      platform: "LinkedIn",
      status: "healthy",
      last_collection: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      consecutive_errors: 0,
      rate_limit_status: 0.23,
    },
    {
      source_id: "facebook_graph_api",
      platform: "Facebook",
      status: "warning",
      last_collection: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      consecutive_errors: 1,
      rate_limit_status: 0.89,
    },
    {
      source_id: "competitor_content_scraping",
      platform: "Web Scraping",
      status: "error",
      last_collection: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      consecutive_errors: 3,
      rate_limit_status: 1.0,
    },
    {
      source_id: "supabase_content_posts",
      platform: "Database",
      status: "healthy",
      last_collection: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      consecutive_errors: 0,
      rate_limit_status: 0.12,
    },
  ],
};

function StatusBadge({ status }: { status: string }) {
  const variants = {
    active: "default",
    healthy: "default",
    idle: "secondary",
    warning: "secondary",
    error: "destructive",
    maintenance: "outline",
  } as const;

  const colors = {
    active: "text-green-600",
    healthy: "text-green-600",
    idle: "text-gray-600",
    warning: "text-yellow-600",
    error: "text-red-600",
    maintenance: "text-blue-600",
  } as const;

  return (
    <Badge
      variant={variants[status as keyof typeof variants]}
      className={colors[status as keyof typeof colors]}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function CollectionOverview({ status }: { status: DataCollectionStatus }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pipeline Status</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <StatusBadge status={status.status} />
          </div>
          <p className="text-xs text-muted-foreground">
            {status.active_collections} active collections
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(status.performance_metrics.success_rate * 100).toFixed(1)}%
          </div>
          <Progress
            value={status.performance_metrics.success_rate * 100}
            className="mt-2"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Records Today</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {status.performance_metrics.total_records_today.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {status.performance_metrics.total_data_size_mb.toFixed(1)} MB
            collected
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(status.performance_metrics.avg_quality_score * 100).toFixed(0)}%
          </div>
          <Progress
            value={status.performance_metrics.avg_quality_score * 100}
            className="mt-2"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function SourceHealthOverview({
  sources,
}: {
  sources: DataCollectionStatus["source_health"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Data Source Health
        </CardTitle>
        <CardDescription>
          Status of all registered data sources and API connectors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sources.map(source => (
            <div
              key={source.source_id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    source.status === "healthy"
                      ? "bg-green-500"
                      : source.status === "warning"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                />
                <div>
                  <p className="font-medium">{source.platform}</p>
                  <p className="text-sm text-muted-foreground">
                    {source.source_id}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">
                    Rate Limit: {(source.rate_limit_status * 100).toFixed(0)}%
                  </p>
                  <Progress
                    value={source.rate_limit_status * 100}
                    className="w-20 h-2"
                  />
                </div>

                <div className="text-right">
                  <p className="text-sm">
                    {source.consecutive_errors === 0
                      ? "No errors"
                      : `${source.consecutive_errors} consecutive errors`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last:{" "}
                    {new Date(source.last_collection).toLocaleTimeString()}
                  </p>
                </div>

                <StatusBadge status={source.status} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentCollections({
  collections,
}: {
  collections: DataCollectionStatus["recent_collections"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Collections
        </CardTitle>
        <CardDescription>
          Latest data collection attempts and their results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {collections.map((collection, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {collection.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}

                <div>
                  <p className="font-medium">{collection.source_id}</p>
                  <p className="text-sm text-muted-foreground">
                    {collection.source_type} •{" "}
                    {new Date(collection.timestamp).toLocaleString()}
                  </p>
                  {collection.error_message && (
                    <p className="text-sm text-red-600 mt-1">
                      {collection.error_message}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="font-medium">
                  {collection.records_collected.toLocaleString()} records
                </p>
                <p className="text-sm text-muted-foreground">
                  {collection.data_size_mb.toFixed(1)} MB •{" "}
                  {(collection.collection_time_ms / 1000).toFixed(1)}s
                </p>
                {collection.success && (
                  <p className="text-sm text-green-600">
                    Quality: {(collection.quality_score * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PerformanceMetrics({
  metrics,
}: {
  metrics: DataCollectionStatus["performance_metrics"];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Collection Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Average Collection Time</span>
            <span className="font-mono">
              {(metrics.avg_collection_time / 1000).toFixed(1)}s
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Success Rate</span>
            <span className="font-mono">
              {(metrics.success_rate * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Average Quality Score</span>
            <span className="font-mono">
              {(metrics.avg_quality_score * 100).toFixed(0)}%
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Data Volume
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Total Records Today</span>
            <span className="font-mono">
              {metrics.total_records_today.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Total Data Size</span>
            <span className="font-mono">
              {metrics.total_data_size_mb.toFixed(1)} MB
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Avg Records/Collection</span>
            <span className="font-mono">
              {Math.round(metrics.total_records_today / 24)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PipelineControls() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Pipeline Controls
        </CardTitle>
        <CardDescription>
          Manual controls for data collection pipeline management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button size="sm" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Status
          </Button>
          <Button variant="outline" size="sm">
            Trigger Collection
          </Button>
          <Button variant="outline" size="sm">
            Test Connections
          </Button>
          <Button variant="secondary" size="sm">
            View Logs
          </Button>
          <Button variant="destructive" size="sm">
            Emergency Stop
          </Button>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium mb-1">Next Scheduled Collection</p>
            <p className="text-muted-foreground">
              {new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString()}
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">Pipeline Uptime</p>
            <p className="text-muted-foreground">2d 14h 23m</p>
          </div>
          <div>
            <p className="font-medium mb-1">Last Full Sync</p>
            <p className="text-muted-foreground">
              {new Date(Date.now() - 6 * 60 * 60 * 1000).toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DataCollectionMonitoringPage() {
  const status = mockCollectionStatus;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Data Collection Pipeline
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage the unified data collection pipeline voor alle
            AI/ML engines
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Live</Badge>
          <Button size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <CollectionOverview status={status} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="collections">Recent Collections</TabsTrigger>
          <TabsTrigger value="metrics">Performance</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SourceHealthOverview sources={status.source_health} />
            <RecentCollections
              collections={status.recent_collections.slice(0, 4)}
            />
          </div>
          <PerformanceMetrics metrics={status.performance_metrics} />
        </TabsContent>

        <TabsContent value="sources">
          <SourceHealthOverview sources={status.source_health} />
        </TabsContent>

        <TabsContent value="collections">
          <RecentCollections collections={status.recent_collections} />
        </TabsContent>

        <TabsContent value="metrics">
          <PerformanceMetrics metrics={status.performance_metrics} />
        </TabsContent>

        <TabsContent value="controls">
          <PipelineControls />
        </TabsContent>
      </Tabs>

      {status.status === "error" && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Pipeline Error Detected</AlertTitle>
          <AlertDescription>
            Multiple data sources are experiencing issues. Check the source
            health tab for details.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
