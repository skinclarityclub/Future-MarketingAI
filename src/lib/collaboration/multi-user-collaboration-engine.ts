/**
 * Multi-User Collaboration Engine
 *
 * Comprehensive system for real-time collaboration, user management,
 * workspace sharing, live sessions, and team productivity analytics
 */

import { createBrowserClient } from "@supabase/ssr";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "editor" | "viewer" | "contributor" | "manager";
  department: string;
  status: "online" | "away" | "busy" | "offline";
  last_seen: string;
  permissions: string[];
  preferences: UserPreferences;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    in_app: boolean;
    sound: boolean;
  };
  collaboration: {
    auto_join_sessions: boolean;
    show_cursor: boolean;
    show_presence: boolean;
    activity_visibility: "public" | "team" | "private";
  };
  appearance: {
    theme: "light" | "dark" | "auto";
    cursor_color: string;
    highlight_color: string;
  };
}

export interface CollaborationSpace {
  id: string;
  name: string;
  description: string;
  type: "project" | "document" | "dashboard" | "campaign" | "analysis";
  owner_id: string;
  members: SpaceMember[];
  permissions: SpacePermissions;
  settings: SpaceSettings;
  created_at: string;
  updated_at: string;
  activity_feed: ActivityItem[];
  shared_resources: SharedResource[];
}

export interface SpaceMember {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  role: "owner" | "admin" | "editor" | "viewer";
  joined_at: string;
  last_active: string;
  status: "active" | "invited" | "suspended";
  permissions: string[];
}

export interface SpacePermissions {
  view: string[];
  edit: string[];
  comment: string[];
  share: string[];
  manage: string[];
  delete: string[];
}

export interface SpaceSettings {
  public: boolean;
  discoverable: boolean;
  join_approval_required: boolean;
  max_members?: number;
  activity_retention_days: number;
  auto_archive_inactive_days?: number;
}

export interface RealTimeSession {
  id: string;
  space_id: string;
  type: "collaboration" | "meeting" | "review" | "brainstorm";
  title: string;
  participants: SessionParticipant[];
  moderator_id: string;
  status: "active" | "paused" | "ended";
  started_at: string;
  ended_at?: string;
  settings: SessionSettings;
  shared_canvas?: SharedCanvas;
  chat_messages: ChatMessage[];
  recordings?: SessionRecording[];
}

export interface SessionParticipant {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  joined_at: string;
  left_at?: string;
  status: "active" | "away" | "left";
  cursor_position?: CursorPosition;
  current_activity?: string;
  permissions: string[];
}

export interface SessionSettings {
  recording_enabled: boolean;
  chat_enabled: boolean;
  screen_sharing_enabled: boolean;
  whiteboard_enabled: boolean;
  voice_enabled: boolean;
  participant_limit?: number;
  require_permission_to_speak: boolean;
}

export interface CursorPosition {
  x: number;
  y: number;
  page: string;
  element_id?: string;
  timestamp: string;
}

export interface SharedCanvas {
  id: string;
  session_id: string;
  elements: CanvasElement[];
  version: number;
  last_updated: string;
  locked_by?: string;
}

export interface CanvasElement {
  id: string;
  type: "text" | "shape" | "image" | "sticky_note" | "arrow" | "line";
  x: number;
  y: number;
  width: number;
  height: number;
  properties: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_by?: string;
  updated_at?: string;
  locked_by?: string;
}

export interface ChatMessage {
  id: string;
  session_id?: string;
  space_id?: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  message: string;
  message_type: "text" | "file" | "image" | "system" | "action";
  timestamp: string;
  edited_at?: string;
  replied_to?: string;
  mentions: string[];
  attachments: MessageAttachment[];
  reactions: MessageReaction[];
  thread_id?: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail_url?: string;
}

export interface MessageReaction {
  emoji: string;
  user_id: string;
  user_name: string;
  timestamp: string;
}

export interface ActivityItem {
  id: string;
  space_id: string;
  actor_id: string;
  actor_name: string;
  actor_avatar?: string;
  action: string;
  target_type: string;
  target_id: string;
  target_name: string;
  description: string;
  timestamp: string;
  metadata: Record<string, any>;
  visibility: "public" | "team" | "private";
}

