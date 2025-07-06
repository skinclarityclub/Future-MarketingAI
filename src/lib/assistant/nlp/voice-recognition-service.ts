/**
 * Voice Recognition Service
 * Browser-based voice recognition for AI Navigation System
 * Task 13.4: Develop Natural Language Processing (NLP) Capabilities
 */

import {
  NavigationNLPProcessor,
  type VoiceCommand,
  type NLPProcessingResult,
} from "./navigation-nlp-processor";

export interface VoiceRecognitionConfig {
  language: "en-US" | "nl-NL" | "en-GB";
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  confidenceThreshold: number;
  silenceTimeout: number;
  autoStart: boolean;
}

export interface VoiceRecognitionState {
  isListening: boolean;
  isProcessing: boolean;
  isSupported: boolean;
  currentLanguage: string;
  lastError?: string;
  sessionActive: boolean;
}

export interface VoiceRecognitionEvents {
  onStart: () => void;
  onResult: (result: NLPProcessingResult) => void;
  onError: (error: string) => void;
  onEnd: () => void;
  onSpeechStart: () => void;
  onSpeechEnd: () => void;
}

// Language mappings for speech recognition
const SPEECH_LANGUAGE_MAP = {
  en: "en-US",
  nl: "nl-NL",
  "en-GB": "en-GB",
  "en-US": "en-US",
  "nl-NL": "nl-NL",
} as const;

