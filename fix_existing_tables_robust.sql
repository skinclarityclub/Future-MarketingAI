-- 🔧 ROBUUSTE FIX VOOR BESTAANDE TABELLEN
-- Deze versie handelt type conversies af

-- ==================================================================
-- 1. EERST: CONTROLEER HUIDIGE TABEL STRUCTUUR
-- ==================================================================

-- Bekijk alle kolommen van bestaande tabellen
SELECT 
    'CURRENT_STRUCTURE' as section,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('content_posts', 'content_calendar', 'social_accounts', 'user_profiles', 'content_research')
ORDER BY table_name, ordinal_position;

-- ==================================================================
-- 2. VEILIG KOLOMMEN TOEVOEGEN (ZONDER FOREIGN KEY CONSTRAINTS EERST)
-- ==================================================================

-- Voeg created_by toe aan content_posts (als TEXT eerst, later converteren)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'content_posts' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.content_posts 
        ADD COLUMN created_by TEXT; -- Start als TEXT
        RAISE NOTICE 'Added created_by column (TEXT) to content_posts';
    ELSE
        RAISE NOTICE 'Column created_by already exists in content_posts';
    END IF;
END $$;

-- Voeg user_id toe aan content_calendar (als TEXT eerst)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'content_calendar' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.content_calendar 
        ADD COLUMN user_id TEXT; -- Start als TEXT
        RAISE NOTICE 'Added user_id column (TEXT) to content_calendar';
    ELSE
        RAISE NOTICE 'Column user_id already exists in content_calendar';
    END IF;
END $$;

-- Voeg user_id toe aan social_accounts (als TEXT eerst)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'social_accounts' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.social_accounts 
        ADD COLUMN user_id TEXT; -- Start als TEXT
        RAISE NOTICE 'Added user_id column (TEXT) to social_accounts';
    ELSE
        RAISE NOTICE 'Column user_id already exists in social_accounts';
    END IF;
END $$;

-- Voeg role kolom toe aan user_profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN role VARCHAR(50) DEFAULT 'user';
        RAISE NOTICE 'Added role column to user_profiles';
    ELSE
        RAISE NOTICE 'Column role already exists in user_profiles';
    END IF;
END $$;

-- ==================================================================
-- 3. VOEG UPDATED_AT KOLOMMEN TOE
-- ==================================================================

DO $$
BEGIN
    -- content_posts
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'content_posts' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.content_posts 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to content_posts';
    END IF;

    -- content_calendar  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'content_calendar' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.content_calendar 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to content_calendar';
    END IF;

    -- social_accounts
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'social_accounts' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.social_accounts 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to social_accounts';
    END IF;

    -- user_profiles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to user_profiles';
    END IF;

    -- content_research (als die bestaat)
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'content_research'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'content_research' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.content_research 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to content_research';
    END IF;
END $$;

-- ==================================================================
-- 4. ENABLE RLS OP ALLE TABELLEN
-- ==================================================================

DO $$
BEGIN
    -- Enable RLS op alle tabellen (veilig)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_posts') THEN
        ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on content_posts';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_calendar') THEN
        ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on content_calendar';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'social_accounts') THEN
        ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on social_accounts';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
        ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on user_profiles';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_research') THEN
        ALTER TABLE public.content_research ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on content_research';
    END IF;
END $$;

-- ==================================================================
-- 5. MAAK UPDATE FUNCTION EN TRIGGERS
-- ==================================================================

-- Maak update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers toevoegen (veilig)
DO $$
BEGIN
    -- content_posts trigger
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_content_posts_updated_at'
    ) THEN
        CREATE TRIGGER update_content_posts_updated_at 
            BEFORE UPDATE ON public.content_posts 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Added updated_at trigger to content_posts';
    END IF;

    -- content_calendar trigger
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_content_calendar_updated_at'
    ) THEN
        CREATE TRIGGER update_content_calendar_updated_at 
            BEFORE UPDATE ON public.content_calendar 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Added updated_at trigger to content_calendar';
    END IF;

    -- social_accounts trigger
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_social_accounts_updated_at'
    ) THEN
        CREATE TRIGGER update_social_accounts_updated_at 
            BEFORE UPDATE ON public.social_accounts 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Added updated_at trigger to social_accounts';
    END IF;

    -- user_profiles trigger
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_user_profiles_updated_at'
    ) THEN
        CREATE TRIGGER update_user_profiles_updated_at 
            BEFORE UPDATE ON public.user_profiles 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Added updated_at trigger to user_profiles';
    END IF;

    -- content_research trigger (als tabel bestaat)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_research')
    AND NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_content_research_updated_at'
    ) THEN
        CREATE TRIGGER update_content_research_updated_at 
            BEFORE UPDATE ON public.content_research 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Added updated_at trigger to content_research';
    END IF;
