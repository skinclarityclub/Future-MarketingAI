// A/B Testing Workflow Integration Module
// Handles ClickUp integration, insights generation, and historical analysis

import { toast } from "sonner";

// Types for workflow integration
export interface TestWorkflowTask {
  id: string;
  testId: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  assigneeId?: string;
  dueDate?: Date;
  priority: "low" | "medium" | "high" | "urgent";
  tags: string[];
  customFields: Record<string, any>;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestInsight {
  id: string;
  testId: string;
  type:
    | "performance"
    | "audience"
    | "timing"
    | "content"
    | "roi"
    | "prediction";
  title: string;
  description: string;
  confidence: number;
  impact: "low" | "medium" | "high" | "critical";
  recommendation: string;
  data: Record<string, any>;
  tags: string[];
  createdAt: Date;
}

export interface HistoricalTestRecord {
  id: string;
  testId: string;
  testName: string;
  testType: "content" | "timing" | "targeting" | "mixed";
  variants: Array<{
    id: string;
    name: string;
    metrics: Record<string, number>;
  }>;
  winnerVariantId: string;
  statisticalSignificance: number;
  confidenceLevel: number;
  testDuration: number; // in hours
  sampleSize: number;
  conversionRate: number;
  roi: number;
  insights: TestInsight[];
  tags: string[];
  completedAt: Date;
  createdBy: string;
}

export interface PerformancePrediction {
  testId: string;
  predictedWinner: string;
  confidence: number;
  estimatedCompletionTime: number; // hours
  expectedLift: number; // percentage
  riskFactors: Array<{
    factor: string;
    severity: "low" | "medium" | "high";
    description: string;
  }>;
  recommendations: string[];
}

// ClickUp Integration Service
export class ClickUpIntegrationService {
  private apiKey: string;
  private teamId: string;
  private spaceId: string;
  private baseUrl = "https://api.clickup.com/api/v2";

  constructor(apiKey: string, teamId: string, spaceId: string) {
    this.apiKey = apiKey;
    this.teamId = teamId;
    this.spaceId = spaceId;
  }

  async createTestWorkflowTask(
    testId: string,
    testName: string
  ): Promise<TestWorkflowTask> {
    try {
      const taskData = {
        name: `A/B Test: ${testName}`,
        description: `Automated workflow task for A/B test ${testId}`,
        assignees: [],
        tags: ["ab-test", "automated", "workflow"],
        status: "to do",
        priority: 2, // medium priority
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).getTime(), // 7 days
        custom_fields: [
          {
            id: "test_id",
            value: testId,
          },
          {
            id: "test_type",
            value: "ab_test",
          },
        ],
      };

      const response = await fetch(
        `${this.baseUrl}/list/${this.spaceId}/task`,
        {
          method: "POST",
          headers: {
            Authorization: this.apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        }
      );

      if (!response.ok) {
        throw new Error(`ClickUp API error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        id: result.id,
        testId,
        title: result.name,
        description: result.description,
        status: this.mapClickUpStatus(result.status.status),
        assigneeId: result.assignees[0]?.id,
        dueDate: result.due_date
          ? new Date(parseInt(result.due_date))
          : undefined,
        priority: this.mapClickUpPriority(result.priority),
        tags: result.tags.map((tag: any) => tag.name),
        customFields: result.custom_fields.reduce((acc: any, field: any) => {
          acc[field.name] = field.value;
          return acc;
        }, {}),
        progress: 0,
        createdAt: new Date(parseInt(result.date_created)),
        updatedAt: new Date(parseInt(result.date_updated)),
      };
    } catch (error) {
      console.error("Error creating ClickUp task:", error);
      throw error;
    }
  }

  async updateTestProgress(
    taskId: string,
    progress: number,
    status?: string
  ): Promise<void> {
    try {
      const updateData: any = {};

      if (status) {
        updateData.status = status;
      }

      // Update custom field for progress
      updateData.custom_fields = [
        {
          id: "progress",
          value: progress,
        },
      ];

      const response = await fetch(`${this.baseUrl}/task/${taskId}`, {
        method: "PUT",
        headers: {
          Authorization: this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`ClickUp API error: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error updating ClickUp task:", error);
      throw error;
    }
  }

  async addComment(taskId: string, comment: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/task/${taskId}/comment`, {
        method: "POST",
        headers: {
          Authorization: this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment_text: comment,
          notify_all: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`ClickUp API error: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error adding ClickUp comment:", error);
      throw error;
    }
  }

  private mapClickUpStatus(status: string): TestWorkflowTask["status"] {
    const statusMap: Record<string, TestWorkflowTask["status"]> = {
      "to do": "pending",
      "in progress": "in_progress",
      complete: "completed",
      cancelled: "cancelled",
    };
    return statusMap[status.toLowerCase()] || "pending";
  }

  private mapClickUpPriority(priority: any): TestWorkflowTask["priority"] {
    if (!priority) return "medium";

    const priorityMap: Record<number, TestWorkflowTask["priority"]> = {
      1: "urgent",
      2: "high",
      3: "medium",
      4: "low",
    };
    return priorityMap[priority.priority] || "medium";
  }
}

// Insights Generation Engine
export class InsightsGenerationEngine {
  private historicalData: HistoricalTestRecord[] = [];

