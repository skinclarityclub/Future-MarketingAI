# API Integrations

This directory contains API integration services for the BI Dashboard, specifically for Content ROI Tracking.

## Services

### Shopify Service (`shopify.ts`)

Integrates with Shopify Admin API to collect:

- Product data
- Order/sales data
- Customer information
- Content performance analytics

**Required Environment Variables:**

```env
SHOPIFY_SHOP_URL=your-shop.myshopify.com
SHOPIFY_ACCESS_TOKEN=your-shopify-access-token
SHOPIFY_API_VERSION=2024-01
```

### Kajabi Service (`kajabi.ts`)

Integrates with Kajabi API to collect:

- Course/product data
- Purchase/enrollment data
- Student engagement metrics
- Learning completion rates

**Required Environment Variables:**

```env
KAJABI_BASE_URL=https://api.kajabi.com
KAJABI_API_KEY=your-kajabi-api-key
KAJABI_API_VERSION=v1
```

### Content ROI Service (`content-roi.ts`)

Combines data from both platforms to calculate:

- Content performance metrics
- ROI calculations
- Engagement scores
- Optimization recommendations

## API Endpoints

### `/api/content-roi`

**GET Parameters:**

- `action`: `metrics` (default) or `recommendations`
- `startDate`: Start date for analysis (ISO format)
- `endDate`: End date for analysis (ISO format)
- `includeShopify`: Include Shopify data (default: true)
- `includeKajabi`: Include Kajabi data (default: true)

**Examples:**

```bash
# Get content ROI metrics
GET /api/content-roi?startDate=2024-01-01&endDate=2024-12-31

# Get content recommendations
GET /api/content-roi?action=recommendations&startDate=2024-11-01&endDate=2024-12-01

# Test API connections
POST /api/content-roi
{
  "action": "test-connections"
}
```

## Usage

### In Server Components

```typescript
import { createContentROIService } from "@/lib/apis/content-roi";

const roiService = createContentROIService();
const data = await roiService.calculateContentROI({
  startDate: "2024-01-01",
  endDate: "2024-12-31",
});
```

### In Client Components

```typescript
"use client";

const fetchContentROI = async () => {
  const response = await fetch(
    "/api/content-roi?startDate=2024-01-01&endDate=2024-12-31"
  );
  const data = await response.json();
  return data;
};
```

## Authentication

### Shopify

1. Create a private app in your Shopify admin
2. Generate Admin API access token
3. Grant required permissions:
   - `read_products`
   - `read_orders`
   - `read_customers`

### Kajabi

1. Go to Kajabi Account Settings
2. Navigate to Integrations > API
3. Generate API key
4. Copy the key to your environment variables

## Error Handling

All services include comprehensive error handling:

- Connection testing
- Graceful degradation when one service is unavailable
- Detailed logging for debugging
- Proper HTTP status codes

## Data Models

### Content ROI Metrics

```typescript
interface ContentROIMetrics {
  content_id: string;
  content_title: string;
  content_type: "shopify_product" | "kajabi_course" | "kajabi_community";
  revenue: number;
  sales_count: number;
  engagement_score: number;
  roi_percentage: number;
  cost_per_acquisition: number;
  conversion_rate: number;
  period: string;
  last_updated: string;
}
```

### Performance Data

```typescript
interface ContentPerformanceData {
  total_revenue: number;
  total_content_pieces: number;
  average_roi: number;
  top_performing_content: ContentROIMetrics[];
  underperforming_content: ContentROIMetrics[];
  roi_trend: Array<{
    date: string;
    total_roi: number;
    content_count: number;
  }>;
}
```

## Security

- All API keys are stored as environment variables
- Server-side only implementation
- No sensitive data exposed to client
- Proper error messages without revealing internal details

## Development

1. Copy `.env.example` to `.env.local`
2. Fill in your API credentials
3. Test connections: `curl -X POST http://localhost:3000/api/content-roi -d '{"action":"test-connections"}'`
4. Start development server: `npm run dev`
