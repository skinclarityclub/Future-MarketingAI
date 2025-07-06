import type { IDataSource } from "./data-sources/data-source";
import { shopifySource } from "./data-sources/shopify-source.ts";
import { kajabiSource } from "./data-sources/kajabi-source.ts";
import { supabaseFinancialSource } from "./data-sources/supabase-financial-source.ts";
import { supabaseCustomerSource } from "./data-sources/supabase-customer-source.ts";
import { marketingSource } from "./data-sources/marketing-source.ts";

/**
 * Expand this union as we introduce additional data sources (Supabase, marketing, …).
 */
export type DataSourceName =
  | "shopify"
  | "kajabi"
  | "supabase_financial"
  | "supabase_customer"
  | "marketing";

const sources: Record<DataSourceName, IDataSource<any, any>> = {
  shopify: shopifySource,
  kajabi: kajabiSource,
  supabase_financial: supabaseFinancialSource,
  supabase_customer: supabaseCustomerSource,
  marketing: marketingSource,
};

/**
 * Return a map of all active data sources.
 */
export function getDataSources() {
  return sources;
}

/**
 * Convenience helper to fetch a specific data source by name.
 */
export function getDataSource<TQuery = any, TResult = any>(
  name: DataSourceName
): IDataSource<TQuery, TResult> {
  return sources[name] as IDataSource<TQuery, TResult>;
}
