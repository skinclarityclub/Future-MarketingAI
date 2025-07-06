"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Quote,
  TrendingUp,
  Users,
  DollarSign,
  Award,
  CheckCircle,
  ArrowRight,
  PlayCircle,
  ExternalLink,
  Eye,
  Clock,
} from "lucide-react";

interface SocialProofEngineProps {
  variant?: "full" | "compact" | "inline";
  showTestimonials?: boolean;
  showMetrics?: boolean;
  showLogos?: boolean;
  showCaseStudies?: boolean;
  showNotifications?: boolean;
  autoPlay?: boolean;
  className?: string;
}

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
}

interface SuccessMetric {
  id: string;
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  gradient: string;
}

interface CaseStudy {
  id: string;
  company: string;
  logo: string;
  industry: string;
  challenge: string;
  solution: string;
  results: {
    metric: string;
    improvement: string;
    timeframe: string;
  }[];
  videoUrl?: string;
}

interface RealtimeNotification {
  id: string;
  type: "signup" | "demo" | "purchase" | "achievement";
  message: string;
  timestamp: Date;
  location?: string;
  avatar?: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "CMO",
    company: "TechFlow Solutions",
    avatar: "/avatars/sarah-chen.jpg",
    content:
      "SKC's Marketing Machine transformed our content strategy completely. We went from manual processes to full automation in just 30 days.",
    rating: 5,
    results: "340% ROI increase in 6 months",
    verified: true,
  },
  {
    id: "2",
    name: "Marcus van der Berg",
    role: "CEO",
    company: "InnovateLab",
    avatar: "/avatars/marcus-berg.jpg",
    content:
      "The AI-driven insights helped us identify our best-performing content types. Our conversion rate doubled within the first quarter.",
    rating: 5,
    results: "200% conversion rate improvement",
    verified: true,
  },
  {
    id: "3",
    name: "Jennifer Rodriguez",
    role: "Marketing Director",
    company: "GrowthTech",
    avatar: "/avatars/jennifer-rodriguez.jpg",
    content:
      "We saved 85% of our time on content creation while maintaining quality. The ROI tracking feature is incredible.",
    rating: 5,
    results: "€50k+ monthly savings",
    verified: true,
  },
  {
    id: "4",
    name: "David Kim",
    role: "Founder",
    company: "ScaleUp Ventures",
    avatar: "/avatars/david-kim.jpg",
    content:
      "Finally found a solution that grows with us. The scalability is amazing - no need to hire more people as we expand.",
    rating: 5,
    results: "500% business growth without staff increase",
    verified: true,
  },
];

const SUCCESS_METRICS: SuccessMetric[] = [
  {
    id: "roi",
    value: 340,
    label: "Average ROI Increase",
    suffix: "%",
    icon: <TrendingUp className="w-6 h-6" />,
    gradient: "from-green-500 to-emerald-600",
  },
  {
    id: "customers",
    value: 1250,
    label: "Happy Customers",
    prefix: "",
    suffix: "+",
    icon: <Users className="w-6 h-6" />,
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    id: "revenue",
    value: 50,
    label: "Monthly Impact",
    prefix: "€",
    suffix: "k+",
    icon: <DollarSign className="w-6 h-6" />,
    gradient: "from-purple-500 to-pink-600",
  },
  {
    id: "time-saved",
    value: 85,
    label: "Time Savings",
    suffix: "%",
    icon: <Clock className="w-6 h-6" />,
    gradient: "from-orange-500 to-red-600",
  },
];

const CUSTOMER_LOGOS = [
  { name: "TechFlow Solutions", logo: "/logos/techflow.svg" },
  { name: "InnovateLab", logo: "/logos/innovatelab.svg" },
  { name: "GrowthTech", logo: "/logos/growthtech.svg" },
  { name: "ScaleUp Ventures", logo: "/logos/scaleup.svg" },
  { name: "Digital Dynamics", logo: "/logos/digital-dynamics.svg" },
  { name: "FutureForward", logo: "/logos/futureforward.svg" },
  { name: "NextGen Marketing", logo: "/logos/nextgen.svg" },
  { name: "Automation Pro", logo: "/logos/autopro.svg" },
];

