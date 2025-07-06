-- OAuth Tokens Migration
-- This migration adds support for storing OAuth access tokens for marketing APIs

-- Create OAuth tokens table
CREATE TABLE IF NOT EXISTS oauth_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    provider VARCHAR(50) NOT NULL, -- 'google_ads' or 'meta_ads'
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type VARCHAR(20) DEFAULT 'Bearer',
    expires_at TIMESTAMPTZ,
    scope TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- Add RLS policies
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to manage their own tokens
CREATE POLICY "Users can manage their own OAuth tokens" ON oauth_tokens
    FOR ALL USING (user_id = current_user);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_provider ON oauth_tokens(user_id, provider);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_expires_at ON oauth_tokens(expires_at);

-- Add trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_oauth_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_oauth_tokens_updated_at
    BEFORE UPDATE ON oauth_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_oauth_tokens_updated_at();

-- Create OAuth state table for security
CREATE TABLE IF NOT EXISTS oauth_states (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    state_value TEXT NOT NULL UNIQUE,
    provider VARCHAR(50) NOT NULL,
    user_id TEXT NOT NULL,
    redirect_uri TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '10 minutes')
);

-- Add RLS for oauth_states
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own OAuth states" ON oauth_states
    FOR ALL USING (user_id = current_user);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_oauth_states_state_value ON oauth_states(state_value);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at ON oauth_states(expires_at);

-- Cleanup expired states function
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
    DELETE FROM oauth_states WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql; 