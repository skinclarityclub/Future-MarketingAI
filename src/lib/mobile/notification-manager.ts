/**
 * Mobile Notification Manager
 * Task 103.9: Mobile-First, Touch-Optimized Interface with On-the-Go Tools
 *
 * Features:
 * - Push notification management
 * - Content posting reminders
 * - Engagement alerts
 * - Performance notifications
 * - Trend alerts
 * - Battery and connectivity awareness
 */

export interface NotificationConfig {
  id: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
  actions?: NotificationAction[];
  data?: any;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  contentReminders: boolean;
  engagementAlerts: boolean;
  performanceUpdates: boolean;
  trendingAlerts: boolean;
  quietHours: {
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
  platforms: string[];
  frequency: "instant" | "hourly" | "daily";
}

export class MobileNotificationManager {
  private static instance: MobileNotificationManager;
  private preferences: NotificationPreferences;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  private constructor() {
    this.preferences = {
      enabled: true,
      contentReminders: true,
      engagementAlerts: true,
      performanceUpdates: false,
      trendingAlerts: true,
      quietHours: {
        start: "22:00",
        end: "08:00",
      },
      platforms: ["all"],
      frequency: "instant",
    };

    this.initializeServiceWorker();
  }

  public static getInstance(): MobileNotificationManager {
    if (!MobileNotificationManager.instance) {
      MobileNotificationManager.instance = new MobileNotificationManager();
    }
    return MobileNotificationManager.instance;
  }

  private async initializeServiceWorker(): Promise<void> {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        this.serviceWorkerRegistration = registration;
        console.log("Service Worker registered:", registration);
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    }
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      throw new Error("This browser does not support notifications");
    }

