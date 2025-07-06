"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  Play,
  Zap,
  Bot,
  Brain,
  Calendar,
  BarChart3,
  Settings,
  Clock,
  Users,
} from "lucide-react";
import NormalButton from "@/components/ui/normal-button";
import LeadQualificationForm from "@/components/marketing/lead-qualification-form";

// Get locale from URL or use default
const useCurrentLocale = () => {
  const [locale, setLocale] = useState<"en" | "nl">("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      const localeFromPath = pathname.startsWith("/nl") ? "nl" : "en";
      setLocale(localeFromPath);
    }
  }, []);

  return locale;
};

// Fixed positions to prevent hydration mismatch
const NEURAL_NODES = [
  { x: 93.38, y: 40.68 },
  { x: 70.07, y: 50.82 },
  { x: 31.68, y: 28.83 },
  { x: 71.44, y: 2.63 },
  { x: 4.61, y: 23.71 },
  { x: 84.47, y: 7.66 },
  { x: 29.16, y: 47.8 },
  { x: 98.19, y: 87.97 },
  { x: 11.9, y: 58.98 },
  { x: 70.58, y: 18.82 },
  { x: 56.53, y: 18.15 },
  { x: 30.93, y: 92.44 },
];

const PARTICLE_POSITIONS = [
  { x: 14.58, y: 14.98, size: 4.58 },
  { x: 74.99, y: 2.8, size: 1.1 },
  { x: 69.14, y: 61.05, size: 3.58 },
  { x: 82.4, y: 55.2, size: 4.29 },
  { x: 71.34, y: 39.42, size: 2.77 },
  { x: 42.54, y: 31.28, size: 3.25 },
  { x: 17.99, y: 97.19, size: 1.42 },
  { x: 81.78, y: 42.08, size: 3.19 },
  { x: 26.33, y: 95.51, size: 2.22 },
  { x: 92.36, y: 20.77, size: 2.63 },
  { x: 41.39, y: 56.8, size: 2.63 },
  { x: 3.61, y: 80.42, size: 2.99 },
  { x: 16.44, y: 16.6, size: 2.02 },
  { x: 26.78, y: 54.11, size: 2.86 },
  { x: 46.53, y: 21.19, size: 4.18 },
  { x: 71.54, y: 26.13, size: 1.24 },
  { x: 53.57, y: 77.37, size: 1.98 },
  { x: 98.26, y: 57.87, size: 4.3 },
  { x: 13.28, y: 15.85, size: 2.34 },
  { x: 47.18, y: 92.42, size: 4.7 },
  { x: 42.55, y: 76.8, size: 4.17 },
  { x: 71.07, y: 46.02, size: 4.9 },
  { x: 47.68, y: 29.54, size: 2.96 },
  { x: 11.98, y: 65.11, size: 1.38 },
  { x: 78.58, y: 86.42, size: 3.5 },
  { x: 27.63, y: 66.8, size: 2.09 },
  { x: 54.48, y: 95.44, size: 3.1 },
  { x: 45.3, y: 1.29, size: 3.1 },
  { x: 25.43, y: 84.01, size: 2.59 },
  { x: 27.48, y: 79.76, size: 2.98 },
  { x: 72.94, y: 91.25, size: 2.99 },
  { x: 65.45, y: 71.01, size: 4.24 },
  { x: 88.96, y: 32.46, size: 4.07 },
  { x: 94.87, y: 85.7, size: 1.91 },
  { x: 5.41, y: 69.62, size: 2.88 },
  { x: 77.01, y: 58.6, size: 4.96 },
  { x: 52.43, y: 48.46, size: 2.69 },
  { x: 42.03, y: 11.38, size: 1.82 },
  { x: 31.86, y: 23.15, size: 2.42 },
  { x: 52.28, y: 48.67, size: 2.74 },
  { x: 87.78, y: 49.1, size: 2.98 },
  { x: 37.83, y: 3.56, size: 1.9 },
  { x: 18.74, y: 15.96, size: 4.81 },
  { x: 1.68, y: 62.39, size: 4.5 },
  { x: 34.82, y: 90.63, size: 3.68 },
  { x: 45.61, y: 48.21, size: 1.71 },
  { x: 51.32, y: 39.9, size: 1.52 },
  { x: 68.11, y: 13.78, size: 3.66 },
  { x: 79.43, y: 86.62, size: 1.93 },
  { x: 51.24, y: 42.35, size: 2.76 },
];

