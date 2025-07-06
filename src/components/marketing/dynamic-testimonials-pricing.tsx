"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Star,
  Quote,
  CheckCircle,
  ArrowRight,
  Users,
  Crown,
  Rocket,
  Target,
  TrendingUp,
  Sparkles,
  Shield,
  Zap,
  Award,
  BarChart3,
  Heart,
  PlayCircle,
  ArrowUp,
  ArrowDown,
  DollarSign,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
  results: string;
  verified: boolean;
  videoUrl?: string;
  metrics: {
    roi?: string;
    leadIncrease?: string;
    timeSaved?: string;
    revenueGrowth?: string;
  };
}

interface PricingTier {
  id: string;
  name: string;
  subtitle: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  badge?: string;
  isPopular?: boolean;
  features: string[];
  benefits: string[];
  limitations?: string[];
  metrics: {
    roi: string;
    efficiency: string;
    growth: string;
  };
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Sarah van der Berg",
    role: "Marketing Director",
    company: "TechScale Amsterdam",
    avatar: "/avatars/sarah-vdb.jpg",
    content:
      "SKC's Marketing Machine heeft onze complete content strategie getransformeerd. We genereren nu 3x meer gekwalificeerde leads met de helft van de moeite.",
    rating: 5,
    results: "340% ROI verbetering in 6 maanden",
    verified: true,
    videoUrl: "/testimonials/sarah-vdb.mp4",
    metrics: {
      roi: "340%",
      leadIncrease: "+340%",
      timeSaved: "80 uur/maand",
    },
  },
  {
    id: "2",
    name: "Mark Janssen",
    role: "CEO",
    company: "GrowthCorp Rotterdam",
    avatar: "/avatars/mark-janssen.jpg",
    content:
      "De AI-gedreven inzichten hebben ons geholpen onze best presterende content types te identificeren. Onze conversie rate verdubbelde binnen het eerste kwartaal.",
    rating: 5,
    results: "200% conversie rate verbetering",
    verified: true,
    metrics: {
      roi: "200%",
      leadIncrease: "+285%",
      revenueGrowth: "€2.5M extra",
    },
  },
  {
    id: "3",
    name: "Lisa de Vries",
    role: "Head of Growth",
    company: "DataDriven Utrecht",
    avatar: "/avatars/lisa-devries.jpg",
    content:
      "We hebben 85% van onze tijd bespaard op content creatie terwijl we de kwaliteit behielden. De ROI tracking functie is ongelooflijk.",
    rating: 5,
    results: "€50K+ maandelijkse besparingen",
    verified: true,
    metrics: {
      timeSaved: "85%",
      roi: "450%",
      revenueGrowth: "€8M omzet",
    },
  },
  {
    id: "4",
    name: "David Kim",
    role: "Founder",
    company: "ScaleUp Ventures",
    avatar: "/avatars/david-kim.jpg",
    content:
      "Eindelijk een oplossing gevonden die met ons meegroeit. De schaalbaarheid is geweldig - geen behoefte om meer mensen in te huren naarmate we uitbreiden.",
    rating: 5,
    results: "500% bedrijfsgroei zonder personeelsuitbreiding",
    verified: true,
    metrics: {
      roi: "500%",
      efficiency: "+300%",
      growth: "500% zonder FTE+",
    },
  },
];

const PRICING_TIERS: PricingTier[] = [
  {
    id: "marketing-machine",
    name: "Marketing Machine",
    subtitle: "AI Content Engine",
    monthlyPrice: 15000,
    yearlyPrice: 162000, // 10% discount
    description: "AI-gedreven contentgeneratie die uw merk 24/7 versterkt",
    icon: <Rocket className="w-8 h-8" />,
    gradient: "from-purple-500 via-pink-500 to-red-500",
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
    benefits: [
      "3x meer gekwalificeerde leads",
      "80% tijd bespaard op content",
      "24/7 content automation",
      "Multi-platform bereik",
    ],
    metrics: {
      roi: "+120%",
      efficiency: "+180%",
      growth: "+250%",
    },
  },
  {
    id: "bi-dashboard",
    name: "BI Dashboard",
    subtitle: "Advanced Analytics",
    monthlyPrice: 15000,
    yearlyPrice: 162000,
    description:
      "Geavanceerde analytics die uw ideale klanten identificeert en bereikt",
    icon: <BarChart3 className="w-8 h-8" />,
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
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
    benefits: [
      "Data-driven besluitvorming",
      "360° view van performance",
      "Voorspellende analyses",
      "Custom reporting suite",
    ],
    metrics: {
      roi: "+130%",
      efficiency: "+200%",
      growth: "+180%",
    },
  },
  {
    id: "complete-growth",
    name: "Complete Growth Platform",
    subtitle: "Volledige Bundel",
    monthlyPrice: 25000,
    yearlyPrice: 270000, // €5k per month savings
    description: "Alle tools geïntegreerd voor maximale groei en efficiency",
    icon: <Crown className="w-8 h-8" />,
    gradient: "from-green-500 via-emerald-500 to-teal-500",
    badge: "€5K Besparing!",
    isPopular: true,
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
    benefits: [
      "Volledige marketing automatisering",
      "Dedicated success manager",
      "Prioriteit ondersteuning",
      "Custom integraties mogelijk",
    ],
    metrics: {
      roi: "+180%",
      efficiency: "+300%",
      growth: "+400%",
    },
  },
];

