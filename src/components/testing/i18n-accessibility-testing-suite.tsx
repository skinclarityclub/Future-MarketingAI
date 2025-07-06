"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useLocale } from "@/lib/i18n/context";
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Globe,
  Eye,
  Keyboard,
  Volume2,
  Contrast,
  Type,
  MousePointer,
  Accessibility,
  Languages,
  Calendar,
  DollarSign,
  Percent,
  Clock,
  Target,
  ArrowRight,
  RefreshCw,
  Zap,
  Users,
  Settings,
} from "lucide-react";

interface TestResult {
  category: string;
  test: string;
  status: "pass" | "warning" | "fail";
  score: number;
  details: string;
  recommendations?: string[];
}

interface I18nTestingSuiteProps {
  onTestComplete?: (results: TestResult[]) => void;
}

const I18nAccessibilityTestingSuite: React.FC<I18nTestingSuiteProps> = ({
  onTestComplete,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState("");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<TestResult[]>([]);
  const { locale, changeLocale } = useLocale();
  const [originalLocale] = useState(locale);

  // Available dictionaries to test
  const availableLocales = ["en", "nl"];
  const localeNames = {
    en: "English",
    nl: "Nederlands",
  };

  const runI18nTests = async () => {
    const i18nResults: TestResult[] = [];

    // Test 1: Dictionary Completeness
    setCurrentTest("Testing dictionary completeness...");
    try {
      const enDict = await import("@/i18n/dictionaries/en.json");
      const nlDict = await import("@/i18n/dictionaries/nl.json");

      const enKeys = extractKeys(enDict.default);
      const nlKeys = extractKeys(nlDict.default);

      const missingInNl = enKeys.filter(key => !nlKeys.includes(key));
      const missingInEn = nlKeys.filter(key => !enKeys.includes(key));

      const completeness = Math.round(
        ((enKeys.length - missingInNl.length) / enKeys.length) * 100
      );

      i18nResults.push({
        category: "Translation Completeness",
        test: "Dictionary Key Coverage",
        status:
          completeness >= 95 ? "pass" : completeness >= 85 ? "warning" : "fail",
        score: completeness,
        details: `Dutch dictionary has ${completeness}% coverage of English keys. Missing: ${missingInNl.length} keys`,
        recommendations:
          missingInNl.length > 0
            ? [
                `Add missing keys: ${missingInNl.slice(0, 5).join(", ")}${missingInNl.length > 5 ? "..." : ""}`,
              ]
            : undefined,
      });
    } catch (error) {
      i18nResults.push({
        category: "Translation Completeness",
        test: "Dictionary Key Coverage",
        status: "fail",
        score: 0,
        details: `Error loading dictionaries: ${error}`,
        recommendations: ["Fix dictionary import errors"],
      });
    }

    // Test 2: Locale Switching
    setCurrentTest("Testing locale switching functionality...");
    let localeTestPassed = true;
    let switchingDetails = "";

    for (const testLocale of availableLocales) {
      try {
        changeLocale(testLocale);
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if URL or state updated
        const currentUrl = window.location.pathname;
        const hasLocaleInUrl = currentUrl.includes(`/${testLocale}`);

        if (testLocale !== originalLocale && !hasLocaleInUrl) {
          localeTestPassed = false;
          switchingDetails += `Failed to switch to ${testLocale}. `;
        }
      } catch (error) {
        localeTestPassed = false;
        switchingDetails += `Error switching to ${testLocale}: ${error}. `;
      }
    }

    i18nResults.push({
      category: "Locale Switching",
      test: "Locale Change Functionality",
      status: localeTestPassed ? "pass" : "fail",
      score: localeTestPassed ? 100 : 0,
      details: localeTestPassed
        ? "All locale switches successful"
        : switchingDetails,
      recommendations: !localeTestPassed
        ? [
            "Check locale routing configuration",
            "Verify locale context updates",
          ]
        : undefined,
    });

    // Test 3: Date/Number Formatting
    setCurrentTest("Testing locale-specific formatting...");
    const testDate = new Date("2024-01-15");
    const testNumber = 1234567.89;
    const testCurrency = 1234.56;

    const formatTests = [];
    for (const testLocale of availableLocales) {
      try {
        const dateFormat = new Intl.DateTimeFormat(testLocale).format(testDate);
        const numberFormat = new Intl.NumberFormat(testLocale).format(
          testNumber
        );
        const currencyFormat = new Intl.NumberFormat(testLocale, {
          style: "currency",
          currency: testLocale === "nl" ? "EUR" : "USD",
        }).format(testCurrency);

        formatTests.push({
          locale: testLocale,
          date: dateFormat,
          number: numberFormat,
          currency: currencyFormat,
          success: true,
        });
      } catch (error) {
        formatTests.push({
          locale: testLocale,
          error: error,
          success: false,
        });
      }
    }

    const formattingSuccess = formatTests.every(test => test.success);
    i18nResults.push({
      category: "Locale Formatting",
      test: "Date/Number/Currency Formatting",
      status: formattingSuccess ? "pass" : "fail",
      score: formattingSuccess ? 100 : 0,
      details: formattingSuccess
        ? "All locale formatting working correctly"
        : "Some locale formatting failed",
      recommendations: !formattingSuccess
        ? ["Check Intl API support", "Verify locale configuration"]
        : undefined,
    });

    // Test 4: Text Direction Support
    setCurrentTest("Testing text direction support...");
    const hasRTLSupport =
      document.documentElement.dir === "ltr" ||
      document.documentElement.dir === "rtl" ||
      document.querySelector('[dir="rtl"]') !== null;

    i18nResults.push({
      category: "Text Direction",
      test: "RTL/LTR Support",
      status: hasRTLSupport ? "pass" : "warning",
      score: hasRTLSupport ? 100 : 70,
      details: hasRTLSupport
        ? "Text direction support detected"
        : "No explicit RTL support found",
      recommendations: !hasRTLSupport
        ? [
            "Add RTL support for future languages",
            "Test with RTL languages like Arabic",
          ]
        : undefined,
    });

    return i18nResults;
  };

  const runAccessibilityTests = async () => {
    const a11yResults: TestResult[] = [];

    // Test 1: Semantic HTML
    setCurrentTest("Testing semantic HTML structure...");
    const semanticElements = [
      "main",
      "nav",
      "header",
      "footer",
      "section",
      "article",
      "aside",
    ];

    const foundElements = semanticElements.filter(
      tag => document.querySelector(tag) !== null
    );

    const semanticScore = Math.round(
      (foundElements.length / semanticElements.length) * 100
    );

    a11yResults.push({
      category: "Semantic HTML",
      test: "Semantic Element Usage",
      status:
        semanticScore >= 80 ? "pass" : semanticScore >= 60 ? "warning" : "fail",
      score: semanticScore,
      details: `Found ${foundElements.length}/${semanticElements.length} semantic elements: ${foundElements.join(", ")}`,
      recommendations:
        foundElements.length < semanticElements.length
          ? ["Add missing semantic elements for better structure"]
          : undefined,
    });

    // Test 2: ARIA Labels and Roles
    setCurrentTest("Testing ARIA implementation...");
    const ariaElements = document.querySelectorAll(
      "[aria-label], [aria-labelledby], [aria-describedby], [role]"
    );
    const buttons = document.querySelectorAll("button");
    const inputs = document.querySelectorAll("input, textarea, select");

    const ariaButtonsRatio =
      buttons.length > 0
        ? (document.querySelectorAll("button[aria-label]").length /
            buttons.length) *
          100
        : 100;
    const ariaInputsRatio =
      inputs.length > 0
        ? (document.querySelectorAll(
            "input[aria-label], input[aria-labelledby], textarea[aria-label], select[aria-label]"
          ).length /
            inputs.length) *
          100
        : 100;

    const ariaScore = Math.round((ariaButtonsRatio + ariaInputsRatio) / 2);

    a11yResults.push({
      category: "ARIA Implementation",
      test: "ARIA Labels and Roles",
      status: ariaScore >= 80 ? "pass" : ariaScore >= 60 ? "warning" : "fail",
      score: ariaScore,
      details: `${ariaElements.length} elements with ARIA attributes. Button coverage: ${ariaButtonsRatio.toFixed(1)}%, Input coverage: ${ariaInputsRatio.toFixed(1)}%`,
      recommendations:
        ariaScore < 80
          ? [
              "Add ARIA labels to interactive elements",
              "Improve form accessibility",
            ]
          : undefined,
    });

    // Test 3: Keyboard Navigation
    setCurrentTest("Testing keyboard navigation...");
    const focusableElements = document.querySelectorAll(
      'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );

    const skipLinks = document.querySelectorAll('a[href^="#"]');
    const hasSkipLinks = skipLinks.length > 0;

    const keyboardScore = hasSkipLinks ? 90 : 70;

    a11yResults.push({
      category: "Keyboard Navigation",
      test: "Keyboard Accessibility",
      status: keyboardScore >= 80 ? "pass" : "warning",
      score: keyboardScore,
      details: `${focusableElements.length} focusable elements found. Skip links: ${hasSkipLinks ? "Present" : "Missing"}`,
      recommendations: !hasSkipLinks
        ? [
            "Add skip links for keyboard navigation",
            "Test tab order and focus management",
          ]
        : undefined,
    });

    // Test 4: Color Contrast
    setCurrentTest("Testing color contrast...");
    const hasHighContrastSupport =
      document.documentElement.classList.contains("high-contrast") ||
      document.querySelector("[data-theme]") !== null ||
      document.querySelector(".dark") !== null;

    a11yResults.push({
      category: "Color Contrast",
      test: "High Contrast Support",
      status: hasHighContrastSupport ? "pass" : "warning",
      score: hasHighContrastSupport ? 100 : 60,
      details: hasHighContrastSupport
        ? "High contrast mode or theme switching detected"
        : "No high contrast support detected",
      recommendations: !hasHighContrastSupport
        ? [
            "Add high contrast theme support",
            "Test with contrast checking tools",
          ]
        : undefined,
    });

    // Test 5: Screen Reader Support
    setCurrentTest("Testing screen reader support...");
    const srOnlyElements = document.querySelectorAll(
      ".sr-only, .visually-hidden"
    );
    const ariaLiveElements = document.querySelectorAll("[aria-live]");
    const headingStructure = document.querySelectorAll(
      "h1, h2, h3, h4, h5, h6"
    );

    const srScore = Math.min(
      100,
      srOnlyElements.length * 10 +
        ariaLiveElements.length * 20 +
        headingStructure.length * 5
    );

    a11yResults.push({
      category: "Screen Reader",
      test: "Screen Reader Support",
      status: srScore >= 80 ? "pass" : srScore >= 60 ? "warning" : "fail",
      score: Math.min(srScore, 100),
      details: `Screen reader elements: ${srOnlyElements.length}, Live regions: ${ariaLiveElements.length}, Heading structure: ${headingStructure.length}`,
      recommendations:
        srScore < 80
          ? [
              "Add more screen reader specific content",
              "Implement ARIA live regions for dynamic content",
            ]
          : undefined,
    });

    // Test 6: Focus Management
    setCurrentTest("Testing focus management...");
    const focusVisibleElements = document.querySelectorAll(
      "[data-focus-visible]"
    );
    const modalElements = document.querySelectorAll("[role='dialog'], .modal");

    const focusScore = focusVisibleElements.length > 0 ? 90 : 70;

    a11yResults.push({
      category: "Focus Management",
      test: "Focus Indicators and Trapping",
      status: focusScore >= 80 ? "pass" : "warning",
      score: focusScore,
      details: `Focus visible elements: ${focusVisibleElements.length}, Modal elements: ${modalElements.length}`,
      recommendations:
        focusScore < 80
          ? ["Improve focus indicators", "Implement focus trapping for modals"]
          : undefined,
    });

    return a11yResults;
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);

    try {
      // Run I18n tests
      setProgress(10);
      const i18nResults = await runI18nTests();
      setResults(prev => [...prev, ...i18nResults]);

      setProgress(50);

      // Run Accessibility tests
      const a11yResults = await runAccessibilityTests();
      setResults(prev => [...prev, ...a11yResults]);

      setProgress(100);

      // Return to original locale
      changeLocale(originalLocale);

      onTestComplete?.([...i18nResults, ...a11yResults]);
    } catch (error) {
      console.error("Testing error:", error);
    } finally {
      setIsRunning(false);
      setCurrentTest("");
    }
  };

  // Helper function to extract keys from nested object
  const extractKeys = (obj: any, prefix = ""): string[] => {
    let keys: string[] = [];
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        keys = keys.concat(extractKeys(obj[key], prefix + key + "."));
      } else {
        keys.push(prefix + key);
      }
    }
    return keys;
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="w-4 h-4 text-success-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-warning-500" />;
      case "fail":
        return <XCircle className="w-4 h-4 text-error-500" />;
    }
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "pass":
        return "text-success-500";
      case "warning":
        return "text-warning-500";
      case "fail":
        return "text-error-500";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Translation Completeness":
      case "Locale Switching":
      case "Locale Formatting":
      case "Text Direction":
        return <Languages className="w-4 h-4" />;
      case "Semantic HTML":
        return <Settings className="w-4 h-4" />;
      case "ARIA Implementation":
        return <Accessibility className="w-4 h-4" />;
      case "Keyboard Navigation":
        return <Keyboard className="w-4 h-4" />;
      case "Color Contrast":
        return <Contrast className="w-4 h-4" />;
      case "Screen Reader":
        return <Volume2 className="w-4 h-4" />;
      case "Focus Management":
        return <Eye className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const i18nResults = results.filter(r =>
    [
      "Translation Completeness",
      "Locale Switching",
      "Locale Formatting",
      "Text Direction",
    ].includes(r.category)
  );
  const a11yResults = results.filter(r =>
    [
      "Semantic HTML",
      "ARIA Implementation",
      "Keyboard Navigation",
      "Color Contrast",
      "Screen Reader",
      "Focus Management",
    ].includes(r.category)
  );

  const overallStats = {
    total: results.length,
    passed: results.filter(r => r.status === "pass").length,
    warnings: results.filter(r => r.status === "warning").length,
    failed: results.filter(r => r.status === "fail").length,
    avgScore:
      results.length > 0
        ? Math.round(
            results.reduce((sum, r) => sum + r.score, 0) / results.length
          )
        : 0,
  };

  const i18nStats = {
    total: i18nResults.length,
    passed: i18nResults.filter(r => r.status === "pass").length,
    avgScore:
      i18nResults.length > 0
        ? Math.round(
            i18nResults.reduce((sum, r) => sum + r.score, 0) /
              i18nResults.length
          )
        : 0,
  };

  const a11yStats = {
    total: a11yResults.length,
    passed: a11yResults.filter(r => r.status === "pass").length,
    avgScore:
      a11yResults.length > 0
        ? Math.round(
            a11yResults.reduce((sum, r) => sum + r.score, 0) /
              a11yResults.length
          )
        : 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-100">
            I18n & Accessibility Testing Suite
          </h2>
          <p className="text-neutral-400 mt-1">
            Task 21.6 - Multi-Language and Accessibility Testing
          </p>
        </div>
        <NormalButton
          onClick={runTests}
          disabled={isRunning}
          className="glass-primary hover:glass-luxury"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Run Tests
            </>
          )}
        </NormalButton>
      </div>

      {isRunning && (
        <Card className="glass-secondary p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-neutral-200">
                Running I18n & Accessibility Tests...
              </span>
              <span className="text-neutral-400">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-neutral-400">{currentTest}</p>
          </div>
        </Card>
      )}

      {results.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="glass-primary p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Total Tests</p>
                  <p className="text-3xl font-bold text-neutral-100">
                    {overallStats.total}
                  </p>
                </div>
                <Target className="w-8 h-8 text-primary-400" />
              </div>
            </Card>

            <Card className="glass-secondary p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Passed</p>
                  <p className="text-3xl font-bold text-success-500">
                    {overallStats.passed}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-success-500" />
              </div>
            </Card>

            <Card className="glass-secondary p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Warnings</p>
                  <p className="text-3xl font-bold text-warning-500">
                    {overallStats.warnings}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-warning-500" />
              </div>
            </Card>

            <Card className="glass-secondary p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Failed</p>
                  <p className="text-3xl font-bold text-error-500">
                    {overallStats.failed}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-error-500" />
              </div>
            </Card>

            <Card className="glass-secondary p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Avg Score</p>
                  <p className="text-3xl font-bold text-primary-400">
                    {overallStats.avgScore}%
                  </p>
                </div>
                <Percent className="w-8 h-8 text-primary-400" />
              </div>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="glass-secondary">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="i18n">Internationalization</TabsTrigger>
              <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-secondary p-6">
                  <h3 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2">
                    <Languages className="w-5 h-5" />
                    Internationalization Results
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">Tests Passed</span>
                      <Badge variant="secondary">
                        {i18nStats.passed}/{i18nStats.total}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">Average Score</span>
                      <span className="text-primary-400 font-semibold">
                        {i18nStats.avgScore}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      {i18nResults.map((result, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded glass-primary"
                        >
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            <span className="text-sm text-neutral-200">
                              {result.test}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-neutral-300">
                            {result.score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card className="glass-secondary p-6">
                  <h3 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2">
                    <Accessibility className="w-5 h-5" />
                    Accessibility Results
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">Tests Passed</span>
                      <Badge variant="secondary">
                        {a11yStats.passed}/{a11yStats.total}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">Average Score</span>
                      <span className="text-primary-400 font-semibold">
                        {a11yStats.avgScore}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      {a11yResults.map((result, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded glass-primary"
                        >
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            <span className="text-sm text-neutral-200">
                              {result.test}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-neutral-300">
                            {result.score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="i18n" className="space-y-4">
              <Card className="glass-secondary p-6">
                <h3 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Internationalization Test Results
                </h3>
                <div className="space-y-4">
                  {i18nResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-4 rounded glass-primary space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.status)}
                          <div>
                            <div className="text-neutral-200 font-medium">
                              {result.test}
                            </div>
                            <div className="text-sm text-neutral-400">
                              {result.category}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-semibold ${getStatusColor(result.status)}`}
                          >
                            {result.score}%
                          </div>
                        </div>
                      </div>
                      <div className="ml-7 text-sm text-neutral-300">
                        {result.details}
                      </div>
                      {result.recommendations && (
                        <div className="ml-7 space-y-1">
                          {result.recommendations.map((rec, idx) => (
                            <div
                              key={idx}
                              className="text-xs text-warning-400 flex items-center gap-1"
                            >
                              <ArrowRight className="w-3 h-3" />
                              {rec}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="accessibility" className="space-y-4">
              <Card className="glass-secondary p-6">
                <h3 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2">
                  <Accessibility className="w-5 h-5" />
                  Accessibility Test Results
                </h3>
                <div className="space-y-4">
                  {a11yResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-4 rounded glass-primary space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.status)}
                          <div>
                            <div className="text-neutral-200 font-medium">
                              {result.test}
                            </div>
                            <div className="text-sm text-neutral-400">
                              {result.category}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-semibold ${getStatusColor(result.status)}`}
                          >
                            {result.score}%
                          </div>
                        </div>
                      </div>
                      <div className="ml-7 text-sm text-neutral-300">
                        {result.details}
                      </div>
                      {result.recommendations && (
                        <div className="ml-7 space-y-1">
                          {result.recommendations.map((rec, idx) => (
                            <div
                              key={idx}
                              className="text-xs text-warning-400 flex items-center gap-1"
                            >
                              <ArrowRight className="w-3 h-3" />
                              {rec}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <Card className="glass-secondary p-6">
                <h3 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Recommendations & Next Steps
                </h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-neutral-200 mb-3">
                      High Priority Improvements
                    </h4>
                    <div className="space-y-2">
                      {results
                        .filter(r => r.status === "fail")
                        .map((result, index) => (
                          <div
                            key={index}
                            className="p-3 rounded bg-error-500/10 border border-error-500/20"
                          >
                            <div className="font-medium text-error-400">
                              {result.test}
                            </div>
                            <div className="text-sm text-neutral-300 mt-1">
                              {result.details}
                            </div>
                            {result.recommendations && (
                              <div className="mt-2 space-y-1">
                                {result.recommendations.map((rec, idx) => (
                                  <div
                                    key={idx}
                                    className="text-xs text-error-300 flex items-center gap-1"
                                  >
                                    <ArrowRight className="w-3 h-3" />
                                    {rec}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-neutral-200 mb-3">
                      Medium Priority Improvements
                    </h4>
                    <div className="space-y-2">
                      {results
                        .filter(r => r.status === "warning")
                        .map((result, index) => (
                          <div
                            key={index}
                            className="p-3 rounded bg-warning-500/10 border border-warning-500/20"
                          >
                            <div className="font-medium text-warning-400">
                              {result.test}
                            </div>
                            <div className="text-sm text-neutral-300 mt-1">
                              {result.details}
                            </div>
                            {result.recommendations && (
                              <div className="mt-2 space-y-1">
                                {result.recommendations.map((rec, idx) => (
                                  <div
                                    key={idx}
                                    className="text-xs text-warning-300 flex items-center gap-1"
                                  >
                                    <ArrowRight className="w-3 h-3" />
                                    {rec}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-neutral-200 mb-3">
                      General Guidelines
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <p className="text-neutral-300 font-medium">
                          Internationalization:
                        </p>
                        <ul className="text-neutral-400 space-y-1">
                          <li>• Maintain translation key completeness</li>
                          <li>• Test locale switching regularly</li>
                          <li>• Validate date/number formatting</li>
                          <li>• Consider RTL language support</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <p className="text-neutral-300 font-medium">
                          Accessibility:
                        </p>
                        <ul className="text-neutral-400 space-y-1">
                          <li>• Use semantic HTML structure</li>
                          <li>• Implement proper ARIA labels</li>
                          <li>• Ensure keyboard navigation</li>
                          <li>• Test with screen readers</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default I18nAccessibilityTestingSuite;
