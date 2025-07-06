# Task 62: Error Handling Master Control - Setup Guide

## 🚨 Probleem Oplossing: 404 Errors

Je krijgt deze 404 errors omdat de N8N environment variabelen niet correct zijn geconfigureerd:

```
GET /api/metrics/infrastructure?range=2h 404 in 169ms
GET /api/workflows?action=stats 404 in 188ms
GET /api/workflows?action=health 404 in 181ms
```

## ✅ Oplossing

### Stap 1: Maak .env.local bestand aan

Maak een `.env.local` bestand in de root van je project met de volgende inhoud:

```env
# Supabase Configuration (waarschijnlijk al ingesteld)
NEXT_PUBLIC_SUPABASE_URL=https://jjotjnxmrfycjhqzxepb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqb3RqbnhtcmZ5Y2pocXp4ZXBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk4Mzc1OSwiZXhwIjoyMDUwNTU5NzU5fQ.X1H78uM0d3j0C2WMjWZWpN9pNhLOaxnB_JoVVEjmLdA

# N8N Configuration (Dit moet je toevoegen/updaten)
N8N_BASE_URL=https://skc-marketing-manager.app.n8n.cloud/api/v1
N8N_WEBHOOK_URL=https://skc-marketing-manager.app.n8n.cloud/webhook
N8N_API_KEY=YOUR_N8N_API_KEY_HIER
N8N_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET_HIER

# AI Configuration (optioneel maar aanbevolen)
OPENAI_API_KEY=sk-your-openai-api-key-here
PERPLEXITY_API_KEY=pplx-your-perplexity-api-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Stap 2: N8N API Key verkrijgen

1. **Login naar je N8N Cloud account**: https://skc-marketing-manager.app.n8n.cloud
2. **Ga naar Settings** → **API**
3. **Genereer een nieuwe API Key**
4. **Kopieer de key** en plak hem in je `.env.local` bestand

### Stap 3: Webhook Secret instellen

1. **Genereer een veilige webhook secret** (bijv. via: `openssl rand -hex 32`)
2. **Voeg deze toe aan je `.env.local`**
3. **Gebruik dezelfde secret in je N8N webhooks**

### Stap 4: Server herstarten

Na het aanmaken/updaten van `.env.local`:

```bash
# Stop de huidige server (Ctrl+C)
# Start opnieuw
npm run dev
```

## 🔧 Configuratie Test

Na het instellen van de environment variabelen, test de configuratie:

```bash
# Test de configuratie
curl http://localhost:3000/api/error-handling/config-test
```

Je zou een response moeten krijgen die laat zien welke configuraties ✅ zijn ingesteld en welke ❌ ontbreken.

## 🎯 Verwachte Resultaten

Na het correct instellen van de environment variabelen:

- ✅ `/api/workflows?action=health` geeft N8N status terug
- ✅ `/api/workflows?action=stats` geeft workflow statistieken terug
- ✅ `/api/metrics/infrastructure?range=2h` geeft infrastructure metrics terug
- ✅ Geen 404 errors meer in de terminal

## 🛠 Error Handling Features (Task 62)

Met de juiste configuratie krijg je toegang tot:

### 1. Intelligent Error Detection

- Automatische error categorisering (API_ERROR, NETWORK_ERROR, etc.)
- Severity level assignment (low, medium, high, critical)
- Pattern-based error recognition

### 2. Automatic Recovery

- Retry mechanisms met exponential backoff
- Circuit breaker patterns voor external services
- Fallback endpoints bij service failures
- Graceful degradation strategies

### 3. Comprehensive Logging

- Structured error logging met timestamps
- Error categorization en context tracking
- Complete audit trail voor troubleshooting
- Integration met monitoring systems

### 4. Proactive Monitoring

- Real-time health checks (elke 30 seconden)
- Performance metrics collection
- Alert thresholds voor error rates
- Automatic escalation workflows

### 5. Configuration Management

- Environment validation
- Service availability checks
- Fallback data provision
- Configuration recommendations

## 🚨 Troubleshooting

### Probleem: Nog steeds 404 errors

**Oplossing**: Controleer of:

- `.env.local` bestand in de root directory staat
- Alle environment variabelen correct zijn ingesteld
- Server opnieuw is gestart na het aanmaken van `.env.local`
- N8N API key geldig is

### Probleem: N8N connection errors

**Oplossing**: Controleer of:

- N8N_BASE_URL correct is (moet eindigen op `/api/v1`)
- N8N_API_KEY geldig is en toegang heeft
- N8N instance bereikbaar is via internet

### Probleem: Webhook errors

**Oplossing**: Controleer of:

- N8N_WEBHOOK_SECRET consistent is tussen dashboard en N8N
- Webhook URLs correct zijn geconfigureerd
- HTTPS gebruikt wordt voor productie webhooks

## 🎉 Success!

Als alles correct is ingesteld, zie je in de terminal:

```
✅ N8N connection established
✅ Workflows API responsive
✅ Infrastructure metrics available
✅ Error handling system active
```

En de 404 errors zijn verdwenen! 🎊
