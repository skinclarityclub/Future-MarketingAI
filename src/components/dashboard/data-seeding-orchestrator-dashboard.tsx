/**
 * Data Seeding Orchestrator Dashboard
 * Task 72.7: Ontwikkel monitoring, rollback en versiebeheer
 *
 * Real-time monitoring dashboard voor de centrale data seeding orchestrator
 * Met functionaliteit voor rollback, versioning en performance tracking
 */

"use client";

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
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Download,
  Upload,
  RefreshCw,
  Settings,
  BarChart3,
  Activity,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Data interfaces voor dashboard state
interface CollectionStatus {
  source_id: string;
  source_type: string;
  status: "idle" | "collecting" | "processing" | "completed" | "failed";
  progress: number;
  records_collected: number;
  quality_score: number;
  last_updated: string;
  next_collection: string;
  error_message?: string;
}

interface PerformanceMetrics {
  total_collections_today: number;
  success_rate: number;
  avg_collection_time: number;
  avg_quality_score: number;
  total_records_processed: number;
  data_volume_mb: number;
  active_engines: number;
  failed_collections: number;
}

interface DataVersion {
  version_id: string;
  version_number: string;
  created_at: string;
  data_size_mb: number;
  quality_score: number;
  engines_seeded: string[];
  status: "active" | "archived" | "rollback_ready";
  description: string;
}

interface RollbackOperation {
  operation_id: string;
  target_version: string;
  initiated_at: string;
  completed_at?: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  affected_engines: string[];
  progress: number;
  error_message?: string;
}

