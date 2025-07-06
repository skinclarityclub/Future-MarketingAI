"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Activity,
  TrendingUp,
  Zap,
  Settings,
  BarChart,
  Shield,
  Server,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface ScalabilityMetrics {
  cpu_usage: number;
  memory_usage: number;
  active_connections: number;
  response_time_avg: number;
  throughput: number;
  worker_count: number;
  load_balancer_efficiency: number;
}

interface LoadTestResults {
  peak_cpu_usage: number;
  peak_memory_usage: number;
  max_connections: number;
  average_response_time: number;
  error_rate: number;
  throughput_degradation: number;
  scaling_events: number;
}

export default function ScalabilityPage() {
  const [metrics, setMetrics] = useState<ScalabilityMetrics>({
    cpu_usage: 45,
    memory_usage: 62,
    active_connections: 128,
    response_time_avg: 245,
    throughput: 875,
    worker_count: 4,
    load_balancer_efficiency: 94,
  });

  const [autoScalingEnabled, setAutoScalingEnabled] = useState(true);
  const [loadBalancingEnabled, setLoadBalancingEnabled] = useState(true);
  const [cpuThreshold, setCpuThreshold] = useState([75]);
  const [memoryThreshold, setMemoryThreshold] = useState([80]);
  const [isLoadTesting, setIsLoadTesting] = useState(false);
  const [loadTestLevel, setLoadTestLevel] = useState("medium");
  const [loadTestResults, setLoadTestResults] =
    useState<LoadTestResults | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpu_usage: Math.max(
          20,
          Math.min(95, prev.cpu_usage + (Math.random() - 0.5) * 10)
        ),
        memory_usage: Math.max(
          30,
          Math.min(90, prev.memory_usage + (Math.random() - 0.5) * 8)
        ),
        active_connections: Math.max(
          50,
          Math.min(
            200,
            prev.active_connections + Math.floor((Math.random() - 0.5) * 20)
          )
        ),
        response_time_avg: Math.max(
          100,
          Math.min(1000, prev.response_time_avg + (Math.random() - 0.5) * 50)
        ),
        throughput: Math.max(
          500,
          Math.min(1500, prev.throughput + (Math.random() - 0.5) * 100)
        ),
        load_balancer_efficiency: Math.max(
          85,
          Math.min(
            99,
            prev.load_balancer_efficiency + (Math.random() - 0.5) * 2
          )
        ),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleScaleUp = async () => {
    try {
      const response = await fetch("/api/tactical-analysis/scalability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "scale_up" }),
      });

      if (response.ok) {
        setMetrics(prev => ({ ...prev, worker_count: prev.worker_count + 1 }));
      }
    } catch (error) {
      console.error("Scale up failed:", error);
    }
  };

  const handleScaleDown = async () => {
    try {
      const response = await fetch("/api/tactical-analysis/scalability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "scale_down" }),
      });

      if (response.ok && metrics.worker_count > 1) {
        setMetrics(prev => ({
          ...prev,
          worker_count: Math.max(1, prev.worker_count - 1),
        }));
      }
    } catch (error) {
      console.error("Scale down failed:", error);
    }
  };

  const handleLoadTest = async () => {
    setIsLoadTesting(true);
    try {
      const response = await fetch("/api/tactical-analysis/scalability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "load_test",
          parameters: { load_level: loadTestLevel },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLoadTestResults(data.data.load_test_results);
      }
    } catch (error) {
      console.error("Load test failed:", error);
    } finally {
      setIsLoadTesting(false);
    }
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const response = await fetch("/api/tactical-analysis/scalability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "optimize" }),
      });

      if (response.ok) {
        // Simulate optimization improvements
        setMetrics(prev => ({
          ...prev,
          cpu_usage: Math.max(20, prev.cpu_usage - 10),
          memory_usage: Math.max(30, prev.memory_usage - 8),
          response_time_avg: Math.max(100, prev.response_time_avg - 50),
          load_balancer_efficiency: Math.min(
            99,
            prev.load_balancer_efficiency + 2
          ),
        }));
      }
    } catch (error) {
      console.error("Optimization failed:", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const getMetricStatus = (
    value: number,
    threshold: number,
    isInverse = false
  ) => {
    const isHigh = isInverse ? value < threshold * 0.7 : value > threshold;
    const isMedium = isInverse
      ? value < threshold * 0.85
      : value > threshold * 0.7;

    if (isHigh) return "high";
    if (isMedium) return "medium";
    return "low";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/tactical-analysis">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug naar Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Schaalbaarheid & Prestaties
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time auto-scaling, load balancing en resource optimalisatie
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Real-time Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                CPU Gebruik
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.cpu_usage.toFixed(1)}%
              </div>
              <Badge
                variant={getStatusColor(
                  getMetricStatus(metrics.cpu_usage, cpuThreshold[0])
                )}
              >
                {getMetricStatus(metrics.cpu_usage, cpuThreshold[0]) === "high"
                  ? "Hoog"
                  : getMetricStatus(metrics.cpu_usage, cpuThreshold[0]) ===
                      "medium"
                    ? "Gemiddeld"
                    : "Normaal"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Geheugen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.memory_usage.toFixed(1)}%
              </div>
              <Badge
                variant={getStatusColor(
                  getMetricStatus(metrics.memory_usage, memoryThreshold[0])
                )}
              >
                {getMetricStatus(metrics.memory_usage, memoryThreshold[0]) ===
                "high"
                  ? "Hoog"
                  : getMetricStatus(
                        metrics.memory_usage,
                        memoryThreshold[0]
                      ) === "medium"
                    ? "Gemiddeld"
                    : "Normaal"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Server className="h-4 w-4" />
                Workers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.worker_count}</div>
              <p className="text-sm text-gray-600">
                {metrics.active_connections} verbindingen
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Response Tijd
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.response_time_avg.toFixed(0)}ms
              </div>
              <Badge
                variant={getStatusColor(
                  getMetricStatus(metrics.response_time_avg, 500)
                )}
              >
                {metrics.response_time_avg > 500
                  ? "Langzaam"
                  : metrics.response_time_avg > 300
                    ? "Gemiddeld"
                    : "Snel"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Auto-scaling Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Auto-scaling Configuratie
            </CardTitle>
            <CardDescription>
              Stel drempelwaarden en gedrag in voor automatisch schalen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Auto-scaling ingeschakeld
                  </label>
                  <Switch
                    checked={autoScalingEnabled}
                    onCheckedChange={setAutoScalingEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Load balancing</label>
                  <Switch
                    checked={loadBalancingEnabled}
                    onCheckedChange={setLoadBalancingEnabled}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    CPU drempel: {cpuThreshold[0]}%
                  </label>
                  <Slider
                    value={cpuThreshold}
                    onValueChange={setCpuThreshold}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Geheugen drempel: {memoryThreshold[0]}%
                  </label>
                  <Slider
                    value={memoryThreshold}
                    onValueChange={setMemoryThreshold}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleScaleUp} variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Handmatig opschalen
              </Button>
              <Button onClick={handleScaleDown} variant="outline">
                <TrendingUp className="h-4 w-4 mr-2 rotate-180" />
                Handmatig afschalen
              </Button>
              <Button
                onClick={handleOptimize}
                variant="outline"
                disabled={isOptimizing}
              >
                <Zap className="h-4 w-4 mr-2" />
                {isOptimizing ? "Optimaliseren..." : "Optimaliseer resources"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Load Testing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Load Testing
              </CardTitle>
              <CardDescription>
                Test systeemprestaties onder verschillende belastingen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Belasting niveau
                </label>
                <Select value={loadTestLevel} onValueChange={setLoadTestLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Laag (30% CPU)</SelectItem>
                    <SelectItem value="medium">Gemiddeld (60% CPU)</SelectItem>
                    <SelectItem value="high">Hoog (85% CPU)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleLoadTest}
                className="w-full"
                disabled={isLoadTesting}
              >
                {isLoadTesting ? "Load test bezig..." : "Start Load Test"}
              </Button>
            </CardContent>
          </Card>

          {/* Load Test Results */}
          {loadTestResults && (
            <Card>
              <CardHeader>
                <CardTitle>Load Test Resultaten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Piek CPU:</span>
                    <span className="font-medium ml-2">
                      {loadTestResults.peak_cpu_usage.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Piek geheugen:</span>
                    <span className="font-medium ml-2">
                      {loadTestResults.peak_memory_usage.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Gem. response:</span>
                    <span className="font-medium ml-2">
                      {loadTestResults.average_response_time.toFixed(0)}ms
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Error rate:</span>
                    <span className="font-medium ml-2">
                      {loadTestResults.error_rate.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {loadTestResults.scaling_events > 0 && (
                  <Badge variant="secondary">
                    {loadTestResults.scaling_events} auto-scaling events
                  </Badge>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Performance Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Indicatoren</CardTitle>
            <CardDescription>
              Real-time overzicht van systeemprestaties en efficiëntie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {metrics.throughput.toFixed(0)}
                </div>
                <p className="text-sm text-gray-600">Requests/min</p>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {metrics.load_balancer_efficiency.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">
                  Load balancer efficiëntie
                </p>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">99.9%</div>
                <p className="text-sm text-gray-600">Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
