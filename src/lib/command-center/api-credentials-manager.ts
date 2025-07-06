/**
 * Command Center API Credentials Manager
 * Task 102.2: Register Applications and Secure API Credentials
 *
 * Centralized service for managing all API credentials and configurations
 * required for the Command Center's live data integrations.
 */

import { credentialsDatabaseService } from "./credentials-database-service";

// ====================================================================
// TYPES & INTERFACES
// ====================================================================

export interface APICredential {
  id: string;
  provider: string;
  type: "oauth2" | "api_key" | "service_account" | "webhook_secret";
  name: string;
  description: string;
  required: boolean;
  status: "configured" | "missing" | "invalid" | "expired";
  lastValidated?: Date;
  expiresAt?: Date;
  rateLimits?: {
    requestsPerHour?: number;
    requestsPerDay?: number;
    burstLimit?: number;
  };
  scopes?: string[];
  endpoints?: string[];
  documentation?: string;
  value?: string;
}

export interface APIProvider {
  id: string;
  name: string;
  category:
    | "social_media"
    | "productivity"
    | "analytics"
    | "marketing"
    | "content"
    | "research"
    | "monitoring";
  description: string;
  baseUrl?: string;
  authType: "oauth2" | "api_key" | "service_account";
  credentials: APICredential[];
  isActive: boolean;
  priority: "high" | "medium" | "low";
  features: string[];
}

export interface CredentialValidationResult {
  isValid: boolean;
  message: string;
  lastChecked: Date;
  details?: {
    rateLimits?: {
      remaining: number;
      resetTime: Date;
    };
    scopes?: string[];
    expiresAt?: Date;
  };
  error?: string;
}

export interface CredentialSaveResult {
  success: boolean;
  status: "configured" | "missing" | "invalid" | "expired";
  error?: string;
}

// ====================================================================
// API PROVIDERS CONFIGURATION
// ====================================================================

