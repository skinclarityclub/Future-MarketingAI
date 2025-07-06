// Campaign Performance Service
// Provides utilities for A/B testing, campaign tracking, and approval workflows

export interface CampaignMetrics {
  id: string;
  name: string;
  status: "active" | "paused" | "completed" | "draft";
  platform: string;
  start_date: string;
  end_date?: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  conversion_rate: number;
  cpa: number;
  roas: number;
  roi: number;
  ab_tests: ABTest[];
  approval_status: "pending" | "approved" | "rejected" | "needs_review";
  last_updated: string;
}

export interface ABTest {
  id: string;
  name: string;
  campaign_id: string;
  status: "draft" | "running" | "completed" | "paused";
  variants: ABVariant[];
  test_type: "subject_line" | "content" | "creative" | "audience" | "timing";
  start_date: string;
  end_date?: string;
  sample_size: number;
  significance_level: number;
  current_significance?: number;
  confidence_level?: number;
  winner?: string;
  created_at: string;
  updated_at: string;
}

export interface ABVariant {
  id: string;
  name: string;
  traffic_split: number;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    conversion_rate: number;
    cost: number;
    revenue: number;
    roi: number;
  };
  content?: {
    subject_line?: string;
    headline?: string;
    description?: string;
    cta_text?: string;
    creative_url?: string;
  };
}

export interface ContentApproval {
  id: string;
  campaign_id: string;
  content_type: "creative" | "copy" | "subject_line" | "landing_page";
  content_preview: string;
  status: "pending" | "approved" | "rejected" | "needs_revision";
  submitted_by: string;
  submitted_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  feedback?: string;
  revision_count: number;
  auto_approval_eligible: boolean;
  approval_rules_met: string[];
  approval_rules_failed: string[];
}

export interface ApprovalRule {
  id: string;
  name: string;
  description: string;
  rule_type:
    | "brand_guidelines"
    | "legal_compliance"
    | "technical_requirements"
    | "content_standards";
  auto_check: boolean;
  required_for_auto_approval: boolean;
  check_function?: (content: any) => boolean;
}

// A/B Test Statistical Functions
export class ABTestingService {
  /**
   * Calculate statistical significance for A/B test variants
   */
  static calculateSignificance(
    controlConversions: number,
    controlVisitors: number,
    variantConversions: number,
    variantVisitors: number
  ): number {
    const p1 = controlConversions / controlVisitors;
    const p2 = variantConversions / variantVisitors;

    const pPooled =
      (controlConversions + variantConversions) /
      (controlVisitors + variantVisitors);
    const seDiff = Math.sqrt(
      pPooled * (1 - pPooled) * (1 / controlVisitors + 1 / variantVisitors)
    );

    const zScore = (p2 - p1) / seDiff;

    // Convert z-score to significance level (approximate)
    const significance = (1 - this.normalCDF(Math.abs(zScore))) * 2;
    return Math.max(0, Math.min(100, (1 - significance) * 100));
  }

  /**
   * Determine if test has reached statistical significance
   */
  static hasReachedSignificance(
    test: ABTest,
    requiredSignificance: number = 95
  ): boolean {
    if (test.variants.length < 2) return false;

    const control = test.variants[0];
    const variant = test.variants[1];

    const significance = this.calculateSignificance(
      control.metrics.conversions,
      control.metrics.impressions,
      variant.metrics.conversions,
      variant.metrics.impressions
    );

    return significance >= requiredSignificance;
  }

  /**
   * Calculate confidence interval for conversion rate
   */
  static calculateConfidenceInterval(
    conversions: number,
    visitors: number,
    confidenceLevel: number = 95
  ): { lower: number; upper: number } {
    const p = conversions / visitors;
    const z = this.getZScore(confidenceLevel);
    const se = Math.sqrt((p * (1 - p)) / visitors);

    return {
      lower: Math.max(0, p - z * se),
      upper: Math.min(1, p + z * se),
    };
  }

