# Real-time Chart Integration

This document explains how to integrate real-time data fetching with Supabase into your dashboard charts.

## Overview

The real-time chart system provides:

- **Live data updates** via Supabase real-time subscriptions
- **Fallback polling** when real-time fails
- **Automatic error handling** with graceful degradation
- **Loading states** and user feedback
- **Data transformation** for different chart types
- **Backward compatibility** with existing chart components

## Core Components

### 1. Real-time Data Service (`real-time-data-service.ts`)

The central service that manages:

- Supabase real-time subscriptions
- Fallback polling mechanisms
- Data caching and transformation
- Error handling and retry logic

### 2. Real-time Chart Wrapper (`realtime-chart-wrapper.tsx`)

Higher-order component that:

- Wraps existing chart components
- Provides real-time data
- Shows connection status
- Handles loading and error states

## Usage Examples

### Basic Chart with Real-time Data

```tsx
import { RealtimeChartWrapper } from "@/components/charts/realtime-chart-wrapper";
import { RevenueLineChart } from "@/components/charts/base-chart-components";

export function MyRealtimeChart() {
  return (
    <RealtimeChartWrapper
      chartType="revenue"
      title="Live Revenue Tracking"
      description="Real-time revenue updates"
      showRealtimeStatus={true}
    >
      {(data, loading, error) => (
        <RevenueLineChart
          data={data}
          loading={loading}
          error={error}
          height={350}
          xDataKey="date"
          lines={[
            {
              dataKey: "revenue",
              name: "Revenue",
              color: "#3B82F6",
              strokeWidth: 3,
            },
          ]}
        />
      )}
    </RealtimeChartWrapper>
  );
}
```

### Using the Hook Directly

```tsx
import {
  useRealtimeChartData,
  REALTIME_CONFIGS,
} from "@/lib/data/real-time-data-service";

export function CustomChart() {
  const { data, loading, error, isRealtime, lastUpdated } =
    useRealtimeChartData("my-custom-chart", {
      table: "metrics",
      metric_types: ["sales", "revenue"],
      refresh_interval: 30000,
      enable_polling: true,
    });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div>Status: {isRealtime ? "Live" : "Cached"}</div>
      <div>Last Updated: {lastUpdated?.toLocaleTimeString()}</div>
      {/* Your chart component */}
    </div>
  );
}
```

### Higher-Order Component Pattern

```tsx
import { withRealtimeData } from "@/components/charts/realtime-chart-wrapper";
import { RevenueLineChart } from "@/components/charts/base-chart-components";

// Convert existing chart to real-time
const RealtimeRevenueChart = withRealtimeData(RevenueLineChart, "revenue");

export function MyPage() {
  return (
    <RealtimeRevenueChart
      showRealtimeStatus={true}
      height={300}
      xDataKey="date"
      lines={[{ dataKey: "revenue", name: "Revenue", color: "#3B82F6" }]}
    />
  );
}
```

## Configuration Options

### Chart Types

Pre-configured chart types with appropriate metrics:

- `revenue`: Revenue tracking metrics
- `performance`: Page views, sessions, conversions
- `customers`: Customer acquisition and retention
- `marketing`: Marketing channel performance

### Custom Configuration

```tsx
const customConfig = {
  table: "custom_metrics",
  metric_types: ["custom_metric_1", "custom_metric_2"],
  refresh_interval: 60000, // 1 minute
  enable_polling: true,
};

<RealtimeChartWrapper chartType="revenue" customConfig={customConfig}>
  {/* Chart component */}
</RealtimeChartWrapper>;
```

## Database Schema

Expected database table structure:

```sql
CREATE TABLE metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metric_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE metrics;

-- Indexes for performance
CREATE INDEX idx_metrics_type_timestamp ON metrics(metric_type, timestamp DESC);
CREATE INDEX idx_metrics_timestamp ON metrics(timestamp DESC);
```

## Data Transformation

The system automatically transforms data based on chart type:

