-- Migration: Unified Customer Data Model
-- This migration creates the comprehensive customer data model for the BI Dashboard
-- Author: Customer Intelligence System
-- Date: 2025-01-12

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Unified Customers Table (Central customer repository)
CREATE TABLE public.unified_customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    location_country VARCHAR(100),
    location_state VARCHAR(100),
    location_city VARCHAR(100),
    acquisition_source VARCHAR(50) NOT NULL CHECK (acquisition_source IN ('shopify', 'kajabi', 'social', 'direct')),
    acquisition_date TIMESTAMP WITH TIME ZONE NOT NULL,
    total_lifetime_value DECIMAL(10,2) DEFAULT 0.00,
    total_orders INTEGER DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0.00,
    last_purchase_date TIMESTAMP WITH TIME ZONE,
    churn_risk_score DECIMAL(3,2) CHECK (churn_risk_score >= 0 AND churn_risk_score <= 1),
    customer_status VARCHAR(20) DEFAULT 'prospect' CHECK (customer_status IN ('active', 'inactive', 'churned', 'prospect')),
    tags TEXT[], -- Array of tags for flexible categorization
    notes TEXT,
    shopify_customer_id VARCHAR(100),
    kajabi_customer_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Customer Touchpoints Table (Customer journey tracking)
CREATE TABLE public.customer_touchpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.unified_customers(id) ON DELETE CASCADE,
    touchpoint_type VARCHAR(50) NOT NULL CHECK (touchpoint_type IN ('email_open', 'website_visit', 'purchase', 'support_ticket', 'social_interaction')),
    touchpoint_source VARCHAR(50) NOT NULL CHECK (touchpoint_source IN ('shopify', 'kajabi', 'email', 'social', 'website')),
    touchpoint_data JSONB DEFAULT '{}',
    value DECIMAL(10,2), -- Monetary value if applicable
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Customer Segments Table (Dynamic segmentation)
CREATE TABLE public.customer_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.unified_customers(id) ON DELETE CASCADE,
    segment_name VARCHAR(100) NOT NULL,
    segment_type VARCHAR(50) NOT NULL CHECK (segment_type IN ('behavioral', 'demographic', 'value_based', 'lifecycle')),
    segment_criteria JSONB DEFAULT '{}',
    assigned_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Customer Social Profiles Table (Social media integration)
CREATE TABLE public.customer_social_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.unified_customers(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin', 'youtube')),
    platform_user_id VARCHAR(100),
    username VARCHAR(100),
    follower_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,4), -- Percentage as decimal (0.1234 = 12.34%)
    last_interaction_date TIMESTAMP WITH TIME ZONE,
    profile_data JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, platform) -- One profile per platform per customer
);

-- 5. Customer Events Table (Event tracking)
CREATE TABLE public.customer_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.unified_customers(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('purchase', 'signup', 'churn', 'reactivation', 'milestone')),
    event_source VARCHAR(50) NOT NULL CHECK (event_source IN ('shopify', 'kajabi', 'system', 'manual')),
    event_data JSONB DEFAULT '{}',
    event_value DECIMAL(10,2),
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX idx_unified_customers_email ON public.unified_customers(email);
CREATE INDEX idx_unified_customers_status ON public.unified_customers(customer_status);
CREATE INDEX idx_unified_customers_acquisition_source ON public.unified_customers(acquisition_source);
CREATE INDEX idx_unified_customers_acquisition_date ON public.unified_customers(acquisition_date);
CREATE INDEX idx_unified_customers_last_purchase ON public.unified_customers(last_purchase_date);
CREATE INDEX idx_unified_customers_churn_risk ON public.unified_customers(churn_risk_score) WHERE churn_risk_score IS NOT NULL;
CREATE INDEX idx_unified_customers_shopify_id ON public.unified_customers(shopify_customer_id) WHERE shopify_customer_id IS NOT NULL;
CREATE INDEX idx_unified_customers_kajabi_id ON public.unified_customers(kajabi_customer_id) WHERE kajabi_customer_id IS NOT NULL;

CREATE INDEX idx_customer_touchpoints_customer_id ON public.customer_touchpoints(customer_id);
CREATE INDEX idx_customer_touchpoints_type ON public.customer_touchpoints(touchpoint_type);
CREATE INDEX idx_customer_touchpoints_timestamp ON public.customer_touchpoints(timestamp);
CREATE INDEX idx_customer_touchpoints_source ON public.customer_touchpoints(touchpoint_source);

CREATE INDEX idx_customer_segments_customer_id ON public.customer_segments(customer_id);
CREATE INDEX idx_customer_segments_type ON public.customer_segments(segment_type);
CREATE INDEX idx_customer_segments_active ON public.customer_segments(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_customer_social_profiles_customer_id ON public.customer_social_profiles(customer_id);
CREATE INDEX idx_customer_social_profiles_platform ON public.customer_social_profiles(platform);

CREATE INDEX idx_customer_events_customer_id ON public.customer_events(customer_id);
CREATE INDEX idx_customer_events_type ON public.customer_events(event_type);
CREATE INDEX idx_customer_events_date ON public.customer_events(event_date);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_unified_customers_updated_at 
    BEFORE UPDATE ON public.unified_customers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_segments_updated_at 
    BEFORE UPDATE ON public.customer_segments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_social_profiles_updated_at 
    BEFORE UPDATE ON public.customer_social_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Row Level Security (RLS) policies
ALTER TABLE public.unified_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_touchpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_social_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_events ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized based on auth requirements)
CREATE POLICY "Enable read access for all users" ON public.unified_customers FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.unified_customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.unified_customers FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON public.customer_touchpoints FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.customer_touchpoints FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON public.customer_segments FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.customer_segments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.customer_segments FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON public.customer_social_profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.customer_social_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.customer_social_profiles FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON public.customer_events FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.customer_events FOR INSERT WITH CHECK (true);

-- Create views for common queries
CREATE VIEW customer_360_view AS
SELECT 
    c.*,
    COUNT(DISTINCT t.id) as total_touchpoints,
    COUNT(DISTINCT s.id) as active_segments,
    COUNT(DISTINCT sp.id) as social_profiles,
    MAX(t.timestamp) as last_touchpoint_date,
    COUNT(DISTINCT e.id) as total_events
FROM public.unified_customers c
LEFT JOIN public.customer_touchpoints t ON c.id = t.customer_id
LEFT JOIN public.customer_segments s ON c.id = s.customer_id AND s.is_active = true
LEFT JOIN public.customer_social_profiles sp ON c.id = sp.customer_id
LEFT JOIN public.customer_events e ON c.id = e.customer_id
GROUP BY c.id;

-- Comment on tables for documentation
COMMENT ON TABLE public.unified_customers IS 'Central repository for unified customer profiles from all sources';
COMMENT ON TABLE public.customer_touchpoints IS 'Records all customer interactions and touchpoints across channels';
COMMENT ON TABLE public.customer_segments IS 'Dynamic customer segmentation for targeted analytics';
COMMENT ON TABLE public.customer_social_profiles IS 'Social media profiles and engagement data';
COMMENT ON TABLE public.customer_events IS 'Major customer lifecycle events and milestones'; 