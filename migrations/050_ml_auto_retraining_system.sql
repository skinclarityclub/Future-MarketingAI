-- Migration: ML Auto-Retraining System
-- Task 71.5: Database schema voor automatische ML model retraining en deployment

-- ML Training Jobs Table
CREATE TABLE IF NOT EXISTS ml_training_jobs (
  id BIGSERIAL PRIMARY KEY,
  job_id TEXT UNIQUE NOT NULL,
  workflow_id TEXT,
  job_type TEXT NOT NULL DEFAULT 'auto_retraining',
  model_types TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'validation_pending')),
  performance_improvement DECIMAL(5,4) DEFAULT 0.0,
  training_data_size INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Indexing
  CONSTRAINT valid_training_data_size CHECK (training_data_size >= 0),
  CONSTRAINT valid_performance_improvement CHECK (performance_improvement >= -1.0 AND performance_improvement <= 1.0)
);

-- ML Models Registry
CREATE TABLE IF NOT EXISTS ml_models (
  id BIGSERIAL PRIMARY KEY,
  model_id TEXT UNIQUE NOT NULL,
  model_name TEXT NOT NULL,
  model_type TEXT NOT NULL,
  model_version TEXT NOT NULL,
  model_path TEXT,
  status TEXT NOT NULL DEFAULT 'training' CHECK (status IN ('training', 'validation', 'deployed', 'archived', 'failed')),
  accuracy DECIMAL(5,4),
  precision_score DECIMAL(5,4),
  recall_score DECIMAL(5,4),
  f1_score DECIMAL(5,4),
  training_data_size INTEGER DEFAULT 0,
  validation_metrics JSONB DEFAULT '{}',
  deployment_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deployed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_by TEXT DEFAULT 'system',
  
  -- Constraints
  CONSTRAINT valid_accuracy CHECK (accuracy >= 0.0 AND accuracy <= 1.0),
  CONSTRAINT valid_precision CHECK (precision_score >= 0.0 AND precision_score <= 1.0),
  CONSTRAINT valid_recall CHECK (recall_score >= 0.0 AND recall_score <= 1.0),
  CONSTRAINT valid_f1 CHECK (f1_score >= 0.0 AND f1_score <= 1.0)
);

-- ML Model Deployments
CREATE TABLE IF NOT EXISTS ml_model_deployments (
  id BIGSERIAL PRIMARY KEY,
  model_id TEXT NOT NULL,
  model_version TEXT NOT NULL,
  deployment_id TEXT UNIQUE NOT NULL DEFAULT 'deploy_' || extract(epoch FROM NOW())::bigint || '_' || substring(md5(random()::text) from 1 for 8),
  deployment_status TEXT NOT NULL DEFAULT 'pending' CHECK (deployment_status IN ('pending', 'deploying', 'deployed', 'failed', 'rollback')),
  deployment_strategy TEXT DEFAULT 'blue_green',
  deployed_at TIMESTAMPTZ,
  rollback_at TIMESTAMPTZ,
  health_check_status TEXT DEFAULT 'pending' CHECK (health_check_status IN ('pending', 'passed', 'failed')),
  deployment_config JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign key constraint
  FOREIGN KEY (model_id) REFERENCES ml_models(model_id) ON DELETE CASCADE
);

-- ML Retraining Schedules
CREATE TABLE IF NOT EXISTS ml_retraining_schedules (
  id BIGSERIAL PRIMARY KEY,
  schedule_id TEXT UNIQUE NOT NULL,
  workflow_id TEXT,
  schedule_type TEXT NOT NULL DEFAULT 'performance_based' CHECK (schedule_type IN ('performance_based', 'time_based', 'data_based')),
  schedule_config JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'disabled')),
  next_execution TIMESTAMPTZ,
  last_execution TIMESTAMPTZ,
  execution_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ML Performance Metrics History
CREATE TABLE IF NOT EXISTS ml_performance_metrics (
  id BIGSERIAL PRIMARY KEY,
  model_id TEXT NOT NULL,
  model_version TEXT,
  metric_type TEXT NOT NULL,
  metric_value DECIMAL(10,6) NOT NULL,
  metric_context JSONB DEFAULT '{}',
  measured_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign key constraint
  FOREIGN KEY (model_id) REFERENCES ml_models(model_id) ON DELETE CASCADE
);

