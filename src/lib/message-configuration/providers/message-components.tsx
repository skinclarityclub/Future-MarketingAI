"use client";

import React, { useState, useEffect } from "react";
import { useMessage, useMessageSafe } from "./message-config-provider";
import { MessageInstance, MessageContext, MessageVariables } from "../core";

interface MessageDisplayProps {
  message: MessageInstance;
  onDismiss?: () => void;
  onAction?: () => void;
  className?: string;
}

export function MessageDisplay({
  message,
  onDismiss,
  onAction,
  className = "",
}: MessageDisplayProps) {
  const { resolvedContent, display } = message;
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (display.duration && display.duration > 0 && display.dismissible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, display.duration);

      return () => clearTimeout(timer);
    }
  }, [display.duration, display.dismissible, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className={`message-display ${className}`} role="alert">
      {resolvedContent.title && (
        <div className="message-title">{resolvedContent.title}</div>
      )}
      <div className="message-content">{resolvedContent.message}</div>
      {resolvedContent.description && (
        <div className="message-description">{resolvedContent.description}</div>
      )}
      <div className="message-actions">
        {resolvedContent.actionLabel && onAction && (
          <button onClick={onAction} className="message-action-button">
            {resolvedContent.actionLabel}
          </button>
        )}
        {display.dismissible && (
          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss?.();
            }}
            className="message-dismiss-button"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

interface SmartMessageProps {
  messageKey: string;
  context?: MessageContext;
  variables?: MessageVariables;
  onDismiss?: () => void;
  onAction?: () => void;
  fallback?: string;
  className?: string;
}

export function SmartMessage({
  messageKey,
  context,
  variables,
  onDismiss,
  onAction,
  fallback = "",
  className,
}: SmartMessageProps) {
  const { message, loading, error } = useMessage(
    messageKey,
    context,
    variables
  );

  if (loading) {
    return (
      <div className={`message-loading ${className || ""}`}>
        Loading message...
      </div>
    );
  }

  if (error || !message) {
    if (fallback) {
      return (
        <div className={`message-fallback ${className || ""}`}>{fallback}</div>
      );
    }
    return null;
  }

  return (
    <MessageDisplay
      message={message}
      onDismiss={onDismiss}
      onAction={onAction}
      className={className}
    />
  );
}

interface SafeMessageProps {
  messageKey: string;
  fallback: string;
  context?: MessageContext;
  variables?: MessageVariables;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

export function SafeMessage({
  messageKey,
  fallback,
  context,
  variables,
  as: Component = "span",
  className,
}: SafeMessageProps) {
  const text = useMessageSafe(messageKey, fallback, context, variables);
  return <Component className={className}>{text}</Component>;
}
