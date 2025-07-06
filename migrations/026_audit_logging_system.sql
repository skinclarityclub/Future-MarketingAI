/**
 * Migration: Centralized Audit Logging System
 * Task 37.3: Develop Centralized Audit Logging System
 * 
 * Creates comprehensive audit logging infrastructure for enterprise security compliance
 * Supports SOC 2, GDPR, and general enterprise audit requirements
 */

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Audit Log Levels enum
CREATE TYPE audit_log_level AS ENUM (
    'debug',
    'info', 
    'warning',
    'error',
    'critical',
    'security'
);

-- Audit Event Categories enum
CREATE TYPE audit_event_category AS ENUM (
    'authentication',
    'authorization',
    'data_access',
    'data_modification',
    'system_configuration',
    'user_management',
    'financial_transaction',
    'api_access',
    'file_access',
    'database_operation',
    'security_event',
    'compliance_event'
);

-- Audit Event Status enum
CREATE TYPE audit_event_status AS ENUM (
    'success',
    'failure',
    'warning',
    'blocked',
    'pending'
);

-- Main audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Event identification
    event_id VARCHAR(255) UNIQUE NOT NULL,
    event_category audit_event_category NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    
    -- Status and severity
    status audit_event_status NOT NULL DEFAULT 'success',
    severity audit_log_level NOT NULL DEFAULT 'info',
    
    -- User and session information
    user_id UUID REFERENCES auth.users(id),
    session_id VARCHAR(255),
    impersonator_id UUID REFERENCES auth.users(id), -- for admin impersonation
    
    -- Technical details 
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(255),
    correlation_id VARCHAR(255), -- for tracing related events
    
    -- Resource information
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    resource_name VARCHAR(255),
    
    -- Event details
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Data changes (for modification events)
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- Request/Response info
    request_method VARCHAR(10),
    request_path TEXT,
    request_params JSONB,
    response_status INTEGER,
    response_time_ms INTEGER,
    
    -- Compliance and risk
    compliance_tags TEXT[] DEFAULT '{}',
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 10),
    requires_review BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Retention and archival
    retention_period INTERVAL DEFAULT INTERVAL '7 years',
    archived_at TIMESTAMPTZ,
    
    -- Integrity verification
    checksum VARCHAR(64), -- SHA-256 hash for tamper detection
    
    CONSTRAINT valid_risk_score CHECK (risk_score IS NULL OR (risk_score >= 0 AND risk_score <= 10))
);

-- User session audit table
CREATE TABLE audit_user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    
    -- Session details
    login_timestamp TIMESTAMPTZ NOT NULL,
    logout_timestamp TIMESTAMPTZ,
    session_duration INTERVAL,
    
    -- Technical info
    ip_address INET,
    user_agent TEXT,
    device_fingerprint VARCHAR(255),
    
    -- Security flags
    is_suspicious BOOLEAN DEFAULT FALSE,
    failed_login_attempts INTEGER DEFAULT 0,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_verified BOOLEAN DEFAULT FALSE,
    
    -- Location data
    country_code VARCHAR(2),
    city VARCHAR(100),
    timezone VARCHAR(50),
    
    -- Session metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- System events table for infrastructure monitoring
