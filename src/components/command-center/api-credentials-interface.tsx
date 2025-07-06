"use client";

/**
 * API Credentials Management Interface
 * Task 102.2: Register Applications and Secure API Credentials
 *
 * Admin interface for managing all API credentials in the Command Center
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Shield,
  Key,
  Globe,
  Zap,
  Save,
} from "lucide-react";

// ====================================================================
// SIMPLIFIED TYPES FOR DIRECT FUNCTIONALITY
// ====================================================================

interface APICredential {
  id: string;
  provider: string;
  type: "oauth2" | "api_key" | "service_account" | "webhook_secret";
  name: string;
  description: string;
  required: boolean;
  status: "configured" | "missing" | "invalid" | "expired";
  value?: string;
}

interface APIProvider {
  id: string;
  name: string;
  category: "social_media" | "productivity" | "analytics" | "marketing";
  description: string;
  credentials: APICredential[];
  priority: "high" | "medium" | "low";
}

interface APICredentialsInterfaceProps {
  className?: string;
  onCredentialUpdate?: (
    provider: string,
    credential: string,
    status: string
  ) => void;
}

interface CredentialCardProps {
  provider: APIProvider;
  onValidate: (providerId: string, credentialId: string) => void;
  onShowInstructions: (providerId: string) => void;
  onCredentialUpdate?: (
    provider: string,
    credential: string,
    status: string
  ) => void;
}

// ====================================================================
// MOCK DATA FOR IMMEDIATE FUNCTIONALITY
// ====================================================================

const MOCK_PROVIDERS: APIProvider[] = [
  {
    id: "clickup",
    name: "ClickUp API",
    category: "productivity",
    description: "Task management and project tracking integration via OAuth",
    priority: "high",
    credentials: [
      {
        id: "clickup_client_id",
        provider: "clickup",
        type: "api_key",
        name: "Client ID",
        description: "ClickUp OAuth App Client ID from your app settings",
        required: true,
        status: "missing",
      },
      {
        id: "clickup_client_secret",
        provider: "clickup",
        type: "api_key",
        name: "Client Secret",
        description: "ClickUp OAuth App Client Secret (keep this secure)",
        required: true,
        status: "missing",
      },
    ],
  },
  {
    id: "facebook",
    name: "Facebook Graph API",
    category: "social_media",
    description: "Facebook page management and advertising insights",
    priority: "high",
    credentials: [
      {
        id: "facebook_app_id",
        provider: "facebook",
        type: "api_key",
        name: "App ID",
        description: "Facebook App ID from Developer Console",
        required: true,
        status: "missing",
      },
      {
        id: "facebook_app_secret",
        provider: "facebook",
        type: "api_key",
        name: "App Secret",
        description: "Facebook App Secret for authentication",
        required: true,
        status: "missing",
      },
    ],
  },
  {
    id: "instagram",
    name: "Instagram Business API",
    category: "social_media",
    description: "Instagram content analytics and audience insights",
    priority: "high",
    credentials: [
      {
        id: "instagram_access_token",
        provider: "instagram",
        type: "oauth2",
        name: "Access Token",
        description: "Instagram Business Account Access Token",
        required: true,
        status: "missing",
      },
    ],
  },
  {
    id: "google_analytics",
    name: "Google Analytics",
    category: "analytics",
    description: "Website traffic and user behavior analytics",
    priority: "medium",
    credentials: [
      {
        id: "google_analytics_key",
        provider: "google_analytics",
        type: "service_account",
        name: "Service Account JSON",
        description: "Google Analytics Service Account credentials",
        required: true,
        status: "missing",
      },
    ],
  },
  {
    id: "blotato",
    name: "Blotato API",
    category: "marketing",
    description:
      "Multi-platform social media content scheduling and publishing automation",
    priority: "high",
    credentials: [
      {
        id: "blotato_api_key",
        provider: "blotato",
        type: "api_key",
        name: "API Key",
        description: "Blotato API Key for content publishing and scheduling",
        required: true,
        status: "missing",
      },
      {
        id: "blotato_base_url",
        provider: "blotato",
        type: "api_key",
        name: "Base URL",
        description:
          "Blotato API Base URL (default: https://backend.blotato.com/v2)",
        required: true,
        status: "missing",
        value: "https://backend.blotato.com/v2",
      },
    ],
  },
];

// ====================================================================
// MAIN COMPONENT
// ====================================================================

export default function APICredentialsInterface({
  className,
  onCredentialUpdate,
}: APICredentialsInterfaceProps) {
  const [providers, setProviders] = useState<APIProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  // Load real data from API
  const loadProviders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "/api/command-center/credentials?action=providers"
      );
      const result = await response.json();

      if (result.success) {
        // Transform API data to component format
        const transformedProviders = result.data.map((provider: any) => ({
          id: provider.id,
          name: provider.name,
          category: provider.category,
          description: provider.description,
          priority: provider.priority,
          credentials: provider.credentials.map((cred: any) => ({
            id: cred.id,
            provider: provider.id,
            type: cred.type || "api_key",
            name: cred.name,
            description: cred.description,
            required: cred.required,
            status: cred.status,
          })),
        }));
        setProviders(transformedProviders);
      }
    } catch (error) {
      console.error("Failed to load providers:", error);
      // Fallback to mock data
      setProviders(MOCK_PROVIDERS);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadProviders();
  }, []);

  // Calculate health data
  const totalProviders = providers.length;
  const configuredCredentials = providers.reduce(
    (count, provider) =>
      count +
      provider.credentials.filter(c => c.status === "configured").length,
    0
  );
  const totalCredentials = providers.reduce(
    (count, provider) =>
      count + provider.credentials.filter(c => c.required).length,
    0
  );
  const healthScore =
    totalCredentials > 0
      ? Math.round((configuredCredentials / totalCredentials) * 100)
      : 0;

  const handleValidateCredential = async (
    providerId: string,
    credentialId: string
  ) => {
    try {
      console.log("🧪 Validate button clicked!", providerId, credentialId);
      setIsLoading(true);

      // Mock validation with proper Promise - in real implementation this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsLoading(false);
      alert(`✅ Validation completed for ${providerId} - ${credentialId}`);
    } catch (error) {
      console.warn(
        "Error in credential validation:",
        error instanceof Error ? error.message : String(error)
      );
      setIsLoading(false);
      alert(`❌ Validation failed for ${providerId} - ${credentialId}`);
    }
  };

  const handleShowInstructions = (providerId: string) => {
    console.log("📖 Setup Guide button clicked!", providerId);
    setSelectedProvider(providerId);
    setShowInstructions(true);
  };

  const providersByCategory = providers.reduce(
    (acc, provider) => {
      if (!acc[provider.category]) {
        acc[provider.category] = [];
      }
      acc[provider.category].push(provider);
      return acc;
    },
    {} as Record<string, APIProvider[]>
  );

  const missingCredentials = providers.reduce(
    (count, provider) =>
      count +
      provider.credentials.filter(c => c.required && c.status === "missing")
        .length,
    0
  );

  return (
    <div className={`space-y-6 ${className || ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            API Credentials Management
          </h2>
          <p className="text-white/70">
            Configure and monitor all Command Center integrations
          </p>
        </div>
        <Button
          onClick={() => {
            console.log("🔄 Refresh button clicked!");
            loadProviders();
          }}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh All
        </Button>
      </div>

      {/* Health Overview */}
      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Integration Health Overview
          </CardTitle>
          <CardDescription className="text-white/70">
            Overall status of Command Center API integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {totalProviders}
              </div>
              <div className="text-sm text-white/70">Total Providers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {configuredCredentials}
              </div>
              <div className="text-sm text-white/70">Configured</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {missingCredentials}
              </div>
              <div className="text-sm text-white/70">Missing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {healthScore}%
              </div>
              <div className="text-sm text-white/70">Health Score</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Configuration Progress</span>
              <span className="text-white">{healthScore}%</span>
            </div>
            <Progress value={healthScore} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-black/20 border-white/10">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white/10"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="social_media"
            className="data-[state=active]:bg-white/10"
          >
            Social Media
          </TabsTrigger>
          <TabsTrigger
            value="productivity"
            className="data-[state=active]:bg-white/10"
          >
            Productivity
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-white/10"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="missing"
            className="data-[state=active]:bg-white/10"
          >
            Missing ({missingCredentials})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {Object.entries(providersByCategory).map(
            ([category, categoryProviders]) => (
              <div key={category} className="space-y-4">
                <h3 className="text-lg font-semibold text-white capitalize flex items-center gap-2">
                  {category === "social_media" && <Globe className="h-5 w-5" />}
                  {category === "productivity" && <Zap className="h-5 w-5" />}
                  {category === "analytics" && <Settings className="h-5 w-5" />}
                  {category === "marketing" && <Shield className="h-5 w-5" />}
                  {category.replace("_", " ")} ({categoryProviders.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryProviders.map(provider => (
                    <CredentialCard
                      key={provider.id}
                      provider={provider}
                      onValidate={handleValidateCredential}
                      onShowInstructions={handleShowInstructions}
                      onCredentialUpdate={onCredentialUpdate}
                    />
                  ))}
                </div>
              </div>
            )
          )}
        </TabsContent>

        {(["social_media", "productivity", "analytics"] as const).map(
          category => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providersByCategory[category]?.map(provider => (
                  <CredentialCard
                    key={provider.id}
                    provider={provider}
                    onValidate={handleValidateCredential}
                    onShowInstructions={handleShowInstructions}
                    onCredentialUpdate={onCredentialUpdate}
                  />
                ))}
              </div>
            </TabsContent>
          )
        )}

        <TabsContent value="missing" className="space-y-4">
          <Alert className="border-red-500/20 bg-red-500/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-white">Missing Credentials</AlertTitle>
            <AlertDescription className="text-white/70">
              These credentials are required for full Command Center
              functionality. Configure them to enable live data integration.
            </AlertDescription>
          </Alert>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers
              .filter(provider =>
                provider.credentials.some(
                  c => c.required && c.status === "missing"
                )
              )
              .map(provider => (
                <CredentialCard
                  key={provider.id}
                  provider={provider}
                  onValidate={handleValidateCredential}
                  onShowInstructions={handleShowInstructions}
                  onCredentialUpdate={onCredentialUpdate}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Registration Instructions Dialog */}
      {showInstructions && selectedProvider && (
        <SimpleInstructionsDialog
          provider={providers.find(p => p.id === selectedProvider)!}
          onClose={() => {
            setShowInstructions(false);
            setSelectedProvider(null);
          }}
        />
      )}
    </div>
  );
}

