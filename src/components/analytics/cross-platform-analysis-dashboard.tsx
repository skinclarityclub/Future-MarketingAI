"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Lightbulb,
  ArrowRight,
  Globe,
  Zap,
} from "lucide-react";

interface PlatformPrediction {
  predicted_engagement_rate: number;
  predicted_reach: number;
  predicted_impressions: number;
  viral_potential: number;
  confidence_score: number;
  optimization_suggestions: string[];
  recommended_hashtags: string[];
}

interface CrossPlatformInsight {
  insight_type: string;
  confidence_score: number;
  applicable_platforms: string[];
  optimization_impact: number;
  implementation_effort: string;
  expected_roi_improvement: number;
  insights: string[];
  actionable_recommendations: string[];
}

interface CompetitorBenchmark {
  competitor_id: string;
  competitor_name: string;
  platform: string;
  avg_engagement_rate: number;
  content_velocity: number;
  opportunities: string[];
}

interface AnalysisResult {
  platform_predictions: Record<string, PlatformPrediction>;
  universal_insights: CrossPlatformInsight[];
  optimization_recommendations: string[];
  competitor_benchmarks: CompetitorBenchmark[];
  cross_platform_score: number;
}

const platformOptions = [
  { value: "instagram", label: "Instagram", icon: "📸" },
  { value: "linkedin", label: "LinkedIn", icon: "💼" },
  { value: "twitter", label: "Twitter", icon: "🐦" },
  { value: "facebook", label: "Facebook", icon: "👥" },
  { value: "tiktok", label: "TikTok", icon: "🎵" },
  { value: "youtube", label: "YouTube", icon: "📺" },
];

const contentTypeOptions = [
  { value: "general", label: "General Content" },
  { value: "announcement", label: "Announcement" },
  { value: "educational", label: "Educational" },
  { value: "promotional", label: "Promotional" },
  { value: "entertainment", label: "Entertainment" },
  { value: "news", label: "News" },
];

