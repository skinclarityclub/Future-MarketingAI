/**
 * NLP Navigation Integration Service
 * Main service that integrates NLP capabilities with AI Navigation System
 * Task 13.4: Develop Natural Language Processing (NLP) Capabilities
 */

import { AINavigationFramework } from "@/lib/navigation/ai-navigation-framework";
import { NavigationNLPProcessor } from "./navigation-nlp-processor";
import { VoiceRecognitionService } from "./voice-recognition-service";
import type {
  NavigationCommand,
  NLPProcessingResult,
  VoiceCommand,
} from "./navigation-nlp-processor";
import type {
  VoiceRecognitionConfig,
  VoiceRecognitionEvents,
} from "./voice-recognition-service";
import type { NavigationContext } from "@/lib/assistant/navigation-assistant-bridge";

export interface NLPNavigationConfig {
  // NLP Configuration
  nlp: {
    languages: ("en" | "nl")[];
    confidenceThreshold: number;
    fallbackLanguage: "en" | "nl";
    enableMultiIntent: boolean;
  };

  // Voice Configuration
  voice: {
    enabled: boolean;
    autoStart: boolean;
    continuousListening: boolean;
    silenceTimeout: number;
    language: "en-US" | "nl-NL" | "en-GB";
  };

  // Navigation Configuration
  navigation: {
    autoExecute: boolean;
    confirmationRequired: boolean;
    showSuggestions: boolean;
    maxSuggestions: number;
  };

  // UI Configuration
  ui: {
    showTranscription: boolean;
    showConfidence: boolean;
    enableAnimations: boolean;
    theme: "light" | "dark" | "auto";
  };
}

export interface NLPNavigationState {
  isInitialized: boolean;
  currentLanguage: "en" | "nl";
  voiceEnabled: boolean;
  isListening: boolean;
  isProcessing: boolean;
  lastCommand?: NavigationCommand;
  lastResult?: NLPProcessingResult;
  error?: string;
}

export interface NLPNavigationEvents {
  onCommandProcessed: (result: NLPProcessingResult) => void;
  onNavigationExecuted: (path: string) => void;
  onVoiceStateChanged: (isListening: boolean) => void;
  onError: (error: string) => void;
  onLanguageChanged: (language: "en" | "nl") => void;
}

export class NLPNavigationIntegration {
  private config: NLPNavigationConfig;
  private state: NLPNavigationState;
  private aiNavigation: AINavigationFramework;
  private nlpProcessor: NavigationNLPProcessor;
  private voiceService: VoiceRecognitionService | null = null;
  private events: Partial<NLPNavigationEvents>;

  constructor(
    aiNavigation: AINavigationFramework,
    config: Partial<NLPNavigationConfig> = {},
    events: Partial<NLPNavigationEvents> = {}
  ) {
    this.aiNavigation = aiNavigation;
    this.events = events;

    this.config = {
      nlp: {
        languages: ["en", "nl"],
        confidenceThreshold: 0.6,
        fallbackLanguage: "en",
        enableMultiIntent: true,
      },
      voice: {
        enabled: true,
        autoStart: false,
        continuousListening: false,
        silenceTimeout: 3000,
        language: "en-US",
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
        theme: "auto",
      },
      ...config,
    };

    this.state = {
      isInitialized: false,
      currentLanguage: this.config.nlp.fallbackLanguage,
      voiceEnabled: false,
      isListening: false,
      isProcessing: false,
    };

    this.initialize();
  }

  /**
   * Initialize the NLP navigation integration
   */
  private async initialize(): Promise<void> {
    try {
      // Initialize NLP processor
      this.nlpProcessor = new NavigationNLPProcessor({
        languages: this.config.nlp.languages,
        voiceEnabled: this.config.voice.enabled,
        confidenceThreshold: this.config.nlp.confidenceThreshold,
        fallbackLanguage: this.config.nlp.fallbackLanguage,
      });

      // Initialize voice service if enabled
      if (this.config.voice.enabled) {
        await this.initializeVoiceService();
      }

      this.state.isInitialized = true;
    } catch (error) {
      this.state.error =
        error instanceof Error ? error.message : "Initialization failed";
      this.events.onError?.(this.state.error);
    }
  }

