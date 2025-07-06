"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Clock,
  MousePointer,
  Eye,
  ArrowRight,
  Target,
  Users,
  Activity,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavigationAnalytics {
  totalClicks: number;
  totalSessions: number;
  averageSessionDuration: number;
  mostVisitedPages: Array<{
    path: string;
    title: string;
    visits: number;
    percentage: number;
  }>;
  navigationPatterns: Array<{
    from: string;
    to: string;
    count: number;
    confidence: number;
  }>;
  userBehavior: {
    bounceRate: number;
    avgTimeOnPage: number;
    pagesPerSession: number;
    returnVisitorRate: number;
  };
  suggestionAccuracy: {
    totalSuggestions: number;
    acceptedSuggestions: number;
    accuracy: number;
  };
}

interface NavigationAnalyticsWidgetProps {
  analytics: NavigationAnalytics;
  onRefresh: () => void;
  loading?: boolean;
  dateRange?: string;
}

export function NavigationAnalyticsWidget({
  analytics,
  onRefresh,
  loading = false,
  dateRange = "Vandaag",
}: NavigationAnalyticsWidgetProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${Math.round(remainingSeconds)}s`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 animate-pulse" />
            Analytics laden...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-2 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Navigatie Analytics
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{dateRange}</Badge>
            <NormalButton
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={cn("h-3 w-3", refreshing && "animate-spin")}
              />
            </NormalButton>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overzicht</TabsTrigger>
            <TabsTrigger value="patterns">Patronen</TabsTrigger>
            <TabsTrigger value="accuracy">Accuratesse</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <MousePointer className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <p className="text-2xl font-bold">
                  {formatNumber(analytics.totalClicks)}
                </p>
                <p className="text-xs text-muted-foreground">Totaal Clicks</p>
              </div>

              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Users className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <p className="text-2xl font-bold">
                  {formatNumber(analytics.totalSessions)}
                </p>
                <p className="text-xs text-muted-foreground">Sessies</p>
              </div>

              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                <p className="text-2xl font-bold">
                  {formatDuration(analytics.averageSessionDuration)}
                </p>
                <p className="text-xs text-muted-foreground">Gem. Sessie</p>
              </div>

              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                <p className="text-2xl font-bold">
                  {analytics.userBehavior.pagesPerSession.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Pagina's/Sessie</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Meest Bezochte Pagina's
              </h4>
              <div className="space-y-2">
                {analytics.mostVisitedPages.slice(0, 5).map((page, index) => (
                  <div
                    key={page.path}
                    className="flex items-center justify-between p-2 bg-muted/30 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="w-6 h-6 p-0 flex items-center justify-center text-xs"
                      >
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">{page.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {page.path}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-medium">{page.visits}</p>
                        <p className="text-xs text-muted-foreground">
                          {page.percentage.toFixed(1)}%
                        </p>
                      </div>
                      <Progress value={page.percentage} className="w-12 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4 mt-4">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Navigatie Patronen
              </h4>
              <div className="space-y-2">
                {analytics.navigationPatterns
                  .slice(0, 8)
                  .map((pattern, index) => (
                    <div
                      key={`${pattern.from}-${pattern.to}`}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {pattern.from}
                          </div>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <div className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                            {pattern.to}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{pattern.count}x</Badge>
                        <div className="flex items-center gap-1">
                          <Progress
                            value={pattern.confidence * 100}
                            className="w-8 h-1"
                          />
                          <span className="text-xs text-muted-foreground">
                            {Math.round(pattern.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Bounce Rate</span>
                </div>
                <p className="text-2xl font-bold">
                  {(analytics.userBehavior.bounceRate * 100).toFixed(1)}%
                </p>
                <Progress
                  value={analytics.userBehavior.bounceRate * 100}
                  className="mt-2"
                />
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Terugkerende Bezoekers</span>
                </div>
                <p className="text-2xl font-bold">
                  {(analytics.userBehavior.returnVisitorRate * 100).toFixed(1)}%
                </p>
                <Progress
                  value={analytics.userBehavior.returnVisitorRate * 100}
                  className="mt-2"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="accuracy" className="space-y-4 mt-4">
            <div className="text-center p-6 border rounded-lg">
              <Sparkles className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">
                {(analytics.suggestionAccuracy.accuracy * 100).toFixed(1)}%
              </h3>
              <p className="text-muted-foreground mb-4">
                Suggestie Accuratesse
              </p>
              <Progress
                value={analytics.suggestionAccuracy.accuracy * 100}
                className="mb-4"
              />
              <div className="flex justify-center gap-4 text-sm">
                <span>
                  <strong>
                    {analytics.suggestionAccuracy.acceptedSuggestions}
                  </strong>{" "}
                  geaccepteerd
                </span>
                <span>van</span>
                <span>
                  <strong>
                    {analytics.suggestionAccuracy.totalSuggestions}
                  </strong>{" "}
                  totaal
                </span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
