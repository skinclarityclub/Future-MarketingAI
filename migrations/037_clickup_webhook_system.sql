-- Migration: ClickUp Webhook System
-- Description: Creates tables for ClickUp webhook registrations and event logging
-- Date: 2025-06-20

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ClickUp Webhook Registrations Table
CREATE TABLE IF NOT EXISTS clickup_webhook_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id TEXT NOT NULL UNIQUE,
    team_id TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    events JSONB NOT NULL DEFAULT '[]',
    secret_hash TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'failed')),
    fail_count INTEGER DEFAULT 0,
    last_ping_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ClickUp Webhook Events Table
CREATE TABLE IF NOT EXISTS clickup_webhook_events (
    id TEXT PRIMARY KEY,
    webhook_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    sync_triggered BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_registrations_webhook_id ON clickup_webhook_registrations(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_registrations_team_id ON clickup_webhook_registrations(team_id);
CREATE INDEX IF NOT EXISTS idx_webhook_registrations_status ON clickup_webhook_registrations(status);
CREATE INDEX IF NOT EXISTS idx_webhook_registrations_created_at ON clickup_webhook_registrations(created_at);

CREATE INDEX IF NOT EXISTS idx_webhook_events_webhook_id ON clickup_webhook_events(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON clickup_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processing_status ON clickup_webhook_events(processing_status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON clickup_webhook_events(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_sync_triggered ON clickup_webhook_events(sync_triggered);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for webhook registrations updated_at
CREATE TRIGGER update_webhook_registrations_updated_at 
    BEFORE UPDATE ON clickup_webhook_registrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) Policies
ALTER TABLE clickup_webhook_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clickup_webhook_events ENABLE ROW LEVEL SECURITY;

-- Policy for webhook registrations (allow all operations for authenticated users)
CREATE POLICY "Allow all operations on webhook_registrations for authenticated users" 
ON clickup_webhook_registrations FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Policy for webhook events (allow all operations for authenticated users)
CREATE POLICY "Allow all operations on webhook_events for authenticated users" 
ON clickup_webhook_events FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Service role policies (full access)
CREATE POLICY "Service role full access to webhook_registrations" 
ON clickup_webhook_registrations FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access to webhook_events" 
ON clickup_webhook_events FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);

-- Add webhook-related columns to existing tables if needed
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS clickup_webhook_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS last_webhook_sync_at TIMESTAMPTZ;

-- Update existing sync mappings table to track webhook sync
ALTER TABLE clickup_sync_mappings ADD COLUMN IF NOT EXISTS webhook_sync_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE clickup_sync_mappings ADD COLUMN IF NOT EXISTS last_webhook_event_at TIMESTAMPTZ;

-- Create view for webhook health monitoring
CREATE OR REPLACE VIEW clickup_webhook_health AS
SELECT 
    wr.webhook_id,
    wr.team_id,
    wr.endpoint,
    wr.status,
    wr.fail_count,
    wr.last_ping_at,
    wr.created_at as registration_created_at,
    COUNT(we.id) as total_events,
    COUNT(CASE WHEN we.processing_status = 'completed' THEN 1 END) as successful_events,
    COUNT(CASE WHEN we.processing_status = 'failed' THEN 1 END) as failed_events,
    COUNT(CASE WHEN we.sync_triggered = true THEN 1 END) as sync_triggered_events,
    MAX(we.created_at) as last_event_at,
    ROUND(
        CASE 
            WHEN COUNT(we.id) > 0 THEN 
                (COUNT(CASE WHEN we.processing_status = 'completed' THEN 1 END) * 100.0 / COUNT(we.id))
            ELSE 0 
        END, 2
    ) as success_rate_percent
FROM clickup_webhook_registrations wr
LEFT JOIN clickup_webhook_events we ON wr.webhook_id = we.webhook_id
GROUP BY 
    wr.webhook_id, 
    wr.team_id, 
    wr.endpoint, 
    wr.status, 
    wr.fail_count, 
    wr.last_ping_at, 
    wr.created_at;

-- Create function for cleaning up old webhook events
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM clickup_webhook_events 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep
    AND processing_status IN ('completed', 'failed');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function for webhook statistics
CREATE OR REPLACE FUNCTION get_webhook_statistics(webhook_id_param TEXT DEFAULT NULL, days INTEGER DEFAULT 7)
RETURNS TABLE (
    webhook_id TEXT,
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    total_events BIGINT,
    successful_events BIGINT,
    failed_events BIGINT,
    pending_events BIGINT,
    sync_triggered_events BIGINT,
    avg_processing_time_seconds NUMERIC,
    success_rate_percent NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        we.webhook_id,
        (NOW() - INTERVAL '1 day' * days) as period_start,
        NOW() as period_end,
        COUNT(*) as total_events,
        COUNT(CASE WHEN we.processing_status = 'completed' THEN 1 END) as successful_events,
        COUNT(CASE WHEN we.processing_status = 'failed' THEN 1 END) as failed_events,
        COUNT(CASE WHEN we.processing_status = 'pending' THEN 1 END) as pending_events,
        COUNT(CASE WHEN we.sync_triggered = true THEN 1 END) as sync_triggered_events,
        AVG(
            CASE 
                WHEN we.processed_at IS NOT NULL THEN 
                    EXTRACT(EPOCH FROM (we.processed_at - we.created_at))
                ELSE NULL 
            END
        ) as avg_processing_time_seconds,
        ROUND(
            CASE 
                WHEN COUNT(*) > 0 THEN 
                    (COUNT(CASE WHEN we.processing_status = 'completed' THEN 1 END) * 100.0 / COUNT(*))
                ELSE 0 
            END, 2
        ) as success_rate_percent
    FROM clickup_webhook_events we
    WHERE we.created_at >= (NOW() - INTERVAL '1 day' * days)
    AND (webhook_id_param IS NULL OR we.webhook_id = webhook_id_param)
    GROUP BY we.webhook_id;
END;
$$ LANGUAGE plpgsql;

-- Comment on tables and columns for documentation
COMMENT ON TABLE clickup_webhook_registrations IS 'Stores ClickUp webhook registrations and their configuration';
COMMENT ON TABLE clickup_webhook_events IS 'Logs all incoming ClickUp webhook events and their processing status';

COMMENT ON COLUMN clickup_webhook_registrations.webhook_id IS 'Unique webhook ID from ClickUp';
COMMENT ON COLUMN clickup_webhook_registrations.team_id IS 'ClickUp team/workspace ID';
COMMENT ON COLUMN clickup_webhook_registrations.endpoint IS 'Webhook endpoint URL';
COMMENT ON COLUMN clickup_webhook_registrations.events IS 'Array of subscribed event types';
COMMENT ON COLUMN clickup_webhook_registrations.secret_hash IS 'Hashed webhook secret for security';
COMMENT ON COLUMN clickup_webhook_registrations.fail_count IS 'Number of consecutive failures';

COMMENT ON COLUMN clickup_webhook_events.event_type IS 'Type of ClickUp event (taskCreated, taskUpdated, etc.)';
COMMENT ON COLUMN clickup_webhook_events.event_data IS 'Full webhook event payload from ClickUp';
COMMENT ON COLUMN clickup_webhook_events.processing_status IS 'Current processing status of the event';
COMMENT ON COLUMN clickup_webhook_events.sync_triggered IS 'Whether this event triggered a sync operation';

-- Grant necessary permissions
GRANT ALL ON clickup_webhook_registrations TO authenticated;
GRANT ALL ON clickup_webhook_events TO authenticated;
GRANT ALL ON clickup_webhook_registrations TO service_role;
GRANT ALL ON clickup_webhook_events TO service_role;

-- Grant permissions on functions and views
GRANT EXECUTE ON FUNCTION cleanup_old_webhook_events(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_webhook_statistics(TEXT, INTEGER) TO authenticated;
GRANT SELECT ON clickup_webhook_health TO authenticated;

GRANT EXECUTE ON FUNCTION cleanup_old_webhook_events(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_webhook_statistics(TEXT, INTEGER) TO service_role;
GRANT SELECT ON clickup_webhook_health TO service_role; 