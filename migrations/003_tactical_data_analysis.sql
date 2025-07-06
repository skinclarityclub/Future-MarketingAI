-- Migration: Tactical Data Analysis Engine
-- Description: Creates tables for storing and analyzing tactical business data

-- Enable RLS
ALTER ROLE authenticator SET row_security = on;

-- Create tactical_data_points table for unified data storage
CREATE TABLE IF NOT EXISTS public.tactical_data_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    value NUMERIC NOT NULL,
    source VARCHAR(50) NOT NULL CHECK (source IN ('shopify', 'kajabi', 'financial', 'marketing')),
    category VARCHAR(100) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Composite unique constraint to prevent duplicates
    UNIQUE(timestamp, source, category)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tactical_data_timestamp ON public.tactical_data_points(timestamp);
CREATE INDEX IF NOT EXISTS idx_tactical_data_source ON public.tactical_data_points(source);
CREATE INDEX IF NOT EXISTS idx_tactical_data_category ON public.tactical_data_points(category);
CREATE INDEX IF NOT EXISTS idx_tactical_data_value ON public.tactical_data_points(value);
CREATE INDEX IF NOT EXISTS idx_tactical_data_metadata ON public.tactical_data_points USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_tactical_data_composite ON public.tactical_data_points(source, category, timestamp);

-- Create financial_expenses table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.financial_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    amount NUMERIC NOT NULL,
    category VARCHAR(100),
    description TEXT,
    payment_method VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create financial_investments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.financial_investments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    amount NUMERIC NOT NULL,
    investment_type VARCHAR(100),
    description TEXT,
    expected_return NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cash_flow_metrics table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.cash_flow_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    cash_inflow NUMERIC DEFAULT 0,
    cash_outflow NUMERIC DEFAULT 0,
    net_cash_flow NUMERIC GENERATED ALWAYS AS (cash_inflow - cash_outflow) STORED,
    cash_balance NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create predictive_insights table for storing AI-generated insights
CREATE TABLE IF NOT EXISTS public.predictive_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    impact_score INTEGER NOT NULL CHECK (impact_score >= 0 AND impact_score <= 100),
    time_horizon VARCHAR(20) NOT NULL CHECK (time_horizon IN ('1week', '1month', '3months', '6months', '1year')),
    data_sources TEXT[] NOT NULL,
    predictions JSONB DEFAULT '[]',
    recommendations TEXT[] DEFAULT '{}',
    risk_factors TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for predictive_insights
CREATE INDEX IF NOT EXISTS idx_predictive_insights_confidence ON public.predictive_insights(confidence_score);
CREATE INDEX IF NOT EXISTS idx_predictive_insights_impact ON public.predictive_insights(impact_score);
CREATE INDEX IF NOT EXISTS idx_predictive_insights_horizon ON public.predictive_insights(time_horizon);
CREATE INDEX IF NOT EXISTS idx_predictive_insights_active ON public.predictive_insights(is_active);
CREATE INDEX IF NOT EXISTS idx_predictive_insights_created ON public.predictive_insights(created_at);

-- Create analysis_jobs table for tracking long-running analysis tasks
CREATE TABLE IF NOT EXISTS public.analysis_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    parameters JSONB DEFAULT '{}',
    result JSONB,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for analysis_jobs
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_status ON public.analysis_jobs(status);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_type ON public.analysis_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_created ON public.analysis_jobs(created_at);

-- Enable Row Level Security
ALTER TABLE public.tactical_data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flow_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (Allow all for now, adjust based on authentication needs)
CREATE POLICY "Enable all operations for authenticated users" ON public.tactical_data_points
    FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON public.financial_expenses
    FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON public.financial_investments
    FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON public.cash_flow_metrics
    FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON public.predictive_insights
    FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON public.analysis_jobs
    FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tactical_data_points_updated_at
    BEFORE UPDATE ON public.tactical_data_points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_expenses_updated_at
    BEFORE UPDATE ON public.financial_expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_investments_updated_at
    BEFORE UPDATE ON public.financial_investments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cash_flow_metrics_updated_at
    BEFORE UPDATE ON public.cash_flow_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_predictive_insights_updated_at
    BEFORE UPDATE ON public.predictive_insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analysis_jobs_updated_at
    BEFORE UPDATE ON public.analysis_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to aggregate tactical data by time period
