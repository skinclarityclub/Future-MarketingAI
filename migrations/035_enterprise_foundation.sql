-- Enterprise Foundation Migration
-- Task 36.1: Enterprise Architecture for Fortune 500 Clients
-- This migration creates the base enterprise tables needed for Fortune 500 support

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Enterprise Tenants Table (Primary Foundation)
-- =============================================

-- Enterprise Tenant Schema (per Fortune 500 client)
CREATE TABLE enterprise_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Client Information
    company_name VARCHAR(255) NOT NULL,
    company_slug VARCHAR(50) UNIQUE NOT NULL,
    fortune_ranking INTEGER, -- Fortune 500 ranking
    annual_revenue_usd BIGINT, -- Annual revenue in USD
    employee_count INTEGER,
    industry_sector VARCHAR(100),
    
    -- Contract & Billing (Enterprise Level)
    contract_value_annual INTEGER NOT NULL, -- €180K or €300K
    contract_start_date DATE NOT NULL,
    contract_end_date DATE NOT NULL,
    payment_terms VARCHAR(50) DEFAULT 'net-30', -- Enterprise payment terms
    billing_contact JSONB NOT NULL, -- CFO/Procurement contact info
    
    -- Service Level
    service_tier VARCHAR(50) NOT NULL, -- 'marketing-machine' or 'complete-intelligence'
    dedicated_csm_id UUID, -- Customer Success Manager
    dedicated_support_team TEXT[],
    onboarding_status VARCHAR(50) DEFAULT 'planning',
    
    -- Technical Configuration
    dedicated_database_cluster VARCHAR(255),
    private_vpc_id VARCHAR(100),
    custom_domain VARCHAR(255), -- client.skc-intelligence.com
    ssl_certificate_arn VARCHAR(255),
    
    -- White-label Configuration
    branding_config JSONB DEFAULT '{}',
    custom_logo_url VARCHAR(500),
    brand_colors JSONB DEFAULT '{}',
    custom_css_overrides TEXT,
    
    -- Compliance & Security
    compliance_requirements TEXT[] DEFAULT '{SOC2,GDPR,ISO27001}',
    data_residency_region VARCHAR(50) DEFAULT 'eu-west-1',
    encryption_key_management VARCHAR(100) DEFAULT 'aws-kms-enterprise',
    
    -- Usage Limits (Enterprise Scale)
    max_concurrent_users INTEGER DEFAULT 500,
    api_rate_limit_per_hour INTEGER DEFAULT 1000000, -- 1M calls/hour
    data_storage_limit_tb INTEGER DEFAULT 100, -- 100TB storage
    
    -- Status
    status VARCHAR(20) DEFAULT 'active',
    health_score DECIMAL(3,2) DEFAULT 1.00, -- Customer health 0.0-1.0
    last_executive_review DATE,
    renewal_probability DECIMAL(3,2),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_service_tier CHECK (service_tier IN ('marketing-machine', 'complete-intelligence')),
    CONSTRAINT valid_contract_value CHECK (contract_value_annual IN (180000, 300000)),
    CONSTRAINT valid_health_score CHECK (health_score >= 0.0 AND health_score <= 1.0),
    CONSTRAINT valid_status CHECK (status IN ('active', 'suspended', 'terminated', 'onboarding'))
);

-- =============================================
-- Enterprise Users Table
-- =============================================

-- Enterprise User Management
CREATE TABLE enterprise_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES enterprise_tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Enterprise Role Structure
    role VARCHAR(50) NOT NULL,
    department VARCHAR(100), -- Marketing, Finance, IT, Executive
    job_title VARCHAR(150),
    cost_center VARCHAR(50),
    
    -- Access Control
    permission_level VARCHAR(50) NOT NULL, -- executive, manager, analyst, viewer
    data_access_regions TEXT[] DEFAULT '{all}',
    feature_access JSONB DEFAULT '{}',
    
    -- Enterprise Compliance
    security_clearance_level VARCHAR(50),
    last_security_training DATE,
    mfa_enabled BOOLEAN DEFAULT true,
    
    -- Usage Tracking
    last_login_at TIMESTAMPTZ,
    session_count_monthly INTEGER DEFAULT 0,
    data_export_count_monthly INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(tenant_id, user_id),
    CONSTRAINT valid_role CHECK (role IN ('ceo', 'cmo', 'cfo', 'cto', 'vp-marketing', 'director', 'manager', 'analyst', 'coordinator')),
    CONSTRAINT valid_permission_level CHECK (permission_level IN ('executive', 'manager', 'analyst', 'viewer'))
);