  /**
   * Recommend test duration based on traffic and minimum detectable effect
   */
  static recommendTestDuration(
    baselineConversionRate: number,
    minDetectableEffect: number,
    weeklyTraffic: number,
    significanceLevel: number = 95,
    power: number = 80
  ): number {
    const alpha = (100 - significanceLevel) / 100;
    const beta = (100 - power) / 100;

    const p1 = baselineConversionRate;
    const p2 = baselineConversionRate * (1 + minDetectableEffect);

    const zAlpha = this.getZScore(significanceLevel);
    const zBeta = this.getZScore(power);

    const samplesPerVariant =
      (Math.pow(zAlpha + zBeta, 2) * (p1 * (1 - p1) + p2 * (1 - p2))) /
      Math.pow(p2 - p1, 2);

    const totalSamples = samplesPerVariant * 2;
    const weeksNeeded = totalSamples / weeklyTraffic;

    return Math.ceil(weeksNeeded);
  }

  /**
   * Determine winning variant based on statistical significance
   */
  static determineWinner(test: ABTest): string | null {
    if (!this.hasReachedSignificance(test)) return null;

    // Find variant with highest conversion rate
    return test.variants.reduce((best, current) =>
      current.metrics.conversion_rate > best.metrics.conversion_rate
        ? current
        : best
    ).id;
  }

  // Helper functions
  private static normalCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  private static erf(x: number): number {
    // Abramowitz and Stegun approximation
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y =
      1.0 -
      ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  private static getZScore(confidenceLevel: number): number {
    const alpha = (100 - confidenceLevel) / 100;
    const lookup: { [key: number]: number } = {
      0.1: 1.645, // 90%
      0.05: 1.96, // 95%
      0.01: 2.576, // 99%
    };
    return lookup[alpha] || 1.96;
  }
}

// Content Approval Workflow Service
export class ApprovalWorkflowService {
  private static approvalRules: ApprovalRule[] = [
    {
      id: "brand-voice",
      name: "Brand Voice Guidelines",
      description: "Content follows established brand voice and tone",
      rule_type: "brand_guidelines",
      auto_check: true,
      required_for_auto_approval: true,
      check_function: (content: any) => {
        // Simple brand voice check - in reality would use NLP
        const brandKeywords = [
          "innovative",
          "reliable",
          "premium",
          "customer-focused",
        ];
        const text = content.content_preview?.toLowerCase() || "";
        return brandKeywords.some(keyword => text.includes(keyword));
      },
    },
    {
      id: "legal-compliance",
      name: "Legal Compliance",
      description: "Content meets legal and regulatory requirements",
      rule_type: "legal_compliance",
      auto_check: true,
      required_for_auto_approval: true,
      check_function: (content: any) => {
        const text = content.content_preview?.toLowerCase() || "";
        const prohibitedTerms = [
          "guaranteed",
          "100% effective",
          "miracle",
          "instant",
        ];
        return !prohibitedTerms.some(term => text.includes(term));
      },
    },
    {
      id: "length-requirements",
      name: "Length Requirements",
      description: "Content meets minimum and maximum length requirements",
      rule_type: "technical_requirements",
      auto_check: true,
      required_for_auto_approval: false,
      check_function: (content: any) => {
        const text = content.content_preview || "";
        const requirements = {
          subject_line: { min: 10, max: 60 },
          copy: { min: 50, max: 500 },
          creative: { min: 20, max: 200 },
          landing_page: { min: 100, max: 1000 },
        };

        const req =
          requirements[content.content_type as keyof typeof requirements];
        if (!req) return true;

        return text.length >= req.min && text.length <= req.max;
      },
    },
    {
      id: "accessibility-standards",
      name: "Accessibility Standards",
      description: "Content meets accessibility guidelines",
      rule_type: "technical_requirements",
      auto_check: false,
      required_for_auto_approval: true,
    },
    {
      id: "mobile-responsiveness",
      name: "Mobile Responsiveness",
      description: "Content is optimized for mobile devices",
      rule_type: "technical_requirements",
      auto_check: false,
      required_for_auto_approval: false,
    },
  ];

  /**
   * Evaluate content against approval rules
   */
  static evaluateContent(content: Partial<ContentApproval>): {
    rules_met: string[];
    rules_failed: string[];
    auto_approval_eligible: boolean;
  } {
    const rulesMet: string[] = [];
    const rulesFailed: string[] = [];

    for (const rule of this.approvalRules) {
      if (rule.auto_check && rule.check_function) {
        const passed = rule.check_function(content);
        if (passed) {
          rulesMet.push(rule.name);
        } else {
          rulesFailed.push(rule.name);
        }
      }
    }

    // Check if eligible for auto-approval
    const requiredRules = this.approvalRules
      .filter(rule => rule.required_for_auto_approval)
      .map(rule => rule.name);

    const autoApprovalEligible =
      requiredRules.every(ruleName => rulesMet.includes(ruleName)) &&
      rulesFailed.length === 0;

    return {
      rules_met: rulesMet,
      rules_failed: rulesFailed,
      auto_approval_eligible: autoApprovalEligible,
    };
  }

