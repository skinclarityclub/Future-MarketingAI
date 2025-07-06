"use client";

import React, { useState, useEffect, useReducer } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  Play,
  LogIn,
  TrendingUp,
  BarChart3,
  Globe,
  Building2,
  Search,
  PenTool,
  Send,
  Brain,
  Target,
  Eye,
  Zap,
  Sparkles,
  MessageSquare,
  Calendar,
  BookOpen,
  Users,
  ArrowRight,
} from "lucide-react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { cn } from "@/lib/utils";

interface ImprovedMarketingHeaderProps {
  onAuthModalOpen?: (type: "login" | "signup") => void;
  className?: string;
}

// Consolidated dropdown state management
type DropdownState = {
  platform: boolean;
  dashboards: boolean;
  resources: boolean;
  mobile: boolean;
};

type DropdownAction =
  | { type: "TOGGLE_DROPDOWN"; dropdown: keyof Omit<DropdownState, "mobile"> }
  | { type: "CLOSE_ALL_DROPDOWNS" }
  | { type: "TOGGLE_MOBILE_MENU" }
  | { type: "CLOSE_MOBILE_MENU" };

const dropdownReducer = (
  state: DropdownState,
  action: DropdownAction
): DropdownState => {
  switch (action.type) {
    case "TOGGLE_DROPDOWN":
      return {
        ...state,
        platform: action.dropdown === "platform" ? !state.platform : false,
        dashboards:
          action.dropdown === "dashboards" ? !state.dashboards : false,
        resources: action.dropdown === "resources" ? !state.resources : false,
      };
    case "CLOSE_ALL_DROPDOWNS":
      return {
        ...state,
        platform: false,
        dashboards: false,
        resources: false,
      };
    case "TOGGLE_MOBILE_MENU":
      return {
        ...state,
        mobile: !state.mobile,
        // Close all dropdowns when opening mobile menu
        platform: false,
        dashboards: false,
        resources: false,
      };
    case "CLOSE_MOBILE_MENU":
      return {
        ...state,
        mobile: false,
      };
    default:
      return state;
  }
};

