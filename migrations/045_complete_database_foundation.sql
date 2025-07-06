-- ====================================================================
-- Complete Database Foundation Migration
-- Task 70: Perfect N8N ↔ Supabase ↔ Dashboard Integration
-- ====================================================================
-- This migration adds all missing tables identified in the database audit
-- for seamless integration between n8n workflows, Supabase and the marketing dashboard

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ====================================================================
-- 1. PRODUCTS TABLE - Required for N8N Fortune 500 AI Agent Workflow
-- ====================================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10,2),
    inventory_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    -- Product attributes for AI matching
    tags JSONB DEFAULT '[]'::jsonb,
    keywords JSONB DEFAULT '[]'::jsonb,
    benefits JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    
    -- URLs and media
    product_url TEXT,
    image_urls JSONB DEFAULT '[]'::jsonb,
    
    -- SEO and marketing
    meta_title VARCHAR(255),
    meta_description TEXT,
    search_keywords JSONB DEFAULT '[]'::jsonb,
    
    -- Analytics
    popularity_score DECIMAL(5,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    
    -- System fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 2. AI INTELLIGENCE SESSIONS - Required for AI Agent Session Tracking
-- ====================================================================
CREATE TABLE IF NOT EXISTS ai_intelligence_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    session_type VARCHAR(100) NOT NULL,
    
    -- AI configuration
    ai_agents_used JSONB DEFAULT '[]'::jsonb,
    model_configuration JSONB DEFAULT '{}'::jsonb,
    
    -- Session metrics
    topics_identified INTEGER DEFAULT 0,
    products_matched INTEGER DEFAULT 0,
    quality_score INTEGER DEFAULT 0,
    consensus_strength INTEGER DEFAULT 0,
    deployment_ready_count INTEGER DEFAULT 0,
    
    -- Session data
    session_data JSONB DEFAULT '{}'::jsonb,
    agent_reasoning_logs JSONB DEFAULT '{}'::jsonb,
    strategic_insights JSONB DEFAULT '[]'::jsonb,
    executive_recommendations JSONB DEFAULT '[]'::jsonb,
    
    -- Cost and performance
    cost_analysis JSONB DEFAULT '{}'::jsonb,
    execution_time_ms INTEGER DEFAULT 0,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 3. CONTENT TOPICS - Enhanced Topic Management
-- ====================================================================
CREATE TABLE IF NOT EXISTS content_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    
    -- Trend analysis
    trend_score DECIMAL(5,2) DEFAULT 0,
    momentum_score DECIMAL(5,2) DEFAULT 0,
    lifecycle_stage VARCHAR(50) CHECK (lifecycle_stage IN ('emerging', 'growth', 'peak', 'decline', 'stable')),
    
    -- Platform analysis
    platform_suitability JSONB DEFAULT '{}'::jsonb,
    optimal_timing JSONB DEFAULT '{}'::jsonb,
    
    -- Content strategy
    associated_products JSONB DEFAULT '[]'::jsonb,
    content_angles JSONB DEFAULT '[]'::jsonb,
    hashtag_suggestions JSONB DEFAULT '[]'::jsonb,
    
    -- Performance predictions
    engagement_prediction DECIMAL(5,2) DEFAULT 0,
    conversion_prediction DECIMAL(5,2) DEFAULT 0,
    
    -- AI insights
    ai_generated BOOLEAN DEFAULT false,
    confidence_score DECIMAL(5,2) DEFAULT 0,
    validation_status VARCHAR(50) DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'rejected')),
    
    -- Lifecycle tracking
    discovered_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    last_used TIMESTAMPTZ,
    usage_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 4. CAMPAIGNS - Marketing Campaign Management
