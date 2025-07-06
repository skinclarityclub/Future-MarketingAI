-- Create workflow_executions table for N8N execution tracking
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  workflow_name TEXT NOT NULL,
  execution_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'running', 'waiting')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_ms INTEGER,
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  chat_id TEXT,
  content_strategy TEXT,
  priority TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_name ON workflow_executions(workflow_name);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_created_at ON workflow_executions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_execution_id ON workflow_executions(execution_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_workflow_executions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS workflow_executions_updated_at ON workflow_executions;
CREATE TRIGGER workflow_executions_updated_at
  BEFORE UPDATE ON workflow_executions
  FOR EACH ROW
  EXECUTE FUNCTION update_workflow_executions_updated_at();

-- Add RLS policies
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage workflow executions" ON workflow_executions;
DROP POLICY IF EXISTS "Users can read workflow executions" ON workflow_executions;

-- Allow service role to do everything
CREATE POLICY "Service role can manage workflow executions" ON workflow_executions
  FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to read their own executions
CREATE POLICY "Users can read workflow executions" ON workflow_executions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Drop existing view if it exists
DROP VIEW IF EXISTS workflow_analytics;

-- Create a view for workflow analytics (after table is created)
CREATE VIEW workflow_analytics AS
SELECT 
  we.workflow_name,
  COUNT(*) as total_executions,
  COUNT(*) FILTER (WHERE we.status = 'success') as successful_executions,
  COUNT(*) FILTER (WHERE we.status = 'error') as failed_executions,
  ROUND(
    (COUNT(*) FILTER (WHERE we.status = 'success')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as success_rate,
  ROUND(AVG(we.duration_ms)) as avg_duration_ms,
  MAX(we.created_at) as last_execution_at,
  MIN(we.created_at) as first_execution_at
FROM workflow_executions we
WHERE we.created_at >= NOW() - INTERVAL '30 days'
GROUP BY we.workflow_name
ORDER BY total_executions DESC;

-- Grant access to the view
GRANT SELECT ON workflow_analytics TO authenticated;
GRANT SELECT ON workflow_analytics TO service_role;

-- Add comment for documentation
COMMENT ON TABLE workflow_executions IS 'Stores N8N workflow execution data collected via webhooks';
COMMENT ON VIEW workflow_analytics IS 'Pre-calculated analytics for workflow performance over the last 30 days'; 