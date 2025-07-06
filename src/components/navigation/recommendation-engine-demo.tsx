"use client";

/**
 * Recommendation Engine Demo Component
 * Demonstrates the AI-powered recommendation engine functionality
 * Task 13.2: Implement Recommendation Engine - Integration Demo
 */

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Users,
  Target,
  Zap,
  TrendingUp,
  Clock,
  Star,
  Activity,
  Settings,
} from "lucide-react";

interface RecommendationDemo {
  id: string;
  algorithm: "collaborative" | "content_based" | "hybrid";
  confidence: number;
  title: string;
  description: string;
  reasoning: string[];
  score: number;
}

export function RecommendationEngineDemo() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationDemo[]>(
    []
  );

  const generateDemoRecommendations = async () => {
    setIsGenerating(true);

    // Simulate recommendation generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const demoRecommendations: RecommendationDemo[] = [
      {
        id: "rec-1",
        algorithm: "hybrid",
        confidence: 0.87,
        title: "Revenue Analytics Dashboard",
        description:
          "Based on your analysis patterns and similar users who viewed customer data",
        reasoning: [
          "Similar users also analyzed revenue trends",
          "Content similarity to your recent activity",
          "High conversion probability",
        ],
        score: 0.87,
      },
      {
        id: "rec-2",
        algorithm: "collaborative",
        confidence: 0.73,
        title: "Customer Intelligence Reports",
        description:
          "Users with similar behavior patterns frequently visit this page after customer analysis",
        reasoning: [
          "Collaborative filtering match",
          "Behavioral pattern similarity",
          "Sequential navigation analysis",
        ],
        score: 0.73,
      },
      {
        id: "rec-3",
        algorithm: "content_based",
        confidence: 0.68,
        title: "Advanced Analytics Tools",
        description:
          "Content features match your interaction history and preferences",
        reasoning: [
          "Content feature similarity",
          "Category preference match",
          "Complexity level appropriate",
        ],
        score: 0.68,
      },
    ];

    setRecommendations(demoRecommendations);
    setIsGenerating(false);
  };

  const algorithmIcons = {
    collaborative: Users,
    content_based: Target,
    hybrid: Brain,
  };

  const algorithmColors = {
    collaborative: "bg-blue-100 text-blue-800",
    content_based: "bg-green-100 text-green-800",
    hybrid: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recommendation Engine Demo</h2>
          <p className="text-gray-600">
            Collaborative & Content-Based Filtering Implementation
          </p>
        </div>
        <NormalButton
          onClick={generateDemoRecommendations}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Activity className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Generate Recommendations
            </>
          )}
        </NormalButton>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="algorithms">Algorithms</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Recommendation Engine Architecture
              </CardTitle>
              <CardDescription>
                Multi-algorithm approach combining collaborative filtering,
                content-based filtering, and hybrid methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Users className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                  <h3 className="font-semibold">Collaborative Filtering</h3>
                  <p className="text-sm text-gray-600">
                    Finds users with similar behavior patterns
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Target className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <h3 className="font-semibold">Content-Based</h3>
                  <p className="text-sm text-gray-600">
                    Analyzes content features and user preferences
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Zap className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                  <h3 className="font-semibold">Hybrid Approach</h3>
                  <p className="text-sm text-gray-600">
                    Combines multiple algorithms for optimal results
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="algorithms" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Collaborative Filtering
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>User Similarity Threshold</span>
                    <span>0.3</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Max Similar Users</span>
                    <span>50</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Decay Factor</span>
                    <span>0.95</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Content-Based Filtering
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Category Weight</span>
                    <span>30%</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Data Types Weight</span>
                    <span>25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Business Function Weight</span>
                    <span>25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No recommendations generated yet
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Click "Generate Recommendations" to see the engine in action
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recommendations.map(rec => {
                const Icon = algorithmIcons[rec.algorithm];
                return (
                  <Card
                    key={rec.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-blue-600" />
                          <CardTitle className="text-lg">{rec.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">
                            {Math.round(rec.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                      <CardDescription>{rec.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Badge className={algorithmColors[rec.algorithm]}>
                            {rec.algorithm.replace("_", " ")}
                          </Badge>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Reasoning:
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {rec.reasoning.map((reason, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <span className="text-blue-500 mt-1">•</span>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <TrendingUp className="h-4 w-4" />
                            <span>Score: {rec.score.toFixed(2)}</span>
                          </div>
                          <NormalButton size="sm" variant="outline">
                            View Details
                          </NormalButton>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Processing Time</span>
                </div>
                <div className="text-2xl font-bold mt-2">42ms</div>
                <div className="text-sm text-gray-500">
                  Average response time
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">User Similarities</span>
                </div>
                <div className="text-2xl font-bold mt-2">247</div>
                <div className="text-sm text-gray-500">
                  Active user patterns
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Content Features</span>
                </div>
                <div className="text-2xl font-bold mt-2">156</div>
                <div className="text-sm text-gray-500">
                  Page characteristics
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Accuracy</span>
                </div>
                <div className="text-2xl font-bold mt-2">84%</div>
                <div className="text-sm text-gray-500">Prediction accuracy</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Algorithm Performance
              </CardTitle>
              <CardDescription>
                Comparative performance of different recommendation approaches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Collaborative Filtering</span>
                    <span>78% accuracy</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Content-Based Filtering</span>
                    <span>71% accuracy</span>
                  </div>
                  <Progress value={71} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Hybrid Approach</span>
                    <span>84% accuracy</span>
                  </div>
                  <Progress value={84} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RecommendationEngineDemo;
