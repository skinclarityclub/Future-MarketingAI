import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createRBACService, UserRoleType } from "@/lib/rbac/rbac-service";

// SSO Provider Types
export type SSOProviderType =
  | "okta"
  | "azure_ad"
  | "google_workspace"
  | "auth0"
  | "generic_saml"
  | "generic_oidc";

export type SSOProtocol = "saml2" | "oidc" | "oauth2";

export type SSOConfigStatus =
  | "active"
  | "inactive"
  | "testing"
  | "disabled"
  | "error";

export type UserProvisioningType = "jit" | "manual" | "scim" | "sync";

// SSO Provider Configuration Interface
export interface SSOProvider {
  id: string;
  name: string;
  display_name: string;
  provider_type: SSOProviderType;
  protocol: SSOProtocol;
  status: SSOConfigStatus;
  is_default: boolean;
  priority: number;

  // Connection details
  issuer_url?: string;
  sso_url: string;
  sls_url?: string;
  metadata_url?: string;

  // Certificates and security
  x509_certificate?: string;
  certificate_fingerprint?: string;
  signing_algorithm: string;

  // OIDC configuration
  client_id?: string;
  client_secret_encrypted?: string;
  authorization_endpoint?: string;
  token_endpoint?: string;
  userinfo_endpoint?: string;
  jwks_uri?: string;

  // SAML configuration
  entity_id?: string;
  acs_url?: string;
  name_id_format?: string;

  // User provisioning
  provisioning_type: UserProvisioningType;
  auto_create_users: boolean;
  auto_update_users: boolean;

  // Mappings
  role_mapping: Record<string, any>;
  attribute_mapping: Record<string, any>;
  default_role: string;

  // Metadata
  extra_config: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

// SSO Session Interface
export interface SSOSession {
  id: string;
  session_id: string;
  provider_session_id?: string;
  saml_session_index?: string;
  user_id: string;
  provider_id: string;
  name_id?: string;
  name_id_format?: string;
  session_not_on_or_after?: Date;
  auth_method?: string;
  auth_instant: Date;
  auth_context_class?: string;
  is_active: boolean;
  logout_requested: boolean;
  logout_completed: boolean;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
  updated_at: Date;
  expires_at?: Date;
  logged_out_at?: Date;
}

// SSO User Mapping Interface
export interface SSOUserMapping {
  id: string;
  user_id: string;
  provider_id: string;
  external_user_id: string;
  external_email?: string;
  external_name?: string;
  external_groups: string[];
  external_roles: string[];
  first_login_at: Date;
  last_login_at: Date;
  login_count: number;
  is_jit_provisioned: boolean;
  auto_created: boolean;
  sync_enabled: boolean;
  cached_attributes: Record<string, any>;
  last_sync_at: Date;
  created_at: Date;
  updated_at: Date;
}

// SSO Authentication Event Interface
export interface SSOAuthEvent {
  id: string;
  event_type: "login" | "logout" | "failed_login" | "session_timeout";
  event_id: string;
  user_id?: string;
  provider_id?: string;
  session_id?: string;
  success: boolean;
  error_code?: string;
  error_message?: string;
  ip_address?: string;
  user_agent?: string;
  request_id?: string;
  saml_request_id?: string;
  saml_response_id?: string;
  oidc_state?: string;
  oidc_nonce?: string;
  metadata: Record<string, any>;
  event_timestamp: Date;
  created_at: Date;
}

// SAML Response Interface
export interface SAMLResponse {
  nameId: string;
  nameIdFormat?: string;
  sessionIndex?: string;
  attributes: Record<string, any>;
  groups?: string[];
  roles?: string[];
  issuer: string;
  audience?: string;
  inResponseTo?: string;
  destination?: string;
}

// OIDC Token Response Interface
export interface OIDCTokenResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

// OIDC User Info Interface
export interface OIDCUserInfo {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  groups?: string[];
  roles?: string[];
  [key: string]: any;
}

/**
 * Comprehensive SSO Service for Enterprise Authentication
 */
export class SSOService {
  private supabase: any;
  private rbacService: any;

  constructor(supabaseClient?: any) {
    this.supabase = supabaseClient;
    this.rbacService = createRBACService(supabaseClient);
  }

