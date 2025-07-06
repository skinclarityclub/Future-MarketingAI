// This file is used by Next.js to initialize instrumentation hooks
// It runs before any other code in the application

// Temporarily disabled to prevent OpenTelemetry module conflicts
// import { initializeTracing } from "./src/lib/tracing";

export async function register() {
  // Only initialize tracing in production and development
  // Temporarily disabled to fix module loading issues
  console.log(
    "[Instrumentation] Tracing initialization disabled to prevent module conflicts"
  );

  // if (process.env.NODE_ENV !== "test") {
  //   initializeTracing();
  // }
}
