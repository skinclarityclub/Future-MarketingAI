# SKC BI Dashboard - Developer Guidelines & Implementation Patterns

## Overview

This document provides comprehensive guidelines for developers working on the SKC BI Dashboard project. It covers coding standards, implementation patterns, performance optimization, and best practices specific to our Next.js 14, Supabase, TypeScript, and TailwindCSS stack.

---

## 🏗️ Project Architecture

### Tech Stack Overview

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL), n8n workflows
- **UI Components**: Shadcn/ui, Custom Premium Components
- **Animations**: Framer Motion, CSS Animations
- **Charts**: Recharts, Custom Visualization Components
- **Deployment**: Vercel (frontend), Supabase Cloud (database)

### Directory Structure

```
src/
├── app/
│   ├── [locale]/                 # Internationalized routes
│   │   ├── dashboard/           # Dashboard pages
│   │   ├── analytics/           # Analytics pages
│   │   └── layout.tsx          # Locale layout
│   ├── api/                     # API routes
│   ├── globals.css             # Global styles
│   └── layout.tsx              # Root layout
├── components/
│   ├── ui/                     # Base UI components
│   ├── dashboard/              # Dashboard-specific components
│   ├── charts/                 # Data visualization components
│   ├── forms/                  # Form components
│   └── layout/                 # Layout components
├── lib/
│   ├── supabase/              # Supabase utilities
│   ├── animations/            # Animation frameworks
│   ├── utils.ts              # General utilities
│   └── types/                # Type definitions
├── hooks/                     # Custom React hooks
├── styles/                    # Additional stylesheets
└── middleware.ts             # Next.js middleware
```

---

## 🎯 Coding Standards

### TypeScript Guidelines

#### Interface vs Type

```typescript
// ✅ Prefer interfaces for object shapes
interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
}

// ✅ Use types for unions, primitives, and computed types
type Theme = "light" | "dark";
type ComponentVariant = "primary" | "secondary" | "tertiary";
type UserWithPreferences = UserProfile & { theme: Theme };

// ❌ Don't use type for simple object shapes
type BadUserProfile = {
  id: string;
  name: string;
};
```

#### Strict Type Safety

```typescript
// ✅ Always type function parameters and return values
const formatCurrency = (amount: number, locale: string = "en"): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: locale === "nl" ? "EUR" : "USD",
  }).format(amount);
};

// ✅ Use proper generic constraints
interface ApiResponse<T extends Record<string, unknown>> {
  data: T;
  status: number;
  message: string;
}

// ✅ Prefer const assertions for immutable data
const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4"] as const;

type ChartColor = (typeof CHART_COLORS)[number];
```

#### Component Props Patterns

```typescript
// ✅ Standard component props pattern
interface BaseComponentProps {
  children?: React.ReactNode;
  className?: string;
}

interface ButtonProps extends BaseComponentProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// ✅ Use discriminated unions for complex variants
interface NeuralCardProps extends BaseComponentProps {
  variant: "neural";
  intensity?: "medium" | "strong";
  aiEffects?: boolean;
}

interface QuantumCardProps extends BaseComponentProps {
  variant: "quantum";
  particleCount?: number;
  waveEffect?: boolean;
}

type CardProps = NeuralCardProps | QuantumCardProps;
```

### React Patterns

#### Component Structure

```typescript
// ✅ Standard component structure
interface ComponentProps {
  // Props interface first
}

export const Component: React.FC<ComponentProps> = ({
  // Destructure props with defaults
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}) => {
  // 1. Hooks (useState, useEffect, custom hooks)
  const [isLoading, setIsLoading] = useState(false);

  // 2. Computed values and derived state
  const computedClassName = cn(
    "base-styles",
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  // 3. Event handlers
  const handleClick = useCallback((event: React.MouseEvent) => {
    // Handler logic
  }, []);

  // 4. Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // 5. Early returns
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // 6. Main render
  return (
    <div className={computedClassName} {...props}>
      {children}
    </div>
  );
};

// 7. Display name for debugging
Component.displayName = "Component";
```

#### Server vs Client Components

