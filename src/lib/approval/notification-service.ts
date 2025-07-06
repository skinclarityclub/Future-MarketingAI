/**
 * Notification Service for Approval Workflow
 *
 * Handles real-time notifications, activity feeds, and communication
 * for collaborative content review and approval processes
 */

import { createBrowserClient } from "@supabase/ssr";

export interface NotificationEvent {
  id: string;
  type: NotificationEventType;
  title: string;
  message: string;
  data: Record<string, any>;
  recipients: NotificationRecipient[];
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  priority: "low" | "medium" | "high" | "urgent";
  category:
    | "approval"
    | "annotation"
    | "collaboration"
    | "deadline"
    | "mention"
    | "system";
  channels: NotificationChannel[];
  status: "pending" | "sent" | "delivered" | "read" | "failed";
  created_at: string;
  sent_at?: string;
  expires_at?: string;
  metadata: Record<string, any>;
}

export type NotificationEventType =
  | "approval_request"
  | "approval_approved"
  | "approval_rejected"
  | "approval_revision_requested"
  | "annotation_added"
  | "annotation_replied"
  | "annotation_resolved"
  | "mention_added"
  | "session_started"
  | "session_ended"
  | "participant_joined"
  | "participant_left"
  | "deadline_approaching"
  | "deadline_passed"
  | "workflow_escalated"
  | "workflow_completed"
  | "content_updated"
  | "content_locked"
  | "content_unlocked"
  | "bulk_operation_completed";

export interface NotificationRecipient {
  user_id: string;
  user_name: string;
  user_email: string;
  role: string;
  preferences: NotificationPreferences;
  delivery_status: "pending" | "sent" | "delivered" | "read" | "failed";
  delivered_at?: string;
  read_at?: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  email: boolean;
  push: boolean;
  in_app: boolean;
  slack: boolean;
  telegram: boolean;
  digest_frequency: "immediate" | "hourly" | "daily" | "weekly" | "never";
  quiet_hours: {
    enabled: boolean;
    start_time: string;
    end_time: string;
    timezone: string;
  };
  categories: {
    approval: boolean;
    annotation: boolean;
    collaboration: boolean;
    deadline: boolean;
    mention: boolean;
    system: boolean;
  };
}

export type NotificationChannel =
  | "in_app"
  | "email"
  | "push"
  | "slack"
  | "telegram"
  | "webhook";

export interface ActivityFeedItem {
  id: string;
  type: string;
  title: string;
  description: string;
  actor_id: string;
  actor_name: string;
  actor_avatar?: string;
  target_type: "workflow_item" | "annotation" | "session" | "user";
  target_id: string;
  target_name: string;
  action: string;
  timestamp: string;
  metadata: Record<string, any>;
  is_read: boolean;
  importance: "low" | "medium" | "high";
}

export interface NotificationTemplate {
  id: string;
  type: NotificationEventType;
  category: string;
  subject_template: string;
  body_template: string;
  html_template?: string;
  variables: string[];
  default_channels: NotificationChannel[];
  priority: "low" | "medium" | "high" | "urgent";
  auto_expire_hours?: number;
  localized_templates: Record<
    string,
    {
      subject: string;
      body: string;
      html?: string;
    }
  >;
}

export interface BulkNotificationJob {
  id: string;
  name: string;
  type: NotificationEventType;
  recipients: string[];
  template_id: string;
  template_variables: Record<string, any>;
  scheduled_for?: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  progress: {
    total: number;
    sent: number;
    delivered: number;
    failed: number;
  };
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_details?: string;
}

export interface NotificationStats {
  total_sent: number;
  total_delivered: number;
  total_read: number;
  delivery_rate: number;
  read_rate: number;
  bounce_rate: number;
  avg_read_time_minutes: number;
  popular_channels: { channel: NotificationChannel; count: number }[];
  peak_hours: { hour: number; count: number }[];
  category_breakdown: { category: string; count: number }[];
}

/**
 * Real-time Notification Service
 * Handles all aspects of notification delivery and management
 */
