import { TelegramUserProfile } from "./auth-service";
import { createClient } from "@supabase/supabase-js";

export interface DataAccessRule {
  id: string;
  resource: string;
  action: string;
  conditions?: DataAccessCondition[];
  timeRestrictions?: TimeRestriction[];
  dataFilters?: DataFilter[];
}

export interface DataAccessCondition {
  field: string;
  operator:
    | "equals"
    | "not_equals"
    | "in"
    | "not_in"
    | "contains"
    | "greater_than"
    | "less_than";
  value: any;
}

export interface TimeRestriction {
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  timezone: string;
  days: number[]; // 0-6, Sunday = 0
}

export interface DataFilter {
  table: string;
  column: string;
  condition: string;
  value: any;
}

export interface AccessValidationResult {
  allowed: boolean;
  reason?: string;
  filteredData?: any;
  restrictions?: string[];
}

export interface DataAccessContext {
  user: TelegramUserProfile;
  resource: string;
  action: string;
  requestData?: any;
  timestamp: Date;
  clientInfo?: {
    chatId: number;
    messageId?: number;
    ip?: string;
  };
}

export class TelegramDataAccessController {
  private supabase: any;
  private readonly ROLE_BASED_RULES: { [role: string]: DataAccessRule[] } = {
    admin: [
      {
        id: "admin_full_access",
        resource: "*",
        action: "*",
      },
    ],
    analyst: [
      {
        id: "analyst_financial_read",
        resource: "financial_data",
        action: "read",
        timeRestrictions: [
          {
            startTime: "06:00",
            endTime: "22:00",
            timezone: "UTC",
            days: [1, 2, 3, 4, 5], // Monday to Friday
          },
        ],
      },
      {
        id: "analyst_marketing_read",
        resource: "marketing_data",
        action: "read",
      },
      {
        id: "analyst_reports_create",
        resource: "reports",
        action: "create",
        conditions: [
          {
            field: "report_type",
            operator: "in",
            value: ["summary", "trend", "comparison"],
          },
        ],
      },
      {
        id: "analyst_export_limited",
        resource: "exports",
        action: "create",
        conditions: [
          {
            field: "format",
            operator: "in",
            value: ["csv", "pdf"],
          },
        ],
        dataFilters: [
          {
            table: "financial_data",
            column: "created_at",
            condition: ">= NOW() - INTERVAL '90 days'",
            value: null,
          },
        ],
      },
    ],
    user: [
      {
        id: "user_dashboard_read",
        resource: "dashboard",
        action: "read",
      },
      {
        id: "user_reports_read",
        resource: "reports",
        action: "read",
        conditions: [
          {
            field: "is_public",
            operator: "equals",
            value: true,
          },
        ],
      },
      {
        id: "user_basic_export",
        resource: "exports",
        action: "create",
        conditions: [
          {
            field: "format",
            operator: "equals",
            value: "pdf",
          },
        ],
        dataFilters: [
          {
            table: "reports",
            column: "is_public",
            condition: "= true",
            value: null,
          },
        ],
      },
    ],
    viewer: [
      {
        id: "viewer_public_read",
        resource: "public_reports",
        action: "read",
      },
      {
        id: "viewer_dashboard_basic",
        resource: "dashboard",
        action: "read",
        conditions: [
          {
            field: "visibility",
            operator: "equals",
            value: "public",
          },
        ],
      },
    ],
  };

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Validate data access request
   */
  async validateAccess(
    context: DataAccessContext
  ): Promise<AccessValidationResult> {
    try {
      // Get applicable rules for user role
      const rules = this.getApplicableRules(
        context.user.role,
        context.resource,
        context.action
      );

      if (rules.length === 0) {
        await this.logAccessAttempt(context, false, "no_matching_rules");
        return {
          allowed: false,
          reason: "No permissions found for this action",
        };
      }

      // Check each rule
      for (const rule of rules) {
        const ruleResult = await this.evaluateRule(rule, context);

        if (ruleResult.allowed) {
          await this.logAccessAttempt(context, true, "rule_matched", rule.id);
          return ruleResult;
        }
      }

      await this.logAccessAttempt(context, false, "all_rules_failed");
      return {
        allowed: false,
        reason: "Access denied by security policies",
      };
    } catch (error) {
      console.error("Data access validation error:", error);
      await this.logAccessAttempt(context, false, "validation_error");
      return {
        allowed: false,
        reason: "Internal security validation error",
      };
    }
  }

