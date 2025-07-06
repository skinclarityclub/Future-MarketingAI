import { getDictionary } from "@/i18n/dictionaries";
import {
  ArrowRight,
  Calendar,
  Clock,
  TrendingUp,
  Play,
  Users,
  Zap,
  Globe,
  Target,
} from "lucide-react";
import Link from "next/link";

interface SchedulerPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SchedulerPage({ params }: SchedulerPageProps) {
  const { locale } = await params;

  return (
    <div className="dark relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            {/* Feature Badge */}
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              <span className="text-orange-400 text-sm font-medium">BETA</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
              Smart Scheduler
            </h1>

            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              AI-powered content scheduling die het perfecte tijdstip voorspelt
              voor maximale engagement. Optimaliseer uw content timing voor elke
              platform en doelgroep met predictive analytics.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25"
              >
                <Play className="w-5 h-5" />
                Scheduling Demo
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
              Intelligent Scheduling Optimization
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Gebruik AI om het perfecte moment te vinden voor elke post.
              Maximaliseer engagement met predictive timing en audience
              analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Predictive Timing */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Predictive Timing
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                AI voorspelt optimale posting tijden per platform gebaseerd op
                audience behavior en engagement patterns.
              </p>
            </div>

            {/* Cross-Platform Sync */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Cross-Platform Sync
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Synchroniseer content scheduling across alle platforms met
                rekening voor verschillende timezones en peak hours.
              </p>
            </div>

            {/* Performance Learning */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Adaptive Learning
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Continu leren van performance data om scheduling strategieën te
                optimaliseren voor betere resultaten.
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
              Publishing Workflow Integration
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Smart Scheduler integreert naadloos met de Publisher workflow,
              zorgt voor optimale timing van alle content distributie.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Previous Step - Publisher */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 flex-1 opacity-75">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-700/50 rounded-lg">
                  <Globe className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Multi-Channel Publisher
                  </h3>
                  <span className="text-slate-500 text-sm">PREVIOUS</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                Content wordt voorbereid voor distributie naar alle relevante
                marketing kanalen.
              </p>
              <Link
                href="/nl/ai-features/publisher"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mt-3 transition-colors"
              >
                Bekijk Publisher <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <ArrowRight className="w-6 h-6 text-slate-500 lg:block hidden" />

            {/* Current Step - Scheduler */}
            <div className="bg-gradient-to-br from-cyan-600/20 to-cyan-500/10 border-2 border-cyan-500/50 rounded-2xl p-6 flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-500/30 rounded-lg">
                  <Calendar className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Smart Scheduler
                  </h3>
                  <span className="text-cyan-400 text-sm font-medium">
                    CURRENT
                  </span>
                </div>
              </div>
              <p className="text-slate-300 text-sm">
                AI bepaalt het optimale moment voor elke post gebaseerd op
                engagement predictions en audience analytics.
              </p>
            </div>

            <ArrowRight className="w-6 h-6 text-slate-500 lg:block hidden" />

            {/* Next Step - Targeting */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 flex-1 opacity-75">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-700/50 rounded-lg">
                  <Target className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Smart Targeting
                  </h3>
                  <span className="text-slate-500 text-sm">NEXT</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                Scheduled content wordt geoptimaliseerd voor specifieke
                doelgroepen en audience segments.
              </p>
              <Link
                href="/nl/ai-features/targeting"
                className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm mt-3 transition-colors"
              >
                Bekijk Targeting <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Perfect Timing, Every Time
          </h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Stop met gokken wanneer je content moet posten. Gebruik AI om het
            perfecte moment te vinden voor maximale engagement en conversie.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25"
            >
              <Play className="w-5 h-5" />
              Start Scheduling
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
