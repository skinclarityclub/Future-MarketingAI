-- ============================================
-- SKC BI Dashboard - Test Data Creation Script
-- ============================================
-- Run this script in your Supabase SQL Editor to populate the database with test data
-- IMPORTANT: This is for development/testing only!

-- First, let's create the tables if they don't exist
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    device_info JSONB DEFAULT '{}',
    is_returning_visitor BOOLEAN DEFAULT false,
    duration INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    bounce_rate DECIMAL DEFAULT 0,
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    utm_source TEXT,
    utm_campaign TEXT,
    utm_medium TEXT,
    referrer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_behavior_events (
    id SERIAL PRIMARY KEY,
    session_id TEXT REFERENCES user_sessions(id),
    user_id TEXT,
    event_type TEXT NOT NULL,
    current_page TEXT,
    page_url TEXT,
    event_data JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_personality_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    system_prompt TEXT,
    traits JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_system_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_configuration (
    id TEXT PRIMARY KEY,
    active_profile_id TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial data tables
CREATE TABLE IF NOT EXISTS financial_metrics (
    id SERIAL PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    category TEXT DEFAULT 'general',
    subcategory TEXT,
    currency TEXT DEFAULT 'EUR',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS revenue_data (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    revenue DECIMAL NOT NULL,
    source TEXT,
    category TEXT,
    region TEXT DEFAULT 'NL',
    currency TEXT DEFAULT 'EUR',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INSERT TEST DATA
-- ============================================

-- Clear existing data (for development only!)
DELETE FROM user_behavior_events;
DELETE FROM user_sessions;
DELETE FROM ai_personality_profiles;
DELETE FROM ai_system_messages;
DELETE FROM ai_configuration;
DELETE FROM financial_metrics;
DELETE FROM revenue_data;

-- Insert test user sessions
INSERT INTO user_sessions (id, user_id, device_info, is_returning_visitor, duration, page_views, clicks, bounce_rate, start_time, end_time, utm_source, utm_campaign, utm_medium, referrer) VALUES
('session_001', 'user_001', '{"device_type": "desktop", "browser": "Chrome", "os": "Windows"}', true, 450000, 8, 12, 0.2, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 'google', 'dashboard_promo', 'cpc', 'https://google.com'),
('session_002', 'user_002', '{"device_type": "mobile", "browser": "Safari", "os": "iOS"}', false, 180000, 3, 5, 0.6, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours', 'facebook', 'social_campaign', 'social', 'https://facebook.com'),
('session_003', 'user_003', '{"device_type": "tablet", "browser": "Firefox", "os": "Android"}', true, 720000, 15, 25, 0.1, NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours', 'direct', null, null, null),
('session_004', 'user_001', '{"device_type": "desktop", "browser": "Chrome", "os": "Windows"}', true, 320000, 6, 8, 0.3, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 'linkedin', 'professional', 'social', 'https://linkedin.com'),
('session_005', 'user_004', '{"device_type": "mobile", "browser": "Chrome", "os": "Android"}', false, 90000, 2, 1, 0.8, NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week', 'twitter', 'content_share', 'social', 'https://twitter.com');

-- Insert test behavior events
INSERT INTO user_behavior_events (session_id, user_id, event_type, current_page, page_url, event_data, timestamp) VALUES
('session_001', 'user_001', 'page_view', '/', '/', '{"load_time": 1200, "referrer": "https://google.com"}', NOW() - INTERVAL '2 hours'),
('session_001', 'user_001', 'click', '/', '/', '{"element": "nav-dashboard", "x": 150, "y": 80}', NOW() - INTERVAL '2 hours' + INTERVAL '30 seconds'),
('session_001', 'user_001', 'page_view', '/dashboard', '/dashboard', '{"load_time": 800}', NOW() - INTERVAL '2 hours' + INTERVAL '45 seconds'),
('session_001', 'user_001', 'scroll', '/dashboard', '/dashboard', '{"scroll_depth": 45, "max_scroll": 1200}', NOW() - INTERVAL '2 hours' + INTERVAL '2 minutes'),
('session_001', 'user_001', 'click', '/dashboard', '/dashboard', '{"element": "revenue-chart", "x": 400, "y": 300}', NOW() - INTERVAL '2 hours' + INTERVAL '3 minutes'),
('session_001', 'user_001', 'page_view', '/analytics', '/analytics', '{"load_time": 950}', NOW() - INTERVAL '2 hours' + INTERVAL '5 minutes'),

('session_002', 'user_002', 'page_view', '/', '/', '{"load_time": 2100, "referrer": "https://facebook.com"}', NOW() - INTERVAL '4 hours'),
('session_002', 'user_002', 'scroll', '/', '/', '{"scroll_depth": 25, "max_scroll": 800}', NOW() - INTERVAL '4 hours' + INTERVAL '1 minute'),
('session_002', 'user_002', 'page_view', '/demo', '/demo', '{"load_time": 1500}', NOW() - INTERVAL '4 hours' + INTERVAL '2 minutes'),

('session_003', 'user_003', 'page_view', '/dashboard', '/dashboard', '{"load_time": 700}', NOW() - INTERVAL '1 day'),
('session_003', 'user_003', 'form_interaction', '/dashboard', '/dashboard', '{"form_id": "settings", "field": "preferences"}', NOW() - INTERVAL '1 day' + INTERVAL '2 minutes'),
('session_003', 'user_003', 'search', '/dashboard', '/dashboard', '{"query": "revenue trends", "results": 12}', NOW() - INTERVAL '1 day' + INTERVAL '5 minutes'),
('session_003', 'user_003', 'click', '/dashboard', '/dashboard', '{"element": "export-button", "x": 200, "y": 100}', NOW() - INTERVAL '1 day' + INTERVAL '8 minutes');

-- Insert AI personality profiles
INSERT INTO ai_personality_profiles (id, name, description, system_prompt, traits, is_active) VALUES
('professional', 'Professional Assistant', 'Formal, precise, and business-focused communication style', 'You are a professional business assistant. Provide clear, concise, and formal responses. Focus on accuracy and efficiency.', '{"formality": 8, "creativity": 4, "empathy": 6, "technical": 7}', true),
('friendly', 'Friendly Helper', 'Warm, approachable, and conversational communication style', 'You are a friendly and helpful assistant. Be warm, approachable, and conversational while maintaining professionalism.', '{"formality": 4, "creativity": 7, "empathy": 9, "technical": 5}', false),
('technical', 'Technical Expert', 'Deep technical knowledge with precise, detailed explanations', 'You are a technical expert assistant. Provide detailed, accurate technical information with examples and best practices.', '{"formality": 6, "creativity": 5, "empathy": 4, "technical": 10}', false),
('creative', 'Creative Advisor', 'Innovative thinking with creative problem-solving approaches', 'You are a creative advisor. Think outside the box and provide innovative solutions with artistic flair.', '{"formality": 3, "creativity": 10, "empathy": 7, "technical": 4}', false);

-- Insert AI system messages
INSERT INTO ai_system_messages (id, name, content, category, is_active, priority) VALUES
('general', 'General Instructions', 'You are a helpful AI assistant for a Business Intelligence Dashboard. Provide accurate, concise, and relevant responses to user queries about data analysis, business metrics, and dashboard functionality.', 'general', true, 1),
('safety', 'Safety Guidelines', 'Always prioritize user safety and privacy. Do not provide harmful, illegal, or inappropriate content. Respect data confidentiality and business privacy.', 'safety', true, 2),
('business', 'Business Context', 'This is a business intelligence dashboard for SKC company. Focus on data-driven insights, professional communication, and actionable business recommendations. Support both Dutch and English languages.', 'business', true, 3),
('data_privacy', 'Data Privacy', 'Handle all business data with strict confidentiality. Never expose sensitive information or proprietary business intelligence outside the authorized context.', 'privacy', true, 4),
('localization', 'Localization', 'Support both Dutch (primary) and English languages. Use appropriate currency formatting (EUR/USD) and date formats (DD-MM-YYYY for NL, MM-DD-YYYY for US).', 'localization', true, 5);

-- Insert AI configuration
INSERT INTO ai_configuration (id, active_profile_id, settings) VALUES
('main', 'professional', '{
  "enablePersonalityAdaptation": true,
  "enableContextAwareness": true,
  "enableMLInsights": true,
  "defaultLocale": "nl",
  "fallbackProfile": "friendly",
  "maxTokens": 2000,
  "temperature": 0.7,
  "supportedLanguages": ["nl", "en"],
  "businessContext": {
    "company": "SKC",
    "industry": "Business Intelligence",
    "primaryMarkets": ["Netherlands", "Europe"]
  }
}');

-- Insert sample financial metrics
INSERT INTO financial_metrics (metric_name, metric_value, period_start, period_end, category, subcategory, currency) VALUES
('Total Revenue', 1250000.00, '2024-01-01', '2024-01-31', 'revenue', 'total', 'EUR'),
('Monthly Recurring Revenue', 850000.00, '2024-01-01', '2024-01-31', 'revenue', 'recurring', 'EUR'),
('Customer Acquisition Cost', 145.50, '2024-01-01', '2024-01-31', 'costs', 'acquisition', 'EUR'),
('Customer Lifetime Value', 2890.75, '2024-01-01', '2024-01-31', 'value', 'lifetime', 'EUR'),
('Gross Profit Margin', 0.68, '2024-01-01', '2024-01-31', 'profitability', 'margin', 'EUR'),
('Operating Expenses', 420000.00, '2024-01-01', '2024-01-31', 'costs', 'operational', 'EUR'),
('Net Profit', 380000.00, '2024-01-01', '2024-01-31', 'profitability', 'net', 'EUR'),
('Cash Flow', 450000.00, '2024-01-01', '2024-01-31', 'cash', 'flow', 'EUR'),

-- Previous month for comparison
('Total Revenue', 1180000.00, '2023-12-01', '2023-12-31', 'revenue', 'total', 'EUR'),
('Monthly Recurring Revenue', 820000.00, '2023-12-01', '2023-12-31', 'revenue', 'recurring', 'EUR'),
('Customer Acquisition Cost', 152.30, '2023-12-01', '2023-12-31', 'costs', 'acquisition', 'EUR'),
('Customer Lifetime Value', 2785.20, '2023-12-01', '2023-12-31', 'value', 'lifetime', 'EUR'),
('Gross Profit Margin', 0.65, '2023-12-01', '2023-12-31', 'profitability', 'margin', 'EUR'),
('Operating Expenses', 398000.00, '2023-12-01', '2023-12-31', 'costs', 'operational', 'EUR'),
('Net Profit', 365000.00, '2023-12-01', '2023-12-31', 'profitability', 'net', 'EUR'),
('Cash Flow', 425000.00, '2023-12-01', '2023-12-31', 'cash', 'flow', 'EUR');

-- Insert daily revenue data for the last 30 days
INSERT INTO revenue_data (date, revenue, source, category, region, currency) VALUES
-- January 2024 data
('2024-01-01', 42500.00, 'online', 'subscription', 'NL', 'EUR'),
('2024-01-02', 38900.00, 'partner', 'licensing', 'NL', 'EUR'),
('2024-01-03', 45200.00, 'online', 'subscription', 'DE', 'EUR'),
('2024-01-04', 41800.00, 'direct', 'consulting', 'NL', 'EUR'),
('2024-01-05', 47300.00, 'online', 'subscription', 'FR', 'EUR'),
('2024-01-06', 39600.00, 'partner', 'licensing', 'BE', 'EUR'),
('2024-01-07', 44100.00, 'online', 'subscription', 'NL', 'EUR'),
('2024-01-08', 40700.00, 'direct', 'consulting', 'DE', 'EUR'),
('2024-01-09', 46800.00, 'online', 'subscription', 'NL', 'EUR'),
('2024-01-10', 43200.00, 'partner', 'licensing', 'UK', 'EUR'),
('2024-01-11', 41500.00, 'online', 'subscription', 'NL', 'EUR'),
('2024-01-12', 45900.00, 'direct', 'consulting', 'FR', 'EUR'),
('2024-01-13', 38400.00, 'partner', 'licensing', 'NL', 'EUR'),
('2024-01-14', 44700.00, 'online', 'subscription', 'DE', 'EUR'),
('2024-01-15', 42100.00, 'online', 'subscription', 'NL', 'EUR'),
('2024-01-16', 46300.00, 'direct', 'consulting', 'BE', 'EUR'),
('2024-01-17', 40200.00, 'partner', 'licensing', 'NL', 'EUR'),
('2024-01-18', 47800.00, 'online', 'subscription', 'FR', 'EUR'),
('2024-01-19', 43600.00, 'online', 'subscription', 'NL', 'EUR'),
('2024-01-20', 41900.00, 'direct', 'consulting', 'DE', 'EUR'),
('2024-01-21', 45400.00, 'partner', 'licensing', 'NL', 'EUR'),
('2024-01-22', 39800.00, 'online', 'subscription', 'UK', 'EUR'),
('2024-01-23', 44600.00, 'online', 'subscription', 'NL', 'EUR'),
('2024-01-24', 42700.00, 'direct', 'consulting', 'FR', 'EUR'),
('2024-01-25', 46100.00, 'online', 'subscription', 'NL', 'EUR'),
('2024-01-26', 40500.00, 'partner', 'licensing', 'DE', 'EUR'),
('2024-01-27', 47200.00, 'online', 'subscription', 'BE', 'EUR'),
('2024-01-28', 43800.00, 'direct', 'consulting', 'NL', 'EUR'),
('2024-01-29', 41300.00, 'online', 'subscription', 'NL', 'EUR'),
('2024-01-30', 45700.00, 'partner', 'licensing', 'FR', 'EUR'),
('2024-01-31', 44000.00, 'online', 'subscription', 'NL', 'EUR');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start_time ON user_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_session_id ON user_behavior_events(session_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_timestamp ON user_behavior_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_financial_metrics_period ON financial_metrics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_revenue_data_date ON revenue_data(date);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the data was inserted correctly

SELECT 'User Sessions' as table_name, COUNT(*) as record_count FROM user_sessions
UNION ALL
SELECT 'User Behavior Events', COUNT(*) FROM user_behavior_events
UNION ALL
SELECT 'AI Personality Profiles', COUNT(*) FROM ai_personality_profiles
UNION ALL
SELECT 'AI System Messages', COUNT(*) FROM ai_system_messages
UNION ALL
SELECT 'AI Configuration', COUNT(*) FROM ai_configuration
UNION ALL
SELECT 'Financial Metrics', COUNT(*) FROM financial_metrics
UNION ALL
SELECT 'Revenue Data', COUNT(*) FROM revenue_data;

-- ============================================
-- NOTES
-- ============================================
-- 1. This script creates all necessary tables with sample data
-- 2. Run this in your Supabase SQL Editor
-- 3. The data includes realistic business metrics and user behavior
-- 4. All timestamps are relative to NOW() for current relevance
-- 5. Remember to delete this test data before going to production!

-- To clean up all test data later, run:
-- DELETE FROM user_behavior_events;
-- DELETE FROM user_sessions;
-- DELETE FROM ai_personality_profiles;
-- DELETE FROM ai_system_messages;
-- DELETE FROM ai_configuration;
-- DELETE FROM financial_metrics;
-- DELETE FROM revenue_data; 