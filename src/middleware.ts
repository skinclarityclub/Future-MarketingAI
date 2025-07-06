import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import createIntlMiddleware from "next-intl/middleware";

const intlMiddleware = createIntlMiddleware({
  locales: ["en", "nl"],
  defaultLocale: "en",
  localePrefix: "always",
});

export async function middleware(request: NextRequest) {
  try {
    // Handle internationalization first
    const intlResponse = intlMiddleware(request);
    const response = intlResponse || NextResponse.next();

    // Add basic security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");

    // Handle Supabase session
    return await updateSession(request, response);
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Apply middleware to all routes except API routes and static files
    "/((?!api|_next/static|_next/image|favicon.ico|site.webmanifest|alert-sound.mp3|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp|.*\\.avif|.*\\.ico|.*\\.mp3|.*\\.mp4|.*\\.wav).*)",
  ],
};
