-- ====================================================================
-- Research & Trend Analysis System Enhancement
-- Task 36.13: Research Database Schema
-- ====================================================================
-- This migration extends the existing Marketing Machine schema with
-- specialized tables for advanced research and trend analysis capabilities

-- ====================================================================
-- 1. Competitors Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS competitors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Competitor Basic Info
    company_name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255),
    website_url TEXT,
    description TEXT,
    
    -- Industry & Classification
    industry VARCHAR(100),
    company_size VARCHAR(50) CHECK (company_size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
    market_segment VARCHAR(100),
    geographic_focus JSONB DEFAULT '[]', -- Array of countries/regions
    
    -- Social Media Presence
    social_accounts JSONB DEFAULT '{}', -- Platform -> account info mapping
    total_followers INTEGER DEFAULT 0,
    average_engagement_rate DECIMAL(5,2) DEFAULT 0,
    content_posting_frequency JSONB DEFAULT '{}', -- Platform -> frequency mapping
    
    -- Competitive Analysis
    competitive_strength VARCHAR(20) DEFAULT 'medium' CHECK (
        competitive_strength IN ('low', 'medium', 'high', 'very_high')
    ),
    market_share_estimate DECIMAL(5,2) DEFAULT 0,
    threat_level VARCHAR(20) DEFAULT 'medium' CHECK (
        threat_level IN ('low', 'medium', 'high', 'critical')
    ),
    
    -- Analysis Metadata
    analysis_priority VARCHAR(20) DEFAULT 'medium' CHECK (
        analysis_priority IN ('low', 'medium', 'high', 'urgent')
    ),
    last_analyzed_at TIMESTAMPTZ,
    analysis_frequency VARCHAR(20) DEFAULT 'weekly' CHECK (
        analysis_frequency IN ('daily', 'weekly', 'monthly', 'quarterly')
    ),
    
    -- Tracking Status
    is_active BOOLEAN DEFAULT true,
    tracking_enabled BOOLEAN DEFAULT true,
    notes TEXT,
    tags JSONB DEFAULT '[]',
    
    -- System Fields
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_name, market_segment)
);

-- ====================================================================
-- 2. Trends Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS trends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Trend Basic Info
    trend_name VARCHAR(255) NOT NULL,
    trend_category VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Trend Metrics
    trend_score DECIMAL(5,2) NOT NULL DEFAULT 0, -- 0-100 trending strength
    momentum VARCHAR(20) DEFAULT 'stable' CHECK (
        momentum IN ('declining', 'stable', 'growing', 'explosive')
    ),
    popularity_score DECIMAL(5,2) DEFAULT 0,
    growth_rate DECIMAL(10,4) DEFAULT 0, -- Percentage growth rate
    
    -- Timeline & Lifecycle
    first_detected_at TIMESTAMPTZ NOT NULL,
    peak_date DATE,
    expected_duration_days INTEGER,
    lifecycle_stage VARCHAR(20) DEFAULT 'emerging' CHECK (
        lifecycle_stage IN ('emerging', 'growing', 'peak', 'declining', 'dead')
    ),
    
    -- Geographic & Demographic
    geographic_distribution JSONB DEFAULT '{}', -- Region -> popularity mapping
    age_group_distribution JSONB DEFAULT '{}',
    platform_distribution JSONB DEFAULT '{}', -- Platform -> engagement mapping
    
    -- Content Association
    related_keywords JSONB DEFAULT '[]',
    related_hashtags JSONB DEFAULT '[]',
    related_topics JSONB DEFAULT '[]',
    content_themes JSONB DEFAULT '[]',
    
    -- Business Relevance
    business_relevance_score DECIMAL(5,2) DEFAULT 0,
    market_opportunity_score DECIMAL(5,2) DEFAULT 0,
    competition_level VARCHAR(20) DEFAULT 'medium' CHECK (
        competition_level IN ('low', 'medium', 'high', 'saturated')
    ),
    
    -- Data Sources
    data_sources JSONB DEFAULT '[]',
    confidence_score DECIMAL(5,2) DEFAULT 0,
    last_updated_from_source TIMESTAMPTZ,
    
    -- AI Analysis
    ai_generated BOOLEAN DEFAULT false,
    ai_confidence DECIMAL(5,2) DEFAULT 0,
    sentiment_score DECIMAL(5,2) DEFAULT 50, -- 0-100 (negative to positive)
    
    -- System Fields
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(trend_name, trend_category)
);

