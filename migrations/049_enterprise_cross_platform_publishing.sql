-- 🏢 ENTERPRISE CROSS-PLATFORM PUBLISHING MIGRATION
-- Fortune 500-grade database schema for advanced publishing workflows

-- Enterprise Publishing Audit Trail
CREATE TABLE IF NOT EXISTS enterprise_publishing_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id VARCHAR(255) NOT NULL,
    execution_id VARCHAR(255),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id VARCHAR(255),
    campaign_id VARCHAR(255),
    
    -- Publishing Configuration
    platforms TEXT[] NOT NULL,
    publishing_strategy VARCHAR(50) NOT NULL CHECK (publishing_strategy IN ('intelligent_parallel', 'sequential', 'priority_based')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('urgent', 'high', 'standard', 'low')),
    
    -- Results & Metrics
    results JSONB NOT NULL,
    metrics JSONB NOT NULL,
    
    -- Compliance Data
    compliance_data JSONB NOT NULL,
    gdpr_compliant BOOLEAN DEFAULT true,
    data_retention_policy VARCHAR(50) DEFAULT '7_years',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cross-Platform Publishing Analytics
CREATE TABLE IF NOT EXISTS cross_platform_publishing_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Publishing Data
    platforms TEXT[] NOT NULL,
    successful_publishes INTEGER DEFAULT 0,
    failed_publishes INTEGER DEFAULT 0,
    fallbacks_used INTEGER DEFAULT 0,
    total_retries INTEGER DEFAULT 0,
    processing_time INTEGER NOT NULL, -- milliseconds
    
    -- Strategy & Configuration
    publishing_strategy VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    
    -- Detailed Results
    results JSONB NOT NULL,
    
    -- Performance Metrics
    success_rate DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN (successful_publishes + failed_publishes) > 0 
            THEN (successful_publishes::DECIMAL / (successful_publishes + failed_publishes)) * 100
            ELSE 0
        END
    ) STORED,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform Performance Metrics
CREATE TABLE IF NOT EXISTS platform_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Performance Data
    total_publishes INTEGER DEFAULT 0,
    successful_publishes INTEGER DEFAULT 0,
    failed_publishes INTEGER DEFAULT 0,
    average_response_time INTEGER DEFAULT 0, -- milliseconds
    
    -- Reliability Metrics
    uptime_percentage DECIMAL(5,2) DEFAULT 100.00,
    last_failure_at TIMESTAMP WITH TIME ZONE,
    consecutive_failures INTEGER DEFAULT 0,
    
    -- Rate Limiting Data
    rate_limit_hits INTEGER DEFAULT 0,
    last_rate_limit_at TIMESTAMP WITH TIME ZONE,
    
    -- Fallback Usage
    fallback_activations INTEGER DEFAULT 0,
    primary_fallback_platform VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(platform, user_id)
);

