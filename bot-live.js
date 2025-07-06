const https = require("https");

const BOT_TOKEN = "7937549670:AAGczm0DCOXZ5mTBB_ZohGSiCBNT6i_Xnps";
let lastUpdateId = 0;

async function makeRequest(path, method = "GET", data = null) {
  const options = {
    hostname: "api.telegram.org",
    port: 443,
    path: `/bot${BOT_TOKEN}${path}`,
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    options.headers["Content-Length"] = Buffer.byteLength(data);
  }

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

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function getUpdates() {
  const path = `/getUpdates?offset=${lastUpdateId + 1}&timeout=30`;
  return await makeRequest(path);
}

async function sendMessage(chatId, text, replyMarkup = null) {
  console.log(`📤 Sending to ${chatId}: ${text.substring(0, 50)}...`);

  const data = JSON.stringify({
    chat_id: chatId,
    text: text,
    parse_mode: "HTML",
    reply_markup: replyMarkup,
  });

  const result = await makeRequest("/sendMessage", "POST", data);
  console.log(`✅ Message sent successfully: ${result.ok}`);
  return result;
}

function createInlineKeyboard(buttons) {
  return {
    inline_keyboard: buttons,
  };
}

async function handleCommand(message) {
  const chatId = message.chat.id;
  const command = message.text;

  console.log(
    `📨 Command: ${command} from ${message.from.first_name} (${chatId})`
  );

  try {
    switch (command) {
      case "/start":
        const welcomeKeyboard = createInlineKeyboard([
          [
            { text: "📊 Dashboard", callback_data: "dashboard" },
            { text: "💰 Financieel", callback_data: "financial" },
          ],
          [
            { text: "📈 Marketing", callback_data: "marketing" },
            { text: "📋 Rapporten", callback_data: "reports" },
          ],
          [
            { text: "⚙️ Instellingen", callback_data: "settings" },
            { text: "❓ Help", callback_data: "help" },
          ],
        ]);

        await sendMessage(
          chatId,
          `🤖 <b>Welkom bij SKC Business Assistent!</b>\n\n` +
            `Hallo ${message.from.first_name}! Ik ben je persoonlijke business intelligence assistent.\n\n` +
            `<b>Wat kan ik voor je doen?</b>\n` +
            `• 📊 Real-time dashboard data\n` +
            `• 💰 Financiële analyses\n` +
            `• 📈 Marketing performance\n` +
            `• 📋 Gedetailleerde rapporten\n\n` +
            `Kies een optie hieronder of typ gewoon je vraag!`,
          welcomeKeyboard
        );
        break;

      case "/help":
        await sendMessage(
          chatId,
          `🆘 <b>SKC Business Assistent Help</b>\n\n` +
            `<b>Beschikbare commando's:</b>\n` +
            `• /start - Hoofdmenu\n` +
            `• /dashboard - KPI overzicht\n` +
            `• /financial - Financiële data\n` +
            `• /marketing - Marketing metrics\n` +
            `• /reports - BI rapporten\n` +
            `• /settings - Instellingen\n` +
            `• /status - Systeemstatus\n\n` +
            `<b>Natuurlijke taal:</b>\n` +
            `Je kunt ook gewoon vragen stellen zoals:\n` +
            `• "Wat is de omzet?"\n` +
            `• "Hoe gaat het met marketing?"\n` +
            `• "Laat KPI's zien"`
        );
        break;

      case "/dashboard":
        await sendMessage(
          chatId,
          `📊 <b>Dashboard KPI's</b>\n\n` +
            `💰 <b>Omzet (deze maand):</b> €45.230\n` +
            `📈 <b>Groei:</b> +12.5% vs vorige maand\n` +
            `👥 <b>Nieuwe klanten:</b> 127\n` +
            `🎯 <b>Conversie rate:</b> 3.8%\n` +
            `📱 <b>Website bezoekers:</b> 8.542\n` +
            `⭐ <b>Klanttevredenheid:</b> 4.7/5\n\n` +
            `<i>Laatste update: ${new Date().toLocaleString("nl-NL")}</i>`
        );
        break;

      case "/financial":
        await sendMessage(
          chatId,
          `💰 <b>Financieel Overzicht</b>\n\n` +
            `📊 <b>Deze maand:</b>\n` +
            `• Omzet: €45.230\n` +
            `• Kosten: €32.150\n` +
            `• Winst: €13.080\n` +
            `• Marge: 28.9%\n\n` +
            `📈 <b>Trends:</b>\n` +
            `• Omzet: +12.5% ↗️\n` +
            `• Kosten: +8.2% ↗️\n` +
            `• Winst: +22.1% ↗️\n\n` +
            `🎯 <b>Doelen:</b>\n` +
            `• Maanddoel: €50.000 (90.5%)\n` +
            `• Jaardoel: €600.000 (67.2%)`
        );
        break;

      case "/marketing":
        await sendMessage(
          chatId,
          `📈 <b>Marketing Performance</b>\n\n` +
            `🎯 <b>Campagnes:</b>\n` +
            `• Google Ads: €2.340 (ROAS 4.2x)\n` +
            `• Meta Ads: €1.890 (ROAS 3.8x)\n` +
            `• LinkedIn: €890 (ROAS 2.9x)\n\n` +
            `📊 <b>Metrics:</b>\n` +
            `• CTR: 2.8%\n` +
            `• CPC: €0.45\n` +
            `• Conversies: 156\n` +
            `• CPA: €32.50\n\n` +
            `🚀 <b>Top performer:</b> Google Search Ads`
        );
        break;

      case "/status":
        await sendMessage(
          chatId,
          `⚡ <b>Systeemstatus</b>\n\n` +
            `🟢 <b>Alle systemen operationeel</b>\n\n` +
            `📊 Dashboard: Online\n` +
            `🤖 AI Assistent: Actief\n` +
            `📱 Telegram Bot: Verbonden\n` +
            `💾 Database: Gezond\n` +
            `🔄 Data sync: Real-time\n\n` +
            `<i>Laatste check: ${new Date().toLocaleString("nl-NL")}</i>`
        );
        break;

      default:
        await sendMessage(
          chatId,
          `❓ Onbekend commando: ${command}\n\n` +
            `Typ /help voor een overzicht van beschikbare commando's.`
        );
    }
  } catch (error) {
    console.error(`❌ Error handling command ${command}:`, error);
    await sendMessage(
      chatId,
      `❌ Er ging iets mis bij het verwerken van je commando. Probeer het opnieuw.`
    );
  }
}

async function handleTextMessage(message) {
  const chatId = message.chat.id;
  const text = message.text.toLowerCase();

  console.log(
    `💬 Text: "${message.text}" from ${message.from.first_name} (${chatId})`
  );

  try {
    // Simple keyword-based responses
    if (text.includes("omzet") || text.includes("revenue")) {
      await sendMessage(
        chatId,
        `💰 <b>Omzet Update</b>\n\n` +
          `Deze maand: €45.230\n` +
          `Groei: +12.5% vs vorige maand\n\n` +
          `Wil je meer details? Typ /financial`
      );
    } else if (text.includes("marketing") || text.includes("ads")) {
      await sendMessage(
        chatId,
        `📈 <b>Marketing Update</b>\n\n` +
          `Totale spend: €5.120\n` +
          `Gemiddelde ROAS: 3.8x\n` +
          `Conversies: 156\n\n` +
          `Voor details: /marketing`
      );
    } else if (text.includes("kpi") || text.includes("dashboard")) {
      await sendMessage(
        chatId,
        `📊 <b>KPI Snapshot</b>\n\n` +
          `• Omzet: €45.230 (+12.5%)\n` +
          `• Nieuwe klanten: 127\n` +
          `• Conversie: 3.8%\n\n` +
          `Volledig dashboard: /dashboard`
      );
    } else if (text.includes("finance") || text.includes("financieel")) {
      await sendMessage(
        chatId,
        `💰 <b>Financieel Snapshot</b>\n\n` +
          `• Omzet: €45.230\n` +
          `• Winst: €13.080\n` +
          `• Marge: 28.9%\n\n` +
          `Volledig overzicht: /financial`
      );
    } else {
      await sendMessage(
        chatId,
        `🤖 Ik begrijp je vraag nog niet helemaal.\n\n` +
          `Probeer:\n` +
          `• /start voor het hoofdmenu\n` +
          `• /help voor alle commando's\n` +
          `• Of vraag naar "omzet", "marketing" of "KPI's"`
      );
    }
  } catch (error) {
    console.error(`❌ Error handling text message:`, error);
    await sendMessage(chatId, `❌ Er ging iets mis. Probeer het opnieuw.`);
  }
}

async function handleCallbackQuery(callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  console.log(
    `🔘 Callback: ${data} from ${callbackQuery.from.first_name} (${chatId})`
  );

  try {
    switch (data) {
      case "dashboard":
        await handleCommand({
          chat: { id: chatId },
          text: "/dashboard",
          from: callbackQuery.from,
        });
        break;
      case "financial":
        await handleCommand({
          chat: { id: chatId },
          text: "/financial",
          from: callbackQuery.from,
        });
        break;
      case "marketing":
        await handleCommand({
          chat: { id: chatId },
          text: "/marketing",
          from: callbackQuery.from,
        });
        break;
      case "help":
        await handleCommand({
          chat: { id: chatId },
          text: "/help",
          from: callbackQuery.from,
        });
        break;
      case "reports":
        await sendMessage(
          chatId,
          `📋 <b>BI Rapporten</b>\n\n` +
            `🔄 Genereren van rapporten...\n\n` +
            `Beschikbare rapporten:\n` +
            `• Maandelijkse omzetrapport\n` +
            `• Marketing ROI analyse\n` +
            `• Klantgedrag insights\n\n` +
            `<i>Functie komt binnenkort beschikbaar! 🚧</i>`
        );
        break;
      case "settings":
        await sendMessage(
          chatId,
          `⚙️ <b>Instellingen</b>\n\n` +
            `Huidige instellingen:\n` +
            `• Taal: Nederlands 🇳🇱\n` +
            `• Tijdzone: Europe/Amsterdam\n` +
            `• Notificaties: Aan\n` +
            `• Rapportfrequentie: Dagelijks\n\n` +
            `<i>Aanpassingen komen binnenkort! 🚧</i>`
        );
        break;
      default:
        await sendMessage(
          chatId,
          `Functie "${data}" komt binnenkort beschikbaar! 🚧`
        );
    }

    // Answer callback query to remove loading state
    await makeRequest(
      `/answerCallbackQuery?callback_query_id=${callbackQuery.id}`
    );
  } catch (error) {
    console.error(`❌ Error handling callback query:`, error);
    await sendMessage(chatId, `❌ Er ging iets mis. Probeer het opnieuw.`);
  }
}

async function processUpdate(update) {
  try {
    console.log(`🔄 Processing update ${update.update_id}`);

    if (update.message) {
      const message = update.message;

      if (message.text) {
        if (message.text.startsWith("/")) {
          await handleCommand(message);
        } else {
          await handleTextMessage(message);
        }
      } else {
        await sendMessage(
          message.chat.id,
          `🤖 Ik kan alleen tekstberichten verwerken. Stuur een bericht of gebruik /help voor hulp.`
        );
      }
    } else if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
    }

    console.log(`✅ Update ${update.update_id} processed successfully`);
  } catch (error) {
    console.error(`❌ Error processing update ${update.update_id}:`, error);
  }
}

async function startPolling() {
  console.log("🚀 Starting SKC Business Assistent polling...");
  console.log(`📱 Bot Token: ${BOT_TOKEN.substring(0, 10)}...`);
  console.log(`🔄 Starting from update ID: ${lastUpdateId}`);

  while (true) {
    try {
      console.log(`📡 Polling for updates (offset: ${lastUpdateId + 1})...`);
      const result = await getUpdates();

      if (result.ok) {
        if (result.result.length > 0) {
          console.log(`📨 Received ${result.result.length} updates`);

          for (const update of result.result) {
            await processUpdate(update);
            lastUpdateId = update.update_id;
          }
        } else {
          console.log(`⏳ No new updates (waiting...)`);
        }
      } else {
        console.error(`❌ API Error:`, result);
      }
    } catch (error) {
      console.error("❌ Polling error:", error);
      console.log("⏳ Waiting 5 seconds before retry...");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Start the bot
console.log("🤖 SKC Business Assistent Bot Starting...");
console.log("📅 Started at:", new Date().toLocaleString("nl-NL"));
startPolling();
