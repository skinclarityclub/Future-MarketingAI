-- Navigation & UX Data Seeding Database Migration
-- Generated on: 2025-01-24T00:00:01.000Z
-- Task 74.3: Database schemas voor Navigation & UX data opslag
-- SAFE VERSION: Handles all existing tables and conflicts

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Helper function voor updating processed_at timestamps
CREATE OR REPLACE FUNCTION update_processed_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.processed_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create user_events table
-- Primary storage voor alle user interaction events (clicks, scrolls, page views, etc.)
CREATE TABLE IF NOT EXISTS user_events (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  page_url TEXT NOT NULL,
  page_title TEXT,
  element_selector TEXT,
  element_text TEXT,
  viewport_width INTEGER,
  viewport_height INTEGER,
  scroll_depth DECIMAL(5,2),
  time_on_page INTEGER,
  referrer_url TEXT,
  user_agent TEXT,
  device_type VARCHAR(20),
  browser_name VARCHAR(50),
  operating_system VARCHAR(50),
  geo_country VARCHAR(2),
  geo_city VARCHAR(100),
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  custom_properties JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Safe constraint additions for user_events
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pk_user_events' OR conname = 'user_events_pkey') THEN
    ALTER TABLE user_events ADD CONSTRAINT pk_user_events PRIMARY KEY (id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_events_user_id') THEN
      ALTER TABLE user_events ADD CONSTRAINT fk_user_events_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_user_events_event_type') THEN
    ALTER TABLE user_events ADD CONSTRAINT chk_user_events_event_type CHECK (event_type IN ('click', 'scroll', 'page_view', 'hover', 'form_submit', 'search', 'download', 'video_play', 'video_pause'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_user_events_scroll_depth') THEN
    ALTER TABLE user_events ADD CONSTRAINT chk_user_events_scroll_depth CHECK (scroll_depth >= 0 AND scroll_depth <= 100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_user_events_viewport_dimensions') THEN
    ALTER TABLE user_events ADD CONSTRAINT chk_user_events_viewport_dimensions CHECK (viewport_width > 0 AND viewport_height > 0);
  END IF;
END $$;

-- Safe index creation for user_events
CREATE INDEX IF NOT EXISTS idx_user_events_user_timestamp ON user_events (user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_user_events_session_timestamp ON user_events (session_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_user_events_page_timestamp ON user_events (page_url, timestamp);
CREATE INDEX IF NOT EXISTS idx_user_events_event_type_timestamp ON user_events (event_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_user_events_timestamp_only ON user_events (timestamp);
CREATE INDEX IF NOT EXISTS idx_user_events_custom_properties ON user_events USING gin (custom_properties);

-- Create performance_metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id VARCHAR(255) NOT NULL,
  page_url TEXT NOT NULL,
  navigation_type VARCHAR(20),
  largest_contentful_paint DECIMAL(10,2),
  first_input_delay DECIMAL(10,2),
  cumulative_layout_shift DECIMAL(8,4),
  first_contentful_paint DECIMAL(10,2),
  time_to_first_byte DECIMAL(10,2),
  dom_content_loaded DECIMAL(10,2),
  window_load DECIMAL(10,2),
  performance_score INTEGER,
  performance_grade VARCHAR(1),
  device_memory DECIMAL(4,1),
  connection_type VARCHAR(20),
  connection_rtt INTEGER,
  connection_downlink DECIMAL(6,2),
  resource_timings JSONB DEFAULT '{}'::jsonb,
  custom_metrics JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Safe constraint additions for performance_metrics
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pk_performance_metrics' OR conname = 'performance_metrics_pkey') THEN
    ALTER TABLE performance_metrics ADD CONSTRAINT pk_performance_metrics PRIMARY KEY (id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_performance_score_range') THEN
    ALTER TABLE performance_metrics ADD CONSTRAINT chk_performance_score_range CHECK (performance_score >= 0 AND performance_score <= 100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_performance_grade_valid') THEN
    ALTER TABLE performance_metrics ADD CONSTRAINT chk_performance_grade_valid CHECK (performance_grade IN ('A', 'B', 'C', 'D', 'F'));
  END IF;
END $$;

-- Safe index creation for performance_metrics
CREATE INDEX IF NOT EXISTS idx_performance_metrics_page_timestamp ON performance_metrics (page_url, timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_score_timestamp ON performance_metrics (performance_score, timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_lcp ON performance_metrics (largest_contentful_paint) WHERE largest_contentful_paint IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_performance_metrics_jsonb ON performance_metrics USING gin (resource_timings, custom_metrics);

-- Create experiment_results table
CREATE TABLE IF NOT EXISTS experiment_results (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  experiment_id VARCHAR(100) NOT NULL,
  experiment_name VARCHAR(255) NOT NULL,
  variant_id VARCHAR(50) NOT NULL,
  user_id UUID,
  session_id VARCHAR(255) NOT NULL,
  assignment_timestamp TIMESTAMPTZ NOT NULL,
  conversion_event VARCHAR(100),
  conversion_timestamp TIMESTAMPTZ,
  conversion_value DECIMAL(10,2),
  time_to_conversion INTEGER,
  page_url TEXT,
  custom_attributes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safe constraint additions for experiment_results
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pk_experiment_results' OR conname = 'experiment_results_pkey') THEN
    ALTER TABLE experiment_results ADD CONSTRAINT pk_experiment_results PRIMARY KEY (id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_experiment_results_user_experiment') THEN
    ALTER TABLE experiment_results ADD CONSTRAINT uq_experiment_results_user_experiment UNIQUE (user_id, experiment_id);
  END IF;
END $$;

-- Safe index creation for experiment_results
CREATE INDEX IF NOT EXISTS idx_experiment_results_experiment_variant ON experiment_results (experiment_id, variant_id);
CREATE INDEX IF NOT EXISTS idx_experiment_results_user_experiment ON experiment_results (user_id, experiment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_results_conversion_timestamp ON experiment_results (conversion_timestamp) WHERE conversion_timestamp IS NOT NULL;

-- Handle user_sessions table (may already exist)
DO $$
BEGIN
  -- Check if table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_sessions' AND table_schema = 'public') THEN
    -- Create new table
    CREATE TABLE user_sessions (
      id UUID NOT NULL DEFAULT gen_random_uuid(),
      session_id VARCHAR(255) NOT NULL UNIQUE,
      user_id UUID,
      start_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      end_timestamp TIMESTAMPTZ,
      duration_seconds INTEGER,
      page_views_count INTEGER DEFAULT 0,
      events_count INTEGER DEFAULT 0,
      bounce_rate DECIMAL(5,2),
      entry_page TEXT,
      exit_page TEXT,
      device_info JSONB DEFAULT '{}'::jsonb,
      geo_info JSONB DEFAULT '{}'::jsonb,
      utm_data JSONB DEFAULT '{}'::jsonb,
      custom_attributes JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    -- Add primary key safely
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pk_user_sessions' OR conname = 'user_sessions_pkey') THEN
      ALTER TABLE user_sessions ADD CONSTRAINT pk_user_sessions PRIMARY KEY (id);
    END IF;
  ELSE
    -- Table exists, add missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'device_info') THEN
      ALTER TABLE user_sessions ADD COLUMN device_info JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'geo_info') THEN
      ALTER TABLE user_sessions ADD COLUMN geo_info JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'utm_data') THEN
      ALTER TABLE user_sessions ADD COLUMN utm_data JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'custom_attributes') THEN
      ALTER TABLE user_sessions ADD COLUMN custom_attributes JSONB DEFAULT '{}'::jsonb;
    END IF;
  END IF;
  
  -- Add foreign key if needed
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_sessions_user_id') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'user_id') THEN
        ALTER TABLE user_sessions ADD CONSTRAINT fk_user_sessions_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END IF;
  END IF;
END $$;

-- Safe index creation for user_sessions (conditional based on existing columns)
DO $$
BEGIN
  -- Only create indexes if the columns exist
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'start_timestamp') THEN
    CREATE INDEX IF NOT EXISTS idx_user_sessions_user_timestamp ON user_sessions (user_id, start_timestamp);
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'created_at') THEN
    CREATE INDEX IF NOT EXISTS idx_user_sessions_user_timestamp ON user_sessions (user_id, created_at);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'session_id') THEN
    CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions (session_id);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'duration_seconds') THEN
    CREATE INDEX IF NOT EXISTS idx_user_sessions_duration ON user_sessions (duration_seconds) WHERE duration_seconds IS NOT NULL;
  END IF;
END $$;

-- Navigation Paths Table
CREATE TABLE IF NOT EXISTS navigation_paths (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) NOT NULL,
  user_id UUID,
  path_sequence INTEGER NOT NULL,
  from_page TEXT,
  to_page TEXT NOT NULL,
  navigation_method VARCHAR(50),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  time_spent_seconds INTEGER,
  custom_attributes JSONB DEFAULT '{}'::jsonb
);

-- Safe constraint additions for navigation_paths
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pk_navigation_paths' OR conname = 'navigation_paths_pkey') THEN
    ALTER TABLE navigation_paths ADD CONSTRAINT pk_navigation_paths PRIMARY KEY (id);
  END IF;

  -- Only add foreign key if user_sessions table has session_id column
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'session_id') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_navigation_paths_session') THEN
      ALTER TABLE navigation_paths ADD CONSTRAINT fk_navigation_paths_session FOREIGN KEY (session_id) REFERENCES user_sessions(session_id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Safe index creation for navigation_paths
CREATE INDEX IF NOT EXISTS idx_navigation_paths_session_sequence ON navigation_paths (session_id, path_sequence);
CREATE INDEX IF NOT EXISTS idx_navigation_paths_from_to ON navigation_paths (from_page, to_page);
CREATE INDEX IF NOT EXISTS idx_navigation_paths_timestamp ON navigation_paths (timestamp);

-- Feature Usage Analytics Table
CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id VARCHAR(255) NOT NULL,
  feature_name VARCHAR(100) NOT NULL,
  feature_category VARCHAR(50),
  action_type VARCHAR(50) NOT NULL,
  page_context TEXT,
  element_selector TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  usage_count INTEGER DEFAULT 1,
  first_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_duration_ms INTEGER,
  custom_properties JSONB DEFAULT '{}'::jsonb
);

-- Safe constraint additions for feature_usage
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pk_feature_usage' OR conname = 'feature_usage_pkey') THEN
    ALTER TABLE feature_usage ADD CONSTRAINT pk_feature_usage PRIMARY KEY (id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_feature_usage_user_id') THEN
      ALTER TABLE feature_usage ADD CONSTRAINT fk_feature_usage_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
  END IF;
END $$;

-- Safe index creation for feature_usage
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature_timestamp ON feature_usage (feature_name, last_used_at);
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_feature ON feature_usage (user_id, feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_usage_success ON feature_usage (success, feature_name);

-- ML Training Data Table
CREATE TABLE IF NOT EXISTS ml_training_data (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  data_type VARCHAR(50) NOT NULL,
  data_source VARCHAR(100) NOT NULL,
  features JSONB NOT NULL,
  labels JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  training_set BOOLEAN DEFAULT true,
  validation_set BOOLEAN DEFAULT false,
  test_set BOOLEAN DEFAULT false,
  quality_score DECIMAL(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safe constraint additions for ml_training_data
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pk_ml_training_data' OR conname = 'ml_training_data_pkey') THEN
    ALTER TABLE ml_training_data ADD CONSTRAINT pk_ml_training_data PRIMARY KEY (id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_ml_quality_score') THEN
    ALTER TABLE ml_training_data ADD CONSTRAINT chk_ml_quality_score CHECK (quality_score >= 0 AND quality_score <= 100);
  END IF;
END $$;

-- Safe index creation for ml_training_data
CREATE INDEX IF NOT EXISTS idx_ml_training_data_type_source ON ml_training_data (data_type, data_source);
CREATE INDEX IF NOT EXISTS idx_ml_training_data_sets ON ml_training_data (training_set, validation_set, test_set);
CREATE INDEX IF NOT EXISTS idx_ml_training_data_quality ON ml_training_data (quality_score) WHERE quality_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ml_training_data_features ON ml_training_data USING gin (features);

-- Pipeline Errors Table
CREATE TABLE IF NOT EXISTS pipeline_errors (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  error_id VARCHAR(100) NOT NULL,
  pipeline_id VARCHAR(100) NOT NULL,
  error_type VARCHAR(100) NOT NULL,
  error_category VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  resolved BOOLEAN DEFAULT false,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Safe constraint additions for pipeline_errors
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pk_pipeline_errors' OR conname = 'pipeline_errors_pkey') THEN
    ALTER TABLE pipeline_errors ADD CONSTRAINT pk_pipeline_errors PRIMARY KEY (id);
  END IF;

  -- Only add unique constraint if no duplicates exist
  IF NOT EXISTS (SELECT error_id FROM pipeline_errors GROUP BY error_id HAVING COUNT(*) > 1) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_pipeline_errors_error_id') THEN
      ALTER TABLE pipeline_errors ADD CONSTRAINT uq_pipeline_errors_error_id UNIQUE (error_id);
    END IF;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_pipeline_errors_severity') THEN
    ALTER TABLE pipeline_errors ADD CONSTRAINT chk_pipeline_errors_severity CHECK (severity IN ('low', 'medium', 'high', 'critical'));
  END IF;
END $$;

-- Safe index creation for pipeline_errors
CREATE INDEX IF NOT EXISTS idx_pipeline_errors_pipeline_timestamp ON pipeline_errors (pipeline_id, created_at);
CREATE INDEX IF NOT EXISTS idx_pipeline_errors_category_severity ON pipeline_errors (error_category, severity);
CREATE INDEX IF NOT EXISTS idx_pipeline_errors_resolved ON pipeline_errors (resolved, created_at);

-- Enable Row Level Security (safe operations)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'user_events' AND relrowsecurity = true) THEN
    ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'performance_metrics' AND relrowsecurity = true) THEN
    ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'experiment_results' AND relrowsecurity = true) THEN
    ALTER TABLE experiment_results ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'user_sessions' AND relrowsecurity = true) THEN
    ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'navigation_paths' AND relrowsecurity = true) THEN
    ALTER TABLE navigation_paths ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'feature_usage' AND relrowsecurity = true) THEN
    ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'ml_training_data' AND relrowsecurity = true) THEN
    ALTER TABLE ml_training_data ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'pipeline_errors' AND relrowsecurity = true) THEN
    ALTER TABLE pipeline_errors ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Safe policy creation (drop existing policies first to avoid conflicts)
DO $$
BEGIN
  -- User events policies
  DROP POLICY IF EXISTS user_events_select_policy ON user_events;
  DROP POLICY IF EXISTS user_events_insert_policy ON user_events;
  
  CREATE POLICY user_events_select_policy ON user_events FOR SELECT TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
  CREATE POLICY user_events_insert_policy ON user_events FOR INSERT TO authenticated, anon WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

  -- Performance metrics policies
  DROP POLICY IF EXISTS performance_metrics_select_policy ON performance_metrics;
  DROP POLICY IF EXISTS performance_metrics_insert_policy ON performance_metrics;
  
  CREATE POLICY performance_metrics_select_policy ON performance_metrics FOR SELECT TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
  CREATE POLICY performance_metrics_insert_policy ON performance_metrics FOR INSERT TO authenticated, anon WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

  -- Experiment results policies
  DROP POLICY IF EXISTS experiment_results_select_policy ON experiment_results;
  DROP POLICY IF EXISTS experiment_results_insert_policy ON experiment_results;
  
  CREATE POLICY experiment_results_select_policy ON experiment_results FOR SELECT TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
  CREATE POLICY experiment_results_insert_policy ON experiment_results FOR INSERT TO authenticated, anon WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

  -- User sessions policies
  DROP POLICY IF EXISTS user_sessions_select_policy ON user_sessions;
  DROP POLICY IF EXISTS user_sessions_insert_policy ON user_sessions;
  DROP POLICY IF EXISTS user_sessions_update_policy ON user_sessions;
  
  CREATE POLICY user_sessions_select_policy ON user_sessions FOR SELECT TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
  CREATE POLICY user_sessions_insert_policy ON user_sessions FOR INSERT TO authenticated, anon WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
  CREATE POLICY user_sessions_update_policy ON user_sessions FOR UPDATE TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);

  -- Navigation paths policies
  DROP POLICY IF EXISTS navigation_paths_select_policy ON navigation_paths;
  DROP POLICY IF EXISTS navigation_paths_insert_policy ON navigation_paths;
  
  CREATE POLICY navigation_paths_select_policy ON navigation_paths FOR SELECT TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
  CREATE POLICY navigation_paths_insert_policy ON navigation_paths FOR INSERT TO authenticated, anon WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

  -- Feature usage policies
  DROP POLICY IF EXISTS feature_usage_select_policy ON feature_usage;
  DROP POLICY IF EXISTS feature_usage_insert_policy ON feature_usage;
  DROP POLICY IF EXISTS feature_usage_update_policy ON feature_usage;
  
  CREATE POLICY feature_usage_select_policy ON feature_usage FOR SELECT TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
  CREATE POLICY feature_usage_insert_policy ON feature_usage FOR INSERT TO authenticated, anon WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
  CREATE POLICY feature_usage_update_policy ON feature_usage FOR UPDATE TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);

  -- ML training data policies (admin only)
  DROP POLICY IF EXISTS ml_training_data_select_policy ON ml_training_data;
  
  CREATE POLICY ml_training_data_select_policy ON ml_training_data FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

  -- Pipeline errors policies (admin only)
  DROP POLICY IF EXISTS pipeline_errors_select_policy ON pipeline_errors;
  
  CREATE POLICY pipeline_errors_select_policy ON pipeline_errors FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
END $$;

-- Safe trigger creation
DO $$
BEGIN
  -- Drop existing triggers to avoid conflicts
  DROP TRIGGER IF EXISTS tg_user_events_update_processed_at ON user_events;
  DROP TRIGGER IF EXISTS tg_performance_metrics_update_processed_at ON performance_metrics;
  
  CREATE TRIGGER tg_user_events_update_processed_at
    BEFORE UPDATE ON user_events
    FOR EACH ROW EXECUTE FUNCTION update_processed_at_column();

  CREATE TRIGGER tg_performance_metrics_update_processed_at
    BEFORE UPDATE ON performance_metrics
    FOR EACH ROW EXECUTE FUNCTION update_processed_at_column();
END $$;

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Safe trigger creation for updated_at
DO $$
BEGIN
  DROP TRIGGER IF EXISTS tg_experiment_results_update_updated_at ON experiment_results;
  DROP TRIGGER IF EXISTS tg_user_sessions_update_updated_at ON user_sessions;
  DROP TRIGGER IF EXISTS tg_ml_training_data_update_updated_at ON ml_training_data;
  
  CREATE TRIGGER tg_experiment_results_update_updated_at
    BEFORE UPDATE ON experiment_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER tg_user_sessions_update_updated_at
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER tg_ml_training_data_update_updated_at
    BEFORE UPDATE ON ml_training_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

-- Create views voor common analytics queries (safe creation)

-- User Engagement Summary View (based on new navigation data only)
CREATE OR REPLACE VIEW user_engagement_summary AS
SELECT 
  ue.user_id,
  ue.session_id,
  ue.timestamp::date as session_date,
  COUNT(ue.id) as total_interactions,
  AVG(pm.performance_score) as avg_performance_score,
  COUNT(DISTINCT np.to_page) as unique_pages_visited,
  MAX(fu.last_used_at) as last_feature_usage,
  COUNT(DISTINCT ue.page_url) as pages_visited,
  SUM(ue.time_on_page) as total_time_on_pages
FROM user_events ue
LEFT JOIN performance_metrics pm ON ue.session_id = pm.session_id
LEFT JOIN navigation_paths np ON ue.session_id = np.session_id
LEFT JOIN feature_usage fu ON ue.session_id = fu.session_id
GROUP BY ue.user_id, ue.session_id, ue.timestamp::date;

-- Performance Metrics Summary View
CREATE OR REPLACE VIEW performance_summary AS
SELECT 
  page_url,
  timestamp::date as metrics_date,
  COUNT(*) as total_measurements,
  AVG(largest_contentful_paint) as avg_lcp,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY largest_contentful_paint) as median_lcp,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY largest_contentful_paint) as p95_lcp,
  AVG(first_input_delay) as avg_fid,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY first_input_delay) as median_fid,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY first_input_delay) as p95_fid,
  AVG(cumulative_layout_shift) as avg_cls,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY cumulative_layout_shift) as p95_cls,
  AVG(performance_score) as avg_performance_score,
  COUNT(CASE WHEN performance_grade = 'A' THEN 1 END) as grade_a_count,
  COUNT(CASE WHEN performance_grade = 'B' THEN 1 END) as grade_b_count,
  COUNT(CASE WHEN performance_grade = 'C' THEN 1 END) as grade_c_count,
  COUNT(CASE WHEN performance_grade = 'D' THEN 1 END) as grade_d_count,
  COUNT(CASE WHEN performance_grade = 'F' THEN 1 END) as grade_f_count