const CASE_STUDIES: CaseStudy[] = [
  {
    id: "techflow",
    company: "TechFlow Solutions",
    logo: "/logos/techflow.svg",
    industry: "B2B SaaS",
    challenge: "Manual content creation taking 80% of marketing team's time",
    solution: "Implemented SKC Marketing Machine with AI automation",
    results: [
      {
        metric: "Content Production",
        improvement: "+500%",
        timeframe: "3 months",
      },
      { metric: "ROI", improvement: "+340%", timeframe: "6 months" },
      { metric: "Team Efficiency", improvement: "+85%", timeframe: "1 month" },
    ],
    videoUrl: "/case-studies/techflow-success.mp4",
  },
  {
    id: "innovatelab",
    company: "InnovateLab",
    logo: "/logos/innovatelab.svg",
    industry: "Technology Consulting",
    challenge:
      "Low conversion rates and inconsistent messaging across platforms",
    solution: "AI-driven content optimization and personalization",
    results: [
      {
        metric: "Conversion Rate",
        improvement: "+200%",
        timeframe: "4 months",
      },
      { metric: "Lead Quality", improvement: "+150%", timeframe: "2 months" },
      {
        metric: "Brand Consistency",
        improvement: "+95%",
        timeframe: "6 weeks",
      },
    ],
  },
];

const generateRealtimeNotifications = (): RealtimeNotification[] => [
  {
    id: "1",
    type: "signup",
    message: "Emma from Amsterdam just signed up for a demo",
    timestamp: new Date(Date.now() - 30000),
    location: "Amsterdam, NL",
  },
  {
    id: "2",
    type: "demo",
    message: "TechCorp completed their ROI assessment",
    timestamp: new Date(Date.now() - 120000),
    location: "Rotterdam, NL",
  },
  {
    id: "3",
    type: "purchase",
    message: "ScaleUp Pro upgraded to Enterprise plan",
    timestamp: new Date(Date.now() - 300000),
    location: "Utrecht, NL",
  },
  {
    id: "4",
    type: "achievement",
    message: "GrowthTech achieved 400% ROI milestone",
    timestamp: new Date(Date.now() - 480000),
    location: "Den Haag, NL",
  },
];

// Counter animation hook
const useCountAnimation = (target: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(target * easeOutCubic));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return count;
};

// Testimonials Carousel Component
const TestimonialsCarousel: React.FC<{ testimonials: Testimonial[] }> = ({
  testimonials,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                {testimonials[currentIndex].name.charAt(0)}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < testimonials[currentIndex].rating ? "text-yellow-400 fill-current" : "text-gray-400"}`}
                    />
                  ))}
                </div>
                {testimonials[currentIndex].verified && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
              </div>

              <Quote className="w-6 h-6 text-blue-400 mb-4" />

              <p className="text-white text-lg mb-4 leading-relaxed">
                {testimonials[currentIndex].content}
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">
                    {testimonials[currentIndex].name}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {testimonials[currentIndex].role} at{" "}
                    {testimonials[currentIndex].company}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-green-400 font-bold text-sm">
                    {testimonials[currentIndex].results}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicators */}
      <div className="flex justify-center space-x-2 mt-6">
        {testimonials.map((_, index) => (
          <NormalButton
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? "bg-blue-400" : "bg-white/30"
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// Success Metrics Component
const SuccessMetrics: React.FC<{ metrics: SuccessMetric[] }> = ({
  metrics,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const animatedValue = useCountAnimation(
          isVisible ? metric.value : 0,
          2000 + index * 200
        );

        return (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className="relative">
              <div
                className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center mb-4 shadow-lg`}
              >
                <div className="text-white">{metric.icon}</div>
              </div>

              <div className="text-3xl font-bold text-white mb-2">
                {metric.prefix || ""}
                {animatedValue.toLocaleString()}
                {metric.suffix || ""}
              </div>

              <p className="text-gray-300 text-sm">{metric.label}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// Customer Logos Component