export class NotificationService {
  private supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  private eventListeners: Map<string, Function[]> = new Map();
  private webSocket?: WebSocket;
  private retryQueue: NotificationEvent[] = [];
  private templates: Map<string, NotificationTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
    this.setupWebSocket();
    this.startRetryProcessor();
  }

  /**
   * Send a notification to specified recipients
   */
  async sendNotification(
    type: NotificationEventType,
    recipients: string[],
    data: {
      title: string;
      message: string;
      metadata?: Record<string, any>;
      priority?: "low" | "medium" | "high" | "urgent";
      channels?: NotificationChannel[];
      expires_in_hours?: number;
    }
  ): Promise<NotificationEvent> {
    try {
      const notificationEvent: NotificationEvent = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        title: data.title,
        message: data.message,
        data: data.metadata || {},
        recipients: await this.buildRecipientList(recipients),
        sender_id: "system", // In real app, get from auth context
        sender_name: "System",
        priority: data.priority || "medium",
        category: this.getCategoryFromType(type),
        channels: data.channels || ["in_app", "email"],
        status: "pending",
        created_at: new Date().toISOString(),
        expires_at: data.expires_in_hours
          ? new Date(
              Date.now() + data.expires_in_hours * 60 * 60 * 1000
            ).toISOString()
          : undefined,
        metadata: data.metadata || {},
      };

      // Process notification through channels
      await this.processNotificationChannels(notificationEvent);

      // Update activity feed
      await this.updateActivityFeed(notificationEvent);

      // Emit real-time event
      this.emitRealTimeEvent("notification_sent", notificationEvent);

      console.log("Notification sent:", notificationEvent);
      return notificationEvent;
    } catch (error) {
      console.error("Error sending notification:", error);
      throw new Error(`Failed to send notification: ${error}`);
    }
  }

  /**
   * Send approval request notification
   */
  async sendApprovalRequest(
    workflowItemId: string,
    contentTitle: string,
    approvers: string[],
    deadline?: string,
    priority: "low" | "medium" | "high" | "urgent" = "medium"
  ): Promise<NotificationEvent> {
    return await this.sendNotification("approval_request", approvers, {
      title: "New Approval Request",
      message: `"${contentTitle}" requires your review and approval`,
      metadata: {
        workflow_item_id: workflowItemId,
        content_title: contentTitle,
        deadline,
        action_url: `/approval/${workflowItemId}`,
      },
      priority,
      channels: ["in_app", "email", "push"],
      expires_in_hours: deadline
        ? this.calculateHoursUntilDeadline(deadline)
        : 72,
    });
  }

  /**
   * Send annotation notification
   */
  async sendAnnotationNotification(
    annotationId: string,
    contentTitle: string,
    annotationType: string,
    annotatorName: string,
    recipients: string[],
    mentionedUsers: string[] = []
  ): Promise<NotificationEvent> {
    const allRecipients = [...new Set([...recipients, ...mentionedUsers])];

    return await this.sendNotification("annotation_added", allRecipients, {
      title: "New Annotation Added",
      message: `${annotatorName} added a ${annotationType} to "${contentTitle}"`,
      metadata: {
        annotation_id: annotationId,
        content_title: contentTitle,
        annotation_type: annotationType,
        annotator_name: annotatorName,
        mentioned_users: mentionedUsers,
        action_url: `/review/${annotationId}`,
      },
      priority: mentionedUsers.length > 0 ? "high" : "medium",
      channels:
        mentionedUsers.length > 0 ? ["in_app", "email", "push"] : ["in_app"],
    });
  }

  /**
   * Send collaboration session notification
   */
  async sendSessionNotification(
    sessionId: string,
    sessionName: string,
    eventType: "started" | "ended" | "participant_joined" | "participant_left",
    participants: string[],
    actorName?: string
  ): Promise<NotificationEvent> {
    const messages = {
      started: `Collaboration session "${sessionName}" has started`,
      ended: `Collaboration session "${sessionName}" has ended`,
      participant_joined: `${actorName} joined the collaboration session`,
      participant_left: `${actorName} left the collaboration session`,
    };

    return await this.sendNotification(
      eventType === "started"
        ? "session_started"
        : eventType === "ended"
          ? "session_ended"
          : eventType === "participant_joined"
            ? "participant_joined"
            : "participant_left",
      participants,
      {
        title: "Collaboration Update",
        message: messages[eventType],
        metadata: {
          session_id: sessionId,
          session_name: sessionName,
          actor_name: actorName,
          action_url: `/session/${sessionId}`,
        },
        priority: eventType === "started" ? "high" : "low",
        channels: ["in_app", "push"],
      }
    );
  }

  /**
   * Send deadline notification
   */
  async sendDeadlineNotification(
    workflowItemId: string,
    contentTitle: string,
    deadline: string,
    recipients: string[],
    hoursRemaining: number
  ): Promise<NotificationEvent> {
    const priority =
      hoursRemaining <= 2 ? "urgent" : hoursRemaining <= 24 ? "high" : "medium";

    return await this.sendNotification("deadline_approaching", recipients, {
      title: "Approval Deadline Approaching",
      message: `"${contentTitle}" approval deadline is in ${hoursRemaining} hours`,
      metadata: {
        workflow_item_id: workflowItemId,
        content_title: contentTitle,
        deadline,
        hours_remaining: hoursRemaining,
        action_url: `/approval/${workflowItemId}`,
      },
      priority,
      channels:
        priority === "urgent"
          ? ["in_app", "email", "push", "slack"]
          : ["in_app", "email"],
    });
  }

  /**
   * Get activity feed for user
   */
  async getActivityFeed(
    userId: string,
    limit: number = 50,
    offset: number = 0,
    filters?: {
      type?: string[];
      importance?: string[];
      unread_only?: boolean;
    }
  ): Promise<ActivityFeedItem[]> {
    try {
      // Mock implementation - in real app would query database
      const mockActivities: ActivityFeedItem[] = [
        {
          id: "activity-001",
          type: "approval_request",
          title: "New Approval Request",
          description:
            'Sarah Johnson requested approval for "Q4 Marketing Campaign"',
          actor_id: "user-1",
          actor_name: "Sarah Johnson",
          actor_avatar: "/avatars/sarah.jpg",
          target_type: "workflow_item",
          target_id: "wf-001",
          target_name: "Q4 Marketing Campaign",
          action: "requested approval",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          metadata: {},
          is_read: false,
          importance: "high",
        },
        {
          id: "activity-002",
          type: "annotation_added",
          title: "New Annotation",
          description: "Mike Chen added a suggestion to your content",
          actor_id: "user-2",
          actor_name: "Mike Chen",
          actor_avatar: "/avatars/mike.jpg",
          target_type: "annotation",
          target_id: "ann-001",
          target_name: "Content Review",
          action: "added annotation",
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          metadata: { annotation_type: "suggestion" },
          is_read: true,
          importance: "medium",
        },
      ];

      // Apply filters
      let filteredActivities = mockActivities;
      if (filters) {
        if (filters.type && filters.type.length > 0) {
          filteredActivities = filteredActivities.filter(a =>
            filters.type!.includes(a.type)
          );
        }
        if (filters.importance && filters.importance.length > 0) {
          filteredActivities = filteredActivities.filter(a =>
            filters.importance!.includes(a.importance)
          );
        }
        if (filters.unread_only) {
          filteredActivities = filteredActivities.filter(a => !a.is_read);
        }
      }

      return filteredActivities.slice(offset, offset + limit);
    } catch (error) {
      console.error("Error getting activity feed:", error);
      throw new Error(`Failed to get activity feed: ${error}`);
    }
  }

  /**
   * Mark notifications as read
   */
  async markAsRead(notificationIds: string[], userId: string): Promise<void> {
    try {
      // In real implementation, update database
      console.log(
        `Marking notifications as read for user ${userId}:`,
        notificationIds
      );

      // Emit real-time event
      this.emitRealTimeEvent("notifications_read", {
        notification_ids: notificationIds,
        user_id: userId,
      });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      throw new Error(`Failed to mark notifications as read: ${error}`);
    }
  }

  /**
   * Get notification preferences for user
   */
  async getNotificationPreferences(
    userId: string
  ): Promise<NotificationPreferences> {
    try {
      // Mock implementation
      return {
        enabled: true,
        email: true,
        push: true,
        in_app: true,
        slack: false,
        telegram: false,
        digest_frequency: "immediate",
        quiet_hours: {
          enabled: true,
          start_time: "22:00",
          end_time: "08:00",
          timezone: "Europe/Amsterdam",
        },
        categories: {
          approval: true,
          annotation: true,
          collaboration: true,
          deadline: true,
          mention: true,
          system: false,
        },
      };
    } catch (error) {
      console.error("Error getting notification preferences:", error);
      throw new Error(`Failed to get notification preferences: ${error}`);
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    try {
      // In real implementation, update database
      const currentPrefs = await this.getNotificationPreferences(userId);
      const updatedPrefs = { ...currentPrefs, ...preferences };

      console.log(
        `Updated notification preferences for user ${userId}:`,
        updatedPrefs
      );

      return updatedPrefs;
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      throw new Error(`Failed to update notification preferences: ${error}`);
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(
    dateRange: { start: string; end: string },
    filters?: { type?: string[]; category?: string[] }
  ): Promise<NotificationStats> {
    try {
      // Mock implementation
      return {
        total_sent: 1247,
        total_delivered: 1198,
        total_read: 892,
        delivery_rate: 96.1,
        read_rate: 74.5,
        bounce_rate: 3.9,
        avg_read_time_minutes: 4.2,
        popular_channels: [
          { channel: "in_app", count: 847 },
          { channel: "email", count: 623 },
          { channel: "push", count: 445 },
          { channel: "slack", count: 156 },
        ],
        peak_hours: [
          { hour: 9, count: 156 },
          { hour: 14, count: 134 },
          { hour: 16, count: 128 },
        ],
        category_breakdown: [
          { category: "approval", count: 456 },
          { category: "annotation", count: 378 },
          { category: "collaboration", count: 267 },
          { category: "deadline", count: 146 },
        ],
      };
    } catch (error) {
      console.error("Error getting notification stats:", error);
      throw new Error(`Failed to get notification stats: ${error}`);
    }
  }

  /**
   * Subscribe to real-time events
   */
  public subscribe(eventType: string, callback: Function): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  /**
   * Unsubscribe from real-time events
   */
  public unsubscribe(eventType: string, callback: Function): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Initialize notification templates
   */
  private initializeTemplates(): void {
    // Mock templates - in real app would load from database
    const templates: NotificationTemplate[] = [
      {
        id: "approval_request",
        type: "approval_request",
        category: "approval",
        subject_template: "Approval Required: {{content_title}}",
        body_template:
          'Please review and approve "{{content_title}}" by {{deadline}}.',
        variables: ["content_title", "deadline", "action_url"],
        default_channels: ["in_app", "email"],
        priority: "medium",
        auto_expire_hours: 72,
        localized_templates: {
          nl: {
            subject: "Goedkeuring Vereist: {{content_title}}",
            body: 'Beoordeel en keur "{{content_title}}" goed voor {{deadline}}.',
          },
        },
      },
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Setup WebSocket connection for real-time notifications
   */
  private setupWebSocket(): void {
    try {
      // Mock WebSocket setup
      console.log("Setting up WebSocket connection for notifications");
    } catch (error) {
      console.error("Error setting up WebSocket:", error);
    }
  }

  /**
   * Start retry processor for failed notifications
   */
  private startRetryProcessor(): void {
    setInterval(() => {
      if (this.retryQueue.length > 0) {
        console.log(
          `Processing retry queue: ${this.retryQueue.length} notifications`
        );
        // Process retry queue
      }
    }, 60000); // Check every minute
  }

  /**
   * Build recipient list with preferences
   */
  private async buildRecipientList(
    userIds: string[]
  ): Promise<NotificationRecipient[]> {
    const recipients: NotificationRecipient[] = [];

    for (const userId of userIds) {
      const preferences = await this.getNotificationPreferences(userId);
      recipients.push({
        user_id: userId,
        user_name: `User ${userId}`, // In real app, get from user service
        user_email: `user${userId}@example.com`,
        role: "reviewer",
        preferences,
        delivery_status: "pending",
      });
    }

    return recipients;
  }

  /**
   * Process notification through various channels
   */
  private async processNotificationChannels(
    notification: NotificationEvent
  ): Promise<void> {
    for (const channel of notification.channels) {
      try {
        switch (channel) {
          case "in_app":
            await this.sendInAppNotification(notification);
            break;
          case "email":
            await this.sendEmailNotification(notification);
            break;
          case "push":
            await this.sendPushNotification(notification);
            break;
          case "slack":
            await this.sendSlackNotification(notification);
            break;
        }
      } catch (error) {
        console.error(`Error sending ${channel} notification:`, error);
        this.retryQueue.push(notification);
      }
    }
  }

  private async sendInAppNotification(
    notification: NotificationEvent
  ): Promise<void> {
    console.log("Sending in-app notification:", notification.title);
  }

  private async sendEmailNotification(
    notification: NotificationEvent
  ): Promise<void> {
    console.log("Sending email notification:", notification.title);
  }

  private async sendPushNotification(
    notification: NotificationEvent
  ): Promise<void> {
    console.log("Sending push notification:", notification.title);
  }

  private async sendSlackNotification(
    notification: NotificationEvent
  ): Promise<void> {
    console.log("Sending Slack notification:", notification.title);
  }

  private getCategoryFromType(type: NotificationEventType): string {
    if (type.includes("approval")) return "approval";
    if (type.includes("annotation")) return "annotation";
    if (type.includes("session") || type.includes("participant"))
      return "collaboration";
    if (type.includes("deadline")) return "deadline";
    if (type.includes("mention")) return "mention";
    return "system";
  }

  private calculateHoursUntilDeadline(deadline: string): number {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    return Math.max(
      0,
      Math.floor((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60))
    );
  }

  private async updateActivityFeed(
    notification: NotificationEvent
  ): Promise<void> {
    // In real implementation, update activity feed database
    console.log("Updating activity feed for notification:", notification.id);
  }

  private emitRealTimeEvent(eventType: string, data: any): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(listener => listener(data));
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.webSocket) {
      this.webSocket.close();
    }
    this.eventListeners.clear();
    this.retryQueue.length = 0;
  }
}
