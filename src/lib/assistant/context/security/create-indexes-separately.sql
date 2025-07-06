-- =============================================================================
-- INDEX CREATION COMMANDS TO RUN SEPARATELY
-- =============================================================================
-- These CREATE INDEX CONCURRENTLY commands must be run outside of transaction blocks
-- Run each command separately in your database administration tool

-- 1. Composite index for audit logs (for performance on user queries with timestamp and action)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_composite 
ON audit_logs(user_id, timestamp DESC, action);

-- 2. Composite index for consent records (for fast consent checking)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consent_records_composite 
ON consent_records(user_id, consent_type, status);

-- 3. Composite index for secure conversations (for efficient conversation history retrieval)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_secure_conversations_composite 
ON secure_conversation_entries(user_id_hash, timestamp DESC);

-- =============================================================================
-- INSTRUCTIONS:
-- =============================================================================
-- 1. Run each CREATE INDEX command above separately in your SQL client
-- 2. Wait for each index to complete before running the next one
-- 3. CONCURRENTLY allows the index to be built without blocking other operations
-- 4. These indexes will significantly improve query performance for:
--    - Audit log queries by user and time range
--    - Consent validation checks
--    - Conversation history retrieval
-- ============================================================================= 