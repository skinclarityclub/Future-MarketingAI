"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RefreshCw,
  Zap,
  Brain,
  Target,
  BarChart3,
  Rocket,
  Users,
  Calendar,
  Share2,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Bot,
  Image,
  FileText,
  Send,
  Eye,
  Heart,
  Share,
  Repeat2,
  Settings,
  Database,
  Globe,
  Layers,
  Filter,
  Monitor,
  Smartphone,
} from "lucide-react";

interface MarketingMachineShowcaseProps {
  variant?: "full" | "compact" | "pipeline-only";
  autoPlay?: boolean;
  showControls?: boolean;
  onInteraction?: (type: string, data: any) => void;
  className?: string;
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: "pending" | "active" | "completed";
  duration: number;
  substeps?: string[];
}

interface ContentExample {
  id: string;
  platform: string;
  type: "post" | "article" | "video" | "email";
  content: string;
  metrics: {
    views: number;
    engagement: number;
    conversion: number;
  };
  generated: boolean;
}

interface AiMessage {
  id: string;
  type: "user" | "ai";
  message: string;
  timestamp: Date;
  action?: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: "research",
    title: "Market Research",
    description: "AI analyzes market trends and competitor content",
    icon: <Target className="w-5 h-5" />,
    status: "pending",
    duration: 3000,
    substeps: [
      "Scanning 500+ competitor posts",
      "Analyzing engagement patterns",
      "Identifying trending topics",
      "Extracting key insights",
    ],
  },
  {
    id: "ideation",
    title: "Content Ideation",
    description: "Generate content ideas based on research insights",
    icon: <Brain className="w-5 h-5" />,
    status: "pending",
    duration: 4000,
    substeps: [
      "Processing market insights",
      "Generating content concepts",
      "Optimizing for engagement",
      "Creating content calendar",
    ],
  },
  {
    id: "creation",
    title: "Content Creation",
    description: "AI creates optimized content for multiple platforms",
    icon: <FileText className="w-5 h-5" />,
    status: "pending",
    duration: 5000,
    substeps: [
      "Writing platform-specific copy",
      "Generating visual concepts",
      "Creating video scripts",
      "Optimizing for algorithms",
    ],
  },
  {
    id: "review",
    title: "Quality Review",
    description: "AI reviews and optimizes content for performance",
    icon: <CheckCircle className="w-5 h-5" />,
    status: "pending",
    duration: 2000,
    substeps: [
      "Checking brand consistency",
      "Optimizing for SEO",
      "Ensuring compliance",
      "Final quality check",
    ],
  },
  {
    id: "schedule",
    title: "Smart Scheduling",
    description: "Schedule content for optimal engagement times",
    icon: <Calendar className="w-5 h-5" />,
    status: "pending",
    duration: 2000,
    substeps: [
      "Analyzing audience activity",
      "Finding optimal time slots",
      "Coordinating cross-platform",
      "Setting up automation",
    ],
  },
  {
    id: "publish",
    title: "Multi-Platform Publishing",
    description: "Automatically publish to all connected platforms",
    icon: <Send className="w-5 h-5" />,
    status: "pending",
    duration: 3000,
    substeps: [
      "Publishing to LinkedIn",
      "Posting to Twitter/X",
      "Updating Facebook page",
      "Sending email campaign",
    ],
  },
  {
    id: "analyze",
    title: "Performance Analysis",
    description: "Track and analyze content performance in real-time",
    icon: <BarChart3 className="w-5 h-5" />,
    status: "pending",
    duration: 4000,
    substeps: [
      "Collecting engagement data",
      "Analyzing conversion rates",
      "Tracking ROI metrics",
      "Generating insights",
    ],
  },
];

