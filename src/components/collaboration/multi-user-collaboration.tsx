"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  MessageSquare,
  Share2,
  Eye,
  Edit,
  Clock,
  Send,
  UserPlus,
  Settings,
  Bell,
  Video,
  Phone,
  FileText,
  Link,
  Download,
  Upload,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Circle,
  UserCheck,
  Activity,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  isOnline: boolean;
  lastSeen: Date;
  currentPage?: string;
}

interface CollaborationSpace {
  id: string;
  name: string;
  description: string;
  members: User[];
  owner: User;
  createdAt: Date;
  lastActivity: Date;
  type: "dashboard" | "report" | "analysis" | "project";
  permissions: {
    view: boolean;
    edit: boolean;
    share: boolean;
    admin: boolean;
  };
}

interface Message {
  id: string;
  userId: string;
  user: User;
  content: string;
  timestamp: Date;
  type: "text" | "file" | "system";
  attachments?: any[];
  mentions?: string[];
  reactions?: Record<string, string[]>;
}

interface Activity {
  id: string;
  userId: string;
  user: User;
  action: string;
  target: string;
  timestamp: Date;
  details?: Record<string, any>;
}

export function MultiUserCollaboration() {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [collaborationSpaces, setCollaborationSpaces] = useState<
    CollaborationSpace[]
  >([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentUser] = useState<User>({
    id: "current-user",
    name: "Current User",
    email: "user@company.com",
    role: "Manager",
    isOnline: true,
    lastSeen: new Date(),
  });

  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCollaborationData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      updateUserPresence();
      loadRecentActivities();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadCollaborationData = async () => {
    try {
      setIsLoading(true);

      // Mock data - in production, these would be real API calls
      const mockUsers: User[] = [
        {
          id: "1",
          name: "Sarah Chen",
          email: "sarah@company.com",
          avatar: "/avatars/sarah.jpg",
          role: "Data Analyst",
          isOnline: true,
          lastSeen: new Date(),
          currentPage: "/analytics",
        },
        {
          id: "2",
          name: "Marcus Johnson",
          email: "marcus@company.com",
          role: "Marketing Director",
          isOnline: true,
          lastSeen: new Date(Date.now() - 300000),
          currentPage: "/executive-overview",
        },
        {
          id: "3",
          name: "Elena Rodriguez",
          email: "elena@company.com",
          role: "Financial Controller",
          isOnline: false,
          lastSeen: new Date(Date.now() - 3600000),
        },
        {
          id: "4",
          name: "David Kim",
          email: "david@company.com",
          role: "CTO",
          isOnline: true,
          lastSeen: new Date(),
          currentPage: "/security",
        },
      ];

      const mockSpaces: CollaborationSpace[] = [
        {
          id: "space-1",
          name: "Q1 Financial Review",
          description: "Collaborative analysis of Q1 financial performance",
          members: [mockUsers[0], mockUsers[2], currentUser],
          owner: currentUser,
          createdAt: new Date(Date.now() - 86400000 * 7),
          lastActivity: new Date(),
          type: "analysis",
          permissions: { view: true, edit: true, share: true, admin: true },
        },
        {
          id: "space-2",
          name: "Marketing Campaign Dashboard",
          description: "Real-time campaign performance tracking",
          members: [mockUsers[0], mockUsers[1], currentUser],
          owner: mockUsers[1],
          createdAt: new Date(Date.now() - 86400000 * 3),
          lastActivity: new Date(Date.now() - 1800000),
          type: "dashboard",
          permissions: { view: true, edit: true, share: false, admin: false },
        },
        {
          id: "space-3",
          name: "Security Compliance Report",
          description: "Monthly security compliance assessment",
          members: [mockUsers[3], currentUser],
          owner: mockUsers[3],
          createdAt: new Date(Date.now() - 86400000 * 1),
          lastActivity: new Date(Date.now() - 3600000),
          type: "report",
          permissions: { view: true, edit: false, share: false, admin: false },
        },
      ];

      const mockMessages: Message[] = [
        {
          id: "msg-1",
          userId: "1",
          user: mockUsers[0],
          content:
            "I've updated the revenue projections based on the latest data. The Q2 forecast looks promising!",
          timestamp: new Date(Date.now() - 1800000),
          type: "text",
        },
        {
          id: "msg-2",
          userId: "2",
          user: mockUsers[1],
          content:
            "Great work! Can we schedule a review meeting to discuss the marketing implications?",
          timestamp: new Date(Date.now() - 1200000),
          type: "text",
          mentions: [currentUser.id],
        },
        {
          id: "msg-3",
          userId: currentUser.id,
          user: currentUser,
          content:
            "Absolutely! I'm available tomorrow afternoon. Let me know what time works best.",
          timestamp: new Date(Date.now() - 600000),
          type: "text",
        },
      ];

      const mockActivities: Activity[] = [
        {
          id: "act-1",
          userId: "1",
          user: mockUsers[0],
          action: "updated",
          target: "Financial Dashboard",
          timestamp: new Date(Date.now() - 1800000),
          details: { type: "chart_update", component: "revenue_chart" },
        },
        {
          id: "act-2",
          userId: "2",
          user: mockUsers[1],
          action: "shared",
          target: "Marketing Campaign Report",
          timestamp: new Date(Date.now() - 3600000),
          details: { shared_with: ["elena@company.com"] },
        },
        {
          id: "act-3",
          userId: "3",
          user: mockUsers[2],
          action: "commented on",
          target: "Q1 Budget Analysis",
          timestamp: new Date(Date.now() - 7200000),
        },
      ];

      setActiveUsers(mockUsers);
      setCollaborationSpaces(mockSpaces);
      setMessages(mockMessages);
      setActivities(mockActivities);
    } catch (error) {
      console.error("Failed to load collaboration data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserPresence = () => {
    // Simulate user presence updates
    setActiveUsers(prev =>
      prev.map(user => ({
        ...user,
        isOnline: Math.random() > 0.3, // 70% chance to be online
        lastSeen: user.isOnline ? new Date() : user.lastSeen,
      }))
    );
  };

  const loadRecentActivities = () => {
    // Simulate new activities
    // In production, this would fetch from WebSocket or polling
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedSpace) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      content: newMessage,
      timestamp: new Date(),
      type: "text",
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  const joinSpace = (spaceId: string) => {
    setSelectedSpace(spaceId);
  };

  const inviteUser = (spaceId: string) => {
    // Handle user invitation
    console.log(`Inviting user to space: ${spaceId}`);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  const getPresenceColor = (user: User) => {
    if (user.isOnline) return "bg-green-400";
    if (new Date().getTime() - user.lastSeen.getTime() < 3600000)
      return "bg-yellow-400";
    return "bg-gray-400";
  };

  const selectedSpaceData = collaborationSpaces.find(
    space => space.id === selectedSpace
  );
  const spaceMessages = selectedSpace ? messages.filter(msg => true) : []; // In production, filter by space

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Collaboration Center
            </h1>
            <p className="text-gray-400">
              Multi-user collaboration and real-time communication
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 hover:border-blue-500 transition-colors"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Users
            </Button>

            <Button
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Active Users & Spaces */}
          <div className="lg:col-span-1 space-y-6">
            {/* Active Users */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Active Users ({activeUsers.filter(u => u.isOnline).length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-gray-700 text-white text-xs">
                          {getUserInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-800 ${getPresenceColor(user)}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user.role}
                      </p>
                      {user.currentPage && (
                        <p className="text-xs text-blue-400 truncate">
                          {user.currentPage}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTime(user.lastSeen)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Collaboration Spaces */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Workspaces
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {collaborationSpaces.map(space => (
                  <div
                    key={space.id}
                    onClick={() => joinSpace(space.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedSpace === space.id
                        ? "bg-blue-600/20 border border-blue-500/30"
                        : "bg-gray-700/30 hover:bg-gray-700/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-white truncate">
                        {space.name}
                      </h4>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-gray-600/50 text-gray-300"
                      >
                        {space.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                      {space.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-1">
                        {space.members.slice(0, 3).map((member, idx) => (
                          <Avatar
                            key={idx}
                            className="h-5 w-5 border border-gray-700"
                          >
                            <AvatarFallback className="bg-gray-600 text-white text-xs">
                              {getUserInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {space.members.length > 3 && (
                          <div className="h-5 w-5 bg-gray-600 rounded-full border border-gray-700 flex items-center justify-center">
                            <span className="text-xs text-white">
                              +{space.members.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTime(space.lastActivity)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedSpace ? (
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm h-[700px] flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">
                        {selectedSpaceData?.name}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {selectedSpaceData?.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Video className="h-4 w-4 mr-2" />
                        Video Call
                      </Button>
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4 mr-2" />
                        Audio Call
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        {selectedSpaceData?.members.length} members
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        Last activity{" "}
                        {formatTime(
                          selectedSpaceData?.lastActivity || new Date()
                        )}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <Separator className="bg-gray-700" />

                <CardContent className="flex-1 flex flex-col p-0">
                  <Tabs defaultValue="chat" className="flex-1 flex flex-col">
                    <TabsList className="mx-6 mt-4 bg-gray-700/50">
                      <TabsTrigger
                        value="chat"
                        className="data-[state=active]:bg-blue-600"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat
                      </TabsTrigger>
                      <TabsTrigger
                        value="files"
                        className="data-[state=active]:bg-blue-600"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Files
                      </TabsTrigger>
                      <TabsTrigger
                        value="activity"
                        className="data-[state=active]:bg-blue-600"
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Activity
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent
                      value="chat"
                      className="flex-1 flex flex-col m-0"
                    >
                      {/* Messages */}
                      <ScrollArea className="flex-1 p-6">
                        <div className="space-y-4">
                          {spaceMessages.map(message => (
                            <div key={message.id} className="flex gap-3">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={message.user.avatar} />
                                <AvatarFallback className="bg-gray-700 text-white text-xs">
                                  {getUserInitials(message.user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-white">
                                    {message.user.name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatTime(message.timestamp)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                  {message.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      {/* Message Input */}
                      <div className="p-6 pt-0">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyPress={e => e.key === "Enter" && sendMessage()}
                            className="flex-1 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                          />
                          <Button
                            onClick={sendMessage}
                            disabled={!newMessage.trim()}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="files" className="flex-1 p-6">
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">
                          No files shared yet
                        </h3>
                        <p className="text-gray-400 mb-4">
                          Share files with your team members
                        </p>
                        <Button variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Files
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="activity" className="flex-1 p-6">
                      <ScrollArea className="h-full">
                        <div className="space-y-4">
                          {activities.map(activity => (
                            <div key={activity.id} className="flex gap-3">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarFallback className="bg-gray-700 text-white text-xs">
                                  {getUserInitials(activity.user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-sm text-gray-300">
                                  <span className="font-medium text-white">
                                    {activity.user.name}
                                  </span>{" "}
                                  {activity.action}{" "}
                                  <span className="font-medium text-blue-400">
                                    {activity.target}
                                  </span>
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatTime(activity.timestamp)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm h-[700px] flex items-center justify-center">
                <div className="text-center">
                  <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Select a workspace
                  </h3>
                  <p className="text-gray-400">
                    Choose a collaboration space to start working together
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
