import { NextRequest, NextResponse } from "next/server";
import { ContentAnnotationService } from "@/lib/approval/content-annotation";
import { NotificationService } from "@/lib/approval/notification-service";

// Initialize services
const annotationService = new ContentAnnotationService();
const notificationService = new NotificationService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const contentId = searchParams.get("content_id");
    const workflowItemId = searchParams.get("workflow_item_id");
    const userId = searchParams.get("user_id");
    const sessionId = searchParams.get("session_id");

    switch (action) {
      case "get_annotations":
        if (!contentId) {
          return NextResponse.json(
            { error: "content_id is required" },
            { status: 400 }
          );
        }

        const filters = {
          status: searchParams.get("status") as any,
          type: searchParams.get("type") as any,
          annotator: searchParams.get("annotator") || undefined,
          includeResolved: searchParams.get("include_resolved") === "true",
        };

        const annotations = await annotationService.getAnnotations(
          contentId,
          filters
        );
        return NextResponse.json({ annotations });

      case "get_activity_feed":
        if (!userId) {
          return NextResponse.json(
            { error: "user_id is required" },
            { status: 400 }
          );
        }

        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");
        const feedFilters = {
          type: searchParams.get("types")?.split(","),
          importance: searchParams.get("importance")?.split(","),
          unread_only: searchParams.get("unread_only") === "true",
        };

        const activities = await notificationService.getActivityFeed(
          userId,
          limit,
          offset,
          feedFilters
        );
        return NextResponse.json({ activities });

      case "get_notification_preferences":
        if (!userId) {
          return NextResponse.json(
            { error: "user_id is required" },
            { status: 400 }
          );
        }

        const preferences =
          await notificationService.getNotificationPreferences(userId);
        return NextResponse.json({ preferences });

      case "get_notification_stats":
        const startDate = searchParams.get("start_date");
        const endDate = searchParams.get("end_date");

        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: "start_date and end_date are required" },
            { status: 400 }
          );
        }

        const statsFilters = {
          type: searchParams.get("types")?.split(","),
          category: searchParams.get("categories")?.split(","),
        };

        const stats = await notificationService.getNotificationStats(
          { start: startDate, end: endDate },
          statsFilters
        );
        return NextResponse.json({ stats });

      case "compare_versions":
        const version1Id = searchParams.get("version1_id");
        const version2Id = searchParams.get("version2_id");

        if (!version1Id || !version2Id) {
          return NextResponse.json(
            { error: "version1_id and version2_id are required" },
            { status: 400 }
          );
        }

        const comparison = await annotationService.compareVersions(
          version1Id,
          version2Id
        );
        return NextResponse.json({ comparison });

      case "get_mock_data":
        // Return comprehensive mock data for testing
        return NextResponse.json({
          annotations: [
            {
              id: "ann-001",
              content_id: "content-001",
              workflow_item_id: "wf-001",
              annotator_id: "user-1",
              annotator_name: "Sarah Johnson",
              annotator_avatar: "/avatars/sarah.jpg",
              x_position: 250,
              y_position: 150,
              width: 200,
              height: 50,
              annotation_text:
                "This section needs more detail about the product benefits. Consider adding specific metrics and customer testimonials.",
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
                  created_at: new Date(
                    Date.now() - 1000 * 60 * 30
                  ).toISOString(),
                },
              ],
              metadata: {},
              created_at: new Date(
                Date.now() - 1000 * 60 * 60 * 2
              ).toISOString(),
              updated_at: new Date(
                Date.now() - 1000 * 60 * 60 * 2
              ).toISOString(),
            },
            {
              id: "ann-002",
              content_id: "content-001",
              workflow_item_id: "wf-001",
              annotator_id: "user-2",
              annotator_name: "Mike Chen",
              annotator_avatar: "/avatars/mike.jpg",
              x_position: 100,
              y_position: 300,
              annotation_text:
                "Great point! I agree with @sarah that we should expand this section.",
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
            {
              id: "ann-003",
              content_id: "content-001",
              workflow_item_id: "wf-001",
              annotator_id: "user-3",
              annotator_name: "Emma Wilson",
              annotator_avatar: "/avatars/emma.jpg",
              x_position: 400,
              y_position: 200,
              annotation_text:
                "The pricing information here seems outdated. Please verify with the latest pricing sheet.",
              annotation_type: "correction",
              priority: "high",
              status: "open",
              mentioned_users: [],
              attachments: [
                {
                  id: "att-001",
                  annotation_id: "ann-003",
                  file_name: "pricing-sheet-q4.pdf",
                  file_type: "application/pdf",
                  file_size: 245760,
                  file_url: "/files/pricing-sheet-q4.pdf",
                  uploaded_by: "user-3",
                  uploaded_at: new Date().toISOString(),
                },
              ],
              reactions: [],
              metadata: {},
              created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
              updated_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            },
          ],
          sessions: [
            {
              id: "session-001",
              workflow_item_id: "wf-001",
              session_name: "Q4 Marketing Campaign Review",
              moderator_id: "user-1",
              participants: [
                {
                  user_id: "user-1",
                  user_name: "Sarah Johnson",
                  user_avatar: "/avatars/sarah.jpg",
                  role: "moderator",
                  joined_at: new Date(
                    Date.now() - 1000 * 60 * 60
                  ).toISOString(),
                  active: true,
                },
                {
                  user_id: "user-2",
                  user_name: "Mike Chen",
                  user_avatar: "/avatars/mike.jpg",
                  role: "reviewer",
                  joined_at: new Date(
                    Date.now() - 1000 * 60 * 45
                  ).toISOString(),
                  active: true,
                },
                {
                  user_id: "user-3",
                  user_name: "Emma Wilson",
                  user_avatar: "/avatars/emma.jpg",
                  role: "reviewer",
                  joined_at: new Date(
                    Date.now() - 1000 * 60 * 30
                  ).toISOString(),
                  active: false,
                  left_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
                },
              ],
              status: "live",
              scheduled_start: new Date(
                Date.now() - 1000 * 60 * 60
              ).toISOString(),
              actual_start: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              agenda: [
                "Review content structure and flow",
                "Validate product information accuracy",
                "Check compliance with brand guidelines",
                "Final approval decision",
              ],
              decisions_made: [],
            },
          ],
          activity_feed: [
            {
              id: "activity-001",
              type: "approval_request",
              title: "New Approval Request",
              description:
                'Sarah Johnson submitted "Q4 Marketing Campaign" for approval',
              actor_id: "user-1",
              actor_name: "Sarah Johnson",
              actor_avatar: "/avatars/sarah.jpg",
              target_type: "workflow_item",
              target_id: "wf-001",
              target_name: "Q4 Marketing Campaign",
              action: "submitted for approval",
              timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              metadata: { priority: "high" },
              is_read: false,
              importance: "high",
            },
            {
              id: "activity-002",
              type: "annotation_added",
              title: "New Suggestion",
              description:
                "Mike Chen added a suggestion about product benefits",
              actor_id: "user-2",
              actor_name: "Mike Chen",
              actor_avatar: "/avatars/mike.jpg",
              target_type: "annotation",
              target_id: "ann-001",
              target_name: "Product Benefits Section",
              action: "added suggestion",
              timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              metadata: { annotation_type: "suggestion" },
              is_read: true,
              importance: "medium",
            },
            {
              id: "activity-003",
              type: "session_started",
              title: "Review Session Started",
              description:
                "Collaborative review session for Q4 Marketing Campaign has begun",
              actor_id: "user-1",
              actor_name: "Sarah Johnson",
              actor_avatar: "/avatars/sarah.jpg",
              target_type: "session",
              target_id: "session-001",
              target_name: "Q4 Marketing Campaign Review",
              action: "started session",
              timestamp: new Date(
                Date.now() - 1000 * 60 * 60 * 2
              ).toISOString(),
              metadata: { participant_count: 3 },
              is_read: true,
              importance: "medium",
            },
          ],
          notifications: [
            {
              id: "notif-001",
              type: "approval_request",
              title: "Approval Required",
              message:
                '"Q4 Marketing Campaign" requires your review and approval',
              sender_name: "System",
              priority: "high",
              created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              read: false,
            },
            {
              id: "notif-002",
              type: "mention_added",
              title: "You were mentioned",
              message: "Mike Chen mentioned you in a comment",
              sender_name: "Mike Chen",
              priority: "medium",
              created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              read: true,
            },
          ],
        });

      default:
        return NextResponse.json(
          { error: "Invalid action specified" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Collaboration API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "create_annotation":
        const {
          content_id,
          workflow_item_id,
          x_position,
          y_position,
          width,
          height,
          annotation_text,
          annotation_type,
          priority,
          annotator_id,
          annotator_name,
          parent_annotation_id,
        } = body;

        if (!content_id || !workflow_item_id || !annotation_text) {
          return NextResponse.json(
            {
              error:
                "content_id, workflow_item_id, and annotation_text are required",
            },
            { status: 400 }
          );
        }

        const annotation = await annotationService.createAnnotation(
          content_id,
          workflow_item_id,
          {
            annotator_id,
            annotator_name,
            x_position: x_position || 0,
            y_position: y_position || 0,
            width,
            height,
            annotation_text,
            annotation_type: annotation_type || "comment",
            priority: priority || "medium",
            parent_annotation_id,
          }
        );

        // Send notification to relevant users
        if (annotation.mentioned_users.length > 0) {
          await notificationService.sendAnnotationNotification(
            annotation.id,
            "Content Title", // In real app, fetch from content service
            annotation.annotation_type,
            annotation.annotator_name,
            [], // Content owner and reviewers
            annotation.mentioned_users
          );
        }

        return NextResponse.json({ annotation });

      case "update_annotation":
        const { annotation_id, updates } = body;

        if (!annotation_id) {
          return NextResponse.json(
            { error: "annotation_id is required" },
            { status: 400 }
          );
        }

        const updatedAnnotation = await annotationService.updateAnnotation(
          annotation_id,
          updates
        );
        return NextResponse.json({ annotation: updatedAnnotation });

      case "resolve_annotation":
        const { annotation_id: resolveId, resolver_id, resolution_note } = body;

        if (!resolveId || !resolver_id) {
          return NextResponse.json(
            { error: "annotation_id and resolver_id are required" },
            { status: 400 }
          );
        }

        const resolvedAnnotation = await annotationService.resolveAnnotation(
          resolveId,
          resolver_id,
          resolution_note
        );
        return NextResponse.json({ annotation: resolvedAnnotation });

      case "add_reaction":
        const {
          annotation_id: reactionAnnotationId,
          user_id,
          user_name,
          reaction_type,
        } = body;

        if (!reactionAnnotationId || !user_id || !user_name || !reaction_type) {
          return NextResponse.json(
            {
              error:
                "annotation_id, user_id, user_name, and reaction_type are required",
            },
            { status: 400 }
          );
        }

        const reaction = await annotationService.addReaction(
          reactionAnnotationId,
          user_id,
          user_name,
          reaction_type
        );
        return NextResponse.json({ reaction });

      case "start_collaborative_session":
        const {
          workflow_item_id: sessionWorkflowId,
          moderator_id,
          session_name,
          participants,
          agenda,
        } = body;

        if (!sessionWorkflowId || !moderator_id) {
          return NextResponse.json(
            { error: "workflow_item_id and moderator_id are required" },
            { status: 400 }
          );
        }

        const session = await annotationService.startCollaborativeSession(
          sessionWorkflowId,
          moderator_id,
          {
            session_name,
            participants,
            agenda,
          }
        );

        // Notify participants
        const participantIds = participants?.map((p: any) => p.user_id) || [];
        if (participantIds.length > 0) {
          await notificationService.sendSessionNotification(
            session.id,
            session.session_name,
            "started",
            participantIds
          );
        }

        return NextResponse.json({ session });

      case "send_notification":
        const {
          type,
          recipients,
          title,
          message,
          metadata,
          priority: notifPriority,
          channels,
        } = body;

        if (!type || !recipients || !title || !message) {
          return NextResponse.json(
            { error: "type, recipients, title, and message are required" },
            { status: 400 }
          );
        }

        const notification = await notificationService.sendNotification(
          type,
          recipients,
          {
            title,
            message,
            metadata,
            priority: notifPriority,
            channels,
          }
        );

        return NextResponse.json({ notification });

      case "mark_notifications_read":
        const { notification_ids, user_id: readUserId } = body;

        if (!notification_ids || !readUserId) {
          return NextResponse.json(
            { error: "notification_ids and user_id are required" },
            { status: 400 }
          );
        }

        await notificationService.markAsRead(notification_ids, readUserId);
        return NextResponse.json({ success: true });

      case "update_notification_preferences":
        const { user_id: prefUserId, preferences } = body;

        if (!prefUserId || !preferences) {
          return NextResponse.json(
            { error: "user_id and preferences are required" },
            { status: 400 }
          );
        }

        const updatedPreferences =
          await notificationService.updateNotificationPreferences(
            prefUserId,
            preferences
          );
        return NextResponse.json({ preferences: updatedPreferences });

      default:
        return NextResponse.json(
          { error: "Invalid action specified" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Collaboration API POST error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "delete_annotation":
        const annotationId = searchParams.get("annotation_id");

        if (!annotationId) {
          return NextResponse.json(
            { error: "annotation_id is required" },
            { status: 400 }
          );
        }

        // In real implementation, delete from database
        console.log("Deleting annotation:", annotationId);
        return NextResponse.json({ success: true });

      case "end_session":
        const sessionId = searchParams.get("session_id");

        if (!sessionId) {
          return NextResponse.json(
            { error: "session_id is required" },
            { status: 400 }
          );
        }

        // In real implementation, end session and cleanup
        console.log("Ending session:", sessionId);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: "Invalid action specified" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Collaboration API DELETE error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
