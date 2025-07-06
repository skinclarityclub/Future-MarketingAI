// Mock data service for dashboard charts
export interface TimeSeriesData {
  date: string;
  [key: string]: number | string;
}

export interface KPIData {
  value: number;
  change: number;
  trend: "up" | "down" | "neutral";
  period: string;
}

// Revenue Data
export function generateRevenueData(months: number = 12): TimeSeriesData[] {
  const data = [];
  const currentDate = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);

    const monthName = date.toLocaleDateString("en", {
      month: "short",
      year: "numeric",
    });
    const baseRevenue = 45000 + Math.random() * 20000;
    const seasonalFactor =
      1 + 0.3 * Math.sin((date.getMonth() / 12) * 2 * Math.PI);

    data.push({
      date: monthName,
      revenue: Math.round(baseRevenue * seasonalFactor),
      forecast: Math.round(
        baseRevenue * seasonalFactor * (1 + (Math.random() - 0.5) * 0.1)
      ),
      target: 50000,
    });
  }

  return data;
}

// Performance Metrics Data
export function generatePerformanceData(days: number = 30): TimeSeriesData[] {
  const data = [];
  const currentDate = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);

    const dateStr = date.toLocaleDateString("en", {
      month: "short",
      day: "numeric",
    });

    data.push({
      date: dateStr,
      pageViews: Math.round(1200 + Math.random() * 800),
      sessions: Math.round(800 + Math.random() * 400),
      conversions: Math.round(15 + Math.random() * 25),
      bounceRate: Math.round(30 + Math.random() * 40),
    });
  }

  return data;
}

// Customer Analytics Data
export function generateCustomerData(): {
  segments: { name: string; value: number; color: string }[];
  acquisition: TimeSeriesData[];
  retention: TimeSeriesData[];
} {
  const segments = [
    { name: "New Users", value: 2847, color: "#3B82F6" },
    { name: "Returning Users", value: 1893, color: "#10B981" },
    { name: "Premium Users", value: 642, color: "#F59E0B" },
    { name: "Enterprise", value: 284, color: "#EF4444" },
  ];

  const acquisition = [];
  const retention = [];
  const currentDate = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleDateString("en", { month: "short" });

    acquisition.push({
      date: monthName,
      newCustomers: Math.round(180 + Math.random() * 120),
      churnedCustomers: Math.round(45 + Math.random() * 35),
    });

    retention.push({
      date: monthName,
      retentionRate: Math.round(75 + Math.random() * 20),
      satisfactionScore: Math.round(4.1 + Math.random() * 0.8),
    });
  }

  return { segments, acquisition, retention };
}

// Financial KPIs
export function generateFinancialKPIs(): {
  totalRevenue: KPIData;
  monthlyGrowth: KPIData;
  avgOrderValue: KPIData;
  conversionRate: KPIData;
} {
  return {
    totalRevenue: {
      value: 524750,
      change: 12.5,
      trend: "up",
      period: "vs last month",
    },
    monthlyGrowth: {
      value: 15.3,
      change: 3.2,
      trend: "up",
      period: "month over month",
    },
    avgOrderValue: {
      value: 284,
      change: -2.1,
      trend: "down",
      period: "vs last month",
    },
    conversionRate: {
      value: 3.4,
      change: 0.8,
      trend: "up",
      period: "this month",
    },
  };
}

// Marketing Channel Performance
export function generateMarketingData(): {
  channels: {
    name: string;
    revenue: number;
    spend: number;
    roi: number;
    roas: number;
  }[];
  trends: TimeSeriesData[];
} {
  const channels = [
    { name: "Google Ads", revenue: 125000, spend: 35000, roi: 257, roas: 3.57 },
    {
      name: "Facebook Ads",
      revenue: 89000,
      spend: 28000,
      roi: 218,
      roas: 3.18,
    },
    {
      name: "Email Marketing",
      revenue: 67000,
      spend: 8500,
      roi: 688,
      roas: 7.88,
    },
    { name: "LinkedIn Ads", revenue: 45000, spend: 18000, roi: 150, roas: 2.5 },
    {
      name: "Organic Search",
      revenue: 156000,
      spend: 12000,
      roi: 1200,
      roas: 13.0,
    },
  ];

  const trends = [];
  const currentDate = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString("en", {
      month: "short",
      day: "numeric",
    });

    trends.push({
      date: dateStr,
      googleAds: Math.round(3500 + Math.random() * 1500),
      facebookAds: Math.round(2800 + Math.random() * 1200),
      emailMarketing: Math.round(850 + Math.random() * 400),
      organicSearch: Math.round(4200 + Math.random() * 2000),
    });
  }

  return { channels, trends };
}

// Operational Metrics
export function generateOperationalData(): {
  systemHealth: {
    name: string;
    value: number;
    status: "healthy" | "warning" | "critical";
  }[];
  uptime: TimeSeriesData[];
  performance: TimeSeriesData[];
} {
  const systemHealth = [
    { name: "Database", value: 99.8, status: "healthy" as const },
    { name: "API Response", value: 245, status: "healthy" as const },
    { name: "Server Load", value: 68, status: "warning" as const },
    { name: "Memory Usage", value: 82, status: "warning" as const },
    { name: "Disk Space", value: 91, status: "critical" as const },
  ];

  const uptime = [];
  const performance = [];
  const currentDate = new Date();

  for (let i = 23; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setHours(date.getHours() - i);
    const timeStr = date.toLocaleTimeString("en", {
      hour: "2-digit",
      minute: "2-digit",
    });

    uptime.push({
      date: timeStr,
      uptime: 99.5 + Math.random() * 0.5,
      responseTime: 180 + Math.random() * 120,
    });

    performance.push({
      date: timeStr,
      cpuUsage: 30 + Math.random() * 40,
      memoryUsage: 45 + Math.random() * 35,
      diskIO: 20 + Math.random() * 60,
    });
  }

  return { systemHealth, uptime, performance };
}

// Reports Data
export function generateReportsData(): {
  topReports: { name: string; downloads: number; lastGenerated: string }[];
  reportGeneration: TimeSeriesData[];
  reportTypes: { name: string; count: number }[];
} {
  const topReports = [
    {
      name: "Monthly Revenue Report",
      downloads: 247,
      lastGenerated: "2 hours ago",
    },
    {
      name: "Customer Analytics",
      downloads: 189,
      lastGenerated: "5 hours ago",
    },
    {
      name: "Marketing Performance",
      downloads: 156,
      lastGenerated: "1 day ago",
    },
    {
      name: "Operational Dashboard",
      downloads: 124,
      lastGenerated: "3 hours ago",
    },
    { name: "Financial Summary", downloads: 98, lastGenerated: "6 hours ago" },
  ];

  const reportGeneration = [];
  const currentDate = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    const dayName = date.toLocaleDateString("en", { weekday: "short" });

    reportGeneration.push({
      date: dayName,
      generated: Math.round(25 + Math.random() * 15),
      downloaded: Math.round(20 + Math.random() * 12),
      shared: Math.round(8 + Math.random() * 6),
    });
  }

  const reportTypes = [
    { name: "Revenue", count: 45 },
    { name: "Analytics", count: 38 },
    { name: "Performance", count: 32 },
    { name: "Customer", count: 28 },
    { name: "Marketing", count: 24 },
    { name: "Operational", count: 19 },
  ];

  return { topReports, reportGeneration, reportTypes };
}

// Format currency
export function formatCurrency(
  value: number,
  currency: string = "EUR"
): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Format percentage
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Format number with commas
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("nl-NL").format(value);
}
