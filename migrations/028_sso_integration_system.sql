/**
 * Migration: Enterprise SSO Integration System
 * Task 37.5: Integrate Single Sign-On (SSO) with Popular Providers
 * 
 * Comprehensive SSO system supporting multiple enterprise providers:
 * - Okta, Azure AD, Google Workspace, Auth0
 * - SAML 2.0 and OpenID Connect protocols
 * - Just-in-time (JIT) user provisioning
 * - Role mapping and session management
 */

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- SSO Provider Types enum
CREATE TYPE sso_provider_type AS ENUM (
    'okta',
    'azure_ad',
    'google_workspace',
    'auth0',
    'generic_saml',
    'generic_oidc'
);

-- SSO Protocol Types enum
CREATE TYPE sso_protocol_type AS ENUM (
    'saml2',
    'oidc',
    'oauth2'
);

-- SSO Configuration Status enum
CREATE TYPE sso_config_status AS ENUM (
    'active',
    'inactive',
    'testing',
    'disabled',
    'error'
);

-- User Provisioning Types enum
CREATE TYPE user_provisioning_type AS ENUM (
    'jit', -- Just-in-time
    'manual',
    'scim', -- System for Cross-domain Identity Management
    'sync'  -- Scheduled synchronization
);

-- =============================================
-- SSO Providers Configuration Table
-- =============================================
CREATE TABLE sso_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Provider identification
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    provider_type sso_provider_type NOT NULL,
    protocol sso_protocol_type NOT NULL,
    
    -- Provider configuration
    status sso_config_status NOT NULL DEFAULT 'inactive',
    is_default BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 100, -- Lower number = higher priority
    
    -- Connection details
    issuer_url TEXT,
    sso_url TEXT NOT NULL,
    sls_url TEXT, -- Single Logout Service URL
    metadata_url TEXT,
    
    -- Certificates and security
    x509_certificate TEXT,
    certificate_fingerprint VARCHAR(255),
    signing_algorithm VARCHAR(50) DEFAULT 'SHA256',
    
    -- OIDC specific configuration
    client_id VARCHAR(255),
    client_secret_encrypted TEXT, -- Encrypted client secret
    authorization_endpoint TEXT,
    token_endpoint TEXT,
    userinfo_endpoint TEXT,
    jwks_uri TEXT,
    
    -- SAML specific configuration
    entity_id VARCHAR(255),
    acs_url TEXT, -- Assertion Consumer Service URL
    name_id_format VARCHAR(255) DEFAULT 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    
    -- User provisioning settings
    provisioning_type user_provisioning_type DEFAULT 'jit',
    auto_create_users BOOLEAN DEFAULT TRUE,
    auto_update_users BOOLEAN DEFAULT TRUE,
    
    -- Role and attribute mapping
    role_mapping JSONB DEFAULT '{}',
    attribute_mapping JSONB DEFAULT '{}',
    default_role VARCHAR(50) DEFAULT 'user',
    
    -- Additional configuration
    extra_config JSONB DEFAULT '{}',
    
    -- Audit fields
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_default_provider UNIQUE (is_default) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT valid_priority CHECK (priority >= 0 AND priority <= 1000),
    CONSTRAINT require_client_for_oidc CHECK (
        (protocol != 'oidc' AND protocol != 'oauth2') OR 
        (client_id IS NOT NULL AND client_secret_encrypted IS NOT NULL)
    ),
    CONSTRAINT require_entity_for_saml CHECK (
        protocol != 'saml2' OR entity_id IS NOT NULL
    )
);

-- =============================================
-- SSO Sessions Table
-- =============================================
CREATE TABLE sso_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Session identification
    session_id VARCHAR(255) UNIQUE NOT NULL,
    provider_session_id VARCHAR(255),
    saml_session_index VARCHAR(255),
    
    -- User and provider information
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES sso_providers(id),
    
    -- Session details
    name_id VARCHAR(255),
    name_id_format VARCHAR(255),
    session_not_on_or_after TIMESTAMPTZ,
    
    -- Authentication context
    auth_method VARCHAR(100),
    auth_instant TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    auth_context_class VARCHAR(255),
    
    -- Session status
    is_active BOOLEAN DEFAULT TRUE,
    logout_requested BOOLEAN DEFAULT FALSE,
    logout_completed BOOLEAN DEFAULT FALSE,
    
    -- Security information
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    logged_out_at TIMESTAMPTZ
);

