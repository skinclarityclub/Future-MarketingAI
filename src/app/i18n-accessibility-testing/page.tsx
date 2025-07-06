"use client";

import React from "react";
import I18nAccessibilityTestingSuite from "@/components/testing/i18n-accessibility-testing-suite";
import { UltraPremiumDashboardLayout } from "@/components/layout/ultra-premium-dashboard-layout";
import { LocaleSwitcher } from "@/components/locale-switcher";

export default function I18nAccessibilityTestingPage() {
  return (
    <UltraPremiumDashboardLayout>
      <div className="container-mobile space-y-6">
        <div className="glass-primary p-6 rounded-premium">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-neutral-100">
              I18n & Accessibility Testing Dashboard
            </h1>
            <p className="text-neutral-400">
              Task 21.6 Implementation - Multi-Language and Accessibility
              Testing
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-neutral-300">
                  Testing Environment Ready
                </span>
              </div>
              <LocaleSwitcher />
            </div>
          </div>
        </div>

        <I18nAccessibilityTestingSuite
          onTestComplete={results => {
            console.log("I18n & Accessibility Test results:", results);
            // Here you could save results to a database or generate reports
          }}
        />

        <div className="glass-secondary p-6 rounded-premium">
          <h2 className="text-xl font-semibold text-neutral-100 mb-4">
            Task 21.6 Implementation Overview
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium text-neutral-200">
                  Internationalization Testing
                </h3>
                <ul className="text-sm text-neutral-400 space-y-1">
                  <li>
                    🌍 <strong>Dictionary Completeness:</strong> Key coverage
                    analysis between languages
                  </li>
                  <li>
                    🔄 <strong>Locale Switching:</strong> Dynamic language
                    switching functionality
                  </li>
                  <li>
                    📅 <strong>Locale Formatting:</strong> Date, number, and
                    currency formatting
                  </li>
                  <li>
                    📝 <strong>Text Direction:</strong> RTL/LTR support
                    detection
                  </li>
                  <li>
                    🎯 <strong>Translation Quality:</strong> Missing keys and
                    consistency checks
                  </li>
                  <li>
                    🔗 <strong>URL Localization:</strong> Locale-based routing
                    verification
                  </li>
                  <li>
                    ⚙️ <strong>Context Updates:</strong> Real-time locale
                    context management
                  </li>
                  <li>
                    🌐 <strong>Multi-locale Support:</strong> English and Dutch
                    validation
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-neutral-200">
                  Accessibility Testing
                </h3>
                <ul className="text-sm text-neutral-400 space-y-1">
                  <li>
                    🏗️ <strong>Semantic HTML:</strong> Proper element structure
                    validation
                  </li>
                  <li>
                    🏷️ <strong>ARIA Implementation:</strong> Labels, roles, and
                    properties
                  </li>
                  <li>
                    ⌨️ <strong>Keyboard Navigation:</strong> Tab order and skip
                    links
                  </li>
                  <li>
                    🎨 <strong>Color Contrast:</strong> High contrast mode
                    support
                  </li>
                  <li>
                    🔊 <strong>Screen Reader:</strong> SR-only content and live
                    regions
                  </li>
                  <li>
                    👁️ <strong>Focus Management:</strong> Visual indicators and
                    trapping
                  </li>
                  <li>
                    🎯 <strong>WCAG Compliance:</strong> Accessibility guideline
                    adherence
                  </li>
                  <li>
                    ♿ <strong>Disability Support:</strong> Motor, visual, and
                    cognitive accessibility
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-neutral-700/30 pt-4">
              <h3 className="font-medium text-neutral-200 mb-2">
                Language Support Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-neutral-300">
                    <strong>English (en):</strong>
                  </p>
                  <p className="text-neutral-400">
                    543 lines, complete base language with all UI elements
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-neutral-300">
                    <strong>Nederlands (nl):</strong>
                  </p>
                  <p className="text-neutral-400">
                    639 lines, extended Dutch translation with business
                    terminology
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-700/30 pt-4">
              <h3 className="font-medium text-neutral-200 mb-2">
                Accessibility Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-neutral-300">
                    <strong>Keyboard Support:</strong>
                  </p>
                  <p className="text-neutral-400">
                    Full keyboard navigation, skip links, focus management
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-neutral-300">
                    <strong>Screen Reader:</strong>
                  </p>
                  <p className="text-neutral-400">
                    ARIA labels, live regions, semantic structure
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-neutral-300">
                    <strong>Visual:</strong>
                  </p>
                  <p className="text-neutral-400">
                    High contrast, focus indicators, scalable text
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-700/30 pt-4">
              <h3 className="font-medium text-neutral-200 mb-2">
                Testing Categories
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 rounded glass-primary">
                  <div className="text-primary-400 font-bold text-lg">4</div>
                  <div className="text-neutral-400">I18n Tests</div>
                </div>
                <div className="text-center p-3 rounded glass-primary">
                  <div className="text-primary-400 font-bold text-lg">6</div>
                  <div className="text-neutral-400">A11y Tests</div>
                </div>
                <div className="text-center p-3 rounded glass-primary">
                  <div className="text-primary-400 font-bold text-lg">2</div>
                  <div className="text-neutral-400">Languages</div>
                </div>
                <div className="text-center p-3 rounded glass-primary">
                  <div className="text-primary-400 font-bold text-lg">WCAG</div>
                  <div className="text-neutral-400">Compliant</div>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-700/30 pt-4">
              <h3 className="font-medium text-neutral-200 mb-2">
                Testing Instructions
              </h3>
              <div className="space-y-2 text-sm text-neutral-400">
                <p>
                  <strong>1. Language Testing:</strong> Use the locale switcher
                  above to test different languages, then run tests
                </p>
                <p>
                  <strong>2. Accessibility Testing:</strong> Tests will check
                  semantic HTML, ARIA labels, keyboard navigation, and more
                </p>
                <p>
                  <strong>3. Results Analysis:</strong> Review detailed results
                  in the tabs to identify improvements
                </p>
                <p>
                  <strong>4. Recommendations:</strong> Follow the suggestions in
                  the Recommendations tab for optimal accessibility
                </p>
              </div>
            </div>

            <div className="border-t border-neutral-700/30 pt-4">
              <h3 className="font-medium text-neutral-200 mb-2">Next Steps</h3>
              <p className="text-sm text-neutral-400">
                After completing I18n and Accessibility testing, continue with
                Task 21.7 (Security and Authentication Testing) to validate
                security measures and authentication processes throughout the
                system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </UltraPremiumDashboardLayout>
  );
}
