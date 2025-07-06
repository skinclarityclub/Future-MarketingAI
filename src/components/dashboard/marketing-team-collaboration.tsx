"use client";

import React, { useState, useEffect } from "react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  MessageCircle,
  Bell,
  UserPlus,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Settings,
  Send,
  Plus,
  MoreVertical,
  Shield,
  UserCheck,
  Activity,
  Target,
  Zap,
} from "lucide-react";
import { UltraPremiumCard } from "@/components/layout/ultra-premium-dashboard-layout";

// Types
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
  avatar?: string;
  status: "online" | "offline" | "busy";
  department: string;
  lastActive: string;
  permissions: string[];
}

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRoleType;
  content: string;
  timestamp: string;
  campaignId?: string;
  parentId?: string;
  replies?: Comment[];
  isEdited: boolean;
  mentions: string[];
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  campaignId: string;
  status: "pending" | "in_progress" | "review" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string;
  createdAt: string;
  completedAt?: string;
}

interface Activity {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRoleType;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
  metadata?: any;
}

type UserRoleType =
  | "super_admin"
  | "admin"
  | "marketing_director"
  | "marketing_manager"
  | "content_manager"
  | "content_creator"
  | "analyst"
  | "executive";

interface MarketingTeamCollaborationProps {
  currentUser?: {
    id: string;
    name: string;
    role: UserRoleType;
    permissions: string[];
  };
}

const mockTeamMembers: TeamMember[] = [
  {
    id: "user_1",
    name: "Sarah Johnson",
    email: "sarah@company.com",
    role: "marketing_director",
    status: "online",
    department: "Marketing",
    lastActive: "2025-06-23T16:30:00Z",
    permissions: ["approve_campaigns", "manage_team", "view_analytics"],
  },
  {
    id: "user_2",
    name: "Mike Chen",
    email: "mike@company.com",
    role: "content_manager",
    status: "online",
    department: "Content",
    lastActive: "2025-06-23T16:45:00Z",
    permissions: ["create_content", "approve_content", "schedule_posts"],
  },
  {
    id: "user_3",
    name: "Emma Rodriguez",
    email: "emma@company.com",
    role: "analyst",
    status: "busy",
    department: "Analytics",
    lastActive: "2025-06-23T16:15:00Z",
    permissions: ["view_analytics", "export_data", "create_reports"],
  },
  {
    id: "user_4",
    name: "Tom Wilson",
    email: "tom@company.com",
    role: "content_creator",
    status: "offline",
    department: "Creative",
    lastActive: "2025-06-23T15:30:00Z",
    permissions: ["create_content", "upload_assets"],
  },
];

const mockAssignments: Assignment[] = [
  {
    id: "assign_1",
    title: "Q4 Campaign Content Creation",
    description: "Create content assets for Q4 holiday campaign",
    assignedTo: "user_4",
    assignedBy: "user_2",
    campaignId: "campaign_1",
    status: "in_progress",
    priority: "high",
    dueDate: "2025-06-30T23:59:59Z",
    createdAt: "2025-06-20T09:00:00Z",
  },
  {
    id: "assign_2",
    title: "Social Media Analytics Review",
    description: "Analyze social media performance for last month",
    assignedTo: "user_3",
    assignedBy: "user_1",
    campaignId: "campaign_2",
    status: "review",
    priority: "medium",
    dueDate: "2025-06-25T17:00:00Z",
    createdAt: "2025-06-21T10:30:00Z",
  },
];

const mockComments: Comment[] = [
  {
    id: "comment_1",
    authorId: "user_1",
    authorName: "Sarah Johnson",
    authorRole: "marketing_director",
    content:
      "Great work on the Q4 campaign strategy! Let's schedule a review for next week.",
    timestamp: "2025-06-23T14:30:00Z",
    campaignId: "campaign_1",
    isEdited: false,
    mentions: ["user_2", "user_3"],
  },
  {
    id: "comment_2",
    authorId: "user_3",
    authorName: "Emma Rodriguez",
    authorRole: "analyst",
    content:
      "The conversion rates are looking promising. Should we increase the budget allocation?",
    timestamp: "2025-06-23T15:15:00Z",
    campaignId: "campaign_1",
    isEdited: false,
    mentions: ["user_1"],
  },
];

const roleColors: Record<UserRoleType, string> = {
  super_admin: "bg-red-500",
  admin: "bg-purple-500",
  marketing_director: "bg-blue-500",
  marketing_manager: "bg-indigo-500",
  content_manager: "bg-green-500",
  content_creator: "bg-yellow-500",
  analyst: "bg-orange-500",
  executive: "bg-pink-500",
};

const roleLabels: Record<UserRoleType, string> = {
  super_admin: "Super Admin",
  admin: "Administrator",
  marketing_director: "Marketing Director",
  marketing_manager: "Marketing Manager",
  content_manager: "Content Manager",
  content_creator: "Content Creator",
  analyst: "Data Analyst",
  executive: "Executive",
};