-- =============================================
-- SSO User Mappings Table
-- =============================================
CREATE TABLE sso_user_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Mapping identification
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES sso_providers(id) ON DELETE CASCADE,
    external_user_id VARCHAR(255) NOT NULL,
    
    -- User attributes from SSO provider
    external_email VARCHAR(255),
    external_name VARCHAR(255),
    external_groups TEXT[],
    external_roles TEXT[],
    
    -- Mapping metadata
    first_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    login_count INTEGER DEFAULT 1,
    
    -- Provisioning information
    is_jit_provisioned BOOLEAN DEFAULT FALSE,
    auto_created BOOLEAN DEFAULT FALSE,
    sync_enabled BOOLEAN DEFAULT TRUE,
    
    -- Cached attributes
    cached_attributes JSONB DEFAULT '{}',
    last_sync_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(provider_id, external_user_id)
);

-- =============================================
-- SSO Authentication Events Table
-- =============================================
CREATE TABLE sso_authentication_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Event identification
    event_type VARCHAR(50) NOT NULL, -- 'login', 'logout', 'failed_login', 'session_timeout'
    event_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- User and provider information
    user_id UUID REFERENCES auth.users(id),
    provider_id UUID REFERENCES sso_providers(id),
    session_id VARCHAR(255),
    
    -- Event details
    success BOOLEAN NOT NULL,
    error_code VARCHAR(100),
    error_message TEXT,
    
    -- Request information
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(255),
    
    -- SAML/OIDC specific data
    saml_request_id VARCHAR(255),
    saml_response_id VARCHAR(255),
    oidc_state VARCHAR(255),
    oidc_nonce VARCHAR(255),
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- SSO Role Mappings Table
-- =============================================
CREATE TABLE sso_role_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Mapping identification
    provider_id UUID NOT NULL REFERENCES sso_providers(id) ON DELETE CASCADE,
    external_role VARCHAR(255) NOT NULL,
    internal_role user_role_type NOT NULL,
    
    -- Mapping configuration
    is_default BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 100,
    
    -- Conditions for mapping
    conditions JSONB DEFAULT '{}', -- Additional conditions for role assignment
    
    -- Metadata
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(provider_id, external_role, internal_role)
);

-- =============================================
-- Create Indexes
-- =============================================

-- SSO Providers indexes
CREATE INDEX idx_sso_providers_type ON sso_providers(provider_type);
CREATE INDEX idx_sso_providers_status ON sso_providers(status);
CREATE INDEX idx_sso_providers_priority ON sso_providers(priority);
CREATE INDEX idx_sso_providers_default ON sso_providers(is_default) WHERE is_default = TRUE;

