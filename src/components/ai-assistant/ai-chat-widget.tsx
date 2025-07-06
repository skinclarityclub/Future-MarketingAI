"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Brain,
  TrendingUp,
  Loader2,
  Navigation,
  BarChart3,
  DollarSign,
  Users,
  Target,
  Settings,
  Mic,
  MicOff,
  PanelLeftOpen,
  PanelLeftClose,
  Sparkles,
  ChevronRight,
  Bell,
  Keyboard,
  Accessibility,
  Sun,
  Moon,
  Volume2,
  Globe,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";

// Translation object for Dutch UI
const translations = {
  voiceStart: "Start spraakherkenning",
  voiceStop: "Stop spraakherkenning",
  shortcuts: "Sneltoetsen",
  accessibility: "Toegankelijkheid",
  toggleTheme: "Schakel tussen donker/licht thema",
  askQuestion: "Stel je vraag over data, trends, of insights...",
  aiThinking: "AI denkt na...",
  contextActive: "💡 Context: Je bevraagt nu data uit het",
  panel: "panel",
  confidence: "betrouwbaar",
  dataPanels: "Data Panels",
};

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: string[];
  confidence?: number;
  insights?: any[];
}

interface AIChatWidgetProps {
  className?: string;
  currentPage?: string;
  dashboardContext?: {
    visibleMetrics?: string[];
    currentData?: any;
    userRole?: string;
  };
  useEnhancedIntegration?: boolean;
  userId?: string;
  userRole?: string;
  userPermissions?: string[];
  onDataPanelOpen?: (panelType: string) => void;
}

interface ActionButton {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  query: string;
  color: string;
  description: string;
  panelType: string;
}

// Premium action buttons with enhanced functionality
const actionButtons: ActionButton[] = [
  {
    id: "dashboard",
    icon: BarChart3,
    label: "Dashboard",
    query: "Toon me een overzicht van het dashboard",
    color: "bg-blue-500",
    description: "Algemeen dashboard overzicht",
    panelType: "dashboard",
  },
  {
    id: "finance",
    icon: DollarSign,
    label: "Financieel",
    query: "Geef me een financieel overzicht",
    color: "bg-green-500",
    description: "Revenue, kosten en winst analyse",
    panelType: "finance",
  },
  {
    id: "marketing",
    icon: TrendingUp,
    label: "Marketing",
    query: "Hoe presteren onze marketing campagnes?",
    color: "bg-purple-500",
    description: "Campagne performance en ROI",
    panelType: "marketing",
  },
  {
    id: "customers",
    icon: Users,
    label: "Klanten",
    query: "Laat me klantgegevens zien",
    color: "bg-orange-500",
    description: "Customer analytics en gedrag",
    panelType: "customers",
  },
  {
    id: "reports",
    icon: Target,
    label: "Rapporten",
    query: "Genereer een rapport",
    color: "bg-red-500",
    description: "Gegenereerde rapporten en exports",
    panelType: "reports",
  },
  {
    id: "ai-insights",
    icon: Brain,
    label: "AI Inzichten",
    query: "Geef me AI-gedreven inzichten",
    color: "bg-indigo-500",
    description: "ML voorspellingen en aanbevelingen",
    panelType: "ai-insights",
  },
];

// Markdown components for rich text rendering
const MarkdownComponents = {
  h1: ({ children }: any) => (
    <h1 className="text-lg font-bold text-gray-900 mb-2">{children}</h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-base font-semibold text-gray-800 mb-2">{children}</h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-sm font-medium text-gray-700 mb-1">{children}</h3>
  ),
  p: ({ children }: any) => (
    <p className="text-sm text-gray-600 mb-2 leading-relaxed">{children}</p>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc list-inside text-sm text-gray-600 mb-2 space-y-1">
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal list-inside text-sm text-gray-600 mb-2 space-y-1">
      {children}
    </ol>
  ),
  li: ({ children }: any) => <li className="text-sm">{children}</li>,
  strong: ({ children }: any) => (
    <strong className="font-semibold text-gray-800">{children}</strong>
  ),
  code: ({ children }: any) => (
    <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">
      {children}
    </code>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 my-2 text-sm text-gray-600 italic">
      {children}
    </blockquote>
  ),
};

