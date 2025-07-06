-- Navigation ML System Database Schema
-- Tables for machine learning navigation prediction system

-- ML Training Jobs Table
CREATE TABLE IF NOT EXISTS ml_training_jobs (
    id VARCHAR(255) PRIMARY KEY,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    model_config JSONB NOT NULL,  -- MLModelConfig
    data_range JSONB NOT NULL,    -- { start_date, end_date }
    metrics JSONB,                -- ModelPerformanceMetrics
    error_message TEXT,
    model_version VARCHAR(100) NOT NULL,
    training_duration INTEGER,    -- milliseconds
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ML Prediction Logs Table
CREATE TABLE IF NOT EXISTS ml_prediction_logs (
    id BIGSERIAL PRIMARY KEY,
    prediction_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    current_page VARCHAR(500) NOT NULL,
    predicted_pages JSONB NOT NULL,      -- Array of predicted page URLs
    confidence_scores JSONB NOT NULL,    -- Array of confidence scores
    model_version VARCHAR(100) NOT NULL,
    processing_time INTEGER NOT NULL,    -- milliseconds
    fallback_used BOOLEAN NOT NULL DEFAULT FALSE,
    user_segment VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_ml_prediction_session 
        FOREIGN KEY (session_id) REFERENCES user_sessions(id) ON DELETE CASCADE
);

-- Navigation Patterns Table
CREATE TABLE IF NOT EXISTS navigation_patterns (
    id BIGSERIAL PRIMARY KEY,
    pattern_id VARCHAR(255) UNIQUE NOT NULL,
    pattern_type VARCHAR(50) NOT NULL CHECK (pattern_type IN ('sequential', 'cyclical', 'branching', 'converging')),
    pages JSONB NOT NULL,              -- Array of page URLs
    frequency INTEGER NOT NULL,
    average_duration INTEGER NOT NULL, -- seconds
    user_segments JSONB,              -- Array of user segment IDs
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Segments Table
CREATE TABLE IF NOT EXISTS user_segments (
    id BIGSERIAL PRIMARY KEY,
    segment_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    criteria JSONB NOT NULL,           -- UserSegment criteria
    navigation_preferences JSONB NOT NULL,  -- UserSegment navigation_preferences
    model_performance JSONB NOT NULL, -- accuracy, sample_size
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Segment Assignments Table
CREATE TABLE IF NOT EXISTS user_segment_assignments (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    segment_id VARCHAR(255) NOT NULL,
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    
    -- Unique constraint to prevent duplicate assignments
    UNIQUE(user_id, segment_id),
    
    -- Foreign key constraint
    CONSTRAINT fk_user_segment_assignment
        FOREIGN KEY (segment_id) REFERENCES user_segments(segment_id) ON DELETE CASCADE
);

-- ML Model Versions Table
CREATE TABLE IF NOT EXISTS ml_model_versions (
    id BIGSERIAL PRIMARY KEY,
    version VARCHAR(100) UNIQUE NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    config JSONB NOT NULL,
    performance_metrics JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    deployment_date TIMESTAMPTZ,
    deprecated_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feature Importance Table (for explainability)
CREATE TABLE IF NOT EXISTS ml_feature_importance (
    id BIGSERIAL PRIMARY KEY,
    model_version VARCHAR(100) NOT NULL,
    feature_name VARCHAR(255) NOT NULL,
    importance_score DECIMAL(10, 8) NOT NULL,
    feature_type VARCHAR(50) NOT NULL, -- 'numerical', 'categorical', 'boolean'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(model_version, feature_name),
    
    CONSTRAINT fk_feature_importance_model
        FOREIGN KEY (model_version) REFERENCES ml_model_versions(version) ON DELETE CASCADE
);

-- Prediction Feedback Table (for model improvement)
CREATE TABLE IF NOT EXISTS ml_prediction_feedback (
    id BIGSERIAL PRIMARY KEY,
    prediction_id VARCHAR(255) NOT NULL,
    actual_next_page VARCHAR(500),
    user_clicked BOOLEAN NOT NULL DEFAULT FALSE,
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    feedback_text TEXT,
    time_to_action INTEGER,           -- milliseconds until user action
    session_outcome VARCHAR(50),      -- 'conversion', 'bounce', 'continued', 'exit'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_prediction_feedback
        FOREIGN KEY (prediction_id) REFERENCES ml_prediction_logs(prediction_id) ON DELETE CASCADE
);

-- Model Performance Monitoring Table
CREATE TABLE IF NOT EXISTS ml_model_monitoring (
    id BIGSERIAL PRIMARY KEY,
    model_version VARCHAR(100) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10, 6) NOT NULL,
    measurement_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data_window_start TIMESTAMPTZ NOT NULL,
    data_window_end TIMESTAMPTZ NOT NULL,
    
    INDEX idx_model_monitoring_version_date (model_version, measurement_date),
    
    CONSTRAINT fk_model_monitoring_version
        FOREIGN KEY (model_version) REFERENCES ml_model_versions(version) ON DELETE CASCADE
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_ml_prediction_logs_session_id ON ml_prediction_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_ml_prediction_logs_user_id ON ml_prediction_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ml_prediction_logs_created_at ON ml_prediction_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ml_prediction_logs_model_version ON ml_prediction_logs(model_version);

CREATE INDEX IF NOT EXISTS idx_ml_training_jobs_status ON ml_training_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ml_training_jobs_started_at ON ml_training_jobs(started_at);

CREATE INDEX IF NOT EXISTS idx_navigation_patterns_type ON navigation_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_navigation_patterns_frequency ON navigation_patterns(frequency DESC);
CREATE INDEX IF NOT EXISTS idx_navigation_patterns_confidence ON navigation_patterns(confidence DESC);

CREATE INDEX IF NOT EXISTS idx_user_segment_assignments_user_id ON user_segment_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_segment_assignments_segment_id ON user_segment_assignments(segment_id);

CREATE INDEX IF NOT EXISTS idx_ml_model_versions_active ON ml_model_versions(is_active) WHERE is_active = TRUE;

-- GIN indexes for JSONB columns for efficient querying
CREATE INDEX IF NOT EXISTS idx_ml_prediction_logs_predicted_pages ON ml_prediction_logs USING GIN (predicted_pages);
CREATE INDEX IF NOT EXISTS idx_navigation_patterns_pages ON navigation_patterns USING GIN (pages);
CREATE INDEX IF NOT EXISTS idx_user_segments_criteria ON user_segments USING GIN (criteria);

-- Functions for analytics and reporting

-- Function to get user navigation patterns
CREATE OR REPLACE FUNCTION get_user_navigation_patterns(
    user_id_param VARCHAR,
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    pattern_type VARCHAR,
    pages JSONB,
    frequency INTEGER,
    last_occurrence TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        np.pattern_type,
        np.pages,
        np.frequency,
        np.last_seen
    FROM navigation_patterns np
    WHERE np.last_seen >= NOW() - INTERVAL '1 day' * days_back
      AND user_id_param = ANY(
          SELECT jsonb_array_elements_text(np.user_segments)
      )
    ORDER BY np.frequency DESC, np.confidence DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate model drift metrics
CREATE OR REPLACE FUNCTION calculate_model_drift(
    model_version_param VARCHAR,
    comparison_days INTEGER DEFAULT 7
)
RETURNS TABLE (
    metric_name VARCHAR,
    current_value DECIMAL,
    previous_value DECIMAL,
    drift_percentage DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH current_metrics AS (
        SELECT 
            metric_name,
            AVG(metric_value) as current_avg
        FROM ml_model_monitoring
        WHERE model_version = model_version_param
          AND measurement_date >= NOW() - INTERVAL '1 day' * comparison_days
        GROUP BY metric_name
    ),
    previous_metrics AS (
        SELECT 
            metric_name,
            AVG(metric_value) as previous_avg
        FROM ml_model_monitoring
        WHERE model_version = model_version_param
          AND measurement_date >= NOW() - INTERVAL '1 day' * (comparison_days * 2)
          AND measurement_date < NOW() - INTERVAL '1 day' * comparison_days
        GROUP BY metric_name
    )
    SELECT 
        c.metric_name,
        c.current_avg,
        p.previous_avg,
        CASE 
            WHEN p.previous_avg != 0 
            THEN ((c.current_avg - p.previous_avg) / p.previous_avg * 100)
            ELSE 0
        END as drift_percentage
    FROM current_metrics c
    LEFT JOIN previous_metrics p ON c.metric_name = p.metric_name;
END;
$$ LANGUAGE plpgsql;

-- Function to find frequent page sequences (for pattern discovery)
CREATE OR REPLACE FUNCTION find_frequent_page_sequences(
    min_support DECIMAL DEFAULT 0.01,
    min_confidence DECIMAL DEFAULT 0.5
)
RETURNS TABLE (
    pattern_id VARCHAR,
    pages JSONB,
    frequency INTEGER,
    confidence DECIMAL,
    average_duration INTEGER,
    user_segments JSONB,
    last_seen TIMESTAMPTZ
) AS $$
BEGIN
    -- Simplified implementation - in production, use proper sequence mining
    RETURN QUERY
    WITH page_sequences AS (
        SELECT 
            s.id as session_id,
            s.user_id,
            array_agg(e.page_url ORDER BY e.timestamp) as page_sequence,
            EXTRACT(EPOCH FROM (MAX(e.timestamp) - MIN(e.timestamp)))::INTEGER as duration
        FROM user_sessions s
        JOIN user_behavior_events e ON s.id = e.session_id
        WHERE e.event_type = 'page_view'
          AND s.start_time >= NOW() - INTERVAL '30 days'
        GROUP BY s.id, s.user_id
        HAVING COUNT(e.page_url) >= 2
    ),
    sequence_counts AS (
        SELECT 
            array_to_json(page_sequence) as sequence,
            COUNT(*) as frequency,
            AVG(duration)::INTEGER as average_duration,
            array_agg(DISTINCT user_id) as users
        FROM page_sequences
        GROUP BY page_sequence
        HAVING COUNT(*) >= (SELECT COUNT(*) FROM page_sequences) * min_support
    )
    SELECT 
        'pattern_' || encode(digest(sequence::text, 'sha256'), 'hex')::VARCHAR as pattern_id,
        sequence as pages,
        frequency,
        (frequency::DECIMAL / (SELECT COUNT(*) FROM page_sequences))::DECIMAL as confidence,
        average_duration,
        array_to_json(users) as user_segments,
        NOW() as last_seen
    FROM sequence_counts
    WHERE (frequency::DECIMAL / (SELECT COUNT(*) FROM page_sequences)) >= min_confidence
    ORDER BY frequency DESC;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to relevant tables
CREATE TRIGGER update_ml_training_jobs_updated_at
    BEFORE UPDATE ON ml_training_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_navigation_patterns_updated_at
    BEFORE UPDATE ON navigation_patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_segments_updated_at
    BEFORE UPDATE ON user_segments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for easy querying and reporting
CREATE OR REPLACE VIEW v_active_model_performance AS
SELECT 
    mv.version,
    mv.model_type,
    mv.performance_metrics,
    mv.deployment_date,
    COUNT(pl.id) as prediction_count,
    AVG(CASE WHEN pf.user_clicked THEN 1.0 ELSE 0.0 END) as click_through_rate
FROM ml_model_versions mv
LEFT JOIN ml_prediction_logs pl ON mv.version = pl.model_version
LEFT JOIN ml_prediction_feedback pf ON pl.prediction_id = pf.prediction_id
WHERE mv.is_active = TRUE
GROUP BY mv.version, mv.model_type, mv.performance_metrics, mv.deployment_date;

CREATE OR REPLACE VIEW v_user_engagement_metrics AS
SELECT 
    pl.user_id,
    pl.user_segment,
    COUNT(pl.id) as total_predictions,
    COUNT(pf.id) as total_feedback,
    AVG(CASE WHEN pf.user_clicked THEN 1.0 ELSE 0.0 END) as engagement_rate,
    AVG(pf.user_rating) as average_rating,
    DATE_TRUNC('day', pl.created_at) as date
FROM ml_prediction_logs pl
LEFT JOIN ml_prediction_feedback pf ON pl.prediction_id = pf.prediction_id
WHERE pl.created_at >= NOW() - INTERVAL '30 days'
GROUP BY pl.user_id, pl.user_segment, DATE_TRUNC('day', pl.created_at);

-- Comments for documentation
COMMENT ON TABLE ml_training_jobs IS 'Tracks machine learning model training jobs and their status';
COMMENT ON TABLE ml_prediction_logs IS 'Logs all ML predictions made for navigation recommendations';
COMMENT ON TABLE navigation_patterns IS 'Discovered navigation patterns from user behavior analysis';
COMMENT ON TABLE user_segments IS 'User segmentation data for personalized navigation recommendations';
COMMENT ON TABLE ml_model_versions IS 'Versioning and metadata for deployed ML models';
COMMENT ON TABLE ml_prediction_feedback IS 'User feedback on ML predictions for model improvement';

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_app_user; 