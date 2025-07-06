import { createAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { IDataSource } from "./data-source";

export interface FinancialMetricsQuery {
  type: "metrics" | "general" | "analysis" | "trends";
  params?: {
    metric_name?: string;
    startDate?: string; // ISO string (inclusive)
    endDate?: string; // ISO string (inclusive)
    limit?: number;
    category?: string;
    aggregation?: "daily" | "weekly" | "monthly";
  };
}

export type FinancialMetricsRow =
  Database["public"]["Tables"]["business_kpi_daily"]["Row"];

export type FinancialMetricsResult = FinancialMetricsRow[];

export const supabaseFinancialSource: IDataSource<
  FinancialMetricsQuery,
  FinancialMetricsResult
> = {
  name: "supabase_financial",

  async testConnection() {
    try {
      const sb = createAdminClient();
      // Simple test: try to query the table structure
      const { error } = await sb
        .from("business_kpi_daily")
        .select("*")
        .limit(1);
      return !error;
    } catch (error) {
      console.error("[supabaseFinancialSource] Connection test failed", error);
      return false;
    }
  },

  async fetch(query) {
    const supportedTypes = ["metrics", "general", "analysis", "trends"];
    if (!supportedTypes.includes(query.type)) {
      throw new Error(
        `Unsupported query type for supabaseFinancialSource: ${query.type}. Supported types: ${supportedTypes.join(", ")}`
      );
    }

    const { metric_name, startDate, endDate, limit, category } =
      query.params || {};

    const sb = createAdminClient();

    let q = sb
      .from("business_kpi_daily")
      .select("*")
      .order("date", { ascending: false });

    // Apply filters based on query type
    switch (query.type) {
      case "metrics":
        if (metric_name) q = q.eq("metric_name", metric_name);
        break;
      case "general":
        // General queries get all data with basic filtering
        break;
      case "analysis":
        // Analysis queries might focus on specific metrics
        if (category) q = q.ilike("metric_name", `%${category}%`);
        break;
      case "trends":
        // Trend queries typically need time-based data
        if (!limit) q = q.limit(100); // Default limit for trends
        break;
    }

    // Apply common filters
    if (startDate) q = q.gte("date", startDate);
    if (endDate) q = q.lte("date", endDate);
    if (limit) q = q.limit(limit);

    const { data, error } = await q;

    if (error) {
      console.error(
        `[supabaseFinancialSource] Query failed for type ${query.type}:`,
        error
      );
      throw error;
    }

    // Return empty array if no data found (prevent "0 rows" errors)
    return (data || []) as FinancialMetricsRow[];
  },
};

export default supabaseFinancialSource;
