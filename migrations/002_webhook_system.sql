-- Migration: Webhook System for Real-Time Data Synchronization  
-- This migration creates the webhook logging system and real-time sync infrastructure
-- Author: Real-Time Sync System
-- Date: 2025-01-12

-- 1. Webhook Logs Table (For monitoring and debugging)
CREATE TABLE public.webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(50) NOT NULL CHECK (source IN ('shopify', 'kajabi', 'facebook', 'instagram', 'twitter')),
    event_type VARCHAR(100) NOT NULL,
    webhook_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'received' CHECK (status IN ('received', 'processing', 'completed', 'failed', 'retried')),
    data JSONB DEFAULT '{}',
    error_message TEXT,
    processing_duration_ms INTEGER,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Real-Time Sync Configuration Table
CREATE TABLE public.sync_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(50) NOT NULL UNIQUE,
    is_enabled BOOLEAN DEFAULT TRUE,
    webhook_url VARCHAR(500),
    secret_key_encrypted TEXT,
    sync_frequency_minutes INTEGER DEFAULT 5,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Data Sync Queue (For failed/retry processing)
CREATE TABLE public.sync_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete'
    entity_type VARCHAR(50) NOT NULL, -- 'customer', 'order', 'profile'
    entity_id VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    priority INTEGER DEFAULT 1, -- 1=high, 2=medium, 3=low
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Customer Sync Status Tracking
CREATE TABLE public.customer_sync_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.unified_customers(id) ON DELETE CASCADE,
    source VARCHAR(50) NOT NULL,
    external_id VARCHAR(255) NOT NULL,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_version INTEGER DEFAULT 1,
    is_sync_enabled BOOLEAN DEFAULT TRUE,
    sync_conflicts JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, source)
);

-- Create indexes for performance
CREATE INDEX idx_webhook_logs_source ON public.webhook_logs(source);
CREATE INDEX idx_webhook_logs_event_type ON public.webhook_logs(event_type);
CREATE INDEX idx_webhook_logs_status ON public.webhook_logs(status);
CREATE INDEX idx_webhook_logs_processed_at ON public.webhook_logs(processed_at);

CREATE INDEX idx_sync_queue_status ON public.sync_queue(status);
CREATE INDEX idx_sync_queue_priority ON public.sync_queue(priority);
CREATE INDEX idx_sync_queue_scheduled_for ON public.sync_queue(scheduled_for);
CREATE INDEX idx_sync_queue_source ON public.sync_queue(source);

CREATE INDEX idx_customer_sync_status_customer_id ON public.customer_sync_status(customer_id);
CREATE INDEX idx_customer_sync_status_source ON public.customer_sync_status(source);
CREATE INDEX idx_customer_sync_status_external_id ON public.customer_sync_status(external_id);

-- Create functions for webhook processing
CREATE OR REPLACE FUNCTION process_webhook_event(
    webhook_source VARCHAR(50),
    webhook_event_type VARCHAR(100),
    webhook_data JSONB
) RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    webhook_log_id UUID;
    result JSONB;
BEGIN
    -- Create webhook log entry
    INSERT INTO public.webhook_logs (source, event_type, data, status)
    VALUES (webhook_source, webhook_event_type, webhook_data, 'processing')
    RETURNING id INTO webhook_log_id;

    -- Process based on source and event type
    CASE webhook_source
        WHEN 'shopify' THEN
            result := process_shopify_webhook(webhook_event_type, webhook_data);
        WHEN 'kajabi' THEN
            result := process_kajabi_webhook(webhook_event_type, webhook_data);
        WHEN 'facebook', 'instagram', 'twitter' THEN
            result := process_social_webhook(webhook_source, webhook_event_type, webhook_data);
        ELSE
            result := '{"success": false, "message": "Unsupported webhook source"}'::jsonb;
    END CASE;

    -- Update webhook log with result
    UPDATE public.webhook_logs 
    SET 
        status = CASE WHEN (result->>'success')::boolean THEN 'completed' ELSE 'failed' END,
        error_message = CASE WHEN NOT (result->>'success')::boolean THEN result->>'message' END,
        processing_duration_ms = EXTRACT(epoch FROM (NOW() - created_at)) * 1000
    WHERE id = webhook_log_id;

    RETURN result;
END;
$$;

-- Function to process Shopify webhooks
CREATE OR REPLACE FUNCTION process_shopify_webhook(
    event_type VARCHAR(100),
    webhook_data JSONB
) RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    customer_data JSONB;
    customer_id UUID;
BEGIN
    CASE event_type
        WHEN 'customers/create', 'customers/update' THEN
            -- Add to sync queue for processing
            INSERT INTO public.sync_queue (source, action, entity_type, entity_id, payload)
            VALUES ('shopify', 'upsert', 'customer', webhook_data->>'id', webhook_data);
            
            RETURN '{"success": true, "message": "Customer sync queued"}'::jsonb;
            
        WHEN 'orders/create', 'orders/updated' THEN
            -- Add order processing to queue
            INSERT INTO public.sync_queue (source, action, entity_type, entity_id, payload)
            VALUES ('shopify', 'upsert', 'order', webhook_data->>'id', webhook_data);
            
            RETURN '{"success": true, "message": "Order sync queued"}'::jsonb;
            
        WHEN 'customers/delete' THEN
            -- Add deletion to queue
            INSERT INTO public.sync_queue (source, action, entity_type, entity_id, payload)
            VALUES ('shopify', 'delete', 'customer', webhook_data->>'id', webhook_data);
            
            RETURN '{"success": true, "message": "Customer deletion queued"}'::jsonb;
            
        ELSE
            RETURN '{"success": true, "message": "Event acknowledged but not processed"}'::jsonb;
    END CASE;
END;
$$;

