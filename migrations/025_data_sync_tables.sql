-- Migration: Data Sync Tables
-- Task 33.4: Enable Bidirectional Data Synchronization
-- Creates tables for sync logging, conflict resolution, and n8n workflows tracking

-- Create data_sync_logs table for tracking sync operations
CREATE TABLE IF NOT EXISTS data_sync_logs (
    id SERIAL PRIMARY KEY,
    sync_id VARCHAR(255) UNIQUE NOT NULL,
    direction VARCHAR(50) NOT NULL CHECK (direction IN ('dashboard_to_n8n', 'n8n_to_dashboard')),
    success BOOLEAN NOT NULL DEFAULT false,
    records_processed INTEGER DEFAULT 0,
    records_synced INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    errors JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create data_sync_conflicts table for conflict resolution
CREATE TABLE IF NOT EXISTS data_sync_conflicts (
    id SERIAL PRIMARY KEY,
    entity_id VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    source_data JSONB NOT NULL,
    target_data JSONB NOT NULL,
    conflict_type VARCHAR(50) DEFAULT 'data_mismatch',
    resolution_strategy VARCHAR(50) DEFAULT 'manual' CHECK (resolution_strategy IN ('manual', 'last_write_wins', 'merge', 'source_priority', 'target_priority')),
    resolved BOOLEAN DEFAULT false,
    resolution_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(255)
);

-- Create n8n_workflows table for tracking n8n workflow metadata in dashboard
CREATE TABLE IF NOT EXISTS n8n_workflows (
    id SERIAL PRIMARY KEY,
    workflow_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'running', 'paused', 'error')),
    type VARCHAR(50) DEFAULT 'general' CHECK (type IN ('email', 'social', 'content', 'lead_nurture', 'ad_campaign', 'general')),
    execution_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    last_execution TIMESTAMP WITH TIME ZONE,
    next_execution TIMESTAMP WITH TIME ZONE,
    tags TEXT[] DEFAULT '{}',
    configuration JSONB DEFAULT '{}',
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sync_queue table for managing async sync operations
CREATE TABLE IF NOT EXISTS sync_queue (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    operation VARCHAR(20) NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
    direction VARCHAR(50) NOT NULL CHECK (direction IN ('dashboard_to_n8n', 'n8n_to_dashboard')),
    priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    payload JSONB DEFAULT '{}',
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_data_sync_logs_sync_id ON data_sync_logs(sync_id);
CREATE INDEX IF NOT EXISTS idx_data_sync_logs_direction ON data_sync_logs(direction);
CREATE INDEX IF NOT EXISTS idx_data_sync_logs_started_at ON data_sync_logs(started_at);
CREATE INDEX IF NOT EXISTS idx_data_sync_logs_success ON data_sync_logs(success);

CREATE INDEX IF NOT EXISTS idx_data_sync_conflicts_entity_id ON data_sync_conflicts(entity_id);
CREATE INDEX IF NOT EXISTS idx_data_sync_conflicts_entity_type ON data_sync_conflicts(entity_type);
CREATE INDEX IF NOT EXISTS idx_data_sync_conflicts_resolved ON data_sync_conflicts(resolved);
CREATE INDEX IF NOT EXISTS idx_data_sync_conflicts_created_at ON data_sync_conflicts(created_at);

CREATE INDEX IF NOT EXISTS idx_n8n_workflows_workflow_id ON n8n_workflows(workflow_id);
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_status ON n8n_workflows(status);
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_type ON n8n_workflows(type);
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_synced_at ON n8n_workflows(synced_at);

CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_direction ON sync_queue(direction);
CREATE INDEX IF NOT EXISTS idx_sync_queue_scheduled_at ON sync_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_sync_queue_priority ON sync_queue(priority);
CREATE INDEX IF NOT EXISTS idx_sync_queue_entity ON sync_queue(entity_type, entity_id);

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_n8n_workflows_updated_at BEFORE UPDATE ON n8n_workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_queue_updated_at BEFORE UPDATE ON sync_queue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for security
ALTER TABLE data_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sync_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Service role can access data_sync_logs" ON data_sync_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can read data_sync_logs" ON data_sync_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can access data_sync_conflicts" ON data_sync_conflicts
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can read data_sync_conflicts" ON data_sync_conflicts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can access n8n_workflows" ON n8n_workflows
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can read n8n_workflows" ON n8n_workflows
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can access sync_queue" ON sync_queue
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can read sync_queue" ON sync_queue
    FOR SELECT USING (auth.role() = 'authenticated');

-- Insert sample sync configurations if they don't exist
INSERT INTO data_sync_configs (source_type, target_type, mapping, transformations, sync_direction, enabled) VALUES
    (
        'dashboard', 
        'n8n', 
        '{"user_id": "userId", "email": "email", "name": "name", "created_at": "createdAt"}', 
        '[
            {"field": "email", "operation": "validate", "rule": "email"},
            {"field": "createdAt", "operation": "format", "rule": "date_iso"},
            {"field": "name", "operation": "filter", "rule": "not_null"}
        ]',
        'bidirectional', 
        true
    ),
    (
        'n8n', 
        'dashboard', 
        '{"executionId": "execution_id", "workflowId": "workflow_id", "status": "status", "data": "output_data"}', 
        '[
            {"field": "status", "operation": "transform", "rule": "status_mapping", "parameters": {"statusMap": {"success": "completed", "error": "failed", "running": "processing"}}}
        ]',
        'unidirectional', 
        true
    ),
    (
        'dashboard',
        'n8n',
        '{"customer_id": "customerId", "name": "customerName", "email": "customerEmail", "segment": "customerSegment"}',
        '[
            {"field": "customerEmail", "operation": "validate", "rule": "email"},
            {"field": "customerSegment", "operation": "transform", "rule": "uppercase"}
        ]',
        'bidirectional',
        true
    )
ON CONFLICT DO NOTHING;

-- Insert sample sync queue entries for testing
INSERT INTO sync_queue (entity_type, entity_id, operation, direction, priority, payload) VALUES
    ('user', 'test-user-1', 'create', 'dashboard_to_n8n', 1, '{"email": "test@example.com", "name": "Test User"}'),
    ('workflow', 'wf-001', 'update', 'n8n_to_dashboard', 3, '{"status": "active", "execution_count": 150}'),
    ('customer', 'cust-001', 'create', 'dashboard_to_n8n', 2, '{"name": "Test Customer", "email": "customer@example.com", "segment": "premium"}')
ON CONFLICT DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE data_sync_logs IS 'Audit trail for all data synchronization operations between dashboard and n8n';
COMMENT ON TABLE data_sync_conflicts IS 'Tracking table for data conflicts that occur during bidirectional synchronization';
COMMENT ON TABLE n8n_workflows IS 'Local cache of n8n workflow metadata synchronized from n8n instance';
COMMENT ON TABLE sync_queue IS 'Queue for managing asynchronous data synchronization operations';

COMMENT ON COLUMN data_sync_logs.sync_id IS 'Unique identifier for each sync operation';
COMMENT ON COLUMN data_sync_logs.direction IS 'Direction of sync: dashboard_to_n8n or n8n_to_dashboard';
COMMENT ON COLUMN data_sync_conflicts.resolution_strategy IS 'Strategy used to resolve the conflict';
COMMENT ON COLUMN sync_queue.priority IS 'Priority level (1=highest, 10=lowest) for processing order';
COMMENT ON COLUMN sync_queue.retry_count IS 'Number of times this sync operation has been retried'; 