-- Migration: 020_webhook_orchestration.sql
-- Task 33.1: Setup Webhook Orchestration
-- Creates tables for webhook endpoints, events, and workflow triggers

-- Create webhook_endpoints table
CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    method VARCHAR(10) DEFAULT 'POST',
    is_active BOOLEAN DEFAULT true,
    security JSONB DEFAULT '{"authentication": "none"}',
    triggers TEXT[] DEFAULT '{}',
    response_mapping JSONB DEFAULT '{}',
    error_handling JSONB DEFAULT '{"retryAttempts": 3, "retryDelay": 1000, "fallbackAction": "log"}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook_events table for audit trail
CREATE TABLE IF NOT EXISTS webhook_events (
    id VARCHAR(255) PRIMARY KEY,
    workflow_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    source VARCHAR(20) NOT NULL CHECK (source IN ('n8n', 'dashboard')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
    retry_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow_triggers table
CREATE TABLE IF NOT EXISTS workflow_triggers (
    id VARCHAR(255) PRIMARY KEY,
    workflow_id VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(20) NOT NULL CHECK (trigger_type IN ('webhook', 'schedule', 'manual', 'event')),
    conditions JSONB DEFAULT '{}',
    enabled BOOLEAN DEFAULT true,
    last_triggered TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow_executions table for tracking
CREATE TABLE IF NOT EXISTS workflow_executions (
    id SERIAL PRIMARY KEY,
    workflow_id VARCHAR(255) NOT NULL,
    execution_id VARCHAR(255) UNIQUE,
    status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    error_message TEXT,
    error_details JSONB DEFAULT '{}',
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create data_sync_configs table for bidirectional sync
CREATE TABLE IF NOT EXISTS data_sync_configs (
    id SERIAL PRIMARY KEY,
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('dashboard', 'n8n')),
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('dashboard', 'n8n')),
    mapping JSONB NOT NULL DEFAULT '{}',
    transformations JSONB DEFAULT '[]',
    sync_direction VARCHAR(20) DEFAULT 'unidirectional' CHECK (sync_direction IN ('bidirectional', 'unidirectional')),
    enabled BOOLEAN DEFAULT true,
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_events_workflow_id ON webhook_events(workflow_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_timestamp ON webhook_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_source ON webhook_events(source);

CREATE INDEX IF NOT EXISTS idx_workflow_triggers_workflow_id ON workflow_triggers(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_triggers_enabled ON workflow_triggers(enabled);
CREATE INDEX IF NOT EXISTS idx_workflow_triggers_type ON workflow_triggers(trigger_type);

CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_execution_id ON workflow_executions(execution_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at ON workflow_executions(started_at);

CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_active ON webhook_endpoints(is_active);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_name ON webhook_endpoints(name);

CREATE INDEX IF NOT EXISTS idx_data_sync_configs_enabled ON data_sync_configs(enabled);
CREATE INDEX IF NOT EXISTS idx_data_sync_configs_source_target ON data_sync_configs(source_type, target_type);

-- Create functions for updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_webhook_endpoints_updated_at 
    BEFORE UPDATE ON webhook_endpoints 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhook_events_updated_at 
    BEFORE UPDATE ON webhook_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_triggers_updated_at 
    BEFORE UPDATE ON workflow_triggers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_executions_updated_at 
    BEFORE UPDATE ON workflow_executions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_sync_configs_updated_at 
    BEFORE UPDATE ON data_sync_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default webhook endpoints for development
INSERT INTO webhook_endpoints (id, name, url, method, is_active, security) VALUES
    ('default-n8n-webhook', 'Default n8n Webhook', '/api/webhooks/n8n', 'POST', true, '{"authentication": "none"}'),
    ('dashboard-webhook', 'Dashboard Webhook', '/api/webhooks/dashboard', 'POST', true, '{"authentication": "bearer"}')
ON CONFLICT (id) DO NOTHING;

-- Insert default workflow triggers
INSERT INTO workflow_triggers (id, workflow_id, trigger_type, conditions, enabled) VALUES
    ('demo-email-trigger', 'wf-001', 'webhook', '{"event": "user_signup"}', true),
    ('demo-social-trigger', 'wf-002', 'schedule', '{"cron": "0 9 * * *"}', true)
ON CONFLICT (id) DO NOTHING;

-- Insert default data sync configuration
INSERT INTO data_sync_configs (source_type, target_type, mapping, sync_direction) VALUES
    ('dashboard', 'n8n', '{"user_id": "userId", "email": "email", "name": "name"}', 'bidirectional'),
    ('n8n', 'dashboard', '{"executionId": "execution_id", "status": "status", "output": "result"}', 'unidirectional')
ON CONFLICT DO NOTHING;

-- Create RLS policies for security
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sync_configs ENABLE ROW LEVEL SECURITY;

-- Allow service role to access all rows
CREATE POLICY "Service role can access webhook_endpoints" ON webhook_endpoints
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access webhook_events" ON webhook_events
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access workflow_triggers" ON workflow_triggers
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access workflow_executions" ON workflow_executions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access data_sync_configs" ON data_sync_configs
    FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to read webhook status
CREATE POLICY "Authenticated users can read webhook status" ON webhook_events
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read workflow executions" ON workflow_executions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Add comments for documentation
COMMENT ON TABLE webhook_endpoints IS 'Configuration for webhook endpoints used in n8n orchestration';
COMMENT ON TABLE webhook_events IS 'Audit trail for all webhook events between dashboard and n8n';
COMMENT ON TABLE workflow_triggers IS 'Configuration for workflow triggers and automation rules';
COMMENT ON TABLE workflow_executions IS 'Tracking table for n8n workflow execution status and results';
COMMENT ON TABLE data_sync_configs IS 'Configuration for bidirectional data synchronization between dashboard and n8n';

COMMENT ON COLUMN webhook_events.event_type IS 'Type of webhook event: execution_started, execution_completed, execution_failed, workflow_updated';
COMMENT ON COLUMN webhook_events.source IS 'Source of the webhook: n8n or dashboard';
COMMENT ON COLUMN webhook_events.status IS 'Processing status: pending, processed, failed';
COMMENT ON COLUMN workflow_triggers.trigger_type IS 'Type of trigger: webhook, schedule, manual, event';
COMMENT ON COLUMN data_sync_configs.sync_direction IS 'Direction of data sync: bidirectional or unidirectional'; 