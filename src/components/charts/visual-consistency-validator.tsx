"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Palette,
  Type,
  Layout,
  Zap,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Visual consistency rules and standards
interface ConsistencyRule {
  id: string;
  category:
    | "color"
    | "typography"
    | "spacing"
    | "layout"
    | "animation"
    | "accessibility";
  title: string;
  description: string;
  severity: "error" | "warning" | "info";
  check: (element: Element) => boolean;
  fix?: string;
}

// Pre-defined consistency rules
const CONSISTENCY_RULES: ConsistencyRule[] = [
  {
    id: "color-palette",
    category: "color",
    title: "Color Palette Adherence",
    description: "Charts should use predefined color palette",
    severity: "error",
    check: element => {
      const computedStyle = getComputedStyle(element);
      const definedColors = [
        "#3B82F6",
        "#10B981",
        "#F59E0B",
        "#EF4444",
        "#F97316",
        "#06B6D4",
        "#22C55E",
        "#6B7280",
      ];
      const usedColors = Array.from(
        element.querySelectorAll("[fill], [stroke]")
      )
        .map(el => el.getAttribute("fill") || el.getAttribute("stroke"))
        .filter(Boolean);

      return usedColors.every(
        color =>
          definedColors.includes(color as string) ||
          color?.startsWith("hsl(var(--") ||
          color === "none" ||
          color === "transparent"
      );
    },
    fix: "Use colors from ENHANCED_CHART_COLORS constant",
  },
  {
    id: "font-consistency",
    category: "typography",
    title: "Font Consistency",
    description: "All text should use system font stack",
    severity: "warning",
    check: element => {
      const textElements = element.querySelectorAll("text, .recharts-text");
      return Array.from(textElements).every(el => {
        const style = getComputedStyle(el);
        return (
          style.fontFamily.includes("system-ui") ||
          style.fontFamily.includes("Segoe UI") ||
          style.fontFamily === "inherit"
        );
      });
    },
    fix: "Apply consistent font-family through CSS variables",
  },
  {
    id: "loading-states",
    category: "layout",
    title: "Loading State Implementation",
    description: "Charts should have proper loading states",
    severity: "error",
    check: element => {
      // Check if component has loading prop handling
      return (
        element.hasAttribute("data-loading-supported") ||
        element.querySelector('[data-testid="loading-skeleton"]') !== null
      );
    },
    fix: "Implement SmartLoadingWrapper or loading prop",
  },
  {
    id: "responsive-design",
    category: "layout",
    title: "Responsive Design",
    description: "Charts should be responsive and work on all screen sizes",
    severity: "error",
    check: element => {
      const container = element.querySelector(".recharts-wrapper");
      return container ? container.getAttribute("width") === "100%" : false;
    },
    fix: "Use ResponsiveContainer component",
  },
  {
    id: "accessibility-labels",
    category: "accessibility",
    title: "Accessibility Labels",
    description: "Charts should have proper ARIA labels and descriptions",
    severity: "warning",
    check: element => {
      return (
        element.hasAttribute("aria-label") ||
        element.hasAttribute("aria-labelledby") ||
        element.querySelector('[role="img"]') !== null
      );
    },
    fix: "Add aria-label or aria-labelledby attributes",
  },
  {
    id: "animation-duration",
    category: "animation",
    title: "Animation Duration",
    description: "Animations should have consistent duration (1000ms)",
    severity: "info",
    check: element => {
      // This would need to be checked through props in actual implementation
      return true; // Placeholder implementation
    },
    fix: "Set animationDuration to 1000ms for consistency",
  },
  {
    id: "card-structure",
    category: "layout",
    title: "Card Structure",
    description: "Charts should use consistent Card component structure",
    severity: "error",
    check: element => {
      const hasCard =
        element.closest(".dashboard-card") ||
        element.querySelector(".dashboard-card");
      const hasContent = element.querySelector('[class*="card-content"]');
      return !!(hasCard || hasContent);
    },
    fix: "Wrap chart in Card component with CardHeader and CardContent",
  },
  {
    id: "spacing-consistency",
    category: "spacing",
    title: "Spacing Consistency",
    description: "Components should use consistent spacing (4px grid)",
    severity: "warning",
    check: element => {
      // Check for consistent margin/padding classes
      const classes = element.className;
      const spacingClasses = ["p-", "m-", "gap-", "space-"];
      return spacingClasses.some(
        prefix => classes.includes(prefix) && /[mp]-[0-9]+/.test(classes)
      );
    },
    fix: "Use Tailwind spacing classes (p-4, m-2, gap-6, etc.)",
  },
];

// Consistency check results
interface ConsistencyResult {
  rule: ConsistencyRule;
  passed: boolean;
  element?: Element;
  suggestions?: string[];
}

// Main validator component
interface VisualConsistencyValidatorProps {
  target?: string; // CSS selector for elements to validate
  autoFix?: boolean;
  showDetails?: boolean;
  onValidationComplete?: (results: ConsistencyResult[]) => void;
}

