"use client";

/**
 * Data Sync Dashboard Component
 * Task 33.4: Enable Bidirectional Data Synchronization
 * Provides UI for managing and monitoring bidirectional data sync between dashboard and n8n
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  RefreshCw,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Workflow,
  Users,
  BarChart3,
} from "lucide-react";

// Types
interface SyncConfig {
  id?: number;
  sourceType: "dashboard" | "n8n";
  targetType: "dashboard" | "n8n";
  mapping: Record<string, string>;
  transformations: DataTransformation[];
  syncDirection: "bidirectional" | "unidirectional";
  enabled: boolean;
  lastSync?: string;
  syncCount: number;
  createdAt?: string;
  updatedAt?: string;
}

interface DataTransformation {
  field: string;
  operation: "map" | "transform" | "validate" | "format" | "filter";
  rule: string;
  parameters?: Record<string, any>;
}

interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsSynced: number;
  errors: SyncError[];
  metadata: {
    syncId: string;
    startTime: string;
    endTime: string;
    duration: number;
    direction: "dashboard_to_n8n" | "n8n_to_dashboard";
  };
}

interface SyncError {
  recordId: string;
  field?: string;
  error: string;
  errorCode: string;
  retryable: boolean;
}

interface SyncStatus {
  configs: SyncConfig[];
  activeSyncs: string[];
  recentResults: any[];
}

export default function DataSyncDashboard() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedEntityType, setSelectedEntityType] = useState("workflow");
  const [selectedDirection, setSelectedDirection] = useState<
    "bidirectional" | "dashboard_to_n8n" | "n8n_to_dashboard"
  >("bidirectional");
  const [error, setError] = useState<string | null>(null);
  const [newConfig, setNewConfig] = useState<Partial<SyncConfig>>({
    sourceType: "dashboard",
    targetType: "n8n",
    mapping: {},
    transformations: [],
    syncDirection: "bidirectional",
    enabled: true,
  });

  // Load sync status on component mount
  useEffect(() => {
    loadSyncStatus();
    // Set up polling for real-time updates
    const interval = setInterval(loadSyncStatus, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSyncStatus = async () => {
    try {
      const response = await fetch(
        "/api/workflows/data-sync?action=get_status"
      );
      const result = await response.json();

      if (result.success) {
        setSyncStatus(result.data);
        setError(null);
      } else {
        setError(result.error || "Failed to load sync status");
      }
    } catch (err) {
      setError("Network error while loading sync status");
      console.error("Error loading sync status:", err);
    } finally {
      setLoading(false);
    }
  };

  const performSync = async () => {
    setSyncing(true);
    setError(null);

    try {
      const response = await fetch("/api/workflows/data-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "perform_sync",
          entityType: selectedEntityType,
          direction: selectedDirection,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await loadSyncStatus(); // Refresh status after sync
      } else {
        setError(result.error || "Sync operation failed");
      }
    } catch (err) {
      setError("Network error during sync operation");
      console.error("Error performing sync:", err);
    } finally {
      setSyncing(false);
    }
  };

  const createSyncConfig = async () => {
    try {
      const response = await fetch("/api/workflows/data-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_config",
          config: newConfig,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await loadSyncStatus();
        // Reset form
        setNewConfig({
          sourceType: "dashboard",
          targetType: "n8n",
          mapping: {},
          transformations: [],
          syncDirection: "bidirectional",
          enabled: true,
        });
      } else {
        setError(result.error || "Failed to create sync configuration");
      }
    } catch (err) {
      setError("Network error while creating sync configuration");
      console.error("Error creating sync config:", err);
    }
  };

  const getStatusBadge = (enabled: boolean, activeSyncs: string[]) => {
    if (activeSyncs.length > 0) {
      return (
        <Badge variant="secondary">
          <Clock className="w-3 h-3 mr-1" />
          Syncing
        </Badge>
      );
    }
    return enabled ? (
      <Badge variant="default">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="outline">
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case "bidirectional":
        return "⟷";
      case "dashboard_to_n8n":
        return "→";
      case "n8n_to_dashboard":
        return "←";
      default:
        return "?";
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading sync dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Data Synchronization
          </h1>
          <p className="text-muted-foreground">
            Manage bidirectional data sync between dashboard and n8n workflows
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <NormalButton
            onClick={performSync}
            disabled={syncing}
            className="flex items-center space-x-2"
          >
            {syncing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>{syncing ? "Syncing..." : "Sync Now"}</span>
          </NormalButton>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Sync Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Sync Controls</span>
          </CardTitle>
          <CardDescription>
            Configure and trigger data synchronization operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="entityType">Entity Type</Label>
              <Select
                value={selectedEntityType}
                onValueChange={setSelectedEntityType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workflow">Workflows</SelectItem>
                  <SelectItem value="execution">Executions</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="customer">Customers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="direction">Sync Direction</Label>
              <Select
                value={selectedDirection}
                onValueChange={(value: any) => setSelectedDirection(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bidirectional">⟷ Bidirectional</SelectItem>
                  <SelectItem value="dashboard_to_n8n">
                    → Dashboard to n8n
                  </SelectItem>
                  <SelectItem value="n8n_to_dashboard">
                    ← n8n to Dashboard
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <NormalButton
                onClick={performSync}
                disabled={syncing}
                className="w-full"
              >
                {syncing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Start Sync
              </NormalButton>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="configs">Configurations</TabsTrigger>
          <TabsTrigger value="logs">Sync Logs</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
        </TabsList>

        {/* Status Tab */}
        <TabsContent value="status" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Active Configurations */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Configs
                </CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {syncStatus?.configs.filter(c => c.enabled).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {syncStatus?.configs.length || 0} total
                </p>
              </CardContent>
            </Card>

            {/* Active Syncs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Syncs
                </CardTitle>
                <Workflow className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {syncStatus?.activeSyncs.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  operations running
                </p>
              </CardContent>
            </Card>

            {/* Recent Results */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Success Rate
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {syncStatus?.recentResults.length > 0
                    ? Math.round(
                        (syncStatus.recentResults.filter(r => r.success)
                          .length /
                          syncStatus.recentResults.length) *
                          100
                      )
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  last 10 operations
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sync Configurations List */}
          <Card>
            <CardHeader>
              <CardTitle>Sync Configurations</CardTitle>
              <CardDescription>
                Current data synchronization configurations and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {syncStatus?.configs.map((config, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-lg">
                        {getDirectionIcon(config.syncDirection)}
                      </div>
                      <div>
                        <div className="font-medium">
                          {config.sourceType} → {config.targetType}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Last sync:{" "}
                          {config.lastSync
                            ? new Date(config.lastSync).toLocaleDateString()
                            : "Never"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{config.syncCount} syncs</Badge>
                      {getStatusBadge(
                        config.enabled,
                        syncStatus?.activeSyncs || []
                      )}
                    </div>
                  </div>
                ))}
                {!syncStatus?.configs.length && (
                  <div className="text-center py-6 text-muted-foreground">
                    No sync configurations found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurations Tab */}
        <TabsContent value="configs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Configuration</CardTitle>
              <CardDescription>
                Set up a new data synchronization configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sourceType">Source Type</Label>
                  <Select
                    value={newConfig.sourceType}
                    onValueChange={(value: any) =>
                      setNewConfig({ ...newConfig, sourceType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                      <SelectItem value="n8n">n8n</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="targetType">Target Type</Label>
                  <Select
                    value={newConfig.targetType}
                    onValueChange={(value: any) =>
                      setNewConfig({ ...newConfig, targetType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                      <SelectItem value="n8n">n8n</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="syncDirection">Sync Direction</Label>
                <Select
                  value={newConfig.syncDirection}
                  onValueChange={(value: any) =>
                    setNewConfig({ ...newConfig, syncDirection: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bidirectional">Bidirectional</SelectItem>
                    <SelectItem value="unidirectional">
                      Unidirectional
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mapping">Field Mapping (JSON)</Label>
                <Textarea
                  placeholder='{"sourceField": "targetField"}'
                  value={JSON.stringify(newConfig.mapping, null, 2)}
                  onChange={e => {
                    try {
                      const mapping = JSON.parse(e.target.value);
                      setNewConfig({ ...newConfig, mapping });
                    } catch {}
                  }}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={newConfig.enabled}
                  onCheckedChange={enabled =>
                    setNewConfig({ ...newConfig, enabled })
                  }
                />
                <Label>Enable configuration</Label>
              </div>

              <NormalButton onClick={createSyncConfig} className="w-full">
                Create Configuration
              </NormalButton>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sync Operations</CardTitle>
              <CardDescription>
                History of recent data synchronization operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {syncStatus?.recentResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <div>
                        <div className="font-medium">
                          {result.direction?.replace("_", " → ")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {result.started_at
                            ? new Date(result.started_at).toLocaleString()
                            : "Unknown time"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {result.records_synced || 0} /{" "}
                        {result.records_processed || 0} records
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDuration(result.duration_ms || 0)}
                      </div>
                    </div>
                  </div>
                ))}
                {!syncStatus?.recentResults.length && (
                  <div className="text-center py-6 text-muted-foreground">
                    No recent sync operations
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conflicts Tab */}
        <TabsContent value="conflicts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Conflicts</CardTitle>
              <CardDescription>
                Manage and resolve data synchronization conflicts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                No unresolved conflicts found
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
