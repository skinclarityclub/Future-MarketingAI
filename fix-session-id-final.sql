-- FINALE fix voor session_id kolom probleem
-- Maak session_id kolom nullable en voeg proper default toe

DO $$
BEGIN
    RAISE NOTICE 'Final fix for session_id column...';
    
    -- Eerst maken we session_id kolom nullable om bestaande INSERTs te laten werken
    ALTER TABLE user_sessions 
    ALTER COLUMN session_id DROP NOT NULL;
    
    -- Voeg een default waarde toe die automatisch een UUID genereert als session_id NULL is
    ALTER TABLE user_sessions 
    ALTER COLUMN session_id SET DEFAULT gen_random_uuid()::text;
    
    -- Update bestaande NULL waarden
    UPDATE user_sessions 
    SET session_id = gen_random_uuid()::text 
    WHERE session_id IS NULL;
    
    RAISE NOTICE 'session_id column is now nullable with default UUID generation';
    
    -- Alternatief: maak een trigger die automatisch session_id vult als het NULL is
    CREATE OR REPLACE FUNCTION ensure_session_id()
    RETURNS TRIGGER AS $$
    BEGIN
        -- Als session_id NULL is, genereer een nieuwe UUID
        IF NEW.session_id IS NULL THEN
            NEW.session_id = gen_random_uuid()::text;
        END IF;
        
        -- Als id NULL is, genereer een nieuwe UUID
        IF NEW.id IS NULL THEN
            NEW.id = gen_random_uuid();
        END IF;
        
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    -- Drop bestaande trigger als die er is
    DROP TRIGGER IF EXISTS ensure_session_id_trigger ON user_sessions;
    
    -- Maak nieuwe trigger
    CREATE TRIGGER ensure_session_id_trigger
        BEFORE INSERT ON user_sessions
        FOR EACH ROW
        EXECUTE FUNCTION ensure_session_id();
        
    RAISE NOTICE 'Auto-generation trigger for session_id created';
    
END $$;

-- Update de ensure_user_session functie ook
CREATE OR REPLACE FUNCTION ensure_user_session(p_session_id VARCHAR(255), p_user_id VARCHAR(255) DEFAULT NULL)
RETURNS VARCHAR(255) AS $$
DECLARE
    final_session_id VARCHAR(255);
BEGIN
    -- Als geen session_id is meegegeven, genereer een nieuwe
    final_session_id := COALESCE(p_session_id, gen_random_uuid()::text);
    
    INSERT INTO user_sessions (
        id, 
        session_id, 
        user_id, 
        started_at, 
        start_time,
        last_activity, 
        expires_at, 
        is_active,
        created_at,
        updated_at
    )
    VALUES (
        gen_random_uuid(),
        final_session_id, 
        p_user_id, 
        NOW(), 
        NOW(),
        NOW(), 
        NOW() + INTERVAL '24 hours', 
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (session_id) 
    DO UPDATE SET 
        last_activity = NOW(),
        user_id = COALESCE(user_sessions.user_id, p_user_id),
        expires_at = NOW() + INTERVAL '24 hours',
        is_active = true,
        updated_at = NOW();
    
    RETURN final_session_id;
END;
$$ LANGUAGE plpgsql;

-- Test om te zien of alles werkt
INSERT INTO user_sessions (user_id, started_at) 
VALUES ('test-user', NOW())
ON CONFLICT DO NOTHING;

-- Clean up test data
DELETE FROM user_sessions WHERE user_id = 'test-user';

-- Show final column configuration
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_sessions' 
AND column_name IN ('id', 'session_id')
ORDER BY column_name;

SELECT 'session_id final fix completed - should now handle NULL values automatically!' as status; 