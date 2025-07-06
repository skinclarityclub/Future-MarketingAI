/**
 * Advanced Churn Prediction Algorithms
 * Machine Learning-based customer churn prediction with multiple models
 */

import { createClient } from "@/lib/supabase/server";
import type { UnifiedCustomer } from "@/lib/customer-intelligence/types";

// Types for churn prediction
export interface ChurnPredictionInput {
  customerId: string;
  includeExplanation?: boolean;
  useAdvancedModels?: boolean;
}

export interface ChurnPredictionResult {
  customerId: string;
  churnRiskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  confidence: number;
  predictedChurnDate?: string;
  contributingFactors: ChurnFactor[];
  recommendations: ChurnRecommendation[];
  modelUsed: string;
  lastUpdated: string;
}

export interface ChurnFactor {
  factor: string;
  impact: number; // -1 to 1, negative = reduces risk, positive = increases risk
  weight: number; // 0 to 1, importance of this factor
  description: string;
}

export interface ChurnRecommendation {
  type: "retention" | "engagement" | "value" | "experience";
  priority: "low" | "medium" | "high" | "urgent";
  action: string;
  description: string;
  estimatedImpact: number; // Expected reduction in churn risk (0-1)
  implementationCost: "low" | "medium" | "high";
}

export interface ChurnModelWeights {
  recency: number;
  frequency: number;
  monetary: number;
  engagement: number;
  lifecycle: number;
  behavioral: number;
  satisfaction: number;
}

export interface CustomerFeatures {
  // RFM Analysis
  daysSinceLastPurchase: number;
  daysSinceFirstPurchase: number;
  totalOrders: number;
  averageOrderValue: number;
  totalSpent: number;
  orderFrequency: number; // orders per month

  // Engagement metrics
  daysSinceLastTouchpoint: number;
  totalTouchpoints: number;
  touchpointFrequency: number;
  engagementScore: number;

  // Behavioral patterns
  seasonalityPattern: number; // 0-1, how seasonal their purchases are
  channelDiversity: number; // how many different channels they use
  averageTimeBetweenOrders: number;
  orderValueTrend: number; // -1 to 1, declining vs increasing spend

  // Demographics & Context
  acquisitionChannel: string;
  customerAge: number; // days since acquisition
  geographicRisk: number; // based on location

  // Product interaction
  productDiversity: number; // how many different products/categories
  returnCustomer: boolean;

  // Support & satisfaction
  supportTickets: number;
  satisfactionScore?: number;
  complaintCount: number;
}

export class ChurnPredictionEngine {
  // Model weights for different algorithms
  private readonly defaultWeights: ChurnModelWeights = {
    recency: 0.3, // How recently they engaged
    frequency: 0.25, // How often they purchase
    monetary: 0.2, // How much they spend
    engagement: 0.1, // Non-purchase interactions
    lifecycle: 0.05, // Customer lifecycle stage
    behavioral: 0.05, // Behavioral patterns
    satisfaction: 0.05, // Support & satisfaction
  };

  private readonly highValueWeights: ChurnModelWeights = {
    recency: 0.25,
    frequency: 0.2,
    monetary: 0.3, // Higher weight on monetary for high-value customers
    engagement: 0.1,
    lifecycle: 0.05,
    behavioral: 0.05,
    satisfaction: 0.05,
  };

  private readonly newCustomerWeights: ChurnModelWeights = {
    recency: 0.2,
    frequency: 0.3, // Higher weight on frequency for new customers
    monetary: 0.15,
    engagement: 0.2, // Higher weight on engagement
    lifecycle: 0.1,
    behavioral: 0.05,
    satisfaction: 0.0, // Less relevant for new customers
  };

  private async getSupabaseClient() {
    return await createClient();
  }

