import { getDictionary } from "@/i18n/dictionaries";
import {
  ArrowRight,
  PenTool,
  FileText,
  Zap,
  Play,
  Users,
  Target,
  MessageSquare,
  Send,
} from "lucide-react";
import Link from "next/link";

interface CopywriterPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CopywriterPage({ params }: CopywriterPageProps) {
  const { locale } = await params;

  return (
    <div className="dark relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
              AI Copywriter
            </h1>

            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Enterprise-grade AI copywriting die overtuigende content genereert
              voor elke marketing doelstelling. Van headlines tot long-form
              content, geoptimaliseerd voor conversie en brand consistency.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/25"
              >
                <Play className="w-5 h-5" />
                Writing Demo
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
              Advanced Content Generation
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Van korte headlines tot uitgebreide artikelen. Onze AI copywriter
              genereert persuasieve content die converteert en engaged.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Persuasive Copy */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <PenTool className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Persuasive Writing
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                AI-powered persuasive copywriting geoptimaliseerd voor
                conversie, met psychological triggers en marketing psychology.
              </p>
            </div>

            {/* Multi-Format Content */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Multi-Format Content
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Blogs, emails, social posts, sales pages, ads - elk format met
                platform-specifieke optimalisatie en tone-of-voice.
              </p>
            </div>

            {/* Brand Voice */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-pink-500/30 transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Brand Voice Match
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Automatische brand voice consistency met tone adaptation,
                personality matching, en messaging alignment.
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
              AI Copywriter integreert naadloos tussen content strategie en
              creative assets, zorgt voor consistency in messaging en brand
              voice.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Previous Step - Content Strategy */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 flex-1 opacity-75">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-700/50 rounded-lg">
                  <Target className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Content Strategy
                  </h3>
                  <span className="text-slate-500 text-sm">PREVIOUS</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                Content concepten en strategieën worden ontwikkeld gebaseerd op
                research en trend intelligence.
              </p>
              <Link
                href="/nl/ai-features/content-creator"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm mt-3 transition-colors"
              >
                Bekijk Content Creator <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <ArrowRight className="w-6 h-6 text-slate-500 lg:block hidden" />

            {/* Current Step - Copywriter */}
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-500/10 border-2 border-blue-500/50 rounded-2xl p-6 flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/30 rounded-lg">
                  <PenTool className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    AI Copywriter
                  </h3>
                  <span className="text-blue-400 text-sm font-medium">
                    CURRENT
                  </span>
                </div>
              </div>
              <p className="text-slate-300 text-sm">
                Content concepten worden getransformeerd naar persuasieve copy
                en messaging voor alle marketing kanalen.
              </p>
            </div>

            <ArrowRight className="w-6 h-6 text-slate-500 lg:block hidden" />

            {/* Next Step - Creative Assets */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 flex-1 opacity-75">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-700/50 rounded-lg">
                  <Zap className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Creative Assets
                  </h3>
                  <span className="text-slate-500 text-sm">NEXT</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                Copy wordt gecombineerd met visuele assets in de Creative Studio
                voor complete campaigns.
              </p>
              <Link
                href="/nl/ai-features/creative-studio"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mt-3 transition-colors"
              >
                Bekijk Creative Studio <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Transform Ideas Into Compelling Copy
          </h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Stop met writer's block en inconsistent messaging. Genereer
            persuasieve, brand-consistent copy die converteert op elke platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/25"
            >
              <Play className="w-5 h-5" />
              Start Writing
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
