-- Veilige fix voor user_sessions tabel schema
-- Dropt eerst afhankelijke views voordat kolommen worden gewijzigd

-- Drop afhankelijke views tijdelijk
DROP VIEW IF EXISTS session_analytics CASCADE;
DROP VIEW IF EXISTS user_behavior_analytics CASCADE;

-- Controleer en voeg alle benodigde kolommen toe aan user_sessions
DO $$
BEGIN
    RAISE NOTICE 'Starting user_sessions table schema fix...';
    
    -- Voeg session_id kolom toe als die niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'session_id'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN session_id VARCHAR(255);
        UPDATE user_sessions SET session_id = COALESCE(id::text, gen_random_uuid()::text) WHERE session_id IS NULL;
        ALTER TABLE user_sessions ALTER COLUMN session_id SET NOT NULL;
        ALTER TABLE user_sessions ADD CONSTRAINT user_sessions_session_id_unique UNIQUE (session_id);
        RAISE NOTICE 'Added session_id column';
    END IF;
    
    -- Voeg last_activity kolom toe als die niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'last_activity'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN last_activity TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added last_activity column';
    END IF;
    
    -- Voeg started_at kolom toe als die niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'started_at'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN started_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added started_at column';
    END IF;
    
    -- Voeg expires_at kolom toe als die niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'expires_at'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours');
        RAISE NOTICE 'Added expires_at column';
    END IF;
    
    -- Voeg is_active kolom toe als die niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active column';
    END IF;
    
    -- Voeg ip_address kolom toe als die niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'ip_address'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN ip_address INET;
        RAISE NOTICE 'Added ip_address column';
    END IF;
    
    -- Voeg user_agent kolom toe als die niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'user_agent'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN user_agent TEXT;
        RAISE NOTICE 'Added user_agent column';
    END IF;
    
    -- Nu veilig de start_time naar started_at migratie doen
    -- Als we zowel start_time als started_at hebben, merge ze
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'start_time'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'started_at'
    ) THEN
        -- Update started_at met waarden van start_time waar started_at NULL is
        UPDATE user_sessions 
        SET started_at = COALESCE(started_at, start_time);
        
        -- Nu kunnen we start_time veilig droppen
        ALTER TABLE user_sessions DROP COLUMN start_time CASCADE;
        RAISE NOTICE 'Merged start_time into started_at and dropped start_time';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'start_time'
    ) THEN
        -- Rename start_time naar started_at als started_at niet bestaat
        ALTER TABLE user_sessions RENAME COLUMN start_time TO started_at;
        RAISE NOTICE 'Renamed start_time to started_at';
    END IF;
    
END $$;

-- Voeg alle benodigde indexes toe
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON user_sessions(started_at);

-- Recreate the session_analytics view met de nieuwe kolom naam
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

-- Update/Create de ensure_user_session functie
CREATE OR REPLACE FUNCTION ensure_user_session(p_session_id VARCHAR(255), p_user_id VARCHAR(255) DEFAULT NULL)
RETURNS VARCHAR(255) AS $$
BEGIN
    -- Insert session if it doesn't exist
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

-- Fix foreign key constraints in user_behavior_events
DO $$
BEGIN
    -- Drop bestaande foreign key constraints die mogelijk incorrect zijn
    EXECUTE (
        SELECT 'ALTER TABLE ' || tc.table_name || ' DROP CONSTRAINT IF EXISTS ' || tc.constraint_name || ';'
        FROM information_schema.table_constraints tc
        WHERE tc.table_name = 'user_behavior_events' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND tc.constraint_name LIKE '%session%'
        LIMIT 1
    );
    
    -- Voeg correcte foreign key constraint toe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_behavior_events') THEN
        ALTER TABLE user_behavior_events 
        ADD CONSTRAINT fk_user_behavior_events_session_id 
        FOREIGN KEY (session_id) REFERENCES user_sessions(session_id) ON DELETE CASCADE;
        RAISE NOTICE 'Added correct foreign key constraint for user_behavior_events';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Foreign key constraint update failed or already exists';
END $$;

-- Enable RLS als het nog niet aan staat
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Sessions can be inserted" ON user_sessions;
DROP POLICY IF EXISTS "Sessions can be updated" ON user_sessions;

CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (user_id = current_user OR auth.role() = 'authenticated');

CREATE POLICY "Sessions can be inserted" ON user_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Sessions can be updated" ON user_sessions
    FOR UPDATE USING (true);

-- Toon het eindresultaat
SELECT 
    'user_sessions' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_sessions' 
ORDER BY ordinal_position;

-- Test of alles werkt
SELECT 'user_sessions schema volledig en veilig gefixed!' as status; 