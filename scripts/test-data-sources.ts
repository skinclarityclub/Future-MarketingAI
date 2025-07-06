#!/usr/bin/env node
/**
 * Simple diagnostic script that iterates through all registered data sources
 * and invokes their `testConnection()` method, printing the result to stdout.
 *
 * Usage:
 *   npm run test:data-sources
 */

import dotenv from "dotenv";
import { getDataSources } from "@/lib/assistant/data-source-registry.ts";

// Try to load environment variables from .env.local first, then .env
dotenv.config({ path: ".env.local", override: false });
dotenv.config();

async function main() {
  const sources = getDataSources();
  const entries = Object.entries(sources);

  console.log("\nData-source connection test\n——————————————");

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn(
      "⚠️  SUPABASE_SERVICE_ROLE_KEY is not set in environment. Check your .env.local file."
    );
  }

  for (const [name, source] of entries) {
    process.stdout.write(`${name.padEnd(25)} ➜ `);
    try {
      const ok = await source.testConnection();
      if (ok) {
        console.log("✅ OK");
      } else {
        console.log("❌ FAILED");
      }
    } catch (error) {
      console.log("❌ ERROR");
      console.log("   Full error:", error);
      if (name.includes("supabase")) {
        console.log(
          "   Debug: SUPABASE_SERVICE_ROLE_KEY present:",
          !!process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        console.log(
          "   Debug: NEXT_PUBLIC_SUPABASE_URL present:",
          !!process.env.NEXT_PUBLIC_SUPABASE_URL
        );
        console.log(
          "   Debug: SUPABASE_SERVICE_ROLE_KEY value:",
          process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20) + "..."
        );
      }
    }
  }

  console.log("\nDone.\n");
}

main().catch(err => {
  console.error("Unexpected error while running connection tests", err);
  process.exit(1);
});
