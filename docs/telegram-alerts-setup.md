# Telegram Alerts Integration - SKC BI Dashboard

## Overview

Het SKC BI Dashboard kan **ALLE alerts via Telegram versturen**! Deze gids laat zien hoe je dit configureert voor volledige mobile monitoring.

## 🎯 Features

- ✅ **Alle alert types** (Critical, Warning, Info, SLA breaches)
- ✅ **Mobile-optimized** formatting met emoji's
- ✅ **Smart routing** naar verschillende Telegram kanalen
- ✅ **Real-time** notifications op je telefoon
- ✅ **Fallback** naar PagerDuty en Slack voor critical alerts
- ✅ **Nederlandse tijdzone** formatting
- ✅ **Direct links** naar dashboards

## 📱 Telegram Setup

### Stap 1: Telegram Bot Maken

1. Open Telegram en zoek naar `@BotFather`
2. Start een chat en gebruik `/newbot`
3. Kies een naam en username voor je bot
4. Kopieer het **Bot Token** die je krijgt

```
Bot Token voorbeeld: 1234567890:AABBCCDDEEFFGGHHIIJJKKLLMMNNOOPPQQRr
```

### Stap 2: Telegram Kanalen/Groepen Maken

Maak deze kanalen voor verschillende alert types:

1. **SKC Critical Alerts** - Voor kritieke problemen
2. **SKC Warning Alerts** - Voor warnings
3. **SKC Info Alerts** - Voor informatieve alerts
4. **SKC SLA Alerts** - Voor SLA schendingen

### Stap 3: Chat IDs Verkrijgen

Voor elk kanaal/groep:

1. Voeg je bot toe als admin
2. Stuur een bericht naar het kanaal
3. Gebruik deze URL in je browser:
   ```
   https://api.telegram.org/bot{BOT_TOKEN}/getUpdates
   ```
4. Zoek naar `"chat":{"id":-1001234567890}` in de response
5. Het getal na `"id":` is je Chat ID

## ⚙️ Environment Variables

Voeg deze variabelen toe aan je `.env` file:

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=1234567890:AABBCCDDEEFFGGHHIIJJKKLLMMNNOOPPQQRr

# Telegram Channel Chat IDs
TELEGRAM_CRITICAL_CHAT_ID=-1001234567890
TELEGRAM_WARNING_CHAT_ID=-1001234567891
TELEGRAM_INFO_CHAT_ID=-1001234567892
TELEGRAM_SLA_CHAT_ID=-1001234567893

# Optional: Webhook Security
TELEGRAM_WEBHOOK_SECRET=your-secure-token-here
```

## 🔄 Alertmanager Configuration

### Gebruik de Telegram Configuration

Vervang je huidige `alertmanager.yml` met:

```bash
cp monitoring/alertmanager/alertmanager-telegram.yml monitoring/alertmanager/alertmanager.yml
```

### Update Templates

Zorg dat de Telegram templates geladen worden:

```bash
# Templates zijn al gemaakt in:
# monitoring/alertmanager/templates/telegram.tmpl
```

## 🚀 Deployment

### Docker Compose Update

1. **Start Alertmanager opnieuw** met nieuwe config:

   ```bash
   docker-compose down alertmanager
   docker-compose up -d alertmanager
   ```

2. **Verifieer configuratie**:

   ```bash
   docker exec alertmanager amtool config show
   ```

3. **Test webhook endpoint**:
   ```bash
   curl -X GET http://localhost:3000/api/telegram/alerts
   ```

### Next.js API Routes

De Telegram webhook API is automatisch beschikbaar op:

```
http://localhost:3000/api/telegram/alerts
```

## 📋 Alert Routing Logic

| Alert Type     | Telegram   | Slack  | PagerDuty | Email  |
| -------------- | ---------- | ------ | --------- | ------ |
| **Critical**   | ✅ Instant | ✅ Yes | ✅ Yes    | ✅ Yes |
| **SLA Breach** | ✅ Instant | ✅ Yes | ✅ Yes    | ✅ Yes |
| **Warning**    | ✅ Yes     | ✅ Yes | ❌ No     | ✅ Yes |
| **Info**       | ✅ Yes     | ❌ No  | ❌ No     | ❌ No  |

## 📱 Telegram Alert Examples

### Critical Alert

```
🚨🚨 CRITICAL ALERT 🚨🚨

⚡ IMMEDIATE ACTION REQUIRED ⚡

Service: skc-bi-dashboard
Environment: production

🔥 Critical Issue: Application Down
📋 Description: SKC BI Dashboard is unreachable
🖥️ Affected Instance: web-server-01
⏰ Started: 14:23:15 02-01-2025

⚠️ SLA IMPACT WARNING ⚠️
This may affect our 99.99% uptime commitment!

🚀 Emergency Actions:
• 🎯 Live Dashboard
• 📊 Grafana Alerts
• 🚨 Alertmanager
• 📞 On-Call Escalation

Team: @critical-response-team
```

### Warning Alert

```
⚠️ WARNING ALERT ⚠️

Service: postgresql
Severity: Warning Level