export class VoiceRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private nlpProcessor: NavigationNLPProcessor;
  private config: VoiceRecognitionConfig;
  private state: VoiceRecognitionState;
  private events: Partial<VoiceRecognitionEvents>;
  private silenceTimer: NodeJS.Timeout | null = null;

  constructor(
    nlpProcessor: NavigationNLPProcessor,
    config: Partial<VoiceRecognitionConfig> = {},
    events: Partial<VoiceRecognitionEvents> = {}
  ) {
    this.nlpProcessor = nlpProcessor;
    this.config = {
      language: "en-US",
      continuous: false,
      interimResults: true,
      maxAlternatives: 3,
      confidenceThreshold: 0.6,
      silenceTimeout: 3000,
      autoStart: false,
      ...config,
    };
    this.events = events;

    this.state = {
      isListening: false,
      isProcessing: false,
      isSupported: this.checkSupport(),
      currentLanguage: this.config.language,
      sessionActive: false,
    };

    this.initializeRecognition();
  }

  /**
   * Check if speech recognition is supported
   */
  private checkSupport(): boolean {
    return !!(
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)
    );
  }

  /**
   * Initialize speech recognition
   */
  private initializeRecognition(): void {
    if (!this.state.isSupported) {
      console.warn("Speech recognition not supported in this browser");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Configure recognition
    this.recognition.lang = this.config.language;
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.maxAlternatives = this.config.maxAlternatives;

    // Event handlers
    this.recognition.onstart = () => {
      this.state.isListening = true;
      this.state.sessionActive = true;
      this.events.onStart?.();
      this.events.onSpeechStart?.();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      this.handleSpeechResult(event);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.handleSpeechError(event);
    };

    this.recognition.onend = () => {
      this.state.isListening = false;
      this.state.isProcessing = false;
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }
      this.events.onEnd?.();
      this.events.onSpeechEnd?.();
    };

    this.recognition.onspeechstart = () => {
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }
    };

    this.recognition.onspeechend = () => {
      this.startSilenceTimer();
    };
  }

  /**
   * Start voice recognition
   */
  async startListening(): Promise<void> {
    if (!this.state.isSupported) {
      throw new Error("Speech recognition not supported");
    }

    if (this.state.isListening) {
      console.warn("Already listening");
      return;
    }

    try {
      // Request microphone permission
      await this.requestMicrophonePermission();

      this.state.lastError = undefined;
      this.recognition?.start();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to start voice recognition";
      this.state.lastError = errorMessage;
      this.events.onError?.(errorMessage);
      throw error;
    }
  }

  /**
   * Stop voice recognition
   */
  stopListening(): void {
    if (this.recognition && this.state.isListening) {
      this.recognition.stop();
    }

    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    this.state.sessionActive = false;
  }

  /**
   * Handle speech recognition result
   */
  private async handleSpeechResult(
    event: SpeechRecognitionEvent
  ): Promise<void> {
    try {
      const results = event.results;
      const lastResult = results[results.length - 1];

      if (lastResult.isFinal) {
        this.state.isProcessing = true;

        // Extract alternatives
        const alternatives: string[] = [];
        for (let i = 0; i < lastResult.length; i++) {
          alternatives.push(lastResult[i].transcript);
        }

        // Create voice command
        const voiceCommand: VoiceCommand = {
          transcript: lastResult[0].transcript,
          confidence: lastResult[0].confidence,
          alternates: alternatives.slice(1),
          language: this.getLanguageCode(),
          timestamp: new Date(),
        };

        // Process with NLP
        const result =
          await this.nlpProcessor.processVoiceCommand(voiceCommand);

        this.state.isProcessing = false;
        this.events.onResult?.(result);

        // Stop listening if not continuous
        if (!this.config.continuous) {
          this.stopListening();
        }
      }
    } catch (error) {
      this.state.isProcessing = false;
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to process voice command";
      this.state.lastError = errorMessage;
      this.events.onError?.(errorMessage);
    }
  }

  /**
   * Handle speech recognition error
   */
  private handleSpeechError(event: SpeechRecognitionErrorEvent): void {
    let errorMessage = "Speech recognition error";

    switch (event.error) {
      case "no-speech":
        errorMessage = "No speech detected";
        break;
      case "aborted":
        errorMessage = "Speech recognition aborted";
        break;
      case "audio-capture":
        errorMessage = "Audio capture failed";
        break;
      case "network":
        errorMessage = "Network error occurred";
        break;
      case "not-allowed":
        errorMessage = "Microphone access denied";
        break;
      case "service-not-allowed":
        errorMessage = "Speech recognition service not allowed";
        break;
      case "bad-grammar":
        errorMessage = "Grammar error";
        break;
      case "language-not-supported":
        errorMessage = "Language not supported";
        break;
    }

    this.state.lastError = errorMessage;
    this.state.isListening = false;
    this.state.isProcessing = false;
    this.events.onError?.(errorMessage);
  }

  /**
   * Request microphone permission
   */
  private async requestMicrophonePermission(): Promise<void> {
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        // Close the stream immediately as we only needed permission
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        throw new Error("Microphone access denied");
      }
    }
  }

  /**
   * Start silence timer
   */
  private startSilenceTimer(): void {
    if (this.config.silenceTimeout > 0) {
      this.silenceTimer = setTimeout(() => {
        if (this.state.isListening && !this.state.isProcessing) {
          this.stopListening();
        }
      }, this.config.silenceTimeout);
    }
  }

  /**
   * Get language code for NLP processing
   */
  private getLanguageCode(): "en" | "nl" {
    return this.config.language.startsWith("nl") ? "nl" : "en";
  }

  /**
   * Change recognition language
   */
  setLanguage(language: keyof typeof SPEECH_LANGUAGE_MAP): void {
    const speechLang = SPEECH_LANGUAGE_MAP[language];
    if (speechLang) {
      this.config.language = speechLang;
      this.state.currentLanguage = speechLang;

      if (this.recognition) {
        this.recognition.lang = speechLang;
      }
    }
  }

  /**
   * Toggle continuous listening
   */
  setContinuous(continuous: boolean): void {
    this.config.continuous = continuous;
    if (this.recognition) {
      this.recognition.continuous = continuous;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<VoiceRecognitionConfig>): void {
    this.config = { ...this.config, ...updates };

    if (this.recognition) {
      if (updates.language) {
        this.recognition.lang = updates.language;
        this.state.currentLanguage = updates.language;
      }
      if (updates.continuous !== undefined) {
        this.recognition.continuous = updates.continuous;
      }
      if (updates.interimResults !== undefined) {
        this.recognition.interimResults = updates.interimResults;
      }
      if (updates.maxAlternatives !== undefined) {
        this.recognition.maxAlternatives = updates.maxAlternatives;
      }
    }
  }

  /**
   * Get current state
   */
  getState(): VoiceRecognitionState {
    return { ...this.state };
  }

  /**
   * Get current configuration
   */
  getConfig(): VoiceRecognitionConfig {
    return { ...this.config };
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
   * Check if supported
   */
  isSupported(): boolean {
    return this.state.isSupported;
  }

  /**
   * Destroy service and cleanup
   */
  destroy(): void {
    if (this.state.isListening) {
      this.stopListening();
    }

    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    this.recognition = null;
    this.state.sessionActive = false;
  }
}

// Global type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
