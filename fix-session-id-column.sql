-- Fix voor session_id kolom in user_sessions tabel
-- Datum: $(date)

-- Controleer huidige structuur van user_sessions
DO $$
BEGIN
    -- Voeg session_id kolom toe als die niet bestaat
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' 
        AND column_name = 'session_id'
    ) THEN
        -- Voeg session_id kolom toe
        ALTER TABLE user_sessions 
        ADD COLUMN session_id VARCHAR(255) UNIQUE;
        
        -- Update bestaande records met een unieke session_id
        UPDATE user_sessions 
        SET session_id = COALESCE(id::text, gen_random_uuid()::text)
        WHERE session_id IS NULL;
        
        -- Maak session_id NOT NULL
        ALTER TABLE user_sessions 
        ALTER COLUMN session_id SET NOT NULL;
        
        RAISE NOTICE 'session_id kolom toegevoegd aan user_sessions tabel';
    ELSE
        RAISE NOTICE 'session_id kolom bestaat al in user_sessions tabel';
    END IF;
    
    -- Controleer of de UNIQUE constraint bestaat voor session_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'user_sessions' 
        AND kcu.column_name = 'session_id'
        AND tc.constraint_type = 'UNIQUE'
    ) THEN
        -- Voeg UNIQUE constraint toe voor session_id
        ALTER TABLE user_sessions 
        ADD CONSTRAINT user_sessions_session_id_unique UNIQUE (session_id);
        
        RAISE NOTICE 'UNIQUE constraint toegevoegd voor session_id';
    END IF;
END $$;

-- Voeg index toe voor betere performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);

-- Update foreign key references in user_behavior_events tabel
DO $$
BEGIN
    -- Controleer of user_behavior_events tabel bestaat
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_behavior_events') THEN
        -- Drop bestaande foreign key constraint als die er is
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'user_behavior_events' 
            AND constraint_name LIKE '%session%'
            AND constraint_type = 'FOREIGN KEY'
        ) THEN
            -- Vind en drop de constraint
            EXECUTE (
                SELECT 'ALTER TABLE user_behavior_events DROP CONSTRAINT ' || constraint_name
                FROM information_schema.table_constraints 
                WHERE table_name = 'user_behavior_events' 
                AND constraint_name LIKE '%session%'
                AND constraint_type = 'FOREIGN KEY'
                LIMIT 1
            );
        END IF;
        
        -- Voeg nieuwe foreign key constraint toe
        ALTER TABLE user_behavior_events 
        ADD CONSTRAINT fk_user_behavior_events_session_id 
        FOREIGN KEY (session_id) REFERENCES user_sessions(session_id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key constraint bijgewerkt voor user_behavior_events';
    END IF;
END $$;

-- Update de ensure_user_session functie om met session_id te werken
CREATE OR REPLACE FUNCTION ensure_user_session(p_session_id VARCHAR(255), p_user_id VARCHAR(255) DEFAULT NULL)
RETURNS VARCHAR(255) AS $$
BEGIN
    -- Insert session if it doesn't exist
    INSERT INTO user_sessions (session_id, user_id, start_time, created_at)
    VALUES (p_session_id, p_user_id, NOW(), NOW())
    ON CONFLICT (session_id) 
    DO UPDATE SET 
        updated_at = NOW(),
        user_id = COALESCE(user_sessions.user_id, p_user_id);
    
    RETURN p_session_id;
END;
$$ LANGUAGE plpgsql;

-- Controleer het resultaat
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_sessions' 
ORDER BY ordinal_position;

-- Test of de fix werkt
SELECT 'Fix uitgevoerd succesvol' as status; 