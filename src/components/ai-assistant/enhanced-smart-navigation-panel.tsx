"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain,
  Navigation,
  ArrowRight,
  Clock,
  Target,
  TrendingUp,
  Search,
  Mic,
  MicOff,
  Loader2,
  AlertTriangle,
  MessageSquare,
  BarChart3,
  DollarSign,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardMode } from "@/lib/contexts/dashboard-mode-context";
import {
  AIComponentsIntegration,
  type AIIntegrationContext,
} from "@/lib/navigation/ai-components-integration";
import type { NavigationContext } from "@/lib/assistant/navigation-assistant-bridge";

interface AIResponse {
  type: "navigation" | "assistant" | "recommendation" | "security";
  success: boolean;
  data?: any;
  suggestions?: string[];
  metadata?: {
    confidence: number;
    responseTime: number;
    source: string;
  };
}

interface NavigationSuggestion {
  id: string;
  title: string;
  description: string;
  url: string;
  confidence: number;
  icon: React.ComponentType<any>;
  category: "finance" | "marketing" | "executive" | "general";
  priority: number;
  metadata?: {
    estimatedTime?: string;
    complexity?: "low" | "medium" | "high";
    lastUsed?: Date;
  };
}

interface EnhancedSmartNavigationPanelProps {
  className?: string;
  maxSuggestions?: number;
  enableVoice?: boolean;
  showMetrics?: boolean;
  compact?: boolean;
}

