-- 🚀 MARKETING MACHINE - ONTBREKENDE TABELLEN AANMAKEN
-- Voer dit script uit in je Supabase SQL Editor

-- ==================================================================
-- 1. AUTOMATION_WORKFLOWS TABEL
-- ==================================================================
CREATE TABLE IF NOT EXISTS public.automation_workflows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workflow_type VARCHAR(50) NOT NULL, -- 'content_creation', 'posting', 'analytics', 'social_media'
    n8n_workflow_id VARCHAR(100), -- Verwijzing naar n8n workflow
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'disabled'
    trigger_conditions JSONB, -- Voorwaarden wanneer workflow wordt getriggerd
    workflow_config JSONB, -- Workflow configuratie en parameters
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    run_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================================================================
-- 2. CAMPAIGNS TABEL  
-- ==================================================================
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) NOT NULL, -- 'content', 'social_media', 'email', 'paid_ads'
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    target_audience JSONB, -- Doelgroep definitie
    budget_total DECIMAL(10,2),
    budget_spent DECIMAL(10,2) DEFAULT 0,
    goals JSONB, -- Campaign doelstellingen en KPIs
    platforms JSONB, -- Platforms waar campaign loopt ['instagram', 'linkedin', 'facebook', 'twitter']
    content_calendar_id UUID REFERENCES public.content_calendar(id),
    automation_workflow_id UUID REFERENCES public.automation_workflows(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================================================================
-- 3. CAMPAIGN_PERFORMANCE TABEL
-- ==================================================================
CREATE TABLE IF NOT EXISTS public.campaign_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'instagram', 'linkedin', 'facebook', 'twitter', 'email'
    date_recorded DATE NOT NULL,
    
    -- Engagement Metrics
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    
    -- Conversion Metrics  
    conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    cost_per_conversion DECIMAL(8,2) DEFAULT 0,
    
    -- Financial Metrics
    spend_amount DECIMAL(10,2) DEFAULT 0,
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    roas DECIMAL(8,2) DEFAULT 0, -- Return on Ad Spend
    
    -- Platform-specific data
    platform_data JSONB, -- Extra platform-specifieke metrics
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(campaign_id, platform, date_recorded)
);

