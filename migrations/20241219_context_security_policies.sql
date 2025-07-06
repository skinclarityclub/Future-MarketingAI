-- ============================================
-- Context Retention System - Security Policies
-- Task 18: Enhance AI Context Awareness and Memory System
-- ============================================
-- This migration creates Row Level Security (RLS) policies for data privacy
-- Run this AFTER the main context retention migration

-- Enable Row Level Security on all context tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE contextual_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_maps ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USER PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON user_profiles FOR SELECT 
USING (auth.uid()::text = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid()::text = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON user_profiles FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile" 
ON user_profiles FOR DELETE 
USING (auth.uid()::text = user_id);

-- ============================================
-- SESSION MEMORIES POLICIES
-- ============================================

-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions" 
ON session_memories FOR SELECT 
USING (auth.uid()::text = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update their own sessions" 
ON session_memories FOR UPDATE 
USING (auth.uid()::text = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert their own sessions" 
ON session_memories FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete their own sessions" 
ON session_memories FOR DELETE 
USING (auth.uid()::text = user_id);

-- ============================================
-- CONVERSATION ENTRIES POLICIES
-- ============================================

-- Users can view their own conversations
CREATE POLICY "Users can view their own conversations" 
ON conversation_entries FOR SELECT 
USING (auth.uid()::text = user_id);

-- Users can update their own conversations
CREATE POLICY "Users can update their own conversations" 
ON conversation_entries FOR UPDATE 
USING (auth.uid()::text = user_id);

-- Users can insert their own conversations
CREATE POLICY "Users can insert their own conversations" 
ON conversation_entries FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- Users can delete their own conversations
CREATE POLICY "Users can delete their own conversations" 
ON conversation_entries FOR DELETE 
USING (auth.uid()::text = user_id);

-- ============================================
-- LEARNING INSIGHTS POLICIES
-- ============================================

-- Users can view their own insights
CREATE POLICY "Users can view their own insights" 
ON learning_insights FOR SELECT 
USING (auth.uid()::text = user_id);

-- Users can update their own insights
CREATE POLICY "Users can update their own insights" 
ON learning_insights FOR UPDATE 
USING (auth.uid()::text = user_id);

-- Users can insert their own insights
CREATE POLICY "Users can insert their own insights" 
ON learning_insights FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- Users can delete their own insights
CREATE POLICY "Users can delete their own insights" 
ON learning_insights FOR DELETE 
USING (auth.uid()::text = user_id);

-- ============================================
-- BEHAVIOR PATTERNS POLICIES
-- ============================================

-- Users can view their own patterns
CREATE POLICY "Users can view their own patterns" 
ON behavior_patterns FOR SELECT 
USING (auth.uid()::text = user_id);

-- Users can update their own patterns
CREATE POLICY "Users can update their own patterns" 
ON behavior_patterns FOR UPDATE 
USING (auth.uid()::text = user_id);

-- Users can insert their own patterns
CREATE POLICY "Users can insert their own patterns" 
ON behavior_patterns FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- Users can delete their own patterns
CREATE POLICY "Users can delete their own patterns" 
ON behavior_patterns FOR DELETE 
USING (auth.uid()::text = user_id);

-- ============================================
-- CONTEXTUAL KNOWLEDGE POLICIES
-- ============================================

-- Users can view their own knowledge
CREATE POLICY "Users can view their own knowledge" 
ON contextual_knowledge FOR SELECT 
USING (auth.uid()::text = user_id);

-- Users can update their own knowledge
CREATE POLICY "Users can update their own knowledge" 
ON contextual_knowledge FOR UPDATE 
USING (auth.uid()::text = user_id);

-- Users can insert their own knowledge
CREATE POLICY "Users can insert their own knowledge" 
ON contextual_knowledge FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- Users can delete their own knowledge
CREATE POLICY "Users can delete their own knowledge" 
ON contextual_knowledge FOR DELETE 
USING (auth.uid()::text = user_id);

-- ============================================
-- USER PREFERENCES POLICIES
-- ============================================

-- Users can view their own preferences
CREATE POLICY "Users can view their own preferences" 
ON user_preferences FOR SELECT 
USING (auth.uid()::text = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update their own preferences" 
ON user_preferences FOR UPDATE 
USING (auth.uid()::text = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert their own preferences" 
ON user_preferences FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete their own preferences" 
ON user_preferences FOR DELETE 
USING (auth.uid()::text = user_id);

-- ============================================
-- RELATIONSHIP MAPS POLICIES
-- ============================================

-- Users can view their own relationships
CREATE POLICY "Users can view their own relationships" 
ON relationship_maps FOR SELECT 
USING (auth.uid()::text = user_id);

-- Users can update their own relationships
CREATE POLICY "Users can update their own relationships" 
ON relationship_maps FOR UPDATE 
USING (auth.uid()::text = user_id);

-- Users can insert their own relationships
CREATE POLICY "Users can insert their own relationships" 
ON relationship_maps FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- Users can delete their own relationships
CREATE POLICY "Users can delete their own relationships" 
ON relationship_maps FOR DELETE 
USING (auth.uid()::text = user_id);

-- ============================================
-- ADMIN POLICIES (Optional - for system administration)
-- ============================================

-- Admin users can view all data (uncomment if needed)
-- CREATE POLICY "Admins can view all profiles" 
-- ON user_profiles FOR SELECT 
-- USING (auth.jwt() ->> 'role' = 'admin');

-- CREATE POLICY "Admins can view all sessions" 
-- ON session_memories FOR SELECT 
-- USING (auth.jwt() ->> 'role' = 'admin');

-- CREATE POLICY "Admins can view all conversations" 
-- ON conversation_entries FOR SELECT 
-- USING (auth.jwt() ->> 'role' = 'admin');

-- Verification query - Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN 'RLS ENABLED' 
        ELSE 'RLS DISABLED' 
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'user_profiles', 
    'session_memories', 
    'conversation_entries', 
    'learning_insights', 
    'behavior_patterns', 
    'contextual_knowledge', 
    'user_preferences', 
    'relationship_maps'
  )
ORDER BY tablename;

-- Verification query - Check policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN (
    'user_profiles', 
    'session_memories', 
    'conversation_entries', 
    'learning_insights', 
    'behavior_patterns', 
    'contextual_knowledge', 
    'user_preferences', 
    'relationship_maps'
  )
ORDER BY tablename, policyname;

-- ========================================
-- DONE! Context Retention System Security Policies Created
-- ========================================
-- RLS enabled for:
-- ✅ user_profiles
-- ✅ session_memories  
-- ✅ conversation_entries
-- ✅ learning_insights
-- ✅ behavior_patterns
-- ✅ contextual_knowledge
-- ✅ user_preferences
-- ✅ relationship_maps
-- 
-- Policies created:
-- ✅ SELECT policies (users can view their own data)
-- ✅ INSERT policies (users can create their own data)
-- ✅ UPDATE policies (users can modify their own data)
-- ✅ DELETE policies (users can delete their own data)
-- ✅ Data isolation per user (auth.uid() based)
-- ======================================== 