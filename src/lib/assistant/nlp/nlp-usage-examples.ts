/**
 * NLP Navigation System - Usage Examples and Integration Guide
 * Task 13.4: Develop Natural Language Processing (NLP) Capabilities
 *
 * This file provides comprehensive examples of how to use the NLP navigation system
 * in various scenarios and contexts.
 */

import { NLPNavigationIntegration } from "./nlp-navigation-integration";
import { AINavigationFramework } from "@/lib/navigation/ai-navigation-framework";
import type { NLPNavigationConfig } from "./nlp-navigation-integration";

/**
 * Example 1: Basic Text Processing Setup
 */
export async function basicTextProcessingExample() {
  // Initialize the AI Navigation Framework
  const aiNavigation = new AINavigationFramework();

  // Configure the NLP system
  const config: Partial<NLPNavigationConfig> = {
    nlp: {
      languages: ["en", "nl"],
      confidenceThreshold: 0.7,
      fallbackLanguage: "en",
      enableMultiIntent: true,
    },
    navigation: {
      autoExecute: false,
      confirmationRequired: true,
      showSuggestions: true,
      maxSuggestions: 5,
    },
  };

  // Initialize NLP Navigation Integration
  const nlpNavigation = new NLPNavigationIntegration(aiNavigation, config);

  // Process text commands
  const textCommands = [
    "Show me the sales dashboard",
    "Navigate to customer analytics",
    "Find revenue reports",
    "Open the settings page",
    "Ga naar het verkoop overzicht", // Dutch: Go to sales overview
    "Zoek klant gegevens", // Dutch: Search customer data
  ];

  for (const command of textCommands) {
    try {
      const result = await nlpNavigation.processTextInput(command);
      console.log(`Command: "${command}"`);
      console.log(`Type: ${result.command.type}`);
      console.log(`Target: ${result.command.target}`);
      console.log(`Navigation Path: ${result.navigationPath.join(" → ")}`);
      console.log(
        `Confidence: ${Math.round(result.command.confidence * 100)}%`
      );
      console.log("---");
    } catch (error) {
      console.error(`Failed to process: "${command}"`, error);
    }
  }

  // Cleanup
  nlpNavigation.destroy();
}

/**
 * Example 2: Voice Recognition Setup
 */
export async function voiceRecognitionExample() {
  const aiNavigation = new AINavigationFramework();

  const config: Partial<NLPNavigationConfig> = {
    voice: {
      enabled: true,
      autoStart: false,
      continuousListening: false,
      silenceTimeout: 3000,
      language: "en-US",
    },
    nlp: {
      languages: ["en"],
      confidenceThreshold: 0.6,
      fallbackLanguage: "en",
      enableMultiIntent: false,
    },
  };

  const events = {
    onCommandProcessed: (result: any) => {
      console.log("Voice command processed:", result);
    },
    onVoiceStateChanged: (isListening: boolean) => {
      console.log("Voice recognition:", isListening ? "listening" : "stopped");
    },
    onError: (error: string) => {
      console.error("Voice recognition error:", error);
    },
  };

  const nlpNavigation = new NLPNavigationIntegration(
    aiNavigation,
    config,
    events
  );

  // Check if voice is supported
  if (nlpNavigation.isVoiceSupported()) {
    // Start voice recognition
    try {
      await nlpNavigation.startVoiceRecognition();
      console.log("Voice recognition started. Say something like:");
      console.log("- 'Show me the dashboard'");
      console.log("- 'Open customer reports'");
      console.log("- 'Navigate to analytics'");

      // Stop after 10 seconds for demo
      setTimeout(() => {
        nlpNavigation.stopVoiceRecognition();
        nlpNavigation.destroy();
      }, 10000);
    } catch (error) {
      console.error("Failed to start voice recognition:", error);
    }
  } else {
    console.log("Voice recognition not supported in this environment");
  }
}

