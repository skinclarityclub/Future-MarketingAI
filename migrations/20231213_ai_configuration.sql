-- AI Configuration Tables Migration
-- This migration creates the necessary tables for storing AI personality profiles and system messages

-- Create AI Personality Profiles table
CREATE TABLE IF NOT EXISTS ai_personality_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  tone TEXT NOT NULL CHECK (tone IN ('friendly', 'professional', 'casual', 'authoritative', 'empathetic')),
  style TEXT NOT NULL CHECK (style IN ('concise', 'detailed', 'conversational', 'technical', 'creative')),
  formality TEXT NOT NULL CHECK (formality IN ('formal', 'informal', 'semi-formal')),
  verbosity TEXT NOT NULL CHECK (verbosity IN ('brief', 'moderate', 'verbose')),
  emotional_tone TEXT NOT NULL CHECK (emotional_tone IN ('neutral', 'enthusiastic', 'calm', 'energetic')),
  technical_level TEXT NOT NULL CHECK (technical_level IN ('beginner', 'intermediate', 'expert')),
  custom_prompt_additions TEXT,
  dashboard_context JSONB DEFAULT '{}',
  created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT FALSE
);

-- Create AI System Messages table
CREATE TABLE IF NOT EXISTS ai_system_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  context TEXT NOT NULL CHECK (context IN ('general', 'dashboard', 'chat', 'navigation', 'error', 'welcome')),
  content TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  triggers JSONB DEFAULT '{}',
  localization JSONB DEFAULT '{}',
  created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  priority INTEGER DEFAULT 0
);

-- Create AI Configuration table for global settings
CREATE TABLE IF NOT EXISTS ai_configuration (
  id TEXT PRIMARY KEY DEFAULT 'main',
  active_profile_id TEXT,
  settings JSONB DEFAULT '{
    "enablePersonalityAdaptation": true,
    "enableContextAwareness": true,
    "enableMLInsights": true,
    "defaultLocale": "nl",
    "fallbackProfile": "profile_1"
  }',
  analytics JSONB DEFAULT '{}',
  created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_personality_profiles_active ON ai_personality_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_personality_profiles_created ON ai_personality_profiles(created);
CREATE INDEX IF NOT EXISTS idx_ai_system_messages_context ON ai_system_messages(context);
CREATE INDEX IF NOT EXISTS idx_ai_system_messages_enabled ON ai_system_messages(enabled);
CREATE INDEX IF NOT EXISTS idx_ai_system_messages_priority ON ai_system_messages(priority);

-- Add foreign key constraint
ALTER TABLE ai_configuration 
ADD CONSTRAINT fk_active_profile 
FOREIGN KEY (active_profile_id) 
REFERENCES ai_personality_profiles(id) 
ON DELETE SET NULL;

-- Insert default AI configuration record
INSERT INTO ai_configuration (id, active_profile_id, settings)
VALUES ('main', NULL, '{
  "enablePersonalityAdaptation": true,
  "enableContextAwareness": true,
  "enableMLInsights": true,
  "defaultLocale": "nl",
  "fallbackProfile": "profile_1"
}')
ON CONFLICT (id) DO NOTHING;

-- Add RLS (Row Level Security) policies
ALTER TABLE ai_personality_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_system_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_configuration ENABLE ROW LEVEL SECURITY;

-- Policies for ai_personality_profiles
CREATE POLICY "Enable read access for all users" ON ai_personality_profiles
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON ai_personality_profiles
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON ai_personality_profiles
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON ai_personality_profiles
FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for ai_system_messages
CREATE POLICY "Enable read access for all users" ON ai_system_messages
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON ai_system_messages
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON ai_system_messages
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON ai_system_messages
FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for ai_configuration
CREATE POLICY "Enable read access for all users" ON ai_configuration
FOR SELECT USING (true);

CREATE POLICY "Enable update for authenticated users" ON ai_configuration
FOR UPDATE USING (auth.role() = 'authenticated');

-- Create trigger function for updating 'updated' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_ai_personality_profiles_updated_at 
    BEFORE UPDATE ON ai_personality_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_system_messages_updated_at 
    BEFORE UPDATE ON ai_system_messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_configuration_updated_at 
    BEFORE UPDATE ON ai_configuration 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE ai_personality_profiles IS 'Stores AI personality profiles that define how the assistant communicates';
COMMENT ON TABLE ai_system_messages IS 'Stores system messages used by the AI assistant in different contexts';
COMMENT ON TABLE ai_configuration IS 'Stores global AI configuration settings and active profile';

COMMENT ON COLUMN ai_personality_profiles.tone IS 'Communication tone: friendly, professional, casual, authoritative, empathetic';
COMMENT ON COLUMN ai_personality_profiles.style IS 'Communication style: concise, detailed, conversational, technical, creative';
COMMENT ON COLUMN ai_personality_profiles.formality IS 'Level of formality: formal, informal, semi-formal';
COMMENT ON COLUMN ai_personality_profiles.dashboard_context IS 'JSON object containing context-specific personality settings';
COMMENT ON COLUMN ai_system_messages.triggers IS 'JSON object defining when this message should be used';
COMMENT ON COLUMN ai_system_messages.localization IS 'JSON object containing translations for different locales';
COMMENT ON COLUMN ai_configuration.settings IS 'JSON object containing global AI settings and preferences';
COMMENT ON COLUMN ai_configuration.analytics IS 'JSON object containing AI performance analytics and metrics'; 