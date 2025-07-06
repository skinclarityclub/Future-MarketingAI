// Direct creation of AI tables
require("dotenv").config({ path: ".env.local" });

async function createAITables() {
  try {
    const { createClient } = require("@supabase/supabase-js");

    console.log("🔍 Environment Check:");
    console.log(
      "Supabase URL:",
      process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Found" : "❌ Missing"
    );
    console.log(
      "Service Key:",
      process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Found" : "❌ Missing"
    );

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.log("❌ Missing credentials - cannot proceed");
      return;
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log("\n🚀 Creating AI tables...\n");

    // Test if ai_personality_profiles table exists
    console.log("1. Testing ai_personality_profiles table...");
    const { data: profiles, error: profilesError } = await supabase
      .from("ai_personality_profiles")
      .select("*")
      .limit(1);

    if (profilesError) {
      console.log(
        "❌ ai_personality_profiles table missing:",
        profilesError.message
      );
    } else {
      console.log("✅ ai_personality_profiles table exists");
    }

    // Test if ai_system_messages table exists
    console.log("2. Testing ai_system_messages table...");
    const { data: messages, error: messagesError } = await supabase
      .from("ai_system_messages")
      .select("*")
      .limit(1);

    if (messagesError) {
      console.log(
        "❌ ai_system_messages table missing:",
        messagesError.message
      );
    } else {
      console.log("✅ ai_system_messages table exists");
    }

    // Test if ai_configuration table exists
    console.log("3. Testing ai_configuration table...");
    const { data: config, error: configError } = await supabase
      .from("ai_configuration")
      .select("*")
      .limit(1);

    if (configError) {
      console.log("❌ ai_configuration table missing:", configError.message);
    } else {
      console.log("✅ ai_configuration table exists");
    }

    // Test user_behavior_events table
    console.log("4. Testing user_behavior_events table...");
    const { data: events, error: eventsError } = await supabase
      .from("user_behavior_events")
      .select("*")
      .limit(1);

    if (eventsError) {
      console.log(
        "❌ user_behavior_events table missing:",
        eventsError.message
      );
    } else {
      console.log("✅ user_behavior_events table exists");
    }

    console.log("\n📋 Summary:");
    console.log(
      "- If tables are missing, you need to run the SQL migrations manually"
    );
    console.log(
      "- You can copy the SQL from migrations/ folder and run in Supabase SQL Editor"
    );
    console.log(
      "- Or run: npm run migrate (after fixing the migration script)"
    );
  } catch (err) {
    console.log("❌ Test failed:", err.message);
  }
}

createAITables();
