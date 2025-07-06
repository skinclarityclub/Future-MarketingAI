"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Server,
  Shield,
  Zap,
  ArrowRight,
  Database,
  Wifi,
  WifiOff,
} from "lucide-react";
// Mock failover types and manager
interface FailoverRegion {
  id: string;
  name: string;
  status: "active" | "standby" | "failed" | "maintenance";
  location: string;
  health: number;
  latency?: number;
  connections?: number;
  dataSync?: number;
}

interface FailoverEvent {
  id: string;
  timestamp: Date;
  type: string;
  sourceRegion: string;
  targetRegion: string;
  duration?: number;
  success: boolean;
}

interface FailoverMetrics {
  totalFailovers: number;
  automaticFailovers: number;
  manualFailovers: number;
  averageFailoverTime: number;
  successfulFailovers: number;
  failedFailovers: number;
  currentActiveRegion: string;
  rtoCompliance: number;
  uptime: number;
  regions?: FailoverRegion[];
  events?: FailoverEvent[];
}

// Mock failover manager
const failoverManager = {
  initialize: async () => Promise.resolve(),
  shutdown: () => {},
  getMetrics: (): FailoverMetrics => ({
    totalFailovers: 12,
    automaticFailovers: 8,
    manualFailovers: 4,
    averageFailoverTime: 2.5,
    successfulFailovers: 11,
    failedFailovers: 1,
    currentActiveRegion: "EU-West-1",
    rtoCompliance: 98.5,
    uptime: 99.97,
    regions: [
      {
        id: "eu-west-1",
        name: "EU West 1",
        status: "active",
        location: "Amsterdam",
        health: 100,
      },
      {
        id: "us-east-1",
        name: "US East 1",
        status: "standby",
        location: "Virginia",
        health: 95,
      },
    ],
    events: [],
  }),
  executeManualFailover: async (regionId: string, reason: string) =>
    Promise.resolve(),
};

interface FailoverDemoState {
  regions: FailoverRegion[];
  events: FailoverEvent[];
  metrics: FailoverMetrics;
  isInitialized: boolean;
  isLoading: boolean;
}

export function FailoverDemo() {
  const [state, setState] = useState<FailoverDemoState>({
    regions: [],
    events: [],
    metrics: {
      totalFailovers: 0,
      automaticFailovers: 0,
      manualFailovers: 0,
      averageFailoverTime: 0,
      successfulFailovers: 0,
      failedFailovers: 0,
      currentActiveRegion: "",
      rtoCompliance: 100,
      uptime: 99.9,
    },
    isInitialized: false,
    isLoading: true,
  });

  useEffect(() => {
    initializeFailoverManager();
    return () => {
      if (state.isInitialized) {
        failoverManager.shutdown();
      }
    };
  }, []);

  const initializeFailoverManager = async () => {
    try {
      await failoverManager.initialize();
      updateState();
      setState(prev => ({ ...prev, isInitialized: true, isLoading: false }));

      // Update state every 5 seconds
      const interval = setInterval(updateState, 5000);
      return () => clearInterval(interval);
    } catch (error) {
      console.error("Failed to initialize failover manager:", error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const updateState = () => {
    const data = failoverManager.getMetrics();
    setState(prev => ({
      ...prev,
      regions: data.regions,
      events: data.events,
      metrics: data,
    }));
  };

  const handleManualFailover = async (regionId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await failoverManager.executeManualFailover(
        regionId,
        "Manual failover initiated from demo"
      );
      updateState();
    } catch (error) {
      console.error("Manual failover failed:", error);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const getStatusIcon = (status: FailoverRegion["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "standby":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "maintenance":
        return <Wifi className="h-4 w-4 text-orange-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: FailoverRegion["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "standby":
        return "bg-blue-500";
      case "failed":
        return "bg-red-500";
      case "maintenance":
        return "bg-orange-500";
      default:
        return "bg-gray-400";
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "N/A";
    return `${minutes.toFixed(2)} min`;
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat("nl-NL", {
      dateStyle: "short",
      timeStyle: "medium",
    }).format(new Date(date));
  };

  if (state.isLoading && !state.isInitialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Automated Failover Demo
          </CardTitle>
          <CardDescription>
            Initialiseren van failover manager...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Automated Failover Manager Demo
          </CardTitle>
          <CardDescription>
            Multi-region disaster recovery met automatische failover procedures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Actieve Regio</span>
              </div>
              <p className="text-lg font-semibold">
                {state.metrics.currentActiveRegion}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Uptime</span>
              </div>
              <p className="text-lg font-semibold">
                {state.metrics.uptime.toFixed(2)}%
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">RTO Compliance</span>
              </div>
              <p className="text-lg font-semibold">
                {state.metrics.rtoCompliance.toFixed(1)}%
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Totale Failovers</span>
              </div>
              <p className="text-lg font-semibold">
                {state.metrics.totalFailovers}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {state.regions.map(region => (
          <Card key={region.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {region.name}
                </CardTitle>
                <Badge
                  variant={region.status === "active" ? "default" : "secondary"}
                  className={`${getStatusColor(region.status)} text-white`}
                >
                  {getStatusIcon(region.status)}
                  <span className="ml-1 capitalize">{region.status}</span>
                </Badge>
              </div>
              <CardDescription>
                {region.provider.toUpperCase()} • Priority {region.priority}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Response Time:</span>
                  <span className="font-mono">
                    {region.responseTime ? `${region.responseTime}ms` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Check:</span>
                  <span className="font-mono">
                    {region.lastHealthCheck
                      ? formatTimestamp(region.lastHealthCheck)
                      : "Never"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Endpoint:</span>
                  <span className="font-mono text-xs truncate max-w-[120px]">
                    {region.endpoint}
                  </span>
                </div>
              </div>

              {region.status !== "active" && region.status !== "failed" && (
                <NormalButton
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleManualFailover(region.id)}
                  disabled={state.isLoading}
                >
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Failover naar deze regio
                </NormalButton>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Demo Mode:</strong> Dit is een demonstratie van de automated
          failover manager. Health checks en failovers worden gesimuleerd. In
          productie zou dit echte DNS-wijzigingen en server monitoring bevatten
          via AWS Route 53 of Azure Traffic Manager.
        </AlertDescription>
      </Alert>
    </div>
  );
}
