-- Migration: 007_audience_insights.sql
-- Description: Create tables for audience insights, predictive analytics, and advanced budget optimization

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Audience segments table for storing dynamic audience segments
CREATE TABLE IF NOT EXISTS audience_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    segment_name VARCHAR(255) NOT NULL,
    segment_description TEXT,
    segment_criteria JSONB NOT NULL,
    segment_type VARCHAR(50) NOT NULL CHECK (segment_type IN ('demographic', 'behavioral', 'geographic', 'psychographic', 'custom')),
    total_customers INTEGER DEFAULT 0,
    avg_clv DECIMAL(10,2) DEFAULT 0,
    avg_conversion_rate DECIMAL(5,4) DEFAULT 0,
    primary_channel VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Audience performance table for tracking segment performance over time
CREATE TABLE IF NOT EXISTS audience_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    segment_id UUID REFERENCES audience_segments(id) ON DELETE CASCADE,
    date_period DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
    total_impressions BIGINT DEFAULT 0,
    total_clicks BIGINT DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    total_spend DECIMAL(12,2) DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    click_through_rate DECIMAL(5,4) DEFAULT 0,
    conversion_rate DECIMAL(5,4) DEFAULT 0,
    cost_per_click DECIMAL(8,2) DEFAULT 0,
    cost_per_conversion DECIMAL(8,2) DEFAULT 0,
    return_on_ad_spend DECIMAL(8,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(segment_id, date_period, period_type)
);

-- Performance predictions table for storing ML predictions
CREATE TABLE IF NOT EXISTS performance_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prediction_type VARCHAR(50) NOT NULL CHECK (prediction_type IN ('roi', 'conversions', 'revenue', 'cpa', 'roas')),
    target_entity_type VARCHAR(50) NOT NULL CHECK (target_entity_type IN ('campaign', 'channel', 'audience_segment')),
    target_entity_id VARCHAR(255) NOT NULL,
    prediction_date DATE NOT NULL,
    predicted_value DECIMAL(12,2) NOT NULL,
    confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    model_version VARCHAR(50) NOT NULL,
    input_features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Budget scenarios table for what-if analysis
CREATE TABLE IF NOT EXISTS budget_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_name VARCHAR(255) NOT NULL,
    scenario_description TEXT,
    base_period_start DATE NOT NULL,
    base_period_end DATE NOT NULL,
    scenario_period_start DATE NOT NULL,
    scenario_period_end DATE NOT NULL,
    total_budget DECIMAL(12,2) NOT NULL,
    budget_allocations JSONB NOT NULL, -- {"google_ads": 5000, "meta_ads": 3000, etc.}
    predicted_outcomes JSONB, -- Predicted ROI, conversions, etc.
    confidence_score DECIMAL(3,2),
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Competitive analysis data table
CREATE TABLE IF NOT EXISTS competitive_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor_name VARCHAR(255) NOT NULL,
    analysis_date DATE NOT NULL,
    market_share DECIMAL(5,4),
    estimated_spend DECIMAL(12,2),
    top_keywords TEXT[],
    ad_copy_themes TEXT[],
    performance_metrics JSONB,
    data_source VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(competitor_name, analysis_date)
);

-- Seasonal trends table for time-based optimization
CREATE TABLE IF NOT EXISTS seasonal_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trend_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    channel VARCHAR(100),
    month_of_year INTEGER CHECK (month_of_year >= 1 AND month_of_year <= 12),
    week_of_year INTEGER CHECK (week_of_year >= 1 AND week_of_year <= 53),
    day_of_week INTEGER CHECK (day_of_week >= 1 AND day_of_week <= 7),
    hour_of_day INTEGER CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
    performance_multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.0,
    confidence_level DECIMAL(3,2) NOT NULL DEFAULT 0.5,
    historical_data_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- A/B testing recommendations table
CREATE TABLE IF NOT EXISTS ab_test_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(100) NOT NULL CHECK (test_type IN ('ad_copy', 'audience', 'bidding', 'creative', 'landing_page')),
    campaign_id VARCHAR(255),
    current_performance JSONB NOT NULL,
    recommended_variant JSONB NOT NULL,
    expected_improvement DECIMAL(5,2),
    test_duration_days INTEGER DEFAULT 14,
    minimum_sample_size INTEGER,
    priority_score DECIMAL(3,2) DEFAULT 0.5,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audience_segments_type ON audience_segments(segment_type);