export function DynamicTestimonialsPricing() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isYearly, setIsYearly] = useState(false);
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);
  const [animationPhase, setAnimationPhase] = useState<
    "idle" | "switching" | "complete"
  >("idle");

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationPhase("switching");
      setTimeout(() => {
        setCurrentTestimonial(prev => (prev + 1) % TESTIMONIALS.length);
        setAnimationPhase("complete");
        setTimeout(() => setAnimationPhase("idle"), 500);
      }, 300);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const handleTestimonialClick = (index: number) => {
    if (index !== currentTestimonial) {
      setAnimationPhase("switching");
      setTimeout(() => {
        setCurrentTestimonial(index);
        setAnimationPhase("complete");
        setTimeout(() => setAnimationPhase("idle"), 500);
      }, 300);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getSavings = (tier: PricingTier) => {
    if (!isYearly) return null;
    const monthlyCost = tier.monthlyPrice * 12;
    const savings = monthlyCost - tier.yearlyPrice;
    return formatPrice(savings);
  };

  return (
    <div className="w-full space-y-16">
      {/* Dynamic Testimonials Section */}
      <section className="space-y-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="p-3 rounded-full bg-gradient-to-r from-orange-500/20 to-pink-500/20 backdrop-blur-sm border border-orange-500/30">
              <Quote className="h-8 w-8 text-orange-400" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Echte Resultaten van Scale-ups
            </h2>
          </motion.div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Ontdek hoe Nederlandse bedrijven hun marketing hebben
            getransformeerd
          </p>
        </div>

        {/* Main Testimonial Display */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Testimonial Cards Sidebar */}
            <div className="space-y-4">
              {TESTIMONIALS.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleTestimonialClick(index)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                    index === currentTestimonial
                      ? "bg-gradient-to-r from-orange-500/20 to-pink-500/20 border-orange-500/50"
                      : "bg-gray-800/40 border-gray-700/50 hover:border-orange-500/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        {testimonial.role}
                      </div>
                      <div className="text-xs text-orange-400">
                        {testimonial.company}
                      </div>
                    </div>
                    {testimonial.verified && (
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < testimonial.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Main Testimonial Content */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border-gray-700/50">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-4 mb-6">
                        <Quote className="w-8 h-8 text-orange-400 flex-shrink-0 mt-1" />
                        <blockquote className="text-xl text-white leading-relaxed">
                          "{TESTIMONIALS[currentTestimonial].content}"
                        </blockquote>
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <div className="font-semibold text-white text-lg">
                            {TESTIMONIALS[currentTestimonial].name}
                          </div>
                          <div className="text-gray-400">
                            {TESTIMONIALS[currentTestimonial].role} bij{" "}
                            {TESTIMONIALS[currentTestimonial].company}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold text-sm">
                            {TESTIMONIALS[currentTestimonial].results}
                          </div>
                          {TESTIMONIALS[currentTestimonial].videoUrl && (
                            <NormalButton
                              variant="secondary"
                              size="sm"
                              className="mt-2"
                            >
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Bekijk Video
                            </NormalButton>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Metrics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(
                      TESTIMONIALS[currentTestimonial].metrics
                    ).map(([key, value]) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="p-4 bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-lg border border-orange-500/20"
                      >
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-400">
                            {value}
                          </div>
                          <div className="text-sm text-gray-400 capitalize">
                            {key === "roi"
                              ? "ROI Verbetering"
                              : key === "leadIncrease"
                                ? "Lead Toename"
                                : key === "timeSaved"
                                  ? "Tijd Bespaard"
                                  : key === "revenueGrowth"
                                    ? "Omzet Groei"
                                    : key}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Tiered Pricing Section */}
      <section className="space-y-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="p-3 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm border border-green-500/30">
              <Crown className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Kies Uw Growth Platform
            </h2>
          </motion.div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Van AI content engine tot complete business intelligence - alles wat
            u nodig heeft voor scale-up groei
          </p>

          {/* Yearly/Monthly Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span
              className={`text-sm ${!isYearly ? "text-white" : "text-gray-400"}`}
            >
              Maandelijks
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-green-500"
            />
            <span
              className={`text-sm ${isYearly ? "text-white" : "text-gray-400"}`}
            >
              Jaarlijks
            </span>
            {isYearly && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Tot €60K besparing!
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {PRICING_TIERS.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onHoverStart={() => setHoveredTier(tier.id)}
                onHoverEnd={() => setHoveredTier(null)}
                className={`relative ${tier.isPopular ? "lg:-mt-4 lg:mb-4" : ""}`}
              >
                <Card
                  className={`h-full transition-all duration-300 border-2 ${
                    tier.isPopular
                      ? "bg-gradient-to-br from-green-900/60 to-blue-900/60 border-green-500/50 shadow-2xl shadow-green-500/20"
                      : hoveredTier === tier.id
                        ? "bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-blue-500/50 shadow-xl shadow-blue-500/10"
                        : "bg-gradient-to-br from-gray-900/60 to-gray-800/60 border-gray-700/50"
                  }`}
                >
                  {tier.isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1">
                        <Crown className="w-4 h-4 mr-1" />
                        Meest Populair
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div
                      className={`mx-auto p-4 rounded-full bg-gradient-to-r ${tier.gradient} bg-opacity-20 mb-4`}
                    >
                      <div className="text-white">{tier.icon}</div>
                    </div>
                    <CardTitle className="text-2xl text-white">
                      {tier.name}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {tier.subtitle}
                    </CardDescription>
                    {tier.badge && (
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 mt-2">
                        {tier.badge}
                      </Badge>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Pricing */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-4xl font-bold text-white">
                          {formatPrice(
                            isYearly ? tier.yearlyPrice / 12 : tier.monthlyPrice
                          )}
                        </span>
                        <span className="text-gray-400">/maand</span>
                      </div>
                      {isYearly && (
                        <div className="text-sm text-green-400">
                          Bespaar {getSavings(tier)} per jaar
                        </div>
                      )}
                      <p className="text-sm text-gray-400 mt-2">
                        {tier.description}
                      </p>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 bg-gray-800/40 rounded-lg">
                        <div className="text-lg font-bold text-green-400">
                          {tier.metrics.roi}
                        </div>
                        <div className="text-xs text-gray-400">ROI</div>
                      </div>
                      <div className="text-center p-2 bg-gray-800/40 rounded-lg">
                        <div className="text-lg font-bold text-blue-400">
                          {tier.metrics.efficiency}
                        </div>
                        <div className="text-xs text-gray-400">Efficiency</div>
                      </div>
                      <div className="text-center p-2 bg-gray-800/40 rounded-lg">
                        <div className="text-lg font-bold text-purple-400">
                          {tier.metrics.growth}
                        </div>
                        <div className="text-xs text-gray-400">Growth</div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Inbegrepen Features
                      </h4>
                      <ul className="space-y-2">
                        {tier.features.map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm"
                          >
                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        Key Benefits
                      </h4>
                      <ul className="space-y-2">
                        {tier.benefits.map((benefit, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Sparkles className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Button */}
                    <NormalButton
                      className={`w-full ${
                        tier.isPopular
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                          : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      } text-white font-semibold py-3`}
                    >
                      {tier.isPopular ? (
                        <>
                          <Crown className="w-4 h-4 mr-2" />
                          Start Premium Trial
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Start Free Trial
                        </>
                      )}
                    </NormalButton>

                    <div className="text-center text-xs text-gray-500">
                      30-dagen geld-terug-garantie • Geen setup kosten
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Additional Value Props */}
        <div className="text-center mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 p-4 bg-gray-800/40 rounded-lg">
              <Shield className="w-6 h-6 text-green-400" />
              <div className="text-left">
                <div className="font-medium text-white">
                  Enterprise Security
                </div>
                <div className="text-sm text-gray-400">
                  SOC2 & GDPR compliant
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-800/40 rounded-lg">
              <Heart className="w-6 h-6 text-red-400" />
              <div className="text-left">
                <div className="font-medium text-white">24/7 Support</div>
                <div className="text-sm text-gray-400">
                  Dedicated success team
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-800/40 rounded-lg">
              <Zap className="w-6 h-6 text-yellow-400" />
              <div className="text-left">
                <div className="font-medium text-white">Instant Setup</div>
                <div className="text-sm text-gray-400">Live binnen 24 uur</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