export function EnhancedSmartNavigationPanel({
  className,
  maxSuggestions = 8,
  enableVoice = true,
  showMetrics = true,
  compact = false,
}: EnhancedSmartNavigationPanelProps) {
  const { currentMode, modeConfig } = useDashboardMode();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NavigationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiIntegration, setAIIntegration] =
    useState<AIComponentsIntegration | null>(null);
  const [activeTab, setActiveTab] = useState<
    "suggestions" | "voice" | "analytics"
  >("suggestions");

  // Initialize AI Components Integration
  useEffect(() => {
    const initializeAI = async () => {
      try {
        const integration = new AIComponentsIntegration({
          navigation: {
            enableSmartSuggestions: true,
            enableContextualHelp: true,
            enablePredictiveNavigation: true,
          },
          assistant: {
            enableVoiceCommands: enableVoice,
            enableNaturalLanguage: true,
            enableConversationalFlow: true,
          },
        });

        setAIIntegration(integration);

        // Load initial context-aware suggestions
        await loadContextualSuggestions();
      } catch (err) {
        console.error("Failed to initialize AI navigation:", err);
        setError("Failed to initialize AI navigation system");
      }
    };

    initializeAI();
  }, [currentMode, enableVoice]);

  // Load contextual suggestions based on current mode
  const loadContextualSuggestions = useCallback(async () => {
    if (!aiIntegration) return;

    setIsLoading(true);
    setError(null);

    try {
      const context: AIIntegrationContext = {
        userId: "user_demo",
        sessionId: `session_${Date.now()}`,
        currentPage: window.location.pathname,
        userPreferences: {},
        conversationHistory: [],
        navigationHistory: [],
        securityContext: {
          permissions: ["read", "navigate"],
          threatLevel: "low",
        },
      };

      const response = await aiIntegration.processAIRequest(context, {
        type: "text",
        input: query || `Show me ${currentMode} navigation options`,
      });

      if (response.success && response.data) {
        const modeSuggestions = generateModeSuggestions(response);
        setSuggestions(modeSuggestions.slice(0, maxSuggestions));
      } else {
        // Fallback to static suggestions if AI fails
        setSuggestions(getStaticSuggestions());
      }
    } catch (err) {
      console.error("Error loading suggestions:", err);
      setError("Failed to load navigation suggestions");
      setSuggestions(getStaticSuggestions());
    } finally {
      setIsLoading(false);
    }
  }, [aiIntegration, currentMode, query, maxSuggestions]);

  // Generate mode-specific suggestions from AI response
  const generateModeSuggestions = (
    response: AIResponse
  ): NavigationSuggestion[] => {
    const baseSuggestions = getStaticSuggestions();

    // If we have AI suggestions, enhance them
    if (response.suggestions && response.suggestions.length > 0) {
      return response.suggestions.map((suggestion: string, index: number) => ({
        id: `ai_${index}`,
        title: suggestion,
        description: `AI-powered suggestion for ${currentMode} mode`,
        url: generateUrlFromSuggestion(suggestion),
        confidence: response.metadata?.confidence || 0.8,
        icon: getIconForSuggestion(suggestion),
        category: currentMode,
        priority: index + 1,
        metadata: {
          estimatedTime: "2-5 min",
          complexity: "medium",
          lastUsed: new Date(),
        },
      }));
    }

    return baseSuggestions;
  };

  // Get static fallback suggestions based on mode
  const getStaticSuggestions = (): NavigationSuggestion[] => {
    switch (currentMode) {
      case "finance":
        return [
          {
            id: "revenue_analytics",
            title: "Revenue Analytics",
            description: "Detailed revenue performance and trends",
            url: "/revenue-analytics",
            confidence: 0.95,
            icon: DollarSign,
            category: "finance",
            priority: 1,
            metadata: { estimatedTime: "3-5 min", complexity: "medium" },
          },
          {
            id: "budget_tracker",
            title: "Budget Performance",
            description: "Monitor budget variance and forecasts",
            url: "/budget",
            confidence: 0.92,
            icon: BarChart3,
            category: "finance",
            priority: 2,
            metadata: { estimatedTime: "2-4 min", complexity: "low" },
          },
          {
            id: "cash_flow",
            title: "Cash Flow Analysis",
            description: "Real-time cash flow monitoring",
            url: "/cash-flow",
            confidence: 0.88,
            icon: TrendingUp,
            category: "finance",
            priority: 3,
            metadata: { estimatedTime: "4-6 min", complexity: "high" },
          },
        ];

      case "marketing":
        return [
          {
            id: "campaign_performance",
            title: "Campaign Performance",
            description: "Track marketing campaign effectiveness",
            url: "/campaigns",
            confidence: 0.94,
            icon: Target,
            category: "marketing",
            priority: 1,
            metadata: { estimatedTime: "3-5 min", complexity: "medium" },
          },
          {
            id: "customer_insights",
            title: "Customer Insights",
            description: "Analyze customer behavior and preferences",
            url: "/customer-insights",
            confidence: 0.91,
            icon: Users,
            category: "marketing",
            priority: 2,
            metadata: { estimatedTime: "5-8 min", complexity: "high" },
          },
          {
            id: "content_performance",
            title: "Content Performance",
            description: "Measure content engagement and ROI",
            url: "/content",
            confidence: 0.86,
            icon: MessageSquare,
            category: "marketing",
            priority: 3,
            metadata: { estimatedTime: "2-4 min", complexity: "low" },
          },
        ];

      default: // executive
        return [
          {
            id: "executive_overview",
            title: "Executive Dashboard",
            description: "High-level KPIs and strategic insights",
            url: "/",
            confidence: 0.96,
            icon: BarChart3,
            category: "executive",
            priority: 1,
            metadata: { estimatedTime: "2-3 min", complexity: "low" },
          },
          {
            id: "reports_center",
            title: "Reports Center",
            description: "Access all business reports",
            url: "/reports-center",
            confidence: 0.89,
            icon: MessageSquare,
            category: "executive",
            priority: 2,
            metadata: { estimatedTime: "3-6 min", complexity: "medium" },
          },
          {
            id: "analytics",
            title: "Analytics Hub",
            description: "Deep-dive analytics and insights",
            url: "/analytics",
            confidence: 0.85,
            icon: TrendingUp,
            category: "executive",
            priority: 3,
            metadata: { estimatedTime: "5-10 min", complexity: "high" },
          },
        ];
    }
  };

  // Helper functions
  const generateUrlFromSuggestion = (suggestion: string): string => {
    const lowerSuggestion = suggestion.toLowerCase();
    if (lowerSuggestion.includes("revenue")) return "/revenue-analytics";
    if (lowerSuggestion.includes("budget")) return "/budget";
    if (lowerSuggestion.includes("campaign")) return "/campaigns";
    if (lowerSuggestion.includes("customer")) return "/customer-insights";
    if (lowerSuggestion.includes("content")) return "/content";
    return "/analytics";
  };

  const getIconForSuggestion = (suggestion: string) => {
    const lowerSuggestion = suggestion.toLowerCase();
    if (
      lowerSuggestion.includes("revenue") ||
      lowerSuggestion.includes("finance")
    )
      return DollarSign;
    if (
      lowerSuggestion.includes("campaign") ||
      lowerSuggestion.includes("marketing")
    )
      return Target;
    if (lowerSuggestion.includes("customer")) return Users;
    if (lowerSuggestion.includes("analytics")) return BarChart3;
    return Navigation;
  };

  // Handle search
  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      await loadContextualSuggestions();
      return;
    }

    await loadContextualSuggestions();
  }, [query, loadContextualSuggestions]);

  // Handle voice input
  const toggleVoiceInput = useCallback(() => {
    if (!enableVoice || !aiIntegration) return;

    setIsListening(!isListening);
    // Voice recognition implementation would go here
    // For now, we'll simulate it
    if (!isListening) {
      setTimeout(() => {
        setQuery("Show me marketing performance data");
        setIsListening(false);
      }, 2000);
    }
  }, [isListening, enableVoice, aiIntegration]);

  // Mode-specific styling
  const modeStyles = useMemo(() => {
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
  }, [currentMode]);

  // Load suggestions on mode change
  useEffect(() => {
    loadContextualSuggestions();
  }, [loadContextualSuggestions]);

  if (compact) {
    return (
      <Card className={cn("border-slate-800/50", className)}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Brain className={cn("h-4 w-4", modeStyles.accent)} />
              <span className="text-sm font-medium">AI Navigation</span>
            </div>
            <div className="space-y-2">
              {suggestions.slice(0, 3).map(suggestion => {
                const IconComponent = suggestion.icon;
                return (
                  <NormalButton
                    key={suggestion.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-2"
                    asChild
                  >
                    <a href={suggestion.url}>
                      <IconComponent className="h-3 w-3 mr-2 flex-shrink-0" />
                      <span className="text-xs truncate">
                        {suggestion.title}
                      </span>
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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className={cn("h-5 w-5", modeStyles.accent)} />
            <CardTitle className="text-lg font-semibold">
              AI Navigation Assistant
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className={cn(modeStyles.bg, modeStyles.border, modeStyles.accent)}
          >
            {modeConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Interface */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={`Ask for ${currentMode} insights...`}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                className="pl-10 bg-slate-800/50 border-slate-700"
              />
            </div>
            <NormalButton
              onClick={handleSearch}
              disabled={isLoading}
              className={modeStyles.bg}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </NormalButton>
            {enableVoice && (
              <NormalButton
                variant="outline"
                size="icon"
                onClick={toggleVoiceInput}
                className={cn(isListening && "bg-red-500/20 border-red-500/50")}
              >
                {isListening ? (
                  <Mic className="h-4 w-4 text-red-500" />
                ) : (
                  <MicOff className="h-4 w-4" />
                )}
              </NormalButton>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 p-2 rounded">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value: string) =>
            setActiveTab(value as typeof activeTab)
          }
        >
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="voice">Voice</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="mt-4 space-y-3">
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {suggestions.map(suggestion => {
                  const IconComponent = suggestion.icon;
                  return (
                    <Card
                      key={suggestion.id}
                      className="border-slate-700/50 hover:border-slate-600/50 transition-colors cursor-pointer"
                    >
                      <CardContent className="p-4">
                        <a href={suggestion.url} className="block">
                          <div className="flex items-start gap-3">
                            <div
                              className={cn("p-2 rounded-lg", modeStyles.bg)}
                            >
                              <IconComponent
                                className={cn("h-4 w-4", modeStyles.accent)}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-slate-200 truncate">
                                  {suggestion.title}
                                </h4>
                                <Badge variant="secondary" className="text-xs">
                                  {Math.round(suggestion.confidence * 100)}%
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-400 mt-1">
                                {suggestion.description}
                              </p>
                              {showMetrics && suggestion.metadata && (
                                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                  {suggestion.metadata.estimatedTime && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {suggestion.metadata.estimatedTime}
                                    </div>
                                  )}
                                  {suggestion.metadata.complexity && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {suggestion.metadata.complexity}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </a>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="voice" className="mt-4">
            <div className="text-center py-8 space-y-4">
              <div
                className={cn("inline-flex p-4 rounded-full", modeStyles.bg)}
              >
                {isListening ? (
                  <Mic className={cn("h-8 w-8", modeStyles.accent)} />
                ) : (
                  <MicOff className="h-8 w-8 text-slate-400" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-slate-200">
                  {isListening ? "Listening..." : "Voice Navigation"}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {isListening
                    ? "Speak your navigation request"
                    : "Click the mic button to start voice navigation"}
                </p>
              </div>
              <NormalButton
                onClick={toggleVoiceInput}
                disabled={!enableVoice}
                className={cn(
                  isListening ? "bg-red-500 hover:bg-red-600" : modeStyles.bg
                )}
              >
                {isListening ? "Stop Listening" : "Start Voice Navigation"}
              </NormalButton>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className={cn("p-4 rounded-lg", modeStyles.bg)}>
                  <div className="flex items-center gap-2">
                    <TrendingUp className={cn("h-4 w-4", modeStyles.accent)} />
                    <span className="text-sm font-medium">Success Rate</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">94%</div>
                  <div className="text-xs text-slate-400">
                    AI Prediction Accuracy
                  </div>
                </div>
                <div className={cn("p-4 rounded-lg", modeStyles.bg)}>
                  <div className="flex items-center gap-2">
                    <Navigation className={cn("h-4 w-4", modeStyles.accent)} />
                    <span className="text-sm font-medium">Suggestions</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {suggestions.length}
                  </div>
                  <div className="text-xs text-slate-400">
                    Available Options
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-700" />

              <div>
                <h4 className="font-medium text-slate-200 mb-2">
                  Navigation Patterns
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">
                      Most Used: Revenue Analytics
                    </span>
                    <span className={modeStyles.accent}>65%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Peak Usage: 2-4 PM</span>
                    <span className={modeStyles.accent}>38%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">
                      Avg. Session: 8.5 min
                    </span>
                    <span className={modeStyles.accent}>+12%</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