CREATE INDEX IF NOT EXISTS idx_audience_segments_active ON audience_segments(is_active);
CREATE INDEX IF NOT EXISTS idx_audience_performance_date ON audience_performance(date_period);
CREATE INDEX IF NOT EXISTS idx_audience_performance_segment ON audience_performance(segment_id);
CREATE INDEX IF NOT EXISTS idx_performance_predictions_date ON performance_predictions(prediction_date);
CREATE INDEX IF NOT EXISTS idx_performance_predictions_entity ON performance_predictions(target_entity_type, target_entity_id);
CREATE INDEX IF NOT EXISTS idx_budget_scenarios_period ON budget_scenarios(scenario_period_start, scenario_period_end);
CREATE INDEX IF NOT EXISTS idx_competitive_analysis_date ON competitive_analysis(analysis_date);
CREATE INDEX IF NOT EXISTS idx_seasonal_trends_time ON seasonal_trends(month_of_year, week_of_year, day_of_week);
CREATE INDEX IF NOT EXISTS idx_ab_test_status ON ab_test_recommendations(status);

-- Create functions for audience analytics

-- Function to calculate customer lifetime value for a segment
CREATE OR REPLACE FUNCTION calculate_segment_clv(p_segment_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    avg_clv DECIMAL(10,2);
BEGIN
    SELECT 
        COALESCE(AVG(
            CASE 
                WHEN ap.total_conversions > 0 
                THEN (ap.total_revenue / ap.total_conversions) * 
                     (1 / NULLIF(ap.conversion_rate, 0)) * 
                     12 -- Annualized CLV approximation
                ELSE 0 
            END
        ), 0)
    INTO avg_clv
    FROM audience_performance ap
    WHERE ap.segment_id = p_segment_id
      AND ap.date_period BETWEEN p_start_date AND p_end_date;
    
    RETURN COALESCE(avg_clv, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get top performing audience segments
CREATE OR REPLACE FUNCTION get_top_performing_segments(p_limit INTEGER DEFAULT 10, p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days', p_end_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    segment_id UUID,
    segment_name VARCHAR(255),
    segment_type VARCHAR(50),
    total_revenue DECIMAL(12,2),
    total_spend DECIMAL(12,2),
    roi DECIMAL(8,2),
    conversion_rate DECIMAL(5,4),
    total_conversions INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        aseg.id,
        aseg.segment_name,
        aseg.segment_type,
        SUM(ap.total_revenue) as total_revenue,
        SUM(ap.total_spend) as total_spend,
        CASE 
            WHEN SUM(ap.total_spend) > 0 
            THEN ((SUM(ap.total_revenue) - SUM(ap.total_spend)) / SUM(ap.total_spend)) * 100
            ELSE 0 
        END as roi,
        AVG(ap.conversion_rate) as conversion_rate,
        SUM(ap.total_conversions) as total_conversions
    FROM audience_segments aseg
    JOIN audience_performance ap ON aseg.id = ap.segment_id
    WHERE ap.date_period BETWEEN p_start_date AND p_end_date
      AND aseg.is_active = true
    GROUP BY aseg.id, aseg.segment_name, aseg.segment_type
    ORDER BY roi DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to generate budget allocation recommendations
CREATE OR REPLACE FUNCTION generate_budget_recommendations(p_total_budget DECIMAL(12,2), p_start_date DATE, p_end_date DATE)
RETURNS TABLE (
    channel VARCHAR(100),
    current_allocation DECIMAL(12,2),
    recommended_allocation DECIMAL(12,2),
    expected_roi_improvement DECIMAL(5,2),
    reasoning TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH channel_performance AS (
        SELECT 
            COALESCE(cjt.marketing_channel, 'unknown') as channel,
            SUM(ar.attributed_value) as total_revenue,
            COUNT(DISTINCT ar.conversion_event_id) as total_conversions,
            -- Estimate spend based on touchpoint costs
            SUM(COALESCE(cjt.cost, 0)) as estimated_spend,
            AVG(ar.attribution_credit) as avg_attribution
        FROM attribution_results ar
        JOIN customer_journey_touchpoints cjt ON ar.touchpoint_id = cjt.id
        JOIN conversion_events ce ON ar.conversion_event_id = ce.id
        WHERE ce.conversion_date BETWEEN p_start_date AND p_end_date
        GROUP BY cjt.marketing_channel
    ),
    channel_roi AS (
        SELECT 
            channel,
            total_revenue,
            estimated_spend,
            CASE 
                WHEN estimated_spend > 0 
                THEN ((total_revenue - estimated_spend) / estimated_spend) * 100
                ELSE 0 
            END as roi,
            total_conversions
        FROM channel_performance
        WHERE estimated_spend > 0
    ),
    total_metrics AS (
        SELECT 
            SUM(estimated_spend) as total_current_spend,
            AVG(roi) as avg_roi
        FROM channel_roi
    )
    SELECT 
        cr.channel,
        cr.estimated_spend as current_allocation,
        CASE 
            WHEN cr.roi > tm.avg_roi * 1.2 THEN cr.estimated_spend * 1.3 -- Increase high performers
            WHEN cr.roi < tm.avg_roi * 0.8 THEN cr.estimated_spend * 0.7 -- Decrease poor performers
            ELSE cr.estimated_spend -- Maintain average performers
        END * (p_total_budget / tm.total_current_spend) as recommended_allocation,
        CASE 
            WHEN cr.roi > tm.avg_roi * 1.2 THEN 15.0
            WHEN cr.roi < tm.avg_roi * 0.8 THEN -10.0
            ELSE 2.0
        END as expected_roi_improvement,
        CASE 
            WHEN cr.roi > tm.avg_roi * 1.2 THEN 'High-performing channel with growth potential'
            WHEN cr.roi < tm.avg_roi * 0.8 THEN 'Underperforming channel requiring optimization'
            ELSE 'Average performing channel - maintain current strategy'
        END as reasoning
    FROM channel_roi cr
    CROSS JOIN total_metrics tm
    ORDER BY cr.roi DESC;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies
ALTER TABLE audience_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitive_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies (basic read/write for authenticated users)
CREATE POLICY "Allow authenticated users to view audience segments" ON audience_segments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage audience segments" ON audience_segments FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view audience performance" ON audience_performance FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage audience performance" ON audience_performance FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view predictions" ON performance_predictions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage predictions" ON performance_predictions FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view budget scenarios" ON budget_scenarios FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage budget scenarios" ON budget_scenarios FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view competitive analysis" ON competitive_analysis FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage competitive analysis" ON competitive_analysis FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view seasonal trends" ON seasonal_trends FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage seasonal trends" ON seasonal_trends FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view ab test recommendations" ON ab_test_recommendations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage ab test recommendations" ON ab_test_recommendations FOR ALL USING (auth.role() = 'authenticated');

-- Insert default audience segments
INSERT INTO audience_segments (segment_name, segment_description, segment_criteria, segment_type) VALUES
('High-Value Customers', 'Customers with high lifetime value and frequent purchases', '{"min_clv": 1000, "min_purchases": 5}', 'behavioral'),
('New Customers', 'Customers acquired in the last 30 days', '{"max_days_since_first_purchase": 30}', 'behavioral'),
('At-Risk Customers', 'Customers who haven''t purchased in 90+ days', '{"min_days_since_last_purchase": 90}', 'behavioral'),
('Mobile Users', 'Customers who primarily engage via mobile devices', '{"primary_device": "mobile"}', 'behavioral'),
('Social Media Enthusiasts', 'Customers acquired through social media channels', '{"primary_acquisition_channel": ["facebook", "instagram", "tiktok"]}', 'behavioral'),
('Email Subscribers', 'Customers subscribed to email marketing', '{"email_subscribed": true}', 'behavioral');

-- Insert default seasonal trends
INSERT INTO seasonal_trends (trend_name, industry, channel, month_of_year, performance_multiplier, confidence_level) VALUES
('Holiday Shopping Season', 'ecommerce', 'google_ads', 11, 1.5, 0.9),
('Holiday Shopping Season', 'ecommerce', 'google_ads', 12, 1.8, 0.95),
('New Year Resolution', 'fitness', 'meta_ads', 1, 1.4, 0.8),
('Back to School', 'education', 'google_ads', 8, 1.3, 0.85),
('Summer Sale Season', 'retail', 'meta_ads', 6, 1.2, 0.75),
('Summer Sale Season', 'retail', 'meta_ads', 7, 1.25, 0.8),
('Black Friday', 'ecommerce', 'google_ads', 11, 2.0, 0.95),
('Valentine''s Day', 'gifts', 'meta_ads', 2, 1.6, 0.85); 