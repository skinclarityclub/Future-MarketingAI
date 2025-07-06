-- ====================================================================
-- FORTUNE 500 AI AGENT TRENDING INTELLIGENCE & BENCHMARKING SYSTEM
-- Task 74.6: Implementeer trendanalyse en benchmarking met Fortune 500 AI Agent
-- ====================================================================

-- Trending Intelligence Table (voor n8n Fortune 500 workflow)
CREATE TABLE IF NOT EXISTS trending_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Session & Request Info
    session_id VARCHAR(255) NOT NULL,
    topic_id VARCHAR(255) NOT NULL,
    analysis_id VARCHAR(255) UNIQUE NOT NULL,
    request_id VARCHAR(255),
    
    -- Topic Details
    topic_name VARCHAR(255) NOT NULL,
    topic_description TEXT,
    hashtags TEXT[] DEFAULT '{}',
    platforms TEXT[] DEFAULT '{}',
    
    -- Trend Analysis Data
    trend_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    momentum DECIMAL(5,2) DEFAULT 0,
    velocity DECIMAL(5,2) DEFAULT 0,
    lifecycle_stage VARCHAR(50) CHECK (lifecycle_stage IN ('emerging', 'growth', 'peak', 'mature', 'declining')),
    
    -- AI Analysis Results
    quality_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    consensus_score DECIMAL(5,2) DEFAULT 0,
    ai_confidence DECIMAL(5,2) DEFAULT 0,
    strategic_value VARCHAR(20) CHECK (strategic_value IN ('critical', 'high', 'medium', 'low')),
    
    -- Fortune 500 Specific Data
    fortune_500_relevance DECIMAL(5,2) DEFAULT 0,
    enterprise_readiness BOOLEAN DEFAULT false,
    market_opportunity JSONB DEFAULT '{}',
    competitive_landscape JSONB DEFAULT '{}',
    
    -- Content Ideas & Recommendations
    content_ideas TEXT[] DEFAULT '{}',
    recommended_actions JSONB DEFAULT '{}',
    implementation_timeline JSONB DEFAULT '{}',
    
    -- Agent Analysis (Full Fortune 500 AI Analysis)
    agent_analysis JSONB NOT NULL DEFAULT '{}',
    forecasting_data JSONB DEFAULT '{}',
    risk_assessment JSONB DEFAULT '{}',
    
    -- Status & Deployment
    deployment_status VARCHAR(50) DEFAULT 'pending' CHECK (deployment_status IN ('pending', 'ready', 'approved', 'deployed', 'completed')),
    workflow_triggers_activated TEXT[] DEFAULT '{}',
    
    -- User & Organization
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organization_id VARCHAR(255),
    tenant_id UUID REFERENCES enterprise_tenants(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Fortune 500 Benchmark Data Table
CREATE TABLE IF NOT EXISTS fortune_500_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Company & Industry
    company_name VARCHAR(255) NOT NULL,
    fortune_ranking INTEGER CHECK (fortune_ranking >= 1 AND fortune_ranking <= 500),
    industry_sector VARCHAR(100) NOT NULL,
    market_cap_usd BIGINT,
    annual_revenue_usd BIGINT,
    
    -- Benchmark Categories
    benchmark_category VARCHAR(100) NOT NULL, -- 'marketing_performance', 'digital_engagement', 'innovation_metrics'
    benchmark_subcategory VARCHAR(100),
    
    -- Performance Metrics
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(50), -- 'percentage', 'count', 'currency', 'ratio'
    
    -- Context & Metadata
    measurement_period_start DATE NOT NULL,
    measurement_period_end DATE NOT NULL,
    data_source VARCHAR(100) NOT NULL, -- 'annual_report', 'sec_filing', 'market_research', 'public_api'
    data_reliability DECIMAL(3,2) DEFAULT 0.8 CHECK (data_reliability >= 0 AND data_reliability <= 1),
    
    -- Trend Analysis
    trend_direction VARCHAR(20) CHECK (trend_direction IN ('improving', 'stable', 'declining')),
    year_over_year_change DECIMAL(10,4),
    seasonal_adjustment DECIMAL(10,4) DEFAULT 1.0,
    
    -- Fortune 500 Context
    percentile_rank DECIMAL(5,2), -- Where this company ranks among Fortune 500
    top_quartile BOOLEAN DEFAULT false,
    industry_leader BOOLEAN DEFAULT false,
    
    -- Additional Data
    benchmark_data JSONB DEFAULT '{}',
    notes TEXT,
    
    -- Timestamps
    data_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(company_name, benchmark_category, metric_name, measurement_period_start)
);

