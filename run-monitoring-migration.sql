-- ===================================================================
-- SKC BI Dashboard - Workflow Monitoring System Migration
-- Task 33.3: Complete Database Setup Script
-- ===================================================================

-- Drop existing objects if they exist (for clean re-runs)
DROP TABLE IF EXISTS monitoring_statistics CASCADE;
DROP TABLE IF EXISTS monitoring_alerts CASCADE;
DROP TABLE IF EXISTS workflow_performance_metrics CASCADE;
DROP TABLE IF EXISTS workflow_errors CASCADE;
DROP TABLE IF EXISTS workflow_execution_logs CASCADE;

-- Drop existing functions that might conflict
DROP FUNCTION IF EXISTS cleanup_old_workflow_states(integer) CASCADE;
DROP FUNCTION IF EXISTS cleanup_monitoring_data(integer) CASCADE;
DROP FUNCTION IF EXISTS get_monitoring_dashboard_summary(varchar, integer) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop existing enum types if they exist
DROP TYPE IF EXISTS alert_severity CASCADE;
DROP TYPE IF EXISTS alert_type CASCADE;
DROP TYPE IF EXISTS error_severity CASCADE;
DROP TYPE IF EXISTS error_type CASCADE;
DROP TYPE IF EXISTS log_level CASCADE;

-- Create enum types for monitoring
CREATE TYPE log_level AS ENUM ('debug', 'info', 'warn', 'error', 'fatal');
CREATE TYPE error_type AS ENUM ('validation', 'network', 'timeout', 'permission', 'data', 'system', 'unknown');
CREATE TYPE error_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE alert_type AS ENUM ('performance', 'error', 'timeout', 'resource', 'dependency');
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical');

-- ===================================================================
-- 1. WORKFLOW EXECUTION LOGS TABLE
-- ===================================================================
CREATE TABLE workflow_execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id VARCHAR(255) NOT NULL,
    execution_id VARCHAR(255) NOT NULL,
    log_level log_level NOT NULL DEFAULT 'info',
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    node_id VARCHAR(255),
    node_name VARCHAR(255),
    step_number INTEGER,
    duration INTEGER, -- in milliseconds
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for workflow_execution_logs
CREATE INDEX idx_workflow_execution_logs_workflow_id ON workflow_execution_logs (workflow_id);
CREATE INDEX idx_workflow_execution_logs_execution_id ON workflow_execution_logs (execution_id);
CREATE INDEX idx_workflow_execution_logs_timestamp ON workflow_execution_logs (timestamp DESC);
CREATE INDEX idx_workflow_execution_logs_level ON workflow_execution_logs (log_level);
CREATE INDEX idx_workflow_execution_logs_composite ON workflow_execution_logs (workflow_id, execution_id, timestamp DESC);

-- ===================================================================
-- 2. WORKFLOW ERRORS TABLE
-- ===================================================================
CREATE TABLE workflow_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id VARCHAR(255) NOT NULL,
    execution_id VARCHAR(255) NOT NULL,
    error_type error_type NOT NULL DEFAULT 'unknown',
    error_code VARCHAR(100),
    error_message TEXT NOT NULL,
    error_stack TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    node_id VARCHAR(255),
    node_name VARCHAR(255),
    severity error_severity NOT NULL DEFAULT 'medium',
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for workflow_errors
CREATE INDEX idx_workflow_errors_workflow_id ON workflow_errors (workflow_id);
CREATE INDEX idx_workflow_errors_execution_id ON workflow_errors (execution_id);
CREATE INDEX idx_workflow_errors_timestamp ON workflow_errors (timestamp DESC);
CREATE INDEX idx_workflow_errors_severity ON workflow_errors (severity);
CREATE INDEX idx_workflow_errors_resolved ON workflow_errors (resolved);
CREATE INDEX idx_workflow_errors_composite ON workflow_errors (workflow_id, resolved, severity, timestamp DESC);