-- SSO Sessions indexes
CREATE INDEX idx_sso_sessions_user_id ON sso_sessions(user_id);
CREATE INDEX idx_sso_sessions_provider_id ON sso_sessions(provider_id);
CREATE INDEX idx_sso_sessions_session_id ON sso_sessions(session_id);
CREATE INDEX idx_sso_sessions_active ON sso_sessions(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_sso_sessions_expires ON sso_sessions(expires_at);
CREATE INDEX idx_sso_sessions_provider_session ON sso_sessions(provider_session_id);

-- SSO User Mappings indexes
CREATE INDEX idx_sso_user_mappings_user_id ON sso_user_mappings(user_id);
CREATE INDEX idx_sso_user_mappings_provider_id ON sso_user_mappings(provider_id);
CREATE INDEX idx_sso_user_mappings_external_id ON sso_user_mappings(external_user_id);
CREATE INDEX idx_sso_user_mappings_external_email ON sso_user_mappings(external_email);
CREATE INDEX idx_sso_user_mappings_last_login ON sso_user_mappings(last_login_at);

-- SSO Authentication Events indexes
CREATE INDEX idx_sso_auth_events_user_id ON sso_authentication_events(user_id);
CREATE INDEX idx_sso_auth_events_provider_id ON sso_authentication_events(provider_id);
CREATE INDEX idx_sso_auth_events_event_type ON sso_authentication_events(event_type);
CREATE INDEX idx_sso_auth_events_timestamp ON sso_authentication_events(event_timestamp DESC);
CREATE INDEX idx_sso_auth_events_success ON sso_authentication_events(success);
CREATE INDEX idx_sso_auth_events_session_id ON sso_authentication_events(session_id);

-- SSO Role Mappings indexes
CREATE INDEX idx_sso_role_mappings_provider ON sso_role_mappings(provider_id);
CREATE INDEX idx_sso_role_mappings_external_role ON sso_role_mappings(external_role);
CREATE INDEX idx_sso_role_mappings_internal_role ON sso_role_mappings(internal_role);
CREATE INDEX idx_sso_role_mappings_priority ON sso_role_mappings(priority);

-- Composite indexes for common queries
CREATE INDEX idx_sso_sessions_user_provider ON sso_sessions(user_id, provider_id, is_active);
CREATE INDEX idx_sso_auth_events_user_timestamp ON sso_authentication_events(user_id, event_timestamp DESC);

-- =============================================
-- Auto-update Timestamps Function
-- =============================================
CREATE OR REPLACE FUNCTION update_sso_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply timestamp triggers
CREATE TRIGGER update_sso_providers_updated_at 
    BEFORE UPDATE ON sso_providers 
    FOR EACH ROW EXECUTE FUNCTION update_sso_updated_at_column();

CREATE TRIGGER update_sso_sessions_updated_at 
    BEFORE UPDATE ON sso_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_sso_updated_at_column();

CREATE TRIGGER update_sso_user_mappings_updated_at 
    BEFORE UPDATE ON sso_user_mappings 
    FOR EACH ROW EXECUTE FUNCTION update_sso_updated_at_column();

CREATE TRIGGER update_sso_role_mappings_updated_at 
    BEFORE UPDATE ON sso_role_mappings 
    FOR EACH ROW EXECUTE FUNCTION update_sso_updated_at_column();

-- =============================================
-- SSO Helper Functions
-- =============================================

-- Function to get active SSO providers
CREATE OR REPLACE FUNCTION get_active_sso_providers()
RETURNS TABLE(
    id UUID,
    name VARCHAR,
    display_name VARCHAR,
    provider_type sso_provider_type,
    protocol sso_protocol_type,
    sso_url TEXT,
    is_default BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.id,
        sp.name,
        sp.display_name,
        sp.provider_type,
        sp.protocol,
        sp.sso_url,
        sp.is_default
    FROM sso_providers sp
    WHERE sp.status = 'active'
    ORDER BY sp.priority ASC, sp.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log SSO authentication events
CREATE OR REPLACE FUNCTION log_sso_authentication_event(
    p_event_type VARCHAR,
    p_user_id UUID DEFAULT NULL,
    p_provider_id UUID DEFAULT NULL,
    p_session_id VARCHAR DEFAULT NULL,
    p_success BOOLEAN DEFAULT TRUE,
    p_error_code VARCHAR DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    event_id UUID;
    generated_event_id VARCHAR;
BEGIN
    -- Generate unique event ID
    generated_event_id := 'sso_' || extract(epoch from now())::bigint || '_' || encode(gen_random_bytes(8), 'hex');
    
    INSERT INTO sso_authentication_events (
        event_type,
        event_id,
        user_id,
        provider_id,
        session_id,
        success,
        error_code,
        error_message,
        ip_address,
        user_agent,
        metadata
    ) VALUES (
        p_event_type,
        generated_event_id,
        p_user_id,
        p_provider_id,
        p_session_id,
        p_success,
        p_error_code,
        p_error_message,
        p_ip_address,
        p_user_agent,
        p_metadata
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create or update SSO user mapping
CREATE OR REPLACE FUNCTION upsert_sso_user_mapping(
    p_user_id UUID,
    p_provider_id UUID,
    p_external_user_id VARCHAR,
    p_external_email VARCHAR DEFAULT NULL,
    p_external_name VARCHAR DEFAULT NULL,
    p_external_groups TEXT[] DEFAULT '{}',
    p_external_roles TEXT[] DEFAULT '{}',
    p_cached_attributes JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    mapping_id UUID;
BEGIN
    INSERT INTO sso_user_mappings (
        user_id,
        provider_id,
        external_user_id,
        external_email,
        external_name,
        external_groups,
        external_roles,
        cached_attributes,
        last_login_at,
        login_count
    ) VALUES (
        p_user_id,
        p_provider_id,
        p_external_user_id,
        p_external_email,
        p_external_name,
        p_external_groups,
        p_external_roles,
        p_cached_attributes,
        NOW(),
        1
    )
    ON CONFLICT (provider_id, external_user_id)
    DO UPDATE SET
        external_email = EXCLUDED.external_email,
        external_name = EXCLUDED.external_name,
        external_groups = EXCLUDED.external_groups,
        external_roles = EXCLUDED.external_roles,
        cached_attributes = EXCLUDED.cached_attributes,
        last_login_at = NOW(),
        login_count = sso_user_mappings.login_count + 1,
        last_sync_at = NOW(),
        updated_at = NOW()
    RETURNING id INTO mapping_id;
    
    RETURN mapping_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================
ALTER TABLE sso_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_user_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_authentication_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_role_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sso_providers (admin only for management)
CREATE POLICY "Admins can manage SSO providers" ON sso_providers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('super_admin', 'admin', 'security_admin')
            AND ur.is_active = TRUE
        )
    );

-- RLS Policies for sso_sessions (users can see their own)
CREATE POLICY "Users can view their own SSO sessions" ON sso_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all SSO sessions" ON sso_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('super_admin', 'admin', 'security_admin', 'auditor')
            AND ur.is_active = TRUE
        )
    );

-- RLS Policies for sso_user_mappings (users can see their own)
CREATE POLICY "Users can view their own SSO mappings" ON sso_user_mappings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage SSO user mappings" ON sso_user_mappings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('super_admin', 'admin', 'security_admin')
            AND ur.is_active = TRUE
        )
    );

