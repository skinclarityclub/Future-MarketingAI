import { logger } from "@/lib/logger";

export interface DataGovernancePolicy {
  id: string;
  name: string;
  category:
    | "data_quality"
    | "privacy"
    | "retention"
    | "access"
    | "classification"
    | "lineage";
  description: string;
  rules: GovernanceRule[];
  enforcement_level: "mandatory" | "recommended" | "advisory";
  compliance_requirements: string[];
  effective_date: Date;
  review_date: Date;
  version: string;
  owner: string;
  status: "active" | "draft" | "deprecated";
}

export interface GovernanceRule {
  id: string;
  name: string;
  rule_type:
    | "validation"
    | "transformation"
    | "access_control"
    | "retention"
    | "classification";
  condition: string; // SQL-like condition or JSON logic
  action: "allow" | "deny" | "transform" | "alert" | "log";
  severity: "critical" | "high" | "medium" | "low";
  auto_remediation: boolean;
  remediation_action?: string;
  exemptions?: string[];
}

export interface DataLineage {
  data_element_id: string;
  source_system: string;
  target_system: string;
  transformation_steps: TransformationStep[];
  data_flow_path: DataFlowNode[];
  created_at: Date;
  last_updated: Date;
  business_context: string;
  technical_context: string;
  data_classification: DataClassification;
  steward: string;
}

export interface TransformationStep {
  step_id: string;
  transformation_type:
    | "filter"
    | "aggregate"
    | "join"
    | "enrich"
    | "cleanse"
    | "validate";
  description: string;
  input_schema: any;
  output_schema: any;
  business_rules_applied: string[];
  quality_checks: string[];
  timestamp: Date;
}

export interface DataFlowNode {
  node_id: string;
  node_type:
    | "source"
    | "transformation"
    | "storage"
    | "api"
    | "report"
    | "ml_model";
  system_name: string;
  technical_details: any;
  access_controls: string[];
  data_retention_policy: string;
}

export interface DataClassification {
  classification_level: "public" | "internal" | "confidential" | "restricted";
  sensitivity_labels: string[];
  regulatory_requirements: string[];
  handling_instructions: string[];
  retention_period: number; // days
  anonymization_required: boolean;
  encryption_required: boolean;
  access_logging_required: boolean;
}

export interface GovernanceViolation {
  violation_id: string;
  policy_id: string;
  rule_id: string;
  violation_type:
    | "policy_breach"
    | "quality_failure"
    | "access_violation"
    | "retention_violation";
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  data_element_affected: string;
  detected_at: Date;
  remediation_status: "open" | "in_progress" | "resolved" | "accepted_risk";
  remediation_actions: string[];
  business_impact: string;
  compliance_impact: string[];
}

export interface GovernanceDashboard {
  policy_compliance_score: number;
  active_violations: number;
  critical_violations: number;
  data_lineage_coverage: number;
  classification_coverage: number;
  stewardship_coverage: number;
  recent_violations: GovernanceViolation[];
  policy_compliance_by_category: Record<string, number>;
  trends: {
    violation_trend: "improving" | "stable" | "worsening";
    compliance_trend: "improving" | "stable" | "declining";
    coverage_trend: "improving" | "stable" | "declining";
  };
}

export class DataGovernanceFramework {
  private policies: Map<string, DataGovernancePolicy> = new Map();
  private lineageGraph: Map<string, DataLineage> = new Map();
  private violations: Map<string, GovernanceViolation> = new Map();
  private classificationRegistry: Map<string, DataClassification> = new Map();

  constructor() {
    this.initializeDefaultPolicies();
  }