FROM performance_metrics
WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY page_url, timestamp::date;

-- Popular Navigation Paths View
CREATE OR REPLACE VIEW popular_navigation_paths AS
SELECT 
  from_page,
  to_page,
  COUNT(*) as transition_count,
  AVG(time_spent_seconds) as avg_time_spent,
  COUNT(DISTINCT session_id) as unique_sessions,
  timestamp::date as path_date
FROM navigation_paths
WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
  AND from_page IS NOT NULL
GROUP BY from_page, to_page, timestamp::date
ORDER BY transition_count DESC;

-- Feature Usage Stats View
CREATE OR REPLACE VIEW feature_usage_stats AS
SELECT 
  feature_name,
  feature_category,
  action_type,
  COUNT(*) as total_usage,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions,
  AVG(total_duration_ms) as avg_duration_ms,
  SUM(CASE WHEN success THEN 1 ELSE 0 END)::float / COUNT(*) * 100 as success_rate,
  last_used_at::date as usage_date
FROM feature_usage
WHERE last_used_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY feature_name, feature_category, action_type, last_used_at::date
ORDER BY total_usage DESC;

-- Grant permissions voor views (safe operation)
DO $$
BEGIN
  GRANT SELECT ON user_engagement_summary TO authenticated;
  GRANT SELECT ON performance_summary TO authenticated;
  GRANT SELECT ON popular_navigation_paths TO authenticated;
  GRANT SELECT ON feature_usage_stats TO authenticated;
