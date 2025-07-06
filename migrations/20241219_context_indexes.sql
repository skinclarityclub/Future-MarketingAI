-- ============================================
-- Context Retention System - Performance Indexes
-- Task 18: Enhance AI Context Awareness and Memory System
-- ============================================
-- This migration creates performance indexes for the context retention system
-- Run this AFTER the main context retention migration

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_memories_user_id ON session_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_session_memories_last_activity ON session_memories(last_activity);

CREATE INDEX IF NOT EXISTS idx_conversation_entries_session_id ON conversation_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_entries_user_id ON conversation_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_entries_timestamp ON conversation_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_conversation_entries_query_type ON conversation_entries(query_type);

CREATE INDEX IF NOT EXISTS idx_learning_insights_user_id ON learning_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_insights_category ON learning_insights(category);
CREATE INDEX IF NOT EXISTS idx_learning_insights_confidence ON learning_insights(confidence);

CREATE INDEX IF NOT EXISTS idx_behavior_patterns_user_id ON behavior_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_behavior_patterns_predictive_power ON behavior_patterns(predictive_power);
CREATE INDEX IF NOT EXISTS idx_behavior_patterns_last_seen ON behavior_patterns(last_seen);

CREATE INDEX IF NOT EXISTS idx_contextual_knowledge_user_id ON contextual_knowledge(user_id);
CREATE INDEX IF NOT EXISTS idx_contextual_knowledge_topic ON contextual_knowledge(topic);
CREATE INDEX IF NOT EXISTS idx_contextual_knowledge_relevance ON contextual_knowledge(relevance_score);
CREATE INDEX IF NOT EXISTS idx_contextual_knowledge_access_count ON contextual_knowledge(access_count);

CREATE INDEX IF NOT EXISTS idx_relationship_maps_user_id ON relationship_maps(user_id);
CREATE INDEX IF NOT EXISTS idx_relationship_maps_entity ON relationship_maps(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_relationship_maps_relationship_type ON relationship_maps(relationship_type);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_conversation_entries_user_timestamp ON conversation_entries(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_session_memories_user_activity ON session_memories(user_id, last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_behavior_patterns_user_power ON behavior_patterns(user_id, predictive_power DESC);
CREATE INDEX IF NOT EXISTS idx_learning_insights_user_category ON learning_insights(user_id, category);

-- Text search indexes for content
CREATE INDEX IF NOT EXISTS idx_conversation_entries_user_query_gin ON conversation_entries USING gin(to_tsvector('english', user_query));
CREATE INDEX IF NOT EXISTS idx_conversation_entries_assistant_response_gin ON conversation_entries USING gin(to_tsvector('english', assistant_response));
CREATE INDEX IF NOT EXISTS idx_contextual_knowledge_knowledge_gin ON contextual_knowledge USING gin(to_tsvector('english', knowledge));
CREATE INDEX IF NOT EXISTS idx_learning_insights_insight_gin ON learning_insights USING gin(to_tsvector('english', insight));

-- JSONB indexes for context data
CREATE INDEX IF NOT EXISTS idx_conversation_entries_context_gin ON conversation_entries USING gin(context);
CREATE INDEX IF NOT EXISTS idx_user_preferences_notification_settings_gin ON user_preferences USING gin(notification_settings);
CREATE INDEX IF NOT EXISTS idx_user_preferences_dashboard_layout_gin ON user_preferences USING gin(dashboard_layout);

-- Array indexes for better array operations
CREATE INDEX IF NOT EXISTS idx_user_profiles_business_focus_gin ON user_profiles USING gin(business_focus);
CREATE INDEX IF NOT EXISTS idx_session_memories_active_topics_gin ON session_memories USING gin(active_topics);
CREATE INDEX IF NOT EXISTS idx_learning_insights_evidence_gin ON learning_insights USING gin(evidence);
CREATE INDEX IF NOT EXISTS idx_behavior_patterns_context_gin ON behavior_patterns USING gin(context);
CREATE INDEX IF NOT EXISTS idx_contextual_knowledge_source_queries_gin ON contextual_knowledge USING gin(source_queries);
CREATE INDEX IF NOT EXISTS idx_relationship_maps_context_gin ON relationship_maps USING gin(context);

-- Verification query
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
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
ORDER BY tablename, indexname;

-- ========================================
-- DONE! Context Retention System Indexes Created
-- ========================================
-- Performance indexes created for:
-- ✅ user_profiles
-- ✅ session_memories  
-- ✅ conversation_entries
-- ✅ learning_insights
-- ✅ behavior_patterns
-- ✅ contextual_knowledge
-- ✅ user_preferences
-- ✅ relationship_maps
-- 
-- Index types created:
-- ✅ B-tree indexes for standard queries
-- ✅ GIN indexes for full-text search
-- ✅ GIN indexes for JSONB data
-- ✅ GIN indexes for array operations
-- ✅ Composite indexes for common patterns
-- ======================================== 