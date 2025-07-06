"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Settings,
  Menu,
  X,
  Home,
  Activity,
  FileText,
  Bell,
} from "lucide-react";

interface MobileNavigationProps {
  className?: string;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive?: boolean;
}

export default function MobileNavigation({
  className = "",
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();

  // Navigation items
  const navItems: NavItem[] = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
    { icon: PieChart, label: "Reports", href: "/reports" },
    { icon: TrendingUp, label: "Trends", href: "/trends" },
    { icon: Users, label: "Users", href: "/users" },
    { icon: Activity, label: "Activity", href: "/activity" },
    { icon: FileText, label: "Documents", href: "/documents" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  // Main navigation items for bottom nav
  const mainNavItems = navItems.slice(0, 4);

  // Auto-hide navigation on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Close sidebar when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav
        className={`
          md:hidden mobile-nav-premium
          ${isVisible ? "" : "hidden"}
          ${className}
        `}
      >
        <div className="flex items-center justify-around h-full px-4">
          {mainNavItems.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center
                  touch-target-comfortable
                  transition-all duration-300 ease-premium
                  group relative
                  ${
                    isActive
                      ? "text-primary-400"
                      : "text-neutral-400 hover:text-neutral-200"
                  }
                `}
              >
                <div
                  className={`
                  p-2 rounded-xl
                  transition-all duration-300 ease-premium
                  ${
                    isActive
                      ? "bg-primary-500/20 shadow-glow-primary"
                      : "hover:bg-white/10"
                  }
                `}
                >
                  <Icon
                    className={`
                      w-5 h-5 transition-transform duration-300 ease-premium
                      ${isActive ? "scale-110" : "group-hover:scale-105"}
                    `}
                  />
                </div>
                <span
                  className={`
                  text-xs font-medium mt-1
                  transition-all duration-300 ease-premium
                  ${isActive ? "opacity-100" : "opacity-70"}
                `}
                >
                  {item.label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <div
                    className="
                    absolute -top-1 left-1/2 transform -translate-x-1/2
                    w-1 h-1 bg-primary-400 rounded-full
                    animate-pulse-glow
                  "
                  />
                )}
              </Link>
            );
          })}

          {/* More menu button */}
          <NormalButton
            onClick={toggleSidebar}
            aria-label="Open navigation menu"
            title="Open navigation menu"
            className="
              flex flex-col items-center justify-center
              touch-target-comfortable
              text-neutral-400 hover:text-neutral-200
              transition-all duration-300 ease-premium
              group
            "
          >
            <div
              className="
              p-2 rounded-xl
              transition-all duration-300 ease-premium
              hover:bg-white/10
            "
            >
              <Menu className="w-5 h-5 transition-transform duration-300 ease-premium group-hover:scale-105" />
            </div>
            <span className="text-xs font-medium mt-1 opacity-70">More</span>
          </NormalButton>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`mobile-overlay ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Sidebar */}
      <aside className={`mobile-sidebar ${isOpen ? "open" : ""}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-xl font-bold text-white">Intelligence Hub</h2>
              <p className="text-sm text-neutral-400">Dashboard</p>
            </div>
            <NormalButton
              onClick={() => setIsOpen(false)}
              aria-label="Close navigation menu"
              title="Close navigation menu"
              className="
                p-2 rounded-xl
                text-neutral-400 hover:text-white
                hover:bg-white/10
                transition-all duration-300 ease-premium
                touch-target-comfortable
              "
            >
              <X className="w-5 h-5" />
            </NormalButton>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map(item => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl
                    transition-all duration-300 ease-premium
                    touch-target-comfortable
                    group relative
                    ${
                      isActive
                        ? "bg-primary-500/20 text-primary-400 shadow-glow-primary"
                        : "text-neutral-400 hover:text-white hover:bg-white/10"
                    }
                  `}
                >
                  <Icon
                    className={`
                    w-5 h-5 transition-transform duration-300 ease-premium
                    ${isActive ? "scale-110" : "group-hover:scale-105"}
                  `}
                  />
                  <span className="font-medium">{item.label}</span>

                  {/* Active indicator */}
                  {isActive && (
                    <div
                      className="
                      absolute right-3 
                      w-2 h-2 bg-primary-400 rounded-full
                      animate-pulse-glow
                    "
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div
                className="
                w-8 h-8 rounded-full 
                bg-gradient-to-r from-primary-500 to-purple-500
                flex items-center justify-center
              "
              >
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Notifications</p>
                <p className="text-xs text-neutral-400">3 new updates</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
