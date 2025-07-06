import { createClient } from "@supabase/supabase-js";

// ClickUp Custom Field Types
export enum ClickUpFieldType {
  TEXT = "text",
  NUMBER = "number",
  CURRENCY = "currency",
  DATE = "date",
  DROPDOWN = "dropdown",
  CHECKBOX = "checkbox",
  URL = "url",
  EMAIL = "email",
  PHONE = "phone",
  PEOPLE = "people",
  RATING = "rating",
  EMOJI = "emoji",
  FORMULA = "formula",
  ROLLUP = "rollup",
  RELATIONSHIP = "relationship",
  PROGRESS = "progress",
  LOCATION = "location",
  SHORT_TEXT = "short_text",
  LONG_TEXT = "long_text",
  ATTACHMENT = "attachment",
}

// Custom Field Interfaces
export interface ClickUpCustomField {
  id: string;
  name: string;
  type: ClickUpFieldType;
  value?: any;
  type_config?: {
    default?: any;
    placeholder?: string;
    options?: Array<{
      id: string;
      name: string;
      color?: string;
      orderindex?: number;
    }>;
    precision?: number;
    currency_type?: string;
    date_time?: boolean;
    include_time?: boolean;
  };
  date_created?: string;
  hide_from_guests?: boolean;
  required?: boolean;
}

