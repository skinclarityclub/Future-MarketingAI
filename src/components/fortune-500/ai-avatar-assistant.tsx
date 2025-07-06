"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Bot,
  Mic,
  MicOff,
  Send,
  Minimize2,
  Volume2,
  VolumeX,
  Zap,
  AlertTriangle,
  CheckCircle,
  Activity,
} from "lucide-react";

interface AIMessage {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  priority?: "low" | "medium" | "high" | "critical";
}

interface AIAvatarAssistantProps {
  className?: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  realTimeData?: {
    systemHealth: "operational" | "warning" | "critical";
    activeAlerts: number;
    performanceMetrics: {
      cpu: number;
      memory: number;
      network: number;
    };
    roiMetrics?: {
      totalRevenue: number;
      marketingSpend: number;
      roi: number;
      conversionRate: number;
    };
    dataSources?: Array<{
      id: string;
      name: string;
      status: "connected" | "connecting" | "disconnected" | "error";
      lastUpdate: Date;
      data: any;
    }>;
  };
  contextualData?: {
    currentPage?: string;
    activeWorkflows?: string[];
    recentActions?: string[];
    userRole?: "admin" | "manager" | "analyst" | "viewer";
    securityLevel?: "high" | "medium" | "low";
  };
}

export default function AIAvatarAssistant({
  className,
  isMinimized = false,
  onToggleMinimize,
  realTimeData = {
    systemHealth: "operational",
    activeAlerts: 0,
    performanceMetrics: { cpu: 45, memory: 62, network: 78 },
  },
  contextualData = {
    currentPage: "Fortune 500 Command Center",
    activeWorkflows: [],
    recentActions: [],
    userRole: "manager",
    securityLevel: "high",
  },
}: AIAvatarAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [avatarState, setAvatarState] = useState<
    "idle" | "listening" | "thinking" | "speaking"
  >("idle");
  const [isGeneratingExecutiveSummary, setIsGeneratingExecutiveSummary] =
    useState(false);

  // 🧠 INTELLIGENT: Initialize with contextual welcome and executive summary
  useEffect(() => {
    initializeIntelligentSession();
  }, [realTimeData, contextualData]);

  const initializeIntelligentSession = () => {
    const contextualWelcome = generateContextualWelcome();
    const systemStatus = generateSystemStatusSummary();
    const executiveSummary = generateExecutiveSummary();

    setMessages([
      {
        id: "welcome",
        type: "assistant",
        content: contextualWelcome,
        timestamp: new Date(),
        priority: "medium",
      },
      {
        id: "system-status",
        type: "system",
        content: systemStatus,
        timestamp: new Date(),
        priority: "high",
      },
      {
        id: "executive-summary",
        type: "assistant",
        content: executiveSummary,
        timestamp: new Date(),
        priority: "high",
      },
    ]);
  };

  // 🧠 CONTEXTUAL: Generate intelligent welcome based on user data
  const generateContextualWelcome = (): string => {
    const { userRole, currentPage } = contextualData;
    const timeOfDay =
      new Date().getHours() < 12
        ? "morning"
        : new Date().getHours() < 17
          ? "afternoon"
          : "evening";

    const roleBasedGreeting = {
      admin: `Good ${timeOfDay}! All enterprise systems are secure and operating optimally.`,
      manager: `Good ${timeOfDay}! Your team's performance metrics are strong across all KPIs.`,
      analyst: `Good ${timeOfDay}! Latest data insights show promising trends in your key metrics.`,
      viewer: `Good ${timeOfDay}! Welcome to your personalized Fortune 500 dashboard overview.`,
    };

    return (
      roleBasedGreeting[userRole || "manager"] || roleBasedGreeting.manager
    );
  };

  // 🧠 SYSTEM HEALTH: Intelligent system status with error handling
  const generateSystemStatusSummary = (): string => {
    if (!realTimeData) {
      return "⚠️ Real-time data connection lost. Operating in offline mode with cached data.";
    }

    const { systemHealth, performanceMetrics, dataSources } = realTimeData;

    if (systemHealth === "critical") {
      return `🚨 CRITICAL: System requires immediate attention. CPU: ${performanceMetrics.cpu}%, Memory: ${performanceMetrics.memory}%`;
    }

    if (systemHealth === "warning") {
      return `⚠️ WARNING: Performance degradation detected. Monitoring ${realTimeData.activeAlerts} active alerts.`;
    }

    const connectedSources =
      dataSources?.filter(ds => ds.status === "connected").length || 0;
    const totalSources = dataSources?.length || 0;

    return `🟢 OPERATIONAL: All systems normal. ${connectedSources}/${totalSources} data sources connected. CPU: ${performanceMetrics.cpu}%, Memory: ${performanceMetrics.memory}%, Network: ${performanceMetrics.network}%`;
  };

  // 🧠 EXECUTIVE: Generate intelligent executive summary
  const generateExecutiveSummary = (): string => {
    if (!realTimeData?.roiMetrics) {
      return "📊 EXECUTIVE SUMMARY: Gathering financial performance data...";
    }

    const { roiMetrics } = realTimeData;
    const revenueFormatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(roiMetrics.totalRevenue);

    const spendFormatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(roiMetrics.marketingSpend);

    const roiStatus =
      roiMetrics.roi >= 20
        ? "🚀 EXCEEDING"
        : roiMetrics.roi >= 15
          ? "✅ MEETING"
          : "⚠️ BELOW";

    return `📈 EXECUTIVE SUMMARY: ${roiStatus} targets with ${roiMetrics.roi.toFixed(1)}% ROI. Revenue: ${revenueFormatted}, Marketing Spend: ${spendFormatted}, Conversion: ${roiMetrics.conversionRate.toFixed(1)}%. ${getIntelligentRecommendation(roiMetrics)}`;
  };

  // 🧠 RECOMMENDATIONS: Intelligent recommendations based on data
  const getIntelligentRecommendation = (
    roi: typeof realTimeData.roiMetrics
  ): string => {
    if (!roi) return "";

    if (roi.roi >= 25) {
      return "Recommendation: Scale successful campaigns and allocate additional budget.";
    } else if (roi.roi >= 15) {
      return "Recommendation: Optimize current campaigns and test new acquisition channels.";
    } else {
      return "Recommendation: Immediate campaign review and budget reallocation required.";
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setAvatarState("thinking");

    setTimeout(() => {
      const aiResponse: AIMessage = {
        id: Date.now().toString(),
        type: "assistant",
        content: "I'm analyzing your request with real-time data...",
        timestamp: new Date(),
        priority: "medium",
      };
      setMessages(prev => [...prev, aiResponse]);
      setAvatarState("idle");
    }, 1500);
  };

  if (isMinimized) {
    return (
      <motion.div
        className={cn("fixed bottom-4 right-4 z-50", className)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        <NormalButton
          onClick={onToggleMinimize}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
        >
          <Bot className="w-8 h-8 text-white" />
        </NormalButton>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn("w-96 h-[600px] fixed bottom-4 right-4 z-50", className)}
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
    >
      <Card className="h-full bg-gradient-to-br from-slate-900/95 to-purple-900/80 backdrop-blur-xl border border-purple-500/30">
        <CardHeader className="border-b border-purple-500/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="relative w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center"
                animate={{
                  scale: avatarState === "thinking" ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  duration: 0.5,
                  repeat: avatarState === "thinking" ? Infinity : 0,
                }}
              >
                <Bot className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h3 className="font-bold text-white">AI Assistant</h3>
                <p className="text-xs text-purple-300">{avatarState}</p>
              </div>
            </div>
            <NormalButton
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
              className="text-purple-300"
            >
              <Minimize2 size={16} />
            </NormalButton>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map(message => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.type === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] p-3 rounded-lg text-sm",
                  message.type === "user"
                    ? "bg-purple-600 text-white"
                    : "bg-slate-800 text-slate-200"
                )}
              >
                <p>{message.content}</p>
              </div>
            </div>
          ))}
        </CardContent>

        <div className="p-4 border-t border-purple-500/20">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={e => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask about system status..."
              className="bg-slate-800 border-slate-600 text-white"
            />
            <NormalButton onClick={handleSendMessage} className="bg-purple-600">
              <Send size={16} />
            </NormalButton>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
