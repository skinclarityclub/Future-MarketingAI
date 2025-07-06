import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function RootPage() {
  // Get preferred language from Accept-Language header
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") || "";

  // Simple language detection - prefer Dutch if detected, otherwise English
  const prefersDutch = acceptLanguage.toLowerCase().includes("nl");
  const locale = prefersDutch ? "nl" : "en";

  // Redirect to the appropriate locale homepage (which is the marketing landing page)
  redirect(`/${locale}`);
}
