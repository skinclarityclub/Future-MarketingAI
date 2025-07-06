/**
 * Customer Segmentation Service
 * Automatically segments customers based on behavior, demographics, value, and lifecycle
 */

import { createClient } from "@/lib/supabase/server";
import { UnifiedCustomer, SegmentType } from "@/lib/supabase/types";

// Segment definitions
interface SegmentDefinition {
  name: string;
  type: SegmentType;
  criteria: {
    conditions: Array<{
      field: string;
      operator:
        | "gt"
        | "lt"
        | "eq"
        | "gte"
        | "lte"
        | "in"
        | "not_in"
        | "contains"
        | "between";
      value: any;
    }>;
    logic: "AND" | "OR";
  };
  description: string;
}

// Pre-defined segments
const PREDEFINED_SEGMENTS: SegmentDefinition[] = [
  // Value-based segments
  {
    name: "High Value Customers",
    type: "value_based",
    criteria: {
      conditions: [
        { field: "total_lifetime_value", operator: "gte", value: 1000 },
      ],
      logic: "AND",
    },
    description: "Customers with lifetime value >= $1000",
  },
  {
    name: "Medium Value Customers",
    type: "value_based",
    criteria: {
      conditions: [
        {
          field: "total_lifetime_value",
          operator: "between",
          value: [250, 999],
        },
      ],
      logic: "AND",
    },
    description: "Customers with lifetime value between $250-$999",
  },
  {
    name: "Low Value Customers",
    type: "value_based",
    criteria: {
      conditions: [
        { field: "total_lifetime_value", operator: "lt", value: 250 },
      ],
      logic: "AND",
    },
    description: "Customers with lifetime value < $250",
  },

  // Behavioral segments
  {
    name: "Frequent Buyers",
    type: "behavioral",
    criteria: {
      conditions: [
        { field: "total_orders", operator: "gte", value: 10 },
        { field: "customer_status", operator: "eq", value: "active" },
      ],
      logic: "AND",
    },
    description: "Active customers with 10+ orders",
  },
  {
    name: "One-Time Buyers",
    type: "behavioral",
    criteria: {
      conditions: [{ field: "total_orders", operator: "eq", value: 1 }],
      logic: "AND",
    },
    description: "Customers who made exactly one purchase",
  },
  {
    name: "Big Spenders",
    type: "behavioral",
    criteria: {
      conditions: [
        { field: "average_order_value", operator: "gte", value: 200 },
      ],
      logic: "AND",
    },
    description: "Customers with average order value >= $200",
  },

  // Lifecycle segments
  {
    name: "New Customers",
    type: "lifecycle",
    criteria: {
      conditions: [
        { field: "acquisition_date", operator: "gte", value: "30_days_ago" },
        { field: "total_orders", operator: "lte", value: 2 },
      ],
      logic: "AND",
    },
    description: "Customers acquired in the last 30 days with ≤2 orders",
  },
  {
    name: "At Risk",
    type: "lifecycle",
    criteria: {
      conditions: [
        { field: "churn_risk_score", operator: "gte", value: 0.7 },
        { field: "customer_status", operator: "eq", value: "active" },
      ],
      logic: "AND",
    },
    description: "Active customers with high churn risk (≥70%)",
  },
  {
    name: "Loyal Customers",
    type: "lifecycle",
    criteria: {
      conditions: [
        { field: "total_orders", operator: "gte", value: 5 },
        { field: "customer_status", operator: "eq", value: "active" },
        { field: "churn_risk_score", operator: "lt", value: 0.3 },
      ],
      logic: "AND",
    },
    description: "Active customers with 5+ orders and low churn risk",
  },

  // Demographic segments (require location data)
  {
    name: "International Customers",
    type: "demographic",
    criteria: {
      conditions: [
        {
          field: "location_country",
          operator: "not_in",
          value: ["United States", "USA", "US"],
        },
      ],
      logic: "AND",
    },
    description: "Customers located outside the United States",
  },
];

export class CustomerSegmentation {
  private supabase: any;

