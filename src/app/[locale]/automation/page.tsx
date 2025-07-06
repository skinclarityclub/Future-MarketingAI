"use client";

import { ImprovedMarketingHeader } from "@/components/layout/improved-marketing-header";
import {
  Zap,
  Clock,
  Target,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Play,
  Calendar,
  MessageSquare,
  Mail,
  Settings,
  TrendingUp,
  Users,
  Lightbulb,
  RefreshCw,
  Bot,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AutomationPage() {
  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ImprovedMarketingHeader />
      <div className="pt-16">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-blue-900/20 to-slate-900/20" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-32">
            <div className="text-center mb-12 sm:mb-16 md:mb-20">
              <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-800/40 to-blue-700/30 border border-orange-500/20 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-sm mb-6 sm:mb-8">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-orange-400" />
                <span className="text-orange-300 font-medium text-xs sm:text-sm">
                  Marketing Automation
                </span>
                <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extralight leading-tight bg-gradient-to-r from-orange-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6 sm:mb-8 px-2 sm:px-4">
                Automatisering
              </h1>

              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed px-2 sm:px-4 mb-8 sm:mb-12">
                Slimme automatisering voor groeiende bedrijven die hun marketing
                efficiency willen verhogen
              </p>
            </div>
          </div>
        </section>

        {/* Automation Benefits */}
        <section className="relative py-16 sm:py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent mb-4 sm:mb-6">
                Waarom automatisering?
              </h2>
              <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
                Bespaar tijd, verhoog consistentie en focus op wat echt
                belangrijk is: uw klanten
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {/* Time Savings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Clock className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                  75% Tijdsbesparing
                </h3>
                <p className="text-slate-400 text-sm sm:text-base">
                  Automatiseer repetitieve taken en focus op strategische groei
                </p>
              </motion.div>

              {/* Accuracy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Target className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                  99% Nauwkeurigheid
                </h3>
                <p className="text-slate-400 text-sm sm:text-base">
                  Elimineer menselijke fouten en verhoog de kwaliteit van uw
                  campaigns
                </p>
              </motion.div>

              {/* Scalability */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <TrendingUp className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                  Schaal Moeiteloos
                </h3>
                <p className="text-slate-400 text-sm sm:text-base">
                  Groei van €250K naar €2M+ zonder extra marketingpersoneel
                </p>
              </motion.div>

              {/* ROI */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <BarChart3 className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                  3x Hogere ROI
                </h3>
                <p className="text-slate-400 text-sm sm:text-base">
                  Meetbare verbetering in lead generation en conversie
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Automation Features */}
        <section className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-r from-slate-900/50 to-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 sm:mb-6">
                Automatisatie mogelijkheden
              </h2>
              <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
                Van content creatie tot klantcommunicatie - alles volledig
                geautomatiseerd
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Content Automation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-blue-500/20 backdrop-blur-sm hover:border-blue-500/40 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    Content Automatisering
                  </h3>
                </div>
                <p className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6">
                  Automatische content creatie voor social media, blogs en email
                  campaigns
                </p>
                <div className="space-y-2 sm:space-y-3">
                  {[
                    "Social media posts",
                    "Blog artikelen",
                    "Email newsletters",
                    "Product beschrijvingen",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Email Automation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-green-500/20 backdrop-blur-sm hover:border-green-500/40 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    Email Automatisering
                  </h3>
                </div>
                <p className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6">
                  Gepersonaliseerde email sequences die leads converteren naar
                  klanten
                </p>
                <div className="space-y-2 sm:space-y-3">
                  {[
                    "Welcome sequences",
                    "Lead nurturing",
                    "Abandoned cart recovery",
                    "Re-engagement campaigns",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Social Media Automation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-purple-500/20 backdrop-blur-sm hover:border-purple-500/40 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    Social Media
                  </h3>
                </div>
                <p className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6">
                  Automatische posting en community management voor alle
                  platforms
                </p>
                <div className="space-y-2 sm:space-y-3">
                  {[
                    "Cross-platform posting",
                    "Optimal timing",
                    "Hashtag optimization",
                    "Response automation",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Lead Management */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-orange-500/20 backdrop-blur-sm hover:border-orange-500/40 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    Lead Management
                  </h3>
                </div>
                <p className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6">
                  Automatische lead scoring, segmentatie en follow-up processen
                </p>
                <div className="space-y-2 sm:space-y-3">
                  {[
                    "Lead scoring",
                    "Automatische segmentatie",
                    "Follow-up sequences",
                    "Sales handoff",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Analytics Automation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-cyan-500/20 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    Analytics & Rapportage
                  </h3>
                </div>
                <p className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6">
                  Automatische performance tracking en gedetailleerde rapportage
                </p>
                <div className="space-y-2 sm:space-y-3">
                  {[
                    "Performance dashboards",
                    "Automated reports",
                    "ROI tracking",
                    "Competitive analysis",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Workflow Automation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-yellow-500/20 backdrop-blur-sm hover:border-yellow-500/40 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    Workflow Automatisering
                  </h3>
                </div>
                <p className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6">
                  Verbind al uw marketing tools en creëer naadloze workflows
                </p>
                <div className="space-y-2 sm:space-y-3">
                  {[
                    "Tool integraties",
                    "Trigger-based actions",
                    "Conditional workflows",
                    "Multi-step sequences",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Implementation Process */}
        <section className="relative py-16 sm:py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4 sm:mb-6">
                Implementatie proces
              </h2>
              <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
                Van strategie tot volledige automatisering in 4 concrete stappen
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                {
                  step: "1",
                  title: "Audit & Strategie",
                  description:
                    "Analyse van huidige processen en identificatie van automatisering kansen",
                  icon: Lightbulb,
                  color: "from-blue-500 to-purple-500",
                },
                {
                  step: "2",
                  title: "Setup & Configuratie",
                  description:
                    "Installatie en configuratie van alle automatiseringstools en workflows",
                  icon: Settings,
                  color: "from-purple-500 to-pink-500",
                },
                {
                  step: "3",
                  title: "Testing & Optimalisatie",
                  description:
                    "Uitgebreide testing en fine-tuning voor optimale performance",
                  icon: RefreshCw,
                  color: "from-green-500 to-teal-500",
                },
                {
                  step: "4",
                  title: "Monitoring & Schalem",
                  description:
                    "Continue monitoring en scaling van automatiseringsprocessen",
                  icon: TrendingUp,
                  color: "from-orange-500 to-red-500",
                },
              ].map((phase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-slate-500/20 backdrop-blur-sm hover:border-slate-500/40 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${phase.color} rounded-lg flex items-center justify-center`}
                      >
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
                    <p className="text-slate-400 text-sm sm:text-base">
                      {phase.description}
                    </p>
                  </div>
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform -translate-y-1/2" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Metrics */}
        <section className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-4 sm:mb-6">
                Resultaten die tellen
              </h2>
              <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
                Concrete resultaten van bedrijven die automatisering hebben
                geïmplementeerd
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                {
                  metric: "89%",
                  label: "Minder handmatige taken",
                  icon: Clock,
                },
                {
                  metric: "156%",
                  label: "Meer gekwalificeerde leads",
                  icon: Target,
                },
                {
                  metric: "€347K",
                  label: "Gemiddelde extra omzet",
                  icon: TrendingUp,
                },
                {
                  metric: "3.2x",
                  label: "Snellere groeicyclus",
                  icon: RefreshCw,
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <stat.icon className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
                    {stat.metric}
                  </div>
                  <div className="text-slate-400 text-sm sm:text-base">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-16 sm:py-20 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-6 sm:mb-8">
              Klaar om uw marketing te automatiseren?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg md:text-xl mb-8 sm:mb-12">
              Ontdek hoe automatisering uw bedrijf kan transformeren van €250K
              naar €2M+ omzet
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <button className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg sm:rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
                <Play className="w-5 h-5" />
                Bekijk Demo
              </button>
              <button className="px-6 sm:px-8 py-3 sm:py-4 border border-orange-500/50 text-orange-400 rounded-lg sm:rounded-xl font-medium hover:bg-orange-500/10 transition-all duration-300 flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" />
                Plan Gratis Consult
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