-- AI Agent Intelligence Sessions (Fortune 500 specific)
CREATE TABLE IF NOT EXISTS fortune_500_ai_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Session Info
    session_id VARCHAR(255) UNIQUE NOT NULL,
    session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('strategic_analysis', 'trend_forecasting', 'competitive_intelligence', 'market_opportunity')),
    intelligence_level VARCHAR(50) DEFAULT 'fortune_500_ai_agents',
    
    -- Agent Configuration
    agents_config JSONB NOT NULL DEFAULT '{}',
    analysis_targets JSONB NOT NULL DEFAULT '{}',
    quality_thresholds JSONB DEFAULT '{}',
    
    -- Analysis Results
    strategic_insights JSONB DEFAULT '{}',
    trend_forecasts JSONB DEFAULT '{}',
    competitive_analysis JSONB DEFAULT '{}',
    market_opportunities JSONB DEFAULT '{}',
    executive_summary TEXT,
    
    -- Fortune 500 Intelligence
    fortune_500_relevance JSONB DEFAULT '{}',
    enterprise_recommendations JSONB DEFAULT '{}',
    implementation_roadmap JSONB DEFAULT '{}',
    roi_projections JSONB DEFAULT '{}',
    
    -- Performance Metrics
    session_duration_minutes INTEGER,
    total_api_calls INTEGER DEFAULT 0,
    total_cost_usd DECIMAL(10,4) DEFAULT 0,
    quality_score DECIMAL(5,2) DEFAULT 0,
    confidence_score DECIMAL(5,2) DEFAULT 0,
    
    -- Status
    status VARCHAR(50) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'timeout')),
    error_message TEXT,
    
    -- User & Organization
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    tenant_id UUID REFERENCES enterprise_tenants(id) ON DELETE SET NULL,
    
    -- Timestamps
    session_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    session_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trend Benchmarking Results (Performance vergelijkingen)
CREATE TABLE IF NOT EXISTS trend_benchmarking_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Reference Data
    trending_intelligence_id UUID REFERENCES trending_intelligence(id) ON DELETE CASCADE,
    benchmark_session_id UUID REFERENCES fortune_500_ai_sessions(id) ON DELETE CASCADE,
    
    -- Trend Being Benchmarked
    trend_topic VARCHAR(255) NOT NULL,
    trend_platforms TEXT[] NOT NULL,
    
    -- Benchmark Comparison
    fortune_500_companies TEXT[] NOT NULL,
    industry_average DECIMAL(10,4),
    top_quartile_threshold DECIMAL(10,4),
    market_leader_performance DECIMAL(10,4),
    
    -- Performance Analysis
    current_performance DECIMAL(10,4),
    performance_gap DECIMAL(10,4), -- Difference from industry average
    percentile_ranking DECIMAL(5,2),
    improvement_potential DECIMAL(10,4),
    
    -- Strategic Insights
    competitive_positioning VARCHAR(100),
    market_opportunity_score DECIMAL(5,2),
    recommended_strategy TEXT,
    implementation_complexity VARCHAR(20) CHECK (implementation_complexity IN ('low', 'medium', 'high', 'very_high')),
    
    -- Fortune 500 Context
    similar_companies TEXT[], -- Fortune 500 companies with similar performance
    success_patterns JSONB DEFAULT '{}',
    best_practices JSONB DEFAULT '{}',
    
    -- Forecasting
    projected_performance JSONB DEFAULT '{}',
    timeline_to_target INTERVAL,
    confidence_interval JSONB DEFAULT '{}',
    
    -- Results Metadata
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    data_freshness_hours INTEGER DEFAULT 24,
    reliability_score DECIMAL(3,2) DEFAULT 0.8,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ====================================================================

