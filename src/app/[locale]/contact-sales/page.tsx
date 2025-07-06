"use client";

import { ImprovedMarketingHeader } from "@/components/layout/improved-marketing-header";
import {
  MessageSquare,
  Calendar,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  Target,
  ArrowRight,
  Star,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ContactSalesPage() {
  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ImprovedMarketingHeader />
      <div className="pt-16">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-slate-900/20" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-32">
            <div className="text-center mb-12 sm:mb-16 md:mb-20">
              <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-800/40 to-blue-700/30 border border-purple-500/20 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-sm mb-6 sm:mb-8">
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-purple-400" />
                <span className="text-purple-300 font-medium text-xs sm:text-sm">
                  Expert Consultation
                </span>
                <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extralight leading-tight bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent mb-6 sm:mb-8 px-2 sm:px-4">
                Strategiegesprek
              </h1>

              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed px-2 sm:px-4 mb-8 sm:mb-12">
                Boek een persoonlijke strategiesessie met onze experts en ontdek
                hoe FutureMarketingAI uw business kan transformeren
              </p>
            </div>
          </div>
        </section>

        {/* Contact Options */}
        <section className="relative py-16 sm:py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 sm:mb-6">
                Kies uw voorkeur
              </h2>
              <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
                Verschillende manieren om contact op te nemen en uw
                AI-transformatie te starten
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Calendar Booking */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-blue-500/20 backdrop-blur-sm hover:border-blue-500/40 transition-all duration-300 group cursor-pointer"
              >
                <div className="text-center">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Calendar className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
                    Plan een Gesprek
                  </h3>
                  <p className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6">
                    Kies een tijdstip dat u uitkomt voor een 30-minuten
                    strategiegesprek
                  </p>
                  <div className="flex items-center justify-center gap-2 text-blue-400 text-sm sm:text-base font-medium group-hover:gap-3 transition-all">
                    <span>Boek nu</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>

              {/* Direct Call */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-green-500/20 backdrop-blur-sm hover:border-green-500/40 transition-all duration-300 group cursor-pointer"
              >
                <div className="text-center">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Phone className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
                    Direct Bellen
                  </h3>
                  <p className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6">
                    Spreek direct met een expert. Beschikbaar ma-vr 9:00-17:00
                  </p>
                  <div className="flex items-center justify-center gap-2 text-green-400 text-sm sm:text-base font-medium group-hover:gap-3 transition-all">
                    <span>+31 20 123 4567</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>

              {/* Email Contact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-purple-500/20 backdrop-blur-sm hover:border-purple-500/40 transition-all duration-300 group cursor-pointer sm:col-span-2 lg:col-span-1"
              >
                <div className="text-center">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Mail className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
                    Stuur een Bericht
                  </h3>
                  <p className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6">
                    Krijg binnen 24 uur een gedetailleerd voorstel in uw inbox
                  </p>
                  <div className="flex items-center justify-center gap-2 text-purple-400 text-sm sm:text-base font-medium group-hover:gap-3 transition-all">
                    <span>Contact formulier</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* What to Expect */}
        <section className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-r from-slate-900/50 to-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4 sm:mb-6">
                Wat kunt u verwachten?
              </h2>
              <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
                Onze strategiesessie is specifiek ontworpen voor groeiende
                bedrijven
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {/* Analysis */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Target className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                  Business Analyse
                </h3>
                <p className="text-slate-400 text-sm sm:text-base">
                  Grondige analyse van uw huidige marketing en groeipotentieel
                </p>
              </motion.div>

              {/* Strategy */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Zap className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                  AI Strategie
                </h3>
                <p className="text-slate-400 text-sm sm:text-base">
                  Maatwerk AI-implementatieplan voor uw specifieke sector
                </p>
              </motion.div>

              {/* ROI Forecast */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <TrendingUp className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                  ROI Prognose
                </h3>
                <p className="text-slate-400 text-sm sm:text-base">
                  Realistische verwachtingen voor groei en kostenbesparingen
                </p>
              </motion.div>

              {/* Implementation Plan */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Clock className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                  Timeline
                </h3>
                <p className="text-slate-400 text-sm sm:text-base">
                  Concrete planning voor implementatie en eerste resultaten
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Success Stories Preview */}
        <section className="relative py-16 sm:py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-4 sm:mb-6">
                Succesverhalen
              </h2>
              <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
                Bedrijven die hun groei hebben versneld met onze AI-oplossingen
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Success Story 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-yellow-500/20 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6 italic">
                  "Van €750K naar €2.1M omzet in 18 maanden. De AI-tools hebben
                  onze marketing compleet getransformeerd."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">
                      Martin de Vries
                    </div>
                    <div className="text-slate-400 text-xs">
                      CEO, TechSolutions B.V.
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Success Story 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-green-500/20 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="flex text-green-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6 italic">
                  "87% meer leads met 40% minder tijd. Nu kunnen we focussen op
                  wat echt belangrijk is: onze klanten."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">
                      Lisa Janssen
                    </div>
                    <div className="text-slate-400 text-xs">
                      Directeur, InnovatieGroep
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Success Story 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-purple-500/20 backdrop-blur-sm sm:col-span-2 lg:col-span-1"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="flex text-purple-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6 italic">
                  "ROI van 340% in het eerste jaar. Deze investering was de
                  beste beslissing voor ons bedrijf."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">
                      Rob Hendricks
                    </div>
                    <div className="text-slate-400 text-xs">
                      Eigenaar, GrowthCompany
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Guarantees */}
        <section className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 sm:mb-6">
                Onze garanties
              </h2>
              <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
                We staan achter onze resultaten met concrete toezeggingen
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                {
                  icon: CheckCircle,
                  title: "30 dagen geld-terug",
                  desc: "Niet tevreden? Volledige terugbetaling",
                },
                {
                  icon: Clock,
                  title: "24/7 ondersteuning",
                  desc: "Altijd bereikbaar voor al uw vragen",
                },
                {
                  icon: TrendingUp,
                  title: "Meetbare resultaten",
                  desc: "Binnen 60 dagen zichtbare verbetering",
                },
                {
                  icon: Users,
                  title: "Dedicated specialist",
                  desc: "Persoonlijke begeleiding gedurende implementatie",
                },
              ].map((guarantee, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <guarantee.icon className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                    {guarantee.title}
                  </h3>
                  <p className="text-slate-400 text-sm sm:text-base">
                    {guarantee.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-16 sm:py-20 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-6 sm:mb-8">
              Klaar om uw groei te versnellen?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg md:text-xl mb-8 sm:mb-12">
              Sluit u aan bij meer dan 240 bedrijven die hun marketing hebben
              getransformeerd met AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <button className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg sm:rounded-xl font-medium hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105">
                Plan Gratis Strategiegesprek
              </button>
              <button className="px-6 sm:px-8 py-3 sm:py-4 border border-green-500/50 text-green-400 rounded-lg sm:rounded-xl font-medium hover:bg-green-500/10 transition-all duration-300">
                Bekijk Case Studies
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
