-- Migration 029: Audit Security Enhancement
-- Task 37.14: Implement Security and Encryption for Audit Logs
-- 
-- This migration adds:
-- - Encryption key management tables
-- - Enhanced security audit logs
-- - Access control tables
-- - Security metrics tracking

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENCRYPTION KEY MANAGEMENT
-- =====================================================

-- Table to store encryption key metadata (keys themselves are derived from master key)
CREATE TABLE IF NOT EXISTS audit_encryption_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_id VARCHAR(255) UNIQUE NOT NULL,
    key_salt VARCHAR(512) NOT NULL, -- Salt for key derivation
    algorithm VARCHAR(50) NOT NULL DEFAULT 'aes-256-cbc',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'rotating', 'deprecated')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    rotation_count INTEGER NOT NULL DEFAULT 0,
    created_by UUID,
    metadata JSONB DEFAULT '{}'
);

-- Create indexes for audit_encryption_keys
CREATE INDEX IF NOT EXISTS idx_audit_encryption_keys_status ON audit_encryption_keys (status);
CREATE INDEX IF NOT EXISTS idx_audit_encryption_keys_created ON audit_encryption_keys (created_at);
CREATE INDEX IF NOT EXISTS idx_audit_encryption_keys_expires ON audit_encryption_keys (expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_encryption_keys_key_id ON audit_encryption_keys (key_id);

-- =====================================================
-- ENHANCED SECURITY AUDIT LOGS
-- =====================================================

-- Enhanced security audit log table
CREATE TABLE IF NOT EXISTS security_audit_log_enhanced (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(255) UNIQUE NOT NULL DEFAULT ('sec_' || extract(epoch from now()) || '_' || substr(uuid_generate_v4()::text, 1, 8)),
    
    -- Core event information
    event_category VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    message TEXT,
    
    -- Status and severity
    status VARCHAR(20) NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failure', 'warning', 'info')),
    severity VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
    
    -- User and session information
    user_id UUID,
    session_id VARCHAR(255),
    impersonated_by UUID,
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(255),
    correlation_id VARCHAR(255),
    
    -- Resource information
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    resource_name VARCHAR(255),
    
    -- Security specific fields
    encryption_key_id VARCHAR(255),
    data_classification VARCHAR(50) DEFAULT 'internal' CHECK (data_classification IN ('public', 'internal', 'confidential', 'restricted')),
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 10),
    
    -- Integrity and verification
    data_checksum VARCHAR(128),
    digital_signature VARCHAR(512),
    is_encrypted BOOLEAN DEFAULT FALSE,
    
    -- Event details and metadata
    details JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    compliance_tags TEXT[] DEFAULT '{}',
    
    -- Timestamps
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Audit trail
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Retention and lifecycle
    retention_policy VARCHAR(50) DEFAULT 'standard',
    expires_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    
    -- Foreign key constraints and check constraints only
    CONSTRAINT fk_security_audit_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for security_audit_log_enhanced
CREATE INDEX IF NOT EXISTS idx_security_audit_enhanced_event_category ON security_audit_log_enhanced (event_category);
CREATE INDEX IF NOT EXISTS idx_security_audit_enhanced_event_type ON security_audit_log_enhanced (event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_enhanced_user_id ON security_audit_log_enhanced (user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_enhanced_severity ON security_audit_log_enhanced (severity);
CREATE INDEX IF NOT EXISTS idx_security_audit_enhanced_status ON security_audit_log_enhanced (status);
CREATE INDEX IF NOT EXISTS idx_security_audit_enhanced_event_timestamp ON security_audit_log_enhanced (event_timestamp);
CREATE INDEX IF NOT EXISTS idx_security_audit_enhanced_risk_score ON security_audit_log_enhanced (risk_score);
CREATE INDEX IF NOT EXISTS idx_security_audit_enhanced_resource ON security_audit_log_enhanced (resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_enhanced_ip_address ON security_audit_log_enhanced (ip_address);
CREATE INDEX IF NOT EXISTS idx_security_audit_enhanced_compliance_tags ON security_audit_log_enhanced USING GIN (compliance_tags);
CREATE INDEX IF NOT EXISTS idx_security_audit_enhanced_details ON security_audit_log_enhanced USING GIN (details);
CREATE INDEX IF NOT EXISTS idx_security_audit_enhanced_classification ON security_audit_log_enhanced (data_classification);



-- =====================================================
-- ACCESS CONTROL TABLES
-- =====================================================

-- Access control configuration
CREATE TABLE IF NOT EXISTS audit_access_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_name VARCHAR(100) UNIQUE NOT NULL,
    config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

-- IP whitelist for audit access
CREATE TABLE IF NOT EXISTS audit_ip_whitelist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address INET NOT NULL,
    ip_range CIDR,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    expires_at TIMESTAMPTZ
);

-- Time-based access control
CREATE TABLE IF NOT EXISTS audit_time_based_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    days_of_week INTEGER[] DEFAULT '{1,2,3,4,5}', -- Monday to Friday
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit session management
CREATE TABLE IF NOT EXISTS audit_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    permissions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    mfa_verified BOOLEAN DEFAULT FALSE
);

-- Failed access attempts tracking
CREATE TABLE IF NOT EXISTS audit_failed_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    ip_address INET,
    attempt_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    failure_reason VARCHAR(255),
    user_agent TEXT,
    total_failures INTEGER DEFAULT 1
);

-- MFA tokens for enhanced security
CREATE TABLE IF NOT EXISTS user_mfa_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    token_hash VARCHAR(128) NOT NULL, -- SHA-256 hash of the token
    token_type VARCHAR(20) NOT NULL DEFAULT 'totp' CHECK (token_type IN ('totp', 'sms', 'email', 'backup')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMPTZ
);

-- =====================================================
-- SECURITY METRICS AND MONITORING
-- =====================================================

-- Security metrics tracking
CREATE TABLE IF NOT EXISTS audit_security_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- counter, gauge, histogram
    tags JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for all access control and security tables
CREATE INDEX IF NOT EXISTS idx_audit_access_config_active ON audit_access_config (is_active);
CREATE INDEX IF NOT EXISTS idx_audit_access_config_name ON audit_access_config (config_name);

CREATE INDEX IF NOT EXISTS idx_audit_ip_whitelist_active ON audit_ip_whitelist (is_active);
CREATE INDEX IF NOT EXISTS idx_audit_ip_whitelist_ip ON audit_ip_whitelist (ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_ip_whitelist_range ON audit_ip_whitelist (ip_range);

CREATE INDEX IF NOT EXISTS idx_audit_time_access_user ON audit_time_based_access (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_time_access_active ON audit_time_based_access (is_active);

CREATE INDEX IF NOT EXISTS idx_audit_sessions_user ON audit_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_sessions_active ON audit_sessions (is_active);
CREATE INDEX IF NOT EXISTS idx_audit_sessions_expires ON audit_sessions (expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_sessions_session_id ON audit_sessions (session_id);

CREATE INDEX IF NOT EXISTS idx_audit_failed_attempts_user ON audit_failed_attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_failed_attempts_time ON audit_failed_attempts (attempt_time);
CREATE INDEX IF NOT EXISTS idx_audit_failed_attempts_ip ON audit_failed_attempts (ip_address);

CREATE INDEX IF NOT EXISTS idx_user_mfa_tokens_user ON user_mfa_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_user_mfa_tokens_hash ON user_mfa_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_user_mfa_tokens_expires ON user_mfa_tokens (expires_at);
CREATE INDEX IF NOT EXISTS idx_user_mfa_tokens_used ON user_mfa_tokens (is_used);

CREATE INDEX IF NOT EXISTS idx_audit_security_metrics_name ON audit_security_metrics (metric_name);
CREATE INDEX IF NOT EXISTS idx_audit_security_metrics_timestamp ON audit_security_metrics (timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_security_metrics_type ON audit_security_metrics (metric_type);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE audit_encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_log_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_access_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_ip_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_time_based_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_failed_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mfa_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_security_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for security_admin and admin access
CREATE POLICY "security_admin_full_access_encryption_keys" ON audit_encryption_keys
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('security_admin', 'admin', 'super_admin')
        )
    );

CREATE POLICY "security_admin_full_access_enhanced_logs" ON security_audit_log_enhanced
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('security_admin', 'admin', 'super_admin', 'auditor')
        )
    );

CREATE POLICY "admin_access_config" ON audit_access_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'super_admin')
        )
    );

