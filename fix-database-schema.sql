-- ============================================
-- Database Schema Fix Script
-- ============================================
-- First, let's check what tables already exist and their structure

-- Check existing tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check user_sessions table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_sessions' 
ORDER BY ordinal_position;

-- Drop and recreate user_sessions with correct structure
DROP TABLE IF EXISTS user_behavior_events CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;

-- Recreate user_sessions table with all required columns
CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    entry_page TEXT NOT NULL DEFAULT '/',
    current_page TEXT DEFAULT '/',
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

-- Recreate user_behavior_events table
CREATE TABLE user_behavior_events (
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

-- Insert test data with entry_page included
INSERT INTO user_sessions (id, user_id, entry_page, current_page, device_info, is_returning_visitor, duration, page_views, clicks, bounce_rate, start_time, end_time, utm_source, utm_campaign, utm_medium, referrer) VALUES
('session_001', 'user_001', '/', '/analytics', '{"device_type": "desktop", "browser": "Chrome", "os": "Windows"}', true, 450000, 8, 12, 0.2, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 'google', 'dashboard_promo', 'cpc', 'https://google.com'),
('session_002', 'user_002', '/', '/demo', '{"device_type": "mobile", "browser": "Safari", "os": "iOS"}', false, 180000, 3, 5, 0.6, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours', 'facebook', 'social_campaign', 'social', 'https://facebook.com'),
('session_003', 'user_003', '/dashboard', '/dashboard', '{"device_type": "tablet", "browser": "Firefox", "os": "Android"}', true, 720000, 15, 25, 0.1, NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours', 'direct', null, null, null),
('session_004', 'user_001', '/', '/dashboard', '{"device_type": "desktop", "browser": "Chrome", "os": "Windows"}', true, 320000, 6, 8, 0.3, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 'linkedin', 'professional', 'social', 'https://linkedin.com'),
('session_005', 'user_004', '/', '/', '{"device_type": "mobile", "browser": "Chrome", "os": "Android"}', false, 90000, 2, 1, 0.8, NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week', 'twitter', 'content_share', 'social', 'https://twitter.com');

-- Insert behavior events
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

-- Verification
SELECT 'User Sessions' as table_name, COUNT(*) as record_count FROM user_sessions
UNION ALL
SELECT 'User Behavior Events', COUNT(*) FROM user_behavior_events; 