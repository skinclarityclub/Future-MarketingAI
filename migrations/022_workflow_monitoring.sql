-- Task 33.3: Implement Real-Time Monitoring
-- Database schema for workflow monitoring, logging, and alerting

-- Create enum types for monitoring
CREATE TYPE log_level AS ENUM ('debug', 'info', 'warn', 'error', 'fatal');
CREATE TYPE error_type AS ENUM ('validation', 'network', 'timeout', 'permission', 'data', 'system', 'unknown');
CREATE TYPE error_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE alert_type AS ENUM ('performance', 'error', 'timeout', 'resource', 'dependency');
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical');

-- Workflow Execution Logs Table
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_workflow_execution_logs_workflow_id (workflow_id),
    INDEX idx_workflow_execution_logs_execution_id (execution_id),
    INDEX idx_workflow_execution_logs_timestamp (timestamp DESC),
    INDEX idx_workflow_execution_logs_level (log_level),
    INDEX idx_workflow_execution_logs_composite (workflow_id, execution_id, timestamp DESC)
);

-- Workflow Errors Table
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
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_workflow_errors_workflow_id (workflow_id),
    INDEX idx_workflow_errors_execution_id (execution_id),
    INDEX idx_workflow_errors_timestamp (timestamp DESC),
    INDEX idx_workflow_errors_severity (severity),
    INDEX idx_workflow_errors_resolved (resolved),
    INDEX idx_workflow_errors_composite (workflow_id, resolved, severity, timestamp DESC)
);

-- Workflow Performance Metrics Table
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_workflow_performance_workflow_id (workflow_id),
    INDEX idx_workflow_performance_execution_id (execution_id),
    INDEX idx_workflow_performance_timestamp (timestamp DESC),
    INDEX idx_workflow_performance_duration (total_duration),
    INDEX idx_workflow_performance_composite (workflow_id, timestamp DESC)
);

-- Monitoring Alerts Table
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
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_monitoring_alerts_workflow_id (workflow_id),
    INDEX idx_monitoring_alerts_severity (severity),
    INDEX idx_monitoring_alerts_timestamp (timestamp DESC),
    INDEX idx_monitoring_alerts_acknowledged (acknowledged),
    INDEX idx_monitoring_alerts_resolved (resolved),
    INDEX idx_monitoring_alerts_composite (workflow_id, severity, acknowledged, resolved, timestamp DESC)
);

-- Monitoring Statistics Aggregation Table (for performance)
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
    UNIQUE(workflow_id, date_bucket, hour_bucket),
    
    -- Indexes for performance
    INDEX idx_monitoring_statistics_workflow_id (workflow_id),
    INDEX idx_monitoring_statistics_date (date_bucket DESC),
    INDEX idx_monitoring_statistics_hour (hour_bucket),
    INDEX idx_monitoring_statistics_composite (workflow_id, date_bucket DESC, hour_bucket)
);

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

