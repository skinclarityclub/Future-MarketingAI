"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  ArrowUp,
  Sparkles,
  Check,
  Star,
} from "lucide-react";
import { useParams } from "next/navigation";
import LeadQualificationForm from "./lead-qualification-form";

// Pricing translations
const pricingTranslations = {
  en: {
    badge: "Progressive Pricing • Live Spots",
    title: "Secure Your Future",
    subtitle: "Join visionary entrepreneurs shaping the future of marketing",
    priceIncrease: "⚡ Price increases with each tier",
    billing: {
      monthly: "Monthly",
      yearly: "Yearly",
      save: "Save 2 months",
    },
    products: {
      marketingMachine: {
        name: "MarketingMachine",
        description:
          "Complete AI marketing automation platform for ambitious businesses ready to scale their growth and dominate their market.",
      },
      combo: {
        name: "Power Suite",
        description:
          "The ultimate business transformation suite combining MarketingMachine + Intelligence Hub + dedicated premium support for maximum ROI.",
      },
      dashboard: {
        name: "Intelligence Hub",
        description:
          "Advanced business intelligence and analytics dashboard for data-driven decisions that accelerate growth and maximize performance.",
      },
    },
    pricing: {
      from: "from",
      month: "/month",
      year: "/year",
      spotsRemaining: "Spots remaining",
      signedUp: "signed up",
      filled: "filled",
    },
    features: {
      included: "Included Features",
      keyBenefits: "Key Benefits",
      marketingMachine: [
        "AI Content Generation (24/7)",
        "Multi-Platform Publishing",
        "Advanced Analytics Dashboard",
        "Brand Voice Training",
        "Content Calendar Management",
        "ROI Performance Tracking",
        "Social Media Automation",
        "Email Marketing Integration",
      ],
      combo: [
        "Everything in MarketingMachine",
        "Everything in Intelligence Hub",
        "Priority Support (24/7)",
        "Custom Integrations",
        "Dedicated Account Manager",
        "Advanced API Access",
        "White-Label Options",
        "Enterprise Security",
      ],
      dashboard: [
        "Real-Time Business Analytics",
        "Custom Dashboard Builder",
        "Advanced Data Visualization",
        "Multi-Source Integration",
        "Automated Reporting",
        "Performance Benchmarking",
        "Team Collaboration Tools",
        "Export & API Access",
      ],
    },
    benefits: {
      marketingMachine: [
        "Increase content output by 300%",
        "Reduce marketing costs by 60%",
        "Improve engagement rates by 180%",
        "Save 25+ hours per week",
        "Scale without hiring",
      ],
      combo: [
        "Complete business transformation",
        "500% faster decision making",
        "Unified view of all operations",
        "Maximum ROI optimization",
        "Future-proof your business",
      ],
      dashboard: [
        "Make data-driven decisions instantly",
        "Identify opportunities 10x faster",
        "Reduce analysis time by 80%",
        "Improve forecast accuracy by 200%",
        "Connect all your tools",
      ],
    },
    cta: "Join Waitlist",
    notifications: {
      priceWarning: "Price increases to {price} after {spots} more sign-ups",
      socialProof: "{count} entrepreneurs already joined",
    },
    guarantee: {
      title: "Price Lock Guarantee",
      description:
        "Your rate is locked in permanently - no future price increases ever",
    },
  },
  nl: {
    badge: "Progressieve Prijzen • Live Plekken",
    title: "Verzeker Je Toekomst",
    subtitle:
      "Sluit je aan bij visionaire ondernemers die de toekomst van marketing vormgeven",
    priceIncrease: "⚡ Prijs stijgt per niveau",
    billing: {
      monthly: "Maandelijks",
      yearly: "Jaarlijks",
      save: "Bespaar 2 maanden",
    },
    products: {
      marketingMachine: {
        name: "MarketingMachine",
        description:
          "Complete AI marketing automatisering platform voor ambitieuze bedrijven klaar om hun groei te schalen en hun markt te domineren.",
      },
      combo: {
        name: "Power Suite",
        description:
          "De ultieme bedrijfstransformatie suite die MarketingMachine + Intelligence Hub + toegewijde premium support combineert voor maximale ROI.",
      },
      dashboard: {
        name: "Intelligence Hub",
        description:
          "Geavanceerd business intelligence en analytics dashboard voor datagedreven beslissingen die groei versnellen en prestaties maximaliseren.",
      },
    },
    pricing: {
      from: "vanaf",
      month: "/maand",
      year: "/jaar",
      spotsRemaining: "Plekken over",
      signedUp: "aangemeld",
      filled: "gevuld",
    },
    features: {
      included: "Inbegrepen Features",
      keyBenefits: "Belangrijkste Voordelen",
      marketingMachine: [
        "AI Content Generatie (24/7)",
        "Multi-Platform Publicatie",
        "Geavanceerd Analytics Dashboard",
        "Merkstem Training",
        "Content Kalender Beheer",
        "ROI Prestatie Tracking",
        "Social Media Automatisering",
        "E-mail Marketing Integratie",
      ],
      combo: [
        "Alles in MarketingMachine",
        "Alles in Intelligence Hub",
        "Prioriteit Ondersteuning (24/7)",
        "Aangepaste Integraties",
        "Toegewijde Account Manager",
        "Geavanceerde API Toegang",
        "Merk-Label Opties",
        "Zakelijke Beveiliging",
      ],
      dashboard: [
        "Real-Time Bedrijfsanalyses",
        "Aangepaste Dashboard Builder",
        "Geavanceerde Data Visualisatie",
        "Multi-Bron Integratie",
        "Geautomatiseerde Rapportage",
        "Prestatie Benchmarking",
        "Team Samenwerkingstools",
        "Export & API Toegang",
      ],
    },
    benefits: {
      marketingMachine: [
        "Verhoog content output met 300%",
        "Verlaag marketing kosten met 60%",
        "Verbeter engagement rates met 180%",
        "Bespaar 25+ uur per week",
        "Schaal zonder inhuren",
      ],
      combo: [
        "Complete bedrijfstransformatie",
        "500% snellere besluitvorming",
        "Uniforme weergave van alle operaties",
        "Maximale ROI optimalisatie",
        "Toekomstbestendig je bedrijf",
      ],
      dashboard: [
        "Neem direct datagedreven beslissingen",
        "Identificeer kansen 10x sneller",
        "Verlaag analysetijd met 80%",
        "Verbeter voorspelling nauwkeurigheid met 200%",
        "Verbind al je tools",
      ],
    },
    cta: "Sluit Aan Bij Wachtlijst",
    notifications: {
      priceWarning: "Prijs stijgt naar {price} na {spots} meer aanmeldingen",
      socialProof: "{count} ondernemers deden al mee",
    },
    guarantee: {
      title: "Prijsvergrendeling Garantie",
      description:
        "Uw tarief is permanent vastgezet - nooit meer toekomstige prijsstijgingen",
    },
  },
} as const;