-- Trending Intelligence Indexes
CREATE INDEX IF NOT EXISTS idx_trending_intelligence_session_id ON trending_intelligence(session_id);
CREATE INDEX IF NOT EXISTS idx_trending_intelligence_topic_name ON trending_intelligence(topic_name);
CREATE INDEX IF NOT EXISTS idx_trending_intelligence_strategic_value ON trending_intelligence(strategic_value);
CREATE INDEX IF NOT EXISTS idx_trending_intelligence_deployment_status ON trending_intelligence(deployment_status);
CREATE INDEX IF NOT EXISTS idx_trending_intelligence_tenant_id ON trending_intelligence(tenant_id);
CREATE INDEX IF NOT EXISTS idx_trending_intelligence_created_at ON trending_intelligence(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trending_intelligence_platforms ON trending_intelligence USING gin(platforms);
CREATE INDEX IF NOT EXISTS idx_trending_intelligence_hashtags ON trending_intelligence USING gin(hashtags);

-- Fortune 500 Benchmarks Indexes
CREATE INDEX IF NOT EXISTS idx_fortune_500_benchmarks_company ON fortune_500_benchmarks(company_name);
CREATE INDEX IF NOT EXISTS idx_fortune_500_benchmarks_ranking ON fortune_500_benchmarks(fortune_ranking);
CREATE INDEX IF NOT EXISTS idx_fortune_500_benchmarks_industry ON fortune_500_benchmarks(industry_sector);
CREATE INDEX IF NOT EXISTS idx_fortune_500_benchmarks_category ON fortune_500_benchmarks(benchmark_category, benchmark_subcategory);
CREATE INDEX IF NOT EXISTS idx_fortune_500_benchmarks_metric ON fortune_500_benchmarks(metric_name);
CREATE INDEX IF NOT EXISTS idx_fortune_500_benchmarks_period ON fortune_500_benchmarks(measurement_period_start, measurement_period_end);
CREATE INDEX IF NOT EXISTS idx_fortune_500_benchmarks_top_quartile ON fortune_500_benchmarks(top_quartile) WHERE top_quartile = true;
CREATE INDEX IF NOT EXISTS idx_fortune_500_benchmarks_industry_leader ON fortune_500_benchmarks(industry_leader) WHERE industry_leader = true;

-- AI Sessions Indexes
CREATE INDEX IF NOT EXISTS idx_fortune_500_ai_sessions_session_id ON fortune_500_ai_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_fortune_500_ai_sessions_type ON fortune_500_ai_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_fortune_500_ai_sessions_status ON fortune_500_ai_sessions(status);
CREATE INDEX IF NOT EXISTS idx_fortune_500_ai_sessions_tenant_id ON fortune_500_ai_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fortune_500_ai_sessions_start ON fortune_500_ai_sessions(session_start DESC);

-- Trend Benchmarking Indexes
CREATE INDEX IF NOT EXISTS idx_trend_benchmarking_trend_topic ON trend_benchmarking_results(trend_topic);
CREATE INDEX IF NOT EXISTS idx_trend_benchmarking_platforms ON trend_benchmarking_results USING gin(trend_platforms);
CREATE INDEX IF NOT EXISTS idx_trend_benchmarking_companies ON trend_benchmarking_results USING gin(fortune_500_companies);
CREATE INDEX IF NOT EXISTS idx_trend_benchmarking_percentile ON trend_benchmarking_results(percentile_ranking DESC);
CREATE INDEX IF NOT EXISTS idx_trend_benchmarking_opportunity ON trend_benchmarking_results(market_opportunity_score DESC);

-- ====================================================================
-- SAMPLE DATA FOR DEVELOPMENT & TESTING
-- ====================================================================

-- Sample Fortune 500 Benchmark Data
INSERT INTO fortune_500_benchmarks (
    company_name, fortune_ranking, industry_sector, market_cap_usd, annual_revenue_usd,
    benchmark_category, benchmark_subcategory, metric_name, metric_value, metric_unit,
    measurement_period_start, measurement_period_end, data_source, data_reliability,
    trend_direction, year_over_year_change, percentile_rank, top_quartile, industry_leader,
    data_date
) VALUES 
-- Apple - Digital Marketing Performance
('Apple Inc.', 3, 'Technology', 3000000000000, 394328000000, 
 'digital_marketing', 'social_engagement', 'instagram_engagement_rate', 3.45, 'percentage',
 '2024-01-01', '2024-12-31', 'social_media_api', 0.95,
 'improving', 12.5, 95.2, true, true, '2024-12-31'),

-- Nike - Brand Engagement
('Nike Inc.', 89, 'Retail', 200000000000, 51217000000,
 'brand_performance', 'consumer_engagement', 'brand_mention_sentiment', 78.3, 'percentage',
 '2024-01-01', '2024-12-31', 'sentiment_analysis', 0.90,
 'stable', 2.1, 88.7, true, false, '2024-12-31'),

-- Coca-Cola - Content Performance
('The Coca-Cola Company', 87, 'Beverages', 265000000000, 43004000000,
 'content_marketing', 'viral_content', 'content_virality_score', 68.9, 'score',
 '2024-01-01', '2024-12-31', 'content_analytics', 0.85,
 'improving', 15.3, 82.1, true, false, '2024-12-31'),

-- Microsoft - Innovation Metrics
('Microsoft Corporation', 14, 'Technology', 2800000000000, 245122000000,
 'innovation_metrics', 'ai_adoption', 'ai_integration_score', 92.1, 'score',
 '2024-01-01', '2024-12-31', 'tech_analysis', 0.93,
 'improving', 28.7, 98.5, true, true, '2024-12-31');

-- Sample AI Session Data
INSERT INTO fortune_500_ai_sessions (
    session_id, session_type, intelligence_level,
    agents_config, analysis_targets, quality_thresholds,
    strategic_insights, trend_forecasts, competitive_analysis,
    session_duration_minutes, total_api_calls, total_cost_usd,
    quality_score, confidence_score, status
) VALUES (
    'f500_session_demo_001', 'strategic_analysis', 'fortune_500_ai_agents',
    '{"strategic_agent": {"model": "gpt-4o", "temperature": 0.3}, "forecasting_agent": {"model": "gpt-4o", "temperature": 0.4}}',
    '{"market_focus": "skincare_beauty_wellness", "platforms": ["instagram", "tiktok", "linkedin"], "quality_threshold": 80}',
    '{"minimum_quality": 80, "minimum_confidence": 85, "roi_threshold": 300}',
    '{"opportunities": ["AI-powered skincare personalization", "Sustainable beauty packaging"], "market_size": "$50B+", "growth_rate": "12% CAGR"}',
    '{"trends": [{"name": "Clean Beauty", "momentum": 89, "lifecycle": "growth"}, {"name": "Personalized Skincare", "momentum": 94, "lifecycle": "emerging"}]}',
         '{"key_competitors": ["L''Oreal", "Unilever", "P&G"], "competitive_gaps": ["AI personalization", "Direct-to-consumer model"]}',
    45, 23, 3.75,
    87.5, 89.2, 'completed'
);

-- ====================================================================
-- RLS (ROW LEVEL SECURITY) POLICIES
-- ====================================================================

-- Enable RLS
ALTER TABLE trending_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE fortune_500_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE fortune_500_ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_benchmarking_results ENABLE ROW LEVEL SECURITY;

-- Trending Intelligence Policies
CREATE POLICY "Users can view their own trending intelligence" ON trending_intelligence
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enterprise users can view tenant trending intelligence" ON trending_intelligence
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM enterprise_users eu 
            WHERE eu.user_id = auth.uid() 
            AND eu.tenant_id = trending_intelligence.tenant_id
        )
    );

