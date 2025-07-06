"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  NeuralGlassCard,
  QuantumButton,
} from "@/components/animations/neural-animations";
import {
  SearchIcon,
  PenToolIcon,
  ShareIcon,
  BarChart3Icon,
  ChevronRightIcon,
  BrainIcon,
  RocketIcon,
  TrendingUpIcon,
  CheckCircleIcon,
} from "lucide-react";

// ============================
// PRODUCT LIFECYCLE STAGES
// ============================

interface LifecycleStage {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  details: {
    overview: string;
    features: string[];
    benefits: string[];
    metrics: { label: string; value: string }[];
  };
}

const lifecycleStages: LifecycleStage[] = [
  {
    id: "research",
    title: "AI Research",
    description: "Intelligente marktonderzoek en content discovery",
    icon: SearchIcon,
    color: "blue",
    details: {
      overview:
        "AI-gestuurde marktanalyse die trends, concurrentie en kansen identificeert voor optimale content strategie.",
      features: [
        "Automatische trend detectie",
        "Concurrent analyse en benchmarking",
        "Keyword research en SEO optimalisatie",
        "Doelgroep insights en persona mapping",
      ],
      benefits: [
        "50% sneller marktonderzoek",
        "Data-gedreven besluitvorming",
        "Verhoogde content relevantie",
        "Concurrentievoordeel door AI insights",
      ],
      metrics: [
        { label: "Trends Geanalyseerd", value: "2.5K+" },
        { label: "Markt Segmenten", value: "150+" },
        { label: "Tijd Besparing", value: "75%" },
        { label: "Nauwkeurigheid", value: "94%" },
      ],
    },
  },
  {
    id: "creation",
    title: "Content Creatie",
    description: "AI-geassisteerde content ontwikkeling en optimalisatie",
    icon: PenToolIcon,
    color: "purple",
    details: {
      overview:
        "Intelligente content creatie die kwaliteit, relevantie en engagement maximaliseert door AI-gestuurde optimalisatie.",
      features: [
        "Multi-format content generatie",
        "Tone of voice aanpassing",
        "A/B test varianten creatie",
        "Brand guideline naleving",
      ],
      benefits: [
        "10x snellere content productie",
        "Consistente merkcommunicatie",
        "Verhoogde engagement rates",
        "Kostenreductie van 60%",
      ],
      metrics: [
        { label: "Content Items", value: "12K+" },
        { label: "Formaten", value: "25+" },
        { label: "Merken", value: "500+" },
        { label: "Kwaliteitsscore", value: "9.2/10" },
      ],
    },
  },
  {
    id: "posting",
    title: "Smart Publishing",
    description: "Geoptimaliseerde distributie en timing automatisering",
    icon: ShareIcon,
    color: "green",
    details: {
      overview:
        "Intelligente content distributie die timing, platforms en doelgroepen optimaliseert voor maximale impact.",
      features: [
        "Multi-platform scheduling",
        "Optimale timing voorspelling",
        "Doelgroep segmentatie",
        "Real-time performance monitoring",
      ],
      benefits: [
        "40% hogere engagement",
        "Automatische scheduling",
        "Cross-platform consistentie",
        "Verhoogde reach en visibility",
      ],
      metrics: [
        { label: "Platforms", value: "15+" },
        { label: "Posts per Dag", value: "1.2K+" },
        { label: "Engagement", value: "+40%" },
        { label: "Reach", value: "25M+" },
      ],
    },
  },
  {
    id: "analytics",
    title: "Performance Analytics",
    description: "Real-time insights en ROI optimalisatie",
    icon: BarChart3Icon,
    color: "cyan",
    details: {
      overview:
        "Geavanceerde analytics en machine learning die performance voorspelt en optimalisatiekansen identificeert.",
      features: [
        "Real-time performance tracking",
        "Predictive analytics dashboard",
        "ROI calculatie en optimalisatie",
        "Automated reporting en insights",
      ],
      benefits: [
        "Data-driven optimalisatie",
        "200% ROI verbetering",
        "Automatische rapportage",
        "Voorspellende performance insights",
      ],
      metrics: [
        { label: "Data Points", value: "50M+" },
        { label: "Accuracy", value: "96%" },
        { label: "ROI Increase", value: "+200%" },
        { label: "Reports", value: "Auto" },
      ],
    },
  },
];

// ============================
// ANIMATION VARIANTS
// ============================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const stageVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const flowLineVariants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: 2,
        ease: "easeInOut",
      },
      opacity: {
        duration: 0.5,
      },
    },
  },
};

