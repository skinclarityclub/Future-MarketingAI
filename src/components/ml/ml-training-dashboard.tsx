"use client";

import { useState } from "react";
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
import {
  AlertCircle,
  Brain,
  TrendingUp,
  Target,
  Clock,
  Hash,
  Zap,
  Users,
  BarChart3,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MLTrainingDashboardProps {
  locale: string;
}

interface HashtagAnalysis {
  hashtag: string;
  effectiveness_score: number;
  trending_status: "trending" | "stable" | "declining";
  competition_level: "low" | "medium" | "high";
  reach_potential: number;
  engagement_boost: number;
}

interface ContentAnalysisResult {
  predicted_engagement_rate: number;
  predicted_reach: number;
  viral_potential: number;
  confidence_score: number;
  hashtag_analysis: HashtagAnalysis[];
  optimization_recommendations: string[];
  risk_factors: string[];
}

export function MLTrainingDashboard({
  locale: _locale,
}: MLTrainingDashboardProps) {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Content Analysis State
  const [contentText, setContentText] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [analysisResult, setAnalysisResult] =
    useState<ContentAnalysisResult | null>(null);

  // Hashtag Recommendations State
  const [recommendationText, setRecommendationText] = useState("");
  const [recommendedHashtags, setRecommendedHashtags] = useState<string[]>([]);
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);

  const startTraining = async () => {
    setIsTraining(true);
    setTrainingProgress(0);

    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 500);
  };

  const analyzeContent = async () => {
    if (!contentText || !platform) return;

    setIsAnalyzing(true);
    try {
      const hashtagArray = hashtags
        .split(/[,#\s]+/)
        .filter(h => h.trim())
        .map(h => `#${h.replace("#", "")}`);

      const response = await fetch("/api/ml/content-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: {
            text: contentText,
            hashtags: hashtagArray,
          },
          platform,
          action: "analyze",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(data.analysis.performance_prediction);
      }
    } catch (error) {
      console.error("Content analysis failed:", error);
    }
    setIsAnalyzing(false);
  };

  const generateHashtagRecommendations = async () => {
    if (!recommendationText || !platform) return;

    setIsGeneratingHashtags(true);
    try {
      const response = await fetch("/api/ml/content-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: {
            text: recommendationText,
          },
          platform,
          action: "hashtag-recommendations",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendedHashtags(data.recommendations);
      }
    } catch (error) {
      console.error("Hashtag recommendation failed:", error);
    }
    setIsGeneratingHashtags(false);
  };

  const getTrendingStatusColor = (status: string) => {
    switch (status) {
      case "trending":
        return "bg-green-500";
      case "stable":
        return "bg-yellow-500";
      case "declining":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* ML Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Patterns
            </CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">+3 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hashtag Database
            </CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">Analyzed hashtags</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Prediction Accuracy
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.3%</div>
            <p className="text-xs text-muted-foreground">+2.1% this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Model Confidence
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.1%</div>
            <p className="text-xs text-muted-foreground">High confidence</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="training" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="training">Model Training</TabsTrigger>
          <TabsTrigger value="analysis">Content Analysis</TabsTrigger>
          <TabsTrigger value="hashtags">Hashtag Tools</TabsTrigger>
          <TabsTrigger value="insights">Performance Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle>Train ML Models</CardTitle>
              <CardDescription>
                Update models with new performance data and improve prediction
                accuracy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isTraining && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Training Progress</span>
                    <span>{Math.round(trainingProgress)}%</span>
                  </div>
                  <Progress value={trainingProgress} />
                </div>
              )}

              <div className="flex space-x-2">
                <NormalButton onClick={startTraining} disabled={isTraining}>
                  <Brain className="w-4 h-4 mr-2" />
                  {isTraining ? "Training..." : "Start Training"}
                </NormalButton>

                <NormalButton variant="outline" disabled={isTraining}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Update Patterns
                </NormalButton>
              </div>

              {trainingProgress === 100 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Training completed successfully! Model accuracy improved by
                    2.3%.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Performance Prediction</CardTitle>
                <CardDescription>
                  Analyze your content and predict its performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="content-text">Content Text</Label>
                  <Textarea
                    id="content-text"
                    placeholder="Enter your content text here..."
                    value={contentText}
                    onChange={e => setContentText(e.target.value)}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="hashtags">Hashtags</Label>
                  <Input
                    id="hashtags"
                    placeholder="marketing, business, success"
                    value={hashtags}
                    onChange={e => setHashtags(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue />
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

                <NormalButton
                  onClick={analyzeContent}
                  disabled={isAnalyzing}
                  className="w-full"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {isAnalyzing ? "Analyzing..." : "Analyze Content"}
                </NormalButton>
              </CardContent>
            </Card>

            {analysisResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>
                    AI-powered performance predictions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {(
                          analysisResult.predicted_engagement_rate * 100
                        ).toFixed(1)}
                        %
                      </div>
                      <div className="text-sm text-blue-600">
                        Predicted Engagement
                      </div>
                    </div>

                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {analysisResult.predicted_reach.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-600">
                        Predicted Reach
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Viral Potential</span>
                      <span>
                        {(analysisResult.viral_potential * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={analysisResult.viral_potential * 100} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Confidence Score</span>
                      <span>
                        {(analysisResult.confidence_score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={analysisResult.confidence_score * 100} />
                  </div>

                  {analysisResult.optimization_recommendations && (
                    <div>
                      <h4 className="font-medium mb-2">Optimization Tips</h4>
                      <ul className="text-sm space-y-1">
                        {analysisResult.optimization_recommendations.map(
                          (tip, index) => (
                            <li
                              key={index}
                              className="flex items-start space-x-2"
                            >
                              <span className="text-green-500 mt-1">•</span>
                              <span>{tip}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {analysisResult.risk_factors &&
                    analysisResult.risk_factors.length > 0 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Risk Factors:</strong>
                          <br />
                          {analysisResult.risk_factors.join("; ")}
                        </AlertDescription>
                      </Alert>
                    )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="hashtags">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hashtag Recommendations</CardTitle>
                <CardDescription>
                  Generate optimal hashtags for your content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="recommendation-text">
                    Content for Hashtag Analysis
                  </Label>
                  <Textarea
                    id="recommendation-text"
                    placeholder="Describe your content to get relevant hashtag recommendations..."
                    value={recommendationText}
                    onChange={e => setRecommendationText(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="platform-hashtag">Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue />
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

                <NormalButton
                  onClick={generateHashtagRecommendations}
                  disabled={isGeneratingHashtags}
                  className="w-full"
                >
                  <Hash className="w-4 h-4 mr-2" />
                  {isGeneratingHashtags ? "Generating..." : "Generate Hashtags"}
                </NormalButton>
              </CardContent>
            </Card>

            {recommendedHashtags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Hashtags</CardTitle>
                  <CardDescription>
                    AI-powered hashtag suggestions for {platform}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {recommendedHashtags.map((hashtag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-blue-50"
                        onClick={() => {
                          navigator.clipboard.writeText(hashtag);
                        }}
                      >
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Click any hashtag to copy to clipboard
                  </p>
                </CardContent>
              </Card>
            )}

            {analysisResult?.hashtag_analysis && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Hashtag Performance Analysis</CardTitle>
                  <CardDescription>
                    Detailed analysis of your hashtags
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysisResult.hashtag_analysis.map((hashtag, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{hashtag.hashtag}</span>
                          <div
                            className={`w-2 h-2 rounded-full ${getTrendingStatusColor(hashtag.trending_status)}`}
                          />
                        </div>

                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Effectiveness:</span>
                            <span>
                              {(hashtag.effectiveness_score * 100).toFixed(1)}%
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span>Competition:</span>
                            <span
                              className={getCompetitionColor(
                                hashtag.competition_level
                              )}
                            >
                              {hashtag.competition_level}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span>Reach Potential:</span>
                            <span>
                              {hashtag.reach_potential.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span>Engagement Boost:</span>
                            <span>
                              +{(hashtag.engagement_boost * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant={
                            hashtag.trending_status === "trending"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {hashtag.trending_status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Patterns</CardTitle>
                <CardDescription>
                  Discovered content patterns that drive engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800">
                      High-Performing Pattern
                    </h4>
                    <p className="text-sm text-green-600 mt-1">
                      Posts with 5-8 hashtags get 40% more engagement on
                      Instagram
                    </p>
                    <div className="flex items-center mt-2 text-xs text-green-600">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Success rate: 87.3%
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800">
                      Timing Pattern
                    </h4>
                    <p className="text-sm text-blue-600 mt-1">
                      LinkedIn posts perform best between 8-10 AM on weekdays
                    </p>
                    <div className="flex items-center mt-2 text-xs text-blue-600">
                      <Clock className="w-3 h-3 mr-1" />
                      Confidence: 92.1%
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800">
                      Content Type Pattern
                    </h4>
                    <p className="text-sm text-purple-600 mt-1">
                      Video content generates 3x more engagement than static
                      posts
                    </p>
                    <div className="flex items-center mt-2 text-xs text-purple-600">
                      <Users className="w-3 h-3 mr-1" />
                      Sample size: 1,247 posts
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
                <CardDescription>
                  Track ML model accuracy and improvements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Engagement Rate Prediction</span>
                      <span>89.2%</span>
                    </div>
                    <Progress value={89.2} />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Reach Prediction</span>
                      <span>84.7%</span>
                    </div>
                    <Progress value={84.7} />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Viral Potential Detection</span>
                      <span>91.3%</span>
                    </div>
                    <Progress value={91.3} />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Hashtag Effectiveness</span>
                      <span>87.8%</span>
                    </div>
                    <Progress value={87.8} />
                  </div>
                </div>

                <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium">Last Model Update</div>
                  <div className="text-xs text-muted-foreground">
                    2 hours ago
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    +2.3% accuracy improvement
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