export function DataSeedingOrchestratorDashboard() {
  // State management
  const [collectionStatus, setCollectionStatus] = useState<CollectionStatus[]>(
    []
  );
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetrics>({
      total_collections_today: 0,
      success_rate: 0,
      avg_collection_time: 0,
      avg_quality_score: 0,
      total_records_processed: 0,
      data_volume_mb: 0,
      active_engines: 0,
      failed_collections: 0,
    });
  const [dataVersions, setDataVersions] = useState<DataVersion[]>([]);
  const [rollbackOperations, setRollbackOperations] = useState<
    RollbackOperation[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Simulated data - in production this would come from API calls
  useEffect(() => {
    const fetchDashboardData = () => {
      // Simulate collection status
      setCollectionStatus([
        {
          source_id: "supabase_content_posts",
          source_type: "database",
          status: "completed",
          progress: 100,
          records_collected: 1247,
          quality_score: 0.92,
          last_updated: "2025-06-22T19:45:00Z",
          next_collection: "2025-06-23T08:00:00Z",
        },
        {
          source_id: "instagram_business_api",
          source_type: "api",
          status: "collecting",
          progress: 67,
          records_collected: 834,
          quality_score: 0.89,
          last_updated: "2025-06-22T19:50:00Z",
          next_collection: "2025-06-22T20:00:00Z",
        },
        {
          source_id: "trending_hashtag_scraper",
          source_type: "webscraping",
          status: "processing",
          progress: 45,
          records_collected: 2156,
          quality_score: 0.85,
          last_updated: "2025-06-22T19:48:00Z",
          next_collection: "2025-06-22T21:00:00Z",
        },
        {
          source_id: "linkedin_api",
          source_type: "api",
          status: "failed",
          progress: 0,
          records_collected: 0,
          quality_score: 0,
          last_updated: "2025-06-22T19:30:00Z",
          next_collection: "2025-06-22T20:30:00Z",
          error_message: "API rate limit exceeded",
        },
        {
          source_id: "synthetic_content_generator",
          source_type: "synthetic",
          status: "completed",
          progress: 100,
          records_collected: 5000,
          quality_score: 0.95,
          last_updated: "2025-06-22T19:40:00Z",
          next_collection: "2025-06-23T12:00:00Z",
        },
      ]);

      // Simulate performance metrics
      setPerformanceMetrics({
        total_collections_today: 24,
        success_rate: 87.5,
        avg_collection_time: 4.2,
        avg_quality_score: 0.88,
        total_records_processed: 47392,
        data_volume_mb: 1247.8,
        active_engines: 15,
        failed_collections: 3,
      });

      // Simulate data versions
      setDataVersions([
        {
          version_id: "v2025.06.22.001",
          version_number: "1.2.47",
          created_at: "2025-06-22T19:00:00Z",
          data_size_mb: 1247.8,
          quality_score: 0.88,
          engines_seeded: [
            "ContentMLEngine",
            "NavigationMLEngine",
            "CustomerIntelligenceEngine",
            "AnalyticsEngine",
          ],
          status: "active",
          description:
            "Daily data collection with enhanced social media insights",
        },
        {
          version_id: "v2025.06.21.003",
          version_number: "1.2.46",
          created_at: "2025-06-21T18:30:00Z",
          data_size_mb: 1156.2,
          quality_score: 0.91,
          engines_seeded: [
            "ContentMLEngine",
            "NavigationMLEngine",
            "CustomerIntelligenceEngine",
          ],
          status: "rollback_ready",
          description: "Stable version with verified data quality",
        },
        {
          version_id: "v2025.06.21.002",
          version_number: "1.2.45",
          created_at: "2025-06-21T12:15:00Z",
          data_size_mb: 1089.4,
          quality_score: 0.86,
          engines_seeded: ["ContentMLEngine", "NavigationMLEngine"],
          status: "archived",
          description: "Previous stable version",
        },
      ]);

      setLastUpdate(new Date());
      setIsLoading(false);
    };

    fetchDashboardData();

    // Auto-refresh every 30 seconds if enabled
    const interval = autoRefresh
      ? setInterval(fetchDashboardData, 30000)
      : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "collecting":
      case "processing":
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case "database":
        return <Database className="h-4 w-4" />;
      case "api":
        return <Upload className="h-4 w-4" />;
      case "webscraping":
        return <Download className="h-4 w-4" />;
      case "synthetic":
        return <Settings className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const handleManualRefresh = () => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setLastUpdate(new Date());
      setIsLoading(false);
    }, 1000);
  };

  const handleRollback = (versionId: string) => {
    const newRollback: RollbackOperation = {
      operation_id: `rollback_${Date.now()}`,
      target_version: versionId,
      initiated_at: new Date().toISOString(),
      status: "pending",
      affected_engines: [
        "ContentMLEngine",
        "NavigationMLEngine",
        "CustomerIntelligenceEngine",
      ],
      progress: 0,
    };

    setRollbackOperations(prev => [newRollback, ...prev]);

    // Simulate rollback progress
    setTimeout(() => {
      setRollbackOperations(prev =>
        prev.map(op =>
          op.operation_id === newRollback.operation_id
            ? { ...op, status: "in_progress" as const, progress: 50 }
            : op
        )
      );
    }, 2000);

    setTimeout(() => {
      setRollbackOperations(prev =>
        prev.map(op =>
          op.operation_id === newRollback.operation_id
            ? {
                ...op,
                status: "completed" as const,
                progress: 100,
                completed_at: new Date().toISOString(),
              }
            : op
        )
      );
    }, 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Data Seeding Monitor
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Laatste update: {lastUpdate.toLocaleTimeString("nl-NL")}
          </p>
        </div>
        <div className="flex gap-2">
          <NormalButton
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            Auto-refresh {autoRefresh ? "AAN" : "UIT"}
          </NormalButton>
          <NormalButton
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Vernieuwen
          </NormalButton>
        </div>
      </div>

      {/* Performance Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verzamelingen Vandaag
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics.total_collections_today}
            </div>
            <p className="text-xs text-muted-foreground">
              {performanceMetrics.failed_collections} gefaald
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Succes Ratio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics.success_rate}%
            </div>
            <Progress
              value={performanceMetrics.success_rate}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Gem. Kwaliteit Score
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics.avg_quality_score.toFixed(2)}
            </div>
            <Progress
              value={performanceMetrics.avg_quality_score * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Actieve Engines
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics.active_engines}
            </div>
            <p className="text-xs text-muted-foreground">
              {performanceMetrics.total_records_processed.toLocaleString()}{" "}
              records verwerkt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="collection" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="collection">Data Verzameling</TabsTrigger>
          <TabsTrigger value="versions">Versies</TabsTrigger>
          <TabsTrigger value="rollback">Rollback</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Data Collection Tab */}
        <TabsContent value="collection">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Bronnen Status</CardTitle>
                <CardDescription>
                  Real-time status van alle geregistreerde data bronnen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {collectionStatus.map(source => (
                    <div
                      key={source.source_id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getSourceTypeIcon(source.source_type)}
                        <div>
                          <h4 className="font-medium">
                            {source.source_id.replace(/_/g, " ").toUpperCase()}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {source.records_collected.toLocaleString()} records
                            • Kwaliteit:{" "}
                            {(source.quality_score * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <Badge
                            variant={
                              source.status === "completed"
                                ? "default"
                                : source.status === "failed"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {source.status}
                          </Badge>
                          {source.status === "collecting" ||
                          source.status === "processing" ? (
                            <Progress
                              value={source.progress}
                              className="w-24 mt-1"
                            />
                          ) : null}
                        </div>
                        {getStatusIcon(source.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Versions Tab */}
        <TabsContent value="versions">
          <Card>
            <CardHeader>
              <CardTitle>Data Versies</CardTitle>
              <CardDescription>
                Beheer en monitor alle data versies voor rollback
                functionaliteit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataVersions.map(version => (
                  <div
                    key={version.version_id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">
                          {version.version_number}
                        </h4>
                        <Badge
                          variant={
                            version.status === "active"
                              ? "default"
                              : version.status === "rollback_ready"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {version.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {version.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{version.data_size_mb.toFixed(1)} MB</span>
                        <span>
                          Kwaliteit: {(version.quality_score * 100).toFixed(0)}%
                        </span>
                        <span>{version.engines_seeded.length} engines</span>
                        <span>
                          {new Date(version.created_at).toLocaleString("nl-NL")}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {version.status === "rollback_ready" && (
                        <NormalButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleRollback(version.version_id)}
                        >
                          Rollback
                        </NormalButton>
                      )}
                      <NormalButton variant="ghost" size="sm">
                        Details
                      </NormalButton>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rollback Tab */}
        <TabsContent value="rollback">
          <Card>
            <CardHeader>
              <CardTitle>Rollback Operaties</CardTitle>
              <CardDescription>
                Status van actieve en recente rollback operaties
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rollbackOperations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Geen actieve rollback operaties
                </div>
              ) : (
                <div className="space-y-4">
                  {rollbackOperations.map(operation => (
                    <div
                      key={operation.operation_id}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          Rollback naar {operation.target_version}
                        </h4>
                        <Badge
                          variant={
                            operation.status === "completed"
                              ? "default"
                              : operation.status === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {operation.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Beïnvloede engines:{" "}
                        {operation.affected_engines.join(", ")}
                      </div>
                      {operation.status === "in_progress" && (
                        <Progress value={operation.progress} className="mb-2" />
                      )}
                      <div className="text-xs text-gray-500">
                        Gestart:{" "}
                        {new Date(operation.initiated_at).toLocaleString(
                          "nl-NL"
                        )}
                        {operation.completed_at && (
                          <span>
                            {" "}
                            • Voltooid:{" "}
                            {new Date(operation.completed_at).toLocaleString(
                              "nl-NL"
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Systeem Gezondheid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database Connectiviteit</span>
                    <Badge variant="default">Actief</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Verbindingen</span>
                    <Badge variant="secondary">4/5 Actief</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Scraping Services</span>
                    <Badge variant="default">Actief</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ML Engines</span>
                    <Badge variant="default">15/15 Actief</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recente Waarschuwingen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      LinkedIn API rate limit bereikt - volgende poging in 30
                      minuten
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Data kwaliteit voor TikTok scraper onder drempelwaarde
                      (0.75)
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
