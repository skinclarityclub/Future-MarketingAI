# Personality Extension System

A flexible, plugin-based architecture for extending AI personality profiles and message types without modifying core code.

## Overview

The Personality Extension System allows developers to create custom personality profiles, specialized message types, contextual adaptation rules, and context processors that can be dynamically registered and used by the AI assistant.

## Core Components

### 1. PersonalityExtension Interface

A complete extension package containing:

```typescript
interface PersonalityExtension {
  id: string; // Unique identifier
  name: string; // Human-readable name
  version: string; // Semantic version
  author: string; // Extension author
  description: string; // What this extension provides
  profiles: PersonalityProfile[]; // Custom personality profiles
  messageTypes: ExtendedMessageType[]; // Specialized message templates
  adaptationRules: AdaptationRule[]; // Behavioral adaptation logic
  contextProcessors: ContextProcessor[]; // Context analysis functions
}
```

### 2. Extended Message Types

Template-based messages with variables and conditions:

```typescript
interface ExtendedMessageType {
  id: string;
  name: string;
  category:
    | "greeting"
    | "analysis"
    | "recommendation"
    | "error"
    | "confirmation"
    | "custom";
  template: string; // Template with {{variable}} placeholders
  variables: MessageVariable[]; // Required/optional variables
  conditions: MessageCondition[]; // When to use this message type
  translations: Record<string, string>; // Multi-language support
}
```

### 3. Adaptation Rules

Conditional logic for dynamic behavior modification:

```typescript
interface AdaptationRule {
  id: string;
  name: string;
  priority: number; // Higher = executed first
  conditions: RuleCondition[]; // When to apply this rule
  actions: RuleAction[]; // What to modify
  enabled: boolean; // Can be toggled on/off
}
```

### 4. Context Processors

Functions that enrich context data before personality adaptation:

```typescript
interface ContextProcessor {
  id: string;
  name: string;
  priority: number; // Processing order
  processContext: (context: any) => Promise<any>; // Main processing function
  extractFeatures?: (userInput: string) => Record<string, any>; // Optional feature extraction
}
```

## Creating an Extension

### Step 1: Define Personality Profiles

```typescript
const myProfiles: PersonalityProfile[] = [
  {
    id: "my-custom-profile",
    name: "My Custom Profile",
    description: "A specialized profile for my use case",
    tone: "professional",
    style: "technical",
    formality: "formal",
    verbosity: "detailed",
    emotionalTone: "neutral",
    technicalLevel: "expert",
    customPromptAdditions: "Focus on specific domain expertise...",
    language: "nl",
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
```

### Step 2: Create Message Templates

```typescript
const myMessageTypes: ExtendedMessageType[] = [
  {
    id: "custom-alert",
    name: "Custom Alert",
    category: "analysis",
    template:
      "🚨 **{{alertType}}**: {{message}}\n\n📊 **Data**: {{data}}\n\n💡 **Action**: {{recommendation}}",
    variables: [
      {
        name: "alertType",
        type: "string",
        required: true,
        description: "Type of alert",
      },
      {
        name: "message",
        type: "string",
        required: true,
        description: "Alert message",
      },
      {
        name: "data",
        type: "string",
        required: false,
        description: "Supporting data",
      },
      {
        name: "recommendation",
        type: "string",
        required: true,
        description: "Recommended action",
      },
    ],
    conditions: [{ type: "userRole", operator: "equals", value: "analyst" }],
    translations: {
      en: "🚨 **{{alertType}}**: {{message}}\n\n📊 **Data**: {{data}}\n\n💡 **Action**: {{recommendation}}",
      nl: "🚨 **{{alertType}}**: {{message}}\n\n📊 **Gegevens**: {{data}}\n\n💡 **Actie**: {{recommendation}}",
    },
  },
];
```

### Step 3: Define Adaptation Rules

```typescript
const myAdaptationRules: AdaptationRule[] = [
  {
    id: "my-custom-rule",
    name: "Custom Adaptation Rule",
    priority: 75,
    conditions: [
      { field: "userRole", operator: "equals", value: "manager" },
      { field: "timeOfDay", operator: "equals", value: "morning" },
    ],
    actions: [
      {
        type: "modifyTone",
        parameters: {
          tone: "energetic",
          additions:
            "Start with an energetic morning greeting and focus on daily priorities.",
        },
      },
    ],
    enabled: true,
  },
];
```

### Step 4: Create Context Processors