  constructor() {
    // Initialize with empty client, will be set when methods are called
    this.supabase = null;
  }

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createClient();
    }
    return this.supabase;
  }

  /**
   * Apply all predefined segments to all customers
   */
  async applyAllSegments(): Promise<{
    segmentsApplied: number;
    customersSegmented: number;
    errors: string[];
  }> {
    const results: {
      segmentsApplied: number;
      customersSegmented: number;
      errors: string[];
    } = {
      segmentsApplied: 0,
      customersSegmented: 0,
      errors: [],
    };

    try {
      // Get all customers
      const { data: customers, error: customersError } = await this.supabase
        .from("unified_customers")
        .select("*");

      if (customersError) {
        results.errors.push(
          `Error fetching customers: ${customersError.message}`
        );
        return results;
      }

      if (!customers) {
        results.errors.push("No customers found");
        return results;
      }

      // Apply each segment
      for (const segmentDef of PREDEFINED_SEGMENTS) {
        try {
          const matchingCustomers = this.evaluateSegment(customers, segmentDef);

          if (matchingCustomers.length > 0) {
            await this.assignCustomersToSegment(matchingCustomers, segmentDef);
            results.segmentsApplied++;
            results.customersSegmented += matchingCustomers.length;
          }
        } catch (error) {
          results.errors.push(
            `Error applying segment ${segmentDef.name}: ${error}`
          );
        }
      }

      return results;
    } catch (error) {
      results.errors.push(`General error in segment application: ${error}`);
      return results;
    }
  }

  /**
   * Apply specific segment to all customers
   */
  async applySegment(segmentDef: SegmentDefinition): Promise<string[]> {
    try {
      // Get all customers
      const supabase = await this.getSupabase();
      const { data: customers, error } = await supabase
        .from("unified_customers")
        .select("*");

      if (error || !customers) {
        throw new Error(`Error fetching customers: ${error?.message}`);
      }

      // Evaluate which customers match the segment
      const matchingCustomers = this.evaluateSegment(customers, segmentDef);

      // Assign customers to segment
      if (matchingCustomers.length > 0) {
        await this.assignCustomersToSegment(matchingCustomers, segmentDef);
      }

      return matchingCustomers.map(c => c.id);
    } catch (error) {
      console.error("Error applying segment:", error);
      throw error;
    }
  }

  /**
   * Evaluate which customers match a segment definition
   */
  private evaluateSegment(
    customers: UnifiedCustomer[],
    segmentDef: SegmentDefinition
  ): UnifiedCustomer[] {
    return customers.filter(customer => {
      const conditionResults = segmentDef.criteria.conditions.map(condition =>
        this.evaluateCondition(customer, condition)
      );

      // Apply logic (AND/OR)
      if (segmentDef.criteria.logic === "AND") {
        return conditionResults.every(result => result);
      } else {
        return conditionResults.some(result => result);
      }
    });
  }

  /**
   * Evaluate a single condition against a customer
   */
  private evaluateCondition(
    customer: UnifiedCustomer,
    condition: any
  ): boolean {
    const fieldValue = this.getFieldValue(customer, condition.field);

    switch (condition.operator) {
      case "gt":
        return fieldValue > condition.value;
      case "gte":
        return fieldValue >= condition.value;
      case "lt":
        return fieldValue < condition.value;
      case "lte":
        return fieldValue <= condition.value;
      case "eq":
        return fieldValue === condition.value;
      case "in":
        return (
          Array.isArray(condition.value) && condition.value.includes(fieldValue)
        );
      case "not_in":
        return (
          Array.isArray(condition.value) &&
          !condition.value.includes(fieldValue)
        );
      case "contains":
        return (
          typeof fieldValue === "string" && fieldValue.includes(condition.value)
        );
      case "between":
        return (
          Array.isArray(condition.value) &&
          fieldValue >= condition.value[0] &&
          fieldValue <= condition.value[1]
        );
      default:
        return false;
    }
  }

  /**
   * Get field value from customer, handling special cases
   */
  private getFieldValue(customer: UnifiedCustomer, fieldName: string): any {
    switch (fieldName) {
      case "30_days_ago":
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(customer.acquisition_date) >= thirtyDaysAgo;
      default:
        return (customer as any)[fieldName];
    }
  }

  /**
   * Assign customers to a segment
   */
  private async assignCustomersToSegment(
    customers: UnifiedCustomer[],
    segmentDef: SegmentDefinition
  ): Promise<void> {
    const now = new Date().toISOString();

    // Prepare segment assignments
    const segmentAssignments = customers.map(customer => ({
      customer_id: customer.id,
      segment_name: segmentDef.name,
      segment_type: segmentDef.type,
      segment_criteria: segmentDef.criteria,
      assigned_date: now,
      is_active: true,
    }));

    // Deactivate existing assignments for this segment
    await this.supabase
      .from("customer_segments")
      .update({ is_active: false })
      .eq("segment_name", segmentDef.name);

    // Insert new assignments
    const { error } = await this.supabase
      .from("customer_segments")
      .insert(segmentAssignments);

    if (error) {
      throw new Error(`Error assigning customers to segment: ${error.message}`);
    }
  }

  /**
   * Get customers in a specific segment
   */
  async getCustomersInSegment(segmentName: string): Promise<UnifiedCustomer[]> {
    try {
      const { data, error } = await this.supabase
        .from("customer_segments")
        .select(
          `
          customer_id,
          unified_customers (*)
        `
        )
        .eq("segment_name", segmentName)
        .eq("is_active", true);

      if (error) throw error;

      return (data ?? [])
        .map(
          (item: any) => item.unified_customers as unknown as UnifiedCustomer
        )
        .filter(Boolean) as UnifiedCustomer[];
    } catch (error) {
      console.error("Error getting customers in segment:", error);
      return [];
    }
  }

  /**
   * Get all active segments with customer counts
   */
  async getSegmentSummary(): Promise<
    Array<{
      segment_name: string;
      segment_type: SegmentType;
      customer_count: number;
      description?: string;
    }>
  > {
    try {
      const { data, error } = await this.supabase
        .from("customer_segments")
        .select("segment_name, segment_type, customer_id")
        .eq("is_active", true);

      if (error) throw error;

      // Group by segment and count customers
      const segmentCounts = (data || []).reduce(
        (acc: Record<string, any>, item: any) => {
          const key = `${item.segment_name}|${item.segment_type}`;
          if (!acc[key]) {
            acc[key] = {
              segment_name: item.segment_name,
              segment_type: item.segment_type,
              customer_count: 0,
            };
          }
          acc[key].customer_count++;
          return acc;
        },
        {} as Record<string, any>
      );

      // Add descriptions from predefined segments
      const result = Object.values(segmentCounts).map((segment: any) => {
        const predefinedSegment = PREDEFINED_SEGMENTS.find(
          s => s.name === segment.segment_name
        );
        return {
          ...segment,
          description: predefinedSegment?.description,
        };
      });

      return result;
    } catch (error) {
      console.error("Error getting segment summary:", error);
      return [];
    }
  }

  /**
   * Create custom segment
   */
  async createCustomSegment(segmentDef: SegmentDefinition): Promise<string[]> {
    try {
      // Validate segment definition
      if (!segmentDef.name || !segmentDef.type || !segmentDef.criteria) {
        throw new Error("Invalid segment definition");
      }

      // Apply the custom segment
      return await this.applySegment(segmentDef);
    } catch (error) {
      console.error("Error creating custom segment:", error);
      throw error;
    }
  }

  /**
   * Remove customers from a segment
   */
  async removeSegment(segmentName: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("customer_segments")
        .update({ is_active: false })
        .eq("segment_name", segmentName);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error removing segment:", error);
      return false;
    }
  }

  /**
   * Get segment performance metrics
   */
  async getSegmentMetrics(segmentName: string): Promise<{
    totalCustomers: number;
    averageLifetimeValue: number;
    averageOrderValue: number;
    totalOrders: number;
    churnRisk: number;
  }> {
    try {
      const customers = await this.getCustomersInSegment(segmentName);

      if (customers.length === 0) {
        return {
          totalCustomers: 0,
          averageLifetimeValue: 0,
          averageOrderValue: 0,
          totalOrders: 0,
          churnRisk: 0,
        };
      }

      const totalLifetimeValue = customers.reduce(
        (sum, c) => sum + (c.total_lifetime_value || 0),
        0
      );
      const totalOrders = customers.reduce(
        (sum, c) => sum + (c.total_orders || 0),
        0
      );
      const totalChurnRisk = customers.reduce(
        (sum, c) => sum + (c.churn_risk_score || 0),
        0
      );

      return {
        totalCustomers: customers.length,
        averageLifetimeValue: totalLifetimeValue / customers.length,
        averageOrderValue:
          totalOrders > 0 ? totalLifetimeValue / totalOrders : 0,
        totalOrders,
        churnRisk: totalChurnRisk / customers.length,
      };
    } catch (error) {
      console.error("Error getting segment metrics:", error);
      return {
        totalCustomers: 0,
        averageLifetimeValue: 0,
        averageOrderValue: 0,
        totalOrders: 0,
        churnRisk: 0,
      };
    }
  }

  /**
   * Compatibility helper used by other modules to trigger a full re-segmentation.
   */
  async segmentAllCustomers() {
    return this.applyAllSegments();
  }
}

// Export singleton instance
export const customerSegmentation = new CustomerSegmentation();

// Export predefined segments for reference
export { PREDEFINED_SEGMENTS };
