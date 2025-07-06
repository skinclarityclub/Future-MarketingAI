# Component Inventory - SKC BI Dashboard

## 📁 Core Layout Components

### UltraPremiumDashboardLayout ⭐

- **File**: `src/components/layout/ultra-premium-dashboard-layout.tsx`
- **Purpose**: Master layout wrapper for all dashboards
- **Used By**: All 5 dashboard pages

### EnhancedHeader

- **File**: `src/components/layout/enhanced-header.tsx`
- **Purpose**: Global navigation header with dashboard switching

### EnhancedSidebar

- **File**: `src/components/layout/enhanced-sidebar.tsx`
- **Purpose**: Mode-specific navigation sidebar

### DashboardBreadcrumbs

- **File**: `src/components/layout/dashboard-breadcrumbs.tsx`
- **Purpose**: Contextual navigation breadcrumbs

### MobileDashboardNavigation

- **File**: `src/components/layout/mobile-dashboard-navigation.tsx`
- **Purpose**: Mobile slide-out navigation menu

## 📊 Dashboard Pages

### Executive Dashboard

- **Route**: `/executive-dashboard`
- **Component**: `ExecutiveSummaryDashboard`

### Finance Dashboard

- **Route**: `/finance`
- **Component**: `FinancialIntelligence`

### Marketing Dashboard

- **Route**: `/marketing`
- **Component**: `UnifiedMarketingDashboard`

### Research Dashboard

- **Route**: `/research`
- **Component**: Custom research components

### Admin Dashboard

- **Route**: `/admin-dashboard`
- **Component**: `AdminDashboard`

## 🎨 UI System

### DarkThemeProvider

- **File**: `src/lib/ui/dark-theme-provider.tsx`
- **Purpose**: Global dark theme management

### Premium UI Components

- `UltraPremiumCard` - Premium card containers
- `UltraPremiumGrid` - Responsive grid system
- `UltraPremiumSection` - Content section wrappers

_Component Inventory v1.0 - 2024-12-26_
