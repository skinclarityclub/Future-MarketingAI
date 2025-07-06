-- =====================================================================================
-- n8n ClickUp Workflow Integration System
-- Migration: 040_n8n_clickup_workflow_system.sql
-- Purpose: Database schema for n8n workflow integration with ClickUp automation
-- Created: 2025-06-20
-- =====================================================================================

-- =====================================================================================
-- n8n Workflows Table
-- Stores n8n workflow configurations and metadata
-- =====================================================================================
CREATE TABLE n8n_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    n8n_workflow_id VARCHAR(255) UNIQUE NOT NULL,
    workflow_name VARCHAR(255) NOT NULL,
    workflow_description TEXT,
    workflow_type VARCHAR(50) NOT NULL, -- 'task_automation', 'content_workflow', 'time_tracking', 'reporting'
    workflow_status VARCHAR(30) DEFAULT 'active', -- 'active', 'paused', 'disabled', 'error'
    n8n_instance_url VARCHAR(500),
    webhook_url VARCHAR(500),
    api_credentials JSONB, -- Encrypted credentials and API keys
    workflow_config JSONB, -- Complete n8n workflow configuration
    clickup_integration_config JSONB, -- ClickUp-specific configuration
    trigger_conditions JSONB, -- Conditions that trigger this workflow
    last_execution_id VARCHAR(255),
    last_execution_status VARCHAR(30),
    last_execution_at TIMESTAMPTZ,
    total_executions INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0,
    failed_executions INTEGER DEFAULT 0,
    average_execution_time_ms BIGINT DEFAULT 0,
    created_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample workflows
INSERT INTO n8n_workflows (
    n8n_workflow_id,
    workflow_name,
    workflow_description,
    workflow_type,
    workflow_status,
    workflow_config,
    clickup_integration_config,
    trigger_conditions,
    created_by
) VALUES 
(
    'wf_001_task_automation',
    'Automated Task Assignment',
    'Automatically assigns new tasks to team members based on workload',
    'task_automation',
    'active',
    '{"version": "1.0", "nodes": [], "connections": {}}'::jsonb,
    '{"space_id": "123456", "assignment_rules": {"max_tasks_per_user": 10}}'::jsonb,
    '{"events": ["task.created"], "conditions": {"status": "new"}}'::jsonb,
    'admin@company.com'
);

-- Migration complete
SELECT 'n8n ClickUp Workflow Integration System migration completed successfully' as status;
