"use client";

/**
 * Content Ideation Dashboard (Localized Version)
 * Task 36.26: Research & Trend Analysis System - Content Ideation Interface
 * Frontend component for the Content Ideation Engine with internationalization support
 */

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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale } from "@/lib/i18n/context";
import {
  Lightbulb,
  TrendingUp,
  Target,
  Clock,
  Users,
  BarChart3,
  Brain,
  Zap,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Share2,
  Star,
  Calendar,
  Sparkles,
} from "lucide-react";

// Types from the engine
interface ContentIdea {
  id: string;
  title: string;
  description: string;
  category:
    | "blog"
    | "social"
    | "video"
    | "infographic"
    | "podcast"
    | "webinar"
    | "ebook"
    | "case-study";
  targetAudience: string[];
  contentType:
    | "educational"
    | "promotional"
    | "entertaining"
    | "news"
    | "thought-leadership";
  format: string;
  keywords: string[];
  hashtags: string[];
  competitorGap: boolean;
  trendAlignment: {
    trendKeyword: string;
    trendStrength: number;
    timing: "immediate" | "soon" | "planned";
  };
  seoScore: number;
  viralPotential: number;
  engagementPrediction: {
    expectedViews: number;
    expectedShares: number;
    expectedComments: number;
  };
  difficulty: "easy" | "medium" | "hard";
  estimatedHours: number;
  requiredResources: string[];
  suggestedOutline: string[];
  bestPublishTime: {
    dayOfWeek: string;
    timeOfDay: string;
  };
  distributionChannels: string[];
  sourceInsights: string[];
  confidence: number;
  priority: "low" | "medium" | "high" | "critical";
  generatedAt: Date;
  expiresAt?: Date;
}

interface ContentStrategy {
  timeframe: "week" | "month" | "quarter";
  totalIdeas: number;
  categories: Array<{
    category: string;
    count: number;
    priority: string;
  }>;
  contentMix: {
    educational: number;
    promotional: number;
    entertaining: number;
    news: number;
    thoughtLeadership: number;
  };
  keyThemes: string[];
  competitorGaps: string[];
  trendOpportunities: string[];
  timeline: Array<{
    week: number;
    suggestedContent: ContentIdea[];
  }>;
}