// Initial pricing configuration
const PRICING_CONFIG = {
  marketingMachine: {
    name: "MarketingMachine",
    monthlyPrice: 15000,
    yearlyPrice: 150000, // 2 months free (16.67% discount)
    increment: 5000,
    spotsPerTier: 10,
    description: "", // Will be set dynamically
    roiStats: {
      roi: "+120%",
      efficiency: "+180%",
      growth: "+250%",
    },
    features: [
      "AI Content Generation Engine",
      "Multi-platform Publishing",
      "Email Marketing Automation",
      "Social Media Scheduling",
      "A/B Testing Suite",
      "Performance Analytics",
      "CRM Integration",
      "24/7 Content Optimization",
    ],
    keyBenefits: [
      "3x meer gekwalificeerde leads",
      "80% tijd bespaard op content",
      "24/7 content automation",
      "Multi-platform bereik",
    ],
    gradient: "from-slate-900/40 via-blue-900/20 to-slate-900/40",
    border: "border-blue-500/30",
    hoverGradient: "from-blue-900/60 via-blue-800/40 to-slate-900/60",
    popular: false,
    featured: false,
  },
  combo: {
    name: "Power Suite",
    monthlyPrice: 20000,
    yearlyPrice: 200000, // 2 months free (16.67% discount)
    increment: 7500,
    spotsPerTier: 10,
    description:
      "De ultieme AI-gedreven marketingoplossing voor toekomstgerichte ondernemers",
    roiStats: {
      roi: "+180%",
      efficiency: "+300%",
      growth: "+400%",
    },
    features: [
      "Marketing Machine + BI Dashboard",
      "Advanced Workflow Automation",
      "Custom Integrations",
      "Dedicated Success Manager",
      "Priority Support",
      "Custom Training Program",
      "Advanced Security",
      "White-label Options",
    ],
    keyBenefits: [
      "Volledige marketing automatisering",
      "Dedicated success manager",
      "Prioriteit ondersteuning",
      "Custom integraties mogelijk",
    ],
    gradient: "from-amber-900/40 via-yellow-900/30 to-orange-900/40",
    border: "border-yellow-500/50",
    hoverGradient: "from-yellow-900/60 via-orange-800/40 to-amber-900/60",
    popular: true,
    featured: true,
  },
  dashboard: {
    name: "Intelligence Hub",
    monthlyPrice: 10000,
    yearlyPrice: 100000, // 2 months free (16.67% discount)
    increment: 4000,
    spotsPerTier: 10,
    description: "Geavanceerde AI-analytics voor datagedreven besluitvorming",
    roiStats: {
      roi: "+130%",
      efficiency: "+200%",
      growth: "+180%",
    },
    features: [
      "Executive Dashboard",
      "Financial Intelligence",
      "Customer Analytics",
      "Marketing Attribution",
      "Predictive Analytics",
      "Custom Reports",
      "Real-time Monitoring",
      "Advanced Segmentation",
    ],
    keyBenefits: [
      "Data-driven besluitvorming",
      "360° view van performance",
      "Voorspellende analyses",
      "Custom reporting suite",
    ],
    gradient: "from-slate-900/40 via-emerald-900/20 to-slate-900/40",
    border: "border-emerald-500/30",
    hoverGradient: "from-emerald-900/60 via-emerald-800/40 to-slate-900/60",
    popular: false,
    featured: false,
  },
};

