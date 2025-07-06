/**
 * Navigation & UX Database Schemas
 * Task 74.3: Creëer database schema's voor Navigation & UX data opslag
 *
 * Complete database ontwerp voor:
 * 1. User behavior tracking
 * 2. Performance metrics storage
 * 3. A/B testing data management
 * 4. Navigation analytics
 * 5. Real-time user session data
 */

export interface DatabaseSchema {
  tableName: string;
  description: string;
  columns: ColumnDefinition[];
  indexes: IndexDefinition[];
  constraints: ConstraintDefinition[];
  triggers?: TriggerDefinition[];
  policies?: RLSPolicy[];
  partitioning?: PartitioningConfig;
  estimatedSize: {
    rowsPerDay: number;
    bytesPerRow: number;
    retentionDays: number;
    totalSizeGB: number;
  };
}

export interface ColumnDefinition {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  description: string;
  examples?: string[];
}

export interface IndexDefinition {
  name: string;
  columns: string[];
  type: "btree" | "gin" | "gist" | "hash";
  unique: boolean;
  partial?: string;
  description: string;
}

export interface ConstraintDefinition {
  name: string;
  type: "primary_key" | "foreign_key" | "unique" | "check";
  columns: string[];
  reference?: {
    table: string;
    columns: string[];
    onDelete: "CASCADE" | "SET NULL" | "RESTRICT";
    onUpdate: "CASCADE" | "SET NULL" | "RESTRICT";
  };
  checkCondition?: string;
  description: string;
}

export interface TriggerDefinition {
  name: string;
  timing: "BEFORE" | "AFTER" | "INSTEAD OF";
  events: ("INSERT" | "UPDATE" | "DELETE")[];
  function: string;
  description: string;
}

export interface RLSPolicy {
  name: string;
  command: "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "ALL";
  roles: string[];
  using?: string;
  withCheck?: string;
  description: string;
}

export interface PartitioningConfig {
  type: "RANGE" | "LIST" | "HASH";
  column: string;
  strategy: string;
  partitions: PartitionDefinition[];
}

export interface PartitionDefinition {
  name: string;
  condition: string;
  description: string;
}

/**
 * USER EVENTS TABLE
 * Primary storage voor alle user interaction events
 */
