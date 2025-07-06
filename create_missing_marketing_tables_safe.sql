-- 🚀 MARKETING MACHINE - ONTBREKENDE TABELLEN (TYPE-SAFE VERSIE)
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
    error_count INTEGER DEFAULT 0,
    created_by TEXT, -- TEXT type voor consistency
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.automation_workflows ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own workflows" ON public.automation_workflows
    FOR SELECT USING (
        created_by IS NULL OR 
        created_by = '' OR 
        created_by = auth.uid()::text OR
        (created_by ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
         AND created_by::uuid = auth.uid())
    );

CREATE POLICY "Users can create workflows" ON public.automation_workflows
    FOR INSERT WITH CHECK (created_by = auth.uid()::text);

CREATE POLICY "Users can update own workflows" ON public.automation_workflows
    FOR UPDATE USING (
        created_by IS NULL OR 
        created_by = '' OR 
        created_by = auth.uid()::text OR
        (created_by ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
         AND created_by::uuid = auth.uid())
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_automation_workflows_type ON public.automation_workflows(workflow_type);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_status ON public.automation_workflows(status);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_next_run ON public.automation_workflows(next_run_at);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_created_by ON public.automation_workflows(created_by);

-- ==================================================================
-- 2. CAMPAIGNS TABEL
-- ==================================================================
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) NOT NULL, -- 'social_media', 'email', 'content', 'paid_ads'
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed', 'cancelled'
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    budget_total DECIMAL(10,2),
    budget_spent DECIMAL(10,2) DEFAULT 0,
    target_audience JSONB, -- Doelgroep definities
    campaign_config JSONB, -- Campaign specifieke configuratie
    goals JSONB, -- Campaign doelstellingen en KPIs
    automation_workflow_id UUID, -- Link naar automation workflow
    created_by TEXT, -- TEXT type voor consistency
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own campaigns" ON public.campaigns
    FOR SELECT USING (
        created_by IS NULL OR 
        created_by = '' OR 
        created_by = auth.uid()::text OR
        (created_by ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
         AND created_by::uuid = auth.uid())
    );

CREATE POLICY "Users can create campaigns" ON public.campaigns
    FOR INSERT WITH CHECK (created_by = auth.uid()::text);

CREATE POLICY "Users can update own campaigns" ON public.campaigns
    FOR UPDATE USING (
        created_by IS NULL OR 
        created_by = '' OR 
        created_by = auth.uid()::text OR
        (created_by ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
         AND created_by::uuid = auth.uid())
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON public.campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON public.campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON public.campaigns(created_by);

-- ==================================================================
-- 3. CAMPAIGN_PERFORMANCE TABEL
-- ==================================================================
CREATE TABLE IF NOT EXISTS public.campaign_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL,
    metric_date DATE NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    cost DECIMAL(10,2) DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    engagement_rate DECIMAL(5,4) DEFAULT 0, -- Percentage as decimal
    click_through_rate DECIMAL(5,4) DEFAULT 0,
    conversion_rate DECIMAL(5,4) DEFAULT 0,
    return_on_ad_spend DECIMAL(10,4) DEFAULT 0,
    custom_metrics JSONB, -- Flexibele metrics per campaign type
    data_source VARCHAR(50), -- 'facebook', 'google', 'linkedin', 'manual', etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.campaign_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies (gebaseerd op campaign ownership)
CREATE POLICY "Users can view performance for own campaigns" ON public.campaign_performance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.campaigns 
            WHERE campaigns.id = campaign_performance.campaign_id 
            AND (
                campaigns.created_by IS NULL OR 
                campaigns.created_by = '' OR 
                campaigns.created_by = auth.uid()::text OR
                (campaigns.created_by ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
                 AND campaigns.created_by::uuid = auth.uid())
            )
        )
    );