CREATE TABLE audit_system_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Event identification
    event_type VARCHAR(100) NOT NULL,
    component VARCHAR(100) NOT NULL, -- api, database, webhook, etc.
    
    -- Event details
    message TEXT NOT NULL,
    severity audit_log_level NOT NULL,
    
    -- Technical details
    hostname VARCHAR(255),
    process_id INTEGER,
    thread_id VARCHAR(50),
    
    -- Performance metrics
    cpu_usage DECIMAL(5,2),
    memory_usage_mb INTEGER,
    disk_usage_mb INTEGER,
    
    -- Event data
    details JSONB DEFAULT '{}',
    stack_trace TEXT,
    
    -- Timestamps
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Compliance reports table
CREATE TABLE audit_compliance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Report identification
    report_type VARCHAR(100) NOT NULL, -- 'soc2', 'gdpr', 'sox', etc.
    report_name VARCHAR(255) NOT NULL,
    report_period_start TIMESTAMPTZ NOT NULL,
    report_period_end TIMESTAMPTZ NOT NULL,
    
    -- Report metadata
    generated_by UUID REFERENCES auth.users(id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, complete, failed
    
    -- Report data
    total_events INTEGER DEFAULT 0,
    security_events INTEGER DEFAULT 0,
    failed_events INTEGER DEFAULT 0,
    high_risk_events INTEGER DEFAULT 0,
    
    -- Report files
    report_data JSONB DEFAULT '{}',
    report_file_path TEXT,
    report_file_size INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit configuration table
CREATE TABLE audit_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Configuration key-value pairs
    config_key VARCHAR(255) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    config_type VARCHAR(50) NOT NULL, -- 'system', 'compliance', 'retention'
    
    -- Metadata
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Change tracking
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for optimal query performance
CREATE INDEX idx_audit_logs_event_timestamp ON audit_logs(event_timestamp DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_event_category ON audit_logs(event_category);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX idx_audit_logs_status ON audit_logs(status);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_ip_address ON audit_logs(ip_address);
CREATE INDEX idx_audit_logs_correlation_id ON audit_logs(correlation_id);
CREATE INDEX idx_audit_logs_compliance_tags ON audit_logs USING gin(compliance_tags);
CREATE INDEX idx_audit_logs_details ON audit_logs USING gin(details);
CREATE INDEX idx_audit_logs_requires_review ON audit_logs(requires_review) WHERE requires_review = TRUE;

-- Composite indexes for common query patterns
CREATE INDEX idx_audit_logs_user_timestamp ON audit_logs(user_id, event_timestamp DESC);
CREATE INDEX idx_audit_logs_category_timestamp ON audit_logs(event_category, event_timestamp DESC);
CREATE INDEX idx_audit_logs_security_events ON audit_logs(event_category, severity, event_timestamp DESC) 
    WHERE event_category = 'security_event';

-- Session audit indexes
CREATE INDEX idx_audit_sessions_user_id ON audit_user_sessions(user_id);
CREATE INDEX idx_audit_sessions_login_timestamp ON audit_user_sessions(login_timestamp DESC);
CREATE INDEX idx_audit_sessions_suspicious ON audit_user_sessions(is_suspicious) WHERE is_suspicious = TRUE;

-- System events indexes
CREATE INDEX idx_audit_system_events_timestamp ON audit_system_events(event_timestamp DESC);
CREATE INDEX idx_audit_system_events_component ON audit_system_events(component);
CREATE INDEX idx_audit_system_events_severity ON audit_system_events(severity);

-- Compliance reports indexes
CREATE INDEX idx_audit_compliance_reports_type ON audit_compliance_reports(report_type);
CREATE INDEX idx_audit_compliance_reports_period ON audit_compliance_reports(report_period_start, report_period_end);

-- Create partitions for audit_logs by month for better performance
-- This will need to be managed by a maintenance job
SELECT partman.create_parent(
    p_parent_table => 'public.audit_logs',
    p_control => 'event_timestamp',
    p_type => 'range',
    p_interval => 'monthly'
);

-- Auto-update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply timestamp triggers
CREATE TRIGGER update_audit_user_sessions_updated_at 
    BEFORE UPDATE ON audit_user_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_compliance_reports_updated_at 
    BEFORE UPDATE ON audit_compliance_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_config_updated_at 
    BEFORE UPDATE ON audit_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate audit log checksum
CREATE OR REPLACE FUNCTION generate_audit_checksum(audit_record audit_logs)
RETURNS VARCHAR(64) AS $$
BEGIN
    RETURN encode(
        digest(
            CONCAT(
                audit_record.event_id,
                audit_record.user_id,
                audit_record.event_timestamp,
                audit_record.message,
                COALESCE(audit_record.details::text, ''),
                COALESCE(audit_record.old_values::text, ''),
                COALESCE(audit_record.new_values::text, '')
            ),
            'sha256'
        ),
        'hex'
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically generate checksums
CREATE OR REPLACE FUNCTION set_audit_log_checksum()
RETURNS TRIGGER AS $$
BEGIN
    NEW.checksum = generate_audit_checksum(NEW);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_audit_log_checksum_trigger
    BEFORE INSERT ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION set_audit_log_checksum();

-- Row Level Security (RLS) policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_system_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs
CREATE POLICY "Users can view their own audit logs" ON audit_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() 
            AND r.name IN ('admin', 'security_auditor', 'compliance_officer')
        )
    );

CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- RLS Policies for user sessions
CREATE POLICY "Users can view their own sessions" ON audit_user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions" ON audit_user_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() 
            AND r.name IN ('admin', 'security_auditor')
        )
    );

