"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Rocket,
  Target,
  TrendingUp,
  Users,
  BarChart3,
  Zap,
  Brain,
  Share2,
  CheckCircle,
  Star,
  DollarSign,
  Globe,
  Lightbulb,
  Settings,
  Eye,
  MousePointer,
  Shield,
  ArrowUp,
  ArrowDown,
  Activity,
  Wifi,
  RefreshCw,
  Send,
  PieChart,
  LineChart,
  Database,
  AlertTriangle,
  Gauge,
  FileText,
} from "lucide-react";

interface CompanyProfile {
  industry: string;
  revenue: string;
  teamSize: string;
  currentChannels: string[];
  goals: string[];
}

interface LiveMetric {
  value: number;
  change: number;
  trend: "up" | "down" | "stable";
}

interface JourneyStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  duration: number;
  features: string[];
  keyBenefits: string[];
  roiImpact: string;
  demoComponent: React.ReactNode;
}

// Live metrics simulation hook
function useLiveMetrics() {
  const [metrics, setMetrics] = useState<Record<string, LiveMetric>>({
    engagement: { value: 2.4, change: 0, trend: "stable" },
    reach: { value: 15420, change: 0, trend: "stable" },
    leads: { value: 47, change: 0, trend: "stable" },
    roi: { value: 340, change: 0, trend: "stable" },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        const newMetrics = { ...prev };
        Object.keys(newMetrics).forEach(key => {
          const change = (Math.random() - 0.5) * 0.1;
          const newValue = Math.max(0, newMetrics[key].value + change);
          newMetrics[key] = {
            value: newValue,
            change: ((newValue - prev[key].value) / prev[key].value) * 100,
            trend: change > 0.02 ? "up" : change < -0.02 ? "down" : "stable",
          };
        });
        return newMetrics;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
}

const journeySteps: JourneyStep[] = [
  {
    id: "onboarding",
    title: "Smart Onboarding",
    subtitle: "Van setup naar succes in 5 minuten",
    description:
      "Intelligente onboarding die automatisch je bedrijfsprofiel analyseert en een gepersonaliseerde marketingstrategie voorstelt.",
    icon: Rocket,
    duration: 300,
    features: [
      "AI-gestuurde bedrijfsanalyse",
      "Automatische doelgroep identificatie",
      "Gepersonaliseerde content strategie",
      "Multi-platform account koppeling",
    ],
    keyBenefits: [
      "90% snellere setup vs concurrenten",
      "Direct bruikbare content voorstellen",
      "Geautomatiseerde workflow configuratie",
    ],
    roiImpact: "+€25K ARR door snellere time-to-value",
    demoComponent: <OnboardingDemo />,
  },
  {
    id: "research",
    title: "Intelligente Marktanalyse",
    subtitle: "Real-time concurrent & trend intelligence",
    description:
      "Geavanceerde AI-engine die continue markttrends analyseert, concurrenten monitort en content kansen identificeert.",
    icon: Brain,
    duration: 420,
    features: [
      "Real-time concurrent monitoring",
      "Trend detectie & voorspelling",
      "Content gap analyse",
      "Keyword opportunity mapping",
    ],
    keyBenefits: [
      "Altijd een stap voor op concurrenten",
      "3x meer viral content door trend timing",
      "Automatische content ideation",
    ],
    roiImpact: "+€40K ARR door betere content performance",
    demoComponent: <ResearchDemo />,
  },
  {
    id: "ideation",
    title: "AI Content Ideation",
    subtitle: "Van trend naar viral content in seconden",
    description:
      "Krachtige AI die trends omzet in platform-specifieke content ideeën met hoge engagement potentie.",
    icon: Lightbulb,
    duration: 180,
    features: [
      "Multi-platform content aanpassing",
      "Viral potentie scoring",
      "A/B variant generatie",
      "SEO & hashtag optimalisatie",
    ],
    keyBenefits: [
      "10x snellere content creatie",
      "250% hoger engagement",
      "Consistente brand voice",
    ],
    roiImpact: "+€60K ARR door content efficiency",
    demoComponent: <IdeationDemo />,
  },
  {
    id: "creation",
    title: "Geautomatiseerde Content Productie",
    subtitle: "Van idee naar publicatie in één klik",
    description:
      "Volledig geautomatiseerde content productie workflow met AI-gegenereerde teksten, visuals en publishing scheduling.",
    icon: Zap,
    duration: 240,
    features: [
      "AI copywriting & visual generation",
      "Multi-format content adaptatie",
      "Brand consistency checks",
      "Automated scheduling",
    ],
    keyBenefits: [
      "15x snellere content productie",
      "100% brand consistentie",
      "Zero manual formatting",
    ],
    roiImpact: "+€80K ARR door operational efficiency",
    demoComponent: <CreationDemo />,
  },
  {
    id: "optimization",
    title: "Self-Learning Analytics",
    subtitle: "AI die leert van elke post voor betere performance",
    description:
      "Geavanceerde analytics engine die continue leert van content performance en automatisch optimalisaties doorvoert.",
    icon: TrendingUp,
    duration: 360,
    features: [
      "Real-time performance tracking",
      "Predictive engagement modeling",
      "Automated A/B testing",
      "Smart optimization recommendations",
    ],
    keyBenefits: [
      "Continue performance verbetering",
      "40% hoger average engagement",
      "Data-driven besluitvorming",
    ],
    roiImpact: "+€120K ARR door optimized content ROI",
    demoComponent: <OptimizationDemo />,
  },
  {
    id: "scaling",
    title: "Enterprise Scaling",
    subtitle: "Van startup naar scale-up marketing machine",
    description:
      "Enterprise-grade schaalbaarheid met team collaboration, advanced analytics en custom integrations.",
    icon: Target,
    duration: 480,
    features: [
      "Multi-team collaboration",
      "Advanced ROI analytics",
      "Custom API integrations",
      "White-label solutions",
    ],
    keyBenefits: [
      "Seamless team scaling",
      "Enterprise security & compliance",
      "Custom workflow automation",
    ],
    roiImpact: "+€200K ARR door enterprise features",
    demoComponent: <ScalingDemo />,
  },
  {
    id: "bi-overview",
    title: "BI Dashboard Overview",
    subtitle: "Executive command center voor data-driven beslissingen",
    description:
      "Krachtig BI dashboard dat alle marketing en business data combineert in één overzichtelijk command center voor executives en managers.",
    icon: BarChart3,
    duration: 360,
    features: [
      "Real-time KPI monitoring",
      "Executive summary dashboards",
      "Cross-platform data aggregation",
      "Predictive analytics insights",
    ],
    keyBenefits: [
      "Instant business intelligence",
      "360° view van performance",
      "Data-driven besluitvorming",
    ],
    roiImpact: "+€150K ARR door betere strategische beslissingen",
    demoComponent: <BIDashboardOverviewDemo />,
  },
  {
    id: "advanced-analytics",
    title: "Advanced Analytics Engine",
    subtitle: "AI-powered predictive intelligence voor growth hackers",
    description:
      "Geavanceerde analytics engine met machine learning capabilities voor predictive modeling en advanced business intelligence.",
    icon: Brain,
    duration: 420,
    features: [
      "Predictive revenue modeling",
      "Customer lifecycle analytics",
      "Churn prediction algorithms",
      "Advanced cohort analysis",
    ],
    keyBenefits: [
      "Voorspel trends 6 maanden vooruit",
      "85% accuracy in revenue forecasting",
      "Proactive churn prevention",
    ],
    roiImpact: "+€250K ARR door predictive intelligence",
    demoComponent: <AdvancedAnalyticsDemo />,
  },
  {
    id: "custom-reporting",
    title: "Custom Reporting Suite",
    subtitle: "White-label rapportage voor klanten en stakeholders",
    description:
      "Flexibele rapportage suite voor het genereren van gepersonaliseerde rapporten voor verschillende stakeholders en klanten.",
    icon: FileText,
    duration: 300,
    features: [
      "White-label report generation",
      "Automated stakeholder reports",
      "Custom KPI frameworks",
      "Interactive data visualizations",
    ],
    keyBenefits: [
      "Professional client reporting",
      "90% tijd besparing op rapportage",
      "Branded stakeholder dashboards",
    ],
    roiImpact: "+€100K ARR door professionele rapportage",
    demoComponent: <CustomReportingDemo />,
  },
];

export default function ComprehensiveCustomerJourneyDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTooltip, setShowTooltip] = useState(true);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    industry: "",
    revenue: "",
    teamSize: "",
    currentChannels: [],
    goals: [],
  });
  const [simulating, setSimulating] = useState(false);

  const liveMetrics = useLiveMetrics();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 100 / journeySteps[currentStep].duration;
          if (newProgress >= 100) {
            if (currentStep < journeySteps.length - 1) {
              setCurrentStep(currentStep + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          return newProgress;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentStep]);

  const totalROI = journeySteps.reduce((sum, step) => {
    const roiValue = parseInt(step.roiImpact.match(/€(\d+)K/)?.[1] || "0");
    return sum + roiValue;
  }, 0);

  const startSimulation = () => {
    setSimulating(true);
    setIsPlaying(true);
    // Auto-complete company profile for demo
    setCompanyProfile({
      industry: "SaaS",
      revenue: "€500K-1M",
      teamSize: "25-50",
      currentChannels: ["LinkedIn", "Website", "Email"],
      goals: ["Lead Generation", "Brand Awareness", "Thought Leadership"],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white">
      {/* Live Status Bar */}
      <div className="bg-gray-800/80 backdrop-blur border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${simulating ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
                />
                <span className="text-sm font-medium text-gray-200">
                  {simulating ? "Live Simulatie Actief" : "Demo Klaar"}
                </span>
              </div>
              {simulating && (
                <div className="flex items-center gap-6 text-sm text-gray-300">
                  <div className="flex items-center gap-1">
                    <Activity className="w-4 h-4 text-green-400" />
                    <span>
                      Engagement: {liveMetrics.engagement.value.toFixed(1)}%
                    </span>
                    {liveMetrics.engagement.trend === "up" && (
                      <ArrowUp className="w-3 h-3 text-green-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>
                      Reach:{" "}
                      {Math.round(liveMetrics.reach.value).toLocaleString()}
                    </span>
                    {liveMetrics.reach.trend === "up" && (
                      <ArrowUp className="w-3 h-3 text-green-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4 text-purple-400" />
                    <span>Leads: {Math.round(liveMetrics.leads.value)}</span>
                    {liveMetrics.leads.trend === "up" && (
                      <ArrowUp className="w-3 h-3 text-green-400" />
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Real-time sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20" />
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge className="mb-4 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border-blue-500/30">
              🚀 Marketing Machine Platform Demo
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-6">
              De Complete Marketing
              <br />
              Automatisering Journey
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Ervaar hoe scale-up bedrijven hun marketing volledig automatiseren
              en
              <span className="font-semibold text-blue-400">
                {" "}
                €{totalROI}K+ ARR boost
              </span>{" "}
              realiseren
            </p>

            {/* ROI Calculator */}
            <Card className="max-w-md mx-auto mb-8 border-blue-500/30 bg-gray-800/50 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span className="font-semibold text-white">
                    Live ROI Impact
                  </span>
                  {simulating && (
                    <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                  )}
                </div>
                <div className="text-3xl font-bold text-green-400 mb-2">
                  €
                  {simulating
                    ? Math.round(liveMetrics.roi.value).toLocaleString()
                    : totalROI}
                  K ARR
                </div>
                <p className="text-sm text-gray-400">
                  {simulating
                    ? "Real-time berekening gebaseerd op demo"
                    : "Gemiddelde jaarlijkse omzetgroei voor scale-ups"}
                </p>
                {simulating && liveMetrics.roi.change !== 0 && (
                  <div
                    className={`flex items-center gap-1 mt-2 text-sm ${liveMetrics.roi.change > 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {liveMetrics.roi.change > 0 ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                    <span>
                      {Math.abs(liveMetrics.roi.change).toFixed(1)}% laatste
                      minuut
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              onClick={startSimulation}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              disabled={simulating}
            >
              <Play className="w-5 h-5 mr-2" />
              Start Live Demo Simulatie
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Journey Progress */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="mb-8 border-gray-700 bg-gray-800/50 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                Demo Voortgang
              </h3>
              <Badge
                variant="outline"
                className="text-blue-400 border-blue-500/30 bg-blue-600/20"
              >
                Stap {currentStep + 1} van {journeySteps.length}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {journeySteps.map((step, index) => (
                <Button
                  key={step.id}
                  variant={
                    index === currentStep
                      ? "default"
                      : index < currentStep
                        ? "secondary"
                        : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    setCurrentStep(index);
                    setProgress(0);
                  }}
                  className={`
                    ${index === currentStep ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
                    ${index < currentStep ? "bg-green-600/20 text-green-400 border-green-500/30 hover:bg-green-600/30" : ""}
                    ${index > currentStep ? "border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-gray-200" : ""}
                  `}
                >
                  {index < currentStep && (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  )}
                  <step.icon className="w-4 h-4 mr-1" />
                  {step.title}
                </Button>
              ))}
            </div>

            <Progress
              value={
                currentStep === journeySteps.length - 1
                  ? 100
                  : (currentStep / (journeySteps.length - 1)) * 100
              }
              className="h-2"
            />
          </CardContent>
        </Card>

        {/* Current Step Demo */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <StepDemo
              step={journeySteps[currentStep]}
              progress={progress}
              isPlaying={isPlaying}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Tooltip for first-time users */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Card className="max-w-sm border-blue-500/30 bg-gray-800/90 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <MousePointer className="w-5 h-5 text-blue-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-blue-300 mb-1">
                      💡 Interactieve Demo
                    </p>
                    <p className="text-xs text-gray-300 mb-3">
                      Klik op de stappen of gebruik de controls om de customer
                      journey te verkennen
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowTooltip(false)}
                      className="text-xs border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      Begrepen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepDemo({
  step,
  progress,
  isPlaying,
}: {
  step: JourneyStep;
  progress: number;
  isPlaying: boolean;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Step Info */}
      <div className="lg:col-span-1">
        <div className="h-full bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-700/50 shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/30 to-slate-900/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_40%)]" />

          <div className="relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-2xl backdrop-blur-sm border border-white/10">
                <step.icon className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  {step.title}
                </h3>
                <p className="text-blue-300 font-medium">{step.subtitle}</p>
              </div>
            </div>

            {/* Enhanced Progress Bar */}
            <div className="mb-6">
              <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden shadow-inner border border-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 shadow-lg"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="h-full bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
                </motion.div>
              </div>
              <div className="text-right mt-2">
                <span className="text-sm font-bold text-blue-300">
                  {Math.round(progress)}% compleet
                </span>
              </div>
            </div>

            <p className="text-slate-100 mb-8 text-lg leading-relaxed">
              {step.description}
            </p>

            <div className="mb-8">
              <h4 className="font-bold text-white mb-4 flex items-center gap-3 text-lg">
                <Star className="w-5 h-5 text-yellow-400" />⚡ Key Features
              </h4>
              <div className="space-y-3">
                {step.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-100 font-medium">
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h4 className="font-bold text-white mb-4 flex items-center gap-3 text-lg">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                🚀 Key Benefits
              </h4>
              <div className="space-y-3">
                {step.keyBenefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 backdrop-blur-sm border border-emerald-400/20"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                    <span className="text-emerald-100 font-medium">
                      {benefit}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 rounded-2xl border border-emerald-400/20 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-teal-400/5 animate-pulse" />
              <div className="flex items-center gap-3 mb-3 relative">
                <DollarSign className="w-6 h-6 text-emerald-400" />
                <span className="font-bold text-emerald-200 text-lg">
                  💰 ROI Impact
                </span>
              </div>
              <p className="text-emerald-100 font-bold text-xl relative">
                {step.roiImpact}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Demo */}
      <div className="lg:col-span-2">
        <div className="h-full bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.1),transparent_40%)]" />

          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center gap-3 text-2xl font-bold text-white">
                <Eye className="w-6 h-6 text-purple-400" />
                🎯 Live Demo
              </h3>
              <Badge
                className={`px-4 py-2 rounded-full font-bold text-sm border backdrop-blur-sm ${
                  isPlaying
                    ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/30 animate-pulse"
                    : "bg-slate-500/20 text-slate-300 border-slate-400/30"
                }`}
              >
                {isPlaying ? "🔴 Live Running" : "⏸️ Gepauzeerd"}
              </Badge>
            </div>

            <div className="relative min-h-[400px]">{step.demoComponent}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Demo Components for each step
function OnboardingDemo() {
  const [currentForm, setCurrentForm] = useState(0);
  const [formData, setFormData] = useState({
    industry: "SaaS",
    revenue: "€500K-1M",
    teamSize: "25-50",
    channels: ["LinkedIn", "Website"],
    goals: ["Lead Generation", "Brand Awareness"],
  });

  const formSteps = [
    { title: "Bedrijfsinfo", field: "industry" },
    { title: "Omzet & Team", field: "revenue" },
    { title: "Huidige Kanalen", field: "channels" },
    { title: "Marketing Doelen", field: "goals" },
  ];

  return (
    <div className="space-y-6">
      {/* Interactive Onboarding Wizard */}
      <div className="bg-gradient-to-r from-slate-800/60 via-slate-900/80 to-slate-800/60 rounded-2xl border border-slate-600/30 backdrop-blur-sm p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 animate-pulse" />

        <div className="relative">
          <h4 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
            <Rocket className="w-6 h-6 text-blue-400" />
            🚀 Interactieve Onboarding Wizard
          </h4>

          <div className="flex gap-2 mt-4 mb-4">
            {formSteps.map((step, index) => (
              <div
                key={index}
                className={`flex-1 h-3 rounded-full transition-all duration-300 ${
                  index <= currentForm
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg"
                    : "bg-slate-600/50"
                }`}
              />
            ))}
          </div>

          <p className="text-blue-200 font-semibold mb-6">
            Stap {currentForm + 1} van {formSteps.length}:{" "}
            {formSteps[currentForm].title}
          </p>

          <div className="min-h-[120px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentForm}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {currentForm === 0 && (
                  <div>
                    <Label>Wat voor type bedrijf heb je?</Label>
                    <Select
                      value={formData.industry}
                      onValueChange={value =>
                        setFormData({ ...formData, industry: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SaaS">SaaS/Software</SelectItem>
                        <SelectItem value="E-commerce">E-commerce</SelectItem>
                        <SelectItem value="Consulting">
                          Consulting/Services
                        </SelectItem>
                        <SelectItem value="FinTech">FinTech</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {currentForm === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label>Huidige jaaromzet (ARR)</Label>
                      <Select
                        value={formData.revenue}
                        onValueChange={value =>
                          setFormData({ ...formData, revenue: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="€300K-500K">
                            €300K - €500K
                          </SelectItem>
                          <SelectItem value="€500K-1M">€500K - €1M</SelectItem>
                          <SelectItem value="€1M-2M">€1M - €2M</SelectItem>
                          <SelectItem value="€2M-5M">€2M - €5M</SelectItem>
                          <SelectItem value="€5M+">€5M+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Teamgrootte</Label>
                      <Select
                        value={formData.teamSize}
                        onValueChange={value =>
                          setFormData({ ...formData, teamSize: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 mensen</SelectItem>
                          <SelectItem value="10-25">10-25 mensen</SelectItem>
                          <SelectItem value="25-50">25-50 mensen</SelectItem>
                          <SelectItem value="50+">50+ mensen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {currentForm === 2 && (
                  <div>
                    <Label>
                      Huidige marketing kanalen (selecteer alle die van
                      toepassing zijn)
                    </Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        "LinkedIn",
                        "Twitter",
                        "Website",
                        "Email",
                        "Google Ads",
                        "Facebook",
                      ].map(channel => (
                        <div key={channel} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`channel-${channel}`}
                            checked={formData.channels.includes(channel)}
                            onChange={e => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  channels: [...formData.channels, channel],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  channels: formData.channels.filter(
                                    c => c !== channel
                                  ),
                                });
                              }
                            }}
                            className="rounded"
                          />
                          <label
                            htmlFor={`channel-${channel}`}
                            className="text-sm cursor-pointer"
                          >
                            {channel}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentForm === 3 && (
                  <div>
                    <Label>Primaire marketing doelen</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {[
                        "Lead Generation",
                        "Brand Awareness",
                        "Thought Leadership",
                        "Customer Retention",
                        "Product Marketing",
                      ].map(goal => (
                        <div key={goal} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`goal-${goal.replace(/\s+/g, "-").toLowerCase()}`}
                            checked={formData.goals.includes(goal)}
                            onChange={e => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  goals: [...formData.goals, goal],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  goals: formData.goals.filter(g => g !== goal),
                                });
                              }
                            }}
                            className="rounded"
                          />
                          <label
                            htmlFor={`goal-${goal.replace(/\s+/g, "-").toLowerCase()}`}
                            className="text-sm cursor-pointer"
                          >
                            {goal}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentForm(Math.max(0, currentForm - 1))}
              disabled={currentForm === 0}
            >
              Vorige
            </Button>
            <Button
              onClick={() => {
                if (currentForm === formSteps.length - 1) {
                  // Handle completion - could show a success message or redirect
                  alert("Onboarding voltooid! 🎉");
                  setCurrentForm(0); // Reset to start for demo purposes
                } else {
                  setCurrentForm(
                    Math.min(formSteps.length - 1, currentForm + 1)
                  );
                }
              }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            >
              {currentForm === formSteps.length - 1 ? "Voltooien" : "Volgende"}
            </Button>
          </div>
        </div>
      </div>

      {/* Premium AI Analysis Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-2xl border border-blue-400/30 backdrop-blur-sm p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5 animate-pulse" />
          <div className="relative">
            <h4 className="text-lg font-bold text-white flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-blue-400" />
              🧠 AI Bedrijfsprofiel Analyse
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <span className="text-slate-200 font-medium">
                  {formData.industry} Scale-up
                </span>
                <Badge className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  <Eye className="w-3 h-3 mr-1" />
                  Gedetecteerd
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <span className="text-slate-200 font-medium">
                  {formData.revenue}
                </span>
                <Badge className="bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  <DollarSign className="w-3 h-3 mr-1" />
                  Geanalyseerd
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <span className="text-slate-200 font-medium">
                  B2B Focus ({formData.teamSize} team)
                </span>
                <Badge className="bg-purple-500/20 text-purple-200 border border-purple-400/30">
                  <Target className="w-3 h-3 mr-1" />
                  Bevestigd
                </Badge>
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl border border-emerald-400/20">
                <div className="flex items-center gap-3 mb-3">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-200 font-bold">
                    AI Confidence Score
                  </span>
                </div>
                <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 w-[92%] rounded-full shadow-lg">
                    <div className="h-full bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
                  </div>
                </div>
                <p className="text-emerald-300 text-sm font-medium">
                  92% - Hoge betrouwbaarheid voor {formData.industry}{" "}
                  segmentatie
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card className="border-slate-600/30 bg-slate-800/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-white">
              <Lightbulb className="w-4 h-4 text-green-400" />
              Gepersonaliseerde Content Strategie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {formData.channels.map((channel, index) => (
                <div key={channel} className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm">{channel} optimization</span>
                  <Badge variant="outline" className="text-xs">
                    {index === 0 ? "High" : index === 1 ? "Medium" : "Low"}{" "}
                    Priority
                  </Badge>
                </div>
              ))}
              <div className="mt-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-200">
                    Auto-generated Workflows
                  </span>
                </div>
                <div className="text-xs text-blue-300 space-y-1">
                  <div>
                    • {formData.goals.length} content pillars geïdentificeerd
                  </div>
                  <div>
                    • {formData.channels.length} platform integrations klaar
                  </div>
                  <div>• 15 content templates gegenereerd</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-gradient-to-r from-slate-800/60 via-slate-900/80 to-slate-800/60 p-6 rounded-lg border border-slate-600/30 backdrop-blur">
        <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-400" />
          🎯 AI-Gepersonaliseerde Aanbevelingen
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-sm mb-2 text-slate-100">
              Basis Strategie
            </h5>
            <ul className="text-sm text-slate-200 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Focus op {formData.industry} industry insights
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                {formData.goals.includes("Lead Generation")
                  ? "Lead-gen focused content"
                  : "Brand awareness content"}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Data-driven storytelling voor {formData.teamSize} teams
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-sm mb-2 text-slate-100">
              Geavanceerde Tactieken
            </h5>
            <ul className="text-sm text-slate-200 space-y-1">
              <li className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-400" />
                Account-based marketing voor {formData.revenue} segment
              </li>
              <li className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-400" />
                Multi-channel attribution tracking
              </li>
              <li className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-400" />
                Automated A/B testing workflows
              </li>
            </ul>
          </div>
        </div>

        {/* Expected Results */}
        <div className="mt-6 p-4 bg-slate-700/40 rounded-lg border border-slate-600/40 backdrop-blur">
          <h5 className="font-medium text-sm mb-3 flex items-center gap-2 text-white">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Verwachte Resultaten (90 dagen)
          </h5>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">+156%</div>
              <div className="text-xs text-slate-300">Engagement Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">+89%</div>
              <div className="text-xs text-slate-300">Lead Generation</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">-67%</div>
              <div className="text-xs text-slate-300">
                Content Creation Time
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResearchDemo() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="trends">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-600/30">
          <TabsTrigger
            value="trends"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300"
          >
            Trending Topics
          </TabsTrigger>
          <TabsTrigger
            value="competitors"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300"
          >
            Concurrent Analyse
          </TabsTrigger>
          <TabsTrigger
            value="opportunities"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300"
          >
            Content Kansen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { topic: "AI in SaaS", trend: "+245%", confidence: "High" },
              {
                topic: "Remote Team Tools",
                trend: "+156%",
                confidence: "Medium",
              },
              { topic: "Data Privacy", trend: "+89%", confidence: "High" },
            ].map((item, index) => (
              <Card
                key={index}
                className="border-slate-600/30 bg-slate-800/50 backdrop-blur"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-white">{item.topic}</h4>
                    <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                      {item.confidence}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {item.trend}
                  </div>
                  <p className="text-xs text-slate-300">
                    Interest growth this week
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="competitors">
          <div className="space-y-4">
            {[
              {
                name: "Concurrent A",
                engagement: "2.3%",
                posts: "12/week",
                score: 85,
              },
              {
                name: "Concurrent B",
                engagement: "1.8%",
                posts: "8/week",
                score: 72,
              },
              {
                name: "Concurrent C",
                engagement: "3.1%",
                posts: "15/week",
                score: 91,
              },
            ].map((comp, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur rounded-lg border border-slate-600/30"
              >
                <div>
                  <h4 className="font-medium text-white">{comp.name}</h4>
                  <p className="text-sm text-slate-300">
                    {comp.posts} • {comp.engagement} avg engagement
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-400">
                    {comp.score}
                  </div>
                  <p className="text-xs text-slate-400">Performance Score</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="opportunities">
          <div className="space-y-3">
            {[
              {
                title: "AI Implementation Guide",
                potential: "High",
                difficulty: "Medium",
              },
              {
                title: "ROI Calculator Tool",
                potential: "Very High",
                difficulty: "Low",
              },
              {
                title: "Industry Benchmark Report",
                potential: "High",
                difficulty: "High",
              },
            ].map((opp, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-slate-600/30 bg-slate-800/40 backdrop-blur rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-white">{opp.title}</h4>
                  <div className="flex gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className="text-xs border-green-500/30 text-green-300"
                    >
                      {opp.potential} potential
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-xs border-orange-500/30 text-orange-300"
                    >
                      {opp.difficulty} effort
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white border-none"
                >
                  Generate
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function IdeationDemo() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-800/60 via-slate-900/80 to-slate-800/60 p-4 rounded-lg border border-slate-600/30 backdrop-blur">
        <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
          <Brain className="w-5 h-5 text-purple-400" />
          AI Content Generator
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-200 block mb-2">
              Input Trend
            </label>
            <div className="bg-slate-700/50 p-3 rounded border border-slate-600/30 text-sm text-slate-100 backdrop-blur">
              "AI in SaaS is transforming customer support"
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-200 block mb-2">
              Platform
            </label>
            <div className="bg-slate-700/50 p-3 rounded border border-slate-600/30 text-sm text-slate-100 backdrop-blur">
              LinkedIn (Professional)
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-600/30 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-white">
              <Star className="w-4 h-4 text-yellow-400" />
              Generated Content A
            </CardTitle>
            <div className="flex gap-2">
              <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                Viral Score: 8.5/10
              </Badge>
              <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                Engagement: High
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-700/40 p-3 rounded text-sm mb-3 text-slate-100 border border-slate-600/20">
              "🤖 AI is revolutionizing SaaS customer support in ways we never
              imagined...
              <br />
              <br />
              Just implemented ChatGPT integration and saw 70% reduction in
              response time.
              <br />
              <br />
              What's your experience with AI support tools? 👇"
            </div>
            <div className="flex gap-2 text-xs">
              <span className="text-blue-400">#AI #SaaS #CustomerSupport</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-600/30 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-white">
              <Star className="w-4 h-4 text-yellow-400" />
              Generated Content B
            </CardTitle>
            <div className="flex gap-2">
              <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                Viral Score: 9.2/10
              </Badge>
              <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                Engagement: Very High
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-700/40 p-3 rounded text-sm mb-3 text-slate-100 border border-slate-600/20">
              "UNPOPULAR OPINION: Traditional customer support is dead 💀
              <br />
              <br />
              Here's why AI-first support is the only way forward:
              <br />
              → 24/7 availability
              <br />
              → Consistent quality
              <br />
              → Instant resolutions
              <br />
              <br />
              Agree or disagree? Let me know below 👇"
            </div>
            <div className="flex gap-2 text-xs">
              <span className="text-purple-400">
                #AIFirst #SaaS #Innovation
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CreationDemo() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-800/60 via-slate-900/80 to-slate-800/60 p-4 rounded-lg border border-slate-600/30 backdrop-blur">
        <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
          <Zap className="w-5 h-5 text-green-400" />
          Automated Content Pipeline
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {["Ideation", "Generation", "Optimization", "Scheduling"].map(
            (step, index) => (
              <div key={index} className="text-center">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-1 shadow-lg">
                  {index + 1}
                </div>
                <div className="text-xs text-slate-200">{step}</div>
              </div>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-slate-600/30 bg-slate-800/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white">LinkedIn Post</CardTitle>
            <Badge className="w-fit bg-green-600/20 text-green-300 border-green-500/30">
              Ready to Publish
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="bg-slate-700/40 p-3 rounded border border-slate-600/20">
                <p className="font-medium mb-2 text-slate-100">
                  Best time to post:
                </p>
                <p className="text-slate-200">Tuesday 10:00 AM</p>
              </div>
              <div className="bg-blue-600/10 p-3 rounded border border-blue-500/20">
                <p className="font-medium mb-2 text-slate-100">
                  Expected reach:
                </p>
                <p className="text-blue-300">2,500-3,200 impressions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-600/30 bg-slate-800/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white">Twitter Thread</CardTitle>
            <Badge className="w-fit bg-blue-600/20 text-blue-300 border-blue-500/30">
              Adapting Content
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="bg-slate-700/40 p-3 rounded border border-slate-600/20">
                <p className="font-medium mb-2 text-slate-100">
                  Thread structure:
                </p>
                <p className="text-slate-200">5 tweets, hook + insights</p>
              </div>
              <div className="bg-blue-600/10 p-3 rounded border border-blue-500/20">
                <p className="font-medium mb-2 text-slate-100">
                  Hashtag strategy:
                </p>
                <p className="text-blue-300">#BuildInPublic #SaaS</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-600/30 bg-slate-800/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white">Blog Article</CardTitle>
            <Badge className="w-fit bg-purple-600/20 text-purple-300 border-purple-500/30">
              Generating Long-form
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="bg-slate-700/40 p-3 rounded border border-slate-600/20">
                <p className="font-medium mb-2 text-slate-100">SEO score:</p>
                <p className="text-slate-200">92/100 (Excellent)</p>
              </div>
              <div className="bg-purple-600/10 p-3 rounded border border-purple-500/20">
                <p className="font-medium mb-2 text-slate-100">Word count:</p>
                <p className="text-purple-300">1,250 words</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OptimizationDemo() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-600/30 bg-slate-800/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Performance Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Engagement Rate</span>
                <span className="font-bold text-green-600">+47%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Reach Growth</span>
                <span className="font-bold text-blue-600">+32%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Lead Generation</span>
                <span className="font-bold text-purple-600">+89%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-600/30 bg-slate-800/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white">
              A/B Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1 text-slate-200">
                  <span>Variant A</span>
                  <span>2.3% CTR</span>
                </div>
                <Progress value={23} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1 text-slate-200">
                  <span>Variant B</span>
                  <span>4.1% CTR</span>
                </div>
                <Progress value={41} className="h-2" />
              </div>
              <Badge className="w-fit bg-blue-500/20 text-blue-200 border border-blue-400/30">
                Variant B +78% better
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-600/30 bg-slate-800/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white">
              Smart Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              <div className="bg-green-500/20 p-2 rounded border border-green-400/30 text-green-200">
                ✅ Post more video content (+15% engagement)
              </div>
              <div className="bg-blue-500/20 p-2 rounded border border-blue-400/30 text-blue-200">
                📊 Use data visualizations (+22% shares)
              </div>
              <div className="bg-purple-500/20 p-2 rounded border border-purple-400/30 text-purple-200">
                🕒 Optimal posting: 9-11 AM weekdays
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-gradient-to-r from-slate-800/60 via-slate-900/80 to-slate-800/60 p-4 rounded-lg border border-slate-600/30 backdrop-blur">
        <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
          <TrendingUp className="w-5 h-5 text-orange-400" />
          Predictive Intelligence
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium mb-2 text-slate-100">
              Next Week Forecast:
            </p>
            <ul className="space-y-1 text-slate-200">
              <li>• Expected engagement: +12%</li>
              <li>• Optimal content types: Educational</li>
              <li>• Best posting windows: Tue-Thu 10AM</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-2 text-slate-100">
              Growth Opportunities:
            </p>
            <ul className="space-y-1 text-slate-200">
              <li>• Video content gap identified</li>
              <li>• LinkedIn Stories underutilized</li>
              <li>• Cross-platform promotion potential</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScalingDemo() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-indigo-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Collaboration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                  CM
                </div>
                <div>
                  <p className="text-sm font-medium">Content Manager</p>
                  <p className="text-xs text-gray-600">15 posts approved</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                  DS
                </div>
                <div>
                  <p className="text-sm font-medium">Data Specialist</p>
                  <p className="text-xs text-gray-600">Analytics review</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">
                  BD
                </div>
                <div>
                  <p className="text-sm font-medium">Brand Director</p>
                  <p className="text-xs text-gray-600">Brand compliance</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-600/30 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-white">
              <BarChart3 className="w-4 h-4 text-green-400" />
              Enterprise Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="bg-green-500/20 p-3 rounded border border-green-400/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-200">
                    Monthly ROI
                  </span>
                  <span className="text-lg font-bold text-green-300">
                    €47.2K
                  </span>
                </div>
              </div>
              <div className="bg-blue-500/20 p-3 rounded border border-blue-400/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-200">
                    Lead Attribution
                  </span>
                  <span className="text-lg font-bold text-blue-300">1,247</span>
                </div>
              </div>
              <div className="bg-purple-500/20 p-3 rounded border border-purple-400/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-purple-200">
                    Brand Mentions
                  </span>
                  <span className="text-lg font-bold text-purple-300">
                    +156%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Enterprise Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Globe className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-sm mb-1">Multi-Region</h4>
              <p className="text-xs text-gray-600">
                Global content distribution
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-sm mb-1">Security</h4>
              <p className="text-xs text-gray-600">SOC2 & GDPR compliant</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-sm mb-1">API Access</h4>
              <p className="text-xs text-gray-600">Custom integrations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// BI Dashboard Demo Components
function BIDashboardOverviewDemo() {
  const [selectedKPI, setSelectedKPI] = useState("revenue");
  const [dashboardView, setDashboardView] = useState("executive");

  const kpiData = {
    revenue: { value: "€2.4M", change: "+12.3%", trend: "up", color: "green" },
    customers: { value: "1,247", change: "+8.7%", trend: "up", color: "blue" },
    conversion: {
      value: "3.8%",
      change: "+0.4%",
      trend: "up",
      color: "purple",
    },
    churn: { value: "2.1%", change: "-0.3%", trend: "down", color: "orange" },
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Executive BI Dashboard
          </CardTitle>
          <div className="flex gap-2 mt-3">
            {["executive", "marketing", "finance", "operations"].map(view => (
              <Button
                key={view}
                variant={dashboardView === view ? "default" : "outline"}
                size="sm"
                onClick={() => setDashboardView(view)}
                className={
                  dashboardView === view
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "border-slate-500/50 text-slate-200 hover:bg-slate-700/50 hover:text-white hover:border-slate-400"
                }
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(kpiData).map(([key, data]) => (
          <Card
            key={key}
            className={`cursor-pointer transition-all duration-200 ${
              selectedKPI === key
                ? "ring-2 ring-blue-500 border-blue-300"
                : "hover:shadow-md border-gray-200"
            }`}
            onClick={() => setSelectedKPI(key)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </div>
                {data.trend === "up" ? (
                  <ArrowUp className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-orange-500" />
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {data.value}
              </div>
              <div className="text-sm text-green-600 flex items-center gap-1">
                <span>{data.change}</span>
                <span className="text-gray-500">vs. last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <LineChart className="w-4 h-4 text-green-600" />
              Revenue Trend (Live)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-8 h-8 text-green-600 mx-auto mb-2 animate-pulse" />
                <p className="text-sm text-gray-600">Live revenue streaming</p>
                <div className="text-2xl font-bold text-green-600 mt-2">
                  €2.4M ARR
                </div>
                <div className="text-xs text-gray-500">+12.3% MoM growth</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-600" />
              Customer Acquisition Channels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { channel: "Marketing Machine", percentage: 45, color: "blue" },
                { channel: "Organic Search", percentage: 28, color: "green" },
                { channel: "Direct Traffic", percentage: 18, color: "purple" },
                { channel: "Referrals", percentage: 9, color: "orange" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-sm">{item.channel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-600/30 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            Smart Business Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                type: "opportunity",
                message:
                  "LinkedIn engagement up 156% - recommend increasing content budget by €5K",
                priority: "high",
                action: "Adjust Budget",
              },
              {
                type: "warning",
                message:
                  "Customer churn prediction indicates 23 at-risk customers this month",
                priority: "medium",
                action: "Create Retention Campaign",
              },
              {
                type: "success",
                message:
                  "Revenue forecast shows 15% probability of hitting €3M ARR this quarter",
                priority: "low",
                action: "View Forecast",
              },
            ].map((alert, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/30"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      alert.priority === "high"
                        ? "bg-red-400"
                        : alert.priority === "medium"
                          ? "bg-yellow-400"
                          : "bg-green-400"
                    }`}
                  />
                  <div>
                    <p className="text-sm text-slate-100">{alert.message}</p>
                    <p className="text-xs text-slate-300 mt-1">
                      AI Recommendation
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs border-slate-500/50 text-slate-200 hover:bg-slate-600/50 hover:text-white"
                >
                  {alert.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdvancedAnalyticsDemo() {
  const [analysisType, setAnalysisType] = useState("predictive");
  const [timeframe, setTimeframe] = useState("6months");

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Analytics Engine
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-3">
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="predictive">Predictive Analysis</SelectItem>
                <SelectItem value="cohort">Cohort Analysis</SelectItem>
                <SelectItem value="churn">Churn Prediction</SelectItem>
                <SelectItem value="ltv">Lifetime Value</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">3 Months</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="12months">12 Months</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Run Analysis
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Revenue Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                €3.2M
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Predicted ARR in 6 months
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Confidence:</span>
                  <span className="font-medium">87%</span>
                </div>
                <Progress value={87} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Conservative: €2.9M</span>
                  <span>Optimistic: €3.5M</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Customer Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">1,847</div>
              <p className="text-sm text-gray-600 mb-4">Predicted customers</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-200">Growth Rate:</span>
                  <span className="font-medium text-green-400">+48%</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="font-medium">New: +673</div>
                  </div>
                  <div className="bg-red-50 p-2 rounded">
                    <div className="font-medium">Churn: -73</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              Churn Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">23</div>
              <p className="text-sm text-gray-600 mb-4">At-risk customers</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Risk Level:</span>
                  <span className="font-medium text-orange-600">Medium</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>High Risk: 8</span>
                    <span className="text-red-600">€84K ARR</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Medium Risk: 15</span>
                    <span className="text-orange-600">€156K ARR</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-indigo-200">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            Machine Learning Model Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 mb-2">
                94.2%
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Revenue Prediction Accuracy
              </p>
              <div className="space-y-1 text-xs text-gray-500">
                <div>Last 30 predictions</div>
                <div>Avg error: ±3.7%</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                91.8%
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Churn Prediction Accuracy
              </p>
              <div className="space-y-1 text-xs text-gray-500">
                <div>True positives: 87%</div>
                <div>False positives: 8.2%</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                89.3%
              </div>
              <p className="text-sm text-gray-600 mb-2">
                LTV Prediction Accuracy
              </p>
              <div className="space-y-1 text-xs text-gray-500">
                <div>Customer segments: 7</div>
                <div>Confidence range: 85-93%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CustomReportingDemo() {
  const [reportType, setReportType] = useState("executive");
  const [reportPeriod, setReportPeriod] = useState("monthly");
  const [generatingReport, setGeneratingReport] = useState(false);

  const generateReport = () => {
    setGeneratingReport(true);
    setTimeout(() => setGeneratingReport(false), 3000);
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            White-Label Report Generator
          </CardTitle>
          <div className="flex flex-wrap gap-3 mt-3">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="executive">Executive Summary</SelectItem>
                <SelectItem value="marketing">Marketing Performance</SelectItem>
                <SelectItem value="financial">Financial Analysis</SelectItem>
                <SelectItem value="client">Client Report</SelectItem>
              </SelectContent>
            </Select>
            <Select value={reportPeriod} onValueChange={setReportPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={generateReport}
              disabled={generatingReport}
              className="bg-green-600 hover:bg-green-700"
            >
              {generatingReport ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Generate Report
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                Report Preview -{" "}
                {reportType.charAt(0).toUpperCase() + reportType.slice(1)} (
                {reportPeriod})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generatingReport ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
                    <p className="text-sm text-gray-600">
                      Generating personalized report...
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Analyzing data from 47 sources
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="border-b pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {reportType === "executive"
                              ? "Executive Performance Summary"
                              : reportType === "marketing"
                                ? "Marketing ROI Analysis"
                                : reportType === "financial"
                                  ? "Financial Performance Report"
                                  : "Client Success Report"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Period:{" "}
                            {reportPeriod === "monthly"
                              ? "November 2024"
                              : reportPeriod === "weekly"
                                ? "Week 47, 2024"
                                : "Q4 2024"}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="w-16 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              LOGO
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Your Company
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Revenue", value: "€2.4M", change: "+12.3%" },
                        { label: "Customers", value: "1,247", change: "+8.7%" },
                        { label: "ARPU", value: "€1,925", change: "+3.2%" },
                        { label: "NPS Score", value: "73", change: "+5 pts" },
                      ].map((metric, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">
                            {metric.label}
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {metric.value}
                          </div>
                          <div className="text-xs text-green-600">
                            {metric.change}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">
                        Interactive Chart: Revenue Trend
                      </p>
                      <p className="text-xs text-gray-500">
                        Click to view full dashboard
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-600" />
                Export Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Link
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Email Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-600/30 bg-slate-800/50 backdrop-blur">
            <CardContent className="p-4">
              <div className="text-center">
                <Gauge className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-sm font-medium text-green-200 mb-1">
                  Report Quality Score
                </div>
                <div className="text-2xl font-bold text-green-300 mb-2">
                  96/100
                </div>
                <div className="text-xs text-green-300">
                  Excellent data quality
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