  /**
   * Process approval submission
   */
  static async processApproval(
    content: Partial<ContentApproval>
  ): Promise<ContentApproval> {
    const evaluation = this.evaluateContent(content);

    const approval: ContentApproval = {
      id: `app-${Date.now()}`,
      campaign_id: content.campaign_id || "",
      content_type: content.content_type || "copy",
      content_preview: content.content_preview || "",
      status: evaluation.auto_approval_eligible ? "approved" : "pending",
      submitted_by: content.submitted_by || "User",
      submitted_at: new Date().toISOString(),
      revision_count: 0,
      auto_approval_eligible: evaluation.auto_approval_eligible,
      approval_rules_met: evaluation.rules_met,
      approval_rules_failed: evaluation.rules_failed,
    };

    if (evaluation.auto_approval_eligible) {
      approval.reviewed_by = "Auto-Approval System";
      approval.reviewed_at = new Date().toISOString();
      approval.feedback = "Automatically approved based on predefined rules";
    }

    return approval;
  }

  /**
   * Calculate approval workflow metrics
   */
  static calculateWorkflowMetrics(approvals: ContentApproval[]): {
    total_submissions: number;
    approval_rate: number;
    auto_approval_rate: number;
    avg_review_time_hours: number;
    revision_rate: number;
  } {
    const totalSubmissions = approvals.length;
    const approved = approvals.filter(a => a.status === "approved").length;
    const autoApproved = approvals.filter(
      a => a.auto_approval_eligible && a.status === "approved"
    ).length;
    const withRevisions = approvals.filter(a => a.revision_count > 0).length;

    // Calculate average review time
    const reviewedApprovals = approvals.filter(
      a => a.reviewed_at && a.submitted_at
    );
    const avgReviewTime =
      reviewedApprovals.reduce((sum, approval) => {
        const submitted = new Date(approval.submitted_at).getTime();
        const reviewed = new Date(approval.reviewed_at!).getTime();
        return sum + (reviewed - submitted);
      }, 0) / reviewedApprovals.length;

    return {
      total_submissions: totalSubmissions,
      approval_rate:
        totalSubmissions > 0 ? (approved / totalSubmissions) * 100 : 0,
      auto_approval_rate:
        totalSubmissions > 0 ? (autoApproved / totalSubmissions) * 100 : 0,
      avg_review_time_hours: avgReviewTime
        ? avgReviewTime / (1000 * 60 * 60)
        : 0,
      revision_rate:
        totalSubmissions > 0 ? (withRevisions / totalSubmissions) * 100 : 0,
    };
  }

  /**
   * Get approval rules
   */
  static getApprovalRules(): ApprovalRule[] {
    return [...this.approvalRules];
  }

  /**
   * Add or update approval rule
   */
  static updateApprovalRule(rule: ApprovalRule): void {
    const index = this.approvalRules.findIndex(r => r.id === rule.id);
    if (index >= 0) {
      this.approvalRules[index] = rule;
    } else {
      this.approvalRules.push(rule);
    }
  }
}

// Campaign Performance Calculation Service
export class CampaignPerformanceService {
  /**
   * Calculate comprehensive campaign metrics
   */
  static calculateCampaignMetrics(rawData: {
    budget: number;
    spent: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  }): Partial<CampaignMetrics> {
    const { budget, spent, impressions, clicks, conversions, revenue } =
      rawData;

    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
    const cpa = conversions > 0 ? spent / conversions : 0;
    const roas = spent > 0 ? revenue / spent : 0;
    const roi = spent > 0 ? ((revenue - spent) / spent) * 100 : 0;

    return {
      budget,
      spent,
      impressions,
      clicks,
      conversions,
      ctr: Number(ctr.toFixed(2)),
      conversion_rate: Number(conversionRate.toFixed(2)),
      cpa: Number(cpa.toFixed(2)),
      roas: Number(roas.toFixed(2)),
      roi: Number(roi.toFixed(1)),
    };
  }

