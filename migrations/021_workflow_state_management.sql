-- Task 33.2: Develop State Management System
-- Database migration for workflow state management

-- Create enum types for workflow states and transitions
CREATE TYPE workflow_state AS ENUM (
  'idle',
  'pending', 
  'running',
  'paused',
  'completed',
  'failed',
  'cancelled',
  'retrying',
  'scheduled'
);

CREATE TYPE state_transition AS ENUM (
  'start',
  'pause',
  'resume', 
  'complete',
  'fail',
  'cancel',
  'retry',
  'schedule',
  'reset'
);

-- Main workflow states table
CREATE TABLE workflow_states (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  current_state workflow_state NOT NULL DEFAULT 'idle',
  previous_state workflow_state,
  execution_id TEXT,
  started_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration BIGINT, -- Duration in milliseconds
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- State transition history table
CREATE TABLE workflow_state_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_state_id TEXT NOT NULL REFERENCES workflow_states(id) ON DELETE CASCADE,
  from_state workflow_state NOT NULL,
  to_state workflow_state NOT NULL,
  transition_type state_transition NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_in_previous_state BIGINT, -- Duration in milliseconds
  triggered_by TEXT,
  reason TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Workflow state aggregates for performance
CREATE TABLE workflow_state_aggregates (
  workflow_id TEXT PRIMARY KEY,
  total_executions INTEGER DEFAULT 0,
  successful_executions INTEGER DEFAULT 0,
  failed_executions INTEGER DEFAULT 0,
  cancelled_executions INTEGER DEFAULT 0,
  total_duration BIGINT DEFAULT 0, -- Total duration in milliseconds
  average_duration BIGINT DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.00,
  last_execution_at TIMESTAMPTZ,
  last_execution_state workflow_state,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_workflow_states_workflow_id ON workflow_states(workflow_id);
CREATE INDEX idx_workflow_states_current_state ON workflow_states(current_state);
CREATE INDEX idx_workflow_states_updated_at ON workflow_states(updated_at DESC);
CREATE INDEX idx_workflow_states_execution_id ON workflow_states(execution_id) WHERE execution_id IS NOT NULL;
CREATE INDEX idx_workflow_states_workflow_updated ON workflow_states(workflow_id, updated_at DESC);

CREATE INDEX idx_workflow_transitions_state_id ON workflow_state_transitions(workflow_state_id);
CREATE INDEX idx_workflow_transitions_timestamp ON workflow_state_transitions(timestamp DESC);
CREATE INDEX idx_workflow_transitions_from_to ON workflow_state_transitions(from_state, to_state);
CREATE INDEX idx_workflow_transitions_type ON workflow_state_transitions(transition_type);

CREATE INDEX idx_workflow_aggregates_last_execution ON workflow_state_aggregates(last_execution_at DESC);
CREATE INDEX idx_workflow_aggregates_success_rate ON workflow_state_aggregates(success_rate DESC);

-- Triggers for automatic updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;   
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workflow_states_updated_at BEFORE UPDATE ON workflow_states
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_workflow_aggregates_updated_at BEFORE UPDATE ON workflow_state_aggregates
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to update workflow aggregates
CREATE OR REPLACE FUNCTION update_workflow_aggregates()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert aggregate data
    INSERT INTO workflow_state_aggregates (
        workflow_id,
        total_executions,
        successful_executions,
        failed_executions,
        cancelled_executions,
        total_duration,
        average_duration,
        success_rate,
        last_execution_at,
        last_execution_state
    )
    SELECT 
        ws.workflow_id,
        COUNT(*) as total_executions,
        COUNT(*) FILTER (WHERE ws.current_state = 'completed') as successful_executions,
        COUNT(*) FILTER (WHERE ws.current_state = 'failed') as failed_executions,
        COUNT(*) FILTER (WHERE ws.current_state = 'cancelled') as cancelled_executions,
        COALESCE(SUM(ws.duration), 0) as total_duration,
        COALESCE(AVG(ws.duration), 0) as average_duration,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(*) FILTER (WHERE ws.current_state = 'completed')::DECIMAL / COUNT(*)) * 100, 2)
            ELSE 0 
        END as success_rate,
        MAX(ws.updated_at) as last_execution_at,
        (SELECT current_state FROM workflow_states WHERE workflow_id = ws.workflow_id ORDER BY updated_at DESC LIMIT 1) as last_execution_state
    FROM workflow_states ws
    WHERE ws.workflow_id = COALESCE(NEW.workflow_id, OLD.workflow_id)
    GROUP BY ws.workflow_id
    ON CONFLICT (workflow_id) DO UPDATE SET
        total_executions = EXCLUDED.total_executions,
        successful_executions = EXCLUDED.successful_executions,
        failed_executions = EXCLUDED.failed_executions,
        cancelled_executions = EXCLUDED.cancelled_executions,
        total_duration = EXCLUDED.total_duration,
        average_duration = EXCLUDED.average_duration,
        success_rate = EXCLUDED.success_rate,
        last_execution_at = EXCLUDED.last_execution_at,
        last_execution_state = EXCLUDED.last_execution_state,
        updated_at = NOW();

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update aggregates when workflow states change
CREATE TRIGGER update_workflow_state_aggregates
    AFTER INSERT OR UPDATE OR DELETE ON workflow_states
    FOR EACH ROW EXECUTE FUNCTION update_workflow_aggregates();

