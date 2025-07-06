/**
 * Kajabi API Integration Service
 * Handles authentication and data fetching from Kajabi platform
 */

interface KajabiConfig {
  baseUrl: string;
  apiKey: string;
  apiVersion?: string;
}

interface KajabiProduct {
  id: string;
  name: string;
  type: "Course" | "Community" | "Coaching" | "Podcast";
  status: "active" | "draft" | "archived";
  created_at: string;
  updated_at: string;
  published_at?: string;
  price: number;
  currency: string;
  description?: string;
  category?: string;
}

interface KajabiPurchase {
  id: string;
  product_id: string;
  person_id: string;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed" | "refunded";
  created_at: string;
  updated_at: string;
  email: string;
  product_name: string;
  transaction_id?: string;
}

interface KajabiPerson {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  last_activity?: string;
  tags?: string[];
}

interface KajabiEngagement {
  product_id: string;
  product_name: string;
  total_enrollments: number;
  active_students: number;
  completion_rate: number;
  average_progress: number;
  revenue: number;
  period: string;
}

interface KajabiWebhookEvent {
  id: string;
  event_type: string;
  data: Record<string, any>;
  created_at: string;
}

class KajabiService {
  private config: KajabiConfig;
  private baseUrl: string;

  constructor(config: KajabiConfig) {
    this.config = {
      ...config,
      apiVersion: config.apiVersion || "v1",
    };
    this.baseUrl = `${this.config.baseUrl}/api/${this.config.apiVersion}`;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Kajabi API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Fetch products (courses, communities, etc.)
   */
  async getProducts(
    params: {
      limit?: number;
      page?: number;
      type?: string;
      status?: string;
    } = {}
  ): Promise<KajabiProduct[]> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value.toString());
    });

    const queryString = searchParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ""}`;

    const response = await this.makeRequest<{ products: KajabiProduct[] }>(
      endpoint
    );
    return response.products;
  }

  /**
   * Fetch purchases/sales data
   */
  async getPurchases(
    params: {
      limit?: number;
      page?: number;
      created_after?: string;
      created_before?: string;
      status?: string;
    } = {}
  ): Promise<KajabiPurchase[]> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value.toString());
    });

    const queryString = searchParams.toString();
    const endpoint = `/purchases${queryString ? `?${queryString}` : ""}`;

    const response = await this.makeRequest<{ purchases: KajabiPurchase[] }>(
      endpoint
    );
    return response.purchases;
  }

  /**
   * Fetch people (customers/students)
   */
  async getPeople(
    params: {
      limit?: number;
      page?: number;
      email?: string;
      created_after?: string;
    } = {}
  ): Promise<KajabiPerson[]> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value.toString());
    });

    const queryString = searchParams.toString();
    const endpoint = `/people${queryString ? `?${queryString}` : ""}`;

    const response = await this.makeRequest<{ people: KajabiPerson[] }>(
      endpoint
    );
    return response.people;
  }

  /**
   * Get content engagement analytics
   */
  async getContentEngagement(dateRange: {
    startDate: string;
    endDate: string;
  }): Promise<KajabiEngagement[]> {
    const purchases = await this.getPurchases({
      created_after: dateRange.startDate,
      created_before: dateRange.endDate,
      limit: 1000,
    });

    const products = await this.getProducts({ limit: 1000 });

    // Create product lookup map
    const productMap = new Map(products.map(product => [product.id, product]));

    // Aggregate engagement data by product
    const engagementMap = new Map<
      string,
      {
        product_id: string;
        product_name: string;
        total_enrollments: number;
        revenue: number;
        active_students: Set<string>;
      }
    >();

    purchases.forEach(purchase => {
      if (purchase.status === "completed") {
        const product = productMap.get(purchase.product_id);

        if (product) {
          const existing = engagementMap.get(purchase.product_id) || {
            product_id: purchase.product_id,
            product_name: product.name,
            total_enrollments: 0,
            revenue: 0,
            active_students: new Set<string>(),
          };

          existing.total_enrollments += 1;
          existing.revenue += purchase.amount;
          existing.active_students.add(purchase.person_id);

          engagementMap.set(purchase.product_id, existing);
        }
      }
    });

    // Convert to engagement format
    return Array.from(engagementMap.values()).map(data => ({
      product_id: data.product_id,
      product_name: data.product_name,
      total_enrollments: data.total_enrollments,
      active_students: data.active_students.size,
      completion_rate: 0.75, // Placeholder - would need lesson completion data
      average_progress: 0.68, // Placeholder - would need progress tracking
      revenue: data.revenue,
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
    }));
  }

  /**
   * Get sales analytics
   */
  async getSalesAnalytics(dateRange: {
    startDate: string;
    endDate: string;
  }): Promise<{
    total_revenue: number;
    total_sales: number;
    average_order_value: number;
    top_products: Array<{
      product_name: string;
      revenue: number;
      sales_count: number;
    }>;
  }> {
    const purchases = await this.getPurchases({
      created_after: dateRange.startDate,
      created_before: dateRange.endDate,
      status: "completed",
      limit: 1000,
    });

    const totalRevenue = purchases.reduce(
      (sum, purchase) => sum + purchase.amount,
      0
    );
    const totalSales = purchases.length;
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Calculate top products
    const productSales = new Map<string, { revenue: number; count: number }>();

    purchases.forEach(purchase => {
      const existing = productSales.get(purchase.product_name) || {
        revenue: 0,
        count: 0,
      };
      existing.revenue += purchase.amount;
      existing.count += 1;
      productSales.set(purchase.product_name, existing);
    });

    const topProducts = Array.from(productSales.entries())
      .map(([productName, data]) => ({
        product_name: productName,
        revenue: data.revenue,
        sales_count: data.count,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      total_revenue: totalRevenue,
      total_sales: totalSales,
      average_order_value: averageOrderValue,
      top_products: topProducts,
    };
  }

  /**
   * Test connection to Kajabi API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest("/products?limit=1");
      return true;
    } catch (error) {
      console.error("Kajabi connection test failed:", error);
      return false;
    }
  }

  /**
   * Create webhook for real-time data sync
   */
  async createWebhook(webhookUrl: string, events: string[]): Promise<any> {
    const payload = {
      webhook: {
        url: webhookUrl,
        events: events,
      },
    };

    return this.makeRequest("/webhooks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}

/**
 * Create Kajabi service instance
 */
export function createKajabiService(): KajabiService {
  const config: KajabiConfig = {
    baseUrl: process.env.KAJABI_BASE_URL || "https://api.kajabi.com",
    apiKey: process.env.KAJABI_API_KEY || "",
    apiVersion: process.env.KAJABI_API_VERSION || "v1",
  };

  if (!config.apiKey) {
    throw new Error(
      "Kajabi configuration missing. Please set KAJABI_API_KEY environment variable."
    );
  }

  return new KajabiService(config);
}

export type {
  KajabiProduct,
  KajabiPurchase,
  KajabiPerson,
  KajabiEngagement,
  KajabiWebhookEvent,
};
