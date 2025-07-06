import { getDictionary } from "@/i18n/dictionaries";
import {
  ArrowRight,
  Brain,
  Search,
  TrendingUp,
  Target,
  Zap,
  Play,
  Users,
} from "lucide-react";
import Link from "next/link";

interface ResearchAssistantPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ResearchAssistantPage({
  params,
}: ResearchAssistantPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

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

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6">
              AI Research Assistant
            </h1>

            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Intelligent market research en competitor analysis die complexe
              data transformeert naar strategische inzichten. Ontdek trends,
              analyseer concurrenten, en identificeer nieuwe kansen met
              geavanceerde AI-technologie.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/25"
              >
                <Play className="w-5 h-5" />
                Live Demo
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
              Intelligente Research Capabilities
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Onze AI Research Assistant combineert machine learning, natural
              language processing, en big data analytics voor ongekende research
              kwaliteit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Market Intelligence */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Market Intelligence
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Real-time marktanalyse, trend detection, en opportunity
                identification met AI-powered data aggregation van duizenden
                bronnen.
              </p>
            </div>

            {/* Competitor Analysis */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Competitor Analysis
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Diepgaande concurrent monitoring, strategy analysis, en
                performance benchmarking voor strategische voordelen in uw
                markt.
              </p>
            </div>

            {/* Predictive Insights */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Predictive Insights
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Voorspellende modellen voor marktveranderingen, consumer
                behavior, en emerging opportunities gebaseerd op geavanceerde AI
                algoritmes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                Enterprise-Grade Technology
              </h2>
              <p className="text-slate-400 mb-8">
                Onze AI Research Assistant gebruikt cutting-edge technologieën
                voor nauwkeurige, betrouwbare, en actionable research insights.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Zap className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      Real-time Data Processing
                    </h4>
                    <p className="text-slate-400 text-sm">
                      Verwerkt miljoenen data points per seconde met machine
                      learning pipelines voor instant insights en trending
                      analysis.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Brain className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      Advanced NLP & Sentiment Analysis
                    </h4>
                    <p className="text-slate-400 text-sm">
                      Natural language processing voor sentiment analysis, topic
                      modeling, en intelligent content extraction uit diverse
                      data bronnen.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <Search className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      Multi-Source Intelligence
                    </h4>
                    <p className="text-slate-400 text-sm">
                      Integreert data van social media, news sources, financial
                      markets, patent databases, en proprietary research
                      networks.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-white mb-6">
                Technical Specifications
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                  <span className="text-slate-400">Processing Speed</span>
                  <span className="text-white font-medium">
                    1M+ data points/sec
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                  <span className="text-slate-400">Data Sources</span>
                  <span className="text-white font-medium">
                    10,000+ integrated
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                  <span className="text-slate-400">Accuracy Rate</span>
                  <span className="text-white font-medium">
                    94.7% validated
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                  <span className="text-slate-400">Real-time Updates</span>
                  <span className="text-white font-medium">
                    Every 15 minutes
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">API Response Time</span>
                  <span className="text-white font-medium">
                    &lt; 200ms average
                  </span>
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
              Workflow Integration
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              De AI Research Assistant integreert naadloos in uw Research →
              Content Creation → Publishing → Analytics workflow.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Current Step - Research */}
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-500/10 border-2 border-blue-500/50 rounded-2xl p-6 flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/30 rounded-lg">
                  <Search className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Research Phase
                  </h3>
                  <span className="text-blue-400 text-sm font-medium">
                    CURRENT
                  </span>
                </div>
              </div>
              <p className="text-slate-300 text-sm">
                Intelligent marktonderzoek, trendanalyse, en
                concurrentie-intelligence vormen de basis voor uw content
                strategie.
              </p>
            </div>

            <ArrowRight className="w-6 h-6 text-slate-500 lg:block hidden" />

            {/* Next Step - Content Creation */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 flex-1 opacity-75">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-700/50 rounded-lg">
                  <Brain className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Content Creation
                  </h3>
                  <span className="text-slate-500 text-sm">NEXT</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                Research insights worden getransformeerd naar targeted content
                via onze AI Content Creator.
              </p>
              <Link
                href="/nl/ai-features/content-creator"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mt-3 transition-colors"
              >
                Bekijk AI Content Creator <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Start Your Intelligent Research Journey
          </h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Transform uw marktonderzoek met AI-powered intelligence. Ontdek
            waarom Fortune 500 bedrijven vertrouwen op onze research technology.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/25"
            >
              <Play className="w-5 h-5" />
              Start Free Demo
            </Link>
            <Link
              href="/contact-sales"
              className="inline-flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 hover:border-slate-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300"
            >
              <Users className="w-5 h-5" />
              Schedule Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