-- ====================================================================
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) NOT NULL CHECK (campaign_type IN ('awareness', 'engagement', 'conversion', 'retention', 'seasonal', 'product_launch')),
    
    -- Campaign status and dates
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'planning', 'active', 'paused', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    
    -- Budget and resources
    budget DECIMAL(10,2),
    spent_budget DECIMAL(10,2) DEFAULT 0,
    
    -- Targeting
    target_audience JSONB DEFAULT '{}'::jsonb,
    target_platforms JSONB DEFAULT '[]'::jsonb,
    geographic_targeting JSONB DEFAULT '{}'::jsonb,
    
    -- Objectives and KPIs
    objectives JSONB DEFAULT '[]'::jsonb,
    kpis JSONB DEFAULT '{}'::jsonb,
    success_metrics JSONB DEFAULT '{}'::jsonb,
    
    -- Content association
    associated_topics JSONB DEFAULT '[]'::jsonb,
    associated_products JSONB DEFAULT '[]'::jsonb,
    
    -- Performance tracking
    total_reach INTEGER DEFAULT 0,
    total_engagement INTEGER DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    roi DECIMAL(10,2) DEFAULT 0,
    
    -- Team
    campaign_manager_id UUID,
    team_members JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 5. MEDIA ASSETS - Image/Video Management for MarketingManager Workflow
-- ====================================================================
CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('image', 'video', 'audio', 'document', 'animation', 'template')),
    
    -- File details
    file_url TEXT NOT NULL,
    file_size INTEGER,
    file_format VARCHAR(20),
    dimensions JSONB DEFAULT '{}'::jsonb, -- {width: 1920, height: 1080}
    duration_seconds INTEGER, -- For video/audio
    
    -- Metadata
    alt_text TEXT,
    description TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    
    -- Usage and rights
    usage_rights VARCHAR(100),
    license_type VARCHAR(50),
    usage_restrictions TEXT,
    
    -- AI analysis
    ai_generated BOOLEAN DEFAULT false,
    ai_tags JSONB DEFAULT '[]'::jsonb,
    color_palette JSONB DEFAULT '[]'::jsonb,
    dominant_colors JSONB DEFAULT '[]'::jsonb,
    
    -- Performance tracking
    usage_count INTEGER DEFAULT 0,
    performance_score DECIMAL(5,2) DEFAULT 0,
    
    -- Organization
    folder_path VARCHAR(500),
    collection_id UUID,
    
    -- System fields
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 6. BLOG POSTS - Blog Content Management
-- ====================================================================
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    
    -- Content structure
    content_structure JSONB DEFAULT '{}'::jsonb, -- headings, sections, etc.
    word_count INTEGER DEFAULT 0,
    reading_time_minutes INTEGER DEFAULT 0,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    seo_keywords JSONB DEFAULT '[]'::jsonb,
    featured_image_url TEXT,
    
    -- Status and workflow
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived')),
    scheduled_publish_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    
    -- Categorization
    category VARCHAR(100),
    tags JSONB DEFAULT '[]'::jsonb,
    topic_id UUID REFERENCES content_topics(id),
    
    -- Analytics
    views INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    
    -- AI analysis
    ai_generated BOOLEAN DEFAULT false,
    ai_prompt TEXT,
    content_quality_score DECIMAL(5,2) DEFAULT 0,
    readability_score DECIMAL(5,2) DEFAULT 0,
    
    -- Authoring
    author_id UUID,
    editor_id UUID,
    target_audience VARCHAR(100),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 7. AUTOMATION RULES - Marketing Automation Logic
-- ====================================================================
CREATE TABLE IF NOT EXISTS automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('trigger', 'action', 'condition', 'workflow')),
    
    -- Rule configuration
    trigger_conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    conditions JSONB DEFAULT '{}'::jsonb,
    
    -- Execution settings
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    execution_limit INTEGER, -- Max executions per period
    execution_period VARCHAR(20) DEFAULT 'daily', -- daily, weekly, monthly
    
    -- Performance tracking
    execution_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    last_executed TIMESTAMPTZ,
    last_success TIMESTAMPTZ,
    last_failure TIMESTAMPTZ,
    
    -- Error handling
    retry_count INTEGER DEFAULT 3,
    error_handling JSONB DEFAULT '{}'::jsonb,
    last_error TEXT,
    
    -- Scheduling
    schedule_pattern VARCHAR(100), -- cron-like pattern
    next_execution TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 8. CONTENT TEMPLATES - Template Management
