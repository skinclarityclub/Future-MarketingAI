import { getDictionary } from "@/i18n/dictionaries";
import {
  ArrowRight,
  Send,
  Globe,
  Settings,
  Play,
  Users,
  Zap,
  Calendar,
  Target,
} from "lucide-react";
import Link from "next/link";

interface PublisherPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PublisherPage({ params }: PublisherPageProps) {
  const { locale } = await params;

  return (
    <div className="dark relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-6">
              Multi-Channel Publisher
            </h1>

            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Enterprise-grade publishing platform die uw content distribueert
              naar alle kanalen tegelijk. Van social media tot email campaigns,
              geoptimaliseerd voor elke platform met één klik.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-purple-500/25"
              >
                <Play className="w-5 h-5" />
                Publishing Demo
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
              Advanced Publishing Distribution
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Van één central dashboard naar alle marketing kanalen.
              Automatische formattering, scheduling, en performance tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Cross-Platform Distribution */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Cross-Platform Distribution
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Publiceer naar 15+ platforms tegelijk: social media, email,
                websites, blogs, en advertising networks vanuit één dashboard.
              </p>
            </div>

            {/* Automated Formatting */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-pink-500/30 transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Settings className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Smart Formatting
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Automatische content adaptatie voor elke platform: aspect
                ratios, character limits, hashtags, en best practices.
              </p>
            </div>

            {/* Performance Tracking */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-red-500/30 transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Performance Analytics
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Real-time performance tracking cross-platform met engagement
                metrics, conversion rates, en ROI analysis.
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
              Multi-Channel Publisher vormt het eindpunt van uw content
              workflow, distribueert alle creative assets naar de juiste kanalen
              op het juiste moment.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Previous Step - Creative Assets */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 flex-1 opacity-75">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-700/50 rounded-lg">
                  <Zap className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Creative Assets
                  </h3>
                  <span className="text-slate-500 text-sm">PREVIOUS</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                Content en creative assets worden gecreëerd via AI Copywriter en
                Creative Studio.
              </p>
              <Link
                href="/nl/ai-features/creative-studio"
                className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 text-sm mt-3 transition-colors"
              >
                Bekijk Creative Studio <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <ArrowRight className="w-6 h-6 text-slate-500 lg:block hidden" />

            {/* Current Step - Publisher */}
            <div className="bg-gradient-to-br from-purple-600/20 to-purple-500/10 border-2 border-purple-500/50 rounded-2xl p-6 flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/30 rounded-lg">
                  <Send className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Multi-Channel Publisher
                  </h3>
                  <span className="text-purple-400 text-sm font-medium">
                    CURRENT
                  </span>
                </div>
              </div>
              <p className="text-slate-300 text-sm">
                Content wordt gedistribueerd naar alle relevante kanalen met
                platform-specifieke optimalisatie en scheduling.
              </p>
            </div>

            <ArrowRight className="w-6 h-6 text-slate-500 lg:block hidden" />

            {/* Next Step - Analytics */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 flex-1 opacity-75">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-700/50 rounded-lg">
                  <Target className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Performance Analytics
                  </h3>
                  <span className="text-slate-500 text-sm">NEXT</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                Published content wordt getracked en geanalyseerd voor
                performance optimization en ROI measurement.
              </p>
              <Link
                href="/nl/dashboard"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm mt-3 transition-colors"
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
            Distribute Content Everywhere, Instantly
          </h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Stop met handmatige posting en platform-specifieke formatting.
            Publiceer naar alle kanalen tegelijk met één klik en automatische
            optimalisatie.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-purple-500/25"
            >
              <Play className="w-5 h-5" />
              Start Publishing
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