CREATE OR REPLACE FUNCTION aggregate_tactical_data(
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    time_period VARCHAR(10) DEFAULT 'day',
    data_source VARCHAR(50) DEFAULT NULL,
    data_category VARCHAR(100) DEFAULT NULL
)
RETURNS TABLE (
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    source VARCHAR(50),
    category VARCHAR(100),
    total_value NUMERIC,
    avg_value NUMERIC,
    min_value NUMERIC,
    max_value NUMERIC,
    data_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN time_period = 'day' THEN date_trunc('day', tdp.timestamp)
            WHEN time_period = 'week' THEN date_trunc('week', tdp.timestamp)
            WHEN time_period = 'month' THEN date_trunc('month', tdp.timestamp)
            ELSE date_trunc('day', tdp.timestamp)
        END as period_start,
        CASE 
            WHEN time_period = 'day' THEN date_trunc('day', tdp.timestamp) + INTERVAL '1 day'
            WHEN time_period = 'week' THEN date_trunc('week', tdp.timestamp) + INTERVAL '1 week'
            WHEN time_period = 'month' THEN date_trunc('month', tdp.timestamp) + INTERVAL '1 month'
            ELSE date_trunc('day', tdp.timestamp) + INTERVAL '1 day'
        END as period_end,
        tdp.source,
        tdp.category,
        SUM(tdp.value) as total_value,
        AVG(tdp.value) as avg_value,
        MIN(tdp.value) as min_value,
        MAX(tdp.value) as max_value,
        COUNT(*) as data_count
    FROM public.tactical_data_points tdp
    WHERE tdp.timestamp >= start_date 
        AND tdp.timestamp <= end_date
        AND (data_source IS NULL OR tdp.source = data_source)
        AND (data_category IS NULL OR tdp.category = data_category)
    GROUP BY 
        period_start,
        period_end,
        tdp.source,
        tdp.category
    ORDER BY period_start, tdp.source, tdp.category;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate data quality metrics
CREATE OR REPLACE FUNCTION calculate_data_quality()
RETURNS TABLE (
    source VARCHAR(50),
    category VARCHAR(100),
    total_records BIGINT,
    null_values BIGINT,
    zero_values BIGINT,
    negative_values BIGINT,
    quality_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tdp.source,
        tdp.category,
        COUNT(*) as total_records,
        COUNT(*) FILTER (WHERE tdp.value IS NULL) as null_values,
        COUNT(*) FILTER (WHERE tdp.value = 0) as zero_values,
        COUNT(*) FILTER (WHERE tdp.value < 0) as negative_values,
        CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND(
                (COUNT(*) - COUNT(*) FILTER (WHERE tdp.value IS NULL)) * 100.0 / COUNT(*), 
                2
            )
        END as quality_score
    FROM public.tactical_data_points tdp
    GROUP BY tdp.source, tdp.category
    ORDER BY tdp.source, tdp.category;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample financial data for testing
INSERT INTO public.financial_expenses (date, amount, category, description, payment_method) VALUES
    (NOW() - INTERVAL '30 days', 5000, 'Marketing', 'Google Ads Campaign', 'Credit Card'),
    (NOW() - INTERVAL '25 days', 1200, 'Software', 'Supabase Pro Subscription', 'Credit Card'),
    (NOW() - INTERVAL '20 days', 3500, 'Marketing', 'Facebook Ads Campaign', 'Credit Card'),
    (NOW() - INTERVAL '15 days', 2000, 'Office', 'Office Rent', 'Bank Transfer'),
    (NOW() - INTERVAL '10 days', 800, 'Software', 'Development Tools', 'Credit Card'),
    (NOW() - INTERVAL '5 days', 1500, 'Marketing', 'Content Creation', 'PayPal')
ON CONFLICT DO NOTHING;

INSERT INTO public.financial_investments (date, amount, investment_type, description, expected_return) VALUES
    (NOW() - INTERVAL '60 days', 50000, 'Development', 'Platform Development Investment', 0.25),
    (NOW() - INTERVAL '45 days', 25000, 'Marketing', 'Brand Building Campaign', 0.15),
    (NOW() - INTERVAL '30 days', 15000, 'Technology', 'Infrastructure Upgrade', 0.20),
    (NOW() - INTERVAL '15 days', 10000, 'Content', 'Content Strategy Investment', 0.30)
ON CONFLICT DO NOTHING;

INSERT INTO public.cash_flow_metrics (date, cash_inflow, cash_outflow, cash_balance) VALUES
    (NOW() - INTERVAL '30 days', 25000, 12000, 150000),
    (NOW() - INTERVAL '25 days', 18000, 8500, 159500),
    (NOW() - INTERVAL '20 days', 32000, 15000, 176500),
    (NOW() - INTERVAL '15 days', 22000, 11000, 187500),
    (NOW() - INTERVAL '10 days', 28000, 9500, 206000),
    (NOW() - INTERVAL '5 days', 35000, 13000, 228000),
    (NOW(), 40000, 16000, 252000)
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tactical_data_points TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.financial_expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.financial_investments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cash_flow_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.predictive_insights TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analysis_jobs TO authenticated;

GRANT EXECUTE ON FUNCTION aggregate_tactical_data TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_data_quality TO authenticated; 