/**
 * STARTUP COST ANALYSIS - Navigation & UX Data Seeding System
 * Realistische kosten voor een startup om dit systeem operationeel te krijgen
 *
 * Focus op: Cost-effective implementatie, gefaseerde uitrol, gratis tiers maximaal benutten
 */

export interface StartupCostTier {
  tierName: string;
  description: string;
  monthlyBudget: number;
  capabilities: string[];
  limitations: string[];
  services: StartupService[];
  dataVolume: {
    users_supported: number;
    page_views_monthly: number;
    data_points_daily: number;
  };
  implementationTimeWeeks: number;
}

export interface StartupService {
  serviceName: string;
  provider: string;
  plan: string;
  monthlyPrice: number;
  features: string[];
  freeAlternative?: string;
  upgradeAt?: string;
}

/**
 * STARTUP TIER 1: BOOTSTRAPPER (€0-50/maand)
 * Perfect voor MVP en early development
 */
export const BOOTSTRAPPER_TIER: StartupCostTier = {
  tierName: "Bootstrapper MVP",
  description:
    "Minimale setup met maximum gratis services - perfect voor MVP en validatie",
  monthlyBudget: 25, // €25/maand
  capabilities: [
    "Basic user analytics tracking",
    "Simpele A/B testing",
    "Performance monitoring",
    "Basic user journey mapping",
    "Mock data voor development",
    "Manual data export/import",
  ],
  limitations: [
    "Geen real-time processing",
    "Beperkte data retentie (30 dagen)",
    "Manual data processing",
    "Geen external APIs",
    "Basic monitoring alleen",
  ],
  services: [
    {
      serviceName: "Database & Backend",
      provider: "Supabase",
      plan: "Pro Plan",
      monthlyPrice: 25,
      features: [
        "500k database rows",
        "100GB storage",
        "Real-time subscriptions",
        "Row Level Security",
        "Daily backups",
      ],
      freeAlternative: "Supabase Free (50k rows)",
      upgradeAt: "50k monthly users",
    },
    {
      serviceName: "Analytics Tracking",
      provider: "Plausible/Umami",
      plan: "Self-hosted",
      monthlyPrice: 0,
      features: [
        "Privacy-friendly analytics",
        "Real-time dashboard",
        "Goal tracking",
        "No cookie banner needed",
      ],
      freeAlternative: "Google Analytics 4 (gratis)",
      upgradeAt: "Need advanced segmentation",
    },
    {
      serviceName: "Performance Monitoring",
      provider: "Vercel Analytics",
      plan: "Free",
      monthlyPrice: 0,
      features: [
        "Core Web Vitals",
        "Real user monitoring",
        "Performance insights",
        "Automatic optimization tips",
      ],
    },
    {
      serviceName: "Error Tracking",
      provider: "Sentry",
      plan: "Developer (Free)",
      monthlyPrice: 0,
      features: [
        "5k errors/month",
        "Basic performance monitoring",
        "Issue tracking",
        "Email alerts",
      ],
      upgradeAt: "5k+ errors/month",
    },
  ],
  dataVolume: {
    users_supported: 5000,
    page_views_monthly: 50000,
    data_points_daily: 10000,
  },
  implementationTimeWeeks: 2,
};

/**
 * STARTUP TIER 2: GROWTH (€50-200/maand)
 * Voor startups met traction en eerste funding
 */
