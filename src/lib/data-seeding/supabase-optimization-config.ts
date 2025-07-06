/**
 * Supabase Data Storage & Optimization Configuration
 * Task 74.4: Configuratie voor data opslag optimalisatie
 *
 * Centralized configuration voor all navigation & UX data storage optimalisaties
 */

// =====================================================
// DATA RETENTION POLICIES
// =====================================================

export const DATA_RETENTION_CONFIG = {
  // User Events - Core behavioral data
  USER_EVENTS: {
    HOT_DAYS: 7, // Real-time analytics (laatste week)
    WARM_DAYS: 30, // Active reporting (laatste maand)
    COLD_DAYS: 90, // Historical analysis (laatste 3 maanden)
    ARCHIVE_DAYS: 365, // Long-term storage (1 jaar)
  },

  // Performance Metrics - Site performance data
  PERFORMANCE_METRICS: {
    HOT_DAYS: 3, // Immediate alerts (laatste 3 dagen)
    WARM_DAYS: 14, // Performance monitoring (2 weken)
    COLD_DAYS: 60, // Trend analysis (2 maanden)
    ARCHIVE_DAYS: 180, // Compliance storage (6 maanden)
  },

  // Navigation Paths - User journey data
  NAVIGATION_PATHS: {
    HOT_DAYS: 7, // Active journey optimization
    WARM_DAYS: 30, // Funnel analysis
    COLD_DAYS: 90, // Historical patterns
    ARCHIVE_DAYS: 365, // Long-term user behavior
  },

  // Feature Usage - Product analytics
  FEATURE_USAGE: {
    HOT_DAYS: 14, // Product decisions (2 weken)
    WARM_DAYS: 60, // Feature performance (2 maanden)
    COLD_DAYS: 180, // Product evolution (6 maanden)
    ARCHIVE_DAYS: 730, // Long-term product insights (2 jaar)
  },

  // Experiment Results - A/B testing data
  EXPERIMENT_RESULTS: {
    HOT_DAYS: 30, // Active experiments
    WARM_DAYS: 90, // Recent conclusions
    COLD_DAYS: 180, // Historical experiments
    ARCHIVE_DAYS: 1095, // Permanent experiment archive (3 jaar)
  },

  // Error Logs - Pipeline monitoring
  PIPELINE_ERRORS: {
    HOT_DAYS: 7, // Active debugging
    WARM_DAYS: 30, // Error pattern analysis
    COLD_DAYS: 90, // Historical error tracking
    ARCHIVE_DAYS: 365, // Compliance & audit trail
  },
} as const;

// =====================================================
// PERFORMANCE OPTIMIZATION SETTINGS
// =====================================================

export const PERFORMANCE_CONFIG = {
  // Batch processing limits
  BATCH_SIZES: {
    USER_EVENTS: 1000, // Optimal voor user event inserts
    PERFORMANCE_METRICS: 500, // Smaller batches voor complex metrics
    NAVIGATION_PATHS: 750, // Medium batches voor path tracking
    FEATURE_USAGE: 250, // Smaller batches voor aggregated data
  },

  // Query optimization
  QUERY_LIMITS: {
    DEFAULT_LIMIT: 100, // Standard pagination
    MAX_LIMIT: 10000, // Maximum records per query
    ANALYTICS_LIMIT: 50000, // Large analytics queries
    EXPORT_LIMIT: 100000, // Data export operations
  },

  // Connection settings
  CONNECTION: {
    POOL_SIZE: 10, // Concurrent connections
    TIMEOUT_MS: 30000, // 30 second timeout
    RETRY_ATTEMPTS: 3, // Number of retries
    RETRY_DELAY_MS: 1000, // Delay between retries
  },

  // Real-time subscription limits
  REALTIME: {
    EVENTS_PER_SECOND: 10, // Rate limiting
    MAX_CHANNELS: 5, // Concurrent subscriptions
    HEARTBEAT_INTERVAL: 30000, // Keep-alive interval
  },
} as const;

// =====================================================
// DATA QUALITY THRESHOLDS
// =====================================================

