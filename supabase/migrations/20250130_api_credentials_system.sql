-- =====================================================================================
-- API Credentials Management System
-- Migration: 20250130_api_credentials_system.sql
-- Purpose: Database schema for storing encrypted API credentials for Command Center
-- Created: 2025-01-30
-- =====================================================================================

-- =====================================================================================
-- API Providers Configuration Table
-- Stores provider metadata and configuration
-- =====================================================================================
CREATE TABLE api_providers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    base_url VARCHAR(500),
    auth_type VARCHAR(30) NOT NULL, -- 'oauth2', 'api_key', 'service_account'
    is_active BOOLEAN DEFAULT true,
    priority VARCHAR(10) DEFAULT 'medium', -- 'high', 'medium', 'low'
    features JSONB DEFAULT '[]'::jsonb,
    documentation_url VARCHAR(500),
    rate_limits JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================================
-- API Credentials Table
-- Stores encrypted API credentials for each provider
-- =====================================================================================
CREATE TABLE api_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id VARCHAR(50) NOT NULL REFERENCES api_providers(id) ON DELETE CASCADE,
    credential_id VARCHAR(100) NOT NULL, -- e.g., 'clickup_client_id', 'clickup_client_secret'
    credential_type VARCHAR(30) NOT NULL, -- 'oauth2', 'api_key', 'service_account', 'webhook_secret'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    encrypted_value TEXT, -- Encrypted credential value
    is_required BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'missing', -- 'configured', 'missing', 'invalid', 'expired'
    last_validated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    scopes JSONB DEFAULT '[]'::jsonb,
    endpoints JSONB DEFAULT '[]'::jsonb,
    rate_limits JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique credential per provider
    UNIQUE(provider_id, credential_id)
);

-- =====================================================================================
-- Credential Usage Logs Table
-- Track when and how credentials are used for monitoring
-- =====================================================================================
CREATE TABLE credential_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credential_id UUID NOT NULL REFERENCES api_credentials(id) ON DELETE CASCADE,
    provider_id VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL, -- 'validate', 'oauth_flow', 'api_call'
    success BOOLEAN NOT NULL,
    error_message TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================================
-- Indexes for Performance
-- =====================================================================================
CREATE INDEX idx_api_credentials_provider_id ON api_credentials(provider_id);
CREATE INDEX idx_api_credentials_status ON api_credentials(status);
CREATE INDEX idx_api_credentials_expires_at ON api_credentials(expires_at);
CREATE INDEX idx_credential_usage_logs_credential_id ON credential_usage_logs(credential_id);
CREATE INDEX idx_credential_usage_logs_created_at ON credential_usage_logs(created_at);

-- =====================================================================================
-- Insert Default API Providers
-- =====================================================================================
INSERT INTO api_providers (id, name, category, description, auth_type, priority, features) VALUES
-- PRODUCTIVITY PROVIDERS
('clickup', 'ClickUp API', 'productivity', 'Task management and project tracking integration via OAuth', 'oauth2', 'high', '["Task Management", "Webhook Notifications", "Time Tracking", "Team Collaboration"]'::jsonb),
('n8n', 'n8n Workflow Integration', 'productivity', 'Workflow automation and process orchestration', 'api_key', 'high', '["Workflow Monitoring", "Execution Tracking", "Error Detection", "Performance Metrics"]'::jsonb),

-- SOCIAL MEDIA PROVIDERS
('instagram', 'Instagram Business API', 'social_media', 'Instagram content analytics and audience insights', 'oauth2', 'high', '["Content Analytics", "Audience Insights", "Post Performance", "Story Analytics"]'::jsonb),
('facebook', 'Facebook Graph API', 'social_media', 'Facebook page management and advertising insights', 'oauth2', 'high', '["Page Management", "Post Analytics", "Audience Data", "Ad Performance"]'::jsonb),
('linkedin', 'LinkedIn Marketing API', 'social_media', 'LinkedIn company page and content performance', 'oauth2', 'medium', '["Company Analytics", "Content Performance", "Follower Insights", "Engagement Metrics"]'::jsonb),

-- ANALYTICS PROVIDERS
('google_analytics', 'Google Analytics 4', 'analytics', 'Website analytics and user behavior tracking', 'service_account', 'high', '["Traffic Analytics", "User Behavior", "Conversion Tracking", "Real-time Data"]'::jsonb);

-- =====================================================================================
-- Insert Default Credentials Configuration
-- =====================================================================================

