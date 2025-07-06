-- ============================================
-- Context Retention System - Test Data
-- Task 18: Enhance AI Context Awareness and Memory System
-- ============================================
-- This migration creates test data for the context retention system
-- Run this AFTER all other context migrations for testing purposes
-- WARNING: This is for development/testing only!

-- Insert test user profiles
INSERT INTO user_profiles (user_id, expertise_level, communication_style, business_focus, preferred_analysis_depth, timezone, language) VALUES
('test-user-001', 'intermediate', 'detailed', ARRAY['revenue', 'analytics', 'performance'], 'detailed', 'Europe/Amsterdam', 'nl'),
('test-user-002', 'advanced', 'technical', ARRAY['data-science', 'ml', 'optimization'], 'comprehensive', 'America/New_York', 'en'),
('test-user-003', 'beginner', 'visual', ARRAY['marketing', 'sales'], 'basic', 'Europe/London', 'en'),
('demo-user-001', 'expert', 'concise', ARRAY['finance', 'strategy', 'operations'], 'comprehensive', 'Europe/Berlin', 'en')
ON CONFLICT (user_id) DO UPDATE SET
  expertise_level = EXCLUDED.expertise_level,
  communication_style = EXCLUDED.communication_style,
  business_focus = EXCLUDED.business_focus,
  updated_at = NOW();

-- Insert test session memories
INSERT INTO session_memories (session_id, user_id, context_summary, active_topics, user_intent, satisfaction_score) VALUES
('session-001-001', 'test-user-001', 'User exploring revenue analytics and dashboard customization', ARRAY['revenue', 'dashboard', 'analytics'], 'analysis', 4.2),
('session-001-002', 'test-user-001', 'Follow-up session focusing on performance optimization', ARRAY['performance', 'optimization'], 'optimization', 4.5),
('session-002-001', 'test-user-002', 'Deep dive into ML model performance and data quality', ARRAY['machine-learning', 'data-quality', 'models'], 'technical-analysis', 4.8),
('session-003-001', 'test-user-003', 'Introduction to dashboard features and basic analytics', ARRAY['introduction', 'dashboard', 'basics'], 'learning', 3.9),
('demo-session-001', 'demo-user-001', 'Strategic analysis of business metrics and KPIs', ARRAY['strategy', 'kpis', 'metrics'], 'strategic-planning', 4.7)
ON CONFLICT (session_id) DO UPDATE SET
  context_summary = EXCLUDED.context_summary,
  active_topics = EXCLUDED.active_topics,
  user_intent = EXCLUDED.user_intent,
  satisfaction_score = EXCLUDED.satisfaction_score,
  updated_at = NOW();

-- Insert test conversation entries
INSERT INTO conversation_entries (session_id, user_id, user_query, assistant_response, context, query_type, confidence, response_time) VALUES
('session-001-001', 'test-user-001', 'Wat zijn onze revenue trends van de afgelopen maand?', 'Op basis van de data zie ik dat de revenue in de afgelopen maand een stijgende trend toont met een groei van 12% ten opzichte van de vorige maand. De belangrijkste groeifactoren zijn...', '{"language": "nl", "dashboard_context": "revenue_overview"}', 'simple', 0.92, 1200),
('session-001-001', 'test-user-001', 'Kun je dit visualiseren in een grafiek?', 'Natuurlijk! Ik heb een lijndiagram gemaakt die de revenue trend toont. Je kunt zien dat er een duidelijke stijging is vanaf week 2, met een piek in week 4...', '{"language": "nl", "visualization_requested": true}', 'simple', 0.88, 800),
('session-002-001', 'test-user-002', 'What are the key performance indicators for our ML models?', 'Based on the current model performance data, here are the key KPIs: Accuracy: 94.2%, Precision: 91.8%, Recall: 89.5%, F1-Score: 90.6%. The models show consistent performance with minimal drift...', '{"language": "en", "technical_depth": "high"}', 'complex', 0.95, 1500),
('session-003-001', 'test-user-003', 'How do I create a new dashboard?', 'To create a new dashboard, follow these simple steps: 1) Click the "+" button in the top navigation, 2) Select "New Dashboard", 3) Choose a template or start blank...', '{"language": "en", "user_level": "beginner"}', 'simple', 0.85, 600),
('demo-session-001', 'demo-user-001', 'Analyze the correlation between marketing spend and revenue growth', 'The correlation analysis reveals a strong positive relationship (r=0.78) between marketing spend and revenue growth. Key insights: 1) ROI peaks at €50K monthly spend, 2) Diminishing returns above €75K...', '{"language": "en", "analysis_type": "correlation", "business_context": "strategic"}', 'complex', 0.91, 2100);

