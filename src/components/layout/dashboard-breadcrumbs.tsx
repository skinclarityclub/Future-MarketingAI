"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/context";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface DashboardBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function DashboardBreadcrumbs({
  items,
  className,
}: DashboardBreadcrumbsProps) {
  const { locale } = useLocale();

  // Helper function to add locale prefix to routes
  const withLocale = (href: string) => {
    if (href.startsWith("/")) {
      return `/${locale}${href}`;
    }
    return href;
  };

  return (
    <nav
      className={cn(
        "flex items-center space-x-1 text-sm text-gray-400 mb-6",
        className
      )}
      aria-label="Breadcrumb"
    >
      <Link
        href={withLocale("/")}
        className="flex items-center hover:text-white transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 mx-1 text-gray-600" />

          {item.current ? (
            <span className="font-medium text-white" aria-current="page">
              {item.label}
            </span>
          ) : item.href ? (
            <Link
              href={withLocale(item.href)}
              className="hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-500">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// Helper function to generate breadcrumbs from route
export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const pathSegments = pathname.split("/").filter(Boolean);

  // Remove locale from path segments if present
  const localePattern = /^(en|nl|es|fr|de)$/;
  if (pathSegments.length > 0 && localePattern.test(pathSegments[0])) {
    pathSegments.shift();
  }

  if (pathSegments.length === 0) {
    return [{ label: "Dashboard", current: true }];
  }

  const breadcrumbs: BreadcrumbItem[] = [];
  let currentPath = "";

  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;

    // Convert segment to readable label
    const label = segment
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
      current: isLast,
    });
  });

  return breadcrumbs;
}

// Predefined breadcrumb configurations for common dashboard routes
export const DASHBOARD_BREADCRUMBS = {
  executive: [{ label: "Executive", href: "/executive-dashboard" }],
  finance: [{ label: "Finance", href: "/finance" }],
  marketing: [{ label: "Marketing", href: "/marketing" }],
  admin: [{ label: "Admin", href: "/admin-dashboard" }],
  research: [{ label: "Research", href: "/research" }],
} as const;
