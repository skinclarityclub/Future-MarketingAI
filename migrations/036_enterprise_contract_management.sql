-- Enterprise Contract Management System Migration
-- Task 36.6: Enterprise Contract Management System
-- For Fortune 500 clients with €180K-300K annual agreements

-- Contract Templates Table
CREATE TABLE enterprise_contract_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Template Information
    template_name VARCHAR(255) NOT NULL,
    template_type VARCHAR(100) NOT NULL, -- 'marketing-machine', 'complete-intelligence', 'custom'
    template_version VARCHAR(20) NOT NULL,
    
    -- Contract Terms
    base_annual_value INTEGER NOT NULL, -- €180K or €300K
    contract_duration_months INTEGER DEFAULT 12,
    payment_terms VARCHAR(100) DEFAULT 'net-30',
    auto_renewal BOOLEAN DEFAULT true,
    termination_notice_days INTEGER DEFAULT 90,
    
    -- Legal Framework
    governing_law VARCHAR(100) DEFAULT 'Netherlands',
    jurisdiction VARCHAR(100) DEFAULT 'Amsterdam',
    currency VARCHAR(10) DEFAULT 'EUR',
    
    -- Service Level Agreements
    uptime_guarantee DECIMAL(5,2) DEFAULT 99.99,
    support_level VARCHAR(50) DEFAULT '24/7-enterprise',
    response_time_critical INTEGER DEFAULT 15, -- minutes
    penalty_per_hour INTEGER DEFAULT 50000, -- €50K per hour downtime
    
    -- Content & Clauses
    contract_clauses JSONB NOT NULL DEFAULT '{}',
    terms_and_conditions TEXT,
    data_processing_addendum TEXT,
    security_requirements TEXT,
    compliance_requirements TEXT[],
    
    -- Approval Workflow
    requires_legal_review BOOLEAN DEFAULT true,
    requires_finance_approval BOOLEAN DEFAULT true,
    requires_executive_approval BOOLEAN DEFAULT true,
    
    -- Status & Metadata
    status VARCHAR(50) DEFAULT 'draft',
    created_by UUID NOT NULL,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_template_type CHECK (template_type IN ('marketing-machine', 'complete-intelligence', 'custom')),
    CONSTRAINT valid_status CHECK (status IN ('draft', 'pending-review', 'approved', 'active', 'deprecated'))
);

-- Enterprise Contracts Table (extends enterprise_tenants)
CREATE TABLE enterprise_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES enterprise_tenants(id),
    template_id UUID REFERENCES enterprise_contract_templates(id),
    
    -- Contract Identification
    contract_number VARCHAR(100) UNIQUE NOT NULL,
    contract_name VARCHAR(255) NOT NULL,
    contract_type VARCHAR(100) NOT NULL,
    
    -- Financial Terms
    annual_contract_value INTEGER NOT NULL,
    total_contract_value INTEGER NOT NULL,
    payment_schedule VARCHAR(50) DEFAULT 'annual', -- annual, quarterly, monthly
    payment_terms VARCHAR(100) DEFAULT 'net-30',
    
    -- Timeline
    effective_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    renewal_date DATE,
    termination_date DATE,
    
    -- Renewal Terms
    auto_renewal BOOLEAN DEFAULT true,
    renewal_notice_days INTEGER DEFAULT 90,
    renewal_probability DECIMAL(3,2), -- 0.0 to 1.0
    
    -- Parties
    client_legal_entity VARCHAR(255) NOT NULL,
    client_signatory JSONB NOT NULL, -- Name, title, email, phone
    client_legal_contact JSONB NOT NULL,
    client_procurement_contact JSONB,
    
    vendor_legal_entity VARCHAR(255) DEFAULT 'SKC Intelligence B.V.',
    vendor_signatory JSONB NOT NULL,
    vendor_legal_contact JSONB NOT NULL,
    
    -- Service Details
    service_tier VARCHAR(100) NOT NULL,
    service_components TEXT[],
    implementation_timeline JSONB,
    success_criteria JSONB,
    
    -- Compliance & Legal
    governing_law VARCHAR(100) DEFAULT 'Netherlands',
    jurisdiction VARCHAR(100) DEFAULT 'Amsterdam',
    dispute_resolution VARCHAR(100) DEFAULT 'arbitration',
    confidentiality_level VARCHAR(50) DEFAULT 'high',
    
    -- SLA Terms
    uptime_sla DECIMAL(5,2) DEFAULT 99.99,
    performance_metrics JSONB,
    penalty_structure JSONB,
    
    -- Documents & Attachments
    contract_document_url VARCHAR(500),
    signed_contract_url VARCHAR(500),
    amendments JSONB DEFAULT '[]',
    addendums JSONB DEFAULT '[]',
    
    -- Workflow & Approvals
    approval_workflow JSONB DEFAULT '{}',
    legal_review_status VARCHAR(50) DEFAULT 'pending',
    finance_approval_status VARCHAR(50) DEFAULT 'pending',
    executive_approval_status VARCHAR(50) DEFAULT 'pending',
    client_approval_status VARCHAR(50) DEFAULT 'pending',
    
    -- Risk Assessment
    risk_score DECIMAL(3,2) DEFAULT 0.5, -- 0.0 (low) to 1.0 (high)
    risk_factors TEXT[],
    mitigation_strategies TEXT[],
    
    -- Status & Tracking
    status VARCHAR(50) DEFAULT 'draft',
    milestone_status JSONB DEFAULT '{}',
    health_score DECIMAL(3,2) DEFAULT 1.0,
    
    -- Audit Trail
    created_by UUID NOT NULL,
    last_modified_by UUID,
    legal_reviewed_by UUID,
    finance_approved_by UUID,
    executive_approved_by UUID,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_contract_type CHECK (contract_type IN ('marketing-machine', 'complete-intelligence', 'custom', 'pilot')),
    CONSTRAINT valid_payment_schedule CHECK (payment_schedule IN ('annual', 'quarterly', 'monthly', 'milestone')),
    CONSTRAINT valid_status CHECK (status IN ('draft', 'pending-approval', 'approved', 'active', 'suspended', 'terminated', 'expired', 'renewed'))
);

