-- Quick Database Setup for ML Auto-Retraining System
-- Task 71.5: Execute this in your Supabase SQL Editor

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
  metadata JSONB DEFAULT '{}'
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
  training_data_size INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deployed_at TIMESTAMPTZ
);

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_ml_training_jobs_status ON ml_training_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ml_training_jobs_created_at ON ml_training_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ml_models_status ON ml_models(status);

-- Insert sample data for testing
INSERT INTO ml_models (model_id, model_name, model_type, model_version, status, accuracy) 
VALUES 
  ('content_performance_v1', 'Content Performance Model', 'content_performance', 'v1.0', 'deployed', 0.87),
  ('engagement_prediction_v1', 'Engagement Prediction Model', 'engagement_prediction', 'v1.0', 'deployed', 0.82),
  ('sentiment_analysis_v1', 'Sentiment Analysis Model', 'sentiment_analysis', 'v1.0', 'training', 0.75)
ON CONFLICT (model_id) DO NOTHING;

INSERT INTO ml_training_jobs (job_id, workflow_id, job_type, model_types, status, performance_improvement, training_data_size)
VALUES 
  ('training_001', 'auto_retrain_001', 'auto_retraining', ARRAY['content_performance'], 'completed', 0.05, 1500),
  ('training_002', 'auto_retrain_002', 'manual_retraining', ARRAY['engagement_prediction'], 'completed', 0.03, 1200),
  ('training_003', 'auto_retrain_003', 'auto_retraining', ARRAY['sentiment_analysis'], 'running', 0.0, 800)
ON CONFLICT (job_id) DO NOTHING; 