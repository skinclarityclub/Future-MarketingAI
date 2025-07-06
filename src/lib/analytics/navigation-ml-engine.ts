/**
 * Navigation ML Engine
 * Core machine learning engine for navigation prediction
 */

import {
  NavigationFeatures,
  NavigationPrediction,
  NavigationRecommendation,
  MLModelConfig,
  TrainingDataPoint,
  ModelPerformanceMetrics,
  PredictionRequest,
  PredictionResponse,
  MLModelState,
  RealtimeMLConfig,
  UserSegment,
} from "./ml-navigation-types";
import { NavigationDataProcessor } from "./navigation-data-processor";

export class NavigationMLEngine {
  private modelState: MLModelState;
  private config: RealtimeMLConfig;
  private dataProcessor: NavigationDataProcessor;
  private predictionCache: Map<
    string,
    { prediction: PredictionResponse; expires: number }
  >;
  private modelCache: Map<string, any>;

  constructor(config: RealtimeMLConfig) {
    this.config = config;
    this.dataProcessor = new NavigationDataProcessor();
    this.predictionCache = new Map();
    this.modelCache = new Map();

    this.modelState = {
      is_loaded: false,
      model_version: "1.0.0",
      last_updated: new Date().toISOString(),
      performance_metrics: this.getDefaultMetrics(),
      feature_names: this.getFeatureNames(),
      target_classes: [],
      preprocessing_pipeline: {
        scalers: {},
        encoders: {},
        feature_selectors: {},
      },
    };
  }

  /**
   * Train the navigation prediction model
   */
  async trainModel(
    trainingData: TrainingDataPoint[],
    modelConfig: MLModelConfig
  ): Promise<ModelPerformanceMetrics> {
    console.log(`Training model with ${trainingData.length} data points...`);

    try {
      // Prepare training data
      const { features, targets } = this.prepareTrainingData(trainingData);

      // Split data into train/validation sets
      const splitIndex = Math.floor(features.length * 0.8);
      const trainFeatures = features.slice(0, splitIndex);
      const trainTargets = targets.slice(0, splitIndex);
      const validationFeatures = features.slice(splitIndex);
      const validationTargets = targets.slice(splitIndex);

      // Train the model based on configuration
      const model = await this.trainModelWithConfig(
        trainFeatures,
        trainTargets,
        modelConfig
      );

      // Evaluate model performance
      const metrics = await this.evaluateModel(
        model,
        validationFeatures,
        validationTargets,
        modelConfig
      );

      // Update model state
      this.modelState = {
        is_loaded: true,
        model_version: `${Date.now()}`,
        last_updated: new Date().toISOString(),
        performance_metrics: metrics,
        feature_names: this.getFeatureNames(),
        target_classes: Array.from(new Set(targets)),
        preprocessing_pipeline: this.createPreprocessingPipeline(features),
      };

      // Cache the trained model
      this.modelCache.set(this.modelState.model_version, model);

      console.log(
        `Model training completed. Accuracy: ${metrics.accuracy.toFixed(3)}`
      );
      return metrics;
    } catch (error) {
      console.error("Error training model:", error);
      throw error;
    }
  }

