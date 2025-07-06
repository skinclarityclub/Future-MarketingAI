-- Security Database Schema for AI Context Retention System
-- This schema includes tables for audit logging, consent management, and secure data storage

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- AUDIT LOGGING TABLES
-- =============================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    action TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    user_id UUID,
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    resource TEXT,
    resource_id TEXT,
    details JSONB DEFAULT '{}',
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON audit_logs(success);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);

-- =============================================
-- CONSENT MANAGEMENT TABLES
-- =============================================

CREATE TABLE IF NOT EXISTS consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    consent_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('granted', 'denied', 'withdrawn', 'expired')),
    version TEXT NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE,
    withdrawn_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    purpose TEXT NOT NULL,
    legal_basis TEXT NOT NULL CHECK (legal_basis IN ('consent', 'legitimate_interest', 'contract', 'legal_obligation')),
    data_types TEXT[] NOT NULL DEFAULT '{}',
    retention_period INTEGER NOT NULL, -- in days
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Ensure one active consent per user per type
    CONSTRAINT unique_user_consent_type UNIQUE (user_id, consent_type)
);

-- Indexes for consent records
CREATE INDEX IF NOT EXISTS idx_consent_records_user_id ON consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_consent_type ON consent_records(consent_type);
CREATE INDEX IF NOT EXISTS idx_consent_records_status ON consent_records(status);
CREATE INDEX IF NOT EXISTS idx_consent_records_expires_at ON consent_records(expires_at);
CREATE INDEX IF NOT EXISTS idx_consent_records_legal_basis ON consent_records(legal_basis);

-- =============================================
-- SECURE DATA STORAGE TABLES
-- =============================================

-- Encrypted conversation entries
CREATE TABLE IF NOT EXISTS secure_conversation_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    user_id_hash TEXT NOT NULL, -- Hashed user ID for privacy
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Encrypted fields
    user_query_encrypted JSONB, -- Contains encrypted data structure
    assistant_response_encrypted JSONB, -- Contains encrypted data structure
    context_encrypted JSONB, -- Contains encrypted context data
    
    -- Non-encrypted metadata
    feedback TEXT CHECK (feedback IN ('positive', 'negative', 'neutral')),
    follow_up BOOLEAN DEFAULT false,
    query_type TEXT CHECK (query_type IN ('simple', 'complex', 'clarification')),
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    response_time INTEGER, -- in milliseconds
    
    -- Anonymization metadata
    anonymization_level TEXT CHECK (anonymization_level IN ('light', 'medium', 'heavy', 'complete')),
    pii_detected BOOLEAN DEFAULT false,
    anonymized_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for secure conversation entries
