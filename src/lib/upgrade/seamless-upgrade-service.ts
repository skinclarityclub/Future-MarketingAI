"use client";

import { createClient } from "@/lib/supabase/client";
import {
  subscriptionService,
  Subscription,
} from "@/lib/subscription/subscription-service";
import { SubscriptionTier } from "@/lib/rbac/access-tier-service";

// Data preservation interfaces
export interface UserDataSnapshot {
  // User profile and preferences
  userProfile: any;
  userPreferences: any;
  dashboardLayout: any;

  // Context and session data
  sessionMemories: any[];
  conversationEntries: any[];
  learningInsights: any[];
  behaviorPatterns: any[];
  contextualKnowledge: any[];
  relationshipMaps: any[];

  // Feature-specific data
  featureUsage: any[];
  customSettings: Record<string, any>;
  workflowStates: any[];
  savedReports: any[];
  dashboardConfigurations: any[];

  // Analytics and progress
  analyticsData: any[];
  achievementProgress: any[];

  // Timestamp for migration
  snapshotTimestamp: Date;
  originalTier: SubscriptionTier;
  targetTier: SubscriptionTier;
}

export interface UpgradeProgress {
  step:
    | "starting"
    | "backing_up"
    | "upgrading"
    | "migrating"
    | "restoring"
    | "finalizing"
    | "completed"
    | "failed";
  progress: number; // 0-100
  message: string;
  details?: string;
  startTime: Date;
  estimatedTimeRemaining?: number;
}

export interface UpgradeResult {
  success: boolean;
  subscription?: Subscription;
  dataSnapshot?: UserDataSnapshot;
  migratedFeatures: string[];
  preservedSettings: string[];
  newFeatures: string[];
  errors?: string[];
  warnings?: string[];
  rollbackAvailable: boolean;
}

export interface DataMigrationRule {
  feature: string;
  fromTier: SubscriptionTier;
  toTier: SubscriptionTier;
  preserveData: boolean;
  migrateSettings: boolean;
  transformData?: (data: any) => any;
  validateMigration?: (originalData: any, migratedData: any) => boolean;
}

/**
 * Seamless Upgrade Service
 * Handles tier upgrades while preserving user data, context, and session continuity
 */
export class SeamlessUpgradeService {
  private static instance: SeamlessUpgradeService;
  private supabase = createClient();

  // Active upgrade tracking
  private activeUpgrades = new Map<string, UpgradeProgress>();
  private upgradeListeners = new Map<
    string,
    ((progress: UpgradeProgress) => void)[]
  >();

  public static getInstance(): SeamlessUpgradeService {
    if (!SeamlessUpgradeService.instance) {
      SeamlessUpgradeService.instance = new SeamlessUpgradeService();
    }
    return SeamlessUpgradeService.instance;
  }

