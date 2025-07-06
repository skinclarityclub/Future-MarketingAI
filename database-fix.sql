-- Fix database issues for demo users and session management

-- 1. Fix user_profiles table to allow demo users
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- Create more permissive policies for demo users
CREATE POLICY "Allow demo and authenticated users select" ON user_profiles
    FOR SELECT USING (
        user_id = 'demo-user' OR 
        auth.uid()::text = user_id OR
        auth.role() = 'authenticated' OR
        auth.role() = 'anon'
    );

CREATE POLICY "Allow demo and authenticated users insert" ON user_profiles
    FOR INSERT WITH CHECK (
        user_id = 'demo-user' OR 
        auth.uid()::text = user_id OR
        auth.role() = 'authenticated' OR
        auth.role() = 'anon'
    );

CREATE POLICY "Allow demo and authenticated users update" ON user_profiles
    FOR UPDATE USING (
        user_id = 'demo-user' OR 
        auth.uid()::text = user_id OR
        auth.role() = 'authenticated' OR
        auth.role() = 'anon'
    );

-- 2. Ensure demo user profile exists
INSERT INTO user_profiles (user_id, expertise_level, communication_style, business_focus, preferred_analysis_depth, timezone, language)
VALUES ('demo-user', 'intermediate', 'detailed', ARRAY['financial_analysis', 'marketing_analytics'], 'comprehensive', 'Europe/Amsterdam', 'en')
ON CONFLICT (user_id) DO UPDATE SET
    expertise_level = EXCLUDED.expertise_level,
    communication_style = EXCLUDED.communication_style,
    business_focus = EXCLUDED.business_focus,
    preferred_analysis_depth = EXCLUDED.preferred_analysis_depth,
    timezone = EXCLUDED.timezone,
    language = EXCLUDED.language,
    updated_at = NOW();

-- 3. Fix user_sessions foreign key issue by creating function to auto-create sessions
CREATE OR REPLACE FUNCTION auto_create_session()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert session if it doesn't exist
    INSERT INTO user_sessions (session_id, user_id, start_time, last_activity)
    VALUES (NEW.session_id, NEW.user_id, NOW(), NOW())
    ON CONFLICT (session_id) DO UPDATE SET
        last_activity = NOW(),
        user_id = COALESCE(user_sessions.user_id, NEW.user_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create sessions when behavior events are inserted
DROP TRIGGER IF EXISTS auto_create_session_trigger ON user_behavior_events;
CREATE TRIGGER auto_create_session_trigger
    BEFORE INSERT ON user_behavior_events
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_session();

-- 4. Grant permissions for anonymous users
GRANT ALL ON user_profiles TO anon;
GRANT ALL ON user_sessions TO anon;
GRANT ALL ON user_behavior_events TO anon; 