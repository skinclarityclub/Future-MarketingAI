const https = require("https");

const BOT_TOKEN = "7937549670:AAGczm0DCOXZ5mTBB_ZohGSiCBNT6i_Xnps";
const CHAT_ID = "6475835412";

async function sendMessage(text) {
  const data = JSON.stringify({
    chat_id: CHAT_ID,
    text: text,
    parse_mode: "HTML",
  });

  const options = {
    hostname: "api.telegram.org",
    port: 443,
    path: `/bot${BOT_TOKEN}/sendMessage`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let responseData = "";

      res.on("data", chunk => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", error => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function getUpdates() {
  const options = {
    hostname: "api.telegram.org",
    port: 443,
    path: `/bot${BOT_TOKEN}/getUpdates`,
    method: "GET",
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let responseData = "";

      res.on("data", chunk => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", error => {
      reject(error);
    });

    req.end();
  });
}

async function testBot() {
  try {
    console.log("🤖 Testing Telegram Bot...");

    // Get updates first
    console.log("\n📨 Getting updates...");
    const updates = await getUpdates();
    console.log("Updates:", JSON.stringify(updates, null, 2));

    // Send test message
    console.log("\n📤 Sending test message...");
    const result = await sendMessage(
      "🤖 <b>SKC Business Assistent Test</b>\n\nHallo! De bot werkt perfect! 🎉\n\nTyp /start voor het hoofdmenu."
    );
    console.log("Send result:", JSON.stringify(result, null, 2));

    if (result.ok) {
      console.log("\n✅ Bot test successful! Check your Telegram chat.");
    } else {
      console.log("\n❌ Bot test failed:", result.description);
    }
  } catch (error) {
    console.error("❌ Error testing bot:", error);
  }
}

testBot();
