/**
 * Content Annotation Service
 *
 * Handles real-time collaborative content annotation, commenting,
 * and review functionality for the approval workflow system
 */

import { createBrowserClient } from "@supabase/ssr";

export interface ContentAnnotation {
  id: string;
  content_id: string;
  workflow_item_id: string;
  annotator_id: string;
  annotator_name: string;
  annotator_avatar?: string;
  x_position: number;
  y_position: number;
  width?: number;
  height?: number;
  annotation_text: string;
  annotation_type:
    | "comment"
    | "suggestion"
    | "correction"
    | "approval"
    | "rejection"
    | "question"
    | "highlight";
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "resolved" | "dismissed" | "in_progress";
  parent_annotation_id?: string; // For threaded comments
  mentioned_users: string[];
  attachments: AnnotationAttachment[];
  reactions: AnnotationReaction[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_note?: string;
}

export interface AnnotationAttachment {
  id: string;
  annotation_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface AnnotationReaction {
  id: string;
  annotation_id: string;
  user_id: string;
  user_name: string;
  reaction_type: "👍" | "👎" | "❤️" | "😀" | "😕" | "🎯" | "✅" | "❌";
  created_at: string;
}

export interface ContentVersion {
  id: string;
  content_id: string;
  version_number: number;
  content_data: string;
  content_metadata: Record<string, any>;
  created_by: string;
  created_at: string;
  change_summary: string;
  diff_data?: ContentDiff[];
}

export interface ContentDiff {
  type: "added" | "removed" | "modified" | "unchanged";
  line_number: number;
  old_content?: string;
  new_content?: string;
  context: string;
}

export interface ReviewSession {
  id: string;
  workflow_item_id: string;
  reviewer_id: string;
  reviewer_name: string;
  session_type: "individual" | "collaborative" | "live_session";
  status: "active" | "paused" | "completed" | "abandoned";
  started_at: string;
  ended_at?: string;
  activity_log: ReviewActivity[];
  participants: SessionParticipant[];
  session_notes: string;
  focus_areas: string[];
}

export interface ReviewActivity {
  id: string;
  session_id: string;
  activity_type:
    | "annotation_added"
    | "comment_replied"
    | "status_changed"
    | "mention_added"
    | "file_attached";
  description: string;
  user_id: string;
  user_name: string;
  timestamp: string;
  data: Record<string, any>;
}

export interface SessionParticipant {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  role: "reviewer" | "observer" | "moderator";
  joined_at: string;
  left_at?: string;
  active: boolean;
  cursor_position?: { x: number; y: number };
  viewing_area?: { x: number; y: number; width: number; height: number };
}

export interface CollaborativeSession {
  id: string;
  workflow_item_id: string;
  session_name: string;
  moderator_id: string;
  participants: SessionParticipant[];
  status: "scheduled" | "live" | "completed" | "cancelled";
  scheduled_start: string;
  actual_start?: string;
  actual_end?: string;
  agenda: string[];
  decisions_made: SessionDecision[];
  recording_url?: string;
  transcript?: string;
}

export interface SessionDecision {
  id: string;
  session_id: string;
  decision_type:
    | "approve"
    | "reject"
    | "request_revision"
    | "escalate"
    | "defer";
  decision_text: string;
  voting_results?: VotingResult[];
  final_decision: boolean;
  made_by: string;
  made_at: string;
}

export interface VotingResult {
  user_id: string;
  user_name: string;
  vote: "approve" | "reject" | "abstain";
  reasoning?: string;
  voted_at: string;
}

export interface RealTimeEvent {
  type:
    | "annotation_added"
    | "annotation_updated"
    | "annotation_deleted"
    | "user_joined"
    | "user_left"
    | "cursor_moved"
    | "content_updated";
  data: Record<string, any>;
  user_id: string;
  user_name: string;
  timestamp: string;
  session_id?: string;
}

/**
 * Content Annotation Service
 * Manages all annotation and collaborative review functionality
 */
export class ContentAnnotationService {
  private supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  private websocket?: WebSocket;
  private eventListeners: Map<string, Function[]> = new Map();

