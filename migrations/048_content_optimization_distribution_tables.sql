-- Content Optimization Distribution System Tables
-- Migration: 048_content_optimization_distribution_tables.sql
-- Task 71.6: Content optimization distribution infrastructure

-- Content Optimization Distributions Table
CREATE TABLE IF NOT EXISTS content_optimization_distributions (
    id VARCHAR(255) PRIMARY KEY,
    content_id VARCHAR(255) NOT NULL,
    content_title TEXT NOT NULL,
    suggestions_count INTEGER DEFAULT 0,
    distribution_type VARCHAR(50) NOT NULL CHECK (distribution_type IN ('urgent', 'priority', 'standard', 'summary')),
    channels JSONB DEFAULT '[]'::jsonb, -- Distribution channels used
    stakeholder_groups JSONB DEFAULT '[]'::jsonb, -- Target stakeholder groups
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed', 'cancelled')),
    delivery_status JSONB DEFAULT '{}'::jsonb, -- Channel-specific delivery status
    audit_logged BOOLEAN DEFAULT false,
    audit_log_id VARCHAR(255),
    workflow_execution_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Optimization Dashboard Notifications Table
CREATE TABLE IF NOT EXISTS content_optimization_dashboard_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id VARCHAR(255) NOT NULL,
    content_title TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('urgent', 'priority', 'standard')),
    suggestions_count INTEGER DEFAULT 0,
    critical_count INTEGER DEFAULT 0,
    high_count INTEGER DEFAULT 0,
    estimated_impact JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'read', 'dismissed', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ
);

-- In-App Notifications Table
CREATE TABLE IF NOT EXISTS in_app_notifications (
    id VARCHAR(255) PRIMARY KEY,
    recipient_id VARCHAR(255) NOT NULL,
    recipient_type VARCHAR(50) DEFAULT 'user' CHECK (recipient_type IN ('user', 'group', 'role')),
    type VARCHAR(100) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category VARCHAR(50) DEFAULT 'general',
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'dismissed', 'archived')),
    action_url TEXT,
    action_text VARCHAR(100),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ
);