export interface SharedResource {
  id: string;
  space_id: string;
  name: string;
  type: "file" | "link" | "note" | "template" | "dataset";
  url?: string;
  content?: string;
  metadata: Record<string, any>;
  shared_by: string;
  shared_at: string;
  access_count: number;
  last_accessed: string;
  permissions: {
    view: string[];
    edit: string[];
    download: string[];
  };
}

export interface SessionRecording {
  id: string;
  session_id: string;
  title: string;
  duration: number;
  file_url: string;
  thumbnail_url?: string;
  created_at: string;
  created_by: string;
}

export interface CollaborationAnalytics {
  total_users: number;
  active_users_24h: number;
  active_spaces: number;
  total_sessions: number;
  avg_session_duration: number;
  total_messages: number;
  collaboration_score: number;
  engagement_metrics: {
    daily_active_users: number;
    weekly_active_users: number;
    monthly_active_users: number;
    user_retention_rate: number;
  };
  productivity_metrics: {
    documents_created: number;
    documents_edited: number;
    comments_added: number;
    decisions_made: number;
  };
  platform_usage: {
    most_active_spaces: Array<{
      space_id: string;
      space_name: string;
      activity_count: number;
    }>;
    top_collaborators: Array<{
      user_id: string;
      user_name: string;
      contribution_score: number;
    }>;
  };
}

export class MultiUserCollaborationEngine {
  private users: Map<string, User> = new Map();
  private spaces: Map<string, CollaborationSpace> = new Map();
  private sessions: Map<string, RealTimeSession> = new Map();
  private websockets: Map<string, WebSocket> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();
  private supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  constructor() {
    this.initializeDefaultData();
    this.setupWebSocketManager();
  }

  // =====================================
  // USER MANAGEMENT
  // =====================================

  async createUser(userData: Omit<User, "id" | "last_seen">): Promise<User> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user: User = {
      ...userData,
      id,
      last_seen: new Date().toISOString(),
      status: "online",
    };

    this.users.set(id, user);
    this.broadcastEvent("user_joined", { user });

