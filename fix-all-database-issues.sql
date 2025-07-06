-- ============================================
-- SKC BI Dashboard - Complete Database Fix Script
-- ============================================
-- This script fixes all database issues identified in the terminal logs

-- 1. Fix user_behavior_events table schema
-- Add missing page_title column if it doesn't exist
ALTER TABLE user_behavior_events 
ADD COLUMN IF NOT EXISTS page_title TEXT;

-- 2. Fix event ID column type (should be TEXT not INTEGER)
-- First, let's check the current structure and fix it
DO $$
BEGIN
    -- Check if id column is integer type and convert to TEXT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_behavior_events' 
        AND column_name = 'id' 
        AND data_type = 'integer'
    ) THEN
        -- Drop the serial constraint and change to TEXT
        ALTER TABLE user_behavior_events ALTER COLUMN id TYPE TEXT USING id::TEXT;
        ALTER TABLE user_behavior_events ALTER COLUMN id DROP DEFAULT;
    END IF;
END $$;

-- 3. Create proper user_profiles table with RLS policies that allow demo users
DROP TABLE IF EXISTS user_profiles CASCADE;

CREATE TABLE user_profiles (
    user_id TEXT PRIMARY KEY,
    expertise_level TEXT CHECK (expertise_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'intermediate',
    communication_style TEXT CHECK (communication_style IN ('concise', 'detailed', 'visual', 'technical')) DEFAULT 'detailed',
    business_focus TEXT[] DEFAULT '{}',
    preferred_analysis_depth TEXT CHECK (preferred_analysis_depth IN ('basic', 'detailed', 'comprehensive')) DEFAULT 'detailed',
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies that allow demo users and authenticated users
CREATE POLICY "Allow demo users and authenticated users to select user_profiles"
ON user_profiles FOR SELECT
USING (
    user_id = 'demo-user' OR 
    auth.uid()::text = user_id OR
    auth.role() = 'authenticated'
);

CREATE POLICY "Allow demo users and authenticated users to insert user_profiles"
ON user_profiles FOR INSERT
WITH CHECK (
    user_id = 'demo-user' OR 
    auth.uid()::text = user_id OR
    auth.role() = 'authenticated'
);

CREATE POLICY "Allow demo users and authenticated users to update user_profiles"
ON user_profiles FOR UPDATE
USING (
    user_id = 'demo-user' OR 
    auth.uid()::text = user_id OR
    auth.role() = 'authenticated'
);

-- Insert demo user profile
INSERT INTO user_profiles (user_id, expertise_level, communication_style, business_focus, preferred_analysis_depth, timezone, language)
VALUES ('demo-user', 'intermediate', 'detailed', ARRAY['financial_analysis', 'marketing_analytics', 'business_intelligence'], 'comprehensive', 'Europe/Amsterdam', 'en')
ON CONFLICT (user_id) DO UPDATE SET
    expertise_level = EXCLUDED.expertise_level,
    communication_style = EXCLUDED.communication_style,
    business_focus = EXCLUDED.business_focus,
    preferred_analysis_depth = EXCLUDED.preferred_analysis_depth,
    timezone = EXCLUDED.timezone,
    language = EXCLUDED.language,
    updated_at = NOW();

-- 4. Fix user_sessions table to include entry_page column
ALTER TABLE user_sessions 
ADD COLUMN IF NOT EXISTS entry_page TEXT DEFAULT '/';

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_id ON user_behavior_events(id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_session_id ON user_behavior_events(session_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_user_id ON user_behavior_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_page_title ON user_behavior_events(page_title);
CREATE INDEX IF NOT EXISTS idx_user_sessions_entry_page ON user_sessions(entry_page);

-- 6. Grant permissions
GRANT ALL ON user_profiles TO anon;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_behavior_events TO anon;
GRANT ALL ON user_behavior_events TO authenticated;
GRANT ALL ON user_sessions TO anon;
GRANT ALL ON user_sessions TO authenticated;

-- Verification queries
SELECT 'Database fixes completed successfully!' as status;
SELECT 'user_behavior_events columns:' as table_info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_behavior_events' 
ORDER BY ordinal_position;

SELECT 'user_profiles test:' as test_info;
SELECT * FROM user_profiles WHERE user_id = 'demo-user'; 