"use client";

import React, { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Zap,
  Shield,
  Users,
  Bot,
  Sparkles,
  ArrowRight,
  Play,
} from "lucide-react";

interface ProductFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  stats: {
    label: string;
    value: string;
  }[];
}

const ProductCard: React.FC<{
  feature: ProductFeature;
  index: number;
  isActive: boolean;
  onActivate: () => void;
}> = ({ feature, index, isActive, onActivate }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-150, 150], [15, -15]));
  const rotateY = useSpring(useTransform(mouseX, [-150, 150], [-15, 15]));

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    mouseX.set(event.clientX - centerX);
    mouseY.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Define color classes safely
  const getBorderClass = () => {
    if (isActive) {
      switch (feature.color) {
        case "cyan":
          return "border-cyan-400/60 shadow-lg shadow-cyan-500/20";
        case "blue":
          return "border-blue-400/60 shadow-lg shadow-blue-500/20";
        case "purple":
          return "border-purple-400/60 shadow-lg shadow-purple-500/20";
        default:
          return "border-slate-700/50";
      }
    }
    return "border-slate-700/50 hover:border-slate-600/60";
  };

  const getGlowClass = () => {
    switch (feature.color) {
      case "cyan":
        return "from-cyan-500/5 via-transparent to-cyan-500/5";
      case "blue":
        return "from-blue-500/5 via-transparent to-blue-500/5";
      case "purple":
        return "from-purple-500/5 via-transparent to-purple-500/5";
      default:
        return "from-slate-500/5 via-transparent to-slate-500/5";
    }
  };

  const getIconBgClass = () => {
    switch (feature.color) {
      case "cyan":
        return "from-cyan-500/20 to-cyan-600/20";
      case "blue":
        return "from-blue-500/20 to-blue-600/20";
      case "purple":
        return "from-purple-500/20 to-purple-600/20";
      default:
        return "from-slate-500/20 to-slate-600/20";
    }
  };

  const getIconClass = () => {
    switch (feature.color) {
      case "cyan":
        return "text-cyan-400";
      case "blue":
        return "text-blue-400";
      case "purple":
        return "text-purple-400";
      default:
        return "text-slate-400";
    }
  };

  const getTextClass = () => {
    switch (feature.color) {
      case "cyan":
        return "text-cyan-400";
      case "blue":
        return "text-blue-400";
      case "purple":
        return "text-purple-400";
      default:
        return "text-slate-400";
    }
  };

  const getButtonClass = () => {
    switch (feature.color) {
      case "cyan":
        return "from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500";
      case "blue":
        return "from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500";
      case "purple":
        return "from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500";
      default:
        return "from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500";
    }
  };

  const getBorderIconClass = () => {
    switch (feature.color) {
      case "cyan":
        return "border-cyan-400";
      case "blue":
        return "border-blue-400";
      case "purple":
        return "border-purple-400";
      default:
        return "border-slate-400";
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative cursor-pointer group transition-all duration-500 ${
        isActive ? "scale-105 z-20" : "scale-100 z-10"
      }`}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onActivate}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <div
        className={`relative bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-slate-800/60 
        backdrop-blur-xl border rounded-2xl p-6 overflow-hidden transition-all duration-500 ${getBorderClass()}`}
      >
        {/* Background glow effect */}
        <div
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
          bg-gradient-to-br ${getGlowClass()}`}
        />

        {/* Floating elements */}
        <div className="absolute top-4 right-4 opacity-20">
          <motion.div
            className={`w-20 h-20 border ${getBorderIconClass()} rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div
              className={`p-3 bg-gradient-to-br ${getIconBgClass()} rounded-2xl`}
            >
              {React.createElement(feature.icon, {
                className: `w-8 h-8 ${getIconClass()}`,
              })}
            </div>
            {isActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 
                  rounded-full text-xs text-green-400"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Active
              </motion.div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {feature.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`text-lg font-bold ${getTextClass()}`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              <motion.button
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 
                  bg-gradient-to-r ${getButtonClass()} 
                  text-white text-sm font-medium rounded-xl transition-all duration-300`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles className="w-4 h-4" />
                Try Now
              </motion.button>
              <motion.button
                className="p-3 border border-slate-600 text-slate-400 rounded-xl 
                  hover:border-slate-500 hover:text-slate-300 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Animated border */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-2xl border"
            animate={{
              borderColor: [
                "rgba(0, 0, 0, 0)",
                feature.color === "cyan"
                  ? "rgba(34, 211, 238, 0.4)"
                  : feature.color === "blue"
                    ? "rgba(59, 130, 246, 0.4)"
                    : "rgba(168, 85, 247, 0.4)",
                "rgba(0, 0, 0, 0)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>
    </motion.div>
  );
};

export const DynamicProductShowcase: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features: ProductFeature[] = [
    {
      id: "analytics",
      title: "AI-Powered Analytics",
      description:
        "Advanced machine learning algorithms analyze your data patterns and provide predictive insights for strategic decision making.",
      icon: BarChart3,
      color: "cyan",
      stats: [
        { label: "Accuracy", value: "99.2%" },
        { label: "Speed", value: "< 50ms" },
      ],
    },
    {
      id: "realtime",
      title: "Real-time Processing",
      description:
        "Lightning-fast data processing with real-time updates and notifications for critical business metrics and KPIs.",
      icon: Zap,
      color: "blue",
      stats: [
        { label: "Throughput", value: "1M/sec" },
        { label: "Latency", value: "< 10ms" },
      ],
    },
    {
      id: "security",
      title: "Enterprise Security",
      description:
        "Bank-grade encryption, compliance standards, and advanced security features to protect your sensitive data.",
      icon: Shield,
      color: "purple",
      stats: [
        { label: "Uptime", value: "99.9%" },
        { label: "Compliance", value: "SOC 2" },
      ],
    },
    {
      id: "collaboration",
      title: "Team Collaboration",
      description:
        "Built-in collaboration tools with role-based access control, shared dashboards, and real-time commenting.",
      icon: Users,
      color: "cyan",
      stats: [
        { label: "Users", value: "Unlimited" },
        { label: "Workspaces", value: "Multi-tenant" },
      ],
    },
  ];

  // Get colors for active feature
  const getActiveIconBg = () => {
    switch (features[activeFeature].color) {
      case "cyan":
        return "from-cyan-500/20 to-cyan-600/20";
      case "blue":
        return "from-blue-500/20 to-blue-600/20";
      case "purple":
        return "from-purple-500/20 to-purple-600/20";
      default:
        return "from-slate-500/20 to-slate-600/20";
    }
  };

  const getActiveIcon = () => {
    switch (features[activeFeature].color) {
      case "cyan":
        return "text-cyan-400";
      case "blue":
        return "text-blue-400";
      case "purple":
        return "text-purple-400";
      default:
        return "text-slate-400";
    }
  };

  const getActiveButton = () => {
    switch (features[activeFeature].color) {
      case "cyan":
        return "from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500";
      case "blue":
        return "from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500";
      case "purple":
        return "from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500";
      default:
        return "from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500";
    }
  };

  const getActiveText = () => {
    switch (features[activeFeature].color) {
      case "cyan":
        return "text-cyan-400";
      case "blue":
        return "text-blue-400";
      case "purple":
        return "text-purple-400";
      default:
        return "text-slate-400";
    }
  };

  return (
    <div className="relative py-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-slate-900/50" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(34, 211, 238, 0.05) 0%, transparent 50%, transparent 100%)",
        }}
      />

      <div className="relative z-10 container mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center space-y-6 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r 
            from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full text-sm"
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-300">Powered by Advanced AI</span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-bold">
            <span
              className="bg-gradient-to-r from-white via-slate-200 to-slate-300 
              bg-clip-text text-transparent"
            >
              Enterprise-Grade
            </span>
            <br />
            <span
              className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 
              bg-clip-text text-transparent"
            >
              BI Platform
            </span>
          </h2>

          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Discover the future of business intelligence with our comprehensive
            suite of AI-powered tools designed for modern enterprises.
          </p>
        </motion.div>

        {/* Product showcase grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <ProductCard
              key={feature.id}
              feature={feature}
              index={index}
              isActive={activeFeature === index}
              onActivate={() => setActiveFeature(index)}
            />
          ))}
        </div>

        {/* Featured product detail */}
        <motion.div
          className="mt-16 p-8 bg-gradient-to-br from-slate-800/40 via-slate-700/30 to-slate-800/40 
            backdrop-blur-xl border border-slate-700/50 rounded-3xl"
          key={activeFeature}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div
                  className={`p-4 bg-gradient-to-br ${getActiveIconBg()} rounded-2xl`}
                >
                  {React.createElement(features[activeFeature].icon, {
                    className: `w-10 h-10 ${getActiveIcon()}`,
                  })}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {features[activeFeature].title}
                  </h3>
                  <p className="text-slate-400">Enterprise Solution</p>
                </div>
              </div>

              <p className="text-lg text-slate-300 leading-relaxed">
                {features[activeFeature].description}
              </p>

              <div className="flex gap-4">
                <motion.button
                  className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r 
                    ${getActiveButton()} 
                    text-white font-semibold rounded-xl transition-all duration-300`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>

                <motion.button
                  className="px-6 py-3 border border-slate-600 text-slate-200 font-semibold rounded-xl 
                    hover:border-slate-500 hover:bg-slate-800/50 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Request Demo
                </motion.button>
              </div>
            </div>

            {/* Interactive demo area */}
            <div className="relative">
              <div
                className="aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
                rounded-2xl border border-slate-700/50 overflow-hidden"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <TrendingUp
                      className={`w-16 h-16 mx-auto ${getActiveIcon()}`}
                    />
                    <p className="text-slate-400">Interactive Demo</p>
                    <p className="text-sm text-slate-500">
                      Click to explore {features[activeFeature].title}
                    </p>
                  </div>
                </div>

                {/* Floating stats */}
                <div className="absolute top-4 left-4 space-y-2">
                  {features[activeFeature].stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      className="px-3 py-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 
                        rounded-lg text-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className={`font-bold ${getActiveText()}`}>
                        {stat.value}
                      </div>
                      <div className="text-slate-500 text-xs">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