```typescript
// ✅ Server Component (default) - for static content
export default function DashboardPage() {
  return (
    <div>
      <StaticHeader />
      <ClientOnlyChart />
    </div>
  );
}

// ✅ Client Component - only when needed
"use client";

import { useState } from "react";

export function InteractiveChart() {
  const [data, setData] = useState([]);
  // Interactive logic here
  return <Chart data={data} />;
}

// ✅ Use dynamic imports for heavy client components
const HeavyChart = dynamic(() => import("./HeavyChart"), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Disable SSR for client-only components
});
```

#### Custom Hooks Pattern

```typescript
// ✅ Custom hook with proper TypeScript
interface UseApiOptions<T> {
  initialData?: T;
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  url: string,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const { initialData = null, enabled = true } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [url, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
```

---

## 🎨 Styling Guidelines

### TailwindCSS Best Practices

#### Class Organization

```typescript
// ✅ Organize classes logically
const buttonClasses = cn(
  // Layout
  "inline-flex items-center justify-center",
  // Spacing
  "px-4 py-2",
  // Typography
  "text-sm font-medium",
  // Colors & Effects
  "bg-blue-600 text-white",
  "hover:bg-blue-700 focus:ring-2 focus:ring-blue-500",
  // Transitions
  "transition-colors duration-200",
  // Custom
  className
);

// ❌ Avoid long unorganized class strings
const badClasses =
  "inline-flex bg-blue-600 px-4 text-sm hover:bg-blue-700 items-center py-2 font-medium text-white justify-center transition-colors duration-200 focus:ring-2 focus:ring-blue-500";
```

#### Component Variants Pattern

```typescript
// ✅ Use variant objects for maintainable styling
const buttonVariants = {
  variant: {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
  },
  size: {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  },
  state: {
    default: "",
    loading: "opacity-50 cursor-not-allowed",
    disabled: "opacity-50 cursor-not-allowed",
  },
};

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className,
  ...props
}) => {
  const state = loading ? "loading" : disabled ? "disabled" : "default";

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors",
        buttonVariants.variant[variant],
        buttonVariants.size[size],
        buttonVariants.state[state],
        className
      )}
      disabled={loading || disabled}
      {...props}
    />
  );
};
```

#### Dark Theme Implementation

```typescript
// ✅ Always implement dark theme first
const cardStyles = cn(
  // Base styles
  "rounded-lg border backdrop-blur-sm",
  // Dark theme (default)
  "bg-gray-900/50 border-gray-800 text-white",
  // Light theme (if needed)
  "light:bg-white light:border-gray-200 light:text-gray-900",
  // Glass morphism
  "backdrop-blur-xl bg-gradient-to-br from-gray-900/80 to-gray-800/40"
);

// ✅ Use CSS variables for consistent theming
// In globals.css
:root {
  --color-background: 10 10 10;     /* Dark background */
  --color-foreground: 250 250 250;  /* Light text */
  --color-primary: 59 130 246;      /* Blue */
  --color-border: 39 39 42;         /* Dark border */
}

// In components
className="bg-background text-foreground border-border"
```

### CSS Custom Properties

```css
/* ✅ Use CSS custom properties for design tokens */
:root {
  /* Spacing Scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-8: 2rem;

  /* Animation Durations */
  --duration-fast: 0.15s;
  --duration-normal: 0.3s;
  --duration-slow: 0.5s;

  /* Easing Functions */
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);

  /* Glass Morphism */
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-blur: blur(20px);
}

/* ✅ Component-specific custom properties */
.neural-card {
  --neural-glow: 0 0 20px rgba(59, 130, 246, 0.3);
  --neural-bg: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.1),
    rgba(139, 92, 246, 0.05)
  );

  background: var(--neural-bg);
  box-shadow: var(--neural-glow);
  backdrop-filter: var(--glass-blur);
}
```

---

## ⚡ Performance Optimization

### React Performance

#### Memoization Strategies

```typescript
// ✅ Memoize expensive computations
const ExpensiveComponent: React.FC<Props> = ({ data, filters }) => {
  const processedData = useMemo(() => {
    return data
      .filter(item => filters.includes(item.category))
      .map(item => ({
        ...item,
        computed: expensiveCalculation(item),
      }));
  }, [data, filters]);

  return <Chart data={processedData} />;
};

// ✅ Memoize callback functions
const ParentComponent: React.FC = () => {
  const [count, setCount] = useState(0);

  const handleIncrement = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  return <ChildComponent onIncrement={handleIncrement} />;
};

// ✅ Use React.memo for pure components
const PureComponent = React.memo<Props>(({ title, description }) => {
  return (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
});
```

