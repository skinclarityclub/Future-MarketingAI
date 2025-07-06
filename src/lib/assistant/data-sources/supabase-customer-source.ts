import { createAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { IDataSource } from "./data-source";

export interface CustomerQuery {
  type: "customers";
  params?: {
    email?: string;
    limit?: number;
    offset?: number;
  };
}

export type UnifiedCustomerRow =
  Database["public"]["Tables"]["unified_customers"]["Row"];
export type CustomerResult = UnifiedCustomerRow[];

export const supabaseCustomerSource: IDataSource<
  CustomerQuery,
  CustomerResult
> = {
  name: "supabase_customer",

  async testConnection() {
    try {
      const sb = createAdminClient();
      // Test connection by checking if we can access the database
      // Use a simple query that should work on any Supabase instance
      const { error } = await sb
        .from("business_kpi_daily")
        .select("*")
        .limit(1);
      return !error;
    } catch (error) {
      console.error("[supabaseCustomerSource] Connection test failed", error);
      return false;
    }
  },

  async fetch(query) {
    if (query.type !== "customers") {
      throw new Error("Unsupported query type for supabaseCustomerSource");
    }

    const { email, limit = 100, offset = 0 } = query.params || {};

    const sb = createAdminClient();
    let q = sb
      .from("unified_customers")
      .select("*")
      .order("updated_at", { ascending: false });
    if (email) q = q.eq("email", email);
    q = q.range(offset, offset + limit - 1);

    const { data, error } = await q;
    if (error) throw error;
    return data as UnifiedCustomerRow[];
  },
};

export default supabaseCustomerSource;
