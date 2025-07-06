/**
 * User Behavior Tracker
 * Core tracking utility for capturing user interactions and behavior patterns
 */

"use client";

import {
  UserBehaviorEvent,
  UserBehaviorEventType,
  EventData,
  DeviceInfo,
  UserSession,
  TrackingConfig,
  TrackingQueue,
  PageViewData,
  ClickTrackingData,
} from "./user-behavior-types";

export class UserBehaviorTracker {
  private config: TrackingConfig;
  private queue: TrackingQueue;
  private currentSession: UserSession | null = null;
  private isInitialized = false;
  private flushTimeout: NodeJS.Timeout | null = null;
  private lastScrollDepth = 0;
  private pageLoadTime: number = Date.now();

  constructor(config: Partial<TrackingConfig> = {}) {
    this.config = {
      enabled: true,
      track_page_views: true,
      track_clicks: true,
      track_scrolls: true,
      track_forms: true,
      track_videos: true,
      track_searches: true,
      track_errors: true,
      sample_rate: 1.0,
      batch_size: 10,
      flush_interval: 30000, // 30 seconds
      storage_type: "sessionStorage",
      include_pii: false,
      exclude_elements: [
        '[data-tracking="false"]',
        ".no-track",
        "script",
        "style",
        "meta",
        "link",
      ],
      ...config,
    };

    this.queue = {
      events: [],
      max_size: this.config.batch_size,
      auto_flush: true,
      flush_interval: this.config.flush_interval,
    };

    if (typeof window !== "undefined") {
      this.initialize();
    }
  }

  /**
   * Initialize the tracker and set up event listeners
   */
  private initialize(): void {
    if (this.isInitialized || !this.config.enabled) return;

    try {
      this.setupEventListeners();
      this.startSession();
      this.trackPageView();
      this.startAutoFlush();
      this.isInitialized = true;

      if (process.env.NODE_ENV === "development") {
        console.log("User Behavior Tracker initialized");
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to initialize User Behavior Tracker:", error);
      }
    }
  }

