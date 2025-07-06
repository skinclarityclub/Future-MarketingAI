"use client";

import React, { useState, useEffect } from "react";
import { Locale } from "@/lib/i18n/config";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Target,
  Users,
  Activity,
  BarChart3,
  Zap,
  Shield,
  Globe,
  Brain,
  ArrowUpRight,
  Play,
  Pause,
  RefreshCw,
  Star,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Clock,
  Rocket,
  Lightbulb,
  MessageSquare,
  Eye,
  MousePointer,
  Send,
  Calendar,
  Settings,
  PieChart,
} from "lucide-react";

interface UltimateConverterDemoProps {
  locale: Locale;
}

// Define tab types for better type safety
type TabType =
  | "journey"
  | "telegram-ai"
  | "automation"
  | "roi-calc"
  | "testimonials";

interface LiveMetrics {
  engagement: number;
  leads: number;
  roi: number;
  timeSaved: number;
}

interface ROIInputs {
  revenue: number;
  marketingBudget: number;
  teamSize: number;
}

interface ROIData {
  currentROI: number;
  newROI: number;
  additionalRevenue: number;
  platformCost: number;
  netGain: number;
}

interface CustomerJourneyStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  impact: string;
  time: string;
  difficulty: string;
}

interface TabItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function UltimateConverterDemo({
  locale,
}: UltimateConverterDemoProps) {
  const [activeTab, setActiveTab] = useState<TabType>("journey");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(true);
  const [roiInputs, setRoiInputs] = useState<ROIInputs>({
    revenue: 850000,
    marketingBudget: 25000,
    teamSize: 12,
  });

  // Live metrics simulation with proper typing
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
    engagement: 2.4,
    leads: 47,
    roi: 340,
    timeSaved: 32,
  });

  useEffect(() => {
    if (!isLiveMode) return;

    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        engagement: Math.max(0, prev.engagement + (Math.random() - 0.5) * 0.2),
        leads: Math.max(40, prev.leads + Math.floor((Math.random() - 0.5) * 3)),
        roi: Math.max(300, prev.roi + (Math.random() - 0.5) * 20),
        timeSaved: Math.max(25, prev.timeSaved + (Math.random() - 0.5) * 2),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveMode]);

  const customerJourneySteps: CustomerJourneyStep[] = [
    {
      id: "setup",
      title: "⚡ 5-Minuten Setup",
      subtitle: "Van nul naar first campaign",
      description: "Automatische bedrijfsanalyse en directe marketingstrategie",
      impact: "+€12K ARR binnen 30 dagen",
      time: "5 min",
      difficulty: "Plug & Play",
    },
    {
      id: "content",
      title: "🧠 AI Content Engine",
      subtitle: "50+ posts per week automatisch",
      description:
        "AI genereert branded content op basis van trends en concurrenten",
      impact: "90% minder tijd, 3x meer engagement",
      time: "Ongoing",
      difficulty: "Set & Forget",
    },
    {
      id: "telegram",
      title: "🤖 24/7 Business AI",
      subtitle: "Telegram assistant die alles weet",
      description: "Chat met je bedrijfsdata, krijg insights, stel vragen",
      impact: "Directe business intelligence",
      time: "24/7",
      difficulty: "Chat gewoon",
    },
    {
      id: "optimization",
      title: "📈 Auto-Optimization",
      subtitle: "Platform leert en verbetert",
      description: "ML algoritmes optimaliseren campaigns automatisch",
      impact: "+25% ROI elke maand",
      time: "Automatic",
      difficulty: "Zero effort",
    },
  ];

  const tabs: TabItem[] = [
    { id: "journey", label: "🚀 Customer Journey", icon: Rocket },
    { id: "telegram-ai", label: "🤖 Telegram AI Demo", icon: MessageSquare },
    { id: "automation", label: "⚡ Marketing Machine", icon: Zap },
    { id: "roi-calc", label: "💰 ROI Calculator", icon: DollarSign },
    { id: "testimonials", label: "⭐ Success Stories", icon: Star },
  ];

  const calculateROI = (): ROIData => {
    const monthlyRevenue = roiInputs.revenue / 12;
    const currentMarketingROI = monthlyRevenue / roiInputs.marketingBudget;
    const withPlatformROI = currentMarketingROI * 2.5; // Average 2.5x improvement
    const additionalRevenue =
      (withPlatformROI - currentMarketingROI) * roiInputs.marketingBudget * 12;

    return {
      currentROI: Math.round(currentMarketingROI * 100),
      newROI: Math.round(withPlatformROI * 100),
      additionalRevenue: Math.round(additionalRevenue),
      platformCost: 2400, // €200/month
      netGain: Math.round(additionalRevenue - 2400),
    };
  };

  const roiData = calculateROI();

  return (
    <div
      className="container mx-auto px-4 py-12"
      data-testid="ultimate-converter-demo"
    >
      {/* Hero Section */}
      <div className="text-center mb-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-white mb-6"
        >
          Van €{(roiInputs.revenue / 1000).toFixed(0)}K naar €
          {((roiInputs.revenue + roiData.netGain) / 1000).toFixed(0)}K+ omzet
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-300 mb-8"
        >
          Zie hoe scale-ups hun marketing volledig automatiseren en hun omzet
          2.5x vergroten
        </motion.p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-2 mb-8">
        <nav className="flex space-x-2 overflow-x-auto">
          {tabs.map(tab => (
            <NormalButton
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-tab={tab.id}
              className={`relative py-3 px-6 font-medium text-sm transition-all duration-300 flex items-center gap-2 rounded-xl whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </NormalButton>
          ))}
        </nav>
      </div>

      {/* Content Sections */}
      <AnimatePresence mode="wait">
        {/* Customer Journey Tab */}
        {activeTab === "journey" && (
          <motion.div
            key="journey"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
            data-tab-content="journey"
          >
            {/* Interactive Journey Steps */}
            <div className="grid lg:grid-cols-2 gap-8">
              {customerJourneySteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className={`relative group cursor-pointer transition-all duration-300 ${
                    currentStep === index ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/70 transition-all duration-300 h-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-white">
                        {step.title}
                      </h3>
                      <div className="text-right">
                        <div className="text-sm text-green-400 font-medium">
                          {step.time}
                        </div>
                        <div className="text-xs text-slate-400">
                          {step.difficulty}
                        </div>
                      </div>
                    </div>

                    <h4 className="text-lg text-blue-300 mb-3">
                      {step.subtitle}
                    </h4>
                    <p className="text-slate-300 mb-4 leading-relaxed">
                      {step.description}
                    </p>

                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-300 font-semibold">
                        <TrendingUp className="w-4 h-4" />
                        {step.impact}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-300">5 min</div>
                <div className="text-sm text-slate-400">Setup tijd</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-300">2.5x</div>
                <div className="text-sm text-slate-400">ROI verbetering</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-300">40h</div>
                <div className="text-sm text-slate-400">Tijd bespaard/week</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-cyan-300">24/7</div>
                <div className="text-sm text-slate-400">AI Assistant</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Telegram AI Demo Tab */}
        {activeTab === "telegram-ai" && (
          <motion.div
            key="telegram-ai"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
            data-tab-content="telegram-ai"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                🤖 Je Persoonlijke Business AI
              </h2>
              <p className="text-xl text-slate-300">
                Chat met je bedrijfsdata alsof je met een expert praat
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Chat Simulation */}
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Live Telegram Chat
                    </h3>
                    <p className="text-sm text-slate-400">@YourBusiness_AI</p>
                  </div>
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>

                <div className="space-y-4 h-80 overflow-y-auto mb-4">
                  <div className="bg-blue-600/20 rounded-lg p-3 ml-8">
                    <p className="text-white text-sm">
                      Hoe gaan onze campagnes deze maand?
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Jij - 14:32</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3 mr-8">
                    <p className="text-white text-sm">
                      💪 Geweldig! LinkedIn campagne: +45% leads, Instagram:
                      +32% engagement. Budget efficiency op 340% ROI. Wil je de
                      details per platform?
                    </p>
                    <p className="text-xs text-slate-400 mt-1">AI - 14:32</p>
                  </div>
                  <div className="bg-blue-600/20 rounded-lg p-3 ml-8">
                    <p className="text-white text-sm">
                      Ja! En kun je voorspellen wat ik volgende maand ga
                      verdienen?
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Jij - 14:33</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3 mr-8">
                    <p className="text-white text-sm">
                      📊 Op basis van huidige trends: €94K omzet verwacht (+12%
                      vs deze maand). Top kanalen: LinkedIn ads, email
                      nurturing. Zal ik een actieplan maken?
                    </p>
                    <p className="text-xs text-slate-400 mt-1">AI - 14:33</p>
                  </div>
                  <div className="bg-blue-600/20 rounded-lg p-3 ml-8">
                    <p className="text-white text-sm">
                      Perfect! En maak direct content voor volgende week
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Jij - 14:34</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3 mr-8">
                    <p className="text-white text-sm">
                      ✅ Done! 15 posts gepland: 5 LinkedIn artikelen, 7
                      Instagram posts, 3 stories. Focus op case studies en
                      testimonials. Publicatie start morgen 9:00.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">AI - 14:34</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Typ je vraag..."
                    className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                  <NormalButton className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <Send className="w-4 h-4" />
                  </NormalButton>
                </div>
              </div>

              {/* AI Capabilities */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-white mb-4">
                    🚀 Wat kan je AI?
                  </h4>
                  <div className="space-y-3">
                    {[
                      "Real-time omzet en lead tracking",
                      "Content genereren en plannen",
                      "Campagne optimalisatie tips",
                      "Concurrent analyse",
                      "ROI voorspellingen",
                      "Automatische rapportages",
                    ].map((capability, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-white">{capability}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-white mb-4">
                    ⏰ 24/7 Beschikbaar
                  </h4>
                  <div className="space-y-3">
                    {[
                      "Instant antwoord op business vragen",
                      "Weekend en avond support",
                      "Automatische alerts bij kansen",
                      "Veilige toegang vanaf overal",
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <span className="text-white">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Marketing Automation Tab */}
        {activeTab === "automation" && (
          <motion.div
            key="automation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
            data-tab-content="automation"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                ⚡ Marketing Machine op Autopilot
              </h2>
              <p className="text-xl text-slate-300">
                50+ posts per week, volledig geautomatiseerd
              </p>
            </div>

            {/* Live Demo Dashboard */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white">
                  Live Marketing Dashboard
                </h3>
                <div className="flex items-center gap-4">
                  <NormalButton
                    onClick={() => setIsLiveMode(!isLiveMode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isLiveMode
                        ? "bg-green-600/20 border border-green-500/30 text-green-300"
                        : "bg-slate-700/50 border border-slate-600 text-slate-300"
                    }`}
                  >
                    {isLiveMode ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    {isLiveMode ? "Live Data" : "Demo Mode"}
                  </NormalButton>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                    <span className="text-xs text-green-300">+12%</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {liveMetrics.engagement.toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-200">Engagement Rate</div>
                </div>

                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-6 h-6 text-green-400" />
                    <span className="text-xs text-green-300">+8</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {liveMetrics.leads}
                  </div>
                  <div className="text-sm text-green-200">Leads deze week</div>
                </div>

                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-6 h-6 text-purple-400" />
                    <span className="text-xs text-green-300">+15%</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {Math.round(liveMetrics.roi)}%
                  </div>
                  <div className="text-sm text-purple-200">Marketing ROI</div>
                </div>

                <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-6 h-6 text-cyan-400" />
                    <span className="text-xs text-green-300">Deze week</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {Math.round(liveMetrics.timeSaved)}h
                  </div>
                  <div className="text-sm text-cyan-200">Tijd bespaard</div>
                </div>
              </div>
            </div>

            {/* Automation Features */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white mb-3">
                  AI Content Engine
                </h4>
                <p className="text-slate-300 mb-4">
                  Genereert branded content op basis van trends en
                  concurrentenanalyse
                </p>
                <div className="text-green-400 font-semibold">
                  50+ posts/week automatisch
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white mb-3">
                  Smart Targeting
                </h4>
                <p className="text-slate-300 mb-4">
                  AI bepaalt optimale doelgroepen en timing voor maximale impact
                </p>
                <div className="text-green-400 font-semibold">
                  +340% meer conversies
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white mb-3">
                  Real-time Optimization
                </h4>
                <p className="text-slate-300 mb-4">
                  Automatische A/B testing en budget allocatie voor optimale ROI
                </p>
                <div className="text-green-400 font-semibold">
                  +125% ROI verbetering
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ROI Calculator Tab */}
        {activeTab === "roi-calc" && (
          <motion.div
            key="roi-calc"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
            data-tab-content="roi-calc"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                💰 Bereken Je ROI Impact
              </h2>
              <p className="text-xl text-slate-300">
                Zie hoeveel extra omzet je kunt genereren met ons platform
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">
                  Je Huidige Situatie
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Jaarlijkse omzet (€)
                    </label>
                    <input
                      type="number"
                      value={roiInputs.revenue}
                      onChange={e =>
                        setRoiInputs(prev => ({
                          ...prev,
                          revenue: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Maandelijks marketing budget (€)
                    </label>
                    <input
                      type="number"
                      value={roiInputs.marketingBudget}
                      onChange={e =>
                        setRoiInputs(prev => ({
                          ...prev,
                          marketingBudget: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Team grootte
                    </label>
                    <input
                      type="number"
                      value={roiInputs.teamSize}
                      onChange={e =>
                        setRoiInputs(prev => ({
                          ...prev,
                          teamSize: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="space-y-6">
                {/* Current vs New ROI */}
                <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6">
                    Je ROI Impact
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Huidige ROI:</span>
                      <span className="text-2xl font-bold text-white">
                        {roiData.currentROI}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Met ons platform:</span>
                      <span className="text-2xl font-bold text-green-400">
                        {roiData.newROI}%
                      </span>
                    </div>

                    <div className="border-t border-slate-600 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-white">
                          Extra omzet/jaar:
                        </span>
                        <span className="text-3xl font-bold text-green-400">
                          +€{roiData.additionalRevenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Investment vs Return */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg text-slate-300">
                        Platform kosten
                      </div>
                      <div className="text-2xl font-bold text-white">
                        €{roiData.platformCost.toLocaleString()}/jaar
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg text-slate-300">Netto winst</div>
                      <div className="text-2xl font-bold text-green-400">
                        +€{roiData.netGain.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Benefits */}
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
                  <h4 className="font-bold text-white mb-4">
                    Extra voordelen:
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300">
                        40+ uur per week tijdsbesparing
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300">
                        Betere leadkwaliteit en conversie
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300">
                        24/7 business intelligence
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Success Stories Tab */}
        {activeTab === "testimonials" && (
          <motion.div
            key="testimonials"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
            data-tab-content="testimonials"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                ⭐ Echte Resultaten van Scale-ups
              </h2>
              <p className="text-xl text-slate-300">
                Zie hoe bedrijven zoals jouw hun omzet hebben getransformeerd
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Success Story 1 */}
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    TM
                  </div>
                  <div>
                    <div className="font-bold text-white">TechMotion B.V.</div>
                    <div className="text-sm text-slate-400">
                      SaaS startup, €800K omzet
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    +€240K
                  </div>
                  <div className="text-slate-300">Extra omzet in 8 maanden</div>
                </div>

                <blockquote className="text-slate-300 italic mb-4">
                  "Van 20 leads per maand naar 180 leads. De AI doet letterlijk
                  alles - van content tot optimalisatie. Onze ROI ging van 180%
                  naar 420%."
                </blockquote>

                <div className="text-sm text-slate-400">- Marcus V., CEO</div>
              </div>

              {/* Success Story 2 */}
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                    GC
                  </div>
                  <div>
                    <div className="font-bold text-white">
                      GreenCycle Solutions
                    </div>
                    <div className="text-sm text-slate-400">
                      E-commerce, €1.2M omzet
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    +€380K
                  </div>
                  <div className="text-slate-300">Omzetgroei in 6 maanden</div>
                </div>

                <blockquote className="text-slate-300 italic mb-4">
                  "Het Telegram AI systeem is geniaal. Ik krijg real-time
                  insights over alles. Wist binnen 2 weken al dat dit ons
                  bedrijf zou transformeren."
                </blockquote>

                <div className="text-sm text-slate-400">
                  - Lisa K., Marketing Director
                </div>
              </div>

              {/* Success Story 3 */}
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    FS
                  </div>
                  <div>
                    <div className="font-bold text-white">FlexiSoft Agency</div>
                    <div className="text-sm text-slate-400">
                      Consultancy, €650K omzet
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    +€190K
                  </div>
                  <div className="text-slate-300">ARR groei in 10 maanden</div>
                </div>

                <blockquote className="text-slate-300 italic mb-4">
                  "We hadden geen tijd voor marketing. Nu draait alles
                  automatisch en krijgen we betere leads dan ooit. ROI van 340%
                  op ons marketing budget."
                </blockquote>

                <div className="text-sm text-slate-400">
                  - David R., Founder
                </div>
              </div>
            </div>

            {/* Metrics Overview */}
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-8 mt-12">
              <h3 className="text-2xl font-bold text-white text-center mb-8">
                Gemiddelde Resultaten na 6 maanden
              </h3>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    +265%
                  </div>
                  <div className="text-slate-300">ROI verbetering</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">
                    +420%
                  </div>
                  <div className="text-slate-300">Meer leads</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-400 mb-2">
                    40h
                  </div>
                  <div className="text-slate-300">Tijd bespaard/week</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-cyan-400 mb-2">
                    €295K
                  </div>
                  <div className="text-slate-300">Gem. extra omzet</div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center mt-12">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Klaar om je resultaten te transformeren?
                </h3>
                <p className="text-blue-100 mb-6">
                  Start vandaag nog en zie binnen 30 dagen je eerste resultaten
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <NormalButton className="bg-white text-blue-600 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors">
                    🚀 Start 14-dagen gratis trial
                  </NormalButton>
                  <NormalButton className="bg-blue-800/50 text-white font-bold px-8 py-3 rounded-xl border border-blue-400 hover:bg-blue-700/50 transition-colors">
                    📞 Plan demo gesprek
                  </NormalButton>
                </div>

                <div className="text-sm text-blue-200 mt-4">
                  ✅ Geen setup kosten • ✅ Cancel anytime • ✅ 30-dagen geld
                  terug garantie
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
