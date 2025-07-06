import type { Locale } from "./config";

// Type for the dictionary structure
export type Dictionary = {
  common: {
    loading: string;
    loadingContent: string;
    error: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    update: string;
    search: string;
    filter: string;
    export: string;
    import: string;
    refresh: string;
    close: string;
    open: string;
    yes: string;
    no: string;
    submit: string;
    reset: string;
    clear: string;
    back: string;
    next: string;
    previous: string;
    actions: string;
    settings: string;
    searchPlaceholder: string;
    notifications: string;
    new: string;
    navigation: string;
    needHelp: string;
    helpDescription: string;
    learnMore: string;
    hoursAgo: string;
    administrator: string;
    minutesAgo: string;
    hourAgo: string;
    dayAgo: string;
    moreOptions: string;
  };
  homepage?: {
    hero: {
      badge: string;
      title: {
        part1: string;
        part2: string;
        part3: string;
      };
      description: string;
      cta: {
        primary: string;
        secondary: string;
      };
      stats: {
        companies: {
          value: string;
          label: string;
        };
        roi: {
          value: string;
          label: string;
        };
        automation: {
          value: string;
          label: string;
        };
      };
      features: {
        aiContent: {
          title: string;
          description: string;
        };
        analytics: {
          title: string;
          description: string;
        };
        automation: {
          title: string;
          description: string;
        };
      };
    };
    sections: {
      platformDemo: {
        badge: string;
        title: string;
        subtitle: string;
      };
      roiAssessment: {
        badge: string;
        title: string;
        subtitle: string;
      };
      selfLearningAI: {
        title: string;
        subtitle: string;
      };
      testimonials: {
        title: string;
        subtitle: string;
      };
    };
    valuePropositions: {
      enterprises: {
        title: string;
        benefits: string[];
      };
      scaleups: {
        title: string;
        benefits: string[];
      };
      agencies: {
        title: string;
        benefits: string[];
      };
    };
    socialProof: {
      title: string;
      metrics: {
        companiesServed: string;
        revenueGenerated: string;
        contentPieces: string;
        timesSaved: string;
      };
      testimonials: {
        enterprise: {
          quote: string;
          author: string;
          company: string;
          position: string;
        };
        scaleup: {
          quote: string;
          author: string;
          company: string;
          position: string;
        };
        agency: {
          quote: string;
          author: string;
          company: string;
          position: string;
        };
      };
    };
    conversionPaths: {
      primary: {
        title: string;
        subtitle: string;
        cta: string;
        urgency: string;
      };
      secondary: {
        title: string;
        subtitle: string;
        cta: string;
        benefits: string;
      };
      enterprise: {
        title: string;
        subtitle: string;
        cta: string;
        features: string;
      };
    };
    footer: {
      company: {
        name: string;
        description: string;
      };
      links: {
        platform: {
          title: string;
          items: {
            futureMarketingAI: string;
            analyticsSuite: string;
            automation: string;
          };
        };
        resources: {
          title: string;
          items: {
            watchDemo: string;
            caseStudies: string;
            fortune500Demo: string;
          };
        };
        contact: {
          title: string;
          items: {
            talkToSales: string;
            support247: string;
            globalCoverage: string;
          };
        };
      };
      legal: {
        copyright: string;
        privacy: string;
        terms: string;
      };
    };
  };
  navigation: {
    home: string;
    dashboard: string;
    analytics: string;
    reports: string;
    customers: string;
    settings: string;
    help: string;
    logout: string;
    overview: string;
    closeSidebar: string;
    overviewDesc: string;
    revenueAnalytics: string;
    revenueAnalyticsDesc: string;
    performanceMetrics: string;
    performanceMetricsDesc: string;
    customerInsights: string;
    customerInsightsDesc: string;
    customerIntelligence: string;
    customerIntelligenceDesc: string;
    reportsDesc: string;
    analyticsDesc: string;
    calendarDesc: string;
    advancedChatbot: string;
    advancedChatbotDesc: string;
    settingsDesc: string;
    helpSupportDesc: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    kpis: string;
    revenue: string;
    customers: string;
    orders: string;
    growth: string;
    totalRevenue: string;
    monthlyGrowth: string;
    newCustomers: string;
    totalOrders: string;
    conversionRate: string;
    avgOrderValue: string;
    customerLifetimeValue: string;
    topMetrics: string;
    topMetricsDesc: string;
    revenueTrendDesc: string;
    recentActivity: string;
    recentActivityDesc: string;
    quickActions: string;
    quickActionsDesc: string;
    revenueTrend: string;
    growthRate: string;
    customerSatisfaction: string;
    marketShare: string;
    revenueReportGenerated: string;
    newCustomerMilestone: string;
    performanceMetricsUpdated: string;
    systemMaintenanceCompleted: string;
    viewAnalytics: string;
    nlpNavigationDemo: string;
    chartWillBeImplemented: string;
  };
  notifications: {
    revenueAlert: string;
    monthlyIncreaseMessage: string;
  };
  user: {
    johnDoe: string;
    sampleEmail: string;
  };
  reports: {
    title: string;
    create: string;
    export: string;
    schedule: string;
    templates: string;
    history: string;
    settings: string;
    generate: string;
    csvDescription: string;
    jsonDescription: string;
    pdfDescription: string;
    exportData: string;
    exportAll: string;
    exporting: string;
    exportSuccess: string;
    exportOptions: string;
  };
  analytics: {
    title: string;
    overview: string;
    traffic: string;
    conversions: string;
    revenue: string;
    customers: string;
    performance: string;
    trends: string;
    forecasting: string;
    totalROI: string;
    portfolioAverage: string;
    totalGenerated: string;
    topPerformers: string;
    gradeAContent: string;
    overallAverage: string;
  };
  forms: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    zipCode: string;
    company: string;
    jobTitle: string;
    website: string;
    description: string;
    notes: string;
    tags: string;
    category: string;
    status: string;
    priority: string;
    dueDate: string;
    startDate: string;
    endDate: string;
    content: string;
    platform: string;
  };
  dates: {
    today: string;
    yesterday: string;
    thisWeek: string;
    lastWeek: string;
    thisMonth: string;
    lastMonth: string;
    thisYear: string;
    lastYear: string;
    custom: string;
    selectDate: string;
    selectTime: string;
    dateRange: string;
    from: string;
    to: string;
  };
  errors: {
    notFound: string;
    serverError: string;
    networkError: string;
    validationError: string;
    unauthorized: string;
    forbidden: string;
    timeout: string;
    unknown: string;
    tryAgain: string;
    contactSupport: string;
  };
  monitoring?: {
    title: string;
    subtitle: string;
    infrastructure: {
      title: string;
      subtitle: string;
      systemMetrics: string;
      serviceHealth: string;
      alerts: string;
      networkMonitoring: string;
      cpuUsage: string;
      memoryUsage: string;
      diskUsage: string;
      networkTraffic: string;
      uptime: string;
      responseTime: string;
      errorRate: string;
      throughput: string;
      healthy: string;
      warning: string;
      critical: string;
      offline: string;
      online: string;
      lastUpdate: string;
      performance: string;
      availability: string;
    };
    workflows: {
      title: string;
      subtitle: string;
      workflowOverview: string;
      executionHistory: string;
      analytics: string;
      settings: string;
      activeWorkflows: string;
      totalExecutions: string;
      successRate: string;
      avgExecutionTime: string;
      workflowName: string;
      status: string;
      lastExecution: string;
      actions: string;
      execute: string;
      activate: string;
      deactivate: string;
      view: string;
      edit: string;
      active: string;
      inactive: string;
      running: string;
      success: string;
      error: string;
      canceled: string;
      waiting: string;
      executionId: string;
      startTime: string;
      endTime: string;
      duration: string;
      workflowId: string;
      executionsOverTime: string;
      successFailureRate: string;
      executionTimes: string;
      workflowPerformance: string;
      recentExecutions: string;
      noExecutions: string;
      loading: string;
      refreshData: string;
      autoRefresh: string;
      filterByStatus: string;
      searchWorkflows: string;
      exportData: string;
      webhookUrl: string;
      triggerWorkflow: string;
      workflowHealth: string;
      systemHealth: string;
    };
  };
};

// Dictionary loader functions
const dictionaries = {
  en: () => import("./dictionaries/en.json").then(module => module.default),
  nl: () => import("./dictionaries/nl.json").then(module => module.default),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  return dictionaries[locale]();
};
