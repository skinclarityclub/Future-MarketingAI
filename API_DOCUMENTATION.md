# SKC Business Intelligence Dashboard - API Documentation

## 📋 Overview

The SKC Business Intelligence Dashboard provides a comprehensive RESTful API for accessing analytics data, managing configurations, and integrating with external systems. This documentation covers all available endpoints, authentication methods, and integration examples.

## 🔐 Authentication

### API Keys

All API requests require authentication using API keys. Contact your administrator to obtain API keys with appropriate permissions.

**Header Required:**

```
Authorization: Bearer YOUR_API_KEY
```

### Authentication Flow

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "secure_password"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "refresh_token_here",
  "expires_in": 3600,
  "user": {
    "id": "user_id",
    "email": "user@company.com",
    "role": "admin"
  }
}
```

## 🏢 Core API Endpoints

### Dashboard Analytics

#### Get Executive Dashboard Data

```http
GET /api/dashboard/executive
Authorization: Bearer YOUR_API_KEY
```

**Parameters:**

- `timeframe` (optional): `7d`, `30d`, `90d`, `1y`
- `metrics` (optional): Comma-separated list of metrics

**Response:**

```json
{
  "status": "success",
  "data": {
    "kpis": {
      "total_revenue": 125000.5,
      "active_customers": 1847,
      "conversion_rate": 3.2,
      "churn_rate": 2.1
    },
    "trends": {
      "revenue_growth": 12.5,
      "customer_growth": 8.3
    },
    "last_updated": "2025-01-16T10:30:00Z"
  }
}
```

#### Get KPI Metrics

```http
GET /api/dashboard/kpis
Authorization: Bearer YOUR_API_KEY
```

**Query Parameters:**

- `metric`: Specific metric name
- `start_date`: Start date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)
- `granularity`: `day`, `week`, `month`

### Revenue Analytics

#### Get Revenue Data

```http
GET /api/analytics/revenue
Authorization: Bearer YOUR_API_KEY
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "total_revenue": 125000.5,
    "mrr": 10416.71,
    "arr": 125000.5,
    "revenue_by_segment": [
      {
        "segment": "enterprise",
        "revenue": 75000.3,
        "percentage": 60.0
      },
      {
        "segment": "sme",
        "revenue": 50000.2,
        "percentage": 40.0
      }
    ],
    "forecast": {
      "next_month": 12500.8,
      "next_quarter": 37502.4,
      "confidence": 0.85
    }
  }
}
```

#### Get Revenue Forecast

```http
GET /api/analytics/revenue/forecast
Authorization: Bearer YOUR_API_KEY
```

**Parameters:**

- `period`: `month`, `quarter`, `year`
- `model`: `linear`, `polynomial`, `ml`

### Customer Intelligence

#### Get Customer Segments

```http
GET /api/customers/segments
Authorization: Bearer YOUR_API_KEY
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "segments": [
      {
        "id": "high_value",
        "name": "High Value Customers",
        "count": 156,
        "avg_revenue": 2400.5,
        "characteristics": {
          "avg_age": 42,
          "primary_channel": "web",
          "engagement_score": 8.7
        }
      }
    ],
    "total_customers": 1847
  }
}
```

#### Get Churn Prediction

```http
GET /api/customers/churn-prediction
Authorization: Bearer YOUR_API_KEY
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "at_risk_customers": 127,
    "churn_probability": {
      "high_risk": 45,
      "medium_risk": 82,
      "low_risk": 1720
    },
    "predictions": [
      {
        "customer_id": "cust_123",
        "churn_probability": 0.78,
        "risk_level": "high",
        "factors": ["low_engagement", "payment_issues"]
      }
    ]
  }
}
```

#### Get Customer Journey

```http
GET /api/customers/{customer_id}/journey
Authorization: Bearer YOUR_API_KEY
```

### Marketing Performance

#### Get Campaign Data

```http
GET /api/marketing/campaigns
Authorization: Bearer YOUR_API_KEY
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "campaigns": [
      {
        "id": "camp_123",
        "name": "Q1 Lead Generation",
        "platform": "google_ads",
        "status": "active",
        "metrics": {
          "impressions": 125000,
          "clicks": 3750,
          "conversions": 120,
          "cost": 5000.0,
          "roas": 3.2
        }
      }
    ],
    "total_campaigns": 12,
    "total_spend": 45000.0,
    "total_revenue": 144000.0
  }
}
```

#### Get Attribution Data

```http
GET /api/marketing/attribution
Authorization: Bearer YOUR_API_KEY
```

**Parameters:**

- `model`: `first_touch`, `last_touch`, `linear`, `time_decay`
- `timeframe`: Analysis period

### Financial Intelligence

#### Get Budget Performance

```http
GET /api/financial/budget
Authorization: Bearer YOUR_API_KEY
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "budget_summary": {
      "total_budget": 100000.0,
      "spent": 67500.0,
      "remaining": 32500.0,
      "utilization": 67.5
    },
    "categories": [
      {
        "category": "marketing",
        "budget": 40000.0,
        "spent": 27500.0,
        "variance": -12500.0
      }
    ]
  }
}
```

#### Get Financial Forecast

```http
GET /api/financial/forecast
Authorization: Bearer YOUR_API_KEY
```

### Content Performance

#### Get Content ROI

```http
GET /api/content/roi
Authorization: Bearer YOUR_API_KEY
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "content_pieces": [
      {
        "id": "content_123",
        "title": "Ultimate Guide to BI",
        "type": "blog_post",
        "metrics": {
          "views": 15000,
          "engagement_rate": 12.5,
          "leads_generated": 45,
          "cost": 500.0,
          "roi": 450.0
        }
      }
    ]
  }
}
```

## 🤖 AI Assistant API

### Natural Language Queries

```http
POST /api/assistant/query
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "query": "Show me revenue for last month",
  "context": {
    "user_id": "user_123",
    "session_id": "session_456"
  }
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "response": "Last month's revenue was $125,000, which is a 12% increase from the previous month.",
    "data": {
      "revenue": 125000.0,
      "growth": 12.0
    },
    "visualization": {
      "type": "line_chart",
      "data": "chart_data_here"
    }
  }
}
```

### Get Insights

```http
GET /api/assistant/insights
Authorization: Bearer YOUR_API_KEY
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "insights": [
      {
        "type": "anomaly",
        "title": "Unusual Spike in Churn Rate",
        "description": "Churn rate increased by 45% in the last week",
        "confidence": 0.92,
        "recommended_actions": [
          "Review customer feedback",
          "Analyze recent product changes"
        ]
      }
    ]
  }
}
```

## 📊 Data Export API

### Export Dashboard Data

```http
POST /api/export/dashboard
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "format": "csv",
  "modules": ["revenue", "customers"],
  "date_range": {
    "start": "2025-01-01",
    "end": "2025-01-16"
  }
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "export_id": "export_123",
    "download_url": "https://api.skc-dashboard.com/downloads/export_123.csv",
    "expires_at": "2025-01-17T10:30:00Z"
  }
}
```

### Get Export Status

```http
GET /api/export/{export_id}/status
Authorization: Bearer YOUR_API_KEY
```

## 🔗 Webhook API

### Configure Webhooks

```http
POST /api/webhooks
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["revenue.updated", "customer.churned"],
  "secret": "webhook_secret_key"
}
```

### Webhook Events

Available webhook events:

- `revenue.updated`: Revenue metrics updated
- `customer.churned`: Customer churn detected
- `campaign.completed`: Marketing campaign finished
- `alert.triggered`: System alert triggered

**Webhook Payload Example:**

```json
{
  "event": "revenue.updated",
  "timestamp": "2025-01-16T10:30:00Z",
  "data": {
    "metric": "mrr",
    "old_value": 10000.0,
    "new_value": 10416.71,
    "change_percentage": 4.17
  }
}
```

## ⚡ Real-time API (WebSocket)

### Connection

```javascript
const ws = new WebSocket("wss://api.skc-dashboard.com/ws");
ws.addEventListener("open", function (event) {
  // Send authentication
  ws.send(
    JSON.stringify({
      type: "auth",
      token: "YOUR_API_KEY",
    })
  );
});
```

### Subscribe to Updates

```javascript
ws.send(
  JSON.stringify({
    type: "subscribe",
    channels: ["revenue", "customers", "alerts"],
  })
);
```

### Real-time Message Format

```json
{
  "type": "data_update",
  "channel": "revenue",
  "data": {
    "metric": "total_revenue",
    "value": 125000.5,
    "timestamp": "2025-01-16T10:30:00Z"
  }
}
```

## 📋 Configuration API

### Get User Settings

```http
GET /api/settings/user
Authorization: Bearer YOUR_API_KEY
```

### Update Dashboard Configuration

```http
PUT /api/settings/dashboard
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "layout": {
    "widgets": [
      {
        "id": "revenue_chart",
        "position": { "x": 0, "y": 0, "w": 6, "h": 4 }
      }
    ]
  },
  "preferences": {
    "theme": "dark",
    "language": "en",
    "timezone": "UTC"
  }
}
```

## 🔍 Error Handling

### Error Response Format

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "The parameter 'timeframe' is invalid",
    "details": {
      "parameter": "timeframe",
      "allowed_values": ["7d", "30d", "90d", "1y"]
    }
  }
}
```

