"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLocale } from "@/lib/i18n/context";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  MessageSquare,
  User,
  Clock,
  TrendingUp,
  Settings,
  BarChart3,
  Eye,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

interface ContextStats {
  totalConversations: number;
  averageSessionLength: number;
  topTopics: Array<{ topic: string; count: number }>;
  satisfactionRate: number;
  learningInsights: number;
  behaviorPatterns: number;
  memoryUsage: {
    sessions: number;
    conversations: number;
    insights: number;
    patterns: number;
  };
}

interface ConversationEntry {
  id: string;
  timestamp: Date;
  userQuery: string;
  assistantResponse: string;
  confidence: number;
  queryType: string;
  responseTime: number;
}

interface UserProfile {
  userId: string;
  expertiseLevel: "beginner" | "intermediate" | "advanced" | "expert";
  communicationStyle: "concise" | "detailed" | "visual" | "technical";
  businessFocus: string[];
  preferredAnalysisDepth: "basic" | "detailed" | "comprehensive";
  timezone: string;
  language: string;
}

export default function ContextAwareDemo() {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [userId, setUserId] = useState("demo_user_" + Date.now());
  const [userRole, setUserRole] = useState("analyst");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [conversationHistory, setConversationHistory] = useState<
    ConversationEntry[]
  >([]);
  const [contextStats, setContextStats] = useState<ContextStats | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Demo user preferences
  const [expertiseLevel, setExpertiseLevel] = useState<
    "beginner" | "intermediate" | "advanced" | "expert"
  >("intermediate");
  const [communicationStyle, setCommunicationStyle] = useState<
    "concise" | "detailed" | "visual" | "technical"
  >("detailed");
  const [businessFocus, setBusinessFocus] = useState(["sales", "marketing"]);

  useEffect(() => {
    // Generate session ID on component mount
    setSessionId(
      `demo_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    );
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load user profile and context stats
      // This would normally call the context-aware assistant API
      console.log("Loading initial context data for user:", userId);
    } catch (error) {
      console.error("Failed to load initial data:", error);
    }
  };

  const handleQuerySubmit = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    const startTime = Date.now();

    try {
      // Simulate context-aware assistant call
      const mockResponse = {
        answer: `Based on your ${communicationStyle} communication preference and ${expertiseLevel} expertise level, I understand you're asking about "${query}". 

This appears to be a ${detectQueryType(query)} query related to your focus areas: ${businessFocus.join(", ")}.

Since this is a demo, I'm providing a simulated response that shows how the context-aware assistant would personalize its answer based on:
- Your conversation history (${conversationHistory.length} previous interactions)
- Your business focus areas
- Your preferred communication style
- Your expertise level

In a real implementation, this would leverage your complete conversation context, user profile, and behavioral patterns to provide highly personalized and relevant responses.`,
        sources: ["demo_data", "context_memory"],
        confidence: 0.85,
        personalizedContext: {
          userProfile: {
            userId,
            expertiseLevel,
            communicationStyle,
            businessFocus,
            preferredAnalysisDepth: "detailed",
            timezone: "UTC",
            language: "en",
          },
          relevantHistory: conversationHistory.slice(-3),
          recommendations: [
            "Based on your previous queries, you might want to explore performance metrics",
            "Consider creating a dashboard for your key business areas",
            "Would you like to set up automated insights for your focus areas?",
          ],
          predictedNeeds: [
            "Performance optimization analysis",
            "Trend analysis for business metrics",
            "Comparative analysis tools",
          ],
        },
        sessionContext: {
          sessionId,
          userId,
          startTime: new Date(),
          lastActivity: new Date(),
          activeTopics: extractTopics(query),
          contextSummary: `Demo session with ${conversationHistory.length} interactions focusing on ${businessFocus.join(", ")}`,
        },
        learningInsights: [
          `User prefers ${communicationStyle} responses`,
          `Frequently asks about ${businessFocus.join(" and ")} topics`,
          `Demonstrates ${expertiseLevel} level expertise`,
        ],
        executionTime: Date.now() - startTime,
      };

      setResponse(mockResponse);

      // Add to conversation history
      const newEntry: ConversationEntry = {
        id: `entry_${Date.now()}`,
        timestamp: new Date(),
        userQuery: query,
        assistantResponse: mockResponse.answer,
        confidence: mockResponse.confidence,
        queryType: detectQueryType(query),
        responseTime: mockResponse.executionTime,
      };

      setConversationHistory(prev => [...prev, newEntry]);

      // Update context stats
      setContextStats(prev => ({
        totalConversations: (prev?.totalConversations || 0) + 1,
        averageSessionLength: 5.2,
        topTopics: updateTopTopics(prev?.topTopics || [], extractTopics(query)),
        satisfactionRate: 0.89,
        learningInsights:
          (prev?.learningInsights || 0) + mockResponse.learningInsights.length,
        behaviorPatterns: (prev?.behaviorPatterns || 0) + 1,
        memoryUsage: {
          sessions: 1,
          conversations: (prev?.memoryUsage?.conversations || 0) + 1,
          insights:
            (prev?.memoryUsage?.insights || 0) +
            mockResponse.learningInsights.length,
          patterns: (prev?.memoryUsage?.patterns || 0) + 1,
        },
      }));

      setQuery("");
    } catch (error) {
      console.error("Failed to get response:", error);
      setResponse({
        answer:
          "Sorry, there was an error processing your request. This is a demo environment.",
        sources: [],
        confidence: 0.3,
        executionTime: Date.now() - startTime,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserPreferences = async () => {
    try {
      // Simulate updating user preferences
      const updatedProfile: UserProfile = {
        userId,
        expertiseLevel,
        communicationStyle,
        businessFocus,
        preferredAnalysisDepth: "detailed",
        timezone: "UTC",
        language: "en",
      };

      setUserProfile(updatedProfile);
      console.log("Updated user preferences:", updatedProfile);
    } catch (error) {
      console.error("Failed to update preferences:", error);
    }
  };

  const clearSession = () => {
    setConversationHistory([]);
    setResponse(null);
    setSessionId(
      `demo_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    );
    setContextStats(null);
  };

  // Helper functions
  const detectQueryType = (query: string): string => {
    const complexIndicators = [
      "analyze",
      "compare",
      "optimize",
      "predict",
      "why",
      "how",
    ];
    const hasComplexIndicators = complexIndicators.some(indicator =>
      query.toLowerCase().includes(indicator)
    );
    return hasComplexIndicators ? "complex" : "simple";
  };

  const extractTopics = (query: string): string[] => {
    const businessTopics = [
      "sales",
      "revenue",
      "customers",
      "marketing",
      "performance",
      "analytics",
    ];
    return businessTopics.filter(topic => query.toLowerCase().includes(topic));
  };

  const updateTopTopics = (
    currentTopics: Array<{ topic: string; count: number }>,
    newTopics: string[]
  ) => {
    const topicMap = new Map(currentTopics.map(t => [t.topic, t.count]));

    newTopics.forEach(topic => {
      topicMap.set(topic, (topicMap.get(topic) || 0) + 1);
    });

    return Array.from(topicMap.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Context-Aware AI Assistant Demo
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience how AI context retention and memory systems enhance
            conversation quality, personalization, and user experience through
            intelligent conversation history and user profiling.
          </p>
        </div>

        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat Interface
            </TabsTrigger>
            <TabsTrigger value="context" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Context View
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-6">
            {/* Chat Interface */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Context-Aware Conversation
                </CardTitle>
                <CardDescription>
                  Chat with the AI assistant that remembers your preferences and
                  conversation history
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Query Input */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder={t("placeholders.businessQuestion")}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="flex-1"
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleQuerySubmit();
                      }
                    }}
                  />
                  <NormalButton
                    onClick={handleQuerySubmit}
                    disabled={isLoading || !query.trim()}
                    className="px-6"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      "Ask"
                    )}
                  </NormalButton>
                </div>

                {/* Response Display */}
                {response && (
                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <Brain className="h-3 w-3" />
                            Context-Aware Response
                          </Badge>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            {response.executionTime}ms
                          </div>
                        </div>

                        <div className="prose max-w-none">
                          <p className="text-gray-800 whitespace-pre-wrap">
                            {response.answer}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">
                              Confidence & Sources
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={response.confidence * 100}
                                  className="flex-1"
                                />
                                <span className="text-sm font-medium">
                                  {Math.round(response.confidence * 100)}%
                                </span>
                              </div>
                              <div className="flex gap-1">
                                {response.sources.map(
                                  (source: string, index: number) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {source}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          </div>

                          {response.personalizedContext?.recommendations && (
                            <div>
                              <h4 className="font-medium text-sm text-gray-700 mb-2">
                                Personalized Recommendations
                              </h4>
                              <div className="space-y-1">
                                {response.personalizedContext.recommendations
                                  .slice(0, 2)
                                  .map((rec: string, index: number) => (
                                    <div
                                      key={index}
                                      className="text-xs text-gray-600 flex items-start gap-1"
                                    >
                                      <TrendingUp className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
                                      {rec}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Conversation History */}
                {conversationHistory.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Conversation History
                      </CardTitle>
                      <div className="flex justify-between items-center">
                        <CardDescription>
                          {conversationHistory.length} interactions in this
                          session
                        </CardDescription>
                        <NormalButton
                          variant="outline"
                          size="sm"
                          onClick={clearSession}
                        >
                          Clear Session
                        </NormalButton>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {conversationHistory.slice(-5).map(entry => (
                          <div
                            key={entry.id}
                            className="border rounded-lg p-3 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">{entry.queryType}</Badge>
                              <span className="text-xs text-gray-500">
                                {entry.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="text-sm">
                              <p className="font-medium text-gray-700">
                                Q: {entry.userQuery}
                              </p>
                              <p className="text-gray-600 mt-1">
                                A: {entry.assistantResponse.slice(0, 100)}...
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>
                                Confidence: {Math.round(entry.confidence * 100)}
                                %
                              </span>
                              <span>•</span>
                              <span>Response: {entry.responseTime}ms</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="context" className="space-y-6">
            {/* Context Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    User Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-600">User ID:</span>
                    <span className="font-mono text-xs">{userId}</span>
                    <span className="text-gray-600">Session ID:</span>
                    <span className="font-mono text-xs">
                      {sessionId.slice(0, 20)}...
                    </span>
                    <span className="text-gray-600">Role:</span>
                    <span>{userRole}</span>
                    <span className="text-gray-600">Expertise:</span>
                    <Badge variant="secondary">{expertiseLevel}</Badge>
                    <span className="text-gray-600">Style:</span>
                    <Badge variant="secondary">{communicationStyle}</Badge>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">
                      Business Focus:
                    </span>
                    <div className="flex gap-1 mt-1">
                      {businessFocus.map((focus, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {focus}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Context Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {response?.learningInsights ? (
                    <div className="space-y-2">
                      {response.learningInsights.map(
                        (insight: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 text-sm"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{insight}</span>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>Start a conversation to see learning insights</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Session Context */}
            {response?.sessionContext && (
              <Card>
                <CardHeader>
                  <CardTitle>Session Context</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Active Topics:</span>
                      <div className="flex gap-1 mt-1">
                        {response.sessionContext.activeTopics?.map(
                          (topic: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {topic}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Session Duration:</span>
                      <p className="font-medium">
                        {Math.round(
                          (new Date().getTime() -
                            new Date(
                              response.sessionContext.startTime
                            ).getTime()) /
                            1000 /
                            60
                        )}{" "}
                        minutes
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Context Summary:</span>
                      <p className="text-xs mt-1">
                        {response.sessionContext.contextSummary}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Context Statistics */}
            {contextStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Conversation Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Total Conversations:
                      </span>
                      <span className="font-bold">
                        {contextStats.totalConversations}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Session Length:</span>
                      <span className="font-bold">
                        {contextStats.averageSessionLength} min
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Satisfaction Rate:</span>
                      <span className="font-bold">
                        {Math.round(contextStats.satisfactionRate * 100)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Memory Usage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sessions:</span>
                      <span className="font-bold">
                        {contextStats.memoryUsage.sessions}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conversations:</span>
                      <span className="font-bold">
                        {contextStats.memoryUsage.conversations}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Insights:</span>
                      <span className="font-bold">
                        {contextStats.memoryUsage.insights}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Patterns:</span>
                      <span className="font-bold">
                        {contextStats.memoryUsage.patterns}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Topics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {contextStats.topTopics.map((topic, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <span className="text-gray-600 capitalize">
                          {topic.topic}
                        </span>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={
                              (topic.count /
                                Math.max(
                                  ...contextStats.topTopics.map(t => t.count)
                                )) *
                              100
                            }
                            className="w-16 h-2"
                          />
                          <span className="font-bold text-sm w-6">
                            {topic.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {/* User Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>User Preferences</CardTitle>
                <CardDescription>
                  Customize your AI assistant experience. Changes affect how the
                  assistant personalizes responses.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">
                      Expertise Level
                    </label>
                    <select
                      value={expertiseLevel}
                      onChange={e => setExpertiseLevel(e.target.value as any)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">
                      Communication Style
                    </label>
                    <select
                      value={communicationStyle}
                      onChange={e =>
                        setCommunicationStyle(e.target.value as any)
                      }
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="concise">Concise</option>
                      <option value="detailed">Detailed</option>
                      <option value="visual">Visual</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Business Focus Areas
                  </label>
                  <Input
                    value={businessFocus.join(", ")}
                    onChange={e =>
                      setBusinessFocus(
                        e.target.value.split(", ").filter(Boolean)
                      )
                    }
                    placeholder={t("placeholders.businessFocus")}
                  />
                  <p className="text-xs text-gray-500">
                    Separate multiple areas with commas
                  </p>
                </div>

                <NormalButton
                  onClick={updateUserPreferences}
                  className="w-full"
                >
                  Update Preferences
                </NormalButton>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
