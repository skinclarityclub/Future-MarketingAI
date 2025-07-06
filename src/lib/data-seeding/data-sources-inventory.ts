/**
 * Data Sources Inventory for Research & Competitive Intelligence AI Engines
 * Task 75.2: Selecteer en inventariseer relevante interne en externe databronnen
 *
 * Comprehensive inventory of available data sources categorized by:
 * - Internal existing data sources
 * - External API integrations
 * - Third-party service connections
 * - Data pipeline readiness assessment
 */

export interface DataSource {
  name: string;
  type: "internal" | "external" | "api" | "service";
  category: string;
  location: string;
  dataTypes: string[];
  updateFrequency: string;
  volumeEstimate: string;
  qualityScore: number; // 1-10
  integrationStatus: "active" | "available" | "needs_setup" | "deprecated";
  relevantEngines: string[];
  accessMethod: string;
  limitations?: string[];
  dependencies?: string[];
}

/**
 * INTERNAL DATA SOURCES
 * Existing data within the SKC BI Dashboard system
 */
export const INTERNAL_DATA_SOURCES: DataSource[] = [
  {
    name: "Supabase Analytics Database",
    type: "internal",
    category: "Analytics Storage",
    location: "supabase/migrations/",
    dataTypes: [
      "user_analytics",
      "content_performance",
      "engagement_metrics",
      "conversion_data",
    ],
    updateFrequency: "real-time",
    volumeEstimate: "100K+ records",
    qualityScore: 9,
    integrationStatus: "active",
    relevantEngines: [
      "Trend Detector",
      "Competitor Analyzer",
      "Content Ideation Engine",
    ],
    accessMethod: "Supabase client queries",
    dependencies: ["Supabase authentication"],
  },
  {
    name: "Tactical Analysis Data",
    type: "internal",
    category: "Business Intelligence",
    location: "src/app/[locale]/tactical-analysis/",
    dataTypes: ["revenue_metrics", "customer_intelligence", "performance_kpis"],
    updateFrequency: "daily",
    volumeEstimate: "50K+ records",
    qualityScore: 8,
    integrationStatus: "active",
    relevantEngines: ["Competitor Analyzer", "Content Ideation Engine"],
    accessMethod: "Internal API endpoints",
    dependencies: ["Authentication middleware"],
  },
  {
    name: "Customer Intelligence Database",
    type: "internal",
    category: "Customer Data",
    location: "src/lib/customer-intelligence/",
    dataTypes: ["customer_segments", "behavior_patterns", "journey_analytics"],
    updateFrequency: "hourly",
    volumeEstimate: "25K+ customer profiles",
    qualityScore: 9,
    integrationStatus: "active",
    relevantEngines: ["Content Ideation Engine", "Trend Detector"],
    accessMethod: "Customer intelligence API",
    dependencies: ["RBAC system", "Data privacy compliance"],
  },
  {
    name: "Marketing Analytics Cache",
    type: "internal",
    category: "Marketing Data",
    location: "src/lib/marketing/",
    dataTypes: ["campaign_performance", "content_roi", "attribution_data"],
    updateFrequency: "real-time",
    volumeEstimate: "75K+ campaign records",
    qualityScore: 8,
    integrationStatus: "active",
    relevantEngines: ["Content Ideation Engine", "Competitor Analyzer"],
    accessMethod: "Marketing analytics API",
    dependencies: ["Campaign tracking setup"],
  },
];

/**
 * SOCIAL MEDIA API INTEGRATIONS
 * External social platform data sources
 */