-- ===================================================================
-- 3. WORKFLOW PERFORMANCE METRICS TABLE
-- ===================================================================
CREATE TABLE workflow_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id VARCHAR(255) NOT NULL,
    execution_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_duration INTEGER NOT NULL, -- in milliseconds
    node_count INTEGER NOT NULL DEFAULT 0,
    successful_nodes INTEGER NOT NULL DEFAULT 0,
    failed_nodes INTEGER NOT NULL DEFAULT 0,
    memory_peak BIGINT NOT NULL DEFAULT 0, -- in bytes
    memory_average BIGINT NOT NULL DEFAULT 0, -- in bytes
    cpu_peak DECIMAL(5,2) NOT NULL DEFAULT 0.0, -- percentage
    cpu_average DECIMAL(5,2) NOT NULL DEFAULT 0.0, -- percentage
    network_requests INTEGER NOT NULL DEFAULT 0,
    network_data_transferred BIGINT NOT NULL DEFAULT 0, -- in bytes
    throughput DECIMAL(10,2) NOT NULL DEFAULT 0.0, -- items per second
    bottleneck_nodes TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for workflow_performance_metrics
CREATE INDEX idx_workflow_performance_workflow_id ON workflow_performance_metrics (workflow_id);
CREATE INDEX idx_workflow_performance_execution_id ON workflow_performance_metrics (execution_id);
CREATE INDEX idx_workflow_performance_timestamp ON workflow_performance_metrics (timestamp DESC);
CREATE INDEX idx_workflow_performance_duration ON workflow_performance_metrics (total_duration);
CREATE INDEX idx_workflow_performance_composite ON workflow_performance_metrics (workflow_id, timestamp DESC);

-- ===================================================================
-- 4. MONITORING ALERTS TABLE
-- ===================================================================
CREATE TABLE monitoring_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id VARCHAR(255) NOT NULL,
    alert_type alert_type NOT NULL,
    severity alert_severity NOT NULL DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMPTZ,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for monitoring_alerts
CREATE INDEX idx_monitoring_alerts_workflow_id ON monitoring_alerts (workflow_id);
CREATE INDEX idx_monitoring_alerts_severity ON monitoring_alerts (severity);
CREATE INDEX idx_monitoring_alerts_timestamp ON monitoring_alerts (timestamp DESC);
CREATE INDEX idx_monitoring_alerts_acknowledged ON monitoring_alerts (acknowledged);
CREATE INDEX idx_monitoring_alerts_resolved ON monitoring_alerts (resolved);
CREATE INDEX idx_monitoring_alerts_composite ON monitoring_alerts (workflow_id, severity, acknowledged, resolved, timestamp DESC);

-- ===================================================================
-- 5. MONITORING STATISTICS TABLE
-- ===================================================================
CREATE TABLE monitoring_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id VARCHAR(255) NOT NULL,
    date_bucket DATE NOT NULL,
    hour_bucket INTEGER NOT NULL CHECK (hour_bucket >= 0 AND hour_bucket <= 23),
    total_executions INTEGER NOT NULL DEFAULT 0,
    successful_executions INTEGER NOT NULL DEFAULT 0,
    failed_executions INTEGER NOT NULL DEFAULT 0,
    total_duration BIGINT NOT NULL DEFAULT 0, -- in milliseconds
    average_duration DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    min_duration INTEGER NOT NULL DEFAULT 0,
    max_duration INTEGER NOT NULL DEFAULT 0,
    total_errors INTEGER NOT NULL DEFAULT 0,
    critical_errors INTEGER NOT NULL DEFAULT 0,
    high_errors INTEGER NOT NULL DEFAULT 0,
    medium_errors INTEGER NOT NULL DEFAULT 0,
    low_errors INTEGER NOT NULL DEFAULT 0,
    total_alerts INTEGER NOT NULL DEFAULT 0,
    critical_alerts INTEGER NOT NULL DEFAULT 0,
    warning_alerts INTEGER NOT NULL DEFAULT 0,
    info_alerts INTEGER NOT NULL DEFAULT 0,
    average_memory_usage BIGINT NOT NULL DEFAULT 0,
    peak_memory_usage BIGINT NOT NULL DEFAULT 0,
    average_cpu_usage DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    peak_cpu_usage DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    total_network_requests INTEGER NOT NULL DEFAULT 0,
    total_network_data BIGINT NOT NULL DEFAULT 0,
    average_throughput DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicates
    UNIQUE(workflow_id, date_bucket, hour_bucket)
);

-- Create indexes for monitoring_statistics
CREATE INDEX idx_monitoring_statistics_workflow_id ON monitoring_statistics (workflow_id);
CREATE INDEX idx_monitoring_statistics_date ON monitoring_statistics (date_bucket DESC);
CREATE INDEX idx_monitoring_statistics_hour ON monitoring_statistics (hour_bucket);
CREATE INDEX idx_monitoring_statistics_composite ON monitoring_statistics (workflow_id, date_bucket DESC, hour_bucket);

