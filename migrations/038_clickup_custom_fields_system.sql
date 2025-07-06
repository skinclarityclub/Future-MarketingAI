-- ClickUp Custom Fields and Metadata System Migration
-- File: 038_clickup_custom_fields_system.sql
-- Purpose: Support for ClickUp custom fields management and metadata mapping

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ClickUp Custom Fields Registry
-- Stores information about custom fields defined in ClickUp lists
CREATE TABLE IF NOT EXISTS clickup_custom_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clickup_field_id VARCHAR(255) NOT NULL,
    list_id VARCHAR(255) NOT NULL,
    workspace_id VARCHAR(255),
    field_name VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    type_config JSONB DEFAULT '{}',
    is_required BOOLEAN DEFAULT FALSE,
    hide_from_guests BOOLEAN DEFAULT FALSE,
    date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(clickup_field_id, list_id)
);

-- ClickUp Metadata Mappings
-- Maps platform fields to ClickUp custom fields for synchronization
CREATE TABLE IF NOT EXISTS clickup_metadata_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform_field VARCHAR(255) NOT NULL,
    clickup_field_id VARCHAR(255) NOT NULL,
    clickup_field_name VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    mapping_config JSONB NOT NULL DEFAULT '{}',
    workspace_id VARCHAR(255),
    list_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(platform_field, clickup_field_id, list_id)
);

-- Content Metadata Storage
-- Stores content metadata that can be synchronized with ClickUp
CREATE TABLE IF NOT EXISTS content_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    campaign_id VARCHAR(255),
    target_audience TEXT[],
    platforms TEXT[],
    publication_date TIMESTAMP WITH TIME ZONE,
    author VARCHAR(255),
    tags TEXT[],
    status VARCHAR(50) DEFAULT 'draft',
    priority VARCHAR(20) DEFAULT 'normal',
    estimated_effort_hours DECIMAL(5,2),
    budget DECIMAL(10,2),
    performance_metrics JSONB DEFAULT '{}',
    clickup_task_id VARCHAR(255),
    metadata_version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(content_id, content_type)
);

-- Custom Field Values History
-- Tracks changes to custom field values for audit purposes
CREATE TABLE IF NOT EXISTS clickup_field_value_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id VARCHAR(255) NOT NULL,
    field_id VARCHAR(255) NOT NULL,
    field_name VARCHAR(255) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    change_type VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete'
    sync_direction VARCHAR(20) NOT NULL, -- 'to_clickup', 'from_clickup'
    triggered_by VARCHAR(255), -- webhook, manual_sync, bulk_update
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Field Mapping Templates
-- Predefined field mapping templates for different content types
CREATE TABLE IF NOT EXISTS field_mapping_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    workspace_id VARCHAR(255),
    list_id VARCHAR(255),
    mappings JSONB NOT NULL DEFAULT '[]',
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(template_name, content_type, workspace_id)
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_clickup_custom_fields_list_id ON clickup_custom_fields(list_id);
CREATE INDEX IF NOT EXISTS idx_clickup_custom_fields_workspace_id ON clickup_custom_fields(workspace_id);
CREATE INDEX IF NOT EXISTS idx_clickup_custom_fields_field_type ON clickup_custom_fields(field_type);

