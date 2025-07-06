# n8n Quick Start Checklist

## Voor SKC BI Dashboard Integratie

### ⚡ **Minimale Setup (15 minuten)**

#### 1. **Installatie & Start** (2 min)

```bash
# Quick Docker start
docker run -d --name n8n -p 5678:5678 n8nio/n8n

# Of NPM
npm install n8n -g && n8n start
```

#### 2. **Environment Variables** (3 min)

Maak `.env` bestand:

```bash
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_API_KEY=your_secure_api_key_123
N8N_WEBHOOK_SECRET=your_webhook_secret_456
DASHBOARD_WEBHOOK_URL=http://localhost:3000/api/webhooks/n8n
```

#### 3. **Test Webhook Workflow** (10 min)

Maak nieuwe workflow in n8n interface:

**Nodes volgorde:**

1. **Webhook Trigger**

   - URL: `http://localhost:5678/webhook/test`
   - Method: POST

2. **Function Node**

   ```javascript
   return [
     {
       json: {
         workflowId: "test-001",
         executionId: $execution.id,
         execution: {
           id: $execution.id,
           status: "success",
         },
         timestamp: new Date().toISOString(),
       },
     },
   ];
   ```

3. **HTTP Request Node**
   - URL: `http://localhost:3000/api/webhooks/n8n`
   - Method: POST
   - Headers: `{"Content-Type": "application/json"}`
   - Body: `{{$json}}`

**Test:** Activeer workflow → Test webhook → Check dashboard logs

---

### 🔥 **Productie Ready Setup (30 minuten)**

#### 4. **Email Automation Workflow** (10 min)

- Workflow ID: `email-automation-001`
- Webhook URL: `http://localhost:5678/webhook/email`
- Nodes: Webhook → Function → Email → Dashboard Notification

#### 5. **Dashboard Status Updates** (10 min)

Voeg aan elke workflow toe:

```javascript
// Final HTTP Request Node
{
  "url": "http://localhost:3000/api/webhooks/n8n",
  "method": "POST",
  "body": {
    "workflowId": "{{$workflow.id}}",
    "executionId": "{{$execution.id}}",
    "execution": {
      "status": "{{$execution.finished ? 'completed' : 'running'}}"
    }
  }
}
```

#### 6. **Error Handling** (10 min)

Voor elke workflow:

- Voeg "Error Trigger" node toe
- Connect naar HTTP Request (dashboard notification)
- Payload: error details + workflow info

---

### ✅ **Verificatie Tests**

#### Test 1: Basic Connectivity

```bash
# Test n8n API
curl http://localhost:5678/api/v1/workflows

# Test dashboard webhook
curl -X POST http://localhost:3000/api/webhooks/n8n \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

#### Test 2: Workflow Execution

1. Activeer test workflow in n8n
2. Trigger via webhook URL
3. Check dashboard: `/workflows/data-sync`
4. Verify webhook_events tabel in Supabase

#### Test 3: Bidirectional Sync

```bash
# Test dashboard → n8n
curl -X POST http://localhost:5678/webhook/dashboard \
  -H "Content-Type: application/json" \
  -d '{"event": "test", "data": {"test": true}}'
```

---

### 🚨 **Troubleshooting**

**Workflow niet triggering?**

- Check webhook URL in n8n interface
- Verify workflow is activated (toggle switch)
- Check n8n logs: `docker logs n8n`

**Dashboard niet receiving webhooks?**

- Verify dashboard server running: `http://localhost:3000`
- Check payload format matches expected schema
- Check webhook_events table in Supabase

**CORS/Connection errors?**

```bash
# n8n environment
N8N_CORS_ORIGIN="http://localhost:3000"
```

---

### 📊 **Essential Workflows**

**Must-have workflows:**

1. **Test Webhook** (voor validatie)
2. **Email Automation** (gebruikers onboarding)
3. **Status Reporter** (execution updates naar dashboard)

**Nice-to-have workflows:** 4. Social Media Automation 5. Customer Intelligence Sync  
6. Performance Metrics Collector

---

### 🎯 **Success Criteria**

- [ ] n8n interface toegankelijk op :5678
- [ ] Test webhook workflow actief
- [ ] Dashboard ontvangt webhooks
- [ ] Email automation werkend
- [ ] Error notifications werkend
- [ ] Real-time status updates zichtbaar

**🎉 Klaar! De basis integratie is nu operationeel.**

**Voor meer details zie:** `docs/n8n-configuratie-handleiding.md`