  /**
   * Initialize default governance policies
   */
  private initializeDefaultPolicies(): void {
    const defaultPolicies: DataGovernancePolicy[] = [
      {
        id: "DQ-001",
        name: "Data Quality Standards",
        category: "data_quality",
        description: "Minimum data quality standards for all datasets",
        rules: [
          {
            id: "DQ-001-R01",
            name: "Minimum Completeness",
            rule_type: "validation",
            condition: "completeness_score >= 0.85",
            action: "alert",
            severity: "high",
            auto_remediation: false,
          },
          {
            id: "DQ-001-R02",
            name: "Accuracy Threshold",
            rule_type: "validation",
            condition: "accuracy_score >= 0.90",
            action: "alert",
            severity: "critical",
            auto_remediation: false,
          },
        ],
        enforcement_level: "mandatory",
        compliance_requirements: ["SOX", "GDPR"],
        effective_date: new Date("2024-01-01"),
        review_date: new Date("2024-12-31"),
        version: "1.0",
        owner: "Data Governance Team",
        status: "active",
      },
      {
        id: "PII-001",
        name: "Personal Data Protection",
        category: "privacy",
        description:
          "Protection and handling of personal identifiable information",
        rules: [
          {
            id: "PII-001-R01",
            name: "PII Encryption Requirement",
            rule_type: "validation",
            condition: "contains_pii = true AND encryption_enabled = true",
            action: "deny",
            severity: "critical",
            auto_remediation: true,
            remediation_action: "encrypt_pii_fields",
          },
          {
            id: "PII-001-R02",
            name: "PII Access Logging",
            rule_type: "access_control",
            condition: "accessing_pii = true",
            action: "log",
            severity: "medium",
            auto_remediation: true,
            remediation_action: "log_pii_access",
          },
        ],
        enforcement_level: "mandatory",
        compliance_requirements: ["GDPR", "CCPA"],
        effective_date: new Date("2024-01-01"),
        review_date: new Date("2024-06-30"),
        version: "1.2",
        owner: "Privacy Officer",
        status: "active",
      },
      {
        id: "RET-001",
        name: "Data Retention Policy",
        category: "retention",
        description: "Data retention and disposal policies",
        rules: [
          {
            id: "RET-001-R01",
            name: "Customer Data Retention",
            rule_type: "retention",
            condition: 'data_type = "customer" AND age_days > 2555', // 7 years
            action: "alert",
            severity: "medium",
            auto_remediation: false,
          },
          {
            id: "RET-001-R02",
            name: "Marketing Data Retention",
            rule_type: "retention",
            condition: 'data_type = "marketing" AND age_days > 730', // 2 years
            action: "alert",
            severity: "low",
            auto_remediation: true,
            remediation_action: "archive_or_delete",
          },
        ],
        enforcement_level: "mandatory",
        compliance_requirements: ["GDPR", "CCPA", "SOX"],
        effective_date: new Date("2024-01-01"),
        review_date: new Date("2024-12-31"),
        version: "1.0",
        owner: "Legal Team",
        status: "active",
      },
      {
        id: "CLASS-001",
        name: "Data Classification Requirements",
        category: "classification",
        description: "Mandatory data classification for all datasets",
        rules: [
          {
            id: "CLASS-001-R01",
            name: "Classification Required",
            rule_type: "validation",
            condition: "classification_level IS NOT NULL",
            action: "deny",
            severity: "high",
            auto_remediation: false,
          },
          {
            id: "CLASS-001-R02",
            name: "Restricted Data Handling",
            rule_type: "access_control",
            condition: 'classification_level = "restricted"',
            action: "log",
            severity: "critical",
            auto_remediation: true,
            remediation_action: "enforce_restricted_access",
          },
        ],
        enforcement_level: "mandatory",
        compliance_requirements: ["ISO27001", "SOC2"],
        effective_date: new Date("2024-01-01"),
        review_date: new Date("2024-12-31"),
        version: "1.0",
        owner: "Information Security Team",
        status: "active",
      },
    ];

    defaultPolicies.forEach(policy => {
      this.policies.set(policy.id, policy);
    });
  }

  /**
   * Evaluate governance policies against data
   */
  async evaluateGovernancePolicies(
    data: any[],
    dataSource: string,
    dataType: string,
    context: any = {}
  ): Promise<{
    compliance_status: "compliant" | "non_compliant" | "warnings";
    violations: GovernanceViolation[];
    remediation_actions: string[];
    policy_results: Array<{
      policy_id: string;
      policy_name: string;
      compliance_score: number;
      rules_passed: number;
      rules_failed: number;
    }>;
  }> {
    const violations: GovernanceViolation[] = [];
    const remediationActions: string[] = [];
    const policyResults: Array<{
      policy_id: string;
      policy_name: string;
      compliance_score: number;
      rules_passed: number;
      rules_failed: number;
    }> = [];

    // Evaluate each active policy
    for (const policy of this.policies.values()) {
      if (policy.status !== "active") continue;

      const policyResult = await this.evaluatePolicy(
        policy,
        data,
        dataSource,
        dataType,
        context
      );
      policyResults.push(policyResult);

      // Collect violations
      if (policyResult.rules_failed > 0) {
        const policyViolations = await this.generatePolicyViolations(
          policy,
          data,
          dataSource,
          policyResult
        );
        violations.push(...policyViolations);
      }
    }

    // Determine overall compliance status
    const criticalViolations = violations.filter(
      v => v.severity === "critical"
    ).length;
    const highViolations = violations.filter(v => v.severity === "high").length;

    let complianceStatus: "compliant" | "non_compliant" | "warnings" =
      "compliant";
    if (criticalViolations > 0) {
      complianceStatus = "non_compliant";
    } else if (highViolations > 0 || violations.length > 0) {
      complianceStatus = "warnings";
    }

    // Generate remediation actions
    violations.forEach(violation => {
      if (violation.remediation_actions.length > 0) {
        remediationActions.push(...violation.remediation_actions);
      }
    });

    // Store violations
    violations.forEach(violation => {
      this.violations.set(violation.violation_id, violation);
    });

    logger.info(`Governance evaluation completed for ${dataSource}`, {
      compliance_status: complianceStatus,
      violations_count: violations.length,
      critical_violations: criticalViolations,
    });

    return {
      compliance_status: complianceStatus,
      violations,
      remediation_actions: [...new Set(remediationActions)],
      policy_results: policyResults,
    };
  }