-- ==================================================================
-- 4. CONTENT_ANALYTICS TABEL
-- ==================================================================
CREATE TABLE IF NOT EXISTS public.content_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_post_id UUID NOT NULL REFERENCES public.content_posts(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    platform_post_id VARCHAR(255), -- ID van post op het platform
    
    -- Timing Analytics
    posted_at TIMESTAMPTZ,
    analyzed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Performance Metrics
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    
    -- Engagement Rates
    engagement_rate DECIMAL(5,2) DEFAULT 0, -- (likes + comments + shares) / reach * 100
    click_through_rate DECIMAL(5,2) DEFAULT 0, -- clicks / impressions * 100
    
    -- Audience Demographics (als beschikbaar)
    audience_demographics JSONB,
    
    -- Best performing times
    peak_engagement_hour INTEGER, -- 0-23
    
    -- Sentiment Analysis
    sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
    sentiment_category VARCHAR(20), -- 'positive', 'neutral', 'negative'
    
    -- Platform-specific metrics
    platform_metrics JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================================================================
-- 5. LEARNING_PATTERNS TABEL
-- ==================================================================
CREATE TABLE IF NOT EXISTS public.learning_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Pattern Identificatie
    pattern_type VARCHAR(50) NOT NULL, -- 'content_performance', 'audience_behavior', 'posting_time', 'platform_preference'
    pattern_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Pattern Data
    pattern_data JSONB NOT NULL, -- De eigenlijke pattern data en metrics
    confidence_score DECIMAL(3,2) NOT NULL, -- 0.0 - 1.0
    sample_size INTEGER NOT NULL, -- Aantal data punten gebruikt voor pattern
    
    -- Filters en Context
    platform VARCHAR(50), -- Als pattern platform-specifiek is
    content_type VARCHAR(50), -- Als pattern content-type specifiek is
    date_range_start DATE,
    date_range_end DATE,
    
    -- Pattern Validatie
    is_validated BOOLEAN DEFAULT FALSE,
    validation_accuracy DECIMAL(5,2), -- Hoe accuraat pattern is bij validation
    
    -- Aanbevelingen gebaseerd op pattern
    recommendations JSONB, -- Automatisch gegenereerde aanbevelingen
    
    -- Pattern Lifecycle
    first_detected_at TIMESTAMPTZ DEFAULT NOW(),
    last_validated_at TIMESTAMPTZ,
    next_validation_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'outdated', 'invalidated'
    
    -- Metadata
    created_by_system BOOLEAN DEFAULT TRUE, -- TRUE als auto-detected, FALSE als handmatig
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================================================================
-- INDEXEN VOOR PERFORMANCE OPTIMALISATIE
-- ==================================================================

-- Automation Workflows Indexen
CREATE INDEX IF NOT EXISTS idx_automation_workflows_type ON public.automation_workflows(workflow_type);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_status ON public.automation_workflows(status);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_next_run ON public.automation_workflows(next_run_at) WHERE status = 'active';

-- Campaigns Indexen  
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON public.campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON public.campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON public.campaigns(created_by);

-- Campaign Performance Indexen
CREATE INDEX IF NOT EXISTS idx_campaign_performance_campaign ON public.campaign_performance(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_performance_platform ON public.campaign_performance(platform);
CREATE INDEX IF NOT EXISTS idx_campaign_performance_date ON public.campaign_performance(date_recorded);
CREATE INDEX IF NOT EXISTS idx_campaign_performance_composite ON public.campaign_performance(campaign_id, platform, date_recorded);

-- Content Analytics Indexen
CREATE INDEX IF NOT EXISTS idx_content_analytics_post ON public.content_analytics(content_post_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_platform ON public.content_analytics(platform);
CREATE INDEX IF NOT EXISTS idx_content_analytics_posted_at ON public.content_analytics(posted_at);
CREATE INDEX IF NOT EXISTS idx_content_analytics_engagement ON public.content_analytics(engagement_rate) WHERE engagement_rate > 0;

-- Learning Patterns Indexen
CREATE INDEX IF NOT EXISTS idx_learning_patterns_type ON public.learning_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_platform ON public.learning_patterns(platform);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_confidence ON public.learning_patterns(confidence_score);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_status ON public.learning_patterns(status);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_validation ON public.learning_patterns(next_validation_at) WHERE status = 'active';

-- ==================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==================================================================

-- Enable RLS op alle nieuwe tabellen
ALTER TABLE public.automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_patterns ENABLE ROW LEVEL SECURITY;

-- Automation Workflows RLS
CREATE POLICY "Users can view own automation workflows" ON public.automation_workflows
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create automation workflows" ON public.automation_workflows
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own automation workflows" ON public.automation_workflows
    FOR UPDATE USING (created_by = auth.uid());

-- Campaigns RLS
CREATE POLICY "Users can view own campaigns" ON public.campaigns
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create campaigns" ON public.campaigns
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own campaigns" ON public.campaigns
    FOR UPDATE USING (created_by = auth.uid());

-- Campaign Performance RLS (gebaseerd op campaign ownership)
CREATE POLICY "Users can view campaign performance for own campaigns" ON public.campaign_performance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.campaigns 
            WHERE campaigns.id = campaign_performance.campaign_id 
            AND campaigns.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert campaign performance for own campaigns" ON public.campaign_performance
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.campaigns 
            WHERE campaigns.id = campaign_performance.campaign_id 
            AND campaigns.created_by = auth.uid()
        )
    );

-- Content Analytics RLS (gebaseerd op content post ownership)
CREATE POLICY "Users can view content analytics for own posts" ON public.content_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.content_posts 
            WHERE content_posts.id = content_analytics.content_post_id 
            AND content_posts.created_by::uuid = auth.uid()
        )
    );

CREATE POLICY "Users can insert content analytics for own posts" ON public.content_analytics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.content_posts 
            WHERE content_posts.id = content_analytics.content_post_id 
            AND content_posts.created_by::uuid = auth.uid()
        )
    );

-- Learning Patterns RLS
CREATE POLICY "Users can view all learning patterns" ON public.learning_patterns
    FOR SELECT USING (true); -- Learning patterns zijn gedeeld voor alle gebruikers

CREATE POLICY "Admins can manage learning patterns" ON public.learning_patterns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role IN ('admin', 'super_admin')
        )
    );

-- ==================================================================
-- TRIGGERS VOOR UPDATED_AT TIMESTAMPS
-- ==================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers toevoegen aan alle nieuwe tabellen
CREATE TRIGGER update_automation_workflows_updated_at 
    BEFORE UPDATE ON public.automation_workflows 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at 
    BEFORE UPDATE ON public.campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_performance_updated_at 
    BEFORE UPDATE ON public.campaign_performance 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_analytics_updated_at 
    BEFORE UPDATE ON public.content_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_patterns_updated_at 
    BEFORE UPDATE ON public.learning_patterns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================================================================
-- VALIDATIE: CONTROLEER OF ALLE TABELLEN ZIJN AANGEMAAKT
-- ==================================================================

SELECT 
    'VALIDATION CHECK' as section,
    table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = tables_to_check.table_name
        ) THEN '✅ CREATED SUCCESSFULLY' 
        ELSE '❌ CREATION FAILED' 
    END as status
FROM (
    VALUES 
        ('automation_workflows'),
        ('campaigns'),
        ('campaign_performance'),
        ('content_analytics'),
        ('learning_patterns')
) AS tables_to_check(table_name)
ORDER BY table_name; 