-- Function to process Kajabi webhooks
CREATE OR REPLACE FUNCTION process_kajabi_webhook(
    event_type VARCHAR(100),
    webhook_data JSONB
) RETURNS JSONB
LANGUAGE plpgsql
AS $$
BEGIN
    CASE event_type
        WHEN 'person.created', 'person.updated' THEN
            INSERT INTO public.sync_queue (source, action, entity_type, entity_id, payload)
            VALUES ('kajabi', 'upsert', 'customer', webhook_data->>'id', webhook_data);
            
            RETURN '{"success": true, "message": "Kajabi customer sync queued"}'::jsonb;
            
        WHEN 'purchase.created', 'purchase.updated' THEN
            INSERT INTO public.sync_queue (source, action, entity_type, entity_id, payload)
            VALUES ('kajabi', 'upsert', 'purchase', webhook_data->>'id', webhook_data);
            
            RETURN '{"success": true, "message": "Kajabi purchase sync queued"}'::jsonb;
            
        WHEN 'person.deleted' THEN
            INSERT INTO public.sync_queue (source, action, entity_type, entity_id, payload)
            VALUES ('kajabi', 'delete', 'customer', webhook_data->>'id', webhook_data);
            
            RETURN '{"success": true, "message": "Kajabi customer deletion queued"}'::jsonb;
            
        ELSE
            RETURN '{"success": true, "message": "Kajabi event acknowledged but not processed"}'::jsonb;
    END CASE;
END;
$$;

-- Function to process social media webhooks
CREATE OR REPLACE FUNCTION process_social_webhook(
    webhook_source VARCHAR(50),
    event_type VARCHAR(100),
    webhook_data JSONB
) RETURNS JSONB
LANGUAGE plpgsql
AS $$
BEGIN
    -- Add social media events to sync queue
    INSERT INTO public.sync_queue (source, action, entity_type, entity_id, payload, priority)
    VALUES (webhook_source, 'upsert', 'social_profile', webhook_data->>'id', webhook_data, 2);
    
    RETURN '{"success": true, "message": "Social media event queued"}'::jsonb;
END;
$$;

-- Function to process sync queue items
CREATE OR REPLACE FUNCTION process_sync_queue_item(queue_item_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    queue_item RECORD;
    result JSONB;
BEGIN
    -- Get queue item
    SELECT * INTO queue_item FROM public.sync_queue WHERE id = queue_item_id;
    
    IF NOT FOUND THEN
        RETURN '{"success": false, "message": "Queue item not found"}'::jsonb;
    END IF;
    
    -- Update status to processing
    UPDATE public.sync_queue SET status = 'processing' WHERE id = queue_item_id;
    
    -- This would call your application logic to actually process the sync
    -- For now, we'll just mark it as completed
    UPDATE public.sync_queue 
    SET 
        status = 'completed',
        processed_at = NOW()
    WHERE id = queue_item_id;
    
    RETURN '{"success": true, "message": "Queue item processed"}'::jsonb;
END;
$$;

-- Function to get sync queue statistics
CREATE OR REPLACE FUNCTION get_sync_queue_stats()
RETURNS TABLE (
    source VARCHAR(50),
    status VARCHAR(20),
    count BIGINT,
    avg_retry_count NUMERIC
)
LANGUAGE sql
AS $$
    SELECT 
        source,
        status,
        COUNT(*) as count,
        AVG(retry_count) as avg_retry_count
    FROM public.sync_queue 
    GROUP BY source, status
    ORDER BY source, status;
$$;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_sync_configurations_updated_at 
    BEFORE UPDATE ON public.sync_configurations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_sync_status_updated_at 
    BEFORE UPDATE ON public.customer_sync_status 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default sync configurations
INSERT INTO public.sync_configurations (source, webhook_url, settings) VALUES
('shopify', '/api/webhooks/shopify', '{"supported_events": ["customers/create", "customers/update", "customers/delete", "orders/create", "orders/updated"]}'),
('kajabi', '/api/webhooks/kajabi', '{"supported_events": ["person.created", "person.updated", "person.deleted", "purchase.created", "purchase.updated"]}'),
('facebook', '/api/webhooks/facebook', '{"supported_events": ["user", "page"]}'),
('instagram', '/api/webhooks/instagram', '{"supported_events": ["user", "page"]}'),
('twitter', '/api/webhooks/twitter', '{"supported_events": ["follow_events", "tweet_create_events"]}');

-- Create Row Level Security policies
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_sync_status ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Enable read access for all users" ON public.webhook_logs FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.webhook_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON public.sync_configurations FOR SELECT USING (true);
CREATE POLICY "Enable update for authenticated users" ON public.sync_configurations FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON public.sync_queue FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.sync_queue FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.sync_queue FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON public.customer_sync_status FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.customer_sync_status FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.customer_sync_status FOR UPDATE USING (true);

-- Create view for webhook monitoring
CREATE VIEW webhook_monitoring AS
SELECT 
    source,
    event_type,
    status,
    COUNT(*) as event_count,
    AVG(processing_duration_ms) as avg_processing_time_ms,
    MAX(processed_at) as last_processed_at,
    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count
FROM public.webhook_logs 
WHERE processed_at >= NOW() - INTERVAL '24 hours'
GROUP BY source, event_type, status
ORDER BY source, event_type;

-- Comments for documentation
COMMENT ON TABLE public.webhook_logs IS 'Logs all incoming webhook events for monitoring and debugging';
COMMENT ON TABLE public.sync_configurations IS 'Configuration settings for each data source sync';
COMMENT ON TABLE public.sync_queue IS 'Queue for processing data synchronization tasks';
COMMENT ON TABLE public.customer_sync_status IS 'Tracks synchronization status for each customer across sources'; 