const API_PROVIDERS: APIProvider[] = [
  // SOCIAL MEDIA PROVIDERS
  {
    id: "instagram",
    name: "Instagram Business API",
    category: "social_media",
    description: "Instagram content analytics and audience insights",
    baseUrl: "https://graph.facebook.com",
    authType: "oauth2",
    isActive: true,
    priority: "high",
    features: [
      "Post Analytics",
      "Story Tracking",
      "Audience Insights",
      "Media Management",
    ],
    credentials: [
      {
        id: "instagram_app_id",
        provider: "instagram",
        type: "api_key",
        name: "App ID",
        description: "Instagram App ID from Facebook Developer Console",
        required: true,
        status: "missing",
        rateLimits: { requestsPerHour: 200 },
        documentation:
          "https://developers.facebook.com/docs/instagram-basic-display-api",
      },
      {
        id: "instagram_app_secret",
        provider: "instagram",
        type: "api_key",
        name: "App Secret",
        description: "Instagram App Secret for authentication",
        required: true,
        status: "missing",
      },
      {
        id: "instagram_access_token",
        provider: "instagram",
        type: "oauth2",
        name: "Access Token",
        description: "Instagram Business Account Access Token",
        required: true,
        status: "missing",
        scopes: [
          "instagram_basic",
          "instagram_manage_insights",
          "pages_read_engagement",
        ],
      },
    ],
  },
  {
    id: "facebook",
    name: "Facebook Graph API",
    category: "social_media",
    description: "Facebook page management and advertising insights",
    baseUrl: "https://graph.facebook.com",
    authType: "oauth2",
    isActive: true,
    priority: "high",
    features: [
      "Page Analytics",
      "Video Insights",
      "Ad Campaign Performance",
      "Audience Demographics",
    ],
    credentials: [
      {
        id: "facebook_app_id",
        provider: "facebook",
        type: "api_key",
        name: "App ID",
        description: "Facebook App ID from Facebook Developer Console",
        required: true,
        status: "missing",
        rateLimits: { requestsPerHour: 200 },
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
      {
        id: "facebook_access_token",
        provider: "facebook",
        type: "oauth2",
        name: "Page Access Token",
        description: "Facebook Page Access Token with required permissions",
        required: true,
        status: "missing",
        scopes: [
          "pages_manage_posts",
          "pages_read_engagement",
          "pages_show_list",
        ],
      },
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn Marketing API",
    category: "social_media",
    description: "LinkedIn company page analytics and marketing insights",
    baseUrl: "https://api.linkedin.com/v2",
    authType: "oauth2",
    isActive: true,
    priority: "high",
    features: [
      "Company Page Analytics",
      "Post Performance",
      "Follower Demographics",
      "Ad Campaign Insights",
    ],
    credentials: [
      {
        id: "linkedin_client_id",
        provider: "linkedin",
        type: "api_key",
        name: "Client ID",
        description: "LinkedIn App Client ID",
        required: true,
        status: "missing",
        rateLimits: { requestsPerHour: 100 },
      },
      {
        id: "linkedin_client_secret",
        provider: "linkedin",
        type: "api_key",
        name: "Client Secret",
        description: "LinkedIn App Client Secret",
        required: true,
        status: "missing",
      },
      {
        id: "linkedin_access_token",
        provider: "linkedin",
        type: "oauth2",
        name: "Access Token",
        description: "LinkedIn Access Token with marketing permissions",
        required: true,
        status: "missing",
        scopes: [
          "r_organization_social",
          "rw_organization_admin",
          "r_ads_reporting",
        ],
      },
    ],
  },
  {
    id: "twitter",
    name: "Twitter/X API v2",
    category: "social_media",
    description: "Twitter analytics, engagement tracking, and trend monitoring",
    baseUrl: "https://api.twitter.com/2",
    authType: "oauth2",
    isActive: true,
    priority: "high",
    features: [
      "Tweet Analytics",
      "Engagement Tracking",
      "Audience Insights",
      "Trending Topics",
    ],
    credentials: [
      {
        id: "twitter_api_key",
        provider: "twitter",
        type: "api_key",
        name: "API Key",
        description: "Twitter API Key from Developer Portal",
        required: true,
        status: "missing",
        rateLimits: { requestsPerHour: 300 },
      },
      {
        id: "twitter_api_secret",
        provider: "twitter",
        type: "api_key",
        name: "API Secret",
        description: "Twitter API Secret Key",
        required: true,
        status: "missing",
      },
      {
        id: "twitter_bearer_token",
        provider: "twitter",
        type: "api_key",
        name: "Bearer Token",
        description: "Twitter Bearer Token for app-only authentication",
        required: true,
        status: "missing",
      },
    ],
  },
  {
    id: "tiktok",
    name: "TikTok Business API",
    category: "social_media",
    description: "TikTok video analytics and creator insights",
    baseUrl: "https://business-api.tiktok.com",
    authType: "oauth2",
    isActive: true,
    priority: "medium",
    features: [
      "Video Performance",
      "Creator Insights",
      "Trending Analysis",
      "Hashtag Tracking",
    ],
    credentials: [
      {
        id: "tiktok_app_id",
        provider: "tiktok",
        type: "api_key",
        name: "App ID",
        description: "TikTok Business App ID",
        required: true,
        status: "missing",
        rateLimits: { requestsPerHour: 100 },
      },
      {
        id: "tiktok_app_secret",
        provider: "tiktok",
        type: "api_key",
        name: "App Secret",
        description: "TikTok Business App Secret",
        required: true,
        status: "missing",
      },
    ],
  },
  {
    id: "youtube",
    name: "YouTube Data API v3",
    category: "social_media",
    description: "YouTube channel analytics and video performance",
    baseUrl: "https://www.googleapis.com/youtube/v3",
    authType: "oauth2",
    isActive: true,
    priority: "medium",
    features: [
      "Channel Analytics",
      "Video Performance",
      "Subscriber Insights",
      "Comment Analysis",
    ],
    credentials: [
      {
        id: "youtube_api_key",
        provider: "youtube",
        type: "api_key",
        name: "API Key",
        description: "YouTube Data API Key from Google Cloud Console",
        required: true,
        status: "missing",
        rateLimits: { requestsPerDay: 10000 },
      },
      {
        id: "youtube_client_id",
        provider: "youtube",
        type: "oauth2",
        name: "OAuth Client ID",
        description: "Google OAuth Client ID for YouTube access",
        required: false,
        status: "missing",
      },
    ],
  },

  // PRODUCTIVITY PROVIDERS
  {
    id: "clickup",
    name: "ClickUp API",
    category: "productivity",
    description: "Task management and project tracking integration via OAuth",
    baseUrl: "https://api.clickup.com/api/v2",
    authType: "oauth2",
    isActive: true,
    priority: "high",
    features: [
      "Task Management",
      "Webhook Notifications",
      "Time Tracking",
      "Team Collaboration",
    ],
    credentials: [
      {
        id: "clickup_client_id",
        provider: "clickup",
        type: "api_key",
        name: "Client ID",
        description: "ClickUp OAuth App Client ID from your app settings",
        required: true,
        status: "missing",
        documentation: "https://clickup.com/api",
      },
      {
        id: "clickup_client_secret",
        provider: "clickup",
        type: "api_key",
        name: "Client Secret",
        description: "ClickUp OAuth App Client Secret (keep this secure)",
        required: true,
        status: "missing",
        documentation: "https://clickup.com/api",
      },
    ],
  },

  // ANALYTICS PROVIDERS
  {
    id: "google_analytics",
    name: "Google Analytics 4",
    category: "analytics",
    description: "Website analytics and user behavior tracking",
    baseUrl: "https://analyticsreporting.googleapis.com/v4",
    authType: "service_account",
    isActive: true,
    priority: "high",
    features: [
      "Traffic Analytics",
      "User Behavior",
      "Conversion Tracking",
      "Real-time Data",
    ],
    credentials: [
      {
        id: "ga4_service_account",
        provider: "google_analytics",
        type: "service_account",
        name: "Service Account JSON",
        description: "Google Analytics Service Account credentials",
        required: true,
        status: "missing",
        rateLimits: { requestsPerDay: 50000 },
      },
    ],
  },

  // WORKFLOW INTEGRATION
  {
    id: "n8n",
    name: "n8n Workflow Integration",
    category: "productivity",
    description: "Workflow automation and process orchestration",
    baseUrl: process.env.N8N_BASE_URL || "http://localhost:5678",
    authType: "api_key",
    isActive: true,
    priority: "high",
    features: [
      "Workflow Monitoring",
      "Execution Tracking",
      "Error Detection",
      "Performance Metrics",
    ],
    credentials: [
      {
        id: "n8n_api_key",
        provider: "n8n",
        type: "api_key",
        name: "API Key",
        description: "n8n Instance API Key",
        required: true,
        status: "missing",
      },
    ],
  },
];

// ====================================================================
// API CREDENTIALS MANAGER CLASS
// ====================================================================

export class APICredentialsManager {
  private static instance: APICredentialsManager;
  private providers: Map<string, APIProvider>;
  private validationCache: Map<string, CredentialValidationResult>;

  private constructor() {
    this.providers = new Map();
    this.validationCache = new Map();
    this.initializeProviders();
  }

  public static getInstance(): APICredentialsManager {
    if (!APICredentialsManager.instance) {
      APICredentialsManager.instance = new APICredentialsManager();
    }
    return APICredentialsManager.instance;
  }

  private initializeProviders(): void {
    API_PROVIDERS.forEach(provider => {
      this.providers.set(provider.id, { ...provider });
    });
    this.updateCredentialStatuses();
  }

  // ====================================================================
  // CREDENTIAL STATUS MANAGEMENT
  // ====================================================================

  private updateCredentialStatuses(): void {
    this.providers.forEach(provider => {
      provider.credentials.forEach(credential => {
        credential.status = this.checkCredentialStatus(credential);
      });
    });
  }

  private checkCredentialStatus(
    credential: APICredential
  ): "configured" | "missing" | "invalid" | "expired" {
    // First check if credential has a saved value
    let value = credential.value;

    // If no saved value, check environment variables as fallback
    if (!value) {
      const envKey = this.getEnvironmentKey(credential);
      value = process.env[envKey];
    }

    if (!value || value.startsWith("your_")) {
      return "missing";
    }

    // Check if token is expired (for OAuth tokens)
    if (credential.expiresAt && credential.expiresAt < new Date()) {
      return "expired";
    }

    return "configured";
  }

  private getEnvironmentKey(credential: APICredential): string {
    // Convert credential ID to environment variable format
    return credential.id.toUpperCase();
  }

  // ====================================================================
  // PUBLIC API METHODS
  // ====================================================================

  public async getAllProviders(): Promise<APIProvider[]> {
    try {
      // Get all providers from database first
      const databaseProviders =
        await credentialsDatabaseService.getAllProviders();
      if (databaseProviders && databaseProviders.length > 0) {
        return databaseProviders;
      }
    } catch (error) {
      console.error(
        "Error getting providers from database, falling back to in-memory:",
        error
      );
    }

    // Fallback to in-memory providers
    return Array.from(this.providers.values());
  }

  public getProvidersByCategory(
    category: APIProvider["category"]
  ): APIProvider[] {
    return Array.from(this.providers.values()).filter(
      p => p.category === category
    );
  }

  public async getProvider(
    providerId: string
  ): Promise<APIProvider | undefined> {
    try {
      // First try to get from database
      const databaseProvider =
        await credentialsDatabaseService.getProvider(providerId);
      if (databaseProvider) {
        return databaseProvider;
      }

      // Fallback to in-memory provider
      return this.providers.get(providerId);
    } catch (error) {
      console.error(
        "Error getting provider from database, falling back to in-memory:",
        error
      );
      return this.providers.get(providerId);
    }
  }

  public getCredentialStatus(
    providerId: string,
    credentialId: string
  ): APICredential | undefined {
    const provider = this.providers.get(providerId);
    return provider?.credentials.find(c => c.id === credentialId);
  }

  public getMissingCredentials(): APICredential[] {
    const missing: APICredential[] = [];
    this.providers.forEach(provider => {
      provider.credentials
        .filter(c => c.required && c.status === "missing")
        .forEach(c => missing.push(c));
    });
    return missing;
  }

  public getConfiguredCredentials(): APICredential[] {
    const configured: APICredential[] = [];
    this.providers.forEach(provider => {
      provider.credentials
        .filter(c => c.status === "configured")
        .forEach(c => configured.push(c));
    });
    return configured;
  }

  public getOverallHealth(): {
    totalProviders: number;
    activeProviders: number;
    configuredCredentials: number;
    missingCredentials: number;
    healthScore: number;
  } {
    const totalProviders = this.providers.size;
    const activeProviders = Array.from(this.providers.values()).filter(
      p => p.isActive
    ).length;

    let totalRequired = 0;
    let configured = 0;

    this.providers.forEach(provider => {
      provider.credentials.forEach(credential => {
        if (credential.required) {
          totalRequired++;
          if (credential.status === "configured") {
            configured++;
          }
        }
      });
    });

    const healthScore =
      totalRequired > 0 ? Math.round((configured / totalRequired) * 100) : 100;

    return {
      totalProviders,
      activeProviders,
      configuredCredentials: configured,
      missingCredentials: totalRequired - configured,
      healthScore,
    };
  }

  // ====================================================================
  // CREDENTIAL VALIDATION
  // ====================================================================

  public async validateCredential(
    providerId: string,
    credentialId: string
  ): Promise<CredentialValidationResult> {
    const cacheKey = `${providerId}_${credentialId}`;
    const cached = this.validationCache.get(cacheKey);

    // Return cached result if still valid (within 5 minutes)
    if (cached && Date.now() - cached.lastChecked.getTime() < 300000) {
      return cached;
    }

    const result = await this.performCredentialValidation(
      providerId,
      credentialId
    );
    this.validationCache.set(cacheKey, result);

    return result;
  }

  private async performCredentialValidation(
    providerId: string,
    credentialId: string
  ): Promise<CredentialValidationResult> {
    const provider = this.providers.get(providerId);
    const credential = provider?.credentials.find(c => c.id === credentialId);

    if (!provider || !credential) {
      return {
        isValid: false,
        message: "Provider or credential not found",
        lastChecked: new Date(),
      };
    }

    // First check if credential has a saved value
    let value = credential.value;

    // If no saved value, check environment variables as fallback
    if (!value) {
      const envKey = this.getEnvironmentKey(credential);
      value = process.env[envKey];
    }

    if (!value || value.startsWith("your_")) {
      return {
        isValid: false,
        message: "Credential not configured",
        lastChecked: new Date(),
      };
    }

    // Perform provider-specific validation
    try {
      const validation = await this.validateProviderCredential(
        provider,
        credential,
        value
      );
      return {
        ...validation,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        isValid: false,
        message: `Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        lastChecked: new Date(),
      };
    }
  }

  private async validateProviderCredential(
    provider: APIProvider,
    credential: APICredential,
    value: string
  ): Promise<
    Omit<CredentialValidationResult, "provider" | "credential" | "lastChecked">
  > {
    // Basic validation - more sophisticated validation would make actual API calls
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check format based on credential type
    if (credential.type === "api_key" && value.length < 10) {
      errors.push("API key appears to be too short");
    }

    if (credential.type === "oauth2" && !value.includes(".")) {
      warnings.push("OAuth token format may be invalid");
    }

    // Check expiration for OAuth tokens
    if (credential.expiresAt && credential.expiresAt < new Date()) {
      errors.push("Token has expired");
    }

    return {
      isValid: errors.length === 0,
      message:
        errors.join(", ") +
        (warnings.length > 0 ? `\nWarnings: ${warnings.join(", ")}` : ""),
      details: {
        rateLimits: {
          remaining: 0, // Assuming no rate limit information is available
          resetTime: new Date(),
        },
        scopes: credential.scopes,
        expiresAt: credential.expiresAt,
      },
    };
  }

  // ====================================================================
  // REGISTRATION HELPERS
  // ====================================================================

  public getRegistrationInstructions(providerId: string): {
    provider: APIProvider;
    steps: string[];
    documentation: string[];
    requiredScopes: string[];
  } | null {
    const provider = this.providers.get(providerId);
    if (!provider) return null;

    const steps = this.generateRegistrationSteps(provider);
    const documentation = provider.credentials
      .map(c => c.documentation)
      .filter(Boolean) as string[];
    const requiredScopes = provider.credentials.flatMap(c => c.scopes || []);

    return {
      provider,
      steps,
      documentation,
      requiredScopes,
    };
  }

  private generateRegistrationSteps(provider: APIProvider): string[] {
    const steps: string[] = [];

    switch (provider.authType) {
      case "oauth2":
        steps.push(
          `Visit the ${provider.name} Developer Console`,
          "Create a new application/project",
          "Configure OAuth settings and redirect URIs",
          "Copy the Client ID and Client Secret",
          "Complete OAuth flow to get access tokens",
          "Add credentials to your environment variables"
        );
        break;

      case "api_key":
        steps.push(
          `Log in to your ${provider.name} account`,
          "Navigate to API settings or developer section",
          "Generate a new API key/token",
          "Copy the API key securely",
          "Add the API key to your environment variables"
        );
        break;

      case "service_account":
        steps.push(
          `Access the ${provider.name} console`,
          "Create a new service account",
          "Download the service account JSON file",
          "Store the JSON securely",
          "Add service account details to environment variables"
        );
        break;
    }

    return steps;
  }

  // ====================================================================
  // REFRESH & UPDATES
  // ====================================================================

  public refresh(): void {
    this.updateCredentialStatuses();
    this.validationCache.clear();
  }

  public updateCredentialExpiry(
    providerId: string,
    credentialId: string,
    expiresAt: Date
  ): void {
    const provider = this.providers.get(providerId);
    const credential = provider?.credentials.find(c => c.id === credentialId);

    if (credential) {
      credential.expiresAt = expiresAt;
      credential.status = this.checkCredentialStatus(credential);
    }
  }

  public async saveCredential(
    providerId: string,
    credentialId: string,
    value: string
  ): Promise<CredentialSaveResult> {
    try {
      // First try to save to database
      const databaseResult = await credentialsDatabaseService.saveCredential(
        providerId,
        credentialId,
        value
      );

      if (databaseResult.success) {
        // If database save was successful, also update in-memory cache
        const provider = this.providers.get(providerId);
        const credential = provider?.credentials.find(
          c => c.id === credentialId
        );

        if (credential) {
          credential.value = value;
          credential.status = "configured";
        }

        return databaseResult;
      }

      // Fallback to in-memory only if database fails
      const provider = this.providers.get(providerId);
      const credential = provider?.credentials.find(c => c.id === credentialId);

      if (!provider || !credential) {
        return {
          success: false,
          status: "invalid",
          error: "Provider or credential not found",
        };
      }

      // Save the value directly to the credential object
      credential.value = value;

      // Also set environment variable as fallback
      const envKey = this.getEnvironmentKey(credential);
      process.env[envKey] = value;

      // Update status based on the new value
      credential.status = this.checkCredentialStatus(credential);

      return {
        success: true,
        status: credential.status,
      };
    } catch (error) {
      return {
        success: false,
        status: "invalid",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// ====================================================================
// SINGLETON EXPORT
// ====================================================================

export const apiCredentialsManager = APICredentialsManager.getInstance();
