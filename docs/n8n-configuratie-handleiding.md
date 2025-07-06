# n8n Configuratie Handleiding

## Dashboard Integratie Setup Guide

### 📋 Overzicht

Dit document beschrijft alle stappen die je moet uitvoeren aan de n8n kant om de volledige integratie met het SKC BI Dashboard te voltooien. De dashboard implementatie is al klaar en wacht op jouw n8n configuratie.

---

## 🚀 **Stap 1: Basis n8n Installatie & Setup**

### 1.1 n8n Installeren

```bash
# Via NPM (globaal)
npm install n8n -g

# Via Docker (aanbevolen voor productie)
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### 1.2 Basis Configuratie

Maak een `.env` bestand in je n8n directory:

```bash
# n8n Basis Configuratie
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=http

# Database (voor productie)
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=localhost
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n
DB_POSTGRESDB_PASSWORD=your_password

# API & Security
N8N_API_KEY=your_secure_api_key_here
WEBHOOK_URL=http://localhost:5678

# Dashboard Integratie URLs
DASHBOARD_WEBHOOK_URL=http://localhost:3000/api/webhooks/n8n
DASHBOARD_API_URL=http://localhost:3000/api

# Security
N8N_WEBHOOK_SECRET=your_webhook_secret_here
```

---

## 🔗 **Stap 2: Dashboard Webhook Configuratie**

### 2.1 Webhook Endpoint Registreren

Het dashboard verwacht webhooks op het volgende endpoint:

```
POST http://localhost:3000/api/webhooks/n8n
```

### 2.2 Webhook Headers Configureren

Alle webhooks naar het dashboard moeten de volgende headers bevatten:

```javascript
{
  "Content-Type": "application/json",
  "x-n8n-signature": "sha256=<calculated_hmac_signature>",
  "User-Agent": "n8n-webhook/1.0"
}
```

### 2.3 Webhook Payload Format

Het dashboard verwacht de volgende JSON structuur:

```json
{
  "workflowId": "string",
  "executionId": "string",
  "execution": {
    "id": "string",
    "status": "success|error|running|cancelled",
    "mode": "webhook|manual|trigger",
    "startedAt": "ISO_timestamp",
    "stoppedAt": "ISO_timestamp",
    "workflowData": {}
  },
  "workflow": {
    "id": "string",
    "name": "string",
    "active": boolean,
    "nodes": []
  },
  "data": {
    "main": [
      {
        "json": {
          // Your workflow output data
        }
      }
    ]
  },
  "timestamp": "ISO_timestamp"
}
```

---

## ⚙️ **Stap 3: Workflow Templates Setup**

### 3.1 Email Automation Workflow

Maak een nieuwe workflow in n8n met:

**Workflow ID:** `email-automation-001`

**Nodes:**

1. **Webhook Trigger Node**

   - URL: `http://localhost:5678/webhook/email-automation`
   - HTTP Method: POST
   - Response Mode: "When Last Node Finishes"

2. **Function Node** (Data Processing)

   ```javascript
   // Process incoming data
   const inputData = $input.first().json;

   return [
     {
       json: {
         recipient: inputData.email,
         subject: `Welcome ${inputData.name}!`,
         template: "welcome_email",
         data: inputData,
         timestamp: new Date().toISOString(),
       },
     },
   ];
   ```

3. **Email Node** (Send Email)

   - Configure met je email provider
   - Use data from Function node

4. **HTTP Request Node** (Dashboard Webhook)
   - URL: `http://localhost:3000/api/webhooks/n8n`
   - Method: POST
   - Headers:
     ```json
     {
       "Content-Type": "application/json",
       "x-n8n-signature": "={{$env.N8N_WEBHOOK_SECRET}}"
     }
     ```
   - Body:
     ```json
     {
       "workflowId": "email-automation-001",
       "executionId": "={{$execution.id}}",
       "execution": {
         "id": "={{$execution.id}}",
         "status": "success",
         "mode": "={{$execution.mode}}"
       },
       "data": {
         "emailSent": true,
         "recipient": "={{$node.Function.json.recipient}}",
         "timestamp": "={{$now}}"
       }
     }
     ```

### 3.2 Social Media Workflow

**Workflow ID:** `social-media-automation-001`

**Trigger Setup:**

- Cron Expression: `0 9 * * *` (dagelijks om 9:00)
- Of webhook trigger voor on-demand posting

**Nodes:**

1. **Schedule/Webhook Trigger**
2. **Dashboard Data Fetch** (HTTP Request)

   - URL: `http://localhost:3000/api/marketing/content-performance`
   - Method: GET
   - Headers: Authorization indien nodig

