"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  ArrowRight,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  Zap,
  BarChart3,
  Rocket,
  Shield,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/context";
import SocialProofEngine from "./social-proof-engine";
import { PersonalizedContent } from "@/components/analytics/personalized-content";

interface AwarenessStageProps {
  onNextStage: () => void;
  onTrackInteraction: (interaction: string, value?: number) => void;
}

interface BusinessProblem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  impact: string;
  selected: boolean;
}

const BUSINESS_PROBLEMS: BusinessProblem[] = [
  {
    id: "content-creation",
    title: "Content Creation Takes Too Much Time",
    description:
      "Your marketing team spends 80% of their time creating content instead of strategy",
    icon: <Clock className="w-6 h-6" />,
    impact: "€3k/month productivity loss",
    selected: false,
  },
  {
    id: "inconsistent-messaging",
    title: "Inconsistent Brand Messaging",
    description: "Different platforms have different tone and messaging",
    icon: <AlertTriangle className="w-6 h-6" />,
    impact: "25% loss in brand recognition",
    selected: false,
  },
  {
    id: "low-conversion",
    title: "Low Conversion Rates",
    description:
      "Your content generates traffic but doesn't convert to leads or sales",
    icon: <TrendingUp className="w-6 h-6" />,
    impact: "30% missed revenue opportunity",
    selected: false,
  },
  {
    id: "scaling-challenges",
    title: "Scaling Challenges",
    description:
      "Growth means hiring more people, but ROI decreases with scaling",
    icon: <Users className="w-6 h-6" />,
    impact: "€8k/month extra costs when scaling",
    selected: false,
  },
  {
    id: "roi-tracking",
    title: "No ROI Insights",
    description:
      "You don't know which marketing efforts actually generate revenue",
    icon: <BarChart3 className="w-6 h-6" />,
    impact: "20% budget waste",
    selected: false,
  },
  {
    id: "manual-processes",
    title: "Manual Processes",
    description:
      "Too much manual work prevents scalability and increases errors",
    icon: <Zap className="w-6 h-6" />,
    impact: "60% time loss on routine tasks",
    selected: false,
  },
];

const VALUE_PROPOSITIONS = [
  {
    id: "marketing-machine",
    title: "Marketing Machine",
    subtitle: "€15k/maand - AI Content Engine",
    description: "AI-gedreven contentgeneratie die uw merk 24/7 versterkt",
    icon: <Rocket className="w-8 h-8" />,
    gradient: "from-purple-500 to-pink-500",
    stats: "+120% ROI",
    benefits: [
      "AI Content Generation Engine",
      "Multi-platform Publishing",
      "Email Marketing Automation",
      "Social Media Scheduling",
    ],
  },
  {
    id: "bi-dashboard",
    title: "BI Dashboard",
    subtitle: "€15k/maand - Advanced Analytics",
    description:
      "Geavanceerde analytics die uw ideale klanten identificeert en bereikt",
    icon: <Target className="w-8 h-8" />,
    gradient: "from-blue-500 to-cyan-500",
    stats: "+130% efficiency",
    benefits: [
      "Executive Dashboard",
      "Financial Intelligence",
      "Customer Analytics",
      "Marketing Attribution",
    ],
  },
  {
    id: "complete-growth",
    title: "Complete Growth Platform",
    subtitle: "€25k/maand - Volledige Bundel (€5k besparing!)",
    description: "Alle tools geïntegreerd voor maximale groei en efficiency",
    icon: <DollarSign className="w-8 h-8" />,
    gradient: "from-green-500 to-emerald-500",
    stats: "+180% groei",
    benefits: [
      "Marketing Machine + BI Dashboard",
      "Advanced Workflow Automation",
      "Custom Integrations",
      "Dedicated Success Manager",
    ],
  },
];

