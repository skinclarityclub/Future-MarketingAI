import { NextRequest, NextResponse } from "next/server";
import { multiUserCollaborationEngine } from "@/lib/collaboration/multi-user-collaboration-engine";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "get_users":
        const users = await multiUserCollaborationEngine.getAllUsers();
        return NextResponse.json({
          status: "success",
          data: {
            users,
            total_count: users.length,
            online_count: users.filter(u => u.status === "online").length,
          },
        });

      case "get_user":
        const userId = searchParams.get("user_id");
        if (!userId) {
          return NextResponse.json(
            { error: "user_id is required" },
            { status: 400 }
          );
        }

        const user = await multiUserCollaborationEngine.getUser(userId);
        if (!user) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }

        return NextResponse.json({ status: "success", data: { user } });

      case "get_spaces":
        const requestUserId = searchParams.get("user_id");
        if (requestUserId) {
          const userSpaces =
            await multiUserCollaborationEngine.getUserSpaces(requestUserId);
          return NextResponse.json({
            status: "success",
            data: {
              spaces: userSpaces,
              total_count: userSpaces.length,
            },
          });
        }

        const allSpaces = await multiUserCollaborationEngine.getAllSpaces();
        return NextResponse.json({
          status: "success",
          data: {
            spaces: allSpaces,
            total_count: allSpaces.length,
          },
        });

      case "get_space":
        const spaceId = searchParams.get("space_id");
        if (!spaceId) {
          return NextResponse.json(
            { error: "space_id is required" },
            { status: 400 }
          );
        }

        const space =
          await multiUserCollaborationEngine.getCollaborationSpace(spaceId);
        if (!space) {
          return NextResponse.json(
            { error: "Space not found" },
            { status: 404 }
          );
        }

        return NextResponse.json({ status: "success", data: { space } });

      case "get_analytics":
        const startDate =
          searchParams.get("start_date") ||
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const endDate =
          searchParams.get("end_date") || new Date().toISOString();

        const analytics =
          await multiUserCollaborationEngine.getCollaborationAnalytics({
            start: startDate,
            end: endDate,
          });

        return NextResponse.json({
          status: "success",
          data: { analytics },
        });

      case "get_dashboard_overview":
        // Comprehensive dashboard data
        const allUsers = await multiUserCollaborationEngine.getAllUsers();
        const spaces = await multiUserCollaborationEngine.getAllSpaces();
        const dashboardAnalytics =
          await multiUserCollaborationEngine.getCollaborationAnalytics({
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
          });

        const recentActivities = spaces
          .flatMap(space =>
            space.activity_feed.slice(0, 5).map(activity => ({
              ...activity,
              space_name: space.name,
            }))
          )
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          .slice(0, 10);

        return NextResponse.json({
          status: "success",
          data: {
            overview: {
              total_users: allUsers.length,
              online_users: allUsers.filter(u => u.status === "online").length,
              total_spaces: spaces.length,
              active_spaces: spaces.filter(
                s =>
                  new Date(s.updated_at) >
                  new Date(Date.now() - 24 * 60 * 60 * 1000)
              ).length,
              collaboration_score: dashboardAnalytics.collaboration_score,
              weekly_sessions: dashboardAnalytics.total_sessions,
              avg_session_duration: dashboardAnalytics.avg_session_duration,
            },
            recent_activities: recentActivities,
            top_spaces: dashboardAnalytics.platform_usage.most_active_spaces,
            user_engagement: {
              daily_active:
                dashboardAnalytics.engagement_metrics.daily_active_users,
              weekly_active:
                dashboardAnalytics.engagement_metrics.weekly_active_users,
              retention_rate:
                dashboardAnalytics.engagement_metrics.user_retention_rate,
            },
            productivity: dashboardAnalytics.productivity_metrics,
          },
        });

      default:
        return NextResponse.json(
          { error: "Invalid action specified" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Collaboration API GET error:", error);
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
      case "create_user":
        const {
          name,
          email,
          avatar,
          role,
          department,
          permissions,
          preferences,
        } = body;
        if (!name || !email || !role || !department) {
          return NextResponse.json(
            { error: "name, email, role, and department are required" },
            { status: 400 }
          );
        }

        const newUser = await multiUserCollaborationEngine.createUser({
          name,
          email,
          avatar,
          role,
          department,
          status: "online",
          permissions: permissions || ["read"],
          preferences: preferences || {
            notifications: {
              email: true,
              push: true,
              in_app: true,
              sound: false,
            },
            collaboration: {
              auto_join_sessions: true,
              show_cursor: true,
              show_presence: true,
              activity_visibility: "public",
            },
            appearance: {
              theme: "dark",
              cursor_color: "#3B82F6",
              highlight_color: "#EF4444",
            },
          },
        });

        return NextResponse.json({
          status: "success",
          data: { user: newUser },
          message: `User ${newUser.name} created successfully`,
        });

      case "update_user_status":
        const { user_id, status } = body;
        if (!user_id || !status) {
          return NextResponse.json(
            { error: "user_id and status are required" },
            { status: 400 }
          );
        }

        await multiUserCollaborationEngine.updateUserStatus(user_id, status);
        return NextResponse.json({
          status: "success",
          message: `User status updated to ${status}`,
        });

      case "update_user_preferences":
        const { user_id: prefUserId, preferences: newPreferences } = body;
        if (!prefUserId || !newPreferences) {
          return NextResponse.json(
            { error: "user_id and preferences are required" },
            { status: 400 }
          );
        }

        const updatedUser =
          await multiUserCollaborationEngine.updateUserPreferences(
            prefUserId,
            newPreferences
          );
        return NextResponse.json({
          status: "success",
          data: { user: updatedUser },
          message: "User preferences updated successfully",
        });

      case "create_space":
        const {
          name: spaceName,
          description,
          type,
          owner_id,
          members,
          permissions: spacePermissions,
          settings,
        } = body;

        if (!spaceName || !type || !owner_id) {
          return NextResponse.json(
            { error: "name, type, and owner_id are required" },
            { status: 400 }
          );
        }

        const newSpace =
          await multiUserCollaborationEngine.createCollaborationSpace({
            name: spaceName,
            description: description || "",
            type,
            owner_id,
            members: members || [],
            permissions: spacePermissions || {
              view: [owner_id],
              edit: [owner_id],
              comment: [owner_id],
              share: [owner_id],
              manage: [owner_id],
              delete: [owner_id],
            },
            settings: settings || {
              public: false,
              discoverable: true,
              join_approval_required: false,
              activity_retention_days: 90,
            },
          });

        return NextResponse.json({
          status: "success",
          data: { space: newSpace },
          message: `Collaboration space "${newSpace.name}" created successfully`,
        });

      case "join_space":
        const { space_id, user_id: joinUserId, role: joinRole } = body;
        if (!space_id || !joinUserId) {
          return NextResponse.json(
            { error: "space_id and user_id are required" },
            { status: 400 }
          );
        }

        await multiUserCollaborationEngine.joinSpace(
          space_id,
          joinUserId,
          joinRole || "viewer"
        );
        return NextResponse.json({
          status: "success",
          message: "Successfully joined the space",
        });

      case "leave_space":
        const { space_id: leaveSpaceId, user_id: leaveUserId } = body;
        if (!leaveSpaceId || !leaveUserId) {
          return NextResponse.json(
            { error: "space_id and user_id are required" },
            { status: 400 }
          );
        }

        await multiUserCollaborationEngine.leaveSpace(
          leaveSpaceId,
          leaveUserId
        );
        return NextResponse.json({
          status: "success",
          message: "Successfully left the space",
        });

      case "start_session":
        const {
          space_id: sessionSpaceId,
          type: sessionType,
          title,
          moderator_id,
          settings: sessionSettings,
        } = body;

        if (!sessionSpaceId || !sessionType || !title || !moderator_id) {
          return NextResponse.json(
            { error: "space_id, type, title, and moderator_id are required" },
            { status: 400 }
          );
        }

        const newSession =
          await multiUserCollaborationEngine.startRealTimeSession({
            space_id: sessionSpaceId,
            type: sessionType,
            title,
            moderator_id,
            settings: sessionSettings || {
              recording_enabled: false,
              chat_enabled: true,
              screen_sharing_enabled: true,
              whiteboard_enabled: true,
              voice_enabled: false,
              require_permission_to_speak: false,
            },
          });

        return NextResponse.json({
          status: "success",
          data: { session: newSession },
          message: `Session "${newSession.title}" started successfully`,
        });

      case "join_session":
        const { session_id, user_id: sessionUserId } = body;
        if (!session_id || !sessionUserId) {
          return NextResponse.json(
            { error: "session_id and user_id are required" },
            { status: 400 }
          );
        }

        await multiUserCollaborationEngine.joinSession(
          session_id,
          sessionUserId
        );
        return NextResponse.json({
          status: "success",
          message: "Successfully joined the session",
        });

      case "send_message":
        const {
          space_id: msgSpaceId,
          session_id: msgSessionId,
          sender_id,
          message,
          message_type,
        } = body;

        if (!msgSpaceId || !sender_id || !message) {
          return NextResponse.json(
            { error: "space_id, sender_id, and message are required" },
            { status: 400 }
          );
        }

        const chatMessage = await multiUserCollaborationEngine.sendMessage(
          msgSpaceId,
          msgSessionId,
          sender_id,
          message,
          message_type || "text"
        );

        return NextResponse.json({
          status: "success",
          data: { message: chatMessage },
          message: "Message sent successfully",
        });

      case "add_message_reaction":
        const { message_id, user_id: reactionUserId, emoji } = body;
        if (!message_id || !reactionUserId || !emoji) {
          return NextResponse.json(
            { error: "message_id, user_id, and emoji are required" },
            { status: 400 }
          );
        }

        await multiUserCollaborationEngine.addMessageReaction(
          message_id,
          reactionUserId,
          emoji
        );
        return NextResponse.json({
          status: "success",
          message: "Reaction added successfully",
        });

      case "create_canvas":
        const { session_id: canvasSessionId } = body;
        if (!canvasSessionId) {
          return NextResponse.json(
            { error: "session_id is required" },
            { status: 400 }
          );
        }

        const canvas =
          await multiUserCollaborationEngine.createSharedCanvas(
            canvasSessionId
          );
        return NextResponse.json({
          status: "success",
          data: { canvas },
          message: "Shared canvas created successfully",
        });

      case "add_canvas_element":
        const {
          session_id: elementSessionId,
          type: elementType,
          x,
          y,
          width,
          height,
          properties,
          created_by,
        } = body;

        if (
          !elementSessionId ||
          !elementType ||
          x === undefined ||
          y === undefined ||
          !created_by
        ) {
          return NextResponse.json(
            { error: "session_id, type, x, y, and created_by are required" },
            { status: 400 }
          );
        }

        const element = await multiUserCollaborationEngine.addCanvasElement(
          elementSessionId,
          {
            type: elementType,
            x,
            y,
            width: width || 100,
            height: height || 100,
            properties: properties || {},
            created_by,
          }
        );

        return NextResponse.json({
          status: "success",
          data: { element },
          message: "Canvas element added successfully",
        });

      case "update_cursor":
        const {
          session_id: cursorSessionId,
          user_id: cursorUserId,
          position,
        } = body;

        if (!cursorSessionId || !cursorUserId || !position) {
          return NextResponse.json(
            { error: "session_id, user_id, and position are required" },
            { status: 400 }
          );
        }

        await multiUserCollaborationEngine.updateCursorPosition(
          cursorSessionId,
          cursorUserId,
          position
        );
        return NextResponse.json({
          status: "success",
          message: "Cursor position updated",
        });

      case "share_resource":
        const {
          space_id: resourceSpaceId,
          shared_by,
          name: resourceName,
          type: resourceType,
          url,
          content,
          metadata,
          permissions: resourcePermissions,
        } = body;

        if (!resourceSpaceId || !shared_by || !resourceName || !resourceType) {
          return NextResponse.json(
            { error: "space_id, shared_by, name, and type are required" },
            { status: 400 }
          );
        }

        const sharedResource = await multiUserCollaborationEngine.shareResource(
          resourceSpaceId,
          shared_by,
          {
            space_id: resourceSpaceId,
            shared_by,
            name: resourceName,
            type: resourceType,
            url,
            content,
            metadata: metadata || {},
            permissions: resourcePermissions || {
              view: [],
              edit: [],
              download: [],
            },
          }
        );

        return NextResponse.json({
          status: "success",
          data: { resource: sharedResource },
          message: "Resource shared successfully",
        });

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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "end_session":
        const { session_id, moderator_id } = body;
        if (!session_id || !moderator_id) {
          return NextResponse.json(
            { error: "session_id and moderator_id are required" },
            { status: 400 }
          );
        }

        await multiUserCollaborationEngine.endSession(session_id, moderator_id);
        return NextResponse.json({
          status: "success",
          message: "Session ended successfully",
        });

      case "update_canvas_element":
        const { session_id: updateSessionId, element_id, updates } = body;

        if (!updateSessionId || !element_id || !updates) {
          return NextResponse.json(
            { error: "session_id, element_id, and updates are required" },
            { status: 400 }
          );
        }

        await multiUserCollaborationEngine.updateCanvasElement(
          updateSessionId,
          element_id,
          updates
        );
        return NextResponse.json({
          status: "success",
          message: "Canvas element updated successfully",
        });

      case "update_user_activity":
        const {
          session_id: activitySessionId,
          user_id: activityUserId,
          activity,
        } = body;

        if (!activitySessionId || !activityUserId || !activity) {
          return NextResponse.json(
            { error: "session_id, user_id, and activity are required" },
            { status: 400 }
          );
        }

        await multiUserCollaborationEngine.updateUserActivity(
          activitySessionId,
          activityUserId,
          activity
        );
        return NextResponse.json({
          status: "success",
          message: "User activity updated successfully",
        });

      default:
        return NextResponse.json(
          { error: "Invalid action specified" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Collaboration API PUT error:", error);
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
      case "leave_session":
        const sessionId = searchParams.get("session_id");
        const userId = searchParams.get("user_id");

        if (!sessionId || !userId) {
          return NextResponse.json(
            { error: "session_id and user_id are required" },
            { status: 400 }
          );
        }

        await multiUserCollaborationEngine.leaveSession(sessionId, userId);
        return NextResponse.json({
          status: "success",
          message: "Successfully left the session",
        });

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
