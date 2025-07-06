/**
 * Shopify API Integration Service
 * Handles authentication and data fetching from Shopify store
 */

interface ShopifyConfig {
  shopUrl: string;
  accessToken: string;
  apiVersion?: string;
}

interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  product_type: string;
  vendor: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  tags: string;
  status: "active" | "archived" | "draft";
}

interface ShopifyOrder {
  id: string;
  order_number: string;
  email: string;
  created_at: string;
  updated_at: string;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  currency: string;
  financial_status: string;
  fulfillment_status: string;
  line_items: ShopifyLineItem[];
}

interface ShopifyLineItem {
  id: string;
  product_id: string;
  variant_id: string;
  title: string;
  quantity: number;
  price: string;
  total_discount: string;
}

interface ShopifyAnalytics {
  product_id: string;
  product_title: string;
  total_sales: number;
  total_orders: number;
  conversion_rate: number;
  revenue: number;
  period: string;
}

class ShopifyService {
  private config: ShopifyConfig;
  private baseUrl: string;

  constructor(config: ShopifyConfig) {
    this.config = {
      ...config,
      apiVersion: config.apiVersion || "2024-01",
    };
    this.baseUrl = `https://${this.config.shopUrl}/admin/api/${this.config.apiVersion}`;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "X-Shopify-Access-Token": this.config.accessToken,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Shopify API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Fetch recent orders for revenue tracking
   */
  async getOrders(
    params: {
      limit?: number;
      since_id?: string;
      created_at_min?: string;
      created_at_max?: string;
      status?: string;
    } = {}
  ): Promise<ShopifyOrder[]> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value.toString());
    });

    const queryString = searchParams.toString();
    const endpoint = `/orders.json${queryString ? `?${queryString}` : ""}`;

    const response = await this.makeRequest<{ orders: ShopifyOrder[] }>(
      endpoint
    );
    return response.orders;
  }

  /**
   * Fetch products for content tracking
   */
  async getProducts(
    params: {
      limit?: number;
      since_id?: string;
      published_status?: "published" | "unpublished" | "any";
      product_type?: string;
    } = {}
  ): Promise<ShopifyProduct[]> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value.toString());
    });

    const queryString = searchParams.toString();
    const endpoint = `/products.json${queryString ? `?${queryString}` : ""}`;

    const response = await this.makeRequest<{ products: ShopifyProduct[] }>(
      endpoint
    );
    return response.products;
  }

  /**
   * Calculate content performance analytics
   */
  async getContentAnalytics(dateRange: {
    startDate: string;
    endDate: string;
  }): Promise<ShopifyAnalytics[]> {
    const orders = await this.getOrders({
      created_at_min: dateRange.startDate,
      created_at_max: dateRange.endDate,
      limit: 250,
    });

    const products = await this.getProducts({ limit: 250 });

    // Create product lookup map
    const productMap = new Map(products.map(product => [product.id, product]));

    // Aggregate data by product
    const analyticsMap = new Map<
      string,
      {
        product_id: string;
        product_title: string;
        total_sales: number;
        total_orders: number;
        revenue: number;
      }
    >();

    orders.forEach(order => {
      order.line_items.forEach(item => {
        const productId = item.product_id;
        const product = productMap.get(productId);

        if (product) {
          const existing = analyticsMap.get(productId) || {
            product_id: productId,
            product_title: product.title,
            total_sales: 0,
            total_orders: 0,
            revenue: 0,
          };

          existing.total_sales += item.quantity;
          existing.total_orders += 1;
          existing.revenue += parseFloat(item.price) * item.quantity;

          analyticsMap.set(productId, existing);
        }
      });
    });

    // Convert to analytics format
    return Array.from(analyticsMap.values()).map(data => ({
      ...data,
      conversion_rate:
        data.total_orders > 0 ? data.total_sales / data.total_orders : 0,
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
    }));
  }

  /**
   * Test connection to Shopify API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest("/shop.json");
      return true;
    } catch (error) {
      console.error("Shopify connection test failed:", error);
      return false;
    }
  }
}

/**
 * Create Shopify service instance
 */
export function createShopifyService(): ShopifyService {
  const config: ShopifyConfig = {
    shopUrl: process.env.SHOPIFY_SHOP_URL || "",
    accessToken: process.env.SHOPIFY_ACCESS_TOKEN || "",
    apiVersion: process.env.SHOPIFY_API_VERSION || "2024-01",
  };

  if (!config.shopUrl || !config.accessToken) {
    console.warn(
      "Shopify configuration missing. Please set SHOPIFY_SHOP_URL and SHOPIFY_ACCESS_TOKEN environment variables."
    );
    throw new Error(
      "Shopify configuration missing. Please set SHOPIFY_SHOP_URL and SHOPIFY_ACCESS_TOKEN environment variables."
    );
  }

  return new ShopifyService(config);
}

export type { ShopifyProduct, ShopifyOrder, ShopifyAnalytics, ShopifyLineItem };
