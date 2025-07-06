/**
 * Extensible Personality Profile and Message Type System
 *
 * This system allows for easy addition of new personality profiles,
 * message types, and behavioral adaptations without modifying core code.
 */

import { PersonalityProfile, SystemMessageConfig } from "../types";

export interface PersonalityExtension {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  profiles: PersonalityProfile[];
  messageTypes: ExtendedMessageType[];
  adaptationRules: AdaptationRule[];
  contextProcessors: ContextProcessor[];
}

export interface ExtendedMessageType {
  id: string;
  name: string;
  category:
    | "greeting"
    | "analysis"
    | "recommendation"
    | "error"
    | "confirmation"
    | "custom";
  template: string;
  variables: MessageVariable[];
  conditions: MessageCondition[];
  translations: Record<string, string>;
}

export interface MessageVariable {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "array" | "object";
  required: boolean;
  defaultValue?: any;
  description: string;
}

export interface MessageCondition {
  type:
    | "timeOfDay"
    | "userRole"
    | "dashboardPage"
    | "conversationLength"
    | "custom";
  operator: "equals" | "contains" | "greater" | "less" | "between" | "matches";
  value: any;
  customFunction?: string; // Reference to custom evaluation function
}

export interface AdaptationRule {
  id: string;
  name: string;
  priority: number; // Higher numbers = higher priority
  conditions: RuleCondition[];
  actions: RuleAction[];
  enabled: boolean;
}

export interface RuleCondition {
  field: string; // e.g., "userRole", "timeOfDay", "conversationLength"
  operator:
    | "equals"
    | "contains"
    | "greater"
    | "less"
    | "between"
    | "matches"
    | "custom";
  value: any;
  customEvaluator?: (context: any, value: any) => boolean;
}

export interface RuleAction {
  type:
    | "modifyTone"
    | "addContext"
    | "changeStyle"
    | "insertMessage"
    | "customAction";
  parameters: Record<string, any>;
  customFunction?: (context: any, parameters: any) => any;
}

export interface ContextProcessor {
  id: string;
  name: string;
  priority: number;
  processContext: (context: any) => Promise<any>;
  extractFeatures?: (userInput: string) => Record<string, any>;
}

/**
 * Registry for managing personality extensions
 */
export class PersonalityExtensionRegistry {
  private extensions: Map<string, PersonalityExtension> = new Map();
  private adaptationRules: AdaptationRule[] = [];
  private contextProcessors: ContextProcessor[] = [];
  private messageTypes: Map<string, ExtendedMessageType> = new Map();

  /**
   * Register a new personality extension
   */
  registerExtension(extension: PersonalityExtension): void {
    this.extensions.set(extension.id, extension);

    // Register adaptation rules with priority sorting
    this.adaptationRules.push(...extension.adaptationRules);
    this.adaptationRules.sort((a, b) => b.priority - a.priority);

    // Register context processors with priority sorting
    this.contextProcessors.push(...extension.contextProcessors);
    this.contextProcessors.sort((a, b) => b.priority - a.priority);

    // Register message types
    extension.messageTypes.forEach(messageType => {
      this.messageTypes.set(messageType.id, messageType);
    });

    console.log(
      `✅ Registered personality extension: ${extension.name} v${extension.version}`
    );
  }

  /**
   * Unregister an extension
   */
  unregisterExtension(extensionId: string): boolean {
    const extension = this.extensions.get(extensionId);
    if (!extension) return false;

    // Remove adaptation rules
    this.adaptationRules = this.adaptationRules.filter(
      rule => !extension.adaptationRules.some(r => r.id === rule.id)
    );

    // Remove context processors
    this.contextProcessors = this.contextProcessors.filter(
      processor => !extension.contextProcessors.some(p => p.id === processor.id)
    );

    // Remove message types
    extension.messageTypes.forEach(messageType => {
      this.messageTypes.delete(messageType.id);
    });

    this.extensions.delete(extensionId);
    console.log(`🗑️ Unregistered personality extension: ${extension.name}`);
    return true;
  }

  /**
   * Get all available personality profiles from all extensions
   */
  getAllPersonalityProfiles(): PersonalityProfile[] {
    const profiles: PersonalityProfile[] = [];

    for (const extension of Array.from(this.extensions.values())) {
      profiles.push(...extension.profiles);
    }

    return profiles;
  }

  /**
   * Get all message types from all extensions
   */
  getAllMessageTypes(): ExtendedMessageType[] {
    return Array.from(this.messageTypes.values());
  }