// Mock data - 3 potential clients for each product
const MOCK_SIGNUP_DATA = {
  marketingMachine: { signups: 3, spotsThisTier: 7 },
  combo: { signups: 3, spotsThisTier: 7 },
  dashboard: { signups: 3, spotsThisTier: 7 },
};

const formatEuro = (amount: number) => {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const PricingCard: React.FC<{
  productKey: keyof typeof PRICING_CONFIG;
  currentMonthlyPrice: number;
  currentYearlyPrice: number;
  spotsRemaining: number;
  nextMonthlyPrice: number;
  signupCount: number;
  isYearly: boolean;
  onJoinWaitlist: (product: string) => void;
}> = ({
  productKey,
  currentMonthlyPrice,
  currentYearlyPrice,
  spotsRemaining,
  nextMonthlyPrice,
  signupCount,
  isYearly,
  onJoinWaitlist,
}) => {
  const config = PRICING_CONFIG[productKey];
  const params = useParams();
  const locale = (
    params?.locale === "nl" ? "nl" : "en"
  ) as keyof typeof pricingTranslations;
  const t = pricingTranslations[locale];

  // Helper function to get translated features
  const getFeatures = () => {
    return t.features[productKey] || config.features;
  };

  // Helper function to get translated benefits
  const getBenefits = () => {
    return t.benefits[productKey] || config.keyBenefits;
  };
  const priceIncrease = nextMonthlyPrice - currentMonthlyPrice;
  const tierProgress = Math.max(
    0,
    Math.min(
      100,
      ((config.spotsPerTier - spotsRemaining) / config.spotsPerTier) * 100
    )
  );
  const yearlyDiscount = Math.round(
    ((currentMonthlyPrice * 12 - currentYearlyPrice) /
      (currentMonthlyPrice * 12)) *
      100
  );

  const displayPrice = isYearly ? currentYearlyPrice : currentMonthlyPrice;
  const nextDisplayPrice = isYearly ? nextMonthlyPrice * 10 : nextMonthlyPrice; // Yearly increment approximation

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative group ${config.featured ? "scale-105 z-10" : ""}`}
    >
      {/* Glass morphism card with hover effects */}
      <div
        className={`
        relative backdrop-blur-xl bg-gradient-to-br ${config.gradient}
        border ${config.border} rounded-2xl overflow-hidden
        shadow-2xl shadow-black/20
        transition-all duration-500 ease-out
        hover:bg-gradient-to-br hover:${config.hoverGradient}
        hover:shadow-3xl hover:shadow-black/40
        hover:border-opacity-80
        hover:-translate-y-2
        ${config.featured ? "ring-2 ring-yellow-500/30 hover:ring-yellow-400/50" : "hover:ring-2 hover:ring-white/20"}
      `}
      >
        {/* Holographic overlay effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Content */}
        <div className="relative p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h3
              className={`${config.featured ? "text-2xl" : "text-xl"} font-bold text-white mb-3`}
            >
              {t.products[productKey].name}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              {t.products[productKey].description}
            </p>

            {/* ROI Statistics */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">
                  {config.roiStats.roi}
                </div>
                <div className="text-xs text-slate-400">ROI</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">
                  {config.roiStats.efficiency}
                </div>
                <div className="text-xs text-slate-400">Efficiency</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">
                  {config.roiStats.growth}
                </div>
                <div className="text-xs text-slate-400">Growth</div>
              </div>
            </div>
          </div>

          {/* Current Price */}
          <div className="text-center mb-6">
            <motion.div
              key={displayPrice}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className={`${config.featured ? "text-4xl" : "text-3xl"} font-black text-white mb-2`}
            >
              {formatEuro(displayPrice)}
            </motion.div>
            <p className="text-slate-400 text-sm">
              {isYearly ? t.pricing.year : t.pricing.month}
            </p>

            {config.featured && isYearly && (
              <div className="mt-2">
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                  💰 Save{" "}
                  {formatEuro(currentMonthlyPrice * 12 - currentYearlyPrice)}{" "}
                  per year
                </span>
              </div>
            )}
          </div>

          {/* Availability Info */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-slate-300">{t.pricing.spotsRemaining}</span>
              <span
                className={`font-bold ${spotsRemaining <= 3 ? "text-red-400" : "text-white"}`}
              >
                {spotsRemaining}
              </span>
            </div>

            {/* Progress bar - highly visible */}
            <div className="w-full bg-slate-800 rounded-full h-4 mb-4 border border-slate-600/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(30, tierProgress)}%` }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                className={`h-4 rounded-full relative overflow-hidden ${
                  config.featured
                    ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
                    : spotsRemaining <= 3
                      ? "bg-gradient-to-r from-red-500 to-pink-500"
                      : "bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600"
                }`}
                style={{ minWidth: "30%" }}
              >
                {/* Animated shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-pulse" />
                {/* Glow effect */}
                <div
                  className={`absolute inset-0 ${
                    config.featured
                      ? "shadow-lg shadow-yellow-500/50"
                      : "shadow-lg shadow-blue-500/50"
                  }`}
                />
              </motion.div>
            </div>

            {/* Progress text */}
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>
                {signupCount} {t.pricing.signedUp}
              </span>
              <span>
                {Math.max(30, tierProgress).toFixed(0)}% {t.pricing.filled}
              </span>
            </div>

            {/* Price increase warning */}
            {priceIncrease > 0 && (
              <div className="text-center p-3 bg-red-900/20 border border-red-500/30 rounded-lg mb-4">
                <div className="text-red-400 text-xs flex items-center justify-center gap-1">
                  <ArrowUp className="w-3 h-3" />
                  {t.notifications.priceWarning
                    .replace("{price}", formatEuro(nextDisplayPrice))
                    .replace("{spots}", spotsRemaining.toString())}
                </div>
              </div>
            )}
          </div>

          {/* Inbegrepen Features */}
          <div className="mb-6">
            <h4 className="flex items-center text-white font-semibold mb-3 text-sm">
              <Check className="w-4 h-4 text-green-400 mr-2" />
              {t.features.included}
            </h4>
            <div className="space-y-2">
              {getFeatures().map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start text-sm text-slate-300"
                >
                  <Check className="w-3 h-3 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Benefits */}
          <div className="mb-6">
            <h4 className="flex items-center text-yellow-400 font-semibold mb-3 text-sm">
              <Sparkles className="w-4 h-4 text-yellow-400 mr-2" />
              {t.features.keyBenefits}
            </h4>
            <div className="space-y-2">
              {getBenefits().map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start text-sm text-slate-300"
                >
                  <Sparkles className="w-3 h-3 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social proof */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center text-slate-400 text-xs gap-2">
              <Users className="w-4 h-4" />
              {t.notifications.socialProof.replace(
                "{count}",
                signupCount.toString()
              )}
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => onJoinWaitlist(productKey)}
            className={`
              w-full py-4 px-6 rounded-xl font-semibold text-white
              bg-gradient-to-r ${config.featured ? "from-yellow-500 to-orange-500" : "from-blue-500 to-purple-600"}
              hover:opacity-90 transition-all duration-300
              transform hover:scale-[1.02] active:scale-[0.98]
              shadow-lg shadow-black/25 relative overflow-hidden
              ${config.featured ? "text-lg ring-2 ring-yellow-500/30" : "text-base"}
            `}
          >
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Users className="w-5 h-5 inline-block mr-2" />
            {t.cta}
          </button>
        </div>

        {/* Glass morphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-2xl" />
      </div>
    </motion.div>
  );
};

export const ProgressivePricingDisplay: React.FC = () => {
  const [signupCounts, setSignupCounts] = useState(MOCK_SIGNUP_DATA);
  const [isYearly, setIsYearly] = useState(false);
  const [showQualificationForm, setShowQualificationForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");

  const params = useParams();
  const locale = (
    params?.locale === "nl" ? "nl" : "en"
  ) as keyof typeof pricingTranslations;
  const t = pricingTranslations[locale];

  const getCurrentMonthlyPrice = (productKey: keyof typeof PRICING_CONFIG) => {
    const config = PRICING_CONFIG[productKey];
    const tiersPassed = Math.floor(
      signupCounts[productKey].signups / config.spotsPerTier
    );
    return config.monthlyPrice + tiersPassed * config.increment;
  };

  const getCurrentYearlyPrice = (productKey: keyof typeof PRICING_CONFIG) => {
    const config = PRICING_CONFIG[productKey];
    const tiersPassed = Math.floor(
      signupCounts[productKey].signups / config.spotsPerTier
    );
    return config.yearlyPrice + tiersPassed * config.increment * 10; // Yearly increment
  };

  const getSpotsRemaining = (productKey: keyof typeof PRICING_CONFIG) => {
    const config = PRICING_CONFIG[productKey];
    const currentTierSignups =
      signupCounts[productKey].signups % config.spotsPerTier;
    return config.spotsPerTier - currentTierSignups;
  };

  const getNextMonthlyPrice = (productKey: keyof typeof PRICING_CONFIG) => {
    const currentPrice = getCurrentMonthlyPrice(productKey);
    return currentPrice + PRICING_CONFIG[productKey].increment;
  };

  const handleJoinWaitlist = (product: string) => {
    setSelectedProduct(product);
    setShowQualificationForm(true);
  };

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
            source: "progressive_pricing_waitlist",
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update signup count for visual feedback
        const productKey = selectedProduct as keyof typeof MOCK_SIGNUP_DATA;
        if (productKey in signupCounts) {
          setSignupCounts(prev => ({
            ...prev,
            [productKey]: {
              ...prev[productKey],
              signups: prev[productKey].signups + 1,
            },
          }));
        }

        // Close form
        setShowQualificationForm(false);

        // Show success notification (could be enhanced with toast)
        alert(
          `Thank you for joining the ${PRICING_CONFIG[productKey]?.name || selectedProduct} waitlist! We'll be in touch soon.`
        );
      }
    } catch (error) {
      console.error("Error submitting qualification form:", error);
      alert(
        "There was an error submitting your information. Please try again."
      );
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-24 px-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:32px_32px] animate-pulse" />

        {/* Floating orbs with movement */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20"
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-800/40 to-purple-700/30 border border-blue-500/20 rounded-lg sm:rounded-xl md:rounded-2xl backdrop-blur-sm mb-4 sm:mb-6 md:mb-8">
            <TrendingUp
              className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-400"
              aria-hidden="true"
            />
            <span className="text-blue-300 font-medium text-xs sm:text-sm">
              {t.badge}
            </span>
            <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extralight leading-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 sm:mb-6 md:mb-8 px-2 sm:px-4">
            {t.title}
          </h2>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed px-2 sm:px-4 mb-6 sm:mb-8 md:mb-12">
            {t.subtitle}
            <br />
            <span className="text-yellow-400 font-medium">
              {t.priceIncrease}
            </span>
          </p>

          {/* Central Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span
              className={`text-lg font-medium transition-colors ${!isYearly ? "text-white" : "text-slate-400"}`}
            >
              {t.billing.monthly}
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              aria-label={`Switch to ${isYearly ? "monthly" : "yearly"} billing`}
              className={`
                relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900
                ${isYearly ? "bg-gradient-to-r from-blue-600 to-purple-600" : "bg-slate-600"}
              `}
            >
              <span
                className={`
                  inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-lg
                  ${isYearly ? "translate-x-9" : "translate-x-1"}
                `}
              />
            </button>
            <span
              className={`text-lg font-medium transition-colors ${isYearly ? "text-white" : "text-slate-400"}`}
            >
              {t.billing.yearly}
            </span>
            {isYearly && (
              <span className="ml-2 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-black text-sm font-bold rounded-full">
                {t.billing.save}
              </span>
            )}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* MarketingMachine */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <PricingCard
              productKey="marketingMachine"
              currentMonthlyPrice={getCurrentMonthlyPrice("marketingMachine")}
              currentYearlyPrice={getCurrentYearlyPrice("marketingMachine")}
              spotsRemaining={getSpotsRemaining("marketingMachine")}
              nextMonthlyPrice={getNextMonthlyPrice("marketingMachine")}
              signupCount={signupCounts.marketingMachine.signups}
              isYearly={isYearly}
              onJoinWaitlist={handleJoinWaitlist}
            />
          </motion.div>

          {/* Complete Suite - Featured */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <PricingCard
              productKey="combo"
              currentMonthlyPrice={getCurrentMonthlyPrice("combo")}
              currentYearlyPrice={getCurrentYearlyPrice("combo")}
              spotsRemaining={getSpotsRemaining("combo")}
              nextMonthlyPrice={getNextMonthlyPrice("combo")}
              signupCount={signupCounts.combo.signups}
              isYearly={isYearly}
              onJoinWaitlist={handleJoinWaitlist}
            />
          </motion.div>

          {/* BI Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <PricingCard
              productKey="dashboard"
              currentMonthlyPrice={getCurrentMonthlyPrice("dashboard")}
              currentYearlyPrice={getCurrentYearlyPrice("dashboard")}
              spotsRemaining={getSpotsRemaining("dashboard")}
              nextMonthlyPrice={getNextMonthlyPrice("dashboard")}
              signupCount={signupCounts.dashboard.signups}
              isYearly={isYearly}
              onJoinWaitlist={handleJoinWaitlist}
            />
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-2xl mx-auto">
            <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t.guarantee.title}
            </h3>
            <p className="text-slate-300 leading-relaxed">
              {t.guarantee.description}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Lead Qualification Form Modal */}
      <LeadQualificationForm
        isOpen={showQualificationForm}
        onClose={() => setShowQualificationForm(false)}
        onSubmit={handleQualificationSubmit}
        product={selectedProduct}
      />
    </div>
  );
};