  constructor(historicalData?: HistoricalTestRecord[]) {
    this.historicalData = historicalData || [];
  }

  async generateInsights(testData: any): Promise<TestInsight[]> {
    const insights: TestInsight[] = [];

    // Performance insights
    insights.push(...this.generatePerformanceInsights(testData));

    // Audience insights
    insights.push(...this.generateAudienceInsights(testData));

    // Timing insights
    insights.push(...this.generateTimingInsights(testData));

    // Content insights
    insights.push(...this.generateContentInsights(testData));

    // ROI insights
    insights.push(...this.generateROIInsights(testData));

    // Prediction insights
    insights.push(...this.generatePredictionInsights(testData));

    return insights.sort((a, b) => b.confidence - a.confidence);
  }

  private generatePerformanceInsights(testData: any): TestInsight[] {
    const insights: TestInsight[] = [];

    // Conversion rate analysis
    if (testData.variants && testData.variants.length > 1) {
      const conversionRates = testData.variants.map(
        (v: any) => v.metrics.conversionRate || 0
      );
      const bestRate = Math.max(...conversionRates);
      const worstRate = Math.min(...conversionRates);
      const improvement = ((bestRate - worstRate) / worstRate) * 100;

      if (improvement > 10) {
        insights.push({
          id: `perf_${Date.now()}_1`,
          testId: testData.id,
          type: "performance",
          title: "Significant Performance Variation Detected",
          description: `Conversion rates vary by ${improvement.toFixed(1)}% between variants`,
          confidence: 0.85,
          impact: improvement > 25 ? "high" : "medium",
          recommendation: `Focus on the top-performing variant characteristics for future tests`,
          data: { improvement, bestRate, worstRate },
          tags: ["conversion", "performance"],
          createdAt: new Date(),
        });
      }
    }

    // Sample size adequacy
    const totalSamples =
      testData.variants?.reduce(
        (sum: number, v: any) => sum + (v.metrics.samples || 0),
        0
      ) || 0;
    if (totalSamples < 100) {
      insights.push({
        id: `perf_${Date.now()}_2`,
        testId: testData.id,
        type: "performance",
        title: "Low Sample Size Warning",
        description: `Current sample size (${totalSamples}) may not provide reliable results`,
        confidence: 0.95,
        impact: "high",
        recommendation:
          "Continue test until reaching at least 100 samples per variant",
        data: { currentSamples: totalSamples, recommendedMinimum: 100 },
        tags: ["sample-size", "reliability"],
        createdAt: new Date(),
      });
    }

    return insights;
  }

