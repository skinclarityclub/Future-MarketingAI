-- Enterprise User Roles System for Fortune 500 Security Compliance
-- Version: 1.0
-- Date: 2025-01-18

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Handle Existing Tables and Data Type Conflicts
-- =============================================

-- Check and handle existing user_sessions table
DO $$ 
BEGIN
    -- Drop existing user_sessions table if it exists with incompatible schema
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_sessions') THEN
        -- Check if the id column is TEXT type
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_sessions' 
            AND column_name = 'id' 
            AND data_type = 'text'
        ) THEN
            RAISE NOTICE 'Dropping existing user_sessions table with incompatible schema';
            DROP TABLE IF EXISTS user_sessions CASCADE;
        END IF;
    END IF;
END $$;

-- =============================================
-- Enterprise Roles Management System
-- =============================================

-- Define enterprise roles enum
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM (
        'super_admin',           -- System administrator
        'admin',                 -- Administrative access
        'compliance_officer',    -- SOC 2 compliance management
        'security_admin',        -- Security controls management
        'auditor',              -- Audit and review access
        'risk_manager',         -- Risk assessment and management
        'executive',            -- Executive dashboard access
        'manager',              -- Team management access
        'analyst',              -- Data analysis and reporting
        'user'                  -- Standard authenticated user
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- User roles assignment table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role_type NOT NULL,
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- Optional role expiration
    is_active BOOLEAN DEFAULT TRUE,
    scope_restrictions JSONB DEFAULT '{}', -- Optional scope limitations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique active role per user (users can have multiple roles)
    UNIQUE(user_id, role) DEFERRABLE INITIALLY DEFERRED
);

-- Role permissions mapping table
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role user_role_type NOT NULL,
    resource VARCHAR(100) NOT NULL, -- e.g., 'soc2_controls', 'evidence', 'assessments'
    action VARCHAR(50) NOT NULL,    -- e.g., 'read', 'write', 'delete', 'approve'
    conditions JSONB DEFAULT '{}',  -- Additional conditions for permission
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(role, resource, action)
);

-- User sessions tracking for audit purposes - FIXED: Ensure UUID consistency
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logout_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log for role changes and security events
CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    actor_id UUID REFERENCES auth.users(id), -- Who performed the action
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id UUID REFERENCES user_sessions(id) -- Both are now UUID
);

-- =============================================
-- Indexes for Performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_roles_expires ON user_roles(expires_at);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_resource ON role_permissions(resource);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);

CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_timestamp ON security_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_action ON security_audit_log(action);

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- User Roles RLS Policies
DROP POLICY IF EXISTS "user_roles_select_policy" ON user_roles;
CREATE POLICY "user_roles_select_policy" ON user_roles
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            user_id = auth.uid() OR -- Users can see their own roles
            EXISTS (
                SELECT 1 FROM user_roles ur 
                WHERE ur.user_id = auth.uid() 
                AND ur.role IN ('super_admin', 'admin', 'compliance_officer')
                AND ur.is_active = TRUE
                AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
            )
        )
    );

DROP POLICY IF EXISTS "user_roles_insert_policy" ON user_roles;
CREATE POLICY "user_roles_insert_policy" ON user_roles
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('super_admin', 'admin')
            AND ur.is_active = TRUE
            AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        )
    );

DROP POLICY IF EXISTS "user_roles_update_policy" ON user_roles;
CREATE POLICY "user_roles_update_policy" ON user_roles
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('super_admin', 'admin')
            AND ur.is_active = TRUE
            AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        )
    );

DROP POLICY IF EXISTS "user_roles_delete_policy" ON user_roles;
CREATE POLICY "user_roles_delete_policy" ON user_roles
    FOR DELETE USING (
        auth.uid() IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'super_admin'
            AND ur.is_active = TRUE
            AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        )
    );

-- Role Permissions RLS Policies (Admin access only)
DROP POLICY IF EXISTS "role_permissions_select_policy" ON role_permissions;
CREATE POLICY "role_permissions_select_policy" ON role_permissions
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('super_admin', 'admin', 'compliance_officer')
            AND ur.is_active = TRUE
            AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        )
    );

DROP POLICY IF EXISTS "role_permissions_manage_policy" ON role_permissions;
CREATE POLICY "role_permissions_manage_policy" ON role_permissions
    FOR ALL USING (
        auth.uid() IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'super_admin'
            AND ur.is_active = TRUE
            AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        )
    );

-- User Sessions RLS Policies
DROP POLICY IF EXISTS "user_sessions_select_policy" ON user_sessions;
CREATE POLICY "user_sessions_select_policy" ON user_sessions
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            user_id = auth.uid() OR -- Users can see their own sessions
            EXISTS (
                SELECT 1 FROM user_roles ur 
                WHERE ur.user_id = auth.uid() 
                AND ur.role IN ('super_admin', 'admin', 'security_admin')
                AND ur.is_active = TRUE
                AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
            )
        )
    );

