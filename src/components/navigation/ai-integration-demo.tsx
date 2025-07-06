"use client";

/**
 * AI Components Integration Demo
 * Task 13.3: Integrate with Existing AI Components
 *
 * Demo component showcasing the integration between all AI components
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  Mic,
  Navigation,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle,
  Send,
  Settings,
  Activity,
  Brain,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

interface IntegrationStatus {
  components: {
    navigation: boolean;
    security: boolean;
    nlp: boolean;
    voice: boolean;
  };
  activeContexts: number;
}

export function AIIntegrationDemo() {
  const [input, setInput] = useState("");
  const [requestType, setRequestType] = useState<
    "text" | "voice" | "navigation" | "recommendation"
  >("text");
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>(
    {
      components: {
        navigation: true,
        security: true,
        nlp: true,
        voice: true,
      },
      activeContexts: 3,
    }
  );

  // Mock AI integration processing
  const processAIRequest = async (
    type: string,
    input: string
  ): Promise<AIResponse> => {
    await new Promise(resolve =>
      setTimeout(resolve, 800 + Math.random() * 1200)
    );

    const mockResponses: Record<string, AIResponse> = {
      text: {
        type: "assistant",
        success: true,
        data: {
          response: `Processed text request: "${input}"`,
          intent: "general_query",
          confidence: 0.85,
        },
        suggestions: [
          "Ask about navigation",
          "Get help with features",
          "View recommendations",
        ],
        metadata: {
          confidence: 0.85,
          responseTime: 1200,
          source: "nlp_processor",
        },
      },
      voice: {
        type: "assistant",
        success: true,
        data: {
          response: `Voice command processed: "${input}"`,
          transcription: input,
          confidence: 0.92,
        },
        suggestions: [
          "Try navigation commands",
          "Ask for help",
          "Explore voice features",
        ],
        metadata: {
          confidence: 0.92,
          responseTime: 950,
          source: "voice_processor",
        },
      },
      navigation: {
        type: "navigation",
        success: true,
        data: {
          targetPage: "/analytics",
          navigationPath: ["Dashboard", "Analytics"],
          pageData: {
            title: "Analytics Dashboard",
            description: "View your data insights",
          },
        },
        suggestions: ["View customer data", "Export reports", "Set up alerts"],
        metadata: {
          confidence: 0.95,
          responseTime: 650,
          source: "secure_navigation",
        },
      },
      recommendation: {
        type: "recommendation",
        success: true,
        data: {
          recommendations: [
            {
              title: "Customer Analytics",
              description: "View customer insights",
              confidence: 0.9,
            },
            {
              title: "Revenue Reports",
              description: "Generate revenue analysis",
              confidence: 0.8,
            },
            {
              title: "Performance Metrics",
              description: "Check system performance",
              confidence: 0.7,
            },
          ],
        },
        suggestions: ["Explore analytics", "Generate reports", "View metrics"],
        metadata: {
          confidence: 0.78,
          responseTime: 750,
          source: "recommendation_engine",
        },
      },
    };

    return mockResponses[type] || mockResponses.text;
  };

  const handleSubmit = async () => {
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await processAIRequest(requestType, input.trim());
      setResponses(prev => [response, ...prev]);
      setInput("");
    } catch (error) {
      console.error("AI request failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "navigation":
        return <Navigation className="h-4 w-4" />;
      case "assistant":
        return <Bot className="h-4 w-4" />;
      case "recommendation":
        return <Brain className="h-4 w-4" />;
      case "security":
        return <Shield className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "navigation":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "assistant":
        return "bg-green-50 text-green-700 border-green-200";
      case "recommendation":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "security":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const exampleRequests = {
    text: [
      "What are the latest sales trends?",
      "Help me understand customer behavior",
      "Show me performance metrics",
    ],
    voice: [
      "Navigate to customer dashboard",
      "Show me revenue analytics",
      "Open settings page",
    ],
    navigation: [
      "Go to analytics dashboard",
      "Show customer insights",
      "Navigate to reports section",
    ],
    recommendation: [
      "What should I focus on today?",
      "Suggest relevant dashboards",
      "Recommend next actions",
    ],
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-indigo-600" />
            AI Components Integration Demo
          </CardTitle>
          <p className="text-gray-600">
            Test the seamless integration between AI Navigation, Security, NLP,
            and Assistant components
          </p>
        </CardHeader>
      </Card>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(integrationStatus.components).map(
              ([component, status]) => (
                <div key={component} className="flex items-center gap-2">
                  {status ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm capitalize">{component}</span>
                </div>
              )
            )}
          </div>
          <Separator className="my-4" />
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Active Contexts: {integrationStatus.activeContexts}</span>
            <span>•</span>
            <span>All Components: Online</span>
            <span>•</span>
            <span>Security: Enabled</span>
          </div>
        </CardContent>
      </Card>

      {/* Request Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Test AI Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Request Type Selection */}
          <div className="flex flex-wrap gap-2">
            {(["text", "voice", "navigation", "recommendation"] as const).map(
              type => (
                <NormalButton
                  key={type}
                  variant={requestType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRequestType(type)}
                  className="capitalize"
                >
                  {getTypeIcon(type)}
                  <span className="ml-2">{type}</span>
                </NormalButton>
              )
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`Enter ${requestType} request...`}
              onKeyPress={e => e.key === "Enter" && handleSubmit()}
              disabled={isProcessing}
            />
            <NormalButton
              onClick={handleSubmit}
              disabled={isProcessing || !input.trim()}
            >
              {isProcessing ? (
                <Activity className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </NormalButton>
          </div>

          {/* Example Requests */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Example {requestType} requests:
            </p>
            <div className="flex flex-wrap gap-2">
              {exampleRequests[requestType].map((example, index) => (
                <NormalButton
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(example)}
                  className="text-xs"
                >
                  {example}
                </NormalButton>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            AI Responses ({responses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {responses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No responses yet. Try submitting a request above.
            </div>
          ) : (
            <div className="space-y-4">
              {responses.map((response, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={cn(
                            "flex items-center gap-1",
                            getTypeColor(response.type)
                          )}
                        >
                          {getTypeIcon(response.type)}
                          {response.type}
                        </Badge>
                        {response.success ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {response.metadata?.responseTime}ms •{" "}
                        {response.metadata?.source}
                      </div>
                    </div>

                    {/* Response Data */}
                    <div className="space-y-3">
                      {response.data && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                            {JSON.stringify(response.data, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Suggestions */}
                      {response.suggestions &&
                        response.suggestions.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Suggestions:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {response.suggestions.map((suggestion, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {suggestion}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Metadata */}
                      {response.metadata && (
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            Confidence:{" "}
                            {(response.metadata.confidence * 100).toFixed(1)}%
                          </span>
                          <span>•</span>
                          <span>Source: {response.metadata.source}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Architecture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Integration Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Component Flow</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-gray-400" />
                  <span>Request → Security Validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-gray-400" />
                  <span>NLP Processing → Intent Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-gray-400" />
                  <span>Route to Appropriate Component</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-gray-400" />
                  <span>Cross-Component Enhancement</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-gray-400" />
                  <span>Response with Suggestions</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Key Features</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Unified AI request processing</li>
                <li>• Security-aware component routing</li>
                <li>• Cross-component suggestion enhancement</li>
                <li>• Performance monitoring and optimization</li>
                <li>• Contextual recommendation generation</li>
                <li>• Voice and text input support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