export const GROWTH_TIER: StartupCostTier = {
  tierName: "Growth Stage",
  description:
    "Uitgebreide analytics met externe integraties - voor groeiende startups",
  monthlyBudget: 150, // €150/maand
  capabilities: [
    "Advanced user segmentation",
    "Real-time analytics processing",
    "External API integraties",
    "Automated A/B testing",
    "Predictive analytics (basic)",
    "Custom dashboards",
    "Data export automation",
  ],
  limitations: [
    "Beperkte ML/AI capabilities",
    "90 dagen data retentie",
    "Medium data processing capacity",
    "Basic external API calls",
  ],
  services: [
    {
      serviceName: "Database & Backend",
      provider: "Supabase",
      plan: "Pro Plan",
      monthlyPrice: 25,
      features: [
        "500k database rows",
        "100GB storage",
        "Real-time subscriptions",
        "Advanced security",
      ],
    },
    {
      serviceName: "Analytics Platform",
      provider: "PostHog",
      plan: "Scale",
      monthlyPrice: 50,
      features: [
        "100k events/month",
        "Feature flags",
        "Session recordings",
        "Correlation analysis",
        "Retention analysis",
      ],
      freeAlternative: "PostHog Free (1M events)",
      upgradeAt: "1M+ events/month",
    },
    {
      serviceName: "Performance Monitoring",
      provider: "Vercel Analytics",
      plan: "Pro",
      monthlyPrice: 20,
      features: [
        "Unlimited page views",
        "Advanced filtering",
        "Custom events",
        "API access",
      ],
    },
    {
      serviceName: "External APIs",
      provider: "Various",
      plan: "Basic tiers",
      monthlyPrice: 30,
      features: [
        "Weather API (OpenWeather: €10)",
        "GeoIP API (IPinfo: €15)",
        "Currency rates (Fixer.io: €5)",
      ],
      upgradeAt: "High API usage",
    },
    {
      serviceName: "Data Processing",
      provider: "Vercel Functions",
      plan: "Pro",
      monthlyPrice: 20,
      features: [
        "1M function invocations",
        "100GB-hrs compute",
        "Cron jobs",
        "Edge functions",
      ],
    },
    {
      serviceName: "Monitoring & Alerts",
      provider: "Better Uptime",
      plan: "Startup",
      monthlyPrice: 5,
      features: [
        "10 monitors",
        "SMS/email alerts",
        "Status pages",
        "Incident management",
      ],
    },
  ],
  dataVolume: {
    users_supported: 50000,
    page_views_monthly: 500000,
    data_points_daily: 100000,
  },
  implementationTimeWeeks: 4,
};

/**
 * STARTUP TIER 3: SCALE-UP (€200-500/maand)
 * Voor startups met significant funding en gebruikersgroei
 */
export const SCALEUP_TIER: StartupCostTier = {
  tierName: "Scale-up Advanced",
  description:
    "Enterprise-level capabilities op startup budget - voor snel groeiende bedrijven",
  monthlyBudget: 350, // €350/maand
  capabilities: [
    "Machine Learning pipelines",
    "Real-time personalization",
    "Advanced predictive analytics",
    "Multi-channel data tracking",
    "Automated optimization",
    "Custom AI models",
    "Enterprise integrations",
    "Advanced compliance tools",
  ],
  limitations: [
    "Beperkt tot 1M events/maand",
    "6 maanden data retentie",
    "Single region deployment",
  ],
  services: [
    {
      serviceName: "Database & Backend",
      provider: "Supabase",
      plan: "Team Plan",
      monthlyPrice: 100,
      features: [
        "5M database rows",
        "200GB storage",
        "Advanced security",
        "Priority support",
        "Multiple environments",
      ],
    },
    {
      serviceName: "Analytics & ML Platform",
      provider: "PostHog",
      plan: "Scale",
      monthlyPrice: 80,
      features: [
        "1M events/month",
        "Advanced correlation",
        "Cohort analysis",
        "Feature flags",
        "A/B testing suite",
      ],
    },
    {
      serviceName: "ML/AI Processing",
      provider: "Vercel Functions + Edge",
      plan: "Pro",
      monthlyPrice: 50,
      features: [
        "5M function invocations",
        "500GB-hrs compute",
        "Edge computing",
        "ML model hosting",
      ],
    },
    {
      serviceName: "External Data APIs",
      provider: "Various Premium",
      plan: "Professional tiers",
      monthlyPrice: 80,
      features: [
        "Social media APIs (€20)",
        "Economic data APIs (€25)",
        "Market intelligence (€35)",
      ],
    },
    {
      serviceName: "Advanced Monitoring",
      provider: "DataDog",
      plan: "Pro",
      monthlyPrice: 40,
      features: [
        "100 hosts monitoring",
        "Custom metrics",
        "APM included",
        "Log management",
        "Real-time alerting",
      ],
    },
  ],
  dataVolume: {
    users_supported: 500000,
    page_views_monthly: 5000000,
    data_points_daily: 1000000,
  },
  implementationTimeWeeks: 8,
};

/**
 * GEFASEERDE IMPLEMENTATIE ROADMAP
 */
