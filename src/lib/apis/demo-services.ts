/**
 * Demo Services for Content ROI Tracking
 * Provides realistic mock data when API credentials are not configured
 */

import type { ShopifyAnalytics } from "./shopify";
import type { KajabiEngagement } from "./kajabi";

// Mock Shopify Data
export class DemoShopifyService {
  async getContentAnalytics(dateRange: {
    startDate: string;
    endDate: string;
  }): Promise<ShopifyAnalytics[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return [
      {
        product_id: "shop_001",
        product_title: "Premium Business Course Bundle",
        total_sales: 145,
        total_orders: 87,
        conversion_rate: 3.2,
        revenue: 28750.0,
        period: `${dateRange.startDate} to ${dateRange.endDate}`,
      },
      {
        product_id: "shop_002",
        product_title: "Marketing Automation Toolkit",
        total_sales: 234,
        total_orders: 156,
        conversion_rate: 4.8,
        revenue: 46800.0,
        period: `${dateRange.startDate} to ${dateRange.endDate}`,
      },
      {
        product_id: "shop_003",
        product_title: "Digital Leadership Masterclass",
        total_sales: 89,
        total_orders: 67,
        conversion_rate: 2.1,
        revenue: 17800.0,
        period: `${dateRange.startDate} to ${dateRange.endDate}`,
      },
      {
        product_id: "shop_004",
        product_title: "E-commerce Growth Strategies",
        total_sales: 312,
        total_orders: 203,
        conversion_rate: 5.7,
        revenue: 62400.0,
        period: `${dateRange.startDate} to ${dateRange.endDate}`,
      },
      {
        product_id: "shop_005",
        product_title: "Social Media Mastery Program",
        total_sales: 178,
        total_orders: 124,
        conversion_rate: 3.9,
        revenue: 35600.0,
        period: `${dateRange.startDate} to ${dateRange.endDate}`,
      },
    ];
  }

  async testConnection(): Promise<boolean> {
    return true;
  }
}

// Mock Kajabi Data
export class DemoKajabiService {
  async getContentEngagement(dateRange: {
    startDate: string;
    endDate: string;
  }): Promise<KajabiEngagement[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));

    return [
      {
        product_id: "kaj_001",
        product_name: "Advanced Analytics Certification",
        total_enrollments: 456,
        active_students: 387,
        completion_rate: 0.78,
        average_progress: 0.82,
        revenue: 91200.0,
        period: `${dateRange.startDate} to ${dateRange.endDate}`,
      },
      {
        product_id: "kaj_002",
        product_name: "Content Creation Bootcamp",
        total_enrollments: 234,
        active_students: 198,
        completion_rate: 0.65,
        average_progress: 0.71,
        revenue: 46800.0,
        period: `${dateRange.startDate} to ${dateRange.endDate}`,
      },
      {
        product_id: "kaj_003",
        product_name: "Business Intelligence Fundamentals",
        total_enrollments: 589,
        active_students: 512,
        completion_rate: 0.84,
        average_progress: 0.87,
        revenue: 117800.0,
        period: `${dateRange.startDate} to ${dateRange.endDate}`,
      },
      {
        product_id: "kaj_004",
        product_name: "Digital Transformation Workshop",
        total_enrollments: 167,
        active_students: 134,
        completion_rate: 0.72,
        average_progress: 0.76,
        revenue: 33400.0,
        period: `${dateRange.startDate} to ${dateRange.endDate}`,
      },
    ];
  }

  async testConnection(): Promise<boolean> {
    return true;
  }
}

/**
 * Create demo services when real API credentials are not available
 */
export function createDemoShopifyService(): DemoShopifyService {
  console.log(
    "[DEMO MODE] Using mock Shopify data - configure real API credentials in .env.local"
  );
  return new DemoShopifyService();
}

export function createDemoKajabiService(): DemoKajabiService {
  console.log(
    "[DEMO MODE] Using mock Kajabi data - configure real API credentials in .env.local"
  );
  return new DemoKajabiService();
}

/**
 * Check if we should use demo mode based on environment configuration
 */
export function shouldUseDemoMode(): boolean {
  // Check explicit DEMO_MODE flag first
  if (process.env.DEMO_MODE === "true") {
    return true;
  }
  if (process.env.DEMO_MODE === "false") {
    return false;
  }

  // Use demo mode if environment variables are not configured
  const hasShopifyConfig = !!(
    process.env.SHOPIFY_SHOP_URL && process.env.SHOPIFY_ACCESS_TOKEN
  );
  const hasKajabiConfig = !!(
    process.env.KAJABI_BASE_URL && process.env.KAJABI_API_KEY
  );

  // If neither service is configured, use demo mode
  return !hasShopifyConfig && !hasKajabiConfig;
}

export type { ShopifyAnalytics, KajabiEngagement };