/**
 * Example 3: Multi-language Processing
 */
export async function multiLanguageExample() {
  const aiNavigation = new AINavigationFramework();
  const nlpNavigation = new NLPNavigationIntegration(aiNavigation, {
    nlp: {
      languages: ["en", "nl"],
      confidenceThreshold: 0.6,
      fallbackLanguage: "en",
      enableMultiIntent: true,
    },
  });

  // English commands
  console.log("=== English Commands ===");
  await nlpNavigation.setLanguage("en");

  const englishCommands = [
    "show me sales data",
    "filter customers by region",
    "analyze revenue trends",
    "search for john smith",
  ];

  for (const command of englishCommands) {
    const result = await nlpNavigation.processTextInput(command);
    console.log(
      `"${command}" → ${result.command.type} (${result.command.confidence.toFixed(2)})`
    );
  }

  // Dutch commands
  console.log("\n=== Nederlandse Commando's ===");
  await nlpNavigation.setLanguage("nl");

  const dutchCommands = [
    "toon me verkoop gegevens",
    "filter klanten op regio",
    "analyseer omzet trends",
    "zoek naar jan de vries",
  ];

  for (const command of dutchCommands) {
    const result = await nlpNavigation.processTextInput(command);
    console.log(
      `"${command}" → ${result.command.type} (${result.command.confidence.toFixed(2)})`
    );
  }

  nlpNavigation.destroy();
}

/**
 * Example 4: Navigation Suggestions
 */
export async function navigationSuggestionsExample() {
  const aiNavigation = new AINavigationFramework();
  const nlpNavigation = new NLPNavigationIntegration(aiNavigation);

  const partialInputs = ["show", "customer", "sales", "analytics", "revenue"];

  console.log("=== Navigation Suggestions ===");
  for (const input of partialInputs) {
    const suggestions = await nlpNavigation.getNavigationSuggestions(input);
    console.log(`"${input}" suggestions:`, suggestions);
  }

  nlpNavigation.destroy();
}

/**
 * Example 5: React Component Integration
 */
export const ReactIntegrationExample = `
import React from 'react';
import { NLPNavigationInterface } from '@/components/navigation/nlp-navigation-interface';
import { useRouter } from 'next/navigation';

export function DashboardWithNLP() {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    console.log('Navigating to:', path);
    router.push(path);
  };

  return (
    <div className="p-6">
      <h1>BI Dashboard with AI Navigation</h1>
      
      {/* Compact NLP Interface */}
      <NLPNavigationInterface
        onNavigate={handleNavigate}
        compact={true}
        initialLanguage="en"
        className="mb-6"
      />

      {/* Full-featured NLP Interface */}
      <NLPNavigationInterface
        onNavigate={handleNavigate}
        showAdvancedControls={true}
        initialLanguage="en"
        theme="auto"
      />
      
      {/* Rest of your dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dashboard widgets */}
      </div>
    </div>
  );
}
`;

/**
 * Example 6: Advanced Configuration
 */
export function advancedConfigurationExample() {
  const aiNavigation = new AINavigationFramework();

  const advancedConfig: Partial<NLPNavigationConfig> = {
    nlp: {
      languages: ["en", "nl"],
      confidenceThreshold: 0.8, // Higher threshold for better accuracy
      fallbackLanguage: "en",
      enableMultiIntent: true,
    },
    voice: {
      enabled: true,
      autoStart: false,
      continuousListening: true, // Keep listening after each command
      silenceTimeout: 5000, // 5 seconds of silence before stopping
      language: "en-US",
    },
    navigation: {
      autoExecute: true, // Automatically navigate when confidence is high
      confirmationRequired: false, // Skip confirmation for auto-execute
      showSuggestions: true,
      maxSuggestions: 6,
    },
    ui: {
      showTranscription: true,
      showConfidence: true,
      enableAnimations: true,
      theme: "dark",
    },
  };

  const events = {
    onCommandProcessed: (result: any) => {
      // Log analytics
      console.log("Command analytics:", {
        type: result.command.type,
        confidence: result.command.confidence,
        language: result.command.language,
        timestamp: new Date().toISOString(),
      });
    },
    onNavigationExecuted: (path: string) => {
      // Track navigation events
      console.log("Navigation executed:", path);
    },
    onError: (error: string) => {
      // Send error to monitoring service
      console.error("NLP Navigation Error:", error);
    },
  };

  return new NLPNavigationIntegration(aiNavigation, advancedConfig, events);
}

