-- =====================================================================================
-- ClickUp Time Tracking System Migration
-- 
-- This migration creates tables and views for comprehensive time tracking
-- integration with ClickUp, including time entries, project progress,
-- team productivity metrics, and active timer management.
-- =====================================================================================

BEGIN;

-- Drop existing objects if they exist (for re-running migration)
DROP TABLE IF EXISTS clickup_time_entries CASCADE;
DROP TABLE IF EXISTS clickup_project_progress CASCADE;
DROP TABLE IF EXISTS clickup_team_productivity CASCADE;
DROP TABLE IF EXISTS clickup_active_timers CASCADE;
DROP TABLE IF EXISTS clickup_time_reports CASCADE;
DROP TABLE IF EXISTS clickup_productivity_snapshots CASCADE;

DROP VIEW IF EXISTS time_tracking_stats_view CASCADE;
DROP VIEW IF EXISTS project_progress_summary_view CASCADE;
DROP VIEW IF EXISTS team_productivity_summary_view CASCADE;
DROP VIEW IF EXISTS daily_time_breakdown_view CASCADE;

DROP FUNCTION IF EXISTS cleanup_old_time_entries() CASCADE;
DROP FUNCTION IF EXISTS calculate_productivity_score() CASCADE;
DROP FUNCTION IF EXISTS get_user_time_stats() CASCADE;

-- =====================================================================================
-- Time Entries Table
-- Stores individual time tracking entries from ClickUp
-- =====================================================================================
CREATE TABLE clickup_time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clickup_time_entry_id VARCHAR(255) UNIQUE NOT NULL,
    task_id VARCHAR(255) NOT NULL,
    clickup_task_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    clickup_user_id VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_ms BIGINT NOT NULL DEFAULT 0, -- duration in milliseconds
    billable BOOLEAN DEFAULT true,
    project_id VARCHAR(255),
    space_id VARCHAR(255),
    list_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================================
-- Project Progress Table
-- Stores calculated project progress metrics
-- =====================================================================================
CREATE TABLE clickup_project_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id VARCHAR(255) NOT NULL,
    clickup_space_id VARCHAR(255) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    total_estimated_time_ms BIGINT DEFAULT 0,
    total_tracked_time_ms BIGINT DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    team_members_count INTEGER DEFAULT 0,
    active_tasks_count INTEGER DEFAULT 0,
    completed_tasks_count INTEGER DEFAULT 0,
    overdue_tasks_count INTEGER DEFAULT 0,
    average_daily_hours DECIMAL(8,2) DEFAULT 0.00,
    productivity_score DECIMAL(5,2) DEFAULT 0.00,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================================
-- Team Productivity Table
-- Stores individual user productivity metrics
-- =====================================================================================
CREATE TABLE clickup_team_productivity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    clickup_user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    date_recorded DATE NOT NULL,
    total_hours_today DECIMAL(8,2) DEFAULT 0.00,
    total_hours_week DECIMAL(8,2) DEFAULT 0.00,
    total_hours_month DECIMAL(8,2) DEFAULT 0.00,
    productivity_score DECIMAL(5,2) DEFAULT 0.00,
    tasks_completed_today INTEGER DEFAULT 0,
    tasks_completed_week INTEGER DEFAULT 0,
    average_task_time_hours DECIMAL(8,2) DEFAULT 0.00,
    billable_hours_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, date_recorded)
);

-- =====================================================================================
-- Active Timers Table
-- Tracks currently running time entries
-- =====================================================================================
CREATE TABLE clickup_active_timers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clickup_timer_id VARCHAR(255) UNIQUE NOT NULL,
    task_id VARCHAR(255) NOT NULL,
    clickup_task_id VARCHAR(255) NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    clickup_user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    current_duration_ms BIGINT DEFAULT 0,
    description TEXT,
    project_name VARCHAR(255),
    space_id VARCHAR(255),
    billable BOOLEAN DEFAULT true,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================================
-- Time Reports Table
-- Stores generated time reports for projects
-- =====================================================================================
CREATE TABLE clickup_time_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_tracked_hours DECIMAL(10,2) DEFAULT 0.00,
    total_billable_hours DECIMAL(10,2) DEFAULT 0.00,
    total_non_billable_hours DECIMAL(10,2) DEFAULT 0.00,
    team_members_count INTEGER DEFAULT 0,
    average_productivity_score DECIMAL(5,2) DEFAULT 0.00,
    report_data JSONB, -- Detailed breakdown data
    generated_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================================
