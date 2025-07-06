-- Migration: ClickUp Content Extraction System
-- Description: Creates tables for content extraction, scheduling, and dashboard integration
-- Date: 2025-06-23

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ClickUp Extracted Content Table
CREATE TABLE IF NOT EXISTS clickup_extracted_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    media_urls JSONB NOT NULL DEFAULT '[]',
    scheduling_preferences JSONB NOT NULL DEFAULT '{}',
    approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('approved', 'pending', 'rejected')),
    extracted_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Calendar Items Table
CREATE TABLE IF NOT EXISTS content_calendar_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clickup_task_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    media_urls JSONB NOT NULL DEFAULT '[]',
    scheduled_time TIMESTAMPTZ,
    platforms JSONB NOT NULL DEFAULT '[]',
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'failed', 'cancelled')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key reference to extracted content
    FOREIGN KEY (clickup_task_id) REFERENCES clickup_extracted_content(task_id) ON DELETE CASCADE
);

-- Blotato Scheduling Results Table
CREATE TABLE IF NOT EXISTS blotato_scheduling_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clickup_task_id TEXT NOT NULL,
    blotato_schedule_id TEXT,
    scheduled_posts JSONB NOT NULL DEFAULT '[]',
    scheduling_status TEXT DEFAULT 'scheduled' CHECK (scheduling_status IN ('scheduled', 'published', 'failed', 'cancelled')),
    scheduled_at TIMESTAMPTZ NOT NULL,
    published_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign key reference to extracted content
    FOREIGN KEY (clickup_task_id) REFERENCES clickup_extracted_content(task_id) ON DELETE CASCADE
);

-- Content Extraction Logs Table
CREATE TABLE IF NOT EXISTS content_extraction_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clickup_task_id TEXT NOT NULL,
    trigger_type TEXT NOT NULL, -- 'status_approval', 'tag_approval', 'manual'
    success BOOLEAN NOT NULL DEFAULT FALSE,
    error_message TEXT,
    processed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Reference to extracted content (optional, may not exist if extraction failed)
    FOREIGN KEY (clickup_task_id) REFERENCES clickup_extracted_content(task_id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_extracted_content_task_id ON clickup_extracted_content(task_id);
CREATE INDEX IF NOT EXISTS idx_extracted_content_approval_status ON clickup_extracted_content(approval_status);
CREATE INDEX IF NOT EXISTS idx_extracted_content_extracted_at ON clickup_extracted_content(extracted_at);

CREATE INDEX IF NOT EXISTS idx_calendar_items_clickup_task_id ON content_calendar_items(clickup_task_id);
CREATE INDEX IF NOT EXISTS idx_calendar_items_scheduled_time ON content_calendar_items(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_calendar_items_status ON content_calendar_items(status);
CREATE INDEX IF NOT EXISTS idx_calendar_items_priority ON content_calendar_items(priority);

CREATE INDEX IF NOT EXISTS idx_blotato_results_clickup_task_id ON blotato_scheduling_results(clickup_task_id);
CREATE INDEX IF NOT EXISTS idx_blotato_results_scheduling_status ON blotato_scheduling_results(scheduling_status);
CREATE INDEX IF NOT EXISTS idx_blotato_results_scheduled_at ON blotato_scheduling_results(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_extraction_logs_clickup_task_id ON content_extraction_logs(clickup_task_id);
CREATE INDEX IF NOT EXISTS idx_extraction_logs_trigger_type ON content_extraction_logs(trigger_type);
CREATE INDEX IF NOT EXISTS idx_extraction_logs_success ON content_extraction_logs(success);
CREATE INDEX IF NOT EXISTS idx_extraction_logs_processed_at ON content_extraction_logs(processed_at);

-- Create view for content workflow status
CREATE OR REPLACE VIEW content_workflow_status AS
SELECT 
    ec.task_id,
    ec.title,
    ec.approval_status,
    ec.extracted_at,
    cci.scheduled_time,
    cci.platforms,
    cci.priority,
    cci.status as calendar_status,
    bsr.blotato_schedule_id,
    bsr.scheduling_status as blotato_status,
    bsr.scheduled_at as blotato_scheduled_at,
    bsr.published_at as blotato_published_at,
    CASE 
        WHEN bsr.published_at IS NOT NULL THEN 'published'
        WHEN bsr.scheduled_at IS NOT NULL THEN 'scheduled'
        WHEN cci.scheduled_time IS NOT NULL THEN 'calendar_ready'
        WHEN ec.extracted_at IS NOT NULL THEN 'extracted'
        ELSE 'pending'
    END as workflow_stage
FROM clickup_extracted_content ec
LEFT JOIN content_calendar_items cci ON ec.task_id = cci.clickup_task_id
LEFT JOIN blotato_scheduling_results bsr ON ec.task_id = bsr.clickup_task_id
ORDER BY ec.extracted_at DESC;

-- Create view for extraction performance metrics
CREATE OR REPLACE VIEW content_extraction_metrics AS
SELECT 
    DATE_TRUNC('day', processed_at) as extraction_date,
    trigger_type,
    COUNT(*) as total_attempts,
    COUNT(CASE WHEN success = true THEN 1 END) as successful_extractions,
    COUNT(CASE WHEN success = false THEN 1 END) as failed_extractions,
    ROUND(
        (COUNT(CASE WHEN success = true THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as success_rate_percent
FROM content_extraction_logs
GROUP BY DATE_TRUNC('day', processed_at), trigger_type
ORDER BY extraction_date DESC, trigger_type;

-- Function to get content workflow summary
CREATE OR REPLACE FUNCTION get_content_workflow_summary(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_extracted INTEGER,
    scheduled_count INTEGER,
    published_count INTEGER,
    failed_count INTEGER,
    pending_count INTEGER,
    avg_extraction_to_publish_hours NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_extracted,
        COUNT(CASE WHEN workflow_stage IN ('scheduled', 'published') THEN 1 END)::INTEGER as scheduled_count,
        COUNT(CASE WHEN workflow_stage = 'published' THEN 1 END)::INTEGER as published_count,
        COUNT(CASE WHEN calendar_status = 'failed' OR blotato_status = 'failed' THEN 1 END)::INTEGER as failed_count,
        COUNT(CASE WHEN workflow_stage = 'pending' THEN 1 END)::INTEGER as pending_count,
        ROUND(
            AVG(
                CASE 
                    WHEN blotato_published_at IS NOT NULL THEN 
                        EXTRACT(EPOCH FROM (blotato_published_at - extracted_at)) / 3600.0
                    ELSE NULL
                END
            ), 2
        ) as avg_extraction_to_publish_hours
    FROM content_workflow_status
    WHERE DATE(extracted_at) BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old extraction logs
CREATE OR REPLACE FUNCTION cleanup_old_extraction_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM content_extraction_logs 
    WHERE processed_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_extracted_content_updated_at 
    BEFORE UPDATE ON clickup_extracted_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_items_updated_at 
    BEFORE UPDATE ON content_calendar_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blotato_results_updated_at 
    BEFORE UPDATE ON blotato_scheduling_results 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial configuration data
INSERT INTO clickup_extracted_content (task_id, title, description, extracted_at) 
VALUES ('setup-test', 'ClickUp Content Extraction Setup Test', 'Initial setup verification task', NOW())
ON CONFLICT (task_id) DO NOTHING;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_app_user; 