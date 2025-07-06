import { getDictionary } from "@/i18n/dictionaries";
import {
  ArrowRight,
  TrendingUp,
  Brain,
  BarChart3,
  Zap,
  Play,
  Users,
  Search,
  Target,
} from "lucide-react";
import Link from "next/link";

interface TrendIntelligencePageProps {
  params: Promise<{ locale: string }>;
}

export default async function TrendIntelligencePage({
  params,
}: TrendIntelligencePageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

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

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent mb-6">
              Trend Intelligence
            </h1>

            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              AI-powered trend detection en market insights die emerging
              patterns identificeert voordat ze mainstream worden. Anticipeer op
              marktveranderingen en ontdek nieuwe opportunities met
              voorspellende trend analysis.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-orange-500/25"
              >
                <Play className="w-5 h-5" />
                Live Trend Demo
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
              Advanced Trend Detection
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Onze AI analyseert miljoenen data points om emerging trends te
              identificeren voordat ze mainstream worden. Stay ahead of the
              curve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Predictive Analytics */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-orange-500/30 transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Predictive Analytics
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Voorspel toekomstige trends met 85%+ nauwkeurigheid door machine
                learning modellen die patterns herkennen in real-time data
                streams.
              </p>
            </div>

            {/* Early Trend Detection */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-red-500/30 transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Early Detection
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Identificeer emerging trends 3-6 maanden voordat ze mainstream
                worden door weak signals analysis en cross-platform monitoring.
              </p>
            </div>

            {/* Market Intelligence */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-pink-500/30 transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Intelligent Insights
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                AI-powered analysis van consumer behavior, social sentiment, en
                market dynamics voor actionable business intelligence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                Next-Generation Technology
              </h2>
              <p className="text-slate-400 mb-8">
                Onze Trend Intelligence platform gebruikt advanced machine
                learning voor real-time trend detection en predictive market
                analysis.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Zap className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      Real-time Analysis
                    </h4>
                    <p className="text-slate-400 text-sm">
                      Analyseert 50M+ data points per uur van social media,
                      news, forums, en e-commerce platforms voor instant trend
                      detection.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <Brain className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      Machine Learning Algorithms
                    </h4>
                    <p className="text-slate-400 text-sm">
                      Advanced neural networks en deep learning voor pattern
                      recognition, anomaly detection, en predictive trend
                      modeling.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-pink-500/20 rounded-lg">
                    <Search className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      Cross-Platform Monitoring
                    </h4>
                    <p className="text-slate-400 text-sm">
                      Monitort 500+ data sources inclusief social media, search
                      trends, patent filings, en industry publications.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-white mb-6">
                Performance Metrics
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                  <span className="text-slate-400">Trend Accuracy</span>
                  <span className="text-white font-medium">
                    85.3% validated
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                  <span className="text-slate-400">Data Sources</span>
                  <span className="text-white font-medium">500+ platforms</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                  <span className="text-slate-400">Early Detection</span>
                  <span className="text-white font-medium">
                    3-6 months ahead
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                  <span className="text-slate-400">Update Frequency</span>
                  <span className="text-white font-medium">
                    Every 30 minutes
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Coverage</span>
                  <span className="text-white font-medium">Global markets</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Integration */}
      <section className="py-20 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Research Workflow Integration
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Trend Intelligence vormt de basis van uw research workflow en
              feeds direct naar content creation en strategic planning.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Current Step - Trend Intelligence */}
            <div className="bg-gradient-to-br from-orange-600/20 to-orange-500/10 border-2 border-orange-500/50 rounded-2xl p-6 flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-500/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Trend Intelligence
                  </h3>
                  <span className="text-orange-400 text-sm font-medium">
                    CURRENT
                  </span>
                </div>
              </div>
              <p className="text-slate-300 text-sm">
                Identificeer emerging trends en market opportunities die de
                basis vormen voor strategische content creation.
              </p>
            </div>

            <ArrowRight className="w-6 h-6 text-slate-500 lg:block hidden" />

            {/* Next Step - Content Creation */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 flex-1 opacity-75">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-700/50 rounded-lg">
                  <Target className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Content Strategy
                  </h3>
                  <span className="text-slate-500 text-sm">NEXT</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                Trend insights worden getransformeerd naar targeted content
                strategies via onze AI Content Creator.
              </p>
              <Link
                href="/nl/ai-features/content-creator"
                className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm mt-3 transition-colors"
              >
                Bekijk Content Creator <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Stay Ahead of Market Trends
          </h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Stop met reactive market research. Anticipeer op trends voordat ze
            mainstream worden en neem strategische voorsprong op uw
            concurrentie.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-orange-500/25"
            >
              <Play className="w-5 h-5" />
              Start Trend Analysis
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
