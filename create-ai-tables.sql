-- ============================================
-- AI Configuration Tables Setup
-- ============================================

-- Create AI tables if they don't exist
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

-- Clear and insert AI data
DELETE FROM ai_personality_profiles;
DELETE FROM ai_system_messages;
DELETE FROM ai_configuration;
DELETE FROM financial_metrics;
DELETE FROM revenue_data;

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
('Cash Flow', 450000.00, '2024-01-01', '2024-01-31', 'cash', 'flow', 'EUR');

-- Insert daily revenue data
INSERT INTO revenue_data (date, revenue, source, category, region, currency) VALUES
('2024-01-01', 42500.00, 'online', 'subscription', 'NL', 'EUR'),
('2024-01-02', 38900.00, 'partner', 'licensing', 'NL', 'EUR'),
('2024-01-03', 45200.00, 'online', 'subscription', 'DE', 'EUR'),
('2024-01-04', 41800.00, 'direct', 'consulting', 'NL', 'EUR'),
('2024-01-05', 47300.00, 'online', 'subscription', 'FR', 'EUR');

-- Verification
SELECT 'AI Personality Profiles' as table_name, COUNT(*) as record_count FROM ai_personality_profiles
UNION ALL
SELECT 'AI System Messages', COUNT(*) FROM ai_system_messages
UNION ALL
SELECT 'AI Configuration', COUNT(*) FROM ai_configuration
UNION ALL
SELECT 'Financial Metrics', COUNT(*) FROM financial_metrics
UNION ALL
SELECT 'Revenue Data', COUNT(*) FROM revenue_data;

-- ========================================
-- DONE! 
-- ========================================
-- Tables created:
-- ✅ ai_personality_profiles
-- ✅ ai_system_messages  
-- ✅ ai_configuration
--
-- Default data inserted:
-- ✅ 4 personality profiles
-- ✅ 5 system messages
-- ✅ 1 configuration record
-- ✅ 8 financial metrics
-- ✅ 5 revenue data records
-- ======================================== 