-- Row Level Security (RLS) policies
ALTER TABLE workflow_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_state_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_state_aggregates ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Users can view workflow states" ON workflow_states
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert workflow states" ON workflow_states
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update workflow states" ON workflow_states
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view workflow transitions" ON workflow_state_transitions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert workflow transitions" ON workflow_state_transitions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view workflow aggregates" ON workflow_state_aggregates
    FOR SELECT USING (auth.role() = 'authenticated');

-- Service role policies (for backend operations)
CREATE POLICY "Service role full access workflow states" ON workflow_states
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access workflow transitions" ON workflow_state_transitions
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access workflow aggregates" ON workflow_state_aggregates
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Helpful views for common queries
CREATE VIEW workflow_state_summary AS
SELECT 
    ws.workflow_id,
    ws.current_state,
    ws.started_at,
    ws.updated_at,
    ws.duration,
    ws.progress_percentage,
    wsa.total_executions,
    wsa.success_rate,
    wsa.average_duration
FROM workflow_states ws
LEFT JOIN workflow_state_aggregates wsa ON ws.workflow_id = wsa.workflow_id
WHERE ws.id IN (
    SELECT DISTINCT ON (workflow_id) id 
    FROM workflow_states 
    ORDER BY workflow_id, updated_at DESC
);

CREATE VIEW workflow_recent_transitions AS
SELECT 
    wst.*,
    ws.workflow_id
FROM workflow_state_transitions wst
JOIN workflow_states ws ON wst.workflow_state_id = ws.id
ORDER BY wst.timestamp DESC
LIMIT 100;

-- Function to get workflow state history
CREATE OR REPLACE FUNCTION get_workflow_state_history(
    p_workflow_id TEXT,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    state_id TEXT,
    current_state workflow_state,
    previous_state workflow_state,
    started_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    duration BIGINT,
    transition_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ws.id,
        ws.current_state,
        ws.previous_state,
        ws.started_at,
        ws.updated_at,
        ws.duration,
        COUNT(wst.id) as transition_count
    FROM workflow_states ws
    LEFT JOIN workflow_state_transitions wst ON ws.id = wst.workflow_state_id
    WHERE ws.workflow_id = p_workflow_id
    GROUP BY ws.id, ws.current_state, ws.previous_state, ws.started_at, ws.updated_at, ws.duration
    ORDER BY ws.updated_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old states
CREATE OR REPLACE FUNCTION cleanup_old_workflow_states(
    p_days_old INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM workflow_states 
    WHERE updated_at < NOW() - (p_days_old || ' days')::INTERVAL
    AND current_state IN ('completed', 'failed', 'cancelled');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data for development
INSERT INTO workflow_states (id, workflow_id, current_state, metadata) VALUES
('state_demo_001', 'demo-workflow-001', 'idle', '{"created_by": "system", "purpose": "demo"}'),
('state_demo_002', 'demo-workflow-002', 'completed', '{"created_by": "system", "purpose": "demo", "execution_time": 5000}'),
('state_demo_003', 'demo-workflow-003', 'running', '{"created_by": "system", "purpose": "demo", "progress": 75}');

-- Initial transition records
INSERT INTO workflow_state_transitions (workflow_state_id, from_state, to_state, transition_type, reason) VALUES
('state_demo_001', 'idle', 'idle', 'start', 'Initial state creation'),
('state_demo_002', 'idle', 'running', 'start', 'Workflow execution started'),
('state_demo_002', 'running', 'completed', 'complete', 'Workflow completed successfully'),
('state_demo_003', 'idle', 'running', 'start', 'Workflow execution started');

-- Add comments for documentation
COMMENT ON TABLE workflow_states IS 'Tracks the current and historical states of n8n workflows';
COMMENT ON TABLE workflow_state_transitions IS 'Records all state transitions with timing and context';
COMMENT ON TABLE workflow_state_aggregates IS 'Pre-computed aggregates for workflow performance metrics';

COMMENT ON COLUMN workflow_states.duration IS 'Total execution duration in milliseconds';
COMMENT ON COLUMN workflow_states.progress_percentage IS 'Current progress percentage (0-100)';
COMMENT ON COLUMN workflow_states.metadata IS 'Additional context and execution details';

COMMENT ON COLUMN workflow_state_transitions.duration_in_previous_state IS 'Time spent in previous state in milliseconds';
COMMENT ON COLUMN workflow_state_transitions.triggered_by IS 'User or system that triggered the transition';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON workflow_states TO authenticated;
GRANT SELECT, INSERT ON workflow_state_transitions TO authenticated;
GRANT SELECT ON workflow_state_aggregates TO authenticated;

GRANT ALL ON workflow_states TO service_role;
GRANT ALL ON workflow_state_transitions TO service_role;
GRANT ALL ON workflow_state_aggregates TO service_role; 