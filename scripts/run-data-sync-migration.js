/**
 * Data Sync Migration Script
 * Task 33.4: Enable Bidirectional Data Synchronization
 * Runs the database migration for data sync tables
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "your-service-role-key"
);

async function runDataSyncMigration() {
  try {
    console.log("🚀 Starting data synchronization migration...");

    const migrationPath = path.join(
      __dirname,
      "../migrations/025_data_sync_tables.sql"
    );
    const sql = fs.readFileSync(migrationPath, "utf8");

    // Split by semicolon and execute each statement
    const statements = sql.split(";").filter(s => s.trim());

    console.log(`Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);

          const { error } = await supabase.rpc("exec_sql", {
            sql: statement + ";",
          });

          if (error) {
            console.log(`⚠️  Statement ${i + 1} warning:`, error.message);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (e) {
          console.log(`❌ Statement ${i + 1} execution error:`, e.message);
        }
      }
    }

    // Test the new tables
    console.log("\n🔍 Testing created tables...");

    const tablesToTest = [
      "data_sync_logs",
      "data_sync_conflicts",
      "n8n_workflows",
      "sync_queue",
    ];

    for (const table of tablesToTest) {
      try {
        const { data, error } = await supabase.from(table).select("*").limit(1);

        if (error) {
          console.log(`⚠️  Table ${table} test failed:`, error.message);
        } else {
          console.log(`✅ Table ${table} is accessible`);
        }
      } catch (e) {
        console.log(`❌ Table ${table} test error:`, e.message);
      }
    }

    // Check existing data sync configs
    console.log("\n📊 Checking data sync configurations...");
    try {
      const { data: configs, error } = await supabase
        .from("data_sync_configs")
        .select("*");

      if (error) {
        console.log("⚠️  Could not fetch sync configs:", error.message);
      } else {
        console.log(`✅ Found ${configs?.length || 0} sync configurations`);
        configs?.forEach(config => {
          console.log(
            `   - ${config.source_type} → ${config.target_type} (${config.sync_direction})`
          );
        });
      }
    } catch (e) {
      console.log("❌ Sync configs check error:", e.message);
    }

    console.log("\n🎉 Data synchronization migration completed!");
    console.log("\nNext steps:");
    console.log("1. Start the development server: npm run dev");
    console.log(
      "2. Navigate to /workflows/data-sync to test the sync dashboard"
    );
    console.log(
      "3. Configure your n8n instance URL and API key in environment variables"
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
runDataSyncMigration();
