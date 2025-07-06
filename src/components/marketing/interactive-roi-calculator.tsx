"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calculator,
  TrendingUp,
  Target,
  DollarSign,
  Lightbulb,
  Brain,
  Zap,
  BarChart3,
  Award,
  Sparkles,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ROIInputs {
  monthlyRevenue: number;
  marketingBudget: number;
  teamSize: number;
  industry: string;
  companySize: string;
  currentConversionRate: number;
  averageOrderValue: number;
  monthlyTraffic: number;
  customerLifetimeValue: number;
}

interface ROIResults {
  currentROI: number;
  projectedROI: number;
  additionalRevenue: number;
  paybackPeriod: number;
  confidenceScore: number;
  netProfit: number;
  roas: number;
  projectedRoas: number;
}

interface InsightCard {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

const INDUSTRY_MULTIPLIERS = {
  saas: { roi: 1.3, conversion: 1.2, ltv: 1.4 },
  ecommerce: { roi: 1.1, conversion: 1.0, ltv: 0.9 },
  services: { roi: 1.2, conversion: 1.1, ltv: 1.2 },
  finance: { roi: 1.4, conversion: 1.3, ltv: 1.5 },
  healthcare: { roi: 1.1, conversion: 1.0, ltv: 1.3 },
  technology: { roi: 1.3, conversion: 1.2, ltv: 1.4 },
};

const COMPANY_SIZE_MULTIPLIERS = {
  startup: { efficiency: 0.8, resources: 0.7 },
  sme: { efficiency: 1.0, resources: 1.0 },
  midmarket: { efficiency: 1.2, resources: 1.3 },
  enterprise: { efficiency: 1.4, resources: 1.5 },
};

const CHART_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

export function InteractiveROICalculator() {
  const [inputs, setInputs] = useState<ROIInputs>({
    monthlyRevenue: 100000,
    marketingBudget: 20000,
    teamSize: 8,
    industry: "saas",
    companySize: "sme",
    currentConversionRate: 3.5,
    averageOrderValue: 850,
    monthlyTraffic: 15000,
    customerLifetimeValue: 2500,
  });

  const [results, setResults] = useState<ROIResults>({
    currentROI: 0,
    projectedROI: 0,
    additionalRevenue: 0,
    paybackPeriod: 0,
    confidenceScore: 0,
    netProfit: 0,
    roas: 0,
    projectedRoas: 0,
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState("calculator");
  const [animationPhase, setAnimationPhase] = useState<
    "idle" | "calculating" | "complete"
  >("idle");

  // Calculate ROI with AI-powered insights
  const calculateROI = useCallback(() => {
    const industryMult =
      INDUSTRY_MULTIPLIERS[
        inputs.industry as keyof typeof INDUSTRY_MULTIPLIERS
      ] || INDUSTRY_MULTIPLIERS.saas;
    const sizeMult =
      COMPANY_SIZE_MULTIPLIERS[
        inputs.companySize as keyof typeof COMPANY_SIZE_MULTIPLIERS
      ] || COMPANY_SIZE_MULTIPLIERS.sme;

    // Current metrics
    const currentROI =
      inputs.marketingBudget > 0
        ? ((inputs.monthlyRevenue - inputs.marketingBudget) /
            inputs.marketingBudget) *
          100
        : 0;
    const currentRoas =
      inputs.marketingBudget > 0
        ? inputs.monthlyRevenue / inputs.marketingBudget
        : 0;

    // AI-powered projections
    const projectedConversionImprovement =
      1 + 0.3 * industryMult.conversion * sizeMult.efficiency;
    const projectedTrafficImprovement = 1 + 0.25 * sizeMult.resources;
    const projectedRevenueIncrease =
      projectedConversionImprovement * projectedTrafficImprovement;

    const projectedMonthlyRevenue =
      inputs.monthlyRevenue * projectedRevenueIncrease;
    const projectedROI =
      inputs.marketingBudget > 0
        ? ((projectedMonthlyRevenue - inputs.marketingBudget) /
            inputs.marketingBudget) *
          100
        : 0;
    const projectedRoas =
      inputs.marketingBudget > 0
        ? projectedMonthlyRevenue / inputs.marketingBudget
        : 0;

    const additionalRevenue =
      (projectedMonthlyRevenue - inputs.monthlyRevenue) * 12;
    const netProfit = additionalRevenue - inputs.marketingBudget * 0.2 * 12; // Assuming 20% additional costs

    // Confidence score based on data quality and industry
    const confidenceScore = Math.min(
      95,
      70 +
        (inputs.monthlyTraffic > 10000 ? 10 : 0) +
        (inputs.customerLifetimeValue > 1000 ? 10 : 0) +
        (inputs.currentConversionRate > 2 ? 5 : 0)
    );

    // Payback period in months
    const monthlyAdditionalRevenue = additionalRevenue / 12;
    const paybackPeriod =
      monthlyAdditionalRevenue > 0
        ? Math.ceil((inputs.marketingBudget * 0.2) / monthlyAdditionalRevenue)
        : 12;

    return {
      currentROI,
      projectedROI,
      additionalRevenue,
      paybackPeriod: Math.min(paybackPeriod, 12),
      confidenceScore,
      netProfit,
      roas: currentRoas,
      projectedRoas,
    };
  }, [inputs]);

  // Update calculations when inputs change
  useEffect(() => {
    setIsCalculating(true);
    setAnimationPhase("calculating");

    const timer = setTimeout(() => {
      const newResults = calculateROI();
      setResults(newResults);
      setIsCalculating(false);
      setAnimationPhase("complete");

      setTimeout(() => setAnimationPhase("idle"), 1000);
    }, 500);

    return () => clearTimeout(timer);
  }, [calculateROI]);

  const handleInputChange = (
    field: keyof ROIInputs,
    value: number | string
  ) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  // Generate insight cards
  const insightCards: InsightCard[] = [
    {
      title: "ROI Verbetering",
      value: formatPercentage(results.projectedROI - results.currentROI),
      change: results.projectedROI - results.currentROI,
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-green-400",
    },
    {
      title: "Extra Jaarlijkse Omzet",
      value: formatCurrency(results.additionalRevenue),
      change: results.additionalRevenue > 0 ? 1 : -1,
      icon: <DollarSign className="h-5 w-5" />,
      color: "text-blue-400",
    },
    {
      title: "Terugverdientijd",
      value: `${results.paybackPeriod} maanden`,
      change: 12 - results.paybackPeriod,
      icon: <Target className="h-5 w-5" />,
      color: "text-purple-400",
    },
    {
      title: "Betrouwbaarheidsscore",
      value: `${results.confidenceScore}%`,
      change: results.confidenceScore - 70,
      icon: <Brain className="h-5 w-5" />,
      color: "text-orange-400",
    },
  ];

  // Chart data
  const projectionData = Array.from({ length: 12 }, (_, i) => ({
    month: `M${i + 1}`,
    current: inputs.monthlyRevenue,
    projected:
      inputs.monthlyRevenue *
      (1 + (results.projectedROI - results.currentROI) / 100),
  }));

  const roiComparisonData = [
    { name: "Huidige ROI", value: results.currentROI, fill: "#EF4444" },
    {
      name: "Geprojecteerde ROI",
      value: results.projectedROI,
      fill: "#10B981",
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div
            className={`p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-500/30 ${
              animationPhase === "calculating" ? "animate-pulse" : ""
            }`}
          >
            <Calculator className="h-8 w-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI-Powered ROI Calculator
          </h1>
        </div>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Ontdek je marketing potentieel met geavanceerde AI-inzichten en
          real-time berekeningen
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
          <TabsTrigger
            value="calculator"
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Calculator
          </TabsTrigger>
          <TabsTrigger
            value="insights"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger
            value="projections"
            className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Projecties
          </TabsTrigger>
          <TabsTrigger
            value="recommendations"
            className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Aanbevelingen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <Zap className="h-6 w-6 text-yellow-400" />
                  Invoergegevens
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Pas de waarden aan om je ROI te berekenen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Revenue Input */}
                <div className="space-y-2">
                  <Label className="text-white">Maandelijkse Omzet</Label>
                  <Input
                    type="number"
                    value={inputs.monthlyRevenue}
                    onChange={e =>
                      handleInputChange(
                        "monthlyRevenue",
                        Number(e.target.value)
                      )
                    }
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />
                  <p className="text-sm text-gray-400">
                    {formatCurrency(inputs.monthlyRevenue)}
                  </p>
                </div>

                {/* Marketing Budget */}
                <div className="space-y-2">
                  <Label className="text-white">
                    Marketing Budget (maandelijks)
                  </Label>
                  <div className="space-y-3">
                    <Slider
                      value={[inputs.marketingBudget]}
                      onValueChange={([value]) =>
                        handleInputChange("marketingBudget", value)
                      }
                      max={inputs.monthlyRevenue * 0.5}
                      min={1000}
                      step={1000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>€1K</span>
                      <span className="font-medium text-white">
                        {formatCurrency(inputs.marketingBudget)}
                      </span>
                      <span>{formatCurrency(inputs.monthlyRevenue * 0.5)}</span>
                    </div>
                  </div>
                </div>

                {/* Industry & Company Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Industrie</Label>
                    <Select
                      value={inputs.industry}
                      onValueChange={value =>
                        handleInputChange("industry", value)
                      }
                    >
                      <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="saas">SaaS</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Bedrijfsgrootte</Label>
                    <Select
                      value={inputs.companySize}
                      onValueChange={value =>
                        handleInputChange("companySize", value)
                      }
                    >
                      <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="startup">Startup</SelectItem>
                        <SelectItem value="sme">MKB</SelectItem>
                        <SelectItem value="midmarket">Midmarket</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Advanced Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Conversie Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={inputs.currentConversionRate}
                      onChange={e =>
                        handleInputChange(
                          "currentConversionRate",
                          Number(e.target.value)
                        )
                      }
                      className="bg-gray-800/50 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Gemiddelde Orderwaarde</Label>
                    <Input
                      type="number"
                      value={inputs.averageOrderValue}
                      onChange={e =>
                        handleInputChange(
                          "averageOrderValue",
                          Number(e.target.value)
                        )
                      }
                      className="bg-gray-800/50 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Display */}
            <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <Award className="h-6 w-6 text-gold-400" />
                  ROI Resultaten
                  {isCalculating && (
                    <RefreshCw className="h-5 w-5 animate-spin text-blue-400" />
                  )}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Real-time berekeningen met AI-inzichten
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main ROI Display */}
                <div className="text-center p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                  <div className="text-sm text-gray-400 mb-2">
                    Geprojecteerde ROI Verbetering
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {formatPercentage(
                      results.projectedROI - results.currentROI
                    )}
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    Van {formatPercentage(results.currentROI)} naar{" "}
                    {formatPercentage(results.projectedROI)}
                  </div>
                </div>

                {/* Insight Cards */}
                <div className="grid grid-cols-2 gap-3">
                  {insightCards.map((card, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-800/40 rounded-lg border border-gray-700/30"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={card.color}>{card.icon}</div>
                        <div className="text-xs text-gray-400">
                          {card.title}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-white">
                        {card.value}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {card.change > 0 ? (
                          <ArrowUp className="h-3 w-3 text-green-400" />
                        ) : card.change < 0 ? (
                          <ArrowDown className="h-3 w-3 text-red-400" />
                        ) : null}
                        <div
                          className={`text-xs ${card.change > 0 ? "text-green-400" : card.change < 0 ? "text-red-400" : "text-gray-400"}`}
                        >
                          {card.change > 0
                            ? "Verbetering"
                            : card.change < 0
                              ? "Daling"
                              : "Neutraal"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Confidence Score */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Betrouwbaarheidsscore</span>
                    <span className="text-white font-medium">
                      {results.confidenceScore}%
                    </span>
                  </div>
                  <Progress value={results.confidenceScore} className="h-2" />
                  <div className="text-xs text-gray-500">
                    Gebaseerd op data kwaliteit en industrie benchmarks
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Insights */}
            <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  AI-Powered Inzichten
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-blue-400">
                        Optimale Marketing Mix
                      </div>
                      <div className="text-xs text-gray-300 mt-1">
                        Je huidige budget van{" "}
                        {formatCurrency(inputs.marketingBudget)} is{" "}
                        {(inputs.marketingBudget / inputs.monthlyRevenue) *
                          100 <
                        15
                          ? "conservatief"
                          : (inputs.marketingBudget / inputs.monthlyRevenue) *
                                100 >
                              25
                            ? "agressief"
                            : "optimaal"}{" "}
                        voor een {inputs.industry} bedrijf
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <Sparkles className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-green-400">
                        Groeipotentieel
                      </div>
                      <div className="text-xs text-gray-300 mt-1">
                        Met AI-optimalisatie kan je conversie rate stijgen van{" "}
                        {inputs.currentConversionRate}% naar{" "}
                        {(inputs.currentConversionRate * 1.3).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {results.paybackPeriod <= 6 && (
                    <div className="flex items-start gap-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <Target className="h-5 w-5 text-orange-400 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-orange-400">
                          Snelle Terugverdientijd
                        </div>
                        <div className="text-xs text-gray-300 mt-1">
                          Je investering verdient zich terug in slechts{" "}
                          {results.paybackPeriod} maanden - uitstekend voor je
                          industrie
                        </div>
                      </div>
                    </div>
                  )}

                  {results.confidenceScore >= 85 && (
                    <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <Award className="h-5 w-5 text-purple-400 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-purple-400">
                          Hoge Betrouwbaarheid
                        </div>
                        <div className="text-xs text-gray-300 mt-1">
                          Je data kwaliteit is uitstekend (
                          {results.confidenceScore}%), wat zorgt voor
                          nauwkeurige projecties
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Benchmarks */}
            <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  Industrie Benchmarks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Conversie Rate</span>
                      <span className="text-white">
                        {inputs.currentConversionRate}%
                      </span>
                    </div>
                    <Progress
                      value={(inputs.currentConversionRate / 8) * 100}
                      className="h-2"
                    />
                    <div className="text-xs text-gray-500">
                      Industrie gemiddelde:{" "}
                      {inputs.industry === "saas"
                        ? "3-5%"
                        : inputs.industry === "ecommerce"
                          ? "2-4%"
                          : "2-6%"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Marketing Budget %</span>
                      <span className="text-white">
                        {(
                          (inputs.marketingBudget / inputs.monthlyRevenue) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (inputs.marketingBudget / inputs.monthlyRevenue) *
                        100 *
                        4
                      }
                      className="h-2"
                    />
                    <div className="text-xs text-gray-500">
                      Aanbevolen voor groei: 15-25%
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Huidige ROI</span>
                      <span className="text-white">
                        {formatPercentage(results.currentROI)}
                      </span>
                    </div>
                    <Progress
                      value={Math.min((results.currentROI / 300) * 100, 100)}
                      className="h-2"
                    />
                    <div className="text-xs text-gray-500">
                      Top performers: 200%+
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projections" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Projection Chart */}
            <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  12-Maands Omzet Projectie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis
                        stroke="#9CA3AF"
                        tickFormatter={value =>
                          `€${(value / 1000).toFixed(0)}K`
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                        formatter={value => [
                          formatCurrency(value as number),
                          "",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="current"
                        stackId="1"
                        stroke="#EF4444"
                        fill="#EF4444"
                        fillOpacity={0.3}
                        name="Huidige Omzet"
                      />
                      <Area
                        type="monotone"
                        dataKey="projected"
                        stackId="2"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.3}
                        name="Geprojecteerde Omzet"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* ROI Comparison */}
            <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  ROI Vergelijking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roiComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis
                        stroke="#9CA3AF"
                        tickFormatter={value => `${value}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                        formatter={value => [`${value.toFixed(1)}%`, ""]}
                      />
                      <Bar dataKey="value" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics Summary */}
          <Card className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-2xl text-white">
                Financiële Impact Samenvatting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gradient-to-b from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20">
                  <DollarSign className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(results.additionalRevenue)}
                  </div>
                  <div className="text-sm text-gray-400">
                    Extra Jaarlijkse Omzet
                  </div>
                </div>
                <div className="text-center p-4 bg-gradient-to-b from-green-500/10 to-green-600/10 rounded-lg border border-green-500/20">
                  <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(results.netProfit)}
                  </div>
                  <div className="text-sm text-gray-400">Netto Winst</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-b from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/20">
                  <Target className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {results.paybackPeriod} maanden
                  </div>
                  <div className="text-sm text-gray-400">Terugverdientijd</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-b from-orange-500/10 to-orange-600/10 rounded-lg border border-orange-500/20">
                  <Award className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {results.projectedRoas.toFixed(2)}x
                  </div>
                  <div className="text-sm text-gray-400">
                    Geprojecteerde ROAS
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Action Items */}
            <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-400" />
                  Actie Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.currentROI < 100 && (
                    <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-red-400">
                          ROI Optimalisatie Nodig
                        </div>
                        <div className="text-xs text-gray-300 mt-1">
                          Je huidige ROI is onder de 100%. Focus op conversie
                          optimalisatie en customer acquisition costs verlagen.
                        </div>
                      </div>
                    </div>
                  )}

                  {(inputs.marketingBudget / inputs.monthlyRevenue) * 100 <
                    10 && (
                    <div className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <Target className="h-5 w-5 text-yellow-400 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-yellow-400">
                          Budget Verhoging Overwegen
                        </div>
                        <div className="text-xs text-gray-300 mt-1">
                          Je marketing budget is slechts{" "}
                          {(
                            (inputs.marketingBudget / inputs.monthlyRevenue) *
                            100
                          ).toFixed(1)}
                          % van je omzet. Overweeg verhoging naar 15-20% voor
                          accelerated groei.
                        </div>
                      </div>
                    </div>
                  )}

                  {inputs.currentConversionRate < 3 && (
                    <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <Zap className="h-5 w-5 text-blue-400 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-blue-400">
                          Conversie Optimalisatie Prioriteit
                        </div>
                        <div className="text-xs text-gray-300 mt-1">
                          Je conversie rate van {inputs.currentConversionRate}%
                          ligt onder het industrie gemiddelde. Implementeer A/B
                          testing en UX verbetering.
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-green-400">
                        AI Marketing Implementatie
                      </div>
                      <div className="text-xs text-gray-300 mt-1">
                        Implementeer AI-powered personalisatie om je
                        geprojecteerde {formatPercentage(results.projectedROI)}{" "}
                        ROI te behalen.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  Volgende Stappen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                    <div className="font-medium text-white mb-2">
                      1. Marketing Strategie Audit
                    </div>
                    <div className="text-sm text-gray-300 mb-3">
                      Analyseer je huidige marketing mix en identificeer quick
                      wins voor ROI verbetering.
                    </div>
                    <NormalButton
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Plan Audit
                    </NormalButton>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                    <div className="font-medium text-white mb-2">
                      2. AI Tools Implementatie
                    </div>
                    <div className="text-sm text-gray-300 mb-3">
                      Begin met AI-powered optimalisatie tools om je{" "}
                      {formatPercentage(
                        results.projectedROI - results.currentROI
                      )}{" "}
                      ROI verbetering te realiseren.
                    </div>
                    <NormalButton
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                    >
                      Start Implementatie
                    </NormalButton>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
                    <div className="font-medium text-white mb-2">
                      3. Performance Monitoring
                    </div>
                    <div className="text-sm text-gray-300 mb-3">
                      Zet continue monitoring op om je {results.paybackPeriod}
                      -maands payback periode te tracken.
                    </div>
                    <NormalButton
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      Setup Monitoring
                    </NormalButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