CREATE INDEX IF NOT EXISTS idx_metadata_mappings_workspace_id ON clickup_metadata_mappings(workspace_id);
CREATE INDEX IF NOT EXISTS idx_metadata_mappings_list_id ON clickup_metadata_mappings(list_id);
CREATE INDEX IF NOT EXISTS idx_metadata_mappings_platform_field ON clickup_metadata_mappings(platform_field);
CREATE INDEX IF NOT EXISTS idx_metadata_mappings_active ON clickup_metadata_mappings(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_content_metadata_content_type ON content_metadata(content_type);
CREATE INDEX IF NOT EXISTS idx_content_metadata_status ON content_metadata(status);
CREATE INDEX IF NOT EXISTS idx_content_metadata_campaign_id ON content_metadata(campaign_id);
CREATE INDEX IF NOT EXISTS idx_content_metadata_clickup_task ON content_metadata(clickup_task_id);
CREATE INDEX IF NOT EXISTS idx_content_metadata_publication_date ON content_metadata(publication_date);

CREATE INDEX IF NOT EXISTS idx_field_value_history_task_id ON clickup_field_value_history(task_id);
CREATE INDEX IF NOT EXISTS idx_field_value_history_field_id ON clickup_field_value_history(field_id);
CREATE INDEX IF NOT EXISTS idx_field_value_history_change_type ON clickup_field_value_history(change_type);
CREATE INDEX IF NOT EXISTS idx_field_value_history_changed_at ON clickup_field_value_history(changed_at);

CREATE INDEX IF NOT EXISTS idx_field_mapping_templates_content_type ON field_mapping_templates(content_type);
CREATE INDEX IF NOT EXISTS idx_field_mapping_templates_workspace ON field_mapping_templates(workspace_id);
CREATE INDEX IF NOT EXISTS idx_field_mapping_templates_default ON field_mapping_templates(is_default) WHERE is_default = TRUE;

-- Row Level Security (RLS)
ALTER TABLE clickup_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE clickup_metadata_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE clickup_field_value_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_mapping_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic - can be customized based on requirements)
CREATE POLICY "Public access to custom fields" ON clickup_custom_fields FOR ALL USING (true);
CREATE POLICY "Public access to metadata mappings" ON clickup_metadata_mappings FOR ALL USING (true);
CREATE POLICY "Public access to content metadata" ON content_metadata FOR ALL USING (true);
CREATE POLICY "Public access to field value history" ON clickup_field_value_history FOR ALL USING (true);
CREATE POLICY "Public access to field mapping templates" ON field_mapping_templates FOR ALL USING (true);

-- Useful Views for reporting and analytics

-- Custom Fields Usage Statistics View
CREATE OR REPLACE VIEW custom_fields_usage_stats AS
SELECT 
    cf.workspace_id,
    cf.list_id,
    cf.field_type,
    cf.field_name,
    cf.is_required,
    COUNT(fvh.id) as usage_count,
    COUNT(DISTINCT fvh.task_id) as unique_tasks_count,
    MAX(fvh.changed_at) as last_used,
    AVG(CASE WHEN fvh.success THEN 1.0 ELSE 0.0 END) as success_rate
FROM clickup_custom_fields cf
LEFT JOIN clickup_field_value_history fvh ON cf.clickup_field_id = fvh.field_id
GROUP BY cf.workspace_id, cf.list_id, cf.field_type, cf.field_name, cf.is_required;

-- Metadata Mapping Performance View
CREATE OR REPLACE VIEW metadata_mapping_performance AS
SELECT 
    mm.workspace_id,
    mm.list_id,
    mm.platform_field,
    mm.field_type,
    mm.mapping_config->>'sync_direction' as sync_direction,
    COUNT(fvh.id) as total_syncs,
    COUNT(CASE WHEN fvh.success THEN 1 END) as successful_syncs,
    COUNT(CASE WHEN NOT fvh.success THEN 1 END) as failed_syncs,
    ROUND(COUNT(CASE WHEN fvh.success THEN 1 END)::numeric / NULLIF(COUNT(fvh.id), 0) * 100, 2) as success_percentage,
    MAX(fvh.changed_at) as last_sync,
    mm.is_active
FROM clickup_metadata_mappings mm
LEFT JOIN clickup_field_value_history fvh ON mm.clickup_field_id = fvh.field_id
GROUP BY mm.workspace_id, mm.list_id, mm.platform_field, mm.field_type, 
         mm.mapping_config->>'sync_direction', mm.is_active;

-- Content Performance by Type View
CREATE OR REPLACE VIEW content_performance_by_type AS
SELECT 
    content_type,
    COUNT(*) as total_content,
    COUNT(CASE WHEN status = 'published' THEN 1 END) as published_count,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
    AVG(estimated_effort_hours) as avg_effort_hours,
    AVG(budget) as avg_budget,
    AVG((performance_metrics->>'views')::numeric) as avg_views,
    AVG((performance_metrics->>'engagement_rate')::numeric) as avg_engagement_rate,
    AVG((performance_metrics->>'roi')::numeric) as avg_roi,
    COUNT(DISTINCT campaign_id) as unique_campaigns
FROM content_metadata
GROUP BY content_type;

-- Helper Functions

-- Function to update metadata mapping timestamps
CREATE OR REPLACE FUNCTION update_metadata_mapping_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for metadata mappings
DROP TRIGGER IF EXISTS update_metadata_mapping_timestamp_trigger ON clickup_metadata_mappings;
CREATE TRIGGER update_metadata_mapping_timestamp_trigger
    BEFORE UPDATE ON clickup_metadata_mappings
    FOR EACH ROW
    EXECUTE FUNCTION update_metadata_mapping_timestamp();