EXCEPTION
  WHEN insufficient_privilege THEN
    -- Ignore if we don't have permissions to grant
    NULL;
END $$;

-- Comments voor documentatie
COMMENT ON TABLE user_events IS 'Primary storage voor alle user interaction events - clicks, scrolls, page views, etc.';
COMMENT ON TABLE performance_metrics IS 'Core Web Vitals en performance optimization data storage';
COMMENT ON TABLE experiment_results IS 'A/B testing experiment assignments, conversions en statistical analysis';
COMMENT ON TABLE user_sessions IS 'Aggregated session data voor user behavior analysis';
COMMENT ON TABLE navigation_paths IS 'User navigation flow tussen paginas';
COMMENT ON TABLE feature_usage IS 'Feature adoption en usage analytics';
COMMENT ON TABLE ml_training_data IS 'Machine learning training datasets voor navigation optimization';
COMMENT ON TABLE pipeline_errors IS 'Error logging voor data processing pipelines';

COMMENT ON VIEW user_engagement_summary IS 'Aggregated user engagement metrics per session';
COMMENT ON VIEW performance_summary IS 'Daily performance metrics summary per page';
COMMENT ON VIEW popular_navigation_paths IS 'Most common navigation transitions';
COMMENT ON VIEW feature_usage_stats IS 'Feature adoption en success metrics';

