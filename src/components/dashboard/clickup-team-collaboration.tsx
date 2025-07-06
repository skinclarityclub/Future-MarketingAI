"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Users,
  MessageCircle,
  Send,
  RefreshCw,
  UserPlus,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  Hash,
  Plus,
} from "lucide-react";

// Types for ClickUp collaboration
interface ClickUpUser {
  id: string;
  username: string;
  email: string;
  color: string;
  initials: string;
  profilePicture?: string;
}

interface ClickUpSpace {
  id: string;
  name: string;
  color?: string;
  private: boolean;
  statuses: any[];
  multiple_assignees: boolean;
  members: ClickUpUser[];
}

interface ClickUpComment {
  id: string;
  comment_text: string;
  user: ClickUpUser;
  date: string;
  parent?: string;
  reactions: any[];
  task_id?: string;
}

interface ClickUpTask {
  id: string;
  name: string;
  status: {
    status: string;
    color: string;
    type: string;
  };
  assignees: ClickUpUser[];
  watchers: ClickUpUser[];
  url: string;
  due_date?: string;
  description?: string;
}

interface TeamActivity {
  id: string;
  type: "comment" | "status_change" | "assignment" | "due_date";
  user: ClickUpUser;
  task: ClickUpTask;
  timestamp: string;
  details: string;
}

interface ClickUpTeamCollaborationProps {
  workspaceId?: string;
}

