-- Fix voor ontbrekende exit_page kolom in user_sessions
-- Voeg alle nog ontbrekende kolommen toe

DO $$
BEGIN
    RAISE NOTICE 'Adding missing columns to user_sessions...';
    
    -- Voeg exit_page kolom toe als die niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'exit_page'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN exit_page TEXT;
        RAISE NOTICE 'Added exit_page column';
    END IF;
    
    -- Voeg entry_page kolom toe als die niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'entry_page'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN entry_page TEXT;
        RAISE NOTICE 'Added entry_page column';
    END IF;
    
    -- Voeg current_page kolom toe als die niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'current_page'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN current_page TEXT;
        RAISE NOTICE 'Added current_page column';
    END IF;
    
    -- Voeg device_info kolom toe als die niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'device_info'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN device_info JSONB DEFAULT '{}';
        RAISE NOTICE 'Added device_info column';
    END IF;
    
    -- Voeg is_returning_visitor kolom toe als die niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'is_returning_visitor'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN is_returning_visitor BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_returning_visitor column';
    END IF;
    
    -- Voeg duration kolom toe als die niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'duration'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN duration INTEGER DEFAULT 0;
        RAISE NOTICE 'Added duration column';
    END IF;
    
    -- Voeg page_views kolom toe als die niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'page_views'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN page_views INTEGER DEFAULT 0;
        RAISE NOTICE 'Added page_views column';
    END IF;
    
    -- Voeg clicks kolom toe als die niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'clicks'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN clicks INTEGER DEFAULT 0;
        RAISE NOTICE 'Added clicks column';
    END IF;
    
    -- Voeg scrolls kolom toe als die niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'scrolls'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN scrolls INTEGER DEFAULT 0;
        RAISE NOTICE 'Added scrolls column';
    END IF;
    
    -- Voeg form_interactions kolom toe als die niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'form_interactions'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN form_interactions INTEGER DEFAULT 0;
        RAISE NOTICE 'Added form_interactions column';
    END IF;
    
    -- Voeg bounce_rate kolom toe als die niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'bounce_rate'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN bounce_rate DECIMAL(5,4);
        RAISE NOTICE 'Added bounce_rate column';
    END IF;
    
    -- Voeg end_time kolom toe als die niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'end_time'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN end_time TIMESTAMPTZ;
        RAISE NOTICE 'Added end_time column';
    END IF;
    
    -- Voeg referrer kolom toe als die niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'referrer'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN referrer TEXT;
        RAISE NOTICE 'Added referrer column';
    END IF;
    
    -- Voeg utm kolommen toe als die niet bestaan
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'utm_source'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN utm_source TEXT;
        RAISE NOTICE 'Added utm_source column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'utm_medium'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN utm_medium TEXT;
        RAISE NOTICE 'Added utm_medium column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'utm_campaign'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN utm_campaign TEXT;
        RAISE NOTICE 'Added utm_campaign column';
    END IF;
    
    -- Voeg created_at kolom toe als die niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added created_at column';
    END IF;
    
    -- Voeg updated_at kolom toe als die niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE user_sessions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column';
    END IF;
    
END $$;

-- Voeg indexes toe voor de nieuwe kolommen
CREATE INDEX IF NOT EXISTS idx_user_sessions_exit_page ON user_sessions(exit_page);
CREATE INDEX IF NOT EXISTS idx_user_sessions_entry_page ON user_sessions(entry_page);
CREATE INDEX IF NOT EXISTS idx_user_sessions_current_page ON user_sessions(current_page);
CREATE INDEX IF NOT EXISTS idx_user_sessions_end_time ON user_sessions(end_time);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON user_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_updated_at ON user_sessions(updated_at);

-- Update trigger voor updated_at
CREATE OR REPLACE FUNCTION update_user_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_sessions_updated_at();

-- Test query om alle kolommen te zien
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_sessions' 
ORDER BY ordinal_position;

SELECT 'All missing user_sessions columns added successfully!' as status; 