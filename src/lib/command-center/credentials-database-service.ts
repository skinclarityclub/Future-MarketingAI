/**
 * Credentials Database Service
 * Handles database operations for API credentials management
 */

import { createClient } from "@supabase/supabase-js";
import {
  APIProvider,
  APICredential,
  CredentialSaveResult,
} from "./api-credentials-manager";

export interface DatabaseCredential {
  id: string;
  provider_id: string;
  credential_id: string;
  credential_type: string;
  name: string;
  description: string;
  encrypted_value: string | null;
  is_required: boolean;
  status: string;
  last_validated_at: string | null;
  expires_at: string | null;
  scopes: string[];
  endpoints: string[];
  rate_limits: any;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProvider {
  id: string;
  name: string;
  category: string;
  description: string;
  base_url: string | null;
  auth_type: string;
  is_active: boolean;
  priority: string;
  features: string[];
  documentation_url: string | null;
  rate_limits: any;
  created_at: string;
  updated_at: string;
}

export class CredentialsDatabaseService {
  private supabase;
  private providersCache: Map<
    string,
    { data: APIProvider[]; timestamp: number }
  > = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_TTL;
  }

  private clearCache(): void {
    this.providersCache.clear();
  }

  // ====================================================================
  // PROVIDER OPERATIONS
  // ====================================================================

  async getAllProviders(): Promise<APIProvider[]> {
    try {
      // Check cache first
      const cached = this.providersCache.get("all");
      if (cached && this.isCacheValid(cached.timestamp)) {
        return cached.data;
      }

      // OPTIMIZED: Single query with JOIN to get all data at once
      const { data: providersWithCredentials, error } = await this.supabase
        .from("api_providers")
        .select(
          `
          *,
          api_credentials (*)
        `
        )
        .order("priority", { ascending: false });

      if (error) {
        console.error("Error fetching providers with credentials:", error);
        return [];
      }

      // Group credentials by provider and map to API format
      const mappedProviders = providersWithCredentials.map((provider: any) => {
        const credentials = (provider.api_credentials || []).map(
          (cred: DatabaseCredential) =>
            this.mapDatabaseCredentialToAPICredential(cred)
        );
        return this.mapDatabaseProviderToAPIProvider(provider, credentials);
      });

      // Cache the result
      this.providersCache.set("all", {
        data: mappedProviders,
        timestamp: Date.now(),
      });

      return mappedProviders;
    } catch (error) {
      console.error("Error in getAllProviders:", error);
      return [];
    }
  }

  async getProvider(providerId: string): Promise<APIProvider | null> {
    try {
      // OPTIMIZED: Single query with JOIN for specific provider
      const { data: provider, error } = await this.supabase
        .from("api_providers")
        .select(
          `
          *,
          api_credentials (*)
        `
        )
        .eq("id", providerId)
        .single();

      if (error || !provider) {
        console.error("Error fetching provider:", error);
        return null;
      }

      const credentials = (provider.api_credentials || []).map(
        (cred: DatabaseCredential) =>
          this.mapDatabaseCredentialToAPICredential(cred)
      );
      return this.mapDatabaseProviderToAPIProvider(provider, credentials);
    } catch (error) {
      console.error("Error in getProvider:", error);
      return null;
    }
  }

  // ====================================================================
  // CREDENTIAL OPERATIONS
  // ====================================================================

  async getCredentialsForProvider(
    providerId: string
  ): Promise<APICredential[]> {
    try {
      const { data: credentials, error } = await this.supabase
        .from("api_credentials")
        .select("*")
        .eq("provider_id", providerId)
        .order("credential_id");

      if (error) {
        console.error("Error fetching credentials:", error);
        return [];
      }

      return credentials.map((cred: DatabaseCredential) =>
        this.mapDatabaseCredentialToAPICredential(cred)
      );
    } catch (error) {
      console.error("Error in getCredentialsForProvider:", error);
      return [];
    }
  }