-- RLS Policies for sso_authentication_events (audit access)
CREATE POLICY "Users can view their own SSO auth events" ON sso_authentication_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Auditors can view all SSO auth events" ON sso_authentication_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('super_admin', 'admin', 'security_admin', 'auditor')
            AND ur.is_active = TRUE
        )
    );

-- RLS Policies for sso_role_mappings (admin only)
CREATE POLICY "Admins can manage SSO role mappings" ON sso_role_mappings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('super_admin', 'admin', 'security_admin')
            AND ur.is_active = TRUE
        )
    );

-- =============================================
-- Grant Permissions
-- =============================================
GRANT SELECT ON sso_providers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON sso_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON sso_user_mappings TO authenticated;
GRANT SELECT, INSERT ON sso_authentication_events TO authenticated;
GRANT SELECT ON sso_role_mappings TO authenticated;

-- Service role permissions for background operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- =============================================
-- Default Data
-- =============================================

-- Insert default role mappings for common SSO scenarios
-- These will be updated with actual provider IDs when providers are configured
-- For now, these serve as templates for when providers are added:
-- INSERT INTO sso_role_mappings (provider_id, external_role, internal_role, description, priority) VALUES
-- (provider_id, 'admin', 'admin', 'Maps SSO admin role to internal admin', 10),
-- (provider_id, 'manager', 'manager', 'Maps SSO manager role to internal manager', 20),
-- (provider_id, 'user', 'user', 'Maps SSO user role to internal user', 30);

-- =============================================
-- Comments for Documentation
-- =============================================
COMMENT ON TABLE sso_providers IS 'Configuration for SSO identity providers (Okta, Azure AD, etc.)';
COMMENT ON TABLE sso_sessions IS 'Active SSO sessions with provider-specific session tracking';
COMMENT ON TABLE sso_user_mappings IS 'Mapping between internal users and external SSO provider identities';
COMMENT ON TABLE sso_authentication_events IS 'Audit log of all SSO authentication events';
COMMENT ON TABLE sso_role_mappings IS 'Mapping between external SSO roles and internal RBAC roles';

COMMENT ON COLUMN sso_providers.client_secret_encrypted IS 'Encrypted OAuth2/OIDC client secret';
COMMENT ON COLUMN sso_providers.role_mapping IS 'JSON configuration for role mapping rules';
COMMENT ON COLUMN sso_providers.attribute_mapping IS 'JSON configuration for attribute mapping rules';
COMMENT ON COLUMN sso_sessions.saml_session_index IS 'SAML SessionIndex for Single Logout';
COMMENT ON COLUMN sso_user_mappings.external_groups IS 'Groups from SSO provider';
COMMENT ON COLUMN sso_user_mappings.cached_attributes IS 'Cached user attributes from last sync';