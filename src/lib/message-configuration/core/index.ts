/**
 * Message Configuration Engine - Core Module
 *
 * This module provides the complete message configuration system including:
 * - Core engine for message processing and retrieval
 * - Utility functions and helper classes
 * - Convenience exports for easy integration
 */

// Core engine exports
export {
  MessageConfigurationEngine,
  getDefaultEngine,
  initializeDefaultEngine,
  getMessage,
} from "./message-config-engine";

// Type exports (these will be defined later)
export type MessageContext = any;
export type MessageVariables = any;
export type EngineConfig = any;
export type EngineStats = any;

// Utility exports
export {
  MessageHelper,
  MessageBuilder,
  TimeBasedMessages,
  BatchMessageOperations,
  AuthMessages,
  DashboardMessages,
  AIMessages,
  createMessageHelper,
  createMessageBuilder,
  createTimeBasedMessages,
  createBatchOperations,
  createAuthMessages,
  createDashboardMessages,
  createAIMessages,
  getMessageQuick,
  getMessageSafeQuick,
  getCategoryMessagesQuick,
} from "./message-utils";

// Re-export types from schema for convenience
export type {
  MessageConfigurationSchema,
  MessageTemplate,
  MessageInstance,
  MessageCategory,
  SupportedLocale,
  ValidationResult,
  ValidationError,
} from "../schemas/message-config-schema";

// Additional type exports (to be defined later)
export type LocalizedContent = any;
export type DisplayConfiguration = any;
export type ContextRules = any;
