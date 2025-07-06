"use client";

import { ImprovedMarketingHeader } from "@/components/layout/improved-marketing-header";
import { ProgressivePricingDisplay } from "@/components/marketing/progressive-pricing-display";
import { motion } from "framer-motion";
import { TrendingUp, Sparkles, Shield, Zap, Users, Check } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Marketing Header */}
      <ImprovedMarketingHeader />

      {/* Main Content with top padding for fixed header */}
      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-slate-900/20" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-32">
            <div className="text-center mb-12 sm:mb-16 md:mb-20">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-800/40 to-purple-700/30 border border-blue-500/20 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-sm mb-6 sm:mb-8">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-400" />
                <span className="text-blue-300 font-medium text-xs sm:text-sm">
                  Investering in de Toekomst
                </span>
                <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extralight leading-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 sm:mb-8 px-2 sm:px-4">
                Transformeer uw Marketing
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed px-2 sm:px-4 mb-8 sm:mb-12">
                Kies het perfecte pakket voor uw bedrijf en ervaar de kracht van
                AI-gedreven marketing automatisering
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 text-slate-400 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>30-Dagen Garantie</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span>Instant Activatie</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="relative py-16 sm:py-20 md:py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProgressivePricingDisplay />
          </div>
        </section>

        {/* Features Comparison */}
        <section className="relative py-16 sm:py-20 md:py-24 bg-slate-950/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-800/40 to-green-700/30 border border-green-500/20 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-sm mb-6 sm:mb-8">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-400" />
                <span className="text-green-300 font-medium text-xs sm:text-sm">
                  Alle Features Overzicht
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extralight leading-tight bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6 sm:mb-8 px-2 sm:px-4">
                Wat krijgt u precies?
              </h2>

              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed px-2 sm:px-4">
                Een complete vergelijking van alle features en mogelijkheden per
                pakket
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* MarketingMachine Features */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-slate-900/40 via-blue-900/20 to-slate-900/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 sm:p-8"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                  MarketingMachine
                </h3>
                <p className="text-slate-300 text-sm mb-6">
                  Complete AI marketing automatisering
                </p>

                <div className="space-y-3">
                  {[
                    "AI Content Generation",
                    "Multi-platform Publishing",
                    "Email Marketing Automation",
                    "Social Media Scheduling",
                    "A/B Testing Suite",
                    "Performance Analytics",
                    "CRM Integration",
                    "24/7 Content Optimization",
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 text-sm text-slate-300"
                    >
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Power Suite Features */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gradient-to-br from-amber-900/40 via-yellow-900/30 to-orange-900/40 backdrop-blur-xl border border-yellow-500/50 rounded-2xl p-6 sm:p-8 ring-2 ring-yellow-500/30"
              >
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    Power Suite
                  </h3>
                  <div className="px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
                    POPULAIR
                  </div>
                </div>
                <p className="text-slate-300 text-sm mb-6">
                  Marketing + BI Dashboard + Premium Support
                </p>

                <div className="space-y-3">
                  {[
                    "Alles van MarketingMachine",
                    "Business Intelligence Dashboard",
                    "Advanced Workflow Automation",
                    "Custom Integrations",
                    "Dedicated Success Manager",
                    "Priority Support",
                    "Custom Training Program",
                    "White-label Options",
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 text-sm text-slate-300"
                    >
                      <Check className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Intelligence Hub Features */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-gradient-to-br from-slate-900/40 via-emerald-900/20 to-slate-900/40 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6 sm:p-8"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                  Intelligence Hub
                </h3>
                <p className="text-slate-300 text-sm mb-6">
                  Advanced business intelligence en analytics
                </p>

                <div className="space-y-3">
                  {[
                    "Executive Dashboard",
                    "Financial Intelligence",
                    "Customer Analytics",
                    "Marketing Attribution",
                    "Predictive Analytics",
                    "Custom Reports",
                    "Real-time Monitoring",
                    "Advanced Segmentation",
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 text-sm text-slate-300"
                    >
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="relative py-16 sm:py-20 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extralight leading-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 sm:mb-8">
                Veelgestelde Vragen
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto">
                Alles wat u moet weten over onze pricing en packages
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  q: "Kan ik later upgraden of downgraden?",
                  a: "Ja, u kunt op elk moment upgraden naar een hoger pakket. Bij downgrades geldt een opzegtermijn van 30 dagen.",
                },
                {
                  q: "Wat gebeurt er na de 30-dagen garantie?",
                  a: "Als u niet volledig tevreden bent, krijgt u binnen 30 dagen uw geld volledig terug, geen vragen gesteld.",
                },
                {
                  q: "Zijn er setup kosten?",
                  a: "Nee, alle packages hebben geen setup kosten. U betaalt alleen de maandelijkse of jaarlijkse subscription.",
                },
                {
                  q: "Hoe werkt de dedicated success manager?",
                  a: "Bij de Power Suite krijgt u een persoonlijke success manager die u helpt met onboarding, training en ongoing optimization.",
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {faq.q}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