export function AIChatWidget({
  className,
  currentPage = "Dashboard",
  dashboardContext,
  useEnhancedIntegration = true,
  userId = "anonymous",
  userRole = "user",
  userPermissions = ["read"],
  onDataPanelOpen,
}: AIChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        '**🎉 Welkom bij de Advanced AI Assistant!**\n\nIk ben je persoonlijke business intelligence assistent. Je kunt:\n\n• **Klik op de knoppen links** om data panels te openen\n• **Typ je vragen** in het tekstveld onderaan\n• **Gebruik voice input** met de microfoon knop\n• **Vraag om specifieke analyses** van je data\n\nProbeer bijvoorbeeld: *"Toon me de laatste omzetcijfers"* of klik op een panel knop om te beginnen!',
      timestamp: new Date(),
      confidence: 1.0,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (customQuery?: string) => {
    const query = customQuery || input.trim();
    if (!query || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Enhanced API call with context
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: query,
          userId: userId,
          userRole: userRole,
          currentPage: currentPage,
          dashboardContext: dashboardContext,
          activePanel: activePanel,
          sessionContext: {
            previousMessages: messages.slice(-5), // Last 5 messages for context
            userPermissions,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + "_assistant",
        role: "assistant",
        content: data.answer || "Sorry, ik kon geen antwoord genereren.",
        timestamp: new Date(),
        sources: data.sources,
        confidence: data.confidence,
        insights: data.insights,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Handle data panel opening if suggested
      if (data.suggestedPanel && onDataPanelOpen) {
        onDataPanelOpen(data.suggestedPanel);
      }
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage: ChatMessage = {
        id: Date.now().toString() + "_error",
        role: "assistant",
        content:
          "Sorry, er is een fout opgetreden bij het verwerken van je vraag. Probeer het opnieuw.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionButtonClick = (button: ActionButton) => {
    setActivePanel(button.panelType);
    if (onDataPanelOpen) {
      onDataPanelOpen(button.panelType);
    }
    handleSendMessage(button.query);
  };

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    // Voice recognition would be implemented here
    // For now, just a placeholder
    if (!isListening) {
      console.log("Starting voice recognition...");
    } else {
      console.log("Stopping voice recognition...");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Global keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "/":
            e.preventDefault();
            // Show keyboard shortcuts
            const shortcuts = [
              "Ctrl+/ - Show shortcuts",
              "Ctrl+K - Quick search",
              "Ctrl+M - Toggle voice",
              "Ctrl+Enter - Send message",
              "Esc - Close panels",
            ];
            alert("Keyboard Shortcuts:\n\n" + shortcuts.join("\n"));
            break;
          case "k":
            e.preventDefault();
            // Focus input field
            document.querySelector("input")?.focus();
            break;
          case "m":
            e.preventDefault();
            handleVoiceToggle();
            break;
        }
      }

      if (e.key === "Escape") {
        setActivePanel(null);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Premium UX: Smart notifications
  const showNotification = (
    message: string,
    type: "info" | "success" | "error" = "info"
  ) => {
    // Create a simple notification
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ${
      type === "success"
        ? "bg-green-100 text-green-800 border border-green-200"
        : type === "error"
          ? "bg-red-100 text-red-800 border border-red-200"
          : "bg-blue-100 text-blue-800 border border-blue-200"
    }`;
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="text-sm font-medium">${message}</div>
        <NormalButton onclick="this.parentElement.parentElement.remove()" class="ml-auto text-sm opacity-70 hover:opacity-100">×</NormalButton>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.opacity = "0";
        setTimeout(() => notification.remove(), 300);
      }
    }, 3000);
  };

  if (!isOpen) {
    return (
      <NormalButton
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl",
          "bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700",
          "hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800",
          "z-50 transition-all duration-300 hover:scale-110 group",
          "border-2 border-white/20 backdrop-blur-sm",
          className
        )}
        size="icon"
      >
        <Sparkles className="h-8 w-8 text-white group-hover:animate-pulse" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/30 to-purple-400/30 animate-pulse" />
      </NormalButton>
    );
  }

  return (
    <>
      <ErrorBoundary
        componentName="AdvancedAIChatWidget"
        enableReporting={true}
        onError={(error, errorInfo) => {
          showNotification(`Chat error: ${error.message}`, "error");
          console.error("Chat widget error:", error, errorInfo);
        }}
      >
        <Card
          className={cn(
            "fixed bottom-6 right-6 z-50 bg-white/95 backdrop-blur-xl shadow-2xl border-0",
            "transition-all duration-500 ease-out flex flex-col",
            isMinimized
              ? "w-96 h-16"
              : "w-[800px] h-[700px] max-h-[calc(100vh-80px)]",
            "rounded-2xl overflow-hidden",
            className
          )}
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
            boxShadow:
              "0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.2)",
          }}
        >
          {/* Header - Always visible */}
          <div className="border-b bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-lg">
                    <AvatarImage src="/ai-avatar.svg" alt="AI Assistant" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-lg">
                    Advanced AI Assistant
                  </h2>
                  <p className="text-xs text-gray-500">
                    Context: {currentPage}{" "}
                    {activePanel && `• Panel: ${activePanel}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Premium UX Controls - Improved alignment */}
                <NormalButton
                  variant="ghost"
                  size="sm"
                  onClick={handleVoiceToggle}
                  className={cn(
                    "h-9 w-9 p-0 hover:bg-white/50 rounded-lg transition-all flex items-center justify-center",
                    isListening && "bg-red-100 text-red-600 animate-pulse"
                  )}
                  title={
                    isListening
                      ? translations.voiceStop
                      : `${translations.voiceStart} (Ctrl+M)`
                  }
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </NormalButton>
                <NormalButton
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Show keyboard shortcuts
                    const shortcuts = [
                      "Ctrl+/ - Show shortcuts",
                      "Ctrl+K - Quick search",
                      "Ctrl+M - Toggle voice",
                      "Ctrl+Enter - Send message",
                      "Esc - Close panels",
                    ];
                    alert("Keyboard Shortcuts:\n\n" + shortcuts.join("\n"));
                  }}
                  className="h-9 w-9 p-0 hover:bg-white/50 rounded-lg flex items-center justify-center"
                  title={`${translations.shortcuts} (Ctrl+/)`}
                >
                  <Keyboard className="h-4 w-4" />
                </NormalButton>
                <NormalButton
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Toggle accessibility mode
                    document.documentElement.classList.toggle("high-contrast");
                    document.documentElement.classList.toggle("large-text");
                  }}
                  className="h-9 w-9 p-0 hover:bg-white/50 rounded-lg flex items-center justify-center"
                  title={translations.accessibility}
                >
                  <Accessibility className="h-4 w-4" />
                </NormalButton>
                <NormalButton
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Toggle theme
                    document.documentElement.classList.toggle("dark");
                  }}
                  className="h-9 w-9 p-0 hover:bg-white/50 rounded-lg flex items-center justify-center"
                  title={translations.toggleTheme}
                >
                  <Sun className="h-4 w-4" />
                </NormalButton>
                <NormalButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="h-9 w-9 p-0 hover:bg-white/50 rounded-lg flex items-center justify-center"
                >
                  {sidebarCollapsed ? (
                    <PanelLeftOpen className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
                </NormalButton>
                <NormalButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-9 w-9 p-0 hover:bg-white/50 rounded-lg flex items-center justify-center"
                >
                  <Minimize2 className="h-4 w-4" />
                </NormalButton>
                <NormalButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-10 w-10 p-0 hover:bg-red-50 hover:text-red-600 rounded-lg flex items-center justify-center transition-colors border border-gray-200 hover:border-red-200"
                  title="Chatbot sluiten"
                >
                  <X className="h-5 w-5" />
                </NormalButton>
              </div>
            </div>
          </div>

          {!isMinimized && (
            <div className="flex-1 flex overflow-hidden">
              {/* Left Sidebar with Action Buttons - Improved alignment */}
              <div
                className={cn(
                  "border-r bg-gradient-to-b from-gray-50/50 to-gray-100/50 backdrop-blur-sm transition-all duration-300 flex-shrink-0",
                  sidebarCollapsed ? "w-16" : "w-64"
                )}
              >
                <div className="p-4">
                  {!sidebarCollapsed && (
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">
                      {translations.dataPanels}
                    </h3>
                  )}
                  <div className="space-y-2">
                    {actionButtons.map(button => (
                      <NormalButton
                        key={button.id}
                        variant={
                          activePanel === button.panelType ? "default" : "ghost"
                        }
                        className={cn(
                          "w-full h-auto p-3 transition-all duration-200",
                          sidebarCollapsed ? "justify-center" : "justify-start",
                          activePanel === button.panelType
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                            : "hover:bg-white/60 hover:shadow-md"
                        )}
                        onClick={() => handleActionButtonClick(button)}
                      >
                        <div
                          className={cn(
                            "flex items-center",
                            sidebarCollapsed ? "justify-center" : "gap-3 w-full"
                          )}
                        >
                          <div
                            className={cn(
                              "p-2 rounded-lg text-white flex-shrink-0 flex items-center justify-center",
                              button.color
                            )}
                          >
                            <NormalButton.icon size={16} />
                          </div>
                          {!sidebarCollapsed && (
                            <div className="flex-1 text-left min-w-0">
                              <div className="font-medium text-sm truncate">
                                {button.label}
                              </div>
                              <div className="text-xs opacity-70 truncate">
                                {button.description}
                              </div>
                            </div>
                          )}
                          {!sidebarCollapsed &&
                            activePanel !== button.panelType && (
                              <ChevronRight className="h-4 w-4 opacity-50 flex-shrink-0" />
                            )}
                        </div>
                      </NormalButton>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Chat Area */}
              <div className="flex-1 flex flex-col">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] p-4 rounded-2xl transition-all duration-200",
                            message.role === "user"
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                              : "bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-md"
                          )}
                        >
                          {message.role === "assistant" ? (
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={MarkdownComponents}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed">
                              {message.content}
                            </p>
                          )}

                          {message.sources && message.sources.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {message.sources.map((source, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {source}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {message.confidence && (
                            <div className="mt-2">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  message.confidence > 0.8
                                    ? "border-green-500 text-green-700"
                                    : message.confidence > 0.6
                                      ? "border-yellow-500 text-yellow-700"
                                      : "border-red-500 text-red-700"
                                )}
                              >
                                {Math.round(message.confidence * 100)}%{" "}
                                {translations.confidence}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 p-4 rounded-2xl max-w-[85%] shadow-md">
                          <div className="flex items-center gap-3 text-gray-600">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-sm">
                              {translations.aiThinking}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>

                {/* Input Area - Improved button alignment */}
                <div className="p-4 border-t bg-gradient-to-r from-gray-50/50 to-gray-100/50 backdrop-blur-sm">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1 relative">
                      <Input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={translations.askQuestion}
                        className="min-h-[48px] pr-12 resize-none rounded-xl border-gray-300/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm"
                        disabled={isLoading}
                      />
                      <NormalButton
                        onClick={handleVoiceToggle}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-lg flex items-center justify-center",
                          isListening
                            ? "text-red-500 hover:text-red-600"
                            : "text-gray-400 hover:text-gray-600"
                        )}
                      >
                        {isListening ? (
                          <MicOff className="h-4 w-4" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </NormalButton>
                    </div>
                    <NormalButton
                      onClick={() => handleSendMessage()}
                      disabled={isLoading || !input.trim()}
                      className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg flex items-center justify-center"
                      size="sm"
                    >
                      <Send className="h-5 w-5" />
                    </NormalButton>
                  </div>

                  {activePanel && (
                    <div className="mt-2 text-xs text-gray-500 bg-blue-50/50 rounded-lg px-3 py-2">
                      <span className="font-medium">
                        {translations.contextActive}
                      </span>{" "}
                      {activePanel} {translations.panel}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      </ErrorBoundary>

      {/* Performance Monitor */}
      <PerformanceMonitor
        componentName="AIChatWidget"
        trackMetrics={["render", "api", "memory"]}
        onPerformanceIssue={issue => {
          console.warn("Chat widget performance issue:", issue);
        }}
      />
    </>
  );
}
