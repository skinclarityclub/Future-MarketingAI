"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { clientMonitoring } from "@/lib/supabase/monitoring";
import type { DataQualityIndicator, QualityStatus } from "@/lib/supabase/types";
import {
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface DataQualityData {
  overall_score: number;
  indicators: DataQualityIndicator[];
  poor_quality_sources: string[];
}

export function DataQualityWidget() {
  const [qualityData, setQualityData] = useState<DataQualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadQualityData();

    // Set up periodic refresh for data quality
    const interval = setInterval(loadQualityData, 60000); // Refresh every minute

    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadQualityData = async () => {
    try {
      setLoading(true);
      const data = await clientMonitoring.getDataQuality();
      setQualityData(data);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load quality data"
      );
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return "text-green-600";
    if (score >= 0.7) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 0.9) return "default";
    if (score >= 0.7) return "secondary";
    return "destructive";
  };

  const getQualityIcon = (status: QualityStatus) => {
    switch (status) {
      case "good":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "poor":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading && !qualityData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Quality
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Quality
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!qualityData) {
    return null;
  }

  const overallPercentage = Math.round(qualityData.overall_score * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Quality
          </div>
          <Badge variant={getScoreBadgeVariant(qualityData.overall_score)}>
            {overallPercentage}% Quality
          </Badge>
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Last updated: {lastUpdate.toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Quality Score</span>
            <span
              className={`text-lg font-bold ${getScoreColor(qualityData.overall_score)}`}
            >
              {overallPercentage}%
            </span>
          </div>
          <Progress value={overallPercentage} className="h-3" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {qualityData.indicators.filter(i => i.status === "good").length}
            </div>
            <div className="text-sm text-muted-foreground">Good Sources</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {
                qualityData.indicators.filter(i => i.status === "warning")
                  .length
              }
            </div>
            <div className="text-sm text-muted-foreground">Warning</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {qualityData.poor_quality_sources.length}
            </div>
            <div className="text-sm text-muted-foreground">Poor Quality</div>
          </div>
        </div>

        {/* Recent Quality Indicators */}
        {qualityData.indicators.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Data Sources</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {qualityData.indicators.slice(0, 6).map(indicator => (
                <div
                  key={indicator.id}
                  className="flex items-center justify-between p-2 rounded-lg border"
                >
                  <div className="flex items-center gap-2">
                    {getQualityIcon(indicator.status as QualityStatus)}
                    <div>
                      <div className="text-sm font-medium">
                        {indicator.data_source}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {indicator.table_name} • {indicator.quality_metric}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-medium ${getScoreColor(indicator.score)}`}
                    >
                      {Math.round(indicator.score * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {indicator.valid_records}/{indicator.total_records} valid
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Poor Quality Sources Alert */}
        {qualityData.poor_quality_sources.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Attention:</strong>{" "}
              {qualityData.poor_quality_sources.length} data source(s) have
              quality issues: {qualityData.poor_quality_sources.join(", ")}
            </AlertDescription>
          </Alert>
        )}

        {/* No Data State */}
        {qualityData.indicators.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No quality indicators available</p>
            <p className="text-xs">
              Quality metrics will appear here as data is analyzed
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
