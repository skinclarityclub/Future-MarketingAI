-- Content Performance Tracking Migration
-- Task 67.1: Database schema for self-learning content analysis and optimization

-- Content Performance Data Table
CREATE TABLE IF NOT EXISTS content_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id VARCHAR(255) NOT NULL,
    title TEXT NOT NULL,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('post', 'story', 'video', 'email', 'ad', 'campaign')),
    platform VARCHAR(50) NOT NULL,
    published_at TIMESTAMPTZ NOT NULL,
    
    -- Performance Metrics
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    click_through_rate DECIMAL(10,4) DEFAULT 0,
    engagement_rate DECIMAL(10,4) DEFAULT 0,
    conversion_rate DECIMAL(10,4) DEFAULT 0,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    
    -- Content Features for Analysis
    word_count INTEGER DEFAULT 0,
    hashtag_count INTEGER DEFAULT 0,
    mention_count INTEGER DEFAULT 0,
    media_count INTEGER DEFAULT 0,
    sentiment_score DECIMAL(3,2) DEFAULT 0,
    readability_score DECIMAL(5,2) DEFAULT 0,
    emotional_tone JSONB DEFAULT '[]'::jsonb,
    topics JSONB DEFAULT '[]'::jsonb,
    posting_time TIME NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    
    -- Content Elements for Pattern Recognition
    content_elements JSONB DEFAULT '{}'::jsonb, -- colors, themes, formats
    hashtags JSONB DEFAULT '[]'::jsonb,
    mentions JSONB DEFAULT '[]'::jsonb,
    
    -- Audience Data
    audience_demographics JSONB DEFAULT '{}'::jsonb,
    audience_interests JSONB DEFAULT '[]'::jsonb,
    engagement_patterns JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(content_id, platform)
);

-- Content Performance History for tracking changes over time
CREATE TABLE IF NOT EXISTS content_performance_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_performance_id UUID REFERENCES content_performance(id) ON DELETE CASCADE,
    snapshot_time TIMESTAMPTZ DEFAULT NOW(),
    
    -- Snapshot of metrics at this time
    metrics_snapshot JSONB NOT NULL,
    
    -- Performance delta from previous snapshot
    metrics_delta JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Machine Learning Models Table
CREATE TABLE IF NOT EXISTS ml_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id VARCHAR(255) UNIQUE NOT NULL,
    model_type VARCHAR(100) NOT NULL CHECK (model_type IN ('engagement_predictor', 'content_optimizer', 'audience_segmenter', 'timing_optimizer', 'pattern_recognizer')),
    version VARCHAR(50) NOT NULL,
    accuracy DECIMAL(5,2) DEFAULT 0,
    precision_score DECIMAL(5,2) DEFAULT 0,
    recall_score DECIMAL(5,2) DEFAULT 0,
    f1_score DECIMAL(5,2) DEFAULT 0,
    training_data_size INTEGER DEFAULT 0,
    last_trained TIMESTAMPTZ DEFAULT NOW(),
    features JSONB DEFAULT '[]'::jsonb,
    model_parameters JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'training' CHECK (status IN ('training', 'ready', 'updating', 'deprecated')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning Insights Table
CREATE TABLE IF NOT EXISTS learning_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insight_id VARCHAR(255) UNIQUE NOT NULL,
    insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('pattern', 'anomaly', 'trend', 'correlation')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('content', 'timing', 'audience', 'platform')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    confidence DECIMAL(5,2) NOT NULL CHECK (confidence BETWEEN 0 AND 100),
    impact_score DECIMAL(5,2) NOT NULL CHECK (impact_score BETWEEN 0 AND 100),
    supporting_data JSONB DEFAULT '[]'::jsonb,
    actionable_recommendations JSONB DEFAULT '[]'::jsonb,
    discovered_at TIMESTAMPTZ DEFAULT NOW(),
    validated BOOLEAN DEFAULT FALSE,
    validation_data JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optimization Recommendations Table
CREATE TABLE IF NOT EXISTS optimization_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id VARCHAR(255) UNIQUE NOT NULL,
    content_id VARCHAR(255),
    recommendation_type VARCHAR(100) NOT NULL CHECK (recommendation_type IN ('content_optimization', 'timing_optimization', 'audience_targeting', 'platform_selection')),
    confidence_score DECIMAL(5,2) NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
    expected_improvement DECIMAL(5,2) DEFAULT 0,
    
    -- Recommendation Details
    recommendation_title TEXT,
    recommendation_description TEXT NOT NULL,
    specific_changes JSONB DEFAULT '[]'::jsonb,
    rationale TEXT NOT NULL,
    
    -- Expected Impact
    engagement_lift DECIMAL(5,2) DEFAULT 0,
    reach_improvement DECIMAL(5,2) DEFAULT 0,
    conversion_increase DECIMAL(5,2) DEFAULT 0,
    
    -- A/B Testing Suggestion
    ab_test_suggestion JSONB DEFAULT NULL,
    
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'testing', 'validated', 'rejected')),
    applied_at TIMESTAMPTZ DEFAULT NULL,
    results JSONB DEFAULT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audience Segments Table
