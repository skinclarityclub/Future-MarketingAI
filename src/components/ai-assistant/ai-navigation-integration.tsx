"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  Navigation,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Search,
  Zap,
  Target,
  DollarSign,
  Users,
  BarChart3,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardMode } from "@/lib/contexts/dashboard-mode-context";

interface AINavigationSuggestion {
  id: string;
  title: string;
  description: string;
  url: string;
  confidence: number;
  icon: React.ComponentType<any>;
  category: string;
  estimatedTime?: string;
}

interface AINavigationIntegrationProps {
  className?: string;
  compact?: boolean;
}

export function AINavigationIntegration({
  className,
  compact = false,
}: AINavigationIntegrationProps) {
  const { currentMode, modeConfig } = useDashboardMode();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AINavigationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus] = useState({
    navigationAI: true,
    nlpProcessor: true,
    behaviorAnalytics: true,
    realTimeUpdates: true,
  });

  // Generate context-aware suggestions based on current mode
  const generateContextAwareSuggestions = useCallback(() => {
    const baseSuggestions: Record<string, AINavigationSuggestion[]> = {
      finance: [
        {
          id: "revenue_deep_dive",
          title: "Revenue Deep Dive",
          description: "AI-powered revenue analysis with trend predictions",
          url: "/revenue-analytics",
          confidence: 0.95,
          icon: DollarSign,
          category: "Financial Analysis",
          estimatedTime: "3-5 min",
        },
        {
          id: "budget_optimization",
          title: "Budget Optimization",
          description:
            "Smart budget recommendations based on spending patterns",
          url: "/budget",
          confidence: 0.92,
          icon: BarChart3,
          category: "Budget Management",
          estimatedTime: "2-4 min",
        },
        {
          id: "cash_flow_forecast",
          title: "Cash Flow Forecasting",
          description: "ML-powered cash flow predictions and alerts",
          url: "/cash-flow",
          confidence: 0.88,
          icon: TrendingUp,
          category: "Financial Planning",
          estimatedTime: "4-6 min",
        },
      ],
      marketing: [
        {
          id: "campaign_intelligence",
          title: "Campaign Intelligence",
          description: "AI-driven campaign performance optimization",
          url: "/campaigns",
          confidence: 0.94,
          icon: Target,
          category: "Campaign Management",
          estimatedTime: "3-5 min",
        },
        {
          id: "audience_insights",
          title: "Audience Insights",
          description: "Advanced customer segmentation and behavioral analysis",
          url: "/customer-insights",
          confidence: 0.91,
          icon: Users,
          category: "Audience Analysis",
          estimatedTime: "5-8 min",
        },
        {
          id: "content_optimization",
          title: "Content Performance",
          description: "AI-powered content ROI analysis and recommendations",
          url: "/content",
          confidence: 0.86,
          icon: MessageSquare,
          category: "Content Strategy",
          estimatedTime: "2-4 min",
        },
      ],
      executive: [
        {
          id: "strategic_overview",
          title: "Strategic Dashboard",
          description: "Executive-level KPIs with AI-powered insights",
          url: "/",
          confidence: 0.96,
          icon: BarChart3,
          category: "Strategic Overview",
          estimatedTime: "2-3 min",
        },
        {
          id: "performance_insights",
          title: "Performance Intelligence",
          description: "AI-driven business performance analytics",
          url: "/analytics",
          confidence: 0.89,
          icon: TrendingUp,
          category: "Business Intelligence",
          estimatedTime: "5-10 min",
        },
        {
          id: "reports_center",
          title: "Intelligent Reports",
          description: "Automated report generation with AI insights",
          url: "/reports-center",
          confidence: 0.85,
          icon: MessageSquare,
          category: "Reporting",
          estimatedTime: "3-6 min",
        },
      ],
    };

    return baseSuggestions[currentMode] || baseSuggestions.executive;
  }, [currentMode]);

  // Simulate AI processing with mode-aware suggestions
  const processAIQuery = useCallback(
    async (searchQuery: string) => {
      setIsLoading(true);

      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const allSuggestions = generateContextAwareSuggestions();

      if (searchQuery.trim()) {
        // Filter suggestions based on query
        const filtered = allSuggestions.filter(
          suggestion =>
            suggestion.title
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            suggestion.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            suggestion.category
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
        setSuggestions(filtered.length > 0 ? filtered : allSuggestions);
      } else {
        setSuggestions(allSuggestions);
      }

      setIsLoading(false);
    },
    [generateContextAwareSuggestions]
  );

  // Load suggestions when mode changes
  useEffect(() => {
    processAIQuery(query);
  }, [currentMode, processAIQuery, query]);

  // Handle search
  const handleSearch = () => {
    processAIQuery(query);
  };

  // Get mode-specific styling
  const getModeStyles = () => {
    switch (currentMode) {
      case "finance":
        return {
          accent: "text-blue-500",
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
          gradient: "from-blue-500/5 to-blue-600/5",
        };
      case "marketing":
        return {
          accent: "text-purple-500",
          bg: "bg-purple-500/10",
          border: "border-purple-500/20",
          gradient: "from-purple-500/5 to-purple-600/5",
        };
      default:
        return {
          accent: "text-emerald-500",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          gradient: "from-emerald-500/5 to-emerald-600/5",
        };
    }
  };

  const modeStyles = getModeStyles();

  if (compact) {
    return (
      <Card className={cn("border-slate-800/50", className)}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Brain className={cn("h-4 w-4", modeStyles.accent)} />
              <span className="text-sm font-medium">AI Navigation</span>
              <Badge
                variant="outline"
                className={cn("text-xs", modeStyles.accent)}
              >
                {modeConfig.label}
              </Badge>
            </div>
            <div className="space-y-2">
              {suggestions.slice(0, 3).map(suggestion => {
                const IconComponent = suggestion.icon;
                return (
                  <NormalButton
                    key={suggestion.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-2 hover:bg-white/5"
                    asChild
                  >
                    <a href={suggestion.url}>
                      <IconComponent className="h-3 w-3 mr-2 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate">
                          {suggestion.title}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {suggestion.category}
                        </div>
                      </div>
                    </a>
                  </NormalButton>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "border-slate-800/50 bg-gradient-to-br from-slate-950/50 to-slate-900/50",
        className
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", modeStyles.bg)}>
              <Brain className={cn("h-5 w-5", modeStyles.accent)} />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                AI Navigation Assistant
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Context-aware navigation for {modeConfig.label}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                modeStyles.bg,
                modeStyles.border,
                modeStyles.accent
              )}
            >
              {modeConfig.label}
            </Badge>
            <div className="flex items-center gap-1">
              {Object.entries(aiStatus).every(([, status]) => status) && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search Interface */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={`Search ${currentMode} insights and pages...`}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                className="pl-10 bg-slate-800/50 border-slate-700 focus:border-slate-600"
              />
            </div>
            <NormalButton
              onClick={handleSearch}
              disabled={isLoading}
              className={cn("px-4", modeStyles.bg)}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>AI Processing</span>
                </div>
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </NormalButton>
          </div>
        </div>

        <Separator className="bg-slate-700" />

        {/* AI-Powered Suggestions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-slate-200 flex items-center gap-2">
              <Zap className={cn("h-4 w-4", modeStyles.accent)} />
              Smart Suggestions
            </h3>
            <Badge variant="secondary" className="text-xs">
              {suggestions.length} available
            </Badge>
          </div>

          <div className="grid gap-3">
            {suggestions.map(suggestion => {
              const IconComponent = suggestion.icon;
              return (
                <Card
                  key={suggestion.id}
                  className="border-slate-700/50 hover:border-slate-600/50 transition-all duration-200 cursor-pointer hover:bg-white/5"
                >
                  <CardContent className="p-4">
                    <a href={suggestion.url} className="block">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg flex-shrink-0",
                            modeStyles.bg
                          )}
                        >
                          <IconComponent
                            className={cn("h-4 w-4", modeStyles.accent)}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-slate-200 truncate">
                              {suggestion.title}
                            </h4>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant="secondary" className="text-xs">
                                {Math.round(suggestion.confidence * 100)}%
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-slate-400 mb-2">
                            {suggestion.description}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <Badge
                              variant="outline"
                              className="text-slate-500 border-slate-600"
                            >
                              {suggestion.category}
                            </Badge>
                            {suggestion.estimatedTime && (
                              <span className="text-slate-500 flex items-center gap-1">
                                <Navigation className="h-3 w-3" />
                                {suggestion.estimatedTime}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </a>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* AI Status Indicators */}
        <div className={cn("p-4 rounded-lg space-y-3", modeStyles.bg)}>
          <h4 className="font-medium text-slate-200 flex items-center gap-2">
            <Brain className={cn("h-4 w-4", modeStyles.accent)} />
            AI System Status
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {Object.entries(aiStatus).map(([key, status]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-slate-300 capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <div className="flex items-center gap-1">
                  <CheckCircle2
                    className={cn(
                      "h-3 w-3",
                      status ? "text-green-500" : "text-red-500"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs",
                      status ? "text-green-400" : "text-red-400"
                    )}
                  >
                    {status ? "Active" : "Offline"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
