-- Fix Missing Database Tables and Columns Migration
-- This migration addresses the errors seen in the terminal output

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255),
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user',
    preferences JSONB DEFAULT '{}',
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    user_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_behavior_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_behavior_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) REFERENCES user_sessions(session_id) ON DELETE CASCADE,
    user_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    page_url TEXT,
    element_id VARCHAR(255),
    event_data JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_active ON user_profiles(last_active);

CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_behavior_events_session ON user_behavior_events(session_id);
CREATE INDEX IF NOT EXISTS idx_behavior_events_user ON user_behavior_events(user_id);
CREATE INDEX IF NOT EXISTS idx_behavior_events_type ON user_behavior_events(event_type);
CREATE INDEX IF NOT EXISTS idx_behavior_events_timestamp ON user_behavior_events(timestamp);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (user_id = current_user OR auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (user_id = current_user);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (user_id = current_user);

-- RLS Policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (user_id = current_user OR auth.role() = 'authenticated');

CREATE POLICY "Sessions can be inserted" ON user_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Sessions can be updated" ON user_sessions
    FOR UPDATE USING (true);

-- RLS Policies for user_behavior_events
CREATE POLICY "Users can view their own events" ON user_behavior_events
    FOR SELECT USING (user_id = current_user OR auth.role() = 'authenticated');

CREATE POLICY "Events can be inserted" ON user_behavior_events
    FOR INSERT WITH CHECK (true);

-- Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profiles_updated_at();

-- Create function to automatically create user session when needed
CREATE OR REPLACE FUNCTION ensure_user_session(p_session_id VARCHAR(255), p_user_id VARCHAR(255) DEFAULT NULL)
RETURNS VARCHAR(255) AS $$
BEGIN
    -- Insert session if it doesn't exist
    INSERT INTO user_sessions (session_id, user_id, started_at, last_activity)
    VALUES (p_session_id, p_user_id, NOW(), NOW())
    ON CONFLICT (session_id) 
    DO UPDATE SET 
        last_activity = NOW(),
        user_id = COALESCE(user_sessions.user_id, p_user_id);
    
    RETURN p_session_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add missing columns to existing user_profiles table if they don't exist
DO $$
BEGIN
    -- Add email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='email') THEN
        ALTER TABLE user_profiles ADD COLUMN email VARCHAR(255);
    END IF;
    
    -- Add full_name column if it doesn't exist  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='full_name') THEN
        ALTER TABLE user_profiles ADD COLUMN full_name VARCHAR(255);
    END IF;
    
    -- Add role column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='role') THEN
        ALTER TABLE user_profiles ADD COLUMN role VARCHAR(50) DEFAULT 'user';
    END IF;
    
    -- Add last_active column if it doesn't exist (this was the original error)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='last_active') THEN
        ALTER TABLE user_profiles ADD COLUMN last_active TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='avatar_url') THEN
        ALTER TABLE user_profiles ADD COLUMN avatar_url TEXT;
    END IF;
    
    -- Add preferences column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_profiles' AND column_name='preferences') THEN
        ALTER TABLE user_profiles ADD COLUMN preferences JSONB DEFAULT '{}';
    END IF;
END $$;

-- Now safely insert the demo user profile
INSERT INTO user_profiles (user_id, email, full_name, role) 
VALUES ('demo-user', 'demo@example.com', 'Demo User', 'admin')
ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    last_active = NOW(); 