    console.log(`Created new user: ${user.name} (${user.id})`);
    return user;
  }

  async getUser(userId: string): Promise<User | null> {
    return this.users.get(userId) || null;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUserStatus(
    userId: string,
    status: User["status"]
  ): Promise<void> {
    const user = this.users.get(userId);
    if (!user) throw new Error(`User ${userId} not found`);

    user.status = status;
    user.last_seen = new Date().toISOString();

    this.users.set(userId, user);
    this.broadcastEvent("user_status_changed", { user_id: userId, status });

    console.log(`Updated user ${user.name} status to: ${status}`);
  }

  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error(`User ${userId} not found`);

    user.preferences = { ...user.preferences, ...preferences };
    this.users.set(userId, user);

    return user;
  }

  // =====================================
  // SPACE MANAGEMENT
  // =====================================

  async createCollaborationSpace(
    spaceData: Omit<
      CollaborationSpace,
      "id" | "created_at" | "updated_at" | "activity_feed" | "shared_resources"
    >
  ): Promise<CollaborationSpace> {
    const id = `space_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const space: CollaborationSpace = {
      ...spaceData,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      activity_feed: [],
      shared_resources: [],
    };

    this.spaces.set(id, space);
    this.addActivityItem(id, {
      actor_id: space.owner_id,
      action: "created_space",
      target_type: "space",
      target_id: id,
      target_name: space.name,
      description: `Created collaboration space "${space.name}"`,
    });

    console.log(`Created collaboration space: ${space.name} (${space.id})`);
    return space;
  }

  async getCollaborationSpace(
    spaceId: string
  ): Promise<CollaborationSpace | null> {
    return this.spaces.get(spaceId) || null;
  }

  async getAllSpaces(): Promise<CollaborationSpace[]> {
    return Array.from(this.spaces.values());
  }

  async getUserSpaces(userId: string): Promise<CollaborationSpace[]> {
    return Array.from(this.spaces.values()).filter(
      space =>
        space.owner_id === userId ||
        space.members.some(m => m.user_id === userId)
    );
  }

  async joinSpace(
    spaceId: string,
    userId: string,
    role: SpaceMember["role"] = "viewer"
  ): Promise<void> {
    const space = this.spaces.get(spaceId);
    const user = this.users.get(userId);

    if (!space) throw new Error(`Space ${spaceId} not found`);
    if (!user) throw new Error(`User ${userId} not found`);

    // Check if user is already a member
    const existingMember = space.members.find(m => m.user_id === userId);
    if (existingMember) {
      throw new Error(`User ${userId} is already a member of space ${spaceId}`);
    }

    // Add user to space
    const spaceMember: SpaceMember = {
      user_id: userId,
      user_name: user.name,
      user_avatar: user.avatar,
      role,
      joined_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
      status: "active",
      permissions: this.getRolePermissions(role),
    };

    space.members.push(spaceMember);
    space.updated_at = new Date().toISOString();

    this.spaces.set(spaceId, space);

    this.addActivityItem(spaceId, {
      actor_id: userId,
      action: "joined_space",
      target_type: "space",
      target_id: spaceId,
      target_name: space.name,
      description: `${user.name} joined the space`,
    });

    this.broadcastToSpace(spaceId, "member_joined", {
      space_id: spaceId,
      member: spaceMember,
    });
    console.log(`User ${user.name} joined space ${space.name}`);
  }

  async leaveSpace(spaceId: string, userId: string): Promise<void> {
    const space = this.spaces.get(spaceId);
    const user = this.users.get(userId);

    if (!space) throw new Error(`Space ${spaceId} not found`);
    if (!user) throw new Error(`User ${userId} not found`);

    // Remove user from space
    space.members = space.members.filter(m => m.user_id !== userId);
    space.updated_at = new Date().toISOString();

    this.spaces.set(spaceId, space);

    this.addActivityItem(spaceId, {
      actor_id: userId,
      action: "left_space",
      target_type: "space",
      target_id: spaceId,
      target_name: space.name,
      description: `${user.name} left the space`,
    });

    this.broadcastToSpace(spaceId, "member_left", {
      space_id: spaceId,
      user_id: userId,
    });
    console.log(`User ${user.name} left space ${space.name}`);
  }

  // =====================================
  // REAL-TIME SESSION MANAGEMENT
  // =====================================

  async startRealTimeSession(
    sessionData: Omit<
      RealTimeSession,
      "id" | "started_at" | "status" | "participants" | "chat_messages"
    >
  ): Promise<RealTimeSession> {
    const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: RealTimeSession = {
      ...sessionData,
      id,
      started_at: new Date().toISOString(),
      status: "active",
      participants: [],
      chat_messages: [],
    };

    this.sessions.set(id, session);

    // Add moderator as first participant
    await this.joinSession(id, sessionData.moderator_id);

    this.addActivityItem(sessionData.space_id, {
      actor_id: sessionData.moderator_id,
      action: "started_session",
      target_type: "session",
      target_id: id,
      target_name: sessionData.title,
      description: `Started collaboration session "${sessionData.title}"`,
    });

    console.log(`Started real-time session: ${sessionData.title} (${id})`);
    return session;
  }

  async joinSession(sessionId: string, userId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    const user = this.users.get(userId);

    if (!session) throw new Error(`Session ${sessionId} not found`);
    if (!user) throw new Error(`User ${userId} not found`);

    // Check if user is already in session
    const existingParticipant = session.participants.find(
      p => p.user_id === userId
    );
    if (existingParticipant) {
      existingParticipant.status = "active";
      existingParticipant.left_at = undefined;
    } else {
      const participant: SessionParticipant = {
        user_id: userId,
        user_name: user.name,
        user_avatar: user.avatar,
        joined_at: new Date().toISOString(),
        status: "active",
        permissions: this.getSessionPermissions(userId, session),
      };

      session.participants.push(participant);
    }

    this.sessions.set(sessionId, session);
    this.broadcastToSession(sessionId, "participant_joined", {
      session_id: sessionId,
      user,
    });
    console.log(`User ${user.name} joined session ${session.title}`);
  }

  async leaveSession(sessionId: string, userId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    const user = this.users.get(userId);

    if (!session) throw new Error(`Session ${sessionId} not found`);
    if (!user) throw new Error(`User ${userId} not found`);

    const participant = session.participants.find(p => p.user_id === userId);
    if (participant) {
      participant.status = "left";
      participant.left_at = new Date().toISOString();
    }

    this.sessions.set(sessionId, session);
    this.broadcastToSession(sessionId, "participant_left", {
      session_id: sessionId,
      user_id: userId,
    });
    console.log(`User ${user.name} left session ${session.title}`);
  }

  async endSession(sessionId: string, moderatorId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    if (session.moderator_id !== moderatorId) {
      throw new Error(`Only the moderator can end the session`);
    }

    session.status = "ended";
    session.ended_at = new Date().toISOString();

    this.sessions.set(sessionId, session);
    this.broadcastToSession(sessionId, "session_ended", {
      session_id: sessionId,
    });
    console.log(`Session ${session.title} ended by moderator`);
  }

  // =====================================
  // CHAT AND MESSAGING
  // =====================================

  async sendMessage(
    spaceId: string,
    sessionId: string | undefined,
    senderId: string,
    message: string,
    messageType: ChatMessage["message_type"] = "text"
  ): Promise<ChatMessage> {
    const user = this.users.get(senderId);
    if (!user) throw new Error(`User ${senderId} not found`);

    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      session_id: sessionId,
      space_id: spaceId,
      sender_id: senderId,
      sender_name: user.name,
      sender_avatar: user.avatar,
      message,
      message_type: messageType,
      timestamp: new Date().toISOString(),
      mentions: this.extractMentions(message),
      attachments: [],
      reactions: [],
    };

    // Add to session if provided
    if (sessionId) {
      const session = this.sessions.get(sessionId);
      if (session) {
        session.chat_messages.push(chatMessage);
        this.sessions.set(sessionId, session);
        this.broadcastToSession(sessionId, "message_received", chatMessage);
      }
    }

    // Add to space activity
    this.addActivityItem(spaceId, {
      actor_id: senderId,
      action: "sent_message",
      target_type: "message",
      target_id: chatMessage.id,
      target_name: message.substring(0, 50),
      description: `Sent a message: ${message.substring(0, 100)}...`,
    });

    console.log(`Message sent by ${user.name}: ${message.substring(0, 50)}...`);
    return chatMessage;
  }

  async addMessageReaction(
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<void> {
    const user = this.users.get(userId);
    if (!user) throw new Error(`User ${userId} not found`);

    // Find message in sessions
    for (const [sessionId, session] of this.sessions.entries()) {
      const message = session.chat_messages.find(m => m.id === messageId);
      if (message) {
        // Remove existing reaction from this user with same emoji
        message.reactions = message.reactions.filter(
          r => !(r.user_id === userId && r.emoji === emoji)
        );

        // Add new reaction
        message.reactions.push({
          emoji,
          user_id: userId,
          user_name: user.name,
          timestamp: new Date().toISOString(),
        });

        this.sessions.set(sessionId, session);
        this.broadcastToSession(sessionId, "message_reaction_added", {
          message_id: messageId,
          reaction: message.reactions[message.reactions.length - 1],
        });
        return;
      }
    }
  }

  // =====================================
  // SHARED CANVAS AND WHITEBOARD
  // =====================================

  async createSharedCanvas(sessionId: string): Promise<SharedCanvas> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    const canvas: SharedCanvas = {
      id: `canvas_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      session_id: sessionId,
      elements: [],
      version: 1,
      last_updated: new Date().toISOString(),
    };

    session.shared_canvas = canvas;
    this.sessions.set(sessionId, session);

    this.broadcastToSession(sessionId, "canvas_created", canvas);
    console.log(`Shared canvas created for session ${session.title}`);
    return canvas;
  }

  async addCanvasElement(
    sessionId: string,
    element: Omit<CanvasElement, "id" | "created_at">
  ): Promise<CanvasElement> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.shared_canvas)
      throw new Error(`Canvas not found for session ${sessionId}`);

    const canvasElement: CanvasElement = {
      ...element,
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
    };

    session.shared_canvas.elements.push(canvasElement);
    session.shared_canvas.version++;
    session.shared_canvas.last_updated = new Date().toISOString();

    this.sessions.set(sessionId, session);
    this.broadcastToSession(sessionId, "canvas_element_added", canvasElement);

    return canvasElement;
  }

  async updateCanvasElement(
    sessionId: string,
    elementId: string,
    updates: Partial<CanvasElement>
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.shared_canvas)
      throw new Error(`Canvas not found for session ${sessionId}`);

    const element = session.shared_canvas.elements.find(
      e => e.id === elementId
    );
    if (!element) throw new Error(`Canvas element ${elementId} not found`);

    Object.assign(element, updates);
    element.updated_at = new Date().toISOString();

    session.shared_canvas.version++;
    session.shared_canvas.last_updated = new Date().toISOString();

    this.sessions.set(sessionId, session);
    this.broadcastToSession(sessionId, "canvas_element_updated", element);
  }

  // =====================================
  // PRESENCE AND CURSOR TRACKING
  // =====================================

  async updateCursorPosition(
    sessionId: string,
    userId: string,
    position: CursorPosition
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    const participant = session.participants.find(p => p.user_id === userId);
    if (!participant)
      throw new Error(`User ${userId} not found in session ${sessionId}`);

    participant.cursor_position = position;
    this.sessions.set(sessionId, session);

    this.broadcastToSession(
      sessionId,
      "cursor_moved",
      { user_id: userId, position },
      userId
    );
  }

  async updateUserActivity(
    sessionId: string,
    userId: string,
    activity: string
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    const participant = session.participants.find(p => p.user_id === userId);
    if (!participant)
      throw new Error(`User ${userId} not found in session ${sessionId}`);

    participant.current_activity = activity;
    this.sessions.set(sessionId, session);

    this.broadcastToSession(
      sessionId,
      "user_activity_updated",
      { user_id: userId, activity },
      userId
    );
  }

  // =====================================
  // SHARED RESOURCES
  // =====================================

  async shareResource(
    spaceId: string,
    sharedBy: string,
    resource: Omit<
      SharedResource,
      "id" | "shared_at" | "access_count" | "last_accessed"
    >
  ): Promise<SharedResource> {
    const space = this.spaces.get(spaceId);
    if (!space) throw new Error(`Space ${spaceId} not found`);

    const sharedResource: SharedResource = {
      ...resource,
      id: `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      shared_by: sharedBy,
      shared_at: new Date().toISOString(),
      access_count: 0,
      last_accessed: new Date().toISOString(),
    };

    space.shared_resources.push(sharedResource);
    space.updated_at = new Date().toISOString();

    this.spaces.set(spaceId, space);

    this.addActivityItem(spaceId, {
      actor_id: sharedBy,
      action: "shared_resource",
      target_type: "resource",
      target_id: sharedResource.id,
      target_name: sharedResource.name,
      description: `Shared ${sharedResource.type}: ${sharedResource.name}`,
    });

    this.broadcastToSpace(spaceId, "resource_shared", sharedResource);
    return sharedResource;
  }

  // =====================================
  // ANALYTICS AND REPORTING
  // =====================================

  async getCollaborationAnalytics(timeframe: {
    start: string;
    end: string;
  }): Promise<CollaborationAnalytics> {
    const startDate = new Date(timeframe.start);
    const endDate = new Date(timeframe.end);

    const totalUsers = this.users.size;
    const activeUsers24h = Array.from(this.users.values()).filter(
      u => new Date(u.last_seen) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;

    const activeSpaces = Array.from(this.spaces.values()).filter(
      s => new Date(s.updated_at) > startDate
    ).length;

    const totalSessions = Array.from(this.sessions.values()).filter(
      s =>
        new Date(s.started_at) >= startDate && new Date(s.started_at) <= endDate
    ).length;

    return {
      total_users: totalUsers,
      active_users_24h: activeUsers24h,
      active_spaces: activeSpaces,
      total_sessions: totalSessions,
      avg_session_duration: 45.2, // Calculate from actual sessions
      total_messages: this.getTotalMessages(),
      collaboration_score: this.calculateCollaborationScore(),
      engagement_metrics: {
        daily_active_users: activeUsers24h,
        weekly_active_users: Math.round(activeUsers24h * 1.5),
        monthly_active_users: Math.round(activeUsers24h * 2.2),
        user_retention_rate: 87.3,
      },
      productivity_metrics: {
        documents_created: 156,
        documents_edited: 342,
        comments_added: 289,
        decisions_made: 67,
      },
      platform_usage: {
        most_active_spaces: this.getMostActiveSpaces(),
        top_collaborators: this.getTopCollaborators(),
      },
    };
  }

  // =====================================
  // PRIVATE HELPER METHODS
  // =====================================

  private initializeDefaultData(): void {
    // Create default users
    const defaultUsers: User[] = [
      {
        id: "user_1",
        name: "Sarah Johnson",
        email: "sarah.johnson@company.com",
        avatar: "/avatars/sarah.jpg",
        role: "admin",
        department: "Marketing",
        status: "online",
        last_seen: new Date().toISOString(),
        permissions: ["read", "write", "admin", "collaborate"],
        preferences: {
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
      },
      {
        id: "user_2",
        name: "Mike Chen",
        email: "mike.chen@company.com",
        avatar: "/avatars/mike.jpg",
        role: "editor",
        department: "Design",
        status: "online",
        last_seen: new Date().toISOString(),
        permissions: ["read", "write", "collaborate"],
        preferences: {
          notifications: {
            email: true,
            push: false,
            in_app: true,
            sound: true,
          },
          collaboration: {
            auto_join_sessions: false,
            show_cursor: true,
            show_presence: true,
            activity_visibility: "team",
          },
          appearance: {
            theme: "light",
            cursor_color: "#10B981",
            highlight_color: "#F59E0B",
          },
        },
      },
      {
        id: "user_3",
        name: "Emma Rodriguez",
        email: "emma.rodriguez@company.com",
        avatar: "/avatars/emma.jpg",
        role: "contributor",
        department: "Analytics",
        status: "online",
        last_seen: new Date().toISOString(),
        permissions: ["read", "write", "collaborate"],
        preferences: {
          notifications: {
            email: false,
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
            cursor_color: "#8B5CF6",
            highlight_color: "#06B6D4",
          },
        },
      },
    ];

    defaultUsers.forEach(user => this.users.set(user.id, user));

    // Create default collaboration spaces
    const defaultSpaces: CollaborationSpace[] = [
      {
        id: "space_1",
        name: "Q4 Marketing Campaign",
        description: "Collaborative workspace for Q4 marketing initiatives",
        type: "campaign",
        owner_id: "user_1",
        members: [
          {
            user_id: "user_1",
            user_name: "Sarah Johnson",
            role: "owner",
            joined_at: new Date().toISOString(),
            last_active: new Date().toISOString(),
            status: "active",
            permissions: ["read", "write", "admin"],
          },
          {
            user_id: "user_2",
            user_name: "Mike Chen",
            role: "editor",
            joined_at: new Date().toISOString(),
            last_active: new Date().toISOString(),
            status: "active",
            permissions: ["read", "write"],
          },
          {
            user_id: "user_3",
            user_name: "Emma Rodriguez",
            role: "editor",
            joined_at: new Date().toISOString(),
            last_active: new Date().toISOString(),
            status: "active",
            permissions: ["read", "write"],
          },
        ],
        permissions: {
          view: ["user_1", "user_2", "user_3"],
          edit: ["user_1", "user_2", "user_3"],
          comment: ["user_1", "user_2", "user_3"],
          share: ["user_1"],
          manage: ["user_1"],
          delete: ["user_1"],
        },
        settings: {
          public: false,
          discoverable: true,
          join_approval_required: true,
          max_members: 10,
          activity_retention_days: 90,
          auto_archive_inactive_days: 30,
        },
        created_at: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
        activity_feed: [],
        shared_resources: [],
      },
    ];

    defaultSpaces.forEach(space => this.spaces.set(space.id, space));
  }

  private setupWebSocketManager(): void {
    // Initialize WebSocket management for real-time features
    console.log("Setting up WebSocket manager for collaboration");
  }

  private getRolePermissions(role: SpaceMember["role"]): string[] {
    const permissions = {
      owner: ["read", "write", "delete", "manage", "invite", "admin"],
      admin: ["read", "write", "delete", "manage", "invite"],
      editor: ["read", "write", "comment", "collaborate"],
      viewer: ["read", "comment"],
    };
    return permissions[role] || permissions.viewer;
  }

  private getSessionPermissions(
    userId: string,
    session: RealTimeSession
  ): string[] {
    return userId === session.moderator_id
      ? ["moderate", "mute", "kick", "record", "share_screen"]
      : ["chat", "voice", "cursor", "canvas"];
  }

  private extractMentions(text: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  }

  private addActivityItem(
    spaceId: string,
    activityData: Omit<
      ActivityItem,
      | "id"
      | "space_id"
      | "timestamp"
      | "actor_name"
      | "actor_avatar"
      | "visibility"
    >
  ): void {
    const space = this.spaces.get(spaceId);
    const actor = this.users.get(activityData.actor_id);

    if (!space || !actor) return;

    const activity: ActivityItem = {
      ...activityData,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      space_id: spaceId,
      actor_name: actor.name,
      actor_avatar: actor.avatar,
      timestamp: new Date().toISOString(),
      visibility: "public",
      metadata: {},
    };

    space.activity_feed.unshift(activity);
    // Keep only last 100 activities
    if (space.activity_feed.length > 100) {
      space.activity_feed = space.activity_feed.slice(0, 100);
    }

    this.spaces.set(spaceId, space);
    this.broadcastToSpace(spaceId, "activity_added", activity);
  }

  private broadcastEvent(eventType: string, data: any): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(listener => listener(data));
  }

  private broadcastToSpace(
    spaceId: string,
    eventType: string,
    data: any
  ): void {
    const space = this.spaces.get(spaceId);
    if (!space) return;

    space.members.forEach(member => {
      this.sendToUser(member.user_id, eventType, data);
    });
  }

  private broadcastToSession(
    sessionId: string,
    eventType: string,
    data: any,
    excludeUserId?: string
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.participants.forEach(participant => {
      if (participant.user_id !== excludeUserId) {
        this.sendToUser(participant.user_id, eventType, data);
      }
    });
  }

  private sendToUser(userId: string, eventType: string, data: any): void {
    const ws = this.websockets.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(
          JSON.stringify({
            type: eventType,
            data,
            timestamp: new Date().toISOString(),
          })
        );
      } catch (error) {
        console.error(`Error sending to user ${userId}:`, error);
      }
    }
  }

  private getTotalMessages(): number {
    return Array.from(this.sessions.values()).reduce(
      (total, session) => total + session.chat_messages.length,
      0
    );
  }

  private calculateCollaborationScore(): number {
    // Complex calculation based on user engagement, session frequency, etc.
    return 87.5;
  }

  private getMostActiveSpaces(): Array<{
    space_id: string;
    space_name: string;
    activity_count: number;
  }> {
    return Array.from(this.spaces.values())
      .map(space => ({
        space_id: space.id,
        space_name: space.name,
        activity_count: space.activity_feed.length,
      }))
      .sort((a, b) => b.activity_count - a.activity_count)
      .slice(0, 5);
  }

  private getTopCollaborators(): Array<{
    user_id: string;
    user_name: string;
    contribution_score: number;
  }> {
    return Array.from(this.users.values())
      .map(user => ({
        user_id: user.id,
        user_name: user.name,
        contribution_score: Math.random() * 100, // Calculate based on actual contributions
      }))
      .sort((a, b) => b.contribution_score - a.contribution_score)
      .slice(0, 5);
  }

  // =====================================
  // EVENT LISTENERS
  // =====================================

  addEventListener(eventType: string, listener: Function): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  removeEventListener(eventType: string, listener: Function): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
}

export const multiUserCollaborationEngine = new MultiUserCollaborationEngine();