CREATE INDEX IF NOT EXISTS idx_secure_conversations_user_hash ON secure_conversation_entries(user_id_hash);
CREATE INDEX IF NOT EXISTS idx_secure_conversations_session ON secure_conversation_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_secure_conversations_timestamp ON secure_conversation_entries(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_secure_conversations_query_type ON secure_conversation_entries(query_type);
CREATE INDEX IF NOT EXISTS idx_secure_conversations_pii ON secure_conversation_entries(pii_detected);

-- Encrypted user profiles
CREATE TABLE IF NOT EXISTS secure_user_profiles (
    user_id UUID PRIMARY KEY,
    user_id_hash TEXT UNIQUE NOT NULL, -- Hashed user ID for cross-referencing
    
    -- Encrypted profile data
    profile_data_encrypted JSONB, -- Contains encrypted profile information
    preferences_encrypted JSONB, -- Contains encrypted user preferences
    
    -- Non-encrypted metadata
    expertise_level TEXT CHECK (expertise_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    communication_style TEXT CHECK (communication_style IN ('concise', 'detailed', 'visual', 'technical')),
    preferred_analysis_depth TEXT CHECK (preferred_analysis_depth IN ('basic', 'detailed', 'comprehensive')),
    timezone TEXT,
    language TEXT DEFAULT 'en',
    
    -- Privacy settings
    privacy_mode TEXT DEFAULT 'balanced' CHECK (privacy_mode IN ('strict', 'balanced', 'permissive')),
    data_retention_days INTEGER DEFAULT 365,
    
    -- Encryption metadata
    encryption_version TEXT DEFAULT '1.0',
    key_rotation_date TIMESTAMP WITH TIME ZONE,
    
    last_active TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for secure user profiles
CREATE INDEX IF NOT EXISTS idx_secure_profiles_hash ON secure_user_profiles(user_id_hash);
CREATE INDEX IF NOT EXISTS idx_secure_profiles_last_active ON secure_user_profiles(last_active);
CREATE INDEX IF NOT EXISTS idx_secure_profiles_privacy_mode ON secure_user_profiles(privacy_mode);

-- =============================================
-- SECURITY INCIDENTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS security_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
    title TEXT NOT NULL,
    description TEXT,
    
    -- Affected resources
    affected_users TEXT[], -- Array of user IDs or hashes
    affected_systems TEXT[],
    affected_data_types TEXT[],
    
    -- Detection details
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    detected_by TEXT, -- System component or user who detected
    detection_method TEXT, -- How it was detected
    
    -- Investigation details
    assigned_to TEXT,
    investigation_notes TEXT,
    evidence JSONB DEFAULT '{}',
    
    -- Resolution details
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_summary TEXT,
    remediation_actions TEXT[],
    
    -- Notification details
    notifications_sent BOOLEAN DEFAULT false,
    regulatory_reported BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for security incidents
CREATE INDEX IF NOT EXISTS idx_security_incidents_type ON security_incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_security_incidents_severity ON security_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_security_incidents_status ON security_incidents(status);
CREATE INDEX IF NOT EXISTS idx_security_incidents_detected_at ON security_incidents(detected_at DESC);

-- =============================================
-- DATA RETENTION POLICIES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS data_retention_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_name TEXT UNIQUE NOT NULL,
    data_type TEXT NOT NULL,
    retention_period_days INTEGER NOT NULL,
    anonymization_period_days INTEGER,
    hard_delete_period_days INTEGER,
    
    -- Policy rules
    conditions JSONB DEFAULT '{}', -- Conditions for when this policy applies
    exceptions JSONB DEFAULT '{}', -- Exceptions to the policy
    
    -- Compliance requirements
    regulatory_basis TEXT[], -- Which regulations require this
    legal_hold_override BOOLEAN DEFAULT false,
    
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for data retention policies
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_type ON data_retention_policies(data_type);
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_active ON data_retention_policies(active);

-- =============================================
-- ENCRYPTION KEYS MANAGEMENT TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS encryption_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_id TEXT UNIQUE NOT NULL,
    key_type TEXT NOT NULL CHECK (key_type IN ('master', 'data', 'session')),
    algorithm TEXT NOT NULL,
    key_size INTEGER NOT NULL,
    
    -- Key lifecycle
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    activated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Security
    key_hash TEXT NOT NULL, -- Hash of the key for verification
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'expired', 'revoked')),
    
    -- Metadata
    purpose TEXT,
    rotation_policy_days INTEGER DEFAULT 90,
    next_rotation_date TIMESTAMP WITH TIME ZONE
);

-- Indexes for encryption keys
CREATE INDEX IF NOT EXISTS idx_encryption_keys_key_id ON encryption_keys(key_id);
CREATE INDEX IF NOT EXISTS idx_encryption_keys_type ON encryption_keys(key_type);
CREATE INDEX IF NOT EXISTS idx_encryption_keys_status ON encryption_keys(status);
CREATE INDEX IF NOT EXISTS idx_encryption_keys_expires_at ON encryption_keys(expires_at);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all security tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE secure_conversation_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE secure_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;