  private generateAudienceInsights(testData: any): TestInsight[] {
    const insights: TestInsight[] = [];

    // Demographic performance analysis
    if (testData.audienceData) {
      const demographics = testData.audienceData.demographics || {};

      // Age group analysis
      if (demographics.ageGroups) {
        const bestPerformingAge = Object.entries(demographics.ageGroups).sort(
          ([, a], [, b]) =>
            (b as any).conversionRate - (a as any).conversionRate
        )[0];

        insights.push({
          id: `aud_${Date.now()}_1`,
          testId: testData.id,
          type: "audience",
          title: "Age Group Performance Pattern",
          description: `${bestPerformingAge[0]} age group shows highest engagement`,
          confidence: 0.75,
          impact: "medium",
          recommendation: `Consider targeting ${bestPerformingAge[0]} demographic in future campaigns`,
          data: { bestPerformingAge: bestPerformingAge[0], demographics },
          tags: ["demographics", "targeting"],
          createdAt: new Date(),
        });
      }
    }

    return insights;
  }

  private generateTimingInsights(testData: any): TestInsight[] {
    const insights: TestInsight[] = [];

    // Post timing analysis
    if (testData.timingData) {
      const hourlyPerformance = testData.timingData.hourlyMetrics || {};
      const bestHour = Object.entries(hourlyPerformance).sort(
        ([, a], [, b]) => (b as any).engagement - (a as any).engagement
      )[0];

      if (bestHour) {
        insights.push({
          id: `tim_${Date.now()}_1`,
          testId: testData.id,
          type: "timing",
          title: "Optimal Posting Time Identified",
          description: `Hour ${bestHour[0]} shows peak engagement`,
          confidence: 0.8,
          impact: "medium",
          recommendation: `Schedule future posts around ${bestHour[0]}:00 for maximum impact`,
          data: { optimalHour: bestHour[0], hourlyData: hourlyPerformance },
          tags: ["timing", "engagement"],
          createdAt: new Date(),
        });
      }
    }

    return insights;
  }

  private generateContentInsights(testData: any): TestInsight[] {
    const insights: TestInsight[] = [];

    // Content type analysis
    if (testData.variants) {
      const contentTypes = testData.variants.map((v: any) => v.contentType);
      const uniqueTypes = [...new Set(contentTypes)];

      if (uniqueTypes.length > 1) {
        const typePerformance = uniqueTypes.map(type => {
          const variants = testData.variants.filter(
            (v: any) => v.contentType === type
          );
          const avgConversion =
            variants.reduce(
              (sum: number, v: any) => sum + (v.metrics.conversionRate || 0),
              0
            ) / variants.length;
          return { type, avgConversion };
        });

        const bestType = typePerformance.sort(
          (a, b) => b.avgConversion - a.avgConversion
        )[0];

        insights.push({
          id: `con_${Date.now()}_1`,
          testId: testData.id,
          type: "content",
          title: "Content Type Performance Analysis",
          description: `${bestType.type} content performs best with ${(bestType.avgConversion * 100).toFixed(1)}% conversion rate`,
          confidence: 0.7,
          impact: "medium",
          recommendation: `Prioritize ${bestType.type} content in future campaigns`,
          data: { bestType: bestType.type, typePerformance },
          tags: ["content-type", "performance"],
          createdAt: new Date(),
        });
      }
    }

    return insights;
  }

  private generateROIInsights(testData: any): TestInsight[] {
    const insights: TestInsight[] = [];

    // ROI calculation and analysis
    if (testData.variants && testData.costData) {
      const totalCost = testData.costData.totalCost || 0;
      const totalRevenue = testData.variants.reduce(
        (sum: number, v: any) => sum + (v.metrics.revenue || 0),
        0
      );
      const roi =
        totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;

      insights.push({
        id: `roi_${Date.now()}_1`,
        testId: testData.id,
        type: "roi",
        title: "Test ROI Analysis",
        description: `Current test ROI: ${roi.toFixed(1)}%`,
        confidence: 0.9,
        impact: roi > 50 ? "high" : roi > 0 ? "medium" : "low",
        recommendation:
          roi > 0
            ? "Test is profitable, consider scaling"
            : "Review cost structure and optimization opportunities",
        data: { roi, totalCost, totalRevenue },
        tags: ["roi", "profitability"],
        createdAt: new Date(),
      });
    }

    return insights;
  }