-- ====================================================================
-- 3. Keywords Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS keywords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Keyword Info
    keyword TEXT NOT NULL,
    keyword_type VARCHAR(50) DEFAULT 'primary' CHECK (
        keyword_type IN ('primary', 'secondary', 'long_tail', 'branded', 'competitor', 'trending')
    ),
    category VARCHAR(100),
    
    -- Search Metrics
    search_volume INTEGER DEFAULT 0,
    search_volume_trend VARCHAR(20) DEFAULT 'stable' CHECK (
        search_volume_trend IN ('declining', 'stable', 'growing', 'volatile')
    ),
    competition_level VARCHAR(20) DEFAULT 'medium' CHECK (
        competition_level IN ('low', 'medium', 'high', 'very_high')
    ),
    difficulty_score DECIMAL(5,2) DEFAULT 0, -- 0-100 (difficulty to rank)
    
    -- Content Performance
    content_relevance_score DECIMAL(5,2) DEFAULT 0,
    engagement_potential DECIMAL(5,2) DEFAULT 0,
    conversion_potential DECIMAL(5,2) DEFAULT 0,
    
    -- Seasonal & Temporal Data
    seasonal_pattern JSONB DEFAULT '{}', -- Month -> relative popularity
    best_posting_times JSONB DEFAULT '{}',
    trending_periods JSONB DEFAULT '[]',
    
    -- Platform Specific Data
    platform_performance JSONB DEFAULT '{}', -- Platform -> metrics mapping
    hashtag_variations JSONB DEFAULT '[]',
    related_keywords JSONB DEFAULT '[]',
    
    -- Competitive Intelligence
    competitor_usage JSONB DEFAULT '{}', -- Competitor -> usage frequency
    market_share DECIMAL(5,2) DEFAULT 0,
    opportunity_score DECIMAL(5,2) DEFAULT 0,
    
    -- Tracking & Analysis
    last_analyzed_at TIMESTAMPTZ,
    tracking_enabled BOOLEAN DEFAULT true,
    analysis_frequency VARCHAR(20) DEFAULT 'weekly' CHECK (
        analysis_frequency IN ('daily', 'weekly', 'monthly')
    ),
    
    -- System Fields
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(keyword)
);

