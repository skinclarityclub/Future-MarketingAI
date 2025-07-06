"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  BarChart3,
  Users,
  Settings,
  Eye,
  EyeOff,
  ArrowUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ====================================================================
// ACCESSIBILITY & MOBILE HELPER COMPONENT
// ====================================================================

interface ResponsiveAccessibilityHelperProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveAccessibilityHelper({
  children,
  className,
}: ResponsiveAccessibilityHelperProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isHighContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [isHighContrast]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={cn("relative", className)}>
      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300",
          isMobileMenuOpen && isMobile && "opacity-50 pointer-events-none"
        )}
      >
        {children}
      </div>

      {/* Mobile Overlay Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-80 bg-slate-900 border-l border-slate-700 shadow-2xl z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <h2 className="text-lg font-semibold text-white">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="p-6 space-y-2">
                <a
                  href="/"
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Home className="w-5 h-5" />
                  <span>Dashboard</span>
                </a>
                <a
                  href="/analytics"
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics</span>
                </a>
                <a
                  href="/users"
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Users className="w-5 h-5" />
                  <span>Users</span>
                </a>
                <a
                  href="/settings"
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </a>
              </nav>

              {/* Accessibility Controls */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  Accessibility
                </h3>

                {/* High Contrast Toggle */}
                <div className="space-y-2">
                  <span className="text-sm text-slate-300">Display</span>
                  <button
                    onClick={() => setIsHighContrast(!isHighContrast)}
                    className={cn(
                      "flex items-center gap-3 w-full p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
                      isHighContrast
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-slate-800 hover:bg-slate-700 text-white"
                    )}
                    aria-label={
                      isHighContrast
                        ? "Disable high contrast"
                        : "Enable high contrast"
                    }
                    aria-pressed={isHighContrast}
                  >
                    {isHighContrast ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    <span className="text-sm">
                      {isHighContrast ? "Disable" : "Enable"} High Contrast
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Menu Button - Only show on mobile */}
      {isMobile && (
        <button
          ref={menuButtonRef}
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed top-4 right-4 z-30 p-3 rounded-full bg-slate-900/90 backdrop-blur-sm border border-slate-700 text-white shadow-lg hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Open accessibility menu"
          aria-expanded={isMobileMenuOpen}
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-30 p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Desktop High Contrast Toggle - Only show on desktop */}
      {!isMobile && (
        <div className="fixed top-6 right-6 z-30">
          <button
            onClick={() => setIsHighContrast(!isHighContrast)}
            className={cn(
              "p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg",
              isHighContrast
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-slate-900/90 backdrop-blur-sm border border-slate-700 hover:bg-slate-800 text-white"
            )}
            aria-label={
              isHighContrast ? "Disable high contrast" : "Enable high contrast"
            }
            aria-pressed={isHighContrast}
          >
            {isHighContrast ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ====================================================================
// HIGH CONTRAST CSS (TO BE ADDED TO GLOBALS.CSS)
// ====================================================================

export const highContrastStyles = `
  .high-contrast {
    --tw-prose-body: #ffffff;
    --tw-prose-headings: #ffffff;
    --tw-prose-lead: #ffffff;
    --tw-prose-links: #60a5fa;
    --tw-prose-bold: #ffffff;
    --tw-prose-counters: #ffffff;
    --tw-prose-bullets: #ffffff;
    --tw-prose-hr: #374151;
    --tw-prose-quotes: #ffffff;
    --tw-prose-quote-borders: #374151;
    --tw-prose-captions: #ffffff;
    --tw-prose-code: #ffffff;
    --tw-prose-pre-code: #ffffff;
    --tw-prose-pre-bg: #111827;
    --tw-prose-th-borders: #374151;
    --tw-prose-td-borders: #374151;
  }

  .high-contrast body {
    background: #000000 !important;
    color: #ffffff !important;
  }

  .high-contrast .bg-slate-950 {
    background-color: #000000 !important;
  }

  .high-contrast .bg-slate-900 {
    background-color: #111111 !important;
  }

  .high-contrast .bg-slate-800 {
    background-color: #222222 !important;
  }

  .high-contrast .text-slate-400 {
    color: #cccccc !important;
  }

  .high-contrast .text-slate-300 {
    color: #ffffff !important;
  }

  .high-contrast .border-slate-700 {
    border-color: #ffffff !important;
  }

  .high-contrast button:focus,
  .high-contrast a:focus,
  .high-contrast input:focus,
  .high-contrast textarea:focus {
    outline: 3px solid #60a5fa !important;
    outline-offset: 2px !important;
  }
`;

export default ResponsiveAccessibilityHelper;