DROP POLICY IF EXISTS "user_sessions_insert_policy" ON user_sessions;
CREATE POLICY "user_sessions_insert_policy" ON user_sessions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "user_sessions_update_policy" ON user_sessions;
CREATE POLICY "user_sessions_update_policy" ON user_sessions
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND (
            user_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM user_roles ur 
                WHERE ur.user_id = auth.uid() 
                AND ur.role IN ('super_admin', 'admin')
                AND ur.is_active = TRUE
                AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
            )
        )
    );

-- Security Audit Log RLS Policies
DROP POLICY IF EXISTS "security_audit_log_select_policy" ON security_audit_log;
CREATE POLICY "security_audit_log_select_policy" ON security_audit_log
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('super_admin', 'admin', 'compliance_officer', 'auditor', 'security_admin')
            AND ur.is_active = TRUE
            AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        )
    );

DROP POLICY IF EXISTS "security_audit_log_insert_policy" ON security_audit_log;
CREATE POLICY "security_audit_log_insert_policy" ON security_audit_log
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- Security Functions
-- =============================================

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION has_role(user_uuid UUID, role_name user_role_type)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = user_uuid 
        AND role = role_name 
        AND is_active = TRUE
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user has specific role
CREATE OR REPLACE FUNCTION current_user_has_role(role_name user_role_type)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN has_role(auth.uid(), role_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission for resource/action
CREATE OR REPLACE FUNCTION has_permission(user_uuid UUID, resource_name VARCHAR, action_name VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    user_roles_array user_role_type[];
    role_item user_role_type;
BEGIN
    -- Get all active roles for user
    SELECT ARRAY_AGG(role) INTO user_roles_array
    FROM user_roles 
    WHERE user_id = user_uuid 
    AND is_active = TRUE
    AND (expires_at IS NULL OR expires_at > NOW());
    
    -- Check if any role has the required permission
    FOREACH role_item IN ARRAY user_roles_array
    LOOP
        IF EXISTS (
            SELECT 1 FROM role_permissions 
            WHERE role = role_item 
            AND resource = resource_name 
            AND action = action_name
        ) THEN
            RETURN TRUE;
        END IF;
    END LOOP;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user roles
CREATE OR REPLACE FUNCTION get_user_roles(user_uuid UUID)
RETURNS TABLE(role user_role_type, assigned_at TIMESTAMP WITH TIME ZONE, expires_at TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
    RETURN QUERY
    SELECT ur.role, ur.assigned_at, ur.expires_at
    FROM user_roles ur
    WHERE ur.user_id = user_uuid 
    AND ur.is_active = TRUE
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    ORDER BY ur.assigned_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
    p_user_id UUID,
    p_action VARCHAR,
    p_resource_type VARCHAR DEFAULT NULL,
    p_resource_id VARCHAR DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_success BOOLEAN DEFAULT TRUE,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    audit_id UUID;
    current_session_id UUID;
BEGIN
    -- Get current session ID if exists
    SELECT id INTO current_session_id
    FROM user_sessions
    WHERE user_id = auth.uid()
    AND is_active = TRUE
    ORDER BY last_activity DESC
    LIMIT 1;
    
    INSERT INTO security_audit_log (
        user_id,
        actor_id,
        action,
        resource_type,
        resource_id,
        old_values,
        new_values,
        success,
        error_message,
        session_id
    ) VALUES (
        p_user_id,
        auth.uid(),
        p_action,
        p_resource_type,
        p_resource_id,
        p_old_values,
        p_new_values,
        p_success,
        p_error_message,
        current_session_id
    ) RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Triggers for Automatic Updates
-- =============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to log role changes
CREATE OR REPLACE FUNCTION log_role_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM log_security_event(
            NEW.user_id,
            'ROLE_ASSIGNED',
            'user_roles',
            NEW.id::TEXT,
            NULL,
            to_jsonb(NEW),
            TRUE
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM log_security_event(
            NEW.user_id,
            'ROLE_UPDATED',
            'user_roles',
            NEW.id::TEXT,
            to_jsonb(OLD),
            to_jsonb(NEW),
            TRUE
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_security_event(
            OLD.user_id,
            'ROLE_REMOVED',
            'user_roles',
            OLD.id::TEXT,
            to_jsonb(OLD),
            NULL,
            TRUE
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS log_user_role_changes ON user_roles;
CREATE TRIGGER log_user_role_changes
    AFTER INSERT OR UPDATE OR DELETE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION log_role_changes();

-- =============================================
-- Initial Role Permissions Setup
-- =============================================

-- Insert default role permissions
INSERT INTO role_permissions (role, resource, action) VALUES
-- Super Admin - Full access
('super_admin', '*', '*'),

-- Admin - Administrative access
('admin', 'soc2_controls', 'read'),
('admin', 'soc2_controls', 'write'),
('admin', 'soc2_controls', 'delete'),
('admin', 'soc2_evidence', 'read'),
('admin', 'soc2_evidence', 'write'),
('admin', 'soc2_evidence', 'delete'),
('admin', 'soc2_assessments', 'read'),
('admin', 'soc2_assessments', 'write'),
('admin', 'soc2_assessments', 'delete'),
('admin', 'user_roles', 'read'),
('admin', 'user_roles', 'write'),

-- Compliance Officer - SOC 2 focused access
('compliance_officer', 'soc2_controls', 'read'),
('compliance_officer', 'soc2_controls', 'write'),
('compliance_officer', 'soc2_evidence', 'read'),
('compliance_officer', 'soc2_evidence', 'write'),
('compliance_officer', 'soc2_evidence', 'approve'),
('compliance_officer', 'soc2_assessments', 'read'),
('compliance_officer', 'soc2_assessments', 'write'),
('compliance_officer', 'soc2_control_tests', 'read'),
('compliance_officer', 'soc2_control_tests', 'write'),

-- Security Admin - Security controls focused
('security_admin', 'soc2_controls', 'read'),
('security_admin', 'soc2_controls', 'write'),
('security_admin', 'soc2_evidence', 'read'),
('security_admin', 'soc2_evidence', 'write'),
('security_admin', 'security_audit_log', 'read'),

-- Auditor - Read-only audit access
('auditor', 'soc2_controls', 'read'),
('auditor', 'soc2_evidence', 'read'),
('auditor', 'soc2_assessments', 'read'),
('auditor', 'soc2_control_tests', 'read'),
('auditor', 'security_audit_log', 'read'),

-- Risk Manager - Risk assessment access
('risk_manager', 'soc2_controls', 'read'),
('risk_manager', 'soc2_controls', 'write'),
('risk_manager', 'soc2_assessments', 'read'),
('risk_manager', 'soc2_assessments', 'write'),

-- Executive - Dashboard and reporting access
('executive', 'soc2_controls', 'read'),
('executive', 'soc2_assessments', 'read'),
('executive', 'soc2_compliance_metrics', 'read'),

-- Manager - Team management access
('manager', 'soc2_controls', 'read'),
('manager', 'soc2_evidence', 'read'),
('manager', 'soc2_evidence', 'write'),

-- Analyst - Analysis and reporting
('analyst', 'soc2_controls', 'read'),
('analyst', 'soc2_evidence', 'read'),
('analyst', 'soc2_compliance_metrics', 'read'),

-- User - Basic authenticated access
('user', 'soc2_controls', 'read'),
('user', 'soc2_compliance_metrics', 'read')

ON CONFLICT (role, resource, action) DO NOTHING;

-- =============================================
-- Views for Role Management
-- =============================================

-- User roles summary view
CREATE OR REPLACE VIEW user_roles_summary AS
SELECT 
    u.id as user_id,
    u.email,
    ur.role,
    ur.assigned_at,
    ur.expires_at,
    ur.is_active,
    CASE 
        WHEN ur.expires_at IS NULL THEN 'permanent'
        WHEN ur.expires_at > NOW() THEN 'active'
        ELSE 'expired'
    END as status
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.is_active = TRUE
ORDER BY u.email, ur.role;

-- Role permissions summary view
CREATE OR REPLACE VIEW role_permissions_summary AS
SELECT 
    rp.role,
    rp.resource,
    rp.action,
    COUNT(ur.user_id) as users_with_role
FROM role_permissions rp
LEFT JOIN user_roles ur ON rp.role = ur.role AND ur.is_active = TRUE
GROUP BY rp.role, rp.resource, rp.action
ORDER BY rp.role, rp.resource, rp.action;

-- =============================================
-- Comments for Documentation
-- =============================================

COMMENT ON TABLE user_roles IS 'Enterprise role-based access control for Fortune 500 security compliance';
COMMENT ON TABLE role_permissions IS 'Granular permissions mapping for each role and resource';
COMMENT ON TABLE user_sessions IS 'User session tracking for audit and security monitoring';
COMMENT ON TABLE security_audit_log IS 'Complete audit trail for all security-related events';

COMMENT ON FUNCTION has_role(UUID, user_role_type) IS 'Check if user has specific active role';
COMMENT ON FUNCTION has_permission(UUID, VARCHAR, VARCHAR) IS 'Check if user has permission for resource/action';
COMMENT ON FUNCTION log_security_event IS 'Log security events for audit trail'; 