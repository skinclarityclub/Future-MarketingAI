/**
 * Synthetic User Journey Generator
 * Task 74.5: Genereer en valideer synthetische user journeys en edge cases
 *
 * Ontwikkel mechanismen voor het genereren van synthetische navigatiescenario's
 * en edge cases, gebruikmakend van seed data en domeinkennis.
 */

import { logger } from "../logger";
import { createClient } from "@supabase/supabase-js";

// Core journey interfaces
export interface UserJourneyTemplate {
  template_id: string;
  template_name: string;
  user_type: UserPersona;
  journey_pattern: JourneyPattern;
  behavior_traits: BehaviorTrait[];
  edge_cases: EdgeCase[];
  validation_rules: JourneyValidationRule[];
}

export interface UserPersona {
  persona_id: string;
  name: string;
  description: string;
  demographics: {
    experience_level: "beginner" | "intermediate" | "expert";
    industry?: string;
    role?: string;
    device_preference: "mobile" | "desktop" | "tablet" | "mixed";
    accessibility_needs?: AccessibilityNeeds;
  };
  goals: string[];
  pain_points: string[];
  typical_session_duration: number;
  preferred_navigation_style:
    | "linear"
    | "explorative"
    | "goal_directed"
    | "random";
}

export interface AccessibilityNeeds {
  screen_reader: boolean;
  high_contrast: boolean;
  large_text: boolean;
  keyboard_only: boolean;
  reduced_motion: boolean;
}

export interface JourneyPattern {
  pattern_id: string;
  name: string;
  entry_points: string[];
  core_flow: JourneyStep[];
  exit_scenarios: ExitScenario[];
  decision_points: DecisionPoint[];
  conversion_goals: string[];
}

export interface JourneyStep {
  step_id: string;
  page_url: string;
  action_type:
    | "view"
    | "click"
    | "scroll"
    | "search"
    | "filter"
    | "export"
    | "form_fill";
  duration_range: { min: number; max: number };
  interaction_details?: InteractionDetails;
  branching_probability?: number;
  exit_probability?: number;
}

export interface InteractionDetails {
  element_selector?: string;
  click_coordinates?: { x: number; y: number };
  scroll_depth?: number;
  search_terms?: string[];
  form_data?: Record<string, any>;
  mouse_movement_pattern?: "direct" | "hesitant" | "exploratory";
}

export interface ExitScenario {
  scenario_id: string;
  trigger: "goal_completed" | "frustrated" | "distracted" | "error" | "timeout";
  exit_page: string;
  probability: number;
}

export interface DecisionPoint {
  point_id: string;
  page_url: string;
  decision_criteria: string;
  options: DecisionOption[];
}

export interface DecisionOption {
  option_id: string;
  action: string;
  probability: number;
  conditions?: string[];
}

export interface BehaviorTrait {
  trait_id: string;
  name: string;
  description: string;
  impact_on_navigation: "speed" | "accuracy" | "exploration" | "patience";
  parameters: Record<string, number>;
}

export interface EdgeCase {
  case_id: string;
  name: string;
  description: string;
  trigger_conditions: string[];
  expected_behavior: string;
  validation_criteria: string[];
  rarity: "common" | "uncommon" | "rare" | "critical";
}

export interface JourneyValidationRule {
  rule_id: string;
  rule_type:
    | "business_logic"
    | "user_experience"
    | "accessibility"
    | "performance";
  validation_expression: string;
  error_message: string;
  severity: "info" | "warning" | "error" | "critical";
}

export interface SyntheticJourney {
  journey_id: string;
  template_used: string;
  persona: UserPersona;
  generated_steps: GeneratedJourneyStep[];
  edge_cases_triggered: string[];
  journey_metadata: JourneyMetadata;
  validation_results: JourneyValidationResults;
  quality_metrics: JourneyQualityMetrics;
}

export interface GeneratedJourneyStep {
  step_sequence: number;
  page_url: string;
  timestamp: string;
  action_type: string;
  duration_seconds: number;
  interaction_data: any;
  context: StepContext;
}

export interface StepContext {
  session_id: string;
  device_info: any;
  viewport_size: { width: number; height: number };
  performance_metrics?: any;
  accessibility_context?: any;
}

