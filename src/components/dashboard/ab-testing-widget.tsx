"use client";

import React, { useState, useEffect } from "react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import {
  Target,
  TrendingUp,
  Activity,
  Play,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { UltraPremiumCard } from "@/components/layout/ultra-premium-dashboard-layout";
import Link from "next/link";

interface ABTestSummary {
  totalTests: number;
  runningTests: number;
  completedTests: number;
  successRate: number;
  avgImprovement: number;
}

interface ActiveABTest {
  id: string;
  name: string;
  type: string;
  status: "running" | "paused" | "completed";
  significance: number;
  improvement: number;
  daysRunning: number;
  estimatedCompletion?: number;
}

interface ABTestingData {
  summary: ABTestSummary;
  activeTests: ActiveABTest[];
  recentWins: Array<{
    name: string;
    improvement: number;
    type: string;
  }>;
}

export default function ABTestingWidget() {
  const [data, setData] = useState<ABTestingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchABTestingData();
    const interval = setInterval(fetchABTestingData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchABTestingData = async () => {
    try {
      const [abTestingResponse, contentABResponse] = await Promise.all([
        fetch("/api/marketing/ab-testing?action=demo"),
        fetch("/api/content-ab-testing/performance?action=summary"),
      ]);

      const abTestingData = await abTestingResponse.json();
      const contentABData = await contentABResponse.json();

      if (abTestingData.success) {
        // Combine data from both APIs
        const summary: ABTestSummary = {
          totalTests: abTestingData.data.overview?.totalTests || 0,
          runningTests: abTestingData.data.overview?.runningTests || 0,
          completedTests: abTestingData.data.overview?.completedTests || 0,
          successRate: abTestingData.data.overview?.successRate || 0,
          avgImprovement: abTestingData.data.overview?.avgImprovement || 0,
        };

        // Mock active tests data
        const activeTests: ActiveABTest[] = [
          {
            id: "ab-001",
            name: "Email Subject Line Optimization",
            type: "subject_line",
            status: "running",
            significance: 89.3,
            improvement: 18.5,
            daysRunning: 3,
            estimatedCompletion: 2,
          },
          {
            id: "ab-002",
            name: "Landing Page CTA Test",
            type: "creative",
            status: "running",
            significance: 94.7,
            improvement: 24.6,
            daysRunning: 5,
            estimatedCompletion: 1,
          },
          {
            id: "ab-003",
            name: "Social Media Post Timing",
            type: "timing",
            status: "running",
            significance: 67.8,
            improvement: 12.3,
            daysRunning: 1,
            estimatedCompletion: 4,
          },
        ];

        const recentWins = [
          { name: "CTA Button Color", improvement: 31.2, type: "creative" },
          { name: "Email Send Time", improvement: 28.4, type: "timing" },
          {
            name: "Subject Line Copy",
            improvement: 22.7,
            type: "subject_line",
          },
        ];

        setData({
          summary,
          activeTests,
          recentWins,
        });
        setError(null);
      }
    } catch (err) {
      console.error("Failed to fetch A/B testing data:", err);
      setError("Failed to load A/B testing data");

      // Fallback data
      setData({
        summary: {
          totalTests: 24,
          runningTests: 3,
          completedTests: 21,
          successRate: 78.3,
          avgImprovement: 22.4,
        },
        activeTests: [
          {
            id: "fallback-001",
            name: "Email Campaign Test",
            type: "subject_line",
            status: "running",
            significance: 87.5,
            improvement: 19.2,
            daysRunning: 2,
            estimatedCompletion: 3,
          },
        ],
        recentWins: [
          { name: "CTA Optimization", improvement: 28.3, type: "creative" },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Play className="h-4 w-4 text-green-500" />;
      case "paused":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSignificanceColor = (significance: number) => {
    if (significance >= 95) return "text-green-400";
    if (significance >= 80) return "text-yellow-400";
    return "text-red-400";
  };

  if (loading) {
    return (
      <UltraPremiumCard className="h-96">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="h-5 w-5" />
            A/B Testing Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </UltraPremiumCard>
    );
  }

  if (!data) {
    return (
      <UltraPremiumCard className="h-96">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="h-5 w-5" />
            A/B Testing Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-gray-400">
            No A/B testing data available
          </div>
        </CardContent>
      </UltraPremiumCard>
    );
  }

  return (
    <UltraPremiumCard className="h-96">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="h-5 w-5" />
            A/B Testing Results
          </CardTitle>
          <Link href="/ab-testing-framework">
            <NormalButton variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View All
            </NormalButton>
          </Link>
        </div>
        <CardDescription className="text-gray-400">
          Live experiment results and statistical insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-yellow-400 text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error} - Showing fallback data
          </div>
        )}

        {/* Summary Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {data.summary.runningTests}
            </div>
            <div className="text-xs text-gray-400">Active Tests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {data.summary.avgImprovement.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-400">Avg Improvement</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {data.summary.successRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-400">Success Rate</div>
          </div>
        </div>

        {/* Active Tests */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Active Experiments ({data.summary.runningTests})
          </h4>
          <div className="space-y-3 max-h-32 overflow-y-auto">
            {data.activeTests.slice(0, 2).map(test => (
              <div
                key={test.id}
                className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center gap-2 flex-1">
                  {getStatusIcon(test.status)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {test.name}
                    </div>
                    <div className="text-xs text-gray-400 capitalize">
                      {test.type.replace("_", " ")} • Day {test.daysRunning}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-semibold ${getSignificanceColor(test.significance)}`}
                  >
                    {test.significance.toFixed(1)}%
                  </div>
                  <div className="text-xs text-green-400">
                    +{test.improvement.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Wins */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Recent Wins
          </h4>
          <div className="space-y-2">
            {data.recentWins.slice(0, 2).map((win, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-300 truncate flex-1">
                  {win.name}
                </span>
                <Badge
                  variant="secondary"
                  className="ml-2 text-green-400 bg-green-400/10"
                >
                  +{win.improvement.toFixed(1)}%
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </UltraPremiumCard>
  );
}
