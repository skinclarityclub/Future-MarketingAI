"use client";

import Link from "next/link";
import Script from "next/script";
import { useParams } from "next/navigation";
import { useImageOptimization } from "@/hooks/use-image-optimization";
import {
  Sparkles,
  Building2,
  Brain,
  Zap,
  Play,
  ArrowUpRight,
} from "lucide-react";
import { ImprovedMarketingHeader } from "@/components/layout/improved-marketing-header";
import { FutureMarketingAIHero } from "@/components/layout/future-marketing-ai-hero";
import { AIGeneratedBackground } from "@/components/layout/ai-generated-background";
import { FutureMarketingAISocialAnalytics } from "@/components/layout/future-marketing-ai-social-analytics";
import { ProductLifecycleVisualization } from "@/components/marketing/product-lifecycle-visualization";
import { InteractiveROICalculator } from "@/components/marketing/interactive-roi-calculator";

import SelfLearningAnalyticsDashboard from "@/components/marketing/self-learning-analytics-dashboard";
import { ProgressivePricingDisplay } from "@/components/marketing/progressive-pricing-display";
import { ResponsiveAccessibilityHelper } from "@/components/layout/responsive-accessibility-helper";
import { motion } from "framer-motion";
import "@/styles/mobile-optimizations.css";

// Extract translations to separate file (would normally be in i18n/translations.ts)
const translations = {
  en: {
    sections: {
      platformDemo: {
        badge: "Platform Demo",
        title: "Experience the Future",
        subtitle:
          "Watch our AI platform transform your marketing workflows in real-time with intelligent automation and predictive analytics.",
      },
      roiAssessment: {
        badge: "ROI Calculator",
        title: "Calculate Your ROI",
        subtitle:
          "Discover the potential return on investment with our intelligent ROI calculator based on your specific business metrics.",
      },
      selfLearningAI: {
        title: "Self-Learning AI Analytics",
        subtitle:
          "Our AI continuously learns from your data to provide increasingly accurate insights and recommendations.",
      },
      testimonials: {
        title: "What Our Clients Say",
        subtitle:
          "Join thousands of satisfied customers who have transformed their marketing with our platform.",
      },
    },
    footer: {
      company: {
        name: "FutureMarketingAI",
        description:
          "Next-generation AI marketing platform that revolutionizes content creation, automates publishing, and delivers unprecedented performance optimization.",
      },
      links: {
        platform: {
          title: "Platform",
          items: {
            futureMarketingAI: "FutureMarketingAI",
            analyticsSuite: "Analytics Suite",
            automation: "Automation",
          },
        },
        resources: {
          title: "Resources",
          items: {
            watchDemo: "Watch Demo",
            caseStudies: "Case Studies",
            fortune500Demo: "Fortune 500 Demo",
          },
        },
        contact: {
          title: "Contact",
          items: {
            talkToSales: "Talk to Sales",
            support247: "24/7 Support",
            globalCoverage: "Global Coverage",
          },
        },
      },
      legal: {
        copyright: "© 2024 FutureMarketingAI. All rights reserved.",
        privacy: "Privacy Policy",
        terms: "Terms of Service",
      },
    },
  },
  nl: {
    sections: {
      platformDemo: {
        badge: "Platform Demo",
        title: "Ervaar de Toekomst",
        subtitle:
          "Bekijk hoe ons AI-platform uw marketingworkflows in real-time transformeert met intelligente automatisering en voorspellende analyses.",
      },
      roiAssessment: {
        badge: "ROI Calculator",
        title: "Bereken Uw ROI",
        subtitle:
          "Ontdek het potentiële rendement op investering met onze intelligente ROI-calculator gebaseerd op uw specifieke bedrijfsgegevens.",
      },
      selfLearningAI: {
        title: "Zelf-lerende AI Analytics",
        subtitle:
          "Onze AI leert continu van uw gegevens om steeds nauwkeurigere inzichten en aanbevelingen te bieden.",
      },
      testimonials: {
        title: "Wat Onze Klanten Zeggen",
        subtitle:
          "Sluit u aan bij duizenden tevreden klanten die hun marketing hebben getransformeerd met ons platform.",
      },
    },
    footer: {
      company: {
        name: "FutureMarketingAI",
        description:
          "Volgende generatie AI marketing platform dat content creatie revolutioneert, publicatie automatiseert en ongekende prestatie-optimalisatie levert.",
      },
      links: {
        platform: {
          title: "Platform",
          items: {
            futureMarketingAI: "FutureMarketingAI",
            analyticsSuite: "Analytics Suite",
            automation: "Automatisering",
          },
        },
        resources: {
          title: "Bronnen",
          items: {
            watchDemo: "Bekijk Demo",
            caseStudies: "Case Studies",
            fortune500Demo: "Fortune 500 Demo",
          },
        },
        contact: {
          title: "Contact",
          items: {
            talkToSales: "Praat met Sales",
            support247: "24/7 Ondersteuning",
            globalCoverage: "Wereldwijde Dekking",
          },
        },
      },
      legal: {
        copyright: "© 2024 FutureMarketingAI. Alle rechten voorbehouden.",
        privacy: "Privacybeleid",
        terms: "Algemene Voorwaarden",
      },
    },
  },
} as const;