  /**
   * Apply data filters for authorized access
   */
  async applyDataFilters(
    query: any,
    user: TelegramUserProfile,
    resource: string,
    action: string
  ): Promise<any> {
    const rules = this.getApplicableRules(user.role, resource, action);
    let filteredQuery = { ...query };

    for (const rule of rules) {
      if (rule.dataFilters) {
        for (const filter of rule.dataFilters) {
          filteredQuery = this.addQueryFilter(filteredQuery, filter);
        }
      }
    }

    return filteredQuery;
  }

  /**
   * Get user's accessible resources
   */
  getAccessibleResources(user: TelegramUserProfile): string[] {
    const rules = this.ROLE_BASED_RULES[user.role] || [];
    const resources = new Set<string>();

    rules.forEach(rule => {
      if (rule.resource === "*") {
        // Admin access - return all resources
        return [
          "financial_data",
          "marketing_data",
          "reports",
          "dashboard",
          "exports",
          "users",
          "audit",
        ];
      }
      resources.add(rule.resource);
    });

    return Array.from(resources);
  }

  /**
   * Get user's permissions for a resource
   */
  getResourcePermissions(
    user: TelegramUserProfile,
    resource: string
  ): string[] {
    const rules = this.getApplicableRules(user.role, resource, "*");
    const actions = new Set<string>();

    rules.forEach(rule => {
      if (rule.action === "*") {
        actions.add("create");
        actions.add("read");
        actions.add("update");
        actions.add("delete");
      } else {
        actions.add(rule.action);
      }
    });

    return Array.from(actions);
  }

  /**
   * Create context-aware error message
   */
  createAccessDeniedMessage(
    context: DataAccessContext,
    result: AccessValidationResult
  ): string {
    const { user, resource, action } = context;

    let message = `🚫 **Access Denied**\n\n`;
    message += `**Requested Action:** ${action} on ${resource}\n`;
    message += `**Your Role:** ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}\n\n`;

    if (result.reason) {
      message += `**Reason:** ${result.reason}\n\n`;
    }

    if (result.restrictions && result.restrictions.length > 0) {
      message += `**Restrictions:**\n`;
      result.restrictions.forEach(restriction => {
        message += `• ${restriction}\n`;
      });
      message += "\n";
    }

    // Suggest alternative actions
    const accessibleResources = this.getAccessibleResources(user);
    if (accessibleResources.length > 0) {
      message += `**You have access to:**\n`;
      accessibleResources.slice(0, 5).forEach(res => {
        const permissions = this.getResourcePermissions(user, res);
        message += `• ${res}: ${permissions.join(", ")}\n`;
      });
    }

    message += `\n💡 Contact an administrator if you need additional permissions.`;

    return message;
  }

  /**
   * Get applicable rules for user role, resource and action
   */
  private getApplicableRules(
    role: string,
    resource: string,
    action: string
  ): DataAccessRule[] {
    const roleRules = this.ROLE_BASED_RULES[role] || [];

    return roleRules.filter(rule => {
      const resourceMatch = rule.resource === "*" || rule.resource === resource;
      const actionMatch = rule.action === "*" || rule.action === action;
      return resourceMatch && actionMatch;
    });
  }

  /**
   * Evaluate a single access rule
   */
  private async evaluateRule(
    rule: DataAccessRule,
    context: DataAccessContext
  ): Promise<AccessValidationResult> {
    const restrictions: string[] = [];

    // Check conditions
    if (rule.conditions) {
      for (const condition of rule.conditions) {
        const conditionResult = this.evaluateCondition(
          condition,
          context.requestData
        );
        if (!conditionResult.passed) {
          return {
            allowed: false,
            reason: conditionResult.reason,
            restrictions,
          };
        }
      }
    }

    // Check time restrictions
    if (rule.timeRestrictions) {
      for (const timeRestriction of rule.timeRestrictions) {
        const timeResult = this.evaluateTimeRestriction(
          timeRestriction,
          context.timestamp
        );
        if (!timeResult.passed) {
          restrictions.push(timeResult.reason);
          return {
            allowed: false,
            reason: "Access restricted by time policy",
            restrictions,
          };
        }
      }
    }

    return {
      allowed: true,
      restrictions,
    };
  }