-- Function to aggregate monitoring statistics
CREATE OR REPLACE FUNCTION aggregate_monitoring_statistics(
    p_workflow_id VARCHAR(255) DEFAULT NULL,
    p_date DATE DEFAULT CURRENT_DATE,
    p_hour INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    rec RECORD;
    target_hour INTEGER;
BEGIN
    -- If no hour specified, aggregate for all hours of the day
    IF p_hour IS NULL THEN
        FOR target_hour IN 0..23 LOOP
            PERFORM aggregate_monitoring_statistics(p_workflow_id, p_date, target_hour);
        END LOOP;
        RETURN;
    END IF;

    -- Aggregate for specific workflow or all workflows
    FOR rec IN 
        SELECT 
            COALESCE(p_workflow_id, wf.workflow_id) as workflow_id
        FROM (
            SELECT DISTINCT workflow_id FROM workflow_execution_logs
            WHERE DATE(timestamp) = p_date
            AND EXTRACT(HOUR FROM timestamp) = p_hour
            AND (p_workflow_id IS NULL OR workflow_id = p_workflow_id)
        ) wf
    LOOP
        -- Insert or update aggregated statistics
        INSERT INTO monitoring_statistics (
            workflow_id, date_bucket, hour_bucket,
            total_executions, successful_executions, failed_executions,
            total_duration, average_duration, min_duration, max_duration,
            total_errors, critical_errors, high_errors, medium_errors, low_errors,
            total_alerts, critical_alerts, warning_alerts, info_alerts,
            average_memory_usage, peak_memory_usage,
            average_cpu_usage, peak_cpu_usage,
            total_network_requests, total_network_data, average_throughput
        )
        SELECT 
            rec.workflow_id,
            p_date,
            p_hour,
            -- Execution metrics
            COUNT(DISTINCT execution_id) as total_executions,
            COUNT(DISTINCT CASE WHEN log_level NOT IN ('error', 'fatal') THEN execution_id END) as successful_executions,
            COUNT(DISTINCT CASE WHEN log_level IN ('error', 'fatal') THEN execution_id END) as failed_executions,
            -- Duration metrics
            COALESCE(SUM(duration), 0) as total_duration,
            COALESCE(AVG(duration), 0) as average_duration,
            COALESCE(MIN(duration), 0) as min_duration,
            COALESCE(MAX(duration), 0) as max_duration,
            -- Error metrics (from subquery)
            (SELECT COUNT(*) FROM workflow_errors e 
             WHERE e.workflow_id = rec.workflow_id 
             AND DATE(e.timestamp) = p_date 
             AND EXTRACT(HOUR FROM e.timestamp) = p_hour) as total_errors,
            (SELECT COUNT(*) FROM workflow_errors e 
             WHERE e.workflow_id = rec.workflow_id 
             AND DATE(e.timestamp) = p_date 
             AND EXTRACT(HOUR FROM e.timestamp) = p_hour 
             AND e.severity = 'critical') as critical_errors,
            (SELECT COUNT(*) FROM workflow_errors e 
             WHERE e.workflow_id = rec.workflow_id 
             AND DATE(e.timestamp) = p_date 
             AND EXTRACT(HOUR FROM e.timestamp) = p_hour 
             AND e.severity = 'high') as high_errors,
            (SELECT COUNT(*) FROM workflow_errors e 
             WHERE e.workflow_id = rec.workflow_id 
             AND DATE(e.timestamp) = p_date 
             AND EXTRACT(HOUR FROM e.timestamp) = p_hour 
             AND e.severity = 'medium') as medium_errors,
            (SELECT COUNT(*) FROM workflow_errors e 
             WHERE e.workflow_id = rec.workflow_id 
             AND DATE(e.timestamp) = p_date 
             AND EXTRACT(HOUR FROM e.timestamp) = p_hour 
             AND e.severity = 'low') as low_errors,
            -- Alert metrics (from subquery)
            (SELECT COUNT(*) FROM monitoring_alerts a 
             WHERE a.workflow_id = rec.workflow_id 
             AND DATE(a.timestamp) = p_date 
             AND EXTRACT(HOUR FROM a.timestamp) = p_hour) as total_alerts,
            (SELECT COUNT(*) FROM monitoring_alerts a 
             WHERE a.workflow_id = rec.workflow_id 
             AND DATE(a.timestamp) = p_date 
             AND EXTRACT(HOUR FROM a.timestamp) = p_hour 
             AND a.severity = 'critical') as critical_alerts,
            (SELECT COUNT(*) FROM monitoring_alerts a 
             WHERE a.workflow_id = rec.workflow_id 
             AND DATE(a.timestamp) = p_date 
             AND EXTRACT(HOUR FROM a.timestamp) = p_hour 
             AND a.severity = 'warning') as warning_alerts,
            (SELECT COUNT(*) FROM monitoring_alerts a 
             WHERE a.workflow_id = rec.workflow_id 
             AND DATE(a.timestamp) = p_date 
             AND EXTRACT(HOUR FROM a.timestamp) = p_hour 
             AND a.severity = 'info') as info_alerts,
            -- Performance metrics (from performance table)
            (SELECT COALESCE(AVG(memory_average), 0) FROM workflow_performance_metrics p 
             WHERE p.workflow_id = rec.workflow_id 
             AND DATE(p.timestamp) = p_date 
             AND EXTRACT(HOUR FROM p.timestamp) = p_hour) as average_memory_usage,
            (SELECT COALESCE(MAX(memory_peak), 0) FROM workflow_performance_metrics p 
             WHERE p.workflow_id = rec.workflow_id 
             AND DATE(p.timestamp) = p_date 
             AND EXTRACT(HOUR FROM p.timestamp) = p_hour) as peak_memory_usage,
            (SELECT COALESCE(AVG(cpu_average), 0) FROM workflow_performance_metrics p 
             WHERE p.workflow_id = rec.workflow_id 
             AND DATE(p.timestamp) = p_date 
             AND EXTRACT(HOUR FROM p.timestamp) = p_hour) as average_cpu_usage,
            (SELECT COALESCE(MAX(cpu_peak), 0) FROM workflow_performance_metrics p 
             WHERE p.workflow_id = rec.workflow_id 
             AND DATE(p.timestamp) = p_date 
             AND EXTRACT(HOUR FROM p.timestamp) = p_hour) as peak_cpu_usage,
            (SELECT COALESCE(SUM(network_requests), 0) FROM workflow_performance_metrics p 
             WHERE p.workflow_id = rec.workflow_id 
             AND DATE(p.timestamp) = p_date 
             AND EXTRACT(HOUR FROM p.timestamp) = p_hour) as total_network_requests,
            (SELECT COALESCE(SUM(network_data_transferred), 0) FROM workflow_performance_metrics p 
             WHERE p.workflow_id = rec.workflow_id 
             AND DATE(p.timestamp) = p_date 
             AND EXTRACT(HOUR FROM p.timestamp) = p_hour) as total_network_data,
            (SELECT COALESCE(AVG(throughput), 0) FROM workflow_performance_metrics p 
             WHERE p.workflow_id = rec.workflow_id 
             AND DATE(p.timestamp) = p_date 
             AND EXTRACT(HOUR FROM p.timestamp) = p_hour) as average_throughput
        FROM workflow_execution_logs l
        WHERE l.workflow_id = rec.workflow_id
        AND DATE(l.timestamp) = p_date
        AND EXTRACT(HOUR FROM l.timestamp) = p_hour
        GROUP BY l.workflow_id
        
        ON CONFLICT (workflow_id, date_bucket, hour_bucket) 
        DO UPDATE SET
            total_executions = EXCLUDED.total_executions,
            successful_executions = EXCLUDED.successful_executions,
            failed_executions = EXCLUDED.failed_executions,
            total_duration = EXCLUDED.total_duration,
            average_duration = EXCLUDED.average_duration,
            min_duration = EXCLUDED.min_duration,
            max_duration = EXCLUDED.max_duration,
            total_errors = EXCLUDED.total_errors,
            critical_errors = EXCLUDED.critical_errors,
            high_errors = EXCLUDED.high_errors,
            medium_errors = EXCLUDED.medium_errors,
            low_errors = EXCLUDED.low_errors,
            total_alerts = EXCLUDED.total_alerts,
            critical_alerts = EXCLUDED.critical_alerts,
            warning_alerts = EXCLUDED.warning_alerts,
            info_alerts = EXCLUDED.info_alerts,
            average_memory_usage = EXCLUDED.average_memory_usage,
            peak_memory_usage = EXCLUDED.peak_memory_usage,
            average_cpu_usage = EXCLUDED.average_cpu_usage,
            peak_cpu_usage = EXCLUDED.peak_cpu_usage,
            total_network_requests = EXCLUDED.total_network_requests,
            total_network_data = EXCLUDED.total_network_data,
            average_throughput = EXCLUDED.average_throughput,
            updated_at = NOW();
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old monitoring data
CREATE OR REPLACE FUNCTION cleanup_monitoring_data(
    retention_days INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    cutoff_date TIMESTAMPTZ;
BEGIN
    cutoff_date := NOW() - INTERVAL '1 day' * retention_days;
    
    -- Clean up old execution logs
    DELETE FROM workflow_execution_logs 
    WHERE timestamp < cutoff_date;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Clean up old performance metrics
    DELETE FROM workflow_performance_metrics 
    WHERE timestamp < cutoff_date;
    
    -- Clean up resolved errors older than retention period
    DELETE FROM workflow_errors 
    WHERE timestamp < cutoff_date AND resolved = TRUE;
    
    -- Clean up resolved alerts older than retention period
    DELETE FROM monitoring_alerts 
    WHERE timestamp < cutoff_date AND resolved = TRUE;
    
    -- Clean up old statistics (keep longer - 1 year)
    DELETE FROM monitoring_statistics 
    WHERE date_bucket < CURRENT_DATE - INTERVAL '365 days';
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get monitoring dashboard summary
CREATE OR REPLACE FUNCTION get_monitoring_dashboard_summary(
    p_workflow_id VARCHAR(255) DEFAULT NULL,
    p_hours_back INTEGER DEFAULT 24
)
RETURNS TABLE(
    total_executions BIGINT,
    successful_executions BIGINT,
    failed_executions BIGINT,
    success_rate DECIMAL(5,2),
    total_errors BIGINT,
    critical_errors BIGINT,
    total_alerts BIGINT,
    unresolved_alerts BIGINT,
    average_execution_time DECIMAL(10,2),
    system_health VARCHAR(20)
) AS $$
DECLARE
    cutoff_time TIMESTAMPTZ;
BEGIN
    cutoff_time := NOW() - INTERVAL '1 hour' * p_hours_back;
    
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT l.execution_id) as total_executions,
        COUNT(DISTINCT CASE WHEN l.log_level NOT IN ('error', 'fatal') THEN l.execution_id END) as successful_executions,
        COUNT(DISTINCT CASE WHEN l.log_level IN ('error', 'fatal') THEN l.execution_id END) as failed_executions,
        CASE 
            WHEN COUNT(DISTINCT l.execution_id) > 0 
            THEN ROUND(
                (COUNT(DISTINCT CASE WHEN l.log_level NOT IN ('error', 'fatal') THEN l.execution_id END)::DECIMAL / 
                 COUNT(DISTINCT l.execution_id)::DECIMAL) * 100, 2
            )
            ELSE 0.00
        END as success_rate,
        (SELECT COUNT(*) FROM workflow_errors e 
         WHERE e.timestamp >= cutoff_time 
         AND (p_workflow_id IS NULL OR e.workflow_id = p_workflow_id))::BIGINT as total_errors,
        (SELECT COUNT(*) FROM workflow_errors e 
         WHERE e.timestamp >= cutoff_time 
         AND e.severity = 'critical'
         AND (p_workflow_id IS NULL OR e.workflow_id = p_workflow_id))::BIGINT as critical_errors,
        (SELECT COUNT(*) FROM monitoring_alerts a 
         WHERE a.timestamp >= cutoff_time 
         AND (p_workflow_id IS NULL OR a.workflow_id = p_workflow_id))::BIGINT as total_alerts,
        (SELECT COUNT(*) FROM monitoring_alerts a 
         WHERE a.timestamp >= cutoff_time 
         AND a.resolved = FALSE
         AND (p_workflow_id IS NULL OR a.workflow_id = p_workflow_id))::BIGINT as unresolved_alerts,
        COALESCE(AVG(l.duration), 0) as average_execution_time,
        CASE 
            WHEN (SELECT COUNT(*) FROM monitoring_alerts a 
                  WHERE a.timestamp >= cutoff_time 
                  AND a.severity = 'critical' 
                  AND a.resolved = FALSE
                  AND (p_workflow_id IS NULL OR a.workflow_id = p_workflow_id)) > 0 
            THEN 'critical'
            WHEN (SELECT COUNT(*) FROM workflow_errors e 
                  WHERE e.timestamp >= cutoff_time 
                  AND e.severity IN ('high', 'critical')
                  AND (p_workflow_id IS NULL OR e.workflow_id = p_workflow_id)) > 5 
            THEN 'warning'
            ELSE 'healthy'
        END as system_health
    FROM workflow_execution_logs l
    WHERE l.timestamp >= cutoff_time
    AND (p_workflow_id IS NULL OR l.workflow_id = p_workflow_id);
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE workflow_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_statistics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Users can view workflow execution logs" ON workflow_execution_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert workflow execution logs" ON workflow_execution_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view workflow errors" ON workflow_errors
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert workflow errors" ON workflow_errors
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update workflow errors" ON workflow_errors
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view performance metrics" ON workflow_performance_metrics
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert performance metrics" ON workflow_performance_metrics
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view monitoring alerts" ON monitoring_alerts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert monitoring alerts" ON monitoring_alerts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update monitoring alerts" ON monitoring_alerts
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view monitoring statistics" ON monitoring_statistics
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create service role policies for automated processes
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

-- Create sample data for development
INSERT INTO workflow_execution_logs (workflow_id, execution_id, log_level, message, node_name, duration) VALUES
('wf-email-001', 'exec-001', 'info', 'Workflow started successfully', 'Start Node', 0),
('wf-email-001', 'exec-001', 'info', 'Processing email template', 'Template Node', 1250),
('wf-email-001', 'exec-001', 'info', 'Sending email to recipient', 'Send Node', 2300),
('wf-email-001', 'exec-001', 'info', 'Workflow completed successfully', 'End Node', 150),
('wf-social-001', 'exec-002', 'info', 'Social media workflow started', 'Start Node', 0),
('wf-social-001', 'exec-002', 'warn', 'Rate limit approaching for Twitter API', 'Twitter Node', 3400),
('wf-social-001', 'exec-002', 'info', 'Posted to social media successfully', 'Post Node', 1800),
('wf-social-001', 'exec-002', 'info', 'Workflow completed', 'End Node', 100);

INSERT INTO workflow_errors (workflow_id, execution_id, error_type, error_message, severity, node_name) VALUES
('wf-email-001', 'exec-003', 'network', 'SMTP server connection timeout', 'high', 'Send Node'),
('wf-social-001', 'exec-004', 'permission', 'Twitter API rate limit exceeded', 'medium', 'Twitter Node'),
('wf-data-001', 'exec-005', 'validation', 'Invalid email format in input data', 'low', 'Validation Node');

INSERT INTO workflow_performance_metrics (workflow_id, execution_id, total_duration, node_count, successful_nodes, failed_nodes, memory_peak, cpu_peak, throughput) VALUES
('wf-email-001', 'exec-001', 3700, 4, 4, 0, 52428800, 15.5, 2.5),
('wf-social-001', 'exec-002', 5300, 4, 4, 0, 67108864, 22.1, 1.8),
('wf-data-001', 'exec-005', 8900, 6, 5, 1, 134217728, 45.3, 0.9);

INSERT INTO monitoring_alerts (workflow_id, alert_type, severity, title, description) VALUES
('wf-email-001', 'error', 'warning', 'SMTP Connection Issues', 'Multiple SMTP connection timeouts detected in the last hour'),
('wf-social-001', 'performance', 'info', 'Rate Limit Warning', 'Social media API rate limit is approaching threshold'),
('wf-data-001', 'resource', 'critical', 'High Memory Usage', 'Workflow is consuming excessive memory resources');

-- Create indexes for better performance on large datasets
CREATE INDEX CONCURRENTLY idx_workflow_execution_logs_metadata_gin ON workflow_execution_logs USING GIN (metadata);
CREATE INDEX CONCURRENTLY idx_workflow_errors_metadata_gin ON workflow_errors USING GIN (metadata);
CREATE INDEX CONCURRENTLY idx_workflow_performance_metrics_metadata_gin ON workflow_performance_metrics USING GIN (metadata);
CREATE INDEX CONCURRENTLY idx_monitoring_alerts_metadata_gin ON monitoring_alerts USING GIN (metadata);

-- Create partial indexes for common queries
CREATE INDEX CONCURRENTLY idx_workflow_errors_unresolved ON workflow_errors (workflow_id, timestamp DESC) WHERE resolved = FALSE;
CREATE INDEX CONCURRENTLY idx_monitoring_alerts_unresolved ON monitoring_alerts (workflow_id, severity, timestamp DESC) WHERE resolved = FALSE;
CREATE INDEX CONCURRENTLY idx_workflow_execution_logs_recent ON workflow_execution_logs (workflow_id, timestamp DESC) WHERE timestamp >= NOW() - INTERVAL '24 hours';

COMMENT ON TABLE workflow_execution_logs IS 'Stores detailed execution logs for workflow monitoring and debugging';
COMMENT ON TABLE workflow_errors IS 'Tracks errors and exceptions that occur during workflow execution';
COMMENT ON TABLE workflow_performance_metrics IS 'Records performance metrics for workflow optimization and monitoring';
COMMENT ON TABLE monitoring_alerts IS 'Manages alerts and notifications for workflow monitoring system';
COMMENT ON TABLE monitoring_statistics IS 'Aggregated statistics for efficient dashboard queries and reporting';

COMMENT ON FUNCTION aggregate_monitoring_statistics IS 'Aggregates monitoring data into hourly statistics for efficient querying';
COMMENT ON FUNCTION cleanup_monitoring_data IS 'Cleans up old monitoring data based on retention policies';
COMMENT ON FUNCTION get_monitoring_dashboard_summary IS 'Provides summary statistics for monitoring dashboard';