### Common Error Codes

- `UNAUTHORIZED`: Invalid or missing API key
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `INVALID_PARAMETER`: Invalid request parameter
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

## 📊 Rate Limiting

### Limits

- **Standard Plan:** 1,000 requests per hour
- **Professional Plan:** 5,000 requests per hour
- **Enterprise Plan:** 25,000 requests per hour

### Rate Limit Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 750
X-RateLimit-Reset: 1642320000
```

## 🔄 Pagination

### Standard Pagination

```http
GET /api/customers?page=2&limit=50
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "customers": [...],
    "pagination": {
      "page": 2,
      "limit": 50,
      "total": 1847,
      "pages": 37,
      "has_next": true,
      "has_prev": true
    }
  }
}
```

### Cursor-based Pagination

```http
GET /api/events?cursor=eyJpZCI6MTIzfQ&limit=100
```

## 🧪 Testing & Development

### Sandbox Environment

**Base URL:** `https://sandbox-api.skc-dashboard.com`

### Test API Keys

- Use test API keys in sandbox environment
- Test data is reset every 24 hours
- No rate limiting in sandbox

### API Status

Check API status: `GET /api/health`

**Response:**

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 99.99,
  "database": "connected",
  "cache": "connected"
}
```

## 📚 SDKs & Libraries

### JavaScript/Node.js

```bash
npm install @skc/dashboard-api
```

```javascript
import { SKCDashboard } from "@skc/dashboard-api";