export default function MarketingTeamCollaboration({
  currentUser = {
    id: "user_1",
    name: "Current User",
    role: "marketing_manager",
    permissions: ["view_team", "assign_tasks", "comment"],
  },
}: MarketingTeamCollaborationProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState("campaign_1");

  // Real-time data refresh
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        // In real implementation, these would be API calls
        // const teamData = await fetch('/api/marketing/team').then(r => r.json());
        // setTeamMembers(teamData);
      } catch (error) {
        console.error("Failed to fetch team data:", error);
      }
    };

    fetchTeamData();
    const interval = setInterval(fetchTeamData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSendComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      content: newComment,
      timestamp: new Date().toISOString(),
      campaignId: selectedCampaign,
      isEdited: false,
      mentions: [],
    };

    setComments(prev => [comment, ...prev]);
    setNewComment("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "busy":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getAssignmentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400";
      case "in_progress":
        return "text-blue-400";
      case "review":
        return "text-yellow-400";
      case "pending":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  const canAssignTasks =
    currentUser.permissions.includes("assign_tasks") ||
    ["marketing_director", "marketing_manager", "admin"].includes(
      currentUser.role
    );

  const canManageTeam =
    currentUser.permissions.includes("manage_team") ||
    ["marketing_director", "admin", "super_admin"].includes(currentUser.role);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Team Members & Status */}
      <UltraPremiumCard>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="h-5 w-5" />
              Team Members ({teamMembers.length})
            </CardTitle>
            {canManageTeam && (
              <NormalButton variant="outline" size="sm" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add Member
              </NormalButton>
            )}
          </div>
          <CardDescription className="text-gray-400">
            Real-time team status en collaboration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {teamMembers.map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {member.name.charAt(0)}
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor(
                        member.status
                      )}`}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {member.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${roleColors[member.role]} text-white border-0`}
                      >
                        {roleLabels[member.role]}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {member.department}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-400">
                    {member.status === "online" ? "Active" : `${member.status}`}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <NormalButton
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </NormalButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-gray-800 border-gray-700"
                    >
                      <DropdownMenuItem className="text-white">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Send Message
                      </DropdownMenuItem>
                      {canAssignTasks && (
                        <DropdownMenuItem className="text-white">
                          <Target className="h-4 w-4 mr-2" />
                          Assign Task
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-white">
                        <Activity className="h-4 w-4 mr-2" />
                        View Activity
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </UltraPremiumCard>

      {/* Recent Activity & Comments */}
      <UltraPremiumCard>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <MessageCircle className="h-5 w-5" />
              Team Discussion
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {comments.length} comments
              </Badge>
              <NormalButton variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </NormalButton>
            </div>
          </div>
          <CardDescription className="text-gray-400">
            Real-time team communication en updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Comment Input */}
          <div className="flex gap-2 mb-4">
            <Input
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share an update or ask a question..."
              className="bg-gray-800 border-gray-600 text-white"
              onKeyPress={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendComment();
                }
              }}
            />
            <NormalButton
              onClick={handleSendComment}
              disabled={!newComment.trim()}
              size="sm"
              className="gap-2"
            >
              <Send className="h-4 w-4" />
            </NormalButton>
          </div>

          {/* Comments List */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {comments.map(comment => (
              <div
                key={comment.id}
                className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {comment.authorName.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-white">
                      {comment.authorName}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${roleColors[comment.authorRole]} text-white border-0`}
                    >
                      {roleLabels[comment.authorRole]}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.timestamp).toLocaleTimeString("nl-NL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{comment.content}</p>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No comments yet. Start the conversation!</p>
              </div>
            )}
          </div>
        </CardContent>
      </UltraPremiumCard>

      {/* Task Assignments */}
      <UltraPremiumCard colSpan={2}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="h-5 w-5" />
              Task Assignments
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {assignments.filter(a => a.status !== "completed").length}{" "}
                active
              </Badge>
              {canAssignTasks && (
                <Dialog
                  open={isAssignDialogOpen}
                  onOpenChange={setIsAssignDialogOpen}
                >
                  <DialogTrigger asChild>
                    <NormalButton variant="outline" size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      New Assignment
                    </NormalButton>
                  </DialogTrigger>
                  <DialogContent className="dark">
                    <DialogHeader>
                      <DialogTitle className="text-white">
                        Create New Assignment
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Assign a new task to a team member
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white">Task Title</Label>
                        <Input
                          placeholder="Enter task title"
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Description</Label>
                        <Textarea
                          placeholder="Task description and requirements"
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white">Assign To</Label>
                          <select
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                            title="Select team member to assign task to"
                            aria-label="Select team member"
                          >
                            {teamMembers.map(member => (
                              <option key={member.id} value={member.id}>
                                {member.name} - {roleLabels[member.role]}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label className="text-white">Priority</Label>
                          <select
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                            title="Select task priority level"
                            aria-label="Select priority"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <NormalButton
                          variant="outline"
                          onClick={() => setIsAssignDialogOpen(false)}
                        >
                          Cancel
                        </NormalButton>
                        <NormalButton className="gap-2">
                          <Target className="h-4 w-4" />
                          Create Assignment
                        </NormalButton>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
          <CardDescription className="text-gray-400">
            Team task assignments en voortgang tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map(assignment => {
              const assignedMember = teamMembers.find(
                m => m.id === assignment.assignedTo
              );
              return (
                <div
                  key={assignment.id}
                  className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-medium text-white mb-1">
                        {assignment.title}
                      </h4>
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {assignment.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${getPriorityColor(assignment.priority)}`}
                      />
                      <span
                        className={`text-xs font-medium ${getAssignmentStatusColor(assignment.status)}`}
                      >
                        {assignment.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {assignedMember?.name.charAt(0)}
                      </div>
                      <span className="text-xs text-gray-300">
                        {assignedMember?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar className="h-3 w-3" />
                      {new Date(assignment.dueDate).toLocaleDateString("nl-NL")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </UltraPremiumCard>
    </div>
  );
}
