-- Webhook Orchestration Tables Migration
-- Task 33.1: Setup Webhook Orchestration - Database Tables
-- Execute this SQL in Supabase SQL Editor

-- 1. Create webhook_endpoints table
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

-- 2. Create webhook_events table
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

-- 3. Create workflow_triggers table
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

-- 4. Create workflow_executions table
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

-- 5. Create data_sync_configs table
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

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_webhook_events_workflow_id ON webhook_events(workflow_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_timestamp ON webhook_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_workflow_triggers_workflow_id ON workflow_triggers(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_triggers_enabled ON workflow_triggers(enabled);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_execution_id ON workflow_executions(execution_id);

-- 7. Insert default webhook endpoints
INSERT INTO webhook_endpoints (id, name, url, method, is_active, security, triggers, error_handling) VALUES
(
  'n8n-incoming-webhook',
  'n8n Incoming Webhook',
  'http://localhost:3000/api/webhooks/n8n',
  'POST',
  true,
  '{"authentication": "webhook_signature", "secretKey": "test-secret-key"}',
  ARRAY['execution_completed', 'execution_failed', 'workflow_updated'],
  '{"retryAttempts": 3, "retryDelay": 5000, "fallbackAction": "log"}'
),
(
  'n8n-outgoing-webhook',
  'n8n Outgoing Webhook', 
  'http://localhost:5678/webhook/dashboard',
  'POST',
  true,
  '{"authentication": "bearer", "token": "test-api-key"}',
  ARRAY['user_action', 'data_update'],
  '{"retryAttempts": 3, "retryDelay": 2000, "fallbackAction": "alert"}'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  url = EXCLUDED.url,
  updated_at = NOW();

-- 8. Insert default workflow triggers
INSERT INTO workflow_triggers (id, workflow_id, trigger_type, conditions, enabled) VALUES
(
  'demo-email-trigger',
  'wf-001',
  'webhook',
  '{"event": "user_signup"}',
  true
),
(
  'demo-social-trigger',
  'wf-002',
  'schedule',
  '{"cron": "0 9 * * *"}',
  true
),
(
  'demo-data-update-trigger',
  'wf-003',
  'event',
  '{"table": "customers", "action": "insert"}',
  true
)
ON CONFLICT (id) DO UPDATE SET
  workflow_id = EXCLUDED.workflow_id,
  conditions = EXCLUDED.conditions,
  updated_at = NOW();

-- 9. Insert default data sync configurations
INSERT INTO data_sync_configs (source_type, target_type, mapping, transformations, sync_direction, enabled) VALUES
(
  'dashboard',
  'n8n',
  '{"customers": "customer_data", "orders": "order_events", "analytics": "metric_updates"}',
  '[{"field": "created_at", "transform": "timestamp"}, {"field": "status", "transform": "uppercase"}]',
  'bidirectional',
  true
),
(
  'n8n',
  'dashboard',
  '{"workflow_results": "processed_data", "automation_logs": "activity_feed"}',
  '[{"field": "execution_time", "transform": "duration_ms"}, {"field": "result", "transform": "json_parse"}]',
  'unidirectional',
  true
)
ON CONFLICT DO NOTHING;

-- 10. Create RLS (Row Level Security) policies if needed
-- ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE workflow_triggers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE data_sync_configs ENABLE ROW LEVEL SECURITY;

-- Verify tables are created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('webhook_endpoints', 'webhook_events', 'workflow_triggers', 'workflow_executions', 'data_sync_configs')
ORDER BY table_name; 