const CustomerLogos: React.FC<{ logos: typeof CUSTOMER_LOGOS }> = ({
  logos,
}) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
      <h3 className="text-center text-white/80 text-sm font-medium mb-8">
        Trusted by leading companies
      </h3>

      <div className="grid grid-cols-4 md:grid-cols-8 gap-8 items-center">
        {logos.map((logo, index) => (
          <motion.div
            key={logo.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-center"
          >
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-white/60 text-xs font-medium">
                {logo.name.substring(0, 3).toUpperCase()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Case Studies Component
const CaseStudies: React.FC<{ caseStudies: CaseStudy[] }> = ({
  caseStudies,
}) => {
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {caseStudies.map(caseStudy => (
        <motion.div
          key={caseStudy.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-colors cursor-pointer"
          onClick={() =>
            setSelectedCase(selectedCase === caseStudy.id ? null : caseStudy.id)
          }
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-white/60 text-sm font-medium">
                  {caseStudy.company.substring(0, 2).toUpperCase()}
                </span>
              </div>

              <div>
                <h4 className="text-white font-semibold">
                  {caseStudy.company}
                </h4>
                <p className="text-gray-400 text-sm">{caseStudy.industry}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {caseStudy.videoUrl && (
                <PlayCircle className="w-5 h-5 text-blue-400" />
              )}
              <ArrowRight
                className={`w-5 h-5 text-white/60 transition-transform ${
                  selectedCase === caseStudy.id ? "rotate-90" : ""
                }`}
              />
            </div>
          </div>

          <p className="text-gray-300 text-sm mb-4">
            <span className="font-medium">Challenge:</span>{" "}
            {caseStudy.challenge}
          </p>

          <AnimatePresence>
            {selectedCase === caseStudy.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <p className="text-gray-300 text-sm">
                  <span className="font-medium">Solution:</span>{" "}
                  {caseStudy.solution}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {caseStudy.results.map((result, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-lg p-4 text-center"
                    >
                      <div className="text-green-400 font-bold text-lg">
                        {result.improvement}
                      </div>
                      <div className="text-white text-sm">{result.metric}</div>
                      <div className="text-gray-400 text-xs">
                        in {result.timeframe}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

// Real-time Notifications Component
const RealtimeNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>(
    []
  );
  const [currentNotification, setCurrentNotification] =
    useState<RealtimeNotification | null>(null);

  useEffect(() => {
    const initialNotifications = generateRealtimeNotifications();
    setNotifications(initialNotifications);

    // Show first notification after 2 seconds
    const showTimer = setTimeout(() => {
      if (initialNotifications.length > 0) {
        setCurrentNotification(initialNotifications[0]);
      }
    }, 2000);

    // Auto-hide after 6 seconds
    const hideTimer = setTimeout(() => {
      setCurrentNotification(null);
    }, 8000);

    // Cycle through notifications
    const cycleTimer = setInterval(() => {
      setNotifications(prev => {
        const next = [...prev];
        const current = next.shift();
        if (current) {
          next.push({
            ...current,
            timestamp: new Date(),
          });
        }
        setCurrentNotification(next[0] || null);
        return next;
      });
    }, 12000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearInterval(cycleTimer);
    };
  }, []);

  if (!currentNotification) return null;

  const getNotificationIcon = (type: RealtimeNotification["type"]) => {
    switch (type) {
      case "signup":
        return <Users className="w-4 h-4" />;
      case "demo":
        return <Eye className="w-4 h-4" />;
      case "purchase":
        return <DollarSign className="w-4 h-4" />;
      case "achievement":
        return <Award className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: RealtimeNotification["type"]) => {
    switch (type) {
      case "signup":
        return "from-blue-500 to-cyan-500";
      case "demo":
        return "from-purple-500 to-pink-500";
      case "purchase":
        return "from-green-500 to-emerald-500";
      case "achievement":
        return "from-orange-500 to-red-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key={currentNotification.id}
        initial={{ opacity: 0, x: 100, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -100, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-white/20 max-w-sm"
      >
        <div className="flex items-start space-x-3">
          <div
            className={`w-8 h-8 rounded-full bg-gradient-to-br ${getNotificationColor(currentNotification.type)} flex items-center justify-center text-white flex-shrink-0`}
          >
            {getNotificationIcon(currentNotification.type)}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-gray-900 text-sm font-medium">
              {currentNotification.message}
            </p>

            <div className="flex items-center justify-between mt-2">
              <p className="text-gray-500 text-xs">
                {currentNotification.location}
              </p>
              <p className="text-gray-400 text-xs">
                {Math.floor(
                  (Date.now() - currentNotification.timestamp.getTime()) / 60000
                )}
                m ago
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main Social Proof Engine Component
export default function SocialProofEngine({
  variant = "full",
  showTestimonials = true,
  showMetrics = true,
  showLogos = true,
  showCaseStudies = true,
  showNotifications = true,
  autoPlay = true,
  className = "",
}: SocialProofEngineProps) {
  if (variant === "compact") {
    return (
      <div className={`space-y-8 ${className}`}>
        {showMetrics && (
          <div>
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Proven Results
            </h3>
            <SuccessMetrics metrics={SUCCESS_METRICS} />
          </div>
        )}

        {showLogos && <CustomerLogos logos={CUSTOMER_LOGOS} />}

        {showNotifications && <RealtimeNotifications />}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`flex items-center space-x-8 ${className}`}>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
            ))}
          </div>
          <span className="text-white/80 text-sm">
            4.9/5 from 1,250+ customers
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-white/80 text-sm">
            Average 340% ROI increase
          </span>
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className={`space-y-12 ${className}`}>
      {showTestimonials && (
        <div>
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            What Our Customers Say
          </h2>
          <TestimonialsCarousel testimonials={TESTIMONIALS} />
        </div>
      )}

      {showMetrics && (
        <div>
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Proven Results
          </h3>
          <SuccessMetrics metrics={SUCCESS_METRICS} />
        </div>
      )}

      {showLogos && <CustomerLogos logos={CUSTOMER_LOGOS} />}

      {showCaseStudies && (
        <div>
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Success Stories
          </h3>
          <CaseStudies caseStudies={CASE_STUDIES} />
        </div>
      )}

      {showNotifications && <RealtimeNotifications />}
    </div>
  );
}