-- =============================================
-- Enterprise Audit Log Table
-- =============================================

-- Comprehensive Enterprise Audit Trail
CREATE TABLE enterprise_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES enterprise_tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    
    -- Audit Details
    event_type VARCHAR(100) NOT NULL, -- login, data_access, export, configuration_change
    event_category VARCHAR(50) NOT NULL, -- security, data, system, compliance
    event_severity VARCHAR(20) NOT NULL, -- low, medium, high, critical
    
    -- Technical Details
    resource_type VARCHAR(100), -- dashboard, report, user, configuration
    resource_id VARCHAR(255),
    action_performed VARCHAR(255) NOT NULL,
    action_result VARCHAR(50) NOT NULL, -- success, failure, partial
    
    -- Context Information
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    request_id VARCHAR(255),
    
    -- Data Details
    data_accessed JSONB, -- What data was accessed/modified
    data_classification VARCHAR(50), -- public, internal, confidential, restricted
    data_volume_bytes BIGINT,
    
    -- Compliance Fields
    legal_basis VARCHAR(100), -- GDPR legal basis
    retention_period INTERVAL,
    compliance_tags TEXT[],
    
    -- Timestamps
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexing for performance
    CONSTRAINT valid_event_severity CHECK (event_severity IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT valid_action_result CHECK (action_result IN ('success', 'failure', 'partial', 'blocked')),
    CONSTRAINT valid_data_classification CHECK (data_classification IN ('public', 'internal', 'confidential', 'restricted'))
);

-- =============================================
-- Enterprise Service Monitoring Table
-- =============================================

-- Service Level Agreement monitoring
CREATE TABLE enterprise_sla_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES enterprise_tenants(id) ON DELETE CASCADE,
    
    -- Measurement Period
    measurement_period_start TIMESTAMPTZ NOT NULL,
    measurement_period_end TIMESTAMPTZ NOT NULL,
    period_type VARCHAR(20) DEFAULT 'monthly', -- daily, weekly, monthly, quarterly
    
    -- SLA Metrics
    uptime_percentage DECIMAL(5,2),
    average_response_time_ms INTEGER,
    peak_response_time_ms INTEGER,
    api_calls_total BIGINT DEFAULT 0,
    api_errors_total INTEGER DEFAULT 0,
    api_error_rate DECIMAL(5,4),
    
    -- Performance Metrics
    concurrent_users_max INTEGER,
    concurrent_users_avg INTEGER,
    data_processed_gb DECIMAL(10,2),
    queries_executed BIGINT DEFAULT 0,
    
    -- Availability Incidents
    incidents_total INTEGER DEFAULT 0,
    incidents_critical INTEGER DEFAULT 0,
    total_downtime_minutes INTEGER DEFAULT 0,
    mttr_minutes INTEGER, -- Mean Time To Recovery
    
    -- Financial Impact
    sla_penalty_amount INTEGER DEFAULT 0, -- In cents
    credits_issued INTEGER DEFAULT 0,
    
    -- Status
    sla_met BOOLEAN DEFAULT true,
    report_generated BOOLEAN DEFAULT false,
    client_notified BOOLEAN DEFAULT false,
    
    -- Notes
    summary TEXT,
    recommendations TEXT[],
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_period_type CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly')),
    CONSTRAINT valid_uptime CHECK (uptime_percentage >= 0.0 AND uptime_percentage <= 100.0),
    CONSTRAINT valid_error_rate CHECK (api_error_rate >= 0.0 AND api_error_rate <= 1.0)
);

