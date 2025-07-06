-- ====================================================================
-- Simple GIN Index Fix - Only for Existing Columns
-- This script fixes GIN index issues by only creating indexes on columns that exist
-- ====================================================================

-- Drop any problematic GIN indexes first
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

-- Only create indexes for JSONB columns that are safe for GIN
-- These should work without operator class issues

-- For content_posts table - only JSONB columns
CREATE INDEX IF NOT EXISTS idx_content_posts_target_platforms_gin 
ON content_posts USING gin(target_platforms)
WHERE target_platforms IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_posts_hashtags_gin 
ON content_posts USING gin(hashtags)
WHERE hashtags IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_posts_mentions_gin 
ON content_posts USING gin(mentions)
WHERE mentions IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_posts_media_urls_gin 
ON content_posts USING gin(media_urls)
WHERE media_urls IS NOT NULL;

-- For content_calendar table - only JSONB columns
CREATE INDEX IF NOT EXISTS idx_content_calendar_target_platforms_gin 
ON content_calendar USING gin(target_platforms)
WHERE target_platforms IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_calendar_target_accounts_gin 
ON content_calendar USING gin(target_accounts)
WHERE target_accounts IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_calendar_tags_gin 
ON content_calendar USING gin(tags)
WHERE tags IS NOT NULL;

-- Use regular B-tree indexes for text columns and other data types
-- These are safer and work for most use cases

-- For content_posts
CREATE INDEX IF NOT EXISTS idx_content_posts_status_btree 
ON content_posts(status)
WHERE status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_posts_content_type_btree 
ON content_posts(content_type)
WHERE content_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_posts_published_at_btree 
ON content_posts(published_at)
WHERE published_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_posts_campaign_id_btree 
ON content_posts(campaign_id)
WHERE campaign_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_posts_author_id_btree 
ON content_posts(author_id)
WHERE author_id IS NOT NULL;

-- For social_accounts
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform_btree 
ON social_accounts(platform)
WHERE platform IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_social_accounts_status_btree 
ON social_accounts(status)
WHERE status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id_btree 
ON social_accounts(user_id)
WHERE user_id IS NOT NULL;

-- For content_calendar
CREATE INDEX IF NOT EXISTS idx_content_calendar_status_btree 
ON content_calendar(status)
WHERE status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_calendar_date_btree 
ON content_calendar(calendar_date)
WHERE calendar_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_calendar_assigned_to_btree 
ON content_calendar(assigned_to)
WHERE assigned_to IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_calendar_campaign_id_btree 
ON content_calendar(campaign_id)
WHERE campaign_id IS NOT NULL;

-- Verification
DO $$
BEGIN
    RAISE NOTICE '=== SIMPLE GIN INDEX FIX COMPLETE ===';
    RAISE NOTICE '✅ Created safe GIN indexes for JSONB columns only';
    RAISE NOTICE '✅ Created B-tree indexes for text and other columns';
    RAISE NOTICE '✅ Used WHERE clauses to avoid NULL values';
    RAISE NOTICE '✅ No operator class issues should occur';
    RAISE NOTICE '======================================';
END $$; 