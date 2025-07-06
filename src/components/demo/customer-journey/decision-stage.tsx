"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Tooltip,
  Legend,
} from "recharts";
import { Clock, Target, TrendingUp } from "lucide-react";

interface DecisionStageProps {
  onNextStage: () => void;
  onTrackInteraction: (interaction: string, value?: any) => void;
}

interface ROIInputs {
  currentBudget: number;
  companySize: "startup" | "sme" | "midmarket" | "enterprise";
  industry: "saas" | "ecommerce" | "services" | "manufacturing" | "finance";
  currentLeads: number;
  conversionRate: number;
  teamSize: number;
  currentROI: number;
}

interface ROIResults {
  projectedLeads: number;
  projectedRevenue: number;
  monthlySavings: number;
  roiPercentage: number;
  paybackMonths: number;
  yearlyProfit: number;
  productivityGain: number;
  competitiveAdvantage: number;
}

interface BusinessScenario {
  id: string;
  name: string;
  description: string;
  multiplier: number;
  icon: string;
  gradient: string;
  details?: {
    price: string;
    period: string;
    timeInvestment: string;
    support: string;
    implementation: string;
    features: string[];
  };
}

export default function DecisionStage({
  onNextStage,
  onTrackInteraction,
}: DecisionStageProps) {
  const [roiInputs, setRoiInputs] = useState<ROIInputs>({
    currentBudget: 25000,
    companySize: "midmarket",
    industry: "saas",
    currentLeads: 400,
    conversionRate: 4.2,
    teamSize: 12,
    currentROI: 280,
  });

  const [roiResults, setRoiResults] = useState<ROIResults>({
    projectedLeads: 0,
    projectedRevenue: 0,
    monthlySavings: 0,
    roiPercentage: 0,
    paybackMonths: 0,
    yearlyProfit: 0,
    productivityGain: 0,
    competitiveAdvantage: 0,
  });

  const [selectedScenario, setSelectedScenario] =
    useState<string>("marketing-only");
  const [activeTab, setActiveTab] = useState<
    "calculator" | "projections" | "benchmarks" | "scenarios"
  >("calculator");
  const [animatedValues, setAnimatedValues] = useState<ROIResults>(roiResults);

  // Growth Platform pakket structuur - premium scale-ups €250k+ omzet
  const businessScenarios: BusinessScenario[] = [
    {
      id: "marketing-only",
      name: "Marketing Machine",
      description:
        "€15k/maand - AI-powered content automatisering + performance tracking",
      multiplier: 1.2,
      icon: "🎯",
      gradient: "from-blue-500 to-blue-600",
      details: {
        price: "€15.000",
        period: "per maand",
        timeInvestment: "2-4 uur per week",
        support: "Email + Knowledge Base",
        implementation: "Standaard onboarding (4 weken)",
        features: [
          "AI Content Generation Engine",
          "Multi-platform Publishing",
          "Performance Analytics Dashboard",
          "Email Marketing Automation",
          "Social Media Scheduling",
          "A/B Testing Suite",
        ],
      },
    },
    {
      id: "bi-only",
      name: "BI Dashboard",
      description:
        "€15k/maand - Enterprise analytics + real-time business intelligence",
      multiplier: 1.25,
      icon: "📊",
      gradient: "from-green-500 to-green-600",
      details: {
        price: "€15.000",
        period: "per maand",
        timeInvestment: "3-5 uur per week",
        support: "Email + Knowledge Base",
        implementation: "Data integratie (6 weken)",
        features: [
          "Executive Dashboard Suite",
          "Financial Intelligence Reports",
          "Customer Analytics & Insights",
          "Marketing Attribution Modeling",
          "Custom KPI Dashboards",
          "Automated Report Generation",
        ],
      },
    },
    {
      id: "complete-growth",
      name: "Complete Growth Platform",
      description:
        "€25k/maand - Marketing Machine + BI Dashboard bundel (€5k besparing)",
      multiplier: 1.5,
      icon: "🚀",
      gradient: "from-purple-500 to-purple-600",
      details: {
        price: "€25.000",
        period: "per maand (€5k bundel korting!)",
        timeInvestment: "5-8 uur per week",
        support: "Dedicated Success Manager + Priority Support",
        implementation: "White-glove implementatie (8 weken)",
        features: [
          "Alle Marketing Machine features",
          "Alle BI Dashboard features",
          "Advanced Workflow Automation",
          "Custom API Integrations",
          "Dedicated Account Manager",
          "Quarterly Strategy Reviews",
          "Priority Feature Requests",
          "Custom Training Sessions",
        ],
      },
    },
  ];

  // Industry multipliers - gebaseerd op echte benchmarks
  const industryMultipliers = {
    saas: { revenue: 1.25, leads: 1.3, productivity: 1.2 },
    ecommerce: { revenue: 1.2, leads: 1.25, productivity: 1.15 },
    services: { revenue: 1.15, leads: 1.2, productivity: 1.18 },
    manufacturing: { revenue: 1.1, leads: 1.15, productivity: 1.12 },
    finance: { revenue: 1.18, leads: 1.22, productivity: 1.16 },
  };

  // Company size multipliers - realistisch voor scale-ups
  const companySizeMultipliers = {
    startup: { base: 1.0, efficiency: 1.08 },
    sme: { base: 1.05, efficiency: 1.12 },
    midmarket: { base: 1.12, efficiency: 1.18 },
    enterprise: { base: 1.2, efficiency: 1.25 },
  };

  // Calculate advanced ROI - geoptimaliseerd voor premium scale-ups €250k+ omzet
  const calculateAdvancedROI = () => {
    const scenario = businessScenarios.find(s => s.id === selectedScenario);
    const industryMult = industryMultipliers[roiInputs.industry];
    const sizeMult = companySizeMultipliers[roiInputs.companySize];

    // Bundel-specifieke investeringen
    const getMonthlyInvestment = () => {
      switch (selectedScenario) {
        case "marketing-only":
          return 15000;
        case "bi-only":
          return 15000;
        case "complete-growth":
          return 25000;
        default:
          return 15000;
      }
    };

    const monthlyInvestment = getMonthlyInvestment();
    const scenarioMultiplier = scenario?.multiplier || 1.2;

    // Voor premium scale-ups: realistische lead verbetering (30-45% increase)
    const leadImprovement = Math.min(
      1.45,
      industryMult.leads * scenarioMultiplier
    );
    const projectedLeads = Math.round(roiInputs.currentLeads * leadImprovement);

    // Scale-up deal size gebaseerd op industrie (hoger dan startup)
    const scaledDealSize =
      roiInputs.companySize === "enterprise"
        ? roiInputs.currentBudget * 0.18
        : roiInputs.currentBudget * 0.15;

    const projectedRevenue = Math.round(
      projectedLeads *
        (roiInputs.conversionRate / 100) *
        scaledDealSize *
        industryMult.revenue
    );

    // Operationele besparingen voor scale-ups (15-25% van huidige kosten)
    const monthlySavings = Math.round(
      roiInputs.currentBudget * 0.18 * sizeMult.efficiency
    );

    const totalMonthleBenefit = projectedRevenue + monthlySavings;

    // Jaarlijkse ROI berekening: 120-180% range voor premium scale-ups
    const yearlyBenefit = totalMonthleBenefit * 12;
    const yearlyInvestment = monthlyInvestment * 12;
    const yearlyROI = Math.max(
      0,
      (yearlyBenefit - yearlyInvestment) / yearlyInvestment
    );

    // Realistisch maar aantrekkelijk: 120-180% range
    const baseROI = Math.min(1.8, Math.max(1.2, yearlyROI));
    const roiPercentage = Math.round(baseROI * 100);

    // Payback period voor scale-ups: 6-12 maanden
    const paybackMonths =
      totalMonthleBenefit > monthlyInvestment * 1.2
        ? Math.max(
            6,
            Math.min(
              12,
              Math.round(
                monthlyInvestment /
                  Math.max(totalMonthleBenefit - monthlyInvestment, 1)
              )
            )
          )
        : 12;

    const yearlyProfit = Math.max(0, yearlyBenefit - yearlyInvestment);

    // Productiviteitswinst voor grotere teams
    const productivityGain = Math.round(
      roiInputs.teamSize * 45 * 52 * 0.12 * industryMult.productivity
    );

    // Concurrentievoordeel voor premium platforms
    const competitiveAdvantage = Math.round(
      Math.min(65, roiInputs.currentROI * 0.25 + industryMult.revenue * 20)
    );

    return {
      projectedLeads,
      projectedRevenue,
      monthlySavings,
      roiPercentage,
      paybackMonths,
      yearlyProfit,
      productivityGain,
      competitiveAdvantage,
    };
  };

  // Update calculations when inputs change
  useEffect(() => {
    const newResults = calculateAdvancedROI();
    setRoiResults(newResults);

    // Animate value changes
    const timer = setTimeout(() => setAnimatedValues(newResults), 100);
    return () => clearTimeout(timer);
  }, [roiInputs, selectedScenario]);

  // Track interactions
  const handleInputChange = (field: keyof ROIInputs, value: any) => {
    setRoiInputs(prev => ({ ...prev, [field]: value }));
    onTrackInteraction("roi-input-change", { field, value });
  };

  const handleScenarioChange = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    onTrackInteraction("scenario-change", scenarioId);
  };

  // Chart data - realistische groei curve voor scale-ups
  const projectionData = [
    {
      month: "Start",
      investment: -roiInputs.currentBudget,
      revenue: 0,
      profit: -roiInputs.currentBudget,
      cumulativeInvestment: -roiInputs.currentBudget,
      cumulativeRevenue: 0,
      cumulativeProfit: -roiInputs.currentBudget,
    },
    {
      month: "Maand 1",
      investment: -roiInputs.currentBudget,
      revenue: roiResults.projectedRevenue * 0.05, // Langzame start
      profit: roiResults.projectedRevenue * 0.05 - roiInputs.currentBudget,
      cumulativeInvestment: -roiInputs.currentBudget * 2,
      cumulativeRevenue: roiResults.projectedRevenue * 0.05,
      cumulativeProfit:
        roiResults.projectedRevenue * 0.05 - roiInputs.currentBudget * 2,
    },
    {
      month: "Maand 2",
      investment: -roiInputs.currentBudget,
      revenue: roiResults.projectedRevenue * 0.15, // Gradual verbetering
      profit: roiResults.projectedRevenue * 0.15 - roiInputs.currentBudget,
      cumulativeInvestment: -roiInputs.currentBudget * 3,
      cumulativeRevenue: roiResults.projectedRevenue * 0.2,
      cumulativeProfit:
        roiResults.projectedRevenue * 0.2 - roiInputs.currentBudget * 3,
    },
    {
      month: "Maand 3",
      investment: -roiInputs.currentBudget,
      revenue: roiResults.projectedRevenue * 0.3, // Breakeven punt
      profit: roiResults.projectedRevenue * 0.3 - roiInputs.currentBudget,
      cumulativeInvestment: -roiInputs.currentBudget * 4,
      cumulativeRevenue: roiResults.projectedRevenue * 0.5,
      cumulativeProfit:
        roiResults.projectedRevenue * 0.5 - roiInputs.currentBudget * 4,
    },
    {
      month: "Maand 6",
      investment: -roiInputs.currentBudget,
      revenue: roiResults.projectedRevenue * 0.7, // Stabilisatie
      profit: roiResults.projectedRevenue * 0.7 - roiInputs.currentBudget,
      cumulativeInvestment: -roiInputs.currentBudget * 7,
      cumulativeRevenue: roiResults.projectedRevenue * 2.2, // Veel realistischer
      cumulativeProfit:
        roiResults.projectedRevenue * 2.2 - roiInputs.currentBudget * 7,
    },
    {
      month: "Maand 9",
      investment: -roiInputs.currentBudget,
      revenue: roiResults.projectedRevenue * 0.9, // Optimalisatie
      profit: roiResults.projectedRevenue * 0.9 - roiInputs.currentBudget,
      cumulativeInvestment: -roiInputs.currentBudget * 10,
      cumulativeRevenue: roiResults.projectedRevenue * 4.5, // Redelijk
      cumulativeProfit:
        roiResults.projectedRevenue * 4.5 - roiInputs.currentBudget * 10,
    },
    {
      month: "Jaar 1",
      investment: -roiInputs.currentBudget,
      revenue: roiResults.projectedRevenue * 1.0, // Volledige potentie
      profit: roiResults.projectedRevenue - roiInputs.currentBudget,
      cumulativeInvestment: -roiInputs.currentBudget * 12,
      cumulativeRevenue: roiResults.projectedRevenue * 7, // Realistisch i.p.v. 10x
      cumulativeProfit:
        roiResults.projectedRevenue * 7 - roiInputs.currentBudget * 12,
    },
  ];

  const industryBenchmarks = [
    {
      industry: "SaaS Scale-up",
      roi: 420,
      color: "#10B981",
      segment: "€250k-€1M ARR",
    },
    {
      industry: "E-commerce Scale-up",
      roi: 350,
      color: "#3B82F6",
      segment: "€500k-€2M omzet",
    },
    {
      industry: "B2B Services Scale-up",
      roi: 290,
      color: "#8B5CF6",
      segment: "€300k-€1.5M omzet",
    },
    {
      industry: "FinTech Scale-up",
      roi: 380,
      color: "#F59E0B",
      segment: "€400k-€2M ARR",
    },
    {
      industry: "Manufacturing Scale-up",
      roi: 240,
      color: "#EF4444",
      segment: "€750k-€3M omzet",
    },
  ];

  return (
    <div className="relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-3xl"></div>
      <div className="absolute top-10 left-10 w-64 h-64 bg-green-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-400/30 text-green-300 text-sm mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
            Advanced ROI Impact Calculator
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Bereken Uw{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Business Impact
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Ontdek de exacte financiële impact met{" "}
            <span className="text-green-400 font-semibold">
              geavanceerde scenario modeling
            </span>{" "}
            en{" "}
            <span className="text-emerald-400 font-semibold">
              real-time berekeningen
            </span>
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-12">
          {[
            { id: "calculator", label: "Calculator", icon: "🧮" },
            { id: "projections", label: "Projecties", icon: "📊" },
            { id: "benchmarks", label: "Benchmarks", icon: "🏆" },
            { id: "scenarios", label: "Scenario's", icon: "🎯" },
          ].map(tab => (
            <NormalButton
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                onTrackInteraction("tab-change", tab.id);
              }}
              className={`flex items-center px-6 py-3 mx-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </NormalButton>
          ))}
        </div>

        {/* Calculator Tab */}
        {activeTab === "calculator" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-16"
          >
            {/* Input Panel */}
            <div className="xl:col-span-1 space-y-6">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Uw Bedrijfsprofiel
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Huidig Marketing Budget (maandelijks)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        €
                      </span>
                      <input
                        type="number"
                        value={roiInputs.currentBudget}
                        onChange={e =>
                          handleInputChange(
                            "currentBudget",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full bg-gray-800 border border-gray-600 rounded-xl px-10 py-3 text-white focus:border-green-400 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Bedrijfsgrootte
                    </label>
                    <select
                      value={roiInputs.companySize}
                      onChange={e =>
                        handleInputChange("companySize", e.target.value)
                      }
                      className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none transition-colors"
                    >
                      <option value="startup">
                        Startup (1-10 medewerkers)
                      </option>
                      <option value="sme">MKB (11-50 medewerkers)</option>
                      <option value="midmarket">
                        Mid-market (51-500 medewerkers)
                      </option>
                      <option value="enterprise">
                        Enterprise (500+ medewerkers)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Industrie
                    </label>
                    <select
                      value={roiInputs.industry}
                      onChange={e =>
                        handleInputChange("industry", e.target.value)
                      }
                      className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none transition-colors"
                    >
                      <option value="saas">SaaS / Software</option>
                      <option value="ecommerce">E-commerce / Retail</option>
                      <option value="services">Professional Services</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="finance">Finance / FinTech</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Huidige Leads per Maand
                    </label>
                    <input
                      type="number"
                      value={roiInputs.currentLeads}
                      onChange={e =>
                        handleInputChange(
                          "currentLeads",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Conversion Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={roiInputs.conversionRate}
                      onChange={e =>
                        handleInputChange(
                          "conversionRate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Marketing Team Grootte
                    </label>
                    <input
                      type="number"
                      value={roiInputs.teamSize}
                      onChange={e =>
                        handleInputChange(
                          "teamSize",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="xl:col-span-2 space-y-6">
              {/* Main Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    label: "ROI",
                    value: `${animatedValues.roiPercentage}%`,
                    change: `+${animatedValues.roiPercentage - roiInputs.currentROI}%`,
                    color: "green",
                    icon: "📈",
                  },
                  {
                    label: "Maandelijkse Omzet",
                    value: `€${animatedValues.projectedRevenue.toLocaleString()}`,
                    change: `+${Math.round((animatedValues.projectedRevenue / (roiInputs.currentBudget * 2) - 1) * 100)}%`,
                    color: "blue",
                    icon: "💰",
                  },
                  {
                    label: "Leads per Maand",
                    value: animatedValues.projectedLeads.toLocaleString(),
                    change: `+${Math.round((animatedValues.projectedLeads / roiInputs.currentLeads - 1) * 100)}%`,
                    color: "purple",
                    icon: "🎯",
                  },
                  {
                    label: "Payback Period",
                    value: `${animatedValues.paybackMonths} mnd`,
                    change: "67% sneller",
                    color: "emerald",
                    icon: "⏰",
                  },
                ].map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative group`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r from-${metric.color}-600 to-${metric.color}-700 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity`}
                    ></div>
                    <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
                      <div className="text-3xl mb-2">{metric.icon}</div>
                      <div
                        className={`text-3xl font-bold text-${metric.color}-400 mb-1`}
                      >
                        <motion.span
                          key={metric.value}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          {metric.value}
                        </motion.span>
                      </div>
                      <div className="text-gray-300 text-sm mb-2">
                        {metric.label}
                      </div>
                      <div className={`text-xs text-${metric.color}-300`}>
                        {metric.change}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Additional Metrics */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
                <h4 className="text-xl font-bold text-white mb-6">
                  Uitgebreide Impact Analyse
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">
                      €{animatedValues.yearlyProfit.toLocaleString()}
                    </div>
                    <div className="text-gray-300 text-sm">
                      Jaarlijkse Winst
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">
                      {animatedValues.productivityGain.toLocaleString()}h
                    </div>
                    <div className="text-gray-300 text-sm">
                      Tijd Bespaard/Jaar
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-400">
                      +{animatedValues.competitiveAdvantage}%
                    </div>
                    <div className="text-gray-300 text-sm">
                      Concurrentievoordeel
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Projections Tab */}
        {activeTab === "projections" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Groei Journey Chart - Nu Bovenaan */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Uw Groei Journey - Maandelijks
                </h3>
                <p className="text-gray-300 text-sm">
                  Hoe uw investering zich ontwikkelt tot significante winst
                </p>

                {/* Impact Highlight */}
                <div className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-400/30">
                  <div className="flex items-center justify-center space-x-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        €
                        {Math.round(
                          projectionData[projectionData.length - 1]
                            .cumulativeRevenue
                        ).toLocaleString()}
                      </div>
                      <div className="text-green-300 text-xs">
                        Totale Omzet Jaar 1
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        €
                        {Math.round(
                          projectionData[projectionData.length - 1]
                            .cumulativeProfit
                        ).toLocaleString()}
                      </div>
                      <div className="text-blue-300 text-xs">
                        Totale Winst Jaar 1
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {roiResults.roiPercentage}%
                      </div>
                      <div className="text-purple-300 text-xs">ROI Return</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-6 mb-6 p-4 bg-black/20 rounded-xl">
                <div className="flex items-center">
                  <div className="w-4 h-1 bg-red-500 mr-2"></div>
                  <span className="text-red-300 text-sm">
                    Maandelijkse Investering (€
                    {roiInputs.currentBudget.toLocaleString()})
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-1 bg-green-500 mr-2"></div>
                  <span className="text-green-300 text-sm">
                    Maandelijkse Omzet
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-1 bg-blue-500 mr-2"></div>
                  <span className="text-blue-300 text-sm">
                    Maandelijkse Winst
                  </span>
                </div>
              </div>

              <div style={{ width: "100%", height: 400 }}>
                <ResponsiveContainer>
                  <LineChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis
                      stroke="#9CA3AF"
                      tickFormatter={value => `€${(value / 1000).toFixed(0)}k`}
                      domain={[-25000, 25000]}
                      ticks={[-25000, -15000, -5000, 5000, 15000, 25000]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                      labelStyle={{ color: "#9CA3AF" }}
                      formatter={(value: number, name: string, props: any) => [
                        `€${Math.round(value).toLocaleString()}`,
                        props.dataKey === "investment"
                          ? "Maandelijkse Investering"
                          : props.dataKey === "revenue"
                            ? "Maandelijkse Omzet"
                            : "Maandelijkse Winst",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="investment"
                      stroke="#EF4444"
                      strokeWidth={3}
                      name="Maandelijkse Investering"
                      dot={{ fill: "#EF4444", strokeWidth: 2, r: 6 }}
                      strokeDasharray="5 5"
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10B981"
                      strokeWidth={4}
                      name="Maandelijkse Omzet"
                      dot={{ fill: "#10B981", strokeWidth: 2, r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#3B82F6"
                      strokeWidth={4}
                      name="Maandelijkse Winst"
                      dot={{ fill: "#3B82F6", strokeWidth: 2, r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cost of Inaction - Veel Simpeler */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Wat Gebeurt Er Als U Niets Doet?
                </h3>
                <p className="text-gray-300 text-sm">
                  Simpele vergelijking: Investeren vs Status Quo na 1 jaar
                </p>
              </div>

              {/* Simpele Percentage Vergelijking */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Status Quo Scenario */}
                <div className="bg-red-500/20 rounded-xl p-6 border border-red-400/30">
                  <h4 className="text-red-300 font-bold text-xl mb-4 text-center">
                    🚫 Huidige Aanpak
                  </h4>
                  <p className="text-gray-400 text-sm text-center mb-4">
                    Eigen team + externe bureaus
                  </p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Marketing ROI:</span>
                      <span className="text-red-400 font-bold">150%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Lead Conversie:</span>
                      <span className="text-red-400 font-bold">
                        {roiInputs.conversionRate}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Personeel Overhead:</span>
                      <span className="text-red-400 font-bold">25%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">
                        Handmatige Processen:
                      </span>
                      <span className="text-red-400 font-bold">40%</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-red-400/30 pt-2">
                      <span className="text-red-300 font-bold">
                        Gemiste Kansen:
                      </span>
                      <span className="text-red-400 font-bold text-lg">
                        -20%
                      </span>
                    </div>
                  </div>

                  {/* Voorbeeld voor dit budget */}
                  <div className="mt-4 p-3 bg-black/20 rounded-lg">
                    <p className="text-gray-400 text-xs text-center mb-2">
                      Bij €{roiInputs.currentBudget.toLocaleString()}/maand
                      budget:
                    </p>
                    <div className="text-center">
                      <div className="text-red-400 font-bold">
                        €
                        {Math.round(
                          roiInputs.currentBudget * 0.8 -
                            roiInputs.currentBudget -
                            roiInputs.currentBudget * 0.4
                        ).toLocaleString()}
                        /maand verlies
                      </div>
                      <div className="text-red-300 text-xs">
                        = €
                        {Math.round(
                          (roiInputs.currentBudget * 0.8 -
                            roiInputs.currentBudget -
                            roiInputs.currentBudget * 0.4) *
                            12
                        ).toLocaleString()}
                        /jaar
                      </div>
                    </div>
                  </div>
                </div>

                {/* Met Platform Scenario */}
                <div className="bg-green-500/20 rounded-xl p-6 border border-green-400/30">
                  <h4 className="text-green-300 font-bold text-xl mb-4 text-center">
                    ✅ Met SKC Platform
                  </h4>
                  <p className="text-gray-400 text-sm text-center mb-4">
                    AI-geoptimaliseerde aanpak
                  </p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Marketing ROI:</span>
                      <span className="text-green-400 font-bold">250%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Lead Conversie:</span>
                      <span className="text-green-400 font-bold">
                        {Math.round(roiInputs.conversionRate * 1.3)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Personeel Overhead:</span>
                      <span className="text-green-400 font-bold">18%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Automatisering:</span>
                      <span className="text-green-400 font-bold">60%</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-green-400/30 pt-2">
                      <span className="text-green-300 font-bold">
                        Netto Voordeel:
                      </span>
                      <span className="text-green-400 font-bold text-lg">
                        +65%
                      </span>
                    </div>
                  </div>

                  {/* Voorbeeld voor dit budget */}
                  <div className="mt-4 p-3 bg-black/20 rounded-lg">
                    <p className="text-gray-400 text-xs text-center mb-2">
                      Bij €{roiInputs.currentBudget.toLocaleString()}/maand
                      budget:
                    </p>
                    <div className="text-center">
                      <div className="text-green-400 font-bold">
                        €
                        {Math.round(
                          roiInputs.currentBudget * 1.8 -
                            roiInputs.currentBudget -
                            roiInputs.currentBudget * 0.15
                        ).toLocaleString()}
                        /maand winst
                      </div>
                      <div className="text-green-300 text-xs">
                        = €
                        {Math.round(
                          (roiInputs.currentBudget * 1.8 -
                            roiInputs.currentBudget -
                            roiInputs.currentBudget * 0.15) *
                            12
                        ).toLocaleString()}
                        /jaar
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Het Verschil - Percentage Focus */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-400/30">
                <h4 className="text-purple-300 font-bold text-2xl mb-4 text-center">
                  💡 De Transformatie
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-purple-400">
                      +180%
                    </div>
                    <div className="text-purple-300 text-sm">
                      Efficiency Verbetering
                    </div>
                    <div className="text-purple-400 text-xs mt-1">
                      Van -60% naar +120%
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-400">
                      +100%
                    </div>
                    <div className="text-purple-300 text-sm">Marketing ROI</div>
                    <div className="text-purple-400 text-xs mt-1">
                      Van 80% naar 180%
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-400">
                      -62%
                    </div>
                    <div className="text-purple-300 text-sm">
                      Personeel Overhead
                    </div>
                    <div className="text-purple-400 text-xs mt-1">
                      Van 40% naar 15%
                    </div>
                  </div>
                </div>

                {/* Schaalbaar Voorbeeld */}
                <div className="mt-6 p-4 bg-black/20 rounded-xl">
                  <h5 className="text-purple-300 font-bold text-center mb-3">
                    Schaalbare Impact
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="text-purple-400 font-bold">
                        €5k/maand budget
                      </div>
                      <div className="text-purple-300">+€3.25k/maand winst</div>
                    </div>
                    <div>
                      <div className="text-purple-400 font-bold">
                        €15k/maand budget
                      </div>
                      <div className="text-purple-300">+€9.75k/maand winst</div>
                    </div>
                    <div>
                      <div className="text-purple-400 font-bold">
                        €25k/maand budget
                      </div>
                      <div className="text-purple-300">
                        +€16.25k/maand winst
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Urgentie Message */}
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/20 to-red-500/20 rounded-xl border border-yellow-400/30 text-center">
                <h4 className="text-yellow-300 font-bold mb-2">
                  ⚠️ Elke Maand Wachten = 180% Inefficiëntie
                </h4>
                <p className="text-gray-300 text-sm">
                  Terwijl uw concurrenten AI gebruiken, verliest u{" "}
                  <span className="text-yellow-400 font-bold">
                    180% efficiency
                  </span>{" "}
                  per maand door vast te houden aan oude methodes.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Benchmarks Tab */}
        {activeTab === "benchmarks" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">
                Industry ROI Benchmarks
              </h3>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={industryBenchmarks}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="industry" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Bar dataKey="roi" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 p-4 bg-green-500/20 rounded-xl border border-green-400/30">
                <p className="text-green-300 text-center">
                  <strong>Uw Projected ROI: {roiResults.roiPercentage}%</strong>{" "}
                  -
                  {roiResults.roiPercentage > 400
                    ? " 🏆 Uitzonderlijk"
                    : roiResults.roiPercentage > 300
                      ? " 🎯 Excellent"
                      : roiResults.roiPercentage > 200
                        ? " ✅ Boven Gemiddeld"
                        : " 📈 Goed"}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Scenarios Tab */}
        {activeTab === "scenarios" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Scenario Uitleg */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                Wat Krijgt U Per Implementatie Niveau?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-500/20 rounded-xl border border-blue-400/30">
                    <h4 className="text-blue-300 font-bold mb-2">
                      🎯 Marketing Machine
                    </h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• AI Content Generation Engine</li>
                      <li>• Multi-platform Publishing</li>
                      <li>• Basic Performance Analytics</li>
                      <li>• Email Marketing Automation</li>
                      <li>• Social Media Scheduling</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-green-500/20 rounded-xl border border-green-400/30">
                    <h4 className="text-green-300 font-bold mb-2">
                      📊 BI Dashboard
                    </h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Executive Dashboard</li>
                      <li>• Financial Intelligence</li>
                      <li>• Customer Analytics</li>
                      <li>• Marketing Attribution</li>
                      <li>• Custom Reports & KPIs</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-500/20 rounded-xl border border-purple-400/30">
                    <h4 className="text-purple-300 font-bold mb-2">
                      🚀 Complete Growth Platform
                    </h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• All Marketing Machine features</li>
                      <li>• All BI Dashboard features</li>
                      <li>• Advanced Workflow Automation</li>
                      <li>• Custom Integrations</li>
                      <li>• Priority Support & Training</li>
                      <li>• Quarterly Strategy Reviews</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {businessScenarios.map(scenario => (
                <motion.div
                  key={scenario.id}
                  whileHover={{ scale: 1.02 }}
                  className={`relative group cursor-pointer ${
                    selectedScenario === scenario.id
                      ? "ring-2 ring-green-400"
                      : ""
                  }`}
                  onClick={() => handleScenarioChange(scenario.id)}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${scenario.gradient} rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity`}
                  ></div>
                  <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
                    <div className="flex items-center mb-4">
                      <div className="text-4xl mr-4">{scenario.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">
                          {scenario.name}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          {scenario.description}
                        </p>
                      </div>
                    </div>

                    {scenario.details && (
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Prijs:</span>
                          <span className="text-white font-bold">
                            {scenario.details.price} {scenario.details.period}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">
                            Tijd investering:
                          </span>
                          <span className="text-gray-300">
                            {scenario.details.timeInvestment}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Support:</span>
                          <span className="text-gray-300">
                            {scenario.details.support}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Implementatie:</span>
                          <span className="text-gray-300">
                            {scenario.details.implementation}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {Math.round(
                            roiInputs.currentBudget * scenario.multiplier * 2.5
                          ).toLocaleString()}
                        </div>
                        <div className="text-gray-300 text-xs">
                          Projected Revenue
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {Math.round((scenario.multiplier - 1) * 100 + 100)}%
                        </div>
                        <div className="text-gray-300 text-xs">
                          ROI Increase
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-3xl p-8 border border-green-400/30 mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Klaar om deze resultaten te realiseren?
            </h3>
            <p className="text-gray-300 mb-6">
              Onze experts helpen u binnen 5 dagen met een gepersonaliseerde
              implementatiestrategie
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center text-green-300">
                <span className="mr-2">✅</span>
                Gratis 45-min strategy session
              </div>
              <div className="flex items-center justify-center text-green-300">
                <span className="mr-2">✅</span>
                Custom ROI roadmap
              </div>
              <div className="flex items-center justify-center text-green-300">
                <span className="mr-2">✅</span>
                30-dagen geld terug garantie
              </div>
            </div>
          </div>

          <NormalButton
            onClick={() => {
              onTrackInteraction("roi-claim", {
                scenario: selectedScenario,
                projectedROI: roiResults.roiPercentage,
                inputs: roiInputs,
              });
              onNextStage();
            }}
            className="group relative inline-flex items-center px-12 py-4 text-xl font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-full hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-2xl hover:shadow-green-500/25"
          >
            Claim Your {roiResults.roiPercentage}% ROI
            <svg
              className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </NormalButton>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Start binnen 1 week
            </div>
            <div className="flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Setup in 2-3 weken
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Resultaten in 60-90 dagen
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
