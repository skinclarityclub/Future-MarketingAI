-- Fix voor generated column probleem
-- Verwijder de generated column en maak een normale kolom met trigger

-- Drop de problematische generated column
ALTER TABLE user_sessions DROP COLUMN IF EXISTS start_time;

-- Voeg een normale start_time kolom toe
ALTER TABLE user_sessions ADD COLUMN start_time TIMESTAMPTZ;

-- Update bestaande records
UPDATE user_sessions SET start_time = started_at WHERE start_time IS NULL;

-- Maak start_time NOT NULL
ALTER TABLE user_sessions ALTER COLUMN start_time SET NOT NULL;

-- Maak een trigger om start_time automatisch te synchroniseren met started_at
CREATE OR REPLACE FUNCTION sync_start_time_with_started_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Bij INSERT: zet start_time gelijk aan started_at als start_time niet expliciet is ingesteld
    IF TG_OP = 'INSERT' THEN
        IF NEW.start_time IS NULL THEN
            NEW.start_time = NEW.started_at;
        END IF;
        -- Als started_at niet is ingesteld maar start_time wel, dan andersom
        IF NEW.started_at IS NULL AND NEW.start_time IS NOT NULL THEN
            NEW.started_at = NEW.start_time;
        END IF;
        RETURN NEW;
    END IF;
    
    -- Bij UPDATE: synchroniseer indien nodig
    IF TG_OP = 'UPDATE' THEN
        -- Als started_at is aangepast, update start_time ook
        IF NEW.started_at != OLD.started_at THEN
            NEW.start_time = NEW.started_at;
        -- Als start_time is aangepast, update started_at ook  
        ELSIF NEW.start_time != OLD.start_time THEN
            NEW.started_at = NEW.start_time;
        END IF;
        RETURN NEW;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Maak de trigger
DROP TRIGGER IF EXISTS trigger_sync_start_time ON user_sessions;
CREATE TRIGGER trigger_sync_start_time
    BEFORE INSERT OR UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION sync_start_time_with_started_at();

-- Voeg index toe voor start_time
CREATE INDEX IF NOT EXISTS idx_user_sessions_start_time ON user_sessions(start_time);

-- Test query om te controleren
SELECT 
    'user_sessions' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    is_generated
FROM information_schema.columns 
WHERE table_name = 'user_sessions' 
AND column_name IN ('start_time', 'started_at')
ORDER BY column_name;

SELECT 'start_time column fix completed!' as status; 