export const SOCIAL_MEDIA_SOURCES: DataSource[] = [
  {
    name: "Instagram Business API",
    type: "api",
    category: "Social Media",
    location: "src/lib/social-platforms/instagram.ts",
    dataTypes: [
      "posts",
      "stories",
      "reels",
      "engagement_metrics",
      "audience_insights",
    ],
    updateFrequency: "hourly",
    volumeEstimate: "10K+ posts/month",
    qualityScore: 9,
    integrationStatus: "active",
    relevantEngines: [
      "Trend Detector",
      "Competitor Analyzer",
      "Content Ideation Engine",
    ],
    accessMethod: "Instagram Graph API",
    dependencies: ["Instagram Business Account", "API rate limits"],
  },
  {
    name: "LinkedIn Marketing API",
    type: "api",
    category: "Social Media",
    location: "src/lib/social-platforms/linkedin.ts",
    dataTypes: [
      "company_updates",
      "engagement_data",
      "follower_demographics",
      "ad_performance",
    ],
    updateFrequency: "daily",
    volumeEstimate: "5K+ posts/month",
    qualityScore: 8,
    integrationStatus: "active",
    relevantEngines: ["Competitor Analyzer", "Content Ideation Engine"],
    accessMethod: "LinkedIn Marketing Developer Platform",
    dependencies: [
      "LinkedIn Company Page",
      "Marketing Developer Platform access",
    ],
  },
  {
    name: "Facebook Graph API",
    type: "api",
    category: "Social Media",
    location: "src/lib/social-platforms/facebook.ts",
    dataTypes: [
      "page_posts",
      "page_insights",
      "ad_insights",
      "audience_demographics",
    ],
    updateFrequency: "hourly",
    volumeEstimate: "8K+ posts/month",
    qualityScore: 8,
    integrationStatus: "active",
    relevantEngines: ["Trend Detector", "Competitor Analyzer"],
    accessMethod: "Facebook Graph API",
    dependencies: ["Facebook Business Manager", "Page access tokens"],
  },
  {
    name: "Twitter/X API",
    type: "api",
    category: "Social Media",
    location: "src/lib/social-platforms/twitter.ts",
    dataTypes: [
      "tweets",
      "trending_topics",
      "hashtag_analytics",
      "engagement_metrics",
    ],
    updateFrequency: "real-time",
    volumeEstimate: "20K+ tweets/month",
    qualityScore: 9,
    integrationStatus: "active",
    relevantEngines: ["Trend Detector", "Competitor Analyzer"],
    accessMethod: "Twitter API v2",
    dependencies: ["Twitter Developer Account", "API v2 access"],
  },
  {
    name: "TikTok Business API",
    type: "api",
    category: "Social Media",
    location: "src/lib/social-platforms/tiktok.ts",
    dataTypes: [
      "video_analytics",
      "trending_sounds",
      "hashtag_performance",
      "creator_insights",
    ],
    updateFrequency: "daily",
    volumeEstimate: "3K+ videos/month",
    qualityScore: 7,
    integrationStatus: "active",
    relevantEngines: ["Trend Detector", "Content Ideation Engine"],
    accessMethod: "TikTok for Business API",
    dependencies: ["TikTok Business Account", "API access approval"],
  },
];

/**
 * THIRD-PARTY SERVICE INTEGRATIONS
 * External services and platforms
 */
export const THIRD_PARTY_SERVICES: DataSource[] = [
  {
    name: "ClickUp Project Management",
    type: "service",
    category: "Project Management",
    location: "src/lib/apis/clickup.ts",
    dataTypes: [
      "project_data",
      "task_analytics",
      "team_performance",
      "time_tracking",
    ],
    updateFrequency: "hourly",
    volumeEstimate: "1K+ projects",
    qualityScore: 8,
    integrationStatus: "active",
    relevantEngines: ["Content Ideation Engine"],
    accessMethod: "ClickUp REST API",
    dependencies: ["ClickUp workspace access", "API tokens"],
  },
  {
    name: "Shopify E-commerce",
    type: "service",
    category: "E-commerce",
    location: "src/lib/apis/shopify.ts",
    dataTypes: [
      "product_performance",
      "customer_behavior",
      "sales_analytics",
      "inventory_data",
    ],
    updateFrequency: "hourly",
    volumeEstimate: "10K+ transactions/month",
    qualityScore: 9,
    integrationStatus: "active",
    relevantEngines: ["Competitor Analyzer", "Content Ideation Engine"],
    accessMethod: "Shopify Admin API",
    dependencies: ["Shopify store access", "Private app setup"],
  },
  {
    name: "Kajabi Course Platform",
    type: "service",
    category: "Education",
    location: "src/lib/apis/kajabi.ts",
    dataTypes: [
      "course_analytics",
      "student_engagement",
      "content_performance",
      "revenue_data",
    ],
    updateFrequency: "daily",
    volumeEstimate: "5K+ course interactions/month",
    qualityScore: 8,
    integrationStatus: "active",
    relevantEngines: ["Content Ideation Engine", "Competitor Analyzer"],
    accessMethod: "Kajabi API",
    dependencies: ["Kajabi account access", "API credentials"],
  },
  {
    name: "Blotato CRM",
    type: "service",
    category: "CRM",
    location: "src/lib/apis/blotato.ts",
    dataTypes: [
      "lead_analytics",
      "conversion_funnels",
      "customer_journey",
      "sales_performance",
    ],
    updateFrequency: "real-time",
    volumeEstimate: "2K+ leads/month",
    qualityScore: 7,
    integrationStatus: "active",
    relevantEngines: ["Content Ideation Engine"],
    accessMethod: "Blotato REST API",
    dependencies: ["Blotato account", "API integration setup"],
  },
];