-- ====================================================================
-- 4. Content Ideas Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS content_ideas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Idea Basic Info
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) NOT NULL CHECK (
        content_type IN ('post', 'story', 'video', 'carousel', 'reel', 'article', 'blog', 'email', 'ad')
    ),
    
    -- Idea Generation
    generation_method VARCHAR(50) DEFAULT 'ai' CHECK (
        generation_method IN ('ai', 'trend_analysis', 'competitor_analysis', 'manual', 'brainstorming')
    ),
    source_data JSONB DEFAULT '{}', -- Reference to trends, competitors, etc.
    ai_prompt TEXT,
    
    -- Content Details
    suggested_content TEXT,
    suggested_hashtags JSONB DEFAULT '[]',
    suggested_mentions JSONB DEFAULT '[]',
    target_platforms JSONB DEFAULT '[]',
    
    -- Timing & Strategy
    optimal_posting_time JSONB DEFAULT '{}',
    target_audience VARCHAR(100),
    content_theme VARCHAR(100),
    campaign_fit VARCHAR(100),
    
    -- Performance Prediction
    engagement_prediction DECIMAL(5,2) DEFAULT 0,
    viral_potential DECIMAL(5,2) DEFAULT 0,
    brand_alignment_score DECIMAL(5,2) DEFAULT 0,
    difficulty_score DECIMAL(5,2) DEFAULT 0, -- Implementation difficulty
    
    -- Business Value
    priority_score DECIMAL(5,2) DEFAULT 0,
    expected_roi DECIMAL(5,2) DEFAULT 0,
    strategic_value VARCHAR(20) DEFAULT 'medium' CHECK (
        strategic_value IN ('low', 'medium', 'high', 'critical')
    ),
    
    -- Workflow
    status VARCHAR(50) DEFAULT 'generated' CHECK (
        status IN ('generated', 'reviewed', 'approved', 'scheduled', 'implemented', 'rejected', 'archived')
    ),
    assigned_to UUID,
    reviewed_by UUID,
    implementation_notes TEXT,
    
    -- Related Data
    related_trends JSONB DEFAULT '[]', -- Trend IDs
    related_keywords JSONB DEFAULT '[]', -- Keyword IDs
    related_competitors JSONB DEFAULT '[]', -- Competitor IDs
    inspiration_sources JSONB DEFAULT '[]',
    
    -- System Fields
    created_by UUID,
    expires_at TIMESTAMPTZ, -- When idea becomes stale
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 5. Research Reports Table
-- ====================================================================
CREATE TABLE IF NOT EXISTS research_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Report Basic Info
    title VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL CHECK (
        report_type IN ('trend_analysis', 'competitor_analysis', 'market_research', 'content_audit', 'performance_analysis', 'opportunity_analysis')
    ),
    description TEXT,
    
    -- Report Content
    executive_summary TEXT,
    key_findings JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    methodology TEXT,
    data_sources JSONB DEFAULT '[]',
    
    -- Analysis Period
    analysis_period_start DATE NOT NULL,
    analysis_period_end DATE NOT NULL,
    data_collection_date TIMESTAMPTZ DEFAULT NOW(),
    
    -- Report Data
    raw_data JSONB DEFAULT '{}',
    processed_data JSONB DEFAULT '{}',
    visualizations JSONB DEFAULT '[]', -- Chart/graph configurations
    attachments JSONB DEFAULT '[]',
    
    -- Quality & Confidence
    confidence_score DECIMAL(5,2) DEFAULT 0,
    data_quality_score DECIMAL(5,2) DEFAULT 0,
    sample_size INTEGER DEFAULT 0,
    statistical_significance DECIMAL(5,2) DEFAULT 0,
    
    -- Business Impact
    actionable_insights JSONB DEFAULT '[]',
    priority_actions JSONB DEFAULT '[]',
    expected_impact JSONB DEFAULT '{}',
    implementation_timeline TEXT,
    
    -- Access & Distribution
    access_level VARCHAR(20) DEFAULT 'internal' CHECK (
        access_level IN ('public', 'internal', 'restricted', 'confidential')
    ),
    shared_with JSONB DEFAULT '[]', -- User IDs
    distribution_list JSONB DEFAULT '[]',
    
    -- Automation
    auto_generated BOOLEAN DEFAULT false,
    generation_schedule VARCHAR(50), -- For recurring reports
    next_generation_date DATE,
    
    -- System Fields
    created_by UUID,
    reviewed_by UUID,
    approved_by UUID,
    status VARCHAR(50) DEFAULT 'draft' CHECK (
        status IN ('draft', 'review', 'approved', 'published', 'archived')
    ),
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ====================================================================

-- Competitors Indexes
CREATE INDEX IF NOT EXISTS idx_competitors_industry ON competitors(industry);
CREATE INDEX IF NOT EXISTS idx_competitors_competitive_strength ON competitors(competitive_strength);
CREATE INDEX IF NOT EXISTS idx_competitors_threat_level ON competitors(threat_level);
CREATE INDEX IF NOT EXISTS idx_competitors_last_analyzed ON competitors(last_analyzed_at);
CREATE INDEX IF NOT EXISTS idx_competitors_active ON competitors(is_active);
CREATE INDEX IF NOT EXISTS idx_competitors_tracking ON competitors(tracking_enabled);