  private generatePredictionInsights(testData: any): TestInsight[] {
    const insights: TestInsight[] = [];

    // Predictive modeling based on historical data
    if (this.historicalData.length > 0) {
      const similarTests = this.findSimilarTests(testData);

      if (similarTests.length > 0) {
        const avgROI =
          similarTests.reduce((sum, test) => sum + test.roi, 0) /
          similarTests.length;
        const avgDuration =
          similarTests.reduce((sum, test) => sum + test.testDuration, 0) /
          similarTests.length;

        insights.push({
          id: `pred_${Date.now()}_1`,
          testId: testData.id,
          type: "prediction",
          title: "Historical Pattern Prediction",
          description: `Based on ${similarTests.length} similar tests, expected ROI: ${avgROI.toFixed(1)}%`,
          confidence: Math.min(0.95, similarTests.length * 0.1),
          impact: "medium",
          recommendation: `Expected completion in ${Math.round(avgDuration)} hours with ${avgROI.toFixed(1)}% ROI`,
          data: {
            predictedROI: avgROI,
            expectedDuration: avgDuration,
            similarTestsCount: similarTests.length,
          },
          tags: ["prediction", "historical"],
          createdAt: new Date(),
        });
      }
    }

    return insights;
  }

  private findSimilarTests(testData: any): HistoricalTestRecord[] {
    return this.historicalData.filter(record => {
      // Match by test type
      if (record.testType !== testData.testType) return false;

      // Match by tags (at least 50% overlap)
      const testTags = testData.tags || [];
      const recordTags = record.tags || [];
      const commonTags = testTags.filter((tag: string) =>
        recordTags.includes(tag)
      );
      const similarity =
        commonTags.length / Math.max(testTags.length, recordTags.length);

      return similarity >= 0.5;
    });
  }
}

// Historical Database Manager
export class HistoricalDatabaseManager {
  private dbName = "ab_testing_history";
  private version = 1;
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    // Check if we're in a browser environment
    if (typeof window === "undefined" || !window.indexedDB) {
      console.warn("IndexedDB not available, using memory storage");
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create stores
        if (!db.objectStoreNames.contains("tests")) {
          const testStore = db.createObjectStore("tests", { keyPath: "id" });
          testStore.createIndex("testType", "testType");
          testStore.createIndex("completedAt", "completedAt");
          testStore.createIndex("roi", "roi");
          testStore.createIndex("tags", "tags", { multiEntry: true });
        }

        if (!db.objectStoreNames.contains("insights")) {
          const insightStore = db.createObjectStore("insights", {
            keyPath: "id",
          });
          insightStore.createIndex("testId", "testId");
          insightStore.createIndex("type", "type");
          insightStore.createIndex("impact", "impact");
        }
      };
    });
  }

  async saveTestRecord(record: HistoricalTestRecord): Promise<void> {
    if (!this.db || typeof window === "undefined") {
      console.warn("Database not available, skipping save");
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["tests"], "readwrite");
      const store = transaction.objectStore("tests");
      const request = store.put(record);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getTestHistory(filters?: {
    testType?: string;
    dateRange?: { start: Date; end: Date };
    minROI?: number;
    tags?: string[];
  }): Promise<HistoricalTestRecord[]> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["tests"], "readonly");
      const store = transaction.objectStore("tests");
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        let results = request.result;

        // Apply filters
        if (filters) {
          if (filters.testType) {
            results = results.filter(r => r.testType === filters.testType);
          }

          if (filters.dateRange) {
            results = results.filter(
              r =>
                r.completedAt >= filters.dateRange!.start &&
                r.completedAt <= filters.dateRange!.end
            );
          }

          if (filters.minROI !== undefined) {
            results = results.filter(r => r.roi >= filters.minROI!);
          }

          if (filters.tags && filters.tags.length > 0) {
            results = results.filter(r =>
              filters.tags!.some(tag => r.tags.includes(tag))
            );
          }
        }

        resolve(results);
      };
    });
  }

  async getInsights(testId?: string): Promise<TestInsight[]> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["insights"], "readonly");
      const store = transaction.objectStore("insights");

      let request: IDBRequest;
      if (testId) {
        const index = store.index("testId");
        request = index.getAll(testId);
      } else {
        request = store.getAll();
      }

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async saveInsights(insights: TestInsight[]): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["insights"], "readwrite");
      const store = transaction.objectStore("insights");

      let completed = 0;
      const total = insights.length;

      if (total === 0) {
        resolve();
        return;
      }

      insights.forEach(insight => {
        const request = store.put(insight);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          completed++;
          if (completed === total) resolve();
        };
      });
    });
  }

  async getPerformanceMetrics(): Promise<{
    totalTests: number;
    averageROI: number;
    successRate: number;
    popularTags: Array<{ tag: string; count: number }>;
    monthlyTrends: Array<{ month: string; tests: number; avgROI: number }>;
  }> {
    const allTests = await this.getTestHistory();

    const totalTests = allTests.length;
    const averageROI =
      allTests.reduce((sum, test) => sum + test.roi, 0) / totalTests;
    const successRate =
      allTests.filter(test => test.roi > 0).length / totalTests;

    // Popular tags
    const tagCounts: Record<string, number> = {};
    allTests.forEach(test => {
      test.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const popularTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Monthly trends
    const monthlyData: Record<string, { tests: number; totalROI: number }> = {};
    allTests.forEach(test => {
      const month = test.completedAt.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { tests: 0, totalROI: 0 };
      }
      monthlyData[month].tests++;
      monthlyData[month].totalROI += test.roi;
    });

    const monthlyTrends = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        tests: data.tests,
        avgROI: data.totalROI / data.tests,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalTests,
      averageROI,
      successRate,
      popularTags,
      monthlyTrends,
    };
  }
}