-- Contract Amendments & Changes
CREATE TABLE enterprise_contract_amendments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES enterprise_contracts(id),
    
    -- Amendment Details
    amendment_number INTEGER NOT NULL,
    amendment_type VARCHAR(100) NOT NULL, -- 'scope-change', 'pricing-adjustment', 'timeline-extension', 'service-upgrade'
    amendment_title VARCHAR(255) NOT NULL,
    amendment_description TEXT NOT NULL,
    
    -- Financial Impact
    value_change INTEGER DEFAULT 0, -- Positive or negative change in annual value
    effective_date DATE NOT NULL,
    
    -- Approval Requirements
    requires_client_signature BOOLEAN DEFAULT true,
    requires_legal_review BOOLEAN DEFAULT true,
    
    -- Documents
    amendment_document_url VARCHAR(500),
    signed_amendment_url VARCHAR(500),
    
    -- Status & Approval
    status VARCHAR(50) DEFAULT 'draft',
    approved_by_client BOOLEAN DEFAULT false,
    approved_by_legal BOOLEAN DEFAULT false,
    approved_by_finance BOOLEAN DEFAULT false,
    
    -- Audit
    created_by UUID NOT NULL,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_amendment_type CHECK (amendment_type IN ('scope-change', 'pricing-adjustment', 'timeline-extension', 'service-upgrade', 'termination', 'renewal')),
    CONSTRAINT valid_amendment_status CHECK (status IN ('draft', 'pending-approval', 'approved', 'executed', 'rejected'))
);

-- Contract Milestones & Deliverables
CREATE TABLE enterprise_contract_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES enterprise_contracts(id),
    
    -- Milestone Details
    milestone_name VARCHAR(255) NOT NULL,
    milestone_type VARCHAR(100) NOT NULL, -- 'onboarding', 'delivery', 'payment', 'review', 'renewal'
    milestone_description TEXT,
    
    -- Timeline
    planned_date DATE NOT NULL,
    actual_date DATE,
    deadline_date DATE,
    
    -- Dependencies
    depends_on_milestone_ids UUID[],
    
    -- Deliverables
    deliverables JSONB DEFAULT '[]',
    success_criteria JSONB DEFAULT '{}',
    
    -- Payment Terms
    payment_percentage DECIMAL(5,2) DEFAULT 0.0, -- % of contract value
    payment_amount INTEGER DEFAULT 0,
    
    -- Status & Tracking
    status VARCHAR(50) DEFAULT 'planned',
    completion_percentage DECIMAL(5,2) DEFAULT 0.0,
    risk_level VARCHAR(20) DEFAULT 'low',
    
    -- Responsible Parties
    responsible_team VARCHAR(100),
    client_stakeholder JSONB,
    vendor_stakeholder JSONB,
    
    -- Notes & Updates
    notes TEXT,
    last_status_update TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_milestone_type CHECK (milestone_type IN ('onboarding', 'delivery', 'payment', 'review', 'renewal', 'termination')),
    CONSTRAINT valid_milestone_status CHECK (status IN ('planned', 'in-progress', 'completed', 'delayed', 'at-risk', 'cancelled'))
);