  async saveCredential(
    providerId: string,
    credentialId: string,
    value: string
  ): Promise<CredentialSaveResult> {
    try {
      // First, check if the credential exists
      const { data: existing, error: fetchError } = await this.supabase
        .from("api_credentials")
        .select("*")
        .eq("provider_id", providerId)
        .eq("credential_id", credentialId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error checking existing credential:", fetchError);
        return {
          success: false,
          status: "invalid",
          error: "Failed to check existing credential",
        };
      }

      // Update the credential value
      const { error: updateError } = await this.supabase
        .from("api_credentials")
        .update({
          encrypted_value: value, // In production, encrypt this value
          status: "configured",
          updated_at: new Date().toISOString(),
        })
        .eq("provider_id", providerId)
        .eq("credential_id", credentialId);

      if (updateError) {
        console.error("Error updating credential:", updateError);
        return {
          success: false,
          status: "invalid",
          error: updateError.message,
        };
      }

      // Clear cache after successful update
      this.clearCache();

      // Log the usage
      await this.logCredentialUsage(providerId, credentialId, "save", true);

      return {
        success: true,
        status: "configured",
      };
    } catch (error) {
      console.error("Error in saveCredential:", error);
      return {
        success: false,
        status: "invalid",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async validateCredential(
    providerId: string,
    credentialId: string
  ): Promise<boolean> {
    try {
      const { data: credential, error } = await this.supabase
        .from("api_credentials")
        .select("encrypted_value, status")
        .eq("provider_id", providerId)
        .eq("credential_id", credentialId)
        .single();

      if (error || !credential) {
        return false;
      }

      const isValid = !!(
        credential.encrypted_value && credential.encrypted_value.trim()
      );

      // Update last validated timestamp
      if (isValid) {
        await this.supabase
          .from("api_credentials")
          .update({
            last_validated_at: new Date().toISOString(),
            status: "configured",
          })
          .eq("provider_id", providerId)
          .eq("credential_id", credentialId);
      }

      // Log the validation attempt
      await this.logCredentialUsage(
        providerId,
        credentialId,
        "validate",
        isValid
      );

      return isValid;
    } catch (error) {
      console.error("Error in validateCredential:", error);
      return false;
    }
  }

  async getCredentialValue(
    providerId: string,
    credentialId: string
  ): Promise<string | null> {
    try {
      const { data: credential, error } = await this.supabase
        .from("api_credentials")
        .select("encrypted_value")
        .eq("provider_id", providerId)
        .eq("credential_id", credentialId)
        .single();

      if (error || !credential) {
        return null;
      }

      // In production, decrypt the value here
      return credential.encrypted_value;
    } catch (error) {
      console.error("Error in getCredentialValue:", error);
      return null;
    }
  }

  // ====================================================================
  // HEALTH AND MONITORING
  // ====================================================================

  async getOverallHealth(): Promise<{
    totalProviders: number;
    activeProviders: number;
    configuredCredentials: number;
    missingCredentials: number;
    healthScore: number;
  }> {
    try {
      // OPTIMIZED: Use materialized view for instant health checks
      const { data: healthSummary, error } = await this.supabase
        .from("credentials_health_summary")
        .select("*")
        .single();

      if (error || !healthSummary) {
        console.warn(
          "Materialized view not available, falling back to live query:",
          error
        );
        // Fallback to live query if materialized view is not available
        return this.getLiveHealthData();
      }

      return {
        totalProviders: healthSummary.total_providers || 0,
        activeProviders: healthSummary.active_providers || 0,
        configuredCredentials: healthSummary.configured_required || 0,
        missingCredentials: healthSummary.missing_required || 0,
        healthScore: Math.round(healthSummary.health_score_percent || 0),
      };
    } catch (error) {
      console.error("Error in getOverallHealth:", error);
      return {
        totalProviders: 0,
        activeProviders: 0,
        configuredCredentials: 0,
        missingCredentials: 0,
        healthScore: 0,
      };
    }
  }

  private async getLiveHealthData(): Promise<{
    totalProviders: number;
    activeProviders: number;
    configuredCredentials: number;
    missingCredentials: number;
    healthScore: number;
  }> {
    const { data: providersCount } = await this.supabase
      .from("api_providers")
      .select("id, is_active");

    const { data: credentialsStats } = await this.supabase
      .from("api_credentials")
      .select("status, is_required");

    const totalProviders = providersCount?.length || 0;
    const activeProviders =
      providersCount?.filter(p => p.is_active).length || 0;

    const requiredCredentials =
      credentialsStats?.filter(c => c.is_required) || [];
    const configuredCredentials = requiredCredentials.filter(
      c => c.status === "configured"
    ).length;
    const missingCredentials =
      requiredCredentials.length - configuredCredentials;

    const healthScore =
      requiredCredentials.length > 0
        ? Math.round((configuredCredentials / requiredCredentials.length) * 100)
        : 100;

    return {
      totalProviders,
      activeProviders,
      configuredCredentials,
      missingCredentials,
      healthScore,
    };
  }

  // ====================================================================
  // PRIVATE HELPER METHODS
  // ====================================================================

  private async logCredentialUsage(
    providerId: string,
    credentialId: string,
    action: string,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    try {
      // Get the credential UUID first
      const { data: credential } = await this.supabase
        .from("api_credentials")
        .select("id")
        .eq("provider_id", providerId)
        .eq("credential_id", credentialId)
        .single();

      if (credential) {
        await this.supabase.from("credential_usage_logs").insert({
          credential_id: credential.id,
          provider_id: providerId,
          action,
          success,
          error_message: errorMessage || null,
        });
      }
    } catch (error) {
      console.error("Error logging credential usage:", error);
    }
  }

  private mapDatabaseProviderToAPIProvider(
    dbProvider: DatabaseProvider,
    credentials: APICredential[]
  ): APIProvider {
    return {
      id: dbProvider.id,
      name: dbProvider.name,
      category: dbProvider.category as APIProvider["category"],
      description: dbProvider.description,
      baseUrl: dbProvider.base_url || undefined,
      authType: dbProvider.auth_type as APIProvider["authType"],
      credentials,
      isActive: dbProvider.is_active,
      priority: dbProvider.priority as APIProvider["priority"],
      features: dbProvider.features || [],
    };
  }

  private mapDatabaseCredentialToAPICredential(
    dbCred: DatabaseCredential
  ): APICredential {
    return {
      id: dbCred.credential_id,
      provider: dbCred.provider_id,
      type: dbCred.credential_type as APICredential["type"],
      name: dbCred.name,
      description: dbCred.description,
      required: dbCred.is_required,
      status: dbCred.status as APICredential["status"],
      lastValidated: dbCred.last_validated_at
        ? new Date(dbCred.last_validated_at)
        : undefined,
      expiresAt: dbCred.expires_at ? new Date(dbCred.expires_at) : undefined,
      scopes: dbCred.scopes || [],
      endpoints: dbCred.endpoints || [],
      rateLimits: dbCred.rate_limits || undefined,
      value: dbCred.encrypted_value || undefined,
    };
  }
}

// Export singleton instance
export const credentialsDatabaseService = new CredentialsDatabaseService();