  /**
   * Get all active SSO providers
   */
  async getActiveProviders(): Promise<SSOProvider[]> {
    const { data, error } = await this.supabase
      .from("sso_providers")
      .select("*")
      .eq("status", "active")
      .order("priority", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch SSO providers: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get SSO provider by ID
   */
  async getProvider(providerId: string): Promise<SSOProvider | null> {
    const { data, error } = await this.supabase
      .from("sso_providers")
      .select("*")
      .eq("id", providerId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch SSO provider: ${error.message}`);
    }

    return data;
  }

  /**
   * Get SSO provider by name
   */
  async getProviderByName(name: string): Promise<SSOProvider | null> {
    const { data, error } = await this.supabase
      .from("sso_providers")
      .select("*")
      .eq("name", name)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch SSO provider: ${error.message}`);
    }

    return data;
  }

  /**
   * Create or update SSO provider configuration
   */
  async upsertProvider(provider: Partial<SSOProvider>): Promise<SSOProvider> {
    const { data, error } = await this.supabase
      .from("sso_providers")
      .upsert(provider)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to upsert SSO provider: ${error.message}`);
    }

    // Log configuration change
    await this.logAuthEvent(
      "config_change",
      undefined,
      provider.id,
      undefined,
      true,
      undefined,
      undefined,
      undefined,
      undefined,
      {
        action: "provider_upsert",
        provider_name: provider.name,
        provider_type: provider.provider_type,
      }
    );

    return data;
  }

  /**
   * Generate SAML authentication request URL
   */
  async generateSAMLAuthURL(
    providerName: string,
    relayState?: string,
    forceAuth?: boolean
  ): Promise<string> {
    const provider = await this.getProviderByName(providerName);
    if (!provider || provider.protocol !== "saml2") {
      throw new Error("Invalid SAML provider");
    }

    // Generate SAML AuthnRequest
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    const authnRequest = this.buildSAMLAuthnRequest({
      id: requestId,
      timestamp,
      destination: provider.sso_url,
      issuer: provider.entity_id || "skc-bi-dashboard",
      acsUrl:
        provider.acs_url ||
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/saml/callback`,
      nameIdFormat: provider.name_id_format,
      forceAuth,
    });

    // Encode and sign if necessary
    const encodedRequest = Buffer.from(authnRequest).toString("base64");

    // Build redirect URL
    const params = new URLSearchParams({
      SAMLRequest: encodedRequest,
      ...(relayState && { RelayState: relayState }),
    });

    return `${provider.sso_url}?${params.toString()}`;
  }