-- Fortune 500 Benchmarks Policies (Public read for benchmarking)
CREATE POLICY "Anyone can read Fortune 500 benchmarks" ON fortune_500_benchmarks
    FOR SELECT USING (true);

-- AI Sessions Policies  
CREATE POLICY "Users can view their own AI sessions" ON fortune_500_ai_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enterprise users can view tenant AI sessions" ON fortune_500_ai_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM enterprise_users eu 
            WHERE eu.user_id = auth.uid() 
            AND eu.tenant_id = fortune_500_ai_sessions.tenant_id
        )
    );

-- Trend Benchmarking Policies
CREATE POLICY "Users can view trend benchmarking through trending intelligence" ON trend_benchmarking_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM trending_intelligence ti 
            WHERE ti.id = trend_benchmarking_results.trending_intelligence_id
            AND ti.user_id = auth.uid()
        )
    );

-- ====================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ====================================================================

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trending_intelligence_updated_at 
    BEFORE UPDATE ON trending_intelligence 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fortune_500_benchmarks_updated_at 
    BEFORE UPDATE ON fortune_500_benchmarks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fortune_500_ai_sessions_updated_at 
    BEFORE UPDATE ON fortune_500_ai_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trend_benchmarking_results_updated_at 
    BEFORE UPDATE ON trend_benchmarking_results 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- COMMENTS FOR DOCUMENTATION
-- ====================================================================

COMMENT ON TABLE trending_intelligence IS 'Fortune 500 AI Agent trending intelligence data for enterprise workflows';
COMMENT ON TABLE fortune_500_benchmarks IS 'Benchmark performance data from Fortune 500 companies across industries';
COMMENT ON TABLE fortune_500_ai_sessions IS 'AI agent sessions specifically designed for Fortune 500 enterprise analysis';
COMMENT ON TABLE trend_benchmarking_results IS 'Results of benchmarking trending topics against Fortune 500 performance standards';

COMMENT ON COLUMN trending_intelligence.agent_analysis IS 'Complete Fortune 500 AI agent analysis results in JSON format';
COMMENT ON COLUMN fortune_500_benchmarks.percentile_rank IS 'Percentile ranking among Fortune 500 companies (0-100)';
COMMENT ON COLUMN fortune_500_ai_sessions.intelligence_level IS 'Level of AI intelligence applied (fortune_500_ai_agents for premium analysis)';
COMMENT ON COLUMN trend_benchmarking_results.performance_gap IS 'Gap between current performance and industry benchmark (positive = above average)';