-- ===================================================================
-- 6. FUNCTIONS AND TRIGGERS
-- ===================================================================

-- Create triggers for automatic timestamping
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workflow_errors_updated_at 
    BEFORE UPDATE ON workflow_errors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monitoring_alerts_updated_at 
    BEFORE UPDATE ON monitoring_alerts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monitoring_statistics_updated_at 
    BEFORE UPDATE ON monitoring_statistics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up old monitoring data
CREATE OR REPLACE FUNCTION cleanup_old_workflow_states(older_than_days INTEGER DEFAULT 90)
RETURNS TABLE(
    deleted_logs BIGINT,
    deleted_errors BIGINT,
    deleted_metrics BIGINT,
    deleted_alerts BIGINT,
    deleted_stats BIGINT
) AS $$
DECLARE
    cutoff_date TIMESTAMPTZ;
    logs_deleted BIGINT := 0;
    errors_deleted BIGINT := 0;
    metrics_deleted BIGINT := 0;
    alerts_deleted BIGINT := 0;
    stats_deleted BIGINT := 0;
BEGIN
    cutoff_date := NOW() - INTERVAL '1 day' * older_than_days;
    
    -- Clean up execution logs
    DELETE FROM workflow_execution_logs 
    WHERE created_at < cutoff_date;
    GET DIAGNOSTICS logs_deleted = ROW_COUNT;
    
    -- Clean up resolved errors
    DELETE FROM workflow_errors 
    WHERE resolved = TRUE AND resolved_at < cutoff_date;
    GET DIAGNOSTICS errors_deleted = ROW_COUNT;
    
    -- Clean up performance metrics
    DELETE FROM workflow_performance_metrics 
    WHERE created_at < cutoff_date;
    GET DIAGNOSTICS metrics_deleted = ROW_COUNT;
    
    -- Clean up resolved alerts
    DELETE FROM monitoring_alerts 
    WHERE resolved = TRUE AND resolved_at < cutoff_date;
    GET DIAGNOSTICS alerts_deleted = ROW_COUNT;
    
    -- Clean up old statistics (keep longer than logs)
    DELETE FROM monitoring_statistics 
    WHERE date_bucket < (CURRENT_DATE - INTERVAL '1 day' * (older_than_days * 2));
    GET DIAGNOSTICS stats_deleted = ROW_COUNT;
    
    RETURN QUERY SELECT logs_deleted, errors_deleted, metrics_deleted, alerts_deleted, stats_deleted;
END;
$$ LANGUAGE plpgsql;