  /**
   * Initialize voice recognition service
   */
  private async initializeVoiceService(): Promise<void> {
    const voiceConfig: Partial<VoiceRecognitionConfig> = {
      language: this.config.voice.language,
      continuous: this.config.voice.continuousListening,
      silenceTimeout: this.config.voice.silenceTimeout,
      autoStart: this.config.voice.autoStart,
      confidenceThreshold: this.config.nlp.confidenceThreshold,
    };

    const voiceEvents: Partial<VoiceRecognitionEvents> = {
      onStart: () => {
        this.state.isListening = true;
        this.events.onVoiceStateChanged?.(true);
      },
      onEnd: () => {
        this.state.isListening = false;
        this.events.onVoiceStateChanged?.(false);
      },
      onResult: (result: NLPProcessingResult) => {
        this.handleNLPResult(result);
      },
      onError: (error: string) => {
        this.state.error = error;
        this.events.onError?.(error);
      },
    };

    this.voiceService = new VoiceRecognitionService(
      this.nlpProcessor,
      voiceConfig,
      voiceEvents
    );

    this.state.voiceEnabled = this.voiceService.isSupported();
  }

  /**
   * Process text input for navigation
   */
  async processTextInput(
    input: string,
    context?: NavigationContext
  ): Promise<NLPProcessingResult> {
    if (!this.state.isInitialized) {
      throw new Error("NLP Navigation not initialized");
    }

    this.state.isProcessing = true;
    this.state.error = undefined;

    try {
      const result = await this.nlpProcessor.processNavigationQuery(
        input,
        this.state.currentLanguage,
        "text"
      );

      await this.handleNLPResult(result, context);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to process text input";
      this.state.error = errorMessage;
      this.events.onError?.(errorMessage);
      throw error;
    } finally {
      this.state.isProcessing = false;
    }
  }

  /**
   * Start voice recognition
   */
  async startVoiceRecognition(): Promise<void> {
    if (!this.voiceService) {
      throw new Error("Voice recognition not available");
    }

    if (!this.state.voiceEnabled) {
      throw new Error("Voice recognition not supported");
    }

    await this.voiceService.startListening();
  }

  /**
   * Stop voice recognition
   */
  stopVoiceRecognition(): void {
    if (this.voiceService) {
      this.voiceService.stopListening();
    }
  }

  /**
   * Handle NLP processing result
   */
  private async handleNLPResult(
    result: NLPProcessingResult,
    context?: NavigationContext
  ): Promise<void> {
    this.state.lastCommand = result.command;
    this.state.lastResult = result;

    // Notify listeners
    this.events.onCommandProcessed?.(result);

    // Execute navigation if configured
    if (this.config.navigation.autoExecute && !result.errorMessage) {
      await this.executeNavigation(result, context);
    }
  }

  /**
   * Execute navigation based on NLP result
   */
  async executeNavigation(
    result: NLPProcessingResult,
    context?: NavigationContext
  ): Promise<void> {
    try {
      const { command, navigationPath } = result;

      if (navigationPath.length === 0) {
        return;
      }

      // Use the first navigation path as primary
      const targetPath = navigationPath[0];

      // Create navigation context if not provided
      const navContext: NavigationContext = context || {
        currentPath: "/dashboard",
        userQuery: command.target,
        intent: command.action,
        timestamp: new Date(),
      };

      // Execute navigation through AI framework
      await this.aiNavigation.trackUserInteraction("voice-user", {
        type: "page_view",
        page: targetPath,
        timestamp: new Date(),
        metadata: {
          command: command.type,
          confidence: command.confidence,
          language: command.language,
          modality: command.modality,
        },
      });

      this.events.onNavigationExecuted?.(targetPath);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to execute navigation";
      this.state.error = errorMessage;
      this.events.onError?.(errorMessage);
    }
  }

