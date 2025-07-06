import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SKC Business Intelligence Dashboard",
  description: "Real-time insights and analytics for business intelligence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body
        className="antialiased"
        suppressHydrationWarning
        style={{
          fontFamily: "var(--font-geist-sans)",
        }}
      >
        {children}
      </body>
    </html>
  );
}
