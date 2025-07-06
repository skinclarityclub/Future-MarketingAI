-- Marketing Sync Logs Migration
-- This migration adds support for logging marketing data synchronization events

-- Create marketing sync logs table
CREATE TABLE IF NOT EXISTS marketing_sync_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'sync_started', 'sync_completed', 'sync_failed'
    event_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_marketing_sync_logs_user_id ON marketing_sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_sync_logs_event_type ON marketing_sync_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_marketing_sync_logs_created_at ON marketing_sync_logs(created_at);

-- Add RLS policies
ALTER TABLE marketing_sync_logs ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to access their own sync logs
CREATE POLICY "Users can access their own sync logs" ON marketing_sync_logs
    FOR ALL USING (user_id = current_user OR user_id = 'demo-user');

-- Create a function to clean up old sync logs automatically
CREATE OR REPLACE FUNCTION cleanup_old_sync_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM marketing_sync_logs 
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Comment for documentation
COMMENT ON TABLE marketing_sync_logs IS 'Stores marketing data synchronization events and logs'; 