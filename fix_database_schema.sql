-- Fix Content Research Table Schema
-- Voeg ontbrekende kolommen toe die door de research engines verwacht worden

-- Check en voeg content_data kolom toe als deze ontbreekt
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'content_research' 
        AND column_name = 'content_data'
    ) THEN
        ALTER TABLE public.content_research 
        ADD COLUMN content_data JSONB DEFAULT '{}';
        RAISE NOTICE 'Added content_data column to content_research';
    ELSE
        RAISE NOTICE 'Column content_data already exists in content_research';
    END IF;
END $$;

-- Check en voeg source_url kolom toe als deze ontbreekt
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'content_research' 
        AND column_name = 'source_url'
    ) THEN
        ALTER TABLE public.content_research 
        ADD COLUMN source_url TEXT;
        RAISE NOTICE 'Added source_url column to content_research';
    ELSE
        RAISE NOTICE 'Column source_url already exists in content_research';
    END IF;
END $$;

-- Check en voeg insights kolom toe als deze ontbreekt
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'content_research' 
        AND column_name = 'insights'
    ) THEN
        ALTER TABLE public.content_research 
        ADD COLUMN insights TEXT;
        RAISE NOTICE 'Added insights column to content_research';
    ELSE
        RAISE NOTICE 'Column insights already exists in content_research';
    END IF;
END $$;

-- Check en voeg status kolom toe als deze ontbreekt
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'content_research' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.content_research 
        ADD COLUMN status VARCHAR(50) DEFAULT 'pending';
        RAISE NOTICE 'Added status column to content_research';
    ELSE
        RAISE NOTICE 'Column status already exists in content_research';
    END IF;
END $$;

-- Controleer of alle vereiste kolommen bestaan
SELECT 
    'content_research' as table_name,
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_research' AND column_name = 'content_data') as has_content_data,
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_research' AND column_name = 'confidence_score') as has_confidence_score,
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_research' AND column_name = 'source_url') as has_source_url,
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_research' AND column_name = 'insights') as has_insights,
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_research' AND column_name = 'status') as has_status; 