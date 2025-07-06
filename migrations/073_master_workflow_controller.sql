-- Migration: 073_master_workflow_controller.sql
-- Task 73: Universal n8n AI/ML Workflow Orchestration Platform
-- Creates database tables for the Master Workflow Controller system

-- 1. Workflow Orchestration Configurations
CREATE TABLE IF NOT EXISTS workflow_orchestration_configs (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('ai_agent', 'content_creation', 'ml_pipeline', 'analytics', 'monitoring')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    dependencies TEXT[] DEFAULT '{}',
    triggers JSONB DEFAULT '[]',
    ai_config JSONB DEFAULT '{}',
    scheduling JSONB DEFAULT '{}',
    ab_testing JSONB DEFAULT '{}',
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Master Workflow Executions
CREATE TABLE IF NOT EXISTS master_workflow_executions (
    id SERIAL PRIMARY KEY,
    execution_id VARCHAR(255) UNIQUE NOT NULL,
    workflow_id VARCHAR(255) NOT NULL,
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    scheduling_decision JSONB DEFAULT '{}',
    applied_optimizations JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    error_message TEXT,
    error_details JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Cross-Platform Learning Patterns
CREATE TABLE IF NOT EXISTS cross_platform_learning (
    id SERIAL PRIMARY KEY,
    source_workflow VARCHAR(255) NOT NULL,
    target_workflows TEXT[] NOT NULL,
    learning_pattern TEXT NOT NULL,
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    performance_improvement DECIMAL(5,2),
    metrics JSONB DEFAULT '{}',
    results JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Optimization Feedback System
CREATE TABLE IF NOT EXISTS optimization_feedback (
    id SERIAL PRIMARY KEY,
    workflow_id VARCHAR(255) NOT NULL,
    metric VARCHAR(100) NOT NULL,
    current_value DECIMAL(10,4) NOT NULL,
    target_value DECIMAL(10,4) NOT NULL,
    suggestions TEXT[] DEFAULT '{}',
    priority_score INTEGER DEFAULT 50 CHECK (priority_score >= 0 AND priority_score <= 100),
    implemented BOOLEAN DEFAULT false,
    implementation_date TIMESTAMP WITH TIME ZONE,
    implementation_results JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Intelligent Scheduling System
CREATE TABLE IF NOT EXISTS intelligent_scheduling (
    id SERIAL PRIMARY KEY,
    workflow_id VARCHAR(255) NOT NULL,
    suggested_time TIMESTAMP WITH TIME ZONE NOT NULL,
    reasoning TEXT[] DEFAULT '{}',
    resource_optimization INTEGER DEFAULT 50,
    conflict_resolution TEXT[] DEFAULT '{}',
    scheduling_type VARCHAR(20) DEFAULT 'intelligent' CHECK (scheduling_type IN ('immediate', 'delayed', 'scheduled', 'intelligent')),
    applied BOOLEAN DEFAULT false,
    actual_execution_time TIMESTAMP WITH TIME ZONE,
    performance_impact JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ML Model Performance Metrics
CREATE TABLE IF NOT EXISTS ml_model_metrics (
    id SERIAL PRIMARY KEY,
    model_id VARCHAR(255) UNIQUE NOT NULL,
    model_name VARCHAR(255) NOT NULL,
    workflow_id VARCHAR(255),
    accuracy DECIMAL(5,4) CHECK (accuracy >= 0 AND accuracy <= 1),
    latency_ms DECIMAL(10,2),
    throughput DECIMAL(10,2),
    error_rate DECIMAL(5,4) CHECK (error_rate >= 0 AND error_rate <= 1),
    drift_detected BOOLEAN DEFAULT false,
    drift_score DECIMAL(5,4),
    last_retrained TIMESTAMP WITH TIME ZONE,
    next_retraining_due TIMESTAMP WITH TIME ZONE,
    retraining_status VARCHAR(20) DEFAULT 'up_to_date' CHECK (retraining_status IN ('up_to_date', 'scheduled', 'in_progress', 'failed')),
    trigger_reason VARCHAR(50),
    performance_trends JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Workflow Anomalies Detection
CREATE TABLE IF NOT EXISTS workflow_anomalies (
    id VARCHAR(255) PRIMARY KEY,
    workflow_id VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('performance', 'data', 'behavior', 'security')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL,
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_method TEXT,
    impact TEXT,
    recommendations TEXT[] DEFAULT '{}',
    metrics JSONB DEFAULT '{}',
    false_positive BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Workflow Dependencies Management
CREATE TABLE IF NOT EXISTS workflow_dependencies (
    id SERIAL PRIMARY KEY,
    workflow_id VARCHAR(255) NOT NULL,
    depends_on_workflow_id VARCHAR(255) NOT NULL,
    dependency_type VARCHAR(20) DEFAULT 'blocking' CHECK (dependency_type IN ('blocking', 'preferential', 'data')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workflow_id, depends_on_workflow_id)
);

-- 9. A/B Testing Results
CREATE TABLE IF NOT EXISTS workflow_ab_testing (
    id SERIAL PRIMARY KEY,
    workflow_id VARCHAR(255) NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(100) NOT NULL,
    control_group BOOLEAN DEFAULT false,
    execution_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,4),
    avg_duration_ms DECIMAL(10,2),
    conversion_rate DECIMAL(5,4),
    success_metrics JSONB DEFAULT '{}',
    statistical_significance DECIMAL(5,4),
    test_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    test_end_date TIMESTAMP WITH TIME ZONE,
    test_status VARCHAR(20) DEFAULT 'running' CHECK (test_status IN ('running', 'completed', 'paused', 'failed')),
    winner BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Resource Utilization Tracking
CREATE TABLE IF NOT EXISTS resource_utilization (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    workflow_id VARCHAR(255),
    execution_id VARCHAR(255),
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    network_io DECIMAL(10,2),
    storage_io DECIMAL(10,2),
    concurrent_executions INTEGER,
    queue_length INTEGER,
    resource_efficiency_score DECIMAL(5,2),
    bottlenecks TEXT[] DEFAULT '{}',
    optimization_opportunities TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_workflow_orchestration_configs_type ON workflow_orchestration_configs(type);
CREATE INDEX IF NOT EXISTS idx_workflow_orchestration_configs_priority ON workflow_orchestration_configs(priority);
CREATE INDEX IF NOT EXISTS idx_workflow_orchestration_configs_enabled ON workflow_orchestration_configs(enabled);

CREATE INDEX IF NOT EXISTS idx_master_workflow_executions_workflow_id ON master_workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_master_workflow_executions_status ON master_workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_master_workflow_executions_started_at ON master_workflow_executions(started_at);
CREATE INDEX IF NOT EXISTS idx_master_workflow_executions_execution_id ON master_workflow_executions(execution_id);

CREATE INDEX IF NOT EXISTS idx_cross_platform_learning_source ON cross_platform_learning(source_workflow);
CREATE INDEX IF NOT EXISTS idx_cross_platform_learning_confidence ON cross_platform_learning(confidence);
CREATE INDEX IF NOT EXISTS idx_cross_platform_learning_active ON cross_platform_learning(active);

CREATE INDEX IF NOT EXISTS idx_optimization_feedback_workflow_id ON optimization_feedback(workflow_id);
CREATE INDEX IF NOT EXISTS idx_optimization_feedback_implemented ON optimization_feedback(implemented);
CREATE INDEX IF NOT EXISTS idx_optimization_feedback_priority ON optimization_feedback(priority_score);

CREATE INDEX IF NOT EXISTS idx_intelligent_scheduling_workflow_id ON intelligent_scheduling(workflow_id);
CREATE INDEX IF NOT EXISTS idx_intelligent_scheduling_suggested_time ON intelligent_scheduling(suggested_time);
CREATE INDEX IF NOT EXISTS idx_intelligent_scheduling_applied ON intelligent_scheduling(applied);

CREATE INDEX IF NOT EXISTS idx_ml_model_metrics_model_id ON ml_model_metrics(model_id);
CREATE INDEX IF NOT EXISTS idx_ml_model_metrics_workflow_id ON ml_model_metrics(workflow_id);
CREATE INDEX IF NOT EXISTS idx_ml_model_metrics_drift ON ml_model_metrics(drift_detected);
CREATE INDEX IF NOT EXISTS idx_ml_model_metrics_retraining_status ON ml_model_metrics(retraining_status);

CREATE INDEX IF NOT EXISTS idx_workflow_anomalies_workflow_id ON workflow_anomalies(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_anomalies_detected_at ON workflow_anomalies(detected_at);
CREATE INDEX IF NOT EXISTS idx_workflow_anomalies_severity ON workflow_anomalies(severity);
CREATE INDEX IF NOT EXISTS idx_workflow_anomalies_resolved ON workflow_anomalies(resolved);

CREATE INDEX IF NOT EXISTS idx_workflow_dependencies_workflow_id ON workflow_dependencies(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_dependencies_depends_on ON workflow_dependencies(depends_on_workflow_id);

CREATE INDEX IF NOT EXISTS idx_workflow_ab_testing_workflow_id ON workflow_ab_testing(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_ab_testing_test_name ON workflow_ab_testing(test_name);
CREATE INDEX IF NOT EXISTS idx_workflow_ab_testing_status ON workflow_ab_testing(test_status);

CREATE INDEX IF NOT EXISTS idx_resource_utilization_timestamp ON resource_utilization(timestamp);
CREATE INDEX IF NOT EXISTS idx_resource_utilization_workflow_id ON resource_utilization(workflow_id);
CREATE INDEX IF NOT EXISTS idx_resource_utilization_execution_id ON resource_utilization(execution_id);

-- Insert sample workflow configurations for existing workflows
INSERT INTO workflow_orchestration_configs (id, name, type, priority, ai_config, enabled) VALUES
('PostBuilder', 'Post Builder Workflow', 'content_creation', 'high', 
 '{"modelType": "gpt-4", "learningEnabled": true, "optimizationTarget": "engagement", "feedbackLoop": true}', true),
('CarouselBuilder', 'Carousel Builder Workflow', 'content_creation', 'high',
 '{"modelType": "gpt-4", "learningEnabled": true, "optimizationTarget": "completion_rate", "feedbackLoop": true}', true),
('ReelBuilder', 'Reel Builder Workflow', 'content_creation', 'high',
 '{"modelType": "gpt-4", "learningEnabled": true, "optimizationTarget": "virality", "feedbackLoop": true}', true),
('StoryBuilder', 'Story Builder Workflow', 'content_creation', 'medium',
 '{"modelType": "gpt-4", "learningEnabled": true, "optimizationTarget": "retention", "feedbackLoop": true}', true),
('MarketingManager', 'Marketing Manager AI Agent', 'ai_agent', 'critical',
 '{"modelType": "gpt-4", "learningEnabled": true, "optimizationTarget": "strategy_effectiveness", "feedbackLoop": true}', true),
('ML_Auto_Retraining_Workflow', 'ML Auto Retraining Pipeline', 'ml_pipeline', 'medium',
 '{"modelType": "ensemble", "learningEnabled": true, "optimizationTarget": "model_accuracy", "feedbackLoop": true}', true),
('Competitor_Monitoring_Workflow', 'Competitor Monitoring Analytics', 'analytics', 'medium',
 '{"modelType": "gpt-4", "learningEnabled": true, "optimizationTarget": "insight_quality", "feedbackLoop": true}', true),
('fortune500-ai-agent-workflow', 'Fortune 500 AI Agent Ensemble', 'ai_agent', 'critical',
 '{"modelType": "ensemble", "learningEnabled": true, "optimizationTarget": "decision_accuracy", "feedbackLoop": true}', true)
ON CONFLICT (id) DO UPDATE SET
    ai_config = EXCLUDED.ai_config,
    updated_at = NOW();

-- Insert sample ML model metrics
INSERT INTO ml_model_metrics (model_id, model_name, workflow_id, accuracy, latency_ms, throughput, error_rate, last_retrained, next_retraining_due) VALUES
('content_engagement_model', 'Content Engagement Predictor', 'PostBuilder', 0.8945, 125.5, 850.0, 0.0234, NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days'),
('timing_optimization_model', 'Optimal Timing Model', 'MarketingManager', 0.9124, 89.2, 1200.0, 0.0156, NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days'),
('content_quality_model', 'Content Quality Analyzer', 'CarouselBuilder', 0.8876, 156.8, 650.0, 0.0289, NOW() - INTERVAL '8 days', NOW() + INTERVAL '22 days'),
('anomaly_detection_model', 'Workflow Anomaly Detector', 'ML_Auto_Retraining_Workflow', 0.9256, 45.3, 2100.0, 0.0123, NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days'),
('competitor_analysis_model', 'Competitor Intelligence Model', 'Competitor_Monitoring_Workflow', 0.8734, 234.7, 420.0, 0.0345, NOW() - INTERVAL '6 days', NOW() + INTERVAL '24 days')
ON CONFLICT (model_id) DO UPDATE SET
    accuracy = EXCLUDED.accuracy,
    latency_ms = EXCLUDED.latency_ms,
    throughput = EXCLUDED.throughput,
    error_rate = EXCLUDED.error_rate,
    updated_at = NOW();

-- Insert sample cross-platform learning patterns
INSERT INTO cross_platform_learning (source_workflow, target_workflows, learning_pattern, confidence, performance_improvement, metrics) VALUES
('MarketingManager', ARRAY['PostBuilder', 'CarouselBuilder', 'ReelBuilder'], 'Optimal posting times increase engagement by 24%', 0.92, 24.1, '{"engagement_rate": 1.24, "click_through_rate": 1.18, "conversion_rate": 1.09}'),
('PostBuilder', ARRAY['CarouselBuilder', 'StoryBuilder'], 'Visual consistency patterns improve brand recognition', 0.87, 18.3, '{"brand_recall": 1.18, "visual_coherence": 1.23, "user_preference": 1.15}'),
('ML_Auto_Retraining_Workflow', ARRAY['PostBuilder', 'CarouselBuilder', 'ReelBuilder', 'MarketingManager'], 'Ensemble models reduce prediction variance by 15%', 0.91, 15.7, '{"prediction_accuracy": 1.16, "variance_reduction": 0.85, "confidence_increase": 1.12}'),
('Competitor_Monitoring_Workflow', ARRAY['MarketingManager', 'PostBuilder'], 'Competitive timing analysis improves market positioning', 0.84, 12.4, '{"market_share": 1.12, "competitive_advantage": 1.08, "timing_accuracy": 1.15}')
ON CONFLICT DO NOTHING;

-- Create update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at columns
DO $$
DECLARE
    table_name TEXT;
    tables TEXT[] := ARRAY[
        'workflow_orchestration_configs',
        'master_workflow_executions', 
        'cross_platform_learning',
        'optimization_feedback',
        'intelligent_scheduling',
        'ml_model_metrics',
        'workflow_anomalies',
        'workflow_ab_testing'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
            CREATE TRIGGER update_%I_updated_at 
                BEFORE UPDATE ON %I 
                FOR EACH ROW 
                EXECUTE FUNCTION update_updated_at_column();
        ', table_name, table_name, table_name, table_name);
    END LOOP;
END $$;

-- Add comments for documentation
COMMENT ON TABLE workflow_orchestration_configs IS 'Configuration for AI/ML workflow orchestration with learning and optimization settings';
COMMENT ON TABLE master_workflow_executions IS 'Execution records for workflows managed by the Master Controller with optimization tracking';
COMMENT ON TABLE cross_platform_learning IS 'Cross-platform learning patterns discovered and applied across workflows';
COMMENT ON TABLE optimization_feedback IS 'Optimization suggestions and implementation tracking for workflow improvements';
COMMENT ON TABLE intelligent_scheduling IS 'Intelligent scheduling decisions and resource optimization for workflows';
COMMENT ON TABLE ml_model_metrics IS 'Performance metrics and retraining schedule for ML models in workflows';
COMMENT ON TABLE workflow_anomalies IS 'Detected anomalies in workflow behavior, performance, and data patterns';
COMMENT ON TABLE workflow_dependencies IS 'Dependency relationships between workflows for proper execution ordering';
COMMENT ON TABLE workflow_ab_testing IS 'A/B testing results for workflow variants and optimization experiments';
COMMENT ON TABLE resource_utilization IS 'Real-time resource utilization tracking and optimization opportunities'; 