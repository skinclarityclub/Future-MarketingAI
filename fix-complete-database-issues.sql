-- Complete database fix voor alle issues
-- Fixes user_sessions kolommen + session_memories RLS policies

-- ==== 1. FIX USER_SESSIONS SCHEMA ====

-- Drop afhankelijke views tijdelijk
DROP VIEW IF EXISTS session_analytics CASCADE;
DROP VIEW IF EXISTS user_behavior_analytics CASCADE;

-- Fix user_sessions tabel
DO $$
BEGIN
    RAISE NOTICE 'Fixing user_sessions table schema...';
    
    -- Voeg ontbrekende kolommen toe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'session_id') THEN
        ALTER TABLE user_sessions ADD COLUMN session_id VARCHAR(255);
        UPDATE user_sessions SET session_id = COALESCE(id::text, gen_random_uuid()::text) WHERE session_id IS NULL;
        ALTER TABLE user_sessions ALTER COLUMN session_id SET NOT NULL;
        ALTER TABLE user_sessions ADD CONSTRAINT user_sessions_session_id_unique UNIQUE (session_id);
        RAISE NOTICE 'Added session_id column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'last_activity') THEN
        ALTER TABLE user_sessions ADD COLUMN last_activity TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added last_activity column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'started_at') THEN
        ALTER TABLE user_sessions ADD COLUMN started_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added started_at column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'expires_at') THEN
        ALTER TABLE user_sessions ADD COLUMN expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours');
        RAISE NOTICE 'Added expires_at column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'is_active') THEN
        ALTER TABLE user_sessions ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'ip_address') THEN
        ALTER TABLE user_sessions ADD COLUMN ip_address INET;
        RAISE NOTICE 'Added ip_address column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'user_agent') THEN
        ALTER TABLE user_sessions ADD COLUMN user_agent TEXT;
        RAISE NOTICE 'Added user_agent column';
    END IF;
    
    -- Fix start_time -> started_at migratie
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'start_time') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'started_at') THEN
            -- Beide bestaan: merge en drop start_time
            UPDATE user_sessions SET started_at = COALESCE(started_at, start_time);
            ALTER TABLE user_sessions DROP COLUMN start_time CASCADE;
            RAISE NOTICE 'Merged start_time into started_at and dropped start_time';
        ELSE
            -- Alleen start_time bestaat: rename
            ALTER TABLE user_sessions RENAME COLUMN start_time TO started_at;
            RAISE NOTICE 'Renamed start_time to started_at';
        END IF;
    END IF;
    
    -- Ook een start_time alias maken voor backwards compatibility
    -- Dit is een computed column die altijd started_at mapped
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'start_time') THEN
        ALTER TABLE user_sessions ADD COLUMN start_time TIMESTAMPTZ GENERATED ALWAYS AS (started_at) STORED;
        RAISE NOTICE 'Added start_time as alias for started_at';
    END IF;
    
END $$;

-- Voeg indexes toe
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON user_sessions(started_at);

-- Recreate session_analytics view
CREATE OR REPLACE VIEW session_analytics AS
SELECT 
    DATE(us.started_at) as date,
    COUNT(*) as total_sessions,
    COUNT(DISTINCT us.user_id) as unique_users,
    AVG(us.duration) as avg_session_duration,
    AVG(us.page_views) as avg_page_views,
    AVG(us.clicks) as avg_clicks,
    AVG(us.bounce_rate) as avg_bounce_rate,
    COUNT(CASE WHEN us.is_returning_visitor THEN 1 END) as returning_visitors,
    COUNT(CASE WHEN NOT us.is_returning_visitor THEN 1 END) as new_visitors
FROM user_sessions us
WHERE us.started_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(us.started_at)
ORDER BY date DESC;

-- ==== 2. FIX SESSION_MEMORIES TABLE EN RLS ====

-- Maak session_memories tabel als die niet bestaat
CREATE TABLE IF NOT EXISTS session_memories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    context_summary TEXT,
    active_topics JSONB DEFAULT '[]',
    user_intent TEXT,
    satisfaction_score DECIMAL(3,2),
    emotional_state JSONB DEFAULT '{}',
    interaction_patterns JSONB DEFAULT '{}',
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    start_time TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE session_memories ENABLE ROW LEVEL SECURITY;

-- Drop bestaande policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON session_memories;
DROP POLICY IF EXISTS "Users can update their own sessions" ON session_memories;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON session_memories;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON session_memories;

-- Nieuwe permissive RLS policies voor session_memories
CREATE POLICY "Allow all operations on session_memories" ON session_memories
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Alternative: Specifieke policies per operatie
-- CREATE POLICY "Users can view session memories" ON session_memories
--     FOR SELECT USING (user_id = current_user OR auth.role() = 'authenticated');

-- CREATE POLICY "Users can insert session memories" ON session_memories
--     FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Users can update session memories" ON session_memories
--     FOR UPDATE USING (true);

-- CREATE POLICY "Users can delete session memories" ON session_memories
--     FOR DELETE USING (true);

-- Indexes voor session_memories
CREATE INDEX IF NOT EXISTS idx_session_memories_user_id ON session_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_session_memories_session_id ON session_memories(session_id);
CREATE INDEX IF NOT EXISTS idx_session_memories_last_activity ON session_memories(last_activity);

-- ==== 3. UPDATE FUNCTIONS ====

-- Update ensure_user_session functie
CREATE OR REPLACE FUNCTION ensure_user_session(p_session_id VARCHAR(255), p_user_id VARCHAR(255) DEFAULT NULL)
RETURNS VARCHAR(255) AS $$
BEGIN
    INSERT INTO user_sessions (session_id, user_id, started_at, last_activity, expires_at, is_active)
    VALUES (p_session_id, p_user_id, NOW(), NOW(), NOW() + INTERVAL '24 hours', true)
    ON CONFLICT (session_id) 
    DO UPDATE SET 
        last_activity = NOW(),
        user_id = COALESCE(user_sessions.user_id, p_user_id),
        expires_at = NOW() + INTERVAL '24 hours',
        is_active = true;
    
    RETURN p_session_id;
END;
$$ LANGUAGE plpgsql;

-- Update user_sessions RLS policies
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Sessions can be inserted" ON user_sessions;
DROP POLICY IF EXISTS "Sessions can be updated" ON user_sessions;

CREATE POLICY "Allow all operations on user_sessions" ON user_sessions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Grant permissies
GRANT ALL ON user_sessions TO anon;
GRANT ALL ON user_sessions TO authenticated;
GRANT ALL ON session_memories TO anon;
GRANT ALL ON session_memories TO authenticated;

-- Test queries
SELECT 'user_sessions' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_sessions' 
ORDER BY ordinal_position;

SELECT 'session_memories' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'session_memories' 
ORDER BY ordinal_position;

SELECT 'Database fix completed successfully!' as status; 