-- Maintenance: Create function voor automated cleanup van oude data
CREATE OR REPLACE FUNCTION cleanup_old_navigation_data()
RETURNS void AS $$
BEGIN
  -- Clean up user_events older than 365 days
  DELETE FROM user_events WHERE timestamp < NOW() - INTERVAL '365 days';
  
  -- Clean up performance_metrics older than 180 days
  DELETE FROM performance_metrics WHERE timestamp < NOW() - INTERVAL '180 days';
  
  -- Clean up navigation_paths older than 90 days
  DELETE FROM navigation_paths WHERE timestamp < NOW() - INTERVAL '90 days';
  
  -- Clean up resolved pipeline_errors older than 30 days
  DELETE FROM pipeline_errors WHERE resolved = true AND resolved_at < NOW() - INTERVAL '30 days';
  
  -- Vacuum tables for performance
  VACUUM ANALYZE user_events;
  VACUUM ANALYZE performance_metrics;
  VACUUM ANALYZE navigation_paths;
  VACUUM ANALYZE pipeline_errors;
  
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup to run daily (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-navigation-data', '0 2 * * *', 'SELECT cleanup_old_navigation_data();');

-- Final verification message
DO $$
BEGIN
  RAISE NOTICE '✅ Navigation & UX Data Seeding Migration completed successfully!';
  RAISE NOTICE '📊 Tables created/updated: user_events, performance_metrics, experiment_results, user_sessions, navigation_paths, feature_usage, ml_training_data, pipeline_errors';
  RAISE NOTICE '👁️ Views created: user_engagement_summary, performance_summary, popular_navigation_paths, feature_usage_stats';
  RAISE NOTICE '🔒 Row Level Security enabled with appropriate policies';
  RAISE NOTICE '⚡ Indexes and triggers configured for optimal performance';
  RAISE NOTICE '🔄 Safe migration: handles existing tables and prevents conflicts';
END $$;