// Hardcoded translations
const translations = {
  en: {
    badge: "Next-Gen AI Marketing",
    mainHeadline: "Turn content into growth.",
    subHeadline: "On autopilot.",
    description:
      "Revolutionary AI-powered marketing automation that transforms premium businesses into market leaders. Experience enterprise-grade intelligent marketing designed for ambitious growth.",
    cta: {
      primary: "Join Waitlist",
      secondary: "Watch Demo",
    },
    features: {
      title: "Why Leading Companies Choose Our Platform",
      subtitle:
        "Discover the AI-powered capabilities that drive extraordinary results",
      items: [
        {
          icon: "Bot",
          title: "AI Content Generation",
          description:
            "Enterprise-grade AI die 24/7 hoogwaardige content genereert en optimaliseert voor maximale ROI en merkimpact.",
        },
        {
          icon: "Settings",
          title: "Smart Automation",
          description:
            "Volledig geautomatiseerde workflows die uw marketing processen optimaliseren zonder handmatige interventie.",
        },
        {
          icon: "BarChart3",
          title: "Growth Analytics",
          description:
            "Geavanceerde business intelligence die real-time inzichten levert en toekomstige trends voorspelt.",
        },
        {
          icon: "Clock",
          title: "24/7 Optimization",
          description:
            "Continue optimalisatie die nooit stopt, met machine learning die leert van elke interactie.",
        },
      ],
    },
    ctaSection: {
      title: "Ready to Transform Your Business?",
      subtitle:
        "Schedule a strategic consultation to discover how our AI platform can accelerate your growth",
      buttonText: "Book Strategy Meeting",
      urgency: "Limited slots available - Q1 2025",
    },
  },
  nl: {
    badge: "Volgende Generatie AI Marketing",
    mainHeadline: "Turn content into growth.",
    subHeadline: "On autopilot.",
    description:
      "Revolutionaire AI-gestuurde marketing automatisering die premium bedrijven transformeert naar marktleiders. Ervaar enterprise-grade intelligente marketing ontworpen voor ambitieuze groei.",
    cta: {
      primary: "Join Waitlist",
      secondary: "Bekijk Demo",
    },
    features: {
      title: "Waarom Top Bedrijven Ons Platform Kiezen",
      subtitle:
        "Ontdek de AI-gestuurde mogelijkheden die buitengewone resultaten leveren",
      items: [
        {
          icon: "Bot",
          title: "AI Content Generatie",
          description:
            "Enterprise-grade AI die 24/7 hoogwaardige content genereert en optimaliseert voor maximale ROI en merkimpact.",
        },
        {
          icon: "Settings",
          title: "Slimme Automatisering",
          description:
            "Volledig geautomatiseerde workflows die uw marketing processen optimaliseren zonder handmatige interventie.",
        },
        {
          icon: "BarChart3",
          title: "Groei Analytics",
          description:
            "Geavanceerde business intelligence die real-time inzichten levert en toekomstige trends voorspelt.",
        },
        {
          icon: "Clock",
          title: "24/7 Optimalisatie",
          description:
            "Continue optimalisatie die nooit stopt, met machine learning die leert van elke interactie.",
        },
      ],
    },
    ctaSection: {
      title: "Klaar om Uw Bedrijf te Transformeren?",
      subtitle:
        "Plan een strategische consultatie om te ontdekken hoe ons AI-platform uw groei kan versnellen",
      buttonText: "Boek Strategy Meeting",
      urgency: "Beperkte beschikbaarheid - Q1 2025",
    },
  },
};