CREATE POLICY "Users can insert performance for own campaigns" ON public.campaign_performance
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.campaigns 
            WHERE campaigns.id = campaign_performance.campaign_id 
            AND (
                campaigns.created_by IS NULL OR 
                campaigns.created_by = '' OR 
                campaigns.created_by = auth.uid()::text OR
                (campaigns.created_by ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
                 AND campaigns.created_by::uuid = auth.uid())
            )
        )
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaign_performance_campaign_id ON public.campaign_performance(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_performance_date ON public.campaign_performance(metric_date);
CREATE INDEX IF NOT EXISTS idx_campaign_performance_source ON public.campaign_performance(data_source);
CREATE UNIQUE INDEX IF NOT EXISTS idx_campaign_performance_unique ON public.campaign_performance(campaign_id, metric_date, data_source);

-- ==================================================================
-- 4. CONTENT_ANALYTICS TABEL
-- ==================================================================
CREATE TABLE IF NOT EXISTS public.content_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_post_id UUID NOT NULL,
    metric_date DATE NOT NULL,
    platform VARCHAR(50) NOT NULL, -- 'facebook', 'instagram', 'linkedin', 'twitter', etc.
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,4) DEFAULT 0,
    click_through_rate DECIMAL(5,4) DEFAULT 0,
    sentiment_score DECIMAL(3,2), -- -1.00 to 1.00
    custom_metrics JSONB, -- Platform specifieke metrics
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.content_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies (gebaseerd op content post ownership)
CREATE POLICY "Users can view content analytics for own posts" ON public.content_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.content_posts 
            WHERE content_posts.id = content_analytics.content_post_id 
            AND (
                content_posts.created_by IS NULL OR 
                content_posts.created_by = '' OR 
                content_posts.created_by = auth.uid()::text OR
                (content_posts.created_by ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
                 AND content_posts.created_by::uuid = auth.uid())
            )
        )
    );

