-- Cross-Platform Learning Tables
-- Task 67.4: Cross-Platform en Competitor Analyse

-- Universal patterns table for storing cross-platform content patterns
CREATE TABLE IF NOT EXISTS ml_universal_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_id VARCHAR(255) UNIQUE NOT NULL,
    pattern_type VARCHAR(100) NOT NULL CHECK (pattern_type IN ('cross_platform_viral', 'universal_hashtag', 'time_agnostic', 'audience_universal')),
    platforms TEXT[] NOT NULL,
    effectiveness_score DECIMAL(5,2) NOT NULL CHECK (effectiveness_score >= 0 AND effectiveness_score <= 100),
    pattern_data JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cross-platform performance data for learning
CREATE TABLE IF NOT EXISTS cross_platform_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id VARCHAR(255) NOT NULL,
    platform VARCHAR(100) NOT NULL,
    engagement_rate DECIMAL(6,5) NOT NULL DEFAULT 0,
    reach INTEGER NOT NULL DEFAULT 0,
    impressions INTEGER NOT NULL DEFAULT 0,
    shares INTEGER NOT NULL DEFAULT 0,
    saves INTEGER NOT NULL DEFAULT 0,
    comments INTEGER NOT NULL DEFAULT 0,
    clicks INTEGER NOT NULL DEFAULT 0,
    conversion_rate DECIMAL(6,5) NOT NULL DEFAULT 0,
    roi DECIMAL(8,2) NOT NULL DEFAULT 0,
    posting_time TIMESTAMP WITH TIME ZONE NOT NULL,
    content_type VARCHAR(100) NOT NULL DEFAULT 'general',
    hashtags TEXT[] DEFAULT '{}',
    audience_segment VARCHAR(100) DEFAULT 'general',
    content_text TEXT,
    performance_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cross-platform insights and recommendations
CREATE TABLE IF NOT EXISTS cross_platform_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insight_type VARCHAR(100) NOT NULL CHECK (insight_type IN ('content_migration', 'universal_optimization', 'platform_specific', 'competitor_gap')),
    confidence_score DECIMAL(4,3) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    applicable_platforms TEXT[] NOT NULL,
    optimization_impact DECIMAL(5,2) NOT NULL DEFAULT 0,
    implementation_effort VARCHAR(50) NOT NULL CHECK (implementation_effort IN ('low', 'medium', 'high')),
    expected_roi_improvement DECIMAL(5,2) NOT NULL DEFAULT 0,
    insights TEXT[] NOT NULL DEFAULT '{}',
    actionable_recommendations TEXT[] NOT NULL DEFAULT '{}',
    insight_data JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'applied', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Competitor benchmark data
CREATE TABLE IF NOT EXISTS competitor_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id VARCHAR(255) NOT NULL,
    competitor_name VARCHAR(255) NOT NULL,
    platform VARCHAR(100) NOT NULL,
    avg_engagement_rate DECIMAL(6,5) NOT NULL DEFAULT 0,
    content_velocity INTEGER NOT NULL DEFAULT 0,
    top_performing_hashtags TEXT[] DEFAULT '{}',
    optimal_posting_times TEXT[] DEFAULT '{}',
    content_pillars TEXT[] DEFAULT '{}',
    performance_gaps TEXT[] DEFAULT '{}',
    opportunities TEXT[] DEFAULT '{}',
    benchmark_data JSONB DEFAULT '{}',
    analysis_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content migration strategies
CREATE TABLE IF NOT EXISTS content_migration_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_platform VARCHAR(100) NOT NULL,
    target_platform VARCHAR(100) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    original_content TEXT NOT NULL,
    adapted_content TEXT NOT NULL,
    adaptation_notes TEXT[] DEFAULT '{}',
    recommended_hashtags TEXT[] DEFAULT '{}',
    optimal_posting_time VARCHAR(10),
    expected_performance JSONB DEFAULT '{}',
    migration_effectiveness DECIMAL(4,3) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'successful', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cross-platform analysis sessions