  /**
   * Evaluate individual policy
   */
  private async evaluatePolicy(
    policy: DataGovernancePolicy,
    data: any[],
    dataSource: string,
    dataType: string,
    context: any
  ): Promise<{
    policy_id: string;
    policy_name: string;
    compliance_score: number;
    rules_passed: number;
    rules_failed: number;
  }> {
    let rulesPassed = 0;
    let rulesFailed = 0;

    for (const rule of policy.rules) {
      const ruleResult = await this.evaluateRule(
        rule,
        data,
        dataSource,
        dataType,
        context
      );
      if (ruleResult.passed) {
        rulesPassed++;
      } else {
        rulesFailed++;
      }
    }

    const complianceScore =
      policy.rules.length > 0 ? rulesPassed / policy.rules.length : 1;

    return {
      policy_id: policy.id,
      policy_name: policy.name,
      compliance_score: complianceScore,
      rules_passed: rulesPassed,
      rules_failed: rulesFailed,
    };
  }

  /**
   * Evaluate individual rule
   */
  private async evaluateRule(
    rule: GovernanceRule,
    data: any[],
    dataSource: string,
    dataType: string,
    context: any
  ): Promise<{ passed: boolean; details: any }> {
    try {
      switch (rule.rule_type) {
        case "validation":
          return this.evaluateValidationRule(rule, data, context);
        case "access_control":
          return this.evaluateAccessControlRule(rule, context);
        case "retention":
          return this.evaluateRetentionRule(rule, data, context);
        case "classification":
          return this.evaluateClassificationRule(rule, data, context);
        case "transformation":
          return this.evaluateTransformationRule(rule, data, context);
        default:
          logger.warn(`Unknown rule type: ${rule.rule_type}`);
          return {
            passed: true,
            details: { message: "Unknown rule type, skipped" },
          };
      }
    } catch (error) {
      logger.error(`Error evaluating rule ${rule.id}`, { error });
      return { passed: false, details: { error: error.message } };
    }
  }

  /**
   * Track data lineage
   */
  async trackDataLineage(
    dataElementId: string,
    sourceSystem: string,
    targetSystem: string,
    transformationSteps: TransformationStep[],
    businessContext: string,
    dataClassification: DataClassification,
    steward: string
  ): Promise<void> {
    const lineage: DataLineage = {
      data_element_id: dataElementId,
      source_system: sourceSystem,
      target_system: targetSystem,
      transformation_steps: transformationSteps,
      data_flow_path: this.generateDataFlowPath(
        sourceSystem,
        targetSystem,
        transformationSteps
      ),
      created_at: new Date(),
      last_updated: new Date(),
      business_context: businessContext,
      technical_context: JSON.stringify({ transformationSteps }),
      data_classification: dataClassification,
      steward: steward,
    };

    this.lineageGraph.set(dataElementId, lineage);

    logger.info(`Data lineage tracked for ${dataElementId}`, {
      source: sourceSystem,
      target: targetSystem,
      transformations: transformationSteps.length,
    });
  }