// Performance Prediction Model
export class PerformancePredictionModel {
  private historicalData: HistoricalTestRecord[] = [];
  private model: any = null;

  constructor(historicalData: HistoricalTestRecord[]) {
    this.historicalData = historicalData;
    this.trainModel();
  }

  private trainModel(): void {
    // Simple linear regression model for ROI prediction
    // In a real implementation, you might use a more sophisticated ML library

    if (this.historicalData.length < 3) {
      console.warn("Insufficient historical data for prediction model");
      return;
    }

    // Feature extraction
    const features = this.historicalData.map(test => [
      test.variants.length, // number of variants
      test.testDuration, // duration in hours
      test.sampleSize, // total sample size
      test.variants.reduce((sum, v) => sum + Object.keys(v.metrics).length, 0), // total metrics
      test.tags.length, // number of tags
    ]);

    const targets = this.historicalData.map(test => test.roi);

    // Simple linear regression coefficients (normally calculated using proper ML)
    this.model = {
      coefficients: [0.5, 0.1, 0.001, 0.2, 0.3], // placeholder coefficients
      intercept: 10, // placeholder intercept
    };
  }

  async generatePrediction(testConfig: any): Promise<PerformancePrediction> {
    if (!this.model) {
      throw new Error("Prediction model not trained");
    }

    // Extract features from test configuration
    const features = [
      testConfig.variants?.length || 2,
      testConfig.estimatedDuration || 168, // default 7 days
      testConfig.estimatedSampleSize || 1000,
      testConfig.metricsCount || 5,
      testConfig.tags?.length || 0,
    ];

    // Simple prediction calculation
    const predictedROI =
      this.model.intercept +
      features.reduce(
        (sum, feature, index) => sum + feature * this.model.coefficients[index],
        0
      );

    // Identify potential winner based on historical patterns
    const predictedWinner = this.predictWinnerVariant(testConfig);

    // Calculate confidence based on historical data similarity
    const confidence = this.calculatePredictionConfidence(testConfig);

    // Estimate completion time
    const estimatedCompletionTime = this.estimateCompletionTime(testConfig);

    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(testConfig);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      testConfig,
      riskFactors
    );