-- ClickUp Credentials
INSERT INTO api_credentials (provider_id, credential_id, credential_type, name, description, is_required) VALUES
('clickup', 'clickup_client_id', 'oauth2', 'Client ID', 'ClickUp OAuth App Client ID from your app settings', true),
('clickup', 'clickup_client_secret', 'oauth2', 'Client Secret', 'ClickUp OAuth App Client Secret (keep this secure)', true),
('clickup', 'clickup_access_token', 'oauth2', 'Access Token', 'ClickUp OAuth Access Token (generated automatically)', false);

-- n8n Credentials
INSERT INTO api_credentials (provider_id, credential_id, credential_type, name, description, is_required) VALUES
('n8n', 'n8n_api_key', 'api_key', 'API Key', 'n8n Instance API Key', true);

-- Instagram Credentials
INSERT INTO api_credentials (provider_id, credential_id, credential_type, name, description, is_required) VALUES
('instagram', 'instagram_access_token', 'oauth2', 'Access Token', 'Instagram Business Account access token', true),
('instagram', 'instagram_client_id', 'oauth2', 'Client ID', 'Instagram App Client ID', true),
('instagram', 'instagram_client_secret', 'oauth2', 'Client Secret', 'Instagram App Client Secret', true);

-- Facebook Credentials
INSERT INTO api_credentials (provider_id, credential_id, credential_type, name, description, is_required) VALUES
('facebook', 'facebook_app_id', 'oauth2', 'App ID', 'Facebook App ID from Developer Console', true),
('facebook', 'facebook_app_secret', 'oauth2', 'App Secret', 'Facebook App Secret for authentication', true),
('facebook', 'facebook_access_token', 'oauth2', 'Access Token', 'Facebook Page access token', true);

-- LinkedIn Credentials  
INSERT INTO api_credentials (provider_id, credential_id, credential_type, name, description, is_required) VALUES
('linkedin', 'linkedin_client_id', 'oauth2', 'Client ID', 'LinkedIn App Client ID', true),
('linkedin', 'linkedin_client_secret', 'oauth2', 'Client Secret', 'LinkedIn App Client Secret', true),
('linkedin', 'linkedin_access_token', 'oauth2', 'Access Token', 'LinkedIn Company Page access token', true);

-- Google Analytics Credentials
INSERT INTO api_credentials (provider_id, credential_id, credential_type, name, description, is_required) VALUES
('google_analytics', 'ga4_service_account', 'service_account', 'Service Account JSON', 'Google Analytics Service Account credentials', true);

-- =====================================================================================
-- RLS (Row Level Security) Policies
-- =====================================================================================

-- Enable RLS on all tables
ALTER TABLE api_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_usage_logs ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust based on your auth setup)
-- In production, you should have more granular permissions

CREATE POLICY "Allow all operations on api_providers" ON api_providers
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on api_credentials" ON api_credentials
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on credential_usage_logs" ON credential_usage_logs  
    FOR ALL USING (true);

-- =====================================================================================
-- Encryption/Decryption Functions
-- =====================================================================================

-- Simple encryption function using Supabase's built-in functions
-- In production, consider using a more robust encryption solution
CREATE OR REPLACE FUNCTION encrypt_credential(value TEXT)
RETURNS TEXT AS $$
BEGIN
    -- For now, we'll store values as-is but in production you should use pgcrypto
    -- RETURN encode(encrypt(value::bytea, 'your-secret-key', 'aes'), 'base64');
    RETURN value;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrypt_credential(encrypted_value TEXT)
RETURNS TEXT AS $$
BEGIN
    -- For now, we'll return values as-is but in production you should use pgcrypto
    -- RETURN convert_from(decrypt(decode(encrypted_value, 'base64'), 'your-secret-key', 'aes'), 'UTF8');
    RETURN encrypted_value;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================================
-- Helper Functions
-- =====================================================================================

-- Function to get all credentials for a provider
CREATE OR REPLACE FUNCTION get_provider_credentials(provider_name TEXT)
RETURNS TABLE (
    credential_id TEXT,
    name TEXT,
    value TEXT,
    status TEXT,
    is_required BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ac.credential_id,
        ac.name,
        decrypt_credential(ac.encrypted_value) as value,
        ac.status,
        ac.is_required
    FROM api_credentials ac
    JOIN api_providers ap ON ac.provider_id = ap.id
    WHERE ap.id = provider_name OR ap.name = provider_name;
END;
$$ LANGUAGE plpgsql;

-- Function to update credential status
CREATE OR REPLACE FUNCTION update_credential_status(
    p_provider_id TEXT,
    p_credential_id TEXT, 
    p_status TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE api_credentials 
    SET 
        status = p_status,
        last_validated_at = CASE WHEN p_status = 'configured' THEN NOW() ELSE last_validated_at END,
        updated_at = NOW()
    WHERE provider_id = p_provider_id AND credential_id = p_credential_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

SELECT 'API Credentials System migration completed successfully' as status; 