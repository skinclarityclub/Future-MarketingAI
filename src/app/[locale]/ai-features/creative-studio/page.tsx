import { getDictionary } from "@/i18n/dictionaries";
import {
  ArrowRight,
  Sparkles,
  Image,
  Video,
  Palette,
  Play,
  Users,
  Zap,
  PenTool,
  Send,
} from "lucide-react";
import Link from "next/link";

interface CreativeStudioPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CreativeStudioPage({
  params,
}: CreativeStudioPageProps) {
  const { locale } = await params;

  return (
    <div className="dark relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            {/* Feature Badge */}
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm font-medium">NEW</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
              Creative AI Studio
            </h1>

            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              AI-powered creative asset generation die uw content ideeën
              transformeert naar visuele masterpieces. Van concept tot
              publicatie-ready assets in minuten met enterprise-grade AI
              creativity.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-green-500/25"
              >
                <Play className="w-5 h-5" />
                Creative Demo
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
              Advanced Creative Generation
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Van tekst naar visueel concept. Onze AI studio genereert
              professional-grade creative assets voor alle platforms en
              marketing doeleinden.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Visual Asset Generation */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-green-500/30 transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Image className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Visual Assets
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Genereer high-quality images, graphics, illustrations en
                infographics geoptimaliseerd voor web, social media, en print.
              </p>
            </div>

            {/* Video Generation */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Video Content
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                AI-powered video creation met auto-editing, scene compositie, en
                brand-consistent styling voor alle platforms.
              </p>
            </div>

            {/* Brand Consistency */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Palette className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Brand Intelligence
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Automatische brand guideline adherence met color schemes,
                typography, en visual identity compliance.
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
              Content Creation Workflow
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Creative Studio integreert naadloos tussen content strategie en
              publishing, transformeert ideeën naar publish-ready creative
              assets.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Previous Step - Content Strategy */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 flex-1 opacity-75">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-700/50 rounded-lg">
                  <PenTool className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Content Strategy
                  </h3>
                  <span className="text-slate-500 text-sm">PREVIOUS</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                Content concepten en strategieën worden ontwikkeld via AI
                Content Creator en research insights.
              </p>
              <Link
                href="/nl/ai-features/content-creator"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mt-3 transition-colors"
              >
                Bekijk Content Creator <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <ArrowRight className="w-6 h-6 text-slate-500 lg:block hidden" />

            {/* Current Step - Creative Studio */}
            <div className="bg-gradient-to-br from-green-600/20 to-green-500/10 border-2 border-green-500/50 rounded-2xl p-6 flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500/30 rounded-lg">
                  <Sparkles className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Creative Studio
                  </h3>
                  <span className="text-green-400 text-sm font-medium">
                    CURRENT
                  </span>
                </div>
              </div>
              <p className="text-slate-300 text-sm">
                Content concepten worden getransformeerd naar visuele assets en
                creative materials ready voor publishing.
              </p>
            </div>

            <ArrowRight className="w-6 h-6 text-slate-500 lg:block hidden" />

            {/* Next Step - Publishing */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 flex-1 opacity-75">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-700/50 rounded-lg">
                  <Send className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Publishing
                  </h3>
                  <span className="text-slate-500 text-sm">NEXT</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                Creative assets worden geoptimaliseerd en gepubliceerd via
                Multi-Channel Publisher naar alle platforms.
              </p>
              <Link
                href="/nl/ai-features/publisher"
                className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 text-sm mt-3 transition-colors"
              >
                Bekijk Publisher <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Transform Ideas Into Visual Reality
          </h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Stop met dure creative agencies en lange productietijden. Genereer
            professional-grade creative assets in minuten met AI-powered
            creativity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-green-500/25"
            >
              <Play className="w-5 h-5" />
              Start Creating
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