3. **Content Generation Function**
4. **Social Media Platform Nodes** (Twitter, LinkedIn, etc.)
5. **Dashboard Notification** (HTTP Request naar webhook)

### 3.3 Customer Intelligence Workflow

**Workflow ID:** `customer-intelligence-001`

**Real-time Customer Data Sync:**

1. **Webhook Trigger** voor customer events
2. **Data Transformation Function**
3. **Dashboard API Update**
   - URL: `http://localhost:3000/api/customer-intelligence/sync`
   - Method: POST

---

## 🔄 **Stap 4: Bidirectionele Data Sync Setup**

### 4.1 Dashboard → n8n Webhooks

Configureer n8n om webhooks te ontvangen van het dashboard:

**Webhook URL:** `http://localhost:5678/webhook/dashboard`

**Expected Payload van Dashboard:**

```json
{
  "event": "user_signup|data_update|campaign_trigger",
  "data": {
    "userId": "string",
    "email": "string",
    "name": "string",
    "customData": {}
  },
  "metadata": {
    "source": "dashboard",
    "timestamp": "ISO_timestamp",
    "triggeredBy": "user|system|schedule"
  }
}
```

### 4.2 Data Sync Workflow Template

```javascript
// n8n Function Node voor data synchronisatie
const incomingData = $input.first().json;

// Transform data voor n8n verwerking
const transformedData = {
  customer: {
    id: incomingData.data.userId,
    email: incomingData.data.email,
    name: incomingData.data.name,
    lastUpdated: new Date().toISOString(),
  },
  event: incomingData.event,
  processedAt: new Date().toISOString(),
};

// Return transformed data voor volgende nodes
return [{ json: transformedData }];
```

---

## 📊 **Stap 5: Real-time Monitoring Setup**

### 5.1 Execution Status Webhooks

Configureer automatische status updates naar dashboard:

**Voor elke workflow, voeg toe aan het einde:**

```javascript
// HTTP Request Node Configuration
{
  "url": "http://localhost:3000/api/webhooks/n8n",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "x-n8n-signature": "sha256={{$env.WEBHOOK_SECRET_HASH}}"
  },
  "body": {
    "workflowId": "={{$workflow.id}}",
    "executionId": "={{$execution.id}}",
    "execution": {
      "id": "={{$execution.id}}",
      "status": "={{$execution.finished ? 'completed' : 'running'}}",
      "startedAt": "={{$execution.startedAt}}",
      "stoppedAt": "={{$execution.stoppedAt}}",
      "duration": "={{$execution.duration}}"
    },
    "workflow": {
      "id": "={{$workflow.id}}",
      "name": "={{$workflow.name}}",
      "active": "={{$workflow.active}}"
    },
    "timestamp": "={{$now}}"
  }
}
```

### 5.2 Error Handling & Alerts

Voor elke workflow, configureer error handling:

1. **Error Trigger Node**
   - Trigger: "On workflow error"
2. **Function Node** (Error Processing)

   ```javascript
   const error = $input.first().json;

   return [
     {
       json: {
         workflowId: "={{$workflow.id}}",
         executionId: "={{$execution.id}}",
         execution: {
           id: "={{$execution.id}}",
           status: "failed",
           error: {
             message: error.message,
             stack: error.stack,
             node: error.node,
           },
         },
         timestamp: new Date().toISOString(),
       },
     },
   ];
   ```

3. **HTTP Request Node** (Error Notification)
   - URL: `http://localhost:3000/api/webhooks/n8n`
   - Payload: Error data van Function node

---

## 🔐 **Stap 6: Security & Authentication**

### 6.1 HMAC Signature Verification

Het dashboard verifieert webhook signatures. Configureer in n8n:

```javascript
// Function node voor signature generatie
const crypto = require("crypto");
const secret = $env.N8N_WEBHOOK_SECRET;
const payload = JSON.stringify($input.first().json);

const signature = crypto
  .createHmac("sha256", secret)
  .update(payload)
  .digest("hex");

return [
  {
    json: {
      signature: `sha256=${signature}`,
      payload: $input.first().json,
    },
  },
];
```

### 6.2 API Key Configuration

Configureer API keys voor dashboard communicatie:

**In n8n environment:**

```bash
DASHBOARD_API_KEY=your_dashboard_api_key
```

**In HTTP Request nodes:**

```json
{
  "headers": {
    "Authorization": "Bearer {{$env.DASHBOARD_API_KEY}}",
    "Content-Type": "application/json"
  }
}
```