  /**
   * Generate OIDC authentication URL
   */
  async generateOIDCAuthURL(
    providerName: string,
    state?: string,
    redirectUri?: string
  ): Promise<string> {
    const provider = await this.getProviderByName(providerName);
    if (
      !provider ||
      (provider.protocol !== "oidc" && provider.protocol !== "oauth2")
    ) {
      throw new Error("Invalid OIDC provider");
    }

    const nonce = this.generateNonce();
    const authState = state || this.generateState();

    const params = new URLSearchParams({
      response_type: "code",
      client_id: provider.client_id!,
      redirect_uri:
        redirectUri ||
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/oidc/callback`,
      scope: "openid profile email",
      state: authState,
      nonce,
    });

    return `${provider.authorization_endpoint}?${params.toString()}`;
  }

  /**
   * Process SAML response
   */
  async processSAMLResponse(
    samlResponse: string,
    relayState?: string
  ): Promise<{ user: any; session: SSOSession; isNewUser: boolean }> {
    // Decode and validate SAML response
    const decodedResponse = Buffer.from(samlResponse, "base64").toString();
    const parsedResponse = await this.parseSAMLResponse(decodedResponse);

    // Find provider by issuer
    const provider = await this.getProviderByIssuer(parsedResponse.issuer);
    if (!provider) {
      throw new Error("Unknown SAML issuer");
    }

    // Extract user information
    const externalUserId = parsedResponse.nameId;
    const userAttributes = this.mapSAMLAttributes(
      parsedResponse.attributes,
      provider.attribute_mapping
    );

    // Find or create user
    const { user, isNewUser } = await this.findOrCreateUser(
      provider,
      externalUserId,
      userAttributes
    );

    // Create SSO session
    const session = await this.createSSOSession({
      user_id: user.id,
      provider_id: provider.id,
      name_id: parsedResponse.nameId,
      name_id_format: parsedResponse.nameIdFormat,
      saml_session_index: parsedResponse.sessionIndex,
      auth_method: "saml",
      ip_address: this.getCurrentIP(),
      user_agent: this.getCurrentUserAgent(),
    });

    // Update user roles based on SAML attributes
    await this.updateUserRoles(user.id, provider, parsedResponse.roles || []);

    // Log successful authentication
    await this.logAuthEvent(
      "login",
      user.id,
      provider.id,
      session.session_id,
      true
    );

    return { user, session, isNewUser };
  }

  /**
   * Process OIDC authorization code
   */
  async processOIDCCallback(
    code: string,
    state: string,
    redirectUri: string,
    providerName: string
  ): Promise<{ user: any; session: SSOSession; isNewUser: boolean }> {
    const provider = await this.getProviderByName(providerName);
    if (
      !provider ||
      (provider.protocol !== "oidc" && provider.protocol !== "oauth2")
    ) {
      throw new Error("Invalid OIDC provider");
    }

    // Exchange code for tokens
    const tokenResponse = await this.exchangeOIDCCode(
      provider,
      code,
      redirectUri
    );

    // Get user info
    const userInfo = await this.getOIDCUserInfo(
      provider,
      tokenResponse.access_token
    );

    // Find or create user
    const { user, isNewUser } = await this.findOrCreateUser(
      provider,
      userInfo.sub,
      this.mapOIDCAttributes(userInfo, provider.attribute_mapping)
    );

    // Create SSO session
    const session = await this.createSSOSession({
      user_id: user.id,
      provider_id: provider.id,
      name_id: userInfo.sub,
      auth_method: "oidc",
      ip_address: this.getCurrentIP(),
      user_agent: this.getCurrentUserAgent(),
    });

    // Update user roles
    await this.updateUserRoles(user.id, provider, userInfo.roles || []);

    // Log successful authentication
    await this.logAuthEvent(
      "login",
      user.id,
      provider.id,
      session.session_id,
      true
    );

    return { user, session, isNewUser };
  }

  /**
   * Initiate Single Logout
   */
  async initiateSingleLogout(
    sessionId: string,
    redirectUrl?: string
  ): Promise<string | null> {
    const session = await this.getSSOSession(sessionId);
    if (!session || !session.is_active) {
      return null;
    }

    const provider = await this.getProvider(session.provider_id);
    if (!provider) {
      throw new Error("Provider not found");
    }

    // Mark session for logout
    await this.updateSSOSession(sessionId, {
      logout_requested: true,
    });

    if (provider.protocol === "saml2" && provider.sls_url) {
      // Generate SAML LogoutRequest
      const logoutRequest = this.buildSAMLLogoutRequest({
        sessionIndex: session.saml_session_index,
        nameId: session.name_id,
        destination: provider.sls_url,
        issuer: provider.entity_id || "skc-bi-dashboard",
      });

      const encodedRequest = Buffer.from(logoutRequest).toString("base64");
      const params = new URLSearchParams({
        SAMLRequest: encodedRequest,
        ...(redirectUrl && { RelayState: redirectUrl }),
      });

      return `${provider.sls_url}?${params.toString()}`;
    }

    // For OIDC providers without logout endpoint, just mark as completed
    await this.completeSSOLogout(sessionId);
    return redirectUrl || null;
  }

  /**
   * Complete SSO logout
   */
  async completeSSOLogout(sessionId: string): Promise<void> {
    await this.updateSSOSession(sessionId, {
      is_active: false,
      logout_completed: true,
      logged_out_at: new Date(),
    });

    const session = await this.getSSOSession(sessionId);
    if (session) {
      await this.logAuthEvent(
        "logout",
        session.user_id,
        session.provider_id,
        sessionId,
        true
      );
    }
  }

  /**
   * Get SSO session
   */
  async getSSOSession(sessionId: string): Promise<SSOSession | null> {
    const { data, error } = await this.supabase
      .from("sso_sessions")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch SSO session: ${error.message}`);
    }

    return data;
  }