/**
 * WEB SCRAPING INFRASTRUCTURE
 * Automated data collection systems
 */
export const WEB_SCRAPING_SOURCES: DataSource[] = [
  {
    name: "Research Scraping Engine",
    type: "internal",
    category: "Web Scraping",
    location: "src/lib/research-scraping/",
    dataTypes: [
      "competitor_content",
      "industry_reports",
      "news_articles",
      "trend_data",
    ],
    updateFrequency: "daily",
    volumeEstimate: "1K+ pages/day",
    qualityScore: 8,
    integrationStatus: "active",
    relevantEngines: ["Web Scraper", "Competitor Analyzer", "Trend Detector"],
    accessMethod: "Internal scraping API",
    dependencies: ["Proxy rotation", "Rate limiting compliance"],
  },
  {
    name: "Competitor Website Monitor",
    type: "internal",
    category: "Competitive Intelligence",
    location: "src/lib/research-scraping/competitor-monitor.ts",
    dataTypes: [
      "competitor_pages",
      "content_changes",
      "pricing_updates",
      "product_launches",
    ],
    updateFrequency: "hourly",
    volumeEstimate: "500+ competitor pages",
    qualityScore: 9,
    integrationStatus: "active",
    relevantEngines: ["Competitor Analyzer", "Web Scraper"],
    accessMethod: "Automated monitoring system",
    dependencies: ["Website change detection", "Content diff algorithms"],
  },
  {
    name: "Industry News Aggregator",
    type: "internal",
    category: "News & Trends",
    location: "src/lib/research-scraping/news-aggregator.ts",
    dataTypes: [
      "industry_news",
      "trend_articles",
      "market_reports",
      "press_releases",
    ],
    updateFrequency: "hourly",
    volumeEstimate: "200+ articles/day",
    qualityScore: 8,
    integrationStatus: "active",
    relevantEngines: ["Trend Detector", "Content Ideation Engine"],
    accessMethod: "RSS feeds and news APIs",
    dependencies: ["News source API keys", "Content categorization"],
  },
];

/**
 * ANALYTICS AND ML ENGINES
 * Existing AI and analytics systems that provide processed data
 */
export const ANALYTICS_ENGINES: DataSource[] = [
  {
    name: "Unified Analytics Engine",
    type: "internal",
    category: "Analytics Processing",
    location: "src/lib/analytics/unified-analytics.ts",
    dataTypes: [
      "processed_metrics",
      "correlation_analysis",
      "trend_coefficients",
      "performance_predictions",
    ],
    updateFrequency: "real-time",
    volumeEstimate: "50K+ processed events/day",
    qualityScore: 9,
    integrationStatus: "active",
    relevantEngines: ["All Engines"],
    accessMethod: "Internal analytics API",
    dependencies: ["Real-time data pipeline", "ML model serving"],
  },
  {
    name: "AI Assistant Analytics",
    type: "internal",
    category: "AI Analytics",
    location: "src/lib/assistant/",
    dataTypes: [
      "conversation_analytics",
      "intent_recognition",
      "response_effectiveness",
      "user_satisfaction",
    ],
    updateFrequency: "real-time",
    volumeEstimate: "10K+ interactions/day",
    qualityScore: 8,
    integrationStatus: "active",
    relevantEngines: ["Content Ideation Engine", "Trend Detector"],
    accessMethod: "AI assistant API",
    dependencies: ["NLP processing pipeline", "Conversation storage"],
  },
  {
    name: "ML Navigation Engine",
    type: "internal",
    category: "Machine Learning",
    location: "src/lib/ml/",
    dataTypes: [
      "user_behavior_patterns",
      "navigation_analytics",
      "personalization_data",
      "recommendation_metrics",
    ],
    updateFrequency: "real-time",
    volumeEstimate: "25K+ navigation events/day",
    qualityScore: 8,
    integrationStatus: "active",
    relevantEngines: ["Content Ideation Engine"],
    accessMethod: "ML engine API",
    dependencies: ["User tracking system", "ML model pipeline"],
  },
];

