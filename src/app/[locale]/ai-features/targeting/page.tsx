import { getDictionary } from "@/i18n/dictionaries";
import {
  ArrowRight,
  Target,
  Users,
  Eye,
  Play,
  Crown,
  Zap,
  Settings,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

interface TargetingPageProps {
  params: Promise<{ locale: string }>;
}

export default async function TargetingPage({ params }: TargetingPageProps) {
  const { locale } = await params;

  return (
    <div className="dark relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            {/* Feature Badge */}
            <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full px-4 py-2 mb-6">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">
                PREMIUM
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-6">
              Smart Targeting
            </h1>

            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Enterprise-grade audience targeting die uw content precies naar de
              juiste mensen brengt. Maximaliseer conversies met AI-powered
              segmentation en behavioral targeting.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-yellow-500/25"
              >
                <Play className="w-5 h-5" />
                Targeting Demo
              </Link>
              <Link
                href="/contact-sales"
                className="inline-flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 hover:border-slate-500 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300"
              >
                <Users className="w-5 h-5" />
                Expert Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Overview */}
      <section className="py-20 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Precision Audience Targeting
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Bereik exact de juiste doelgroep op het juiste moment. Advanced AI
              segmentation voor maximum ROI en engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Behavioral Targeting */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-yellow-500/30 transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Eye className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Behavioral Targeting
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                AI-powered audience segmentation gebaseerd op gedrag,
                interesses, en engagement patterns voor precision targeting.
              </p>
            </div>

            {/* Dynamic Optimization */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-orange-500/30 transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Settings className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Dynamic Optimization
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Real-time targeting adjustments gebaseerd op performance data en
                audience response voor continuous optimization.
              </p>
            </div>

            {/* Advanced Analytics */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-red-500/30 transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Deep Analytics
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Uitgebreide audience insights en performance metrics voor
                data-driven targeting decisions en ROI optimization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Integration */}
      <section className="py-20 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Publishing Workflow Completion
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Smart Targeting vormt de finale optimalisatie in uw publishing
              workflow, zorgt ervoor dat uw content precies de juiste audience
              bereikt.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Previous Step - Scheduler */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 flex-1 opacity-75">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-700/50 rounded-lg">
                  <Zap className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Smart Scheduler
                  </h3>
                  <span className="text-slate-500 text-sm">PREVIOUS</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                Content wordt geoptimaliseerd voor timing met AI-powered
                scheduling algorithms.
              </p>
              <Link
                href="/nl/ai-features/scheduler"
                className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm mt-3 transition-colors"
              >
                Bekijk Scheduler <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <ArrowRight className="w-6 h-6 text-slate-500 lg:block hidden" />

            {/* Current Step - Targeting */}
            <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-500/10 border-2 border-yellow-500/50 rounded-2xl p-6 flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-500/30 rounded-lg">
                  <Target className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Smart Targeting
                  </h3>
                  <span className="text-yellow-400 text-sm font-medium">
                    CURRENT
                  </span>
                </div>
              </div>
              <p className="text-slate-300 text-sm">
                AI optimaliseert audience targeting voor maximale engagement en
                conversie per content piece.
              </p>
            </div>

            <ArrowRight className="w-6 h-6 text-slate-500 lg:block hidden" />

            {/* Next Step - Analytics */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 flex-1 opacity-75">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-700/50 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Performance Analytics
                  </h3>
                  <span className="text-slate-500 text-sm">NEXT</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                Gedetailleerde performance tracking en ROI analysis voor
                continuous workflow optimization.
              </p>
              <Link
                href="/nl/dashboard"
                className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 text-sm mt-3 transition-colors"
              >
                Bekijk Analytics <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Reach The Right Audience, Every Time
          </h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Stop met breed strooien en hoop dat het werkt. Gebruik AI-powered
            targeting om uw content precies naar de juiste mensen te brengen.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-yellow-500/25"
            >
              <Play className="w-5 h-5" />
              Start Targeting
            </Link>
            <Link
              href="/contact-sales"
              className="inline-flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 hover:border-slate-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300"
            >
              <Users className="w-5 h-5" />
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