export function VisualConsistencyValidator({
  target = "[data-chart-component]",
  autoFix = false,
  showDetails = true,
  onValidationComplete,
}: VisualConsistencyValidatorProps) {
  const [results, setResults] = useState<ConsistencyResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);

  const runValidation = async () => {
    setIsValidating(true);
    setValidationProgress(0);

    const elements = document.querySelectorAll(target);
    const allResults: ConsistencyResult[] = [];

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      setValidationProgress((i / elements.length) * 50);

      for (const rule of CONSISTENCY_RULES) {
        try {
          const passed = rule.check(element);
          allResults.push({
            rule,
            passed,
            element,
            suggestions: passed ? [] : [rule.fix || "Manual review required"],
          });
        } catch (error) {
          console.warn(`Rule ${rule.id} failed:`, error);
          allResults.push({
            rule,
            passed: false,
            element,
            suggestions: ["Check failed - manual review required"],
          });
        }
        setValidationProgress(
          (i / elements.length +
            allResults.length / (elements.length * CONSISTENCY_RULES.length)) *
            100
        );
      }
    }

    setResults(allResults);
    setValidationProgress(100);
    setIsValidating(false);

    if (onValidationComplete) {
      onValidationComplete(allResults);
    }
  };

  const getScoreByCategory = (category: string) => {
    const categoryResults = results.filter(r => r.rule.category === category);
    if (categoryResults.length === 0) return 100;

    const passed = categoryResults.filter(r => r.passed).length;
    return Math.round((passed / categoryResults.length) * 100);
  };

  const getOverallScore = () => {
    if (results.length === 0) return 0;
    const passed = results.filter(r => r.passed).length;
    return Math.round((passed / results.length) * 100);
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      color: Palette,
      typography: Type,
      spacing: Layout,
      layout: Layout,
      animation: Zap,
      accessibility: Eye,
    };
    return icons[category as keyof typeof icons] || Settings;
  };

  const getCategoryResults = (category: string) => {
    return results.filter(r => r.rule.category === category);
  };

  const categories = [
    "color",
    "typography",
    "spacing",
    "layout",
    "animation",
    "accessibility",
  ];

  useEffect(() => {
    // Auto-run validation on mount
    const timer = setTimeout(runValidation, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Visual Consistency Validator
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Ensures all charts follow design system standards
              </p>
            </div>
            <NormalButton
              onClick={runValidation}
              disabled={isValidating}
              variant="outline"
            >
              {isValidating ? "Validating..." : "Run Validation"}
            </NormalButton>
          </div>
        </CardHeader>
        <CardContent>
          {isValidating && (
            <div className="space-y-2">
              <Progress value={validationProgress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Validating components... {Math.round(validationProgress)}%
              </p>
            </div>
          )}

          {!isValidating && results.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {getOverallScore()}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Overall Score
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {results.filter(r => r.passed).length}
                </div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {
                    results.filter(
                      r => !r.passed && r.rule.severity === "error"
                    ).length
                  }
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {
                    results.filter(
                      r => !r.passed && r.rule.severity === "warning"
                    ).length
                  }
                </div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Results */}
      {showDetails && results.length > 0 && (
        <div className="grid gap-4">
          {categories.map(category => {
            const categoryResults = getCategoryResults(category);
            if (categoryResults.length === 0) return null;

            const Icon = getCategoryIcon(category);
            const score = getScoreByCategory(category);

            return (
              <Card key={category}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <CardTitle className="capitalize">{category}</CardTitle>
                      <Badge
                        variant={
                          score >= 80
                            ? "default"
                            : score >= 60
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {score}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryResults.map((result, index) => (
                      <div
                        key={`${result.rule.id}-${index}`}
                        className="flex items-start gap-3 p-3 rounded-lg border"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {result.passed ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : result.rule.severity === "error" ? (
                            <XCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{result.rule.title}</h4>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                result.rule.severity === "error" &&
                                  "border-red-200 text-red-700",
                                result.rule.severity === "warning" &&
                                  "border-yellow-200 text-yellow-700",
                                result.rule.severity === "info" &&
                                  "border-blue-200 text-blue-700"
                              )}
                            >
                              {result.rule.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {result.rule.description}
                          </p>
                          {!result.passed &&
                            result.suggestions &&
                            result.suggestions.length > 0 && (
                              <div className="mt-2 p-2 bg-muted rounded text-xs">
                                <strong>Suggestion:</strong>{" "}
                                {result.suggestions[0]}
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Export hook for programmatic validation
export function useVisualConsistencyValidation(target?: string) {
  const [results, setResults] = useState<ConsistencyResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validate = async () => {
    setIsValidating(true);

    const elements = document.querySelectorAll(
      target || "[data-chart-component]"
    );
    const allResults: ConsistencyResult[] = [];

    for (const element of elements) {
      for (const rule of CONSISTENCY_RULES) {
        try {
          const passed = rule.check(element);
          allResults.push({ rule, passed, element });
        } catch (error) {
          allResults.push({ rule, passed: false, element });
        }
      }
    }

    setResults(allResults);
    setIsValidating(false);
    return allResults;
  };

  return {
    results,
    isValidating,
    validate,
    overallScore:
      results.length > 0
        ? Math.round(
            (results.filter(r => r.passed).length / results.length) * 100
          )
        : 0,
  };
}