  /**
   * Predict next navigation steps
   */
  async predict(request: PredictionRequest): Promise<PredictionResponse> {
    const startTime = Date.now();

    try {
      // Check cache first
      if (this.config.cache_predictions) {
        const cacheKey = this.generateCacheKey(request);
        const cached = this.predictionCache.get(cacheKey);
        if (cached && cached.expires > Date.now()) {
          return cached.prediction;
        }
      }

      // Ensure model is loaded
      if (!this.modelState.is_loaded) {
        throw new Error("Model not loaded. Please train the model first.");
      }

      // Get the current model
      const model = this.modelCache.get(this.modelState.model_version);
      if (!model) {
        throw new Error("Model not found in cache");
      }

      // Preprocess features
      const processedFeatures = this.preprocessFeatures(request.features);

      // Make predictions
      const predictions = await this.makePredictions(
        model,
        processedFeatures,
        request.options
      );

      // Generate recommendations
      const recommendations = await this.generateRecommendations(
        predictions,
        request.context,
        request.options
      );

      // Determine user segment
      const userSegment = await this.determineUserSegment(request.features);

      const response: PredictionResponse = {
        predictions,
        recommendations,
        user_segment: userSegment,
        model_version: this.modelState.model_version,
        prediction_id: `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        processing_time: Date.now() - startTime,
        fallback_used: false,
      };

      // Cache the response
      if (this.config.cache_predictions) {
        const cacheKey = this.generateCacheKey(request);
        this.predictionCache.set(cacheKey, {
          prediction: response,
          expires: Date.now() + this.config.cache_ttl * 1000,
        });
      }

      return response;
    } catch (error) {
      console.error("Error making prediction:", error);

      // Fallback strategy
      const fallbackResponse = await this.getFallbackPrediction(request);
      return {
        ...fallbackResponse,
        fallback_used: true,
        processing_time: Date.now() - startTime,
      };
    }
  }

  /**
   * Get real-time navigation recommendations
   */
  async getRealtimeRecommendations(
    sessionId: string,
    currentPage: string,
    userId?: string
  ): Promise<NavigationRecommendation[]> {
    try {
      // Extract current features
      const features = await this.dataProcessor.extractNavigationFeatures(
        sessionId,
        currentPage,
        userId
      );

      // Create prediction request
      const request: PredictionRequest = {
        features,
        context: {
          current_session: {
            id: sessionId,
            start_time: new Date().toISOString(),
            pages_visited: [currentPage],
            current_page: currentPage,
            user_actions: [],
          },
          environmental_factors: {
            time_of_day: new Date().getHours().toString(),
            device_context: features.device_type,
            traffic_source: features.traffic_source,
          },
        },
        options: {
          num_predictions: 5,
          include_reasoning: true,
          min_confidence: 0.1,
        },
      };

      // Get predictions
      const response = await this.predict(request);

      return response.recommendations;
    } catch (error) {
      console.error("Error getting realtime recommendations:", error);
      return [];
    }
  }

  /**
   * Update model with new data (online learning simulation)
   */
  async updateModel(newData: TrainingDataPoint[]): Promise<void> {
    try {
      if (!this.modelState.is_loaded) {
        console.warn("Model not loaded. Cannot update.");
        return;
      }

      // In a real implementation, this would perform incremental learning
      // For now, we'll simulate by retraining with a subset of new data
      console.log(`Updating model with ${newData.length} new data points...`);

      // Simple update simulation - in production, use proper online learning
      const currentMetrics = this.modelState.performance_metrics;
      const updatedMetrics = {
        ...currentMetrics,
        last_trained: new Date().toISOString(),
        training_data_size: currentMetrics.training_data_size + newData.length,
      };

      this.modelState.performance_metrics = updatedMetrics;
      console.log("Model updated successfully");
    } catch (error) {
      console.error("Error updating model:", error);
      throw error;
    }
  }

  /**
   * Get model performance metrics
   */
  getModelMetrics(): ModelPerformanceMetrics {
    return this.modelState.performance_metrics;
  }

  /**
   * Check if model needs retraining
   */
  needsRetraining(): boolean {
    const metrics = this.modelState.performance_metrics;
    const daysSinceTraining =
      (Date.now() - new Date(metrics.last_trained).getTime()) /
      (1000 * 60 * 60 * 24);

    return (
      metrics.accuracy < this.config.retrain_threshold ||
      daysSinceTraining > 7 || // Retrain weekly
      !this.modelState.is_loaded
    );
  }

  // Private methods

  private prepareTrainingData(trainingData: TrainingDataPoint[]): {
    features: number[][];
    targets: string[];
  } {
    const features: number[][] = [];
    const targets: string[] = [];

    for (const dataPoint of trainingData) {
      const featureVector = this.convertFeaturesToVector(dataPoint.features);
      features.push(featureVector);
      targets.push(dataPoint.target);
    }

    return { features, targets };
  }

  private convertFeaturesToVector(features: NavigationFeatures): number[] {
    const vector: number[] = [
      // Numerical features
      features.time_on_page,
      features.scroll_depth,
      features.clicks_on_page,
      features.session_duration,
      features.pages_visited_in_session,
      features.total_clicks_in_session,
      features.bounce_rate,
      features.hour_of_day,
      features.day_of_week,
      features.total_sessions,
      features.average_session_duration,
      features.form_interactions_count,
      features.search_queries_count,
      features.error_encounters,
      features.video_engagements,
      features.page_load_time,
      features.page_depth,

      // Categorical features (encoded)
      this.encodeDeviceType(features.device_type),
      this.encodeBrowser(features.browser),
      this.encodePageCategory(features.page_category),
      this.encodeTrafficSource(features.traffic_source),

      // Boolean features
      features.is_returning_visitor ? 1 : 0,
      features.is_weekend ? 1 : 0,
      features.has_forms ? 1 : 0,
      features.has_videos ? 1 : 0,
      features.has_downloads ? 1 : 0,
    ];

    return vector;
  }

  private async trainModelWithConfig(
    features: number[][],
    targets: string[],
    config: MLModelConfig
  ): Promise<any> {
    // Simulate different ML algorithms
    switch (config.model_type) {
      case "decision_tree":
        return this.trainDecisionTree(features, targets, config.parameters);
      case "random_forest":
        return this.trainRandomForest(features, targets, config.parameters);
      case "gradient_boosting":
        return this.trainGradientBoosting(features, targets, config.parameters);
      case "neural_network":
        return this.trainNeuralNetwork(features, targets, config.parameters);
      default:
        throw new Error(`Unsupported model type: ${config.model_type}`);
    }
  }

  private trainDecisionTree(
    features: number[][],
    targets: string[],
    params: any
  ): any {
    // Simplified decision tree implementation
    const model = {
      type: "decision_tree",
      parameters: params,
      tree: this.buildDecisionTree(features, targets, params.max_depth || 10),
      feature_names: this.getFeatureNames(),
    };

    return model;
  }

  private trainRandomForest(
    features: number[][],
    targets: string[],
    params: any
  ): any {
    // Simplified random forest implementation
    const nEstimators = params.n_estimators || 100;
    const trees = [];

    for (let i = 0; i < nEstimators; i++) {
      // Bootstrap sampling
      const bootstrapIndices = this.bootstrapSample(features.length);
      const bootstrapFeatures = bootstrapIndices.map(idx => features[idx]);
      const bootstrapTargets = bootstrapIndices.map(idx => targets[idx]);

      // Train individual tree
      const tree = this.buildDecisionTree(
        bootstrapFeatures,
        bootstrapTargets,
        params.max_depth || 10
      );

      trees.push(tree);
    }

    return {
      type: "random_forest",
      parameters: params,
      trees,
      feature_names: this.getFeatureNames(),
    };
  }

  private trainGradientBoosting(
    features: number[][],
    targets: string[],
    params: any
  ): any {
    // Simplified gradient boosting implementation
    return {
      type: "gradient_boosting",
      parameters: params,
      models: [], // Simplified - would contain sequence of weak learners
      feature_names: this.getFeatureNames(),
    };
  }

  private trainNeuralNetwork(
    features: number[][],
    targets: string[],
    params: any
  ): any {
    // Simplified neural network implementation
    return {
      type: "neural_network",
      parameters: params,
      weights: [], // Simplified - would contain network weights
      architecture: {
        input_size: features[0].length,
        hidden_layers: [64, 32],
        output_size: Array.from(new Set(targets)).length,
      },
      feature_names: this.getFeatureNames(),
    };
  }

  private buildDecisionTree(
    features: number[][],
    targets: string[],
    maxDepth: number
  ): any {
    // Simplified decision tree building
    if (maxDepth === 0 || features.length === 0) {
      return {
        type: "leaf",
        value: this.getMostCommonTarget(targets),
        samples: features.length,
      };
    }

    // Find best split
    const bestSplit = this.findBestSplit(features, targets);

    if (!bestSplit) {
      return {
        type: "leaf",
        value: this.getMostCommonTarget(targets),
        samples: features.length,
      };
    }

    // Split data
    const { leftFeatures, leftTargets, rightFeatures, rightTargets } =
      this.splitData(features, targets, bestSplit);

    return {
      type: "split",
      feature_index: bestSplit.featureIndex,
      threshold: bestSplit.threshold,
      left: this.buildDecisionTree(leftFeatures, leftTargets, maxDepth - 1),
      right: this.buildDecisionTree(rightFeatures, rightTargets, maxDepth - 1),
      samples: features.length,
    };
  }

  private async evaluateModel(
    model: any,
    validationFeatures: number[][],
    validationTargets: string[],
    config: MLModelConfig
  ): Promise<ModelPerformanceMetrics> {
    const predictions = validationFeatures.map(features =>
      this.predictSingle(model, features)
    );

    const accuracy = this.calculateAccuracy(predictions, validationTargets);
    const precision = this.calculatePrecision(predictions, validationTargets);
    const recall = this.calculateRecall(predictions, validationTargets);
    const f1Score = (2 * (precision * recall)) / (precision + recall);

    return {
      accuracy,
      precision,
      recall,
      f1_score: f1Score,
      auc_roc: 0.8, // Simplified
      confusion_matrix: this.calculateConfusionMatrix(
        predictions,
        validationTargets
      ),
      feature_importance: this.calculateFeatureImportance(model),
      cross_validation_scores: [accuracy], // Simplified
      training_time: 1000, // Simplified
      prediction_latency: 10, // Simplified
      model_size: 1024, // Simplified
      last_trained: new Date().toISOString(),
      training_data_size: validationFeatures.length * 4, // Estimate
      validation_data_size: validationFeatures.length,
    };
  }

  private async makePredictions(
    model: any,
    features: number[],
    options: any
  ): Promise<NavigationPrediction[]> {
    const predictions: NavigationPrediction[] = [];

    // Get top predictions
    const prediction = this.predictSingle(model, features);
    const probabilities = this.predictProbabilities(model, features);

    // Sort by probability and take top N
    const sortedPredictions = Object.entries(probabilities)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, options.num_predictions)
      .filter(([, prob]) => (prob as number) >= options.min_confidence);

    for (const [page, probability] of sortedPredictions) {
      predictions.push({
        predicted_page: page,
        confidence_score: probability as number,
        predicted_probability: probability as number,
        reasoning: this.generatePredictionReasoning(model, features, page),
        alternative_predictions: sortedPredictions
          .filter(([p]) => p !== page)
          .slice(0, 3)
          .map(([p, prob]) => ({
            page: p,
            probability: prob as number,
            reasoning: `Alternative path with ${((prob as number) * 100).toFixed(1)}% confidence`,
          })),
        feature_importance: this.calculateFeatureImportance(model),
        prediction_timestamp: new Date().toISOString(),
      });
    }

    return predictions;
  }

  private async generateRecommendations(
    predictions: NavigationPrediction[],
    context: any,
    options: any
  ): Promise<NavigationRecommendation[]> {
    const recommendations: NavigationRecommendation[] = [];

    for (const prediction of predictions) {
      recommendations.push({
        page_url: prediction.predicted_page,
        page_title: this.getPageTitle(prediction.predicted_page),
        recommendation_type: "next_page",
        confidence: prediction.confidence_score,
        reasoning: prediction.reasoning.join("; "),
        expected_engagement_score: prediction.confidence_score * 10,
        personalization_factors: Object.keys(
          prediction.feature_importance
        ).slice(0, 3),
        display_priority: predictions.indexOf(prediction) + 1,
      });
    }

    return recommendations;
  }

  private async determineUserSegment(
    features: NavigationFeatures
  ): Promise<string> {
    // Simple segmentation logic
    if (
      features.total_sessions > 10 &&
      features.average_session_duration > 300
    ) {
      return "power_users";
    } else if (
      features.device_type === "mobile" &&
      features.session_duration < 180
    ) {
      return "casual_browsers";
    } else {
      return "regular_users";
    }
  }

  private async getFallbackPrediction(
    request: PredictionRequest
  ): Promise<PredictionResponse> {
    // Implement fallback strategy
    const fallbackPages = ["/dashboard", "/reports", "/analytics"];

    const predictions: NavigationPrediction[] = fallbackPages.map(
      (page, index) => ({
        predicted_page: page,
        confidence_score: 0.3 - index * 0.1,
        predicted_probability: 0.3 - index * 0.1,
        reasoning: ["Fallback recommendation based on popular pages"],
        alternative_predictions: [],
        feature_importance: {},
        prediction_timestamp: new Date().toISOString(),
      })
    );

    const recommendations: NavigationRecommendation[] = predictions.map(
      (pred, index) => ({
        page_url: pred.predicted_page,
        page_title: this.getPageTitle(pred.predicted_page),
        recommendation_type: "content_suggestion",
        confidence: pred.confidence_score,
        reasoning: "Popular page recommendation",
        expected_engagement_score: pred.confidence_score * 10,
        personalization_factors: [],
        display_priority: index + 1,
      })
    );

    return {
      predictions,
      recommendations,
      user_segment: "unknown",
      model_version: "fallback",
      prediction_id: `fallback_${Date.now()}`,
      processing_time: 0,
      fallback_used: true,
    };
  }

  // Utility methods

  private getFeatureNames(): string[] {
    return [
      "time_on_page",
      "scroll_depth",
      "clicks_on_page",
      "session_duration",
      "pages_visited_in_session",
      "total_clicks_in_session",
      "bounce_rate",
      "hour_of_day",
      "day_of_week",
      "total_sessions",
      "average_session_duration",
      "form_interactions_count",
      "search_queries_count",
      "error_encounters",
      "video_engagements",
      "page_load_time",
      "page_depth",
      "device_type",
      "browser",
      "page_category",
      "traffic_source",
      "is_returning_visitor",
      "is_weekend",
      "has_forms",
      "has_videos",
      "has_downloads",
    ];
  }

  private getDefaultMetrics(): ModelPerformanceMetrics {
    return {
      accuracy: 0.0,
      precision: 0.0,
      recall: 0.0,
      f1_score: 0.0,
      auc_roc: 0.0,
      confusion_matrix: [],
      feature_importance: {},
      cross_validation_scores: [],
      training_time: 0,
      prediction_latency: 0,
      model_size: 0,
      last_trained: new Date().toISOString(),
      training_data_size: 0,
      validation_data_size: 0,
    };
  }

  private encodeDeviceType(deviceType: string): number {
    const mapping = { desktop: 0, tablet: 1, mobile: 2 };
    return mapping[deviceType as keyof typeof mapping] || 0;
  }

  private encodeBrowser(browser: string): number {
    const mapping = { chrome: 0, firefox: 1, safari: 2, edge: 3 };
    return mapping[browser.toLowerCase() as keyof typeof mapping] || 4;
  }

  private encodePageCategory(category: string): number {
    const mapping = {
      analytics: 0,
      reporting: 1,
      user_management: 2,
      configuration: 3,
      support: 4,
      general: 5,
    };
    return mapping[category as keyof typeof mapping] || 5;
  }

  private encodeTrafficSource(source: string): number {
    const mapping = { direct: 0, search: 1, social: 2, referral: 3 };
    return mapping[source as keyof typeof mapping] || 0;
  }

  private preprocessFeatures(features: NavigationFeatures): number[] {
    return this.convertFeaturesToVector(features);
  }

  private createPreprocessingPipeline(features: number[][]): any {
    // Simplified preprocessing pipeline
    return {
      scalers: { standard: "StandardScaler fitted" },
      encoders: { categorical: "LabelEncoder fitted" },
      feature_selectors: { variance: "VarianceThreshold fitted" },
    };
  }

  private generateCacheKey(request: PredictionRequest): string {
    return `${request.features.session_id}_${request.features.current_page}_${request.features.hour_of_day}`;
  }

  private predictSingle(model: any, features: number[]): string {
    // Simplified prediction logic
    if (model.type === "decision_tree") {
      return this.predictDecisionTree(model.tree, features);
    } else if (model.type === "random_forest") {
      return this.predictRandomForest(model.trees, features);
    }
    return "/dashboard"; // Default fallback
  }

  private predictDecisionTree(tree: any, features: number[]): string {
    if (tree.type === "leaf") {
      return tree.value;
    }

    const featureValue = features[tree.feature_index];
    if (featureValue <= tree.threshold) {
      return this.predictDecisionTree(tree.left, features);
    } else {
      return this.predictDecisionTree(tree.right, features);
    }
  }

  private predictRandomForest(trees: any[], features: number[]): string {
    const votes = new Map<string, number>();

    for (const tree of trees) {
      const prediction = this.predictDecisionTree(tree, features);
      votes.set(prediction, (votes.get(prediction) || 0) + 1);
    }

    let maxVotes = 0;
    let bestPrediction = "/dashboard";

    for (const [prediction, voteCount] of votes.entries()) {
      if (voteCount > maxVotes) {
        maxVotes = voteCount;
        bestPrediction = prediction;
      }
    }

    return bestPrediction;
  }

  private predictProbabilities(
    model: any,
    features: number[]
  ): Record<string, number> {
    // Simplified probability calculation
    const pages = [
      "/dashboard",
      "/reports",
      "/analytics",
      "/users",
      "/settings",
    ];
    const probabilities: Record<string, number> = {};

    pages.forEach((page, index) => {
      probabilities[page] = Math.random() * 0.8 + 0.1; // Random for simulation
    });

    // Normalize probabilities
    const total = Object.values(probabilities).reduce(
      (sum, prob) => sum + prob,
      0
    );
    Object.keys(probabilities).forEach(page => {
      probabilities[page] /= total;
    });

    return probabilities;
  }

  private generatePredictionReasoning(
    model: any,
    features: number[],
    page: string
  ): string[] {
    return [
      "Based on user's current page navigation pattern",
      "Similar users typically visit this page next",
      "Time of day suggests high engagement with this content",
    ];
  }

  private calculateFeatureImportance(model: any): Record<string, number> {
    const featureNames = this.getFeatureNames();
    const importance: Record<string, number> = {};

    featureNames.forEach((name, index) => {
      importance[name] = Math.random(); // Simplified for demo
    });

    return importance;
  }

  private getPageTitle(pageUrl: string): string {
    const titles: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/reports": "Reports",
      "/analytics": "Analytics",
      "/users": "User Management",
      "/settings": "Settings",
    };
    return titles[pageUrl] || "Page";
  }

  // Simplified ML utility methods
  private bootstrapSample(size: number): number[] {
    const indices = [];
    for (let i = 0; i < size; i++) {
      indices.push(Math.floor(Math.random() * size));
    }
    return indices;
  }

  private getMostCommonTarget(targets: string[]): string {
    const counts = new Map<string, number>();
    targets.forEach(target => {
      counts.set(target, (counts.get(target) || 0) + 1);
    });

    let maxCount = 0;
    let mostCommon = targets[0] || "/dashboard";

    for (const [target, count] of counts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = target;
      }
    }

    return mostCommon;
  }

  private findBestSplit(features: number[][], targets: string[]): any {
    // Simplified best split finding
    let bestGini = Infinity;
    let bestSplit = null;

    for (
      let featureIndex = 0;
      featureIndex < features[0].length;
      featureIndex++
    ) {
      const values = features.map(f => f[featureIndex]);
      const uniqueValues = Array.from(new Set(values)).sort((a, b) => a - b);

      for (let i = 0; i < uniqueValues.length - 1; i++) {
        const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2;
        const gini = this.calculateGiniImpurity(
          features,
          targets,
          featureIndex,
          threshold
        );

        if (gini < bestGini) {
          bestGini = gini;
          bestSplit = { featureIndex, threshold };
        }
      }
    }

    return bestSplit;
  }

  private calculateGiniImpurity(
    features: number[][],
    targets: string[],
    featureIndex: number,
    threshold: number
  ): number {
    const leftTargets = [];
    const rightTargets = [];

    for (let i = 0; i < features.length; i++) {
      if (features[i][featureIndex] <= threshold) {
        leftTargets.push(targets[i]);
      } else {
        rightTargets.push(targets[i]);
      }
    }

    const totalSize = targets.length;
    const leftSize = leftTargets.length;
    const rightSize = rightTargets.length;

    if (leftSize === 0 || rightSize === 0) return Infinity;

    const leftGini = this.gini(leftTargets);
    const rightGini = this.gini(rightTargets);

    return (
      (leftSize / totalSize) * leftGini + (rightSize / totalSize) * rightGini
    );
  }

  private gini(targets: string[]): number {
    const counts = new Map<string, number>();
    targets.forEach(target => {
      counts.set(target, (counts.get(target) || 0) + 1);
    });

    let gini = 1.0;
    const total = targets.length;

    for (const count of counts.values()) {
      const probability = count / total;
      gini -= probability * probability;
    }

    return gini;
  }

  private splitData(features: number[][], targets: string[], split: any): any {
    const leftFeatures = [];
    const leftTargets = [];
    const rightFeatures = [];
    const rightTargets = [];

    for (let i = 0; i < features.length; i++) {
      if (features[i][split.featureIndex] <= split.threshold) {
        leftFeatures.push(features[i]);
        leftTargets.push(targets[i]);
      } else {
        rightFeatures.push(features[i]);
        rightTargets.push(targets[i]);
      }
    }

    return { leftFeatures, leftTargets, rightFeatures, rightTargets };
  }

  private calculateAccuracy(predictions: string[], targets: string[]): number {
    const correct = predictions.filter(
      (pred, index) => pred === targets[index]
    ).length;
    return correct / predictions.length;
  }

  private calculatePrecision(predictions: string[], targets: string[]): number {
    // Simplified precision calculation
    return this.calculateAccuracy(predictions, targets);
  }

  private calculateRecall(predictions: string[], targets: string[]): number {
    // Simplified recall calculation
    return this.calculateAccuracy(predictions, targets);
  }

  private calculateConfusionMatrix(
    predictions: string[],
    targets: string[]
  ): number[][] {
    // Simplified confusion matrix
    const uniqueTargets = Array.from(new Set(targets));
    const matrix = Array(uniqueTargets.length)
      .fill(0)
      .map(() => Array(uniqueTargets.length).fill(0));

    for (let i = 0; i < predictions.length; i++) {
      const predIndex = uniqueTargets.indexOf(predictions[i]);
      const targetIndex = uniqueTargets.indexOf(targets[i]);
      if (predIndex >= 0 && targetIndex >= 0) {
        matrix[targetIndex][predIndex]++;
      }
    }

    return matrix;
  }
}
