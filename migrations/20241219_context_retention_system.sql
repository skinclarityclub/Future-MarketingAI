-- ============================================
-- Context Retention System Database Migration
-- Task 18: Enhance AI Context Awareness and Memory System
-- ============================================
-- This migration creates all tables needed for the context retention system
-- Run this in your Supabase SQL Editor

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY,
  expertise_level TEXT CHECK (expertise_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'intermediate',
  communication_style TEXT CHECK (communication_style IN ('concise', 'detailed', 'visual', 'technical')) DEFAULT 'detailed',
  business_focus TEXT[] DEFAULT '{}',
  preferred_analysis_depth TEXT CHECK (preferred_analysis_depth IN ('basic', 'detailed', 'comprehensive')) DEFAULT 'detailed',
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create session memories table
CREATE TABLE IF NOT EXISTS session_memories (
  session_id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  context_summary TEXT DEFAULT '',
  active_topics TEXT[] DEFAULT '{}',
  user_intent TEXT DEFAULT '',
  satisfaction_score DECIMAL(3,2) CHECK (satisfaction_score >= 0 AND satisfaction_score <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create conversation entries table
CREATE TABLE IF NOT EXISTS conversation_entries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES session_memories(session_id) ON DELETE CASCADE,
  user_id TEXT REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_query TEXT NOT NULL,
  assistant_response TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  feedback TEXT CHECK (feedback IN ('positive', 'negative', 'neutral')),
  follow_up BOOLEAN DEFAULT FALSE,
  query_type TEXT CHECK (query_type IN ('simple', 'complex', 'clarification')) DEFAULT 'simple',
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1) DEFAULT 0.5,
  response_time INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create learning insights table
CREATE TABLE IF NOT EXISTS learning_insights (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  insight TEXT NOT NULL,
  category TEXT CHECK (category IN ('preference', 'behavior', 'expertise', 'context')) NOT NULL,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1) NOT NULL,
  evidence TEXT[] DEFAULT '{}',
  impact TEXT CHECK (impact IN ('high', 'medium', 'low')) DEFAULT 'medium',
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create behavior patterns table
CREATE TABLE IF NOT EXISTS behavior_patterns (
  pattern_id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  pattern TEXT NOT NULL,
  frequency INTEGER DEFAULT 1,
  context TEXT[] DEFAULT '{}',
  predictive_power DECIMAL(3,2) CHECK (predictive_power >= 0 AND predictive_power <= 1) DEFAULT 0.5,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  first_observed TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contextual knowledge table
CREATE TABLE IF NOT EXISTS contextual_knowledge (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  knowledge TEXT NOT NULL,
  relevance_score DECIMAL(3,2) CHECK (relevance_score >= 0 AND relevance_score <= 1) DEFAULT 0.5,
  source_queries TEXT[] DEFAULT '{}',
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  visualization_types TEXT[] DEFAULT '{}',
  data_granularity TEXT CHECK (data_granularity IN ('summary', 'detailed', 'raw')) DEFAULT 'detailed',
  update_frequency TEXT CHECK (update_frequency IN ('real-time', 'hourly', 'daily', 'weekly')) DEFAULT 'real-time',
  notification_settings JSONB DEFAULT '{}',
  dashboard_layout JSONB DEFAULT '{}',
  report_formats TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create relationship maps table
CREATE TABLE IF NOT EXISTS relationship_maps (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  entity_type TEXT CHECK (entity_type IN ('customer', 'product', 'campaign', 'metric')) NOT NULL,
  entity_id TEXT NOT NULL,
  relationship_type TEXT CHECK (relationship_type IN ('interested', 'expert', 'responsible', 'stakeholder')) NOT NULL,
  strength DECIMAL(3,2) CHECK (strength >= 0 AND strength <= 1) DEFAULT 0.5,
  context TEXT[] DEFAULT '{}',
  last_interaction TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_session_memories_updated_at BEFORE UPDATE ON session_memories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_insights_updated_at BEFORE UPDATE ON learning_insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_behavior_patterns_updated_at BEFORE UPDATE ON behavior_patterns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contextual_knowledge_updated_at BEFORE UPDATE ON contextual_knowledge FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_relationship_maps_updated_at BEFORE UPDATE ON relationship_maps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verification query
SELECT 'Context Retention Tables Created' as status,
       COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'user_profiles', 
    'session_memories', 
    'conversation_entries', 
    'learning_insights', 
    'behavior_patterns', 
    'contextual_knowledge', 
    'user_preferences', 
    'relationship_maps'
  );

-- ========================================
-- DONE! Context Retention System Tables Created
-- ========================================
-- Tables created:
-- ✅ user_profiles
-- ✅ session_memories  
-- ✅ conversation_entries
-- ✅ learning_insights
-- ✅ behavior_patterns
-- ✅ contextual_knowledge
-- ✅ user_preferences
-- ✅ relationship_maps
-- ======================================== 