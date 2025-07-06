/**
 * Post-Incident Analysis System
 * Task 62.5: User Experience & Post-Incident Analysis
 *
 * Provides comprehensive post-incident analysis, pattern recognition,
 * and improvement recommendations for the error handling system.
 */

import { logger, LogCategory } from "../logger";

export interface Incident {
  id: string;
  timestamp: Date;
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  errorType: string;
  impact: IncidentImpact;
  duration: number; // in minutes
  affectedUsers: number;
  affectedSystems: string[];
  description: string;
  rootCause?: string;
  resolution?: string;
  preventionMeasures?: string[];
  lessons: string[];
  status: "open" | "investigating" | "resolved" | "closed";
  assignedTo?: string;
  tags: string[];
}

export interface IncidentImpact {
  userExperience: "none" | "minor" | "moderate" | "severe";
  businessOperations: "none" | "minor" | "moderate" | "severe";
  dataIntegrity: "none" | "minor" | "moderate" | "severe";
  financialImpact: number; // estimated cost in euros
  reputationImpact: "none" | "minor" | "moderate" | "severe";
}

export interface AnalysisResult {
  incident: Incident;
  patterns: IncidentPattern[];
  similarIncidents: Incident[];
  recommendations: Recommendation[];
  actionItems: ActionItem[];
  riskAssessment: RiskAssessment;
  timeline: TimelineEvent[];
}

export interface IncidentPattern {
  type: "recurring" | "cascading" | "seasonal" | "environmental";
  description: string;
  frequency: number;
  confidence: number; // 0-100
  relatedIncidents: string[];
}

export interface Recommendation {
  id: string;
  priority: "low" | "medium" | "high" | "critical";
  category: "preventive" | "detective" | "corrective" | "process";
  title: string;
  description: string;
  implementation: string;
  estimatedEffort: number; // in hours
  estimatedCost: number; // in euros
  expectedBenefit: string;
  owner?: string;
  deadline?: Date;
  status: "proposed" | "approved" | "in-progress" | "completed" | "rejected";
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  assignedTo: string;
  dueDate: Date;
  status: "pending" | "in-progress" | "completed" | "overdue";
  category: "immediate" | "short-term" | "long-term";
}

export interface RiskAssessment {
  likelihood: "low" | "medium" | "high";
  severity: "low" | "medium" | "high" | "critical";
  riskLevel: "low" | "medium" | "high" | "critical";
  mitigationStrategies: string[];
  residualRisk: "low" | "medium" | "high";
}

export interface TimelineEvent {
  timestamp: Date;
  event: string;
  source: string;
  severity: "info" | "warning" | "error" | "critical";
  description: string;
}

export class PostIncidentAnalysis {
  private static instance: PostIncidentAnalysis;
  private incidents: Map<string, Incident> = new Map();
  private patterns: Map<string, IncidentPattern[]> = new Map();
  private recommendations: Map<string, Recommendation[]> = new Map();

  private constructor() {}

  public static getInstance(): PostIncidentAnalysis {
    if (!PostIncidentAnalysis.instance) {
      PostIncidentAnalysis.instance = new PostIncidentAnalysis();
    }
    return PostIncidentAnalysis.instance;
  }

  /**
   * Create a new incident record
   */
  public createIncident(incidentData: Partial<Incident>): Incident {
    const incident: Incident = {
      id: this.generateIncidentId(),
      timestamp: new Date(),
      severity: incidentData.severity || "medium",
      category: incidentData.category || "system",
      errorType: incidentData.errorType || "unknown",
      impact: incidentData.impact || this.getDefaultImpact(),
      duration: incidentData.duration || 0,
      affectedUsers: incidentData.affectedUsers || 0,
      affectedSystems: incidentData.affectedSystems || [],
      description: incidentData.description || "",
      lessons: incidentData.lessons || [],
      status: "open",
      tags: incidentData.tags || [],
      ...incidentData,
    };

    this.incidents.set(incident.id, incident);

    logger.info("New incident created", {
      category: LogCategory.SYSTEM,
      component: "post_incident_analysis",
      incident_id: incident.id,
      severity: incident.severity,
    });

    return incident;
  }

  /**
   * Conduct comprehensive post-incident analysis
   */
  public async analyzeIncident(incidentId: string): Promise<AnalysisResult> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    logger.info("Starting post-incident analysis", {
      category: LogCategory.SYSTEM,
      component: "post_incident_analysis",
      incident_id: incidentId,
    });

    // Analyze patterns
    const patterns = await this.identifyPatterns(incident);

    // Find similar incidents
    const similarIncidents = await this.findSimilarIncidents(incident);