⚠️ Issue: High Connection Count
📋 Details: Connection pool usage above 80%
🖥️ Instance: db-server-01
⏰ Detected: 14:25 02-01-2025

📊 Monitoring:
This is a warning-level alert requiring attention but not immediately critical.

🔗 Investigation Tools:
• 📊 Grafana
• 🔍 Logs
• ⚡ Metrics
```

## 🧪 Testing

### Test Webhook Endpoint

```bash
curl -X POST http://localhost:3000/api/telegram/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "status": "firing",
    "groupLabels": {
      "alertname": "TestAlert",
      "service": "test-service",
      "severity": "critical"
    },
    "commonAnnotations": {
      "summary": "Test alert from curl",
      "description": "This is a test to verify Telegram integration"
    },
    "alerts": [{
      "status": "firing",
      "labels": {"severity": "critical"},
      "annotations": {
        "summary": "Test alert",
        "description": "Testing Telegram webhook"
      },
      "startsAt": "2025-01-02T14:30:00Z"
    }]
  }'
```

### Send Test Alert via Alertmanager

```bash
docker exec alertmanager amtool alert add \
  alertname="TelegramTest" \
  service="test" \
  severity="warning" \
  summary="Testing Telegram integration" \
  description="This is a test alert"
```

## 🔧 Troubleshooting

### Bot Token Issues

- ✅ Controleer of token correct is gekopieerd
- ✅ Verifieer bot is aangemaakt via @BotFather
- ✅ Test bot token: `https://api.telegram.org/bot{TOKEN}/getMe`

### Chat ID Issues

- ✅ Controleer of bot toegevoegd is aan kanaal/groep
- ✅ Bot moet admin rights hebben
- ✅ Chat ID begint met `-` voor groepen/kanalen

### Webhook Niet Werkend

- ✅ Controleer Next.js applicatie draait op port 3000
- ✅ Test API endpoint: `GET http://localhost:3000/api/telegram/alerts`
- ✅ Controleer Docker network connectivity

### Geen Berichten Ontvangen

- ✅ Verifieer environment variables zijn geladen
- ✅ Check Alertmanager config syntax: `amtool config show`
- ✅ Test met simpele curl command (zie boven)

## 📊 Monitoring & Analytics

### Telegram Alert Statistics

Je kunt Telegram alert statistics bekijken via:

- **Grafana Dashboard**: `http://grafana.localhost:3000/d/telegram-alerts`
- **Alertmanager**: `http://alertmanager.localhost:9093`
- **Application Logs**: Next.js console logs

### Alert Response Metrics

Monitor deze KPIs:

- ⏱️ **Time to Acknowledge** - Hoe snel worden alerts gezien
- 📱 **Mobile Response Rate** - % alerts bekeken via Telegram
- 🔄 **Alert Resolution Time** - Van alert tot oplossing
- 📈 **False Positive Rate** - Alerts die geen actie vereisten

## 🎯 Best Practices

### Channel Management

- 🎯 **Critical Channel**: Alleen on-call team
- ⚠️ **Warning Channel**: Hele development team
- ℹ️ **Info Channel**: Optioneel, voor debugging
- 🚨 **SLA Channel**: Management + senior engineers

### Notification Hygiene

- 🔕 **Mute** info channels tijdens kantooruren
- 📱 **Critical alerts** altijd onmiddelijke notificatie
- ⏰ **Maintenance windows** gebruik speciale templates
- 🔄 **Auto-resolve** berichten bij herstel

### Security

- 🔒 **Private channels** voor sensitive alerts
- 🛡️ **Bot permissions** minimaal houden
- 🔑 **Webhook secrets** gebruiken voor authenticatie
- 📋 **Access logs** monitoren

## 🚀 Advanced Features

### Custom Alert Routing

Voeg custom routing toe in `alertmanager-telegram.yml`:

```yaml
routes:
  - match:
      service: "payment-system"
    receiver: "payment-critical-telegram"
    group_wait: 0s
```

### Alert Aggregation

Voor high-volume alerts:

```yaml
route:
  group_by: ["alertname", "service"]
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
```

### Rich Message Formatting

Telegram ondersteunt Markdown formatting:

- **Bold text**: `**tekst**`
- _Italic text_: `*tekst*`
- `Code blocks`: `` `code` ``
- [Links](url): `[tekst](https://url)`

## ✅ Conclusie

**Ja, alle alerts kunnen via Telegram!** 📱

Deze setup geeft je:

- ✅ **Complete mobile monitoring**
- ✅ **Instant notifications** op je telefoon
- ✅ **Smart routing** per alert type
- ✅ **Fallback channels** voor reliability
- ✅ **Nederlandse tijd** formatting
- ✅ **Direct dashboard links**

**Volgende stappen:**

1. Setup Telegram bot en kanalen
2. Update environment variables
3. Deploy nieuwe Alertmanager config
4. Test met curl command
5. Geniet van mobile monitoring! 🎉

---

**Support**: Voor vragen over deze setup, check de troubleshooting sectie of maak een issue aan in het project repository.
