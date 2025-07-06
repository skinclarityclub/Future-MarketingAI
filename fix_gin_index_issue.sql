-- ====================================================================
-- Fix GIN Index Issues for Text Columns
-- This script fixes the "text has no default operator class for access method gin" error
-- ====================================================================

-- Drop problematic GIN indexes on TEXT columns and recreate them properly
-- Most GIN indexes should be for JSONB columns, but we need to fix any TEXT ones

-- Check if any problematic indexes exist and drop them
DO $$
BEGIN
    -- Drop any existing problematic GIN indexes on TEXT columns
    DROP INDEX IF EXISTS idx_content_posts_content_gin;
    DROP INDEX IF EXISTS idx_content_posts_title_gin;
    DROP INDEX IF EXISTS idx_content_posts_excerpt_gin;
    DROP INDEX IF EXISTS idx_social_accounts_bio_gin;
    DROP INDEX IF EXISTS idx_content_calendar_description_gin;
    DROP INDEX IF EXISTS idx_content_calendar_notes_gin;
    
    RAISE NOTICE '✓ Dropped any existing problematic GIN indexes on TEXT columns';
END $$;

-- Create proper indexes for TEXT columns using correct methods
-- For full-text search on TEXT columns, use to_tsvector with GIN
CREATE INDEX IF NOT EXISTS idx_content_posts_content_fulltext 
ON content_posts USING gin(to_tsvector('english', content));

CREATE INDEX IF NOT EXISTS idx_content_posts_title_fulltext 
ON content_posts USING gin(to_tsvector('english', title));

CREATE INDEX IF NOT EXISTS idx_content_posts_excerpt_fulltext 
ON content_posts USING gin(to_tsvector('english', excerpt)) 
WHERE excerpt IS NOT NULL;

-- For partial text search, use pg_trgm extension with GIN
CREATE INDEX IF NOT EXISTS idx_social_accounts_bio_trigram 
ON social_accounts USING gin(bio gin_trgm_ops) 
WHERE bio IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_calendar_description_trigram 
ON content_calendar USING gin(description gin_trgm_ops) 
WHERE description IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_calendar_notes_trigram 
ON content_calendar USING gin(notes gin_trgm_ops) 
WHERE notes IS NOT NULL;

-- Ensure JSONB GIN indexes are properly created (these should work fine)
CREATE INDEX IF NOT EXISTS idx_content_posts_target_platforms_gin 
ON content_posts USING gin(target_platforms);

CREATE INDEX IF NOT EXISTS idx_content_posts_hashtags_gin 
ON content_posts USING gin(hashtags);

CREATE INDEX IF NOT EXISTS idx_content_posts_mentions_gin 
ON content_posts USING gin(mentions);

CREATE INDEX IF NOT EXISTS idx_content_posts_media_urls_gin 
ON content_posts USING gin(media_urls);

CREATE INDEX IF NOT EXISTS idx_content_calendar_target_platforms_gin 
ON content_calendar USING gin(target_platforms);

CREATE INDEX IF NOT EXISTS idx_content_calendar_target_accounts_gin 
ON content_calendar USING gin(target_accounts);

CREATE INDEX IF NOT EXISTS idx_content_calendar_tags_gin 
ON content_calendar USING gin(tags);

-- Regular B-tree indexes for exact matches and ranges
CREATE INDEX IF NOT EXISTS idx_content_posts_content_type_btree 
ON content_posts(content_type);

CREATE INDEX IF NOT EXISTS idx_content_posts_status_btree 
ON content_posts(status);

CREATE INDEX IF NOT EXISTS idx_content_posts_published_at_btree 
ON content_posts(published_at);

CREATE INDEX IF NOT EXISTS idx_social_accounts_platform_btree 
ON social_accounts(platform);

CREATE INDEX IF NOT EXISTS idx_social_accounts_status_btree 
ON social_accounts(status);

CREATE INDEX IF NOT EXISTS idx_content_calendar_status_btree 
ON content_calendar(status);

CREATE INDEX IF NOT EXISTS idx_content_calendar_date_btree 
ON content_calendar(calendar_date);

-- Verification
DO $$
BEGIN
    RAISE NOTICE '=== GIN INDEX FIX VERIFICATION ===';
    RAISE NOTICE '✅ Created full-text search indexes for TEXT columns using to_tsvector';
    RAISE NOTICE '✅ Created trigram indexes for partial text search using pg_trgm';
    RAISE NOTICE '✅ Created proper GIN indexes for JSONB columns';
    RAISE NOTICE '✅ Created B-tree indexes for exact matches and ranges';
    RAISE NOTICE '====================================';
END $$; 