"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Lightbulb,
  TrendingUp,
  Target,
  Clock,
  Hash,
  Zap,
  Users,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Play,
  Pause,
  Settings,
  RefreshCw,
  Eye,
  ThumbsUp,
  DollarSign,
} from "lucide-react";

interface AutomaticContentOptimizationDashboardProps {
  locale: string;
}

interface ContentInput {
  id: string;
  content: string;
  platform: string;
  hashtags: string[];
  scheduled_time?: Date;
  campaign_id?: string;
}

interface OptimizationSuggestion {
  id: string;
  type: string;
  priority: "critical" | "high" | "medium" | "low";
  suggestion: string;
  reasoning: string;
  confidence_score: number;
  estimated_impact: {
    engagement_increase: number;
    reach_increase: number;
    conversion_increase: number;
    roi_improvement: number;
  };
  implementation: {
    effort_required: "low" | "medium" | "high";
    time_estimate: number;
    auto_applicable: boolean;
  };
  applied: boolean;
}

interface OptimizationReport {
  content_id: string;
  total_suggestions: number;
  applied_suggestions: number;
  pending_suggestions: number;
  performance_improvement: {
    engagement: number;
    reach: number;
    conversions: number;
    roi: number;
  };
}

export function AutomaticContentOptimizationDashboard({
  locale,
}: AutomaticContentOptimizationDashboardProps) {
  // State management
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [autoOptimizationEnabled, setAutoOptimizationEnabled] = useState(true);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [report, setReport] = useState<OptimizationReport | null>(null);
  const [selectedContent, setSelectedContent] = useState<ContentInput>({
    id: "",
    content: "",
    platform: "instagram",
    hashtags: [],
  });

  // Content analysis state
  const [contentText, setContentText] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [campaignId, setCampaignId] = useState("");

  // Real-time monitoring
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitoringStats, setMonitoringStats] = useState({
    total_content_analyzed: 0,
    suggestions_generated: 0,
    auto_applied: 0,
    performance_improvements: 0,
  });

  /**
   * Generate optimization suggestions for content
   */
  const generateOptimizationSuggestions = async () => {
    if (!contentText.trim() || !platform) {
      alert("Please provide content text and select a platform");
      return;
    }

    setIsOptimizing(true);
    try {
      const contentToOptimize: ContentInput = {
        id: `content_${Date.now()}`,
        content: contentText,
        platform: platform,
        hashtags: hashtags
          .split(",")
          .map(h => h.trim())
          .filter(h => h),
        campaign_id: campaignId || undefined,
      };

      const response = await fetch("/api/content-optimization/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: contentToOptimize,
          includeAutoApply: autoOptimizationEnabled,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate suggestions");

      const result = await response.json();
      setSuggestions(result.data.suggestions);
      setSelectedContent(contentToOptimize);

      // Update monitoring stats
      setMonitoringStats(prev => ({
        ...prev,
        total_content_analyzed: prev.total_content_analyzed + 1,
        suggestions_generated:
          prev.suggestions_generated + result.data.total_suggestions,
        auto_applied: prev.auto_applied + result.data.auto_applied,
      }));
    } catch (error) {
      console.error("Error generating suggestions:", error);
      alert("Failed to generate optimization suggestions");
    } finally {
      setIsOptimizing(false);
    }
  };

  /**
   * Apply a specific optimization suggestion
   */
  const applySuggestion = async (suggestionId: string) => {
    try {
      const response = await fetch("/api/content-optimization/suggestions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_id: selectedContent.id,
          suggestion_id: suggestionId,
          action: "apply",
        }),
      });

      if (!response.ok) throw new Error("Failed to apply suggestion");

      // Update suggestion status
      setSuggestions(prev =>
        prev.map(s => (s.id === suggestionId ? { ...s, applied: true } : s))
      );

      setMonitoringStats(prev => ({
        ...prev,
        auto_applied: prev.auto_applied + 1,
      }));
    } catch (error) {
      console.error("Error applying suggestion:", error);
      alert("Failed to apply suggestion");
    }
  };

  /**
   * Generate optimization report
   */
  const generateReport = async () => {
    if (!selectedContent.id) return;

    try {
      const response = await fetch(
        `/api/content-optimization/suggestions?content_id=${selectedContent.id}`
      );
      if (!response.ok) throw new Error("Failed to generate report");

      const result = await response.json();
      setReport(result.data);
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  // Auto-refresh monitoring data
  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        // In real implementation, fetch fresh monitoring data
        setMonitoringStats(prev => ({
          ...prev,
          performance_improvements: Math.random() * 100,
        }));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-600 bg-red-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical":
        return <AlertTriangle className="h-4 w-4" />;
      case "high":
        return <TrendingUp className="h-4 w-4" />;
      case "medium":
        return <Target className="h-4 w-4" />;
      case "low":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Monitoring Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Content Analyzed
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monitoringStats.total_content_analyzed}
            </div>
            <p className="text-xs text-muted-foreground">
              Total pieces analyzed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Suggestions Generated
            </CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monitoringStats.suggestions_generated}
            </div>
            <p className="text-xs text-muted-foreground">
              Optimization recommendations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto Applied</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monitoringStats.auto_applied}
            </div>
            <p className="text-xs text-muted-foreground">
              Automatic optimizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Performance Boost
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{monitoringStats.performance_improvements.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Average improvement</p>
          </CardContent>
        </Card>
      </div>

      {/* Auto-optimization Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Automatische Optimalisatie Instellingen
              </CardTitle>
              <CardDescription>
                Configureer automatische content optimization en monitoring
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={autoOptimizationEnabled}
                  onCheckedChange={setAutoOptimizationEnabled}
                />
                <Label htmlFor="auto-opt">Auto-optimalisatie</Label>
              </div>
              <NormalButton
                variant={isMonitoring ? "destructive" : "default"}
                onClick={() => setIsMonitoring(!isMonitoring)}
                className="flex items-center gap-2"
              >
                {isMonitoring ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
              </NormalButton>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isMonitoring && (
            <Alert>
              <Eye className="h-4 w-4" />
              <AlertDescription>
                Real-time monitoring is active. Het systeem analyseert
                automatisch nieuwe content en genereert optimalisatie
                suggesties.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="analyzer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analyzer">Content Analyzer</TabsTrigger>
          <TabsTrigger value="suggestions">Optimization Suggesties</TabsTrigger>
          <TabsTrigger value="reports">Performance Reports</TabsTrigger>
          <TabsTrigger value="automation">Automation Settings</TabsTrigger>
        </TabsList>

        {/* Content Analyzer Tab */}
        <TabsContent value="analyzer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Content Analysis & Optimization
              </CardTitle>
              <CardDescription>
                Analyseer content en krijg automatische optimalisatie suggesties
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign">Campaign ID (Optional)</Label>
                  <Input
                    id="campaign"
                    value={campaignId}
                    onChange={e => setCampaignId(e.target.value)}
                    placeholder="campaign_123"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content Text</Label>
                <Textarea
                  id="content"
                  value={contentText}
                  onChange={e => setContentText(e.target.value)}
                  placeholder="Enter your content text here..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hashtags">Hashtags (comma separated)</Label>
                <Input
                  id="hashtags"
                  value={hashtags}
                  onChange={e => setHashtags(e.target.value)}
                  placeholder="#marketing, #social, #content"
                />
              </div>

              <NormalButton
                onClick={generateOptimizationSuggestions}
                disabled={isOptimizing || !contentText.trim()}
                className="w-full flex items-center gap-2"
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Analyzing Content...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Generate Optimization Suggestions
                  </>
                )}
              </NormalButton>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimization Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Optimization Suggestions</h3>
            <Badge variant="outline">
              {suggestions.length} suggestions •{" "}
              {suggestions.filter(s => s.applied).length} applied
            </Badge>
          </div>

          {suggestions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Lightbulb className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Suggestions Yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Analyze some content first to get optimization suggestions
                </p>
                <NormalButton
                  onClick={() =>
                    document.querySelector('[value="analyzer"]')?.click()
                  }
                >
                  Go to Analyzer
                </NormalButton>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {suggestions.map(suggestion => (
                <Card
                  key={suggestion.id}
                  className={
                    suggestion.applied ? "border-green-200 bg-green-50" : ""
                  }
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getPriorityIcon(suggestion.priority)}
                        <div>
                          <CardTitle className="text-base">
                            {suggestion.suggestion}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              className={getPriorityColor(suggestion.priority)}
                            >
                              {suggestion.priority}
                            </Badge>
                            <Badge variant="outline">{suggestion.type}</Badge>
                            <Badge variant="outline">
                              {(suggestion.confidence_score * 100).toFixed(0)}%
                              confidence
                            </Badge>
                            {suggestion.applied && (
                              <Badge className="bg-green-100 text-green-800">
                                Applied
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {!suggestion.applied &&
                        suggestion.implementation.auto_applicable && (
                          <NormalButton
                            size="sm"
                            onClick={() => applySuggestion(suggestion.id)}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Apply
                          </NormalButton>
                        )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{suggestion.reasoning}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <ThumbsUp className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">
                            Engagement
                          </span>
                        </div>
                        <span className="text-lg font-bold text-blue-600">
                          +{suggestion.estimated_impact.engagement_increase}%
                        </span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Reach</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          +{suggestion.estimated_impact.reach_increase}%
                        </span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Target className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium">
                            Conversions
                          </span>
                        </div>
                        <span className="text-lg font-bold text-purple-600">
                          +{suggestion.estimated_impact.conversion_increase}%
                        </span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <DollarSign className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-medium">ROI</span>
                        </div>
                        <span className="text-lg font-bold text-orange-600">
                          +{suggestion.estimated_impact.roi_improvement}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        Effort: {suggestion.implementation.effort_required}
                      </span>
                      <span>
                        Time: {suggestion.implementation.time_estimate} min
                      </span>
                      <span>
                        {suggestion.implementation.auto_applicable
                          ? "Auto-applicable"
                          : "Manual"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Performance Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Optimization Performance Report
                </CardTitle>
                <NormalButton
                  onClick={generateReport}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Report
                </NormalButton>
              </div>
            </CardHeader>
            <CardContent>
              {report ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {report.total_suggestions}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Suggestions
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {report.applied_suggestions}
                      </div>
                      <div className="text-sm text-gray-600">Applied</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {report.pending_suggestions}
                      </div>
                      <div className="text-sm text-gray-600">Pending</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">
                      Performance Improvements
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Engagement</span>
                          <span>
                            +
                            {report.performance_improvement.engagement.toFixed(
                              1
                            )}
                            %
                          </span>
                        </div>
                        <Progress
                          value={Math.min(
                            report.performance_improvement.engagement,
                            100
                          )}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Reach</span>
                          <span>
                            +{report.performance_improvement.reach.toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={Math.min(
                            report.performance_improvement.reach,
                            100
                          )}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Conversions</span>
                          <span>
                            +
                            {report.performance_improvement.conversions.toFixed(
                              1
                            )}
                            %
                          </span>
                        </div>
                        <Progress
                          value={Math.min(
                            report.performance_improvement.conversions,
                            100
                          )}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>ROI</span>
                          <span>
                            +{report.performance_improvement.roi.toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={Math.min(
                            report.performance_improvement.roi,
                            100
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    No report data available. Analyze content first.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation Settings Tab */}
        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Automation Configuration
              </CardTitle>
              <CardDescription>
                Configure automatic optimization settings and rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">
                      Auto-apply High Confidence Suggestions
                    </Label>
                    <p className="text-sm text-gray-600">
                      Automatically apply suggestions with confidence &gt; 80%
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">
                      Real-time Content Monitoring
                    </Label>
                    <p className="text-sm text-gray-600">
                      Monitor new content and generate suggestions automatically
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">
                      Performance Tracking
                    </Label>
                    <p className="text-sm text-gray-600">
                      Track performance improvements from applied suggestions
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="pt-6 border-t">
                <h4 className="font-semibold mb-4">Optimization Priorities</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Hashtag Optimization</span>
                    <Badge>High Priority</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Content Timing</span>
                    <Badge>Medium Priority</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Format Improvements</span>
                    <Badge>Medium Priority</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Engagement Elements</span>
                    <Badge>High Priority</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