const CONTENT_EXAMPLES: ContentExample[] = [
  {
    id: "1",
    platform: "LinkedIn",
    type: "post",
    content:
      "Struggling with content creation bottlenecks? Our latest case study shows how TechFlow Solutions automated their content workflow and increased productivity by 340%. The secret? AI-driven content generation that maintains brand voice while scaling to 50+ pieces per week. 🚀 #MarketingAutomation #ContentStrategy",
    metrics: { views: 12500, engagement: 8.7, conversion: 3.2 },
    generated: true,
  },
  {
    id: "2",
    platform: "Twitter/X",
    type: "post",
    content:
      "🎯 Marketing teams spend 80% of time creating content, only 20% on strategy. What if we could flip that? Our Marketing Machine does exactly that - automated content creation that scales with your business. See the ROI calculator in bio 📊",
    metrics: { views: 8900, engagement: 12.3, conversion: 4.1 },
    generated: true,
  },
  {
    id: "3",
    platform: "Email",
    type: "email",
    content:
      "Subject: How [Company] Increased Content ROI by 180%\n\nHi [Name],\n\nI noticed you downloaded our content strategy guide. Here's something that might interest you...\n\nTechFlow Solutions was struggling with the same content bottlenecks you might be facing. After implementing our Marketing Machine, they:\n\n✅ Reduced content creation time by 45%\n✅ Increased engagement by 65%\n✅ Generated €12k+ in additional monthly revenue\n\nWant to see how this applies to your business? Book a 15-minute ROI assessment.",
    metrics: { views: 2400, engagement: 24.6, conversion: 8.9 },
    generated: true,
  },
];

const AI_CONVERSATION: AiMessage[] = [
  {
    id: "1",
    type: "user",
    message: "I need content for our B2B SaaS product launch",
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: "2",
    type: "ai",
    message:
      "Perfect! I'll create a comprehensive content strategy. First, let me analyze your target market and competitors...",
    timestamp: new Date(Date.now() - 280000),
    action: "research",
  },
  {
    id: "3",
    type: "ai",
    message:
      "Found 15 trending topics in your industry. Creating content calendar with 20 pieces across LinkedIn, Twitter, email, and blog posts...",
    timestamp: new Date(Date.now() - 260000),
    action: "ideation",
  },
  {
    id: "4",
    type: "ai",
    message:
      "Generated optimized content for each platform. Would you like me to schedule these for optimal engagement times?",
    timestamp: new Date(Date.now() - 240000),
    action: "schedule",
  },
  {
    id: "5",
    type: "user",
    message: "Yes, and make sure the messaging aligns with our ROI focus",
    timestamp: new Date(Date.now() - 220000),
  },
  {
    id: "6",
    type: "ai",
    message:
      "Done! All content now emphasizes ROI and measurable results. Scheduling for peak audience activity. I'll monitor performance and optimize automatically.",
    timestamp: new Date(Date.now() - 200000),
    action: "optimize",
  },
];

const PERFORMANCE_METRICS = {
  contentCreated: {
    value: 156,
    change: "+23%",
    label: "Content Pieces This Month",
  },
  timesSaved: { value: 42, change: "+15%", label: "Hours Saved Per Week" },
  engagementRate: {
    value: 8.7,
    change: "+35%",
    label: "Average Engagement Rate %",
  },
  conversionRate: {
    value: 3.2,
    change: "+48%",
    label: "Content-to-Lead Conversion %",
  },
  roiImprovement: { value: 180, change: "+80%", label: "ROI Improvement %" },
  platformsCovered: { value: 6, change: "+2", label: "Platforms Automated" },
};

