-- ============================================================================
-- Telegram Bot Data Access Control & Error Logging Schema
-- Task 20.5: Implement Data Access Controls and Error Handling
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Telegram Data Access Log Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS telegram_data_access_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES telegram_users(id) ON DELETE CASCADE,
    telegram_id VARCHAR(20) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    success BOOLEAN NOT NULL,
    reason VARCHAR(500),
    matched_rule VARCHAR(255),
    request_data JSONB,
    client_info JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT telegram_data_access_log_telegram_id_check CHECK (LENGTH(telegram_id) > 0),
    CONSTRAINT telegram_data_access_log_resource_check CHECK (LENGTH(resource) > 0),
    CONSTRAINT telegram_data_access_log_action_check CHECK (LENGTH(action) > 0)
);

-- Create indexes for performance and security analysis
CREATE INDEX IF NOT EXISTS idx_telegram_data_access_log_user_id ON telegram_data_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_data_access_log_telegram_id ON telegram_data_access_log(telegram_id);
CREATE INDEX IF NOT EXISTS idx_telegram_data_access_log_resource ON telegram_data_access_log(resource);
CREATE INDEX IF NOT EXISTS idx_telegram_data_access_log_action ON telegram_data_access_log(action);
CREATE INDEX IF NOT EXISTS idx_telegram_data_access_log_success ON telegram_data_access_log(success);
CREATE INDEX IF NOT EXISTS idx_telegram_data_access_log_created_at ON telegram_data_access_log(created_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_telegram_data_access_log_user_resource 
    ON telegram_data_access_log(user_id, resource, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telegram_data_access_log_security_analysis 
    ON telegram_data_access_log(telegram_id, success, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telegram_data_access_log_audit_trail 
    ON telegram_data_access_log(resource, action, created_at DESC);

-- ============================================================================
-- Telegram Error Log Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS telegram_error_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    error_id VARCHAR(50) UNIQUE NOT NULL,
    error_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    stack_trace TEXT,
    user_id UUID REFERENCES telegram_users(id) ON DELETE SET NULL,
    telegram_id VARCHAR(20),
    chat_id BIGINT,
    message_id INTEGER,
    command VARCHAR(100),
    resource VARCHAR(255),
    action VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    request_id VARCHAR(100),
    recovery_attempted BOOLEAN DEFAULT FALSE,
    recovery_successful BOOLEAN DEFAULT FALSE,
    recovery_details JSONB,
    context_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT telegram_error_log_error_type_check CHECK (LENGTH(error_type) > 0),
    CONSTRAINT telegram_error_log_message_check CHECK (LENGTH(message) > 0)
);

-- Create indexes for error monitoring and analysis
CREATE INDEX IF NOT EXISTS idx_telegram_error_log_error_id ON telegram_error_log(error_id);
CREATE INDEX IF NOT EXISTS idx_telegram_error_log_error_type ON telegram_error_log(error_type);
CREATE INDEX IF NOT EXISTS idx_telegram_error_log_severity ON telegram_error_log(severity);
CREATE INDEX IF NOT EXISTS idx_telegram_error_log_user_id ON telegram_error_log(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_error_log_telegram_id ON telegram_error_log(telegram_id);
CREATE INDEX IF NOT EXISTS idx_telegram_error_log_chat_id ON telegram_error_log(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_error_log_created_at ON telegram_error_log(created_at);
CREATE INDEX IF NOT EXISTS idx_telegram_error_log_resolved_at ON telegram_error_log(resolved_at);

-- Composite indexes for error analysis
CREATE INDEX IF NOT EXISTS idx_telegram_error_log_type_severity 
    ON telegram_error_log(error_type, severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telegram_error_log_user_errors 
    ON telegram_error_log(telegram_id, error_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telegram_error_log_unresolved 
    ON telegram_error_log(severity, created_at DESC) WHERE resolved_at IS NULL;

-- ============================================================================
-- Telegram Rate Limit Log Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS telegram_rate_limit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id VARCHAR(20) NOT NULL,
    chat_id BIGINT NOT NULL,
    limit_type VARCHAR(50) NOT NULL, -- 'message', 'command', 'ai_query', etc.
    limit_window INTEGER NOT NULL, -- seconds
    current_count INTEGER NOT NULL,
    limit_threshold INTEGER NOT NULL,
    exceeded BOOLEAN NOT NULL DEFAULT FALSE,
    reset_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT telegram_rate_limit_log_telegram_id_check CHECK (LENGTH(telegram_id) > 0),
    CONSTRAINT telegram_rate_limit_log_limit_type_check CHECK (LENGTH(limit_type) > 0),
    CONSTRAINT telegram_rate_limit_log_counts_check CHECK (current_count >= 0 AND limit_threshold > 0)
);

-- Create indexes for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_telegram_rate_limit_log_telegram_id ON telegram_rate_limit_log(telegram_id);
CREATE INDEX IF NOT EXISTS idx_telegram_rate_limit_log_chat_id ON telegram_rate_limit_log(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_rate_limit_log_limit_type ON telegram_rate_limit_log(limit_type);
CREATE INDEX IF NOT EXISTS idx_telegram_rate_limit_log_reset_at ON telegram_rate_limit_log(reset_at);
CREATE INDEX IF NOT EXISTS idx_telegram_rate_limit_log_created_at ON telegram_rate_limit_log(created_at);

-- Composite index for rate limit checking (removed NOW() from WHERE clause due to PostgreSQL IMMUTABLE requirement)
CREATE INDEX IF NOT EXISTS idx_telegram_rate_limit_log_active 
    ON telegram_rate_limit_log(telegram_id, limit_type, reset_at DESC);

-- ============================================================================
-- Telegram Security Events Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS telegram_security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL, -- 'suspicious_activity', 'brute_force', 'privilege_escalation', etc.
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    telegram_id VARCHAR(20),
    chat_id BIGINT,
    ip_address INET,
    user_agent TEXT,
    related_command VARCHAR(100),
    related_resource VARCHAR(255),
    threat_indicators JSONB,
    mitigation_applied JSONB,
    investigation_status VARCHAR(50) DEFAULT 'new' CHECK (investigation_status IN ('new', 'investigating', 'resolved', 'false_positive')),
    assigned_to VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT telegram_security_events_event_type_check CHECK (LENGTH(event_type) > 0),
    CONSTRAINT telegram_security_events_title_check CHECK (LENGTH(title) > 0),
    CONSTRAINT telegram_security_events_description_check CHECK (LENGTH(description) > 0)
);

-- Create indexes for security monitoring
CREATE INDEX IF NOT EXISTS idx_telegram_security_events_event_type ON telegram_security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_telegram_security_events_severity ON telegram_security_events(severity);
CREATE INDEX IF NOT EXISTS idx_telegram_security_events_telegram_id ON telegram_security_events(telegram_id);
CREATE INDEX IF NOT EXISTS idx_telegram_security_events_chat_id ON telegram_security_events(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_security_events_status ON telegram_security_events(investigation_status);
CREATE INDEX IF NOT EXISTS idx_telegram_security_events_created_at ON telegram_security_events(created_at);

-- Composite indexes for security analysis
CREATE INDEX IF NOT EXISTS idx_telegram_security_events_open 
    ON telegram_security_events(severity, created_at DESC) WHERE investigation_status IN ('new', 'investigating');
CREATE INDEX IF NOT EXISTS idx_telegram_security_events_user_timeline 
    ON telegram_security_events(telegram_id, created_at DESC);

-- ============================================================================
-- Functions and Triggers
-- ============================================================================

-- Function to update updated_at timestamp for security events
CREATE OR REPLACE FUNCTION update_telegram_security_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for telegram_security_events table
DROP TRIGGER IF EXISTS update_telegram_security_events_updated_at ON telegram_security_events;
CREATE TRIGGER update_telegram_security_events_updated_at
    BEFORE UPDATE ON telegram_security_events
    FOR EACH ROW
    EXECUTE FUNCTION update_telegram_security_events_updated_at();

-- Function to cleanup old logs (data retention)
CREATE OR REPLACE FUNCTION cleanup_old_telegram_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    temp_count INTEGER;
BEGIN
    -- Clean up old data access logs (keep 6 months)
    DELETE FROM telegram_data_access_log 
    WHERE created_at < NOW() - INTERVAL '6 months';
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Clean up old error logs (keep 1 year)
    DELETE FROM telegram_error_log 
    WHERE created_at < NOW() - INTERVAL '1 year' AND resolved_at IS NOT NULL;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Clean up old rate limit logs (keep 3 months)
    DELETE FROM telegram_rate_limit_log 
    WHERE created_at < NOW() - INTERVAL '3 months';
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Clean up resolved security events (keep 2 years)
    DELETE FROM telegram_security_events 
    WHERE created_at < NOW() - INTERVAL '2 years' 
    AND investigation_status = 'resolved';
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Function to detect suspicious activity patterns
CREATE OR REPLACE FUNCTION detect_telegram_suspicious_activity()
RETURNS TABLE(telegram_id VARCHAR(20), event_type VARCHAR(100), details TEXT) AS $$
BEGIN
    -- Detect multiple failed authentication attempts
    RETURN QUERY
    SELECT 
        tal.telegram_id,
        'multiple_auth_failures'::VARCHAR(100) as event_type,
        ('Failed authentication attempts: ' || COUNT(*) || ' in last 1 hour')::TEXT as details
    FROM telegram_auth_attempts tal
    WHERE tal.created_at > NOW() - INTERVAL '1 hour'
        AND tal.success = FALSE
    GROUP BY tal.telegram_id
    HAVING COUNT(*) >= 5;
    
    -- Detect rapid command execution (potential bot behavior)
    RETURN QUERY
    SELECT 
        tdal.telegram_id,
        'rapid_commands'::VARCHAR(100) as event_type,
        ('Rapid command execution: ' || COUNT(*) || ' commands in last 5 minutes')::TEXT as details
    FROM telegram_data_access_log tdal
    WHERE tdal.created_at > NOW() - INTERVAL '5 minutes'
        AND tdal.action = 'execute'
    GROUP BY tdal.telegram_id
    HAVING COUNT(*) >= 20;
    
    -- Detect privilege escalation attempts
    RETURN QUERY
    SELECT 
        tdal.telegram_id,
        'privilege_escalation'::VARCHAR(100) as event_type,
        ('Multiple access denied events: ' || COUNT(*) || ' in last 30 minutes')::TEXT as details
    FROM telegram_data_access_log tdal
    WHERE tdal.created_at > NOW() - INTERVAL '30 minutes'
        AND tdal.success = FALSE
        AND tdal.reason LIKE '%Access denied%'
    GROUP BY tdal.telegram_id
    HAVING COUNT(*) >= 10;
END;
$$ language 'plpgsql';

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE telegram_data_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_error_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_rate_limit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_security_events ENABLE ROW LEVEL SECURITY;

-- Policies for data access logs: Users can only see their own logs
CREATE POLICY telegram_data_access_log_own_logs ON telegram_data_access_log
    FOR SELECT 
    USING (telegram_id = current_setting('app.current_telegram_id', true));

-- Policies for error logs: Users can only see their own errors
CREATE POLICY telegram_error_log_own_errors ON telegram_error_log
    FOR SELECT 
    USING (telegram_id = current_setting('app.current_telegram_id', true));

-- Policies for rate limit logs: Users can only see their own logs
CREATE POLICY telegram_rate_limit_log_own_logs ON telegram_rate_limit_log
    FOR SELECT 
    USING (telegram_id = current_setting('app.current_telegram_id', true));

-- Security events: Only admins can see security events
CREATE POLICY telegram_security_events_admin_only ON telegram_security_events
    FOR ALL 
    USING (
        current_setting('app.current_telegram_id', true) IN (
            SELECT telegram_id FROM telegram_users WHERE role = 'admin'
        )
    );

-- Admin bypass policies (for service role)
CREATE POLICY telegram_admin_bypass_data_access_log ON telegram_data_access_log
    FOR ALL 
    TO service_role
    USING (true);

CREATE POLICY telegram_admin_bypass_error_log ON telegram_error_log
    FOR ALL 
    TO service_role
    USING (true);

CREATE POLICY telegram_admin_bypass_rate_limit_log ON telegram_rate_limit_log
    FOR ALL 
    TO service_role
    USING (true);

CREATE POLICY telegram_admin_bypass_security_events ON telegram_security_events
    FOR ALL 
    TO service_role
    USING (true);

-- ============================================================================
-- Views for Monitoring and Analytics
-- ============================================================================

-- View for data access analytics
CREATE OR REPLACE VIEW telegram_data_access_analytics AS
SELECT 
    tu.telegram_id,
    tu.first_name,
    tu.role,
    tdal.resource,
    tdal.action,
    COUNT(*) as access_count,
    COUNT(*) FILTER (WHERE tdal.success = TRUE) as successful_count,
    COUNT(*) FILTER (WHERE tdal.success = FALSE) as failed_count,
    MAX(tdal.created_at) as last_access,
    DATE_TRUNC('day', tdal.created_at) as access_date
FROM telegram_data_access_log tdal
JOIN telegram_users tu ON tdal.user_id = tu.id
WHERE tdal.created_at > NOW() - INTERVAL '30 days'
GROUP BY tu.telegram_id, tu.first_name, tu.role, tdal.resource, tdal.action, DATE_TRUNC('day', tdal.created_at)
ORDER BY access_date DESC, access_count DESC;

-- View for error analytics
CREATE OR REPLACE VIEW telegram_error_analytics AS
SELECT 
    tel.error_type,
    tel.severity,
    COUNT(*) as error_count,
    COUNT(DISTINCT tel.telegram_id) as affected_users,
    MAX(tel.created_at) as last_occurrence,
    COUNT(*) FILTER (WHERE tel.created_at > NOW() - INTERVAL '24 hours') as errors_24h,
    COUNT(*) FILTER (WHERE tel.resolved_at IS NOT NULL) as resolved_count,
    AVG(EXTRACT(EPOCH FROM (tel.resolved_at - tel.created_at))) / 60 as avg_resolution_minutes
FROM telegram_error_log tel
WHERE tel.created_at > NOW() - INTERVAL '7 days'
GROUP BY tel.error_type, tel.severity
ORDER BY error_count DESC;

-- View for security dashboard
CREATE OR REPLACE VIEW telegram_security_dashboard AS
SELECT 
    'active_threats'::TEXT as metric_type,
    COUNT(*)::BIGINT as metric_value,
    'High and Critical security events requiring attention'::TEXT as description
FROM telegram_security_events 
WHERE investigation_status IN ('new', 'investigating') 
    AND severity IN ('high', 'critical')

UNION ALL

SELECT 
    'failed_auth_24h'::TEXT as metric_type,
    COUNT(*)::BIGINT as metric_value,
    'Failed authentication attempts in last 24 hours'::TEXT as description
FROM telegram_auth_attempts 
WHERE created_at > NOW() - INTERVAL '24 hours' 
    AND success = FALSE

UNION ALL

SELECT 
    'access_denied_24h'::TEXT as metric_type,
    COUNT(*)::BIGINT as metric_value,
    'Access denied events in last 24 hours'::TEXT as description
FROM telegram_data_access_log 
WHERE created_at > NOW() - INTERVAL '24 hours' 
    AND success = FALSE

UNION ALL

SELECT 
    'critical_errors_24h'::TEXT as metric_type,
    COUNT(*)::BIGINT as metric_value,
    'Critical errors in last 24 hours'::TEXT as description
FROM telegram_error_log 
WHERE created_at > NOW() - INTERVAL '24 hours' 
    AND severity = 'critical';

-- ============================================================================
-- Grant Permissions
-- ============================================================================

-- Grant necessary permissions to authenticated and service roles
GRANT USAGE ON SCHEMA public TO authenticated, service_role;

GRANT SELECT, INSERT ON telegram_data_access_log TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON telegram_error_log TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON telegram_rate_limit_log TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON telegram_security_events TO authenticated, service_role;

-- Grant access to views
GRANT SELECT ON telegram_data_access_analytics TO service_role;
GRANT SELECT ON telegram_error_analytics TO service_role;
GRANT SELECT ON telegram_security_dashboard TO service_role;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION cleanup_old_telegram_logs() TO service_role;
GRANT EXECUTE ON FUNCTION detect_telegram_suspicious_activity() TO service_role;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE telegram_data_access_log IS 'Logs all data access attempts for security monitoring and audit trails';
COMMENT ON TABLE telegram_error_log IS 'Comprehensive error logging with context and recovery information';
COMMENT ON TABLE telegram_rate_limit_log IS 'Rate limiting enforcement and monitoring logs';
COMMENT ON TABLE telegram_security_events IS 'Security incident tracking and investigation management';

COMMENT ON COLUMN telegram_data_access_log.matched_rule IS 'ID of the access control rule that was matched (if any)';
COMMENT ON COLUMN telegram_error_log.error_id IS 'Unique identifier for tracking specific error instances';
COMMENT ON COLUMN telegram_error_log.recovery_attempted IS 'Whether automatic recovery was attempted';
COMMENT ON COLUMN telegram_security_events.threat_indicators IS 'JSON data containing threat intelligence indicators';

COMMENT ON VIEW telegram_data_access_analytics IS 'Aggregated data access patterns for security analysis';
COMMENT ON VIEW telegram_error_analytics IS 'Error statistics and trends for system monitoring';
COMMENT ON VIEW telegram_security_dashboard IS 'Key security metrics for administrative dashboard';

COMMENT ON FUNCTION cleanup_old_telegram_logs() IS 'Automated cleanup of old log entries based on retention policies';
COMMENT ON FUNCTION detect_telegram_suspicious_activity() IS 'Automated detection of suspicious user behavior patterns';