-- =============================================
-- Enterprise Support Tickets Table
-- =============================================

-- Enterprise support ticket tracking
CREATE TABLE enterprise_support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES enterprise_tenants(id) ON DELETE CASCADE,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Ticket Details
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- technical, billing, feature-request, incident
    priority VARCHAR(20) NOT NULL, -- low, medium, high, critical
    severity VARCHAR(20) NOT NULL, -- low, medium, high, critical
    
    -- Parties Involved
    requester_id UUID REFERENCES auth.users(id),
    requester_email VARCHAR(255),
    requester_name VARCHAR(255),
    assigned_to UUID REFERENCES auth.users(id),
    escalated_to UUID REFERENCES auth.users(id),
    
    -- Status Tracking
    status VARCHAR(50) DEFAULT 'open',
    resolution VARCHAR(50), -- resolved, closed, cancelled
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    first_response_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    
    -- SLA Tracking
    sla_due_date TIMESTAMPTZ,
    sla_breached BOOLEAN DEFAULT false,
    response_time_minutes INTEGER,
    resolution_time_hours INTEGER,
    
    -- Resolution Details
    resolution_summary TEXT,
    customer_satisfaction_score INTEGER, -- 1-5
    
    -- Tags and Metadata
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT valid_status CHECK (status IN ('open', 'in-progress', 'pending-customer', 'pending-vendor', 'escalated', 'resolved', 'closed', 'cancelled')),
    CONSTRAINT valid_category CHECK (category IN ('technical', 'billing', 'feature-request', 'incident', 'question', 'onboarding')),
    CONSTRAINT valid_satisfaction CHECK (customer_satisfaction_score IS NULL OR (customer_satisfaction_score >= 1 AND customer_satisfaction_score <= 5))
);

-- =============================================
-- Indexes for Performance
-- =============================================

-- Enterprise Tenants Indexes
CREATE INDEX idx_enterprise_tenants_company_slug ON enterprise_tenants(company_slug);
CREATE INDEX idx_enterprise_tenants_service_tier ON enterprise_tenants(service_tier);
CREATE INDEX idx_enterprise_tenants_status ON enterprise_tenants(status);
CREATE INDEX idx_enterprise_tenants_csm ON enterprise_tenants(dedicated_csm_id);
CREATE INDEX idx_enterprise_tenants_contract_end ON enterprise_tenants(contract_end_date);

-- Enterprise Users Indexes
CREATE INDEX idx_enterprise_users_tenant ON enterprise_users(tenant_id);
CREATE INDEX idx_enterprise_users_user ON enterprise_users(user_id);
CREATE INDEX idx_enterprise_users_role ON enterprise_users(role);
CREATE INDEX idx_enterprise_users_department ON enterprise_users(department);

-- Enterprise Audit Log Indexes
CREATE INDEX idx_enterprise_audit_tenant_date ON enterprise_audit_log(tenant_id, occurred_at DESC);
CREATE INDEX idx_enterprise_audit_user_date ON enterprise_audit_log(user_id, occurred_at DESC);
CREATE INDEX idx_enterprise_audit_severity ON enterprise_audit_log(event_severity, occurred_at DESC);
CREATE INDEX idx_enterprise_audit_category ON enterprise_audit_log(event_category);
CREATE INDEX idx_enterprise_audit_resource ON enterprise_audit_log(resource_type, resource_id);

-- SLA Monitoring Indexes
CREATE INDEX idx_enterprise_sla_tenant_period ON enterprise_sla_monitoring(tenant_id, measurement_period_end DESC);
CREATE INDEX idx_enterprise_sla_period_type ON enterprise_sla_monitoring(period_type, measurement_period_end DESC);
CREATE INDEX idx_enterprise_sla_met ON enterprise_sla_monitoring(sla_met, measurement_period_end DESC);

