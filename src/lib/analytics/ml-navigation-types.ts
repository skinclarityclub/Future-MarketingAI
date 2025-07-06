/**
 * Machine Learning Navigation Prediction Types
 * Type definitions for AI-powered navigation recommendations
 */

export interface NavigationFeatures {
  // User context
  user_id?: string;
  session_id: string;
  device_type: "desktop" | "tablet" | "mobile";
  browser: string;
  is_returning_visitor: boolean;

  // Current state
  current_page: string;
  time_on_page: number;
  scroll_depth: number;
  clicks_on_page: number;

  // Session context
  session_duration: number;
  pages_visited_in_session: number;
  total_clicks_in_session: number;
  bounce_rate: number;

  // Temporal features
  hour_of_day: number;
  day_of_week: number;
  is_weekend: boolean;

  // Historical behavior
  total_sessions: number;
  average_session_duration: number;
  most_visited_pages: string[];
  preferred_device_type: string;

  // Interaction patterns
  form_interactions_count: number;
  search_queries_count: number;
  error_encounters: number;
  video_engagements: number;

  // Page-specific features
  page_load_time: number;
  page_category: string;
  page_depth: number;
  has_forms: boolean;
  has_videos: boolean;
  has_downloads: boolean;

  // UTM and referral context
  traffic_source: string;
  utm_campaign?: string;
  utm_medium?: string;
  referrer_domain?: string;
}

export interface NavigationPrediction {
  predicted_page: string;
  confidence_score: number;
  predicted_probability: number;
  reasoning: string[];
  alternative_predictions: Array<{
    page: string;
    probability: number;
    reasoning: string;
  }>;
  feature_importance: Record<string, number>;
  prediction_timestamp: string;
}

export interface NavigationRecommendation {
  page_url: string;
  page_title: string;
  recommendation_type:
    | "next_page"
    | "alternative_path"
    | "content_suggestion"
    | "action_prompt";
  confidence: number;
  reasoning: string;
  expected_engagement_score: number;
  personalization_factors: string[];
  display_priority: number;
  expires_at?: string;
}

export interface MLModelConfig {
  model_type:
    | "decision_tree"
    | "random_forest"
    | "gradient_boosting"
    | "neural_network";
  parameters: {
    max_depth?: number;
    n_estimators?: number;
    learning_rate?: number;
    min_samples_split?: number;
    min_samples_leaf?: number;
    random_state?: number;
  };
  feature_selection: {
    enabled: boolean;
    method:
      | "variance_threshold"
      | "univariate"
      | "recursive_feature_elimination";
    n_features?: number;
  };
  cross_validation: {
    enabled: boolean;
    folds: number;
    scoring: string;
  };
  hyperparameter_tuning: {
    enabled: boolean;
    method: "grid_search" | "random_search" | "bayesian";
    param_distributions: Record<string, any>;
  };
}

export interface TrainingDataPoint {
  features: NavigationFeatures;
  target: string; // The actual next page the user visited
  session_outcome: "conversion" | "bounce" | "continued" | "exit";
  engagement_score: number;
  time_to_next_action: number;
  user_satisfaction_indicator?: number;
}

export interface ModelPerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  auc_roc: number;
  confusion_matrix: number[][];
  feature_importance: Record<string, number>;
  cross_validation_scores: number[];
  training_time: number;
  prediction_latency: number;
  model_size: number;
  last_trained: string;
  training_data_size: number;
  validation_data_size: number;
}

export interface ModelTrainingJob {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  started_at: string;
  completed_at?: string;
  config: MLModelConfig;
  data_range: {
    start_date: string;
    end_date: string;
  };
  metrics?: ModelPerformanceMetrics;
  error_message?: string;
  model_version: string;
  training_duration?: number;
}

export interface NavigationPattern {
  pattern_id: string;
  pattern_type: "sequential" | "cyclical" | "branching" | "converging";
  pages: string[];
  frequency: number;
  average_duration: number;
  user_segments: string[];
  confidence: number;
  discovered_at: string;
  last_seen: string;
}

export interface UserSegment {
  segment_id: string;
  name: string;
  description: string;
  criteria: {
    device_types: string[];
    behavior_patterns: string[];
    engagement_level: "low" | "medium" | "high";
    session_characteristics: {
      min_duration?: number;
      max_duration?: number;
      min_pages?: number;
      max_pages?: number;
    };
  };
  navigation_preferences: {
    preferred_paths: string[];
    avoided_pages: string[];
    optimal_timing: {
      hour_range: [number, number];
      day_preferences: string[];
    };
  };
  model_performance: {
    accuracy: number;
    sample_size: number;
  };
}

export interface NavigationContext {
  current_session: {
    id: string;
    start_time: string;
    pages_visited: string[];
    current_page: string;
    user_actions: Array<{
      type: string;
      timestamp: string;
      data: any;
    }>;
  };
  user_profile?: {
    segment: string;
    preferences: Record<string, any>;
    historical_patterns: string[];
  };
  environmental_factors: {
    time_of_day: string;
    device_context: string;
    traffic_source: string;
  };
}

export interface PredictionRequest {
  features: NavigationFeatures;
  context: NavigationContext;
  options: {
    num_predictions: number;
    include_reasoning: boolean;
    min_confidence: number;
    exclude_pages?: string[];
    preferred_categories?: string[];
  };
}

export interface PredictionResponse {
  predictions: NavigationPrediction[];
  recommendations: NavigationRecommendation[];
  user_segment: string;
  model_version: string;
  prediction_id: string;
  processing_time: number;
  fallback_used: boolean;
}

export interface MLModelState {
  is_loaded: boolean;
  model_version: string;
  last_updated: string;
  performance_metrics: ModelPerformanceMetrics;
  feature_names: string[];
  target_classes: string[];
  preprocessing_pipeline: {
    scalers: Record<string, any>;
    encoders: Record<string, any>;
    feature_selectors: Record<string, any>;
  };
}

export interface RealtimeMLConfig {
  enabled: boolean;
  prediction_interval: number; // milliseconds
  batch_size: number;
  cache_predictions: boolean;
  cache_ttl: number; // seconds
  fallback_strategy:
    | "random"
    | "popular_pages"
    | "user_history"
    | "static_rules";
  min_data_points: number;
  retrain_threshold: number; // accuracy drop threshold
  auto_retrain: boolean;
}

// Analytics and monitoring types
export interface ModelDrift {
  feature_drift: Record<string, number>;
  prediction_drift: number;
  performance_degradation: number;
  detected_at: string;
  severity: "low" | "medium" | "high" | "critical";
  recommended_action: "monitor" | "retrain" | "investigate" | "rollback";
}

export interface MLExperiment {
  experiment_id: string;
  name: string;
  description: string;
  model_variants: Array<{
    variant_id: string;
    config: MLModelConfig;
    traffic_allocation: number;
  }>;
  metrics_to_track: string[];
  success_criteria: Record<string, number>;
  start_date: string;
  end_date?: string;
  status: "draft" | "running" | "completed" | "cancelled";
  results?: {
    winner: string;
    statistical_significance: number;
    performance_comparison: Record<string, ModelPerformanceMetrics>;
  };
}
