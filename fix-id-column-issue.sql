-- Fix voor id kolom NOT NULL constraint violation
-- Voeg default waarde toe aan id kolom

-- Controleer de huidige structuur van de id kolom
DO $$
BEGIN
    RAISE NOTICE 'Fixing user_sessions id column...';
    
    -- Voeg default waarde toe aan id kolom als die er niet is
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' 
        AND column_name = 'id' 
        AND column_default IS NULL
    ) THEN
        -- Voeg default UUID generator toe
        ALTER TABLE user_sessions 
        ALTER COLUMN id SET DEFAULT gen_random_uuid();
        
        RAISE NOTICE 'Added default UUID generator to id column';
    END IF;
    
    -- Update bestaande records die NULL id hebben
    UPDATE user_sessions 
    SET id = gen_random_uuid() 
    WHERE id IS NULL;
    
    -- Zorg ervoor dat id kolom NOT NULL is
    ALTER TABLE user_sessions 
    ALTER COLUMN id SET NOT NULL;
    
    RAISE NOTICE 'id column fix completed';
    
END $$;

-- Controleer ook of er een primary key constraint is
DO $$
BEGIN
    -- Voeg primary key toe als die er niet is
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'user_sessions' 
        AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE user_sessions ADD PRIMARY KEY (id);
        RAISE NOTICE 'Added primary key constraint to id column';
    END IF;
END $$;

-- Update de ensure_user_session functie om id correct te handelen
CREATE OR REPLACE FUNCTION ensure_user_session(p_session_id VARCHAR(255), p_user_id VARCHAR(255) DEFAULT NULL)
RETURNS VARCHAR(255) AS $$
BEGIN
    INSERT INTO user_sessions (
        id, 
        session_id, 
        user_id, 
        started_at, 
        start_time,
        last_activity, 
        expires_at, 
        is_active
    )
    VALUES (
        gen_random_uuid(),  -- Expliciet id genereren
        p_session_id, 
        p_user_id, 
        NOW(), 
        NOW(),
        NOW(), 
        NOW() + INTERVAL '24 hours', 
        true
    )
    ON CONFLICT (session_id) 
    DO UPDATE SET 
        last_activity = NOW(),
        user_id = COALESCE(user_sessions.user_id, p_user_id),
        expires_at = NOW() + INTERVAL '24 hours',
        is_active = true;
    
    RETURN p_session_id;
END;
$$ LANGUAGE plpgsql;

-- Test de fix
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_sessions' 
AND column_name = 'id';

SELECT 'user_sessions id column fix completed!' as status; 