#!/usr/bin/env tsx

import { config } from "dotenv";
import { getBotConfig } from "../src/lib/telegram/bot-config";
import TelegramWebhookManager from "../src/lib/telegram/webhook-config";

// Load environment variables
config();

interface SetupOptions {
  url?: string;
  delete?: boolean;
  info?: boolean;
  generate?: boolean;
  force?: boolean;
}

async function setupWebhook(options: SetupOptions) {
  try {
    console.log("🤖 Telegram Bot Webhook Setup");
    console.log("================================");

    // Load bot configuration
    const botConfig = getBotConfig();
    if (!botConfig.token) {
      console.error("❌ Error: TELEGRAM_BOT_TOKEN is not configured");
      console.log("   Please set the TELEGRAM_BOT_TOKEN environment variable");
      process.exit(1);
    }

    const webhookManager = new TelegramWebhookManager(botConfig);

    // Handle different commands
    if (options.delete) {
      await deleteWebhook(webhookManager);
    } else if (options.info) {
      await showWebhookInfo(webhookManager);
    } else if (options.generate) {
      generateSecretToken(webhookManager);
    } else if (options.url) {
      await setupWebhookUrl(webhookManager, options.url, options.force);
    } else {
      showHelp();
    }
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

async function setupWebhookUrl(
  manager: TelegramWebhookManager,
  url: string,
  force = false
) {
  console.log(`🔗 Setting up webhook: ${url}`);

  // Validate URL
  if (!manager.validateWebhookUrl(url)) {
    console.error("❌ Invalid webhook URL format");
    console.log("   - URL must be HTTPS in production");
    console.log("   - URL must be a valid format");
    return;
  }

  // Check current webhook
  if (!force) {
    const current = await manager.getWebhookInfo();
    if (current?.url && current.url !== url) {
      console.log(`⚠️  Current webhook: ${current.url}`);
      console.log("   Use --force to overwrite existing webhook");
      return;
    }
  }

  // Generate secret token if needed
  const secretToken =
    process.env.TELEGRAM_WEBHOOK_SECRET || manager.generateSecretToken();
  if (!process.env.TELEGRAM_WEBHOOK_SECRET) {
    console.log("🔐 Generated new secret token:");
    console.log(`   TELEGRAM_WEBHOOK_SECRET=${secretToken}`);
    console.log("   ⚠️  Add this to your .env file!");
  }

  // Set up webhook
  const success = await manager.setupWebhook(url, secretToken);

  if (success) {
    console.log("✅ Webhook configured successfully!");

    // Show health status
    const health = await manager.getHealthStatus();
    if (health.healthy) {
      console.log("🟢 Webhook is healthy");
    } else {
      console.log("🟡 Webhook has issues:");
      health.issues.forEach(issue => console.log(`   - ${issue}`));
    }
  } else {
    console.log("❌ Failed to configure webhook");
  }
}

async function deleteWebhook(manager: TelegramWebhookManager) {
  console.log("🗑️  Deleting webhook...");

  const success = await manager.deleteWebhook();

  if (success) {
    console.log("✅ Webhook deleted successfully!");
  } else {
    console.log("❌ Failed to delete webhook");
  }
}

async function showWebhookInfo(manager: TelegramWebhookManager) {
  console.log("📊 Webhook Information");
  console.log("----------------------");

  const info = await manager.getWebhookInfo();

  if (!info) {
    console.log("❌ Could not retrieve webhook information");
    return;
  }

  console.log(`URL: ${info.url || "Not set"}`);
  console.log(
    `Custom Certificate: ${info.has_custom_certificate ? "Yes" : "No"}`
  );
  console.log(`Pending Updates: ${info.pending_update_count}`);
  console.log(`Max Connections: ${info.max_connections || "Default"}`);

  if (info.allowed_updates && info.allowed_updates.length > 0) {
    console.log(`Allowed Updates: ${info.allowed_updates.join(", ")}`);
  }

  if (info.last_error_date) {
    const errorDate = new Date(info.last_error_date * 1000);
    console.log(`Last Error: ${errorDate.toISOString()}`);
    console.log(`Error Message: ${info.last_error_message}`);
  }

  // Health check
  const health = await manager.getHealthStatus();
  console.log(
    `\nHealth Status: ${health.healthy ? "🟢 Healthy" : "🔴 Issues"}`
  );

  if (!health.healthy) {
    health.issues.forEach(issue => console.log(`  - ${issue}`));
  }

  // Performance metrics
  const metrics = manager.getPerformanceMetrics();
  console.log("\n🔧 Security Features:");
  console.log(`  Rate Limiting: ${metrics.features.rateLimit ? "✅" : "❌"}`);
  console.log(
    `  Signature Verification: ${metrics.features.signatureVerification ? "✅" : "❌"}`
  );
  console.log(
    `  HTTPS Required: ${metrics.features.httpsRequired ? "✅" : "❌"}`
  );
  console.log(`  IP Filtering: ${metrics.features.ipFiltering ? "✅" : "❌"}`);
}

function generateSecretToken(manager: TelegramWebhookManager) {
  console.log("🔐 Generated Secret Token");
  console.log("-------------------------");

  const token = manager.generateSecretToken();
  console.log(`TELEGRAM_WEBHOOK_SECRET=${token}`);
  console.log("\n⚠️  Important:");
  console.log("   1. Add this to your .env file");
  console.log("   2. Keep this token secure and private");
  console.log("   3. Use this when setting up your webhook");
}

function showHelp() {
  console.log("Usage: tsx scripts/setup-telegram-webhook.ts [options]");
  console.log("");
  console.log("Options:");
  console.log("  --url <url>     Set webhook URL");
  console.log("  --delete        Delete current webhook");
  console.log("  --info          Show webhook information");
  console.log("  --generate      Generate secret token");
  console.log("  --force         Force overwrite existing webhook");
  console.log("");
  console.log("Examples:");
  console.log("  # Set webhook URL");
  console.log(
    "  tsx scripts/setup-telegram-webhook.ts --url https://yourdomain.com/api/telegram/webhook"
  );
  console.log("");
  console.log("  # Show current webhook info");
  console.log("  tsx scripts/setup-telegram-webhook.ts --info");
  console.log("");
  console.log("  # Delete webhook");
  console.log("  tsx scripts/setup-telegram-webhook.ts --delete");
  console.log("");
  console.log("  # Generate secret token");
  console.log("  tsx scripts/setup-telegram-webhook.ts --generate");
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: SetupOptions = {};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case "--url":
      options.url = args[++i];
      break;
    case "--delete":
      options.delete = true;
      break;
    case "--info":
      options.info = true;
      break;
    case "--generate":
      options.generate = true;
      break;
    case "--force":
      options.force = true;
      break;
    case "--help":
    case "-h":
      showHelp();
      process.exit(0);
      break;
    default:
      console.error(`Unknown option: ${args[i]}`);
      showHelp();
      process.exit(1);
  }
}

// Run the setup
setupWebhook(options).catch(error => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