CREATE TABLE IF NOT EXISTS audience_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    segment_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    size INTEGER NOT NULL,
    
    -- Segment Characteristics
    demographics JSONB DEFAULT '{}'::jsonb,
    behaviors JSONB DEFAULT '{}'::jsonb,
    preferences JSONB DEFAULT '{}'::jsonb,
    engagement_patterns JSONB DEFAULT '{}'::jsonb,
    
    -- Performance Metrics
    avg_engagement_rate DECIMAL(5,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    lifetime_value DECIMAL(10,2) DEFAULT 0,
    content_preferences JSONB DEFAULT '[]'::jsonb,
    
    recommended_strategies JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Content Element Patterns Table (for pattern recognition)
CREATE TABLE IF NOT EXISTS content_element_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_id VARCHAR(255) UNIQUE NOT NULL,
    element_type VARCHAR(100) NOT NULL CHECK (element_type IN ('color_scheme', 'format', 'theme', 'hashtag_pattern', 'timing_pattern', 'audience_pattern')),
    pattern_data JSONB NOT NULL,
    
    -- Pattern Performance
    performance_score DECIMAL(5,2) DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Pattern Insights
    insights JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    
    -- Validation
    validated BOOLEAN DEFAULT FALSE,
    validation_confidence DECIMAL(5,2) DEFAULT 0,
    
    discovered_at TIMESTAMPTZ DEFAULT NOW(),
    last_validated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Alerts Table
CREATE TABLE IF NOT EXISTS performance_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id VARCHAR(255) UNIQUE NOT NULL,
    content_id VARCHAR(255),
    alert_type VARCHAR(100) NOT NULL CHECK (alert_type IN ('underperforming', 'trending', 'anomaly', 'opportunity')),
    severity VARCHAR(50) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    
    -- Alert Data
    trigger_metrics JSONB DEFAULT '{}'::jsonb,
    threshold_values JSONB DEFAULT '{}'::jsonb,
    current_values JSONB DEFAULT '{}'::jsonb,
    
    -- Recommended Actions
    suggested_actions JSONB DEFAULT '[]'::jsonb,
    
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
    acknowledged_at TIMESTAMPTZ DEFAULT NULL,
    resolved_at TIMESTAMPTZ DEFAULT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_content_performance_platform ON content_performance(platform);
CREATE INDEX IF NOT EXISTS idx_content_performance_published_at ON content_performance(published_at);
CREATE INDEX IF NOT EXISTS idx_content_performance_content_type ON content_performance(content_type);
CREATE INDEX IF NOT EXISTS idx_content_performance_engagement ON content_performance(engagement_rate DESC);
CREATE INDEX IF NOT EXISTS idx_content_performance_posting_time ON content_performance(posting_time, day_of_week);

CREATE INDEX IF NOT EXISTS idx_content_performance_history_content ON content_performance_history(content_performance_id);
CREATE INDEX IF NOT EXISTS idx_content_performance_history_time ON content_performance_history(snapshot_time);

CREATE INDEX IF NOT EXISTS idx_ml_models_type ON ml_models(model_type);
CREATE INDEX IF NOT EXISTS idx_ml_models_status ON ml_models(status);

CREATE INDEX IF NOT EXISTS idx_learning_insights_type ON learning_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_learning_insights_category ON learning_insights(category);
CREATE INDEX IF NOT EXISTS idx_learning_insights_confidence ON learning_insights(confidence DESC);

CREATE INDEX IF NOT EXISTS idx_optimization_recommendations_type ON optimization_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_optimization_recommendations_status ON optimization_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_optimization_recommendations_confidence ON optimization_recommendations(confidence_score DESC);

CREATE INDEX IF NOT EXISTS idx_audience_segments_size ON audience_segments(size DESC);
CREATE INDEX IF NOT EXISTS idx_audience_segments_engagement ON audience_segments(avg_engagement_rate DESC);

CREATE INDEX IF NOT EXISTS idx_content_element_patterns_type ON content_element_patterns(element_type);
CREATE INDEX IF NOT EXISTS idx_content_element_patterns_performance ON content_element_patterns(performance_score DESC);

CREATE INDEX IF NOT EXISTS idx_performance_alerts_type ON performance_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_status ON performance_alerts(status);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_severity ON performance_alerts(severity);

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_performance_updated_at BEFORE UPDATE ON content_performance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ml_models_updated_at BEFORE UPDATE ON ml_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_insights_updated_at BEFORE UPDATE ON learning_insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_optimization_recommendations_updated_at BEFORE UPDATE ON optimization_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audience_segments_updated_at BEFORE UPDATE ON audience_segments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_element_patterns_updated_at BEFORE UPDATE ON content_element_patterns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_performance_alerts_updated_at BEFORE UPDATE ON performance_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 