-- Enterprise Content Optimization Results
CREATE TABLE IF NOT EXISTS enterprise_content_optimization (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id VARCHAR(255) NOT NULL,
    content_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Original Content
    original_content JSONB NOT NULL,
    
    -- Optimized Content per Platform
    optimized_content JSONB NOT NULL,
    
    -- AI Optimization Insights
    optimization_insights JSONB NOT NULL,
    total_optimizations INTEGER DEFAULT 0,
    ai_confidence_score DECIMAL(3,2) DEFAULT 0.50,
    
    -- Platform-Specific Changes
    platform_changes JSONB NOT NULL,
    
    -- Performance Predictions
    estimated_engagement JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fallback Execution Logs
CREATE TABLE IF NOT EXISTS fallback_execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id VARCHAR(255) NOT NULL,
    original_platform VARCHAR(50) NOT NULL,
    fallback_platform VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Failure Analysis
    failure_type VARCHAR(50) NOT NULL,
    failure_message TEXT,
    failure_code VARCHAR(20),
    
    -- Recovery Strategy
    recovery_strategy TEXT NOT NULL,
    recovery_attempt INTEGER DEFAULT 1,
    max_recovery_attempts INTEGER DEFAULT 3,
    
    -- Execution Results
    fallback_success BOOLEAN DEFAULT false,
    fallback_error TEXT,
    
    -- Timing
    failure_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    recovery_timestamp TIMESTAMP WITH TIME ZONE,
    total_recovery_time INTEGER, -- milliseconds
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enterprise Publishing Schedules
CREATE TABLE IF NOT EXISTS enterprise_publishing_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Schedule Configuration
    platforms TEXT[] NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Content Reference
    content_id VARCHAR(255) NOT NULL,
    optimized_content JSONB NOT NULL,
    
    -- Execution Status
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'processing', 'completed', 'failed', 'cancelled')),
    execution_started_at TIMESTAMP WITH TIME ZONE,
    execution_completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Results
    execution_results JSONB,
    
    -- Retry Configuration
    max_retries INTEGER DEFAULT 3,
    retry_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_enterprise_audit_request_id ON enterprise_publishing_audit(request_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_audit_user_id ON enterprise_publishing_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_audit_created_at ON enterprise_publishing_audit(created_at);
CREATE INDEX IF NOT EXISTS idx_enterprise_audit_organization ON enterprise_publishing_audit(organization_id);

CREATE INDEX IF NOT EXISTS idx_analytics_request_id ON cross_platform_publishing_analytics(request_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON cross_platform_publishing_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON cross_platform_publishing_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_success_rate ON cross_platform_publishing_analytics(success_rate);

CREATE INDEX IF NOT EXISTS idx_platform_metrics_platform ON platform_performance_metrics(platform);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_user_id ON platform_performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_uptime ON platform_performance_metrics(uptime_percentage);

CREATE INDEX IF NOT EXISTS idx_content_optimization_request_id ON enterprise_content_optimization(request_id);
CREATE INDEX IF NOT EXISTS idx_content_optimization_content_id ON enterprise_content_optimization(content_id);
CREATE INDEX IF NOT EXISTS idx_content_optimization_user_id ON enterprise_content_optimization(user_id);

CREATE INDEX IF NOT EXISTS idx_fallback_logs_request_id ON fallback_execution_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_fallback_logs_platform ON fallback_execution_logs(original_platform, fallback_platform);
CREATE INDEX IF NOT EXISTS idx_fallback_logs_user_id ON fallback_execution_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_fallback_logs_failure_type ON fallback_execution_logs(failure_type);

CREATE INDEX IF NOT EXISTS idx_schedules_scheduled_time ON enterprise_publishing_schedules(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON enterprise_publishing_schedules(status);
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON enterprise_publishing_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_next_retry ON enterprise_publishing_schedules(next_retry_at);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_enterprise_audit_updated_at BEFORE UPDATE ON enterprise_publishing_audit FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_analytics_updated_at BEFORE UPDATE ON cross_platform_publishing_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_platform_metrics_updated_at BEFORE UPDATE ON platform_performance_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_optimization_updated_at BEFORE UPDATE ON enterprise_content_optimization FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fallback_logs_updated_at BEFORE UPDATE ON fallback_execution_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON enterprise_publishing_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE enterprise_publishing_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_platform_publishing_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_content_optimization ENABLE ROW LEVEL SECURITY;
ALTER TABLE fallback_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_publishing_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own audit records" ON enterprise_publishing_audit FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own audit records" ON enterprise_publishing_audit FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics" ON cross_platform_publishing_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own analytics" ON cross_platform_publishing_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own platform metrics" ON platform_performance_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own platform metrics" ON platform_performance_metrics FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own content optimization" ON enterprise_content_optimization FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own content optimization" ON enterprise_content_optimization FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own fallback logs" ON fallback_execution_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own fallback logs" ON fallback_execution_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own schedules" ON enterprise_publishing_schedules FOR ALL USING (auth.uid() = user_id);

-- Performance Views
CREATE OR REPLACE VIEW enterprise_publishing_dashboard AS
SELECT 
    u.id as user_id,
    u.email,
    COUNT(DISTINCT epa.id) as total_publishes,
    AVG(cpa.success_rate) as average_success_rate,
    SUM(cpa.successful_publishes) as total_successful,
    SUM(cpa.failed_publishes) as total_failed,
    SUM(cpa.fallbacks_used) as total_fallbacks,
    AVG(cpa.processing_time) as avg_processing_time,
    MAX(epa.created_at) as last_publish_at
FROM auth.users u
LEFT JOIN enterprise_publishing_audit epa ON u.id = epa.user_id
LEFT JOIN cross_platform_publishing_analytics cpa ON u.id = cpa.user_id
GROUP BY u.id, u.email;

CREATE OR REPLACE VIEW platform_reliability_report AS
SELECT 
    platform,
    COUNT(*) as total_users,
    AVG(uptime_percentage) as avg_uptime,
    AVG(average_response_time) as avg_response_time,
    SUM(rate_limit_hits) as total_rate_limits,
    SUM(fallback_activations) as total_fallbacks,
    MAX(last_failure_at) as last_failure
FROM platform_performance_metrics
GROUP BY platform
ORDER BY avg_uptime DESC;

-- Comments for documentation
COMMENT ON TABLE enterprise_publishing_audit IS 'Comprehensive audit trail for enterprise publishing operations with GDPR compliance';
COMMENT ON TABLE cross_platform_publishing_analytics IS 'Analytics and performance metrics for cross-platform publishing';
COMMENT ON TABLE platform_performance_metrics IS 'Platform-specific performance and reliability metrics';
COMMENT ON TABLE enterprise_content_optimization IS 'AI-powered content optimization results and insights';
COMMENT ON TABLE fallback_execution_logs IS 'Detailed logs of fallback mechanism executions';
COMMENT ON TABLE enterprise_publishing_schedules IS 'Scheduled publishing management with retry logic';

-- Grant permissions
GRANT SELECT, INSERT ON enterprise_publishing_audit TO authenticated;
GRANT SELECT, INSERT ON cross_platform_publishing_analytics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON platform_performance_metrics TO authenticated;
GRANT SELECT, INSERT ON enterprise_content_optimization TO authenticated;
GRANT SELECT, INSERT ON fallback_execution_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON enterprise_publishing_schedules TO authenticated; 