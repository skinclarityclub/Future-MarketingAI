// Message Configuration Providers
// Export all React components and hooks for message configuration

export {
  MessageConfigProvider,
  useMessageConfig,
  useMessage,
  useMessagesByCategory,
  useMessageSafe,
  useMessageStats,
  useLocalizedMessage,
  useUserMessage,
} from "./message-config-provider";

export {
  MessageDisplay,
  SmartMessage,
  SafeMessage,
} from "./message-components";

// Re-export types for convenience
export type {
  MessageContext,
  MessageVariables,
  MessageInstance,
  MessageCategory,
} from "../core";