/**
 * Example 7: Command Pattern Examples
 */
export const commandPatterns = {
  english: {
    navigate: [
      "Go to the dashboard",
      "Take me to customer page",
      "Show me analytics",
      "Open settings",
      "Display revenue reports",
    ],
    search: [
      "Search for customer data",
      "Find sales reports",
      "Look for revenue trends",
      "Where is the user profile?",
    ],
    filter: [
      "Filter customers by region",
      "Show only premium accounts",
      "Limit to Q4 data",
    ],
    analyze: [
      "Analyze sales performance",
      "What is the conversion rate?",
      "Compare this month and last month",
      "Show trends for revenue",
    ],
    command: [
      "Export sales data",
      "Download customer list",
      "Create new report",
      "Update dashboard settings",
    ],
  },
  dutch: {
    navigate: [
      "Ga naar het dashboard",
      "Breng me naar klanten pagina",
      "Laat analytics zien",
      "Open instellingen",
      "Toon omzet rapporten",
    ],
    search: [
      "Zoek naar klant gegevens",
      "Vind verkoop rapporten",
      "Zoek omzet trends",
      "Waar is het gebruiker profiel?",
    ],
    filter: [
      "Filter klanten op regio",
      "Toon alleen premium accounts",
      "Beperk tot Q4 data",
    ],
    analyze: [
      "Analyseer verkoop prestaties",
      "Wat is de conversie ratio?",
      "Vergelijk deze maand en vorige maand",
      "Toon trends voor omzet",
    ],
    command: [
      "Exporteer verkoop data",
      "Download klanten lijst",
      "Maak nieuw rapport",
      "Update dashboard instellingen",
    ],
  },
};

/**
 * Example 8: Error Handling and Recovery
 */
export async function errorHandlingExample() {
  const aiNavigation = new AINavigationFramework();
  const nlpNavigation = new NLPNavigationIntegration(aiNavigation, {
    nlp: {
      languages: ["en"],
      confidenceThreshold: 0.9, // Very high threshold
      fallbackLanguage: "en",
      enableMultiIntent: false,
    },
  });

  const ambiguousCommands = [
    "show me stuff",
    "go there",
    "find things",
    "do something",
  ];

  console.log("=== Testing Error Handling ===");
  for (const command of ambiguousCommands) {
    try {
      const result = await nlpNavigation.processTextInput(command);

      if (result.errorMessage) {
        console.log(`Command: "${command}" → Error: ${result.errorMessage}`);
      } else if (result.command.confidence < 0.5) {
        console.log(
          `Command: "${command}" → Low confidence: ${result.command.confidence.toFixed(2)}`
        );
      } else {
        console.log(`Command: "${command}" → Success: ${result.command.type}`);
      }
    } catch (error) {
      console.error(`Command: "${command}" → Exception:`, error);
    }
  }

  nlpNavigation.destroy();
}

/**
 * Export all examples for easy testing
 */
export const examples = {
  basicTextProcessing: basicTextProcessingExample,
  voiceRecognition: voiceRecognitionExample,
  multiLanguage: multiLanguageExample,
  navigationSuggestions: navigationSuggestionsExample,
  advancedConfiguration: advancedConfigurationExample,
  errorHandling: errorHandlingExample,
  commandPatterns,
  ReactIntegrationExample,
};