// Optimized structured data
const generateStructuredData = () => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "FutureMarketingAI",
      description:
        "Next-generation AI marketing platform that revolutionizes content creation, automates publishing, and delivers unprecedented performance optimization",
      url: "https://futuremarketingai.com",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      creator: {
        "@type": "Organization",
        name: "SKC Intelligence",
        url: "https://skc.nl",
      },
      offers: [
        {
          "@type": "Offer",
          name: "FutureMarketingAI Enterprise",
          price: "25000",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          validFrom: "2024-01-01",
        },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "127",
        bestRating: "5",
      },
      features: [
        "AI Content Generation",
        "Multi-platform Publishing",
        "Predictive Analytics",
        "Automated Workflows",
      ],
    },
  ],
});

export default function HomePage() {
  const params = useParams();
  const locale = (
    params?.locale === "nl" ? "nl" : "en"
  ) as keyof typeof translations;
  const t = translations[locale];
  const structuredData = generateStructuredData();

  // Enable landing page specific image optimization
  useImageOptimization("landing-page");

  return (
    <ResponsiveAccessibilityHelper className="min-h-screen bg-slate-950 text-white relative overflow-hidden dark">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:z-[60]"
      >
        Skip to main content
      </a>

      {/* Additional skip links for better accessibility */}
      <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-4 focus-within:right-4 focus-within:z-50 focus-within:bg-slate-800 focus-within:p-2 focus-within:rounded-md focus-within:space-x-2">
        <a
          href="#navigation"
          className="text-white text-sm px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Skip to navigation
        </a>
        <a
          href="#footer"
          className="text-white text-sm px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Skip to footer
        </a>
      </div>

      {/* Optimized Structured Data */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        strategy="afterInteractive"
      />

      {/* AI Generated Background - Immediate load for LCP */}
      <AIGeneratedBackground />

      {/* Header - Critical for navigation */}
      <nav id="navigation" role="navigation" aria-label="Main navigation">
        <ImprovedMarketingHeader />
      </nav>

      {/* Hero Section - Critical above-the-fold content */}
      <FutureMarketingAIHero />

      {/* Main Content Sections - Server-side rendered for SEO */}
      <main
        id="main-content"
        className="relative z-10 py-8 sm:py-16 md:py-24 lg:py-32 bg-gradient-to-b from-slate-950/50 via-slate-900/30 to-slate-950/80"
        role="main"
        aria-label="Homepage content"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
          {/* Platform Demo Section */}
          <section
            className="mb-16 sm:mb-24 md:mb-32 lg:mb-40"
            aria-labelledby="platform-demo-heading"
          >
            <div className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20">
              <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-gradient-to-r from-slate-800/40 to-slate-700/30 border border-blue-500/20 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-sm mb-4 sm:mb-6 md:mb-8">
                <Sparkles
                  className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-400"
                  aria-hidden="true"
                />
                <span className="text-blue-300 font-medium text-xs sm:text-sm">
                  {t.sections.platformDemo.badge}
                </span>
              </div>
              <h2
                id="platform-demo-heading"
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extralight leading-tight bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4 sm:mb-6 md:mb-8 px-2 sm:px-4"
              >
                {t.sections.platformDemo.title}
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed px-2 sm:px-4">
                {t.sections.platformDemo.subtitle}
              </p>
            </div>
            <ProductLifecycleVisualization
              className="mb-6 sm:mb-8"
              autoProgress={true}
              progressInterval={6000}
            />
          </section>

          {/* ROI Calculator Section */}
          <section
            className="mb-16 sm:mb-24 md:mb-32 lg:mb-40"
            aria-labelledby="roi-heading"
          >
            <div className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20">
              <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-800/40 to-green-700/30 border border-green-500/20 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-sm mb-4 sm:mb-6 md:mb-8">
                <Sparkles
                  className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-400"
                  aria-hidden="true"
                />
                <span className="text-green-300 font-medium text-xs sm:text-sm">
                  {t.sections.roiAssessment.badge}
                </span>
              </div>
              <h2
                id="roi-heading"
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extralight leading-tight bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 sm:mb-6 md:mb-8 px-2 sm:px-4"
              >
                {t.sections.roiAssessment.title}
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed px-2 sm:px-4">
                {t.sections.roiAssessment.subtitle}
              </p>
            </div>
            <InteractiveROICalculator />
          </section>

          {/* Progressive Pricing Section */}
          <section
            className="mb-16 sm:mb-24 md:mb-32 lg:mb-40"
            aria-labelledby="pricing-heading"
          >
            <ProgressivePricingDisplay />
          </section>

          {/* Self-Learning Analytics */}
          <section
            className="mb-16 sm:mb-20 md:mb-24 lg:mb-32"
            aria-labelledby="analytics-heading"
          >
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2
                id="analytics-heading"
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-3 sm:mb-4 md:mb-6 px-2 sm:px-4"
              >
                {t.sections.selfLearningAI.title}
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto px-2 sm:px-4">
                {t.sections.selfLearningAI.subtitle}
              </p>
            </div>
            <SelfLearningAnalyticsDashboard />
          </section>

          {/* Enterprise Demo Showcase */}
          <section
            className="mb-16 sm:mb-24 md:mb-32 lg:mb-40"
            aria-labelledby="demo-heading"
          >
            <div className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20">
              <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-800/40 to-red-700/30 border border-orange-500/20 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-sm mb-4 sm:mb-6 md:mb-8">
                <Sparkles
                  className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-orange-400"
                  aria-hidden="true"
                />
                <span className="text-orange-300 font-medium text-xs sm:text-sm">
                  Enterprise Demo
                </span>
              </div>
              <h2
                id="demo-heading"
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extralight leading-tight bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent mb-4 sm:mb-6 md:mb-8 px-2 sm:px-4"
              >
                Enterprise Experience
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed mb-6 sm:mb-8 md:mb-12 px-2 sm:px-4">
                Ontdek hoe Fortune 500 bedrijven onze platform gebruiken voor
                enterprise-grade marketing automation en AI-gedreven groei.
              </p>

              {/* Demo Preview Cards - Improved mobile layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-6 sm:mb-8 md:mb-12">
                <article className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 hover:border-orange-500/30 transition-all duration-300 group focus-within:border-orange-500/50">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Building2
                      className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">
                    Executive Dashboard
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    C-level command center met real-time KPI&apos;s en
                    strategische insights
                  </p>
                </article>

                <article className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 hover:border-orange-500/30 transition-all duration-300 group focus-within:border-orange-500/50">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Brain
                      className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">
                    AI Intelligence
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    Machine learning insights voor voorspellingen en
                    strategische voordelen
                  </p>
                </article>

                <article className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 hover:border-orange-500/30 transition-all duration-300 group sm:col-span-2 lg:col-span-1 focus-within:border-orange-500/50">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Zap
                      className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">
                    Marketing Automation
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    Volledig geautomatiseerde workflows met 340% ROI verbetering
                  </p>
                </article>
              </div>

              {/* CTA Button - Enhanced for mobile with better touch targets */}
              <Link href="/demo" aria-label="Start Enterprise Demo Experience">
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <div className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 sm:py-4 md:py-5 px-4 sm:px-6 md:px-8 rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg min-h-[48px] sm:min-h-[52px] md:min-h-[56px] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-950 w-full sm:w-auto max-w-sm sm:max-w-none mx-auto">
                    <Play
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      aria-hidden="true"
                    />
                    <span>Ervaar Demo</span>
                    <ArrowUpRight
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      aria-hidden="true"
                    />
                  </div>
                </motion.div>
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Social Analytics Section */}
      <FutureMarketingAISocialAnalytics />

      {/* Footer */}
      <footer
        id="footer"
        className="relative z-10 bg-slate-950 border-t border-slate-800"
        role="contentinfo"
        aria-label="Website footer"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
            {/* Company Info */}
            <div className="sm:col-span-2 lg:col-span-2">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 sm:mb-3 md:mb-4">
                {t.footer.company.name}
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 md:mb-6 max-w-md">
                {t.footer.company.description}
              </p>
              <div className="flex space-x-3 sm:space-x-4">
                <Link
                  href="/linkedin"
                  className="text-slate-400 hover:text-blue-400 transition-colors p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Follow us on LinkedIn"
                >
                  <span className="sr-only">LinkedIn</span>
                  {/* Add LinkedIn icon */}
                </Link>
                <Link
                  href="/twitter"
                  className="text-slate-400 hover:text-blue-400 transition-colors p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Follow us on Twitter"
                >
                  <span className="sr-only">Twitter</span>
                  {/* Add Twitter icon */}
                </Link>
              </div>
            </div>

            {/* Platform Links */}
            <nav>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base">
                {t.footer.links.platform.title}
              </h4>
              <ul className="space-y-1 sm:space-y-2 md:space-y-3 text-xs sm:text-sm">
                <li>
                  <Link
                    href="/"
                    className="text-slate-400 hover:text-white transition-colors py-1 focus:outline-none focus:text-white block min-h-[32px] flex items-center"
                  >
                    {t.footer.links.platform.items.futureMarketingAI}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/analytics"
                    className="text-slate-400 hover:text-white transition-colors py-1 focus:outline-none focus:text-white block min-h-[32px] flex items-center"
                  >
                    {t.footer.links.platform.items.analyticsSuite}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/automation"
                    className="text-slate-400 hover:text-white transition-colors py-1 focus:outline-none focus:text-white block min-h-[32px] flex items-center"
                  >
                    {t.footer.links.platform.items.automation}
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Resources Links */}
            <nav className="sm:col-start-2 lg:col-start-4">
              <h4 className="text-white font-semibold mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base">
                {t.footer.links.resources.title}
              </h4>
              <ul className="space-y-1 sm:space-y-2 md:space-y-3 text-xs sm:text-sm">
                <li>
                  <Link
                    href="/demo"
                    className="text-slate-400 hover:text-white transition-colors py-1 focus:outline-none focus:text-white block min-h-[32px] flex items-center"
                  >
                    {t.footer.links.resources.items.watchDemo}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/case-studies"
                    className="text-slate-400 hover:text-white transition-colors py-1 focus:outline-none focus:text-white block min-h-[32px] flex items-center"
                  >
                    {t.footer.links.resources.items.caseStudies}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/demo"
                    className="text-slate-400 hover:text-white transition-colors py-1 focus:outline-none focus:text-white block min-h-[32px] flex items-center"
                  >
                    {t.footer.links.resources.items.fortune500Demo}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Bottom Bar */}
          <div className="mt-6 sm:mt-8 md:mt-12 pt-4 sm:pt-6 md:pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 text-center sm:text-left">
            <p className="text-slate-400 text-xs sm:text-sm">
              {t.footer.legal.copyright}
            </p>
            <nav className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 md:space-x-6">
              <Link
                href="/privacy"
                className="text-slate-400 hover:text-white text-xs sm:text-sm transition-colors py-1 focus:outline-none focus:text-white min-h-[32px] flex items-center justify-center"
              >
                {t.footer.legal.privacy}
              </Link>
              <Link
                href="/terms"
                className="text-slate-400 hover:text-white text-xs sm:text-sm transition-colors py-1 focus:outline-none focus:text-white min-h-[32px] flex items-center justify-center"
              >
                {t.footer.legal.terms}
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </ResponsiveAccessibilityHelper>
  );
}
