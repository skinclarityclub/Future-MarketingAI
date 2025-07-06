/**
 * Data Enrichment & Performance Benchmarking Dashboard
 * Task 72.8: Implementeer continue data enrichment en performance benchmarking
 */

"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Activity,
  TrendingUp,
  Database,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Target,
  Settings,
  Eye,
  Play,
  Pause,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

// Types for API responses
interface LiveDataResponse {
  success: boolean;
  data: {
    collection_status: any[];
    performance_metrics: any;
    orchestrator_status: any;
    system_health: any;
    timestamp: string;
  };
}

function StatusIndicator({
  status,
}: {
  status: "active" | "inactive" | "error" | "running" | "paused" | string;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "running":
        return "bg-green-500";
      case "inactive":
      case "paused":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Actief";
      case "running":
        return "Draaiend";
      case "inactive":
        return "Inactief";
      case "paused":
        return "Gepauzeerd";
      case "error":
        return "Fout";
      default:
        return "Onbekend";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`}></div>
      <span className="text-sm font-medium">{getStatusText(status)}</span>
    </div>
  );
}

function HealthIndicator({
  health,
}: {
  health: "healthy" | "warning" | "critical";
}) {
  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "text-green-600 bg-green-50 border-green-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getHealthText = (health: string) => {
    switch (health) {
      case "healthy":
        return "Gezond";
      case "warning":
        return "Waarschuwing";
      case "critical":
        return "Kritisch";
      default:
        return "Onbekend";
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case "healthy":
        return <CheckCircle className="w-4 h-4" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4" />;
      case "critical":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  return (
    <Badge className={`${getHealthColor(health)} gap-1`}>
      {getHealthIcon(health)}
      {getHealthText(health)}
    </Badge>
  );
}

function SystemOverview({
  liveData,
}: {
  liveData: LiveDataResponse["data"] | null;
}) {
  const defaultData = {
    orchestrator_status: { status: "unknown" },
    performance_metrics: {
      success_rate: 0,
      total_collections_today: 0,
      avg_collection_time: 0,
      active_engines: 0,
      failed_collections: 0,
    },
    system_health: { database_connectivity: "unknown" },
    timestamp: new Date().toISOString(),
  };

  const data = liveData || defaultData;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Orchestrator Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Orchestrator</CardTitle>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <StatusIndicator
            status={data.orchestrator_status?.status || "unknown"}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Laatste update:{" "}
            {new Date(data.timestamp).toLocaleTimeString("nl-NL")}
          </p>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Systeemstatus</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <HealthIndicator
            health={
              data.system_health?.database_connectivity === "active"
                ? "healthy"
                : "warning"
            }
          />
          <p className="text-xs text-muted-foreground mt-2">
            Success Rate:{" "}
            {(data.performance_metrics?.success_rate || 0).toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      {/* Active Operations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Actieve Processen
          </CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.performance_metrics?.total_collections_today || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            collecties vandaag, {data.performance_metrics?.active_engines || 0}{" "}
            engines actief
          </p>
        </CardContent>
      </Card>

      {/* Performance Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Prestatie Score</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(data.performance_metrics?.success_rate || 0).toFixed(0)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Gem. tijd: {data.performance_metrics?.avg_collection_time || 0}ms
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ComponentStatus({
  liveData,
}: {
  liveData: LiveDataResponse["data"] | null;
}) {
  const data = liveData?.collection_status || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Collection Status</CardTitle>
          <CardDescription>
            Status van actieve data collection bronnen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
            <div className="space-y-3">
              {data.slice(0, 5).map((source: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium">
                      {source.source_type}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {source.source_id}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusIndicator status={source.status} />
                    <p className="text-xs text-muted-foreground">
                      {source.records_collected} records
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Geen actieve collecties
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Performance</CardTitle>
          <CardDescription>Live performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Success Rate:</span>
              <span className="text-sm font-medium">
                {(liveData?.performance_metrics?.success_rate || 0).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Total Records:</span>
              <span className="text-sm font-medium">
                {(
                  liveData?.performance_metrics?.total_records_processed || 0
                ).toLocaleString("nl-NL")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Active Engines:</span>
              <span className="text-sm font-medium">
                {liveData?.performance_metrics?.active_engines || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Failed Collections:</span>
              <span className="text-sm font-medium text-red-600">
                {liveData?.performance_metrics?.failed_collections || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PerformanceMetrics({
  liveData,
}: {
  liveData: LiveDataResponse["data"] | null;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Volume</CardTitle>
          <CardDescription>Overzicht van verwerkte data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Data Volume</p>
              <p className="text-2xl font-bold">
                {(liveData?.performance_metrics?.data_volume_mb || 0).toFixed(
                  1
                )}{" "}
                MB
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quality Score</p>
              <p className="text-2xl font-bold">
                {(
                  liveData?.performance_metrics?.avg_quality_score * 100 || 0
                ).toFixed(0)}
                %
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Collection Performance</CardTitle>
          <CardDescription>Real-time collection statistics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Avg Collection Time
              </p>
              <p className="text-2xl font-bold">
                {liveData?.performance_metrics?.avg_collection_time || 0}ms
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Collections Today</p>
              <p className="text-2xl font-bold">
                {liveData?.performance_metrics?.total_collections_today || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ControlPanel({
  liveData,
}: {
  liveData: LiveDataResponse["data"] | null;
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleAction = async (action: string) => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/data-seeding/orchestrator/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const result = await response.json();
      console.log("Action result:", result);
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orchestrator Besturing</CardTitle>
        <CardDescription>Beheer de Task 72.8 processen</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            onClick={() => handleAction("start_collection")}
          >
            <Play className="w-4 h-4 mr-2" />
            Start Collection
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            onClick={() => handleAction("force_refresh")}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Force Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            onClick={() => handleAction("emergency_stop")}
          >
            <Pause className="w-4 h-4 mr-2" />
            Emergency Stop
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configure Settings
          </Button>
        </div>

        {liveData && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>System Health:</strong>{" "}
              {liveData.system_health?.database_connectivity || "Unknown"}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>API Connections:</strong>{" "}
              {liveData.system_health?.api_connections || "Unknown"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DataEnrichmentDashboard() {
  const [liveData, setLiveData] = useState<LiveDataResponse["data"] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch live data from API
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "/api/data-seeding/orchestrator/status?include_performance=true"
        );
        const result: LiveDataResponse = await response.json();

        if (result.success) {
          setLiveData(result.data);
          setLastUpdate(new Date());
          setError(null);
        } else {
          setError("Failed to fetch live data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchLiveData();
    const interval = setInterval(fetchLiveData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading && !liveData) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Live data laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">
              Data Enrichment & Performance Dashboard
            </h1>
            {liveData && (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                🔴 LIVE DATA
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Task 72.8: Continue data enrichment en performance benchmarking
            monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Laatste update: {lastUpdate.toLocaleTimeString("nl-NL")}
          </span>
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Data Loading Error</AlertTitle>
          <AlertDescription>
            {error} - Showing cached data if available.
          </AlertDescription>
        </Alert>
      )}

      {/* Active Alerts */}
      {liveData?.performance_metrics?.failed_collections &&
        liveData.performance_metrics.failed_collections > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Actieve Waarschuwing</AlertTitle>
            <AlertDescription>
              Er zijn {liveData.performance_metrics.failed_collections} gefaalde
              collecties die aandacht vereisen.
            </AlertDescription>
          </Alert>
        )}

      {/* System Overview */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Systeemoverzicht</h2>
        <SystemOverview liveData={liveData} />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="components" className="space-y-6">
        <TabsList>
          <TabsTrigger value="components">Componenten</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="control">Besturing</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="space-y-6">
          <h2 className="text-2xl font-semibold">Component Status</h2>
          <Suspense fallback={<div>Loading...</div>}>
            <ComponentStatus liveData={liveData} />
          </Suspense>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <h2 className="text-2xl font-semibold">Performance Metrics</h2>
          <Suspense fallback={<div>Loading...</div>}>
            <PerformanceMetrics liveData={liveData} />
          </Suspense>
        </TabsContent>

        <TabsContent value="control" className="space-y-6">
          <h2 className="text-2xl font-semibold">Systeem Besturing</h2>
          <Suspense fallback={<div>Loading...</div>}>
            <ControlPanel liveData={liveData} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