-- Trends Indexes
CREATE INDEX IF NOT EXISTS idx_trends_category ON trends(trend_category);
CREATE INDEX IF NOT EXISTS idx_trends_score ON trends(trend_score);
CREATE INDEX IF NOT EXISTS idx_trends_momentum ON trends(momentum);
CREATE INDEX IF NOT EXISTS idx_trends_lifecycle_stage ON trends(lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_trends_first_detected ON trends(first_detected_at);
CREATE INDEX IF NOT EXISTS idx_trends_business_relevance ON trends(business_relevance_score);
CREATE INDEX IF NOT EXISTS idx_trends_active ON trends(is_active);

-- Keywords Indexes
CREATE INDEX IF NOT EXISTS idx_keywords_type ON keywords(keyword_type);
CREATE INDEX IF NOT EXISTS idx_keywords_category ON keywords(category);
CREATE INDEX IF NOT EXISTS idx_keywords_search_volume ON keywords(search_volume);
CREATE INDEX IF NOT EXISTS idx_keywords_competition_level ON keywords(competition_level);
CREATE INDEX IF NOT EXISTS idx_keywords_difficulty_score ON keywords(difficulty_score);
CREATE INDEX IF NOT EXISTS idx_keywords_opportunity_score ON keywords(opportunity_score);
CREATE INDEX IF NOT EXISTS idx_keywords_active ON keywords(is_active);
CREATE INDEX IF NOT EXISTS idx_keywords_tracking ON keywords(tracking_enabled);

-- Content Ideas Indexes
CREATE INDEX IF NOT EXISTS idx_content_ideas_content_type ON content_ideas(content_type);
CREATE INDEX IF NOT EXISTS idx_content_ideas_generation_method ON content_ideas(generation_method);
CREATE INDEX IF NOT EXISTS idx_content_ideas_status ON content_ideas(status);
CREATE INDEX IF NOT EXISTS idx_content_ideas_priority_score ON content_ideas(priority_score);
CREATE INDEX IF NOT EXISTS idx_content_ideas_engagement_prediction ON content_ideas(engagement_prediction);
CREATE INDEX IF NOT EXISTS idx_content_ideas_viral_potential ON content_ideas(viral_potential);
CREATE INDEX IF NOT EXISTS idx_content_ideas_assigned_to ON content_ideas(assigned_to);
CREATE INDEX IF NOT EXISTS idx_content_ideas_expires_at ON content_ideas(expires_at);
CREATE INDEX IF NOT EXISTS idx_content_ideas_active ON content_ideas(is_active);

-- Research Reports Indexes
CREATE INDEX IF NOT EXISTS idx_research_reports_type ON research_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_research_reports_status ON research_reports(status);
CREATE INDEX IF NOT EXISTS idx_research_reports_period_start ON research_reports(analysis_period_start);
CREATE INDEX IF NOT EXISTS idx_research_reports_period_end ON research_reports(analysis_period_end);
CREATE INDEX IF NOT EXISTS idx_research_reports_confidence ON research_reports(confidence_score);
CREATE INDEX IF NOT EXISTS idx_research_reports_created_by ON research_reports(created_by);
CREATE INDEX IF NOT EXISTS idx_research_reports_active ON research_reports(is_active);

-- GIN Indexes for JSONB fields
CREATE INDEX IF NOT EXISTS idx_competitors_social_accounts ON competitors USING gin(social_accounts);
CREATE INDEX IF NOT EXISTS idx_competitors_geographic_focus ON competitors USING gin(geographic_focus);
CREATE INDEX IF NOT EXISTS idx_trends_related_keywords ON trends USING gin(related_keywords);
CREATE INDEX IF NOT EXISTS idx_trends_related_hashtags ON trends USING gin(related_hashtags);
CREATE INDEX IF NOT EXISTS idx_keywords_platform_performance ON keywords USING gin(platform_performance);
CREATE INDEX IF NOT EXISTS idx_content_ideas_target_platforms ON content_ideas USING gin(target_platforms);
CREATE INDEX IF NOT EXISTS idx_content_ideas_suggested_hashtags ON content_ideas USING gin(suggested_hashtags);
CREATE INDEX IF NOT EXISTS idx_research_reports_key_findings ON research_reports USING gin(key_findings);

-- ====================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ====================================================================

CREATE TRIGGER competitors_updated_at
    BEFORE UPDATE ON competitors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trends_updated_at
    BEFORE UPDATE ON trends
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER keywords_updated_at
    BEFORE UPDATE ON keywords
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER content_ideas_updated_at
    BEFORE UPDATE ON content_ideas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER research_reports_updated_at
    BEFORE UPDATE ON research_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- ROW LEVEL SECURITY POLICIES
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_reports ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be enhanced based on specific security requirements)
CREATE POLICY "Users can view all competitors" ON competitors FOR SELECT USING (true);
CREATE POLICY "Users can view all trends" ON trends FOR SELECT USING (true);
CREATE POLICY "Users can view all keywords" ON keywords FOR SELECT USING (true);
CREATE POLICY "Users can view all content ideas" ON content_ideas FOR SELECT USING (true);
CREATE POLICY "Users can view research reports based on access level" ON research_reports FOR SELECT 
USING (access_level IN ('public', 'internal') OR auth.uid() = created_by);