-- Function to get monitoring dashboard summary
CREATE OR REPLACE FUNCTION get_monitoring_dashboard_summary(
    p_workflow_id VARCHAR(255) DEFAULT NULL,
    p_hours_back INTEGER DEFAULT 24
)
RETURNS TABLE(
    workflow_id VARCHAR(255),
    total_executions BIGINT,
    successful_executions BIGINT,
    failed_executions BIGINT,
    success_rate DECIMAL(5,2),
    average_duration DECIMAL(10,2),
    total_errors BIGINT,
    unresolved_errors BIGINT,
    critical_alerts BIGINT,
    last_execution TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    WITH execution_stats AS (
        SELECT 
            el.workflow_id,
            COUNT(*) as total_execs,
            COUNT(*) FILTER (WHERE el.log_level != 'error') as success_execs,
            COUNT(*) FILTER (WHERE el.log_level = 'error') as failed_execs,
            AVG(el.duration) as avg_duration,
            MAX(el.timestamp) as last_exec
        FROM workflow_execution_logs el
        WHERE el.timestamp >= NOW() - INTERVAL '1 hour' * p_hours_back
        AND (p_workflow_id IS NULL OR el.workflow_id = p_workflow_id)
        GROUP BY el.workflow_id
    ),
    error_stats AS (
        SELECT 
            we.workflow_id,
            COUNT(*) as total_errors,
            COUNT(*) FILTER (WHERE we.resolved = FALSE) as unresolved_errors
        FROM workflow_errors we
        WHERE we.timestamp >= NOW() - INTERVAL '1 hour' * p_hours_back
        AND (p_workflow_id IS NULL OR we.workflow_id = p_workflow_id)
        GROUP BY we.workflow_id
    ),
    alert_stats AS (
        SELECT 
            ma.workflow_id,
            COUNT(*) FILTER (WHERE ma.severity = 'critical' AND ma.resolved = FALSE) as critical_alerts
        FROM monitoring_alerts ma
        WHERE ma.timestamp >= NOW() - INTERVAL '1 hour' * p_hours_back
        AND (p_workflow_id IS NULL OR ma.workflow_id = p_workflow_id)
        GROUP BY ma.workflow_id
    )
    SELECT 
        COALESCE(es.workflow_id, ers.workflow_id, als.workflow_id) as workflow_id,
        COALESCE(es.total_execs, 0) as total_executions,
        COALESCE(es.success_execs, 0) as successful_executions,
        COALESCE(es.failed_execs, 0) as failed_executions,
        CASE 
            WHEN COALESCE(es.total_execs, 0) = 0 THEN 0.0
            ELSE ROUND((COALESCE(es.success_execs, 0)::DECIMAL / es.total_execs) * 100, 2)
        END as success_rate,
        COALESCE(es.avg_duration, 0.0) as average_duration,
        COALESCE(ers.total_errors, 0) as total_errors,
        COALESCE(ers.unresolved_errors, 0) as unresolved_errors,
        COALESCE(als.critical_alerts, 0) as critical_alerts,
        es.last_exec as last_execution
    FROM execution_stats es
    FULL OUTER JOIN error_stats ers ON es.workflow_id = ers.workflow_id
    FULL OUTER JOIN alert_stats als ON COALESCE(es.workflow_id, ers.workflow_id) = als.workflow_id
    ORDER BY COALESCE(es.workflow_id, ers.workflow_id, als.workflow_id);
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ===================================================================

-- Enable RLS on all tables
ALTER TABLE workflow_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_statistics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow service role access)
CREATE POLICY "Service role can manage all monitoring data" ON workflow_execution_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all workflow errors" ON workflow_errors
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all performance metrics" ON workflow_performance_metrics
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all monitoring alerts" ON monitoring_alerts
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all monitoring statistics" ON monitoring_statistics
    FOR ALL USING (auth.role() = 'service_role');

-- ===================================================================
-- 8. PERFORMANCE INDEXES (GIN for JSON)
-- ===================================================================

CREATE INDEX idx_workflow_execution_logs_metadata_gin ON workflow_execution_logs USING GIN (metadata);
CREATE INDEX idx_workflow_errors_metadata_gin ON workflow_errors USING GIN (metadata);
CREATE INDEX idx_workflow_performance_metrics_metadata_gin ON workflow_performance_metrics USING GIN (metadata);
CREATE INDEX idx_monitoring_alerts_metadata_gin ON monitoring_alerts USING GIN (metadata);

-- Specialized indexes for common queries
CREATE INDEX idx_workflow_errors_unresolved ON workflow_errors (workflow_id, timestamp DESC) WHERE resolved = FALSE;
CREATE INDEX idx_monitoring_alerts_unresolved ON monitoring_alerts (workflow_id, severity, timestamp DESC) WHERE resolved = FALSE;
-- Note: Removed time-based conditional index as NOW() is not IMMUTABLE
CREATE INDEX idx_workflow_execution_logs_recent ON workflow_execution_logs (workflow_id, timestamp DESC);

-- ===================================================================
-- 9. INSERT TEST DATA
-- ===================================================================

-- Insert some test data to verify the setup
INSERT INTO workflow_execution_logs (workflow_id, execution_id, log_level, message, node_id, node_name, duration) VALUES
('test-workflow-1', 'exec-001', 'info', 'Workflow started successfully', 'node-1', 'Start Node', 150),
('test-workflow-1', 'exec-001', 'info', 'Processing data...', 'node-2', 'Process Node', 2300),
('test-workflow-1', 'exec-001', 'info', 'Workflow completed', 'node-3', 'End Node', 100);

INSERT INTO workflow_performance_metrics (workflow_id, execution_id, total_duration, node_count, successful_nodes) VALUES
('test-workflow-1', 'exec-001', 2550, 3, 3);

-- ===================================================================
-- MIGRATION COMPLETE
-- ===================================================================

-- Verify the setup
SELECT 'Migration completed successfully!' AS status,
       COUNT(*) AS test_logs_inserted
FROM workflow_execution_logs 
WHERE workflow_id = 'test-workflow-1'; 