#### Code Splitting

```typescript
// ✅ Route-level code splitting
const DashboardPage = dynamic(() => import("./DashboardPage"), {
  loading: () => <PageSkeleton />,
});

// ✅ Component-level code splitting
const HeavyChart = dynamic(() => import("./HeavyChart"), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Disable for client-only components
});

// ✅ Conditional loading
const AdminPanel = dynamic(() => import("./AdminPanel"), {
  loading: () => <div>Loading admin panel...</div>,
});

const ConditionalAdmin: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
  if (!isAdmin) return null;
  return <AdminPanel />;
};
```

### Animation Performance

#### GPU-Accelerated Animations

```css
/* ✅ Use transform and opacity for smooth animations */
.smooth-animation {
  transform: translateZ(0); /* Force GPU acceleration */
  will-change: transform, opacity;
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.smooth-animation:hover {
  transform: translateY(-4px) scale(1.02);
}

/* ❌ Avoid animating layout properties */
.bad-animation {
  transition:
    width 0.3s ease,
    height 0.3s ease; /* Causes reflow */
}

/* ✅ Use transform: scale() instead */
.good-animation {
  transition: transform 0.3s ease;
}

.good-animation:hover {
  transform: scale(1.1);
}
```

#### Framer Motion Optimization

```typescript
// ✅ Use layoutId for smooth transitions
const AnimatedCard: React.FC<Props> = ({ isExpanded, id }) => {
  return (
    <motion.div
      layoutId={`card-${id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Card content */}
    </motion.div>
  );
};

// ✅ Optimize animations with proper variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 }
  }
};

// ✅ Use stagger for list animations
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};
```

---

## 🔐 Security Best Practices

### API Security

#### Environment Variables

```typescript
// ✅ Validate environment variables
const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

const validateEnv = () => {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
};