CREATE POLICY "Users can insert content analytics for own posts" ON public.content_analytics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.content_posts 
            WHERE content_posts.id = content_analytics.content_post_id 
            AND (
                content_posts.created_by IS NULL OR 
                content_posts.created_by = '' OR 
                content_posts.created_by = auth.uid()::text OR
                (content_posts.created_by ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
                 AND content_posts.created_by::uuid = auth.uid())
            )
        )
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_analytics_post_id ON public.content_analytics(content_post_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_date ON public.content_analytics(metric_date);
CREATE INDEX IF NOT EXISTS idx_content_analytics_platform ON public.content_analytics(platform);
CREATE UNIQUE INDEX IF NOT EXISTS idx_content_analytics_unique ON public.content_analytics(content_post_id, metric_date, platform);

-- ==================================================================
-- 5. LEARNING_PATTERNS TABEL
-- ==================================================================
CREATE TABLE IF NOT EXISTS public.learning_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pattern_type VARCHAR(50) NOT NULL, -- 'content_performance', 'audience_behavior', 'posting_time', 'engagement_trend'
    pattern_data JSONB NOT NULL, -- De eigenlijke pattern data
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    sample_size INTEGER,
    date_range_start DATE,
    date_range_end DATE,
    context JSONB, -- Context waarin pattern gevonden is
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'superseded'
    source_data_hash VARCHAR(64), -- Hash voor duplicate detection
    created_by TEXT, -- TEXT type voor consistency
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.learning_patterns ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own learning patterns" ON public.learning_patterns
    FOR SELECT USING (
        created_by IS NULL OR 
        created_by = '' OR 
        created_by = auth.uid()::text OR
        (created_by ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
         AND created_by::uuid = auth.uid())
    );

CREATE POLICY "Users can create learning patterns" ON public.learning_patterns
    FOR INSERT WITH CHECK (created_by = auth.uid()::text);

CREATE POLICY "Users can update own learning patterns" ON public.learning_patterns
    FOR UPDATE USING (
        created_by IS NULL OR 
        created_by = '' OR 
        created_by = auth.uid()::text OR
        (created_by ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
         AND created_by::uuid = auth.uid())
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_learning_patterns_type ON public.learning_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_confidence ON public.learning_patterns(confidence_score);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_status ON public.learning_patterns(status);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_created_by ON public.learning_patterns(created_by);
CREATE INDEX IF NOT EXISTS idx_learning_patterns_date_range ON public.learning_patterns(date_range_start, date_range_end);

-- ==================================================================
-- 6. UPDATE TRIGGERS VOOR ALLE NIEUWE TABELLEN
-- ==================================================================

-- Automation Workflows trigger
CREATE TRIGGER update_automation_workflows_updated_at 
    BEFORE UPDATE ON public.automation_workflows 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Campaigns trigger
CREATE TRIGGER update_campaigns_updated_at 
    BEFORE UPDATE ON public.campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Campaign Performance trigger
CREATE TRIGGER update_campaign_performance_updated_at 
    BEFORE UPDATE ON public.campaign_performance 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Content Analytics trigger
CREATE TRIGGER update_content_analytics_updated_at 
    BEFORE UPDATE ON public.content_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Learning Patterns trigger
CREATE TRIGGER update_learning_patterns_updated_at 
    BEFORE UPDATE ON public.learning_patterns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================================================================
-- 7. FOREIGN KEY CONSTRAINTS (VEILIG TOEGEVOEGD)
-- ==================================================================

-- Campaigns -> Automation Workflows (optioneel)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_campaigns_automation_workflow'
    ) THEN
        ALTER TABLE public.campaigns 
        ADD CONSTRAINT fk_campaigns_automation_workflow 
        FOREIGN KEY (automation_workflow_id) 
        REFERENCES public.automation_workflows(id) 
        ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key constraint: campaigns -> automation_workflows';
    END IF;
END $$;

-- Campaign Performance -> Campaigns
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_campaign_performance_campaign'
    ) THEN
        ALTER TABLE public.campaign_performance 
        ADD CONSTRAINT fk_campaign_performance_campaign 
        FOREIGN KEY (campaign_id) 
        REFERENCES public.campaigns(id) 
        ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint: campaign_performance -> campaigns';
    END IF;
END $$;

-- Content Analytics -> Content Posts (alleen als content_posts bestaat)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'content_posts'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_content_analytics_content_post'
    ) THEN
        ALTER TABLE public.content_analytics 
        ADD CONSTRAINT fk_content_analytics_content_post 
        FOREIGN KEY (content_post_id) 
        REFERENCES public.content_posts(id) 
        ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint: content_analytics -> content_posts';
    END IF;
END $$;

-- ==================================================================
-- 8. FINAL VALIDATION
-- ==================================================================

SELECT 
    'NEW_TABLES_VALIDATION' as section,
    t.table_name,
    CASE WHEN pt.tablename IS NOT NULL THEN 'CREATED ✅' ELSE 'MISSING ❌' END as table_status,
    'RLS: ' || CASE WHEN pt.rowsecurity THEN 'ON' ELSE 'OFF' END as rls_status,
    'owner_col: ' || CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns c 
        WHERE c.table_name = t.table_name 
        AND c.table_schema = 'public' 
        AND c.column_name = 'created_by'
    ) THEN 'EXISTS' ELSE 'N/A' END as owner_column,
    'updated_at: ' || CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns c 
        WHERE c.table_name = t.table_name 
        AND c.table_schema = 'public' 
        AND c.column_name = 'updated_at'
    ) THEN 'EXISTS' ELSE 'MISSING' END as timestamp_column
FROM (
    VALUES 
        ('automation_workflows'),
        ('campaigns'),
        ('campaign_performance'),
        ('content_analytics'),
        ('learning_patterns')
) AS t(table_name)
LEFT JOIN pg_tables pt ON t.table_name = pt.tablename AND pt.schemaname = 'public'
ORDER BY t.table_name; 