  /**
   * Generate governance dashboard data
   */
  async generateGovernanceDashboard(): Promise<GovernanceDashboard> {
    const activeViolations = Array.from(this.violations.values()).filter(
      v =>
        v.remediation_status === "open" ||
        v.remediation_status === "in_progress"
    );

    const criticalViolations = activeViolations.filter(
      v => v.severity === "critical"
    );

    const totalPolicies = this.policies.size;
    const activePolicies = Array.from(this.policies.values()).filter(
      p => p.status === "active"
    );

    // Calculate compliance scores by category
    const complianceByCategory: Record<string, number> = {};
    const categories = [
      "data_quality",
      "privacy",
      "retention",
      "access",
      "classification",
      "lineage",
    ];

    categories.forEach(category => {
      const categoryPolicies = activePolicies.filter(
        p => p.category === category
      );
      if (categoryPolicies.length > 0) {
        // Simplified compliance calculation
        const categoryViolations = activeViolations.filter(v =>
          categoryPolicies.some(p => p.id === v.policy_id)
        );
        complianceByCategory[category] = Math.max(
          0,
          1 - categoryViolations.length / categoryPolicies.length
        );
      } else {
        complianceByCategory[category] = 1;
      }
    });

    const overallComplianceScore =
      Object.values(complianceByCategory).reduce(
        (sum, score) => sum + score,
        0
      ) / Object.keys(complianceByCategory).length;

    const lineageCoverage = this.calculateLineageCoverage();
    const classificationCoverage = this.calculateClassificationCoverage();
    const stewardshipCoverage = this.calculateStewardshipCoverage();

    return {
      policy_compliance_score: overallComplianceScore,
      active_violations: activeViolations.length,
      critical_violations: criticalViolations.length,
      data_lineage_coverage: lineageCoverage,
      classification_coverage: classificationCoverage,
      stewardship_coverage: stewardshipCoverage,
      recent_violations: activeViolations
        .slice(-10)
        .sort((a, b) => b.detected_at.getTime() - a.detected_at.getTime()),
      policy_compliance_by_category: complianceByCategory,
      trends: {
        violation_trend: this.calculateViolationTrend(),
        compliance_trend: this.calculateComplianceTrend(),
        coverage_trend: this.calculateCoverageTrend(),
      },
    };
  }

  /**
   * Classify data automatically
   */
  async classifyData(
    data: any[],
    dataSource: string,
    dataType: string
  ): Promise<DataClassification> {
    const classification: DataClassification = {
      classification_level: "internal", // default
      sensitivity_labels: [],
      regulatory_requirements: [],
      handling_instructions: [],
      retention_period: 365, // default 1 year
      anonymization_required: false,
      encryption_required: false,
      access_logging_required: false,
    };

    // Analyze data for PII and sensitive information
    const piiDetected = this.detectPII(data);
    const financialDataDetected = this.detectFinancialData(data);
    const healthDataDetected = this.detectHealthData(data);

    // Determine classification level
    if (piiDetected || financialDataDetected || healthDataDetected) {
      classification.classification_level = "confidential";
      classification.encryption_required = true;
      classification.access_logging_required = true;
    }

    // Add sensitivity labels
    if (piiDetected) {
      classification.sensitivity_labels.push("PII");
      classification.regulatory_requirements.push("GDPR", "CCPA");
      classification.anonymization_required = true;
      classification.retention_period = 2555; // 7 years for customer data
    }

    if (financialDataDetected) {
      classification.sensitivity_labels.push("Financial");
      classification.regulatory_requirements.push("SOX", "PCI-DSS");
      classification.retention_period = 2555; // 7 years for financial data
    }

    if (healthDataDetected) {
      classification.sensitivity_labels.push("Health");
      classification.regulatory_requirements.push("HIPAA");
      classification.classification_level = "restricted";
    }

    // Store classification
    this.classificationRegistry.set(
      `${dataSource}:${dataType}`,
      classification
    );

    return classification;
  }

  // Helper methods for rule evaluation
  private evaluateValidationRule(
    rule: GovernanceRule,
    data: any[],
    context: any
  ): { passed: boolean; details: any } {
    // Simplified rule evaluation - in production would use proper expression evaluator
    try {
      // Extract variables from condition and context
      const condition = rule.condition.toLowerCase();

      if (condition.includes("completeness_score")) {
        const threshold = parseFloat(
          condition.split(">=")[1]?.trim() || "0.85"
        );
        const completenessScore = context.quality_scores?.completeness || 0.5;
        return {
          passed: completenessScore >= threshold,
          details: { completeness_score: completenessScore, threshold },
        };
      }

      if (condition.includes("accuracy_score")) {
        const threshold = parseFloat(
          condition.split(">=")[1]?.trim() || "0.90"
        );
        const accuracyScore = context.quality_scores?.accuracy || 0.5;
        return {
          passed: accuracyScore >= threshold,
          details: { accuracy_score: accuracyScore, threshold },
        };
      }

      // Default pass for unknown conditions
      return {
        passed: true,
        details: { message: "Rule evaluation not implemented" },
      };
    } catch (error) {
      return { passed: false, details: { error: error.message } };
    }
  }