// Enhanced navigation structure following Research → Content Creation → Publishing → Analytics workflow
const mainNavItems = [
  {
    label: "MarketingMachine",
    href: "#",
    hasDropdown: true,
    ariaLabel: "MarketingMachine AI features and tools",
    dropdownItems: [
      // Research Phase
      {
        icon: Search,
        title: "AI Research Assistant",
        description: "Intelligent market research en competitor analysis",
        href: "/nl/ai-features/research-assistant",
        category: "Research",
        badge: "NEW",
        badgeColor: "bg-green-500",
      },
      {
        icon: Brain,
        title: "Trend Intelligence",
        description: "AI-powered trend detection en market insights",
        href: "/nl/ai-features/trend-intelligence",
        category: "Research",
        badge: "BETA",
        badgeColor: "bg-orange-500",
      },
      {
        icon: Eye,
        title: "Customer Intelligence",
        description: "Deep audience analysis en behavioral insights",
        href: "/nl/customer-intelligence-info",
        category: "Research",
      },
      // Content Creation Phase
      {
        icon: PenTool,
        title: "AI Content Creator",
        description: "Automated content generation en optimization",
        href: "/nl/ai-features/content-creator",
        category: "Content Creation",
        badge: "PREMIUM",
        badgeColor: "bg-purple-500",
      },
      {
        icon: Sparkles,
        title: "Creative AI Studio",
        description: "AI-powered creative asset generation",
        href: "/nl/ai-features/creative-studio",
        category: "Content Creation",
        badge: "NEW",
        badgeColor: "bg-green-500",
      },
      {
        icon: MessageSquare,
        title: "AI Copywriter",
        description: "Premium copywriting met AI-assistentie",
        href: "/nl/ai-features/copywriter",
        category: "Content Creation",
      },
      // Publishing Phase
      {
        icon: Send,
        title: "Multi-Channel Publisher",
        description: "Automated publishing across alle platforms",
        href: "/nl/ai-features/publisher",
        category: "Publishing",
      },
      {
        icon: Calendar,
        title: "Smart Scheduler",
        description: "AI-optimized timing en scheduling",
        href: "/nl/ai-features/scheduler",
        category: "Publishing",
        badge: "BETA",
        badgeColor: "bg-orange-500",
      },
      {
        icon: Target,
        title: "Audience Targeting",
        description: "Precision targeting met AI algorithms",
        href: "/nl/ai-features/targeting",
        category: "Publishing",
        badge: "PREMIUM",
        badgeColor: "bg-purple-500",
      },
    ],
  },
  {
    label: "Intelligence Hub",
    href: "#",
    hasDropdown: true,
    ariaLabel: "Business Intelligence dashboards and analytics",
    dropdownItems: [
      // Analytics Phase
      {
        icon: BarChart3,
        title: "Executive Dashboard",
        description: "Strategic overview en real-time KPI's",
        href: "/nl/dashboards/executive",
        category: "Analytics",
      },
      {
        icon: TrendingUp,
        title: "Marketing Analytics",
        description: "Advanced marketing performance metrics",
        href: "/nl/dashboards/marketing-analytics",
        category: "Analytics",
        badge: "NEW",
        badgeColor: "bg-green-500",
      },
      {
        icon: Building2,
        title: "Financial Intelligence",
        description: "Revenue analytics en financial forecasting",
        href: "/nl/dashboards/financial-intelligence",
        category: "Analytics",
      },
      {
        icon: Globe,
        title: "Market Research Hub",
        description: "Comprehensive market intelligence platform",
        href: "/nl/dashboards/market-research",
        category: "Analytics",
        badge: "BETA",
        badgeColor: "bg-orange-500",
      },
      {
        icon: Zap,
        title: "Command Center",
        description: "Ultimate marketing operations control",
        href: "/nl/dashboards/command-center",
        category: "Management",
        badge: "LIVE",
        badgeColor: "bg-cyan-500",
      },
    ],
  },
  {
    label: "Investment",
    href: "/pricing",
    ariaLabel: "View pricing and investment options",
  },
  {
    label: "Resources",
    href: "#",
    hasDropdown: true,
    ariaLabel: "Educational resources and support",
    dropdownItems: [
      {
        icon: Play,
        title: "Live Demo",
        description: "Interactive platform demonstration",
        href: "/demo",
        badge: "FREE",
        badgeColor: "bg-blue-500",
      },
      {
        icon: Users,
        title: "Success Stories",
        description: "Real client results en case studies",
        href: "/case-studies",
      },
      {
        icon: BookOpen,
        title: "AI Implementation Guide",
        description: "Complete setup en optimization guides",
        href: "/documentation",
        badge: "NEW",
        badgeColor: "bg-green-500",
      },
      {
        icon: MessageSquare,
        title: "Expert Consultation",
        description: "Strategic planning session met experts",
        href: "/contact-sales",
        badge: "PREMIUM",
        badgeColor: "bg-purple-500",
      },
    ],
  },
];