/**
 * WORKFLOW AND AUTOMATION DATA
 * n8n workflows and automation systems
 */
export const WORKFLOW_DATA_SOURCES: DataSource[] = [
  {
    name: "n8n Workflow Engine",
    type: "internal",
    category: "Workflow Automation",
    location: "workflows/",
    dataTypes: [
      "workflow_execution_data",
      "automation_metrics",
      "error_logs",
      "performance_stats",
    ],
    updateFrequency: "real-time",
    volumeEstimate: "1K+ workflow executions/day",
    qualityScore: 8,
    integrationStatus: "active",
    relevantEngines: ["All Engines"],
    accessMethod: "n8n REST API",
    dependencies: ["n8n instance", "Workflow templates"],
  },
  {
    name: "Competitor Monitoring Workflow",
    type: "internal",
    category: "Automated Monitoring",
    location: "workflows/Competitor_Monitoring_Workflow.json",
    dataTypes: [
      "competitor_activity",
      "content_updates",
      "pricing_changes",
      "campaign_launches",
    ],
    updateFrequency: "hourly",
    volumeEstimate: "500+ competitor updates/day",
    qualityScore: 9,
    integrationStatus: "active",
    relevantEngines: ["Competitor Analyzer", "Web Scraper"],
    accessMethod: "Automated workflow execution",
    dependencies: [
      "Competitor website monitoring",
      "Change detection algorithms",
    ],
  },
];

/**
 * DATA QUALITY AND INTEGRATION ASSESSMENT
 */
export const DATA_INTEGRATION_READINESS = {
  highReadiness: [
    "Supabase Analytics Database",
    "Social Media APIs (Instagram, LinkedIn, Facebook, Twitter)",
    "Research Scraping Engine",
    "Unified Analytics Engine",
  ],

  mediumReadiness: [
    "Third-party Services (ClickUp, Shopify, Kajabi)",
    "Workflow Data Sources",
    "ML and AI Engines",
  ],

  needsSetup: [
    "TikTok Business API (approval pending)",
    "Advanced competitor analysis tools",
    "Industry-specific data sources",
  ],

  recommendations: [
    "Prioritize high-readiness sources for immediate seeding",
    "Implement data quality monitoring for all sources",
    "Create unified data schema for cross-engine compatibility",
    "Establish data governance and privacy compliance",
    "Implement real-time data synchronization where needed",
  ],
};

/**
 * CONSOLIDATED DATA SOURCE SUMMARY
 */
export const ALL_DATA_SOURCES = [
  ...INTERNAL_DATA_SOURCES,
  ...SOCIAL_MEDIA_SOURCES,
  ...THIRD_PARTY_SERVICES,
  ...WEB_SCRAPING_SOURCES,
  ...ANALYTICS_ENGINES,
  ...WORKFLOW_DATA_SOURCES,
];

export const DATA_SOURCE_STATS = {
  totalSources: ALL_DATA_SOURCES.length,
  activeSources: ALL_DATA_SOURCES.filter(s => s.integrationStatus === "active")
    .length,
  averageQualityScore:
    ALL_DATA_SOURCES.reduce((sum, s) => sum + s.qualityScore, 0) /
    ALL_DATA_SOURCES.length,
  sourcesByEngine: {
    "Trend Detector": ALL_DATA_SOURCES.filter(s =>
      s.relevantEngines.includes("Trend Detector")
    ).length,
    "Competitor Analyzer": ALL_DATA_SOURCES.filter(s =>
      s.relevantEngines.includes("Competitor Analyzer")
    ).length,
    "Web Scraper": ALL_DATA_SOURCES.filter(s =>
      s.relevantEngines.includes("Web Scraper")
    ).length,
    "Content Ideation Engine": ALL_DATA_SOURCES.filter(s =>
      s.relevantEngines.includes("Content Ideation Engine")
    ).length,
  },
};

export default {
  INTERNAL_DATA_SOURCES,
  SOCIAL_MEDIA_SOURCES,
  THIRD_PARTY_SERVICES,
  WEB_SCRAPING_SOURCES,
  ANALYTICS_ENGINES,
  WORKFLOW_DATA_SOURCES,
  DATA_INTEGRATION_READINESS,
  ALL_DATA_SOURCES,
  DATA_SOURCE_STATS,
};