-- User can access their own sessions and MFA tokens
CREATE POLICY "user_own_sessions" ON audit_sessions
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "user_own_mfa_tokens" ON user_mfa_tokens
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "user_own_time_access" ON audit_time_based_access
    FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_security_audit_log_enhanced_updated_at 
    BEFORE UPDATE ON security_audit_log_enhanced 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_access_config_updated_at 
    BEFORE UPDATE ON audit_access_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_audit_sessions()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE audit_sessions 
    SET is_active = FALSE 
    WHERE expires_at < NOW() AND is_active = TRUE;
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    -- Log cleanup activity
    INSERT INTO security_audit_log_enhanced (
        event_category, event_type, event_name, message, 
        status, severity, details
    ) VALUES (
        'system_maintenance', 'session_cleanup', 'Automated Session Cleanup',
        'Cleaned up expired audit sessions',
        'success', 'info',
        jsonb_build_object('expired_sessions', expired_count)
    );
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Function to rotate encryption keys
CREATE OR REPLACE FUNCTION rotate_audit_encryption_keys()
RETURNS VOID AS $$
BEGIN
    -- Mark old keys as rotating
    UPDATE audit_encryption_keys 
    SET status = 'rotating' 
    WHERE status = 'active' AND expires_at < NOW();
    
    -- Log key rotation
    INSERT INTO security_audit_log_enhanced (
        event_category, event_type, event_name, message,
        status, severity, compliance_tags
    ) VALUES (
        'security_event', 'key_rotation', 'Encryption Key Rotation',
        'Automated encryption key rotation completed',
        'success', 'info',
        ARRAY['encryption', 'key_management']
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default access control configuration
INSERT INTO audit_access_config (config_name, config) VALUES
('default_security_config', jsonb_build_object(
    'mfaRequired', true,
    'sessionTimeoutMinutes', 60,
    'maxFailedAttempts', 3,
    'lockoutDurationMinutes', 30,
    'ipWhitelistEnabled', false,
    'timeBasedAccessEnabled', false
)) ON CONFLICT (config_name) DO NOTHING;

-- Insert common IP addresses for development (disable in production)
INSERT INTO audit_ip_whitelist (ip_address, description) VALUES
('127.0.0.1', 'Localhost'),
('::1', 'IPv6 Localhost')
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE audit_encryption_keys IS 'Stores metadata for audit log encryption keys';
COMMENT ON TABLE security_audit_log_enhanced IS 'Enhanced security audit log with encryption and integrity features';
COMMENT ON TABLE audit_access_config IS 'Configuration for audit log access control';
COMMENT ON TABLE audit_ip_whitelist IS 'IP addresses allowed to access audit logs';
COMMENT ON TABLE audit_time_based_access IS 'Time-based access restrictions for users';
COMMENT ON TABLE audit_sessions IS 'Active audit log access sessions';
COMMENT ON TABLE audit_failed_attempts IS 'Failed audit log access attempts';
COMMENT ON TABLE user_mfa_tokens IS 'Multi-factor authentication tokens';
COMMENT ON TABLE audit_security_metrics IS 'Security metrics and monitoring data';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 029: Audit Security Enhancement completed successfully';
    RAISE NOTICE 'Added encryption key management, enhanced security logging, and access control features';
END $$; 