-- Billing & Invoicing
CREATE TABLE enterprise_contract_billing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES enterprise_contracts(id),
    
    -- Billing Period
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    
    -- Invoice Details
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    
    -- Financial Details
    base_amount INTEGER NOT NULL,
    adjustments INTEGER DEFAULT 0,
    discounts INTEGER DEFAULT 0,
    penalties INTEGER DEFAULT 0,
    total_amount INTEGER NOT NULL,
    tax_amount INTEGER DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'EUR',
    
    -- Services & Usage
    services_included JSONB NOT NULL,
    usage_metrics JSONB DEFAULT '{}',
    overage_charges INTEGER DEFAULT 0,
    
    -- Payment Status
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(100),
    payment_reference VARCHAR(255),
    payment_date DATE,
    
    -- Documents
    invoice_document_url VARCHAR(500),
    receipt_document_url VARCHAR(500),
    
    -- Notes
    billing_notes TEXT,
    payment_notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'sent', 'overdue', 'paid', 'disputed', 'cancelled'))
);

-- Contract Performance Metrics
CREATE TABLE enterprise_contract_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES enterprise_contracts(id),
    
    -- Performance Period
    measurement_period_start DATE NOT NULL,
    measurement_period_end DATE NOT NULL,
    
    -- SLA Metrics
    uptime_achieved DECIMAL(5,2),
    response_time_avg INTEGER, -- minutes
    resolution_time_avg INTEGER, -- hours
    
    -- Business Metrics
    user_adoption_rate DECIMAL(5,2),
    feature_utilization JSONB,
    roi_achieved DECIMAL(10,2),
    business_objectives_met JSONB,
    
    -- Customer Satisfaction
    csat_score DECIMAL(3,2), -- 1.0 to 5.0
    nps_score INTEGER, -- -100 to 100
    feedback JSONB,
    
    -- Technical Performance
    api_performance_metrics JSONB,
    data_processing_metrics JSONB,
    security_incidents INTEGER DEFAULT 0,
    compliance_violations INTEGER DEFAULT 0,
    
    -- Financial Performance
    budget_utilization DECIMAL(5,2),
    cost_savings_achieved INTEGER,
    additional_revenue INTEGER,
    
    -- Risk Indicators
    escalations_count INTEGER DEFAULT 0,
    critical_issues_count INTEGER DEFAULT 0,
    health_score DECIMAL(3,2) DEFAULT 1.0,
    
    -- Recommendations
    performance_summary TEXT,
    improvement_recommendations TEXT[],
    action_items JSONB DEFAULT '[]',
    
    -- Review
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_enterprise_contracts_tenant ON enterprise_contracts(tenant_id);
CREATE INDEX idx_enterprise_contracts_status ON enterprise_contracts(status, expiration_date);
CREATE INDEX idx_enterprise_contracts_renewal ON enterprise_contracts(renewal_date) WHERE auto_renewal = true;
CREATE INDEX idx_contract_amendments_contract ON enterprise_contract_amendments(contract_id);
CREATE INDEX idx_contract_milestones_contract ON enterprise_contract_milestones(contract_id, planned_date);
CREATE INDEX idx_contract_billing_contract ON enterprise_contract_billing(contract_id, due_date);
CREATE INDEX idx_contract_billing_status ON enterprise_contract_billing(payment_status, due_date);
CREATE INDEX idx_contract_performance_contract ON enterprise_contract_performance(contract_id, measurement_period_end);

-- RLS Policies for Enterprise Contracts
ALTER TABLE enterprise_contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_contract_amendments ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_contract_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_contract_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_contract_performance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (will be expanded based on role structure)
-- Admins can see all contracts
CREATE POLICY "Admins can manage all contracts" ON enterprise_contracts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- CSMs can see contracts they're assigned to
CREATE POLICY "CSMs can manage assigned contracts" ON enterprise_contracts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM enterprise_tenants
            WHERE enterprise_tenants.id = tenant_id
            AND enterprise_tenants.dedicated_csm_id = auth.uid()
        )
    );

-- Grant access to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role; 