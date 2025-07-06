"use client";

import Link from "next/link";
import Script from "next/script";
import { useParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { ImprovedMarketingHeader } from "@/components/layout/improved-marketing-header";
import { FutureMarketingAIHero } from "@/components/layout/future-marketing-ai-hero";
import { AIGeneratedBackground } from "@/components/layout/ai-generated-background";
import { FutureMarketingAISocialAnalytics } from "@/components/layout/future-marketing-ai-social-analytics";
import { ProductLifecycleVisualization } from "@/components/marketing/product-lifecycle-visualization";
import { InteractiveROICalculator } from "@/components/marketing/interactive-roi-calculator";
import { DynamicTestimonialsPricing } from "@/components/marketing/dynamic-testimonials-pricing";
import SelfLearningAnalyticsDashboard from "@/components/marketing/self-learning-analytics-dashboard";

// Archive translations
const translations = {
  en: {
    archiveNotice: {
      title: "FutureMarketingAI Landing Page Archive",
      subtitle: "Archived version saved on January 27, 2025",
      description:
        "This is the preserved version of our homepage showcasing 'Turn content into growth. On autopilot.' with complete Dutch and English support.",
    },
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
    archiveNotice: {
      title: "FutureMarketingAI Landing Page Archief",
      subtitle: "Gearchiveerde versie opgeslagen op 27 januari 2025",
      description:
        "Dit is de bewaarde versie van onze homepage met 'Turn content into growth. On autopilot.' met volledige Nederlandse en Engelse ondersteuning.",
    },
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

// Archive structured data
const generateStructuredData = () => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: "FutureMarketingAI Landing Page Archive",
      description:
        "Archived version of FutureMarketingAI homepage featuring 'Turn content into growth. On autopilot.' - saved January 27, 2025",
      url: "https://futuremarketingai.com/future-marketing-ai-landing-page-archive",
      isPartOf: {
        "@type": "WebSite",
        name: "FutureMarketingAI",
        url: "https://futuremarketingai.com",
      },
      dateModified: "2025-01-27",
      inLanguage: ["en", "nl"],
    },
  ],
});

export default function FutureMarketingAILandingPageArchive() {
  const params = useParams();
  const locale = (
    params?.locale === "nl" ? "nl" : "en"
  ) as keyof typeof translations;
  const t = translations[locale];
  const structuredData = generateStructuredData();

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden dark">
      <Script
        id="structured-data-archive"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        strategy="afterInteractive"
      />

      {/* Archive Notice */}
      <div className="relative z-50 bg-gradient-to-r from-blue-900/90 via-purple-900/90 to-blue-900/90 backdrop-blur-sm border-b border-blue-500/30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="text-center">
            <h1 className="text-lg font-bold text-white mb-1">
              {t.archiveNotice.title}
            </h1>
            <p className="text-blue-200 text-sm mb-1">
              {t.archiveNotice.subtitle}
            </p>
            <p className="text-blue-300 text-xs max-w-4xl mx-auto">
              {t.archiveNotice.description}
            </p>
          </div>
        </div>
      </div>

      <AIGeneratedBackground />
      <ImprovedMarketingHeader />
      <FutureMarketingAIHero />

      <main className="relative z-10 py-32 bg-gradient-to-b from-slate-950/50 via-slate-900/30 to-slate-950/80">
        <div className="max-w-7xl mx-auto px-8 lg:px-12">
          {/* Platform Demo Section */}
          <section className="mb-40" aria-labelledby="platform-demo-heading">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-slate-800/40 to-slate-700/30 border border-blue-500/20 rounded-2xl backdrop-blur-sm mb-8">
                <Sparkles
                  className="w-5 h-5 text-blue-400"
                  aria-hidden="true"
                />
                <span className="text-blue-300 font-medium text-sm">
                  {t.sections.platformDemo.badge}
                </span>
              </div>
              <h2
                id="platform-demo-heading"
                className="text-5xl md:text-7xl font-extralight leading-tight bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-8"
              >
                {t.sections.platformDemo.title}
              </h2>
              <p className="text-xl lg:text-2xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed">
                {t.sections.platformDemo.subtitle}
              </p>
            </div>
            <ProductLifecycleVisualization
              className="mb-8"
              autoProgress={true}
              progressInterval={6000}
            />
          </section>

          {/* ROI Calculator Section */}
          <section className="mb-40" aria-labelledby="roi-heading">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-800/40 to-green-700/30 border border-green-500/20 rounded-2xl backdrop-blur-sm mb-8">
                <Sparkles
                  className="w-5 h-5 text-green-400"
                  aria-hidden="true"
                />
                <span className="text-green-300 font-medium text-sm">
                  {t.sections.roiAssessment.badge}
                </span>
              </div>
              <h2
                id="roi-heading"
                className="text-5xl md:text-7xl font-extralight leading-tight bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-8"
              >
                {t.sections.roiAssessment.title}
              </h2>
              <p className="text-xl lg:text-2xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed">
                {t.sections.roiAssessment.subtitle}
              </p>
            </div>
            <InteractiveROICalculator />
          </section>

          {/* Self-Learning Analytics */}
          <section className="mb-32" aria-labelledby="analytics-heading">
            <div className="text-center mb-16">
              <h2
                id="analytics-heading"
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-6"
              >
                {t.sections.selfLearningAI.title}
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                {t.sections.selfLearningAI.subtitle}
              </p>
            </div>
            <SelfLearningAnalyticsDashboard />
          </section>

          {/* Testimonials and Pricing */}
          <section className="mb-16" aria-labelledby="testimonials-heading">
            <div className="text-center mb-16">
              <h2
                id="testimonials-heading"
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6"
              >
                {t.sections.testimonials.title}
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                {t.sections.testimonials.subtitle}
              </p>
            </div>
            <DynamicTestimonialsPricing />
          </section>
        </div>
      </main>

      <FutureMarketingAISocialAnalytics />

      {/* Footer */}
      <footer className="relative z-10 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                {t.footer.company.name}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-md">
                {t.footer.company.description}
              </p>
            </div>

            {/* Platform Links */}
            <div>
              <h4 className="text-white font-semibold mb-6">
                {t.footer.links.platform.title}
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {t.footer.links.platform.items.futureMarketingAI}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/analytics"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {t.footer.links.platform.items.analyticsSuite}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/automation"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {t.footer.links.platform.items.automation}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Links */}
            <div>
              <h4 className="text-white font-semibold mb-6">
                {t.footer.links.contact.title}
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/contact"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {t.footer.links.contact.items.talkToSales}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {t.footer.links.contact.items.support247}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/global"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {t.footer.links.contact.items.globalCoverage}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">{t.footer.legal.copyright}</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <Link
                href="/privacy"
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                {t.footer.legal.privacy}
              </Link>
              <Link
                href="/terms"
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                {t.footer.legal.terms}
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Archive Preservation Notice */}
      <div className="fixed bottom-4 left-4 z-50 bg-blue-900/90 backdrop-blur-sm border border-blue-500/30 rounded-lg px-4 py-2 max-w-sm">
        <p className="text-blue-200 text-xs">
          📁 {locale === "nl" ? "Gearchiveerde versie" : "Archived version"} -
          27/01/2025
        </p>
      </div>
    </div>
  );
}