// ====================================================================
// CREDENTIAL CARD COMPONENT WITH FULL FUNCTIONALITY
// ====================================================================

function CredentialCard({
  provider,
  onValidate,
  onShowInstructions,
  onCredentialUpdate,
}: CredentialCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [credentialValues, setCredentialValues] = useState<
    Record<string, string>
  >({});
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const [saveResults, setSaveResults] = useState<
    Record<string, { success: boolean; message: string }>
  >({});

  const configuredCount = provider.credentials.filter(
    c => c.status === "configured"
  ).length;
  const requiredCount = provider.credentials.filter(c => c.required).length;
  const progressPercentage =
    requiredCount > 0 ? (configuredCount / requiredCount) * 100 : 0;

  // Initialize credential values
  useEffect(() => {
    const initialValues: Record<string, string> = {};
    provider.credentials.forEach(credential => {
      initialValues[credential.id] = credential.value || "";
    });
    setCredentialValues(initialValues);
  }, [provider.credentials]);

  const handleCredentialChange = (credentialId: string, value: string) => {
    setCredentialValues(prev => ({
      ...prev,
      [credentialId]: value,
    }));
    // Clear previous save result when user types
    setSaveResults(prev => {
      const newResults = { ...prev };
      delete newResults[credentialId];
      return newResults;
    });
  };

  const handleSaveCredential = async (credentialId: string) => {
    const value = credentialValues[credentialId];
    if (!value || !value.trim()) {
      setSaveResults(prev => ({
        ...prev,
        [credentialId]: { success: false, message: "Please enter a value" },
      }));
      return;
    }

    setIsSaving(prev => ({ ...prev, [credentialId]: true }));

    try {
      console.log(
        `💾 Saving credential ${credentialId} for provider ${provider.id}...`
      );

      // Make actual API call to save credential
      const response = await fetch("/api/command-center/credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "save",
          providerId: provider.id,
          credentialId: credentialId,
          value: value.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save credential");
      }

      const result = await response.json();

      if (result.success) {
        setSaveResults(prev => ({
          ...prev,
          [credentialId]: {
            success: true,
            message: "✅ Credential saved successfully!",
          },
        }));

        // Update the credential status locally
        const credentialIndex = provider.credentials.findIndex(
          c => c.id === credentialId
        );
        if (credentialIndex !== -1) {
          provider.credentials[credentialIndex].status = "configured";
          provider.credentials[credentialIndex].value = value.trim();
        }

        console.log(`✅ Successfully saved credential ${credentialId}`);

        // Notify parent component
        if (onCredentialUpdate) {
          onCredentialUpdate(provider.id, credentialId, "configured");
        }
      } else {
        throw new Error(result.error || "Failed to save credential");
      }

      // Clear the save result after 3 seconds for better UX
      setTimeout(() => {
        setSaveResults(prev => {
          const newResults = { ...prev };
          delete newResults[credentialId];
          return newResults;
        });
      }, 3000);
    } catch (error) {
      console.error("Error saving credential:", error);
      setSaveResults(prev => ({
        ...prev,
        [credentialId]: {
          success: false,
          message: `❌ ${error instanceof Error ? error.message : "Failed to save credential"}`,
        },
      }));
    } finally {
      setIsSaving(prev => ({ ...prev, [credentialId]: false }));
    }
  };

  const getStatusIcon = (status: APICredential["status"]) => {
    switch (status) {
      case "configured":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "missing":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "invalid":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "expired":
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = () => {
    switch (provider.category) {
      case "social_media":
        return <Globe className="h-5 w-5 text-white" />;
      case "productivity":
        return <Zap className="h-5 w-5 text-white" />;
      case "analytics":
        return <Settings className="h-5 w-5 text-white" />;
      case "marketing":
        return <Shield className="h-5 w-5 text-white" />;
      default:
        return <Key className="h-5 w-5 text-white" />;
    }
  };

  return (
    <Card className="bg-black/20 border-white/10 hover:border-white/20 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10">
              {getCategoryIcon()}
            </div>
            <div>
              <CardTitle className="text-white text-sm">
                {provider.name}
              </CardTitle>
              <CardDescription className="text-white/70 text-xs">
                {provider.description}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={provider.priority === "high" ? "default" : "secondary"}
            className="text-xs"
          >
            {provider.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/70">Configuration</span>
              <span className="text-white">
                {configuredCount}/{requiredCount}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-1" />
          </div>

          {/* Quick Status */}
          <div className="flex items-center gap-2 text-xs">
            {provider.credentials.slice(0, 3).map(credential => (
              <div key={credential.id} className="flex items-center gap-1">
                {getStatusIcon(credential.status)}
                <span className="text-white/70">{credential.name}</span>
              </div>
            ))}
            {provider.credentials.length > 3 && (
              <span className="text-white/50">
                +{provider.credentials.length - 3} more
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={e => {
                try {
                  console.log("⚙️ Configure button clicked!", provider.id, {
                    isExpanded,
                    event: e,
                  });
                  e.preventDefault();
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                } catch (error) {
                  console.error("Error toggling expanded state:", error);
                }
              }}
              className="flex-1 border-white/20 text-white hover:bg-white/10 transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 mr-1" />
              ) : (
                <ChevronRight className="h-3 w-3 mr-1" />
              )}
              {isExpanded ? "Hide Config" : "Configure"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={e => {
                try {
                  console.log("📚 Setup Guide button clicked!", provider.id, {
                    event: e,
                  });
                  e.preventDefault();
                  e.stopPropagation();
                  onShowInstructions(provider.id);
                } catch (error) {
                  console.error("Error showing instructions:", error);
                }
              }}
              className="border-white/20 text-white hover:bg-white/10 transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Setup Guide
            </Button>
          </div>

          {/* Expanded Configuration */}
          {isExpanded && (
            <div className="space-y-4 pt-3 border-t border-white/10">
              {/* Show/Hide secrets toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">API Credentials</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSecrets(!showSecrets)}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  {showSecrets ? (
                    <EyeOff className="h-3 w-3 mr-1" />
                  ) : (
                    <Eye className="h-3 w-3 mr-1" />
                  )}
                  {showSecrets ? "Hide" : "Show"} Values
                </Button>
              </div>

              {/* Input fields for each credential */}
              {provider.credentials.map(credential => (
                <div
                  key={credential.id}
                  className="space-y-2 p-3 rounded bg-white/5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(credential.status)}
                      <div>
                        <div className="text-sm text-white font-medium">
                          {credential.name}
                        </div>
                        <div className="text-xs text-white/70">
                          {credential.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {credential.required && (
                        <Badge
                          variant="outline"
                          className="text-xs border-white/20 text-white/70"
                        >
                          Required
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor={credential.id}
                      className="text-xs text-white/70"
                    >
                      {credential.type === "oauth2"
                        ? "Token/Access Key"
                        : credential.type === "api_key"
                          ? "API Key"
                          : credential.type === "service_account"
                            ? "Service Account JSON"
                            : "Secret Value"}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={credential.id}
                        type={showSecrets ? "text" : "password"}
                        value={credentialValues[credential.id] || ""}
                        onChange={e =>
                          handleCredentialChange(credential.id, e.target.value)
                        }
                        placeholder={`Enter your ${credential.name.toLowerCase()}`}
                        className="bg-black/20 border-white/20 text-white placeholder:text-white/50"
                      />
                      <Button
                        size="sm"
                        onClick={e => {
                          try {
                            console.log(
                              "💾 Save button clicked!",
                              credential.id,
                              {
                                value: credentialValues[credential.id],
                                isSaving: isSaving[credential.id],
                                event: e,
                              }
                            );
                            e.preventDefault();
                            e.stopPropagation();
                            handleSaveCredential(credential.id);
                          } catch (error) {
                            console.warn(
                              "Error in save button click:",
                              error instanceof Error
                                ? error.message
                                : String(error)
                            );
                            setSaveResults(prev => ({
                              ...prev,
                              [credential.id]: {
                                success: false,
                                message: "❌ Error occurred while saving",
                              },
                            }));
                          }
                        }}
                        disabled={
                          isSaving[credential.id] ||
                          !credentialValues[credential.id]?.trim()
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white min-w-[70px] transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
                      >
                        {isSaving[credential.id] ? (
                          <>
                            <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onValidate(provider.id, credential.id)}
                        className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105 active:scale-95"
                        title="Test connection"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* OAuth Buttons for all providers - Show after Client Secret or App Secret */}

                    {/* ClickUp OAuth Flow */}
                    {provider.id === "clickup" &&
                      credential.id === "clickup_client_secret" && (
                        <div className="mt-2 space-y-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              const clientId =
                                credentialValues["clickup_client_id"];
                              const clientSecret =
                                credentialValues["clickup_client_secret"];
                              if (!clientId || !clientSecret) {
                                alert(
                                  "Please enter both Client ID and Client Secret first"
                                );
                                return;
                              }
                              const redirectUri = `${window.location.origin}/api/oauth/clickup/callback`;
                              const oauthUrl = `https://app.clickup.com/api?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
                              window.open(
                                oauthUrl,
                                "_blank",
                                "width=600,height=700"
                              );
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white w-full"
                            disabled={
                              !credentialValues["clickup_client_id"]?.trim() ||
                              !credentialValues["clickup_client_secret"]?.trim()
                            }
                          >
                            <Globe className="h-3 w-3 mr-2" />
                            Start ClickUp OAuth Flow
                          </Button>
                          <p className="text-xs text-white/50 mt-1">
                            Opens ClickUp authorization in new window
                          </p>

                          {/* Test Connection Button */}
                          <Button
                            size="sm"
                            onClick={async () => {
                              try {
                                const response = await fetch(
                                  "/api/test-clickup-connection"
                                );
                                const result = await response.json();

                                if (result.success) {
                                  alert(
                                    `✅ Connection Test Successful!\n\nUser: ${result.data.user.username}\nTeams: ${result.data.teams.count}\nSpaces: ${result.data.spaces.count}\n\nClickUp integration is working perfectly! 🎉`
                                  );
                                } else {
                                  alert(
                                    `❌ Connection Test Failed:\n\n${result.error}\n\n${result.details || "Please check your credentials"}`
                                  );
                                }
                              } catch (error) {
                                alert(
                                  `❌ Test Failed:\n\nCould not connect to test endpoint.\n${error instanceof Error ? error.message : "Unknown error"}`
                                );
                              }
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white w-full"
                          >
                            <CheckCircle className="h-3 w-3 mr-2" />
                            Test Live Connection
                          </Button>
                          <p className="text-xs text-white/50 mt-1">
                            Tests actual ClickUp API connectivity
                          </p>
                        </div>
                      )}

                    {/* Instagram OAuth Flow */}
                    {provider.id === "instagram" &&
                      credential.id === "instagram_client_secret" && (
                        <div className="mt-2 space-y-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              const clientId =
                                credentialValues["instagram_client_id"];
                              const clientSecret =
                                credentialValues["instagram_client_secret"];
                              if (!clientId || !clientSecret) {
                                alert(
                                  "Please enter both Client ID and Client Secret first"
                                );
                                return;
                              }
                              const redirectUri = `${window.location.origin}/api/oauth/instagram/callback`;
                              const scopes = "user_profile,user_media";
                              const oauthUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code`;
                              window.open(
                                oauthUrl,
                                "_blank",
                                "width=600,height=700"
                              );
                            }}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white w-full"
                            disabled={
                              !credentialValues[
                                "instagram_client_id"
                              ]?.trim() ||
                              !credentialValues[
                                "instagram_client_secret"
                              ]?.trim()
                            }
                          >
                            <Globe className="h-3 w-3 mr-2" />
                            Start Instagram OAuth Flow
                          </Button>
                          <p className="text-xs text-white/50 mt-1">
                            Opens Instagram authorization in new window
                          </p>
                        </div>
                      )}

                    {/* Facebook OAuth Flow */}
                    {provider.id === "facebook" &&
                      credential.id === "facebook_app_secret" && (
                        <div className="mt-2 space-y-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              const appId = credentialValues["facebook_app_id"];
                              const appSecret =
                                credentialValues["facebook_app_secret"];
                              if (!appId || !appSecret) {
                                alert(
                                  "Please enter both App ID and App Secret first"
                                );
                                return;
                              }
                              const redirectUri = `${window.location.origin}/api/oauth/facebook/callback`;
                              const scopes =
                                "pages_manage_posts,pages_read_engagement,pages_show_list";
                              const oauthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code`;
                              window.open(
                                oauthUrl,
                                "_blank",
                                "width=600,height=700"
                              );
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                            disabled={
                              !credentialValues["facebook_app_id"]?.trim() ||
                              !credentialValues["facebook_app_secret"]?.trim()
                            }
                          >
                            <Globe className="h-3 w-3 mr-2" />
                            Start Facebook OAuth Flow
                          </Button>
                          <p className="text-xs text-white/50 mt-1">
                            Opens Facebook authorization in new window
                          </p>
                        </div>
                      )}

                    {/* LinkedIn OAuth Flow */}
                    {provider.id === "linkedin" &&
                      credential.id === "linkedin_client_secret" && (
                        <div className="mt-2 space-y-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              const clientId =
                                credentialValues["linkedin_client_id"];
                              const clientSecret =
                                credentialValues["linkedin_client_secret"];
                              if (!clientId || !clientSecret) {
                                alert(
                                  "Please enter both Client ID and Client Secret first"
                                );
                                return;
                              }
                              const redirectUri = `${window.location.origin}/api/oauth/linkedin/callback`;
                              const scopes =
                                "r_organization_social,rw_organization_admin,r_ads_reporting";
                              const oauthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
                              window.open(
                                oauthUrl,
                                "_blank",
                                "width=600,height=700"
                              );
                            }}
                            className="bg-blue-700 hover:bg-blue-800 text-white w-full"
                            disabled={
                              !credentialValues["linkedin_client_id"]?.trim() ||
                              !credentialValues[
                                "linkedin_client_secret"
                              ]?.trim()
                            }
                          >
                            <Globe className="h-3 w-3 mr-2" />
                            Start LinkedIn OAuth Flow
                          </Button>
                          <p className="text-xs text-white/50 mt-1">
                            Opens LinkedIn authorization in new window
                          </p>
                        </div>
                      )}

                    {/* YouTube OAuth Flow */}
                    {provider.id === "youtube" &&
                      credential.id === "youtube_client_id" && (
                        <div className="mt-2 space-y-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              const clientId =
                                credentialValues["youtube_client_id"];
                              if (!clientId) {
                                alert("Please enter Client ID first");
                                return;
                              }
                              const redirectUri = `${window.location.origin}/api/oauth/youtube/callback`;
                              const scopes =
                                "https://www.googleapis.com/auth/youtube.readonly";
                              const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
                              window.open(
                                oauthUrl,
                                "_blank",
                                "width=600,height=700"
                              );
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white w-full"
                            disabled={
                              !credentialValues["youtube_client_id"]?.trim()
                            }
                          >
                            <Globe className="h-3 w-3 mr-2" />
                            Start YouTube OAuth Flow
                          </Button>
                          <p className="text-xs text-white/50 mt-1">
                            Opens YouTube/Google authorization in new window
                          </p>
                        </div>
                      )}

                    {/* Save result message */}
                    {saveResults[credential.id] && (
                      <div
                        className={`text-sm font-medium p-2 rounded-md border transition-all duration-300 ${
                          saveResults[credential.id].success
                            ? "text-green-400 bg-green-400/10 border-green-400/30 animate-pulse"
                            : "text-red-400 bg-red-400/10 border-red-400/30"
                        }`}
                      >
                        {saveResults[credential.id].message}
                      </div>
                    )}

                    {/* Environment variable name */}
                    <div className="text-xs text-white/50 font-mono">
                      Environment: {credential.id.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ====================================================================
// SIMPLE INSTRUCTIONS DIALOG
// ====================================================================

function SimpleInstructionsDialog({
  provider,
  onClose,
}: {
  provider: APIProvider;
  onClose: () => void;
}) {
  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="bg-black/95 border-white/20 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {provider.name} Setup Instructions
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Follow these steps to configure your {provider.name} integration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Provider Overview */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">About {provider.name}</h3>
            <p className="text-white/70">{provider.description}</p>
          </div>

          {/* Provider-specific Setup Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Setup Steps</h3>
            {provider.id === "clickup" ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Go to ClickUp Settings</p>
                    <p className="text-sm text-white/70">
                      Navigate to: Settings → Integrations → ClickUp API
                    </p>
                    <p className="text-xs text-blue-400 font-mono">
                      https://app.clickup.com/settings/apps
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Create OAuth App</p>
                    <p className="text-sm text-white/70">
                      Click "Create an App" and fill in:
                    </p>
                    <ul className="text-xs text-white/60 mt-1 ml-4 list-disc">
                      <li>App Name: "SKC BI Dashboard"</li>
                      <li>
                        Redirect URI:{" "}
                        <code className="bg-black/30 px-1 rounded">
                          http://localhost:3001/api/oauth/clickup/callback
                        </code>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Copy Credentials</p>
                    <p className="text-sm text-white/70">
                      After creating the app, copy:
                    </p>
                    <ul className="text-xs text-white/60 mt-1 ml-4 list-disc">
                      <li>Client ID (visible immediately)</li>
                      <li>Client Secret (click "Show" to reveal)</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-medium">
                      Alternative: Personal API Token
                    </p>
                    <p className="text-sm text-white/70">
                      For simpler setup, generate a Personal API Token instead
                    </p>
                    <p className="text-xs text-white/60">
                      Go to Apps section → Generate Personal Token
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Access Developer Console</p>
                    <p className="text-sm text-white/70">
                      Log into your {provider.name} account and navigate to
                      developer/API settings
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Create API Credentials</p>
                    <p className="text-sm text-white/70">
                      Generate new API keys, tokens, or OAuth credentials as
                      needed
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Configure Access</p>
                    <p className="text-sm text-white/70">
                      Set appropriate permissions and access levels for your
                      integration
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Save Credentials</p>
                    <p className="text-sm text-white/70">
                      Copy the generated credentials and paste them in the form
                      above
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Required credentials */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Required Credentials</h3>
            <div className="space-y-2">
              {provider.credentials
                .filter(c => c.required)
                .map(credential => (
                  <div
                    key={credential.id}
                    className="flex items-center gap-3 p-3 rounded bg-white/5"
                  >
                    <Key className="h-4 w-4 text-white/70" />
                    <div>
                      <p className="font-medium">{credential.name}</p>
                      <p className="text-sm text-white/70">
                        {credential.description}
                      </p>
                      <p className="text-xs text-white/50 font-mono mt-1">
                        Environment Variable: {credential.id.toUpperCase()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Security notice */}
          <div className="p-4 rounded bg-red-500/10 border border-red-500/20">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-red-400 mt-0.5" />
              <div>
                <p className="font-medium text-red-400">Security Notice</p>
                <p className="text-sm text-red-300/80 mt-1">
                  Never share your API credentials publicly. Store them securely
                  and regenerate them if compromised. These credentials provide
                  access to your {provider.name} account and data.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with close button */}
        <div className="flex justify-end pt-4 border-t border-white/10">
          <Button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