-- Productivity Snapshots Table
-- Stores periodic snapshots for trend analysis
-- =====================================================================================
CREATE TABLE clickup_productivity_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_date DATE NOT NULL,
    snapshot_hour INTEGER NOT NULL, -- 0-23 for hourly snapshots
    total_active_timers INTEGER DEFAULT 0,
    total_users_active INTEGER DEFAULT 0,
    total_hours_today DECIMAL(8,2) DEFAULT 0.00,
    average_productivity_score DECIMAL(5,2) DEFAULT 0.00,
    most_productive_hour INTEGER,
    least_productive_hour INTEGER,
    top_performer_user_id VARCHAR(255),
    projects_in_progress INTEGER DEFAULT 0,
    overdue_projects INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(snapshot_date, snapshot_hour)
);

-- =====================================================================================
-- Indexing for Performance Optimization
-- =====================================================================================

-- Time Entries Indexes
CREATE INDEX idx_clickup_time_entries_task_id ON clickup_time_entries(task_id);
CREATE INDEX idx_clickup_time_entries_user_id ON clickup_time_entries(user_id);
CREATE INDEX idx_clickup_time_entries_start_time ON clickup_time_entries(start_time);
CREATE INDEX idx_clickup_time_entries_project_id ON clickup_time_entries(project_id);
CREATE INDEX idx_clickup_time_entries_billable ON clickup_time_entries(billable);
CREATE INDEX idx_clickup_time_entries_date_range ON clickup_time_entries(start_time, end_time);

-- Project Progress Indexes
CREATE INDEX idx_clickup_project_progress_project_id ON clickup_project_progress(project_id);
CREATE INDEX idx_clickup_project_progress_calculated_at ON clickup_project_progress(calculated_at);
-- Note: Daily uniqueness enforced at application level due to PostgreSQL IMMUTABLE function requirements

-- Team Productivity Indexes
CREATE INDEX idx_clickup_team_productivity_user_id ON clickup_team_productivity(user_id);
CREATE INDEX idx_clickup_team_productivity_date ON clickup_team_productivity(date_recorded);
CREATE INDEX idx_clickup_team_productivity_score ON clickup_team_productivity(productivity_score DESC);

-- Active Timers Indexes
CREATE INDEX idx_clickup_active_timers_user_id ON clickup_active_timers(user_id);
CREATE INDEX idx_clickup_active_timers_start_time ON clickup_active_timers(start_time);
CREATE INDEX idx_clickup_active_timers_task_id ON clickup_active_timers(task_id);

-- Reports Indexes
CREATE INDEX idx_clickup_time_reports_project_id ON clickup_time_reports(project_id);
CREATE INDEX idx_clickup_time_reports_date_range ON clickup_time_reports(start_date, end_date);
CREATE INDEX idx_clickup_time_reports_type ON clickup_time_reports(report_type);

-- Snapshots Indexes
CREATE INDEX idx_clickup_productivity_snapshots_date ON clickup_productivity_snapshots(snapshot_date);
CREATE INDEX idx_clickup_productivity_snapshots_hour ON clickup_productivity_snapshots(snapshot_hour);

-- =====================================================================================
-- Analytical Views
-- =====================================================================================

-- Time Tracking Statistics View
CREATE VIEW time_tracking_stats_view AS
SELECT 
    CURRENT_DATE as stats_date,
    COUNT(DISTINCT cte.user_id) as active_users_today,
    COUNT(*) as total_time_entries_today,
    SUM(cte.duration_ms) / 3600000.0 as total_hours_today,
    SUM(CASE WHEN cte.billable THEN cte.duration_ms ELSE 0 END) / 3600000.0 as billable_hours_today,
    SUM(CASE WHEN NOT cte.billable THEN cte.duration_ms ELSE 0 END) / 3600000.0 as non_billable_hours_today,
    AVG(cte.duration_ms) / 3600000.0 as average_entry_duration_hours,
    COUNT(DISTINCT cte.project_id) as active_projects_today,
    (SELECT COUNT(*) FROM clickup_active_timers) as active_timers_count
FROM clickup_time_entries cte
WHERE DATE(cte.start_time) = CURRENT_DATE;

-- Project Progress Summary View
CREATE VIEW project_progress_summary_view AS
SELECT 
    cpp.project_id,
    cpp.project_name,
    cpp.total_estimated_time_ms / 3600000.0 as total_estimated_hours,
    cpp.total_tracked_time_ms / 3600000.0 as total_tracked_hours,
    cpp.completion_percentage,
    cpp.team_members_count,
    cpp.active_tasks_count,
    cpp.completed_tasks_count,
    cpp.overdue_tasks_count,
    cpp.average_daily_hours,
    cpp.productivity_score,
    cpp.last_activity,
    cpp.calculated_at,
    CASE 
        WHEN cpp.completion_percentage >= 90 THEN 'Near Completion'
        WHEN cpp.completion_percentage >= 70 THEN 'Good Progress'
        WHEN cpp.completion_percentage >= 40 THEN 'In Progress'
        ELSE 'Just Started'
    END as progress_status,
    CASE 
        WHEN cpp.productivity_score >= 80 THEN 'High'
        WHEN cpp.productivity_score >= 60 THEN 'Medium'
        ELSE 'Low'
    END as productivity_level