export const QUALITY_THRESHOLDS = {
  // Performance metric quality scores
  PERFORMANCE_GRADES: {
    A_THRESHOLD: 90, // Excellent performance
    B_THRESHOLD: 80, // Good performance
    C_THRESHOLD: 70, // Acceptable performance
    D_THRESHOLD: 60, // Poor performance
    F_THRESHOLD: 0, // Failing performance
  },

  // Core Web Vitals benchmarks (in milliseconds)
  WEB_VITALS: {
    LCP_GOOD: 2500, // Largest Contentful Paint - Good
    LCP_NEEDS_IMPROVEMENT: 4000, // LCP - Needs Improvement
    FID_GOOD: 100, // First Input Delay - Good
    FID_NEEDS_IMPROVEMENT: 300, // FID - Needs Improvement
    CLS_GOOD: 0.1, // Cumulative Layout Shift - Good
    CLS_NEEDS_IMPROVEMENT: 0.25, // CLS - Needs Improvement
  },

  // Data validation rules
  VALIDATION: {
    SESSION_TIMEOUT_MINUTES: 30, // Session expiry
    MIN_TIME_ON_PAGE: 0, // Minimum time on page (seconds)
    MAX_TIME_ON_PAGE: 3600, // Maximum time on page (1 hour)
    MAX_SCROLL_DEPTH: 100, // Maximum scroll percentage
    MIN_VIEWPORT_WIDTH: 200, // Minimum viewport width
    MAX_VIEWPORT_WIDTH: 4000, // Maximum viewport width
  },
} as const;

// =====================================================
// COST OPTIMIZATION SETTINGS
// =====================================================

export const COST_CONFIG = {
  // Data compression settings
  COMPRESSION: {
    ENABLED: true,
    ALGORITHM: "gzip",
    THRESHOLD_KB: 1024, // Compress data larger than 1KB
  },

  // Storage tier pricing (monthly EUR)
  PRICING_TIERS: {
    BOOTSTRAPPER: {
      MONTHLY_COST: 25,
      MAX_USERS: 5000,
      MAX_EVENTS_PER_DAY: 50000,
      FEATURES: ["basic_analytics", "performance_monitoring"],
    },
    GROWTH: {
      MONTHLY_COST: 150,
      MAX_USERS: 50000,
      MAX_EVENTS_PER_DAY: 500000,
      FEATURES: ["advanced_analytics", "ab_testing", "user_journey_analysis"],
    },
    SCALE_UP: {
      MONTHLY_COST: 350,
      MAX_USERS: 500000,
      MAX_EVENTS_PER_DAY: 2000000,
      FEATURES: ["enterprise_analytics", "custom_dashboards", "api_access"],
    },
    ENTERPRISE: {
      MONTHLY_COST: 850,
      MAX_USERS: "unlimited",
      MAX_EVENTS_PER_DAY: "unlimited",
      FEATURES: [
        "full_feature_set",
        "dedicated_support",
        "custom_integrations",
      ],
    },
  },

  // Resource usage monitoring
  USAGE_ALERTS: {
    STORAGE_WARNING_PERCENT: 80, // Alert at 80% storage capacity
    BANDWIDTH_WARNING_PERCENT: 85, // Alert at 85% bandwidth usage
    QUERY_COST_DAILY_LIMIT: 50, // Alert at €50 daily query costs
  },
} as const;

// =====================================================
// SECURITY & ACCESS CONTROL SETTINGS
// =====================================================

export const SECURITY_CONFIG = {
  // Row Level Security (RLS) policies
  RLS_POLICIES: {
    USER_DATA_ACCESS: "users_can_read_own_data",
    ADMIN_FULL_ACCESS: "admins_can_read_all_data",
    ML_TRAINING_ACCESS: "ml_service_can_read_anonymized_data",
    ANALYTICS_READ_ONLY: "analytics_team_read_only_access",
  },

  // Data anonymization settings
  ANONYMIZATION: {
    ENABLED: true,
    IP_MASKING: true, // Mask IP addresses
    USER_ID_HASHING: true, // Hash user IDs for ML training
    PII_REMOVAL: true, // Remove personally identifiable information
    RETENTION_DAYS: 90, // Retain PII for 90 days only
  },

  // API rate limiting
  RATE_LIMITING: {
    REQUESTS_PER_MINUTE: 1000, // API requests per minute
    BULK_OPERATIONS_PER_HOUR: 10, // Bulk data operations per hour
    EXPORT_OPERATIONS_PER_DAY: 5, // Data export operations per day
  },

  // Audit logging
  AUDIT: {
    LOG_ALL_QUERIES: false, // Log all database queries
    LOG_DATA_EXPORTS: true, // Log all data export operations
    LOG_ADMIN_ACTIONS: true, // Log all admin actions
    RETENTION_DAYS: 365, // Retain audit logs for 1 year
  },
} as const;

// =====================================================
// MONITORING & ALERTING CONFIGURATION
// =====================================================