  /**
   * Create a new annotation
   */
  async createAnnotation(
    contentId: string,
    workflowItemId: string,
    annotationData: Partial<ContentAnnotation>
  ): Promise<ContentAnnotation> {
    try {
      const annotation: ContentAnnotation = {
        id: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content_id: contentId,
        workflow_item_id: workflowItemId,
        annotator_id: annotationData.annotator_id || "current-user",
        annotator_name: annotationData.annotator_name || "Current User",
        annotator_avatar: annotationData.annotator_avatar,
        x_position: annotationData.x_position || 0,
        y_position: annotationData.y_position || 0,
        width: annotationData.width,
        height: annotationData.height,
        annotation_text: annotationData.annotation_text || "",
        annotation_type: annotationData.annotation_type || "comment",
        priority: annotationData.priority || "medium",
        status: "open",
        parent_annotation_id: annotationData.parent_annotation_id,
        mentioned_users: this.extractMentions(
          annotationData.annotation_text || ""
        ),
        attachments: [],
        reactions: [],
        metadata: annotationData.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // In a real implementation, save to database
      console.log("Creating annotation:", annotation);

      // Emit real-time event
      this.emitRealTimeEvent({
        type: "annotation_added",
        data: annotation,
        user_id: annotation.annotator_id,
        user_name: annotation.annotator_name,
        timestamp: annotation.created_at,
      });

      // Send notifications to mentioned users
      if (annotation.mentioned_users.length > 0) {
        await this.sendMentionNotifications(annotation);
      }

      return annotation;
    } catch (error) {
      console.error("Error creating annotation:", error);
      throw new Error(`Failed to create annotation: ${error}`);
    }
  }

  /**
   * Update an existing annotation
   */
  async updateAnnotation(
    annotationId: string,
    updates: Partial<ContentAnnotation>
  ): Promise<ContentAnnotation> {
    try {
      // In a real implementation, fetch from database and update
      const annotation: ContentAnnotation = {
        ...(updates as ContentAnnotation),
        id: annotationId,
        updated_at: new Date().toISOString(),
      };

      // Emit real-time event
      this.emitRealTimeEvent({
        type: "annotation_updated",
        data: annotation,
        user_id: annotation.annotator_id,
        user_name: annotation.annotator_name,
        timestamp: annotation.updated_at,
      });

      return annotation;
    } catch (error) {
      console.error("Error updating annotation:", error);
      throw new Error(`Failed to update annotation: ${error}`);
    }
  }

  /**
   * Resolve an annotation
   */
  async resolveAnnotation(
    annotationId: string,
    resolverId: string,
    resolutionNote?: string
  ): Promise<ContentAnnotation> {
    try {
      const updates: Partial<ContentAnnotation> = {
        status: "resolved",
        resolved_by: resolverId,
        resolved_at: new Date().toISOString(),
        resolution_note,
        updated_at: new Date().toISOString(),
      };

      return await this.updateAnnotation(annotationId, updates);
    } catch (error) {
      console.error("Error resolving annotation:", error);
      throw new Error(`Failed to resolve annotation: ${error}`);
    }
  }

  /**
   * Add reaction to annotation
   */
  async addReaction(
    annotationId: string,
    userId: string,
    userName: string,
    reactionType: AnnotationReaction["reaction_type"]
  ): Promise<AnnotationReaction> {
    try {
      const reaction: AnnotationReaction = {
        id: `react-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        annotation_id: annotationId,
        user_id: userId,
        user_name: userName,
        reaction_type: reactionType,
        created_at: new Date().toISOString(),
      };

      // In a real implementation, save to database
      console.log("Adding reaction:", reaction);

      // Emit real-time event
      this.emitRealTimeEvent({
        type: "annotation_updated",
        data: { reaction_added: reaction },
        user_id: userId,
        user_name: userName,
        timestamp: reaction.created_at,
      });

      return reaction;
    } catch (error) {
      console.error("Error adding reaction:", error);
      throw new Error(`Failed to add reaction: ${error}`);
    }
  }

  /**
   * Get annotations for content
   */
  async getAnnotations(
    contentId: string,
    filters?: {
      status?: ContentAnnotation["status"];
      type?: ContentAnnotation["annotation_type"];
      annotator?: string;
      includeResolved?: boolean;
    }
  ): Promise<ContentAnnotation[]> {
    try {
      // Mock implementation - in real app would query database
      const mockAnnotations: ContentAnnotation[] = [
        {
          id: "ann-001",
          content_id: contentId,
          workflow_item_id: "wf-001",
          annotator_id: "user-1",
          annotator_name: "Sarah Johnson",
          annotator_avatar: "/avatars/sarah.jpg",
          x_position: 250,
          y_position: 150,
          width: 200,
          height: 50,
          annotation_text:
            "This section needs more detail about the product benefits.",
          annotation_type: "suggestion",
          priority: "medium",
          status: "open",
          mentioned_users: [],
          attachments: [],
          reactions: [
            {
              id: "react-001",
              annotation_id: "ann-001",
              user_id: "user-2",
              user_name: "Mike Chen",
              reaction_type: "👍",
              created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            },
          ],
          metadata: {},
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
          id: "ann-002",
          content_id: contentId,
          workflow_item_id: "wf-001",
          annotator_id: "user-2",
          annotator_name: "Mike Chen",
          annotator_avatar: "/avatars/mike.jpg",
          x_position: 100,
          y_position: 300,
          annotation_text:
            "Great point! I agree with @sarah that we should expand this.",
          annotation_type: "comment",
          priority: "low",
          status: "open",
          parent_annotation_id: "ann-001",
          mentioned_users: ["sarah"],
          attachments: [],
          reactions: [],
          metadata: {},
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
      ];

      // Apply filters
      let filteredAnnotations = mockAnnotations;
      if (filters) {
        if (filters.status) {
          filteredAnnotations = filteredAnnotations.filter(
            a => a.status === filters.status
          );
        }
        if (filters.type) {
          filteredAnnotations = filteredAnnotations.filter(
            a => a.annotation_type === filters.type
          );
        }
        if (filters.annotator) {
          filteredAnnotations = filteredAnnotations.filter(
            a => a.annotator_id === filters.annotator
          );
        }
        if (!filters.includeResolved) {
          filteredAnnotations = filteredAnnotations.filter(
            a => a.status !== "resolved"
          );
        }
      }

      return filteredAnnotations;
    } catch (error) {
      console.error("Error getting annotations:", error);
      throw new Error(`Failed to get annotations: ${error}`);
    }
  }

  /**
   * Start a collaborative review session
   */
  async startCollaborativeSession(
    workflowItemId: string,
    moderatorId: string,
    sessionData: Partial<CollaborativeSession>
  ): Promise<CollaborativeSession> {
    try {
      const session: CollaborativeSession = {
        id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        workflow_item_id: workflowItemId,
        session_name: sessionData.session_name || "Content Review Session",
        moderator_id: moderatorId,
        participants: sessionData.participants || [],
        status: "live",
        scheduled_start:
          sessionData.scheduled_start || new Date().toISOString(),
        actual_start: new Date().toISOString(),
        agenda: sessionData.agenda || [],
        decisions_made: [],
        ...sessionData,
      };

      // Initialize WebSocket connection for real-time collaboration
      await this.initializeWebSocket(session.id);

      // Notify participants
      await this.notifySessionParticipants(session, "session_started");

      return session;
    } catch (error) {
      console.error("Error starting collaborative session:", error);
      throw new Error(`Failed to start collaborative session: ${error}`);
    }
  }

  /**
   * Compare content versions
   */
  async compareVersions(
    version1Id: string,
    version2Id: string
  ): Promise<{
    version1: ContentVersion;
    version2: ContentVersion;
    differences: ContentDiff[];
    similarity_score: number;
  }> {
    try {
      // Mock implementation
      const version1: ContentVersion = {
        id: version1Id,
        content_id: "content-001",
        version_number: 1,
        content_data: "Original content text...",
        content_metadata: {},
        created_by: "user-1",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        change_summary: "Initial version",
      };

      const version2: ContentVersion = {
        id: version2Id,
        content_id: "content-001",
        version_number: 2,
        content_data: "Updated content text with improvements...",
        content_metadata: {},
        created_by: "user-2",
        created_at: new Date().toISOString(),
        change_summary: "Added improvements based on feedback",
      };

      const differences: ContentDiff[] = [
        {
          type: "modified",
          line_number: 1,
          old_content: "Original content text...",
          new_content: "Updated content text with improvements...",
          context: "Main content body",
        },
      ];

      return {
        version1,
        version2,
        differences,
        similarity_score: 85.5,
      };
    } catch (error) {
      console.error("Error comparing versions:", error);
      throw new Error(`Failed to compare versions: ${error}`);
    }
  }

  /**
   * Get real-time activity feed
   */
  async getActivityFeed(
    workflowItemId: string,
    limit: number = 50
  ): Promise<ReviewActivity[]> {
    try {
      // Mock activity feed
      const activities: ReviewActivity[] = [
        {
          id: "activity-001",
          session_id: "session-001",
          activity_type: "annotation_added",
          description: "Added a suggestion about product benefits",
          user_id: "user-1",
          user_name: "Sarah Johnson",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          data: { annotation_id: "ann-001" },
        },
        {
          id: "activity-002",
          session_id: "session-001",
          activity_type: "comment_replied",
          description: "Replied to annotation thread",
          user_id: "user-2",
          user_name: "Mike Chen",
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          data: { annotation_id: "ann-002", parent_id: "ann-001" },
        },
      ];

      return activities.slice(0, limit);
    } catch (error) {
      console.error("Error getting activity feed:", error);
      throw new Error(`Failed to get activity feed: ${error}`);
    }
  }

  /**
   * Initialize WebSocket connection for real-time collaboration
   */
  private async initializeWebSocket(sessionId: string): Promise<void> {
    try {
      // Mock WebSocket implementation
      console.log("Initializing WebSocket for session:", sessionId);

      // In a real implementation, this would establish a WebSocket connection
      // this.websocket = new WebSocket(`ws://localhost:3001/collaboration/${sessionId}`);
    } catch (error) {
      console.error("Error initializing WebSocket:", error);
    }
  }

  /**
   * Emit real-time event to all session participants
   */
  private emitRealTimeEvent(event: RealTimeEvent): void {
    try {
      // Mock real-time event emission
      console.log("Emitting real-time event:", event);

      // Notify all registered listeners
      const listeners = this.eventListeners.get(event.type) || [];
      listeners.forEach(listener => listener(event));
    } catch (error) {
      console.error("Error emitting real-time event:", error);
    }
  }

  /**
   * Extract mentions from text
   */
  private extractMentions(text: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  }

  /**
   * Send notifications to mentioned users
   */
  private async sendMentionNotifications(
    annotation: ContentAnnotation
  ): Promise<void> {
    try {
      console.log(
        "Sending mention notifications for annotation:",
        annotation.id
      );
      // In a real implementation, this would send notifications
    } catch (error) {
      console.error("Error sending mention notifications:", error);
    }
  }

  /**
   * Notify session participants
   */
  private async notifySessionParticipants(
    session: CollaborativeSession,
    eventType: string
  ): Promise<void> {
    try {
      console.log("Notifying session participants:", session.id, eventType);
      // In a real implementation, this would send notifications
    } catch (error) {
      console.error("Error notifying session participants:", error);
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
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.websocket) {
      this.websocket.close();
    }
    this.eventListeners.clear();
  }
}
