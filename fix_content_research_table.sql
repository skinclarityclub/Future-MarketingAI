-- 🔧 FIX CONTENT_RESEARCH TABEL
-- Voeg ontbrekende kolommen toe aan content_research

-- Voeg created_by toe aan content_research
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'content_research' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.content_research 
        ADD COLUMN created_by TEXT;
        RAISE NOTICE 'Added created_by column (TEXT) to content_research';
    ELSE
        RAISE NOTICE 'Column created_by already exists in content_research';
    END IF;
END $$;

-- Voeg RLS policies toe aan content_research
DROP POLICY IF EXISTS "Users can view own research" ON public.content_research;
DROP POLICY IF EXISTS "Users can create research" ON public.content_research;
DROP POLICY IF EXISTS "Users can update own research" ON public.content_research;

-- Nieuwe RLS policies voor content_research
CREATE POLICY "Users can view research" ON public.content_research
    FOR SELECT USING (
        created_by IS NULL OR 
        created_by = '' OR 
        created_by = auth.uid()::text OR
        (created_by ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
         AND created_by::uuid = auth.uid())
    );

CREATE POLICY "Users can create research" ON public.content_research
    FOR INSERT WITH CHECK (created_by = auth.uid()::text);

CREATE POLICY "Users can update research" ON public.content_research
    FOR UPDATE USING (
        created_by IS NULL OR 
        created_by = '' OR 
        created_by = auth.uid()::text OR
        (created_by ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
         AND created_by::uuid = auth.uid())
    );

-- Validatie
SELECT 
    'CONTENT_RESEARCH_FIX' as section,
    'content_research' as table_name,
    'owner_col: ' || CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns c 
        WHERE c.table_name = 'content_research' 
        AND c.table_schema = 'public' 
        AND c.column_name = 'created_by'
    ) THEN 'EXISTS' ELSE 'MISSING' END as owner_column; 