END $$;

-- ==================================================================
-- 6. BASIS RLS POLICIES (TYPE-SAFE)
-- ==================================================================

-- Drop existing policies (veilig)
DROP POLICY IF EXISTS "Users can view own content posts" ON public.content_posts;
DROP POLICY IF EXISTS "Users can create content posts" ON public.content_posts;
DROP POLICY IF EXISTS "Users can update own content posts" ON public.content_posts;
DROP POLICY IF EXISTS "Users can delete own content posts" ON public.content_posts;

DROP POLICY IF EXISTS "Users can view own calendar" ON public.content_calendar;
DROP POLICY IF EXISTS "Users can manage own calendar" ON public.content_calendar;

DROP POLICY IF EXISTS "Users can view own social accounts" ON public.social_accounts;
DROP POLICY IF EXISTS "Users can manage own social accounts" ON public.social_accounts;

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON public.user_profiles;

-- Nieuwe RLS policies met type-safe vergelijkingen
-- Content Posts - Permissive policies voor bestaande data
CREATE POLICY "Users can view content posts" ON public.content_posts
    FOR SELECT USING (
        created_by IS NULL OR 
        created_by = '' OR 
        created_by = auth.uid()::text OR
        (created_by ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
         AND created_by::uuid = auth.uid())
    );

CREATE POLICY "Users can create content posts" ON public.content_posts
    FOR INSERT WITH CHECK (created_by = auth.uid()::text);

CREATE POLICY "Users can update content posts" ON public.content_posts
    FOR UPDATE USING (
        created_by IS NULL OR 
        created_by = '' OR 
        created_by = auth.uid()::text OR
        (created_by ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
         AND created_by::uuid = auth.uid())
    );

-- Content Calendar
CREATE POLICY "Users can view calendar" ON public.content_calendar
    FOR SELECT USING (
        user_id IS NULL OR 
        user_id = '' OR 
        user_id = auth.uid()::text OR
        (user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
         AND user_id::uuid = auth.uid())
    );

CREATE POLICY "Users can manage calendar" ON public.content_calendar
    FOR ALL USING (
        user_id IS NULL OR 
        user_id = '' OR 
        user_id = auth.uid()::text OR
        (user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
         AND user_id::uuid = auth.uid())
    ) WITH CHECK (user_id = auth.uid()::text);

-- Social Accounts
CREATE POLICY "Users can view social accounts" ON public.social_accounts
    FOR SELECT USING (
        user_id IS NULL OR 
        user_id = '' OR 
        user_id = auth.uid()::text OR
        (user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
         AND user_id::uuid = auth.uid())
    );

CREATE POLICY "Users can manage social accounts" ON public.social_accounts
    FOR ALL USING (
        user_id IS NULL OR 
        user_id = '' OR 
        user_id = auth.uid()::text OR
        (user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
         AND user_id::uuid = auth.uid())
    ) WITH CHECK (user_id = auth.uid()::text);

-- User Profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (
        user_id = auth.uid()::text OR
        (user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
         AND user_id::uuid = auth.uid())
    );

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (
        user_id = auth.uid()::text OR
        (user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
         AND user_id::uuid = auth.uid())
    );

CREATE POLICY "Users can create own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- ==================================================================
-- 7. FINAL VALIDATION
-- ==================================================================

SELECT 
    'FINAL_VALIDATION' as section,
    t.table_name,
    CASE WHEN pt.tablename IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as table_exists,
    'RLS: ' || CASE WHEN pt.rowsecurity THEN 'ON' ELSE 'OFF' END as rls_status,
    'owner_col: ' || CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns c 
        WHERE c.table_name = t.table_name 
        AND c.table_schema = 'public' 
        AND c.column_name IN ('created_by', 'user_id')
    ) THEN 'EXISTS' ELSE 'MISSING' END as owner_column,
    'updated_at: ' || CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns c 
        WHERE c.table_name = t.table_name 
        AND c.table_schema = 'public' 
        AND c.column_name = 'updated_at'
    ) THEN 'EXISTS' ELSE 'MISSING' END as timestamp_column
FROM (
    VALUES 
        ('content_posts'),
        ('content_calendar'),
        ('social_accounts'),
        ('user_profiles'),
        ('content_research')
) AS t(table_name)
LEFT JOIN pg_tables pt ON t.table_name = pt.tablename AND pt.schemaname = 'public'
ORDER BY t.table_name; 