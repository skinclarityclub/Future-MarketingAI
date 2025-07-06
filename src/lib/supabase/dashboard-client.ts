import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Enhanced Supabase client for Executive Dashboard operations
 * Includes error handling and performance monitoring
 */
class DashboardClient {
  private client;
  private performanceStart: number = 0;

  constructor() {
    this.client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      console.warn(
        "Supabase environment variables not configured. Please check .env.local file."
      );
    }
  }

  /**
   * Start performance monitoring for a query
   */
  private startPerformanceMonitoring(): void {
    this.performanceStart = performance.now();
  }

  /**
   * End performance monitoring and log if query takes too long
   */
  private endPerformanceMonitoring(queryName: string): void {
    const duration = performance.now() - this.performanceStart;
    if (duration > 1000) {
      // Log if query takes more than 1 second
      console.warn(
        `Dashboard query "${queryName}" took ${duration.toFixed(2)}ms`
      );
    }
  }

  /**
   * Generic query wrapper with error handling and performance monitoring
   */
  private async executeQuery<T>(
    queryName: string,
    queryFn: () => Promise<{ data: T | null; error: any }>
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      this.startPerformanceMonitoring();

      const result = await queryFn();

      this.endPerformanceMonitoring(queryName);

      if (result.error) {
        console.error(`Dashboard query error in ${queryName}:`, result.error);
        return {
          data: null,
          error: `Failed to fetch ${queryName}: ${result.error.message || "Unknown error"}`,
        };
      }

      return { data: result.data, error: null };
    } catch (error) {
      this.endPerformanceMonitoring(queryName);
      console.error(`Dashboard client error in ${queryName}:`, error);
      return {
        data: null,
        error: `Network error in ${queryName}: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Test the Supabase connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.client
        .from("test_table")
        .select("*")
        .limit(1);

      if (error && error.code !== "PGRST116") {
        // PGRST116 = table doesn't exist, which is okay for testing
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown connection error",
      };
    }
  }

  /**
   * Get the raw Supabase client for advanced operations
   */
  getClient() {
    return this.client;
  }

  /**
   * Subscribe to real-time changes with error handling
   */
  subscribeToChanges<T>(
    table: string,
    callback: (payload: T) => void,
    errorCallback?: (error: string) => void
  ) {
    const subscription = this.client
      .channel(`dashboard-${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        payload => {
          try {
            callback(payload as T);
          } catch (error) {
            const errorMessage = `Error processing real-time update for ${table}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`;
            console.error(errorMessage);
            errorCallback?.(errorMessage);
          }
        }
      )
      .subscribe(status => {
        if (status !== "SUBSCRIBED") {
          const errorMessage = `Failed to subscribe to ${table} changes. Status: ${status}`;
          console.error(errorMessage);
          errorCallback?.(errorMessage);
        }
      });

    return subscription;
  }
}

// Export singleton instance
export const dashboardClient = new DashboardClient();

// Export the class for testing
export { DashboardClient };