  /**
   * Apply adaptation rules to a context
   */
  async applyAdaptationRules(context: any): Promise<any> {
    let adaptedContext = { ...context };

    for (const rule of this.adaptationRules.filter(r => r.enabled)) {
      const matches = await this.evaluateRuleConditions(
        rule.conditions,
        adaptedContext
      );

      if (matches) {
        adaptedContext = await this.executeRuleActions(
          rule.actions,
          adaptedContext
        );
      }
    }

    return adaptedContext;
  }

  /**
   * Process context through all registered processors
   */
  async processContext(context: any): Promise<any> {
    let processedContext = { ...context };

    for (const processor of this.contextProcessors) {
      try {
        processedContext = await processor.processContext(processedContext);
      } catch (error) {
        console.warn(`Context processor ${processor.name} failed:`, error);
      }
    }

    return processedContext;
  }

  /**
   * Generate a message using an extended message type
   */
  generateMessage(
    messageTypeId: string,
    variables: Record<string, any> = {},
    locale: string = "nl"
  ): string {
    const messageType = this.messageTypes.get(messageTypeId);
    if (!messageType) {
      throw new Error(`Message type ${messageTypeId} not found`);
    }

    // Use localized template if available
    const template = messageType.translations[locale] || messageType.template;

    // Replace variables in template
    let message = template;
    for (const variable of messageType.variables) {
      const value = variables[variable.name] ?? variable.defaultValue ?? "";
      const placeholder = `{{${variable.name}}}`;
      message = message.replace(new RegExp(placeholder, "g"), String(value));
    }

    return message;
  }

  /**
   * Validate if message conditions are met
   */
  async validateMessageConditions(
    messageTypeId: string,
    context: any
  ): Promise<boolean> {
    const messageType = this.messageTypes.get(messageTypeId);
    if (!messageType) return false;

    for (const condition of messageType.conditions) {
      const isValid = await this.evaluateMessageCondition(condition, context);
      if (!isValid) return false;
    }

    return true;
  }

  /**
   * Get extension information
   */
  getExtensionInfo(extensionId: string): PersonalityExtension | undefined {
    return this.extensions.get(extensionId);
  }

  /**
   * List all registered extensions
   */
  listExtensions(): PersonalityExtension[] {
    return Array.from(this.extensions.values());
  }

  // Private helper methods
  private async evaluateRuleConditions(
    conditions: RuleCondition[],
    context: any
  ): Promise<boolean> {
    for (const condition of conditions) {
      const isValid = await this.evaluateCondition(condition, context);
      if (!isValid) return false;
    }
    return true;
  }

  private async evaluateCondition(
    condition: RuleCondition,
    context: any
  ): Promise<boolean> {
    const fieldValue = this.getNestedValue(context, condition.field);

    if (condition.customEvaluator) {
      return condition.customEvaluator(context, condition.value);
    }

    switch (condition.operator) {
      case "equals":
        return fieldValue === condition.value;
      case "contains":
        return String(fieldValue).includes(String(condition.value));
      case "greater":
        return Number(fieldValue) > Number(condition.value);
      case "less":
        return Number(fieldValue) < Number(condition.value);
      case "between":
        const [min, max] = condition.value;
        const num = Number(fieldValue);
        return num >= min && num <= max;
      case "matches":
        return new RegExp(condition.value).test(String(fieldValue));
      default:
        return false;
    }
  }

  private async executeRuleActions(
    actions: RuleAction[],
    context: any
  ): Promise<any> {
    let modifiedContext = { ...context };

    for (const action of actions) {
      if (action.customFunction) {
        modifiedContext = action.customFunction(
          modifiedContext,
          action.parameters
        );
      } else {
        modifiedContext = this.executeBuiltInAction(action, modifiedContext);
      }
    }

    return modifiedContext;
  }

  private executeBuiltInAction(action: RuleAction, context: any): any {
    const modified = { ...context };

    switch (action.type) {
      case "modifyTone":
        modified.tone = action.parameters.tone;
        break;
      case "addContext":
        modified.additionalContext = action.parameters.context;
        break;
      case "changeStyle":
        modified.style = action.parameters.style;
        break;
      case "insertMessage":
        modified.insertedMessage = action.parameters.message;
        break;
    }

    return modified;
  }

  private async evaluateMessageCondition(
    condition: MessageCondition,
    context: any
  ): Promise<boolean> {
    // Similar to evaluateCondition but for message-specific conditions
    return this.evaluateCondition(
      {
        field: condition.type,
        operator: condition.operator,
        value: condition.value,
      },
      context
    );
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }
}

// Global registry instance
export const personalityExtensionRegistry = new PersonalityExtensionRegistry();