-- ML Training Data Quality Metrics
CREATE TABLE IF NOT EXISTS ml_training_data_quality (
  id BIGSERIAL PRIMARY KEY,
  job_id TEXT NOT NULL,
  data_source TEXT NOT NULL,
  data_size INTEGER NOT NULL DEFAULT 0,
  quality_score DECIMAL(5,4) DEFAULT 0.0,
  completeness_score DECIMAL(5,4) DEFAULT 0.0,
  consistency_score DECIMAL(5,4) DEFAULT 0.0,
  freshness_score DECIMAL(5,4) DEFAULT 0.0,
  quality_issues JSONB DEFAULT '{}',
  quality_report JSONB DEFAULT '{}',
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign key constraint
  FOREIGN KEY (job_id) REFERENCES ml_training_jobs(job_id) ON DELETE CASCADE,
  
  -- Constraints
  CONSTRAINT valid_quality_score CHECK (quality_score >= 0.0 AND quality_score <= 1.0),
  CONSTRAINT valid_completeness CHECK (completeness_score >= 0.0 AND completeness_score <= 1.0),
  CONSTRAINT valid_consistency CHECK (consistency_score >= 0.0 AND consistency_score <= 1.0),
  CONSTRAINT valid_freshness CHECK (freshness_score >= 0.0 AND freshness_score <= 1.0)
);

-- Workflow Audit Logs
CREATE TABLE IF NOT EXISTS workflow_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  execution_id TEXT,
  workflow_type TEXT NOT NULL,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL,
  duration_ms BIGINT DEFAULT 0,
  model_data JSONB DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  workflow_context JSONB DEFAULT '{}',
  audit_info JSONB DEFAULT '{}',
  notifications JSONB DEFAULT '{}',
  error_info JSONB DEFAULT '{}',
  log_entry JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_ml_training_jobs_status ON ml_training_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ml_training_jobs_created_at ON ml_training_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ml_training_jobs_workflow_id ON ml_training_jobs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_ml_models_status ON ml_models(status);