-- Insert test learning insights
INSERT INTO learning_insights (user_id, insight, category, confidence, evidence, impact) VALUES
('test-user-001', 'User prefers Dutch language responses and detailed explanations', 'preference', 0.89, ARRAY['Consistently asks questions in Dutch', 'Requests detailed breakdowns'], 'high'),
('test-user-001', 'Shows strong interest in revenue analytics and performance metrics', 'behavior', 0.92, ARRAY['Multiple revenue-related queries', 'Requests performance data'], 'high'),
('test-user-002', 'Demonstrates advanced technical expertise in ML and data science', 'expertise', 0.95, ARRAY['Uses technical terminology', 'Asks complex analytical questions'], 'high'),
('test-user-002', 'Prefers concise, technical responses with specific metrics', 'preference', 0.87, ARRAY['Responds well to technical details', 'Values precision over explanation'], 'medium'),
('test-user-003', 'New user requiring guided assistance and visual explanations', 'expertise', 0.83, ARRAY['Asks basic questions', 'Requests step-by-step guidance'], 'high'),
('demo-user-001', 'Strategic thinker focused on high-level business insights', 'behavior', 0.91, ARRAY['Asks strategic questions', 'Focuses on business impact'], 'high');

-- Insert test behavior patterns
INSERT INTO behavior_patterns (user_id, pattern, frequency, context, predictive_power) VALUES
('test-user-001', 'Weekly revenue analysis review', 4, ARRAY['monday-morning', 'revenue-dashboard'], 0.85),
('test-user-001', 'Requests visualization after data queries', 8, ARRAY['data-query', 'follow-up'], 0.78),
('test-user-002', 'Deep-dive technical analysis sessions', 3, ARRAY['afternoon', 'technical-analysis'], 0.92),
('test-user-002', 'Model performance monitoring', 6, ARRAY['ml-models', 'performance-check'], 0.88),
('test-user-003', 'Guided learning sessions', 2, ARRAY['tutorial', 'step-by-step'], 0.75),
('demo-user-001', 'Strategic planning analysis', 2, ARRAY['monthly', 'strategic-review'], 0.89);

-- Insert test contextual knowledge
INSERT INTO contextual_knowledge (user_id, topic, knowledge, relevance_score, source_queries, access_count) VALUES
('test-user-001', 'Revenue Analytics', 'User is particularly interested in month-over-month revenue trends and growth factors. Prefers detailed breakdowns with visual representations.', 0.92, ARRAY['revenue trends', 'monthly analysis'], 5),
('test-user-001', 'Dashboard Customization', 'User wants to customize dashboard layouts and prefers Dutch language interface.', 0.78, ARRAY['dashboard setup', 'customization'], 3),
('test-user-002', 'ML Model Performance', 'Expert-level understanding of ML metrics. Focuses on model accuracy, drift detection, and performance optimization.', 0.95, ARRAY['model performance', 'ML metrics'], 8),
('test-user-003', 'Basic Analytics', 'Beginner user learning dashboard navigation and basic analytics concepts.', 0.82, ARRAY['dashboard help', 'basic analytics'], 4),
('demo-user-001', 'Strategic Analysis', 'Focuses on high-level business metrics, correlations, and strategic insights for decision making.', 0.91, ARRAY['strategic analysis', 'business metrics'], 6);

-- Insert test user preferences
INSERT INTO user_preferences (user_id, visualization_types, data_granularity, update_frequency, notification_settings, dashboard_layout, report_formats) VALUES
('test-user-001', ARRAY['line-charts', 'bar-charts', 'tables'], 'detailed', 'daily', '{"email": true, "push": false, "slack": true}', '{"theme": "light", "layout": "grid", "widgets": ["revenue", "performance"]}', ARRAY['pdf', 'excel']),
('test-user-002', ARRAY['scatter-plots', 'heatmaps', 'technical-charts'], 'raw', 'real-time', '{"email": false, "push": true, "slack": false}', '{"theme": "dark", "layout": "technical", "widgets": ["ml-models", "data-quality"]}', ARRAY['json', 'csv']),
('test-user-003', ARRAY['pie-charts', 'simple-bars', 'summary-tables'], 'summary', 'weekly', '{"email": true, "push": true, "slack": false}', '{"theme": "light", "layout": "simple", "widgets": ["overview", "help"]}', ARRAY['pdf']),
('demo-user-001', ARRAY['executive-charts', 'kpi-dashboards', 'trend-analysis'], 'detailed', 'daily', '{"email": true, "push": false, "slack": true}', '{"theme": "executive", "layout": "strategic", "widgets": ["kpis", "trends", "insights"]}', ARRAY['pdf', 'powerpoint']);