```typescript
const myContextProcessors: ContextProcessor[] = [
  {
    id: "my-context-processor",
    name: "My Context Processor",
    priority: 60,
    processContext: async (context: any) => {
      // Add custom context analysis
      return {
        ...context,
        myCustomData: {
          processedAt: new Date(),
          customMetric: calculateCustomMetric(context),
        },
      };
    },
    extractFeatures: (userInput: string) => {
      const features: Record<string, any> = {};

      // Extract custom features from user input
      if (userInput.includes("urgent")) {
        features.isUrgent = true;
      }

      return features;
    },
  },
];
```

### Step 5: Package and Register Extension

```typescript
export const myExtension: PersonalityExtension = {
  id: "my-extension-pack",
  name: "My Extension Pack",
  version: "1.0.0",
  author: "Your Name",
  description: "Custom personalities and features for my specific use case",
  profiles: myProfiles,
  messageTypes: myMessageTypes,
  adaptationRules: myAdaptationRules,
  contextProcessors: myContextProcessors,
};

// Register the extension
export function registerMyExtension(): void {
  personalityExtensionRegistry.registerExtension(myExtension);
  console.log("My Extension registered successfully!");
}

// Auto-register when imported
registerMyExtension();
```

## Using Extensions

### Registry Operations

```typescript
import { personalityExtensionRegistry } from "./personality-extension-system";

// List all extensions
const extensions = personalityExtensionRegistry.listExtensions();

// Get all available personality profiles
const profiles = personalityExtensionRegistry.getAllPersonalityProfiles();

// Get all message types
const messageTypes = personalityExtensionRegistry.getAllMessageTypes();

// Apply adaptation rules to context
const adaptedContext =
  await personalityExtensionRegistry.applyAdaptationRules(context);

// Process context through processors
const processedContext =
  await personalityExtensionRegistry.processContext(context);

// Generate a message
const message = personalityExtensionRegistry.generateMessage(
  "custom-alert",
  {
    alertType: "Performance Issue",
    message: "Server response time increased",
    recommendation: "Scale up infrastructure",
  },
  "nl"
);
```

### Integration with Personality Engine

Extensions are automatically integrated with the personality engine when registered. The engine will:

1. Include extension profiles in available personalities
2. Apply extension adaptation rules during context processing
3. Use extension context processors for enhanced analysis
4. Make extension message types available for generation

## API Endpoints

### GET /api/ai-configuration/extensions

Lists all registered extensions with metadata.

```json
{
  "success": true,
  "data": {
    "extensions": [
      {
        "id": "business-analyst-pack",
        "name": "Business Analyst Personality Pack",
        "version": "1.0.0",
        "author": "SKC BI Dashboard Team",
        "description": "Specialized profiles for business analysis",
        "profileCount": 4,
        "messageTypeCount": 3,
        "adaptationRuleCount": 3,
        "contextProcessorCount": 1
      }
    ],
    "totalExtensions": 1,
    "availableProfiles": 9,
    "availableMessageTypes": 3
  }
}
```

## Best Practices

### 1. Extension Design

- Use unique, descriptive IDs for all components
- Include comprehensive descriptions
- Follow semantic versioning
- Test thoroughly before deployment

### 2. Personality Profiles

- Create distinct personalities with clear use cases
- Use appropriate tone/style combinations
- Include meaningful customPromptAdditions
- Test with real user scenarios

### 3. Message Templates

- Use clear, descriptive variable names
- Provide default values where appropriate
- Include proper condition logic
- Support multiple languages

### 4. Adaptation Rules

- Use appropriate priority levels (0-100)
- Create specific, testable conditions
- Keep actions focused and atomic
- Document rule interactions

### 5. Context Processors

- Handle errors gracefully
- Avoid expensive operations
- Return enriched context data
- Use appropriate priority ordering

## Examples

See the `examples/` directory for complete extension implementations:

- `business-analyst-extension.ts` - Comprehensive business analysis extension
- More examples coming soon...

## Migration Guide

### From Core Profiles to Extensions

If you have existing personality profiles in the core system:

1. Extract profile definitions into extension format
2. Create new extension package
3. Register extension in startup code
4. Remove profiles from core types
5. Update references to use extension registry

### Adding New Capabilities

To add new features to the extension system:

1. Define new interfaces if needed
2. Update PersonalityExtension interface
3. Implement registry methods
4. Update personality engine integration
5. Create example usage
6. Update documentation

## Troubleshooting

### Common Issues

1. **Extension not loading**: Check registration order and imports
2. **Rules not applying**: Verify conditions and priority levels
3. **Messages not generating**: Check variable requirements and conditions
4. **Context processing failing**: Add error handling in processors

### Debugging

Enable debug logging to see extension system activity:

```typescript
// In development environment
localStorage.setItem("debug-personality-extensions", "true");
```

This will log extension registration, rule evaluation, and context processing steps to the console.