-- RLS Policy for audit logs (admin only)
CREATE POLICY audit_logs_admin_only ON audit_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- RLS Policy for consent records (user can access own records)
CREATE POLICY consent_records_user_access ON consent_records
    FOR ALL USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- RLS Policy for secure conversation entries (user can access own entries)
CREATE POLICY secure_conversations_user_access ON secure_conversation_entries
    FOR ALL USING (
        user_id_hash = encode(digest(auth.uid()::text, 'sha256'), 'hex') OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- RLS Policy for secure user profiles (user can access own profile)
CREATE POLICY secure_profiles_user_access ON secure_user_profiles
    FOR ALL USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- RLS Policy for security incidents (admin only)
CREATE POLICY security_incidents_admin_only ON security_incidents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- =============================================
-- FUNCTIONS FOR AUTOMATED TASKS
-- =============================================

-- Function to clean up expired audit logs
CREATE OR REPLACE FUNCTION cleanup_expired_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
    retention_days INTEGER := COALESCE(current_setting('app.audit_retention_days', true)::INTEGER, 365);
BEGIN
    DELETE FROM audit_logs 
    WHERE timestamp < NOW() - INTERVAL '1 day' * retention_days;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup operation
    INSERT INTO audit_logs (action, severity, success, details)
    VALUES ('system.cleanup', 'low', true, jsonb_build_object('deleted_records', deleted_count, 'table', 'audit_logs'));
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark expired consents
CREATE OR REPLACE FUNCTION mark_expired_consents()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE consent_records 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'granted' 
    AND expires_at < NOW();
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    -- Log the expiration operation
    INSERT INTO audit_logs (action, severity, success, details)
    VALUES ('privacy.consent', 'medium', true, jsonb_build_object('expired_consents', updated_count));
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect security anomalies
CREATE OR REPLACE FUNCTION detect_security_anomalies()
RETURNS TABLE (
    anomaly_type TEXT,
    description TEXT,
    severity TEXT,
    affected_count INTEGER
) AS $$
BEGIN
    -- Detect excessive failed login attempts
    RETURN QUERY
    SELECT 
        'excessive_failed_logins'::TEXT,
        'Multiple failed login attempts detected'::TEXT,
        'high'::TEXT,
        COUNT(*)::INTEGER
    FROM audit_logs 
    WHERE action = 'auth.failed' 
    AND timestamp > NOW() - INTERVAL '1 hour'
    AND success = false
    GROUP BY ip_address
    HAVING COUNT(*) > 10;
    
    -- Detect unusual data access patterns
    RETURN QUERY
    SELECT 
        'unusual_data_access'::TEXT,
        'Unusual data access pattern detected'::TEXT,
        'medium'::TEXT,
        COUNT(*)::INTEGER
    FROM audit_logs 
    WHERE action LIKE '%.view' 
    AND timestamp > NOW() - INTERVAL '1 hour'
    GROUP BY user_id
    HAVING COUNT(*) > 100;
    
    -- Detect potential data breaches
    RETURN QUERY
    SELECT 
        'potential_data_breach'::TEXT,
        'Large amount of data accessed by single user'::TEXT,
        'critical'::TEXT,
        COUNT(*)::INTEGER
    FROM audit_logs 
    WHERE action = 'data.export' 
    AND timestamp > NOW() - INTERVAL '1 hour'
    GROUP BY user_id
    HAVING COUNT(*) > 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGERS FOR AUTOMATED OPERATIONS
-- =============================================

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to relevant tables
CREATE TRIGGER update_consent_records_updated_at
    BEFORE UPDATE ON consent_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_secure_user_profiles_updated_at
    BEFORE UPDATE ON secure_user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_incidents_updated_at
    BEFORE UPDATE ON security_incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VIEWS FOR SECURITY REPORTING
-- =============================================

-- Security dashboard view
CREATE OR REPLACE VIEW security_dashboard AS
SELECT 
    DATE_TRUNC('day', timestamp) as date,
    COUNT(*) as total_events,
    COUNT(*) FILTER (WHERE success = false) as failed_events,
    COUNT(*) FILTER (WHERE severity = 'critical') as critical_events,
    COUNT(*) FILTER (WHERE severity = 'high') as high_events,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT ip_address) as unique_ips
