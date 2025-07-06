-- Eenvoudige fix voor session_id - stap voor stap
-- Voer elke stap apart uit als er errors zijn

-- Stap 1: Maak session_id nullable
ALTER TABLE user_sessions ALTER COLUMN session_id DROP NOT NULL;

-- Stap 2: Voeg default waarde toe
ALTER TABLE user_sessions ALTER COLUMN session_id SET DEFAULT gen_random_uuid()::text;

-- Stap 3: Update bestaande NULL waarden
UPDATE user_sessions SET session_id = gen_random_uuid()::text WHERE session_id IS NULL;

-- Stap 4: Maak trigger functie
CREATE OR REPLACE FUNCTION ensure_session_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.session_id IS NULL THEN
        NEW.session_id = gen_random_uuid()::text;
    END IF;
    
    IF NEW.id IS NULL THEN
        NEW.id = gen_random_uuid();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Stap 5: Drop bestaande trigger
DROP TRIGGER IF EXISTS ensure_session_id_trigger ON user_sessions;

-- Stap 6: Maak nieuwe trigger
CREATE TRIGGER ensure_session_id_trigger
    BEFORE INSERT ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION ensure_session_id();

-- Stap 7: Test
SELECT 'session_id fix completed!' as status; 