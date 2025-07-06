export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      business_kpi_daily: {
        Row: {
          id: string;
          date: string;
          metric_name: string;
          metric_value: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          metric_name: string;
          metric_value: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          metric_name?: string;
          metric_value?: number;
          created_at?: string;
        };
      };
      content_posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          content_type:
            | "post"
            | "story"
            | "video"
            | "carousel"
            | "reel"
            | "email"
            | "ad"
            | "article"
            | "blog"
            | "newsletter";
          status:
            | "draft"
            | "scheduled"
            | "publishing"
            | "published"
            | "failed"
            | "archived"
            | "review_pending"
            | "approved"
            | "rejected";
          excerpt?: string;
          featured_image_url?: string;
          media_urls: Json;
          hashtags: Json;
          mentions: Json;
          scheduled_date?: string;
          scheduled_time?: string;
          published_at?: string;
          target_platforms: Json;
          platform_specific_content: Json;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          status: string;
          created_at?: string;
          published_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          status?: string;
          created_at?: string;
          published_at?: string;
        };
      };
      kajabi_sales: {
        Row: {
          id: string;
          sale_date: string;
          product_name: string;
          amount: number;
          customer_email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          sale_date: string;
          product_name: string;
          amount: number;
          customer_email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          sale_date?: string;
          product_name?: string;
          amount?: number;
          customer_email?: string;
          created_at?: string;
        };
      };
      shopify_sales: {
        Row: {
          id: string;
          order_date: string;
          product_name: string;
          total_amount: number;
          customer_email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_date: string;
          product_name: string;
          total_amount: number;
          customer_email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_date?: string;
          product_name?: string;
          total_amount?: number;
          customer_email?: string;
          created_at?: string;
        };
      };
      google_ads_performance: {
        Row: {
          id: string;
          campaign_name: string;
          impressions: number;
          clicks: number;
          cost: number;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_name: string;
          impressions: number;
          clicks: number;
          cost: number;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_name?: string;
          impressions?: number;
          clicks?: number;
          cost?: number;
          date?: string;
          created_at?: string;
        };
      };
      meta_ads_performance: {
        Row: {
          id: string;
          campaign_name: string;
          impressions: number;
          clicks: number;
          spend: number;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_name: string;
          impressions: number;
          clicks: number;
          spend: number;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_name?: string;
          impressions?: number;
          clicks?: number;
          spend?: number;
          date?: string;
          created_at?: string;
        };
      };
      ai_business_insights: {
        Row: {
          id: string;
          insight_type: string;
          insight_text: string;
          confidence_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          insight_type: string;
          insight_text: string;
          confidence_score: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          insight_type?: string;
          insight_text?: string;
          confidence_score?: number;
          created_at?: string;
        };
      };
      unified_customers: {
        Row: {
          id: string;
          email: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
          date_of_birth?: string;
          gender?: string;
          location_country?: string;
          location_state?: string;
          location_city?: string;
          acquisition_source: string;
          acquisition_date: string;
          total_lifetime_value: number;
          total_orders: number;
          average_order_value: number;
          last_purchase_date?: string;
          churn_risk_score?: number;
          customer_status: string;
          tags?: string[];
          notes?: string;
          shopify_customer_id?: string;
          kajabi_customer_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
          date_of_birth?: string;
          gender?: string;
          location_country?: string;
          location_state?: string;
          location_city?: string;
          acquisition_source: string;
          acquisition_date: string;
          total_lifetime_value?: number;
          total_orders?: number;
          average_order_value?: number;
          last_purchase_date?: string;
          churn_risk_score?: number;
          customer_status?: string;
          tags?: string[];
          notes?: string;
          shopify_customer_id?: string;
          kajabi_customer_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
          date_of_birth?: string;
          gender?: string;
          location_country?: string;
          location_state?: string;
          location_city?: string;
          acquisition_source?: string;
          acquisition_date?: string;
          total_lifetime_value?: number;
          total_orders?: number;
          average_order_value?: number;
          last_purchase_date?: string;
          churn_risk_score?: number;
          customer_status?: string;
          tags?: string[];
          notes?: string;
          shopify_customer_id?: string;
          kajabi_customer_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      customer_touchpoints: {
        Row: {
          id: string;
          customer_id: string;
          touchpoint_type: string;
          touchpoint_source: string;
          touchpoint_data: Json;
          value?: number;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          touchpoint_type: string;
          touchpoint_source: string;
          touchpoint_data?: Json;
          value?: number;
          timestamp: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          touchpoint_type?: string;
          touchpoint_source?: string;
          touchpoint_data?: Json;
          value?: number;
          timestamp?: string;
          created_at?: string;
        };
      };
      customer_segments: {
        Row: {
          id: string;
          customer_id: string;
          segment_name: string;
          segment_type: string;
          segment_criteria: Json;
          assigned_date: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          segment_name: string;
          segment_type: string;
          segment_criteria?: Json;
          assigned_date: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          segment_name?: string;
          segment_type?: string;
          segment_criteria?: Json;
          assigned_date?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      customer_social_profiles: {
        Row: {
          id: string;
          customer_id: string;
          platform: string;
          platform_user_id?: string;
          username?: string;
          follower_count?: number;
          engagement_rate?: number;
          last_interaction_date?: string;
          profile_data: Json;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          platform: string;
          platform_user_id?: string;
          username?: string;
          follower_count?: number;
          engagement_rate?: number;
          last_interaction_date?: string;
          profile_data?: Json;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          platform?: string;
          platform_user_id?: string;
          username?: string;
          follower_count?: number;
          engagement_rate?: number;
          last_interaction_date?: string;
          profile_data?: Json;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      customer_events: {
        Row: {
          id: string;
          customer_id: string;
          event_type: string;
          event_source: string;
          event_data: Json;
          event_value?: number;
          event_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          event_type: string;
          event_source: string;
          event_data?: Json;
          event_value?: number;
          event_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          event_type?: string;
          event_source?: string;
          event_data?: Json;
          event_value?: number;
          event_date?: string;
          created_at?: string;
        };
      };
      oauth_tokens: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          access_token: string;
          refresh_token?: string;
          token_type: string;
          expires_at?: string;
          scope?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: string;
          access_token: string;
          refresh_token?: string;
          token_type?: string;
          expires_at?: string;
          scope?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: string;
          access_token?: string;
          refresh_token?: string;
          token_type?: string;
          expires_at?: string;
          scope?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      oauth_states: {
        Row: {
          id: string;
          state_value: string;
          provider: string;
          user_id: string;
          redirect_uri?: string;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          state_value: string;
          provider: string;
          user_id: string;
          redirect_uri?: string;
          created_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          state_value?: string;
          provider?: string;
          user_id?: string;
          redirect_uri?: string;
          created_at?: string;
          expires_at?: string;
        };
      };
      system_health_metrics: {
        Row: {
          id: string;
          service_name: string;
          metric_type: string;
          metric_value: number;
          unit: string;
          status: string;
          threshold_min?: number;
          threshold_max?: number;
          metadata: Json;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          service_name: string;
          metric_type: string;
          metric_value: number;
          unit: string;
          status?: string;
          threshold_min?: number;
          threshold_max?: number;
          metadata?: Json;
          timestamp?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          service_name?: string;
          metric_type?: string;
          metric_value?: number;
          unit?: string;
          status?: string;
          threshold_min?: number;
          threshold_max?: number;
          metadata?: Json;
          timestamp?: string;
          created_at?: string;
        };
      };
      data_quality_indicators: {
        Row: {
          id: string;
          data_source: string;
          table_name: string;
          quality_metric: string;
          score: number;
          total_records: number;
          valid_records: number;
          invalid_records: number;
          last_sync?: string;
          issues: Json;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          data_source: string;
          table_name: string;
          quality_metric: string;
          score: number;
          total_records?: number;
          valid_records?: number;
          invalid_records?: number;
          last_sync?: string;
          issues?: Json;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          data_source?: string;
          table_name?: string;
          quality_metric?: string;
          score?: number;
          total_records?: number;
          valid_records?: number;
          invalid_records?: number;
          last_sync?: string;
          issues?: Json;
          status?: string;
          created_at?: string;
        };
      };
      system_alerts: {
        Row: {
          id: string;
          alert_type: string;
          severity: string;
          title: string;
          description?: string;
          source_service?: string;
          source_metric_id?: string;
          trigger_condition?: Json;
          alert_data: Json;
          status: string;
          acknowledged_by?: string;
          acknowledged_at?: string;
          resolved_by?: string;
          resolved_at?: string;
          auto_resolve: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          alert_type: string;
          severity: string;
          title: string;
          description?: string;
          source_service?: string;
          source_metric_id?: string;
          trigger_condition?: Json;
          alert_data?: Json;
          status?: string;
          acknowledged_by?: string;
          acknowledged_at?: string;
          resolved_by?: string;
          resolved_at?: string;
          auto_resolve?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          alert_type?: string;
          severity?: string;
          title?: string;
          description?: string;
          source_service?: string;
          source_metric_id?: string;
          trigger_condition?: Json;
          alert_data?: Json;
          status?: string;
          acknowledged_by?: string;
          acknowledged_at?: string;
          resolved_by?: string;
          resolved_at?: string;
          auto_resolve?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      monitoring_dashboard_config: {
        Row: {
          id: string;
          dashboard_name: string;
          config_type: string;
          configuration: Json;
          is_active: boolean;
          created_by?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dashboard_name: string;
          config_type: string;
          configuration: Json;
          is_active?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          dashboard_name?: string;
          config_type?: string;
          configuration?: Json;
          is_active?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      system_performance_logs: {
        Row: {
          id: string;
          service_name: string;
          operation: string;
          duration_ms: number;
          memory_usage_mb?: number;
          cpu_usage_percent?: number;
          status: string;
          error_message?: string;
          request_details: Json;
          user_id?: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          service_name: string;
          operation: string;
          duration_ms: number;
          memory_usage_mb?: number;
          cpu_usage_percent?: number;
          status: string;
          error_message?: string;
          request_details?: Json;
          user_id?: string;
          timestamp?: string;
        };
        Update: {
          id?: string;
          service_name?: string;
          operation?: string;
          duration_ms?: number;
          memory_usage_mb?: number;
          cpu_usage_percent?: number;
          status?: string;
          error_message?: string;
          request_details?: Json;
          user_id?: string;
          timestamp?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Type helpers for customer data
export type UnifiedCustomer =
  Database["public"]["Tables"]["unified_customers"]["Row"];
export type CustomerTouchpoint =
  Database["public"]["Tables"]["customer_touchpoints"]["Row"];
export type CustomerSegment =
  Database["public"]["Tables"]["customer_segments"]["Row"];
export type CustomerSocialProfile =
  Database["public"]["Tables"]["customer_social_profiles"]["Row"];
export type CustomerEvent =
  Database["public"]["Tables"]["customer_events"]["Row"];

export type InsertUnifiedCustomer =
  Database["public"]["Tables"]["unified_customers"]["Insert"];
export type UpdateUnifiedCustomer =
  Database["public"]["Tables"]["unified_customers"]["Update"];

// Customer status enums
export type CustomerStatus = "active" | "inactive" | "churned" | "prospect";
export type AcquisitionSource = "shopify" | "kajabi" | "social" | "direct";
export type TouchpointType =
  | "email_open"
  | "website_visit"
  | "purchase"
  | "support_ticket"
  | "social_interaction";
export type SegmentType =
  | "behavioral"
  | "demographic"
  | "value_based"
  | "lifecycle";
export type SocialPlatform =
  | "facebook"
  | "instagram"
  | "twitter"
  | "linkedin"
  | "youtube";

// OAuth types
export type OAuthToken = Database["public"]["Tables"]["oauth_tokens"]["Row"];
export type OAuthState = Database["public"]["Tables"]["oauth_states"]["Row"];
export type InsertOAuthToken =
  Database["public"]["Tables"]["oauth_tokens"]["Insert"];
export type UpdateOAuthToken =
  Database["public"]["Tables"]["oauth_tokens"]["Update"];
export type InsertOAuthState =
  Database["public"]["Tables"]["oauth_states"]["Insert"];
export type UpdateOAuthState =
  Database["public"]["Tables"]["oauth_states"]["Update"];

export type OAuthProvider = "google_ads" | "meta_ads";
export type TokenType = "Bearer" | "access_token";

// Monitoring and System Health Types
export type SystemHealthMetric =
  Database["public"]["Tables"]["system_health_metrics"]["Row"];
export type DataQualityIndicator =
  Database["public"]["Tables"]["data_quality_indicators"]["Row"];
export type SystemAlert = Database["public"]["Tables"]["system_alerts"]["Row"];
export type MonitoringDashboardConfig =
  Database["public"]["Tables"]["monitoring_dashboard_config"]["Row"];
export type SystemPerformanceLog =
  Database["public"]["Tables"]["system_performance_logs"]["Row"];

export type InsertSystemHealthMetric =
  Database["public"]["Tables"]["system_health_metrics"]["Insert"];
export type InsertDataQualityIndicator =
  Database["public"]["Tables"]["data_quality_indicators"]["Insert"];
export type InsertSystemAlert =
  Database["public"]["Tables"]["system_alerts"]["Insert"];
export type InsertMonitoringDashboardConfig =
  Database["public"]["Tables"]["monitoring_dashboard_config"]["Insert"];
export type InsertSystemPerformanceLog =
  Database["public"]["Tables"]["system_performance_logs"]["Insert"];

export type UpdateSystemHealthMetric =
  Database["public"]["Tables"]["system_health_metrics"]["Update"];
export type UpdateDataQualityIndicator =
  Database["public"]["Tables"]["data_quality_indicators"]["Update"];
export type UpdateSystemAlert =
  Database["public"]["Tables"]["system_alerts"]["Update"];
export type UpdateMonitoringDashboardConfig =
  Database["public"]["Tables"]["monitoring_dashboard_config"]["Update"];
export type UpdateSystemPerformanceLog =
  Database["public"]["Tables"]["system_performance_logs"]["Update"];

// Monitoring Enums
export type HealthStatus = "healthy" | "warning" | "critical";
export type QualityStatus = "good" | "warning" | "poor";
export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type AlertStatus = "active" | "acknowledged" | "resolved" | "dismissed";
export type AlertType =
  | "performance"
  | "data_quality"
  | "system_error"
  | "security";
export type MetricType =
  | "cpu_usage"
  | "memory_usage"
  | "response_time"
  | "uptime"
  | "error_rate"
  | "connection_count";
export type QualityMetricType =
  | "completeness"
  | "accuracy"
  | "freshness"
  | "consistency";
export type PerformanceStatus = "success" | "error" | "timeout";
