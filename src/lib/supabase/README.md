# Supabase Integration

This directory contains the Supabase client configuration for the Next.js 14 application using the `@supabase/ssr` package.

## Files

- **`client.ts`** - Browser client for client-side operations
- **`server.ts`** - Server client for server-side operations (API routes, Server Components)
- **`middleware.ts`** - Middleware utilities for session management
- **`types.ts`** - TypeScript types for database schema

## Environment Variables

Create a `.env.local` file in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Usage

### In Server Components

```typescript
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
const { data, error } = await supabase.from("your_table").select("*");
```

### In Client Components

```typescript
"use client";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const { data, error } = await supabase.from("your_table").select("*");
```

### Test API Route

Visit `/api/test-supabase` to test the Supabase connection.

## Database Schema

Update `types.ts` with your actual database schema for full TypeScript support. You can generate types automatically using the Supabase CLI:

```bash
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts
```
