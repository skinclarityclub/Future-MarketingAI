"use client";

/**
 * Message Configuration Provider
 *
 * React Context provider for the message configuration engine
 * Provides hooks and utilities for accessing messages in React components
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  MessageConfigurationEngine,
  MessageContext,
  MessageVariables,
  EngineConfig,
  EngineStats,
  getDefaultEngine,
} from "../core/message-config-engine";
import {
  MessageConfigurationSchema,
  MessageInstance,
  MessageCategory,
} from "../schemas/message-config-schema";

// Context types
interface MessageConfigContextType {
  engine: MessageConfigurationEngine;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  stats: EngineStats;
  getMessage: (
    key: string,
    context?: MessageContext,
    variables?: MessageVariables
  ) => Promise<MessageInstance | null>;
  getMessagesByCategory: (
    category: MessageCategory,
    context?: MessageContext,
    variables?: MessageVariables
  ) => Promise<MessageInstance[]>;
  clearCache: () => void;
  updateConfiguration: (config: MessageConfigurationSchema) => Promise<void>;
  refreshStats: () => void;
}

// Default context value
const defaultContextValue: MessageConfigContextType = {
  engine: getDefaultEngine(),
  isReady: false,
  isLoading: false,
  error: null,
  stats: {
    messagesLoaded: 0,
    cacheHits: 0,
    cacheMisses: 0,
    retrievalCount: 0,
    averageRetrievalTime: 0,
    errorCount: 0,
    lastUpdate: new Date().toISOString(),
  },
  getMessage: async () => null,
  getMessagesByCategory: async () => [],
  clearCache: () => {},
  updateConfiguration: async () => {},
  refreshStats: () => {},
};

// Create context
const MessageConfigContext =
  createContext<MessageConfigContextType>(defaultContextValue);

// Provider props
interface MessageConfigProviderProps {
  children: React.ReactNode;
  config?: MessageConfigurationSchema;
  engineConfig?: Partial<EngineConfig>;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

// Provider component
export function MessageConfigProvider({
  children,
  config,
  engineConfig,
  onReady,
  onError,
}: MessageConfigProviderProps) {
  const [engine] = useState(() => new MessageConfigurationEngine(engineConfig));
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<EngineStats>(defaultContextValue.stats);

  // Use refs to track if we've already initialized
  const initializationRef = useRef(false);
  const configRef = useRef(config);

  // Initialize engine with configuration
  const initializeEngine = useCallback(
    async (configToUse: MessageConfigurationSchema) => {
      if (initializationRef.current) return;

      setIsLoading(true);
      setError(null);

      try {
        await engine.initialize(configToUse);
        setIsReady(true);
        setStats(engine.getStats());
        initializationRef.current = true;
        onReady?.();
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to initialize message engine";
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        setIsLoading(false);
      }
    },
    [engine, onReady, onError]
  );

  // Initialize on mount if config is provided
  useEffect(() => {
    if (config && !initializationRef.current) {
      configRef.current = config;
      initializeEngine(config);
    }
  }, [config, initializeEngine]);

  // Update configuration
  const updateConfiguration = useCallback(
    async (newConfig: MessageConfigurationSchema) => {
      setIsLoading(true);
      setError(null);

      try {
        await engine.updateConfiguration(newConfig);
        configRef.current = newConfig;
        setStats(engine.getStats());
        setIsReady(true);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update configuration";
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        setIsLoading(false);
      }
    },
    [engine, onError]
  );

  // Get message wrapper
  const getMessage = useCallback(
    async (
      key: string,
      context: MessageContext = {},
      variables: MessageVariables = {}
    ): Promise<MessageInstance | null> => {
      if (!isReady) {
        console.warn(
          "Message engine not ready. Call updateConfiguration first."
        );
        return null;
      }

      try {
        const message = await engine.getMessage(key, context, variables);
        setStats(engine.getStats()); // Update stats after retrieval
        return message;
      } catch (err) {
        console.error("Error getting message:", err);
        return null;
      }
    },
    [engine, isReady]
  );

  // Get messages by category wrapper
  const getMessagesByCategory = useCallback(
    async (
      category: MessageCategory,
      context: MessageContext = {},
      variables: MessageVariables = {}
    ): Promise<MessageInstance[]> => {
      if (!isReady) {
        console.warn(
          "Message engine not ready. Call updateConfiguration first."
        );
        return [];
      }

      try {
        const messages = await engine.getMessagesByCategory(
          category,
          context,
          variables
        );
        setStats(engine.getStats()); // Update stats after retrieval
        return messages;
      } catch (err) {
        console.error("Error getting category messages:", err);
        return [];
      }
    },
    [engine, isReady]
  );

  // Clear cache wrapper
  const clearCache = useCallback(() => {
    engine.clearCache();
    setStats(engine.getStats());
  }, [engine]);

  // Refresh stats
  const refreshStats = useCallback(() => {
    setStats(engine.getStats());
  }, [engine]);

  // Context value
  const contextValue: MessageConfigContextType = {
    engine,
    isReady,
    isLoading,
    error,
    stats,
    getMessage,
    getMessagesByCategory,
    clearCache,
    updateConfiguration,
    refreshStats,
  };

  return (
    <MessageConfigContext.Provider value={contextValue}>
      {children}
    </MessageConfigContext.Provider>
  );
}

// Hook to use message configuration
export function useMessageConfig() {
  const context = useContext(MessageConfigContext);
  if (!context) {
    throw new Error(
      "useMessageConfig must be used within a MessageConfigProvider"
    );
  }
  return context;
}

// Hook to get a single message with automatic updates
export function useMessage(
  key: string,
  context: MessageContext = {},
  variables: MessageVariables = {}
) {
  const { getMessage, isReady, isLoading } = useMessageConfig();
  const [message, setMessage] = useState<MessageInstance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stable dependencies
  const contextString = JSON.stringify(context);
  const variablesString = JSON.stringify(variables);

  useEffect(() => {
    if (!isReady || isLoading) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getMessage(key, context, variables)
      .then(result => {
        if (!cancelled) {
          setMessage(result);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to get message"
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [key, contextString, variablesString, getMessage, isReady, isLoading]);

  return {
    message,
    loading,
    error,
    isReady,
  };
}

// Hook to get messages by category with automatic updates
export function useMessagesByCategory(
  category: MessageCategory,
  context: MessageContext = {},
  variables: MessageVariables = {}
) {
  const { getMessagesByCategory, isReady, isLoading } = useMessageConfig();
  const [messages, setMessages] = useState<MessageInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stable dependencies
  const contextString = JSON.stringify(context);
  const variablesString = JSON.stringify(variables);

  useEffect(() => {
    if (!isReady || isLoading) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getMessagesByCategory(category, context, variables)
      .then(result => {
        if (!cancelled) {
          setMessages(result);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to get messages"
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    category,
    contextString,
    variablesString,
    getMessagesByCategory,
    isReady,
    isLoading,
  ]);

  return {
    messages,
    loading,
    error,
    isReady,
  };
}

// Hook for quick message access with fallback
export function useMessageSafe(
  key: string,
  fallback: string,
  context: MessageContext = {},
  variables: MessageVariables = {}
) {
  const { message, loading, error } = useMessage(key, context, variables);

  if (loading) {
    return fallback;
  }

  if (error || !message) {
    return fallback;
  }

  return message.resolvedContent.message;
}

// Hook to track engine statistics
export function useMessageStats() {
  const { stats, refreshStats } = useMessageConfig();

  useEffect(() => {
    const interval = setInterval(refreshStats, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [refreshStats]);

  return stats;
}

// Hook for localized messages
export function useLocalizedMessage(
  key: string,
  locale?: string,
  variables: MessageVariables = {}
) {
  const context: MessageContext = { locale };
  return useMessage(key, context, variables);
}

// Hook for user-context messages
export function useUserMessage(
  key: string,
  userRole: string,
  pageRoute?: string,
  variables: MessageVariables = {}
) {
  const context: MessageContext = { userRole, pageRoute };
  return useMessage(key, context, variables);
}