-- ====================================================================
CREATE TABLE IF NOT EXISTS content_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(255) NOT NULL,
    template_type VARCHAR(50) NOT NULL CHECK (template_type IN ('post', 'story', 'email', 'blog', 'ad', 'carousel')),
    
    -- Template content
    template_content TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb, -- Dynamic variables
    
    -- Template properties
    category VARCHAR(100),
    tags JSONB DEFAULT '[]'::jsonb,
    target_platforms JSONB DEFAULT '[]'::jsonb,
    
    -- Usage and performance
    usage_count INTEGER DEFAULT 0,
    performance_score DECIMAL(5,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    
    -- AI insights
    ai_optimized BOOLEAN DEFAULT false,
    optimization_suggestions JSONB DEFAULT '[]'::jsonb,
    
    -- Access control
    is_public BOOLEAN DEFAULT false,
    created_by UUID,
    team_access JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 9. PRODUCT CONTENT MAPPING - Link Products to Content
-- ====================================================================
CREATE TABLE IF NOT EXISTS product_content_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    content_post_id UUID REFERENCES content_posts(id) ON DELETE CASCADE,
    blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES content_topics(id) ON DELETE CASCADE,
    
    -- Mapping details
    mapping_type VARCHAR(50) NOT NULL CHECK (mapping_type IN ('featured', 'mentioned', 'related', 'sponsored')),
    relevance_score DECIMAL(5,2) DEFAULT 0,
    match_reasoning TEXT,
    
    -- Performance
    click_through_rate DECIMAL(5,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure at least one content reference
    CONSTRAINT check_content_reference CHECK (
        (content_post_id IS NOT NULL) OR 
        (blog_post_id IS NOT NULL) OR 
        (topic_id IS NOT NULL)
    )
);

-- ====================================================================
-- 10. CAMPAIGN PERFORMANCE - Campaign Analytics
-- ====================================================================
CREATE TABLE IF NOT EXISTS campaign_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    
    -- Performance metrics
    date DATE NOT NULL,
    platform VARCHAR(50),
    
    -- Engagement metrics
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    
    -- Conversion metrics
    conversions INTEGER DEFAULT 0,
    conversion_value DECIMAL(10,2) DEFAULT 0,
    cost_per_conversion DECIMAL(10,2) DEFAULT 0,
    
    -- Financial metrics
    spend DECIMAL(10,2) DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    roi DECIMAL(10,2) DEFAULT 0,
    
    -- Calculated metrics
    ctr DECIMAL(5,2) DEFAULT 0, -- Click-through rate
    cpm DECIMAL(10,2) DEFAULT 0, -- Cost per mille
    cpc DECIMAL(10,2) DEFAULT 0, -- Cost per click
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(campaign_id, date, platform)
);

