// Test environment and Supabase connection
require("dotenv").config({ path: ".env.local" });

console.log("🔍 Environment Check:");
console.log(
  "Supabase URL:",
  process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Found" : "❌ Missing"
);
console.log(
  "Service Key:",
  process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Found" : "❌ Missing"
);

async function testConnection() {
  try {
    const { createClient } = require("@supabase/supabase-js");

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.log("❌ Cannot test connection - missing credentials");
      return;
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log("\n🔗 Testing database connection...");

    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .limit(5);

    if (error) {
      console.log("❌ Connection failed:", error.message);
    } else {
      console.log("✅ Connection successful!");
      console.log("Sample tables:", data?.length || 0);
    }
  } catch (err) {
    console.log("❌ Test failed:", err.message);
  }
}

testConnection();