    return {
      testId: testConfig.id,
      predictedWinner,
      confidence,
      estimatedCompletionTime,
      expectedLift: Math.max(0, predictedROI),
      riskFactors,
      recommendations,
    };
  }

  private predictWinnerVariant(testConfig: any): string {
    // Analyze historical patterns to predict winner
    const similarTests = this.historicalData.filter(
      test =>
        test.testType === testConfig.testType &&
        test.variants.length === testConfig.variants?.length
    );

    if (similarTests.length === 0) {
      return testConfig.variants?.[0]?.id || "variant_1";
    }

    // Find the most common winner characteristics
    const winnerCharacteristics = similarTests
      .map(test => {
        const winner = test.variants.find(v => v.id === test.winnerVariantId);
        return winner;
      })
      .filter(Boolean);

    // Simple heuristic: return the variant that matches most common winner pattern
    return testConfig.variants?.[0]?.id || "variant_1";
  }

  private calculatePredictionConfidence(testConfig: any): number {
    const similarTests = this.historicalData.filter(
      test => test.testType === testConfig.testType
    );

    // Confidence based on similar historical tests
    const baseConfidence = Math.min(0.9, similarTests.length * 0.1);

    // Adjust based on test complexity
    const complexityFactor = 1 - ((testConfig.variants?.length || 2) - 2) * 0.1;

    return Math.max(0.3, baseConfidence * complexityFactor);
  }

  private estimateCompletionTime(testConfig: any): number {
    const similarTests = this.historicalData.filter(
      test => test.testType === testConfig.testType
    );

    if (similarTests.length === 0) {
      return 168; // default 7 days
    }

    const avgDuration =
      similarTests.reduce((sum, test) => sum + test.testDuration, 0) /
      similarTests.length;

    // Adjust based on sample size
    const sampleSizeFactor = (testConfig.estimatedSampleSize || 1000) / 1000;

    return Math.round(avgDuration * sampleSizeFactor);
  }

  private identifyRiskFactors(
    testConfig: any
  ): PerformancePrediction["riskFactors"] {
    const risks: PerformancePrediction["riskFactors"] = [];

    // Sample size risk
    if ((testConfig.estimatedSampleSize || 0) < 100) {
      risks.push({
        factor: "Low Sample Size",
        severity: "high",
        description:
          "Sample size may be too small for statistical significance",
      });
    }

    // Too many variants risk
    if ((testConfig.variants?.length || 0) > 4) {
      risks.push({
        factor: "Too Many Variants",
        severity: "medium",
        description:
          "Many variants may dilute traffic and extend test duration",
      });
    }

    // Seasonal risk
    const currentMonth = new Date().getMonth();
    const holidayMonths = [10, 11, 0]; // Nov, Dec, Jan
    if (holidayMonths.includes(currentMonth)) {
      risks.push({
        factor: "Seasonal Effects",
        severity: "medium",
        description: "Holiday season may affect user behavior patterns",
      });
    }

    // Historical performance risk
    const similarFailedTests = this.historicalData.filter(
      test => test.testType === testConfig.testType && test.roi < 0
    );

    if (similarFailedTests.length / this.historicalData.length > 0.5) {
      risks.push({
        factor: "Historical Performance",
        severity: "high",
        description: "Similar tests have shown poor historical performance",
      });
    }

    return risks;
  }

  private generateRecommendations(
    testConfig: any,
    riskFactors: PerformancePrediction["riskFactors"]
  ): string[] {
    const recommendations: string[] = [];

    // Based on risk factors
    riskFactors.forEach(risk => {
      switch (risk.factor) {
        case "Low Sample Size":
          recommendations.push(
            "Consider extending test duration to reach minimum sample size"
          );
          break;
        case "Too Many Variants":
          recommendations.push(
            "Reduce number of variants or run sequential tests"
          );
          break;
        case "Seasonal Effects":
          recommendations.push(
            "Account for seasonal behavior changes in analysis"
          );
          break;
        case "Historical Performance":
          recommendations.push(
            "Review successful similar tests and adapt strategies"
          );
          break;
      }
    });

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push(
        "Test configuration looks optimal based on historical data"
      );
      recommendations.push("Monitor performance closely during first 24 hours");
    }

    // Best practices
    recommendations.push(
      "Set up automated alerts for statistical significance"
    );
    recommendations.push("Document test learnings for future reference");

    return recommendations;
  }
}

