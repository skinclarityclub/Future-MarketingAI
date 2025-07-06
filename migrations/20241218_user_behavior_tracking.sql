-- User Behavior Tracking Tables
-- Migration for creating tables to store user behavior events and sessions

-- Table for storing individual user behavior events
CREATE TABLE IF NOT EXISTS user_behavior_events (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id TEXT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ NOT NULL,
    page_url TEXT NOT NULL,
    page_title TEXT NULL,
    user_agent TEXT NULL,
    ip_address TEXT NULL,
    referrer TEXT NULL,
    device_info JSONB NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for storing user sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NULL,
    duration INTEGER NULL, -- in seconds
    page_views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    scrolls INTEGER DEFAULT 0,
    form_interactions INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,4) NULL,
    exit_page TEXT NULL,
    entry_page TEXT NOT NULL,
    referrer TEXT NULL,
    utm_source TEXT NULL,
    utm_medium TEXT NULL,
    utm_campaign TEXT NULL,
    device_info JSONB NULL,
    ip_address TEXT NULL,
    is_returning_visitor BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for aggregated user behavior metrics
CREATE TABLE IF NOT EXISTS user_behavior_metrics (
    id SERIAL PRIMARY KEY,
    user_id TEXT NULL,
    session_count INTEGER DEFAULT 0,
    total_page_views INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    average_session_duration DECIMAL(10,2) DEFAULT 0,
    bounce_rate DECIMAL(5,4) DEFAULT 0,
    most_visited_pages JSONB DEFAULT '[]',
    most_clicked_elements JSONB DEFAULT '[]',
    search_queries JSONB DEFAULT '[]',
    conversion_events JSONB DEFAULT '[]',
    last_activity TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Table for storing heatmap data
CREATE TABLE IF NOT EXISTS heatmap_data (
    id SERIAL PRIMARY KEY,
    page_url TEXT NOT NULL,
    viewport_width INTEGER NOT NULL,
    viewport_height INTEGER NOT NULL,
    click_data JSONB DEFAULT '[]',
    scroll_data JSONB DEFAULT '[]',
    hover_data JSONB DEFAULT '[]',
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page_url, viewport_width, viewport_height)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_session_id ON user_behavior_events(session_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_user_id ON user_behavior_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_event_type ON user_behavior_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_timestamp ON user_behavior_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_page_url ON user_behavior_events(page_url);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_created_at ON user_behavior_events(created_at);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start_time ON user_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_user_sessions_end_time ON user_sessions(end_time);
CREATE INDEX IF NOT EXISTS idx_user_sessions_entry_page ON user_sessions(entry_page);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON user_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_user_behavior_metrics_user_id ON user_behavior_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_metrics_last_activity ON user_behavior_metrics(last_activity);

CREATE INDEX IF NOT EXISTS idx_heatmap_data_page_url ON heatmap_data(page_url);
CREATE INDEX IF NOT EXISTS idx_heatmap_data_generated_at ON heatmap_data(generated_at);

-- Function to update user behavior metrics
CREATE OR REPLACE FUNCTION update_user_behavior_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update user behavior metrics when a session is updated
    INSERT INTO user_behavior_metrics (
        user_id,
        session_count,
        total_page_views,
        total_clicks,
        average_session_duration,
        bounce_rate,
        last_activity,
        updated_at
    )
    SELECT 
        NEW.user_id,
        COUNT(*) as session_count,
        COALESCE(SUM(page_views), 0) as total_page_views,
        COALESCE(SUM(clicks), 0) as total_clicks,
        COALESCE(AVG(duration), 0) as average_session_duration,
        COALESCE(AVG(bounce_rate), 0) as bounce_rate,
        MAX(COALESCE(end_time, start_time)) as last_activity,
        NOW() as updated_at
    FROM user_sessions 
    WHERE user_id = NEW.user_id AND user_id IS NOT NULL
    GROUP BY user_id
    ON CONFLICT (user_id) 
    DO UPDATE SET
        session_count = EXCLUDED.session_count,
        total_page_views = EXCLUDED.total_page_views,
        total_clicks = EXCLUDED.total_clicks,
        average_session_duration = EXCLUDED.average_session_duration,
        bounce_rate = EXCLUDED.bounce_rate,
        last_activity = EXCLUDED.last_activity,
        updated_at = EXCLUDED.updated_at;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update metrics when sessions are modified
CREATE TRIGGER trigger_update_user_behavior_metrics
    AFTER INSERT OR UPDATE ON user_sessions
    FOR EACH ROW
    WHEN (NEW.user_id IS NOT NULL)
    EXECUTE FUNCTION update_user_behavior_metrics();

-- Function to calculate bounce rate for a session
CREATE OR REPLACE FUNCTION calculate_bounce_rate(session_id TEXT)
RETURNS DECIMAL(5,4) AS $$
DECLARE
    page_view_count INTEGER;
    session_duration INTEGER;
    bounce_rate DECIMAL(5,4);
BEGIN
    -- Get page view count and duration for the session
    SELECT 
        page_views,
        duration
    INTO 
        page_view_count,
        session_duration
    FROM user_sessions 
    WHERE id = session_id;
    
    -- Calculate bounce rate
    -- A session is considered a bounce if:
    -- 1. Only one page view
    -- 2. Session duration less than 30 seconds
    IF page_view_count <= 1 OR session_duration < 30 THEN
        bounce_rate := 1.0;
    ELSE
        bounce_rate := 0.0;
    END IF;
    
    RETURN bounce_rate;
END;
$$ LANGUAGE plpgsql;

-- Function to aggregate click data for heatmaps
CREATE OR REPLACE FUNCTION aggregate_click_heatmap_data(target_page_url TEXT, viewport_w INTEGER, viewport_h INTEGER)
RETURNS JSONB AS $$
DECLARE
    click_aggregation JSONB;
BEGIN
    -- Aggregate click data for heatmap generation
    SELECT 
        COALESCE(
            json_agg(
                json_build_object(
                    'x', (event_data->>'click_coordinates')::jsonb->>'x',
                    'y', (event_data->>'click_coordinates')::jsonb->>'y',
                    'count', click_count
                )
            ), 
            '[]'::json
        )::jsonb
    INTO click_aggregation
    FROM (
        SELECT 
            event_data->>'click_coordinates' as coordinates,
            COUNT(*) as click_count
        FROM user_behavior_events
        WHERE 
            event_type = 'click' 
            AND page_url = target_page_url
            AND (device_info->>'viewport_size')::jsonb->>'width' = viewport_w::text
            AND (device_info->>'viewport_size')::jsonb->>'height' = viewport_h::text
            AND event_data->>'click_coordinates' IS NOT NULL
        GROUP BY event_data->>'click_coordinates'
    ) aggregated_clicks;
    
    RETURN COALESCE(click_aggregation, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- View for common analytics queries
CREATE OR REPLACE VIEW user_behavior_analytics AS
SELECT 
    DATE(ube.created_at) as date,
    ube.event_type,
    COUNT(*) as event_count,
    COUNT(DISTINCT ube.session_id) as unique_sessions,
    COUNT(DISTINCT ube.user_id) as unique_users,
    COUNT(DISTINCT ube.page_url) as unique_pages,
    AVG(CASE 
        WHEN ube.event_data->>'page_load_time' IS NOT NULL 
        THEN (ube.event_data->>'page_load_time')::integer 
        ELSE NULL 
    END) as avg_page_load_time
FROM user_behavior_events ube
GROUP BY DATE(ube.created_at), ube.event_type
ORDER BY date DESC, event_count DESC;

-- View for session analytics
CREATE OR REPLACE VIEW session_analytics AS
SELECT 
    DATE(us.start_time) as date,
    COUNT(*) as total_sessions,
    COUNT(DISTINCT us.user_id) as unique_users,
    AVG(us.duration) as avg_session_duration,
    AVG(us.page_views) as avg_page_views_per_session,
    AVG(us.clicks) as avg_clicks_per_session,
    AVG(us.bounce_rate) as avg_bounce_rate,
    COUNT(CASE WHEN us.is_returning_visitor THEN 1 END) as returning_visitors,
    COUNT(CASE WHEN NOT us.is_returning_visitor THEN 1 END) as new_visitors
FROM user_sessions us
WHERE us.start_time IS NOT NULL
GROUP BY DATE(us.start_time)
ORDER BY date DESC;

-- Comments for documentation
COMMENT ON TABLE user_behavior_events IS 'Stores individual user interaction events like clicks, page views, form submissions, etc.';
COMMENT ON TABLE user_sessions IS 'Stores user session data with aggregated metrics for each session';
COMMENT ON TABLE user_behavior_metrics IS 'Stores aggregated user behavior metrics calculated from sessions and events';
COMMENT ON TABLE heatmap_data IS 'Stores aggregated click and interaction data for generating heatmaps';

COMMENT ON FUNCTION update_user_behavior_metrics() IS 'Automatically updates user behavior metrics when sessions are modified';
COMMENT ON FUNCTION calculate_bounce_rate(TEXT) IS 'Calculates bounce rate for a given session based on page views and duration';
COMMENT ON FUNCTION aggregate_click_heatmap_data(TEXT, INTEGER, INTEGER) IS 'Aggregates click data for heatmap generation for a specific page and viewport size';

COMMENT ON VIEW user_behavior_analytics IS 'Provides daily analytics for user behavior events';
COMMENT ON VIEW session_analytics IS 'Provides daily analytics for user sessions'; 