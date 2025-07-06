import { getDictionary } from "@/i18n/dictionaries";
import {
  ArrowRight,
  PenTool,
  Sparkles,
  Brain,
  Target,
  Play,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

interface ContentCreatorPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ContentCreatorPage({
  params,
}: ContentCreatorPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="dark relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            {/* Feature Badge */}
            <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              <span className="text-purple-400 text-sm font-medium">
                PREMIUM
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent mb-6">
              AI Content Creator
            </h1>

            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Automated content generation en optimization die uw research
              insights transformeert naar engaging, platform-optimized content.
              Van social media posts tot complete campaigns - alles powered by
              enterprise AI.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/nl/ai-content-demo"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-purple-500/25"
              >
                <Play className="w-5 h-5" />
                Live Content Demo
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
              Enterprise Content Generation
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Van research naar published content in minuten. Onze AI Content
              Creator gebruikt uw research insights voor intelligente,
              multi-platform content generatie.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Multi-Platform Content */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <PenTool className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Multi-Platform Content
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Genereer platform-specific content voor LinkedIn, Twitter,
                Facebook, Instagram, TikTok en meer - elk geoptimaliseerd voor
                maximale engagement.
              </p>
            </div>

            {/* AI-Powered Creativity */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-orange-500/30 transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                AI-Powered Creativity
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Geavanceerde GPT-4 en Claude modellen creëren originele,
                engaging content die uw brand voice perfect weergeeft en uw
                doelgroep aanspreekt.
              </p>
            </div>

            {/* Performance Optimization */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Performance Optimization
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                AI analyseert historical performance data en optimaliseert
                content voor maximum engagement, reach en conversions op elk
                platform.
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
              Seamless Workflow Integration
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Research insights worden automatisch getransformeerd naar
              high-performing content in uw complete marketing workflow.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Previous Step - Research */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 flex-1 opacity-75">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-700/50 rounded-lg">
                  <Brain className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Research Phase
                  </h3>
                  <span className="text-slate-500 text-sm">PREVIOUS</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                AI Research Assistant verzamelt markt intelligence en trend
                insights voor strategische content planning.
              </p>
              <Link
                href="/nl/ai-features/research-assistant"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mt-3 transition-colors"
              >
                Bekijk Research Assistant <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <ArrowRight className="w-6 h-6 text-slate-500 lg:block hidden" />

            {/* Current Step - Content Creation */}
            <div className="bg-gradient-to-br from-purple-600/20 to-purple-500/10 border-2 border-purple-500/50 rounded-2xl p-6 flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/30 rounded-lg">
                  <PenTool className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Content Creation
                  </h3>
                  <span className="text-purple-400 text-sm font-medium">
                    CURRENT
                  </span>
                </div>
              </div>
              <p className="text-slate-300 text-sm">
                Research insights worden getransformeerd naar engaging,
                platform-optimized content met AI-powered creativity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Transform Research Into Results
          </h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Stop met handmatige content creation. Laat AI uw research insights
            transformeren naar high-performing content die uw doelgroep betrekt
            en converteert.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/nl/ai-content-demo"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-purple-500/25"
            >
              <Play className="w-5 h-5" />
              Try Content Creator
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
