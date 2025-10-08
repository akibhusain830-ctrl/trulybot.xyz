-- CSRF Protection Database Schema
-- This creates the CSRF token storage and validation system

-- 1. CSRF TOKENS TABLE
DROP TABLE IF EXISTS csrf_tokens CASCADE;

CREATE TABLE csrf_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    endpoint TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT csrf_tokens_expires_future CHECK (expires_at > created_at)
);

-- CSRF tokens indexes
CREATE INDEX IF NOT EXISTS csrf_tokens_token_hash_idx ON csrf_tokens(token_hash);
CREATE INDEX IF NOT EXISTS csrf_tokens_user_id_idx ON csrf_tokens(user_id);
CREATE INDEX IF NOT EXISTS csrf_tokens_session_id_idx ON csrf_tokens(session_id);
CREATE INDEX IF NOT EXISTS csrf_tokens_expires_at_idx ON csrf_tokens(expires_at);
CREATE INDEX IF NOT EXISTS csrf_tokens_is_used_idx ON csrf_tokens(is_used);
CREATE INDEX IF NOT EXISTS csrf_tokens_created_at_idx ON csrf_tokens(created_at);

-- Enable RLS
ALTER TABLE csrf_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own CSRF tokens" 
ON csrf_tokens FOR ALL USING (
    auth.uid() = user_id
);

-- 2. CSRF TOKEN VALIDATION FUNCTION
CREATE OR REPLACE FUNCTION validate_csrf_token(
    token_value TEXT,
    p_user_id UUID,
    p_endpoint TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    token_record csrf_tokens%ROWTYPE;
    token_hash_value TEXT;
BEGIN
    -- Hash the token for comparison
    token_hash_value := encode(sha256(token_value::bytea), 'hex');
    
    -- Find the token
    SELECT * INTO token_record
    FROM csrf_tokens
    WHERE token_hash = token_hash_value
    AND user_id = p_user_id
    AND endpoint = p_endpoint
    AND NOT is_used
    AND expires_at > NOW();
    
    -- Return false if token not found or invalid
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Mark token as used
    UPDATE csrf_tokens
    SET is_used = TRUE,
        used_at = NOW()
    WHERE id = token_record.id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CSRF TOKEN CLEANUP FUNCTION
CREATE OR REPLACE FUNCTION cleanup_expired_csrf_tokens() RETURNS void AS $$
BEGIN
    DELETE FROM csrf_tokens
    WHERE expires_at < NOW() - INTERVAL '1 hour'
    OR (is_used = TRUE AND used_at < NOW() - INTERVAL '1 hour');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CSRF TOKEN GENERATION FUNCTION
CREATE OR REPLACE FUNCTION generate_csrf_token(
    p_user_id UUID,
    p_session_id TEXT,
    p_endpoint TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    token_value TEXT;
    token_hash_value TEXT;
    expires_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Generate random token
    token_value := encode(gen_random_bytes(32), 'base64');
    token_hash_value := encode(sha256(token_value::bytea), 'hex');
    expires_time := NOW() + INTERVAL '1 hour';
    
    -- Store token hash in database
    INSERT INTO csrf_tokens (
        token_hash,
        user_id,
        session_id,
        endpoint,
        ip_address,
        user_agent,
        expires_at
    ) VALUES (
        token_hash_value,
        p_user_id,
        p_session_id,
        p_endpoint,
        p_ip_address,
        p_user_agent,
        expires_time
    );
    
    RETURN token_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Schedule cleanup of expired tokens
SELECT cron.schedule('csrf-token-cleanup', '0 */6 * * *', 'SELECT cleanup_expired_csrf_tokens();');

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON csrf_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION validate_csrf_token TO authenticated;
GRANT EXECUTE ON FUNCTION generate_csrf_token TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'CSRF Protection schema created successfully!';
    RAISE NOTICE 'Tables created: csrf_tokens';
    RAISE NOTICE 'Functions created: validate_csrf_token, generate_csrf_token, cleanup_expired_csrf_tokens';
END $$;