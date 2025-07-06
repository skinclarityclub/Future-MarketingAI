require("dotenv").config();
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  // Use the correct project reference
  const projectRef = "nurdldgqxseunotmygzn";
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51cmRsZGdxeHNldW5vdG15Z3puIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU1NTg4MSwiZXhwIjoyMDUwMTMxODgxfQ.1ykm9WQXH2iLIADjUOmKyDlsQbzuFb0nOWE8A7vKHdM";

  // Database connection configuration
  const client = new Client({
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: serviceRoleKey,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log("Connecting to database...");
    console.log("Host:", `db.${projectRef}.supabase.co`);
    await client.connect();
    console.log("Connected successfully!");

    // Read the migration file
    const migrationPath = path.join(
      __dirname,
      "migrations",
      "044_content_performance_tracking.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("Running migration...");
    await client.query(migrationSQL);
    console.log("Migration completed successfully!");

    // Test if the table exists
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'content_performance'
    `);

    if (result.rows.length > 0) {
      console.log("✅ content_performance table created successfully!");

      // Check if posting_time column exists
      const columnCheck = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'content_performance' 
        AND column_name = 'posting_time'
      `);

      if (columnCheck.rows.length > 0) {
        console.log("✅ posting_time column exists:", columnCheck.rows[0]);
      } else {
        console.log("❌ posting_time column not found");
      }
    } else {
      console.log("❌ content_performance table not found");
    }
  } catch (error) {
    console.error("Error running migration:", error);
    process.exit(1);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

runMigration();