  /**
   * Main entry point for churn prediction
   */
  async predictChurn(
    input: ChurnPredictionInput
  ): Promise<ChurnPredictionResult> {
    try {
      // Get customer data
      const customer = await this.getCustomerData(input.customerId);
      if (!customer) {
        throw new Error(`Customer not found: ${input.customerId}`);
      }

      // Extract features
      const features = await this.extractCustomerFeatures(customer);

      // Choose the appropriate model based on customer characteristics
      const modelWeights = this.selectModelWeights(customer, features);

      // Calculate churn risk using selected model
      const churnRisk = input.useAdvancedModels
        ? await this.calculateAdvancedChurnRisk(features, modelWeights)
        : await this.calculateBasicChurnRisk(features, modelWeights);

      // Determine risk level and confidence
      const riskLevel = this.determineRiskLevel(churnRisk.score);
      const confidence = churnRisk.confidence;

      // Generate contributing factors
      const contributingFactors = this.analyzeContributingFactors(
        features,
        churnRisk.factors
      );

      // Generate recommendations
      const recommendations = await this.generateRecommendations(
        customer,
        features,
        contributingFactors,
        riskLevel
      );

      // Predict churn date if high risk
      const predictedChurnDate =
        riskLevel === "high" || riskLevel === "critical"
          ? this.predictChurnDate(features, churnRisk.score)
          : undefined;

      // Update customer record
      await this.updateCustomerChurnData(
        input.customerId,
        churnRisk.score,
        riskLevel
      );

      return {
        customerId: input.customerId,
        churnRiskScore: churnRisk.score,
        riskLevel,
        confidence,
        predictedChurnDate,
        contributingFactors,
        recommendations,
        modelUsed: churnRisk.modelUsed,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error predicting churn:", error);
      throw error;
    }
  }

  /**
   * Batch process churn predictions for all customers
   */
  async batchPredictChurn(filter?: {
    status?: string;
    riskThreshold?: number;
  }): Promise<{
    processed: number;
    highRisk: number;
    errors: string[];
  }> {
    try {
      const supabase = await this.getSupabaseClient();
      let query = supabase
        .from("unified_customers")
        .select("id, customer_status, churn_risk_score");

      if (filter?.status) {
        query = query.eq("customer_status", filter.status);
      }

      const { data: customers, error } = await query;

      if (error) throw error;

      const results: { processed: number; highRisk: number; errors: string[] } =
        {
          processed: 0,
          highRisk: 0,
          errors: [],
        };

      for (const customer of customers || []) {
        try {
          // Skip if recently updated and not high risk
          if (
            filter?.riskThreshold &&
            customer.churn_risk_score !== null &&
            customer.churn_risk_score < filter.riskThreshold
          ) {
            continue;
          }

          const prediction = await this.predictChurn({
            customerId: customer.id,
            useAdvancedModels: true,
          });

          results.processed++;

          if (
            prediction.riskLevel === "high" ||
            prediction.riskLevel === "critical"
          ) {
            results.highRisk++;
          }
        } catch (error) {
          results.errors.push(
            `Failed to process customer ${customer.id}: ${error}`
          );
        }
      }

      return results;
    } catch (error) {
      console.error("Error in batch churn prediction:", error);
      throw error;
    }
  }

  /**
   * Get customer data with related information
   */
  private async getCustomerData(
    customerId: string
  ): Promise<UnifiedCustomer | null> {
    const supabase = await this.getSupabaseClient();
    const { data, error } = await supabase
      .from("unified_customers")
      .select(
        `
        *,
        customer_touchpoints (
          id,
          touchpoint_type,
          channel,
          timestamp,
          value
        ),
        customer_events (
          id,
          event_type,
          event_data,
          timestamp
        )
      `
      )
      .eq("id", customerId)
      .single();

    if (error) {
      console.error("Error fetching customer data:", error);
      return null;
    }

    return data;
  }

  /**
   * Extract comprehensive features for ML models
   */
  private async extractCustomerFeatures(
    customer: any
  ): Promise<CustomerFeatures> {
    const now = new Date();
    const acquisitionDate = new Date(customer.acquisition_date);
    const lastPurchaseDate = customer.last_purchase_date
      ? new Date(customer.last_purchase_date)
      : null;

    // Calculate basic metrics
    const daysSinceFirstPurchase = Math.floor(
      (now.getTime() - acquisitionDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysSinceLastPurchase = lastPurchaseDate
      ? Math.floor(
          (now.getTime() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      : daysSinceFirstPurchase;

    // Touchpoint analysis
    const touchpoints = customer.customer_touchpoints || [];
    const recentTouchpoint =
      touchpoints.length > 0
        ? Math.floor(
            (now.getTime() - new Date(touchpoints[0].timestamp).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : daysSinceFirstPurchase;

    // Calculate engagement score
    const engagementScore = this.calculateEngagementScore(
      touchpoints,
      customer.customer_events || []
    );

    // Calculate behavioral patterns
    const behavioralMetrics = await this.calculateBehavioralMetrics(customer);

    return {
      // RFM Analysis
      daysSinceLastPurchase,
      daysSinceFirstPurchase,
      totalOrders: customer.total_orders || 0,
      averageOrderValue: customer.average_order_value || 0,
      totalSpent: customer.total_lifetime_value || 0,
      orderFrequency: this.calculateOrderFrequency(
        customer.total_orders,
        daysSinceFirstPurchase
      ),

      // Engagement metrics
      daysSinceLastTouchpoint: recentTouchpoint,
      totalTouchpoints: touchpoints.length,
      touchpointFrequency: this.calculateTouchpointFrequency(
        touchpoints.length,
        daysSinceFirstPurchase
      ),
      engagementScore,

      // Behavioral patterns
      seasonalityPattern: behavioralMetrics.seasonality,
      channelDiversity: behavioralMetrics.channelDiversity,
      averageTimeBetweenOrders: behavioralMetrics.averageTimeBetweenOrders,
      orderValueTrend: behavioralMetrics.orderValueTrend,

      // Demographics & Context
      acquisitionChannel: customer.acquisition_source || "unknown",
      customerAge: daysSinceFirstPurchase,
      geographicRisk: this.calculateGeographicRisk(customer.location_country),

      // Product interaction
      productDiversity: behavioralMetrics.productDiversity,
      returnCustomer: (customer.total_orders || 0) > 1,

      // Support & satisfaction
      supportTickets: behavioralMetrics.supportTickets,
      satisfactionScore: behavioralMetrics.satisfactionScore,
      complaintCount: behavioralMetrics.complaintCount,
    };
  }

  /**
   * Calculate advanced churn risk using multiple models
   */
  private async calculateAdvancedChurnRisk(
    features: CustomerFeatures,
    weights: ChurnModelWeights
  ): Promise<{
    score: number;
    confidence: number;
    factors: Record<string, number>;
    modelUsed: string;
  }> {
    // RFM Model
    const rfmScore = this.calculateRFMScore(features);

    // Engagement Model
    const engagementScore = this.calculateEngagementRiskScore(features);

    // Behavioral Model
    const behavioralScore = this.calculateBehavioralRiskScore(features);

    // Lifecycle Model
    const lifecycleScore = this.calculateLifecycleRiskScore(features);

    // Satisfaction Model
    const satisfactionScore = this.calculateSatisfactionRiskScore(features);

    // Weighted ensemble
    const weightedScore =
      rfmScore * (weights.recency + weights.frequency + weights.monetary) +
      engagementScore * weights.engagement +
      behavioralScore * weights.behavioral +
      lifecycleScore * weights.lifecycle +
      satisfactionScore * weights.satisfaction;

    // Calculate confidence based on data completeness
    const confidence = this.calculateConfidence(features);

    return {
      score: Math.min(Math.max(weightedScore, 0), 1),
      confidence,
      factors: {
        rfm: rfmScore,
        engagement: engagementScore,
        behavioral: behavioralScore,
        lifecycle: lifecycleScore,
        satisfaction: satisfactionScore,
      },
      modelUsed: "Advanced Ensemble Model",
    };
  }

  /**
   * Calculate basic churn risk (fallback)
   */
  private async calculateBasicChurnRisk(
    features: CustomerFeatures,
    _weights: ChurnModelWeights
  ): Promise<{
    score: number;
    confidence: number;
    factors: Record<string, number>;
    modelUsed: string;
  }> {
    let riskScore = 0;

    // Recency factor (40% weight)
    const recencyRisk = Math.min(features.daysSinceLastPurchase / 90, 1);
    riskScore += recencyRisk * 0.4;

    // Frequency factor (30% weight)
    const expectedOrders = Math.max(features.customerAge / 60, 1);
    const frequencyRisk = Math.max(
      0,
      1 - features.totalOrders / expectedOrders
    );
    riskScore += frequencyRisk * 0.3;

    // Monetary factor (20% weight)
    const monetaryRisk =
      features.averageOrderValue < 50
        ? 0.2
        : features.averageOrderValue < 100
          ? 0.1
          : 0;
    riskScore += monetaryRisk;

    // Engagement factor (10% weight)
    const engagementRisk = Math.min(features.daysSinceLastTouchpoint / 30, 1);
    riskScore += engagementRisk * 0.1;

    return {
      score: Math.min(Math.max(riskScore, 0), 1),
      confidence: 0.7, // Lower confidence for basic model
      factors: {
        recency: recencyRisk,
        frequency: frequencyRisk,
        monetary: monetaryRisk,
        engagement: engagementRisk,
      },
      modelUsed: "Basic RFM Model",
    };
  }

  /**
   * Calculate RFM (Recency, Frequency, Monetary) score
   */
  private calculateRFMScore(features: CustomerFeatures): number {
    // Recency score (lower is better)
    const recencyScore = Math.min(features.daysSinceLastPurchase / 90, 1);

    // Frequency score
    const expectedFrequency = Math.max(features.customerAge / 60, 1); // Expected 1 order per 60 days
    const frequencyScore = Math.max(
      0,
      1 - features.totalOrders / expectedFrequency
    );

    // Monetary score
    let monetaryScore = 0;
    if (features.averageOrderValue < 25) monetaryScore = 0.8;
    else if (features.averageOrderValue < 50) monetaryScore = 0.6;
    else if (features.averageOrderValue < 100) monetaryScore = 0.4;
    else if (features.averageOrderValue < 200) monetaryScore = 0.2;
    else monetaryScore = 0.1;

    // Combine with equal weights
    return (recencyScore + frequencyScore + monetaryScore) / 3;
  }

  /**
   * Calculate engagement risk score
   */
  private calculateEngagementRiskScore(features: CustomerFeatures): number {
    let score = 0;

    // Touchpoint recency
    score += Math.min(features.daysSinceLastTouchpoint / 30, 1) * 0.4;

    // Engagement frequency
    const expectedTouchpoints = Math.max(features.customerAge / 15, 1); // Expected 1 touchpoint per 15 days
    score +=
      Math.max(0, 1 - features.totalTouchpoints / expectedTouchpoints) * 0.3;

    // Engagement quality
    score += (1 - features.engagementScore) * 0.3;

    return Math.min(score, 1);
  }

  /**
   * Calculate behavioral risk score
   */
  private calculateBehavioralRiskScore(features: CustomerFeatures): number {
    let score = 0;

    // Order value trend (negative trend is risky)
    if (features.orderValueTrend < -0.2) score += 0.3;
    else if (features.orderValueTrend < 0) score += 0.1;

    // Time between orders increasing
    if (features.averageTimeBetweenOrders > 60) score += 0.2;
    else if (features.averageTimeBetweenOrders > 30) score += 0.1;

    // Low channel diversity
    if (features.channelDiversity < 0.3) score += 0.2;

    // Low product diversity
    if (features.productDiversity < 0.3) score += 0.2;

    // Geographic risk
    score += features.geographicRisk * 0.1;

    return Math.min(score, 1);
  }

  /**
   * Calculate lifecycle risk score
   */
  private calculateLifecycleRiskScore(features: CustomerFeatures): number {
    // New customers (< 30 days) have higher initial risk
    if (features.customerAge < 30) {
      return features.totalOrders === 0 ? 0.8 : 0.4;
    }

    // Established customers with no repeat purchases
    if (features.customerAge > 90 && features.totalOrders <= 1) {
      return 0.9;
    }

    // Long-term customers with declining activity
    if (features.customerAge > 365 && features.daysSinceLastPurchase > 180) {
      return 0.7;
    }

    return 0.2; // Default low risk for established active customers
  }

  /**
   * Calculate satisfaction risk score
   */
  private calculateSatisfactionRiskScore(features: CustomerFeatures): number {
    let score = 0;

    // High support ticket volume
    if (features.supportTickets > 3) score += 0.4;
    else if (features.supportTickets > 1) score += 0.2;

    // Complaints
    score += features.complaintCount * 0.2;

    // Low satisfaction score
    if (features.satisfactionScore !== undefined) {
      score += (1 - features.satisfactionScore / 5) * 0.5; // Assuming 1-5 scale
    }

    return Math.min(score, 1);
  }

  /**
   * Calculate data confidence score
   */
  private calculateConfidence(features: CustomerFeatures): number {
    let confidence = 0.5; // Base confidence

    // More data points increase confidence
    if (features.totalOrders > 0) confidence += 0.1;
    if (features.totalOrders > 3) confidence += 0.1;
    if (features.totalTouchpoints > 5) confidence += 0.1;
    if (features.customerAge > 30) confidence += 0.1;
    if (features.satisfactionScore !== undefined) confidence += 0.1;

    return Math.min(confidence, 1);
  }

  /**
   * Helper functions for feature extraction
   */
  private calculateOrderFrequency(
    totalOrders: number,
    customerAge: number
  ): number {
    if (customerAge === 0) return 0;
    return (totalOrders / customerAge) * 30; // Orders per month
  }

  private calculateTouchpointFrequency(
    totalTouchpoints: number,
    customerAge: number
  ): number {
    if (customerAge === 0) return 0;
    return (totalTouchpoints / customerAge) * 30; // Touchpoints per month
  }

  private calculateEngagementScore(touchpoints: any[], events: any[]): number {
    // Simple engagement score based on variety and recency of interactions
    const recentTouchpoints = touchpoints.filter(
      t =>
        Date.now() - new Date(t.timestamp).getTime() < 30 * 24 * 60 * 60 * 1000
    ).length;

    const recentEvents = events.filter(
      e =>
        Date.now() - new Date(e.timestamp).getTime() < 30 * 24 * 60 * 60 * 1000
    ).length;

    return Math.min((recentTouchpoints + recentEvents) / 10, 1);
  }

  private calculateGeographicRisk(country?: string): number {
    // Simple geographic risk based on country
    // This could be enhanced with real market data
    const highRiskCountries = ["IN", "CN", "BR"]; // Example
    const mediumRiskCountries = ["CA", "AU", "DE", "FR", "UK"];

    if (!country) return 0.3;
    if (highRiskCountries.includes(country)) return 0.6;
    if (mediumRiskCountries.includes(country)) return 0.2;
    return 0.1; // Low risk countries (e.g., US, EU)
  }

  private async calculateBehavioralMetrics(_customer: any): Promise<{
    seasonality: number;
    channelDiversity: number;
    averageTimeBetweenOrders: number;
    orderValueTrend: number;
    productDiversity: number;
    supportTickets: number;
    satisfactionScore?: number;
    complaintCount: number;
  }> {
    // This would ideally query order history, but for now return defaults
    // In a real implementation, these would be calculated from order data
    return {
      seasonality: 0.3,
      channelDiversity: 0.5,
      averageTimeBetweenOrders: 45,
      orderValueTrend: 0.1,
      productDiversity: 0.4,
      supportTickets: 0,
      satisfactionScore: undefined,
      complaintCount: 0,
    };
  }

  /**
   * Select appropriate model weights based on customer characteristics
   */
  private selectModelWeights(
    customer: any,
    features: CustomerFeatures
  ): ChurnModelWeights {
    // High-value customers
    if (features.totalSpent > 1000) {
      return this.highValueWeights;
    }

    // New customers
    if (features.customerAge < 60) {
      return this.newCustomerWeights;
    }

    // Default weights
    return this.defaultWeights;
  }

  /**
   * Determine risk level from score
   */
  private determineRiskLevel(
    score: number
  ): "low" | "medium" | "high" | "critical" {
    if (score >= 0.8) return "critical";
    if (score >= 0.6) return "high";
    if (score >= 0.3) return "medium";
    return "low";
  }

  /**
   * Analyze contributing factors
   */
  private analyzeContributingFactors(
    features: CustomerFeatures,
    _modelFactors: Record<string, number>
  ): ChurnFactor[] {
    const factors: ChurnFactor[] = [];

    // Recency factor
    if (features.daysSinceLastPurchase > 60) {
      factors.push({
        factor: "Recent Purchase Activity",
        impact: Math.min(features.daysSinceLastPurchase / 90, 1),
        weight: 0.3,
        description: `${features.daysSinceLastPurchase} days since last purchase`,
      });
    }

    // Frequency factor
    if (features.orderFrequency < 0.5) {
      factors.push({
        factor: "Purchase Frequency",
        impact: 1 - features.orderFrequency * 2,
        weight: 0.25,
        description: `Low purchase frequency: ${features.orderFrequency.toFixed(2)} orders/month`,
      });
    }

    // Engagement factor
    if (features.engagementScore < 0.3) {
      factors.push({
        factor: "Customer Engagement",
        impact: 1 - features.engagementScore,
        weight: 0.15,
        description: `Low engagement score: ${(features.engagementScore * 100).toFixed(1)}%`,
      });
    }

    // Add more factors based on other metrics...

    return factors;
  }

  /**
   * Generate personalized recommendations
   */
  private async generateRecommendations(
    customer: any,
    features: CustomerFeatures,
    factors: ChurnFactor[],
    riskLevel: string
  ): Promise<ChurnRecommendation[]> {
    const recommendations: ChurnRecommendation[] = [];

    // High recency risk
    if (features.daysSinceLastPurchase > 60) {
      recommendations.push({
        type: "engagement",
        priority: riskLevel === "critical" ? "urgent" : "high",
        action: "Re-engagement Campaign",
        description:
          "Send personalized email campaign with special offer or product recommendations",
        estimatedImpact: 0.3,
        implementationCost: "low",
      });
    }

    // Low engagement
    if (features.engagementScore < 0.3) {
      recommendations.push({
        type: "engagement",
        priority: "medium",
        action: "Content Marketing",
        description:
          "Increase touchpoints through valuable content and educational materials",
        estimatedImpact: 0.2,
        implementationCost: "medium",
      });
    }

    // Low order value
    if (features.averageOrderValue < 100) {
      recommendations.push({
        type: "value",
        priority: "medium",
        action: "Upselling Campaign",
        description: "Recommend complementary products or premium versions",
        estimatedImpact: 0.25,
        implementationCost: "low",
      });
    }

    // High-value customer at risk
    if (features.totalSpent > 500 && riskLevel === "high") {
      recommendations.push({
        type: "retention",
        priority: "urgent",
        action: "Personal Outreach",
        description:
          "Direct contact from account manager or customer success team",
        estimatedImpact: 0.5,
        implementationCost: "high",
      });
    }

    return recommendations;
  }

  /**
   * Predict likely churn date
   */
  private predictChurnDate(
    features: CustomerFeatures,
    riskScore: number
  ): string {
    // Simple prediction based on current trends
    const daysToChurn = Math.max(
      30 * (1 - riskScore) * 2, // Higher risk = sooner churn
      7 // Minimum 7 days
    );

    const churnDate = new Date();
    churnDate.setDate(churnDate.getDate() + Math.floor(daysToChurn));

    return churnDate.toISOString();
  }

  /**
   * Update customer record with churn prediction data
   */
  private async updateCustomerChurnData(
    customerId: string,
    churnScore: number,
    riskLevel: string
  ): Promise<void> {
    try {
      const supabase = await this.getSupabaseClient();
      await supabase
        .from("unified_customers")
        .update({
          churn_risk_score: churnScore,
          churn_risk_level: riskLevel,
          churn_last_calculated: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", customerId);
    } catch (error) {
      console.error("Error updating customer churn data:", error);
    }
  }
}

// Export singleton instance
export const churnPredictionEngine = new ChurnPredictionEngine();