FROM clickup_project_progress cpp
WHERE cpp.calculated_at >= CURRENT_DATE - INTERVAL '7 days';

-- Team Productivity Summary View
CREATE VIEW team_productivity_summary_view AS
SELECT 
    ctp.user_id,
    ctp.user_name,
    ctp.date_recorded,
    ctp.total_hours_today,
    ctp.total_hours_week,
    ctp.total_hours_month,
    ctp.productivity_score,
    ctp.tasks_completed_today,
    ctp.tasks_completed_week,
    ctp.average_task_time_hours,
    ctp.billable_hours_percentage,
    RANK() OVER (PARTITION BY ctp.date_recorded ORDER BY ctp.productivity_score DESC) as daily_rank,
    CASE 
        WHEN ctp.productivity_score >= 80 THEN 'Excellent'
        WHEN ctp.productivity_score >= 60 THEN 'Good'
        WHEN ctp.productivity_score >= 40 THEN 'Average'
        ELSE 'Needs Improvement'
    END as performance_level
FROM clickup_team_productivity ctp
WHERE ctp.date_recorded >= CURRENT_DATE - INTERVAL '30 days';

-- Daily Time Breakdown View
CREATE VIEW daily_time_breakdown_view AS
SELECT 
    DATE(cte.start_time) as date,
    EXTRACT(HOUR FROM cte.start_time) as hour,
    COUNT(*) as entries_count,
    SUM(cte.duration_ms) / 3600000.0 as total_hours,
    SUM(CASE WHEN cte.billable THEN cte.duration_ms ELSE 0 END) / 3600000.0 as billable_hours,
    SUM(CASE WHEN NOT cte.billable THEN cte.duration_ms ELSE 0 END) / 3600000.0 as non_billable_hours,
    COUNT(DISTINCT cte.user_id) as unique_users,
    COUNT(DISTINCT cte.project_id) as unique_projects,
    AVG(cte.duration_ms) / 3600000.0 as average_entry_duration
FROM clickup_time_entries cte
WHERE cte.start_time >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(cte.start_time), EXTRACT(HOUR FROM cte.start_time)
ORDER BY date DESC, hour;

-- =====================================================================================
-- Utility Functions
-- =====================================================================================

