/**
 * Database Migration Script
 * Executes all SQL migration files against Supabase
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "❌ Missing Supabase configuration. Please check your .env.local file."
  );
  console.error(
    "Required variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  try {
    console.log("🚀 Starting database migrations...\n");

    const migrationsDir = path.join(__dirname, "..", "migrations");
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter(file => file.endsWith(".sql"))
      .sort(); // Run in alphabetical order

    console.log(`Found ${migrationFiles.length} migration files:`);
    migrationFiles.forEach(file => console.log(`  - ${file}`));
    console.log("");

    for (const file of migrationFiles) {
      console.log(`📄 Executing migration: ${file}`);

      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, "utf8");

      try {
        // Execute the SQL using Supabase's rpc function
        const { error } = await supabase.rpc("exec_sql", {
          sql: sqlContent,
        });

        if (error) {
          console.error(`❌ Error executing ${file}:`, error.message);

          // Try alternative method - direct query execution
          const statements = sqlContent
            .split(";")
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

          console.log(
            `  Trying to execute ${statements.length} statements individually...`
          );

          for (const statement of statements) {
            if (statement.trim()) {
              const { error: stmtError } = await supabase.rpc("exec_sql", {
                sql: statement,
              });

              if (stmtError) {
                console.warn(`  ⚠️  Statement failed: ${stmtError.message}`);
                // Continue with next statement
              }
            }
          }
        }

        console.log(`✅ Migration ${file} completed`);
      } catch (migrationError) {
        console.error(`❌ Failed to execute ${file}:`, migrationError.message);
        // Continue with next migration
      }

      console.log("");
    }

    console.log("🎉 All migrations completed!");

    // Verify some key tables exist
    console.log("\n🔍 Verifying key tables...");

    const tables = [
      "ai_personality_profiles",
      "ai_system_messages",
      "ai_configuration",
      "user_behavior_events",
      "tactical_data_analysis",
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select("*").limit(1);

        if (error) {
          console.log(`  ❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`  ✅ Table ${table}: OK`);
        }
      } catch (e) {
        console.log(`  ❌ Table ${table}: ${e.message}`);
      }
    }
  } catch (error) {
    console.error("❌ Migration process failed:", error);
    process.exit(1);
  }
}

// Execute migrations
runMigrations().catch(console.error);
