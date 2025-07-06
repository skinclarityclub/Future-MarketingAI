-- ============================================================================
-- Telegram Bot Authentication Schema
-- Task 20.2: Implement Secure User Authentication and Session Management
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Telegram Users Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS telegram_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id VARCHAR(20) UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    email VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer', 'analyst')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    permissions JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    
    -- Indexes for performance
    CONSTRAINT telegram_users_telegram_id_check CHECK (LENGTH(telegram_id) > 0),
    CONSTRAINT telegram_users_first_name_check CHECK (LENGTH(first_name) > 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_telegram_users_telegram_id ON telegram_users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_telegram_users_status ON telegram_users(status);
CREATE INDEX IF NOT EXISTS idx_telegram_users_role ON telegram_users(role);
CREATE INDEX IF NOT EXISTS idx_telegram_users_last_login ON telegram_users(last_login);

-- ============================================================================
-- Telegram Sessions Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS telegram_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES telegram_users(id) ON DELETE CASCADE,
    telegram_chat_id VARCHAR(20) NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    auth_method VARCHAR(50) NOT NULL DEFAULT 'telegram' CHECK (auth_method IN ('telegram', 'password', 'token')),
    
    -- Constraints
    CONSTRAINT telegram_sessions_expires_at_check CHECK (expires_at > created_at),
    CONSTRAINT telegram_sessions_session_token_check CHECK (LENGTH(session_token) > 0),
    CONSTRAINT telegram_sessions_telegram_chat_id_check CHECK (LENGTH(telegram_chat_id) > 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_user_id ON telegram_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_session_token ON telegram_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_chat_id ON telegram_sessions(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_expires_at ON telegram_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_is_active ON telegram_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_last_activity ON telegram_sessions(last_activity);

-- ============================================================================
-- Telegram Authentication Attempts Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS telegram_auth_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id VARCHAR(20) NOT NULL,
    telegram_chat_id VARCHAR(20) NOT NULL,
    attempt_type VARCHAR(50) NOT NULL CHECK (attempt_type IN ('login', 'access', 'command')),
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT telegram_auth_attempts_telegram_id_check CHECK (LENGTH(telegram_id) > 0),
    CONSTRAINT telegram_auth_attempts_telegram_chat_id_check CHECK (LENGTH(telegram_chat_id) > 0)
);

-- Create indexes for performance and security monitoring
CREATE INDEX IF NOT EXISTS idx_telegram_auth_attempts_telegram_id ON telegram_auth_attempts(telegram_id);
CREATE INDEX IF NOT EXISTS idx_telegram_auth_attempts_created_at ON telegram_auth_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_telegram_auth_attempts_success ON telegram_auth_attempts(success);
CREATE INDEX IF NOT EXISTS idx_telegram_auth_attempts_attempt_type ON telegram_auth_attempts(attempt_type);
CREATE INDEX IF NOT EXISTS idx_telegram_auth_attempts_failure_reason ON telegram_auth_attempts(failure_reason);

-- Composite indexes for rate limiting and security analysis
CREATE INDEX IF NOT EXISTS idx_telegram_auth_attempts_rate_limit 
    ON telegram_auth_attempts(telegram_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telegram_auth_attempts_security_analysis 
    ON telegram_auth_attempts(telegram_id, success, created_at DESC);

-- ============================================================================
-- Telegram User Permissions Table (for custom permissions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS telegram_user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES telegram_users(id) ON DELETE CASCADE,
    permission VARCHAR(255) NOT NULL,
    granted_by UUID REFERENCES telegram_users(id),
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Constraints
    CONSTRAINT telegram_user_permissions_permission_check CHECK (LENGTH(permission) > 0),
    CONSTRAINT telegram_user_permissions_unique UNIQUE (user_id, permission),
    CONSTRAINT telegram_user_permissions_expires_check CHECK (expires_at IS NULL OR expires_at > granted_at)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_telegram_user_permissions_user_id ON telegram_user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_user_permissions_permission ON telegram_user_permissions(permission);
CREATE INDEX IF NOT EXISTS idx_telegram_user_permissions_is_active ON telegram_user_permissions(is_active);
CREATE INDEX IF NOT EXISTS idx_telegram_user_permissions_expires_at ON telegram_user_permissions(expires_at);

-- ============================================================================
-- Functions and Triggers
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for telegram_users table
DROP TRIGGER IF EXISTS update_telegram_users_updated_at ON telegram_users;
CREATE TRIGGER update_telegram_users_updated_at
    BEFORE UPDATE ON telegram_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_telegram_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    UPDATE telegram_sessions 
    SET is_active = FALSE 
    WHERE expires_at < NOW() AND is_active = TRUE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old auth attempts (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_telegram_auth_attempts()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM telegram_auth_attempts 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user session count
CREATE OR REPLACE FUNCTION get_user_active_session_count(user_telegram_id VARCHAR)
RETURNS INTEGER AS $$
DECLARE
    session_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO session_count
    FROM telegram_sessions ts
    JOIN telegram_users tu ON ts.user_id = tu.id
    WHERE tu.telegram_id = user_telegram_id 
      AND ts.is_active = TRUE 
      AND ts.expires_at > NOW();
      
    RETURN COALESCE(session_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get failed login attempts in last hour
CREATE OR REPLACE FUNCTION get_recent_failed_attempts(user_telegram_id VARCHAR)
RETURNS INTEGER AS $$
DECLARE
    attempt_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO attempt_count
    FROM telegram_auth_attempts
    WHERE telegram_id = user_telegram_id 
      AND success = FALSE 
      AND created_at > NOW() - INTERVAL '1 hour';
      
    RETURN COALESCE(attempt_count, 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE telegram_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_auth_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_user_permissions ENABLE ROW LEVEL SECURITY;

-- Policy for telegram_users: Users can only see their own record
CREATE POLICY telegram_users_own_record_policy ON telegram_users
    FOR ALL 
    USING (telegram_id = current_setting('app.current_telegram_id', true));

-- Policy for telegram_sessions: Users can only see their own sessions
CREATE POLICY telegram_sessions_own_sessions_policy ON telegram_sessions
    FOR ALL 
    USING (user_id IN (
        SELECT id FROM telegram_users 
        WHERE telegram_id = current_setting('app.current_telegram_id', true)
    ));

-- Policy for telegram_auth_attempts: Users can only see their own attempts
CREATE POLICY telegram_auth_attempts_own_attempts_policy ON telegram_auth_attempts
    FOR ALL 
    USING (telegram_id = current_setting('app.current_telegram_id', true));

-- Policy for telegram_user_permissions: Users can only see their own permissions
CREATE POLICY telegram_user_permissions_own_permissions_policy ON telegram_user_permissions
    FOR ALL 
    USING (user_id IN (
        SELECT id FROM telegram_users 
        WHERE telegram_id = current_setting('app.current_telegram_id', true)
    ));

-- Admin bypass policies (for service role)
CREATE POLICY telegram_admin_bypass_users ON telegram_users
    FOR ALL 
    TO service_role
    USING (true);

CREATE POLICY telegram_admin_bypass_sessions ON telegram_sessions
    FOR ALL 
    TO service_role
    USING (true);

CREATE POLICY telegram_admin_bypass_attempts ON telegram_auth_attempts
    FOR ALL 
    TO service_role
    USING (true);

CREATE POLICY telegram_admin_bypass_permissions ON telegram_user_permissions
    FOR ALL 
    TO service_role
    USING (true);

-- ============================================================================
-- Default Data and Permissions
-- ============================================================================

-- Create default permissions for roles
INSERT INTO public.telegram_users (telegram_id, first_name, role, status, permissions) 
VALUES 
  ('system', 'System', 'admin', 'active', '["*"]'::jsonb)
ON CONFLICT (telegram_id) DO NOTHING;

-- ============================================================================
-- Views for Monitoring and Analytics
-- ============================================================================

-- View for active sessions
CREATE OR REPLACE VIEW telegram_active_sessions AS
SELECT 
    ts.id,
    tu.telegram_id,
    tu.first_name,
    tu.last_name,
    tu.role,
    ts.telegram_chat_id,
    ts.created_at,
    ts.last_activity,
    ts.expires_at,
    ts.auth_method,
    EXTRACT(EPOCH FROM (ts.expires_at - NOW())) / 60 AS minutes_until_expiry
FROM telegram_sessions ts
JOIN telegram_users tu ON ts.user_id = tu.id
WHERE ts.is_active = TRUE AND ts.expires_at > NOW()
ORDER BY ts.last_activity DESC;

-- View for security metrics
CREATE OR REPLACE VIEW telegram_security_metrics AS
SELECT 
    tu.telegram_id,
    tu.first_name,
    tu.role,
    tu.status,
    tu.last_login,
    COUNT(DISTINCT ts.id) FILTER (WHERE ts.is_active = TRUE AND ts.expires_at > NOW()) AS active_sessions,
    COUNT(ta.id) FILTER (WHERE ta.created_at > NOW() - INTERVAL '24 hours') AS attempts_24h,
    COUNT(ta.id) FILTER (WHERE ta.created_at > NOW() - INTERVAL '24 hours' AND ta.success = TRUE) AS successful_24h,
    COUNT(ta.id) FILTER (WHERE ta.created_at > NOW() - INTERVAL '24 hours' AND ta.success = FALSE) AS failed_24h
FROM telegram_users tu
LEFT JOIN telegram_sessions ts ON tu.id = ts.user_id
LEFT JOIN telegram_auth_attempts ta ON tu.telegram_id = ta.telegram_id
GROUP BY tu.id, tu.telegram_id, tu.first_name, tu.role, tu.status, tu.last_login
ORDER BY tu.last_login DESC NULLS LAST;

-- ============================================================================
-- Grant Permissions
-- ============================================================================

-- Grant necessary permissions to authenticated and service roles
GRANT USAGE ON SCHEMA public TO authenticated, service_role;

GRANT SELECT, INSERT, UPDATE ON telegram_users TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON telegram_sessions TO authenticated, service_role;
GRANT SELECT, INSERT ON telegram_auth_attempts TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON telegram_user_permissions TO authenticated, service_role;

-- Grant access to views
GRANT SELECT ON telegram_active_sessions TO service_role;
GRANT SELECT ON telegram_security_metrics TO service_role;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE telegram_users IS 'Stores Telegram bot user profiles with roles and permissions';
COMMENT ON TABLE telegram_sessions IS 'Manages active user sessions with security tracking';
COMMENT ON TABLE telegram_auth_attempts IS 'Logs all authentication attempts for security monitoring';
COMMENT ON TABLE telegram_user_permissions IS 'Custom permissions for individual users';

COMMENT ON COLUMN telegram_users.permissions IS 'JSONB array of permission strings for this user';
COMMENT ON COLUMN telegram_sessions.session_token IS 'Secure session token for authentication';
COMMENT ON COLUMN telegram_auth_attempts.failure_reason IS 'Reason for authentication failure';

COMMENT ON VIEW telegram_active_sessions IS 'Current active sessions with user information';
COMMENT ON VIEW telegram_security_metrics IS 'Security metrics and statistics per user';

-- ============================================================================
-- Schema Creation Complete
-- ============================================================================

-- Verify tables were created
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public' 
    AND table_name IN ('telegram_users', 'telegram_sessions', 'telegram_auth_attempts', 'telegram_user_permissions');
    
    IF table_count = 4 THEN
        RAISE NOTICE 'SUCCESS: All 4 Telegram authentication tables created successfully';
    ELSE
        RAISE WARNING 'WARNING: Only % out of 4 tables were created', table_count;
    END IF;
END $$; 