export const MONITORING_CONFIG = {
  // Performance monitoring
  PERFORMANCE_ALERTS: {
    RESPONSE_TIME_MS: 5000, // Alert if response time > 5 seconds
    ERROR_RATE_PERCENT: 5, // Alert if error rate > 5%
    AVAILABILITY_PERCENT: 99.5, // Alert if availability < 99.5%
    QUEUE_SIZE: 1000, // Alert if processing queue > 1000 items
  },

  // Data quality monitoring
  DATA_QUALITY_ALERTS: {
    DUPLICATE_EVENTS_PERCENT: 10, // Alert if > 10% duplicate events
    INVALID_DATA_PERCENT: 5, // Alert if > 5% invalid data
    MISSING_SESSIONS_PERCENT: 15, // Alert if > 15% missing session data
    STALE_DATA_HOURS: 24, // Alert if data is > 24 hours old
  },

  // Business metrics alerts
  BUSINESS_ALERTS: {
    ENGAGEMENT_DROP_PERCENT: 20, // Alert if engagement drops > 20%
    PERFORMANCE_DEGRADATION: 2, // Alert if performance drops 2 grades
    ERROR_SPIKE_MULTIPLIER: 3, // Alert if errors spike 3x normal
    CONVERSION_DROP_PERCENT: 15, // Alert if conversion drops > 15%
  },

  // Notification channels
  NOTIFICATIONS: {
    SLACK_WEBHOOK: process.env.SLACK_MONITORING_WEBHOOK,
    EMAIL_ALERTS: process.env.ALERT_EMAIL_ADDRESSES?.split(",") || [],
    SMS_CRITICAL: process.env.CRITICAL_ALERT_PHONE_NUMBERS?.split(",") || [],
    DASHBOARD_ALERTS: true,
  },
} as const;

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Get retention policy voor specific data type
 */
export function getRetentionPolicy(
  dataType: keyof typeof DATA_RETENTION_CONFIG
) {
  return DATA_RETENTION_CONFIG[dataType];
}

/**
 * Calculate storage tier based on usage
 */
export function calculateOptimalTier(usage: {
  users: number;
  eventsPerDay: number;
  features: string[];
}) {
  const { users, eventsPerDay } = usage;

  if (users <= 5000 && eventsPerDay <= 50000) {
    return COST_CONFIG.PRICING_TIERS.BOOTSTRAPPER;
  } else if (users <= 50000 && eventsPerDay <= 500000) {
    return COST_CONFIG.PRICING_TIERS.GROWTH;
  } else if (users <= 500000 && eventsPerDay <= 2000000) {
    return COST_CONFIG.PRICING_TIERS.SCALE_UP;
  } else {
    return COST_CONFIG.PRICING_TIERS.ENTERPRISE;
  }
}

/**
 * Check if performance metric needs alert
 */
export function shouldTriggerPerformanceAlert(
  grade: string,
  lcp?: number,
  fid?: number,
  cls?: number
): boolean {
  // Alert on D or F grades
  if (grade === "D" || grade === "F") return true;

  // Alert on specific metric thresholds
  if (lcp && lcp > QUALITY_THRESHOLDS.WEB_VITALS.LCP_NEEDS_IMPROVEMENT)
    return true;
  if (fid && fid > QUALITY_THRESHOLDS.WEB_VITALS.FID_NEEDS_IMPROVEMENT)
    return true;
  if (cls && cls > QUALITY_THRESHOLDS.WEB_VITALS.CLS_NEEDS_IMPROVEMENT)
    return true;

  return false;
}

/**
 * Validate user event data quality
 */
export function validateUserEvent(event: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!event.session_id) errors.push("Missing session_id");
  if (!event.event_type) errors.push("Missing event_type");
  if (!event.page_url) errors.push("Missing page_url");

  // Data quality checks
  if (
    event.time_on_page &&
    (event.time_on_page < QUALITY_THRESHOLDS.VALIDATION.MIN_TIME_ON_PAGE ||
      event.time_on_page > QUALITY_THRESHOLDS.VALIDATION.MAX_TIME_ON_PAGE)
  ) {
    errors.push("Invalid time_on_page");
  }

  if (
    event.scroll_depth &&
    (event.scroll_depth < 0 ||
      event.scroll_depth > QUALITY_THRESHOLDS.VALIDATION.MAX_SCROLL_DEPTH)
  ) {
    errors.push("Invalid scroll_depth");
  }

  if (
    event.viewport_width &&
    (event.viewport_width < QUALITY_THRESHOLDS.VALIDATION.MIN_VIEWPORT_WIDTH ||
      event.viewport_width > QUALITY_THRESHOLDS.VALIDATION.MAX_VIEWPORT_WIDTH)
  ) {
    errors.push("Invalid viewport_width");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default {
  DATA_RETENTION_CONFIG,
  PERFORMANCE_CONFIG,
  QUALITY_THRESHOLDS,
  COST_CONFIG,
  SECURITY_CONFIG,
  MONITORING_CONFIG,
  getRetentionPolicy,
  calculateOptimalTier,
  shouldTriggerPerformanceAlert,
  validateUserEvent,
};
