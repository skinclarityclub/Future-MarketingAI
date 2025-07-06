import { createKajabiService } from "@/lib/apis/kajabi";
import {
  createDemoKajabiService,
  shouldUseDemoMode,
} from "@/lib/apis/demo-services";
import type {
  KajabiProduct,
  KajabiPurchase,
  KajabiPerson,
  KajabiEngagement,
} from "@/lib/apis/kajabi";

import type { IDataSource } from "./data-source";

export type KajabiQuery =
  | {
      type: "products";
      params?: {
        limit?: number;
        page?: number;
        type?: string;
        status?: string;
      };
    }
  | {
      type: "purchases";
      params?: {
        limit?: number;
        page?: number;
        created_after?: string;
        created_before?: string;
        status?: string;
      };
    }
  | {
      type: "people";
      params?: {
        limit?: number;
        page?: number;
        email?: string;
        created_after?: string;
      };
    }
  | {
      type: "content-engagement";
      params: { startDate: string; endDate: string };
    }
  | {
      type: "sales-analytics";
      params: { startDate: string; endDate: string };
    };

export type KajabiResult =
  | KajabiProduct[]
  | KajabiPurchase[]
  | KajabiPerson[]
  | KajabiEngagement[]
  | {
      total_revenue: number;
      total_sales: number;
      average_order_value: number;
      top_products: Array<{
        product_name: string;
        revenue: number;
        sales_count: number;
      }>;
    };

export const kajabiSource: IDataSource<KajabiQuery, KajabiResult> = {
  name: "kajabi",

  async testConnection() {
    try {
      const service = shouldUseDemoMode()
        ? createDemoKajabiService()
        : createKajabiService();

      if ("testConnection" in service) {
        // Service type assertion is safe here - both demo and real services implement testConnection
        return await service.testConnection();
      }

      return true;
    } catch (error) {
      console.error("[kajabiSource] Connection test failed", error);
      return false;
    }
  },

  async fetch(query) {
    const service = shouldUseDemoMode()
      ? createDemoKajabiService()
      : createKajabiService();

    switch (query.type) {
      case "products":
        // @ts-expect-error - Service type is dynamic based on demo mode
        return await service.getProducts?.(query.params ?? {});
      case "purchases":
        // @ts-expect-error - Service type is dynamic based on demo mode
        return await service.getPurchases?.(query.params ?? {});
      case "people":
        // @ts-expect-error - Service type is dynamic based on demo mode
        return await service.getPeople?.(query.params ?? {});
      case "content-engagement":
        // @ts-expect-error - Service type is dynamic based on demo mode
        return await service.getContentEngagement?.(query.params);
      case "sales-analytics":
        // @ts-expect-error - Service type is dynamic based on demo mode
        return await service.getSalesAnalytics?.(query.params);
      default:
        throw new Error(
          `[kajabiSource] Unsupported query type ${(query as any).type}`
        );
    }
  },
};

export default kajabiSource;