-- Webhook Integration Logs Table
CREATE TABLE IF NOT EXISTS webhook_integration_logs (
    id VARCHAR(255) PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    content_id VARCHAR(255) NOT NULL,
    content_title TEXT NOT NULL,
    webhooks_sent INTEGER DEFAULT 0,
    webhooks_failed INTEGER DEFAULT 0,
    webhook_results JSONB DEFAULT '[]'::jsonb,
    distribution_type VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Audit Logs Table
CREATE TABLE IF NOT EXISTS workflow_audit_logs (
    id VARCHAR(255) PRIMARY KEY,
    workflow_id VARCHAR(255) NOT NULL,
    execution_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    event_name TEXT NOT NULL,
    event_category VARCHAR(50) NOT NULL,
    content_id VARCHAR(255),
    content_title TEXT,
    distribution_type VARCHAR(50),
    channels_used JSONB DEFAULT '[]'::jsonb,
    suggestions_distributed INTEGER DEFAULT 0,
    execution_status VARCHAR(50) DEFAULT 'completed',
    execution_timestamp TIMESTAMPTZ NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    compliance_tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Activity Logs Table
CREATE TABLE IF NOT EXISTS system_activity_logs (
    id VARCHAR(255) PRIMARY KEY,
    activity_type VARCHAR(100) NOT NULL,
    activity_name TEXT NOT NULL,
    description TEXT,
    activity_data JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'completed',
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Optimization Suggestions Table (Enhanced)
CREATE TABLE IF NOT EXISTS content_optimization_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suggestion_id VARCHAR(255) UNIQUE NOT NULL,
    content_id VARCHAR(255) NOT NULL,
    content_title TEXT,
    suggestion_type VARCHAR(100) NOT NULL CHECK (suggestion_type IN ('content_optimization', 'timing_optimization', 'audience_targeting', 'platform_selection', 'hashtag_optimization', 'engagement_boost')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    confidence_score DECIMAL(5,2) NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
    
    -- Suggestion Details
    suggestion TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    specific_changes JSONB DEFAULT '[]'::jsonb,
    
    -- Expected Impact
    estimated_impact JSONB DEFAULT '{}'::jsonb, -- engagement_increase, reach_increase, roi_improvement
    
    -- Implementation
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'distributed', 'implemented', 'testing', 'validated', 'rejected')),
    implemented_at TIMESTAMPTZ,
    implementation_notes TEXT,
    
    -- Distribution tracking
    distributed_to JSONB DEFAULT '[]'::jsonb, -- List of stakeholders/channels
    distribution_timestamp TIMESTAMPTZ,
    
    -- Results tracking
    results JSONB DEFAULT NULL, -- Actual performance after implementation
    validation_date TIMESTAMPTZ,
    
    -- Metadata
    ml_model_id VARCHAR(255),
    model_confidence DECIMAL(5,2),
    generated_by VARCHAR(50) DEFAULT 'ai',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stakeholder Notification Preferences Table
CREATE TABLE IF NOT EXISTS stakeholder_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stakeholder_id VARCHAR(255) NOT NULL, -- user_id or group_id
    stakeholder_type VARCHAR(20) NOT NULL CHECK (stakeholder_type IN ('user', 'group', 'role')),
    stakeholder_group VARCHAR(50) NOT NULL CHECK (stakeholder_group IN ('content_team', 'marketing_team', 'management', 'all')),
    
    -- Contact preferences
    email_address TEXT,
    slack_user_id VARCHAR(255),
    slack_channel VARCHAR(255),
    webhook_url TEXT,
    
    -- Notification preferences
    email_enabled BOOLEAN DEFAULT true,
    slack_enabled BOOLEAN DEFAULT true,
    dashboard_enabled BOOLEAN DEFAULT true,
    webhook_enabled BOOLEAN DEFAULT false,
    
    -- Priority filters
    min_priority VARCHAR(20) DEFAULT 'medium' CHECK (min_priority IN ('critical', 'high', 'medium', 'low')),
    notification_types JSONB DEFAULT '["content_optimization", "timing_optimization"]'::jsonb,
    
    -- Frequency settings
    immediate_notifications BOOLEAN DEFAULT true,
    daily_digest BOOLEAN DEFAULT false,
    weekly_summary BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(stakeholder_id, stakeholder_type, stakeholder_group)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_optimization_distributions_content_id ON content_optimization_distributions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_optimization_distributions_status ON content_optimization_distributions(status);
CREATE INDEX IF NOT EXISTS idx_content_optimization_distributions_created_at ON content_optimization_distributions(created_at);

CREATE INDEX IF NOT EXISTS idx_dashboard_notifications_content_id ON content_optimization_dashboard_notifications(content_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_notifications_status ON content_optimization_dashboard_notifications(status);
CREATE INDEX IF NOT EXISTS idx_dashboard_notifications_created_at ON content_optimization_dashboard_notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_in_app_notifications_recipient ON in_app_notifications(recipient_id, recipient_type);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_status ON in_app_notifications(status);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_created_at ON in_app_notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_webhook_integration_logs_content_id ON webhook_integration_logs(content_id);
CREATE INDEX IF NOT EXISTS idx_webhook_integration_logs_event_type ON webhook_integration_logs(event_type);

CREATE INDEX IF NOT EXISTS idx_workflow_audit_logs_workflow_id ON workflow_audit_logs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_audit_logs_content_id ON workflow_audit_logs(content_id);
CREATE INDEX IF NOT EXISTS idx_workflow_audit_logs_execution_timestamp ON workflow_audit_logs(execution_timestamp);

CREATE INDEX IF NOT EXISTS idx_system_activity_logs_activity_type ON system_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_system_activity_logs_created_at ON system_activity_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_content_optimization_suggestions_content_id ON content_optimization_suggestions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_optimization_suggestions_priority ON content_optimization_suggestions(priority);
CREATE INDEX IF NOT EXISTS idx_content_optimization_suggestions_status ON content_optimization_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_content_optimization_suggestions_distributed ON content_optimization_suggestions(distribution_timestamp);

CREATE INDEX IF NOT EXISTS idx_stakeholder_preferences_group ON stakeholder_notification_preferences(stakeholder_group);
CREATE INDEX IF NOT EXISTS idx_stakeholder_preferences_stakeholder ON stakeholder_notification_preferences(stakeholder_id, stakeholder_type);

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_optimization_distributions_updated_at 
    BEFORE UPDATE ON content_optimization_distributions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_in_app_notifications_updated_at 
    BEFORE UPDATE ON in_app_notifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_optimization_suggestions_updated_at 
    BEFORE UPDATE ON content_optimization_suggestions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stakeholder_notification_preferences_updated_at 
    BEFORE UPDATE ON stakeholder_notification_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 