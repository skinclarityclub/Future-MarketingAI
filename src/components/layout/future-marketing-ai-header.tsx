"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  Play,
  LogIn,
  Zap,
  TrendingUp,
  BarChart3,
  Globe,
  ArrowRight,
  Phone,
  Bot,
  Calendar,
} from "lucide-react";
import NormalButton from "@/components/ui/normal-button";
import { LocaleSwitcher } from "@/components/locale-switcher";

interface FutureMarketingAIHeaderProps {
  onAuthModalOpen?: (type: "login" | "signup") => void;
  className?: string;
}

export function FutureMarketingAIHeader({
  onAuthModalOpen,
  className = "",
}: FutureMarketingAIHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isResourcesDropdownOpen, setIsResourcesDropdownOpen] = useState(false);
  const [isSolutionsDropdownOpen, setIsSolutionsDropdownOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const mainNavItems = [
    {
      label: "Platform",
      href: "#",
      hasDropdown: true,
      dropdownItems: [
        {
          icon: Bot,
          title: "FutureMarketingAI",
          description:
            "Enterprise-grade AI that accelerates premium business growth",
          href: "/future-marketing-ai",
        },
        {
          icon: BarChart3,
          title: "Executive Intelligence Hub",
          description:
            "Strategic intelligence for premium business decision making",
          href: "/dashboard",
        },
        {
          icon: TrendingUp,
          title: "Predictive Analytics",
          description: "Advanced forecasting for premium revenue optimization",
          href: "/analytics",
        },
      ],
    },
    {
      label: "Enterprise Solutions",
      href: "#",
      hasDropdown: true,
      dropdownItems: [
        {
          icon: Zap,
          title: "Marketing Automation",
          description:
            "Enterprise-scale automation for premium business operations",
          href: "/automation",
        },
        {
          icon: Globe,
          title: "Global Expansion",
          description: "Multi-market growth solutions for premium businesses",
          href: "/global",
        },
        {
          icon: Phone,
          title: "Schedule Strategic Consultation",
          description: "Book a personalized executive strategy session",
          href: "/contact-sales",
        },
      ],
    },
    {
      label: "Investment",
      href: "/pricing",
    },
    {
      label: "Resources",
      href: "#",
      hasDropdown: true,
      dropdownItems: [
        {
          icon: Play,
          title: "Executive Demo",
          description: "Private premium-level platform demonstration",
          href: "/demo",
        },
        {
          icon: BarChart3,
          title: "Premium Case Studies",
          description: "ROI results from premium business implementations",
          href: "/case-studies",
        },
        {
          icon: Calendar,
          title: "Executive Briefings",
          description:
            "Strategic marketing intelligence sessions for business leaders",
          href: "/webinars",
        },
      ],
    },
  ];

  const handleAuthAction = (type: "login" | "signup") => {
    if (onAuthModalOpen) {
      onAuthModalOpen(type);
    } else {
      // Fallback to navigation
      window.location.href = type === "login" ? "/auth/login" : "/auth/signup";
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-slate-950/90 backdrop-blur-xl border-b border-blue-500/20 shadow-2xl shadow-blue-500/10"
          : "bg-transparent"
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo - Geen robot icoon meer */}
          <Link href="/" className="flex items-center group">
            <div className="font-black text-xl lg:text-2xl">
              <span className="text-white group-hover:text-blue-300 transition-all duration-300">
                Future
              </span>
              <span className="text-blue-400 group-hover:text-blue-300 transition-all duration-300">
                Marketing
              </span>
              <span className="text-cyan-400 group-hover:text-purple-400 transition-all duration-300 font-black animate-pulse bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent bg-[length:200%_100%] animate-[gradient_3s_ease-in-out_infinite]">
                AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {mainNavItems.map((item, index) => (
              <div key={index} className="relative">
                {item.hasDropdown ? (
                  <div
                    onMouseEnter={() => {
                      if (item.label === "Platform")
                        setIsProductsDropdownOpen(true);
                      if (item.label === "Enterprise Solutions")
                        setIsSolutionsDropdownOpen(true);
                      if (item.label === "Resources")
                        setIsResourcesDropdownOpen(true);
                    }}
                    onMouseLeave={() => {
                      if (item.label === "Platform")
                        setIsProductsDropdownOpen(false);
                      if (item.label === "Enterprise Solutions")
                        setIsSolutionsDropdownOpen(false);
                      if (item.label === "Resources")
                        setIsResourcesDropdownOpen(false);
                    }}
                  >
                    <NormalButton className="flex items-center gap-1 text-slate-300 hover:text-white font-medium transition-all duration-300 hover:text-blue-300 py-2 px-3 rounded-lg hover:bg-white/5">
                      {item.label}
                      <ChevronDown className="w-4 h-4 transition-transform" />
                    </NormalButton>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="text-slate-300 hover:text-white font-medium transition-all duration-300 hover:text-blue-300 py-2 px-3 rounded-lg hover:bg-white/5"
                  >
                    {item.label}
                  </Link>
                )}

                {/* Dropdown Menu - Fixed overlapping */}
                {item.hasDropdown && (
                  <AnimatePresence>
                    {((item.label === "Platform" && isProductsDropdownOpen) ||
                      (item.label === "Enterprise Solutions" &&
                        isSolutionsDropdownOpen) ||
                      (item.label === "Resources" &&
                        isResourcesDropdownOpen)) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-3 w-80 bg-slate-950/95 backdrop-blur-xl border border-blue-500/20 rounded-2xl shadow-2xl shadow-blue-500/10 p-6 z-50"
                        onMouseEnter={() => {
                          if (item.label === "Platform")
                            setIsProductsDropdownOpen(true);
                          if (item.label === "Enterprise Solutions")
                            setIsSolutionsDropdownOpen(true);
                          if (item.label === "Resources")
                            setIsResourcesDropdownOpen(true);
                        }}
                        onMouseLeave={() => {
                          if (item.label === "Platform")
                            setIsProductsDropdownOpen(false);
                          if (item.label === "Enterprise Solutions")
                            setIsSolutionsDropdownOpen(false);
                          if (item.label === "Resources")
                            setIsResourcesDropdownOpen(false);
                        }}
                      >
                        <div className="space-y-3">
                          {item.dropdownItems?.map(
                            (dropdownItem, dropdownIndex) => (
                              <Link
                                key={dropdownIndex}
                                href={dropdownItem.href}
                                className="flex items-start gap-4 p-4 rounded-xl transition-all group hover:bg-white/5 border border-transparent hover:border-white/10"
                              >
                                <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-purple-600 transition-all">
                                  <dropdownItem.icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                                    {dropdownItem.title}
                                  </div>
                                  <div className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                                    {dropdownItem.description}
                                  </div>
                                </div>
                              </Link>
                            )
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Section - Locale switcher helemaal rechts */}
          <div className="flex items-center gap-4">
            {/* Demo Button */}
            <Link href="/demo" className="hidden md:block">
              <motion.div
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <NormalButton
                  size="sm"
                  className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-500 hover:from-slate-600 hover:via-slate-500 hover:to-slate-400 text-white border border-slate-400/50 hover:border-slate-300 rounded-xl font-semibold shadow-xl hover:shadow-slate-500/25 transition-all duration-300 px-6 py-2 text-sm relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-600/10 to-slate-400/10 blur-xl"></div>
                  <Play className="w-4 h-4 mr-2 relative z-10" />
                  <span className="relative z-10">Demo</span>
                </NormalButton>
              </motion.div>
            </Link>

            {/* Strategic Consultation CTA - Primary Fortune 500 Button */}
            <Link href="/contact-sales" className="hidden lg:block">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <NormalButton
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:via-blue-400 hover:to-indigo-500 text-white font-bold shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 px-8 py-2.5 border-2 border-blue-400/50 hover:border-blue-300 rounded-xl"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Strategic Consultation
                </NormalButton>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 to-indigo-600/15 blur-lg rounded-xl -z-10"></div>
              </motion.div>
            </Link>

            {/* Log In Button */}
            <div className="hidden lg:block">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <NormalButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAuthAction("login")}
                  className="bg-white/5 backdrop-blur-sm border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-xl font-semibold transition-all duration-300"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Log In
                </NormalButton>
              </motion.div>
            </div>

            {/* Language Switcher - Helemaal rechts */}
            <LocaleSwitcher />

            {/* Mobile Menu Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <NormalButton
                variant="ghost"
                size="sm"
                className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-all"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </NormalButton>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-slate-950/98 backdrop-blur-xl border-t border-blue-500/20"
          >
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="space-y-6">
                {/* Mobile Navigation Links */}
                <div className="space-y-4">
                  {mainNavItems.map((item, index) => (
                    <div key={index}>
                      {item.hasDropdown ? (
                        <div className="space-y-3">
                          <div className="font-semibold text-white text-lg">
                            {item.label}
                          </div>
                          <div className="pl-4 space-y-2">
                            {item.dropdownItems?.map(
                              (dropdownItem, dropdownIndex) => (
                                <Link
                                  key={dropdownIndex}
                                  href={dropdownItem.href}
                                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  <div className="p-2 rounded-lg bg-slate-800">
                                    <dropdownItem.icon className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium">
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
                          className="block text-slate-300 hover:text-white font-semibold py-3 px-4 rounded-xl hover:bg-white/5 transition-all"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>

                {/* Mobile CTA Buttons */}
                <div className="space-y-3">
                  {/* Mobile Demo Button */}
                  <Link
                    href="/demo"
                    className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-bold shadow-lg transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Play className="w-5 h-5" />
                    Demo
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {/* Mobile Strategy Meeting */}
                  <Link
                    href="/contact-sales"
                    className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white rounded-xl font-bold shadow-2xl border-2 border-orange-400/50 transition-all animate-pulse"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Calendar className="w-5 h-5" />
                    Strategy Meeting
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {/* Mobile Log In Button */}
                  <NormalButton
                    variant="ghost"
                    className="w-full bg-white/5 backdrop-blur-sm border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-xl font-semibold py-3"
                    onClick={() => {
                      handleAuthAction("login");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    Log In
                  </NormalButton>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
