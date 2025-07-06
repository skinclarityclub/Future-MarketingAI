import { createBrowserClient } from "@supabase/ssr";
import { Database } from "./types";

let supabaseInstance: any = null;

export function getSupabaseInstance() {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabaseInstance;
}

// For client-side usage
export function createSupabaseInstance() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Export the instance directly for compatibility
export { supabaseInstance };
