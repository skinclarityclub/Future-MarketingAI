/**
 * Customer Intelligence Types
 * Shared type definitions for customer intelligence features
 */

export interface UnifiedCustomer {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  total_lifetime_value: number;
  total_orders: number;
  average_order_value: number;
  last_purchase_date?: string;
  acquisition_date: string;
  acquisition_source?: string;
  customer_status: "active" | "inactive" | "churned" | "at_risk";
  churn_risk_score?: number;
  churn_risk_level?: "low" | "medium" | "high" | "critical";
  location_country?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerTouchpoint {
  id: string;
  customer_id: string;
  touchpoint_type:
    | "email"
    | "website"
    | "social"
    | "support"
    | "purchase"
    | "marketing";
  channel: string;
  description?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface CustomerEvent {
  id: string;
  customer_id: string;
  event_type:
    | "purchase"
    | "login"
    | "email_open"
    | "page_view"
    | "support_ticket"
    | "social_interaction";
  event_data: Record<string, unknown>;
  timestamp: string;
  source: "shopify" | "kajabi" | "website" | "social" | "support";
}

export interface SegmentType {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  customer_count?: number;
  created_at: string;
  updated_at: string;
}

export interface SegmentCriteria {
  rules: SegmentRule[];
  operator: "AND" | "OR";
}

export interface SegmentRule {
  field: string;
  operator:
    | "equals"
    | "not_equals"
    | "greater_than"
    | "less_than"
    | "contains"
    | "in"
    | "between";
  value: unknown;
  type: "string" | "number" | "date" | "boolean" | "array";
}

export interface CustomerSegmentMembership {
  customer_id: string;
  segment_id: string;
  joined_at: string;
}

export interface ShopifyCustomerData {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  total_spent: string;
  orders_count: number;
  tags: string;
  created_at: string;
  updated_at: string;
  currency: string;
}

export interface KajabiCustomerData {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  currency: string;
  total_spent: string;
  orders_count: number;
  purchases_count: number;
}

export interface CustomerChurnData {
  customer_id: string;
  churn_risk_score: number;
  churn_risk_level: "low" | "medium" | "high" | "critical";
  predicted_churn_date?: string;
  last_prediction_date: string;
  model_version: string;
  confidence_score: number;
}

export interface CustomerBehavioralMetrics {
  seasonality: number;
  channelDiversity: number;
  averageTimeBetweenOrders: number;
  orderValueTrend: number;
  productDiversity: number;
  supportTickets: number;
  satisfactionScore?: number;
  complaintCount: number;
}