---

## 📈 **Stap 7: Workflow Performance Monitoring**

### 7.1 Metrics Collection Workflow

Maak een workflow voor metrics verzameling:

**Workflow ID:** `metrics-collector-001`
**Schedule:** Elke 5 minuten

```javascript
// Function Node: Collect Workflow Metrics
const workflows = [
  "email-automation-001",
  "social-media-automation-001",
  "customer-intelligence-001",
];

const metrics = [];

for (const workflowId of workflows) {
  // Get execution stats (mock voor demo)
  const stats = {
    workflowId: workflowId,
    executionCount: Math.floor(Math.random() * 100),
    successRate: Math.random() * 100,
    averageDuration: Math.floor(Math.random() * 5000),
    lastExecution: new Date().toISOString(),
    timestamp: new Date().toISOString(),
  };

  metrics.push(stats);
}

return [{ json: { metrics } }];
```

### 7.2 Dashboard Metrics Push

```javascript
// HTTP Request naar dashboard
{
  "url": "http://localhost:3000/api/workflows/metrics",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer {{$env.DASHBOARD_API_KEY}}"
  },
  "body": "={{$json.metrics}}"
}
```

---

## 🧪 **Stap 8: Testing & Validatie**

### 8.1 Webhook Test Workflow

Maak een test workflow:

1. **Manual Trigger**
2. **Function Node** (Test Data Generation)

   ```javascript
   return [
     {
       json: {
         testType: "webhook_validation",
         workflowId: "test-workflow-001",
         executionId: `test-${Date.now()}`,
         timestamp: new Date().toISOString(),
         data: {
           message: "Test webhook from n8n",
           success: true,
         },
       },
     },
   ];
   ```

3. **HTTP Request** (naar dashboard webhook)

### 8.2 Validatie Checklist

- [ ] Webhook endpoints bereikbaar
- [ ] HMAC signatures worden correct gegenereerd
- [ ] Dashboard ontvangt en verwerkt webhooks
- [ ] Bidirectionele data sync werkt
- [ ] Error handling functioneert
- [ ] Metrics worden verzameld
- [ ] Real-time monitoring actief

---

## 🚨 **Troubleshooting**

### Veel Voorkomende Problemen:

**1. Webhook Signature Verification Failed**

```bash
# Check je webhook secret in beide systemen
echo $N8N_WEBHOOK_SECRET
# Moet overeenkomen met dashboard .env
```

**2. Connection Refused Errors**

```bash
# Check of dashboard server draait
curl http://localhost:3000/api/health

# Check n8n availability
curl http://localhost:5678/api/v1/workflows
```

**3. CORS Issues**
In n8n settings, voeg toe:

```javascript
N8N_CORS_ORIGIN = "http://localhost:3000";
```

**4. Database Connection Issues**
Check Supabase connectiviteit vanuit n8n:

```bash
# Test database connection
curl -X GET "your_supabase_url/rest/v1/webhook_events" \
  -H "apikey: your_anon_key"
```

---

## 📞 **Support & Next Steps**

### Dashboard API Endpoints voor Integratie:

- **Webhook ontvangst:** `POST /api/webhooks/n8n`
- **Workflow status:** `GET /api/marketing/n8n-workflows`
- **Data sync:** `POST /api/workflows/data-sync`
- **Metrics:** `POST /api/workflows/metrics`

### Productie Configuratie:

1. Update alle localhost URLs naar productie URLs
2. Configureer SSL certificaten
3. Setup database backups
4. Implementeer monitoring & alerting
5. Configure load balancing indien nodig

### Monitoring Dashboard:

Na configuratie kun je de integratie monitoren via:

- `http://localhost:3000/workflows/data-sync`
- `http://localhost:3000/marketing-automation`
- Real-time logs in Supabase database

---

## ✅ **Completion Checklist**

- [ ] n8n geïnstalleerd en geconfigureerd
- [ ] Environment variables ingesteld
- [ ] Webhook endpoints geconfigureerd
- [ ] Email automation workflow aangemaakt
- [ ] Social media workflow aangemaakt
- [ ] Customer intelligence workflow aangemaakt
- [ ] Bidirectionele sync geconfigureerd
- [ ] Real-time monitoring setup
- [ ] Security/authentication geconfigureerd
- [ ] Performance monitoring workflow
- [ ] Test workflows uitgevoerd
- [ ] Dashboard connectie gevalideerd

**🎉 Na voltooiing van deze stappen is de volledige n8n integratie operationeel!**