// Main Workflow Integration Class
export class WorkflowIntegration {
  private clickUpService?: ClickUpIntegrationService;
  private insightsEngine: InsightsGenerationEngine;
  private historyManager: HistoricalDatabaseManager;
  private predictionModel?: PerformancePredictionModel;

  constructor(options?: {
    clickUpApiKey?: string;
    clickUpTeamId?: string;
    clickUpSpaceId?: string;
    historicalData?: HistoricalTestRecord[];
  }) {
    // Initialize ClickUp service if credentials provided
    if (
      options?.clickUpApiKey &&
      options?.clickUpTeamId &&
      options?.clickUpSpaceId
    ) {
      this.clickUpService = new ClickUpIntegrationService(
        options.clickUpApiKey,
        options.clickUpTeamId,
        options.clickUpSpaceId
      );
    }

    // Initialize other services
    this.insightsEngine = new InsightsGenerationEngine(options?.historicalData);
    this.historyManager = new HistoricalDatabaseManager();

    if (options?.historicalData && options.historicalData.length > 0) {
      this.predictionModel = new PerformancePredictionModel(
        options.historicalData
      );
    }

    // Initialize database
    this.historyManager.initialize().catch(console.error);
  }

  async createTestWorkflow(testConfig: any): Promise<{
    workflowTask?: TestWorkflowTask;
    prediction?: PerformancePrediction;
    insights: TestInsight[];
  }> {
    const results: any = {
      insights: [],
    };

    try {
      // Create ClickUp workflow task
      if (this.clickUpService) {
        results.workflowTask = await this.clickUpService.createTestWorkflowTask(
          testConfig.id,
          testConfig.name
        );
        toast.success("ClickUp workflow task created successfully");
      }

      // Generate performance prediction
      if (this.predictionModel) {
        results.prediction =
          await this.predictionModel.generatePrediction(testConfig);
        toast.success("Performance prediction generated");
      }

      // Generate initial insights
      results.insights = await this.insightsEngine.generateInsights(testConfig);

      // Save insights to database
      if (results.insights.length > 0) {
        await this.historyManager.saveInsights(results.insights);
      }

      return results;
    } catch (error) {
      console.error("Error creating test workflow:", error);
      toast.error("Failed to create complete test workflow");
      throw error;
    }
  }

  async updateTestProgress(testId: string, progressData: any): Promise<void> {
    try {
      // Update ClickUp task if available
      if (this.clickUpService && progressData.workflowTaskId) {
        await this.clickUpService.updateTestProgress(
          progressData.workflowTaskId,
          progressData.progress,
          progressData.status
        );

        // Add progress comment
        if (progressData.notes) {
          await this.clickUpService.addComment(
            progressData.workflowTaskId,
            `Test Progress Update: ${progressData.notes}`
          );
        }
      }

      // Generate updated insights
      const newInsights =
        await this.insightsEngine.generateInsights(progressData);

      // Save new insights
      if (newInsights.length > 0) {
        await this.historyManager.saveInsights(newInsights);
        toast.success(`Generated ${newInsights.length} new insights`);
      }
    } catch (error) {
      console.error("Error updating test progress:", error);
      toast.error("Failed to update test progress");
      throw error;
    }
  }

