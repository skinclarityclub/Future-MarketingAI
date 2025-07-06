-- SOC 2 Compliance Framework Schema
-- Version: 1.0
-- Date: 2025-01-18

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- SOC 2 Controls Master Table
-- =============================================
CREATE TABLE IF NOT EXISTS soc2_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_id VARCHAR(10) NOT NULL UNIQUE, -- CC1.1, CC2.1, etc.
    trust_service_criteria VARCHAR(50) NOT NULL, -- Security, Availability, etc.
    control_name VARCHAR(255) NOT NULL,
    control_description TEXT NOT NULL,
    control_objective TEXT NOT NULL,
    implementation_status VARCHAR(20) DEFAULT 'not_implemented' CHECK (implementation_status IN ('not_implemented', 'in_progress', 'implemented', 'needs_review')),
    risk_level VARCHAR(10) DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    owner_id UUID REFERENCES auth.users(id),
    responsible_party VARCHAR(255),
    implementation_date TIMESTAMP WITH TIME ZONE,
    last_reviewed TIMESTAMP WITH TIME ZONE,
    next_review_date TIMESTAMP WITH TIME ZONE,
    compliance_score INTEGER DEFAULT 0 CHECK (compliance_score >= 0 AND compliance_score <= 100),
    automated_testing BOOLEAN DEFAULT FALSE,
    manual_testing BOOLEAN DEFAULT TRUE,
    testing_frequency VARCHAR(20) DEFAULT 'quarterly' CHECK (testing_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SOC 2 Evidence Collection Table
-- =============================================
CREATE TABLE IF NOT EXISTS soc2_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_id VARCHAR(10) NOT NULL REFERENCES soc2_controls(control_id) ON DELETE CASCADE,
    evidence_type VARCHAR(50) NOT NULL, -- document, screenshot, log, policy, etc.
    evidence_name VARCHAR(255) NOT NULL,
    evidence_description TEXT,
    file_path VARCHAR(500),
    file_hash VARCHAR(64), -- SHA-256 hash for integrity
    file_size INTEGER,
    mime_type VARCHAR(100),
    collection_method VARCHAR(50) DEFAULT 'manual' CHECK (collection_method IN ('manual', 'automated', 'semi_automated')),
    collected_by UUID REFERENCES auth.users(id),
    collection_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    evidence_period_start TIMESTAMP WITH TIME ZONE,
    evidence_period_end TIMESTAMP WITH TIME ZONE,
    retention_date TIMESTAMP WITH TIME ZONE,
    review_status VARCHAR(20) DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected', 'needs_revision')),
    reviewed_by UUID REFERENCES auth.users(id),
    review_date TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    tags TEXT[], -- Array of tags for categorization
    metadata JSONB DEFAULT '{}', -- Flexible metadata storage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SOC 2 Assessment Results Table
-- =============================================
CREATE TABLE IF NOT EXISTS soc2_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_name VARCHAR(255) NOT NULL,
    assessment_type VARCHAR(50) DEFAULT 'internal' CHECK (assessment_type IN ('internal', 'external', 'self_assessment', 'third_party')),
    assessment_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    assessment_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    assessor_name VARCHAR(255),
    assessor_firm VARCHAR(255),
    assessment_status VARCHAR(20) DEFAULT 'in_progress' CHECK (assessment_status IN ('planned', 'in_progress', 'completed', 'draft', 'final')),
    overall_rating VARCHAR(20) CHECK (overall_rating IN ('satisfactory', 'needs_improvement', 'unsatisfactory')),
    executive_summary TEXT,
    key_findings TEXT[],
    recommendations TEXT[],
    management_response TEXT,
    remediation_plan TEXT,
    target_completion_date TIMESTAMP WITH TIME ZONE,
    actual_completion_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SOC 2 Control Testing Results Table
-- =============================================
CREATE TABLE IF NOT EXISTS soc2_control_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES soc2_assessments(id) ON DELETE CASCADE,
    control_id VARCHAR(10) NOT NULL REFERENCES soc2_controls(control_id) ON DELETE CASCADE,
    test_procedure TEXT NOT NULL,
    test_method VARCHAR(50) DEFAULT 'inspection' CHECK (test_method IN ('inspection', 'observation', 'inquiry', 'reperformance', 'analytical')),
    sample_size INTEGER DEFAULT 1,
    test_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tester_name VARCHAR(255),
    test_result VARCHAR(20) DEFAULT 'pending' CHECK (test_result IN ('pending', 'passed', 'failed', 'not_applicable', 'exception')),
    exception_details TEXT,
    root_cause_analysis TEXT,
    management_response TEXT,
    corrective_action TEXT,
    target_remediation_date TIMESTAMP WITH TIME ZONE,
    actual_remediation_date TIMESTAMP WITH TIME ZONE,
    retest_required BOOLEAN DEFAULT FALSE,
    retest_date TIMESTAMP WITH TIME ZONE,
    retest_result VARCHAR(20) CHECK (retest_result IN ('passed', 'failed', 'not_applicable')),
    evidence_references TEXT[],
    risk_rating VARCHAR(10) DEFAULT 'medium' CHECK (risk_rating IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SOC 2 Compliance Metrics Table
-- =============================================
CREATE TABLE IF NOT EXISTS soc2_compliance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
    trust_service_criteria VARCHAR(50) NOT NULL,
    total_controls INTEGER NOT NULL DEFAULT 0,
    implemented_controls INTEGER NOT NULL DEFAULT 0,
    in_progress_controls INTEGER NOT NULL DEFAULT 0,
    not_implemented_controls INTEGER NOT NULL DEFAULT 0,
    needs_review_controls INTEGER NOT NULL DEFAULT 0,
    overall_compliance_percentage DECIMAL(5,2) DEFAULT 0.00,
    high_risk_exceptions INTEGER DEFAULT 0,
    medium_risk_exceptions INTEGER DEFAULT 0,
    low_risk_exceptions INTEGER DEFAULT 0,
    overdue_reviews INTEGER DEFAULT 0,
    evidence_collection_rate DECIMAL(5,2) DEFAULT 0.00,
    automated_testing_coverage DECIMAL(5,2) DEFAULT 0.00,
    manual_testing_coverage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(metric_date, trust_service_criteria)
);

-- =============================================
-- Indexes for Performance
-- =============================================
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_soc2_controls_status ON soc2_controls(implementation_status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_soc2_controls_criteria ON soc2_controls(trust_service_criteria);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_soc2_controls_owner ON soc2_controls(owner_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_soc2_controls_review_date ON soc2_controls(next_review_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_soc2_evidence_control ON soc2_evidence(control_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_soc2_evidence_type ON soc2_evidence(evidence_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_soc2_evidence_status ON soc2_evidence(review_status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_soc2_evidence_collection_date ON soc2_evidence(collection_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_soc2_assessments_period ON soc2_assessments(assessment_period_start, assessment_period_end);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_soc2_assessments_status ON soc2_assessments(assessment_status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_soc2_control_tests_assessment ON soc2_control_tests(assessment_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_soc2_control_tests_control ON soc2_control_tests(control_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_soc2_control_tests_result ON soc2_control_tests(test_result);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_soc2_metrics_date ON soc2_compliance_metrics(metric_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_soc2_metrics_criteria ON soc2_compliance_metrics(trust_service_criteria);

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE soc2_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE soc2_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE soc2_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE soc2_control_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE soc2_compliance_metrics ENABLE ROW LEVEL SECURITY;

-- SOC2 Controls RLS Policies
DROP POLICY IF EXISTS "soc2_controls_select_policy" ON soc2_controls;
CREATE POLICY "soc2_controls_select_policy" ON soc2_controls
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "soc2_controls_insert_policy" ON soc2_controls;
CREATE POLICY "soc2_controls_insert_policy" ON soc2_controls
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "soc2_controls_update_policy" ON soc2_controls;
CREATE POLICY "soc2_controls_update_policy" ON soc2_controls
    FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "soc2_controls_delete_policy" ON soc2_controls;
CREATE POLICY "soc2_controls_delete_policy" ON soc2_controls
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- SOC2 Evidence RLS Policies
DROP POLICY IF EXISTS "soc2_evidence_select_policy" ON soc2_evidence;
CREATE POLICY "soc2_evidence_select_policy" ON soc2_evidence
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "soc2_evidence_insert_policy" ON soc2_evidence;
CREATE POLICY "soc2_evidence_insert_policy" ON soc2_evidence
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "soc2_evidence_update_policy" ON soc2_evidence;
CREATE POLICY "soc2_evidence_update_policy" ON soc2_evidence
    FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "soc2_evidence_delete_policy" ON soc2_evidence;
CREATE POLICY "soc2_evidence_delete_policy" ON soc2_evidence
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- SOC2 Assessments RLS Policies
DROP POLICY IF EXISTS "soc2_assessments_select_policy" ON soc2_assessments;
CREATE POLICY "soc2_assessments_select_policy" ON soc2_assessments
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "soc2_assessments_insert_policy" ON soc2_assessments;
CREATE POLICY "soc2_assessments_insert_policy" ON soc2_assessments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "soc2_assessments_update_policy" ON soc2_assessments;
CREATE POLICY "soc2_assessments_update_policy" ON soc2_assessments
    FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "soc2_assessments_delete_policy" ON soc2_assessments;
CREATE POLICY "soc2_assessments_delete_policy" ON soc2_assessments
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- SOC2 Control Tests RLS Policies
DROP POLICY IF EXISTS "soc2_control_tests_select_policy" ON soc2_control_tests;
CREATE POLICY "soc2_control_tests_select_policy" ON soc2_control_tests
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "soc2_control_tests_insert_policy" ON soc2_control_tests;
CREATE POLICY "soc2_control_tests_insert_policy" ON soc2_control_tests
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "soc2_control_tests_update_policy" ON soc2_control_tests;
CREATE POLICY "soc2_control_tests_update_policy" ON soc2_control_tests
    FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "soc2_control_tests_delete_policy" ON soc2_control_tests;
CREATE POLICY "soc2_control_tests_delete_policy" ON soc2_control_tests
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- SOC2 Compliance Metrics RLS Policies
DROP POLICY IF EXISTS "soc2_compliance_metrics_select_policy" ON soc2_compliance_metrics;
CREATE POLICY "soc2_compliance_metrics_select_policy" ON soc2_compliance_metrics
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "soc2_compliance_metrics_insert_policy" ON soc2_compliance_metrics;
CREATE POLICY "soc2_compliance_metrics_insert_policy" ON soc2_compliance_metrics
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "soc2_compliance_metrics_update_policy" ON soc2_compliance_metrics;
CREATE POLICY "soc2_compliance_metrics_update_policy" ON soc2_compliance_metrics
    FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "soc2_compliance_metrics_delete_policy" ON soc2_compliance_metrics;
CREATE POLICY "soc2_compliance_metrics_delete_policy" ON soc2_compliance_metrics
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- =============================================
-- Database Functions
-- =============================================

-- Function to calculate SOC 2 compliance percentage
CREATE OR REPLACE FUNCTION calculate_soc2_compliance_percentage()
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_controls INTEGER;
    implemented_controls INTEGER;
    compliance_percentage DECIMAL(5,2);
BEGIN
    SELECT COUNT(*) INTO total_controls FROM soc2_controls;
    
    IF total_controls = 0 THEN
        RETURN 0.00;
    END IF;
    
    SELECT COUNT(*) INTO implemented_controls 
    FROM soc2_controls 
    WHERE implementation_status = 'implemented';
    
    compliance_percentage := (implemented_controls::DECIMAL / total_controls::DECIMAL) * 100;
    
    RETURN ROUND(compliance_percentage, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get controls requiring immediate attention or testing
CREATE OR REPLACE FUNCTION get_controls_requiring_testing()
RETURNS TABLE(
    control_id VARCHAR(10),
    control_name VARCHAR(255),
    days_overdue INTEGER,
    risk_level VARCHAR(10)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.control_id,
        c.control_name,
        CASE 
            WHEN c.next_review_date IS NULL THEN 0
            ELSE EXTRACT(DAY FROM (CURRENT_DATE - c.next_review_date))::INTEGER
        END as days_overdue,
        c.risk_level
    FROM soc2_controls c
    WHERE c.implementation_status = 'implemented'
    AND (c.next_review_date IS NULL OR c.next_review_date <= CURRENT_DATE)
    ORDER BY 
        CASE c.risk_level 
            WHEN 'critical' THEN 1 
            WHEN 'high' THEN 2 
            WHEN 'medium' THEN 3 
            WHEN 'low' THEN 4 
        END,
        days_overdue DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate SOC 2 readiness score by criteria
CREATE OR REPLACE FUNCTION calculate_soc2_readiness_score()
RETURNS TABLE(
    trust_service_criteria VARCHAR(50),
    total_controls INTEGER,
    implemented_controls INTEGER,
    readiness_percentage DECIMAL(5,2),
    readiness_status VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.trust_service_criteria,
        COUNT(*)::INTEGER as total_controls,
        COUNT(CASE WHEN c.implementation_status = 'implemented' THEN 1 END)::INTEGER as implemented_controls,
        ROUND(
            (COUNT(CASE WHEN c.implementation_status = 'implemented' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 
            2
        ) as readiness_percentage,
        CASE 
            WHEN ROUND((COUNT(CASE WHEN c.implementation_status = 'implemented' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2) >= 90 THEN 'ready'
            WHEN ROUND((COUNT(CASE WHEN c.implementation_status = 'implemented' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2) >= 70 THEN 'needs_work'
            ELSE 'not_ready'
        END as readiness_status
    FROM soc2_controls c
    GROUP BY c.trust_service_criteria
    ORDER BY readiness_percentage DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update compliance metrics (to be called periodically)
CREATE OR REPLACE FUNCTION update_compliance_metrics()
RETURNS VOID AS $$
DECLARE
    criteria_record RECORD;
    metric_date DATE := CURRENT_DATE;
BEGIN
    -- Delete existing metrics for today to avoid duplicates
    DELETE FROM soc2_compliance_metrics WHERE metric_date = metric_date;
    
    -- Calculate and insert metrics for each trust service criteria
    FOR criteria_record IN 
        SELECT DISTINCT trust_service_criteria FROM soc2_controls
    LOOP
        INSERT INTO soc2_compliance_metrics (
            metric_date,
            trust_service_criteria,
            total_controls,
            implemented_controls,
            in_progress_controls,
            not_implemented_controls,
            needs_review_controls,
            overall_compliance_percentage,
            high_risk_exceptions,
            medium_risk_exceptions,
            low_risk_exceptions,
            overdue_reviews,
            evidence_collection_rate,
            automated_testing_coverage,
            manual_testing_coverage
        )
        SELECT 
            metric_date,
            criteria_record.trust_service_criteria,
            COUNT(*),
            COUNT(CASE WHEN implementation_status = 'implemented' THEN 1 END),
            COUNT(CASE WHEN implementation_status = 'in_progress' THEN 1 END),
            COUNT(CASE WHEN implementation_status = 'not_implemented' THEN 1 END),
            COUNT(CASE WHEN implementation_status = 'needs_review' THEN 1 END),
            ROUND(
                (COUNT(CASE WHEN implementation_status = 'implemented' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 
                2
            ),
            -- High risk exceptions from control tests
            (SELECT COUNT(*) FROM soc2_control_tests ct 
             JOIN soc2_controls c ON ct.control_id = c.control_id 
             WHERE c.trust_service_criteria = criteria_record.trust_service_criteria 
             AND ct.test_result = 'exception' AND ct.risk_rating = 'high'),
            -- Medium risk exceptions
            (SELECT COUNT(*) FROM soc2_control_tests ct 
             JOIN soc2_controls c ON ct.control_id = c.control_id 
             WHERE c.trust_service_criteria = criteria_record.trust_service_criteria 
             AND ct.test_result = 'exception' AND ct.risk_rating = 'medium'),
            -- Low risk exceptions
            (SELECT COUNT(*) FROM soc2_control_tests ct 
             JOIN soc2_controls c ON ct.control_id = c.control_id 
             WHERE c.trust_service_criteria = criteria_record.trust_service_criteria 
             AND ct.test_result = 'exception' AND ct.risk_rating = 'low'),
            -- Overdue reviews
            COUNT(CASE WHEN next_review_date < CURRENT_DATE THEN 1 END),
            -- Evidence collection rate
            ROUND(
                (SELECT COUNT(*)::DECIMAL FROM soc2_evidence e 
                 JOIN soc2_controls c ON e.control_id = c.control_id 
                 WHERE c.trust_service_criteria = criteria_record.trust_service_criteria) / 
                COUNT(*)::DECIMAL * 100, 
                2
            ),
            -- Automated testing coverage
            ROUND(
                (COUNT(CASE WHEN automated_testing = true THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 
                2
            ),
            -- Manual testing coverage
            ROUND(
                (COUNT(CASE WHEN manual_testing = true THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 
                2
            )
        FROM soc2_controls
        WHERE trust_service_criteria = criteria_record.trust_service_criteria;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Database Views
-- =============================================

-- SOC 2 Dashboard View - Summary by criteria
CREATE OR REPLACE VIEW soc2_dashboard AS
SELECT 
    trust_service_criteria,
    COUNT(*) as total_controls,
    COUNT(CASE WHEN implementation_status = 'implemented' THEN 1 END) as implemented_controls,
    COUNT(CASE WHEN implementation_status = 'in_progress' THEN 1 END) as in_progress_controls,
    COUNT(CASE WHEN implementation_status = 'not_implemented' THEN 1 END) as not_implemented_controls,
    COUNT(CASE WHEN implementation_status = 'needs_review' THEN 1 END) as needs_review_controls,
    ROUND(
        (COUNT(CASE WHEN implementation_status = 'implemented' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 
        2
    ) as compliance_percentage,
    COUNT(CASE WHEN next_review_date < CURRENT_DATE THEN 1 END) as overdue_reviews
FROM soc2_controls
GROUP BY trust_service_criteria
ORDER BY trust_service_criteria;

-- SOC 2 Controls Requiring Attention - Controls that need immediate attention or testing
CREATE OR REPLACE VIEW soc2_controls_requiring_attention AS
SELECT 
    c.control_id,
    c.control_name,
    c.trust_service_criteria,
    c.implementation_status,
    c.risk_level,
    c.next_review_date,
    CASE 
        WHEN c.next_review_date IS NULL THEN 'No review date set'
        WHEN c.next_review_date < CURRENT_DATE THEN 'Overdue for review'
        WHEN c.next_review_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'Due soon'
        ELSE 'On track'
    END as review_status,
    CASE 
        WHEN c.next_review_date IS NULL THEN 0
        ELSE EXTRACT(DAY FROM (CURRENT_DATE - c.next_review_date))::INTEGER
    END as days_overdue
FROM soc2_controls c
WHERE c.implementation_status IN ('implemented', 'needs_review')
AND (c.next_review_date IS NULL OR c.next_review_date <= CURRENT_DATE + INTERVAL '7 days')
ORDER BY 
    CASE c.risk_level 
        WHEN 'critical' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 
        WHEN 'low' THEN 4 
    END,
    c.next_review_date ASC NULLS FIRST;

-- SOC 2 Evidence Summary - Evidence collection summary by control
CREATE OR REPLACE VIEW soc2_evidence_summary AS
SELECT 
    c.control_id,
    c.control_name,
    c.trust_service_criteria,
    COUNT(e.id) as total_evidence,
    COUNT(CASE WHEN e.review_status = 'approved' THEN 1 END) as approved_evidence,
    COUNT(CASE WHEN e.review_status = 'pending' THEN 1 END) as pending_evidence,
    COUNT(CASE WHEN e.review_status = 'rejected' THEN 1 END) as rejected_evidence,
    MAX(e.collection_date) as latest_evidence_date
FROM soc2_controls c
LEFT JOIN soc2_evidence e ON c.control_id = e.control_id
GROUP BY c.control_id, c.control_name, c.trust_service_criteria
ORDER BY c.control_id;

-- =============================================
-- Triggers for Automatic Updates
-- =============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
DROP TRIGGER IF EXISTS update_soc2_controls_updated_at ON soc2_controls;
CREATE TRIGGER update_soc2_controls_updated_at
    BEFORE UPDATE ON soc2_controls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_soc2_evidence_updated_at ON soc2_evidence;
CREATE TRIGGER update_soc2_evidence_updated_at
    BEFORE UPDATE ON soc2_evidence
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_soc2_assessments_updated_at ON soc2_assessments;
CREATE TRIGGER update_soc2_assessments_updated_at
    BEFORE UPDATE ON soc2_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_soc2_control_tests_updated_at ON soc2_control_tests;
CREATE TRIGGER update_soc2_control_tests_updated_at
    BEFORE UPDATE ON soc2_control_tests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Initial Data Population Comments
-- =============================================

-- After running this migration, you should populate the soc2_controls table with initial control data
-- You can do this by calling the SOC2ComplianceFramework.initializeControls() method from your application
-- or by running appropriate INSERT statements

-- COMMENT ON TABLE soc2_controls IS 'SOC 2 compliance controls tracking based on Trust Service Criteria';
-- COMMENT ON TABLE soc2_evidence IS 'Evidence collection and management for SOC 2 controls';
-- COMMENT ON TABLE soc2_assessments IS 'SOC 2 assessment history and results';
-- COMMENT ON TABLE soc2_control_tests IS 'Individual control testing results and findings';
-- COMMENT ON TABLE soc2_compliance_metrics IS 'Historical compliance metrics and KPIs';