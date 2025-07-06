"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  RefreshCw,
  Bug,
  Home,
  MessageSquare,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableReporting?: boolean;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isOnline: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error Boundary caught an error:", error, errorInfo);
    }

    // Report error to monitoring service if enabled
    if (this.props.enableReporting) {
      this.reportError(error, errorInfo);
    }
  }

  componentDidMount() {
    // Listen for network status changes
    if (typeof window !== "undefined") {
      window.addEventListener("online", this.handleOnline);
      window.addEventListener("offline", this.handleOffline);
    }
  }

  componentWillUnmount() {
    // Cleanup event listeners and timeouts
    if (typeof window !== "undefined") {
      window.removeEventListener("online", this.handleOnline);
      window.removeEventListener("offline", this.handleOffline);
    }
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  handleOnline = () => {
    this.setState({ isOnline: true });
    // Auto-retry if we were offline and have an error
    if (this.state.hasError && this.state.retryCount < this.maxRetries) {
      setTimeout(() => this.handleRetry(), 1000);
    }
  };

  handleOffline = () => {
    this.setState({ isOnline: false });
  };

  reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // In a real application, send to error reporting service
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        componentName: this.props.componentName || "Unknown",
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
        url: typeof window !== "undefined" ? window.location.href : "Unknown",
        timestamp: new Date().toISOString(),
        retryCount: this.state.retryCount,
      };

      console.log("Error Report:", errorReport);

      // Example: Send to monitoring service
      // await fetch('/api/error-reporting', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport),
      // });
    } catch (reportError) {
      console.error("Failed to report error:", reportError);
    }
  };

  handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
  };

  handleReloadPage = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  getErrorType = (error: Error | null): string => {
    if (!error) return "Unknown Error";

    if (
      error.message.includes("ChunkLoadError") ||
      error.message.includes("Loading chunk")
    ) {
      return "Network Error";
    }
    if (error.message.includes("TypeError")) {
      return "Type Error";
    }
    if (error.message.includes("ReferenceError")) {
      return "Reference Error";
    }
    if (error.message.includes("fetch")) {
      return "API Error";
    }

    return "Application Error";
  };

  getErrorSeverity = (error: Error | null): "low" | "medium" | "high" => {
    if (!error) return "medium";

    const message = error.message.toLowerCase();

    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("chunk")
    ) {
      return "medium";
    }
    if (message.includes("security") || message.includes("auth")) {
      return "high";
    }

    return "low";
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorType = this.getErrorType(this.state.error);
      const severity = this.getErrorSeverity(this.state.error);
      const canRetry = this.state.retryCount < this.maxRetries;

      return (
        <Card className="p-6 m-4 border-red-200 bg-red-50/50 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div
                className={cn(
                  "p-3 rounded-full",
                  severity === "high"
                    ? "bg-red-100 text-red-600"
                    : severity === "medium"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-yellow-100 text-yellow-600"
                )}
              >
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Oops! Something went wrong
                  </h3>
                  <Badge
                    variant={severity === "high" ? "destructive" : "secondary"}
                  >
                    {errorType}
                  </Badge>
                  {!this.state.isOnline && (
                    <Badge variant="outline" className="text-orange-600">
                      <ArrowLeft className="h-3 w-3 mr-1" />
                      Offline
                    </Badge>
                  )}
                </div>

                <p className="text-gray-600 mb-4">
                  {errorType === "Network Error"
                    ? "There seems to be a network connectivity issue. Please check your internet connection and try again."
                    : "We encountered an unexpected error. Our team has been notified and is working on a fix."}
                </p>

                {process.env.NODE_ENV === "development" && this.state.error && (
                  <details className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
                    <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                      <Bug className="inline h-4 w-4 mr-1" />
                      Technical Details (Development Mode)
                    </summary>
                    <div className="space-y-2">
                      <div>
                        <strong>Error:</strong> {this.state.error.message}
                      </div>
                      <div>
                        <strong>Component:</strong>{" "}
                        {this.props.componentName || "Unknown"}
                      </div>
                      <div>
                        <strong>Retry Count:</strong> {this.state.retryCount}/
                        {this.maxRetries}
                      </div>
                      {this.state.error.stack && (
                        <div>
                          <strong>Stack Trace:</strong>
                          <pre className="mt-1 p-2 bg-gray-200 rounded text-xs overflow-x-auto">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {canRetry && (
                  <NormalButton
                    onClick={this.handleRetry}
                    className="flex items-center gap-2"
                    disabled={
                      !this.state.isOnline && errorType === "Network Error"
                    }
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again ({this.maxRetries - this.state.retryCount}{" "}
                    attempts left)
                  </NormalButton>
                )}

                <NormalButton
                  variant="secondary"
                  onClick={this.handleReset}
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Reset Component
                </NormalButton>

                <NormalButton
                  variant="secondary"
                  onClick={this.handleReloadPage}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Reload Page
                </NormalButton>

                <NormalButton
                  variant="ghost"
                  onClick={() => {
                    // Navigate to safe fallback page
                    if (typeof window !== "undefined") {
                      window.location.href = "/";
                    }
                  }}
                  className="flex items-center gap-2 text-gray-600"
                >
                  <MessageSquare className="h-4 w-4" />
                  Go to Dashboard
                </NormalButton>
              </div>

              {this.state.retryCount >= this.maxRetries && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Need help?</strong> If the problem persists, please
                    contact our support team or try refreshing the page. We
                    apologize for the inconvenience.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Functional component wrapper for hooks
export function ErrorBoundaryWrapper({ children, ...props }: Props) {
  return <ErrorBoundary {...props}>{children}</ErrorBoundary>;
}