  /**
   * Evaluate access condition
   */
  private evaluateCondition(
    condition: DataAccessCondition,
    requestData: any
  ): { passed: boolean; reason?: string } {
    if (!requestData || !requestData.hasOwnProperty(condition.field)) {
      return {
        passed: false,
        reason: `Missing required field: ${condition.field}`,
      };
    }

    const fieldValue = requestData[condition.field];
    const conditionValue = condition.value;

    switch (condition.operator) {
      case "equals":
        return {
          passed: fieldValue === conditionValue,
          reason: `Field ${condition.field} must equal ${conditionValue}`,
        };
      case "not_equals":
        return {
          passed: fieldValue !== conditionValue,
          reason: `Field ${condition.field} cannot equal ${conditionValue}`,
        };
      case "in":
        return {
          passed:
            Array.isArray(conditionValue) &&
            conditionValue.includes(fieldValue),
          reason: `Field ${condition.field} must be one of: ${conditionValue.join(", ")}`,
        };
      case "not_in":
        return {
          passed:
            !Array.isArray(conditionValue) ||
            !conditionValue.includes(fieldValue),
          reason: `Field ${condition.field} cannot be one of: ${conditionValue.join(", ")}`,
        };
      case "contains":
        return {
          passed:
            typeof fieldValue === "string" &&
            fieldValue.includes(conditionValue),
          reason: `Field ${condition.field} must contain ${conditionValue}`,
        };
      case "greater_than":
        return {
          passed: fieldValue > conditionValue,
          reason: `Field ${condition.field} must be greater than ${conditionValue}`,
        };
      case "less_than":
        return {
          passed: fieldValue < conditionValue,
          reason: `Field ${condition.field} must be less than ${conditionValue}`,
        };
      default:
        return {
          passed: false,
          reason: `Unknown condition operator: ${condition.operator}`,
        };
    }
  }

  /**
   * Evaluate time restriction
   */
  private evaluateTimeRestriction(
    restriction: TimeRestriction,
    timestamp: Date
  ): { passed: boolean; reason: string } {
    const now = new Date(
      timestamp.toLocaleString("en-US", { timeZone: restriction.timezone })
    );
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Check day restriction
    if (!restriction.days.includes(currentDay)) {
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const allowedDays = restriction.days.map(d => dayNames[d]).join(", ");
      return {
        passed: false,
        reason: `Access only allowed on: ${allowedDays}`,
      };
    }

    // Check time restriction
    const [startHour, startMin] = restriction.startTime.split(":").map(Number);
    const [endHour, endMin] = restriction.endTime.split(":").map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (currentTime < startTime || currentTime > endTime) {
      return {
        passed: false,
        reason: `Access only allowed between ${restriction.startTime} and ${restriction.endTime} ${restriction.timezone}`,
      };
    }

    return { passed: true, reason: "" };
  }

  /**
   * Add filter to database query
   */
  private addQueryFilter(query: any, filter: DataFilter): any {
    if (!query.filters) {
      query.filters = {};
    }

    if (!query.filters[filter.table]) {
      query.filters[filter.table] = [];
    }

    query.filters[filter.table].push({
      column: filter.column,
      condition: filter.condition,
      value: filter.value,
    });

    return query;
  }

  /**
   * Log access attempt for audit trail
   */
  private async logAccessAttempt(
    context: DataAccessContext,
    success: boolean,
    reason: string,
    matchedRule?: string
  ): Promise<void> {
    try {
      await this.supabase.from("telegram_data_access_log").insert({
        user_id: context.user.id,
        telegram_id: context.user.telegram_id,
        resource: context.resource,
        action: context.action,
        success,
        reason,
        matched_rule: matchedRule,
        request_data: context.requestData
          ? JSON.stringify(context.requestData)
          : null,
        client_info: context.clientInfo
          ? JSON.stringify(context.clientInfo)
          : null,
        created_at: context.timestamp.toISOString(),
      });
    } catch (error) {
      console.error("Failed to log access attempt:", error);
    }
  }
}