-- Function to update content metadata timestamps
CREATE OR REPLACE FUNCTION update_content_metadata_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.metadata_version = OLD.metadata_version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for content metadata
DROP TRIGGER IF EXISTS update_content_metadata_timestamp_trigger ON content_metadata;
CREATE TRIGGER update_content_metadata_timestamp_trigger
    BEFORE UPDATE ON content_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_content_metadata_timestamp();

-- Function to log field value changes
CREATE OR REPLACE FUNCTION log_field_value_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.performance_metrics IS DISTINCT FROM NEW.performance_metrics THEN
        INSERT INTO clickup_field_value_history (
            task_id,
            field_id,
            field_name,
            old_value,
            new_value,
            change_type,
            sync_direction,
            triggered_by
        ) VALUES (
            NEW.clickup_task_id,
            'performance_metrics',
            'Performance Metrics',
            OLD.performance_metrics,
            NEW.performance_metrics,
            'update',
            'from_platform',
            'content_metadata_update'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for content metadata performance tracking
DROP TRIGGER IF EXISTS log_content_metadata_changes_trigger ON content_metadata;
CREATE TRIGGER log_content_metadata_changes_trigger
    AFTER UPDATE ON content_metadata
    FOR EACH ROW
    EXECUTE FUNCTION log_field_value_change();

-- Cleanup function for old field value history
CREATE OR REPLACE FUNCTION cleanup_old_field_history(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM clickup_field_value_history 
    WHERE changed_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Insert default field mapping templates
INSERT INTO field_mapping_templates (
    template_name,
    content_type,
    mappings,
    description,
    is_default,
    created_by
) VALUES 
(
    'Blog Post Standard',
    'blog_post',
    '[
        {
            "platform_field": "content_type",
            "clickup_field_name": "Content Type",
            "sync_direction": "to_clickup",
            "transform_rule": "lowercase"
        },
        {
            "platform_field": "target_audience",
            "clickup_field_name": "Target Audience", 
            "sync_direction": "bidirectional",
            "transform_rule": "array_to_string"
        },
        {
            "platform_field": "publication_date",
            "clickup_field_name": "Publication Date",
            "sync_direction": "bidirectional",
            "transform_rule": "date_to_timestamp"
        },
        {
            "platform_field": "priority",
            "clickup_field_name": "Content Priority",
            "sync_direction": "bidirectional"
        },
        {
            "platform_field": "estimated_effort_hours",
            "clickup_field_name": "Estimated Effort (Hours)",
            "sync_direction": "bidirectional"
        },
        {
            "platform_field": "budget",
            "clickup_field_name": "Budget",
            "sync_direction": "to_clickup"
        }
    ]'::jsonb,
    'Standard field mapping template for blog posts',
    true,
    'system'
),
(
    'Social Media Standard', 
    'social_media',
    '[
        {
            "platform_field": "content_type",
            "clickup_field_name": "Content Type",
            "sync_direction": "to_clickup"
        },
        {
            "platform_field": "platforms",
            "clickup_field_name": "Platforms",
            "sync_direction": "bidirectional",
            "transform_rule": "array_to_string"
        },
        {
            "platform_field": "tags",
            "clickup_field_name": "Tags",
            "sync_direction": "bidirectional",
            "transform_rule": "array_to_string"
        },
        {
            "platform_field": "performance_metrics.engagement_rate",
            "clickup_field_name": "Performance Score",
            "sync_direction": "from_clickup"
        }
    ]'::jsonb,
    'Standard field mapping template for social media content',
    true,
    'system'
);

-- Comments for documentation
COMMENT ON TABLE clickup_custom_fields IS 'Registry of custom fields defined in ClickUp lists for metadata synchronization';
COMMENT ON TABLE clickup_metadata_mappings IS 'Mapping configuration between platform fields and ClickUp custom fields';
COMMENT ON TABLE content_metadata IS 'Content metadata storage with ClickUp task association';
COMMENT ON TABLE clickup_field_value_history IS 'Audit trail for custom field value changes and synchronization';
COMMENT ON TABLE field_mapping_templates IS 'Predefined field mapping templates for different content types';

COMMENT ON VIEW custom_fields_usage_stats IS 'Usage statistics for ClickUp custom fields across workspaces';
COMMENT ON VIEW metadata_mapping_performance IS 'Performance metrics for metadata field mappings';
COMMENT ON VIEW content_performance_by_type IS 'Content performance analytics grouped by content type';
