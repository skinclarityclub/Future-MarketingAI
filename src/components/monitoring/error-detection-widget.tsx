"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  Shield,
  Activity,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface ErrorDetectionRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  lastTriggered?: string;
}

interface AnomalyDetectionResult {
  isAnomaly: boolean;
  severity: "low" | "medium" | "high" | "critical";
  metric: string;
  currentValue: number;
  confidence: number;
  timestamp: string;
}

export function ErrorDetectionWidget() {
  const [rules, setRules] = useState<ErrorDetectionRule[]>([]);
  const [recentAnomalies, setRecentAnomalies] = useState<
    AnomalyDetectionResult[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState<
    AnomalyDetectionResult[] | null
  >(null);

  useEffect(() => {
    fetchErrorDetectionData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchErrorDetectionData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchErrorDetectionData = async () => {
    try {
      const response = await fetch("/api/monitoring/error-detection");
      if (response.ok) {
        const data = await response.json();
        setRules(data.rules || []);
      }
    } catch (error) {
      console.error("Failed to fetch error detection data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const testErrorDetection = async () => {
    // Simulate high error rate
    const testMetrics = {
      error_rate: 12, // Above critical threshold of 10%
      cpu_usage: 85, // Above warning threshold of 80%
      data_quality_score: 65, // Below critical threshold of 70
    };

    try {
      const response = await fetch("/api/monitoring/error-detection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "detect",
          metrics: testMetrics,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTestResults(data.anomalies);
        setRecentAnomalies(data.anomalies);
      }
    } catch (error) {
      console.error("Test error detection failed:", error);
    }
  };

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const response = await fetch("/api/monitoring/error-detection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: enabled ? "enableRule" : "disableRule",
          ruleId,
        }),
      });

      if (response.ok) {
        await fetchErrorDetectionData();
      }
    } catch (error) {
      console.error("Failed to toggle rule:", error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Error Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Error Detection & Recovery
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">System Test</h3>
            <NormalButton
              onClick={testErrorDetection}
              size="sm"
              variant="outline"
            >
              Test Detection
            </NormalButton>
          </div>

          {testResults && testResults.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Detected {testResults.length} anomalies from test metrics
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Rules Status */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Detection Rules</h3>
          <div className="space-y-2">
            {rules.map(rule => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {rule.enabled ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="font-medium text-sm">{rule.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {rule.description}
                  </p>
                  {rule.lastTriggered && (
                    <p className="text-xs text-orange-600 mt-1">
                      Last triggered:{" "}
                      {new Date(rule.lastTriggered).toLocaleString()}
                    </p>
                  )}
                </div>
                <NormalButton
                  size="sm"
                  variant={rule.enabled ? "destructive" : "default"}
                  onClick={() => toggleRule(rule.id, !rule.enabled)}
                >
                  {rule.enabled ? "Disable" : "Enable"}
                </NormalButton>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Anomalies */}
        {recentAnomalies.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Recent Anomalies</h3>
            <div className="space-y-2">
              {recentAnomalies.slice(0, 3).map((anomaly, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(anomaly.severity)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {anomaly.metric}
                        </span>
                        <Badge variant={getSeverityColor(anomaly.severity)}>
                          {anomaly.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Value: {anomaly.currentValue} | Confidence:{" "}
                        {Math.round(anomaly.confidence * 100)}%
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(anomaly.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {rules.filter(r => r.enabled).length}
            </div>
            <div className="text-xs text-muted-foreground">Active Rules</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {recentAnomalies.length}
            </div>
            <div className="text-xs text-muted-foreground">
              Recent Anomalies
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {rules.filter(r => r.lastTriggered).length}
            </div>
            <div className="text-xs text-muted-foreground">Triggered Rules</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