export const IMPLEMENTATION_ROADMAP = {
  phase1_bootstrap: {
    duration_weeks: 2,
    budget_monthly: 25,
    focus: "MVP validation",
    deliverables: [
      "Basic user tracking",
      "Simple analytics dashboard",
      "Performance monitoring",
      "Manual A/B testing",
    ],
    success_metrics: [
      "100+ daily active users",
      "Basic conversion tracking",
      "Performance baseline established",
    ],
  },
  phase2_growth: {
    duration_weeks: 4,
    budget_monthly: 150,
    focus: "Data-driven optimization",
    deliverables: [
      "Automated user segmentation",
      "Real-time analytics",
      "Predictive user behavior",
      "Automated A/B testing",
    ],
    success_metrics: [
      "1000+ daily active users",
      "15% conversion improvement",
      "50% faster page loads",
    ],
  },
  phase3_scale: {
    duration_weeks: 8,
    budget_monthly: 350,
    focus: "AI-powered personalization",
    deliverables: [
      "ML-based recommendations",
      "Real-time personalization",
      "Predictive analytics",
      "Advanced user journeys",
    ],
    success_metrics: [
      "10000+ daily active users",
      "25% conversion improvement",
      "35% user engagement increase",
    ],
  },
};

/**
 * COST OPTIMIZATION TIPS VOOR STARTUPS
 */
export const STARTUP_COST_OPTIMIZATION = {
  immediate_savings: [
    {
      area: "Analytics",
      recommendation:
        "Start met Google Analytics 4 (gratis) + Plausible self-hosted",
      savings_monthly: 50,
      effort: "low",
    },
    {
      area: "Error Tracking",
      recommendation:
        "Gebruik Sentry free tier (5k errors) + console.log debugging",
      savings_monthly: 25,
      effort: "low",
    },
    {
      area: "Performance Monitoring",
      recommendation: "Vercel Analytics gratis tier + Lighthouse CI",
      savings_monthly: 40,
      effort: "medium",
    },
    {
      area: "A/B Testing",
      recommendation: "Custom implementation met feature flags",
      savings_monthly: 60,
      effort: "high",
    },
  ],
  growth_hacks: [
    {
      strategy: "Open Source First",
      description:
        "Gebruik open source tools waar mogelijk (Plausible, Umami, Supabase)",
      potential_savings: "€200+/maand",
    },
    {
      strategy: "API Caching",
      description: "Cache external API responses om kosten te verlagen",
      potential_savings: "€50-100/maand",
    },
    {
      strategy: "Edge Computing",
      description: "Gebruik Vercel Edge Functions voor data processing",
      potential_savings: "€30-80/maand",
    },
    {
      strategy: "Progressive Enhancement",
      description: "Start basic, upgrade features based op funding/growth",
      potential_savings: "Flexibele scaling",
    },
  ],
  free_alternatives: [
    {
      paid_service: "PostHog ($50/maand)",
      free_alternative: "Self-hosted PostHog + Supabase",
      setup_effort: "Medium",
      limitations: "Manual scaling, zelf maintenance",
    },
    {
      paid_service: "DataDog ($40/maand)",
      free_alternative: "Grafana + Prometheus self-hosted",
      setup_effort: "High",
      limitations: "Complexe setup, zelf onderhoud",
    },
    {
      paid_service: "External APIs ($80/maand)",
      free_alternative: "Open data sources + web scraping",
      setup_effort: "High",
      limitations: "Rate limits, minder betrouwbaar",
    },
  ],
};

/**
 * ROI CALCULATOR VOOR STARTUPS
 */
export const STARTUP_ROI_CALCULATOR = {
  assumptions: {
    average_customer_ltv: 200, // €200 lifetime value
    current_conversion_rate: 2.5, // 2.5%
    monthly_website_visitors: 10000,
    expected_improvement: {
      bootstrapper: 5, // 5% conversion improvement
      growth: 15, // 15% improvement
      scaleup: 25, // 25% improvement
    },
  },
  calculations: {
    bootstrapper: {
      monthly_cost: 25,
      additional_conversions: 12.5, // (10000 * 0.025 * 0.05)
      additional_revenue: 2500, // 12.5 * €200
      monthly_roi: 9900, // (2500 - 25) / 25 * 100
      payback_days: 0.3, // Immediate payback
    },
    growth: {
      monthly_cost: 150,
      additional_conversions: 37.5,
      additional_revenue: 7500,
      monthly_roi: 4900, // (7500 - 150) / 150 * 100
      payback_days: 0.6,
    },
    scaleup: {
      monthly_cost: 350,
      additional_conversions: 62.5,
      additional_revenue: 12500,
      monthly_roi: 3470, // (12500 - 350) / 350 * 100
      payback_days: 0.8,
    },
  },
};

export default {
  BOOTSTRAPPER_TIER,
  GROWTH_TIER,
  SCALEUP_TIER,
  IMPLEMENTATION_ROADMAP,
  STARTUP_COST_OPTIMIZATION,
  STARTUP_ROI_CALCULATOR,
};