-- Insert/Update policies (can be restricted based on roles)
CREATE POLICY "Authenticated users can insert competitors" ON competitors FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert trends" ON trends FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert keywords" ON keywords FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert content ideas" ON content_ideas FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert research reports" ON research_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Update policies
CREATE POLICY "Users can update competitors they created" ON competitors FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can update content ideas they created or are assigned to" ON content_ideas FOR UPDATE 
USING (auth.uid() = created_by OR auth.uid() = assigned_to);
CREATE POLICY "Users can update research reports they created" ON research_reports FOR UPDATE USING (auth.uid() = created_by);

-- ====================================================================
-- UTILITY FUNCTIONS
-- ====================================================================

-- Function to calculate trend momentum based on score changes
CREATE OR REPLACE FUNCTION calculate_trend_momentum(
    p_trend_id UUID,
    p_current_score DECIMAL(5,2),
    p_days_lookback INTEGER DEFAULT 7
) RETURNS VARCHAR(20) AS $$
DECLARE
    v_previous_score DECIMAL(5,2);
    v_score_change DECIMAL(5,2);
    v_momentum VARCHAR(20);
BEGIN
    -- This is a simplified version - in practice, you'd track score history
    -- For now, we'll use a basic calculation
    
    IF p_current_score >= 80 THEN
        v_momentum := 'explosive';
    ELSIF p_current_score >= 60 THEN
        v_momentum := 'growing';
    ELSIF p_current_score >= 40 THEN
        v_momentum := 'stable';
    ELSE
        v_momentum := 'declining';
    END IF;
    
    RETURN v_momentum;
END;
$$ LANGUAGE plpgsql;

-- Function to update competitor analysis priority based on threat level and strength
CREATE OR REPLACE FUNCTION update_competitor_priority() RETURNS TRIGGER AS $$
BEGIN
    -- Auto-calculate analysis priority based on competitive strength and threat level
    IF NEW.competitive_strength = 'very_high' AND NEW.threat_level IN ('high', 'critical') THEN
        NEW.analysis_priority := 'urgent';
    ELSIF NEW.competitive_strength = 'high' OR NEW.threat_level = 'high' THEN
        NEW.analysis_priority := 'high';
    ELSIF NEW.competitive_strength = 'medium' OR NEW.threat_level = 'medium' THEN
        NEW.analysis_priority := 'medium';
    ELSE
        NEW.analysis_priority := 'low';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set competitor priority
CREATE TRIGGER competitor_priority_trigger
    BEFORE INSERT OR UPDATE ON competitors
    FOR EACH ROW
    EXECUTE FUNCTION update_competitor_priority(); 