export const USER_EVENTS_SCHEMA: DatabaseSchema = {
  tableName: "user_events",
  description:
    "Primary storage voor alle user interaction events (clicks, scrolls, page views, etc.)",

  columns: [
    {
      name: "id",
      type: "UUID",
      nullable: false,
      defaultValue: "gen_random_uuid()",
      description: "Unique identifier voor elk event",
      examples: ["123e4567-e89b-12d3-a456-426614174000"],
    },
    {
      name: "user_id",
      type: "UUID",
      nullable: true,
      description: "User identifier (NULL voor anonymous users)",
      examples: ["auth.users.id", "anonymous"],
    },
    {
      name: "session_id",
      type: "VARCHAR(255)",
      nullable: false,
      description: "Session identifier voor event grouping",
      examples: ["sess_123456789", "anonymous_1640995200000"],
    },
    {
      name: "event_type",
      type: "VARCHAR(50)",
      nullable: false,
      description: "Type van user interaction",
      examples: [
        "click",
        "scroll",
        "page_view",
        "hover",
        "form_submit",
        "search",
      ],
    },
    {
      name: "page_url",
      type: "TEXT",
      nullable: false,
      description: "Complete URL waar event plaatsvond",
      examples: [
        "/dashboard",
        "/analytics/reports",
        "https://example.com/page",
      ],
    },
    {
      name: "page_title",
      type: "TEXT",
      nullable: true,
      description: "Title van de pagina",
      examples: ["Dashboard - SKC BI", "Analytics Reports"],
    },
    {
      name: "element_selector",
      type: "TEXT",
      nullable: true,
      description: "CSS selector van target element",
      examples: [
        "#submit-button",
        ".nav-menu > li:first-child",
        'button[data-action="save"]',
      ],
    },
    {
      name: "element_text",
      type: "TEXT",
      nullable: true,
      description: "Text content van target element",
      examples: ["Submit Form", "Navigation Menu", "Save Changes"],
    },
    {
      name: "viewport_width",
      type: "INTEGER",
      nullable: true,
      description: "Browser viewport width in pixels",
      examples: ["1920", "1366", "768", "375"],
    },
    {
      name: "viewport_height",
      type: "INTEGER",
      nullable: true,
      description: "Browser viewport height in pixels",
      examples: ["1080", "768", "1024", "667"],
    },
    {
      name: "scroll_depth",
      type: "DECIMAL(5,2)",
      nullable: true,
      description: "Percentage van page scroll (0-100)",
      examples: ["25.5", "100.0", "0.0", "67.33"],
    },
    {
      name: "time_on_page",
      type: "INTEGER",
      nullable: true,
      description: "Time spent on page in seconds",
      examples: ["30", "120", "5", "300"],
    },
    {
      name: "referrer_url",
      type: "TEXT",
      nullable: true,
      description: "Previous page URL",
      examples: ["https://google.com/search", "/previous-page", "(direct)"],
    },
    {
      name: "user_agent",
      type: "TEXT",
      nullable: true,
      description: "Browser user agent string",
      examples: [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      ],
    },
    {
      name: "device_type",
      type: "VARCHAR(20)",
      nullable: true,
      description: "Device category",
      examples: ["desktop", "mobile", "tablet"],
    },
    {
      name: "browser_name",
      type: "VARCHAR(50)",
      nullable: true,
      description: "Browser identification",
      examples: ["Chrome", "Firefox", "Safari", "Edge"],
    },
    {
      name: "operating_system",
      type: "VARCHAR(50)",
      nullable: true,
      description: "Operating system",
      examples: ["Windows", "macOS", "Linux", "iOS", "Android"],
    },
    {
      name: "geo_country",
      type: "VARCHAR(2)",
      nullable: true,
      description: "Country code (ISO 3166-1 alpha-2)",
      examples: ["NL", "DE", "US", "FR"],
    },
    {
      name: "geo_city",
      type: "VARCHAR(100)",
      nullable: true,
      description: "City name",
      examples: ["Amsterdam", "Berlin", "New York", "Paris"],
    },
    {
      name: "utm_source",
      type: "VARCHAR(255)",
      nullable: true,
      description: "UTM campaign source",
      examples: ["google", "facebook", "email", "direct"],
    },
    {
      name: "utm_medium",
      type: "VARCHAR(255)",
      nullable: true,
      description: "UTM campaign medium",
      examples: ["cpc", "organic", "email", "social"],
    },
    {
      name: "utm_campaign",
      type: "VARCHAR(255)",
      nullable: true,
      description: "UTM campaign name",
      examples: ["summer_sale", "brand_awareness", "retargeting"],
    },
    {
      name: "custom_properties",
      type: "JSONB",
      nullable: true,
      defaultValue: "'{}'::jsonb",
      description: "Additional custom event properties",
      examples: ['{"feature_flag": "new_ui", "ab_test": "variant_a"}'],
    },
    {
      name: "timestamp",
      type: "TIMESTAMPTZ",
      nullable: false,
      defaultValue: "NOW()",
      description: "When the event occurred",
      examples: ["2024-01-15T10:30:00Z"],
    },
    {
      name: "processed_at",
      type: "TIMESTAMPTZ",
      nullable: true,
      description: "When the event was processed by pipeline",
      examples: ["2024-01-15T10:30:05Z"],
    },
  ],

  indexes: [
    {
      name: "idx_user_events_user_timestamp",
      columns: ["user_id", "timestamp"],
      type: "btree",
      unique: false,
      description: "Optimizes user behavior analysis queries",
    },
    {
      name: "idx_user_events_session_timestamp",
      columns: ["session_id", "timestamp"],
      type: "btree",
      unique: false,
      description: "Optimizes session reconstruction queries",
    },
    {
      name: "idx_user_events_page_timestamp",
      columns: ["page_url", "timestamp"],
      type: "btree",
      unique: false,
      description: "Optimizes page performance analysis",
    },
    {
      name: "idx_user_events_event_type_timestamp",
      columns: ["event_type", "timestamp"],
      type: "btree",
      unique: false,
      description: "Optimizes event type filtering",
    },
    {
      name: "idx_user_events_timestamp_only",
      columns: ["timestamp"],
      type: "btree",
      unique: false,
      description: "Optimizes time-range queries",
    },
    {
      name: "idx_user_events_custom_properties",
      columns: ["custom_properties"],
      type: "gin",
      unique: false,
      description: "Enables fast JSONB queries on custom properties",
    },
  ],

  constraints: [
    {
      name: "pk_user_events",
      type: "primary_key",
      columns: ["id"],
      description: "Primary key constraint",
    },
    {
      name: "fk_user_events_user_id",
      type: "foreign_key",
      columns: ["user_id"],
      reference: {
        table: "auth.users",
        columns: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      description: "Foreign key to users table",
    },
    {
      name: "chk_user_events_event_type",
      type: "check",
      columns: ["event_type"],
      checkCondition:
        "event_type IN ('click', 'scroll', 'page_view', 'hover', 'form_submit', 'search', 'download', 'video_play', 'video_pause')",
      description: "Ensures valid event types",
    },
    {
      name: "chk_user_events_scroll_depth",
      type: "check",
      columns: ["scroll_depth"],
      checkCondition: "scroll_depth >= 0 AND scroll_depth <= 100",
      description: "Ensures scroll depth is between 0-100%",
    },
    {
      name: "chk_user_events_viewport_dimensions",
      type: "check",
      columns: ["viewport_width", "viewport_height"],
      checkCondition: "viewport_width > 0 AND viewport_height > 0",
      description: "Ensures positive viewport dimensions",
    },
  ],

  triggers: [
    {
      name: "tg_user_events_update_processed_at",
      timing: "BEFORE",
      events: ["UPDATE"],
      function: "update_processed_at_column()",
      description: "Automatically updates processed_at timestamp",
    },
  ],

  policies: [
    {
      name: "user_events_select_policy",
      command: "SELECT",
      roles: ["authenticated"],
      using: "user_id = auth.uid() OR user_id IS NULL",
      description: "Users can only see their own events or anonymous events",
    },
    {
      name: "user_events_insert_policy",
      command: "INSERT",
      roles: ["authenticated", "anon"],
      withCheck: "user_id = auth.uid() OR user_id IS NULL",
      description: "Users can only insert their own events or anonymous events",
    },
  ],

  partitioning: {
    type: "RANGE",
    column: "timestamp",
    strategy: "Monthly partitions for efficient time-based queries",
    partitions: [
      {
        name: "user_events_2024_01",
        condition: "timestamp >= '2024-01-01' AND timestamp < '2024-02-01'",
        description: "January 2024 partition",
      },
      {
        name: "user_events_2024_02",
        condition: "timestamp >= '2024-02-01' AND timestamp < '2024-03-01'",
        description: "February 2024 partition",
      },
    ],
  },

  estimatedSize: {
    rowsPerDay: 100000,
    bytesPerRow: 2048,
    retentionDays: 365,
    totalSizeGB: 74.5,
  },
};

/**
 * PERFORMANCE METRICS TABLE
 * Storage voor Core Web Vitals en performance data
 */
export const PERFORMANCE_METRICS_SCHEMA: DatabaseSchema = {
  tableName: "performance_metrics",
  description:
    "Storage voor Core Web Vitals, loading times en performance optimization data",

  columns: [
    {
      name: "id",
      type: "UUID",
      nullable: false,
      defaultValue: "gen_random_uuid()",
      description: "Unique identifier voor elke performance measurement",
      examples: ["123e4567-e89b-12d3-a456-426614174000"],
    },
    {
      name: "user_id",
      type: "UUID",
      nullable: true,
      description: "User identifier (NULL voor anonymous)",
      examples: ["auth.users.id"],
    },
    {
      name: "session_id",
      type: "VARCHAR(255)",
      nullable: false,
      description: "Session identifier",
      examples: ["sess_123456789"],
    },
    {
      name: "page_url",
      type: "TEXT",
      nullable: false,
      description: "URL van gemeten pagina",
      examples: ["/dashboard", "/analytics/reports"],
    },
    {
      name: "navigation_type",
      type: "VARCHAR(20)",
      nullable: true,
      description: "Type van navigation",
      examples: ["navigate", "reload", "back_forward", "prerender"],
    },
    {
      name: "largest_contentful_paint",
      type: "DECIMAL(10,2)",
      nullable: true,
      description: "LCP in milliseconds",
      examples: ["1250.50", "2800.75"],
    },
    {
      name: "first_input_delay",
      type: "DECIMAL(10,2)",
      nullable: true,
      description: "FID in milliseconds",
      examples: ["45.25", "120.00"],
    },
    {
      name: "cumulative_layout_shift",
      type: "DECIMAL(8,4)",
      nullable: true,
      description: "CLS score",
      examples: ["0.0250", "0.1500"],
    },
    {
      name: "first_contentful_paint",
      type: "DECIMAL(10,2)",
      nullable: true,
      description: "FCP in milliseconds",
      examples: ["800.25", "1500.00"],
    },
    {
      name: "time_to_first_byte",
      type: "DECIMAL(10,2)",
      nullable: true,
      description: "TTFB in milliseconds",
      examples: ["150.50", "400.25"],
    },
    {
      name: "dom_content_loaded",
      type: "DECIMAL(10,2)",
      nullable: true,
      description: "DOMContentLoaded event timing",
      examples: ["1200.00", "2500.75"],
    },
    {
      name: "window_load",
      type: "DECIMAL(10,2)",
      nullable: true,
      description: "Window load event timing",
      examples: ["2000.00", "4500.25"],
    },
    {
      name: "performance_score",
      type: "INTEGER",
      nullable: true,
      description: "Calculated performance score (0-100)",
      examples: ["85", "92", "67"],
    },
    {
      name: "performance_grade",
      type: "VARCHAR(1)",
      nullable: true,
      description: "Performance grade (A-F)",
      examples: ["A", "B", "C", "D", "F"],
    },
    {
      name: "device_memory",
      type: "DECIMAL(4,1)",
      nullable: true,
      description: "Device memory in GB",
      examples: ["4.0", "8.0", "16.0"],
    },
    {
      name: "connection_type",
      type: "VARCHAR(20)",
      nullable: true,
      description: "Network connection type",
      examples: ["4g", "wifi", "3g", "ethernet"],
    },
    {
      name: "connection_rtt",
      type: "INTEGER",
      nullable: true,
      description: "Round-trip time in milliseconds",
      examples: ["50", "100", "200"],
    },
    {
      name: "connection_downlink",
      type: "DECIMAL(6,2)",
      nullable: true,
      description: "Downlink speed in Mbps",
      examples: ["10.00", "50.25", "100.00"],
    },
    {
      name: "resource_timings",
      type: "JSONB",
      nullable: true,
      defaultValue: "'{}'::jsonb",
      description: "Detailed resource loading timings",
      examples: ['{"scripts": [{"name": "app.js", "duration": 250}]}'],
    },
    {
      name: "custom_metrics",
      type: "JSONB",
      nullable: true,
      defaultValue: "'{}'::jsonb",
      description: "Additional custom performance metrics",
      examples: ['{"react_render_time": 45, "api_response_time": 120}'],
    },
    {
      name: "timestamp",
      type: "TIMESTAMPTZ",
      nullable: false,
      defaultValue: "NOW()",
      description: "When the performance was measured",
      examples: ["2024-01-15T10:30:00Z"],
    },
    {
      name: "processed_at",
      type: "TIMESTAMPTZ",
      nullable: true,
      description: "When the data was processed",
      examples: ["2024-01-15T10:30:05Z"],
    },
  ],

  indexes: [
    {
      name: "idx_performance_metrics_page_timestamp",
      columns: ["page_url", "timestamp"],
      type: "btree",
      unique: false,
      description: "Optimizes page performance analysis",
    },
    {
      name: "idx_performance_metrics_score_timestamp",
      columns: ["performance_score", "timestamp"],
      type: "btree",
      unique: false,
      description: "Optimizes performance trend analysis",
    },
    {
      name: "idx_performance_metrics_lcp",
      columns: ["largest_contentful_paint"],
      type: "btree",
      unique: false,
      partial: "largest_contentful_paint IS NOT NULL",
      description: "Optimizes LCP analysis queries",
    },
    {
      name: "idx_performance_metrics_jsonb",
      columns: ["resource_timings", "custom_metrics"],
      type: "gin",
      unique: false,
      description: "Enables fast JSONB queries",
    },
  ],

  constraints: [
    {
      name: "pk_performance_metrics",
      type: "primary_key",
      columns: ["id"],
      description: "Primary key constraint",
    },
    {
      name: "chk_performance_score_range",
      type: "check",
      columns: ["performance_score"],
      checkCondition: "performance_score >= 0 AND performance_score <= 100",
      description: "Ensures performance score is 0-100",
    },
    {
      name: "chk_performance_grade_valid",
      type: "check",
      columns: ["performance_grade"],
      checkCondition: "performance_grade IN ('A', 'B', 'C', 'D', 'F')",
      description: "Ensures valid performance grades",
    },
  ],

  estimatedSize: {
    rowsPerDay: 50000,
    bytesPerRow: 1536,
    retentionDays: 180,
    totalSizeGB: 13.8,
  },
};

/**
 * EXPERIMENT RESULTS TABLE
 * A/B testing data en statistical analysis results
 */
export const EXPERIMENT_RESULTS_SCHEMA: DatabaseSchema = {
  tableName: "experiment_results",
  description:
    "A/B testing experiment data, assignments, conversions en statistical analysis",

  columns: [
    {
      name: "id",
      type: "UUID",
      nullable: false,
      defaultValue: "gen_random_uuid()",
      description: "Unique identifier voor experiment result",
      examples: ["123e4567-e89b-12d3-a456-426614174000"],
    },
    {
      name: "experiment_id",
      type: "VARCHAR(100)",
      nullable: false,
      description: "Unique experiment identifier",
      examples: ["nav_button_color_test", "homepage_layout_v2"],
    },
    {
      name: "experiment_name",
      type: "VARCHAR(255)",
      nullable: false,
      description: "Human readable experiment name",
      examples: ["Navigation Button Color Test", "Homepage Layout V2"],
    },
    {
      name: "variant_id",
      type: "VARCHAR(50)",
      nullable: false,
      description: "Experiment variant identifier",
      examples: ["control", "treatment", "variant_a", "variant_b"],
    },
    {
      name: "user_id",
      type: "UUID",
      nullable: true,
      description: "User assigned to experiment",
      examples: ["auth.users.id"],
    },
    {
      name: "session_id",
      type: "VARCHAR(255)",
      nullable: false,
      description: "Session identifier",
      examples: ["sess_123456789"],
    },
    {
      name: "assignment_timestamp",
      type: "TIMESTAMPTZ",
      nullable: false,
      description: "When user was assigned to variant",
      examples: ["2024-01-15T10:30:00Z"],
    },
    {
      name: "conversion_event",
      type: "VARCHAR(100)",
      nullable: true,
      description: "Conversion event that occurred",
      examples: ["signup", "purchase", "form_submit", "page_view"],
    },
    {
      name: "conversion_timestamp",
      type: "TIMESTAMPTZ",
      nullable: true,
      description: "When conversion occurred",
      examples: ["2024-01-15T10:35:00Z"],
    },
    {
      name: "conversion_value",
      type: "DECIMAL(10,2)",
      nullable: true,
      description: "Monetary value of conversion",
      examples: ["29.99", "149.00", "0.00"],
    },
    {
      name: "time_to_conversion",
      type: "INTEGER",
      nullable: true,
      description: "Seconds from assignment to conversion",
      examples: ["300", "1800", "86400"],
    },
    {
      name: "page_url",
      type: "TEXT",
      nullable: true,
      description: "Page where experiment was shown",
      examples: ["/homepage", "/signup", "/checkout"],
    },
    {
      name: "custom_attributes",
      type: "JSONB",
      nullable: true,
      defaultValue: "'{}'::jsonb",
      description: "Additional experiment attributes",
      examples: ['{"device_type": "mobile", "traffic_source": "organic"}'],
    },
    {
      name: "created_at",
      type: "TIMESTAMPTZ",
      nullable: false,
      defaultValue: "NOW()",
      description: "When record was created",
      examples: ["2024-01-15T10:30:00Z"],
    },
    {
      name: "updated_at",
      type: "TIMESTAMPTZ",
      nullable: false,
      defaultValue: "NOW()",
      description: "When record was last updated",
      examples: ["2024-01-15T10:35:00Z"],
    },
  ],

  indexes: [
    {
      name: "idx_experiment_results_experiment_variant",
      columns: ["experiment_id", "variant_id"],
      type: "btree",
      unique: false,
      description: "Optimizes experiment analysis queries",
    },
    {
      name: "idx_experiment_results_user_experiment",
      columns: ["user_id", "experiment_id"],
      type: "btree",
      unique: false,
      description: "Prevents duplicate user assignments",
    },
    {
      name: "idx_experiment_results_conversion_timestamp",
      columns: ["conversion_timestamp"],
      type: "btree",
      unique: false,
      partial: "conversion_timestamp IS NOT NULL",
      description: "Optimizes conversion analysis",
    },
  ],

  constraints: [
    {
      name: "pk_experiment_results",
      type: "primary_key",
      columns: ["id"],
      description: "Primary key constraint",
    },
    {
      name: "uq_experiment_results_user_experiment",
      type: "unique",
      columns: ["user_id", "experiment_id"],
      description: "Prevents duplicate user assignments to same experiment",
    },
  ],

  estimatedSize: {
    rowsPerDay: 25000,
    bytesPerRow: 768,
    retentionDays: 365,
    totalSizeGB: 7.0,
  },
};

/**
 * SQL MIGRATION GENERATOR
 * Generates complete SQL migrations for all schemas
 */
export class NavigationSchemaMigrationGenerator {
  static generateCreateTableSQL(schema: DatabaseSchema): string {
    const columns = schema.columns
      .map(col => {
        let sql = `  ${col.name} ${col.type}`;
        if (!col.nullable) sql += " NOT NULL";
        if (col.defaultValue) sql += ` DEFAULT ${col.defaultValue}`;
        return sql;
      })
      .join(",\n");

    let sql = `-- Create ${schema.tableName} table\n`;
    sql += `-- ${schema.description}\n`;
    sql += `CREATE TABLE ${schema.tableName} (\n${columns}\n);\n\n`;

    // Add constraints
    schema.constraints.forEach(constraint => {
      sql += `-- ${constraint.description}\n`;
      if (constraint.type === "primary_key") {
        sql += `ALTER TABLE ${schema.tableName} ADD CONSTRAINT ${constraint.name} PRIMARY KEY (${constraint.columns.join(", ")});\n`;
      } else if (constraint.type === "foreign_key" && constraint.reference) {
        sql += `ALTER TABLE ${schema.tableName} ADD CONSTRAINT ${constraint.name} FOREIGN KEY (${constraint.columns.join(", ")}) REFERENCES ${constraint.reference.table}(${constraint.reference.columns.join(", ")}) ON DELETE ${constraint.reference.onDelete} ON UPDATE ${constraint.reference.onUpdate};\n`;
      } else if (constraint.type === "unique") {
        sql += `ALTER TABLE ${schema.tableName} ADD CONSTRAINT ${constraint.name} UNIQUE (${constraint.columns.join(", ")});\n`;
      } else if (constraint.type === "check") {
        sql += `ALTER TABLE ${schema.tableName} ADD CONSTRAINT ${constraint.name} CHECK (${constraint.checkCondition});\n`;
      }
      sql += "\n";
    });

    // Add indexes
    schema.indexes.forEach(index => {
      sql += `-- ${index.description}\n`;
      let indexSQL = `CREATE`;
      if (index.unique) indexSQL += " UNIQUE";
      indexSQL += ` INDEX ${index.name} ON ${schema.tableName}`;
      if (index.type !== "btree")
        indexSQL += ` USING ${index.type.toUpperCase()}`;
      indexSQL += ` (${index.columns.join(", ")})`;
      if (index.partial) indexSQL += ` WHERE ${index.partial}`;
      indexSQL += ";\n\n";
      sql += indexSQL;
    });

    return sql;
  }

  static generateCompleteNavigationMigration(): string {
    let migration = `-- Navigation & UX Data Seeding Database Migration\n`;
    migration += `-- Generated on: ${new Date().toISOString()}\n`;
    migration += `-- Task 74.3: Database schemas voor Navigation & UX data opslag\n\n`;

    migration += `-- Enable required extensions\n`;
    migration += `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n`;
    migration += `CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";\n\n`;

    // Helper functions
    migration += `-- Helper function voor updating processed_at timestamps\n`;
    migration += `CREATE OR REPLACE FUNCTION update_processed_at_column()\n`;
    migration += `RETURNS TRIGGER AS $$\n`;
    migration += `BEGIN\n`;
    migration += `  NEW.processed_at = NOW();\n`;
    migration += `  RETURN NEW;\n`;
    migration += `END;\n`;
    migration += `$$ language 'plpgsql';\n\n`;

    // Generate all table schemas
    const schemas = [
      USER_EVENTS_SCHEMA,
      PERFORMANCE_METRICS_SCHEMA,
      EXPERIMENT_RESULTS_SCHEMA,
    ];

    schemas.forEach(schema => {
      migration += this.generateCreateTableSQL(schema);
    });

    // Add RLS policies
    migration += `-- Enable Row Level Security\n`;
    schemas.forEach(schema => {
      migration += `ALTER TABLE ${schema.tableName} ENABLE ROW LEVEL SECURITY;\n`;

      if (schema.policies) {
        schema.policies.forEach(policy => {
          migration += `-- ${policy.description}\n`;
          let policySQL = `CREATE POLICY ${policy.name} ON ${schema.tableName} FOR ${policy.command} TO ${policy.roles.join(", ")}`;
          if (policy.using) policySQL += ` USING (${policy.using})`;
          if (policy.withCheck)
            policySQL += ` WITH CHECK (${policy.withCheck})`;
          policySQL += ";\n";
          migration += policySQL;
        });
      }
      migration += "\n";
    });

    // Add triggers
    schemas.forEach(schema => {
      if (schema.triggers) {
        schema.triggers.forEach(trigger => {
          migration += `-- ${trigger.description}\n`;
          migration += `CREATE TRIGGER ${trigger.name}\n`;
          migration += `  ${trigger.timing} ${trigger.events.join(" OR ")} ON ${schema.tableName}\n`;
          migration += `  FOR EACH ROW EXECUTE FUNCTION ${trigger.function};\n\n`;
        });
      }
    });

    return migration;
  }
}

export default {
  USER_EVENTS_SCHEMA,
  PERFORMANCE_METRICS_SCHEMA,
  EXPERIMENT_RESULTS_SCHEMA,
  NavigationSchemaMigrationGenerator,
};