CREATE TABLE IF NOT EXISTS cross_platform_analysis_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    content_analyzed TEXT NOT NULL,
    platforms_analyzed TEXT[] NOT NULL,
    content_type VARCHAR(100) NOT NULL DEFAULT 'general',
    target_audience VARCHAR(100),
    analysis_results JSONB NOT NULL DEFAULT '{}',
    cross_platform_score DECIMAL(4,3) NOT NULL DEFAULT 0,
    universal_insights JSONB DEFAULT '{}',
    competitor_benchmarks JSONB DEFAULT '{}',
    optimization_recommendations TEXT[] DEFAULT '{}',
    session_status VARCHAR(50) DEFAULT 'completed' CHECK (session_status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_universal_patterns_type ON ml_universal_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_universal_patterns_platforms ON ml_universal_patterns USING GIN(platforms);
CREATE INDEX IF NOT EXISTS idx_universal_patterns_status ON ml_universal_patterns(status);
CREATE INDEX IF NOT EXISTS idx_universal_patterns_created ON ml_universal_patterns(created_at);

CREATE INDEX IF NOT EXISTS idx_cross_platform_performance_content ON cross_platform_performance(content_id);
CREATE INDEX IF NOT EXISTS idx_cross_platform_performance_platform ON cross_platform_performance(platform);
CREATE INDEX IF NOT EXISTS idx_cross_platform_performance_type ON cross_platform_performance(content_type);
CREATE INDEX IF NOT EXISTS idx_cross_platform_performance_time ON cross_platform_performance(posting_time);
CREATE INDEX IF NOT EXISTS idx_cross_platform_performance_hashtags ON cross_platform_performance USING GIN(hashtags);

CREATE INDEX IF NOT EXISTS idx_cross_platform_insights_type ON cross_platform_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_cross_platform_insights_platforms ON cross_platform_insights USING GIN(applicable_platforms);
CREATE INDEX IF NOT EXISTS idx_cross_platform_insights_status ON cross_platform_insights(status);
CREATE INDEX IF NOT EXISTS idx_cross_platform_insights_confidence ON cross_platform_insights(confidence_score);

CREATE INDEX IF NOT EXISTS idx_competitor_benchmarks_competitor ON competitor_benchmarks(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_benchmarks_platform ON competitor_benchmarks(platform);
CREATE INDEX IF NOT EXISTS idx_competitor_benchmarks_date ON competitor_benchmarks(analysis_date);

CREATE INDEX IF NOT EXISTS idx_migration_strategies_source ON content_migration_strategies(source_platform);
CREATE INDEX IF NOT EXISTS idx_migration_strategies_target ON content_migration_strategies(target_platform);
CREATE INDEX IF NOT EXISTS idx_migration_strategies_type ON content_migration_strategies(content_type);
CREATE INDEX IF NOT EXISTS idx_migration_strategies_status ON content_migration_strategies(status);

CREATE INDEX IF NOT EXISTS idx_analysis_sessions_session ON cross_platform_analysis_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_platforms ON cross_platform_analysis_sessions USING GIN(platforms_analyzed);
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_status ON cross_platform_analysis_sessions(session_status);
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_created ON cross_platform_analysis_sessions(created_at);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ml_universal_patterns_updated_at 
    BEFORE UPDATE ON ml_universal_patterns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cross_platform_performance_updated_at 
    BEFORE UPDATE ON cross_platform_performance 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cross_platform_insights_updated_at 
    BEFORE UPDATE ON cross_platform_insights 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitor_benchmarks_updated_at 
    BEFORE UPDATE ON competitor_benchmarks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_migration_strategies_updated_at 
    BEFORE UPDATE ON content_migration_strategies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cross_platform_analysis_sessions_updated_at 
    BEFORE UPDATE ON cross_platform_analysis_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE ml_universal_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_platform_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_platform_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_migration_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_platform_analysis_sessions ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust based on your auth requirements)
CREATE POLICY "Enable read access for all users" ON ml_universal_patterns FOR SELECT USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON ml_universal_patterns FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update access for authenticated users" ON ml_universal_patterns FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON cross_platform_performance FOR SELECT USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON cross_platform_performance FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update access for authenticated users" ON cross_platform_performance FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON cross_platform_insights FOR SELECT USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON cross_platform_insights FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update access for authenticated users" ON cross_platform_insights FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON competitor_benchmarks FOR SELECT USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON competitor_benchmarks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update access for authenticated users" ON competitor_benchmarks FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON content_migration_strategies FOR SELECT USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON content_migration_strategies FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update access for authenticated users" ON content_migration_strategies FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON cross_platform_analysis_sessions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for authenticated users" ON cross_platform_analysis_sessions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update access for authenticated users" ON cross_platform_analysis_sessions FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert some sample data for testing
INSERT INTO ml_universal_patterns (pattern_id, pattern_type, platforms, effectiveness_score, pattern_data) VALUES
('universal_hashtag_001', 'universal_hashtag', ARRAY['instagram', 'linkedin', 'twitter'], 85.5, '{"hashtag": "AI", "performance_across_platforms": {"instagram": 0.08, "linkedin": 0.06, "twitter": 0.05}}'),
('cross_platform_viral_001', 'cross_platform_viral', ARRAY['instagram', 'tiktok', 'youtube'], 92.3, '{"content_type": "educational", "viral_elements": ["trending_audio", "visual_storytelling"], "avg_engagement": 0.12}'),
('time_agnostic_001', 'time_agnostic', ARRAY['linkedin', 'facebook'], 78.9, '{"optimal_times": ["09:00", "13:00", "17:00"], "consistency_score": 0.85}');

INSERT INTO competitor_benchmarks (competitor_id, competitor_name, platform, avg_engagement_rate, content_velocity, top_performing_hashtags, opportunities) VALUES
('comp_001', 'TechCorp', 'instagram', 0.075, 12, ARRAY['tech', 'innovation', 'startup'], ARRAY['Increase video content', 'Focus on trending hashtags']),
('comp_002', 'InnovateLab', 'linkedin', 0.065, 8, ARRAY['business', 'leadership', 'growth'], ARRAY['More thought leadership content', 'Engage with industry discussions']),
('comp_003', 'DigitalFirst', 'twitter', 0.045, 25, ARRAY['digital', 'marketing', 'trends'], ARRAY['Real-time engagement', 'Thread-based content']);

-- Comments for documentation
COMMENT ON TABLE ml_universal_patterns IS 'Stores universal content patterns that work across multiple platforms';
COMMENT ON TABLE cross_platform_performance IS 'Historical performance data for content across different platforms';
COMMENT ON TABLE cross_platform_insights IS 'AI-generated insights and recommendations for cross-platform optimization';
COMMENT ON TABLE competitor_benchmarks IS 'Competitor analysis data for benchmarking performance';
COMMENT ON TABLE content_migration_strategies IS 'Strategies for adapting content from one platform to another';
COMMENT ON TABLE cross_platform_analysis_sessions IS 'Analysis sessions and their results for tracking and auditing';