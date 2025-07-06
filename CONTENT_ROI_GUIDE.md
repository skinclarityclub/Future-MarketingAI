# Content ROI Tracking - User Guide

## 🎯 **Overview**

The Content ROI Tracking system combines data from Shopify and Kajabi to calculate revenue attribution for each content piece, providing actionable insights for content optimization.

## ✅ **What's Implemented**

### 🔧 **Backend Services**

- ✅ **Shopify API Integration** - Products, orders, and sales analytics
- ✅ **Kajabi API Integration** - Course enrollments and engagement metrics
- ✅ **Content ROI Calculator** - Automated ROI calculations and performance analysis
- ✅ **Recommendation Engine** - AI-powered optimization suggestions
- ✅ **Demo Mode** - Mock data for testing without API credentials

### 🎨 **Frontend Components**

- ✅ **Content Performance Dashboard** (`/content-performance`)
- ✅ **ROI Metrics Cards** - Total revenue, content count, average ROI
- ✅ **Performance Charts** - ROI trends and top-performing content
- ✅ **Data Tables** - Detailed content performance metrics
- ✅ **Optimization Recommendations** - Actionable insights panel

### 🔄 **API Endpoints**

- ✅ `GET /api/content-roi` - Fetch ROI metrics and analytics
- ✅ `GET /api/content-roi?action=recommendations` - Get optimization recommendations
- ✅ `POST /api/content-roi` - Test connections and sync data

## 🚀 **Getting Started**

### 1. **Demo Mode (Immediate Use)**

The system currently runs in **demo mode** with realistic mock data:

- Navigate to `http://localhost:3000/content-performance`
- View sample ROI metrics from mock Shopify and Kajabi data
- Test all functionality without API credentials

### 2. **Production Setup (Real Data)**

To use real data, create a `.env.local` file with:

```env
# Shopify Configuration
SHOPIFY_SHOP_URL=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_shopify_access_token_here
SHOPIFY_API_VERSION=2024-01

# Kajabi Configuration
KAJABI_API_KEY=your_kajabi_api_key_here
KAJABI_API_SECRET=your_kajabi_api_secret_here
KAJABI_BASE_URL=https://api.kajabi.com
```

## 📊 **Key Features**

### **Content Performance Metrics**

- Revenue attribution per content piece
- Conversion rates and sales counts
- ROI percentage calculations
- Cost per acquisition analysis

### **Top Performing Content**

- Automatically identifies highest ROI content
- Highlights underperforming content for optimization
- Trend analysis over time

### **Optimization Recommendations**

- **Promote**: High-performing content to scale
- **Optimize**: Underperforming content to improve
- **Discontinue**: Low-value content to remove
- **Replicate**: Successful patterns to duplicate

## 🔍 **API Usage Examples**

### Get Content ROI Metrics

```bash
curl "http://localhost:3000/api/content-roi?startDate=2024-01-01&endDate=2024-12-31"
```

### Get Optimization Recommendations

```bash
curl "http://localhost:3000/api/content-roi?action=recommendations&startDate=2024-01-01"
```

### Test API Connections

```bash
curl -X POST "http://localhost:3000/api/content-roi" \
  -H "Content-Type: application/json" \
  -d '{"action": "test-connections"}'
```

## 🎛️ **Configuration Options**

### **Date Range Filters**

- `startDate` / `endDate` - Specify analysis period
- `includeShopify` - Include/exclude Shopify data
- `includeKajabi` - Include/exclude Kajabi data

### **Content Cost Mapping**

Optionally provide production costs for more accurate ROI:

```typescript
const contentCosts = new Map([
  ["product_id_1", 2000], // $2000 production cost
  ["product_id_2", 1500], // $1500 production cost
]);
```

## 🐛 **Troubleshooting**

### **"No API connections available"**

- Check that API credentials are set in `.env.local`
- Verify API keys have correct permissions
- Restart the development server after adding credentials

### **Demo Mode Active**

- System automatically uses demo data when API credentials are missing
- Add real credentials to `.env.local` to switch to production mode
- Look for `[DEMO MODE]` messages in console logs

### **TypeScript Errors**

- Run `npm run type-check` to verify types
- Check that all imports are correctly typed
- Ensure environment variables match expected format

## 📈 **Performance Notes**

- **Caching**: API responses cached for 5 minutes
- **Rate Limits**: Respects Shopify/Kajabi API rate limits
- **Data Processing**: Optimized for up to 1000 products/courses
- **Real-time Updates**: Dashboard updates every 5 minutes

## 🔮 **Future Enhancements**

- **Real-time Webhooks** - Instant data updates from Shopify/Kajabi
- **Advanced Analytics** - Customer lifetime value, churn prediction
- **Custom Reports** - Exportable PDF/Excel reports
- **A/B Testing** - Content performance comparison tools
- **Social Media Integration** - Instagram, TikTok, YouTube metrics

---

## ✅ **Task 3 Status: COMPLETED**

All Content ROI Tracking functionality has been successfully implemented and tested:

✅ **Shopify & Kajabi API Integrations**  
✅ **ROI Calculation Algorithms**  
✅ **Dashboard Components & Visualization**  
✅ **Optimization Recommendation Engine**  
✅ **Demo Mode for Immediate Testing**

The system is ready for production use once API credentials are configured!
