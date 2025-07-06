"use client";

/**
 * NLP Navigation Interface Component
 * User interface for natural language navigation with voice support
 * Task 13.4: Develop Natural Language Processing (NLP) Capabilities
 */

import { useState, useEffect, useRef, useCallback } from "react";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Mic,
  MicOff,
  Send,
  Loader2,
  Volume2,
  VolumeX,
  Globe,
  Settings,
  Zap,
  MessageSquare,
  Navigation,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NLPNavigationIntegration } from "@/lib/assistant/nlp/nlp-navigation-integration";
import { AINavigationFramework } from "@/lib/navigation/ai-navigation-framework";
import type {
  NLPNavigationConfig,
  NLPNavigationState,
  NLPNavigationEvents,
} from "@/lib/assistant/nlp/nlp-navigation-integration";
import type { NLPProcessingResult } from "@/lib/assistant/nlp/navigation-nlp-processor";

interface NLPNavigationInterfaceProps {
  onNavigate?: (path: string) => void;
  className?: string;
  compact?: boolean;
  showAdvancedControls?: boolean;
  initialLanguage?: "en" | "nl";
  theme?: "light" | "dark" | "auto";
}

export function NLPNavigationInterface({
  onNavigate,
  className,
  compact = false,
  showAdvancedControls = false,
  initialLanguage = "en",
  theme = "auto",
}: NLPNavigationInterfaceProps) {
  // State management
  const [textInput, setTextInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "nl">(
    initialLanguage
  );
  const [lastResult, setLastResult] = useState<NLPProcessingResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Refs
  const nlpServiceRef = useRef<NLPNavigationIntegration | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize NLP service
  useEffect(() => {
    const initializeNLP = async () => {
      try {
        const aiNavigation = new AINavigationFramework();

        const config: Partial<NLPNavigationConfig> = {
          nlp: {
            languages: ["en", "nl"],
            confidenceThreshold: 0.6,
            fallbackLanguage: initialLanguage,
            enableMultiIntent: true,
          },
          voice: {
            enabled: true,
            autoStart: false,
            continuousListening: false,
            silenceTimeout: 3000,
            language: initialLanguage === "nl" ? "nl-NL" : "en-US",
          },
          navigation: {
            autoExecute: false,
            confirmationRequired: true,
            showSuggestions: true,
            maxSuggestions: 4,
          },
          ui: {
            showTranscription: true,
            showConfidence: true,
            enableAnimations: true,
            theme,
          },
        };

        const events: Partial<NLPNavigationEvents> = {
          onCommandProcessed: result => {
            setLastResult(result);
            setShowResults(true);
            setIsProcessing(false);
          },
          onNavigationExecuted: path => {
            onNavigate?.(path);
          },
          onVoiceStateChanged: listening => {
            setIsListening(listening);
          },
          onError: errorMsg => {
            setError(errorMsg);
            setIsProcessing(false);
            setIsListening(false);
          },
          onLanguageChanged: language => {
            setCurrentLanguage(language);
          },
        };

        nlpServiceRef.current = new NLPNavigationIntegration(
          aiNavigation,
          config,
          events
        );

        setVoiceSupported(nlpServiceRef.current.isVoiceSupported());
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to initialize NLP service"
        );
      }
    };

    initializeNLP();

    return () => {
      if (nlpServiceRef.current) {
        nlpServiceRef.current.destroy();
      }
    };
  }, [initialLanguage, theme, onNavigate]);

  // Handle text input submission
  const handleTextSubmit = useCallback(async () => {
    if (!textInput.trim() || !nlpServiceRef.current || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setError(null);
    setShowResults(false);

    try {
      await nlpServiceRef.current.processTextInput(textInput.trim());
      setTextInput("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process text input"
      );
      setIsProcessing(false);
    }
  }, [textInput, isProcessing]);

  // Handle voice toggle
  const handleVoiceToggle = useCallback(async () => {
    if (!nlpServiceRef.current || !voiceSupported) {
      return;
    }

    try {
      setError(null);
      await nlpServiceRef.current.toggleVoiceRecognition();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Voice recognition failed");
    }
  }, [voiceSupported]);

  // Handle language change
  const handleLanguageChange = useCallback(async (language: "en" | "nl") => {
    if (!nlpServiceRef.current) {
      return;
    }

    try {
      await nlpServiceRef.current.setLanguage(language);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to change language"
      );
    }
  }, []);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setTextInput(suggestion);
    inputRef.current?.focus();
  }, []);

  // Get suggestions as user types
  useEffect(() => {
    const getSuggestions = async () => {
      if (!textInput.trim() || !nlpServiceRef.current) {
        setSuggestions([]);
        return;
      }

      try {
        const newSuggestions =
          await nlpServiceRef.current.getNavigationSuggestions(textInput);
        setSuggestions(newSuggestions);
      } catch {
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(getSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [textInput]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && event.ctrlKey) {
        handleTextSubmit();
      } else if (event.key === "v" && event.ctrlKey && event.shiftKey) {
        handleVoiceToggle();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleTextSubmit, handleVoiceToggle]);

  const texts = {
    en: {
      title: "AI Navigation Assistant",
      placeholder:
        "Ask me to navigate anywhere... (e.g., 'Show me sales dashboard')",
      voiceHint: "Or use voice commands",
      processing: "Processing...",
      listening: "Listening...",
      confidence: "Confidence",
      command: "Command",
      target: "Target",
      path: "Navigation Path",
      suggestions: "Suggested Actions",
      error: "Error",
      voiceNotSupported: "Voice recognition not supported",
      english: "English",
      dutch: "Dutch",
    },
    nl: {
      title: "AI Navigatie Assistent",
      placeholder:
        "Vraag me om ergens heen te navigeren... (bijv. 'Toon me verkoop dashboard')",
      voiceHint: "Of gebruik spraakopdrachten",
      processing: "Verwerken...",
      listening: "Luisteren...",
      confidence: "Betrouwbaarheid",
      command: "Commando",
      target: "Doel",
      path: "Navigatiepad",
      suggestions: "Voorgestelde Acties",
      error: "Fout",
      voiceNotSupported: "Spraakherkenning niet ondersteund",
      english: "Engels",
      dutch: "Nederlands",
    },
  };

  const t = texts[currentLanguage];

  return (
    <Card
      className={cn(
        "w-full max-w-2xl mx-auto",
        "bg-gradient-to-br from-background/95 to-background/80",
        "backdrop-blur-md border-primary/20",
        "shadow-lg hover:shadow-xl transition-all duration-300",
        compact && "max-w-md",
        className
      )}
    >
      <CardHeader className={cn("pb-4", compact && "pb-2")}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Command className="h-5 w-5 text-primary" />
            {t.title}
          </CardTitle>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <NormalButton
              variant="ghost"
              size="sm"
              onClick={() =>
                handleLanguageChange(currentLanguage === "en" ? "nl" : "en")
              }
              className="h-8 w-8 p-0"
            >
              <Globe className="h-4 w-4" />
            </NormalButton>

            {showAdvancedControls && (
              <NormalButton variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="h-4 w-4" />
              </NormalButton>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="text-xs">
            {currentLanguage === "en" ? t.english : t.dutch}
          </Badge>
          {voiceSupported && (
            <Badge
              variant="outline"
              className="text-xs flex items-center gap-1"
            >
              <Volume2 className="h-3 w-3" />
              Voice
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Input */}
        <div className="relative">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder={t.placeholder}
              disabled={isProcessing || isListening}
              className="pr-20 h-12 text-base"
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleTextSubmit();
                }
              }}
            />

            <div className="flex gap-1">
              {/* Voice Button */}
              {voiceSupported && (
                <NormalButton
                  onClick={handleVoiceToggle}
                  disabled={isProcessing}
                  size="lg"
                  variant={isListening ? "destructive" : "secondary"}
                  className={cn(
                    "h-12 px-3 transition-all duration-200",
                    isListening && "animate-pulse"
                  )}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </NormalButton>
              )}

              {/* Submit Button */}
              <NormalButton
                onClick={handleTextSubmit}
                disabled={!textInput.trim() || isProcessing || isListening}
                size="lg"
                className="h-12 px-3"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </NormalButton>
            </div>
          </div>

          {/* Status Indicator */}
          {(isProcessing || isListening) && (
            <div className="absolute -bottom-6 left-0 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                {isListening ? (
                  <>
                    <Mic className="h-3 w-3 text-red-500" />
                    {t.listening}
                  </>
                ) : (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {t.processing}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Voice Hint */}
        {!compact && voiceSupported && (
          <div className="text-center text-sm text-muted-foreground">
            {t.voiceHint}
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Quick suggestions:
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <NormalButton
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs h-7"
                >
                  {suggestion}
                </NormalButton>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <VolumeX className="h-4 w-4" />
              <span className="font-medium">{t.error}:</span>
              {error}
            </div>
          </div>
        )}

        {/* Results Display */}
        {showResults && lastResult && !compact && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Navigation className="h-4 w-4 text-primary" />
                Processing Result
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">{t.command}:</div>
                  <Badge variant="secondary" className="mt-1">
                    {lastResult.command.type}
                  </Badge>
                </div>

                <div>
                  <div className="text-muted-foreground">{t.confidence}:</div>
                  <div className="mt-1 font-mono">
                    {Math.round(lastResult.command.confidence * 100)}%
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="text-muted-foreground">{t.target}:</div>
                  <div className="mt-1 font-medium">
                    {lastResult.command.target}
                  </div>
                </div>

                {lastResult.navigationPath.length > 0 && (
                  <div className="col-span-2">
                    <div className="text-muted-foreground">{t.path}:</div>
                    <div className="mt-1 font-mono text-xs">
                      {lastResult.navigationPath.join(" → ")}
                    </div>
                  </div>
                )}
              </div>

              {lastResult.suggestedActions.length > 0 && (
                <div>
                  <div className="text-muted-foreground text-sm">
                    {t.suggestions}:
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {lastResult.suggestedActions.map((action, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default NLPNavigationInterface;
