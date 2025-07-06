"use client";

import { ImprovedMarketingHeader } from "@/components/layout/improved-marketing-header";
import {
  BookOpen,
  Play,
  CheckCircle,
  Settings,
  BarChart,
  Users,
  Lightbulb,
  Target,
  TrendingUp,
  Clock,
  Shield,
  Zap,
  ArrowRight,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";

export default function DocumentationPage() {
  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ImprovedMarketingHeader />
      <div className="pt-16">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-slate-900/20" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-32">
            <div className="text-center mb-12 sm:mb-16 md:mb-20">
              <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-800/40 to-purple-700/30 border border-blue-500/20 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-sm mb-6 sm:mb-8">
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-400" />
                <span className="text-blue-300 font-medium text-xs sm:text-sm">
                  AI Implementation Guide
                </span>
                <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extralight leading-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 sm:mb-8 px-2 sm:px-4">
                Documentatie
              </h1>

              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed px-2 sm:px-4 mb-8 sm:mb-12">
                Complete setup en optimization guides voor maximale resultaten
                met FutureMarketingAI
              </p>
            </div>
          </div>
        </section>

        {/* Implementation Guide Steps */}
        <section className="relative py-16 sm:py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 sm:mb-6">
                AI Implementation in 4 Stappen
              </h2>
              <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
                Van setup tot optimalisatie - een bewezen stappenplan voor
                groeiende bedrijven
              </p>
            </div>

            <div className="grid gap-6 sm:gap-8 md:gap-10 lg:gap-12">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 md:p-10 rounded-xl sm:rounded-2xl md:rounded-3xl border border-blue-500/20 backdrop-blur-sm"
              >
                <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg sm:text-xl md:text-2xl">
                        1
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-3 sm:mb-4">
                      Strategische Planning & Setup
                    </h3>
                    <p className="text-slate-300 text-sm sm:text-base md:text-lg mb-4 sm:mb-6">
                      Definieer je marketing doelen en stel je AI-strategie op
                      voor maximale impact op groei en efficiency.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="text-white font-medium text-sm sm:text-base">
                            Doelgroep Analyse
                          </div>
                          <div className="text-slate-400 text-xs sm:text-sm">
                            Identificeer je ideale klantprofielen
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <BarChart className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="text-white font-medium text-sm sm:text-base">
                            KPI Framework
                          </div>
                          <div className="text-slate-400 text-xs sm:text-sm">
                            Stel meetbare groeidoelstellingen op
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 md:p-10 rounded-xl sm:rounded-2xl md:rounded-3xl border border-purple-500/20 backdrop-blur-sm"
              >
                <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg sm:text-xl md:text-2xl">
                        2
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-3 sm:mb-4">
                      AI Tools Implementatie
                    </h3>
                    <p className="text-slate-300 text-sm sm:text-base md:text-lg mb-4 sm:mb-6">
                      Implementeer en configureer je AI-tools voor content
                      creatie, automation en analytics.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="text-white font-medium text-sm sm:text-base">
                            Content AI Setup
                          </div>
                          <div className="text-slate-400 text-xs sm:text-sm">
                            Configureer AI content generation
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Settings className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="text-white font-medium text-sm sm:text-base">
                            Automation Workflows
                          </div>
                          <div className="text-slate-400 text-xs sm:text-sm">
                            Bouw je marketing automation flows
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 md:p-10 rounded-xl sm:rounded-2xl md:rounded-3xl border border-green-500/20 backdrop-blur-sm"
              >
                <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg sm:text-xl md:text-2xl">
                        3
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-3 sm:mb-4">
                      Team Training & Adoptie
                    </h3>
                    <p className="text-slate-300 text-sm sm:text-base md:text-lg mb-4 sm:mb-6">
                      Train je team in AI-tools en zorg voor succesvolle adoptie
                      doorheen je organisatie.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="text-white font-medium text-sm sm:text-base">
                            Team Onboarding
                          </div>
                          <div className="text-slate-400 text-xs sm:text-sm">
                            Praktische training voor je team
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="text-white font-medium text-sm sm:text-base">
                            Best Practices
                          </div>
                          <div className="text-slate-400 text-xs sm:text-sm">
                            Proven workflows voor je industrie
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 4 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 md:p-10 rounded-xl sm:rounded-2xl md:rounded-3xl border border-orange-500/20 backdrop-blur-sm"
              >
                <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg sm:text-xl md:text-2xl">
                        4
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-3 sm:mb-4">
                      Optimalisatie & Schaling
                    </h3>
                    <p className="text-slate-300 text-sm sm:text-base md:text-lg mb-4 sm:mb-6">
                      Monitor prestaties, optimaliseer je campaigns en schaal je
                      succesvolle AI-strategieën.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="text-white font-medium text-sm sm:text-base">
                            Performance Monitoring
                          </div>
                          <div className="text-slate-400 text-xs sm:text-sm">
                            Real-time tracking van je ROI
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="text-white font-medium text-sm sm:text-base">
                            Scaling Strategies
                          </div>
                          <div className="text-slate-400 text-xs sm:text-sm">
                            Uitbreiden naar nieuwe kanalen
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Resource Library */}
        <section className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-r from-slate-900/50 to-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4 sm:mb-6">
                Resource Library
              </h2>
              <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
                Alles wat je nodig hebt om succesvol te zijn met AI marketing
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Templates */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-blue-500/20 backdrop-blur-sm hover:border-blue-500/40 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    Templates
                  </h3>
                </div>
                <p className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6">
                  Ready-to-use templates voor content, campaigns en workflows
                </p>
                <div className="flex items-center gap-2 text-blue-400 text-sm sm:text-base font-medium group-hover:gap-3 transition-all">
                  <span>Bekijk templates</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>

              {/* Guides */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-purple-500/20 backdrop-blur-sm hover:border-purple-500/40 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    Guides
                  </h3>
                </div>
                <p className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6">
                  Stap-voor-stap handleidingen voor elke fase van je AI journey
                </p>
                <div className="flex items-center gap-2 text-purple-400 text-sm sm:text-base font-medium group-hover:gap-3 transition-all">
                  <span>Lees guides</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>

              {/* Video Tutorials */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-green-500/20 backdrop-blur-sm hover:border-green-500/40 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <Play className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    Video Tutorials
                  </h3>
                </div>
                <p className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6">
                  Praktische video tutorials voor snelle implementatie
                </p>
                <div className="flex items-center gap-2 text-green-400 text-sm sm:text-base font-medium group-hover:gap-3 transition-all">
                  <span>Bekijk video's</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Success Timeline */}
        <section className="relative py-16 sm:py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-4 sm:mb-6">
                Verwachte Timeline
              </h2>
              <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
                Realistische verwachtingen voor je AI transformatie
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {/* Week 1-2 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Clock className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                  Week 1-2
                </h3>
                <p className="text-slate-400 text-sm sm:text-base">
                  Setup & configuratie van je eerste AI workflows
                </p>
              </motion.div>

              {/* Week 3-4 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <TrendingUp className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                  Week 3-4
                </h3>
                <p className="text-slate-400 text-sm sm:text-base">
                  Eerste resultaten zichtbaar in content quality en volume
                </p>
              </motion.div>

              {/* Maand 2 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <BarChart className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                  Maand 2
                </h3>
                <p className="text-slate-400 text-sm sm:text-base">
                  Meetbare verbetering in lead generation en conversie
                </p>
              </motion.div>

              {/* Maand 3+ */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <CheckCircle className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                  Maand 3+
                </h3>
                <p className="text-slate-400 text-sm sm:text-base">
                  Volledig geoptimaliseerde AI marketing machine
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6 sm:mb-8">
              Klaar om te beginnen?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg md:text-xl mb-8 sm:mb-12">
              Onze experts helpen je stap voor stap bij de implementatie van AI
              in je marketing strategie
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <button className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg sm:rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105">
                Start Gratis Consultatie
              </button>
              <button className="px-6 sm:px-8 py-3 sm:py-4 border border-blue-500/50 text-blue-400 rounded-lg sm:rounded-xl font-medium hover:bg-blue-500/10 transition-all duration-300">
                Bekijk Demo
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