export interface MetadataMapping {
  id: string;
  platform_field: string;
  clickup_field_id: string;
  clickup_field_name: string;
  field_type: ClickUpFieldType;
  mapping_config: {
    sync_direction: "to_clickup" | "from_clickup" | "bidirectional";
    transform_rule?: string;
    default_value?: any;
    validation_rule?: string;
  };
  workspace_id?: string;
  list_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentMetadata {
  content_type:
    | "blog_post"
    | "social_media"
    | "email_campaign"
    | "video"
    | "infographic"
    | "podcast"
    | "webinar";
  campaign_id?: string;
  target_audience: string[];
  platforms: string[];
  publication_date?: string;
  author: string;
  tags: string[];
  status: "draft" | "review" | "approved" | "published" | "archived";
  priority: "low" | "normal" | "high" | "urgent";
  estimated_effort_hours?: number;
  budget?: number;
  performance_metrics?: {
    views?: number;
    engagement_rate?: number;
    conversion_rate?: number;
    roi?: number;
  };
}

export interface CustomFieldsConfig {
  workspace_id: string;
  list_id: string;
  required_fields: string[];
  optional_fields: string[];
  default_values: Record<string, any>;
  validation_rules: Record<string, string>;
}

export class ClickUpCustomFieldsService {
  private apiKey: string;
  private baseUrl = "https://api.clickup.com/api/v2";
  private supabase: any;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // Get custom fields for a list
  async getListCustomFields(listId: string): Promise<ClickUpCustomField[]> {
    try {
      const response = await fetch(`${this.baseUrl}/list/${listId}/field`, {
        headers: {
          Authorization: this.apiKey,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get custom fields: ${response.statusText}`);
      }

      const data = await response.json();
      return data.fields || [];
    } catch (error) {
      console.error("Error getting custom fields:", error);
      throw error;
    }
  }

  // Create a custom field
  async createCustomField(
    listId: string,
    field: Partial<ClickUpCustomField>
  ): Promise<ClickUpCustomField> {
    try {
      const response = await fetch(`${this.baseUrl}/list/${listId}/field`, {
        method: "POST",
        headers: {
          Authorization: this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: field.name,
          type: field.type,
          type_config: field.type_config,
          required: field.required || false,
          hide_from_guests: field.hide_from_guests || false,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to create custom field: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating custom field:", error);
      throw error;
    }
  }

  // Update custom field value for a task
  async updateTaskCustomField(
    taskId: string,
    fieldId: string,
    value: any
  ): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/task/${taskId}/field/${fieldId}`,
        {
          method: "POST",
          headers: {
            Authorization: this.apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ value }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to update custom field: ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error updating custom field:", error);
      throw error;
    }
  }

  // Get metadata mappings from database
  async getMetadataMappings(workspaceId?: string): Promise<MetadataMapping[]> {
    try {
      let query = this.supabase.from("clickup_metadata_mappings").select("*");

      if (workspaceId) {
        query = query.eq("workspace_id", workspaceId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Error getting metadata mappings:", error);
      throw error;
    }
  }

  // Create metadata mapping
  async createMetadataMapping(
    mapping: Omit<MetadataMapping, "id" | "created_at" | "updated_at">
  ): Promise<MetadataMapping> {
    try {
      const { data, error } = await this.supabase
        .from("clickup_metadata_mappings")
        .insert([
          {
            ...mapping,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error creating metadata mapping:", error);
      throw error;
    }
  }

  // Apply content metadata to ClickUp task
  async applyContentMetadata(
    taskId: string,
    metadata: ContentMetadata,
    mappings: MetadataMapping[]
  ): Promise<void> {
    try {
      const fieldUpdates = [];

      for (const mapping of mappings) {
        if (mapping.mapping_config.sync_direction === "from_clickup") {
          continue; // Skip fields that only sync from ClickUp
        }

        let value = this.extractMetadataValue(metadata, mapping.platform_field);

        // Apply transformation if configured
        if (mapping.mapping_config.transform_rule) {
          value = this.applyTransformRule(
            value,
            mapping.mapping_config.transform_rule
          );
        }

        // Use default value if no value found
        if (
          value === undefined &&
          mapping.mapping_config.default_value !== undefined
        ) {
          value = mapping.mapping_config.default_value;
        }

        // Validate value if validation rule exists
        if (mapping.mapping_config.validation_rule && value !== undefined) {
          if (
            !this.validateValue(value, mapping.mapping_config.validation_rule)
          ) {
            console.warn(
              `Validation failed for field ${mapping.platform_field}:`,
              value
            );
            continue;
          }
        }

        if (value !== undefined) {
          fieldUpdates.push({
            fieldId: mapping.clickup_field_id,
            value: this.formatValueForClickUp(value, mapping.field_type),
          });
        }
      }

      // Apply all field updates
      for (const update of fieldUpdates) {
        await this.updateTaskCustomField(taskId, update.fieldId, update.value);
      }
    } catch (error) {
      console.error("Error applying content metadata:", error);
      throw error;
    }
  }

  // Extract metadata value by field path
  private extractMetadataValue(
    metadata: ContentMetadata,
    fieldPath: string
  ): any {
    const paths = fieldPath.split(".");
    let value: any = metadata;

    for (const path of paths) {
      if (value && typeof value === "object" && path in value) {
        value = value[path];
      } else {
        return undefined;
      }
    }

    return value;
  }

  // Apply transformation rule
  private applyTransformRule(value: any, rule: string): any {
    try {
      switch (rule) {
        case "uppercase":
          return typeof value === "string" ? value.toUpperCase() : value;
        case "lowercase":
          return typeof value === "string" ? value.toLowerCase() : value;
        case "array_to_string":
          return Array.isArray(value) ? value.join(", ") : value;
        case "string_to_array":
          return typeof value === "string"
            ? value.split(",").map(s => s.trim())
            : value;
        case "date_to_timestamp":
          return value instanceof Date
            ? value.getTime()
            : new Date(value).getTime();
        case "timestamp_to_date":
          return typeof value === "number"
            ? new Date(value).toISOString()
            : value;
        default:
          return value;
      }
    } catch (error) {
      console.warn("Transform rule failed:", rule, value);
      return value;
    }
  }

  // Validate value against rule
  private validateValue(value: any, rule: string): boolean {
    try {
      switch (rule) {
        case "required":
          return value !== undefined && value !== null && value !== "";
        case "email":
          return (
            typeof value === "string" &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          );
        case "url":
          return typeof value === "string" && /^https?:\/\/.+/.test(value);
        case "number":
          return typeof value === "number" || !isNaN(Number(value));
        case "positive_number":
          return (
            (typeof value === "number" || !isNaN(Number(value))) &&
            Number(value) > 0
          );
        case "array_not_empty":
          return Array.isArray(value) && value.length > 0;
        default:
          return true;
      }
    } catch (error) {
      return false;
    }
  }

  // Format value for ClickUp based on field type
  private formatValueForClickUp(value: any, fieldType: ClickUpFieldType): any {
    switch (fieldType) {
      case ClickUpFieldType.TEXT:
      case ClickUpFieldType.SHORT_TEXT:
      case ClickUpFieldType.LONG_TEXT:
        return String(value);

      case ClickUpFieldType.NUMBER:
      case ClickUpFieldType.CURRENCY:
      case ClickUpFieldType.RATING:
      case ClickUpFieldType.PROGRESS:
        return Number(value);

      case ClickUpFieldType.DATE:
        if (value instanceof Date) {
          return value.getTime();
        }
        return new Date(value).getTime();

      case ClickUpFieldType.CHECKBOX:
        return Boolean(value);

      case ClickUpFieldType.DROPDOWN:
        // For dropdown fields, we need to match the option ID
        return value;

      case ClickUpFieldType.URL:
      case ClickUpFieldType.EMAIL:
      case ClickUpFieldType.PHONE:
        return String(value);

      case ClickUpFieldType.PEOPLE:
        // People fields expect user IDs
        return Array.isArray(value) ? value : [value];

      default:
        return value;
    }
  }

  // Setup default content fields for a list
  async setupContentFields(listId: string): Promise<void> {
    try {
      const defaultFields = [
        {
          name: "Content Type",
          type: ClickUpFieldType.DROPDOWN,
          type_config: {
            options: [
              { id: "blog_post", name: "Blog Post", color: "#3B82F6" },
              { id: "social_media", name: "Social Media", color: "#10B981" },
              {
                id: "email_campaign",
                name: "Email Campaign",
                color: "#F59E0B",
              },
              { id: "video", name: "Video", color: "#EF4444" },
              { id: "infographic", name: "Infographic", color: "#8B5CF6" },
              { id: "podcast", name: "Podcast", color: "#EC4899" },
              { id: "webinar", name: "Webinar", color: "#14B8A6" },
            ],
          },
          required: true,
        },
        {
          name: "Target Audience",
          type: ClickUpFieldType.TEXT,
          type_config: {
            placeholder: "Enter target audience segments (comma-separated)",
          },
        },
        {
          name: "Publication Date",
          type: ClickUpFieldType.DATE,
          type_config: {
            date_time: true,
            include_time: true,
          },
        },
        {
          name: "Platforms",
          type: ClickUpFieldType.TEXT,
          type_config: {
            placeholder: "LinkedIn, Twitter, Facebook, etc.",
          },
        },
        {
          name: "Campaign ID",
          type: ClickUpFieldType.TEXT,
          type_config: {
            placeholder: "Associated campaign identifier",
          },
        },
        {
          name: "Estimated Effort (Hours)",
          type: ClickUpFieldType.NUMBER,
          type_config: {
            precision: 1,
          },
        },
        {
          name: "Budget",
          type: ClickUpFieldType.CURRENCY,
          type_config: {
            currency_type: "EUR",
            precision: 2,
          },
        },
        {
          name: "Content Priority",
          type: ClickUpFieldType.DROPDOWN,
          type_config: {
            options: [
              { id: "low", name: "Low", color: "#6B7280" },
              { id: "normal", name: "Normal", color: "#3B82F6" },
              { id: "high", name: "High", color: "#F59E0B" },
              { id: "urgent", name: "Urgent", color: "#EF4444" },
            ],
          },
        },
        {
          name: "Tags",
          type: ClickUpFieldType.TEXT,
          type_config: {
            placeholder: "Content tags (comma-separated)",
          },
        },
        {
          name: "Performance Score",
          type: ClickUpFieldType.RATING,
          type_config: {
            default: 0,
          },
        },
      ];

      for (const field of defaultFields) {
        try {
          await this.createCustomField(listId, field);
          console.log(`Created custom field: ${field.name}`);
        } catch (error) {
          console.warn(`Field ${field.name} might already exist:`, error);
        }
      }

      console.log("Content fields setup completed");
    } catch (error) {
      console.error("Error setting up content fields:", error);
      throw error;
    }
  }

  // Get field statistics
  async getFieldUsageStats(listId: string): Promise<Record<string, any>> {
    try {
      const fields = await this.getListCustomFields(listId);

      // This would typically involve querying tasks and analyzing field usage
      // For now, return basic field information
      return {
        total_fields: fields.length,
        field_types: fields.reduce(
          (acc, field) => {
            acc[field.type] = (acc[field.type] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
        required_fields: fields.filter(f => f.required).length,
        optional_fields: fields.filter(f => !f.required).length,
        fields: fields.map(f => ({
          id: f.id,
          name: f.name,
          type: f.type,
          required: f.required,
          usage_percentage: Math.random() * 100, // Mock data - would be calculated from actual task data
        })),
      };
    } catch (error) {
      console.error("Error getting field usage stats:", error);
      throw error;
    }
  }

  // Bulk update metadata for multiple tasks
  async bulkUpdateMetadata(
    taskIds: string[],
    metadata: Partial<ContentMetadata>,
    mappings: MetadataMapping[]
  ): Promise<{ success: string[]; failed: string[] }> {
    const results = { success: [], failed: [] };

    for (const taskId of taskIds) {
      try {
        await this.applyContentMetadata(
          taskId,
          metadata as ContentMetadata,
          mappings
        );
        results.success.push(taskId);
      } catch (error) {
        console.error(`Failed to update metadata for task ${taskId}:`, error);
        results.failed.push(taskId);
      }
    }

    return results;
  }
}