-- Function to calculate productivity score
CREATE OR REPLACE FUNCTION calculate_productivity_score(
    hours_worked DECIMAL,
    tasks_completed INTEGER,
    average_task_time DECIMAL,
    billable_percentage DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    hours_score DECIMAL;
    completion_score DECIMAL;
    efficiency_score DECIMAL;
    billable_score DECIMAL;
BEGIN
    -- Hours score (max 25 points for 8+ hours)
    hours_score := LEAST(hours_worked / 8.0, 1.0) * 25;
    
    -- Completion score (max 25 points)
    completion_score := LEAST(tasks_completed * 10, 25);
    
    -- Efficiency score (max 25 points)
    efficiency_score := CASE 
        WHEN average_task_time > 0 THEN LEAST(25.0 / average_task_time, 25)
        ELSE 0
    END;
    
    -- Billable score (max 25 points)
    billable_score := (billable_percentage / 100.0) * 25;
    
    RETURN hours_score + completion_score + efficiency_score + billable_score;
END;
$$ LANGUAGE plpgsql;

-- Function to get user time statistics
CREATE OR REPLACE FUNCTION get_user_time_stats(
    p_user_id VARCHAR,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
) RETURNS TABLE (
    total_hours DECIMAL,
    billable_hours DECIMAL,
    non_billable_hours DECIMAL,
    entries_count INTEGER,
    average_entry_duration DECIMAL,
    productivity_score DECIMAL
) AS $$
DECLARE
    start_date DATE;
    end_date DATE;
BEGIN
    start_date := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
    end_date := COALESCE(p_end_date, CURRENT_DATE);
    
    RETURN QUERY
    SELECT 
        COALESCE(SUM(cte.duration_ms) / 3600000.0, 0) as total_hours,
        COALESCE(SUM(CASE WHEN cte.billable THEN cte.duration_ms ELSE 0 END) / 3600000.0, 0) as billable_hours,
        COALESCE(SUM(CASE WHEN NOT cte.billable THEN cte.duration_ms ELSE 0 END) / 3600000.0, 0) as non_billable_hours,
        COUNT(*)::INTEGER as entries_count,
        COALESCE(AVG(cte.duration_ms) / 3600000.0, 0) as average_entry_duration,
        COALESCE(AVG(ctp.productivity_score), 0) as productivity_score
    FROM clickup_time_entries cte
    LEFT JOIN clickup_team_productivity ctp ON cte.user_id = ctp.user_id 
        AND DATE(cte.start_time) = ctp.date_recorded
    WHERE cte.user_id = p_user_id
        AND DATE(cte.start_time) BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old time entries (keep last 6 months)
CREATE OR REPLACE FUNCTION cleanup_old_time_entries() RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM clickup_time_entries 
    WHERE created_at < CURRENT_DATE - INTERVAL '6 months';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    DELETE FROM clickup_project_progress 
    WHERE calculated_at < CURRENT_DATE - INTERVAL '6 months';
    
    DELETE FROM clickup_team_productivity 
    WHERE date_recorded < CURRENT_DATE - INTERVAL '6 months';
    
    DELETE FROM clickup_productivity_snapshots 
    WHERE snapshot_date < CURRENT_DATE - INTERVAL '6 months';
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================================
-- Triggers for Automatic Updates
-- =====================================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers to all tables
CREATE TRIGGER update_clickup_time_entries_updated_at 
    BEFORE UPDATE ON clickup_time_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clickup_project_progress_updated_at 
    BEFORE UPDATE ON clickup_project_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clickup_team_productivity_updated_at 
    BEFORE UPDATE ON clickup_team_productivity 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================================
-- Row Level Security (RLS) Policies
-- =====================================================================================

-- Enable RLS on all tables
ALTER TABLE clickup_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE clickup_project_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE clickup_team_productivity ENABLE ROW LEVEL SECURITY;
ALTER TABLE clickup_active_timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clickup_time_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE clickup_productivity_snapshots ENABLE ROW LEVEL SECURITY;

-- Create policies (example - adjust based on your auth system)
CREATE POLICY "Users can view their own time entries" ON clickup_time_entries
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own time entries" ON clickup_time_entries
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own time entries" ON clickup_time_entries
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Project progress viewable by project members
CREATE POLICY "Project progress viewable by members" ON clickup_project_progress
    FOR SELECT USING (true); -- Adjust based on project membership logic

-- Team productivity policies
CREATE POLICY "Users can view their own productivity" ON clickup_team_productivity
    FOR SELECT USING (auth.uid()::text = user_id);

-- Active timers policies
CREATE POLICY "Users can view their own active timers" ON clickup_active_timers
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can manage their own active timers" ON clickup_active_timers
    FOR ALL USING (auth.uid()::text = user_id);

-- =====================================================================================
-- Sample Data Insertion (for testing)
-- =====================================================================================

-- Insert sample time entry
INSERT INTO clickup_time_entries (
    clickup_time_entry_id, task_id, clickup_task_id, user_id, clickup_user_id, 
    description, start_time, end_time, duration_ms, billable, project_id
) VALUES (
    'te_sample_001', 'task_001', 'cu_task_001', 'user_001', 'cu_user_001',
    'Working on ClickUp integration', 
    NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 
    3600000, true, 'project_001'
);

-- Insert sample project progress
INSERT INTO clickup_project_progress (
    project_id, clickup_space_id, project_name, total_estimated_time_ms,
    total_tracked_time_ms, completion_percentage, team_members_count,
    active_tasks_count, completed_tasks_count, productivity_score
) VALUES (
    'project_001', 'space_001', 'ClickUp Integration Project', 
    288000000, 144000000, 50.0, 4, 8, 6, 75.5
);

-- Insert sample team productivity
INSERT INTO clickup_team_productivity (
    user_id, clickup_user_id, user_name, date_recorded,
    total_hours_today, total_hours_week, productivity_score,
    tasks_completed_today, billable_hours_percentage
) VALUES (
    'user_001', 'cu_user_001', 'John Doe', CURRENT_DATE,
    6.5, 32.0, 82.5, 3, 85.0
);

COMMIT;

-- =====================================================================================
-- Migration Complete
-- =====================================================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'ClickUp Time Tracking System migration completed successfully';
    RAISE NOTICE 'Created tables: clickup_time_entries, clickup_project_progress, clickup_team_productivity, clickup_active_timers, clickup_time_reports, clickup_productivity_snapshots';
    RAISE NOTICE 'Created views: time_tracking_stats_view, project_progress_summary_view, team_productivity_summary_view, daily_time_breakdown_view';
    RAISE NOTICE 'Created functions: calculate_productivity_score, get_user_time_stats, cleanup_old_time_entries';
    RAISE NOTICE 'Enabled RLS and created sample data for testing';
END $$;