  /**
   * Set up all event listeners for tracking
   */
  private setupEventListeners(): void {
    if (this.config.track_clicks) {
      document.addEventListener("click", this.handleClick.bind(this), true);
    }

    if (this.config.track_scrolls) {
      window.addEventListener("scroll", this.handleScroll.bind(this), {
        passive: true,
      });
    }

    if (this.config.track_forms) {
      document.addEventListener(
        "submit",
        this.handleFormSubmit.bind(this),
        true
      );
      document.addEventListener(
        "focusin",
        this.handleFormFocus.bind(this),
        true
      );
      document.addEventListener(
        "focusout",
        this.handleFormBlur.bind(this),
        true
      );
    }

    if (this.config.track_errors) {
      window.addEventListener("error", this.handleError.bind(this), true);
      window.addEventListener(
        "unhandledrejection",
        this.handlePromiseRejection.bind(this),
        true
      );
    }

    // Page visibility and unload events
    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this)
    );
    window.addEventListener("beforeunload", this.handleBeforeUnload.bind(this));

    // Navigation events (for SPAs)
    if (typeof window !== "undefined" && window.history) {
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;

      window.history.pushState = (...args) => {
        originalPushState.apply(window.history, args);
        this.trackNavigation();
      };

      window.history.replaceState = (...args) => {
        originalReplaceState.apply(window.history, args);
        this.trackNavigation();
      };

      window.addEventListener("popstate", this.trackNavigation.bind(this));
    }
  }

  /**
   * Handle click events
   */
  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (this.shouldExcludeElement(target)) return;

    const clickData: ClickTrackingData = {
      element: target,
      coordinates: { x: event.clientX, y: event.clientY },
      timestamp: Date.now(),
    };

    this.trackEvent("click", {
      element_type: target.tagName.toLowerCase(),
      element_id: target.id || undefined,
      element_class: target.className || undefined,
      element_text: this.getElementText(target),
      click_coordinates: clickData.coordinates,
      element_position: this.getElementPosition(target),
    });
  }

  /**
   * Handle scroll events
   */
  private handleScroll(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const scrollDepth = Math.round(
      (scrollTop / (documentHeight - viewportHeight)) * 100
    );

    if (scrollDepth > this.lastScrollDepth) {
      this.trackEvent("scroll", {
        scroll_depth: scrollDepth,
        scroll_direction: "down",
        max_scroll_depth: Math.max(this.lastScrollDepth, scrollDepth),
        viewport_size: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      });

      this.lastScrollDepth = scrollDepth;
    }
  }

  /**
   * Handle form submissions
   */
  private handleFormSubmit(event: SubmitEvent): void {
    const form = event.target as HTMLFormElement;

    if (this.shouldExcludeElement(form)) return;

    this.trackEvent("form_submit", {
      form_id: form.id || form.name || undefined,
      element_type: "form",
      element_id: form.id || undefined,
    });
  }

  /**
   * Handle form focus events
   */
  private handleFormFocus(event: FocusEvent): void {
    const target = event.target as HTMLElement;

    if (!this.isFormElement(target) || this.shouldExcludeElement(target))
      return;

    this.trackEvent("form_focus", {
      form_id: this.getFormId(target),
      field_name: this.getFieldName(target),
      element_type: target.tagName.toLowerCase(),
      element_id: target.id || undefined,
    });
  }

  /**
   * Handle form blur events
   */
  private handleFormBlur(event: FocusEvent): void {
    const target = event.target as HTMLElement;

    if (!this.isFormElement(target) || this.shouldExcludeElement(target))
      return;

    this.trackEvent("form_blur", {
      form_id: this.getFormId(target),
      field_name: this.getFieldName(target),
      element_type: target.tagName.toLowerCase(),
      element_id: target.id || undefined,
    });
  }

  /**
   * Handle JavaScript errors
   */
  private handleError(event: ErrorEvent): void {
    this.trackEvent("error", {
      error_message: event.message,
      error_stack: event.error?.stack,
      page_url: event.filename,
      line_number: event.lineno,
      column_number: event.colno,
    });
  }

  /**
   * Handle unhandled promise rejections
   */
  private handlePromiseRejection(event: PromiseRejectionEvent): void {
    this.trackEvent("error", {
      error_message: "Unhandled Promise Rejection",
      error_stack: event.reason?.stack || String(event.reason),
    });
  }

  /**
   * Handle page visibility changes
   */
  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.flushQueue();
    }
  }

  /**
   * Handle before unload
   */
  private handleBeforeUnload(): void {
    this.endSession();
    this.flushQueue();
  }

  /**
   * Track navigation events (for SPAs)
   */
  private trackNavigation(): void {
    setTimeout(() => {
      this.trackPageView();
    }, 0);
  }

  /**
   * Track a page view
   */
  public trackPageView(data?: Partial<PageViewData>): void {
    const pageData: PageViewData = {
      url: window.location.href,
      title: document.title,
      load_time: Date.now() - this.pageLoadTime,
      referrer: document.referrer || undefined,
      utm_params: this.extractUtmParams(),
      ...data,
    };

    this.trackEvent("page_view", {
      page_load_time: pageData.load_time,
      viewport_size: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      referrer: pageData.referrer,
      utm_source: pageData.utm_params?.source,
      utm_medium: pageData.utm_params?.medium,
      utm_campaign: pageData.utm_params?.campaign,
    });

    this.pageLoadTime = Date.now();
  }

  /**
   * Track a custom event
   */
  public trackEvent(
    eventType: UserBehaviorEventType,
    eventData: EventData = {}
  ): void {
    if (!this.config.enabled || Math.random() > this.config.sample_rate) {
      return;
    }

    const event: UserBehaviorEvent = {
      id: this.generateEventId(),
      session_id: this.currentSession?.id || "anonymous",
      user_id: undefined, // Will be set by the tracking service if user is authenticated
      event_type: eventType,
      event_data: eventData,
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      page_title: document.title,
      user_agent: navigator.userAgent,
      referrer: document.referrer || undefined,
      device_info: this.getDeviceInfo(),
      created_at: new Date().toISOString(),
    };

    this.addToQueue(event);

    // Update session metrics
    if (this.currentSession) {
      this.updateSessionMetrics(eventType);
    }
  }

  /**
   * Start a new tracking session
   */
  private startSession(): void {
    this.currentSession = {
      id: this.generateSessionId(),
      start_time: new Date().toISOString(),
      page_views: 0,
      clicks: 0,
      scrolls: 0,
      form_interactions: 0,
      entry_page: window.location.href,
      referrer: document.referrer || undefined,
      device_info: this.getDeviceInfo(),
      is_returning_visitor: this.isReturningVisitor(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.trackEvent("session_start");
  }

  /**
   * End the current tracking session
   */
  private endSession(): void {
    if (!this.currentSession) return;

    const now = new Date().toISOString();
    const startTime = new Date(this.currentSession.start_time).getTime();
    const endTime = new Date(now).getTime();

    this.currentSession.end_time = now;
    this.currentSession.duration = Math.round((endTime - startTime) / 1000);
    this.currentSession.exit_page = window.location.href;
    this.currentSession.updated_at = now;

    this.trackEvent("session_end", {
      session_duration: this.currentSession.duration,
      page_views: this.currentSession.page_views,
      clicks: this.currentSession.clicks,
      scrolls: this.currentSession.scrolls,
      form_interactions: this.currentSession.form_interactions,
    });
  }

  /**
   * Update session metrics
   */
  private updateSessionMetrics(eventType: UserBehaviorEventType): void {
    if (!this.currentSession) return;

    switch (eventType) {
      case "page_view":
        this.currentSession.page_views++;
        break;
      case "click":
        this.currentSession.clicks++;
        break;
      case "scroll":
        this.currentSession.scrolls++;
        break;
      case "form_focus":
      case "form_blur":
      case "form_submit":
        this.currentSession.form_interactions++;
        break;
    }

    this.currentSession.updated_at = new Date().toISOString();
  }

  /**
   * Add event to the queue
   */
  private addToQueue(event: UserBehaviorEvent): void {
    this.queue.events.push(event);

    if (this.queue.events.length >= this.config.batch_size) {
      this.flushQueue();
    }
  }

  /**
   * Flush the event queue
   */
  public flushQueue(): void {
    if (this.queue.events.length === 0) return;

    const events = [...this.queue.events];
    this.queue.events = [];

    // Send events to the tracking service
    this.sendEvents(events);
  }

  /**
   * Send events to the tracking service
   */
  private async sendEvents(events: UserBehaviorEvent[]): Promise<void> {
    // Prevent sending events before window is fully loaded
    if (typeof window === "undefined" || !this.isInitialized) {
      this.storeEventsLocally(events);
      return;
    }

    try {
      if (this.config.endpoint_url) {
        // Ensure API route is called without locale prefix
        let endpoint = this.config.endpoint_url;
        if (endpoint.startsWith("/api/")) {
          // Use absolute URL to bypass Next.js locale routing
          endpoint = `${window.location.origin}${endpoint}`;
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(this.config.api_key && {
              Authorization: `Bearer ${this.config.api_key}`,
            }),
          },
          body: JSON.stringify({ events }),
        });

        // Check if response is ok
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } else {
        // Store locally if no endpoint is configured
        this.storeEventsLocally(events);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to send tracking events, storing locally:", error);
      }
      // Fallback to local storage instead of re-adding to queue
      this.storeEventsLocally(events);
    }
  }

  /**
   * Store events locally
   */
  private storeEventsLocally(events: UserBehaviorEvent[]): void {
    try {
      const storageKey = "user_behavior_events";
      const storage =
        this.config.storage_type === "localStorage"
          ? localStorage
          : sessionStorage;

      const existingEvents = JSON.parse(storage.getItem(storageKey) || "[]");
      const allEvents = [...existingEvents, ...events];

      // Keep only the latest 1000 events to prevent storage bloat
      const eventsToStore = allEvents.slice(-1000);

      storage.setItem(storageKey, JSON.stringify(eventsToStore));
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to store events locally:", error);
      }
    }
  }

  /**
   * Start auto-flush interval
   */
  private startAutoFlush(): void {
    if (this.queue.auto_flush) {
      this.flushTimeout = setInterval(() => {
        this.flushQueue();
      }, this.queue.flush_interval);
    }
  }

  /**
   * Stop auto-flush interval
   */
  private stopAutoFlush(): void {
    if (this.flushTimeout) {
      clearInterval(this.flushTimeout);
      this.flushTimeout = null;
    }
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;

    return {
      screen_resolution: {
        width: window.screen.width,
        height: window.screen.height,
      },
      viewport_size: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      device_type: this.getDeviceType(),
      browser: this.getBrowserName(userAgent),
      browser_version: this.getBrowserVersion(userAgent),
      os: this.getOperatingSystem(userAgent),
      os_version: this.getOSVersion(userAgent),
      is_touch_device: "ontouchstart" in window,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  /**
   * Utility methods
   */
  private shouldExcludeElement(element: HTMLElement): boolean {
    return (
      this.config.exclude_elements?.some(selector =>
        element.matches(selector)
      ) || false
    );
  }

  private isFormElement(element: HTMLElement): boolean {
    const formElements = ["input", "textarea", "select"];
    return formElements.includes(element.tagName.toLowerCase());
  }

  private getElementText(element: HTMLElement): string {
    return element.textContent?.trim().substring(0, 100) || "";
  }

  private getElementPosition(element: HTMLElement): { x: number; y: number } {
    const rect = element.getBoundingClientRect();
    return {
      x: Math.round(rect.left),
      y: Math.round(rect.top),
    };
  }

  private getFormId(element: HTMLElement): string | undefined {
    const form = element.closest("form");
    return form?.id || form?.getAttribute("name") || undefined;
  }

  private getFieldName(element: HTMLElement): string | undefined {
    return (element as HTMLInputElement).name || element.id || undefined;
  }

  private extractUtmParams(): { [key: string]: string } | undefined {
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams: { [key: string]: string } = {};

    [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
    ].forEach(param => {
      const value = urlParams.get(param);
      if (value) {
        utmParams[param.replace("utm_", "")] = value;
      }
    });

    return Object.keys(utmParams).length > 0 ? utmParams : undefined;
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isReturningVisitor(): boolean {
    const hasVisited = localStorage.getItem("tracking_first_visit");
    if (!hasVisited) {
      localStorage.setItem("tracking_first_visit", Date.now().toString());
      return false;
    }
    return true;
  }

  private getDeviceType(): "desktop" | "tablet" | "mobile" {
    const width = window.innerWidth;
    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  }

  private getBrowserName(userAgent: string): string {
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Unknown";
  }

  private getBrowserVersion(userAgent: string): string {
    const match = userAgent.match(
      /(?:Chrome|Firefox|Safari|Edge)\/(\d+\.?\d*)/
    );
    return match ? match[1] : "Unknown";
  }

  private getOperatingSystem(userAgent: string): string {
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Mac")) return "macOS";
    if (userAgent.includes("Linux")) return "Linux";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("iOS")) return "iOS";
    return "Unknown";
  }

  private getOSVersion(userAgent: string): string {
    const patterns = [
      /Windows NT ([\d.]+)/,
      /Mac OS X ([\d._]+)/,
      /Android ([\d.]+)/,
      /OS ([\d_]+)/,
    ];

    for (const pattern of patterns) {
      const match = userAgent.match(pattern);
      if (match) {
        return match[1].replace(/_/g, ".");
      }
    }

    return "Unknown";
  }

  /**
   * Public API methods
   */
  public setUserId(userId: string): void {
    if (this.currentSession) {
      this.currentSession.user_id = userId;
    }
  }

  public setConfig(newConfig: Partial<TrackingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getSession(): UserSession | null {
    return this.currentSession;
  }

  public getQueuedEvents(): UserBehaviorEvent[] {
    return [...this.queue.events];
  }

  public clearQueue(): void {
    this.queue.events = [];
  }

  public destroy(): void {
    this.stopAutoFlush();
    this.flushQueue();
    this.isInitialized = false;

    // Remove event listeners
    document.removeEventListener("click", this.handleClick.bind(this), true);
    window.removeEventListener("scroll", this.handleScroll.bind(this));
    document.removeEventListener(
      "submit",
      this.handleFormSubmit.bind(this),
      true
    );
    document.removeEventListener(
      "focusin",
      this.handleFormFocus.bind(this),
      true
    );
    document.removeEventListener(
      "focusout",
      this.handleFormBlur.bind(this),
      true
    );
    window.removeEventListener("error", this.handleError.bind(this), true);
    window.removeEventListener(
      "unhandledrejection",
      this.handlePromiseRejection.bind(this),
      true
    );
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this)
    );
    window.removeEventListener(
      "beforeunload",
      this.handleBeforeUnload.bind(this)
    );
  }
}
