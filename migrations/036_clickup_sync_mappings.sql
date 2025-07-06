-- ClickUp Sync Mappings Migration
-- Creates tables for tracking bidirectional sync between platform and ClickUp

-- Create ClickUp sync mappings table
CREATE TABLE IF NOT EXISTS clickup_sync_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_task_id VARCHAR(255) NOT NULL,
  clickup_task_id VARCHAR(255) NOT NULL,
  clickup_list_id VARCHAR(255) NOT NULL,
  last_sync_platform TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sync_clickup TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sync_direction VARCHAR(50) DEFAULT 'bidirectional' CHECK (sync_direction IN ('platform_to_clickup', 'clickup_to_platform', 'bidirectional')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique mappings
  UNIQUE(platform_task_id),
  UNIQUE(clickup_task_id)
);

-- Create enhanced tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'done', 'cancelled', 'blocked')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee_id UUID,
  due_date TIMESTAMPTZ,
  project_id VARCHAR(255),
  clickup_task_id VARCHAR(255),
  clickup_list_id VARCHAR(255),
  tags TEXT[], -- Array of tags
  metadata JSONB DEFAULT '{}', -- Additional metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ClickUp sync logs for audit trail
CREATE TABLE IF NOT EXISTS clickup_sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_type VARCHAR(50) NOT NULL CHECK (sync_type IN ('single_task', 'bidirectional', 'bulk')),
  direction VARCHAR(50) NOT NULL CHECK (direction IN ('platform_to_clickup', 'clickup_to_platform', 'bidirectional')),
  clickup_list_id VARCHAR(255),
  project_id VARCHAR(255),
  total_processed INTEGER DEFAULT 0,
  successful_syncs INTEGER DEFAULT 0,
  failed_syncs INTEGER DEFAULT 0,
  created_tasks INTEGER DEFAULT 0,
  updated_tasks INTEGER DEFAULT 0,
  skipped_tasks INTEGER DEFAULT 0,
  duration_ms INTEGER,
  error_message TEXT,
  results JSONB DEFAULT '[]', -- Detailed sync results
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clickup_sync_mappings_platform_task ON clickup_sync_mappings(platform_task_id);
CREATE INDEX IF NOT EXISTS idx_clickup_sync_mappings_clickup_task ON clickup_sync_mappings(clickup_task_id);
CREATE INDEX IF NOT EXISTS idx_clickup_sync_mappings_list ON clickup_sync_mappings(clickup_list_id);
CREATE INDEX IF NOT EXISTS idx_clickup_sync_mappings_updated ON clickup_sync_mappings(updated_at);

CREATE INDEX IF NOT EXISTS idx_tasks_clickup_task ON tasks(clickup_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_clickup_list ON tasks(clickup_list_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_updated ON tasks(updated_at);

CREATE INDEX IF NOT EXISTS idx_clickup_sync_logs_type ON clickup_sync_logs(sync_type);
CREATE INDEX IF NOT EXISTS idx_clickup_sync_logs_list ON clickup_sync_logs(clickup_list_id);
CREATE INDEX IF NOT EXISTS idx_clickup_sync_logs_started ON clickup_sync_logs(started_at);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_clickup_sync_mappings_updated_at ON clickup_sync_mappings;
CREATE TRIGGER update_clickup_sync_mappings_updated_at
    BEFORE UPDATE ON clickup_sync_mappings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies if needed
ALTER TABLE clickup_sync_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE clickup_sync_logs ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (customize based on your auth system)
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON clickup_sync_mappings;
CREATE POLICY "Enable all operations for authenticated users" ON clickup_sync_mappings
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON tasks;
CREATE POLICY "Enable all operations for authenticated users" ON tasks
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON clickup_sync_logs;
CREATE POLICY "Enable all operations for authenticated users" ON clickup_sync_logs
  FOR ALL USING (true); 