// Neural Network Component
const NeuralNetwork: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="absolute inset-0 opacity-30" />; // Placeholder
  }

  return (
    <div className="absolute inset-0 opacity-30">
      <svg className="w-full h-full">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.7" />
          </radialGradient>
        </defs>

        {/* Render connections */}
        {NEURAL_NODES.map((node, i) =>
          NEURAL_NODES.slice(i + 1).map((targetNode, j) => (
            <motion.line
              key={`${i}-${j}`}
              x1={`${node.x}%`}
              y1={`${node.y}%`}
              x2={`${targetNode.x}%`}
              y2={`${targetNode.y}%`}
              stroke="url(#gradient)"
              strokeWidth="1"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 0.3, pathLength: 1 }}
              transition={{
                duration: 2,
                delay: i * 0.1 + j * 0.05,
                ease: "easeInOut",
              }}
            />
          ))
        )}

        {/* Render nodes */}
        {NEURAL_NODES.map((node, i) => (
          <motion.circle
            key={i}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r="3"
            fill="url(#nodeGradient)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.8,
              delay: i * 0.1,
              ease: "easeOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
};

// Holographic Grid Component
const HolographicGrid: React.FC = () => (
  <div className="absolute inset-0 opacity-20">
    <div
      className="w-full h-full"
      style={{
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
      }}
    />
  </div>
);

// Floating Particles Component
const FloatingParticles: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="absolute inset-0" />; // Placeholder
  }

  return (
    <div className="absolute inset-0">
      {PARTICLE_POSITIONS.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute bg-blue-400/20 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [-10, 10, -10],
            x: [-5, 5, -5],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 4 + (i % 3),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
};

// Gradient Orbs Component
const GradientOrbs: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden">
    <motion.div
      className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full"
      style={{
        background:
          "radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)",
      }}
      animate={{
        scale: [1, 1.2, 1],
        rotate: [360, 0],
      }}
      transition={{
        duration: 25,
        repeat: Infinity,
        ease: "linear",
      }}
    />
    <motion.div
      className="absolute top-3/4 left-3/4 w-48 h-48 rounded-full"
      style={{
        background:
          "radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, transparent 70%)",
      }}
      animate={{
        scale: [1, 1.3, 1],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  </div>
);

const getFeatureIcon = (iconName: string) => {
  const iconMap: {
    [key: string]: React.ComponentType<{ className?: string }>;
  } = {
    Bot,
    Settings,
    BarChart3,
    Clock,
  };
  const IconComponent = iconMap[iconName];
  return IconComponent ? (
    <IconComponent className="h-8 w-8" />
  ) : (
    <Bot className="h-8 w-8" />
  );
};

export const FutureMarketingAIHero: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const controls = useAnimation();
  const locale = useCurrentLocale();
  const t = translations[locale];

  // Waitlist functionality state
  const [showQualificationForm, setShowQualificationForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("hero_waitlist");

  // Handle waitlist signup
  const handleJoinWaitlist = () => {
    setSelectedProduct("hero_waitlist");
    setShowQualificationForm(true);
  };

  // Handle form submission
  const handleQualificationSubmit = async (data: any) => {
    try {
      // Submit to API
      const response = await fetch("/api/integration/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "trigger_capture",
          trigger: "waitlist_signup",
          leadData: {
            ...data,
            product: selectedProduct,
            timestamp: new Date().toISOString(),
            source: "hero_waitlist",
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Close form
        setShowQualificationForm(false);

        // Show success notification
        alert(`Thank you for joining our waitlist! We'll be in touch soon.`);
      }
    } catch (error) {
      console.error("Error submitting qualification form:", error);
      alert(
        "There was an error submitting your information. Please try again."
      );
    }
  };

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900"
    >
      {/* Background Effects */}
      <HolographicGrid />
      <NeuralNetwork />
      <FloatingParticles />
      <GradientOrbs />

      {/* Main Hero Content */}
      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-6 py-20"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {/* Badge */}
        <motion.div
          className="flex justify-center mb-8"
          variants={itemVariants}
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium">{t.badge}</span>
            <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.div
          className="text-center mb-6 md:mb-8"
          variants={itemVariants}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-black mb-4">
            <motion.span
              className="block bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              {t.mainHeadline}
            </motion.span>
            <motion.span
              className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {t.subHeadline}
            </motion.span>
          </h1>
        </motion.div>

        {/* Description */}
        <motion.p
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 text-center max-w-4xl mx-auto mb-8 md:mb-12 leading-relaxed px-4"
          variants={itemVariants}
        >
          {t.description}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center mb-16 md:mb-20 px-4"
          variants={itemVariants}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <NormalButton
              size="lg"
              onClick={handleJoinWaitlist}
              className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-xl shadow-2xl transition-all duration-300 w-full sm:w-auto"
            >
              <Users className="mr-2 h-4 w-4 md:h-5 md:w-5 group-hover:rotate-12 transition-transform" />
              {t.cta.primary}
            </NormalButton>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <NormalButton
              variant="outline"
              size="lg"
              className="group bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-xl transition-all duration-300 w-full sm:w-auto"
            >
              <Play className="mr-2 h-4 w-4 md:h-5 md:w-5 group-hover:scale-110 transition-transform" />
              {t.cta.secondary}
            </NormalButton>
          </motion.div>
        </motion.div>

        {/* Floating Icons */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-10 text-blue-400"
            animate={{
              y: [-20, 20, -20],
              rotate: [0, 360],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Bot className="h-8 w-8" />
          </motion.div>

          <motion.div
            className="absolute top-1/3 right-16 text-purple-400"
            animate={{
              y: [20, -20, 20],
              rotate: [360, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Brain className="h-10 w-10" />
          </motion.div>

          <motion.div
            className="absolute bottom-1/4 left-1/4 text-cyan-400"
            animate={{
              y: [-15, 15, -15],
              x: [-10, 10, -10],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <TrendingUp className="h-6 w-6" />
          </motion.div>

          <motion.div
            className="absolute bottom-1/3 right-1/4 text-green-400"
            animate={{
              y: [10, -10, 10],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Zap className="h-7 w-7" />
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-6 pb-20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t.features.title}
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            {t.features.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {t.features.items.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group relative"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.2, duration: 0.8 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer h-full">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg group-hover:shadow-xl transition-shadow">
                    {getFeatureIcon(feature.icon)}
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-blue-100 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t.ctaSection.title}
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t.ctaSection.subtitle}
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <NormalButton
              size="lg"
              className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
            >
              <Calendar className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
              {t.ctaSection.buttonText}
            </NormalButton>
          </motion.div>

          <p className="text-sm text-blue-300 mt-4">{t.ctaSection.urgency}</p>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 1 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1 h-3 bg-white rounded-full mt-2"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>

      {/* Lead Qualification Form Modal */}
      <LeadQualificationForm
        isOpen={showQualificationForm}
        onClose={() => setShowQualificationForm(false)}
        onSubmit={handleQualificationSubmit}
        product={selectedProduct}
      />
    </section>
  );
};
