/**
 * Context-Aware Data Integrator
 * Intelligent data source integration using ML-driven context recognition
 * Task 19.4: Integrate Data Sources for Comprehensive Contextual Responses
 */

import {
  contextRecognitionEngine,
  type SemanticAnalysis,
  type BusinessEntity,
} from "../ml/context-recognition-models";
import { getDataSources, type DataSourceName } from "../data-source-registry";
import { createClient } from "@/lib/supabase/server";
import type {
  ConversationEntry,
  SessionMemory,
  UserProfile,
} from "../context/types";

// Core Integration Interfaces
export interface ContextualDataRequest {
  query: string;
  userId: string;
  userRole: string;
  conversationHistory: ConversationEntry[];
  sessionMemory: SessionMemory;
  userProfile: UserProfile;
  permissions: string[];
  timeframe?: {
    startDate: string;
    endDate: string;
  };
  maxResultsPerSource?: number;
}

export interface ContextualDataResponse {
  success: boolean;
  data: IntegratedDataSet;
  contextAnalysis: {
    relevantSources: DataSourceRelevance[];
    semanticAnalysis: SemanticAnalysis;
    confidence: number;
    processingTime: number;
  };
  recommendations: {
    additionalSources: string[];
    suggestedQueries: string[];
    relatedInsights: string[];
  };
  metadata: {
    totalRecords: number;
    sourcesQueried: string[];
    cacheHits: number;
    errors: DataSourceError[];
  };
}

export interface IntegratedDataSet {
  shopify?: ShopifyContextualData;
  kajabi?: KajabiContextualData;
  supabase?: SupabaseContextualData;
  marketing?: MarketingContextualData;
  financial?: FinancialContextualData;
  unified?: UnifiedContextualData;
}

export interface DataSourceRelevance {
  source: DataSourceName;
  relevanceScore: number;
  reasoning: string[];
  estimatedRecords: number;
  priority: "high" | "medium" | "low";
  confidence: number;
}

export interface ShopifyContextualData {
  products?: Product[];
  orders?: Order[];
  customers?: Customer[];
  analytics?: ShopifyAnalytics[];
  inventory?: InventoryData[];
  contextualInsights: BusinessInsight[];
}

export interface KajabiContextualData {
  courses?: Course[];
  purchases?: Purchase[];
  engagement?: EngagementData[];
  people?: Person[];
  analytics?: KajabiAnalytics[];
  contextualInsights: BusinessInsight[];
}

export interface SupabaseContextualData {
  unifiedCustomers?: UnifiedCustomer[];
  businessKpis?: BusinessKpi[];
  customerTouchpoints?: CustomerTouchpoint[];
  aiInsights?: AiInsight[];
  performanceMetrics?: PerformanceMetric[];
  contextualInsights: BusinessInsight[];
}

export interface MarketingContextualData {
  campaigns?: MarketingCampaign[];
  adPerformance?: AdPerformance[];
  socialEngagement?: SocialEngagement[];
  leadGeneration?: LeadData[];
  conversionFunnels?: ConversionData[];
  contextualInsights: BusinessInsight[];
}

export interface FinancialContextualData {
  revenue?: RevenueData[];
  expenses?: ExpenseData[];
  profitability?: ProfitabilityData[];
  forecasts?: FinancialForecast[];
  budgets?: BudgetData[];
  contextualInsights: BusinessInsight[];
}

export interface UnifiedContextualData {
  customerJourney?: CustomerJourneyData[];
  crossPlatformMetrics?: CrossPlatformMetric[];
  businessTrends?: BusinessTrend[];
  predictiveInsights?: PredictiveInsight[];
  contextualSummary: string;
}

export interface BusinessInsight {
  insight: string;
  confidence: number;
  supportingData: any[];
  businessImpact: "high" | "medium" | "low";
  actionable: boolean;
  timeRelevance: "immediate" | "short_term" | "long_term";
}

export interface DataSourceError {
  source: string;
  error: string;
  severity: "low" | "medium" | "high";
  fallbackApplied: boolean;
}

// Supporting Types
interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  salesData?: SalesMetric[];
}

interface Order {
  id: string;
  customerId: string;
  total: number;
  date: string;
  products: string[];
}