    let permission = Notification.permission;

    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission === "granted") {
      console.log("Notification permission granted");
    } else if (permission === "denied") {
      console.warn("Notification permission denied");
    }

    return permission;
  }

  public async sendNotification(config: NotificationConfig): Promise<void> {
    if (!this.preferences.enabled || !this.isWithinAllowedHours()) {
      return;
    }

    const permission = await this.requestPermission();
    if (permission !== "granted") {
      return;
    }

    const notificationOptions: NotificationOptions = {
      body: config.body,
      icon: config.icon || "/icon-192x192.png",
      badge: config.badge || "/badge-72x72.png",
      image: config.image,
      tag: config.tag,
      requireInteraction: config.requireInteraction || false,
      silent: config.silent || false,
      timestamp: config.timestamp || Date.now(),
      actions: config.actions || [],
      data: config.data || {},
    };

    if (this.serviceWorkerRegistration) {
      // Use service worker for better reliability
      await this.serviceWorkerRegistration.showNotification(
        config.title,
        notificationOptions
      );
    } else {
      // Fallback to regular notification
      new Notification(config.title, notificationOptions);
    }
  }

  public async scheduleContentReminder(
    contentTitle: string,
    scheduledTime: Date
  ): Promise<void> {
    if (!this.preferences.contentReminders) return;

    const now = new Date();
    const timeUntilPost = scheduledTime.getTime() - now.getTime();

    // Schedule notification 5 minutes before
    const reminderTime = timeUntilPost - 5 * 60 * 1000;

    if (reminderTime > 0) {
      setTimeout(() => {
        this.sendNotification({
          id: `content-reminder-${Date.now()}`,
          title: "📝 Content Reminder",
          body: `"${contentTitle}" is scheduled to post in 5 minutes`,
          icon: "/content-icon.png",
          tag: "content-reminder",
          actions: [
            { action: "view", title: "View Content", icon: "/view-icon.png" },
            { action: "edit", title: "Edit", icon: "/edit-icon.png" },
          ],
          data: { type: "content-reminder", contentTitle },
        });
      }, reminderTime);
    }
  }

  public async sendEngagementAlert(
    platform: string,
    metric: string,
    value: number
  ): Promise<void> {
    if (!this.preferences.engagementAlerts) return;

    let emoji = "📈";
    let message = "";

    switch (metric) {
      case "likes":
        emoji = "❤️";
        message = `Your post got ${value} likes on ${platform}!`;
        break;
      case "comments":
        emoji = "💬";
        message = `${value} new comments on ${platform}!`;
        break;
      case "shares":
        emoji = "🔄";
        message = `Your content was shared ${value} times on ${platform}!`;
        break;
      case "views":
        emoji = "👁️";
        message = `${value} people viewed your content on ${platform}!`;
        break;
      default:
        message = `New activity on ${platform}: ${metric} increased by ${value}`;
    }

    await this.sendNotification({
      id: `engagement-${platform}-${Date.now()}`,
      title: `${emoji} Engagement Alert`,
      body: message,
      icon: `/platform-icons/${platform}.png`,
      tag: "engagement-alert",
      actions: [
        {
          action: "view-analytics",
          title: "View Analytics",
          icon: "/analytics-icon.png",
        },
        { action: "respond", title: "Respond", icon: "/respond-icon.png" },
      ],
      data: { type: "engagement", platform, metric, value },
    });
  }

  public async sendPerformanceUpdate(summary: {
    period: string;
    totalReach: number;
    totalEngagement: number;
    topPerformingPost: string;
    improvementPercentage: number;
  }): Promise<void> {
    if (!this.preferences.performanceUpdates) return;

    const trend = summary.improvementPercentage >= 0 ? "📈" : "📉";
    const message = `${summary.period} summary: ${summary.totalReach} reach, ${summary.totalEngagement} engagement. ${Math.abs(summary.improvementPercentage)}% ${summary.improvementPercentage >= 0 ? "increase" : "decrease"}.`;

    await this.sendNotification({
      id: `performance-${Date.now()}`,
      title: `${trend} Performance Update`,
      body: message,
      icon: "/performance-icon.png",
      tag: "performance-update",
      actions: [
        {
          action: "view-report",
          title: "View Full Report",
          icon: "/report-icon.png",
        },
        {
          action: "optimize",
          title: "Optimize Strategy",
          icon: "/optimize-icon.png",
        },
      ],
      data: { type: "performance", ...summary },
    });
  }

  public async sendTrendingAlert(
    keyword: string,
    platforms: string[],
    urgency: "low" | "medium" | "high"
  ): Promise<void> {
    if (!this.preferences.trendingAlerts) return;

    const urgencyEmojis = {
      low: "🔥",
      medium: "⚡",
      high: "🚨",
    };

    const emoji = urgencyEmojis[urgency];
    const platformsList = platforms.join(", ");

    await this.sendNotification({
      id: `trending-${keyword}-${Date.now()}`,
      title: `${emoji} Trending Alert`,
      body: `"${keyword}" is trending on ${platformsList}. Create content now!`,
      icon: "/trending-icon.png",
      tag: "trending-alert",
      requireInteraction: urgency === "high",
      actions: [
        {
          action: "create-content",
          title: "Create Content",
          icon: "/create-icon.png",
        },
        { action: "view-trend", title: "View Trend", icon: "/trend-icon.png" },
      ],
      data: { type: "trending", keyword, platforms, urgency },
    });
  }

  public async sendBatteryOptimizationAlert(): Promise<void> {
    await this.sendNotification({
      id: `battery-optimization-${Date.now()}`,
      title: "🔋 Battery Optimization",
      body: "Low battery detected. Consider scheduling posts instead of posting now.",
      icon: "/battery-icon.png",
      tag: "battery-optimization",
      actions: [
        {
          action: "schedule-all",
          title: "Schedule All",
          icon: "/schedule-icon.png",
        },
        {
          action: "continue",
          title: "Continue Anyway",
          icon: "/continue-icon.png",
        },
      ],
      data: { type: "battery-optimization" },
    });
  }

  public async sendConnectionAlert(isOffline: boolean): Promise<void> {
    if (isOffline) {
      await this.sendNotification({
        id: `offline-${Date.now()}`,
        title: "📡 Offline Mode",
        body: "No internet connection. Your content will be posted when connection is restored.",
        icon: "/offline-icon.png",
        tag: "connection-status",
        data: { type: "connection", status: "offline" },
      });
    } else {
      await this.sendNotification({
        id: `online-${Date.now()}`,
        title: "✅ Back Online",
        body: "Connection restored. Pending content is being posted now.",
        icon: "/online-icon.png",
        tag: "connection-status",
        data: { type: "connection", status: "online" },
      });
    }
  }

  public updatePreferences(
    newPreferences: Partial<NotificationPreferences>
  ): void {
    this.preferences = { ...this.preferences, ...newPreferences };
    localStorage.setItem(
      "notification-preferences",
      JSON.stringify(this.preferences)
    );
  }

  public getPreferences(): NotificationPreferences {
    const stored = localStorage.getItem("notification-preferences");
    if (stored) {
      this.preferences = { ...this.preferences, ...JSON.parse(stored) };
    }
    return this.preferences;
  }

  private isWithinAllowedHours(): boolean {
    if (!this.preferences.quietHours) return true;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const { start, end } = this.preferences.quietHours;

    // Handle quiet hours that span midnight
    if (start > end) {
      return currentTime < start && currentTime >= end;
    } else {
      return currentTime >= start || currentTime < end;
    }
  }

  public async clearAllNotifications(): Promise<void> {
    if (this.serviceWorkerRegistration) {
      const notifications =
        await this.serviceWorkerRegistration.getNotifications();
      notifications.forEach(notification => notification.close());
    }
  }

  public async clearNotificationsByTag(tag: string): Promise<void> {
    if (this.serviceWorkerRegistration) {
      const notifications =
        await this.serviceWorkerRegistration.getNotifications({ tag });
      notifications.forEach(notification => notification.close());
    }
  }

  // Handle notification clicks
  public handleNotificationClick(event: NotificationEvent): void {
    event.notification.close();

    const data = event.notification.data;
    const action = event.action;

    switch (data.type) {
      case "content-reminder":
        if (action === "view") {
          // Navigate to content view
          clients.openWindow("/content/view");
        } else if (action === "edit") {
          // Navigate to content editor
          clients.openWindow("/content/edit");
        }
        break;

      case "engagement":
        if (action === "view-analytics") {
          clients.openWindow(`/analytics/${data.platform}`);
        } else if (action === "respond") {
          clients.openWindow(`/platforms/${data.platform}/respond`);
        }
        break;

      case "trending":
        if (action === "create-content") {
          clients.openWindow(`/create?trend=${data.keyword}`);
        } else if (action === "view-trend") {
          clients.openWindow(`/trends/${data.keyword}`);
        }
        break;

      case "performance":
        if (action === "view-report") {
          clients.openWindow("/analytics/report");
        } else if (action === "optimize") {
          clients.openWindow("/optimize");
        }
        break;

      default:
        // Default action - open app
        clients.openWindow("/");
    }
  }
}

// Utility functions for mobile-specific features
export const detectMobileFeatures = () => {
  return {
    hasCamera:
      "mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices,
    hasGeolocation: "geolocation" in navigator,
    hasVibration: "vibrate" in navigator,
    hasServiceWorker: "serviceWorker" in navigator,
    hasNotifications: "Notification" in window,
    hasPushManager: "PushManager" in window,
    isTouchDevice: "ontouchstart" in window || navigator.maxTouchPoints > 0,
    isOnline: navigator.onLine,
    batteryAPI: "getBattery" in navigator,
    deviceMemory: (navigator as any).deviceMemory || "unknown",
    connectionType: (navigator as any).connection?.effectiveType || "unknown",
  };
};

export const getBatteryStatus = async () => {
  if ("getBattery" in navigator) {
    try {
      const battery = await (navigator as any).getBattery();
      return {
        level: Math.round(battery.level * 100),
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
      };
    } catch (error) {
      console.error("Battery API error:", error);
      return null;
    }
  }
  return null;
};

export const getConnectionInfo = () => {
  const connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;

  if (connection) {
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
    };
  }

  return null;
};

// Export singleton instance
export const notificationManager = MobileNotificationManager.getInstance();