  /**
   * Change language
   */
  async setLanguage(language: "en" | "nl"): Promise<void> {
    if (!this.nlpProcessor.isLanguageSupported(language)) {
      throw new Error(`Language ${language} not supported`);
    }

    this.state.currentLanguage = language;

    // Update voice service language if available
    if (this.voiceService) {
      const voiceLanguage = language === "nl" ? "nl-NL" : "en-US";
      this.voiceService.setLanguage(voiceLanguage);
    }

    this.events.onLanguageChanged?.(language);
  }

  /**
   * Get navigation suggestions based on input
   */
  async getNavigationSuggestions(
    input: string,
    context?: NavigationContext
  ): Promise<string[]> {
    try {
      const result = await this.nlpProcessor.processNavigationQuery(
        input,
        this.state.currentLanguage,
        "text"
      );

      const suggestions = result.suggestedActions.slice(
        0,
        this.config.navigation.maxSuggestions
      );

      return suggestions;
    } catch (error) {
      console.error("Failed to get navigation suggestions:", error);
      return [];
    }
  }

  /**
   * Toggle voice recognition
   */
  async toggleVoiceRecognition(): Promise<void> {
    if (!this.voiceService) {
      throw new Error("Voice recognition not available");
    }

    if (this.state.isListening) {
      this.stopVoiceRecognition();
    } else {
      await this.startVoiceRecognition();
    }
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<NLPNavigationConfig>): void {
    this.config = { ...this.config, ...updates };

    // Update NLP processor config
    if (updates.nlp) {
      this.nlpProcessor.updateConfig({
        languages: updates.nlp.languages,
        confidenceThreshold: updates.nlp.confidenceThreshold,
        fallbackLanguage: updates.nlp.fallbackLanguage,
      });
    }

    // Update voice service config
    if (updates.voice && this.voiceService) {
      this.voiceService.updateConfig({
        language: updates.voice.language,
        continuous: updates.voice.continuousListening,
        silenceTimeout: updates.voice.silenceTimeout,
        confidenceThreshold: updates.nlp?.confidenceThreshold,
      });
    }
  }

  /**
   * Get current state
   */
  getState(): NLPNavigationState {
    return { ...this.state };
  }

  /**
   * Get current configuration
   */
  getConfig(): NLPNavigationConfig {
    return { ...this.config };
  }

  /**
   * Check if voice recognition is supported
   */
  isVoiceSupported(): boolean {
    return this.state.voiceEnabled;
  }

  /**
   * Check if currently listening
   */
  isListening(): boolean {
    return this.state.isListening;
  }

  /**
   * Check if currently processing
   */
  isProcessing(): boolean {
    return this.state.isProcessing;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): ("en" | "nl")[] {
    return this.config.nlp.languages;
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): "en" | "nl" {
    return this.state.currentLanguage;
  }

  /**
   * Process voice command directly
   */
  async processVoiceCommand(voiceCommand: VoiceCommand): Promise<void> {
    if (!this.state.isInitialized) {
      throw new Error("NLP Navigation not initialized");
    }

    this.state.isProcessing = true;

    try {
      const result = await this.nlpProcessor.processVoiceCommand(voiceCommand);
      await this.handleNLPResult(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to process voice command";
      this.state.error = errorMessage;
      this.events.onError?.(errorMessage);
    } finally {
      this.state.isProcessing = false;
    }
  }

  /**
   * Destroy service and cleanup
   */
  destroy(): void {
    if (this.voiceService) {
      this.voiceService.destroy();
      this.voiceService = null;
    }

    this.state.isInitialized = false;
    this.state.voiceEnabled = false;
    this.state.isListening = false;
    this.state.isProcessing = false;
  }
}

// Export alias for compatibility
export const NavigationNLPIntegration = NLPNavigationIntegration;
