"use client";

import { ImprovedMarketingHeader } from "@/components/layout/improved-marketing-header";
import {
  BarChart3,
  TrendingUp,
  Target,
  Eye,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  PieChart,
  LineChart,
  Activity,
  Globe,
  Zap,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ImprovedMarketingHeader />
      <div className="pt-16">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-emerald-900/20 to-slate-900/20" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-32">
            <div className="text-center mb-12 sm:mb-16 md:mb-20">
              <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-800/40 to-blue-700/30 border border-emerald-500/20 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-sm mb-6 sm:mb-8">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-emerald-400" />
                <span className="text-emerald-300 font-medium text-xs sm:text-sm">
                  Analytics Suite
                </span>
                <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extralight leading-tight bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6 sm:mb-8 px-2 sm:px-4">
                Analytics Suite
              </h1>

              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed px-2 sm:px-4 mb-8 sm:mb-12">
                Inzichtelijke analytics voor groeiende bedrijven die
                data-gedreven beslissingen willen maken
              </p>
            </div>
          </div>
        </section>

        {/* Analytics Benefits */}
        <section className="relative py-16 sm:py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-4 sm:mb-6">
                Waarom analytics belangrijk zijn?
              </h2>
              <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
                Maak weloverwogen beslissingen gebaseerd op concrete data in
                plaats van gevoel
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {/* Clear Insights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Eye className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                  Duidelijke Inzichten
                </h3>
                <p className="text-slate-400 text-sm sm:text-base">
                  Begrijp precies waar uw marketing budget het meeste effect
                  heeft
                </p>
              </motion.div>

              {/* ROI Tracking */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <DollarSign className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                  ROI Tracking
                </h3>
                <p className="text-slate-400 text-sm sm:text-base">
                  Meet exact welke campagnes uw omzet van €250K naar €2M+ stuwt
                </p>
              </motion.div>

              {/* Real-time Monitoring */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Activity className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                  Real-time Monitoring
                </h3>
                <p className="text-slate-400 text-sm sm:text-base">
                  Houd uw performance 24/7 in de gaten met live dashboards
                </p>
              </motion.div>

              {/* Predictive Analytics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <TrendingUp className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                  Voorspellende Analytics
                </h3>
                <p className="text-slate-400 text-sm sm:text-base">
                  Anticipeer op trends en optimaliseer proactief uw strategie
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Analytics Features */}
        <section className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-r from-slate-900/50 to-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 sm:mb-6">
                Complete analytics suite
              </h2>
              <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
                Alles wat u nodig heeft om uw marketing performance te meten en
                optimaliseren
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Performance Dashboards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-emerald-500/20 backdrop-blur-sm hover:border-emerald-500/40 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    Performance Dashboards
                  </h3>
                </div>
                <p className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6">
                  Overzichtelijke dashboards met alle belangrijke metrics op één
                  plek
                </p>
                <div className="space-y-2 sm:space-y-3">
                  {[
                    "Revenue tracking",
                    "Lead generation metrics",
                    "Campaign performance",
                    "Customer acquisition costs",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Customer Analytics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-blue-500/20 backdrop-blur-sm hover:border-blue-500/40 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    Customer Analytics
                  </h3>
                </div>
                <p className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6">
                  Begrijp uw klanten beter met gedetailleerde gedragsanalyses
                </p>
                <div className="space-y-2 sm:space-y-3">
                  {[
                    "Customer segmentation",
                    "Lifetime value tracking",
                    "Churn prediction",
                    "Engagement scoring",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Marketing Attribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-purple-500/20 backdrop-blur-sm hover:border-purple-500/40 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    Marketing Attribution
                  </h3>
                </div>
                <p className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6">
                  Ontdek welke touchpoints leiden tot conversies en sales
                </p>
                <div className="space-y-2 sm:space-y-3">
                  {[
                    "Multi-touch attribution",
                    "Customer journey mapping",
                    "Channel effectiveness",
                    "Conversion path analysis",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Content Performance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-orange-500/20 backdrop-blur-sm hover:border-orange-500/40 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <PieChart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    Content Performance
                  </h3>
                </div>
                <p className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6">
                  Analyseer welke content uw audience het beste aanspreekt
                </p>
                <div className="space-y-2 sm:space-y-3">
                  {[
                    "Content engagement tracking",
                    "Social media analytics",
                    "Blog performance metrics",
                    "Video & image analytics",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-400" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Competitive Intelligence */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-cyan-500/20 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    Competitive Intelligence
                  </h3>
                </div>
                <p className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6">
                  Houd uw concurrenten in de gaten en identificeer kansen
                </p>
                <div className="space-y-2 sm:space-y-3">
                  {[
                    "Competitor tracking",
                    "Market share analysis",
                    "Pricing intelligence",
                    "Strategy benchmarking",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-cyan-400" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Automated Reporting */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-yellow-500/20 backdrop-blur-sm hover:border-yellow-500/40 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    Automated Reporting
                  </h3>
                </div>
                <p className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6">
                  Ontvang automatisch gegenereerde rapporten op maat
                </p>
                <div className="space-y-2 sm:space-y-3">
                  {[
                    "Weekly performance reports",
                    "Monthly growth summaries",
                    "Custom stakeholder dashboards",
                    "Alert notifications",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-yellow-400" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Key Metrics for Scale-ups */}
        <section className="relative py-16 sm:py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4 sm:mb-6">
                Belangrijkste metrics voor groeiende bedrijven
              </h2>
              <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
                Focus op de KPI's die echt uitmaken voor uw bedrijfsgroei van
                €250K naar €2M+
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                {
                  title: "Customer Acquisition Cost",
                  description:
                    "Hoeveel kost het om een nieuwe klant te werven?",
                  icon: DollarSign,
                  color: "from-emerald-500 to-teal-500",
                  metric: "€47",
                  context: "Gemiddeld voor 250K-2M bedrijven",
                },
                {
                  title: "Customer Lifetime Value",
                  description:
                    "Wat is een klant waard gedurende de hele relatie?",
                  icon: TrendingUp,
                  color: "from-blue-500 to-purple-500",
                  metric: "€2,340",
                  context: "5x ROI op acquisitie kosten",
                },
                {
                  title: "Monthly Recurring Revenue",
                  description: "Hoeveel voorspelbare omzet heeft u per maand?",
                  icon: RefreshCw,
                  color: "from-purple-500 to-pink-500",
                  metric: "€167K",
                  context: "Gemiddelde MRR growth 23%/maand",
                },
                {
                  title: "Conversion Rate",
                  description:
                    "Hoeveel leads converteren naar betalende klanten?",
                  icon: Target,
                  color: "from-orange-500 to-red-500",
                  metric: "3.7%",
                  context: "Industry benchmark voor B2B",
                },
              ].map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-slate-500/20 backdrop-blur-sm hover:border-slate-500/40 transition-all duration-300"
                >
                  <div
                    className={`w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r ${metric.color} rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6`}
                  >
                    <metric.icon className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 text-center">
                    {metric.title}
                  </h3>
                  <p className="text-slate-400 text-sm sm:text-base mb-3 sm:mb-4 text-center">
                    {metric.description}
                  </p>
                  <div className="text-center">
                    <div
                      className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${metric.color} bg-clip-text text-transparent mb-1`}
                    >
                      {metric.metric}
                    </div>
                    <div className="text-slate-500 text-xs sm:text-sm">
                      {metric.context}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Implementation Process */}
        <section className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-4 sm:mb-6">
                Analytics implementatie in 3 stappen
              </h2>
              <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
                Van setup tot actionable insights in slechts enkele weken
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  step: "1",
                  title: "Data Connectie",
                  description:
                    "Verbind al uw marketing tools en platforms voor een volledig overzicht",
                  icon: Zap,
                  features: [
                    "Tool integraties",
                    "Data synchronisatie",
                    "Quality checks",
                  ],
                },
                {
                  step: "2",
                  title: "Dashboard Setup",
                  description:
                    "Configureer gepersonaliseerde dashboards voor uw specifieke business doelen",
                  icon: LineChart,
                  features: [
                    "Custom dashboards",
                    "KPI configuratie",
                    "Alert settings",
                  ],
                },
                {
                  step: "3",
                  title: "Insights & Optimalisatie",
                  description:
                    "Begin met data-gedreven beslissingen en continue optimalisatie",
                  icon: Lightbulb,
                  features: [
                    "Performance analysis",
                    "Recommendations",
                    "Growth planning",
                  ],
                },
              ].map((phase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-slate-500/20 backdrop-blur-sm hover:border-slate-500/40 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <phase.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {phase.step}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                      {phase.title}
                    </h3>
                    <p className="text-slate-400 text-sm sm:text-base mb-4 sm:mb-6">
                      {phase.description}
                    </p>
                    <div className="space-y-2">
                      {phase.features.map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span className="text-slate-300 text-sm">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {index < 2 && (
                    <div className="hidden sm:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 transform -translate-y-1/2" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-16 sm:py-20 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-6 sm:mb-8">
              Klaar voor data-gedreven groei?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg md:text-xl mb-8 sm:mb-12">
              Start vandaag nog met analytics die uw bedrijf van €250K naar €2M+
              kunnen helpen groeien
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <button className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg sm:rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Bekijk Live Demo
              </button>
              <button className="px-6 sm:px-8 py-3 sm:py-4 border border-emerald-500/50 text-emerald-400 rounded-lg sm:rounded-xl font-medium hover:bg-emerald-500/10 transition-all duration-300 flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                Plan Gratis Setup
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