-- Insert test relationship maps
INSERT INTO relationship_maps (user_id, entity_type, entity_id, relationship_type, strength, context) VALUES
('test-user-001', 'metric', 'monthly_revenue', 'interested', 0.92, ARRAY['primary-focus', 'daily-monitoring']),
('test-user-001', 'metric', 'customer_acquisition', 'stakeholder', 0.78, ARRAY['secondary-interest', 'growth-tracking']),
('test-user-002', 'metric', 'model_accuracy', 'expert', 0.95, ARRAY['technical-owner', 'performance-monitoring']),
('test-user-002', 'metric', 'data_quality_score', 'responsible', 0.88, ARRAY['data-steward', 'quality-assurance']),
('test-user-003', 'metric', 'dashboard_usage', 'interested', 0.65, ARRAY['learning', 'basic-user']),
('demo-user-001', 'metric', 'roi_marketing', 'stakeholder', 0.89, ARRAY['strategic-decision', 'budget-planning']),
('demo-user-001', 'metric', 'revenue_growth', 'responsible', 0.91, ARRAY['business-owner', 'strategic-kpi']);

-- Verification queries
SELECT 'Test Data Summary' as section, 
       'user_profiles' as table_name, 
       COUNT(*) as record_count 
FROM user_profiles 
WHERE user_id LIKE 'test-%' OR user_id LIKE 'demo-%'

UNION ALL

SELECT 'Test Data Summary' as section, 
       'session_memories' as table_name, 
       COUNT(*) as record_count 
FROM session_memories 
WHERE user_id LIKE 'test-%' OR user_id LIKE 'demo-%'

UNION ALL

SELECT 'Test Data Summary' as section, 
       'conversation_entries' as table_name, 
       COUNT(*) as record_count 
FROM conversation_entries 
WHERE user_id LIKE 'test-%' OR user_id LIKE 'demo-%'

UNION ALL

SELECT 'Test Data Summary' as section, 
       'learning_insights' as table_name, 
       COUNT(*) as record_count 
FROM learning_insights 
WHERE user_id LIKE 'test-%' OR user_id LIKE 'demo-%'

UNION ALL

SELECT 'Test Data Summary' as section, 
       'behavior_patterns' as table_name, 
       COUNT(*) as record_count 
FROM behavior_patterns 
WHERE user_id LIKE 'test-%' OR user_id LIKE 'demo-%'

UNION ALL

SELECT 'Test Data Summary' as section, 
       'contextual_knowledge' as table_name, 
       COUNT(*) as record_count 
FROM contextual_knowledge 
WHERE user_id LIKE 'test-%' OR user_id LIKE 'demo-%'

UNION ALL

SELECT 'Test Data Summary' as section, 
       'user_preferences' as table_name, 
       COUNT(*) as record_count 
FROM user_preferences 
WHERE user_id LIKE 'test-%' OR user_id LIKE 'demo-%'

UNION ALL

SELECT 'Test Data Summary' as section, 
       'relationship_maps' as table_name, 
       COUNT(*) as record_count 
FROM relationship_maps 
WHERE user_id LIKE 'test-%' OR user_id LIKE 'demo-%';

-- ========================================
-- DONE! Context Retention System Test Data Created
-- ========================================
-- Test data created for:
-- ✅ 4 test user profiles (test-user-001, test-user-002, test-user-003, demo-user-001)
-- ✅ 5 test sessions with different contexts
-- ✅ 5 test conversations in Dutch and English
-- ✅ 6 learning insights covering preferences, behavior, expertise
-- ✅ 6 behavior patterns with predictive power scores
-- ✅ 5 contextual knowledge entries
-- ✅ 4 user preference profiles
-- ✅ 7 relationship mappings
-- 
-- Test scenarios covered:
-- ✅ Dutch and English language support
-- ✅ Different expertise levels (beginner to expert)
-- ✅ Various communication styles
-- ✅ Multiple business focus areas
-- ✅ Complex and simple query types
-- ✅ ML behavior prediction data
-- ======================================== 