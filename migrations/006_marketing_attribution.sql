-- Marketing Attribution System Migration
-- This migration creates the database schema for cross-platform attribution modeling

-- Create attribution models table to define different attribution models
CREATE TABLE IF NOT EXISTS marketing_attribution_models (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    model_type VARCHAR(50) NOT NULL CHECK (
        model_type IN ('first_touch', 'last_touch', 'linear', 'time_decay', 'position_based', 'data_driven')
    ),
    configuration JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create conversion events table to track all conversion touchpoints
CREATE TABLE IF NOT EXISTS conversion_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES unified_customers(id) ON DELETE CASCADE,
    customer_email VARCHAR(255) NOT NULL,
    conversion_type VARCHAR(50) NOT NULL CHECK (
        conversion_type IN ('purchase', 'signup', 'lead', 'trial', 'subscription')
    ),
    conversion_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    conversion_date TIMESTAMPTZ NOT NULL,
    order_id VARCHAR(100),
    product_name VARCHAR(255),
    source_platform VARCHAR(50) NOT NULL CHECK (
        source_platform IN ('shopify', 'kajabi', 'website', 'manual')
    ),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(100),
    utm_content VARCHAR(100),
    referrer_url TEXT,
    landing_page TEXT,
    session_id VARCHAR(100),
    device_info JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create customer journey touchpoints table for multi-touch attribution
CREATE TABLE IF NOT EXISTS customer_journey_touchpoints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES unified_customers(id) ON DELETE SET NULL,
    customer_email VARCHAR(255) NOT NULL,
    touchpoint_date TIMESTAMPTZ NOT NULL,
    touchpoint_type VARCHAR(50) NOT NULL CHECK (
        touchpoint_type IN ('impression', 'click', 'visit', 'engagement', 'email', 'social')
    ),
    marketing_channel VARCHAR(50) NOT NULL CHECK (
        marketing_channel IN ('google_ads', 'meta_ads', 'email', 'organic', 'direct', 'social', 'referral', 'paid_social')
    ),
    campaign_id VARCHAR(100),
    campaign_name VARCHAR(255),
    ad_group_id VARCHAR(100),
    ad_group_name VARCHAR(255),
    keyword VARCHAR(255),
    placement VARCHAR(255),
    creative_id VARCHAR(100),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(100),
    utm_content VARCHAR(100),
    cost DECIMAL(10,2) DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    session_id VARCHAR(100),
    page_url TEXT,
    referrer_url TEXT,
    device_info JSONB DEFAULT '{}',
    geo_info JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attribution results table to store calculated attribution values
CREATE TABLE IF NOT EXISTS attribution_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversion_event_id UUID NOT NULL REFERENCES conversion_events(id) ON DELETE CASCADE,
    touchpoint_id UUID NOT NULL REFERENCES customer_journey_touchpoints(id) ON DELETE CASCADE,
    attribution_model_id UUID NOT NULL REFERENCES marketing_attribution_models(id) ON DELETE CASCADE,
    attribution_credit DECIMAL(8,4) NOT NULL DEFAULT 0 CHECK (attribution_credit >= 0 AND attribution_credit <= 1),
    attributed_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    attribution_order INTEGER NOT NULL DEFAULT 1,
    touchpoint_position VARCHAR(20) NOT NULL CHECK (
        touchpoint_position IN ('first', 'middle', 'last', 'only')
    ),
    time_to_conversion_hours INTEGER,
    calculation_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(conversion_event_id, touchpoint_id, attribution_model_id)
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_conversion_events_customer_email ON conversion_events(customer_email);
CREATE INDEX IF NOT EXISTS idx_conversion_events_date ON conversion_events(conversion_date);
CREATE INDEX IF NOT EXISTS idx_conversion_events_type ON conversion_events(conversion_type);
CREATE INDEX IF NOT EXISTS idx_conversion_events_utm_campaign ON conversion_events(utm_campaign);

CREATE INDEX IF NOT EXISTS idx_journey_touchpoints_customer ON customer_journey_touchpoints(customer_email);
CREATE INDEX IF NOT EXISTS idx_journey_touchpoints_date ON customer_journey_touchpoints(touchpoint_date);
CREATE INDEX IF NOT EXISTS idx_journey_touchpoints_channel ON customer_journey_touchpoints(marketing_channel);
CREATE INDEX IF NOT EXISTS idx_journey_touchpoints_campaign ON customer_journey_touchpoints(campaign_name);
CREATE INDEX IF NOT EXISTS idx_journey_touchpoints_session ON customer_journey_touchpoints(session_id);
CREATE INDEX IF NOT EXISTS idx_journey_touchpoints_utm_campaign ON customer_journey_touchpoints(utm_campaign);

CREATE INDEX IF NOT EXISTS idx_attribution_results_conversion ON attribution_results(conversion_event_id);
CREATE INDEX IF NOT EXISTS idx_attribution_results_model ON attribution_results(attribution_model_id);
CREATE INDEX IF NOT EXISTS idx_attribution_results_value ON attribution_results(attributed_value);
CREATE INDEX IF NOT EXISTS idx_attribution_results_date ON attribution_results(calculation_date);

-- Insert default attribution models
INSERT INTO marketing_attribution_models (name, description, model_type, configuration) VALUES
('First Touch', 'Gives 100% credit to the first touchpoint in the customer journey', 'first_touch', '{"weight": 1.0}'),
('Last Touch', 'Gives 100% credit to the last touchpoint before conversion', 'last_touch', '{"weight": 1.0}'),
('Linear', 'Distributes credit equally across all touchpoints', 'linear', '{"equal_weight": true}'),
('Time Decay', 'Gives more credit to touchpoints closer to conversion', 'time_decay', '{"half_life_days": 7}'),
('Position Based', 'Gives 40% to first touch, 40% to last touch, 20% to middle touches', 'position_based', '{"first_weight": 0.4, "last_weight": 0.4, "middle_weight": 0.2}')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS policies
ALTER TABLE marketing_attribution_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_journey_touchpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE attribution_results ENABLE ROW LEVEL SECURITY;

-- RLS policies for attribution models (admin only)
CREATE POLICY "Attribution models are viewable by all authenticated users" ON marketing_attribution_models
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Attribution models are manageable by admins" ON marketing_attribution_models
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- RLS policies for conversion events
CREATE POLICY "Users can view all conversion events" ON conversion_events
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert conversion events" ON conversion_events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS policies for customer journey touchpoints
CREATE POLICY "Users can view all touchpoints" ON customer_journey_touchpoints
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert touchpoints" ON customer_journey_touchpoints
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS policies for attribution results
CREATE POLICY "Users can view attribution results" ON attribution_results
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert attribution results" ON attribution_results
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create trigger functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_attribution_models_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_attribution_models_updated_at
    BEFORE UPDATE ON marketing_attribution_models
    FOR EACH ROW
    EXECUTE FUNCTION update_attribution_models_updated_at();

-- Create view for comprehensive attribution analysis
CREATE OR REPLACE VIEW attribution_analysis AS
SELECT 
    ce.id as conversion_id,
    ce.customer_email,
    ce.conversion_type,
    ce.conversion_value,
    ce.conversion_date,
    am.name as attribution_model,
    ar.attribution_credit,
    ar.attributed_value,
    ar.touchpoint_position,
    ar.time_to_conversion_hours,
    cjt.marketing_channel,
    cjt.campaign_name,
    cjt.touchpoint_date,
    cjt.touchpoint_type,
    cjt.cost as touchpoint_cost
FROM attribution_results ar
JOIN conversion_events ce ON ar.conversion_event_id = ce.id
JOIN marketing_attribution_models am ON ar.attribution_model_id = am.id
JOIN customer_journey_touchpoints cjt ON ar.touchpoint_id = cjt.id
ORDER BY ce.conversion_date DESC, ar.attribution_order;

-- Create function to calculate attribution for a conversion
CREATE OR REPLACE FUNCTION calculate_attribution_for_conversion(
    p_conversion_event_id UUID,
    p_attribution_model_id UUID
) RETURNS INTEGER AS $$
DECLARE
    v_touchpoint_count INTEGER;
    v_model_type VARCHAR(50);
    v_model_config JSONB;
    v_touchpoint RECORD;
    v_total_touchpoints INTEGER;
    v_position_index INTEGER := 1;
    v_attribution_credit DECIMAL(8,4);
    v_half_life_days INTEGER;
    v_days_to_conversion DECIMAL;
    v_decay_factor DECIMAL;
BEGIN
    -- Get model configuration
    SELECT model_type, configuration INTO v_model_type, v_model_config
    FROM marketing_attribution_models 
    WHERE id = p_attribution_model_id;
    
    -- Get touchpoints for this conversion in chronological order
    SELECT COUNT(*) INTO v_total_touchpoints
    FROM customer_journey_touchpoints cjt
    JOIN conversion_events ce ON cjt.customer_email = ce.customer_email
    WHERE ce.id = p_conversion_event_id
    AND cjt.touchpoint_date <= ce.conversion_date
    AND cjt.touchpoint_date >= (ce.conversion_date - INTERVAL '90 days'); -- 90-day attribution window
    
    -- Clear existing attribution results for this conversion and model
    DELETE FROM attribution_results 
    WHERE conversion_event_id = p_conversion_event_id 
    AND attribution_model_id = p_attribution_model_id;
    
    -- Calculate attribution based on model type
    FOR v_touchpoint IN (
        SELECT cjt.*, ce.conversion_value, ce.conversion_date,
               EXTRACT(EPOCH FROM (ce.conversion_date - cjt.touchpoint_date))/3600 as hours_to_conversion
        FROM customer_journey_touchpoints cjt
        JOIN conversion_events ce ON cjt.customer_email = ce.customer_email
        WHERE ce.id = p_conversion_event_id
        AND cjt.touchpoint_date <= ce.conversion_date
        AND cjt.touchpoint_date >= (ce.conversion_date - INTERVAL '90 days')
        ORDER BY cjt.touchpoint_date ASC
    ) LOOP
        -- Calculate attribution credit based on model type
        CASE v_model_type
            WHEN 'first_touch' THEN
                v_attribution_credit := CASE WHEN v_position_index = 1 THEN 1.0 ELSE 0.0 END;
            
            WHEN 'last_touch' THEN
                v_attribution_credit := CASE WHEN v_position_index = v_total_touchpoints THEN 1.0 ELSE 0.0 END;
            
            WHEN 'linear' THEN
                v_attribution_credit := 1.0 / v_total_touchpoints;
            
            WHEN 'time_decay' THEN
                v_half_life_days := COALESCE((v_model_config->>'half_life_days')::INTEGER, 7);
                v_days_to_conversion := v_touchpoint.hours_to_conversion / 24.0;
                v_decay_factor := POWER(0.5, v_days_to_conversion / v_half_life_days);
                v_attribution_credit := v_decay_factor;
            
            WHEN 'position_based' THEN
                IF v_position_index = 1 AND v_total_touchpoints > 1 THEN
                    v_attribution_credit := COALESCE((v_model_config->>'first_weight')::DECIMAL, 0.4);
                ELSIF v_position_index = v_total_touchpoints AND v_total_touchpoints > 1 THEN
                    v_attribution_credit := COALESCE((v_model_config->>'last_weight')::DECIMAL, 0.4);
                ELSIF v_total_touchpoints = 1 THEN
                    v_attribution_credit := 1.0;
                ELSE
                    v_attribution_credit := COALESCE((v_model_config->>'middle_weight')::DECIMAL, 0.2) / GREATEST(v_total_touchpoints - 2, 1);
                END IF;
            
            ELSE
                v_attribution_credit := 1.0 / v_total_touchpoints; -- Default to linear
        END CASE;
        
        -- Determine touchpoint position
        DECLARE
            v_position VARCHAR(20);
        BEGIN
            IF v_total_touchpoints = 1 THEN
                v_position := 'only';
            ELSIF v_position_index = 1 THEN
                v_position := 'first';
            ELSIF v_position_index = v_total_touchpoints THEN
                v_position := 'last';
            ELSE
                v_position := 'middle';
            END IF;
        END;
        
        -- Insert attribution result
        INSERT INTO attribution_results (
            conversion_event_id,
            touchpoint_id,
            attribution_model_id,
            attribution_credit,
            attributed_value,
            attribution_order,
            touchpoint_position,
            time_to_conversion_hours
        ) VALUES (
            p_conversion_event_id,
            v_touchpoint.id,
            p_attribution_model_id,
            v_attribution_credit,
            v_touchpoint.conversion_value * v_attribution_credit,
            v_position_index,
            v_position,
            v_touchpoint.hours_to_conversion
        );
        
        v_position_index := v_position_index + 1;
    END LOOP;
    
    -- Normalize attribution credits for time_decay model
    IF v_model_type = 'time_decay' THEN
        UPDATE attribution_results 
        SET attribution_credit = attribution_credit / (
            SELECT SUM(attribution_credit) 
            FROM attribution_results 
            WHERE conversion_event_id = p_conversion_event_id 
            AND attribution_model_id = p_attribution_model_id
        ),
        attributed_value = (
            SELECT conversion_value FROM conversion_events WHERE id = p_conversion_event_id
        ) * (attribution_credit / (
            SELECT SUM(attribution_credit) 
            FROM attribution_results 
            WHERE conversion_event_id = p_conversion_event_id 
            AND attribution_model_id = p_attribution_model_id
        ))
        WHERE conversion_event_id = p_conversion_event_id 
        AND attribution_model_id = p_attribution_model_id;
    END IF;
    
    RETURN v_total_touchpoints;
END;
$$ LANGUAGE plpgsql; 