-- RLS Policies for system events (admin only)
CREATE POLICY "Admins can view system events" ON audit_system_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() 
            AND r.name IN ('admin', 'system_administrator')
        )
    );

-- RLS Policies for compliance reports
CREATE POLICY "Compliance officers can view reports" ON audit_compliance_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() 
            AND r.name IN ('admin', 'compliance_officer', 'security_auditor')
        )
    );

-- RLS Policies for audit config (admin only)
CREATE POLICY "Admins can manage audit config" ON audit_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            JOIN roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() 
            AND r.name = 'admin'
        )
    );

-- Insert default configuration
INSERT INTO audit_config (config_key, config_value, config_type, description) VALUES
    ('retention_policy', '{"default_period": "7 years", "security_events": "10 years", "compliance_events": "7 years"}', 'retention', 'Data retention policies for different event types'),
    ('log_levels', '{"enabled_levels": ["info", "warning", "error", "critical", "security"], "default_level": "info"}', 'system', 'Enabled audit log levels'),
    ('compliance_standards', '{"soc2": true, "gdpr": true, "sox": false, "hipaa": false}', 'compliance', 'Enabled compliance standards'),
    ('auto_archive', '{"enabled": true, "archive_after": "1 year", "compress": true}', 'system', 'Automatic archiving configuration'),
    ('real_time_monitoring', '{"enabled": true, "alert_thresholds": {"critical": 1, "security": 1, "failed_login": 5}}', 'system', 'Real-time monitoring and alerting configuration');

-- Create views for common audit queries
CREATE VIEW audit_security_events AS
SELECT 
    id,
    event_id,
    event_name,
    user_id,
    ip_address,
    message,
    severity,
    status,
    details,
    event_timestamp,
    risk_score
FROM audit_logs 
WHERE event_category = 'security_event' 
   OR severity = 'security'
   OR severity = 'critical';

CREATE VIEW audit_failed_events AS
SELECT 
    id,
    event_id,
    event_category,
    event_name,
    user_id,
    ip_address,
    message,
    details,
    event_timestamp
FROM audit_logs 
WHERE status = 'failure' OR status = 'blocked';

CREATE VIEW audit_high_risk_events AS
SELECT 
    id,
    event_id,
    event_category,
    event_name,
    user_id,
    ip_address,
    message,
    severity,
    risk_score,
    requires_review,
    event_timestamp
FROM audit_logs 
WHERE risk_score >= 7 OR requires_review = TRUE;

-- Grant permissions to service role
GRANT SELECT, INSERT ON audit_logs TO service_role;
GRANT SELECT, INSERT, UPDATE ON audit_user_sessions TO service_role;
GRANT SELECT, INSERT ON audit_system_events TO service_role;
GRANT SELECT, INSERT, UPDATE ON audit_compliance_reports TO service_role;
GRANT SELECT, UPDATE ON audit_config TO service_role;

-- Grant permissions to authenticated users (limited)
GRANT SELECT ON audit_logs TO authenticated;
GRANT SELECT ON audit_user_sessions TO authenticated;

-- Comments for documentation
COMMENT ON TABLE audit_logs IS 'Centralized audit logging for all system events and user actions';
COMMENT ON TABLE audit_user_sessions IS 'User session tracking for security and compliance auditing';
COMMENT ON TABLE audit_system_events IS 'System-level events and performance monitoring';
COMMENT ON TABLE audit_compliance_reports IS 'Generated compliance reports and audit summaries';
COMMENT ON TABLE audit_config IS 'Configuration settings for the audit logging system';

COMMENT ON COLUMN audit_logs.event_id IS 'Unique identifier for the event, used for deduplication';
COMMENT ON COLUMN audit_logs.correlation_id IS 'Links related events together for tracing';
COMMENT ON COLUMN audit_logs.checksum IS 'SHA-256 hash for tamper detection and integrity verification';
COMMENT ON COLUMN audit_logs.compliance_tags IS 'Tags for compliance mapping (SOC2, GDPR, etc.)';
COMMENT ON COLUMN audit_logs.risk_score IS 'Risk assessment score from 0-10 for the event'; 