export default function ClickUpTeamCollaboration({
  workspaceId,
}: ClickUpTeamCollaborationProps) {
  const [loading, setLoading] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<string>("");
  const [spaces, setSpaces] = useState<ClickUpSpace[]>([]);
  const [spaceMembers, setSpaceMembers] = useState<ClickUpUser[]>([]);
  const [spaceTasks, setSpaceTasks] = useState<ClickUpTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<ClickUpTask | null>(null);
  const [taskComments, setTaskComments] = useState<ClickUpComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [teamActivity, setTeamActivity] = useState<TeamActivity[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadSpaces();
  }, []);

  useEffect(() => {
    if (selectedSpace) {
      loadSpaceData(selectedSpace);
    }
  }, [selectedSpace]);

  useEffect(() => {
    if (selectedTask) {
      loadTaskComments(selectedTask.id);
    }
  }, [selectedTask]);

  const loadSpaces = async () => {
    setLoading(true);
    try {
      const url = workspaceId
        ? `/api/clickup/collaboration?action=spaces&workspaceId=${workspaceId}`
        : "/api/clickup/collaboration?action=spaces";

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "success") {
        setSpaces(data.data);
        if (data.data.length > 0) {
          setSelectedSpace(data.data[0].id);
        }
      } else {
        toast.error(data.message || "Failed to load spaces");
      }
    } catch (error) {
      console.error("Error loading spaces:", error);
      toast.error("Failed to load spaces");
    } finally {
      setLoading(false);
    }
  };

  const loadSpaceData = async (spaceId: string) => {
    try {
      // Load space members
      const membersResponse = await fetch(
        `/api/clickup/collaboration?action=members&spaceId=${spaceId}`
      );
      const membersData = await membersResponse.json();

      if (membersData.status === "success") {
        setSpaceMembers(membersData.data);
      }

      // Load space tasks
      const tasksResponse = await fetch(
        `/api/clickup/collaboration?action=tasks&spaceId=${spaceId}`
      );
      const tasksData = await tasksResponse.json();

      if (tasksData.status === "success") {
        setSpaceTasks(tasksData.data);
      }

      // Load team activity
      const activityResponse = await fetch(
        `/api/clickup/collaboration?action=activity&spaceId=${spaceId}`
      );
      const activityData = await activityResponse.json();

      if (activityData.status === "success") {
        setTeamActivity(activityData.data);
      }
    } catch (error) {
      console.error("Error loading space data:", error);
      toast.error("Failed to load space data");
    }
  };

  const loadTaskComments = async (taskId: string) => {
    try {
      const response = await fetch(
        `/api/clickup/collaboration?action=comments&taskId=${taskId}`
      );
      const data = await response.json();

      if (data.status === "success") {
        setTaskComments(data.data);
      } else {
        toast.error(data.message || "Failed to load comments");
      }
    } catch (error) {
      console.error("Error loading comments:", error);
      toast.error("Failed to load comments");
    }
  };

  const postComment = async () => {
    if (!newComment.trim() || !selectedTask) return;

    try {
      const response = await fetch("/api/clickup/collaboration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "post_comment",
          taskId: selectedTask.id,
          comment: newComment,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setNewComment("");
        loadTaskComments(selectedTask.id);
        toast.success("Comment posted successfully");
      } else {
        toast.error(data.message || "Failed to post comment");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment");
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "done":
      case "complete":
        return "bg-green-500";
      case "in progress":
      case "active":
        return "bg-blue-500";
      case "to do":
      case "open":
        return "bg-gray-500";
      default:
        return "bg-yellow-500";
    }
  };

  const selectedSpaceData = spaces.find(s => s.id === selectedSpace);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading team collaboration data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            ClickUp Team Collaboration
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Space Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {spaces.map(space => (
              <Card
                key={space.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedSpace === space.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedSpace(space.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: space.color || "#6b7280" }}
                    />
                    <div>
                      <h3 className="font-medium">{space.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {space.members?.length || 0} members •{" "}
                        {space.private ? "Private" : "Public"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedSpaceData && (
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                {selectedSpaceData.multiple_assignees
                  ? "Multi-assignee enabled"
                  : "Single assignee"}
              </Badge>
              <Badge
                variant={
                  selectedSpaceData.private ? "destructive" : "secondary"
                }
              >
                {selectedSpaceData.private ? "Private Space" : "Public Space"}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSpace && (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="tasks">Tasks & Comments</TabsTrigger>
            <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Team Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Team Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Members</span>
                      <Badge>{spaceMembers.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Active Tasks</span>
                      <Badge>
                        {
                          spaceTasks.filter(t => t.status.type !== "closed")
                            .length
                        }
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Completed</span>
                      <Badge variant="secondary">
                        {
                          spaceTasks.filter(t => t.status.type === "closed")
                            .length
                        }
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    <div className="space-y-3">
                      {teamActivity.slice(0, 5).map(activity => (
                        <div
                          key={activity.id}
                          className="flex items-start space-x-3"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={activity.user.profilePicture} />
                            <AvatarFallback className="text-xs">
                              {activity.user.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm">{activity.details}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatTimestamp(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <NormalButton
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Member
                    </NormalButton>
                    <NormalButton
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Task
                    </NormalButton>
                    <NormalButton
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Space Settings
                    </NormalButton>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Members ({spaceMembers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {spaceMembers.map(member => (
                    <Card key={member.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={member.profilePicture} />
                            <AvatarFallback
                              className="text-white"
                              style={{ backgroundColor: member.color }}
                            >
                              {member.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{member.username}</h3>
                            <p className="text-sm text-muted-foreground">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tasks List */}
              <Card>
                <CardHeader>
                  <CardTitle>Space Tasks ({spaceTasks.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {spaceTasks.map(task => (
                        <Card
                          key={task.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedTask?.id === task.id
                              ? "ring-2 ring-primary"
                              : ""
                          }`}
                          onClick={() => setSelectedTask(task)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-sm">
                                  {task.name}
                                </h3>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge
                                    variant="secondary"
                                    className={`${getStatusColor(task.status.status)} text-white`}
                                  >
                                    {task.status.status}
                                  </Badge>
                                  {task.assignees.length > 0 && (
                                    <div className="flex -space-x-1">
                                      {task.assignees
                                        .slice(0, 3)
                                        .map(assignee => (
                                          <Avatar
                                            key={assignee.id}
                                            className="h-5 w-5 border"
                                          >
                                            <AvatarImage
                                              src={assignee.profilePicture}
                                            />
                                            <AvatarFallback
                                              className="text-xs text-white"
                                              style={{
                                                backgroundColor: assignee.color,
                                              }}
                                            >
                                              {assignee.initials}
                                            </AvatarFallback>
                                          </Avatar>
                                        ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <MessageCircle className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Comments Section */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedTask
                      ? `Comments: ${selectedTask.name}`
                      : "Select a task to view comments"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedTask ? (
                    <div className="space-y-4">
                      {/* Task Info */}
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="secondary"
                            className={`${getStatusColor(selectedTask.status.status)} text-white`}
                          >
                            {selectedTask.status.status}
                          </Badge>
                          {selectedTask.due_date && (
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              Due:{" "}
                              {new Date(
                                selectedTask.due_date
                              ).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                        {selectedTask.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {selectedTask.description}
                          </p>
                        )}
                      </div>

                      {/* Comments */}
                      <ScrollArea className="h-48">
                        <div className="space-y-3">
                          {taskComments.map(comment => (
                            <div key={comment.id} className="flex space-x-3">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={comment.user.profilePicture}
                                />
                                <AvatarFallback
                                  className="text-xs text-white"
                                  style={{
                                    backgroundColor: comment.user.color,
                                  }}
                                >
                                  {comment.user.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium">
                                    {comment.user.username}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatTimestamp(comment.date)}
                                  </span>
                                </div>
                                <p className="text-sm mt-1">
                                  {comment.comment_text}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      {/* New Comment */}
                      <Separator />
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={e => setNewComment(e.target.value)}
                          rows={3}
                        />
                        <NormalButton onClick={postComment} className="w-full">
                          <Send className="h-4 w-4 mr-2" />
                          Post Comment
                        </NormalButton>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>
                        Select a task from the left to view and post comments
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Activity Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {teamActivity.map(activity => (
                      <div
                        key={activity.id}
                        className="flex space-x-4 p-4 border rounded-lg"
                      >
                        <Avatar>
                          <AvatarImage src={activity.user.profilePicture} />
                          <AvatarFallback
                            className="text-white"
                            style={{ backgroundColor: activity.user.color }}
                          >
                            {activity.user.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">
                              {activity.user.username}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {activity.type.replace("_", " ")}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(activity.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {activity.details}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Hash className="h-3 w-3" />
                            <span className="text-xs">
                              {activity.task.name}
                            </span>
                            <Badge
                              variant="secondary"
                              className={`${getStatusColor(activity.task.status.status)} text-white text-xs`}
                            >
                              {activity.task.status.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
