-- =====================================================================================
-- Table Existence Check
-- File: 20250627_performance_check_tables.sql
-- Purpose: Check if required tables exist before adding performance optimizations
-- =====================================================================================

-- Check if required tables exist
DO $$
BEGIN
    -- Check if api_providers table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_providers') THEN
        RAISE NOTICE 'Table api_providers does not exist. Creating it...';
        
        CREATE TABLE api_providers (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(50) NOT NULL,
            description TEXT,
            base_url VARCHAR(500),
            auth_type VARCHAR(30) NOT NULL,
            is_active BOOLEAN DEFAULT true,
            priority VARCHAR(10) DEFAULT 'medium',
            features JSONB DEFAULT '[]'::jsonb,
            documentation_url VARCHAR(500),
            rate_limits JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;

    -- Check if api_credentials table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_credentials') THEN
        RAISE NOTICE 'Table api_credentials does not exist. Creating it...';
        
        CREATE TABLE api_credentials (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            provider_id VARCHAR(50) NOT NULL REFERENCES api_providers(id) ON DELETE CASCADE,
            credential_id VARCHAR(100) NOT NULL,
            credential_type VARCHAR(30) NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            encrypted_value TEXT,
            is_required BOOLEAN DEFAULT false,
            status VARCHAR(20) DEFAULT 'missing',
            last_validated_at TIMESTAMPTZ,
            expires_at TIMESTAMPTZ,
            scopes JSONB DEFAULT '[]'::jsonb,
            endpoints JSONB DEFAULT '[]'::jsonb,
            rate_limits JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(provider_id, credential_id)
        );
    END IF;

    -- Check if user_events table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_events') THEN
        RAISE NOTICE 'Table user_events does not exist. Creating it...';
        
        CREATE TABLE user_events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            session_id VARCHAR(255),
            user_id VARCHAR(255),
            event_type VARCHAR(100) NOT NULL,
            page_url TEXT,
            page_title TEXT,
            element_selector TEXT,
            element_text TEXT,
            viewport_width INTEGER,
            viewport_height INTEGER,
            referrer_url TEXT,
            custom_properties JSONB DEFAULT '{}'::jsonb,
            timestamp TIMESTAMPTZ DEFAULT NOW(),
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;

    -- Check if credential_usage_logs table exists  
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credential_usage_logs') THEN
        RAISE NOTICE 'Table credential_usage_logs does not exist. Creating it...';
        
        CREATE TABLE credential_usage_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            credential_id UUID NOT NULL,
            provider_id VARCHAR(50) NOT NULL,
            action VARCHAR(100) NOT NULL,
            success BOOLEAN NOT NULL,
            error_message TEXT,
            ip_address INET,
            user_agent TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- Show which tables now exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name IN ('api_providers', 'api_credentials', 'user_events', 'credential_usage_logs')
ORDER BY table_name;

SELECT 'Table check completed successfully' as status; 