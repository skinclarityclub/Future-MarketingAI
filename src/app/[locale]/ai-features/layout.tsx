import { getDictionary } from "@/i18n/dictionaries";
import { ReactNode } from "react";
import { ImprovedMarketingHeader } from "@/components/layout/improved-marketing-header";

interface AIFeaturesLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AIFeaturesLayout({
  children,
  params,
}: AIFeaturesLayoutProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Marketing Header */}
      <ImprovedMarketingHeader />

      {/* AI Features Navigation Breadcrumb */}
      <div className="bg-slate-950/80 backdrop-blur-sm border-b border-blue-500/20 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <a
              href={`/${locale}`}
              className="text-slate-400 hover:text-blue-400 transition-colors"
            >
              Home
            </a>
            <span className="text-slate-600">/</span>
            <span className="text-blue-400 font-medium">AI Features</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10">{children}</main>

      {/* Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
    </div>
  );
}