interface Customer {
  id: string;
  email: string;
  name: string;
  totalSpent: number;
  lastOrderDate?: string;
}

interface Course {
  id: string;
  title: string;
  price: number;
  enrollments: number;
  completionRate: number;
}

interface SalesMetric {
  date: string;
  revenue: number;
  units: number;
  conversionRate: number;
}

// Main Context-Aware Data Integrator
export class ContextAwareDataIntegrator {
  private static instance: ContextAwareDataIntegrator;
  private supabase = createClient();
  private dataSourceCache: Map<string, { data: any; timestamp: number }> =
    new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): ContextAwareDataIntegrator {
    if (!ContextAwareDataIntegrator.instance) {
      ContextAwareDataIntegrator.instance = new ContextAwareDataIntegrator();
    }
    return ContextAwareDataIntegrator.instance;
  }

  /**
   * Main intelligent data integration function
   * Uses ML context recognition to determine relevant data sources and fetch contextual data
   */
  async integrateContextualData(
    request: ContextualDataRequest
  ): Promise<ContextualDataResponse> {
    const startTime = Date.now();
    const errors: DataSourceError[] = [];

    try {
      // Step 1: Analyze query context using ML models
      const contextAnalysis = await contextRecognitionEngine.recognizeContext(
        request.query,
        request.conversationHistory,
        request.userProfile,
        request.sessionMemory,
        request.userRole,
        request.permissions
      );

      // Step 2: Determine relevant data sources based on context
      const relevantSources = await this.determineRelevantDataSources(
        contextAnalysis.semanticAnalysis,
        request.permissions,
        request.userRole
      );

      // Step 3: Intelligent data fetching from relevant sources
      const integratedData = await this.fetchContextualDataFromSources(
        relevantSources,
        contextAnalysis.semanticAnalysis,
        request
      );

      // Step 4: Generate contextual insights and recommendations
      const recommendations = await this.generateContextualRecommendations(
        contextAnalysis.semanticAnalysis,
        integratedData,
        request.userProfile
      );

      // Step 5: Create unified contextual data if multiple sources involved
      if (Object.keys(integratedData).length > 1) {
        integratedData.unified = await this.createUnifiedContextualData(
          integratedData,
          contextAnalysis.semanticAnalysis
        );
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: integratedData,
        contextAnalysis: {
          relevantSources,
          semanticAnalysis: contextAnalysis.semanticAnalysis,
          confidence: contextAnalysis.confidence,
          processingTime: contextAnalysis.processingTime,
        },
        recommendations,
        metadata: {
          totalRecords: this.countTotalRecords(integratedData),
          sourcesQueried: relevantSources.map(s => s.source),
          cacheHits: this.getCacheHitCount(),
          errors,
        },
      };
    } catch (error) {
      console.error("Context-aware data integration failed:", error);
      return this.createFallbackResponse(
        request,
        errors,
        Date.now() - startTime
      );
    }
  }

  /**
   * Determine which data sources are most relevant based on semantic analysis
   */
  private async determineRelevantDataSources(
    semanticAnalysis: SemanticAnalysis,
    permissions: string[],
    userRole: string
  ): Promise<DataSourceRelevance[]> {
    const relevantSources: DataSourceRelevance[] = [];

    // Analyze business entities to determine source relevance
    const businessIntent = semanticAnalysis.businessIntent;
    const entities = semanticAnalysis.entities;

    // Shopify relevance
    if (this.isShopifyRelevant(businessIntent, entities, permissions)) {
      relevantSources.push({
        source: "shopify",
        relevanceScore: this.calculateShopifyRelevance(
          businessIntent,
          entities
        ),
        reasoning: this.getShopifyRelevanceReasons(businessIntent, entities),
        estimatedRecords: 100,
        priority: this.getSourcePriority(businessIntent, "shopify"),
        confidence: 0.85,
      });
    }

    // Kajabi relevance
    if (this.isKajabiRelevant(businessIntent, entities, permissions)) {
      relevantSources.push({
        source: "kajabi",
        relevanceScore: this.calculateKajabiRelevance(businessIntent, entities),
        reasoning: this.getKajabiRelevanceReasons(businessIntent, entities),
        estimatedRecords: 75,
        priority: this.getSourcePriority(businessIntent, "kajabi"),
        confidence: 0.8,
      });
    }

    // Supabase relevance (always relevant for unified data)
    relevantSources.push({
      source: "supabase_customer",
      relevanceScore: this.calculateSupabaseRelevance(businessIntent, entities),
      reasoning: this.getSupabaseRelevanceReasons(businessIntent, entities),
      estimatedRecords: 200,
      priority: this.getSourcePriority(businessIntent, "supabase"),
      confidence: 0.9,
    });

    // Marketing relevance
    if (this.isMarketingRelevant(businessIntent, entities, permissions)) {
      relevantSources.push({
        source: "marketing",
        relevanceScore: this.calculateMarketingRelevance(
          businessIntent,
          entities
        ),
        reasoning: this.getMarketingRelevanceReasons(businessIntent, entities),
        estimatedRecords: 50,
        priority: this.getSourcePriority(businessIntent, "marketing"),
        confidence: 0.75,
      });
    }

    // Sort by relevance score
    return relevantSources.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Fetch contextual data from determined relevant sources
   */
  private async fetchContextualDataFromSources(
    relevantSources: DataSourceRelevance[],
    semanticAnalysis: SemanticAnalysis,
    request: ContextualDataRequest
  ): Promise<IntegratedDataSet> {
    const integratedData: IntegratedDataSet = {};
    const dataSources = getDataSources();

    // Parallel data fetching from relevant sources
    const fetchPromises = relevantSources.map(async sourceRelevance => {
      try {
        const sourceName = sourceRelevance.source;
        const source = dataSources[sourceName];

        if (!source) {
          console.warn(`Data source ${sourceName} not found`);
          return;
        }

        // Generate contextual queries based on semantic analysis
        const contextualQueries = this.generateContextualQueries(
          sourceName,
          semanticAnalysis,
          request
        );

        // Fetch data with contextual queries
        const sourceData = await this.fetchDataWithContext(
          source,
          contextualQueries,
          semanticAnalysis,
          request
        );

        // Add contextual insights
        const contextualInsights = await this.generateSourceContextualInsights(
          sourceName,
          sourceData,
          semanticAnalysis
        );

        // Store data based on source type
        switch (sourceName) {
          case "shopify":
            integratedData.shopify = {
              ...sourceData,
              contextualInsights,
            };
            break;
          case "kajabi":
            integratedData.kajabi = {
              ...sourceData,
              contextualInsights,
            };
            break;
          case "supabase_customer":
          case "supabase_financial":
            integratedData.supabase = {
              ...integratedData.supabase,
              ...sourceData,
              contextualInsights: [
                ...(integratedData.supabase?.contextualInsights || []),
                ...contextualInsights,
              ],
            };
            break;
          case "marketing":
            integratedData.marketing = {
              ...sourceData,
              contextualInsights,
            };
            break;
        }
      } catch (error) {
        console.error(
          `Failed to fetch data from ${sourceRelevance.source}:`,
          error
        );
      }
    });

    await Promise.all(fetchPromises);
    return integratedData;
  }

  /**
   * Generate contextual queries based on semantic analysis and business intent
   */
  private generateContextualQueries(
    sourceName: DataSourceName,
    semanticAnalysis: SemanticAnalysis,
    request: ContextualDataRequest
  ): any[] {
    const businessIntent = semanticAnalysis.businessIntent;
    const entities = semanticAnalysis.entities;
    const queries: any[] = [];

    const timeframe = request.timeframe || {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
    };

    switch (sourceName) {
      case "shopify":
        queries.push(
          ...this.generateShopifyQueries(businessIntent, entities, timeframe)
        );
        break;
      case "kajabi":
        queries.push(
          ...this.generateKajabiQueries(businessIntent, entities, timeframe)
        );
        break;
      case "supabase_customer":
        queries.push(
          ...this.generateSupabaseQueries(businessIntent, entities, timeframe)
        );
        break;
      case "marketing":
        queries.push(
          ...this.generateMarketingQueries(businessIntent, entities, timeframe)
        );
        break;
    }

    return queries;
  }

  /**
   * Generate Shopify-specific queries based on business intent
   */
  private generateShopifyQueries(
    businessIntent: any,
    entities: BusinessEntity[],
    timeframe: any
  ): any[] {
    const queries: any[] = [];

    // Product analysis queries
    if (
      businessIntent.businessCategory === "analytics" ||
      entities.some(e => e.type === "product")
    ) {
      queries.push({
        type: "products",
        params: {
          limit: 50,
          status: "active",
        },
      });
    }

    // Sales analysis queries
    if (
      businessIntent.businessCategory === "finance" ||
      entities.some(e => e.type === "metric" && e.entity.includes("revenue"))
    ) {
      queries.push({
        type: "orders",
        params: {
          limit: 100,
          created_after: timeframe.startDate,
          created_before: timeframe.endDate,
          status: "any",
        },
      });
    }

    // Customer analysis queries
    if (
      businessIntent.businessCategory === "customer_service" ||
      entities.some(e => e.type === "customer_segment")
    ) {
      queries.push({
        type: "customers",
        params: {
          limit: 100,
          created_after: timeframe.startDate,
        },
      });
    }

    return queries;
  }

  /**
   * Generate Kajabi-specific queries based on business intent
   */
  private generateKajabiQueries(
    businessIntent: any,
    entities: BusinessEntity[],
    timeframe: any
  ): any[] {
    const queries: any[] = [];

    // Course analysis queries
    if (
      businessIntent.businessCategory === "analytics" ||
      entities.some(
        e => e.entity.includes("course") || e.entity.includes("content")
      )
    ) {
      queries.push({
        type: "products",
        params: {
          limit: 50,
          type: "course",
        },
      });
    }

    // Sales analysis queries
    if (
      businessIntent.businessCategory === "finance" ||
      entities.some(e => e.type === "metric" && e.entity.includes("revenue"))
    ) {
      queries.push({
        type: "purchases",
        params: {
          limit: 100,
          created_after: timeframe.startDate,
          created_before: timeframe.endDate,
        },
      });
    }

    // Engagement analysis queries
    if (
      businessIntent.businessCategory === "marketing" ||
      entities.some(e => e.entity.includes("engagement"))
    ) {
      queries.push({
        type: "content-engagement",
        params: {
          startDate: timeframe.startDate,
          endDate: timeframe.endDate,
        },
      });
    }

    return queries;
  }

  /**
   * Generate Supabase-specific queries based on business intent
   */
  private generateSupabaseQueries(
    businessIntent: any,
    entities: BusinessEntity[],
    timeframe: any
  ): any[] {
    const queries: any[] = [];

    // Always include unified customer data for comprehensive context
    queries.push({
      table: "unified_customers",
      select: "*",
      filters: {
        created_at: { gte: timeframe.startDate },
        customer_status: { neq: "deleted" },
      },
      limit: 100,
    });

    // Business KPI queries for financial analysis
    if (
      businessIntent.businessCategory === "finance" ||
      businessIntent.businessCategory === "analytics"
    ) {
      queries.push({
        table: "business_kpi_daily",
        select: "*",
        filters: {
          date: { gte: timeframe.startDate, lte: timeframe.endDate },
        },
        limit: 30,
      });
    }

    // Customer touchpoint analysis
    if (
      businessIntent.businessCategory === "customer_service" ||
      businessIntent.businessCategory === "marketing"
    ) {
      queries.push({
        table: "customer_touchpoints",
        select: "*",
        filters: {
          timestamp: { gte: timeframe.startDate, lte: timeframe.endDate },
        },
        limit: 200,
      });
    }

    return queries;
  }

  /**
   * Generate Marketing-specific queries based on business intent
   */
  private generateMarketingQueries(
    businessIntent: any,
    entities: BusinessEntity[],
    timeframe: any
  ): any[] {
    const queries: any[] = [];

    // Campaign performance queries
    if (
      businessIntent.businessCategory === "marketing" ||
      entities.some(e => e.entity.includes("campaign"))
    ) {
      queries.push({
        type: "campaign-performance",
        params: {
          startDate: timeframe.startDate,
          endDate: timeframe.endDate,
          limit: 50,
        },
      });
    }

    // Ad performance queries
    if (
      businessIntent.businessCategory === "marketing" ||
      entities.some(
        e => e.entity.includes("ad") || e.entity.includes("conversion")
      )
    ) {
      queries.push({
        type: "ad-performance",
        params: {
          startDate: timeframe.startDate,
          endDate: timeframe.endDate,
          limit: 100,
        },
      });
    }

    return queries;
  }

  /**
   * Fetch data with contextual understanding
   */
  private async fetchDataWithContext(
    source: any,
    queries: any[],
    semanticAnalysis: SemanticAnalysis,
    request: ContextualDataRequest
  ): Promise<any> {
    const sourceData: any = {};

    for (const query of queries) {
      try {
        // Check cache first
        const cacheKey = `${source.name}-${JSON.stringify(query)}`;
        const cached = this.dataSourceCache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
          Object.assign(sourceData, cached.data);
          continue;
        }

        // Fetch data from source
        let data;
        if (
          source.name === "supabase_customer" ||
          source.name === "supabase_financial"
        ) {
          data = await this.fetchSupabaseData(query);
        } else {
          data = await source.fetch(query);
        }

        // Cache the result
        this.dataSourceCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });

        // Process and filter data based on context
        const contextualData = this.applyContextualFiltering(
          data,
          semanticAnalysis,
          request.userRole,
          request.permissions
        );

        Object.assign(sourceData, contextualData);
      } catch (error) {
        console.error(`Failed to fetch data with query:`, query, error);
      }
    }

    return sourceData;
  }

  /**
   * Fetch data from Supabase with proper error handling
   */
  private async fetchSupabaseData(query: any): Promise<any> {
    try {
      const supabase = await this.supabase;
      let queryBuilder = supabase.from(query.table).select(query.select);

      // Apply filters
      if (query.filters) {
        Object.entries(query.filters).forEach(
          ([column, filter]: [string, any]) => {
            if (filter.gte) queryBuilder = queryBuilder.gte(column, filter.gte);
            if (filter.lte) queryBuilder = queryBuilder.lte(column, filter.lte);
            if (filter.eq) queryBuilder = queryBuilder.eq(column, filter.eq);
            if (filter.neq) queryBuilder = queryBuilder.neq(column, filter.neq);
          }
        );
      }

      // Apply limit and ordering
      if (query.limit) queryBuilder = queryBuilder.limit(query.limit);
      if (query.order)
        queryBuilder = queryBuilder.order(query.order.column, {
          ascending: query.order.ascending,
        });

      const { data, error } = await queryBuilder;

      if (error) {
        throw error;
      }

      return { [query.table]: data };
    } catch (error) {
      console.error("Supabase query failed:", error);
      return {};
    }
  }

  /**
   * Apply contextual filtering based on user role and permissions
   */
  private applyContextualFiltering(
    data: any,
    semanticAnalysis: SemanticAnalysis,
    userRole: string,
    permissions: string[]
  ): any {
    // Apply role-based filtering
    const filteredData = this.applyRoleBasedFiltering(
      data,
      userRole,
      permissions
    );

    // Apply semantic relevance filtering
    const relevantData = this.applySemanticFiltering(
      filteredData,
      semanticAnalysis
    );

    return relevantData;
  }

  /**
   * Apply role-based data filtering
   */
  private applyRoleBasedFiltering(
    data: any,
    userRole: string,
    permissions: string[]
  ): any {
    // Implement role-based filtering logic
    // For now, return all data for admin users, filtered for others
    if (userRole === "admin" || userRole === "system") {
      return data;
    }

    // Filter based on permissions
    const filteredData: any = {};
    Object.keys(data).forEach(key => {
      if (this.hasPermissionForData(key, permissions)) {
        filteredData[key] = data[key];
      }
    });

    return filteredData;
  }

  /**
   * Apply semantic filtering based on context analysis
   */
  private applySemanticFiltering(
    data: any,
    semanticAnalysis: SemanticAnalysis
  ): any {
    // Filter data based on semantic relevance
    const entities = semanticAnalysis.entities;
    const businessIntent = semanticAnalysis.businessIntent;

    // For now, return all data - in production, implement sophisticated filtering
    return data;
  }

  /**
   * Generate contextual insights for specific data sources
   */
  private async generateSourceContextualInsights(
    sourceName: string,
    sourceData: any,
    semanticAnalysis: SemanticAnalysis
  ): Promise<BusinessInsight[]> {
    const insights: BusinessInsight[] = [];

    // Generate source-specific insights
    switch (sourceName) {
      case "shopify":
        insights.push(
          ...this.generateShopifyInsights(sourceData, semanticAnalysis)
        );
        break;
      case "kajabi":
        insights.push(
          ...this.generateKajabiInsights(sourceData, semanticAnalysis)
        );
        break;
      case "supabase_customer":
        insights.push(
          ...this.generateSupabaseInsights(sourceData, semanticAnalysis)
        );
        break;
      case "marketing":
        insights.push(
          ...this.generateMarketingInsights(sourceData, semanticAnalysis)
        );
        break;
    }

    return insights;
  }

  /**
   * Generate contextual recommendations for additional data exploration
   */
  private async generateContextualRecommendations(
    semanticAnalysis: SemanticAnalysis,
    integratedData: IntegratedDataSet,
    userProfile: UserProfile
  ): Promise<ContextualDataResponse["recommendations"]> {
    const businessIntent = semanticAnalysis.businessIntent;
    const entities = semanticAnalysis.entities;

    return {
      additionalSources: this.suggestAdditionalSources(
        businessIntent,
        entities,
        integratedData
      ),
      suggestedQueries: this.generateSuggestedQueries(
        businessIntent,
        entities,
        userProfile
      ),
      relatedInsights: this.generateRelatedInsights(
        semanticAnalysis,
        integratedData
      ),
    };
  }

  /**
   * Create unified contextual data from multiple sources
   */
  private async createUnifiedContextualData(
    integratedData: IntegratedDataSet,
    semanticAnalysis: SemanticAnalysis
  ): Promise<UnifiedContextualData> {
    // Combine data from multiple sources into unified insights
    const unifiedData: UnifiedContextualData = {
      contextualSummary: this.generateContextualSummary(
        integratedData,
        semanticAnalysis
      ),
    };

    // Generate cross-platform metrics if we have multiple sources
    if (this.hasMultipleSources(integratedData)) {
      unifiedData.crossPlatformMetrics =
        this.generateCrossPlatformMetrics(integratedData);
    }

    // Generate customer journey data if customer data is available
    if (
      integratedData.shopify ||
      integratedData.kajabi ||
      integratedData.supabase
    ) {
      unifiedData.customerJourney =
        this.generateCustomerJourneyData(integratedData);
    }

    return unifiedData;
  }

  // Helper methods for relevance calculation
  private isShopifyRelevant(
    businessIntent: any,
    entities: BusinessEntity[],
    permissions: string[]
  ): boolean {
    return (
      permissions.includes("read:shopify_data") ||
      businessIntent.businessCategory === "finance" ||
      entities.some(e => e.type === "product" || e.entity.includes("revenue"))
    );
  }

  private isKajabiRelevant(
    businessIntent: any,
    entities: BusinessEntity[],
    permissions: string[]
  ): boolean {
    return (
      permissions.includes("read:kajabi_data") ||
      businessIntent.businessCategory === "marketing" ||
      entities.some(
        e => e.entity.includes("course") || e.entity.includes("content")
      )
    );
  }

  private isMarketingRelevant(
    businessIntent: any,
    entities: BusinessEntity[],
    permissions: string[]
  ): boolean {
    return (
      permissions.includes("read:marketing_data") ||
      businessIntent.businessCategory === "marketing" ||
      entities.some(
        e => e.entity.includes("campaign") || e.entity.includes("ad")
      )
    );
  }

  private calculateShopifyRelevance(
    businessIntent: any,
    entities: BusinessEntity[]
  ): number {
    let score = 0.5; // Base relevance
    if (businessIntent.businessCategory === "finance") score += 0.3;
    if (entities.some(e => e.type === "product")) score += 0.2;
    return Math.min(score, 1.0);
  }

  private calculateKajabiRelevance(
    businessIntent: any,
    entities: BusinessEntity[]
  ): number {
    let score = 0.4; // Base relevance
    if (businessIntent.businessCategory === "marketing") score += 0.3;
    if (entities.some(e => e.entity.includes("course"))) score += 0.3;
    return Math.min(score, 1.0);
  }

  private calculateSupabaseRelevance(
    businessIntent: any,
    entities: BusinessEntity[]
  ): number {
    return 0.9; // Supabase is always highly relevant for unified data
  }

  private calculateMarketingRelevance(
    businessIntent: any,
    entities: BusinessEntity[]
  ): number {
    let score = 0.3; // Base relevance
    if (businessIntent.businessCategory === "marketing") score += 0.4;
    if (entities.some(e => e.entity.includes("campaign"))) score += 0.3;
    return Math.min(score, 1.0);
  }

  private getSourcePriority(
    businessIntent: any,
    source: string
  ): "high" | "medium" | "low" {
    if (source === "supabase_customer") return "high";
    if (businessIntent.urgency === "critical") return "high";
    if (businessIntent.urgency === "high") return "medium";
    return "low";
  }

  private getShopifyRelevanceReasons(
    businessIntent: any,
    entities: BusinessEntity[]
  ): string[] {
    const reasons = ["E-commerce platform with sales and product data"];
    if (businessIntent.businessCategory === "finance")
      reasons.push("Financial analysis requires sales data");
    if (entities.some(e => e.type === "product"))
      reasons.push("Product-related query detected");
    return reasons;
  }

  private getKajabiRelevanceReasons(
    businessIntent: any,
    entities: BusinessEntity[]
  ): string[] {
    const reasons = ["Online course platform with engagement data"];
    if (businessIntent.businessCategory === "marketing")
      reasons.push("Marketing analysis benefits from course engagement");
    if (entities.some(e => e.entity.includes("course")))
      reasons.push("Course-related query detected");
    return reasons;
  }

  private getSupabaseRelevanceReasons(
    businessIntent: any,
    entities: BusinessEntity[]
  ): string[] {
    return [
      "Unified customer database provides comprehensive context",
      "Business KPIs and metrics available",
    ];
  }

  private getMarketingRelevanceReasons(
    businessIntent: any,
    entities: BusinessEntity[]
  ): string[] {
    const reasons = ["Marketing platform data for campaign analysis"];
    if (businessIntent.businessCategory === "marketing")
      reasons.push("Marketing-focused query detected");
    return reasons;
  }

  // Additional helper methods
  private hasPermissionForData(
    dataKey: string,
    permissions: string[]
  ): boolean {
    // Implement permission checking logic
    return true; // Simplified for now
  }

  private generateShopifyInsights(
    sourceData: any,
    semanticAnalysis: SemanticAnalysis
  ): BusinessInsight[] {
    const insights: BusinessInsight[] = [];

    if (sourceData.products && sourceData.products.length > 0) {
      insights.push({
        insight: `Found ${sourceData.products.length} products relevant to your query`,
        confidence: 0.8,
        supportingData: sourceData.products.slice(0, 3),
        businessImpact: "medium",
        actionable: true,
        timeRelevance: "immediate",
      });
    }

    return insights;
  }

  private generateKajabiInsights(
    sourceData: any,
    semanticAnalysis: SemanticAnalysis
  ): BusinessInsight[] {
    const insights: BusinessInsight[] = [];

    if (sourceData.courses && sourceData.courses.length > 0) {
      insights.push({
        insight: `Identified ${sourceData.courses.length} courses with engagement data`,
        confidence: 0.75,
        supportingData: sourceData.courses.slice(0, 3),
        businessImpact: "medium",
        actionable: true,
        timeRelevance: "short_term",
      });
    }

    return insights;
  }

  private generateSupabaseInsights(
    sourceData: any,
    semanticAnalysis: SemanticAnalysis
  ): BusinessInsight[] {
    const insights: BusinessInsight[] = [];

    if (
      sourceData.unified_customers &&
      sourceData.unified_customers.length > 0
    ) {
      insights.push({
        insight: `Unified customer data shows ${sourceData.unified_customers.length} relevant customer records`,
        confidence: 0.9,
        supportingData: [{ count: sourceData.unified_customers.length }],
        businessImpact: "high",
        actionable: true,
        timeRelevance: "immediate",
      });
    }

    return insights;
  }

  private generateMarketingInsights(
    sourceData: any,
    semanticAnalysis: SemanticAnalysis
  ): BusinessInsight[] {
    const insights: BusinessInsight[] = [];

    if (sourceData.campaigns && sourceData.campaigns.length > 0) {
      insights.push({
        insight: `Marketing campaigns data available for analysis`,
        confidence: 0.7,
        supportingData: sourceData.campaigns.slice(0, 3),
        businessImpact: "medium",
        actionable: true,
        timeRelevance: "short_term",
      });
    }

    return insights;
  }

  private suggestAdditionalSources(
    businessIntent: any,
    entities: BusinessEntity[],
    integratedData: IntegratedDataSet
  ): string[] {
    const suggestions: string[] = [];

    if (
      !integratedData.marketing &&
      businessIntent.businessCategory === "marketing"
    ) {
      suggestions.push(
        "Marketing platform data for comprehensive campaign analysis"
      );
    }

    if (!integratedData.shopify && entities.some(e => e.type === "product")) {
      suggestions.push("Shopify data for product performance insights");
    }

    return suggestions;
  }

  private generateSuggestedQueries(
    businessIntent: any,
    entities: BusinessEntity[],
    userProfile: UserProfile
  ): string[] {
    const suggestions: string[] = [];

    if (businessIntent.businessCategory === "finance") {
      suggestions.push(
        "Show revenue trends by month",
        "Compare profit margins across products"
      );
    } else if (businessIntent.businessCategory === "marketing") {
      suggestions.push(
        "Analyze campaign performance by channel",
        "Show customer acquisition costs"
      );
    }

    return suggestions.slice(0, 5);
  }

  private generateRelatedInsights(
    semanticAnalysis: SemanticAnalysis,
    integratedData: IntegratedDataSet
  ): string[] {
    const insights: string[] = [];

    if (semanticAnalysis.businessIntent.businessCategory === "analytics") {
      insights.push(
        "Consider analyzing seasonal trends",
        "Look into customer segmentation patterns"
      );
    }

    return insights.slice(0, 3);
  }

  private generateContextualSummary(
    integratedData: IntegratedDataSet,
    semanticAnalysis: SemanticAnalysis
  ): string {
    const sources = Object.keys(integratedData).length;
    const businessCategory = semanticAnalysis.businessIntent.businessCategory;

    return `Integrated data from ${sources} sources for ${businessCategory} analysis. Context analysis shows ${semanticAnalysis.businessIntent.complexity > 0.7 ? "high" : "moderate"} complexity query requiring comprehensive data context.`;
  }

  private hasMultipleSources(integratedData: IntegratedDataSet): boolean {
    return Object.keys(integratedData).length > 1;
  }

  private generateCrossPlatformMetrics(
    integratedData: IntegratedDataSet
  ): any[] {
    // Generate cross-platform metrics combining data from multiple sources
    return [];
  }

  private generateCustomerJourneyData(
    integratedData: IntegratedDataSet
  ): any[] {
    // Generate customer journey insights from available data
    return [];
  }

  private countTotalRecords(integratedData: IntegratedDataSet): number {
    let total = 0;
    Object.values(integratedData).forEach(sourceData => {
      if (sourceData && typeof sourceData === "object") {
        Object.values(sourceData).forEach(data => {
          if (Array.isArray(data)) {
            total += data.length;
          }
        });
      }
    });
    return total;
  }

  private getCacheHitCount(): number {
    return Array.from(this.dataSourceCache.values()).filter(
      cached => Date.now() - cached.timestamp < this.CACHE_TTL
    ).length;
  }

  private createFallbackResponse(
    request: ContextualDataRequest,
    errors: DataSourceError[],
    processingTime: number
  ): ContextualDataResponse {
    return {
      success: false,
      data: {},
      contextAnalysis: {
        relevantSources: [],
        semanticAnalysis: {
          semanticRoles: [],
          entities: [],
          relationships: [],
          businessIntent: {
            primaryIntent: "fallback",
            subIntents: [],
            businessCategory: "analytics",
            urgency: "medium",
            complexity: 0.5,
            requiredExpertise: "intermediate",
          },
          contextualImportance: 0.3,
          domainRelevance: {},
        },
        confidence: 0.3,
        processingTime,
      },
      recommendations: {
        additionalSources: [],
        suggestedQueries: ["Please try a more specific query"],
        relatedInsights: [],
      },
      metadata: {
        totalRecords: 0,
        sourcesQueried: [],
        cacheHits: 0,
        errors: [
          {
            source: "general",
            error: "Context-aware data integration failed",
            severity: "high",
            fallbackApplied: true,
          },
        ],
      },
    };
  }
}

// Export singleton instance
export const contextAwareDataIntegrator =
  ContextAwareDataIntegrator.getInstance();