export function CrossPlatformAnalysisDashboard() {
  const [activeTab, setActiveTab] = useState("analyze");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [content, setContent] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "instagram",
    "linkedin",
  ]);
  const [contentType, setContentType] = useState("general");
  const [targetAudience, setTargetAudience] = useState("");

  // Benchmark states
  const [benchmarkResult, setBenchmarkResult] = useState<any>(null);
  const [currentEngagement, setCurrentEngagement] = useState("0.05");
  const [currentReach, setCurrentReach] = useState("1000");
  const [currentConversion, setCurrentConversion] = useState("0.02");

  // Universal optimization states
  const [universalOptResult, setUniversalOptResult] = useState<any>(null);
  const [targetPlatforms, setTargetPlatforms] = useState<string[]>([]);

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleTargetPlatformToggle = (platform: string) => {
    setTargetPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const analyzeCrossPlatform = async () => {
    if (!content.trim()) {
      setError("Please enter content to analyze");
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError("Please select at least one platform");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        action: "analyze",
        content: content.trim(),
        hashtags: hashtags.trim(),
        platforms: selectedPlatforms.join(","),
        content_type: contentType,
        ...(targetAudience && { target_audience: targetAudience }),
      });

      const response = await fetch(`/api/cross-platform-analysis?${params}`);
      const data = await response.json();

      if (data.success) {
        setAnalysisResult(data.data);
      } else {
        setError(data.message || "Analysis failed");
      }
    } catch (err) {
      setError("Failed to analyze content. Please try again.");
      console.error("Analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const runBenchmarkAnalysis = async () => {
    if (selectedPlatforms.length === 0) {
      setError("Please select at least one platform for benchmarking");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        action: "benchmark",
        platforms: selectedPlatforms.join(","),
        content_type: contentType,
        engagement_rate: currentEngagement,
        reach: currentReach,
        conversion_rate: currentConversion,
      });

      const response = await fetch(`/api/cross-platform-analysis?${params}`);
      const data = await response.json();

      if (data.success) {
        setBenchmarkResult(data.data);
      } else {
        setError(data.message || "Benchmark analysis failed");
      }
    } catch (err) {
      setError("Failed to run benchmark analysis. Please try again.");
      console.error("Benchmark error:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateUniversalOptimizations = async () => {
    if (!content.trim()) {
      setError("Please enter content for optimization");
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError("Please select current platforms");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        action: "universal-optimizations",
        content: content.trim(),
        current_platforms: selectedPlatforms.join(","),
        target_platforms: targetPlatforms.join(","),
        content_type: contentType,
        ...(targetAudience && { target_audience: targetAudience }),
      });

      const response = await fetch(`/api/cross-platform-analysis?${params}`);
      const data = await response.json();

      if (data.success) {
        setUniversalOptResult(data.data);
      } else {
        setError(data.message || "Universal optimization failed");
      }
    } catch (err) {
      setError("Failed to generate universal optimizations. Please try again.");
      console.error("Universal optimization error:", err);
    } finally {
      setLoading(false);
    }
  };

  const runDemoAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cross-platform-analysis?action=demo");
      const data = await response.json();

      if (data.success) {
        setAnalysisResult(data.data);
        // Set demo content in form
        setContent(
          "Exciting news! We're launching our new AI-powered content optimization platform. Transform your social media strategy with intelligent insights and automated recommendations. #AI #ContentMarketing #SocialMedia #Innovation"
        );
        setHashtags("AI,ContentMarketing,SocialMedia,Innovation,Tech");
        setSelectedPlatforms(["instagram", "linkedin", "twitter", "facebook"]);
        setContentType("announcement");
        setTargetAudience("business_professionals");
        setActiveTab("analyze");
      } else {
        setError(data.message || "Demo analysis failed");
      }
    } catch (err) {
      setError("Failed to run demo analysis. Please try again.");
      console.error("Demo error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceBadgeColor = (score: number) => {
    if (score >= 0.8) return "bg-green-100 text-green-800";
    if (score >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4 mb-6">
        <NormalButton
          onClick={runDemoAnalysis}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Zap className="w-4 h-4 mr-2" />
          )}
          Run Demo Analysis
        </NormalButton>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analyze" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Cross-Platform Analysis
          </TabsTrigger>
          <TabsTrigger value="optimize" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Universal Optimization
          </TabsTrigger>
          <TabsTrigger value="benchmark" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Competitor Benchmark
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Results & Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analyze" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Cross-Platform Content Analysis
              </CardTitle>
              <CardDescription>
                Analyze how your content will perform across multiple social
                media platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="content">Content to Analyze</Label>
                <Textarea
                  id="content"
                  placeholder="Enter your content here..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hashtags">Hashtags (comma-separated)</Label>
                <Input
                  id="hashtags"
                  placeholder="AI, ContentMarketing, SocialMedia"
                  value={hashtags}
                  onChange={e => setHashtags(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Select Platforms</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {platformOptions.map(platform => (
                      <div
                        key={platform.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={platform.value}
                          checked={selectedPlatforms.includes(platform.value)}
                          onCheckedChange={() =>
                            handlePlatformToggle(platform.value)
                          }
                        />
                        <Label htmlFor={platform.value} className="text-sm">
                          {platform.icon} {platform.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contentType">Content Type</Label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {contentTypeOptions.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">
                      Target Audience (optional)
                    </Label>
                    <Input
                      id="targetAudience"
                      placeholder="e.g., business_professionals, millennials"
                      value={targetAudience}
                      onChange={e => setTargetAudience(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <NormalButton
                onClick={analyzeCrossPlatform}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Cross-Platform Performance...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analyze Cross-Platform Performance
                  </>
                )}
              </NormalButton>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimize" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Universal Content Optimization
              </CardTitle>
              <CardDescription>
                Generate platform-agnostic optimization recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Target Platforms for Expansion</Label>
                <div className="grid grid-cols-2 gap-2">
                  {platformOptions.map(platform => (
                    <div
                      key={platform.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`target-${platform.value}`}
                        checked={targetPlatforms.includes(platform.value)}
                        onCheckedChange={() =>
                          handleTargetPlatformToggle(platform.value)
                        }
                      />
                      <Label
                        htmlFor={`target-${platform.value}`}
                        className="text-sm"
                      >
                        {platform.icon} {platform.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <NormalButton
                onClick={generateUniversalOptimizations}
                disabled={loading || !content.trim()}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Universal Optimizations...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Generate Universal Optimizations
                  </>
                )}
              </NormalButton>
            </CardContent>
          </Card>

          {universalOptResult && (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Universal Hashtag Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {universalOptResult.universal_hashtags?.map(
                      (hashtag: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          #{hashtag}
                        </Badge>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Optimal Posting Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {universalOptResult.optimal_posting_schedule?.map(
                      (schedule: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {schedule.platform}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {schedule.optimal_times.map(
                              (time: string, timeIndex: number) => (
                                <Badge key={timeIndex} variant="outline">
                                  {time}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="benchmark" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Competitor Benchmarking
              </CardTitle>
              <CardDescription>
                Compare your performance against industry competitors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentEngagement">
                    Current Engagement Rate
                  </Label>
                  <Input
                    id="currentEngagement"
                    type="number"
                    step="0.001"
                    placeholder="0.05"
                    value={currentEngagement}
                    onChange={e => setCurrentEngagement(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentReach">Current Reach</Label>
                  <Input
                    id="currentReach"
                    type="number"
                    placeholder="1000"
                    value={currentReach}
                    onChange={e => setCurrentReach(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentConversion">
                    Current Conversion Rate
                  </Label>
                  <Input
                    id="currentConversion"
                    type="number"
                    step="0.001"
                    placeholder="0.02"
                    value={currentConversion}
                    onChange={e => setCurrentConversion(e.target.value)}
                  />
                </div>
              </div>

              <NormalButton
                onClick={runBenchmarkAnalysis}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running Benchmark Analysis...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Run Competitor Benchmark
                  </>
                )}
              </NormalButton>
            </CardContent>
          </Card>

          {benchmarkResult && (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Benchmarking Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Progress
                        value={benchmarkResult.benchmarking_score}
                        className="h-3"
                      />
                    </div>
                    <span className="text-2xl font-bold">
                      {Math.round(benchmarkResult.benchmarking_score)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Your performance relative to industry competitors
                  </p>
                </CardContent>
              </Card>

              {benchmarkResult.performance_gaps?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Gaps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {benchmarkResult.performance_gaps.map(
                        (gap: any, index: number) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-red-50 rounded-lg"
                          >
                            <div>
                              <span className="font-medium">{gap.metric}</span>
                              <span className="text-sm text-gray-600 ml-2">
                                on {gap.platform}
                              </span>
                            </div>
                            <Badge variant="destructive">
                              {gap.gap_percentage}% behind
                            </Badge>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {analysisResult ? (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Cross-Platform Performance Score
                    <Badge
                      className={getConfidenceBadgeColor(
                        analysisResult.cross_platform_score
                      )}
                    >
                      {Math.round(analysisResult.cross_platform_score * 100)}%
                      Confidence
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Progress
                        value={analysisResult.cross_platform_score * 100}
                        className="h-3"
                      />
                    </div>
                    <span className="text-2xl font-bold">
                      {Math.round(analysisResult.cross_platform_score * 100)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {Object.entries(analysisResult.platform_predictions).map(
                      ([platform, prediction]) => (
                        <div key={platform} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold capitalize">
                              {platform}
                            </h4>
                            <Badge
                              className={getConfidenceBadgeColor(
                                prediction.confidence_score
                              )}
                            >
                              {Math.round(prediction.confidence_score * 100)}%
                              Confidence
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Engagement Rate</p>
                              <p className="font-medium">
                                {(
                                  prediction.predicted_engagement_rate * 100
                                ).toFixed(2)}
                                %
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Reach</p>
                              <p className="font-medium">
                                {prediction.predicted_reach.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Impressions</p>
                              <p className="font-medium">
                                {prediction.predicted_impressions.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Viral Potential</p>
                              <p className="font-medium">
                                {Math.round(prediction.viral_potential * 100)}%
                              </p>
                            </div>
                          </div>
                          {prediction.recommended_hashtags.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm text-gray-600 mb-2">
                                Recommended Hashtags:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {prediction.recommended_hashtags
                                  .slice(0, 5)
                                  .map((hashtag, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      #{hashtag}
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {analysisResult.universal_insights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Universal Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResult.universal_insights.map(
                        (insight, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold capitalize">
                                {insight.insight_type.replace("_", " ")}
                              </h4>
                              <div className="flex gap-2">
                                <Badge variant="outline">
                                  {insight.implementation_effort} effort
                                </Badge>
                                <Badge
                                  className={getConfidenceBadgeColor(
                                    insight.confidence_score
                                  )}
                                >
                                  {Math.round(insight.confidence_score * 100)}%
                                  Confidence
                                </Badge>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <p className="text-sm font-medium text-gray-700">
                                  Key Insights:
                                </p>
                                <ul className="text-sm text-gray-600 list-disc list-inside">
                                  {insight.insights.map((item, itemIndex) => (
                                    <li key={itemIndex}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">
                                  Actionable Recommendations:
                                </p>
                                <ul className="text-sm text-gray-600 list-disc list-inside">
                                  {insight.actionable_recommendations.map(
                                    (item, itemIndex) => (
                                      <li key={itemIndex}>{item}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {analysisResult.optimization_recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Optimization Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analysisResult.optimization_recommendations.map(
                        (recommendation, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                          >
                            <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{recommendation}</p>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {analysisResult.competitor_benchmarks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Competitor Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResult.competitor_benchmarks.map(
                        (competitor, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold">
                                {competitor.competitor_name}
                              </h4>
                              <div className="text-sm text-gray-600">
                                {competitor.avg_engagement_rate.toFixed(2)}%
                                engagement
                              </div>
                            </div>
                            {competitor.opportunities.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  Opportunities:
                                </p>
                                <ul className="text-sm text-gray-600 list-disc list-inside">
                                  {competitor.opportunities
                                    .slice(0, 3)
                                    .map((opportunity, oppIndex) => (
                                      <li key={oppIndex}>{opportunity}</li>
                                    ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No Analysis Results
                </h3>
                <p className="text-gray-500 mb-4">
                  Run a cross-platform analysis to see detailed insights and
                  recommendations.
                </p>
                <NormalButton
                  onClick={() => setActiveTab("analyze")}
                  variant="outline"
                >
                  Start Analysis
                </NormalButton>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