  /**
   * Generate performance recommendations
   */
  static generateRecommendations(campaign: CampaignMetrics): string[] {
    const recommendations: string[] = [];

    // CTR recommendations
    if (campaign.ctr < 1.0) {
      recommendations.push(
        "Consider improving ad creative or targeting to increase click-through rate"
      );
    }

    // Conversion rate recommendations
    if (campaign.conversion_rate < 2.0) {
      recommendations.push(
        "Review landing page experience and consider A/B testing different approaches"
      );
    }

    // Budget utilization
    const budgetUtilization = (campaign.spent / campaign.budget) * 100;
    if (budgetUtilization < 50) {
      recommendations.push(
        "Consider increasing bid strategy or expanding targeting to utilize more budget"
      );
    } else if (budgetUtilization > 90) {
      recommendations.push(
        "Monitor budget closely or consider increasing budget for high-performing campaign"
      );
    }

    // ROI optimization
    if (campaign.roi < 100) {
      recommendations.push(
        "Campaign ROI is below target - consider pausing or optimizing targeting"
      );
    } else if (campaign.roi > 300) {
      recommendations.push(
        "Excellent ROI - consider scaling this campaign with additional budget"
      );
    }

    return recommendations;
  }

  /**
   * Calculate campaign health score (0-100)
   */
  static calculateHealthScore(campaign: CampaignMetrics): number {
    let score = 0;

    // CTR score (0-25 points)
    if (campaign.ctr >= 3.0) score += 25;
    else if (campaign.ctr >= 2.0) score += 20;
    else if (campaign.ctr >= 1.0) score += 15;
    else if (campaign.ctr >= 0.5) score += 10;
    else score += 5;

    // Conversion rate score (0-25 points)
    if (campaign.conversion_rate >= 5.0) score += 25;
    else if (campaign.conversion_rate >= 3.0) score += 20;
    else if (campaign.conversion_rate >= 2.0) score += 15;
    else if (campaign.conversion_rate >= 1.0) score += 10;
    else score += 5;

    // ROI score (0-30 points)
    if (campaign.roi >= 300) score += 30;
    else if (campaign.roi >= 200) score += 25;
    else if (campaign.roi >= 100) score += 20;
    else if (campaign.roi >= 50) score += 15;
    else if (campaign.roi >= 0) score += 10;
    else score += 0;

    // Budget efficiency score (0-20 points)
    const budgetUtilization = (campaign.spent / campaign.budget) * 100;
    if (budgetUtilization >= 70 && budgetUtilization <= 95) score += 20;
    else if (budgetUtilization >= 50 && budgetUtilization < 70) score += 15;
    else if (budgetUtilization >= 30 && budgetUtilization < 50) score += 10;
    else score += 5;

    return Math.min(100, score);
  }
}

// API Client Functions
export class CampaignPerformanceAPI {
  private static baseUrl = "/api/marketing/campaign-performance";

  static async getCampaigns(params?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<CampaignMetrics[]> {
    const searchParams = new URLSearchParams({
      action: "campaigns",
      ...params,
    });

    const response = await fetch(`${this.baseUrl}?${searchParams}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to fetch campaigns");
    }

    return data.data;
  }

  static async getABTests(campaignId?: string): Promise<ABTest[]> {
    const searchParams = new URLSearchParams({
      action: "ab-tests",
      ...(campaignId && { campaignId }),
    });

    const response = await fetch(`${this.baseUrl}?${searchParams}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to fetch A/B tests");
    }

    return data.data;
  }

  static async getApprovals(campaignId?: string): Promise<ContentApproval[]> {
    const searchParams = new URLSearchParams({
      action: "approvals",
      ...(campaignId && { campaignId }),
    });

    const response = await fetch(`${this.baseUrl}?${searchParams}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to fetch approvals");
    }

    return data.data;
  }

  static async createABTest(testData: Partial<ABTest>): Promise<ABTest> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create-ab-test", ...testData }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to create A/B test");
    }

    return data.data;
  }

  static async submitForApproval(
    approvalData: Partial<ContentApproval>
  ): Promise<ContentApproval> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submit-approval", ...approvalData }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to submit for approval");
    }

    return data.data;
  }

  static async approveContent(
    approvalId: string,
    feedback?: string
  ): Promise<ContentApproval> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "approve-content",
        id: approvalId,
        feedback,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to approve content");
    }

    return data.data;
  }

  static async rejectContent(
    approvalId: string,
    feedback: string
  ): Promise<ContentApproval> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reject-content",
        id: approvalId,
        feedback,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to reject content");
    }

    return data.data;
  }
}