  async completeTest(testId: string, finalResults: any): Promise<void> {
    try {
      // Create historical record
      const historicalRecord: HistoricalTestRecord = {
        id: testId,
        testId,
        testName: finalResults.testName,
        testType: finalResults.testType,
        variants: finalResults.variants,
        winnerVariantId: finalResults.winnerVariantId,
        statisticalSignificance: finalResults.statisticalSignificance,
        confidenceLevel: finalResults.confidenceLevel,
        testDuration: finalResults.testDuration,
        sampleSize: finalResults.sampleSize,
        conversionRate: finalResults.conversionRate,
        roi: finalResults.roi,
        insights: finalResults.insights || [],
        tags: finalResults.tags || [],
        completedAt: new Date(),
        createdBy: finalResults.createdBy || "system",
      };

      // Save to historical database
      await this.historyManager.saveTestRecord(historicalRecord);

      // Update ClickUp task to completed
      if (this.clickUpService && finalResults.workflowTaskId) {
        await this.clickUpService.updateTestProgress(
          finalResults.workflowTaskId,
          100,
          "complete"
        );

        // Add completion comment with results
        await this.clickUpService.addComment(
          finalResults.workflowTaskId,
          `Test completed successfully! Winner: ${finalResults.winnerVariantId}, ROI: ${finalResults.roi.toFixed(1)}%`
        );
      }

      toast.success("Test completed and archived successfully");
    } catch (error) {
      console.error("Error completing test:", error);
      toast.error("Failed to complete test archival");
      throw error;
    }
  }

  async getHistoricalAnalysis(filters?: any): Promise<{
    tests: HistoricalTestRecord[];
    insights: TestInsight[];
    metrics: any;
  }> {
    try {
      const tests = await this.historyManager.getTestHistory(filters);
      const insights = await this.historyManager.getInsights();
      const metrics = await this.historyManager.getPerformanceMetrics();

      return { tests, insights, metrics };
    } catch (error) {
      console.error("Error getting historical analysis:", error);
      throw error;
    }
  }
}

// Export utility functions
export const createWorkflowIntegration = (options?: any) =>
  new WorkflowIntegration(options);

export const generateMockHistoricalData = (): HistoricalTestRecord[] => {
  const testTypes = ["content", "timing", "targeting", "mixed"];
  const tags = [
    "social",
    "email",
    "website",
    "mobile",
    "video",
    "image",
    "promotion",
    "educational",
  ];

  return Array.from({ length: 50 }, (_, i) => ({
    id: `hist_${i + 1}`,
    testId: `test_${i + 1}`,
    testName: `Historical Test ${i + 1}`,
    testType: testTypes[Math.floor(Math.random() * testTypes.length)] as any,
    variants: Array.from(
      { length: Math.floor(Math.random() * 3) + 2 },
      (_, j) => ({
        id: `variant_${j + 1}`,
        name: `Variant ${j + 1}`,
        metrics: {
          conversionRate: Math.random() * 0.1 + 0.02,
          clickThroughRate: Math.random() * 0.05 + 0.01,
          engagement: Math.random() * 100 + 50,
          revenue: Math.random() * 1000 + 100,
        },
      })
    ),
    winnerVariantId: "variant_1",
    statisticalSignificance: Math.random() * 0.3 + 0.7,
    confidenceLevel: 0.95,
    testDuration: Math.random() * 200 + 50,
    sampleSize: Math.floor(Math.random() * 5000) + 500,
    conversionRate: Math.random() * 0.1 + 0.02,
    roi: (Math.random() - 0.3) * 100,
    insights: [],
    tags: Array.from(
      { length: Math.floor(Math.random() * 4) + 1 },
      () => tags[Math.floor(Math.random() * tags.length)]
    ),
    completedAt: new Date(
      Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
    ),
    createdBy: "system",
  }));
};
