-- Migration: Add Real-time Monitoring and Data Quality Tables
-- Date: 2024-12-12
-- Purpose: Task 8.1 - Set Up Supabase Project and Configure Database for Monitoring

-- System Health Metrics Table
CREATE TABLE IF NOT EXISTS public.system_health_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_name VARCHAR(255) NOT NULL,
    metric_type VARCHAR(100) NOT NULL, -- 'cpu_usage', 'memory_usage', 'response_time', 'uptime', 'error_rate'
    metric_value DECIMAL(10,4) NOT NULL,
    unit VARCHAR(50) NOT NULL, -- 'percentage', 'milliseconds', 'seconds', 'count'
    status VARCHAR(50) DEFAULT 'healthy', -- 'healthy', 'warning', 'critical'
    threshold_min DECIMAL(10,4),
    threshold_max DECIMAL(10,4),
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data Quality Indicators Table
CREATE TABLE IF NOT EXISTS public.data_quality_indicators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    data_source VARCHAR(255) NOT NULL, -- 'shopify', 'kajabi', 'google_ads', 'meta_ads'
    table_name VARCHAR(255) NOT NULL,
    quality_metric VARCHAR(100) NOT NULL, -- 'completeness', 'accuracy', 'freshness', 'consistency'
    score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100), -- 0-100 quality score
    total_records INTEGER DEFAULT 0,
    valid_records INTEGER DEFAULT 0,
    invalid_records INTEGER DEFAULT 0,
    last_sync TIMESTAMPTZ,
    issues JSONB DEFAULT '[]', -- Array of quality issues found
    status VARCHAR(50) DEFAULT 'good', -- 'good', 'warning', 'poor'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Alerts Table
CREATE TABLE IF NOT EXISTS public.system_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_type VARCHAR(100) NOT NULL, -- 'performance', 'data_quality', 'system_error', 'security'
    severity VARCHAR(50) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    source_service VARCHAR(255),
    source_metric_id UUID, -- Reference to health metric or data quality indicator
    trigger_condition JSONB,
    alert_data JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'acknowledged', 'resolved', 'dismissed'
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMPTZ,
    resolved_by VARCHAR(255),
    resolved_at TIMESTAMPTZ,
    auto_resolve BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monitoring Dashboard Config Table
CREATE TABLE IF NOT EXISTS public.monitoring_dashboard_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dashboard_name VARCHAR(255) NOT NULL,
    config_type VARCHAR(100) NOT NULL, -- 'widget', 'alert_rule', 'threshold'
    configuration JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Performance Logs Table
CREATE TABLE IF NOT EXISTS public.system_performance_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_name VARCHAR(255) NOT NULL,
    operation VARCHAR(255) NOT NULL, -- 'api_call', 'data_sync', 'report_generation'
    duration_ms INTEGER NOT NULL,
    memory_usage_mb DECIMAL(10,2),
    cpu_usage_percent DECIMAL(5,2),
    status VARCHAR(50) NOT NULL, -- 'success', 'error', 'timeout'
    error_message TEXT,
    request_details JSONB DEFAULT '{}',
    user_id VARCHAR(255),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_service_timestamp 
    ON public.system_health_metrics (service_name, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_system_health_metrics_status_timestamp 
    ON public.system_health_metrics (status, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_data_quality_indicators_source_timestamp 
    ON public.data_quality_indicators (data_source, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_data_quality_indicators_status_score 
    ON public.data_quality_indicators (status, score);

CREATE INDEX IF NOT EXISTS idx_system_alerts_status_severity 
    ON public.system_alerts (status, severity, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_alerts_type_timestamp 
    ON public.system_alerts (alert_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_performance_logs_service_timestamp 
    ON public.system_performance_logs (service_name, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_performance_logs_status_timestamp 
    ON public.system_performance_logs (status, timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.system_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_quality_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_dashboard_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_performance_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing authenticated users to read monitoring data)
CREATE POLICY "Allow authenticated users to view system health metrics" 
    ON public.system_health_metrics FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert system health metrics" 
    ON public.system_health_metrics FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view data quality indicators" 
    ON public.data_quality_indicators FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert data quality indicators" 
    ON public.data_quality_indicators FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view system alerts" 
    ON public.system_alerts FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage system alerts" 
    ON public.system_alerts FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view monitoring config" 
    ON public.monitoring_dashboard_config FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage monitoring config" 
    ON public.monitoring_dashboard_config FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view performance logs" 
    ON public.system_performance_logs FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert performance logs" 
    ON public.system_performance_logs FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Enable real-time for monitoring tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_health_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.data_quality_indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_performance_logs;

-- Insert some initial configuration and sample data
INSERT INTO public.monitoring_dashboard_config (dashboard_name, config_type, configuration, created_by) VALUES
('System Health Overview', 'widget', '{
    "type": "metric_card",
    "title": "API Response Time",
    "metric": "response_time",
    "service": "dashboard_api",
    "threshold": {"warning": 1000, "critical": 3000},
    "unit": "ms"
}', 'system'),
('Data Quality Monitor', 'widget', '{
    "type": "quality_chart",
    "title": "Data Completeness",
    "sources": ["shopify", "kajabi", "google_ads"],
    "metric": "completeness",
    "threshold": {"warning": 85, "critical": 70}
}', 'system'),
('Performance Alert', 'alert_rule', '{
    "trigger": "response_time > 3000",
    "severity": "critical",
    "message": "Dashboard API response time is critically high",
    "auto_resolve": true,
    "notify_channels": ["email", "dashboard"]
}', 'system');

-- Insert sample health metrics for testing
INSERT INTO public.system_health_metrics (service_name, metric_type, metric_value, unit, status, threshold_max) VALUES
('dashboard_api', 'response_time', 850.5, 'milliseconds', 'healthy', 1000),
('dashboard_api', 'cpu_usage', 45.2, 'percentage', 'healthy', 80),
('dashboard_api', 'memory_usage', 62.8, 'percentage', 'healthy', 85),
('supabase_db', 'connection_count', 12, 'count', 'healthy', 100),
('data_sync_service', 'uptime', 99.8, 'percentage', 'healthy', 95);

-- Insert sample data quality indicators
INSERT INTO public.data_quality_indicators (data_source, table_name, quality_metric, score, total_records, valid_records, status) VALUES
('shopify', 'shopify_sales', 'completeness', 98.5, 1250, 1231, 'good'),
('kajabi', 'kajabi_sales', 'completeness', 96.2, 890, 856, 'good'),
('shopify', 'shopify_sales', 'accuracy', 94.8, 1250, 1185, 'good'),
('google_ads', 'google_ads_performance', 'freshness', 85.3, 500, 426, 'warning');

COMMENT ON TABLE public.system_health_metrics IS 'Stores real-time system health and performance metrics';
COMMENT ON TABLE public.data_quality_indicators IS 'Tracks data quality scores across different data sources';
COMMENT ON TABLE public.system_alerts IS 'Manages system alerts and notifications';
COMMENT ON TABLE public.monitoring_dashboard_config IS 'Configuration settings for monitoring dashboard widgets and alerts';
COMMENT ON TABLE public.system_performance_logs IS 'Detailed performance logs for system operations'; 