-- ====================================================================
-- INDEXES FOR PERFORMANCE
-- ====================================================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_popularity ON products(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_products_keywords ON products USING gin(keywords);

-- AI Sessions indexes
CREATE INDEX IF NOT EXISTS idx_ai_sessions_session_id ON ai_intelligence_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_type ON ai_intelligence_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_status ON ai_intelligence_sessions(status);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_created_at ON ai_intelligence_sessions(created_at DESC);

-- Content Topics indexes
CREATE INDEX IF NOT EXISTS idx_content_topics_category ON content_topics(category);
CREATE INDEX IF NOT EXISTS idx_content_topics_trend_score ON content_topics(trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_content_topics_lifecycle ON content_topics(lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_content_topics_validation ON content_topics(validation_status);
CREATE INDEX IF NOT EXISTS idx_content_topics_platform_suitability ON content_topics USING gin(platform_suitability);

-- Campaigns indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_manager ON campaigns(campaign_manager_id);

-- Media Assets indexes
CREATE INDEX IF NOT EXISTS idx_media_assets_type ON media_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_created_by ON media_assets(created_by);
CREATE INDEX IF NOT EXISTS idx_media_assets_tags ON media_assets USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_media_assets_usage ON media_assets(usage_count DESC);

-- Blog Posts indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_topic ON blog_posts(topic_id);

-- Automation Rules indexes
CREATE INDEX IF NOT EXISTS idx_automation_rules_type ON automation_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_automation_rules_active ON automation_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_automation_rules_next_execution ON automation_rules(next_execution);
CREATE INDEX IF NOT EXISTS idx_automation_rules_priority ON automation_rules(priority DESC);

-- Content Templates indexes
CREATE INDEX IF NOT EXISTS idx_content_templates_type ON content_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_content_templates_category ON content_templates(category);
CREATE INDEX IF NOT EXISTS idx_content_templates_usage ON content_templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_content_templates_public ON content_templates(is_public);

-- Product Content Mapping indexes
CREATE INDEX IF NOT EXISTS idx_product_content_mapping_product ON product_content_mapping(product_id);
CREATE INDEX IF NOT EXISTS idx_product_content_mapping_content ON product_content_mapping(content_post_id);
CREATE INDEX IF NOT EXISTS idx_product_content_mapping_blog ON product_content_mapping(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_product_content_mapping_topic ON product_content_mapping(topic_id);
CREATE INDEX IF NOT EXISTS idx_product_content_mapping_type ON product_content_mapping(mapping_type);

-- Campaign Performance indexes
CREATE INDEX IF NOT EXISTS idx_campaign_performance_campaign ON campaign_performance(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_performance_date ON campaign_performance(date DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_performance_platform ON campaign_performance(platform);
CREATE INDEX IF NOT EXISTS idx_campaign_performance_roi ON campaign_performance(roi DESC);

-- ====================================================================
-- TRIGGERS FOR UPDATED_AT
-- ====================================================================

-- Create or replace the update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at columns
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER content_topics_updated_at BEFORE UPDATE ON content_topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER media_assets_updated_at BEFORE UPDATE ON media_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER automation_rules_updated_at BEFORE UPDATE ON automation_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER content_templates_updated_at BEFORE UPDATE ON content_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- VIEWS FOR ENHANCED FUNCTIONALITY
-- ====================================================================

-- Product Performance View
CREATE OR REPLACE VIEW product_performance_summary AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.category,
    p.popularity_score,
    COUNT(pcm.id) as content_mentions,
    AVG(pcm.relevance_score) as avg_relevance_score,
    AVG(pcm.conversion_rate) as avg_conversion_rate,
    p.created_at
FROM products p
LEFT JOIN product_content_mapping pcm ON p.id = pcm.product_id
WHERE p.is_active = true
GROUP BY p.id, p.name, p.sku, p.category, p.popularity_score, p.created_at
ORDER BY p.popularity_score DESC;

-- Campaign ROI Summary View
CREATE OR REPLACE VIEW campaign_roi_summary AS
SELECT 
    c.id,
    c.name,
    c.campaign_type,
    c.status,
    c.budget,
    c.spent_budget,
    SUM(cp.revenue) as total_revenue,
    SUM(cp.spend) as total_spend,
    AVG(cp.roi) as avg_roi,
    SUM(cp.conversions) as total_conversions,
    c.start_date,
    c.end_date
FROM campaigns c
LEFT JOIN campaign_performance cp ON c.id = cp.campaign_id
GROUP BY c.id, c.name, c.campaign_type, c.status, c.budget, c.spent_budget, c.start_date, c.end_date
ORDER BY avg_roi DESC NULLS LAST;

-- Content Topic Trends View
CREATE OR REPLACE VIEW content_topic_trends AS
SELECT 
    ct.id,
    ct.topic_name,
    ct.category,
    ct.trend_score,
    ct.momentum_score,
    ct.lifecycle_stage,
    ct.confidence_score,
    COUNT(cp.id) as content_posts_count,
    COUNT(bp.id) as blog_posts_count,
    ct.discovered_at,
    ct.last_used
FROM content_topics ct
LEFT JOIN content_posts cp ON ct.id::text = ANY(SELECT jsonb_array_elements_text(cp.platform_specific_content->'topic_ids'))
LEFT JOIN blog_posts bp ON ct.id = bp.topic_id
WHERE ct.validation_status = 'validated'
GROUP BY ct.id, ct.topic_name, ct.category, ct.trend_score, ct.momentum_score, 
         ct.lifecycle_stage, ct.confidence_score, ct.discovered_at, ct.last_used
ORDER BY ct.trend_score DESC, ct.momentum_score DESC;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on all new tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_intelligence_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_content_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_performance ENABLE ROW LEVEL SECURITY;

-- Service role policies (full access)
CREATE POLICY "Service role full access" ON products FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON ai_intelligence_sessions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON content_topics FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON campaigns FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON media_assets FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON blog_posts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON automation_rules FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON content_templates FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON product_content_mapping FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON campaign_performance FOR ALL USING (auth.role() = 'service_role');

-- Authenticated user policies (read access, limited write)
CREATE POLICY "Authenticated users can read" ON products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read" ON ai_intelligence_sessions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read" ON content_topics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read" ON campaigns FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read" ON media_assets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read" ON blog_posts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read" ON automation_rules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read" ON content_templates FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read" ON product_content_mapping FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read" ON campaign_performance FOR SELECT USING (auth.role() = 'authenticated');

-- ====================================================================
-- SAMPLE DATA FOR TESTING
-- ====================================================================

-- Insert sample products for n8n workflow testing
INSERT INTO products (name, sku, description, category, price, inventory_count, tags, keywords, benefits) VALUES
('Anti-Aging Serum Pro', 'SER-001', 'Advanced anti-aging serum with retinol and hyaluronic acid', 'skincare', 49.99, 100, '["anti-aging", "serum", "retinol"]', '["wrinkles", "fine lines", "aging"]', '["reduces wrinkles", "firms skin", "hydrates"]'),
('Vitamin C Brightening Cream', 'CRM-002', 'Brightening face cream with vitamin C and niacinamide', 'skincare', 34.99, 75, '["vitamin-c", "brightening", "cream"]', '["dark spots", "pigmentation", "glow"]', '["brightens skin", "evens tone", "antioxidant protection"]'),
('Hydrating Face Mask', 'MSK-003', 'Intensive hydrating mask for dry and sensitive skin', 'skincare', 24.99, 50, '["hydrating", "mask", "sensitive-skin"]', '["dry skin", "hydration", "sensitive"]', '["deep hydration", "soothes skin", "restores moisture"]')
ON CONFLICT (sku) DO NOTHING;

-- Insert sample content topics
INSERT INTO content_topics (topic_name, category, trend_score, momentum_score, lifecycle_stage, platform_suitability) VALUES
('Glass Skin Trend', 'skincare-trends', 85.5, 92.0, 'growth', '{"instagram": 95, "tiktok": 90, "youtube": 75}'),
('Sustainable Beauty', 'sustainability', 78.2, 85.5, 'growth', '{"instagram": 80, "linkedin": 90, "pinterest": 85}'),
('K-Beauty Routine', 'beauty-routines', 72.8, 68.5, 'stable', '{"instagram": 88, "tiktok": 85, "youtube": 92}')
ON CONFLICT DO NOTHING;

-- Insert sample campaign
INSERT INTO campaigns (name, description, campaign_type, status, start_date, end_date, budget, target_platforms) VALUES
('Winter Skincare Launch', 'Launch campaign for new winter skincare products', 'product_launch', 'planning', '2024-12-01', '2024-12-31', 5000.00, '["instagram", "facebook", "tiktok"]')
ON CONFLICT DO NOTHING;

-- ====================================================================
-- COMPLETION LOGGING
-- ====================================================================

-- Log the completion of this migration
DO $$ 
BEGIN 
    RAISE NOTICE 'Database Foundation Migration Completed Successfully';
    RAISE NOTICE 'Tables Created: products, ai_intelligence_sessions, content_topics, campaigns';
    RAISE NOTICE 'Tables Created: media_assets, blog_posts, automation_rules, content_templates';
    RAISE NOTICE 'Tables Created: product_content_mapping, campaign_performance';
    RAISE NOTICE 'Views Created: product_performance_summary, campaign_roi_summary, content_topic_trends';
    RAISE NOTICE 'Ready for N8N ↔ Supabase ↔ Dashboard Integration';
END $$; 