FROM audit_logs 
WHERE timestamp > NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', timestamp)
ORDER BY date DESC;

-- Consent compliance view
CREATE OR REPLACE VIEW consent_compliance AS
SELECT 
    consent_type,
    COUNT(*) as total_consents,
    COUNT(*) FILTER (WHERE status = 'granted') as granted,
    COUNT(*) FILTER (WHERE status = 'denied') as denied,
    COUNT(*) FILTER (WHERE status = 'withdrawn') as withdrawn,
    COUNT(*) FILTER (WHERE status = 'expired') as expired,
    ROUND(
        COUNT(*) FILTER (WHERE status = 'granted') * 100.0 / COUNT(*), 2
    ) as grant_rate
FROM consent_records
GROUP BY consent_type;

-- Data retention summary view
CREATE OR REPLACE VIEW data_retention_summary AS
SELECT 
    'audit_logs' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE timestamp < NOW() - INTERVAL '365 days') as expired_records,
    MIN(timestamp) as oldest_record,
    MAX(timestamp) as newest_record
FROM audit_logs
UNION ALL
SELECT 
    'secure_conversation_entries' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE timestamp < NOW() - INTERVAL '90 days') as expired_records,
    MIN(timestamp) as oldest_record,
    MAX(timestamp) as newest_record
FROM secure_conversation_entries;

-- =============================================
-- GRANTS AND PERMISSIONS
-- =============================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON consent_records TO authenticated;
GRANT SELECT, INSERT, UPDATE ON secure_conversation_entries TO authenticated;
GRANT SELECT, UPDATE ON secure_user_profiles TO authenticated;

-- Grant audit log insert permission to service role
GRANT INSERT ON audit_logs TO service_role;

-- Grant admin permissions to admin role
GRANT ALL ON ALL TABLES IN SCHEMA public TO admin;

-- =============================================
-- INITIAL DATA AND CONFIGURATION
-- =============================================

-- Insert default data retention policies
INSERT INTO data_retention_policies (policy_name, data_type, retention_period_days, anonymization_period_days, hard_delete_period_days, regulatory_basis)
VALUES 
    ('User Conversations', 'conversation', 90, 365, 1095, ARRAY['GDPR', 'CCPA']),
    ('User Profiles', 'profile', 365, 730, 1095, ARRAY['GDPR', 'CCPA']),
    ('Consent Records', 'consent', 1095, NULL, 2190, ARRAY['GDPR', 'CCPA']),
    ('Audit Logs', 'audit', 365, NULL, 1095, ARRAY['SOX', 'GDPR']),
    ('Security Incidents', 'security', 2190, NULL, 2555, ARRAY['SOX', 'ISO27001'])
ON CONFLICT (policy_name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_composite ON audit_logs(user_id, timestamp DESC, action);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consent_records_composite ON consent_records(user_id, consent_type, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_secure_conversations_composite ON secure_conversation_entries(user_id_hash, timestamp DESC);

-- Set up automated maintenance jobs (if pg_cron extension is available)
-- SELECT cron.schedule('cleanup-audit-logs', '0 2 * * *', 'SELECT cleanup_expired_audit_logs();');
-- SELECT cron.schedule('mark-expired-consents', '0 1 * * *', 'SELECT mark_expired_consents();');
-- SELECT cron.schedule('detect-anomalies', '*/15 * * * *', 'SELECT detect_security_anomalies();');

COMMENT ON SCHEMA public IS 'Enhanced security schema for AI Context Retention System with comprehensive audit logging, consent management, encrypted data storage, and compliance features'; 