    // Generate recommendations
    const recommendations = await this.generateRecommendations(
      incident,
      patterns,
      similarIncidents
    );

    // Create action items
    const actionItems = await this.generateActionItems(
      incident,
      recommendations
    );

    // Assess risk
    const riskAssessment = await this.assessRisk(incident, patterns);

    // Build timeline
    const timeline = await this.buildTimeline(incident);

    const result: AnalysisResult = {
      incident,
      patterns,
      similarIncidents,
      recommendations,
      actionItems,
      riskAssessment,
      timeline,
    };

    // Store patterns and recommendations
    this.patterns.set(incidentId, patterns);
    this.recommendations.set(incidentId, recommendations);

    logger.info("Post-incident analysis completed", {
      category: LogCategory.SYSTEM,
      component: "post_incident_analysis",
      incident_id: incidentId,
      patterns_found: patterns.length,
      recommendations_generated: recommendations.length,
    });

    return result;
  }

  /**
   * Identify patterns in the incident
   */
  private async identifyPatterns(
    incident: Incident
  ): Promise<IncidentPattern[]> {
    const patterns: IncidentPattern[] = [];

    // Check for recurring patterns
    const recurringPattern = await this.checkRecurringPattern(incident);
    if (recurringPattern) patterns.push(recurringPattern);

    // Check for cascading failures
    const cascadingPattern = await this.checkCascadingPattern(incident);
    if (cascadingPattern) patterns.push(cascadingPattern);

    // Check for seasonal patterns
    const seasonalPattern = await this.checkSeasonalPattern(incident);
    if (seasonalPattern) patterns.push(seasonalPattern);

    // Check for environmental patterns
    const environmentalPattern = await this.checkEnvironmentalPattern(incident);
    if (environmentalPattern) patterns.push(environmentalPattern);

    return patterns;
  }

  /**
   * Find similar incidents based on various criteria
   */
  private async findSimilarIncidents(incident: Incident): Promise<Incident[]> {
    const similarIncidents: Incident[] = [];

    for (const [, existingIncident] of this.incidents) {
      if (existingIncident.id === incident.id) continue;

      const similarity = this.calculateSimilarity(incident, existingIncident);
      if (similarity > 0.7) {
        // 70% similarity threshold
        similarIncidents.push(existingIncident);
      }
    }

    return similarIncidents.slice(0, 10); // Limit to top 10 similar incidents
  }

  /**
   * Generate improvement recommendations
   */
  private async generateRecommendations(
    incident: Incident,
    patterns: IncidentPattern[],
    similarIncidents: Incident[]
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Generate recommendations based on severity
    if (incident.severity === "critical") {
      recommendations.push({
        id: this.generateRecommendationId(),
        priority: "critical",
        category: "preventive",
        title: "Implementeer Circuit Breaker Pattern",
        description:
          "Voeg circuit breaker toe om cascading failures te voorkomen",
        implementation:
          "Installeer circuit breaker middleware in kritieke services",
        estimatedEffort: 24,
        estimatedCost: 2000,
        expectedBenefit: "Vermindert risico op system-wide failures met 80%",
        status: "proposed",
      });
    }

    // Generate recommendations based on patterns
    for (const pattern of patterns) {
      if (pattern.type === "recurring") {
        recommendations.push({
          id: this.generateRecommendationId(),
          priority: "high",
          category: "preventive",
          title: "Automatiseer Proactieve Monitoring",
          description: `Implementeer automated monitoring voor ${pattern.description}`,
          implementation: "Configureer alerts en automated responses",
          estimatedEffort: 16,
          estimatedCost: 1200,
          expectedBenefit: "Vroege detectie van terugkerende problemen",
          status: "proposed",
        });
      }
    }

    // Generate recommendations based on error type
    recommendations.push(...this.getErrorTypeRecommendations(incident));

    // Generate recommendations based on impact
    recommendations.push(...this.getImpactBasedRecommendations(incident));

    return recommendations;
  }

  /**
   * Generate action items from recommendations
   */
  private async generateActionItems(
    incident: Incident,
    recommendations: Recommendation[]
  ): Promise<ActionItem[]> {
    const actionItems: ActionItem[] = [];

    // Immediate actions
    actionItems.push({
      id: this.generateActionItemId(),
      title: "Incident Documentatie Voltooien",
      description: "Voltooi alle incident documentatie en lessons learned",
      priority: "high",
      assignedTo: incident.assignedTo || "unassigned",
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      status: "pending",
      category: "immediate",
    });

    // Short-term actions from recommendations
    for (const recommendation of recommendations.filter(
      r => r.priority === "high" || r.priority === "critical"
    )) {
      actionItems.push({
        id: this.generateActionItemId(),
        title: `Implementeer: ${recommendation.title}`,
        description: recommendation.description,
        priority: recommendation.priority,
        assignedTo: recommendation.owner || "unassigned",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: "pending",
        category: "short-term",
      });
    }

    // Long-term actions
    actionItems.push({
      id: this.generateActionItemId(),
      title: "Systeem Resilience Review",
      description: "Voer een uitgebreide review uit van systeem resilience",
      priority: "medium",
      assignedTo: "architecture-team",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      status: "pending",
      category: "long-term",
    });

    return actionItems;
  }

  /**
   * Assess risk based on incident and patterns
   */
  private async assessRisk(
    incident: Incident,
    patterns: IncidentPattern[]
  ): Promise<RiskAssessment> {
    const likelihood = this.calculateLikelihood(incident, patterns);
    const severity = this.mapSeverityToRisk(incident.severity);
    const riskLevel = this.calculateRiskLevel(likelihood, severity);

    return {
      likelihood,
      severity,
      riskLevel,
      mitigationStrategies: this.getMitigationStrategies(incident),
      residualRisk: this.calculateResidualRisk(riskLevel),
    };
  }

  /**
   * Build incident timeline
   */
  private async buildTimeline(incident: Incident): Promise<TimelineEvent[]> {
    const timeline: TimelineEvent[] = [
      {
        timestamp: incident.timestamp,
        event: "Incident Detected",
        source: "monitoring",
        severity: "error",
        description: `Incident ${incident.id} detected: ${incident.description}`,
      },
    ];

    // Add resolution event if resolved
    if (incident.status === "resolved" && incident.resolution) {
      timeline.push({
        timestamp: new Date(
          incident.timestamp.getTime() + incident.duration * 60 * 1000
        ),
        event: "Incident Resolved",
        source: "ops-team",
        severity: "info",
        description: incident.resolution,
      });
    }

    return timeline.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
  }

  /**
   * Helper methods
   */
  private generateIncidentId(): string {
    return `INC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRecommendationId(): string {
    return `REC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateActionItemId(): string {
    return `ACT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultImpact(): IncidentImpact {
    return {
      userExperience: "minor",
      businessOperations: "minor",
      dataIntegrity: "none",
      financialImpact: 0,
      reputationImpact: "none",
    };
  }

  private async checkRecurringPattern(
    incident: Incident
  ): Promise<IncidentPattern | null> {
    const similarCount = Array.from(this.incidents.values()).filter(
      i => i.errorType === incident.errorType && i.id !== incident.id
    ).length;

    if (similarCount >= 3) {
      return {
        type: "recurring",
        description: `Recurring ${incident.errorType} errors`,
        frequency: similarCount,
        confidence: Math.min(similarCount * 25, 100),
        relatedIncidents: [],
      };
    }

    return null;
  }

  private async checkCascadingPattern(
    incident: Incident
  ): Promise<IncidentPattern | null> {
    if (incident.affectedSystems.length > 1) {
      return {
        type: "cascading",
        description: "Multi-system failure indicating cascading effects",
        frequency: 1,
        confidence: 80,
        relatedIncidents: [],
      };
    }

    return null;
  }

  private async checkSeasonalPattern(
    incident: Incident
  ): Promise<IncidentPattern | null> {
    // Simple seasonal check - could be enhanced with historical data
    const hour = incident.timestamp.getHours();
    if (hour >= 9 && hour <= 17) {
      return {
        type: "seasonal",
        description: "Business hours pattern",
        frequency: 1,
        confidence: 60,
        relatedIncidents: [],
      };
    }

    return null;
  }

  private async checkEnvironmentalPattern(
    incident: Incident
  ): Promise<IncidentPattern | null> {
    // Check for environmental factors
    if (
      incident.tags.includes("high-load") ||
      incident.tags.includes("peak-traffic")
    ) {
      return {
        type: "environmental",
        description: "High load / peak traffic correlation",
        frequency: 1,
        confidence: 70,
        relatedIncidents: [],
      };
    }

    return null;
  }

  private calculateSimilarity(
    incident1: Incident,
    incident2: Incident
  ): number {
    let similarity = 0;

    // Error type similarity
    if (incident1.errorType === incident2.errorType) similarity += 0.3;

    // Category similarity
    if (incident1.category === incident2.category) similarity += 0.2;

    // Severity similarity
    if (incident1.severity === incident2.severity) similarity += 0.1;

    // System similarity
    const sharedSystems = incident1.affectedSystems.filter(s =>
      incident2.affectedSystems.includes(s)
    );
    if (sharedSystems.length > 0) similarity += 0.2;

    // Tag similarity
    const sharedTags = incident1.tags.filter(t => incident2.tags.includes(t));
    if (sharedTags.length > 0) similarity += 0.2;

    return similarity;
  }

  private getErrorTypeRecommendations(incident: Incident): Recommendation[] {
    const recommendations: Recommendation[] = [];

    const errorTypeMapping: Record<string, Recommendation> = {
      database: {
        id: this.generateRecommendationId(),
        priority: "high",
        category: "preventive",
        title: "Database Connection Pooling",
        description:
          "Implementeer connection pooling voor database verbindingen",
        implementation: "Configureer connection pool met retry logic",
        estimatedEffort: 8,
        estimatedCost: 500,
        expectedBenefit: "Vermindert database connection issues",
        status: "proposed",
      },
      network: {
        id: this.generateRecommendationId(),
        priority: "medium",
        category: "preventive",
        title: "Network Retry Strategy",
        description: "Implementeer exponential backoff voor network calls",
        implementation: "Voeg retry middleware toe aan API calls",
        estimatedEffort: 4,
        estimatedCost: 300,
        expectedBenefit: "Verbetert network resilience",
        status: "proposed",
      },
    };

    if (errorTypeMapping[incident.errorType]) {
      recommendations.push(errorTypeMapping[incident.errorType]);
    }

    return recommendations;
  }

  private getImpactBasedRecommendations(incident: Incident): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (incident.impact.userExperience === "severe") {
      recommendations.push({
        id: this.generateRecommendationId(),
        priority: "critical",
        category: "corrective",
        title: "User Experience Recovery Plan",
        description:
          "Ontwikkel een specifiek recovery plan voor user experience",
        implementation: "Creëer automated user notification en fallback UI",
        estimatedEffort: 16,
        estimatedCost: 1500,
        expectedBenefit: "Minimaliseert impact op gebruikers",
        status: "proposed",
      });
    }

    return recommendations;
  }

  private calculateLikelihood(
    incident: Incident,
    patterns: IncidentPattern[]
  ): "low" | "medium" | "high" {
    const recurringPatterns = patterns.filter(p => p.type === "recurring");
    if (recurringPatterns.length > 0) return "high";

    if (incident.affectedSystems.length > 1) return "medium";

    return "low";
  }

  private mapSeverityToRisk(
    severity: string
  ): "low" | "medium" | "high" | "critical" {
    return severity as "low" | "medium" | "high" | "critical";
  }

  private calculateRiskLevel(
    likelihood: string,
    severity: string
  ): "low" | "medium" | "high" | "critical" {
    const riskMatrix: Record<string, Record<string, string>> = {
      high: {
        critical: "critical",
        high: "critical",
        medium: "high",
        low: "medium",
      },
      medium: { critical: "high", high: "high", medium: "medium", low: "low" },
      low: { critical: "medium", high: "medium", medium: "low", low: "low" },
    };

    return riskMatrix[likelihood][severity] as
      | "low"
      | "medium"
      | "high"
      | "critical";
  }

  private getMitigationStrategies(incident: Incident): string[] {
    const strategies = [
      "Implementeer proactive monitoring",
      "Verbeter error handling en recovery",
      "Voeg redundancy toe aan kritieke componenten",
    ];

    if (incident.severity === "critical") {
      strategies.push("Implementeer circuit breaker pattern");
      strategies.push("Voeg automated failover toe");
    }

    return strategies;
  }

  private calculateResidualRisk(riskLevel: string): "low" | "medium" | "high" {
    const residualMapping: Record<string, string> = {
      critical: "high",
      high: "medium",
      medium: "low",
      low: "low",
    };

    return residualMapping[riskLevel] as "low" | "medium" | "high";
  }

  /**
   * Public methods for managing incidents
   */
  public updateIncident(
    incidentId: string,
    updates: Partial<Incident>
  ): Incident {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    const updatedIncident = { ...incident, ...updates };
    this.incidents.set(incidentId, updatedIncident);

    logger.info("Incident updated", {
      category: LogCategory.SYSTEM,
      component: "post_incident_analysis",
      incident_id: incidentId,
    });

    return updatedIncident;
  }

  public getIncident(incidentId: string): Incident | undefined {
    return this.incidents.get(incidentId);
  }

  public getAllIncidents(): Incident[] {
    return Array.from(this.incidents.values());
  }

  public getIncidentsByStatus(status: Incident["status"]): Incident[] {
    return Array.from(this.incidents.values()).filter(i => i.status === status);
  }

  public getIncidentsBySeverity(severity: Incident["severity"]): Incident[] {
    return Array.from(this.incidents.values()).filter(
      i => i.severity === severity
    );
  }
}

// Export singleton instance
export const postIncidentAnalysis = PostIncidentAnalysis.getInstance();
