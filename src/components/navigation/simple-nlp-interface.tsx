"use client";

/**
 * Simple NLP Navigation Interface Component
 * Client-safe user interface for natural language navigation
 * Task 13.4: Develop Natural Language Processing (NLP) Capabilities
 */

import { useState, useCallback } from "react";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Send,
  Loader2,
  Globe,
  Navigation,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SimpleNLPProcessor,
  type NLPResult,
} from "@/lib/assistant/nlp/simple-nlp-processor";

interface SimpleNLPInterfaceProps {
  onNavigate?: (path: string) => void;
  className?: string;
  compact?: boolean;
  initialLanguage?: "en" | "nl";
}

export function SimpleNLPInterface({
  onNavigate,
  className,
  compact = false,
  initialLanguage = "en",
}: SimpleNLPInterfaceProps) {
  // State management
  const [textInput, setTextInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "nl">(
    initialLanguage
  );
  const [lastResult, setLastResult] = useState<NLPResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Handle text input submission
  const handleTextSubmit = useCallback(async () => {
    if (!textInput.trim() || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setError(null);
    setShowResults(false);

    try {
      const processor = new SimpleNLPProcessor(currentLanguage);
      const result = processor.processCommand(textInput.trim());

      setLastResult(result);
      setShowResults(true);
      setTextInput("");

      // Execute navigation if callback provided
      if (onNavigate && result.command.page) {
        onNavigate(result.command.page);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process command"
      );
    } finally {
      setIsProcessing(false);
    }
  }, [textInput, isProcessing, currentLanguage, onNavigate]);

  // Handle language change
  const handleLanguageChange = (language: "en" | "nl") => {
    setCurrentLanguage(language);
    setError(null);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  // Test commands for quick testing
  const testCommands = {
    en: [
      "Show me sales dashboard",
      "Go to customer analytics",
      "Open revenue reports",
      "Search for customers",
    ],
    nl: [
      "Ga naar klanten overzicht",
      "Toon verkoop cijfers",
      "Open rapporten",
      "Zoek naar analytics",
    ],
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <Card className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm border-gray-200/50 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              NLP Navigation
            </CardTitle>

            {/* Language Toggle */}
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                <NormalButton
                  variant={currentLanguage === "en" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleLanguageChange("en")}
                  className="rounded-none px-3 py-1 text-xs"
                >
                  EN
                </NormalButton>
                <NormalButton
                  variant={currentLanguage === "nl" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleLanguageChange("nl")}
                  className="rounded-none px-3 py-1 text-xs"
                >
                  NL
                </NormalButton>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  currentLanguage === "en"
                    ? "Enter navigation command..."
                    : "Voer navigatie commando in..."
                }
                className="flex-1 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                disabled={isProcessing}
              />
              <NormalButton
                onClick={handleTextSubmit}
                disabled={isProcessing || !textInput.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </NormalButton>
            </div>

            {/* Quick Test Commands */}
            {!compact && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-medium">
                  {currentLanguage === "en" ? "Quick Test:" : "Snelle Test:"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {testCommands[currentLanguage].map((cmd, index) => (
                    <NormalButton
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setTextInput(cmd)}
                      className="text-xs bg-white/50 hover:bg-white/80 border-gray-200"
                    >
                      {cmd}
                    </NormalButton>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator className="bg-gray-200/50" />

          {/* Error Display */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50/80 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          {/* Results Display */}
          {showResults && lastResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <h3 className="font-semibold text-gray-900">
                  {currentLanguage === "en"
                    ? "Processing Result"
                    : "Verwerkingsresultaat"}
                </h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Command Info */}
                <Card className="bg-white/50 border-gray-200">
                  <CardContent className="p-4 space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <Navigation className="h-4 w-4" />
                      Command Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <Badge variant="secondary" className="capitalize">
                          {lastResult.command.type}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target:</span>
                        <span className="font-medium">
                          {lastResult.command.target}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confidence:</span>
                        <Badge
                          variant={
                            lastResult.command.confidence > 0.7
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {Math.round(lastResult.command.confidence * 100)}%
                        </Badge>
                      </div>
                      {lastResult.command.page && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Page:</span>
                          <code className="text-xs bg-gray-100 px-1 rounded">
                            {lastResult.command.page}
                          </code>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Navigation Path */}
                <Card className="bg-white/50 border-gray-200">
                  <CardContent className="p-4 space-y-3">
                    <h4 className="font-medium text-gray-900">
                      Navigation Path
                    </h4>
                    <div className="space-y-1">
                      {lastResult.navigationPath.map((path, index) => (
                        <div key={index} className="text-sm">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {path}
                          </code>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Suggested Actions */}
              {lastResult.suggestedActions.length > 0 && (
                <Card className="bg-white/50 border-gray-200">
                  <CardContent className="p-4 space-y-3">
                    <h4 className="font-medium text-gray-900">
                      Suggested Actions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {lastResult.suggestedActions.map((action, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Error Message */}
              {lastResult.errorMessage && (
                <div className="p-3 bg-yellow-50/80 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> {lastResult.errorMessage}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