-- Support Tickets Indexes
CREATE INDEX idx_enterprise_support_tenant ON enterprise_support_tickets(tenant_id, created_at DESC);
CREATE INDEX idx_enterprise_support_status ON enterprise_support_tickets(status);
CREATE INDEX idx_enterprise_support_priority ON enterprise_support_tickets(priority, created_at DESC);
CREATE INDEX idx_enterprise_support_assigned ON enterprise_support_tickets(assigned_to);
CREATE INDEX idx_enterprise_support_sla ON enterprise_support_tickets(sla_due_date) WHERE sla_breached = false;

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Enable RLS on all enterprise tables
ALTER TABLE enterprise_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_sla_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Enterprise Tenants (Super Admins and CSMs)
CREATE POLICY "Super admins can manage all tenants" ON enterprise_tenants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_app_meta_data->>'role' = 'super_admin'
        )
    );

CREATE POLICY "CSMs can manage assigned tenants" ON enterprise_tenants
    FOR ALL USING (
        dedicated_csm_id = auth.uid()
    );

-- RLS Policies for Enterprise Users
CREATE POLICY "Users can see their own tenant users" ON enterprise_users
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM enterprise_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Tenant executives can manage tenant users" ON enterprise_users
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM enterprise_users 
            WHERE user_id = auth.uid() 
            AND permission_level = 'executive'
        )
    );

-- RLS Policies for Audit Logs (restricted access)
CREATE POLICY "Compliance officers can access audit logs" ON enterprise_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.raw_app_meta_data->>'role' = 'super_admin' OR
                auth.users.raw_app_meta_data->>'role' = 'compliance_officer'
            )
        )
    );

-- RLS Policies for SLA Monitoring
CREATE POLICY "CSMs and admins can access SLA data" ON enterprise_sla_monitoring
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM enterprise_tenants 
            WHERE enterprise_tenants.id = tenant_id
            AND (
                enterprise_tenants.dedicated_csm_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM auth.users
                    WHERE auth.users.id = auth.uid()
                    AND auth.users.raw_app_meta_data->>'role' IN ('super_admin', 'admin')
                )
            )
        )
    );

-- RLS Policies for Support Tickets
CREATE POLICY "Users can access their tenant support tickets" ON enterprise_support_tickets
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM enterprise_users 
            WHERE user_id = auth.uid()
        ) OR
        requester_id = auth.uid() OR
        assigned_to = auth.uid()
    );

-- =============================================
-- Trigger Functions for Automatic Updates
-- =============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to all enterprise tables
CREATE TRIGGER update_enterprise_tenants_updated_at 
    BEFORE UPDATE ON enterprise_tenants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enterprise_users_updated_at 
    BEFORE UPDATE ON enterprise_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enterprise_sla_monitoring_updated_at 
    BEFORE UPDATE ON enterprise_sla_monitoring 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enterprise_support_tickets_updated_at 
    BEFORE UPDATE ON enterprise_support_tickets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Sample Data for Development
-- =============================================

-- Insert sample Fortune 500 tenants for development
INSERT INTO enterprise_tenants (
    company_name, company_slug, fortune_ranking, annual_revenue_usd, employee_count, 
    industry_sector, contract_value_annual, contract_start_date, contract_end_date,
    service_tier, billing_contact
) VALUES 
(
    'Coca-Cola European Partners', 'coca-cola-ep', 156, 13500000000, 23000,
    'Beverages', 300000, '2025-01-01', '2025-12-31',
    'complete-intelligence',
    '{"name": "Sarah Johnson", "title": "CFO", "email": "sarah.johnson@coke.com", "phone": "+31-20-1234567"}'
),
(
    'BMW Group Nederland', 'bmw-group-nl', 75, 142000000000, 8500,
    'Automotive', 180000, '2025-02-01', '2026-01-31',
    'marketing-machine',
    '{"name": "Hans Mueller", "title": "Procurement Director", "email": "hans.mueller@bmw.com", "phone": "+31-30-9876543"}'
),
(
    'Microsoft Nederland', 'microsoft-nl', 14, 198000000000, 3500,
    'Technology', 300000, '2025-03-01', '2026-02-28',
    'complete-intelligence',
    '{"name": "Lisa Chen", "title": "Finance Director", "email": "lisa.chen@microsoft.com", "phone": "+31-20-5555123"}'
);

-- Grant permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role; 