  private evaluateAccessControlRule(
    rule: GovernanceRule,
    context: any
  ): { passed: boolean; details: any } {
    // Implement access control rule evaluation
    return {
      passed: true,
      details: { message: "Access control evaluation placeholder" },
    };
  }

  private evaluateRetentionRule(
    rule: GovernanceRule,
    data: any[],
    context: any
  ): { passed: boolean; details: any } {
    // Implement retention rule evaluation
    return {
      passed: true,
      details: { message: "Retention rule evaluation placeholder" },
    };
  }

  private evaluateClassificationRule(
    rule: GovernanceRule,
    data: any[],
    context: any
  ): { passed: boolean; details: any } {
    // Check if data is properly classified
    const hasClassification = context.data_classification !== undefined;
    return {
      passed: hasClassification,
      details: { has_classification: hasClassification },
    };
  }

  private evaluateTransformationRule(
    rule: GovernanceRule,
    data: any[],
    context: any
  ): { passed: boolean; details: any } {
    // Implement transformation rule evaluation
    return {
      passed: true,
      details: { message: "Transformation rule evaluation placeholder" },
    };
  }

  private async generatePolicyViolations(
    policy: DataGovernancePolicy,
    data: any[],
    dataSource: string,
    policyResult: any
  ): Promise<GovernanceViolation[]> {
    const violations: GovernanceViolation[] = [];

    // Generate violation for each failed rule
    for (const rule of policy.rules) {
      const ruleResult = await this.evaluateRule(
        rule,
        data,
        dataSource,
        "",
        {}
      );
      if (!ruleResult.passed) {
        const violation: GovernanceViolation = {
          violation_id: `${policy.id}-${rule.id}-${Date.now()}`,
          policy_id: policy.id,
          rule_id: rule.id,
          violation_type: this.determineViolationType(rule.rule_type),
          severity: rule.severity,
          description: `Rule "${rule.name}" failed: ${JSON.stringify(ruleResult.details)}`,
          data_element_affected: dataSource,
          detected_at: new Date(),
          remediation_status: "open",
          remediation_actions:
            rule.auto_remediation && rule.remediation_action
              ? [rule.remediation_action]
              : [],
          business_impact: this.assessBusinessImpact(rule.severity),
          compliance_impact: policy.compliance_requirements,
        };
        violations.push(violation);
      }
    }

    return violations;
  }

  private determineViolationType(
    ruleType: string
  ): GovernanceViolation["violation_type"] {
    switch (ruleType) {
      case "validation":
        return "quality_failure";
      case "access_control":
        return "access_violation";
      case "retention":
        return "retention_violation";
      default:
        return "policy_breach";
    }
  }

  private assessBusinessImpact(severity: string): string {
    switch (severity) {
      case "critical":
        return "High - Immediate business risk";
      case "high":
        return "Medium - Potential compliance issues";
      case "medium":
        return "Low - Process improvement needed";
      default:
        return "Minimal - Monitoring recommended";
    }
  }

  private generateDataFlowPath(
    sourceSystem: string,
    targetSystem: string,
    transformationSteps: TransformationStep[]
  ): DataFlowNode[] {
    const nodes: DataFlowNode[] = [];

    // Source node
    nodes.push({
      node_id: `source-${sourceSystem}`,
      node_type: "source",
      system_name: sourceSystem,
      technical_details: {},
      access_controls: [],
      data_retention_policy: "standard",
    });

    // Transformation nodes
    transformationSteps.forEach((step, index) => {
      nodes.push({
        node_id: `transform-${index}`,
        node_type: "transformation",
        system_name: step.transformation_type,
        technical_details: { step },
        access_controls: [],
        data_retention_policy: "processing",
      });
    });

    // Target node
    nodes.push({
      node_id: `target-${targetSystem}`,
      node_type: "storage",
      system_name: targetSystem,
      technical_details: {},
      access_controls: [],
      data_retention_policy: "standard",
    });

    return nodes;
  }