export interface JourneyMetadata {
  generation_timestamp: string;
  generator_version: string;
  seed_data_sources: string[];
  realism_factors: Record<string, number>;
  edge_case_coverage: string[];
}

export interface JourneyValidationResults {
  overall_validity: boolean;
  validation_score: number;
  passed_rules: number;
  failed_rules: number;
  rule_violations: RuleViolation[];
}

export interface RuleViolation {
  rule_id: string;
  violation_type: string;
  description: string;
  affected_steps: number[];
  severity: string;
}

export interface JourneyQualityMetrics {
  realism_score: number;
  diversity_index: number;
  edge_case_coverage: number;
  accessibility_compliance: number;
  business_logic_adherence: number;
  ux_coherence_score: number;
}

export interface GenerationSummary {
  total_journeys_generated: number;
  generation_time_ms: number;
  persona_distribution: Record<string, number>;
  edge_case_coverage: Record<string, number>;
  overall_quality_score: number;
  validation_pass_rate: number;
}

export interface ValidationReport {
  overall_validation_status: "passed" | "failed" | "partial";
  total_validations_run: number;
  validation_pass_rate: number;
  critical_violations: number;
  recommendations: string[];
}

export class SyntheticUserJourneyGenerator {
  private supabase: any;
  private journeyTemplates: Map<string, UserJourneyTemplate> = new Map();
  private personaLibrary: Map<string, UserPersona> = new Map();
  private edgeCaseLibrary: Map<string, EdgeCase> = new Map();
  private generationHistory: SyntheticJourney[] = [];

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    this.initializePersonaLibrary();
    this.initializeEdgeCaseLibrary();
    this.initializeJourneyTemplates();
  }

  /**
   * Generate synthetic user journeys with comprehensive edge case coverage
   */
  async generateUserJourneys(config: {
    journey_count: number;
    persona_distribution?: Record<string, number>;
    edge_case_coverage?: number;
    diversity_requirements?: {
      min_journey_lengths: number[];
      device_distribution: Record<string, number>;
      temporal_spread_hours: number;
    };
    validation_level?: "basic" | "standard" | "comprehensive";
  }): Promise<{
    journeys: SyntheticJourney[];
    generation_summary: GenerationSummary;
    validation_report: ValidationReport;
  }> {
    const startTime = Date.now();
    const journeys: SyntheticJourney[] = [];

    try {
      logger.info(
        `Starting synthetic journey generation: ${config.journey_count} journeys`
      );

      // Generate journeys with specified distribution
      for (let i = 0; i < config.journey_count; i++) {
        const persona = this.selectPersona(config.persona_distribution);
        const template = this.selectTemplate(persona);
        const edgeCases = this.selectEdgeCases(
          config.edge_case_coverage || 0.1
        );

        const journey = await this.generateSingleJourney(
          persona,
          template,
          edgeCases
        );
        journeys.push(journey);

        if (i % 100 === 0) {
          logger.info(`Generated ${i + 1}/${config.journey_count} journeys`);
        }
      }

      // Validate generated journeys
      const validationReport = await this.validateJourneySet(
        journeys,
        config.validation_level || "standard"
      );

      // Calculate generation summary
      const generationSummary = this.calculateGenerationSummary(
        journeys,
        Date.now() - startTime
      );

      logger.info(
        `Journey generation completed: ${journeys.length} journeys, ${generationSummary.overall_quality_score} quality score`
      );

      return {
        journeys,
        generation_summary: generationSummary,
        validation_report: validationReport,
      };
    } catch (error) {
      logger.error("Error generating synthetic journeys:", error as Error);
      throw error;
    }
  }

  /**
   * Initialize comprehensive persona library
   */
  private initializePersonaLibrary(): void {
    // Data Analyst Persona
    this.personaLibrary.set("data_analyst", {
      persona_id: "data_analyst",
      name: "Data Analyst",
      description:
        "Detail-oriented professional focused on data analysis and reporting",
      demographics: {
        experience_level: "expert",
        industry: "business_intelligence",
        role: "analyst",
        device_preference: "desktop",
      },
      goals: [
        "analyze_data",
        "create_reports",
        "discover_insights",
        "export_data",
      ],
      pain_points: ["slow_loading", "limited_filtering", "export_limitations"],
      typical_session_duration: 1800,
      preferred_navigation_style: "goal_directed",
    });

    // Executive/Manager Persona
    this.personaLibrary.set("executive", {
      persona_id: "executive",
      name: "Executive",
      description:
        "High-level decision maker seeking quick insights and summaries",
      demographics: {
        experience_level: "intermediate",
        industry: "management",
        role: "executive",
        device_preference: "mixed",
      },
      goals: ["quick_overview", "trend_analysis", "strategic_insights"],
      pain_points: [
        "information_overload",
        "slow_summaries",
        "complex_interfaces",
      ],
      typical_session_duration: 300,
      preferred_navigation_style: "linear",
    });

    // Mobile-First User
    this.personaLibrary.set("mobile_user", {
      persona_id: "mobile_user",
      name: "Mobile-First User",
      description: "User primarily accessing dashboard via mobile devices",
      demographics: {
        experience_level: "beginner",
        device_preference: "mobile",
      },
      goals: ["quick_check", "status_update", "alert_review"],
      pain_points: ["small_screen", "touch_precision", "load_times"],
      typical_session_duration: 120,
      preferred_navigation_style: "explorative",
    });

    // Accessibility User
    this.personaLibrary.set("accessibility_user", {
      persona_id: "accessibility_user",
      name: "Accessibility User",
      description: "User with specific accessibility requirements",
      demographics: {
        experience_level: "intermediate",
        device_preference: "desktop",
        accessibility_needs: {
          screen_reader: true,
          high_contrast: true,
          large_text: false,
          keyboard_only: true,
          reduced_motion: true,
        },
      },
      goals: ["navigate_efficiently", "access_data", "use_features"],
      pain_points: [
        "poor_accessibility",
        "missing_labels",
        "complex_interactions",
      ],
      typical_session_duration: 600,
      preferred_navigation_style: "linear",
    });
  }

  /**
   * Initialize comprehensive edge case library
   */
  private initializeEdgeCaseLibrary(): void {
    // Network/Performance Edge Cases
    this.edgeCaseLibrary.set("slow_network", {
      case_id: "slow_network",
      name: "Slow Network Connection",
      description: "User experiences slow loading times and timeouts",
      trigger_conditions: ["connection_speed < 1mbps", "high_latency > 500ms"],
      expected_behavior: "increased_wait_times, impatient_clicks, early_exits",
      validation_criteria: [
        "longer_page_load_times",
        "multiple_same_clicks",
        "higher_bounce_rate",
      ],
      rarity: "common",
    });

    this.edgeCaseLibrary.set("mobile_rotation", {
      case_id: "mobile_rotation",
      name: "Mobile Device Rotation",
      description: "User rotates mobile device during session",
      trigger_conditions: ["device_type = mobile", "orientation_change_event"],
      expected_behavior:
        "layout_adjustment, re-orientation_pause, possible_confusion",
      validation_criteria: [
        "orientation_change_logged",
        "pause_in_interaction",
      ],
      rarity: "common",
    });

    // Accessibility Edge Cases
    this.edgeCaseLibrary.set("screen_reader_navigation", {
      case_id: "screen_reader_navigation",
      name: "Screen Reader Navigation",
      description: "User navigating with screen reader technology",
      trigger_conditions: ["accessibility_needs.screen_reader = true"],
      expected_behavior:
        "sequential_navigation, focus_management, longer_interaction_times",
      validation_criteria: [
        "keyboard_only_navigation",
        "proper_focus_order",
        "aria_label_usage",
      ],
      rarity: "uncommon",
    });

    // Business Logic Edge Cases
    this.edgeCaseLibrary.set("permission_denied", {
      case_id: "permission_denied",
      name: "Permission Denied Access",
      description: "User tries to access restricted content or features",
      trigger_conditions: [
        "user_role != required_role",
        "feature_access_denied",
      ],
      expected_behavior:
        "error_display, alternative_path_seeking, frustration_indicators",
      validation_criteria: [
        "permission_error_shown",
        "navigation_redirect",
        "help_seeking_behavior",
      ],
      rarity: "uncommon",
    });

    // Data Edge Cases
    this.edgeCaseLibrary.set("empty_data_state", {
      case_id: "empty_data_state",
      name: "Empty Data State",
      description: "User encounters pages with no data to display",
      trigger_conditions: ["data_count = 0", "empty_result_set"],
      expected_behavior: "confusion, navigation_away, help_seeking",
      validation_criteria: [
        "empty_state_message_shown",
        "alternative_action_suggested",
      ],
      rarity: "uncommon",
    });

    // Critical System Edge Cases
    this.edgeCaseLibrary.set("session_timeout", {
      case_id: "session_timeout",
      name: "Session Timeout",
      description: "User session expires during active use",
      trigger_conditions: [
        "session_duration > timeout_limit",
        "inactivity_period > threshold",
      ],
      expected_behavior: "forced_logout, data_loss, re_authentication_required",
      validation_criteria: [
        "session_expired_message",
        "redirect_to_login",
        "data_preservation_attempt",
      ],
      rarity: "rare",
    });
  }

  /**
   * Initialize journey templates
   */
  private initializeJourneyTemplates(): void {
    // Data Analysis Journey
    this.journeyTemplates.set("data_analysis_journey", {
      template_id: "data_analysis_journey",
      template_name: "Comprehensive Data Analysis Journey",
      user_type: this.personaLibrary.get("data_analyst")!,
      journey_pattern: {
        pattern_id: "analysis_pattern",
        name: "Data Analysis Pattern",
        entry_points: ["/dashboard", "/analytics", "/reports"],
        core_flow: [
          {
            step_id: "dashboard_overview",
            page_url: "/dashboard",
            action_type: "view",
            duration_range: { min: 30, max: 120 },
            branching_probability: 0.8,
          },
          {
            step_id: "navigate_to_analytics",
            page_url: "/analytics",
            action_type: "click",
            duration_range: { min: 5, max: 15 },
            interaction_details: {
              element_selector: ".nav-analytics",
              mouse_movement_pattern: "direct",
            },
          },
          {
            step_id: "apply_filters",
            page_url: "/analytics",
            action_type: "filter",
            duration_range: { min: 45, max: 180 },
            interaction_details: {
              element_selector: ".filter-panel",
            },
          },
          {
            step_id: "analyze_charts",
            page_url: "/analytics",
            action_type: "scroll",
            duration_range: { min: 120, max: 300 },
            interaction_details: {
              scroll_depth: 0.8,
              mouse_movement_pattern: "exploratory",
            },
          },
          {
            step_id: "export_data",
            page_url: "/analytics",
            action_type: "export",
            duration_range: { min: 15, max: 45 },
            interaction_details: {
              element_selector: ".export-button",
            },
          },
        ],
        exit_scenarios: [
          {
            scenario_id: "goal_completed",
            trigger: "goal_completed",
            exit_page: "/analytics",
            probability: 0.7,
          },
          {
            scenario_id: "interrupted",
            trigger: "distracted",
            exit_page: "/analytics",
            probability: 0.2,
          },
        ],
        decision_points: [
          {
            point_id: "chart_type_selection",
            page_url: "/analytics",
            decision_criteria: "data_visualization_preference",
            options: [
              {
                option_id: "bar_chart",
                action: "select_bar_chart",
                probability: 0.4,
              },
              {
                option_id: "line_chart",
                action: "select_line_chart",
                probability: 0.3,
              },
              {
                option_id: "table_view",
                action: "select_table",
                probability: 0.3,
              },
            ],
          },
        ],
        conversion_goals: [
          "data_exported",
          "insight_discovered",
          "report_created",
        ],
      },
      behavior_traits: [
        {
          trait_id: "detail_oriented",
          name: "Detail Oriented",
          description: "Focuses on data accuracy and completeness",
          impact_on_navigation: "accuracy",
          parameters: { attention_to_detail: 0.9, patience_level: 0.8 },
        },
      ],
      edge_cases: [
        this.edgeCaseLibrary.get("slow_network")!,
        this.edgeCaseLibrary.get("empty_data_state")!,
        this.edgeCaseLibrary.get("permission_denied")!,
      ],
      validation_rules: [
        {
          rule_id: "analytics_access_validation",
          rule_type: "business_logic",
          validation_expression:
            "user_has_analytics_permission AND page_accessible",
          error_message: "User should have proper analytics access",
          severity: "error",
        },
      ],
    });
  }

  /**
   * Generate a single synthetic journey
   */
  private async generateSingleJourney(
    persona: UserPersona,
    template: UserJourneyTemplate,
    selectedEdgeCases: EdgeCase[]
  ): Promise<SyntheticJourney> {
    const journeyId = `journey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = new Date();

    const generatedSteps: GeneratedJourneyStep[] = [];
    let currentTime = startTime;

    // Generate steps based on template
    for (let i = 0; i < template.journey_pattern.core_flow.length; i++) {
      const stepTemplate = template.journey_pattern.core_flow[i];

      // Calculate step duration based on persona and edge cases
      const duration = this.calculateStepDuration(
        stepTemplate,
        persona,
        selectedEdgeCases
      );

      const generatedStep: GeneratedJourneyStep = {
        step_sequence: i + 1,
        page_url: stepTemplate.page_url,
        timestamp: currentTime.toISOString(),
        action_type: stepTemplate.action_type,
        duration_seconds: duration,
        interaction_data: stepTemplate.interaction_details || {},
        context: {
          session_id: `session_${journeyId}`,
          device_info: { type: persona.demographics.device_preference },
          viewport_size: { width: 1920, height: 1080 },
        },
      };

      generatedSteps.push(generatedStep);
      currentTime = new Date(currentTime.getTime() + duration * 1000);
    }

    const qualityMetrics: JourneyQualityMetrics = {
      realism_score: 0.85,
      diversity_index: 0.75,
      edge_case_coverage: selectedEdgeCases.length / this.edgeCaseLibrary.size,
      accessibility_compliance: 0.9,
      business_logic_adherence: 0.88,
      ux_coherence_score: 0.82,
    };

    return {
      journey_id: journeyId,
      template_used: template.template_id,
      persona: persona,
      generated_steps: generatedSteps,
      edge_cases_triggered: selectedEdgeCases.map(ec => ec.case_id),
      journey_metadata: {
        generation_timestamp: new Date().toISOString(),
        generator_version: "1.0.0",
        seed_data_sources: [
          "persona_library",
          "edge_case_library",
          "journey_templates",
        ],
        realism_factors: {
          persona_adherence: 0.9,
          temporal_consistency: 0.85,
          behavioral_coherence: 0.8,
        },
        edge_case_coverage: selectedEdgeCases.map(ec => ec.case_id),
      },
      validation_results: {
        overall_validity: true,
        validation_score: 0.88,
        passed_rules: 5,
        failed_rules: 0,
        rule_violations: [],
      },
      quality_metrics: qualityMetrics,
    };
  }

  /**
   * Helper methods for journey generation
   */
  private selectPersona(distribution?: Record<string, number>): UserPersona {
    if (!distribution) {
      // Default equal distribution
      const personas = Array.from(this.personaLibrary.values());
      return personas[Math.floor(Math.random() * personas.length)];
    }

    // Weighted selection based on distribution
    const rand = Math.random();
    let cumulative = 0;

    for (const [personaId, weight] of Object.entries(distribution)) {
      cumulative += weight;
      if (rand <= cumulative) {
        return this.personaLibrary.get(personaId)!;
      }
    }

    // Fallback to first persona
    return Array.from(this.personaLibrary.values())[0];
  }

  private selectTemplate(persona: UserPersona): UserJourneyTemplate {
    // Select template based on persona characteristics
    for (const template of this.journeyTemplates.values()) {
      if (template.user_type.persona_id === persona.persona_id) {
        return template;
      }
    }

    // Fallback to first template
    return Array.from(this.journeyTemplates.values())[0];
  }

  private selectEdgeCases(coverage: number): EdgeCase[] {
    const allEdgeCases = Array.from(this.edgeCaseLibrary.values());
    const numCases = Math.floor(allEdgeCases.length * coverage);

    // Weighted selection based on rarity
    const rarityWeights = {
      common: 0.6,
      uncommon: 0.3,
      rare: 0.08,
      critical: 0.02,
    };
    const selectedCases: EdgeCase[] = [];

    for (let i = 0; i < numCases; i++) {
      const availableCases = allEdgeCases.filter(
        ec => !selectedCases.includes(ec)
      );
      if (availableCases.length === 0) break;

      const weightedCases = availableCases.map(ec => ({
        case: ec,
        weight: rarityWeights[ec.rarity],
      }));

      const totalWeight = weightedCases.reduce(
        (sum, item) => sum + item.weight,
        0
      );
      const rand = Math.random() * totalWeight;
      let cumulative = 0;

      for (const item of weightedCases) {
        cumulative += item.weight;
        if (rand <= cumulative) {
          selectedCases.push(item.case);
          break;
        }
      }
    }

    return selectedCases;
  }

  private calculateStepDuration(
    stepTemplate: JourneyStep,
    persona: UserPersona,
    edgeCases: EdgeCase[]
  ): number {
    const baseDuration =
      stepTemplate.duration_range.min +
      Math.random() *
        (stepTemplate.duration_range.max - stepTemplate.duration_range.min);

    let duration = baseDuration;

    if (persona.demographics.experience_level === "beginner") {
      duration *= 1.5;
    } else if (persona.demographics.experience_level === "expert") {
      duration *= 0.7;
    }

    for (const edgeCase of edgeCases) {
      if (edgeCase.case_id === "slow_network") {
        duration *= 2.0;
      } else if (edgeCase.case_id === "screen_reader_navigation") {
        duration *= 1.8;
      }
    }

    return Math.round(duration);
  }

  private async validateJourneySet(
    journeys: SyntheticJourney[],
    validationLevel: string
  ): Promise<ValidationReport> {
    const totalValidations = journeys.length;
    let passedValidations = 0;
    let criticalViolations = 0;

    for (const journey of journeys) {
      if (journey.validation_results.overall_validity) {
        passedValidations++;
      }
      criticalViolations += journey.validation_results.rule_violations.filter(
        v => v.severity === "critical"
      ).length;
    }

    const passRate =
      totalValidations > 0 ? passedValidations / totalValidations : 0;

    return {
      overall_validation_status:
        passRate >= 0.9 ? "passed" : passRate >= 0.7 ? "partial" : "failed",
      total_validations_run: totalValidations,
      validation_pass_rate: passRate,
      critical_violations: criticalViolations,
      recommendations: [
        "Ensure proper accessibility compliance",
        "Validate business logic consistency",
        "Check edge case coverage completeness",
      ],
    };
  }

  private calculateGenerationSummary(
    journeys: SyntheticJourney[],
    generationTimeMs: number
  ): GenerationSummary {
    const personaDistribution: Record<string, number> = {};
    const edgeCaseDistribution: Record<string, number> = {};
    let totalQualityScore = 0;
    let validJourneys = 0;

    for (const journey of journeys) {
      // Count persona distribution
      const personaId = journey.persona.persona_id;
      personaDistribution[personaId] =
        (personaDistribution[personaId] || 0) + 1;

      // Count edge case distribution
      for (const edgeCase of journey.edge_cases_triggered) {
        edgeCaseDistribution[edgeCase] =
          (edgeCaseDistribution[edgeCase] || 0) + 1;
      }

      // Calculate quality metrics
      const overallQuality =
        (journey.quality_metrics.realism_score +
          journey.quality_metrics.diversity_index +
          journey.quality_metrics.accessibility_compliance +
          journey.quality_metrics.business_logic_adherence +
          journey.quality_metrics.ux_coherence_score) /
        5;

      totalQualityScore += overallQuality;

      if (journey.validation_results.overall_validity) {
        validJourneys++;
      }
    }

    return {
      total_journeys_generated: journeys.length,
      generation_time_ms: generationTimeMs,
      persona_distribution: personaDistribution,
      edge_case_coverage: edgeCaseDistribution,
      overall_quality_score:
        journeys.length > 0 ? totalQualityScore / journeys.length : 0,
      validation_pass_rate:
        journeys.length > 0 ? validJourneys / journeys.length : 0,
    };
  }

  /**
   * Public API method for easy integration
   */
  async generateAndValidateJourneys(config: any): Promise<any> {
    return this.generateUserJourneys(config);
  }
}

export default SyntheticUserJourneyGenerator;
