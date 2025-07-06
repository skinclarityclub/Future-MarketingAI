import { createShopifyService } from "@/lib/apis/shopify";
import {
  createDemoShopifyService,
  shouldUseDemoMode,
} from "@/lib/apis/demo-services";
import type {
  ShopifyOrder,
  ShopifyProduct,
  ShopifyAnalytics,
} from "@/lib/apis/shopify";

import type { IDataSource } from "./data-source";

/**
 * Supported query shapes for the Shopify data source.
 */
export type ShopifyQuery =
  | {
      type: "orders";
      params?: {
        limit?: number;
        since_id?: string;
        created_at_min?: string;
        created_at_max?: string;
        status?: string;
      };
    }
  | {
      type: "products";
      params?: {
        limit?: number;
        since_id?: string;
        published_status?: "published" | "unpublished" | "any";
        product_type?: string;
      };
    }
  | {
      type: "content-analytics";
      params: { startDate: string; endDate: string };
    };

export type ShopifyResult =
  | ShopifyOrder[]
  | ShopifyProduct[]
  | ShopifyAnalytics[];

/**
 * Concrete `IDataSource` implementation wrapping the existing ShopifyService.
 */
export const shopifySource: IDataSource<ShopifyQuery, ShopifyResult> = {
  name: "shopify",

  async testConnection() {
    try {
      const service = shouldUseDemoMode()
        ? createDemoShopifyService()
        : createShopifyService();

      // Demo service always resolves true
      if ("testConnection" in service) {
        // @ts-expect-error - Demo service shares same signature
        return await service.testConnection();
      }

      return true;
    } catch (error) {
      console.error("[shopifySource] Connection test failed", error);
      return false;
    }
  },

  async fetch(query) {
    const service = shouldUseDemoMode()
      ? createDemoShopifyService()
      : createShopifyService();

    switch (query.type) {
      case "orders":
        // @ts-expect-error - runtime service method differences between demo/real
        return await service.getOrders?.(query.params ?? {});
      case "products":
        // @ts-expect-error - Shopify API type mismatch
        return await service.getProducts?.(query.params ?? {});
      case "content-analytics":
        // @ts-expect-error - Shopify API type mismatch
        return await service.getContentAnalytics?.(query.params);
      default:
        throw new Error(
          `[shopifySource] Unsupported query type ${(query as any).type}`
        );
    }
  },
};

export default shopifySource;