  /**
   * Create SSO session
   */
  async createSSOSession(
    sessionData: Partial<SSOSession>
  ): Promise<SSOSession> {
    const sessionId = this.generateSessionId();

    const { data, error } = await this.supabase
      .from("sso_sessions")
      .insert({
        ...sessionData,
        session_id: sessionId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create SSO session: ${error.message}`);
    }

    return data;
  }

  /**
   * Update SSO session
   */
  async updateSSOSession(
    sessionId: string,
    updates: Partial<SSOSession>
  ): Promise<void> {
    const { error } = await this.supabase
      .from("sso_sessions")
      .update(updates)
      .eq("session_id", sessionId);

    if (error) {
      throw new Error(`Failed to update SSO session: ${error.message}`);
    }
  }

  /**
   * Find or create user from SSO authentication
   */
  private async findOrCreateUser(
    provider: SSOProvider,
    externalUserId: string,
    userAttributes: Record<string, any>
  ): Promise<{ user: any; isNewUser: boolean }> {
    // Check if user mapping exists
    const { data: mapping } = await this.supabase
      .from("sso_user_mappings")
      .select("*, users(*)")
      .eq("provider_id", provider.id)
      .eq("external_user_id", externalUserId)
      .single();

    if (mapping && mapping.users) {
      // Update existing mapping
      await this.updateUserMapping(mapping.id, userAttributes);
      return { user: mapping.users, isNewUser: false };
    }

    // Check if user exists by email
    const email = userAttributes.email;
    let user = null;
    let isNewUser = false;

    if (email) {
      const { data: existingUser } = await this.supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      user = existingUser;
    }

    if (!user && provider.auto_create_users) {
      // Create new user
      const { data: newUser, error } =
        await this.supabase.auth.admin.createUser({
          email: email || `${externalUserId}@sso.local`,
          email_confirm: true,
          user_metadata: {
            name: userAttributes.name,
            sso_provider: provider.name,
            external_user_id: externalUserId,
          },
        });

      if (error) {
        throw new Error(`Failed to create user: ${error.message}`);
      }

      user = newUser.user;
      isNewUser = true;
    }

    if (!user) {
      throw new Error("User not found and auto-creation is disabled");
    }

    // Create or update user mapping
    await this.upsertUserMapping(
      user.id,
      provider.id,
      externalUserId,
      userAttributes
    );

    return { user, isNewUser };
  }

  /**
   * Update user roles based on SSO provider mapping
   */
  private async updateUserRoles(
    userId: string,
    provider: SSOProvider,
    externalRoles: string[]
  ): Promise<void> {
    // Get role mappings for this provider
    const { data: roleMappings } = await this.supabase
      .from("sso_role_mappings")
      .select("*")
      .eq("provider_id", provider.id)
      .in("external_role", externalRoles)
      .order("priority");

    const internalRoles = roleMappings?.map(rm => rm.internal_role) || [
      provider.default_role as UserRoleType,
    ];

    // Assign roles using RBAC service
    for (const role of internalRoles) {
      try {
        await this.rbacService.assignRole(userId, role, "system");
      } catch (error) {
        console.error(
          `Failed to assign role ${role} to user ${userId}:`,
          error
        );
      }
    }
  }

  /**
   * Log SSO authentication event
   */
  async logAuthEvent(
    eventType: string,
    userId?: string,
    providerId?: string,
    sessionId?: string,
    success: boolean = true,
    errorCode?: string,
    errorMessage?: string,
    ipAddress?: string,
    userAgent?: string,
    metadata: Record<string, any> = {}
  ): Promise<string> {
    const { data } = await this.supabase.rpc("log_sso_authentication_event", {
      p_event_type: eventType,
      p_user_id: userId,
      p_provider_id: providerId,
      p_session_id: sessionId,
      p_success: success,
      p_error_code: errorCode,
      p_error_message: errorMessage,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
      p_metadata: metadata,
    });

    return data;
  }

  // Helper methods for SAML/OIDC processing
  private generateRequestId(): string {
    return `_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `sso_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  private generateNonce(): string {
    return Math.random().toString(36).substr(2, 16);
  }

  private generateState(): string {
    return Math.random().toString(36).substr(2, 16);
  }

  private getCurrentIP(): string {
    // This would be extracted from request headers in actual implementation
    return "0.0.0.0";
  }

  private getCurrentUserAgent(): string {
    // This would be extracted from request headers in actual implementation
    return "SKC-BI-Dashboard";
  }

  // Placeholder methods for SAML/OIDC processing
  private async parseSAMLResponse(response: string): Promise<SAMLResponse> {
    // Implementation would use a SAML library like saml2-js or node-saml
    throw new Error("SAML parsing not implemented");
  }

  private buildSAMLAuthnRequest(params: any): string {
    // Implementation would build proper SAML AuthnRequest XML
    throw new Error("SAML AuthnRequest building not implemented");
  }

  private buildSAMLLogoutRequest(params: any): string {
    // Implementation would build proper SAML LogoutRequest XML
    throw new Error("SAML LogoutRequest building not implemented");
  }

  private async exchangeOIDCCode(
    provider: SSOProvider,
    code: string,
    redirectUri: string
  ): Promise<OIDCTokenResponse> {
    // Implementation would make HTTP request to token endpoint
    throw new Error("OIDC token exchange not implemented");
  }

  private async getOIDCUserInfo(
    provider: SSOProvider,
    accessToken: string
  ): Promise<OIDCUserInfo> {
    // Implementation would make HTTP request to userinfo endpoint
    throw new Error("OIDC userinfo not implemented");
  }

  private mapSAMLAttributes(
    attributes: Record<string, any>,
    mapping: Record<string, any>
  ): Record<string, any> {
    // Apply attribute mapping configuration
    const mapped: Record<string, any> = {};

    for (const [internal, external] of Object.entries(mapping)) {
      if (attributes[external]) {
        mapped[internal] = attributes[external];
      }
    }

    return mapped;
  }

  private mapOIDCAttributes(
    userInfo: OIDCUserInfo,
    mapping: Record<string, any>
  ): Record<string, any> {
    // Apply attribute mapping configuration
    const mapped: Record<string, any> = {};

    for (const [internal, external] of Object.entries(mapping)) {
      if (userInfo[external]) {
        mapped[internal] = userInfo[external];
      }
    }

    return mapped;
  }

  private async getProviderByIssuer(
    issuer: string
  ): Promise<SSOProvider | null> {
    const { data, error } = await this.supabase
      .from("sso_providers")
      .select("*")
      .eq("issuer_url", issuer)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(
        `Failed to fetch SSO provider by issuer: ${error.message}`
      );
    }

    return data;
  }

  private async upsertUserMapping(
    userId: string,
    providerId: string,
    externalUserId: string,
    attributes: Record<string, any>
  ): Promise<void> {
    await this.supabase.rpc("upsert_sso_user_mapping", {
      p_user_id: userId,
      p_provider_id: providerId,
      p_external_user_id: externalUserId,
      p_external_email: attributes.email,
      p_external_name: attributes.name,
      p_external_groups: attributes.groups || [],
      p_external_roles: attributes.roles || [],
      p_cached_attributes: attributes,
    });
  }

  private async updateUserMapping(
    mappingId: string,
    attributes: Record<string, any>
  ): Promise<void> {
    await this.supabase
      .from("sso_user_mappings")
      .update({
        external_email: attributes.email,
        external_name: attributes.name,
        external_groups: attributes.groups || [],
        external_roles: attributes.roles || [],
        cached_attributes: attributes,
        last_login_at: new Date(),
        last_sync_at: new Date(),
      })
      .eq("id", mappingId);
  }
}

/**
 * Create SSO service instance with Supabase client
 */
export function createSSOService(supabaseClient?: any): SSOService {
  if (supabaseClient) {
    return new SSOService(supabaseClient);
  }

  // Create browser client for client-side usage
  if (typeof window !== "undefined") {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    return new SSOService(supabase);
  }

  // Create server client for server-side usage
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  return new SSOService(supabase);
}