// Workflow Animation Component
const WorkflowAnimation: React.FC<{
  isPlaying: boolean;
  currentStep: number;
  steps: WorkflowStep[];
  onStepComplete: (stepIndex: number) => void;
}> = ({ isPlaying, currentStep, steps, onStepComplete }) => {
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length) return;

    const timer = setTimeout(() => {
      onStepComplete(currentStep);
    }, steps[currentStep].duration);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps, onStepComplete]);

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`flex items-start space-x-4 p-4 rounded-xl border transition-all duration-500 ${
            index < currentStep
              ? "bg-green-500/10 border-green-400/30 text-green-300"
              : index === currentStep && isPlaying
                ? "bg-blue-500/10 border-blue-400/30 text-blue-300"
                : "bg-white/5 border-white/10 text-white/70"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              index < currentStep
                ? "bg-green-500"
                : index === currentStep && isPlaying
                  ? "bg-blue-500"
                  : "bg-white/10"
            }`}
          >
            {index < currentStep ? (
              <CheckCircle className="w-5 h-5 text-white" />
            ) : index === currentStep && isPlaying ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="w-5 h-5 text-white" />
              </motion.div>
            ) : (
              step.icon
            )}
          </div>

          <div className="flex-1">
            <h4 className="font-semibold mb-1">{step.title}</h4>
            <p className="text-sm opacity-80 mb-2">{step.description}</p>

            {/* Substeps for current active step */}
            {index === currentStep && isPlaying && step.substeps && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1 mt-3"
              >
                {step.substeps.map((substep, subIndex) => (
                  <motion.div
                    key={subIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: subIndex * 0.5 }}
                    className="flex items-center text-xs text-blue-300"
                  >
                    <div className="w-1 h-1 bg-blue-400 rounded-full mr-2" />
                    {substep}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Progress indicator */}
          {index === currentStep && isPlaying && (
            <div className="w-12 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-400"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: step.duration / 1000, ease: "linear" }}
              />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

// Content Generation Demo Component
const ContentGenerationDemo: React.FC<{
  examples: ContentExample[];
  currentExample: number;
}> = ({ examples, currentExample }) => {
  const example = examples[currentExample];

  if (!example) return null;

  return (
    <motion.div
      key={example.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
    >
      {/* Platform Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            {example.platform === "LinkedIn" && (
              <Users className="w-4 h-4 text-white" />
            )}
            {example.platform === "Twitter/X" && (
              <MessageSquare className="w-4 h-4 text-white" />
            )}
            {example.platform === "Email" && (
              <Send className="w-4 h-4 text-white" />
            )}
          </div>
          <div>
            <h4 className="text-white font-semibold">{example.platform}</h4>
            <p className="text-gray-400 text-xs">Auto-generated content</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 text-xs font-medium">
            AI Generated
          </span>
        </div>
      </div>

      {/* Content Preview */}
      <div className="mb-4 p-4 bg-black/20 rounded-lg border border-white/5">
        <p className="text-white text-sm leading-relaxed whitespace-pre-line">
          {example.content}
        </p>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Eye className="w-3 h-3 text-blue-400" />
            <span className="text-white font-semibold text-sm">
              {example.metrics.views.toLocaleString()}
            </span>
          </div>
          <p className="text-gray-400 text-xs">Views</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Heart className="w-3 h-3 text-pink-400" />
            <span className="text-white font-semibold text-sm">
              {example.metrics.engagement}%
            </span>
          </div>
          <p className="text-gray-400 text-xs">Engagement</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-white font-semibold text-sm">
              {example.metrics.conversion}%
            </span>
          </div>
          <p className="text-gray-400 text-xs">Conversion</p>
        </div>
      </div>
    </motion.div>
  );
};

// AI Assistant Chat Component
const AiAssistantChat: React.FC<{
  messages: AiMessage[];
  isTyping: boolean;
}> = ({ messages, isTyping }) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 h-96 flex flex-col">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="text-white font-semibold">Marketing AI Assistant</h4>
          <p className="text-gray-400 text-xs">Live conversation demo</p>
        </div>
        <div className="ml-auto">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map(message => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                message.type === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 text-gray-100"
              }`}
            >
              <p className="text-sm">{message.message}</p>
              {message.action && (
                <div className="mt-2 flex items-center space-x-1 text-xs opacity-80">
                  <Zap className="w-3 h-3" />
                  <span>Action: {message.action}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white/10 text-gray-100 p-3 rounded-2xl">
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
        <input
          type="text"
          placeholder="Ask about marketing automation..."
          className="flex-1 bg-transparent text-white placeholder-gray-400 text-sm outline-none"
          disabled
        />
        <NormalButton className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
          <Send className="w-4 h-4 text-white" />
        </NormalButton>
      </div>
    </div>
  );
};

// Performance Dashboard Component
const PerformanceDashboard: React.FC<{
  metrics: typeof PERFORMANCE_METRICS;
}> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(metrics).map(([key, metric]) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: Math.random() * 0.5 }}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="text-2xl font-bold text-white">
              {typeof metric.value === "number" && metric.value > 100
                ? metric.value.toLocaleString()
                : metric.value}
              {key === "engagementRate" ||
              key === "conversionRate" ||
              key === "roiImprovement"
                ? "%"
                : ""}
            </div>
            <div
              className={`text-xs px-2 py-1 rounded-full ${
                metric.change.startsWith("+")
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {metric.change}
            </div>
          </div>

          <p className="text-gray-300 text-sm">{metric.label}</p>

          {/* Mini chart simulation */}
          <div className="mt-3 h-8 flex items-end space-x-1">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-blue-400/30 rounded-sm"
                style={{
                  height: `${20 + Math.random() * 60}%`,
                  backgroundColor: i === 11 ? "#3b82f6" : "#3b82f6aa",
                }}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Main Marketing Machine Showcase Component
export default function MarketingMachineShowcase({
  variant = "full",
  autoPlay = true,
  showControls = true,
  onInteraction,
  className = "",
}: MarketingMachineShowcaseProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentExample, setCurrentExample] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "workflow" | "content" | "chat" | "metrics"
  >("workflow");
  const [isTyping, setIsTyping] = useState(false);

  // Auto-cycle through examples
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentExample(prev => (prev + 1) % CONTENT_EXAMPLES.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  // Handle workflow step completion
  const handleStepComplete = (stepIndex: number) => {
    if (stepIndex < WORKFLOW_STEPS.length - 1) {
      setCurrentStep(stepIndex + 1);
    } else {
      // Workflow complete, reset after a pause
      setTimeout(() => {
        setCurrentStep(0);
      }, 2000);
    }

    onInteraction?.("workflow_step_complete", { step: stepIndex });
  };

  // Control handlers
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    onInteraction?.("play_pause", { playing: !isPlaying });
  };

  const handleReset = () => {
    setCurrentStep(0);
    setCurrentExample(0);
    setIsPlaying(false);
    onInteraction?.("reset", {});
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    onInteraction?.("tab_change", { tab });
  };

  if (variant === "compact") {
    return (
      <div
        className={`bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 ${className}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            Marketing Machine Live
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm">Active</span>
          </div>
        </div>

        <PerformanceDashboard metrics={PERFORMANCE_METRICS} />
      </div>
    );
  }

  if (variant === "pipeline-only") {
    return (
      <div
        className={`bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 ${className}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Automation Pipeline</h3>
          {showControls && (
            <div className="flex items-center space-x-2">
              <NormalButton
                onClick={handlePlayPause}
                className="w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white" />
                )}
              </NormalButton>
              <NormalButton
                onClick={handleReset}
                className="w-10 h-10 bg-gray-600 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-white" />
              </NormalButton>
            </div>
          )}
        </div>

        <WorkflowAnimation
          isPlaying={isPlaying}
          currentStep={currentStep}
          steps={WORKFLOW_STEPS}
          onStepComplete={handleStepComplete}
        />
      </div>
    );
  }

  // Full variant
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Interactive Marketing Machine
          </h2>
          <p className="text-gray-300">
            Watch our AI-powered platform automate your entire content workflow
          </p>
        </div>

        {showControls && (
          <div className="flex items-center space-x-3">
            <NormalButton
              onClick={handlePlayPause}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white" />
              )}
              <span className="text-white font-medium">
                {isPlaying ? "Pause Demo" : "Start Demo"}
              </span>
            </NormalButton>

            <NormalButton
              onClick={handleReset}
              className="w-12 h-12 bg-gray-600 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-white" />
            </NormalButton>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-xl">
        {[
          {
            id: "workflow",
            label: "Automation Pipeline",
            icon: <Rocket className="w-4 h-4" />,
          },
          {
            id: "content",
            label: "Content Generation",
            icon: <FileText className="w-4 h-4" />,
          },
          {
            id: "chat",
            label: "AI Assistant",
            icon: <Bot className="w-4 h-4" />,
          },
          {
            id: "metrics",
            label: "Performance",
            icon: <BarChart3 className="w-4 h-4" />,
          },
        ].map(tab => (
          <NormalButton
            key={tab.id}
            onClick={() => handleTabChange(tab.id as typeof activeTab)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-blue-500 text-white"
                : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.icon}
            <span className="font-medium">{tab.label}</span>
          </NormalButton>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "workflow" && (
          <motion.div
            key="workflow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
          >
            <WorkflowAnimation
              isPlaying={isPlaying}
              currentStep={currentStep}
              steps={WORKFLOW_STEPS}
              onStepComplete={handleStepComplete}
            />
          </motion.div>
        )}

        {activeTab === "content" && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ContentGenerationDemo
              examples={CONTENT_EXAMPLES}
              currentExample={currentExample}
            />
          </motion.div>
        )}

        {activeTab === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AiAssistantChat messages={AI_CONVERSATION} isTyping={isTyping} />
          </motion.div>
        )}

        {activeTab === "metrics" && (
          <motion.div
            key="metrics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
          >
            <PerformanceDashboard metrics={PERFORMANCE_METRICS} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Status Indicator */}
      <div className="flex items-center justify-center space-x-4 text-gray-400 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>Live Demo Active</span>
        </div>
        <div className="w-1 h-1 bg-gray-600 rounded-full" />
        <span>Generating content every 30 seconds</span>
        <div className="w-1 h-1 bg-gray-600 rounded-full" />
        <span>Real-time performance tracking</span>
      </div>
    </div>
  );
}
