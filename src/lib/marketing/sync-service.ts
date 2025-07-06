import { GoogleAdsService } from "./google-ads-service";
import { MetaAdsService } from "./meta-ads-service";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

interface SyncResult {
  provider: "google_ads" | "meta_ads";
  success: boolean;
  accountsProcessed: number;
  recordsImported: number;
  errors: string[];
  executionTime: number;
}

interface SyncSummary {
  totalSuccess: number;
  totalFailed: number;
  totalRecords: number;
  totalExecutionTime: number;
  results: SyncResult[];
  lastSyncAt: string;
}

export class MarketingDataSyncService {
  private googleAdsService: GoogleAdsService;
  private metaAdsService: MetaAdsService;
  private supabase;

  constructor() {
    this.googleAdsService = new GoogleAdsService();
    this.metaAdsService = new MetaAdsService();

    const cookieStore = cookies();
    this.supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const cookies = await cookieStore;
            return cookies.get(name)?.value;
          },
        },
      }
    );
  }

  /**
   * Sync data from all connected marketing platforms
   */
  async syncAllPlatforms(
    userId: string,
    startDate: string,
    endDate: string,
    platforms: Array<"google_ads" | "meta_ads"> = ["google_ads", "meta_ads"]
  ): Promise<SyncSummary> {
    const results: SyncResult[] = [];
    const summary: SyncSummary = {
      totalSuccess: 0,
      totalFailed: 0,
      totalRecords: 0,
      totalExecutionTime: 0,
      results: [],
      lastSyncAt: new Date().toISOString(),
    };

    // Log sync start
    await this.logSyncEvent(userId, "sync_started", {
      platforms,
      dateRange: { startDate, endDate },
    });

    try {
      // Sync Google Ads data
      if (platforms.includes("google_ads")) {
        const googleResult = await this.syncGoogleAds(
          userId,
          startDate,
          endDate
        );
        results.push(googleResult);
      }

      // Sync Meta Ads data
      if (platforms.includes("meta_ads")) {
        const metaResult = await this.syncMetaAds(userId, startDate, endDate);
        results.push(metaResult);
      }

      // Calculate summary
      summary.results = results;
      summary.totalSuccess = results.filter(r => r.success).length;
      summary.totalFailed = results.filter(r => !r.success).length;
      summary.totalRecords = results.reduce(
        (sum, r) => sum + r.recordsImported,
        0
      );
      summary.totalExecutionTime = results.reduce(
        (sum, r) => sum + r.executionTime,
        0
      );

      // Log sync completion
      await this.logSyncEvent(userId, "sync_completed", summary);

      return summary;
    } catch (error) {
      // Log sync error
      await this.logSyncEvent(userId, "sync_failed", { error: String(error) });
      throw error;
    }
  }

  /**
   * Sync Google Ads data
   */
  private async syncGoogleAds(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      provider: "google_ads",
      success: false,
      accountsProcessed: 0,
      recordsImported: 0,
      errors: [],
      executionTime: 0,
    };

    try {
      // Check if user has valid connection
      const hasConnection =
        await this.googleAdsService.hasValidConnection(userId);
      if (!hasConnection) {
        result.errors.push("No valid Google Ads connection");
        return result;
      }

      // Sync data for all customers
      const syncResults = await this.googleAdsService.syncAllCustomersData(
        userId,
        startDate,
        endDate
      );

      result.success = syncResults.failed === 0;
      result.accountsProcessed = syncResults.success + syncResults.failed;
      result.errors = syncResults.errors;

      // Count imported records
      const recordCount = await this.getRecordCount(
        "google_ads_performance",
        startDate,
        endDate
      );
      result.recordsImported = recordCount;
    } catch (error) {
      result.errors.push(`Google Ads sync failed: ${error}`);
      console.error("Google Ads sync error:", error);
    } finally {
      result.executionTime = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Sync Meta Ads data
   */
  private async syncMetaAds(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      provider: "meta_ads",
      success: false,
      accountsProcessed: 0,
      recordsImported: 0,
      errors: [],
      executionTime: 0,
    };

    try {
      // Check if user has valid connection
      const hasConnection =
        await this.metaAdsService.hasValidConnection(userId);
      if (!hasConnection) {
        result.errors.push("No valid Meta Ads connection");
        return result;
      }

      // Sync data for all ad accounts
      const syncResults = await this.metaAdsService.syncAllAccountsData(
        userId,
        startDate,
        endDate
      );

      result.success = syncResults.failed === 0;
      result.accountsProcessed = syncResults.success + syncResults.failed;
      result.errors = syncResults.errors;

      // Count imported records
      const recordCount = await this.getRecordCount(
        "meta_ads_performance",
        startDate,
        endDate
      );
      result.recordsImported = recordCount;
    } catch (error) {
      result.errors.push(`Meta Ads sync failed: ${error}`);
      console.error("Meta Ads sync error:", error);
    } finally {
      result.executionTime = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Get record count for a date range
   */
  private async getRecordCount(
    tableName: string,
    startDate: string,
    endDate: string
  ): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from(tableName)
        .select("*", { count: "exact", head: true })
        .gte("date", startDate)
        .lte("date", endDate);

      if (error) {
        console.error(`Error counting records in ${tableName}:`, error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error(`Error counting records:`, error);
      return 0;
    }
  }

  /**
   * Get sync status for user
   */
  async getSyncStatus(userId: string): Promise<{
    googleAds: { connected: boolean; lastSync?: string };
    metaAds: { connected: boolean; lastSync?: string };
    lastFullSync?: string;
  }> {
    const [googleConnected, metaConnected, lastSyncLog] = await Promise.all([
      this.googleAdsService.hasValidConnection(userId),
      this.metaAdsService.hasValidConnection(userId),
      this.getLastSyncLog(userId),
    ]);

    return {
      googleAds: {
        connected: googleConnected,
        lastSync: lastSyncLog?.google_ads_last_sync,
      },
      metaAds: {
        connected: metaConnected,
        lastSync: lastSyncLog?.meta_ads_last_sync,
      },
      lastFullSync: lastSyncLog?.last_full_sync,
    };
  }

  /**
   * Schedule incremental sync (last 7 days)
   */
  async scheduleIncrementalSync(userId: string): Promise<SyncSummary> {
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    return this.syncAllPlatforms(userId, startDate, endDate);
  }

  /**
   * Full historical sync (last 90 days)
   */
  async scheduleFullSync(userId: string): Promise<SyncSummary> {
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    return this.syncAllPlatforms(userId, startDate, endDate);
  }

  /**
   * Log sync events for monitoring
   */
  private async logSyncEvent(
    userId: string,
    eventType: string,
    data: any
  ): Promise<void> {
    try {
      await this.supabase.from("marketing_sync_logs").insert({
        user_id: userId,
        event_type: eventType,
        event_data: data,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to log sync event:", error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Get last sync log for user
   */
  private async getLastSyncLog(userId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from("marketing_sync_logs")
        .select("*")
        .eq("user_id", userId)
        .eq("event_type", "sync_completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return null;
      }

      return data.event_data;
    } catch (error) {
      console.error("Error fetching last sync log:", error);
      return null;
    }
  }

  /**
   * Clean up old sync logs (keep last 30 days)
   */
  async cleanupOldLogs(): Promise<void> {
    const cutoffDate = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    try {
      await this.supabase
        .from("marketing_sync_logs")
        .delete()
        .lt("created_at", cutoffDate);
    } catch (error) {
      console.error("Failed to cleanup old sync logs:", error);
    }
  }
}