  /**
   * Perform seamless upgrade with data preservation
   */
  async performSeamlessUpgrade(
    userId: string,
    targetTier: SubscriptionTier,
    billingInterval: "monthly" | "yearly" = "monthly",
    preserveContext: boolean = true
  ): Promise<UpgradeResult> {
    const upgradeId = `upgrade_${userId}_${Date.now()}`;

    try {
      // Initialize upgrade tracking
      this.startUpgradeProgress(
        upgradeId,
        "starting",
        "Initializing upgrade process..."
      );

      // Step 1: Create data snapshot
      this.updateUpgradeProgress(
        upgradeId,
        "backing_up",
        10,
        "Creating data backup..."
      );
      const snapshot = await this.createUserDataSnapshot(userId, targetTier);

      // Step 2: Validate upgrade compatibility
      this.updateUpgradeProgress(
        upgradeId,
        "backing_up",
        20,
        "Validating upgrade compatibility..."
      );
      const compatibility = await this.validateUpgradeCompatibility(
        snapshot,
        targetTier
      );

      if (!compatibility.compatible) {
        throw new Error(`Upgrade incompatible: ${compatibility.reason}`);
      }

      // Step 3: Perform subscription upgrade
      this.updateUpgradeProgress(
        upgradeId,
        "upgrading",
        30,
        "Processing subscription upgrade..."
      );
      const upgradeResponse = await subscriptionService.changeSubscription(
        userId,
        {
          targetTier,
          billingInterval,
        }
      );

      // Step 4: Migrate user data
      this.updateUpgradeProgress(
        upgradeId,
        "migrating",
        50,
        "Migrating user data and settings..."
      );
      const migrationResult = await this.migrateUserData(snapshot, targetTier);

      // Step 5: Update feature access
      this.updateUpgradeProgress(
        upgradeId,
        "migrating",
        70,
        "Updating feature access..."
      );
      await this.updateFeatureAccess(userId, snapshot.originalTier, targetTier);

      // Step 6: Preserve session context
      if (preserveContext) {
        this.updateUpgradeProgress(
          upgradeId,
          "restoring",
          80,
          "Preserving session context..."
        );
        await this.preserveSessionContext(userId, snapshot);
      }

      // Step 7: Validate data integrity
      this.updateUpgradeProgress(
        upgradeId,
        "restoring",
        90,
        "Validating data integrity..."
      );
      const validationResult = await this.validateDataIntegrity(
        userId,
        snapshot
      );

      // Step 8: Finalize upgrade
      this.updateUpgradeProgress(
        upgradeId,
        "finalizing",
        95,
        "Finalizing upgrade..."
      );
      await this.finalizeUpgrade(userId, upgradeId, snapshot);

      // Complete
      this.updateUpgradeProgress(
        upgradeId,
        "completed",
        100,
        "Upgrade completed successfully!"
      );

      const result: UpgradeResult = {
        success: true,
        subscription: upgradeResponse.subscription,
        dataSnapshot: snapshot,
        migratedFeatures: migrationResult.migratedFeatures,
        preservedSettings: migrationResult.preservedSettings,
        newFeatures: migrationResult.newFeatures,
        warnings: validationResult.warnings,
        rollbackAvailable: true,
      };

      // Clean up upgrade tracking
      setTimeout(() => this.cleanupUpgradeTracking(upgradeId), 30000);

      return result;
    } catch (error) {
      this.updateUpgradeProgress(
        upgradeId,
        "failed",
        0,
        `Upgrade failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );

      // Attempt rollback if possible
      const rollbackResult = await this.rollbackUpgrade(userId, upgradeId);

      return {
        success: false,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        rollbackAvailable: rollbackResult.success,
        migratedFeatures: [],
        preservedSettings: [],
        newFeatures: [],
      };
    }
  }

  /**
   * Create comprehensive user data snapshot
   */
  async createUserDataSnapshot(
    userId: string,
    targetTier: SubscriptionTier
  ): Promise<UserDataSnapshot> {
    const currentSubscription =
      await subscriptionService.getUserSubscription(userId);

    const [
      userProfile,
      userPreferences,
      sessionMemories,
      conversationEntries,
      learningInsights,
      behaviorPatterns,
      contextualKnowledge,
      relationshipMaps,
      featureUsage,
      savedReports,
      dashboardConfigs,
    ] = await Promise.all([
      this.getUserProfile(userId),
      this.getUserPreferences(userId),
      this.getSessionMemories(userId),
      this.getConversationEntries(userId),
      this.getLearningInsights(userId),
      this.getBehaviorPatterns(userId),
      this.getContextualKnowledge(userId),
      this.getRelationshipMaps(userId),
      this.getFeatureUsage(userId),
      this.getSavedReports(userId),
      this.getDashboardConfigurations(userId),
    ]);

    return {
      userProfile,
      userPreferences,
      dashboardLayout: userPreferences?.dashboard_layout || {},
      sessionMemories,
      conversationEntries,
      learningInsights,
      behaviorPatterns,
      contextualKnowledge,
      relationshipMaps,
      featureUsage,
      customSettings: await this.getCustomSettings(userId),
      workflowStates: await this.getWorkflowStates(userId),
      savedReports,
      dashboardConfigurations: dashboardConfigs,
      analyticsData: await this.getAnalyticsData(userId),
      achievementProgress: await this.getAchievementProgress(userId),
      snapshotTimestamp: new Date(),
      originalTier: currentSubscription?.tier || "free",
      targetTier,
    };
  }

  /**
   * Migrate user data according to tier rules
   */
  async migrateUserData(
    snapshot: UserDataSnapshot,
    targetTier: SubscriptionTier
  ) {
    const migrationRules = this.getMigrationRules(
      snapshot.originalTier,
      targetTier
    );
    const migratedFeatures: string[] = [];
    const preservedSettings: string[] = [];
    const newFeatures: string[] = [];

    for (const rule of migrationRules) {
      try {
        if (rule.preserveData) {
          migratedFeatures.push(rule.feature);

          // Apply data transformation if specified
          if (rule.transformData) {
            const originalData = this.getFeatureData(snapshot, rule.feature);
            const transformedData = rule.transformData(originalData);
            await this.saveTransformedData(
              snapshot.userProfile.user_id,
              rule.feature,
              transformedData
            );
          }
        }

        if (rule.migrateSettings) {
          preservedSettings.push(rule.feature);
          await this.migrateFeatureSettings(
            snapshot.userProfile.user_id,
            rule.feature,
            snapshot
          );
        }

        // Check if this is a new feature for the target tier
        if (
          this.isNewFeatureForTier(
            rule.feature,
            snapshot.originalTier,
            targetTier
          )
        ) {
          newFeatures.push(rule.feature);
          await this.initializeNewFeature(
            snapshot.userProfile.user_id,
            rule.feature
          );
        }
      } catch (error) {
        console.error(`Migration failed for feature ${rule.feature}:`, error);
      }
    }

    return { migratedFeatures, preservedSettings, newFeatures };
  }

  /**
   * Preserve session context during upgrade
   */
  async preserveSessionContext(
    userId: string,
    snapshot: UserDataSnapshot
  ): Promise<void> {
    try {
      // Maintain active session state
      await this.maintainActiveSession(userId);

      // Preserve dashboard state
      await this.preserveDashboardState(userId, snapshot.dashboardLayout);

      // Update context with new tier capabilities
      await this.updateContextWithNewCapabilities(userId, snapshot.targetTier);

      // Preserve user interaction patterns
      await this.preserveInteractionPatterns(userId, snapshot.behaviorPatterns);
    } catch (error) {
      console.error("Failed to preserve session context:", error);
      throw error;
    }
  }

  /**
   * Update feature access for new tier
   */
  async updateFeatureAccess(
    userId: string,
    fromTier: SubscriptionTier,
    toTier: SubscriptionTier
  ): Promise<void> {
    // Clear any cached feature access
    await this.clearFeatureAccessCache(userId);

    // Enable new features
    const newFeatures = this.getNewFeaturesForTier(fromTier, toTier);
    for (const feature of newFeatures) {
      await this.enableFeatureForUser(userId, feature);
    }

    // Update usage quotas
    await this.updateUsageQuotas(userId, toTier);
  }

  /**
   * Validate data integrity after migration
   */
  async validateDataIntegrity(userId: string, snapshot: UserDataSnapshot) {
    const warnings: string[] = [];

    try {
      // Validate user profile
      const currentProfile = await this.getUserProfile(userId);
      if (!currentProfile) {
        warnings.push("User profile validation failed");
      }

      // Validate preferences migration
      const currentPreferences = await this.getUserPreferences(userId);
      if (!currentPreferences && snapshot.userPreferences) {
        warnings.push("User preferences may not have migrated correctly");
      }

      // Validate context preservation
      const contextValid = await this.validateContextPreservation(
        userId,
        snapshot
      );
      if (!contextValid) {
        warnings.push("Context preservation may be incomplete");
      }

      // Validate feature access
      const featuresValid = await this.validateFeatureAccess(
        userId,
        snapshot.targetTier
      );
      if (!featuresValid) {
        warnings.push("Feature access validation failed");
      }
    } catch (error) {
      warnings.push(
        `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    return { warnings };
  }

  /**
   * Subscribe to upgrade progress updates
   */
  subscribeToUpgradeProgress(
    userId: string,
    callback: (progress: UpgradeProgress) => void
  ): () => void {
    const upgradeId = this.findActiveUpgradeForUser(userId);
    if (!upgradeId) return () => {};

    if (!this.upgradeListeners.has(upgradeId)) {
      this.upgradeListeners.set(upgradeId, []);
    }

    this.upgradeListeners.get(upgradeId)!.push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.upgradeListeners.get(upgradeId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Get current upgrade progress
   */
  getUpgradeProgress(userId: string): UpgradeProgress | null {
    const upgradeId = this.findActiveUpgradeForUser(userId);
    return upgradeId ? this.activeUpgrades.get(upgradeId) || null : null;
  }

  /**
   * Rollback upgrade if something goes wrong
   */
  async rollbackUpgrade(
    userId: string,
    upgradeId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the original snapshot
      const snapshot = await this.getUpgradeSnapshot(upgradeId);
      if (!snapshot) {
        return { success: false, error: "No snapshot available for rollback" };
      }

      // Revert subscription
      await subscriptionService.changeSubscription(userId, {
        targetTier: snapshot.originalTier,
      });

      // Restore user data
      await this.restoreUserDataFromSnapshot(userId, snapshot);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Rollback failed",
      };
    }
  }

  // Private helper methods
  private startUpgradeProgress(
    upgradeId: string,
    step: UpgradeProgress["step"],
    message: string
  ) {
    const progress: UpgradeProgress = {
      step,
      progress: 0,
      message,
      startTime: new Date(),
    };

    this.activeUpgrades.set(upgradeId, progress);
  }

  private updateUpgradeProgress(
    upgradeId: string,
    step: UpgradeProgress["step"],
    progress: number,
    message: string,
    details?: string
  ) {
    const current = this.activeUpgrades.get(upgradeId);
    if (!current) return;

    const updated: UpgradeProgress = {
      ...current,
      step,
      progress,
      message,
      details,
      estimatedTimeRemaining: this.calculateEstimatedTime(
        current.startTime,
        progress
      ),
    };

    this.activeUpgrades.set(upgradeId, updated);

    // Notify listeners
    const listeners = this.upgradeListeners.get(upgradeId) || [];
    listeners.forEach(callback => callback(updated));
  }

  private calculateEstimatedTime(startTime: Date, progress: number): number {
    if (progress <= 0) return 0;

    const elapsed = Date.now() - startTime.getTime();
    const totalEstimated = (elapsed / progress) * 100;
    return Math.max(0, totalEstimated - elapsed);
  }

  private findActiveUpgradeForUser(userId: string): string | null {
    for (const [upgradeId, progress] of this.activeUpgrades) {
      if (
        upgradeId.includes(userId) &&
        progress.step !== "completed" &&
        progress.step !== "failed"
      ) {
        return upgradeId;
      }
    }
    return null;
  }

  private cleanupUpgradeTracking(upgradeId: string) {
    this.activeUpgrades.delete(upgradeId);
    this.upgradeListeners.delete(upgradeId);
  }

  // Data retrieval methods
  private async getUserProfile(userId: string) {
    const { data } = await this.supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    return data;
  }

  private async getUserPreferences(userId: string) {
    const { data } = await this.supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();
    return data;
  }

  private async getSessionMemories(userId: string) {
    const { data } = await this.supabase
      .from("session_memories")
      .select("*")
      .eq("user_id", userId)
      .order("last_activity", { ascending: false })
      .limit(50);
    return data || [];
  }

  private async getConversationEntries(userId: string) {
    const { data } = await this.supabase
      .from("conversation_entries")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(100);
    return data || [];
  }

  private async getLearningInsights(userId: string) {
    const { data } = await this.supabase
      .from("learning_insights")
      .select("*")
      .eq("user_id", userId);
    return data || [];
  }

  private async getBehaviorPatterns(userId: string) {
    const { data } = await this.supabase
      .from("behavior_patterns")
      .select("*")
      .eq("user_id", userId);
    return data || [];
  }

  private async getContextualKnowledge(userId: string) {
    const { data } = await this.supabase
      .from("contextual_knowledge")
      .select("*")
      .eq("user_id", userId);
    return data || [];
  }

  private async getRelationshipMaps(userId: string) {
    const { data } = await this.supabase
      .from("relationship_maps")
      .select("*")
      .eq("user_id", userId);
    return data || [];
  }

  private async getFeatureUsage(userId: string) {
    const { data } = await this.supabase
      .from("feature_usage")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    return data || [];
  }

  private async getCustomSettings(
    userId: string
  ): Promise<Record<string, any>> {
    // Retrieve custom user settings from various sources
    try {
      const { data } = await this.supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userId);

      const settings: Record<string, any> = {};
      if (data) {
        data.forEach((setting: any) => {
          settings[setting.key] = setting.value;
        });
      }
      return settings;
    } catch {
      return {};
    }
  }

  private async getWorkflowStates(userId: string) {
    try {
      const { data } = await this.supabase
        .from("workflow_states")
        .select("*")
        .eq("user_id", userId);
      return data || [];
    } catch {
      return [];
    }
  }

  private async getSavedReports(userId: string) {
    try {
      const { data } = await this.supabase
        .from("saved_reports")
        .select("*")
        .eq("user_id", userId);
      return data || [];
    } catch {
      return [];
    }
  }

  private async getDashboardConfigurations(userId: string) {
    try {
      const { data } = await this.supabase
        .from("dashboard_configurations")
        .select("*")
        .eq("user_id", userId);
      return data || [];
    } catch {
      return [];
    }
  }

  private async getAnalyticsData(userId: string) {
    try {
      const { data } = await this.supabase
        .from("user_analytics")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    } catch {
      return [];
    }
  }

  private async getAchievementProgress(userId: string) {
    try {
      const { data } = await this.supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", userId);
      return data || [];
    } catch {
      return [];
    }
  }

  // Migration rule definitions
  private getMigrationRules(
    fromTier: SubscriptionTier,
    toTier: SubscriptionTier
  ): DataMigrationRule[] {
    return [
      {
        feature: "dashboard_layout",
        fromTier,
        toTier,
        preserveData: true,
        migrateSettings: true,
      },
      {
        feature: "user_preferences",
        fromTier,
        toTier,
        preserveData: true,
        migrateSettings: true,
      },
      {
        feature: "context_data",
        fromTier,
        toTier,
        preserveData: true,
        migrateSettings: false,
      },
      {
        feature: "ai_context",
        fromTier,
        toTier,
        preserveData: true,
        migrateSettings: true,
        transformData: data => {
          return this.enhanceAIContextForTier(data, toTier);
        },
      },
      {
        feature: "advanced_analytics",
        fromTier,
        toTier,
        preserveData: toTier !== "free",
        migrateSettings: true,
      },
      {
        feature: "custom_workflows",
        fromTier,
        toTier,
        preserveData:
          toTier === "professional" ||
          toTier === "enterprise" ||
          toTier === "ultimate",
        migrateSettings: true,
      },
    ];
  }

  private enhanceAIContextForTier(
    contextData: any,
    tier: SubscriptionTier
  ): any {
    const enhanced = { ...contextData };

    if (
      tier === "professional" ||
      tier === "enterprise" ||
      tier === "ultimate"
    ) {
      enhanced.enhanced_features = true;
      enhanced.advanced_insights = true;
      enhanced.retention_period =
        tier === "enterprise" || tier === "ultimate" ? "unlimited" : "1year";
    }

    if (tier === "enterprise" || tier === "ultimate") {
      enhanced.enterprise_context = true;
      enhanced.custom_ai_models = true;
      enhanced.advanced_personalization = true;
    }

    if (tier === "ultimate") {
      enhanced.white_label_context = true;
      enhanced.custom_training_data = true;
    }

    return enhanced;
  }

  // Additional helper methods would be implemented here
  private async validateUpgradeCompatibility(
    snapshot: UserDataSnapshot,
    targetTier: SubscriptionTier
  ) {
    // Check for any compatibility issues
    const issues: string[] = [];

    // Check data size limits
    if (targetTier === "free" && snapshot.conversationEntries.length > 100) {
      issues.push("Too much conversation history for free tier");
    }

    // Check feature dependencies
    if (snapshot.customSettings.advanced_features && targetTier === "free") {
      issues.push("Advanced features not available in free tier");
    }

    return {
      compatible: issues.length === 0,
      reason: issues.join(", "),
    };
  }

  private getFeatureData(snapshot: UserDataSnapshot, feature: string): any {
    switch (feature) {
      case "dashboard_layout":
        return snapshot.dashboardLayout;
      case "user_preferences":
        return snapshot.userPreferences;
      case "context_data":
        return {
          sessionMemories: snapshot.sessionMemories,
          conversationEntries: snapshot.conversationEntries,
          learningInsights: snapshot.learningInsights,
          behaviorPatterns: snapshot.behaviorPatterns,
          contextualKnowledge: snapshot.contextualKnowledge,
          relationshipMaps: snapshot.relationshipMaps,
        };
      case "ai_context":
        return {
          insights: snapshot.learningInsights,
          patterns: snapshot.behaviorPatterns,
          knowledge: snapshot.contextualKnowledge,
        };
      default:
        return {};
    }
  }

  private async saveTransformedData(
    userId: string,
    feature: string,
    data: any
  ): Promise<void> {
    try {
      if (feature === "ai_context") {
        // Update enhanced AI context
        if (data.insights) {
          await this.supabase.from("learning_insights").upsert(
            data.insights.map((insight: any) => ({
              ...insight,
              user_id: userId,
            }))
          );
        }

        if (data.patterns) {
          await this.supabase.from("behavior_patterns").upsert(
            data.patterns.map((pattern: any) => ({
              ...pattern,
              user_id: userId,
            }))
          );
        }
      }
    } catch (error) {
      console.error(`Failed to save transformed data for ${feature}:`, error);
    }
  }

  private async migrateFeatureSettings(
    userId: string,
    feature: string,
    snapshot: UserDataSnapshot
  ): Promise<void> {
    try {
      switch (feature) {
        case "dashboard_layout":
          if (snapshot.userPreferences) {
            await this.supabase.from("user_preferences").upsert({
              user_id: userId,
              dashboard_layout: snapshot.dashboardLayout,
              updated_at: new Date().toISOString(),
            });
          }
          break;

        case "user_preferences":
          if (snapshot.userPreferences) {
            await this.supabase.from("user_preferences").upsert({
              ...snapshot.userPreferences,
              user_id: userId,
              updated_at: new Date().toISOString(),
            });
          }
          break;
      }
    } catch (error) {
      console.error(`Failed to migrate settings for ${feature}:`, error);
    }
  }

  private isNewFeatureForTier(
    feature: string,
    fromTier: SubscriptionTier,
    toTier: SubscriptionTier
  ): boolean {
    const tierFeatures: Record<SubscriptionTier, string[]> = {
      free: ["basic_dashboard", "basic_analytics"],
      starter: ["basic_dashboard", "basic_analytics"],
      professional: [
        "advanced_dashboard",
        "advanced_analytics",
        "custom_workflows",
        "api_access",
      ],
      enterprise: [
        "enterprise_dashboard",
        "enterprise_analytics",
        "sso",
        "advanced_security",
        "white_label",
      ],
      ultimate: [
        "ultimate_features",
        "custom_ai",
        "dedicated_support",
        "custom_integrations",
      ],
    };

    const fromFeatures = tierFeatures[fromTier] || [];
    const toFeatures = tierFeatures[toTier] || [];

    return toFeatures.includes(feature) && !fromFeatures.includes(feature);
  }

  private async initializeNewFeature(
    userId: string,
    feature: string
  ): Promise<void> {
    try {
      // Initialize feature-specific defaults
      switch (feature) {
        case "advanced_analytics":
          await this.supabase.from("user_settings").insert({
            user_id: userId,
            key: "advanced_analytics_enabled",
            value: true,
          });
          break;

        case "custom_workflows":
          await this.supabase.from("user_settings").insert({
            user_id: userId,
            key: "custom_workflows_enabled",
            value: true,
          });
          break;
      }
    } catch (error) {
      console.error(`Failed to initialize feature ${feature}:`, error);
    }
  }

  private async maintainActiveSession(userId: string): Promise<void> {
    // Keep user session active during upgrade
    try {
      await this.supabase
        .from("user_sessions")
        .update({
          last_activity: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Extend by 24 hours
        })
        .eq("user_id", userId)
        .eq("is_active", true);
    } catch (error) {
      console.error("Failed to maintain active session:", error);
    }
  }

  private async preserveDashboardState(
    userId: string,
    dashboardLayout: any
  ): Promise<void> {
    if (!dashboardLayout) return;

    try {
      await this.supabase.from("user_preferences").upsert({
        user_id: userId,
        dashboard_layout: dashboardLayout,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to preserve dashboard state:", error);
    }
  }

  private async updateContextWithNewCapabilities(
    userId: string,
    tier: SubscriptionTier
  ): Promise<void> {
    try {
      // Update user profile with new tier capabilities
      await this.supabase
        .from("user_profiles")
        .update({
          tier_capabilities: this.getTierCapabilities(tier),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
    } catch (error) {
      console.error("Failed to update context with new capabilities:", error);
    }
  }

  private getTierCapabilities(tier: SubscriptionTier): Record<string, boolean> {
    const capabilities = {
      basic_analytics: true,
      advanced_analytics: false,
      custom_dashboards: false,
      api_access: false,
      sso: false,
      white_label: false,
      custom_ai: false,
      enterprise_support: false,
    };

    switch (tier) {
      case "ultimate":
        capabilities.custom_ai = true;
        capabilities.white_label = true;
      // fall through
      case "enterprise":
        capabilities.enterprise_support = true;
        capabilities.sso = true;
      // fall through
      case "professional":
        capabilities.advanced_analytics = true;
        capabilities.custom_dashboards = true;
        capabilities.api_access = true;
        break;
    }

    return capabilities;
  }

  private async preserveInteractionPatterns(
    userId: string,
    patterns: any[]
  ): Promise<void> {
    if (!patterns?.length) return;

    try {
      // Update patterns with preserved flag
      const preservedPatterns = patterns.map(pattern => ({
        ...pattern,
        preserved_during_upgrade: true,
        updated_at: new Date().toISOString(),
      }));

      await this.supabase.from("behavior_patterns").upsert(preservedPatterns);
    } catch (error) {
      console.error("Failed to preserve interaction patterns:", error);
    }
  }

  private async clearFeatureAccessCache(userId: string): Promise<void> {
    // Clear any cached feature access data
    try {
      await this.supabase
        .from("feature_access_cache")
        .delete()
        .eq("user_id", userId);
    } catch (error) {
      // Cache table might not exist, that's okay
    }
  }

  private getNewFeaturesForTier(
    fromTier: SubscriptionTier,
    toTier: SubscriptionTier
  ): string[] {
    const tierHierarchy = ["free", "professional", "enterprise", "ultimate"];
    const fromIndex = tierHierarchy.indexOf(fromTier);
    const toIndex = tierHierarchy.indexOf(toTier);

    if (toIndex <= fromIndex) return [];

    const newFeatures: string[] = [];

    if (toIndex >= 1 && fromIndex < 1) {
      // Professional features
      newFeatures.push("advanced_analytics", "custom_workflows", "api_access");
    }

    if (toIndex >= 2 && fromIndex < 2) {
      // Enterprise features
      newFeatures.push("sso", "advanced_security", "enterprise_support");
    }

    if (toIndex >= 3 && fromIndex < 3) {
      // Ultimate features
      newFeatures.push("white_label", "custom_ai", "dedicated_support");
    }

    return newFeatures;
  }

  private async enableFeatureForUser(
    userId: string,
    feature: string
  ): Promise<void> {
    try {
      await this.supabase.from("user_feature_access").upsert({
        user_id: userId,
        feature,
        enabled: true,
        enabled_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Failed to enable feature ${feature}:`, error);
    }
  }

  private async updateUsageQuotas(
    userId: string,
    tier: SubscriptionTier
  ): Promise<void> {
    const quotas = this.getTierQuotas(tier);

    try {
      for (const [quota, limit] of Object.entries(quotas)) {
        await this.supabase.from("user_quotas").upsert({
          user_id: userId,
          quota_type: quota,
          quota_limit: limit,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Failed to update usage quotas:", error);
    }
  }

  private getTierQuotas(tier: SubscriptionTier): Record<string, number> {
    switch (tier) {
      case "free":
        return {
          api_calls: 100,
          dashboard_widgets: 5,
          saved_reports: 3,
          data_retention_days: 30,
        };
      case "professional":
        return {
          api_calls: 10000,
          dashboard_widgets: 20,
          saved_reports: 50,
          data_retention_days: 365,
        };
      case "enterprise":
        return {
          api_calls: 100000,
          dashboard_widgets: 100,
          saved_reports: 500,
          data_retention_days: -1, // unlimited
        };
      case "ultimate":
        return {
          api_calls: -1, // unlimited
          dashboard_widgets: -1, // unlimited
          saved_reports: -1, // unlimited
          data_retention_days: -1, // unlimited
        };
      default:
        return {};
    }
  }

  private async validateContextPreservation(
    userId: string,
    snapshot: UserDataSnapshot
  ): Promise<boolean> {
    try {
      const currentContext = await this.getSessionMemories(userId);
      return (
        currentContext.length >= Math.min(snapshot.sessionMemories.length, 10)
      ); // At least 10 or all if less
    } catch {
      return false;
    }
  }

  private async validateFeatureAccess(
    userId: string,
    tier: SubscriptionTier
  ): Promise<boolean> {
    try {
      const { data } = await this.supabase
        .from("user_feature_access")
        .select("feature")
        .eq("user_id", userId)
        .eq("enabled", true);

      const enabledFeatures = data?.map(f => f.feature) || [];
      const expectedFeatures = this.getNewFeaturesForTier("free", tier);

      return expectedFeatures.every(feature =>
        enabledFeatures.includes(feature)
      );
    } catch {
      return false;
    }
  }

  private async getUpgradeSnapshot(
    upgradeId: string
  ): Promise<UserDataSnapshot | null> {
    try {
      const { data } = await this.supabase
        .from("upgrade_snapshots")
        .select("snapshot_data")
        .eq("upgrade_id", upgradeId)
        .single();

      return data?.snapshot_data || null;
    } catch {
      return null;
    }
  }

  private async restoreUserDataFromSnapshot(
    userId: string,
    snapshot: UserDataSnapshot
  ): Promise<void> {
    try {
      // Restore user preferences
      if (snapshot.userPreferences) {
        await this.supabase.from("user_preferences").upsert({
          ...snapshot.userPreferences,
          updated_at: new Date().toISOString(),
        });
      }

      // Restore other data as needed
      // This would be a comprehensive restoration process
    } catch (error) {
      console.error("Failed to restore user data from snapshot:", error);
      throw error;
    }
  }

  private async finalizeUpgrade(
    userId: string,
    upgradeId: string,
    snapshot: UserDataSnapshot
  ): Promise<void> {
    try {
      // Store upgrade history
      await this.storeUpgradeHistory(userId, upgradeId, snapshot);

      // Send completion notification
      await this.notifyUpgradeCompletion(userId, snapshot.targetTier);

      // Clean up temporary data
      await this.cleanupUpgradeData(upgradeId);
    } catch (error) {
      console.error("Failed to finalize upgrade:", error);
    }
  }

  private async storeUpgradeHistory(
    userId: string,
    upgradeId: string,
    snapshot: UserDataSnapshot
  ): Promise<void> {
    try {
      await this.supabase.from("upgrade_history").insert({
        upgrade_id: upgradeId,
        user_id: userId,
        from_tier: snapshot.originalTier,
        to_tier: snapshot.targetTier,
        snapshot_data: snapshot,
        completed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to store upgrade history:", error);
    }
  }

  private async notifyUpgradeCompletion(
    userId: string,
    newTier: SubscriptionTier
  ): Promise<void> {
    try {
      // Send notification about successful upgrade
      await this.supabase.from("notifications").insert({
        user_id: userId,
        type: "upgrade_completed",
        title: "Upgrade Completed Successfully",
        message: `Your account has been upgraded to ${newTier}. All your data and settings have been preserved.`,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to send upgrade completion notification:", error);
    }
  }

  private async cleanupUpgradeData(upgradeId: string): Promise<void> {
    // Clean up temporary upgrade data after some time
    setTimeout(
      async () => {
        try {
          await this.supabase
            .from("upgrade_snapshots")
            .delete()
            .eq("upgrade_id", upgradeId);
        } catch (error) {
          console.error("Failed to cleanup upgrade data:", error);
        }
      },
      24 * 60 * 60 * 1000
    ); // 24 hours
  }
}

// Export singleton instance
export const seamlessUpgradeService = SeamlessUpgradeService.getInstance();