  // Coverage calculation methods
  private calculateLineageCoverage(): number {
    // Simplified calculation - in production would compare against all data elements
    const totalDataElements = 100; // Placeholder
    const trackedElements = this.lineageGraph.size;
    return Math.min(1, trackedElements / totalDataElements);
  }

  private calculateClassificationCoverage(): number {
    // Simplified calculation
    const totalDataSources = 50; // Placeholder
    const classifiedSources = this.classificationRegistry.size;
    return Math.min(1, classifiedSources / totalDataSources);
  }

  private calculateStewardshipCoverage(): number {
    // Simplified calculation
    const lineageWithStewards = Array.from(this.lineageGraph.values()).filter(
      l => l.steward && l.steward.trim() !== ""
    ).length;
    const totalLineage = this.lineageGraph.size;
    return totalLineage > 0 ? lineageWithStewards / totalLineage : 0;
  }

  // Trend calculation methods
  private calculateViolationTrend(): "improving" | "stable" | "worsening" {
    // Simplified trend calculation
    return "stable"; // Placeholder
  }

  private calculateComplianceTrend(): "improving" | "stable" | "declining" {
    // Simplified trend calculation
    return "stable"; // Placeholder
  }

  private calculateCoverageTrend(): "improving" | "stable" | "declining" {
    // Simplified trend calculation
    return "improving"; // Placeholder
  }

  // Data detection methods
  private detectPII(data: any[]): boolean {
    const piiFields = [
      "email",
      "phone",
      "ssn",
      "passport",
      "drivers_license",
      "credit_card",
    ];

    return data.some(record =>
      Object.keys(record).some(field =>
        piiFields.some(piiField => field.toLowerCase().includes(piiField))
      )
    );
  }

  private detectFinancialData(data: any[]): boolean {
    const financialFields = [
      "account_number",
      "routing_number",
      "iban",
      "swift",
      "revenue",
      "profit",
      "expense",
    ];

    return data.some(record =>
      Object.keys(record).some(field =>
        financialFields.some(finField => field.toLowerCase().includes(finField))
      )
    );
  }

  private detectHealthData(data: any[]): boolean {
    const healthFields = [
      "diagnosis",
      "medical",
      "health",
      "patient",
      "treatment",
      "medication",
    ];

    return data.some(record =>
      Object.keys(record).some(field =>
        healthFields.some(healthField =>
          field.toLowerCase().includes(healthField)
        )
      )
    );
  }

  // Public API methods
  public async addPolicy(policy: DataGovernancePolicy): Promise<void> {
    this.policies.set(policy.id, policy);
    logger.info(`Added governance policy: ${policy.name}`);
  }

  public async updatePolicy(
    policyId: string,
    updates: Partial<DataGovernancePolicy>
  ): Promise<void> {
    const existingPolicy = this.policies.get(policyId);
    if (existingPolicy) {
      const updatedPolicy = { ...existingPolicy, ...updates };
      this.policies.set(policyId, updatedPolicy);
      logger.info(`Updated governance policy: ${policyId}`);
    }
  }

  public async getPolicy(
    policyId: string
  ): Promise<DataGovernancePolicy | undefined> {
    return this.policies.get(policyId);
  }

  public async getAllPolicies(): Promise<DataGovernancePolicy[]> {
    return Array.from(this.policies.values());
  }

  public async getViolations(
    status?: GovernanceViolation["remediation_status"]
  ): Promise<GovernanceViolation[]> {
    const violations = Array.from(this.violations.values());
    return status
      ? violations.filter(v => v.remediation_status === status)
      : violations;
  }

  public async resolveViolation(
    violationId: string,
    remediationNote: string
  ): Promise<void> {
    const violation = this.violations.get(violationId);
    if (violation) {
      violation.remediation_status = "resolved";
      violation.remediation_actions.push(`Resolved: ${remediationNote}`);
      this.violations.set(violationId, violation);
      logger.info(`Resolved governance violation: ${violationId}`);
    }
  }

  public async getDataLineage(
    dataElementId: string
  ): Promise<DataLineage | undefined> {
    return this.lineageGraph.get(dataElementId);
  }

  public async getAllDataLineage(): Promise<DataLineage[]> {
    return Array.from(this.lineageGraph.values());
  }

  public async getDataClassification(
    dataSource: string,
    dataType: string
  ): Promise<DataClassification | undefined> {
    return this.classificationRegistry.get(`${dataSource}:${dataType}`);
  }
}