CREATE INDEX IF NOT EXISTS idx_ml_models_type ON ml_models(model_type);
CREATE INDEX IF NOT EXISTS idx_ml_models_deployed_at ON ml_models(deployed_at DESC);
CREATE INDEX IF NOT EXISTS idx_ml_model_deployments_status ON ml_model_deployments(deployment_status);
CREATE INDEX IF NOT EXISTS idx_ml_model_deployments_model_id ON ml_model_deployments(model_id);
CREATE INDEX IF NOT EXISTS idx_ml_retraining_schedules_next_execution ON ml_retraining_schedules(next_execution);
CREATE INDEX IF NOT EXISTS idx_ml_retraining_schedules_status ON ml_retraining_schedules(status);
CREATE INDEX IF NOT EXISTS idx_ml_performance_metrics_model_id ON ml_performance_metrics(model_id);
CREATE INDEX IF NOT EXISTS idx_ml_performance_metrics_measured_at ON ml_performance_metrics(measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_audit_logs_workflow_id ON workflow_audit_logs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_audit_logs_created_at ON workflow_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_audit_logs_event_type ON workflow_audit_logs(event_type);

-- Functions for Automatic Updates
CREATE OR REPLACE FUNCTION update_ml_training_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_ml_retraining_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_update_ml_retraining_schedules_updated_at
  BEFORE UPDATE ON ml_retraining_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_ml_retraining_schedules_updated_at();

-- Helper Functions

-- Get Model Performance Summary
CREATE OR REPLACE FUNCTION get_model_performance_summary(p_model_id TEXT, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  model_id TEXT,
  current_accuracy DECIMAL,
  avg_accuracy DECIMAL,
  accuracy_trend TEXT,
  total_deployments BIGINT,
  last_deployment TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.model_id,
    m.accuracy as current_accuracy,
    COALESCE(AVG(pm.metric_value), 0)::DECIMAL as avg_accuracy,
    CASE 
      WHEN m.accuracy > COALESCE(AVG(pm.metric_value), 0) THEN 'improving'
      WHEN m.accuracy < COALESCE(AVG(pm.metric_value), 0) THEN 'declining'
      ELSE 'stable'
    END as accuracy_trend,
    COUNT(DISTINCT md.deployment_id) as total_deployments,
    MAX(md.deployed_at) as last_deployment
  FROM ml_models m
  LEFT JOIN ml_performance_metrics pm ON m.model_id = pm.model_id 
    AND pm.metric_type = 'accuracy' 
    AND pm.measured_at >= NOW() - INTERVAL '1 day' * p_days
  LEFT JOIN ml_model_deployments md ON m.model_id = md.model_id
  WHERE m.model_id = p_model_id
  GROUP BY m.model_id, m.accuracy;
END;
$$ LANGUAGE plpgsql;

-- Get Training Job Statistics
CREATE OR REPLACE FUNCTION get_training_job_stats(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  total_jobs BIGINT,
  successful_jobs BIGINT,
  failed_jobs BIGINT,
  success_rate DECIMAL,
  avg_improvement DECIMAL,
  avg_training_time_minutes DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_jobs,
    COUNT(*) FILTER (WHERE status = 'completed') as successful_jobs,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_jobs,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / COUNT(*)::DECIMAL) * 100
      ELSE 0
    END as success_rate,
    COALESCE(AVG(performance_improvement) FILTER (WHERE status = 'completed'), 0)::DECIMAL as avg_improvement,
    COALESCE(AVG(EXTRACT(EPOCH FROM (completed_at - started_at))/60) FILTER (WHERE status = 'completed'), 0)::DECIMAL as avg_training_time_minutes
  FROM ml_training_jobs
  WHERE created_at >= NOW() - INTERVAL '1 day' * p_days;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing
INSERT INTO ml_models (model_id, model_name, model_type, model_version, status, accuracy, precision_score, recall_score, f1_score) VALUES
('content_performance_v1', 'Content Performance Predictor', 'content_performance', 'v1.0.0', 'deployed', 0.85, 0.82, 0.87, 0.84),
('engagement_prediction_v1', 'Engagement Prediction Model', 'engagement_prediction', 'v1.0.0', 'deployed', 0.78, 0.75, 0.81, 0.78),
('hashtag_effectiveness_v1', 'Hashtag Effectiveness Model', 'hashtag_effectiveness', 'v1.0.0', 'validation', 0.72, 0.69, 0.75, 0.72)
ON CONFLICT (model_id) DO NOTHING;

-- Insert sample training jobs
INSERT INTO ml_training_jobs (job_id, workflow_id, job_type, model_types, status, performance_improvement, training_data_size) VALUES
('retraining_' || extract(epoch FROM NOW())::bigint, 'workflow_001', 'auto_retraining', ARRAY['content_performance'], 'completed', 0.03, 1500),
('retraining_' || (extract(epoch FROM NOW())::bigint - 86400), 'workflow_002', 'auto_retraining', ARRAY['engagement_prediction'], 'completed', 0.02, 1200)
ON CONFLICT (job_id) DO NOTHING;

-- Insert sample retraining schedule
INSERT INTO ml_retraining_schedules (schedule_id, workflow_id, schedule_type, schedule_config, next_execution) VALUES
('schedule_' || extract(epoch FROM NOW())::bigint, 'workflow_001', 'performance_based', '{"threshold": 0.03, "check_interval": "daily"}', NOW() + INTERVAL '1 day')
ON CONFLICT (schedule_id) DO NOTHING;

-- Row Level Security (RLS) Policies
ALTER TABLE ml_training_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_model_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_retraining_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_training_data_quality ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_audit_logs ENABLE ROW LEVEL SECURITY;

-- Basic read access policy for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON ml_training_jobs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON ml_models FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON ml_model_deployments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON ml_retraining_schedules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON ml_performance_metrics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON ml_training_data_quality FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON workflow_audit_logs FOR SELECT USING (auth.role() = 'authenticated');

-- System write access policies
CREATE POLICY "Enable insert for system" ON ml_training_jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for system" ON ml_training_jobs FOR UPDATE USING (true);
CREATE POLICY "Enable insert for system" ON ml_models FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for system" ON ml_models FOR UPDATE USING (true);
CREATE POLICY "Enable insert for system" ON ml_model_deployments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for system" ON ml_model_deployments FOR UPDATE USING (true);
CREATE POLICY "Enable insert for system" ON ml_retraining_schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for system" ON ml_retraining_schedules FOR UPDATE USING (true);
CREATE POLICY "Enable insert for system" ON ml_performance_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for system" ON ml_training_data_quality FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for system" ON workflow_audit_logs FOR INSERT WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE ml_training_jobs IS 'Tracks ML model retraining jobs and their status';
COMMENT ON TABLE ml_models IS 'Registry of ML models with their versions and performance metrics';
COMMENT ON TABLE ml_model_deployments IS 'Tracks model deployment history and status';
COMMENT ON TABLE ml_retraining_schedules IS 'Automated retraining schedules and configurations';
COMMENT ON TABLE ml_performance_metrics IS 'Historical performance metrics for ML models';
COMMENT ON TABLE ml_training_data_quality IS 'Data quality metrics for training datasets';
COMMENT ON TABLE workflow_audit_logs IS 'Comprehensive audit logs for workflow executions';

COMMENT ON FUNCTION get_model_performance_summary IS 'Get performance summary for a specific model';
COMMENT ON FUNCTION get_training_job_stats IS 'Get statistics for training jobs over a specified period'; 