const progressVariants = {
  hidden: { width: "0%" },
  visible: {
    width: "100%",
    transition: {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

// ============================
// STAGE CARD COMPONENT
// ============================

interface StageCardProps {
  stage: LifecycleStage;
  index: number;
  isActive: boolean;
  onActivate: (stageId: string) => void;
}

const StageCard: React.FC<StageCardProps> = ({
  stage,
  index,
  isActive,
  onActivate,
}) => {
  const colorClasses = {
    blue: {
      gradient: "from-blue-500/20 via-blue-600/10 to-blue-700/20",
      border: "border-blue-500/30",
      text: "text-blue-400",
      glow: "shadow-blue-500/20",
    },
    purple: {
      gradient: "from-purple-500/20 via-purple-600/10 to-purple-700/20",
      border: "border-purple-500/30",
      text: "text-purple-400",
      glow: "shadow-purple-500/20",
    },
    green: {
      gradient: "from-green-500/20 via-green-600/10 to-green-700/20",
      border: "border-green-500/30",
      text: "text-green-400",
      glow: "shadow-green-500/20",
    },
    cyan: {
      gradient: "from-cyan-500/20 via-cyan-600/10 to-cyan-700/20",
      border: "border-cyan-500/30",
      text: "text-cyan-400",
      glow: "shadow-cyan-500/20",
    },
  };

  const colors = colorClasses[stage.color as keyof typeof colorClasses];
  const Icon = stage.icon;

  return (
    <motion.div
      variants={stageVariants}
      whileHover={{ scale: 1.05, y: -10 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onActivate(stage.id)}
      className={cn(
        "relative cursor-pointer group",
        "rounded-2xl border backdrop-blur-xl p-6",
        "transition-all duration-500",
        colors.gradient,
        colors.border,
        isActive ? `shadow-2xl ${colors.glow}` : "shadow-lg shadow-black/20"
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern
              id={`pattern-${stage.id}`}
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="10"
                cy="10"
                r="1"
                fill="currentColor"
                className={colors.text}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#pattern-${stage.id})`} />
        </svg>
      </div>

      {/* Stage number */}
      <div
        className={cn(
          "absolute -top-3 -left-3 w-8 h-8 rounded-full",
          "flex items-center justify-center",
          "text-sm font-bold text-white",
          "bg-gradient-to-br",
          stage.color === "blue" && "from-blue-500 to-blue-600",
          stage.color === "purple" && "from-purple-500 to-purple-600",
          stage.color === "green" && "from-green-500 to-green-600",
          stage.color === "cyan" && "from-cyan-500 to-cyan-600"
        )}
      >
        {index + 1}
      </div>

      {/* Icon */}
      <div
        className={cn(
          "w-12 h-12 rounded-xl mb-4",
          "flex items-center justify-center",
          "bg-gradient-to-br from-white/10 to-white/5",
          "border border-white/20"
        )}
      >
        <Icon className={cn("w-6 h-6", colors.text)} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-opacity-90 transition-colors">
          {stage.title}
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          {stage.description}
        </p>
      </div>

      {/* Active indicator */}
      {isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "absolute top-4 right-4 w-3 h-3 rounded-full",
            stage.color === "blue" && "bg-blue-400",
            stage.color === "purple" && "bg-purple-400",
            stage.color === "green" && "bg-green-400",
            stage.color === "cyan" && "bg-cyan-400"
          )}
        >
          <motion.div
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={cn(
              "w-full h-full rounded-full opacity-50",
              stage.color === "blue" && "bg-blue-400",
              stage.color === "purple" && "bg-purple-400",
              stage.color === "green" && "bg-green-400",
              stage.color === "cyan" && "bg-cyan-400"
            )}
          />
        </motion.div>
      )}

      {/* Hover glow effect */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100",
          "bg-gradient-to-r from-transparent via-white/5 to-transparent",
          "transition-opacity duration-300"
        )}
      />
    </motion.div>
  );
};

// ============================
// FLOW CONNECTION COMPONENT
// ============================

const FlowConnection: React.FC<{ index: number; isActive: boolean }> = ({
  index,
  isActive,
}) => {
  return (
    <div className="flex items-center justify-center px-4">
      <div className="relative">
        {/* Arrow line */}
        <svg width="80" height="40" className="relative z-10">
          <motion.path
            d="M 10 20 L 60 20 L 55 15 M 60 20 L 55 25"
            stroke="rgba(59, 130, 246, 0.6)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={flowLineVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.5 }}
          />

          {/* Animated flow particles */}
          {isActive && (
            <>
              {Array.from({ length: 3 }, (_, i) => (
                <motion.circle
                  key={i}
                  cx="10"
                  cy="20"
                  r="2"
                  fill="rgba(59, 130, 246, 0.8)"
                  initial={{ cx: 10 }}
                  animate={{ cx: [10, 30, 50, 60] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.7,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </>
          )}
        </svg>

        {/* Flow progress indicator */}
        <motion.div
          className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
          variants={progressVariants}
          initial="hidden"
          animate={isActive ? "visible" : "hidden"}
        />
      </div>
    </div>
  );
};

// ============================
// DETAILED VIEW COMPONENT
// ============================

interface DetailedViewProps {
  stage: LifecycleStage | null;
  onClose: () => void;
}

const DetailedView: React.FC<DetailedViewProps> = ({ stage, onClose }) => {
  if (!stage) return null;

  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
    purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
    green: "from-green-500/20 to-green-600/20 border-green-500/30",
    cyan: "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30",
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className={cn(
          "mt-8 rounded-2xl border backdrop-blur-xl p-8",
          "bg-gradient-to-br",
          colorClasses[stage.color as keyof typeof colorClasses]
        )}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center",
                "bg-gradient-to-br from-white/10 to-white/5 border border-white/20"
              )}
            >
              <stage.icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{stage.title}</h2>
              <p className="text-gray-300">{stage.description}</p>
            </div>
          </div>
          <QuantumButton onClick={onClose} variant="neural">
            Sluiten
          </QuantumButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Overview */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BrainIcon className="w-5 h-5" />
              Overzicht
            </h3>
            <p className="text-gray-300 leading-relaxed mb-6">
              {stage.details.overview}
            </p>

            {/* Features */}
            <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
              <RocketIcon className="w-4 h-4" />
              Functionaliteiten
            </h4>
            <ul className="space-y-2">
              {stage.details.features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 text-gray-300"
                >
                  <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                  {feature}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Benefits & Metrics */}
          <div>
            <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUpIcon className="w-4 h-4" />
              Voordelen
            </h4>
            <ul className="space-y-2 mb-6">
              {stage.details.benefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="flex items-center gap-3 text-gray-300"
                >
                  <TrendingUpIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  {benefit}
                </motion.li>
              ))}
            </ul>

            {/* Metrics */}
            <h4 className="text-md font-semibold text-white mb-3">
              Key Metrics
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {stage.details.metrics.map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <div className="text-2xl font-bold text-white mb-1">
                    {metric.value}
                  </div>
                  <div className="text-sm text-gray-400">{metric.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================
// MAIN COMPONENT
// ============================

interface ProductLifecycleVisualizationProps {
  className?: string;
  autoProgress?: boolean;
  progressInterval?: number;
}

export const ProductLifecycleVisualization: React.FC<
  ProductLifecycleVisualizationProps
> = ({ className, autoProgress = false, progressInterval = 5000 }) => {
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<LifecycleStage | null>(
    null
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-progress through stages
  useEffect(() => {
    if (!autoProgress) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % lifecycleStages.length);
      setActiveStage(lifecycleStages[currentIndex].id);
    }, progressInterval);

    return () => clearInterval(interval);
  }, [autoProgress, progressInterval, currentIndex]);

  const handleStageActivate = (stageId: string) => {
    const stage = lifecycleStages.find(s => s.id === stageId);
    setSelectedStage(stage || null);
    setActiveStage(stageId);
  };

  const handleCloseDetail = () => {
    setSelectedStage(null);
    setActiveStage(null);
  };

  return (
    <div className={cn("w-full max-w-7xl mx-auto px-4", className)}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
          AI Marketing Ecosystem
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Ontdek hoe onze AI-gestuurde marketing workflow uw bedrijf
          transformeert van onderzoek tot resultaten
        </p>
      </motion.div>

      {/* Lifecycle Flow */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        {/* Desktop Layout */}
        <div className="hidden xl:flex items-center justify-center gap-2 px-4">
          {lifecycleStages.map((stage, index) => (
            <React.Fragment key={stage.id}>
              <div className="flex-shrink-0 w-56 2xl:w-64">
                <StageCard
                  stage={stage}
                  index={index}
                  isActive={activeStage === stage.id}
                  onActivate={handleStageActivate}
                />
              </div>
              {index < lifecycleStages.length - 1 && (
                <FlowConnection
                  index={index}
                  isActive={activeStage === stage.id}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Large Desktop Layout (between lg and xl) */}
        <div className="hidden lg:flex xl:hidden items-center justify-center gap-1 px-2">
          {lifecycleStages.map((stage, index) => (
            <React.Fragment key={stage.id}>
              <div className="flex-shrink-0 w-48">
                <StageCard
                  stage={stage}
                  index={index}
                  isActive={activeStage === stage.id}
                  onActivate={handleStageActivate}
                />
              </div>
              {index < lifecycleStages.length - 1 && (
                <div className="flex-shrink-0 w-8">
                  <FlowConnection
                    index={index}
                    isActive={activeStage === stage.id}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {lifecycleStages.map((stage, index) => (
              <div key={stage.id} className="relative">
                <StageCard
                  stage={stage}
                  index={index}
                  isActive={activeStage === stage.id}
                  onActivate={handleStageActivate}
                />
                {index < lifecycleStages.length - 1 && (
                  <div className="hidden sm:block absolute -right-3 top-1/2 transform -translate-y-1/2 z-10">
                    <ChevronRightIcon className="w-6 h-6 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Control Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex justify-center gap-4 mb-8"
      >
        <QuantumButton
          onClick={() => handleStageActivate(lifecycleStages[0].id)}
          variant="primary"
        >
          Start Demo
        </QuantumButton>
        <QuantumButton onClick={() => setActiveStage(null)} variant="neural">
          Reset
        </QuantumButton>
      </motion.div>

      {/* Detailed View */}
      <DetailedView stage={selectedStage} onClose={handleCloseDetail} />
    </div>
  );
};
