-- 🔧 FIX BESTAANDE TABELLEN VOOR MARKETING MACHINE
-- Voer dit script EERST uit voor je de nieuwe tabellen aanmaakt

-- ==================================================================
-- 1. CONTROLEER BESTAANDE TABEL STRUCTUUR
-- ==================================================================

-- Bekijk huidige kolommen van content_posts
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'content_posts'
ORDER BY ordinal_position;

-- Bekijk huidige kolommen van content_calendar
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'content_calendar'
ORDER BY ordinal_position;

-- Bekijk huidige kolommen van social_accounts
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'social_accounts'
ORDER BY ordinal_position;

-- Bekijk huidige kolommen van user_profiles
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- ==================================================================
-- 2. VOEG ONTBREKENDE KOLOMMEN TOE AAN BESTAANDE TABELLEN
-- ==================================================================

-- Voeg created_by toe aan content_posts als die niet bestaat
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'content_posts' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.content_posts 
        ADD COLUMN created_by UUID REFERENCES auth.users(id);
        
        -- Update existing records with current user (je kunt dit later aanpassen)
        -- Voor nu zetten we alle records op NULL of een default waarde
        RAISE NOTICE 'Added created_by column to content_posts';
    ELSE
        RAISE NOTICE 'Column created_by already exists in content_posts';
    END IF;
END $$;

-- Voeg user_id toe aan content_calendar als die niet bestaat  
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'content_calendar' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.content_calendar 
        ADD COLUMN user_id UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Added user_id column to content_calendar';
    ELSE
        RAISE NOTICE 'Column user_id already exists in content_calendar';
    END IF;
END $$;

-- Voeg user_id toe aan social_accounts als die niet bestaat
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'social_accounts' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.social_accounts 
        ADD COLUMN user_id UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Added user_id column to social_accounts';
    ELSE
        RAISE NOTICE 'Column user_id already exists in social_accounts';
    END IF;
END $$;

-- Voeg role kolom toe aan user_profiles als die niet bestaat
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
-- 3. VOEG ONTBREKENDE TIMESTAMPS TOE
-- ==================================================================

-- Voeg updated_at toe aan bestaande tabellen als die niet bestaan
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
END $$;

-- ==================================================================
-- 4. VOEG UPDATED_AT TRIGGERS TOE AAN BESTAANDE TABELLEN
-- ==================================================================

-- Maak update function als die nog niet bestaat
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers voor bestaande tabellen (alleen als ze nog niet bestaan)
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
END $$;

-- ==================================================================
-- 5. ENABLE RLS OP BESTAANDE TABELLEN (VEILIG)
-- ==================================================================

-- Enable RLS op bestaande tabellen (alleen als nog niet enabled)
DO $$
BEGIN
    -- Check en enable RLS voor elke tabel
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'content_posts' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on content_posts';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'content_calendar' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on content_calendar';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'social_accounts' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on social_accounts';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'user_profiles' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on user_profiles';
    END IF;
END $$;

-- ==================================================================
-- 6. BASIS RLS POLICIES VOOR BESTAANDE TABELLEN
-- ==================================================================

-- Drop existing policies if they exist (om conflicts te voorkomen)
DROP POLICY IF EXISTS "Users can view own content posts" ON public.content_posts;
DROP POLICY IF EXISTS "Users can create content posts" ON public.content_posts;
DROP POLICY IF EXISTS "Users can update own content posts" ON public.content_posts;

DROP POLICY IF EXISTS "Users can view own calendar" ON public.content_calendar;
DROP POLICY IF EXISTS "Users can manage own calendar" ON public.content_calendar;

DROP POLICY IF EXISTS "Users can view own social accounts" ON public.social_accounts;
DROP POLICY IF EXISTS "Users can manage own social accounts" ON public.social_accounts;

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

-- Nieuwe RLS policies voor bestaande tabellen
-- Content Posts
CREATE POLICY "Users can view own content posts" ON public.content_posts
    FOR SELECT USING (
        created_by::uuid = auth.uid() OR created_by IS NULL
    );

CREATE POLICY "Users can create content posts" ON public.content_posts
    FOR INSERT WITH CHECK (created_by::uuid = auth.uid());

CREATE POLICY "Users can update own content posts" ON public.content_posts
    FOR UPDATE USING (
        created_by::uuid = auth.uid() OR created_by IS NULL
    );

-- Content Calendar
CREATE POLICY "Users can view own calendar" ON public.content_calendar
    FOR SELECT USING (
        user_id::uuid = auth.uid() OR user_id IS NULL
    );

CREATE POLICY "Users can manage own calendar" ON public.content_calendar
    FOR ALL USING (
        user_id::uuid = auth.uid() OR user_id IS NULL
    ) WITH CHECK (user_id::uuid = auth.uid());

-- Social Accounts
CREATE POLICY "Users can view own social accounts" ON public.social_accounts
    FOR SELECT USING (
        user_id::uuid = auth.uid() OR user_id IS NULL
    );

CREATE POLICY "Users can manage own social accounts" ON public.social_accounts
    FOR ALL USING (
        user_id::uuid = auth.uid() OR user_id IS NULL
    ) WITH CHECK (user_id::uuid = auth.uid());

-- User Profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (user_id::uuid = auth.uid());

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (user_id::uuid = auth.uid());

CREATE POLICY "Users can create own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (user_id::uuid = auth.uid());

-- ==================================================================
-- 7. VALIDATIE: CONTROLEER OF FIXES GELUKT ZIJN
-- ==================================================================

SELECT 
    'EXISTING_TABLES_VALIDATION' as section,
    t.table_name,
    'RLS: ' || CASE WHEN pt.rowsecurity THEN 'ON' ELSE 'OFF' END ||
    ' | created_by: ' || CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns c 
        WHERE c.table_name = t.table_name 
        AND c.table_schema = 'public' 
        AND c.column_name IN ('created_by', 'user_id')
    ) THEN 'EXISTS' ELSE 'MISSING' END ||
    ' | updated_at: ' || CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns c 
        WHERE c.table_name = t.table_name 
        AND c.table_schema = 'public' 
        AND c.column_name = 'updated_at'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
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