export default function AwarenessStage({
  onNextStage,
  onTrackInteraction,
}: AwarenessStageProps) {
  const { t } = useLocale();

  // Generate problems from translations
  const getBusinessProblems = (): BusinessProblem[] => [
    {
      id: "content-creation",
      title: t("customerJourney.awareness.problems.contentCreation.title"),
      description: t(
        "customerJourney.awareness.problems.contentCreation.description"
      ),
      icon: <Clock className="w-6 h-6" />,
      impact: t("customerJourney.awareness.problems.contentCreation.impact"),
      selected: false,
    },
    {
      id: "inconsistent-messaging",
      title: t(
        "customerJourney.awareness.problems.inconsistentMessaging.title"
      ),
      description: t(
        "customerJourney.awareness.problems.inconsistentMessaging.description"
      ),
      icon: <AlertTriangle className="w-6 h-6" />,
      impact: t(
        "customerJourney.awareness.problems.inconsistentMessaging.impact"
      ),
      selected: false,
    },
    {
      id: "low-conversion",
      title: t("customerJourney.awareness.problems.lowConversion.title"),
      description: t(
        "customerJourney.awareness.problems.lowConversion.description"
      ),
      icon: <TrendingUp className="w-6 h-6" />,
      impact: t("customerJourney.awareness.problems.lowConversion.impact"),
      selected: false,
    },
    {
      id: "scaling-challenges",
      title: t("customerJourney.awareness.problems.scalingChallenges.title"),
      description: t(
        "customerJourney.awareness.problems.scalingChallenges.description"
      ),
      icon: <Users className="w-6 h-6" />,
      impact: t("customerJourney.awareness.problems.scalingChallenges.impact"),
      selected: false,
    },
    {
      id: "roi-tracking",
      title: t("customerJourney.awareness.problems.roiTracking.title"),
      description: t(
        "customerJourney.awareness.problems.roiTracking.description"
      ),
      icon: <BarChart3 className="w-6 h-6" />,
      impact: t("customerJourney.awareness.problems.roiTracking.impact"),
      selected: false,
    },
    {
      id: "manual-processes",
      title: t("customerJourney.awareness.problems.manualProcesses.title"),
      description: t(
        "customerJourney.awareness.problems.manualProcesses.description"
      ),
      icon: <Zap className="w-6 h-6" />,
      impact: t("customerJourney.awareness.problems.manualProcesses.impact"),
      selected: false,
    },
  ];

  const [problems, setProblems] = useState<BusinessProblem[]>(
    getBusinessProblems()
  );
  const [selectedCount, setSelectedCount] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "problems" | "solution" | "cta"
  >("problems");

  const toggleProblem = (problemId: string) => {
    setProblems(prev =>
      prev.map(problem =>
        problem.id === problemId
          ? { ...problem, selected: !problem.selected }
          : problem
      )
    );
    onTrackInteraction("problem-selected", 1);
  };

  useEffect(() => {
    const selected = problems.filter(p => p.selected).length;
    setSelectedCount(selected);

    if (selected >= 3 && !showSolution) {
      setTimeout(() => {
        setShowSolution(true);
        setCurrentStep("solution");
      }, 1000);
    }
  }, [problems, showSolution]);

  const handleContinue = () => {
    if (selectedCount >= 2) {
      setCurrentStep("cta");
      onTrackInteraction("awareness-continue", selectedCount);
      setTimeout(() => {
        onNextStage();
      }, 2000);
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>

      {/* Progress Indicator */}
      <div className="relative z-10 pt-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-2">
            <div className="flex items-center justify-between text-sm text-gray-300">
              <span className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    currentStep === "problems"
                      ? "bg-purple-400 animate-pulse"
                      : "bg-green-400"
                  }`}
                ></div>
                Problem Identificatie
              </span>
              <span className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    currentStep === "solution"
                      ? "bg-purple-400 animate-pulse"
                      : showSolution
                        ? "bg-green-400"
                        : "bg-gray-600"
                  }`}
                ></div>
                Oplossing Preview
              </span>
              <span className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    currentStep === "cta"
                      ? "bg-purple-400 animate-pulse"
                      : "bg-gray-600"
                  }`}
                ></div>
                Next Step
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section with Journey Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 backdrop-blur-sm border border-amber-400/30 text-amber-300 text-sm mb-8">
            <span className="w-2 h-2 bg-amber-400 rounded-full mr-3 animate-pulse"></span>
            {t("customerJourney.awareness.badge")}
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            {t("customerJourney.awareness.title")}
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed">
            {t("customerJourney.awareness.subtitle")}
          </p>

          {/* Customer Journey Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              {
                phase: "1",
                title: "Awareness",
                subtitle: "Herken De Problemen",
                description:
                  "Identificeer uw marketing uitdagingen en groeibeperkingen",
                icon: <Target className="w-8 h-8" />,
                gradient: "from-amber-500 to-orange-500",
                status: "active",
              },
              {
                phase: "2",
                title: "Consideration",
                subtitle: "Ervaar De Oplossingen",
                description: "Test onze Marketing Machine en BI Dashboard live",
                icon: <Zap className="w-8 h-8" />,
                gradient: "from-blue-500 to-cyan-500",
                status: "next",
              },
              {
                phase: "3",
                title: "Decision",
                subtitle: "Bereken Uw ROI",
                description:
                  "Zie precies hoeveel groei en besparing u kunt verwachten",
                icon: <TrendingUp className="w-8 h-8" />,
                gradient: "from-green-500 to-emerald-500",
                status: "upcoming",
              },
              {
                phase: "4",
                title: "Action",
                subtitle: "Start Uw Groei",
                description:
                  "Boek een strategie sessie en begin direct met implementatie",
                icon: <Rocket className="w-8 h-8" />,
                gradient: "from-purple-500 to-pink-500",
                status: "upcoming",
              },
            ].map((step, index) => (
              <motion.div
                key={step.phase}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={`relative group ${step.status === "active" ? "scale-105" : ""}`}
              >
                <div
                  className={`relative bg-white/10 backdrop-blur-xl border rounded-2xl p-6 h-full transition-all duration-500 group-hover:scale-105 ${
                    step.status === "active"
                      ? "border-amber-400/50 bg-amber-500/10 shadow-2xl shadow-amber-500/20"
                      : "border-white/20 hover:border-white/30 hover:bg-white/15"
                  }`}
                >
                  {/* Phase Number */}
                  <div
                    className={`absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-r ${step.gradient} rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-gray-900`}
                  >
                    {step.phase}
                  </div>

                  {/* Status Indicator */}
                  {step.status === "active" && (
                    <div className="absolute top-4 right-4">
                      <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${step.gradient} rounded-xl flex items-center justify-center text-white mb-4 mx-auto`}
                  >
                    {step.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p
                    className={`text-sm font-semibold mb-3 bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`}
                  >
                    {step.subtitle}
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {step.description}
                  </p>

                  {/* Arrow for active step */}
                  {step.status === "active" && (
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -bottom-6 left-1/2 transform -translate-x-1/2"
                    >
                      <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-white rotate-90" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Journey Progress */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
              <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
              <span className="text-white text-sm font-medium">
                Stap 1 van 4 - Ontdek Uw Uitdagingen
              </span>
            </div>
          </div>
        </motion.div>

        {/* Problem Identification Checklist */}
        <AnimatePresence>
          {currentStep === "problems" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Welke Uitdagingen Herkent U?
                </h2>
                <p className="text-gray-300 text-lg">
                  Selecteer minimaal 2 problemen die u herkent ({selectedCount}
                  /6 geselecteerd)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {problems.map((problem, index) => (
                  <motion.div
                    key={problem.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onClick={() => toggleProblem(problem.id)}
                    className={`group relative cursor-pointer transition-all duration-300 ${
                      problem.selected ? "scale-105" : "hover:scale-102"
                    }`}
                  >
                    <div
                      className={`relative p-6 rounded-2xl border transition-all duration-300 ${
                        problem.selected
                          ? "bg-green-500/10 border-green-400/50 backdrop-blur-xl shadow-2xl shadow-green-500/20"
                          : "bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/15 hover:shadow-xl"
                      }`}
                    >
                      {/* Selection Indicator */}
                      <div className="absolute top-4 right-4">
                        {problem.selected ? (
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        ) : (
                          <div className="w-6 h-6 border-2 border-gray-400 rounded-full group-hover:border-white transition-colors"></div>
                        )}
                      </div>

                      {/* Problem Icon */}
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                          problem.selected
                            ? "bg-green-500 text-white"
                            : "bg-gray-700 text-gray-300 group-hover:bg-gray-600"
                        }`}
                      >
                        {problem.icon}
                      </div>

                      {/* Problem Content */}
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                        {problem.title}
                      </h3>

                      <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                        {problem.description}
                      </p>

                      {/* Impact Badge */}
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                          problem.selected
                            ? "bg-green-400/20 text-green-300 border border-green-400/30"
                            : "bg-red-400/20 text-red-300 border border-red-400/30"
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {problem.impact}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Continue Button */}
              {selectedCount >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center mt-12"
                >
                  <NormalButton
                    onClick={handleContinue}
                    className="group relative inline-flex items-center px-12 py-4 text-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25"
                  >
                    Toon Oplossingen Voor Mijn Problemen
                    <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </NormalButton>
                  <p className="mt-3 text-gray-400 text-sm">
                    Ontdek hoe we precies deze problemen oplossen
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Solution Preview */}
        <AnimatePresence>
          {showSolution && currentStep === "solution" && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 text-green-300 text-sm mb-6"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Enterprise Oplossingen Voor Uw Uitdagingen
                </motion.div>

                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  Hier Is Hoe Wij{" "}
                  <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Uw Problemen Oplossen
                  </span>
                </h2>

                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Onze Marketing Machine transformeert elk van uw geselecteerde
                  uitdagingen in{" "}
                  <span className="text-green-400 font-semibold">
                    geautomatiseerde groeikansen
                  </span>
                </p>
              </div>

              {/* Value Proposition Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {VALUE_PROPOSITIONS.map((proposition, index) => (
                  <motion.div
                    key={proposition.id}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    className="group relative"
                  >
                    <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:bg-white/15 hover:border-white/30 hover:shadow-2xl transition-all duration-500 h-full group-hover:scale-105">
                      {/* Icon & Badge */}
                      <div className="flex items-start justify-between mb-6">
                        <div
                          className={`w-16 h-16 bg-gradient-to-r ${proposition.gradient} rounded-2xl flex items-center justify-center text-white`}
                        >
                          {proposition.icon}
                        </div>
                        <div
                          className={`px-3 py-1 bg-gradient-to-r ${proposition.gradient} bg-opacity-20 rounded-full text-sm font-bold text-white border border-white/20`}
                        >
                          {proposition.stats}
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {proposition.title}
                      </h3>

                      <p
                        className={`text-sm font-semibold mb-4 bg-gradient-to-r ${proposition.gradient} bg-clip-text text-transparent`}
                      >
                        {proposition.subtitle}
                      </p>

                      <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                        {proposition.description}
                      </p>

                      {/* Benefits List */}
                      <div className="space-y-3">
                        {proposition.benefits.map((benefit, benefitIndex) => (
                          <motion.div
                            key={benefitIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: index * 0.2 + benefitIndex * 0.1,
                            }}
                            className="flex items-center text-gray-300"
                          >
                            <CheckCircle className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                            <span className="text-sm">{benefit}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Social Proof Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="mb-12"
              >
                <SocialProofEngine
                  variant="compact"
                  showTestimonials={false}
                  showCaseStudies={false}
                  showNotifications={true}
                />
              </motion.div>

              {/* Compelling CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-center"
              >
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-3xl p-8 border border-purple-400/30 max-w-4xl mx-auto">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Klaar Om Deze Oplossingen In Actie Te Zien?
                  </h3>
                  <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                    Ontdek hoe onze interactieve demo u precies laat zien hoe we
                    uw geselecteerde problemen transformeren in{" "}
                    <span className="text-purple-400 font-semibold">
                      geautomatiseerde groei
                    </span>
                  </p>

                  <NormalButton
                    onClick={() => setCurrentStep("cta")}
                    className="group relative inline-flex items-center px-12 py-4 text-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25"
                  >
                    Start Interactive Platform Demo
                    <Rocket className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </NormalButton>

                  <div className="flex items-center justify-center space-x-8 mt-6 text-sm text-gray-400">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />5 minuten demo
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Geen registratie
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Direct ROI inzicht
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Final CTA Step */}
        <AnimatePresence>
          {currentStep === "cta" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(147, 51, 234, 0.4)",
                    "0 0 0 30px rgba(147, 51, 234, 0)",
                    "0 0 0 0 rgba(147, 51, 234, 0)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block"
              >
                <NormalButton
                  onClick={onNextStage}
                  className="group relative inline-flex items-center px-16 py-6 text-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-2xl"
                >
                  Ervaar De Marketing Machine →
                </NormalButton>
              </motion.div>

              <p className="mt-4 text-gray-300 text-lg">
                Ontdek hoe we uw {selectedCount} geselecteerde problemen
                oplossen...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