### Revenue Charts

```tsx
// Input: Real-time data points
[
  { metric_type: "revenue", value: 50000, timestamp: "2024-01-01" },
  { metric_type: "target", value: 60000, timestamp: "2024-01-01" },
][
  // Output: Chart-ready data
  { date: "2024-01-01", revenue: 50000, target: 60000 }
];
```

### Performance Charts

```tsx
// Input: Multiple metric types
[
  { metric_type: "page_views", value: 1500, timestamp: "2024-01-01" },
  { metric_type: "sessions", value: 800, timestamp: "2024-01-01" },
][
  // Output: Combined metrics
  { date: "2024-01-01", pageViews: 1500, sessions: 800 }
];
```

## Error Handling

The system provides multiple layers of error handling:

1. **Connection Errors**: Falls back to polling
2. **Data Errors**: Shows error state with retry options
3. **Transformation Errors**: Falls back to mock data
4. **Network Errors**: Uses cached data when available

## Performance Considerations

- **Subscription Management**: Automatic cleanup on unmount
- **Data Caching**: Reduces unnecessary re-renders
- **Throttling**: Configurable refresh intervals
- **Memory Management**: Efficient data structures

## Migration Guide

### From Static to Real-time Charts

1. **Wrap existing components**:

```tsx
// Before
<RevenueLineChart data={staticData} />

// After
<RealtimeChartWrapper chartType="revenue">
  {(data, loading, error) => (
    <RevenueLineChart data={data} loading={loading} error={error} />
  )}
</RealtimeChartWrapper>
```

2. **Update data props**:

```tsx
// Remove static data fetching
// useEffect(() => {
//   fetchStaticData();
// }, []);

// Real-time data is provided automatically
```

3. **Add status indicators**:

```tsx
<RealtimeChartWrapper
  chartType="revenue"
  showRealtimeStatus={true} // Add this
>
```

## Troubleshooting

### Common Issues

1. **No real-time updates**:

   - Check Supabase real-time is enabled
   - Verify table permissions
   - Check network connectivity

2. **High CPU usage**:

   - Increase refresh intervals
   - Reduce data points
   - Optimize transformations

3. **Memory leaks**:
   - Ensure components unmount properly
   - Check subscription cleanup

### Debug Mode

Enable debug logging:

```tsx
// In development
localStorage.setItem("realtime-debug", "true");
```

## Best Practices

1. **Use appropriate refresh intervals**:

   - High-frequency data: 30 seconds
   - Medium-frequency: 1-2 minutes
   - Low-frequency: 5+ minutes

2. **Limit data points**:

   - Use `limit()` in queries
   - Implement data pagination
   - Archive old data

3. **Optimize transformations**:

   - Use `useMemo()` for expensive calculations
   - Cache transformation results
   - Minimize array operations

4. **Handle offline scenarios**:
   - Provide meaningful error messages
   - Show cached data age
   - Offer manual refresh options

## Testing

### Unit Tests

```tsx
import { render, screen } from "@testing-library/react";
import { RealtimeChartWrapper } from "./realtime-chart-wrapper";

test("shows loading state", () => {
  render(
    <RealtimeChartWrapper chartType="revenue">
      {(data, loading) => (loading ? <div>Loading</div> : <div>Chart</div>)}
    </RealtimeChartWrapper>
  );

  expect(screen.getByText("Loading")).toBeInTheDocument();
});
```

### Integration Tests

```tsx
// Test with mock Supabase client
import { createClient } from "@supabase/supabase-js";

jest.mock("@/lib/supabase/dashboard-client", () => ({
  dashboardClient: {
    subscribeToChanges: jest.fn(),
    getClient: () => createClient("mock-url", "mock-key"),
  },
}));
```

## Examples

See the following files for complete examples:

- `src/components/revenue/realtime-revenue-charts.tsx`
- `src/components/performance/realtime-performance-charts.tsx`
- `src/components/customers/realtime-customer-charts.tsx`