export function ImprovedMarketingHeader({
  onAuthModalOpen,
  className = "",
}: ImprovedMarketingHeaderProps) {
  const [dropdownState, dispatchDropdown] = useReducer(dropdownReducer, {
    platform: false,
    dashboards: false,
    resources: false,
    mobile: false,
  });

  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect with debouncing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsScrolled(window.scrollY > 20);
      }, 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      dispatchDropdown({ type: "CLOSE_ALL_DROPDOWNS" });
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dispatchDropdown({ type: "CLOSE_ALL_DROPDOWNS" });
        if (dropdownState.mobile) {
          dispatchDropdown({ type: "CLOSE_MOBILE_MENU" });
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dropdownState.mobile]);

  const handleAuthAction = (type: "login" | "signup") => {
    if (onAuthModalOpen) {
      onAuthModalOpen(type);
    } else {
      // Fallback to navigation
      window.location.href = type === "login" ? "/auth/login" : "/auth/signup";
    }
  };

  const handleDropdownInteraction = (
    dropdown: keyof Omit<DropdownState, "mobile">,
    isOpen: boolean
  ) => {
    if (isOpen) {
      dispatchDropdown({ type: "TOGGLE_DROPDOWN", dropdown });
    } else {
      dispatchDropdown({ type: "CLOSE_ALL_DROPDOWNS" });
    }
  };

  // Map navigation labels to state keys
  const getDropdownKey = (
    label: string
  ): keyof Omit<DropdownState, "mobile"> => {
    switch (label) {
      case "MarketingMachine":
        return "platform";
      case "Intelligence Hub":
        return "dashboards";
      case "Resources":
        return "resources";
      default:
        return "resources"; // fallback
    }
  };

  // Group dropdown items by category for better organization
  const groupItemsByCategory = (items: any[]) => {
    const grouped = items.reduce((acc, item) => {
      const category = item.category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});
    return grouped;
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-slate-950/95 backdrop-blur-xl border-b border-blue-500/20 shadow-2xl shadow-blue-500/10"
          : "bg-transparent",
        className
      )}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section - Enhanced with better accessibility */}
          <Link
            href="/"
            className="flex items-center group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded-lg"
            aria-label="FutureMarketingAI home"
          >
            <div className="font-black text-xl tracking-tight">
              <span className="text-white group-hover:text-blue-300 transition-colors duration-300">
                Future
              </span>
              <span className="text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                Marketing
              </span>
              <span className="text-cyan-400 group-hover:text-purple-400 transition-colors duration-300 ml-0.5">
                AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Enhanced with ARIA */}
          <nav
            className="hidden lg:flex items-center space-x-8"
            role="navigation"
            aria-label="Main navigation"
          >
            {mainNavItems.map((item, index) => (
              <div key={index} className="relative">
                {item.hasDropdown ? (
                  <div
                    onMouseEnter={() =>
                      handleDropdownInteraction(
                        getDropdownKey(item.label),
                        true
                      )
                    }
                    onMouseLeave={() =>
                      handleDropdownInteraction(
                        getDropdownKey(item.label),
                        false
                      )
                    }
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      className="flex items-center gap-1 text-slate-300 hover:text-white font-medium transition-colors duration-300 py-2 px-3 rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                      aria-expanded={String(
                        dropdownState[getDropdownKey(item.label)]
                      )}
                      aria-haspopup="true"
                      aria-label={item.ariaLabel}
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          dropdownState[getDropdownKey(item.label)] &&
                            "rotate-180"
                        )}
                        aria-hidden="true"
                      />
                    </button>

                    {/* Enhanced Dropdown Menu with Categories */}
                    <AnimatePresence>
                      {dropdownState[getDropdownKey(item.label)] && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className={`absolute top-full left-0 mt-2 ${
                            item.label === "MarketingMachine"
                              ? "w-[900px] -translate-x-1/4" // Horizontale layout voor MarketingMachine
                              : "w-96"
                          } bg-slate-950/98 backdrop-blur-xl border border-blue-500/20 rounded-xl shadow-2xl shadow-blue-500/10 p-6 z-50`}
                          role="menu"
                          aria-labelledby={`${item.label}-button`}
                        >
                          {item.label === "MarketingMachine" ? (
                            // Horizontal layout for MarketingMachine
                            <div className="flex gap-6">
                              {item.dropdownItems &&
                                Object.entries(
                                  groupItemsByCategory(item.dropdownItems)
                                ).map(([category, items]: [string, any]) => (
                                  <div key={category} className="flex-1">
                                    {category !== "Other" && (
                                      <div className="mb-4">
                                        <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider border-b border-blue-500/20 pb-2">
                                          {category}
                                        </div>
                                      </div>
                                    )}
                                    <div className="space-y-2">
                                      {(items as any[]).map(
                                        (dropdownItem, dropdownIndex) => (
                                          <Link
                                            key={dropdownIndex}
                                            href={dropdownItem.href}
                                            className="flex items-start gap-3 p-3 rounded-lg transition-all group hover:bg-white/5 border border-transparent hover:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                                            role="menuitem"
                                          >
                                            <div className="p-2 rounded-md bg-slate-800 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-purple-600 transition-all">
                                              <dropdownItem.icon
                                                className="w-4 h-4 text-white"
                                                aria-hidden="true"
                                              />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2 mb-1">
                                                <div className="font-semibold text-white group-hover:text-blue-300 transition-colors text-sm">
                                                  {dropdownItem.title}
                                                </div>
                                                {/* Feature Badge */}
                                                {dropdownItem.badge && (
                                                  <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${dropdownItem.badgeColor} shadow-sm`}
                                                  >
                                                    {dropdownItem.badge}
                                                  </span>
                                                )}
                                              </div>
                                              <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
                                                {dropdownItem.description}
                                              </div>
                                            </div>
                                          </Link>
                                        )
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            // Vertical layout for other dropdowns
                            <>
                              {item.dropdownItems &&
                                Object.entries(
                                  groupItemsByCategory(item.dropdownItems)
                                ).map(
                                  (
                                    [category, items]: [string, any],
                                    categoryIndex,
                                    allCategories
                                  ) => (
                                    <div
                                      key={category}
                                      className="mb-6 last:mb-0"
                                    >
                                      {category !== "Other" && (
                                        <div className="flex items-center gap-2 mb-3">
                                          <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider border-b border-blue-500/20 pb-2 flex-1">
                                            {category}
                                          </div>
                                          {/* Workflow indicator arrow */}
                                          {categoryIndex <
                                            allCategories.length - 1 && (
                                            <div className="text-blue-500/60">
                                              <ArrowRight className="w-3 h-3" />
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      <div className="space-y-1">
                                        {(items as any[]).map(
                                          (dropdownItem, dropdownIndex) => (
                                            <Link
                                              key={dropdownIndex}
                                              href={dropdownItem.href}
                                              className="flex items-start gap-3 p-3 rounded-lg transition-all group hover:bg-white/5 border border-transparent hover:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                                              role="menuitem"
                                            >
                                              <div className="p-2 rounded-md bg-slate-800 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-purple-600 transition-all">
                                                <dropdownItem.icon
                                                  className="w-4 h-4 text-white"
                                                  aria-hidden="true"
                                                />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <div className="font-semibold text-white group-hover:text-blue-300 transition-colors text-sm">
                                                    {dropdownItem.title}
                                                  </div>
                                                  {/* Feature Badge */}
                                                  {dropdownItem.badge && (
                                                    <span
                                                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${dropdownItem.badgeColor} shadow-sm`}
                                                    >
                                                      {dropdownItem.badge}
                                                    </span>
                                                  )}
                                                </div>
                                                <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
                                                  {dropdownItem.description}
                                                </div>
                                              </div>
                                            </Link>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )
                                )}
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="text-slate-300 hover:text-white font-medium transition-colors duration-300 py-2 px-3 rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                    aria-label={item.ariaLabel}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Section - Simplified and Better Spaced */}
          <div className="flex items-center gap-3">
            {/* Primary Demo Button */}
            <Link href="/demo" className="hidden md:block">
              <button className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:border-white/30 rounded-lg font-medium transition-all duration-300 px-4 py-2 text-sm hover:shadow-lg hover:shadow-white/10">
                <Play className="w-4 h-4" />
                Demo
              </button>
            </Link>

            {/* Login Button - Simplified */}
            <div className="hidden lg:block">
              <button
                onClick={() => handleAuthAction("login")}
                className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-lg font-medium transition-all duration-300 px-4 py-2 text-sm hover:shadow-lg hover:shadow-white/10"
              >
                <LogIn className="w-4 h-4" />
                Log In
              </button>
            </div>

            {/* Language Switcher */}
            <LocaleSwitcher />

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-all border border-transparent hover:border-white/20"
              onClick={() => dispatchDropdown({ type: "TOGGLE_MOBILE_MENU" })}
            >
              {dropdownState.mobile ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Improved Mobile Menu */}
      <AnimatePresence>
        {dropdownState.mobile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden bg-slate-950/98 backdrop-blur-xl border-t border-blue-500/20 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="space-y-6">
                {/* Mobile Navigation Links */}
                <div className="space-y-4">
                  {mainNavItems.map((item, index) => (
                    <div key={index}>
                      {item.hasDropdown ? (
                        <div className="space-y-3">
                          <div className="font-semibold text-white text-base">
                            {item.label}
                          </div>
                          <div className="pl-4 space-y-2">
                            {item.dropdownItems?.map(
                              (dropdownItem, dropdownIndex) => (
                                <Link
                                  key={dropdownIndex}
                                  href={dropdownItem.href}
                                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                                  onClick={() =>
                                    dispatchDropdown({
                                      type: "CLOSE_MOBILE_MENU",
                                    })
                                  }
                                >
                                  <div className="p-2 rounded-md bg-slate-800">
                                    <dropdownItem.icon className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">
                                      {dropdownItem.title}
                                    </div>
                                  </div>
                                </Link>
                              )
                            )}
                          </div>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className="block text-slate-300 hover:text-white font-semibold py-3 px-4 rounded-lg hover:bg-white/5 transition-all"
                          onClick={() =>
                            dispatchDropdown({ type: "CLOSE_MOBILE_MENU" })
                          }
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>

                {/* Mobile CTA Buttons */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <Link
                    href="/demo"
                    className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold shadow-lg transition-all"
                    onClick={() =>
                      dispatchDropdown({ type: "CLOSE_MOBILE_MENU" })
                    }
                  >
                    <Play className="w-5 h-5" />
                    Watch Demo
                  </Link>

                  <button
                    onClick={() => {
                      handleAuthAction("login");
                      dispatchDropdown({ type: "CLOSE_MOBILE_MENU" });
                    }}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-white/10 text-white rounded-lg font-medium border border-white/20 hover:bg-white/20 transition-all"
                  >
                    <LogIn className="w-5 h-5" />
                    Log In
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
