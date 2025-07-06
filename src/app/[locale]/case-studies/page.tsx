"use client";

import { ImprovedMarketingHeader } from "@/components/layout/improved-marketing-header";
import {
  Award,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Clock,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";

// Case Studies Data - Premium Mid-Market Bedrijven (250K-2M omzet)
const caseStudies = [
  {
    id: 1,
    company: "TechFlow Solutions",
    industry: "SaaS Technology",
    size: "85 employees",
    revenue: "€1.2M ARR",
    location: "Amsterdam, Netherlands",
    challenge:
      "Groeiende organisatie worstelde met inconsistente lead generation en 45% stijging van customer acquisition costs bij schaling van €600K naar €1M+",
    solution:
      "AI-gedreven marketing automatisering met voorspellende analytics voor gepersonaliseerde campaigns en efficiënte leadflow",
    results: {
      revenueGrowth: "87%",
      leadIncrease: "156%",
      costReduction: "43%",
      timeToMarket: "62%",
      customerSatisfaction: "94%",
      newRevenue: "€2.2M ARR",
    },
    timeline: "4 maanden",
    testimonial: {
      quote:
        "FutureMarketingAI heeft ons geholpen van €600K naar €2.2M ARR te groeien. De AI-insights identificeerden nieuwe marktsegmenten die we nooit hadden ontdekt. Perfect voor scale-ups zoals wij.",
      author: "Sarah van der Berg",
      role: "Chief Marketing Officer",
      image: "/testimonials/sarah-vdb.jpg",
    },
    keyFeatures: [
      "AI Content Generation voor Scale-ups",
      "Predictive Lead Scoring",
      "Automated Multi-platform Publishing",
      "Real-time ROI Dashboard",
    ],
  },
  {
    id: 2,
    company: "EcoVision Industries",
    industry: "Sustainable Manufacturing",
    size: "120 employees",
    revenue: "€1.8M jaaromzet",
    location: "Rotterdam, Netherlands",
    challenge:
      "Complexe B2B sales cycles en moeilijkheid om duurzaamheidswaarde te communiceren naar enterprise klanten terwijl het bedrijf groeide van €800K naar €1.5M+",
    solution:
      "Sector-specifieke AI content engine met stakeholder journey mapping en sustainability storytelling voor premium positioning",
    results: {
      revenueGrowth: "78%",
      leadIncrease: "134%",
      costReduction: "38%",
      timeToMarket: "51%",
      customerSatisfaction: "92%",
      newRevenue: "€3.2M jaaromzet",
    },
    timeline: "6 maanden",
    testimonial: {
      quote:
        "Het platform vertaalt complexe sustainability data naar overtuigende verhalen. We groeiden van €1.8M naar €3.2M door betere communicatie met enterprise prospects.",
      author: "Marcus Johnson",
      role: "VP of Business Development",
      image: "/testimonials/marcus-j.jpg",
    },
    keyFeatures: [
      "Industry-specific AI Models",
      "Enterprise Stakeholder Mapping",
      "Sustainability Content Engine",
      "B2B Sales Acceleration",
    ],
  },
  {
    id: 3,
    company: "FinanceForward Group",
    industry: "Financial Services",
    size: "95 employees",
    revenue: "€950K ARR",
    location: "Utrecht, Netherlands",
    challenge:
      "Regulatory compliance bottlenecks in content marketing en moeite met personalisatie op schaal tijdens groei van €400K naar €800K+",
    solution:
      "Compliance-aware AI content generation met automated approval workflows en risk-aware messaging voor financiële sector",
    results: {
      revenueGrowth: "112%",
      leadIncrease: "189%",
      costReduction: "41%",
      timeToMarket: "58%",
      customerSatisfaction: "96%",
      newRevenue: "€2.0M ARR",
    },
    timeline: "5 maanden",
    testimonial: {
      quote:
        "Eindelijk een platform dat de complexiteit van financiële marketing begrijpt. Van €950K naar €2M ARR met volledige regulatory compliance. Game-changer voor groeiende fintech.",
      author: "Elena Rodriguez",
      role: "Head of Digital Marketing",
      image: "/testimonials/elena-r.jpg",
    },
    keyFeatures: [
      "Regulatory Compliance Engine",
      "Automated Content Approval",
      "Personalization op Schaal",
      "Risk-Aware Messaging",
    ],
  },
];

const industryStats = [
  { label: "Technology", companies: 47, avgGrowth: "89%", avgRevenue: "€1.4M" },
  {
    label: "Manufacturing",
    companies: 32,
    avgGrowth: "76%",
    avgRevenue: "€1.8M",
  },
  {
    label: "Financial Services",
    companies: 38,
    avgGrowth: "92%",
    avgRevenue: "€1.2M",
  },
  { label: "Healthcare", companies: 29, avgGrowth: "67%", avgRevenue: "€1.6M" },
  {
    label: "E-commerce",
    companies: 53,
    avgGrowth: "101%",
    avgRevenue: "€1.1M",
  },
  {
    label: "Professional Services",
    companies: 41,
    avgGrowth: "73%",
    avgRevenue: "€1.5M",
  },
];

export default function CaseStudiesPage() {
  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ImprovedMarketingHeader />

      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-slate-900/20" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-32">
            <div className="text-center mb-16 sm:mb-20 md:mb-24">
              <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-800/40 to-emerald-700/30 border border-green-500/20 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-sm mb-6 sm:mb-8">
                <Award className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-400" />
                <span className="text-green-300 font-medium text-xs sm:text-sm">
                  Bewezen Resultaten
                </span>
                <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extralight leading-tight bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6 sm:mb-8 px-2 sm:px-4">
                Klant Succesverhalen
              </h1>

              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed px-2 sm:px-4 mb-12 sm:mb-16">
                Ontdek hoe groeiende bedrijven spectaculaire resultaten
                realiseren met FutureMarketingAI
              </p>

              {/* Success Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-16 sm:mb-20">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                    240+
                  </div>
                  <div className="text-slate-400 text-sm sm:text-base">
                    Tevreden Klanten
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    €347M+
                  </div>
                  <div className="text-slate-400 text-sm sm:text-base">
                    Extra Gegenereerde Omzet
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    89%
                  </div>
                  <div className="text-slate-400 text-sm sm:text-base">
                    Gemiddelde Groei
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
                    5.2M
                  </div>
                  <div className="text-slate-400 text-sm sm:text-base">
                    Sneller €1M+ bereiken
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Case Studies Grid */}
        <section className="relative py-16 sm:py-20 md:py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-20 sm:space-y-24 md:space-y-32">
              {caseStudies.map((study, index) => (
                <motion.div
                  key={study.id}
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="relative"
                >
                  {/* Case Study Card */}
                  <div className="bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 sm:p-10 md:p-12 lg:p-16 hover:border-blue-500/30 transition-all duration-300">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 sm:mb-10 md:mb-12">
                      <div className="mb-6 lg:mb-0">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                          {study.company}
                        </h2>
                        <div className="flex flex-wrap gap-4 text-slate-400 text-sm sm:text-base">
                          <span className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            {study.industry}
                          </span>
                          <span className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {study.size}
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {study.timeline}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          Succesvol Afgerond
                        </span>
                      </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
                      {/* Challenge & Solution */}
                      <div className="space-y-6 sm:space-y-8">
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
                            Uitdaging
                          </h3>
                          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                            {study.challenge}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
                            Oplossing
                          </h3>
                          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                            {study.solution}
                          </p>
                        </div>

                        {/* Key Features */}
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
                            Belangrijkste Features
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            {study.keyFeatures.map((feature, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 text-slate-300 text-sm"
                              >
                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Results */}
                      <div className="space-y-6 sm:space-y-8">
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">
                            Resultaten
                          </h3>
                          <div className="grid grid-cols-2 gap-4 sm:gap-6">
                            <div className="bg-slate-800/50 rounded-2xl p-4 sm:p-6 text-center">
                              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                                +{study.results.revenueGrowth}
                              </div>
                              <div className="text-slate-400 text-xs sm:text-sm">
                                Omzetgroei
                              </div>
                            </div>
                            <div className="bg-slate-800/50 rounded-2xl p-4 sm:p-6 text-center">
                              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                                +{study.results.leadIncrease}
                              </div>
                              <div className="text-slate-400 text-xs sm:text-sm">
                                Meer Leads
                              </div>
                            </div>
                            <div className="bg-slate-800/50 rounded-2xl p-4 sm:p-6 text-center">
                              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                                -{study.results.costReduction}
                              </div>
                              <div className="text-slate-400 text-xs sm:text-sm">
                                Kostenreductie
                              </div>
                            </div>
                            <div className="bg-slate-800/50 rounded-2xl p-4 sm:p-6 text-center">
                              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
                                -{study.results.timeToMarket}
                              </div>
                              <div className="text-slate-400 text-xs sm:text-sm">
                                Sneller Lanceren
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Testimonial */}
                        <div className="bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-slate-900/20 rounded-2xl p-6 sm:p-8">
                          <blockquote className="text-slate-300 text-base sm:text-lg italic leading-relaxed mb-4 sm:mb-6">
                            "{study.testimonial.quote}"
                          </blockquote>
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm sm:text-base font-bold">
                                {study.testimonial.author
                                  .split(" ")
                                  .map(n => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <div>
                              <div className="text-white font-semibold text-sm sm:text-base">
                                {study.testimonial.author}
                              </div>
                              <div className="text-slate-400 text-xs sm:text-sm">
                                {study.testimonial.role}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Industry Overview */}
        <section className="relative py-16 sm:py-20 md:py-24 bg-slate-950/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-800/40 to-purple-700/30 border border-blue-500/20 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-sm mb-6 sm:mb-8">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-400" />
                <span className="text-blue-300 font-medium text-xs sm:text-sm">
                  Industrie Overzicht
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extralight leading-tight bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6 sm:mb-8 px-2 sm:px-4">
                Succes in Elke Sector
              </h2>

              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed px-2 sm:px-4">
                Van tech startups tot Fortune 500 bedrijven - onze
                AI-oplossingen leveren resultaten in elke industrie
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {industryStats.map((industry, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-slate-900/40 via-slate-800/30 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8 hover:border-blue-500/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-white">
                      {industry.label}
                    </h3>
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Scale-ups</span>
                      <span className="text-white font-medium">
                        {industry.companies}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Gem. Groei</span>
                      <span className="text-green-400 font-bold">
                        {industry.avgGrowth}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Gem. Omzet</span>
                      <span className="text-blue-400 font-bold">
                        {industry.avgRevenue}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-16 sm:py-20 md:py-24 lg:py-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-800/40 to-emerald-700/30 border border-green-500/20 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-sm mb-6 sm:mb-8">
              <Award className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-400" />
              <span className="text-green-300 font-medium text-xs sm:text-sm">
                Uw Succes Begint Nu
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extralight leading-tight bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6 sm:mb-8 px-2 sm:px-4">
              Klaar voor uw eigen succesverhaal?
            </h2>

            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed px-2 sm:px-4 mb-8 sm:mb-12">
              Sluit u aan bij honderden bedrijven die al hun marketing hebben
              getransformeerd met FutureMarketingAI
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <button className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl text-base sm:text-lg transition-all duration-300 transform hover:scale-105">
                <span className="relative z-10">Start Gratis Demo</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity -z-10"></div>
              </button>

              <button className="group relative inline-flex items-center justify-center px-8 py-4 bg-slate-800/50 hover:bg-slate-700/50 text-white font-semibold rounded-2xl text-base sm:text-lg transition-all duration-300 border border-slate-600 hover:border-slate-500">
                <span className="relative z-10">Praat met Expert</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