export default function ContentIdeationDashboardLocalized() {
  const { t } = useLocale();
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [strategy, setStrategy] = useState<ContentStrategy | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingIdeas, setGeneratingIdeas] = useState(false);
  const [activeTab, setActiveTab] = useState("ideas");
  const [filter, setFilter] = useState({
    category: "all",
    priority: "all",
    difficulty: "all",
    timing: "all",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Ideation form state
  const [ideationForm, setIdeationForm] = useState({
    keywords: "",
    quantity: 10,
    targetAudience: "",
    contentTypes: [] as string[],
    includeCompetitorGaps: true,
    includeTrendingTopics: true,
    timeframe: "short-term" as "immediate" | "short-term" | "long-term",
  });

  useEffect(() => {
    loadStoredIdeas();
    generateContentStrategy();
  }, []);

  const loadStoredIdeas = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "/api/research-scraping/content-ideation?action=ideas&limit=50"
      );
      const data = await response.json();
      if (data.success) {
        setIdeas(data.data);
      }
    } catch (error) {
      console.error("Failed to load ideas:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateContentStrategy = async () => {
    try {
      const response = await fetch(
        "/api/research-scraping/content-ideation?action=strategy&timeframe=month"
      );
      const data = await response.json();
      if (data.success) {
        setStrategy(data.data);
      }
    } catch (error) {
      console.error("Failed to generate strategy:", error);
    }
  };

  const generateNewIdeas = async () => {
    try {
      setGeneratingIdeas(true);
      const response = await fetch("/api/research-scraping/content-ideation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          request: {
            keywords: ideationForm.keywords
              ? ideationForm.keywords.split(",").map(k => k.trim())
              : undefined,
            quantity: ideationForm.quantity,
            targetAudience: ideationForm.targetAudience
              ? [ideationForm.targetAudience]
              : undefined,
            contentTypes:
              ideationForm.contentTypes.length > 0
                ? ideationForm.contentTypes
                : undefined,
            includeCompetitorGaps: ideationForm.includeCompetitorGaps,
            includeTrendingTopics: ideationForm.includeTrendingTopics,
            timeframe: ideationForm.timeframe,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIdeas(data.data.ideas);
        await generateContentStrategy(); // Refresh strategy
      }
    } catch (error) {
      console.error("Failed to generate ideas:", error);
    } finally {
      setGeneratingIdeas(false);
    }
  };

  const runDemo = async () => {
    try {
      setGeneratingIdeas(true);
      const response = await fetch(
        "/api/research-scraping/content-ideation?action=demo"
      );
      const data = await response.json();
      if (data.success) {
        setIdeas(data.data.ideas);
      }
    } catch (error) {
      console.error("Demo failed:", error);
    } finally {
      setGeneratingIdeas(false);
    }
  };

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch =
      searchTerm === "" ||
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.keywords.some(k =>
        k.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      filter.category === "all" || idea.category === filter.category;
    const matchesPriority =
      filter.priority === "all" || idea.priority === filter.priority;
    const matchesDifficulty =
      filter.difficulty === "all" || idea.difficulty === filter.difficulty;
    const matchesTiming =
      filter.timing === "all" || idea.trendAlignment.timing === filter.timing;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesPriority &&
      matchesDifficulty &&
      matchesTiming
    );
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "hard":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "easy":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTimingColor = (timing: string) => {
    switch (timing) {
      case "immediate":
        return "bg-red-100 text-red-800";
      case "soon":
        return "bg-orange-100 text-orange-800";
      case "planned":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderIdeasGrid = () => (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t.contentIdeation.searchPlaceholder}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Select
            value={filter.category}
            onValueChange={value => setFilter({ ...filter, category: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t.contentIdeation.allCategories}
              </SelectItem>
              <SelectItem value="blog">{t.contentIdeation.blog}</SelectItem>
              <SelectItem value="social">{t.contentIdeation.social}</SelectItem>
              <SelectItem value="video">{t.contentIdeation.video}</SelectItem>
              <SelectItem value="infographic">
                {t.contentIdeation.infographic}
              </SelectItem>
              <SelectItem value="podcast">
                {t.contentIdeation.podcast}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filter.priority}
            onValueChange={value => setFilter({ ...filter, priority: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t.contentIdeation.allPriorities}
              </SelectItem>
              <SelectItem value="critical">
                {t.contentIdeation.critical}
              </SelectItem>
              <SelectItem value="high">{t.contentIdeation.high}</SelectItem>
              <SelectItem value="medium">{t.contentIdeation.medium}</SelectItem>
              <SelectItem value="low">{t.contentIdeation.low}</SelectItem>
            </SelectContent>
          </Select>

          <NormalButton
            variant="secondary"
            size="sm"
            onClick={() =>
              setFilter({
                category: "all",
                priority: "all",
                difficulty: "all",
                timing: "all",
              })
            }
          >
            <Filter className="h-4 w-4 mr-2" />
            {t.contentIdeation.clear}
          </NormalButton>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredIdeas.map(idea => (
          <Card key={idea.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{idea.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {t.contentIdeation[
                        idea.category as keyof typeof t.contentIdeation
                      ] || idea.category}
                    </Badge>
                    <Badge
                      className={`text-xs ${getPriorityColor(idea.priority)}`}
                    >
                      {t.contentIdeation[
                        idea.priority as keyof typeof t.contentIdeation
                      ] || idea.priority}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">
                    {Math.round(idea.confidence * 100)}%
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 line-clamp-2">
                {idea.description}
              </p>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-blue-600">
                    {idea.seoScore}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t.contentIdeation.seoScore}
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-purple-600">
                    {idea.viralPotential}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t.contentIdeation.viralScore}
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-orange-600">
                    {idea.estimatedHours}h
                  </div>
                  <div className="text-xs text-gray-500">
                    {t.contentIdeation.estTime}
                  </div>
                </div>
              </div>

              {/* Engagement Prediction */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {t.contentIdeation.views}
                  </span>
                  <span>
                    {idea.engagementPrediction.expectedViews.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Share2 className="h-3 w-3" />
                    {t.contentIdeation.shares}
                  </span>
                  <span>{idea.engagementPrediction.expectedShares}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Badge
                    className={`text-xs ${getDifficultyColor(idea.difficulty)}`}
                  >
                    {t.contentIdeation[
                      idea.difficulty as keyof typeof t.contentIdeation
                    ] || idea.difficulty}
                  </Badge>
                  <Badge
                    className={`text-xs ${getTimingColor(idea.trendAlignment.timing)}`}
                  >
                    {t.contentIdeation[
                      idea.trendAlignment
                        .timing as keyof typeof t.contentIdeation
                    ] || idea.trendAlignment.timing}
                  </Badge>
                  {idea.competitorGap && (
                    <Badge className="text-xs bg-blue-100 text-blue-800">
                      {t.contentIdeation.gapOpportunity}
                    </Badge>
                  )}
                </div>

                {/* Keywords */}
                <div className="flex flex-wrap gap-1">
                  {idea.keywords.slice(0, 3).map((keyword, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {idea.keywords.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{idea.keywords.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Best Time */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  {t.contentIdeation.bestTime}: {idea.bestPublishTime.dayOfWeek}{" "}
                  at {idea.bestPublishTime.timeOfDay}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIdeas.length === 0 && (
        <div className="text-center py-12">
          <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {t.contentIdeation.noIdeasFound}
          </h3>
          <p className="text-gray-500 mb-4">
            {t.contentIdeation.noIdeasMessage}
          </p>
          <NormalButton onClick={generateNewIdeas} disabled={generatingIdeas}>
            <Sparkles className="h-4 w-4 mr-2" />
            {t.contentIdeation.generateIdeas}
          </NormalButton>
        </div>
      )}
    </div>
  );

  const renderStrategy = () => {
    if (!strategy) return <div>{t.contentIdeation.loadingStrategy}</div>;

    return (
      <div className="space-y-6">
        {/* Strategy Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {strategy.totalIdeas}
              </div>
              <div className="text-sm text-gray-600">
                {t.contentIdeation.totalIdeas}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {strategy.keyThemes.length}
              </div>
              <div className="text-sm text-gray-600">
                {t.contentIdeation.keyThemes}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {strategy.competitorGaps.length}
              </div>
              <div className="text-sm text-gray-600">
                {t.contentIdeation.gapOpportunities}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {strategy.trendOpportunities.length}
              </div>
              <div className="text-sm text-gray-600">
                {t.contentIdeation.trendOpportunities}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Mix */}
        <Card>
          <CardHeader>
            <CardTitle>{t.contentIdeation.contentMixStrategy}</CardTitle>
            <CardDescription>
              {t.contentIdeation.contentMixDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(strategy.contentMix).map(([type, percentage]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="capitalize">
                    {type.replace(/([A-Z])/g, " $1")}
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress value={percentage} className="w-24" />
                    <span className="text-sm font-medium w-12">
                      {percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Themes & Opportunities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.contentIdeation.keyThemes}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {strategy.keyThemes.map((theme, idx) => (
                  <Badge key={idx} variant="secondary" className="mr-2 mb-2">
                    {theme}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.contentIdeation.competitorGaps}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {strategy.competitorGaps.map((gap, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{gap}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderIdeationForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t.contentIdeation.generateContentIdeas}</CardTitle>
        <CardDescription>
          {t.contentIdeation.generateDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="keywords">{t.contentIdeation.keywords}</Label>
            <Input
              id="keywords"
              placeholder={t.contentIdeation.keywordsPlaceholder}
              value={ideationForm.keywords}
              onChange={e =>
                setIdeationForm({ ...ideationForm, keywords: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">{t.contentIdeation.numberOfIdeas}</Label>
            <Select
              value={ideationForm.quantity.toString()}
              onValueChange={value =>
                setIdeationForm({ ...ideationForm, quantity: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">{t.contentIdeation.ideas5}</SelectItem>
                <SelectItem value="10">{t.contentIdeation.ideas10}</SelectItem>
                <SelectItem value="15">{t.contentIdeation.ideas15}</SelectItem>
                <SelectItem value="20">{t.contentIdeation.ideas20}</SelectItem>
                <SelectItem value="25">{t.contentIdeation.ideas25}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience">{t.contentIdeation.targetAudience}</Label>
            <Input
              id="audience"
              placeholder={t.contentIdeation.audiencePlaceholder}
              value={ideationForm.targetAudience}
              onChange={e =>
                setIdeationForm({
                  ...ideationForm,
                  targetAudience: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeframe">{t.contentIdeation.timeframe}</Label>
            <Select
              value={ideationForm.timeframe}
              onValueChange={(value: any) =>
                setIdeationForm({ ...ideationForm, timeframe: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">
                  {t.contentIdeation.immediateTimeframe}
                </SelectItem>
                <SelectItem value="short-term">
                  {t.contentIdeation.shortTermTimeframe}
                </SelectItem>
                <SelectItem value="long-term">
                  {t.contentIdeation.longTermTimeframe}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={ideationForm.includeCompetitorGaps}
              onChange={e =>
                setIdeationForm({
                  ...ideationForm,
                  includeCompetitorGaps: e.target.checked,
                })
              }
            />
            <span className="text-sm">
              {t.contentIdeation.includeCompetitorGaps}
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={ideationForm.includeTrendingTopics}
              onChange={e =>
                setIdeationForm({
                  ...ideationForm,
                  includeTrendingTopics: e.target.checked,
                })
              }
            />
            <span className="text-sm">
              {t.contentIdeation.includeTrendingTopics}
            </span>
          </label>
        </div>

        <div className="flex gap-2">
          <NormalButton
            onClick={generateNewIdeas}
            disabled={generatingIdeas}
            className="flex-1"
          >
            {generatingIdeas ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                {t.contentIdeation.generatingIdeas}
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                {t.contentIdeation.generateIdeas}
              </>
            )}
          </NormalButton>

          <NormalButton
            variant="secondary"
            onClick={runDemo}
            disabled={generatingIdeas}
          >
            <Zap className="h-4 w-4 mr-2" />
            {t.contentIdeation.demo}
          </NormalButton>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.contentIdeation.title}</h1>
          <p className="text-gray-600">{t.contentIdeation.description}</p>
        </div>

        <div className="flex gap-2">
          <NormalButton
            variant="secondary"
            onClick={loadStoredIdeas}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {t.contentIdeation.refresh}
          </NormalButton>
          <NormalButton variant="secondary">
            <Download className="h-4 w-4 mr-2" />
            {t.contentIdeation.export}
          </NormalButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {ideas.length}
            </div>
            <div className="text-sm text-gray-600">
              {t.contentIdeation.totalIdeas}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {
                ideas.filter(
                  idea =>
                    idea.priority === "high" || idea.priority === "critical"
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">
              {t.contentIdeation.highPriority}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {
                ideas.filter(idea => idea.trendAlignment.timing === "immediate")
                  .length
              }
            </div>
            <div className="text-sm text-gray-600">
              {t.contentIdeation.trendingNow}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(
                (ideas.reduce((sum, idea) => sum + idea.confidence, 0) /
                  ideas.length) *
                  100
              ) || 0}
              %
            </div>
            <div className="text-sm text-gray-600">
              {t.contentIdeation.avgConfidence}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="ideas">
            {t.contentIdeation.contentIdeas}
          </TabsTrigger>
          <TabsTrigger value="strategy">
            {t.contentIdeation.strategy}
          </TabsTrigger>
          <TabsTrigger value="generate">
            {t.contentIdeation.generate}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ideas" className="space-y-6">
          {renderIdeasGrid()}
        </TabsContent>

        <TabsContent value="strategy" className="space-y-6">
          {renderStrategy()}
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          {renderIdeationForm()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
