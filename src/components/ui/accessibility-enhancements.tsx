"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// Accessibility preferences context
interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  focusVisible: boolean;
  screenReader: boolean;
}

const AccessibilityContext = createContext<{
  preferences: AccessibilityPreferences;
  updatePreference: (
    key: keyof AccessibilityPreferences,
    value: boolean
  ) => void;
}>({
  preferences: {
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    focusVisible: true,
    screenReader: false,
  },
  updatePreference: () => {},
});

// Accessibility Provider
export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    focusVisible: true,
    screenReader: false,
  });

  useEffect(() => {
    // Detect system preferences
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const highContrast = window.matchMedia("(prefers-contrast: high)").matches;

    // Detect screen reader
    const screenReader =
      window.navigator.userAgent.includes("NVDA") ||
      window.navigator.userAgent.includes("JAWS") ||
      window.speechSynthesis !== undefined;

    setPreferences(prev => ({
      ...prev,
      reducedMotion,
      highContrast,
      screenReader,
    }));

    // Apply CSS classes based on preferences
    const root = document.documentElement;
    if (reducedMotion) root.classList.add("reduced-motion");
    if (highContrast) root.classList.add("high-contrast");
    if (screenReader) root.classList.add("screen-reader-active");
  }, []);

  const updatePreference = (
    key: keyof AccessibilityPreferences,
    value: boolean
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));

    // Apply changes to DOM
    const root = document.documentElement;
    if (key === "reducedMotion") {
      root.classList.toggle("reduced-motion", value);
    }
    if (key === "highContrast") {
      root.classList.toggle("high-contrast", value);
    }
    if (key === "largeText") {
      root.classList.toggle("large-text", value);
    }
  };

  return (
    <AccessibilityContext.Provider value={{ preferences, updatePreference }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => useContext(AccessibilityContext);

// Enhanced Focus Management
export function FocusManager({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let focusedElement: HTMLElement | null = null;

    const handleFocusIn = (event: FocusEvent) => {
      focusedElement = event.target as HTMLElement;

      // Add enhanced focus indicators
      if (focusedElement) {
        focusedElement.setAttribute("data-focus-visible", "true");
      }
    };

    const handleFocusOut = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      target.removeAttribute("data-focus-visible");
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip to main content (Alt + S)
      if (event.altKey && event.key === "s") {
        event.preventDefault();
        const main = document.querySelector("main");
        if (main) {
          main.focus();
          main.scrollIntoView({ behavior: "smooth" });
        }
      }

      // Skip to navigation (Alt + N)
      if (event.altKey && event.key === "n") {
        event.preventDefault();
        const nav = document.querySelector("nav");
        if (nav) {
          const firstLink = nav.querySelector("a, button");
          if (firstLink) {
            (firstLink as HTMLElement).focus();
          }
        }
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return <>{children}</>;
}

// Screen Reader Announcements
export function ScreenReaderAnnouncer() {
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const announcer = (message: string) => {
      setAnnouncement(message);
      setTimeout(() => setAnnouncement(""), 1000);
    };

    // Global announcer function
    (window as any).announceToScreenReader = announcer;

    return () => {
      delete (window as any).announceToScreenReader;
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      id="screen-reader-announcer"
    >
      {announcement}
    </div>
  );
}

// Skip Links Component
export function SkipLinks() {
  return (
    <div className="skip-links">
      <a
        href="#main-content"
        className="skip-link"
        onFocus={e => e.target.scrollIntoView()}
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="skip-link"
        onFocus={e => e.target.scrollIntoView()}
      >
        Skip to navigation
      </a>
      <a
        href="#search"
        className="skip-link"
        onFocus={e => e.target.scrollIntoView()}
      >
        Skip to search
      </a>
    </div>
  );
}

// Enhanced Button with full accessibility
interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

export function AccessibleButton({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  disabled,
  ...props
}: AccessibleButtonProps) {
  const { preferences } = useAccessibility();
  const isDisabled = disabled || loading;

  return (
    <NormalButton
      {...props}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-describedby={loading ? "loading-description" : undefined}
      className={`
        accessible-button
        accessible-button--${variant}
        accessible-button--${size}
        ${preferences.largeText ? "large-text" : ""}
        ${preferences.highContrast ? "high-contrast" : ""}
        ${isDisabled ? "disabled" : ""}
        ${props.className || ""}
      `}
    >
      {loading && (
        <>
          <span className="loading-spinner" aria-hidden="true" />
          <span id="loading-description" className="sr-only">
            Loading, please wait
          </span>
        </>
      )}
      <span className={loading ? "loading-text" : ""}>{children}</span>
    </NormalButton>
  );
}

// Accessibility Testing Utilities
export function AccessibilityTester() {
  const [issues, setIssues] = useState<string[]>([]);

  useEffect(() => {
    const runAccessibilityCheck = () => {
      const foundIssues: string[] = [];

      // Check for missing alt text
      const images = document.querySelectorAll("img:not([alt])");
      if (images.length > 0) {
        foundIssues.push(`${images.length} images missing alt text`);
      }

      // Check for low contrast ratios
      const buttons = document.querySelectorAll("button, a");
      buttons.forEach(() => {
        // Add contrast checking logic here
      });

      // Check for keyboard accessibility
      const interactiveElements = document.querySelectorAll(
        "button, a, input, select, textarea, [tabindex]"
      );
      interactiveElements.forEach(el => {
        if (
          el.getAttribute("tabindex") === "-1" &&
          !el.hasAttribute("aria-hidden")
        ) {
          foundIssues.push("Interactive element not keyboard accessible");
        }
      });

      setIssues(foundIssues);
    };

    // Run check on component mount and on DOM changes
    runAccessibilityCheck();

    const observer = new MutationObserver(runAccessibilityCheck);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => observer.disconnect();
  }, []);

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="accessibility-tester">
      {issues.length > 0 && (
        <div className="accessibility-issues">
          <h3>Accessibility Issues Found:</h3>
          <ul>
            {issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