// ✅ Type-safe environment variables
interface ProcessEnv {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends ProcessEnv {}
  }
}
```

#### API Route Security

```typescript
// ✅ Secure API routes with proper validation
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  userId: z.string().uuid(),
  data: z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const body = await request.json();
    const validatedData = requestSchema.parse(body);

    // Check authentication
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check authorization
    if (session.user.id !== validatedData.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Process request
    const result = await processData(validatedData);

    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Data Validation

```typescript
// ✅ Use Zod for runtime validation
import { z } from "zod";

const UserProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email format"),
  age: z.number().min(13, "Must be at least 13").max(120),
  preferences: z.object({
    theme: z.enum(["light", "dark"]),
    notifications: z.boolean(),
  }),
});

type UserProfile = z.infer<typeof UserProfileSchema>;

// ✅ Validate data at boundaries
const validateUserProfile = (data: unknown): UserProfile => {
  return UserProfileSchema.parse(data);
};

// ✅ Handle validation errors gracefully
const safeValidateUserProfile = (data: unknown) => {
  const result = UserProfileSchema.safeParse(data);

  if (!result.success) {
    console.error("Validation failed:", result.error.errors);
    return null;
  }

  return result.data;
};
```

---

## 🌐 Internationalization (i18n)

### Implementation Pattern

```typescript
// ✅ Dictionary structure
interface Dictionary {
  common: {
    loading: string;
    error: string;
    success: string;
    save: string;
    cancel: string;
    delete: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    metrics: {
      revenue: string;
      users: string;
      conversion: string;
    };
  };
  forms: {
    validation: {
      required: string;
      email: string;
      minLength: string;
    };
  };
}

// ✅ Type-safe dictionary access
const useDictionary = () => {
  const locale = useLocale();
  return getDictionary(locale);
};

// ✅ Component usage
const DashboardPage: React.FC = () => {
  const dict = useDictionary();

  return (
    <div>
      <h1>{dict.dashboard.title}</h1>
      <p>{dict.dashboard.subtitle}</p>
      <MetricsCard
        title={dict.dashboard.metrics.revenue}
        value="$12,345"
      />
    </div>
  );
};
```

### Locale-aware Formatting

```typescript
// ✅ Currency formatting
const formatCurrency = (amount: number, locale: string) => {
  const currency = locale === "nl" ? "EUR" : "USD";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// ✅ Date formatting
const formatDate = (date: Date, locale: string) => {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// ✅ Number formatting
const formatNumber = (number: number, locale: string) => {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
  }).format(number);
};
```

---

## 📋 Code Review Checklist

### General

- [ ] Code follows TypeScript strict mode
- [ ] All functions have proper type annotations
- [ ] Error handling is implemented
- [ ] Performance considerations are addressed
- [ ] Security best practices are followed

### React Components

- [ ] Component is properly typed
- [ ] Uses appropriate React patterns (hooks, memo, etc.)
- [ ] Handles loading and error states
- [ ] Is accessible (ARIA attributes, keyboard navigation)
- [ ] Is responsive and mobile-friendly

### Styling

- [ ] Uses design system components/tokens
- [ ] Implements dark theme correctly
- [ ] TailwindCSS classes are organized
- [ ] Animations are performant
- [ ] Respects `prefers-reduced-motion`

### Testing

- [ ] Unit tests cover main functionality
- [ ] Integration tests for complex flows
- [ ] Accessibility tests included
- [ ] Performance tests for critical paths

### Documentation

- [ ] Code is self-documenting
- [ ] Complex logic has comments
- [ ] README is updated if needed
- [ ] API changes are documented

---

## 🚨 Common Pitfalls

### Performance Anti-patterns

```typescript
// ❌ Creating objects/functions in render
const BadComponent: React.FC = () => {
  return (
    <div>
      {items.map(item => (
        <Item
          key={item.id}
          onClick={() => handleClick(item.id)} // New function every render
          style={{ color: 'red' }} // New object every render
        />
      ))}
    </div>
  );
};

// ✅ Proper optimization
const GoodComponent: React.FC = () => {
  const handleClick = useCallback((id: string) => {
    // Handle click
  }, []);

  const itemStyle = useMemo(() => ({ color: 'red' }), []);

  return (
    <div>
      {items.map(item => (
        <Item
          key={item.id}
          onClick={() => handleClick(item.id)}
          style={itemStyle}
        />
      ))}
    </div>
  );
};
```

### TypeScript Gotchas

```typescript
// ❌ Using 'any' type
const badFunction = (data: any) => {
  return data.someProperty; // No type safety
};

// ✅ Proper typing
interface DataType {
  someProperty: string;
  otherProperty: number;
}

const goodFunction = (data: DataType) => {
  return data.someProperty; // Type safe
};

// ❌ Not handling undefined/null
const badAccess = (user: User) => {
  return user.profile.name; // Can throw if profile is undefined
};

// ✅ Safe property access
const goodAccess = (user: User) => {
  return user.profile?.name ?? "Unknown";
};
```

### React Hooks Mistakes

```typescript
// ❌ Missing dependency in useEffect
useEffect(() => {
  fetchData(userId); // userId should be in dependencies
}, []); // Empty deps array

// ✅ Correct dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ❌ Conditional hooks
const BadComponent: React.FC<Props> = ({ showData }) => {
  if (showData) {
    const [data, setData] = useState([]); // Hooks can't be conditional
  }

  return <div>Content</div>;
};

// ✅ Hooks at top level
const GoodComponent: React.FC<Props> = ({ showData }) => {
  const [data, setData] = useState([]);

  if (!showData) {
    return <div>No data</div>;
  }

  return <div>Content with data</div>;
};
```

---

## 📚 Resources & References

### Documentation

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Supabase Documentation](https://supabase.com/docs)

### Tools & Libraries

- [Shadcn/ui Components](https://ui.shadcn.com/)
- [Recharts Documentation](https://recharts.org/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [Testing Library](https://testing-library.com/)

### Best Practices

- [React Best Practices](https://react.dev/learn)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Core Web Vitals](https://web.dev/vitals/)

---

_This document is maintained by the development team and should be updated as the project evolves. All team members are expected to follow these guidelines and contribute to their improvement._

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Next Review**: April 2025