const client = new SKCDashboard({
  apiKey: "your_api_key",
  baseURL: "https://api.skc-dashboard.com",
});

const revenue = await client.analytics.getRevenue({
  timeframe: "30d",
});
```

### Python

```bash
pip install skc-dashboard-api
```

```python
from skc_dashboard import SKCDashboard

client = SKCDashboard(api_key='your_api_key')
revenue = client.analytics.get_revenue(timeframe='30d')
```

### PHP

```bash
composer require skc/dashboard-api
```

```php
use SKC\Dashboard\Client;

$client = new Client(['api_key' => 'your_api_key']);
$revenue = $client->analytics()->getRevenue(['timeframe' => '30d']);
```

## 🔧 Integration Examples

### Google Sheets Integration

```javascript
// Google Apps Script example
function importDashboardData() {
  const response = UrlFetchApp.fetch(
    "https://api.skc-dashboard.com/api/dashboard/executive",
    {
      headers: {
        Authorization: "Bearer YOUR_API_KEY",
      },
    }
  );

  const data = JSON.parse(response.getContentText());
  // Process and insert data into sheets
}
```

### Slack Integration

```javascript
// Slack bot example
app.command("/revenue", async ({ command, ack, respond }) => {
  await ack();

  const response = await fetch(
    "https://api.skc-dashboard.com/api/analytics/revenue",
    {
      headers: {
        Authorization: "Bearer YOUR_API_KEY",
      },
    }
  );

  const data = await response.json();

  await respond({
    text: `Current MRR: $${data.data.mrr}`,
  });
});
```

### Power BI Integration

```json
{
  "version": "1.0.0",
  "connections": [
    {
      "name": "SKC Dashboard",
      "connectionString": "https://api.skc-dashboard.com/api/powerbi",
      "authentication": {
        "type": "bearer",
        "token": "YOUR_API_KEY"
      }
    }
  ]
}
```

## 📞 Support

### API Support

- **Email:** api-support@skc-dashboard.com
- **Documentation:** https://docs.skc-dashboard.com/api
- **Status Page:** https://status.skc-dashboard.com
- **Community:** https://community.skc-dashboard.com

### Response Times

- Critical Issues: 2 hours
- General Support: 24 hours
- Feature Requests: 5 business days

---

_Last Updated: January 16, 2025_  
_API Version: 1.0.0_  
_For the latest API updates, visit: docs.skc-dashboard.com/api_
