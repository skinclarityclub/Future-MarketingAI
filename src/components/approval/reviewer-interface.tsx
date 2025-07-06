"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MessageSquare,
  Edit,
  Check,
  X,
  Flag,
  Eye,
  Users,
  Clock,
  Paperclip,
  Send,
  Reply,
  MoreHorizontal,
  Highlight,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Smile,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Share,
  Download,
  Compare,
  History,
  Settings,
} from "lucide-react";
import {
  ContentAnnotation,
  ContentAnnotationService,
  ReviewSession,
  SessionParticipant,
} from "@/lib/approval/content-annotation";

interface ReviewerInterfaceProps {
  workflowItemId: string;
  contentId: string;
  contentData: string;
  contentType: string;
  currentUserId: string;
  currentUserName: string;
  onApprovalDecision?: (
    decision: "approve" | "reject" | "request_revision",
    feedback?: string
  ) => void;
}

interface AnnotationPosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export default function ReviewerInterface({
  workflowItemId,
  contentId,
  contentData,
  contentType,
  currentUserId,
  currentUserName,
  onApprovalDecision,
}: ReviewerInterfaceProps) {
  const [annotations, setAnnotations] = useState<ContentAnnotation[]>([]);
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);
  const [isCreatingAnnotation, setIsCreatingAnnotation] = useState(false);
  const [newAnnotationPosition, setNewAnnotationPosition] =
    useState<AnnotationPosition | null>(null);
  const [newAnnotationType, setNewAnnotationType] =
    useState<ContentAnnotation["annotation_type"]>("comment");
  const [newAnnotationText, setNewAnnotationText] = useState("");
  const [selectedTool, setSelectedTool] = useState<
    "select" | "comment" | "highlight" | "suggest"
  >("select");
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showResolvedAnnotations, setShowResolvedAnnotations] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const contentRef = useRef<HTMLDivElement>(null);
  const annotationService = useRef(new ContentAnnotationService());

  useEffect(() => {
    loadAnnotations();
    initializeSession();
    setupRealTimeListeners();

    return () => {
      annotationService.current.cleanup();
    };
  }, [contentId, workflowItemId]);

  const loadAnnotations = async () => {
    try {
      const loadedAnnotations = await annotationService.current.getAnnotations(
        contentId,
        {
          includeResolved: showResolvedAnnotations,
        }
      );
      setAnnotations(loadedAnnotations);
    } catch (error) {
      console.error("Error loading annotations:", error);
    }
  };

  const initializeSession = async () => {
    try {
      // Mock session initialization
      const mockSession: ReviewSession = {
        id: `session-${Date.now()}`,
        workflow_item_id: workflowItemId,
        reviewer_id: currentUserId,
        reviewer_name: currentUserName,
        session_type: "individual",
        status: "active",
        started_at: new Date().toISOString(),
        activity_log: [],
        participants: [
          {
            user_id: currentUserId,
            user_name: currentUserName,
            role: "reviewer",
            joined_at: new Date().toISOString(),
            active: true,
          },
        ],
        session_notes: "",
        focus_areas: [],
      };

      setSession(mockSession);
      setParticipants(mockSession.participants);
    } catch (error) {
      console.error("Error initializing session:", error);
    }
  };

  const setupRealTimeListeners = () => {
    annotationService.current.subscribe("annotation_added", (event: any) => {
      setAnnotations(prev => [...prev, event.data]);
    });

    annotationService.current.subscribe("annotation_updated", (event: any) => {
      setAnnotations(prev =>
        prev.map(ann =>
          ann.id === event.data.id ? { ...ann, ...event.data } : ann
        )
      );
    });

    annotationService.current.subscribe("user_joined", (event: any) => {
      setParticipants(prev => [...prev, event.data]);
    });

    annotationService.current.subscribe("user_left", (event: any) => {
      setParticipants(prev =>
        prev.filter(p => p.user_id !== event.data.user_id)
      );
    });
  };

  const handleContentClick = useCallback(
    (event: React.MouseEvent) => {
      if (selectedTool === "select" || !contentRef.current) return;

      const rect = contentRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      setNewAnnotationPosition({ x, y });
      setIsCreatingAnnotation(true);
      setNewAnnotationType(
        selectedTool === "comment"
          ? "comment"
          : selectedTool === "highlight"
            ? "highlight"
            : "suggestion"
      );
    },
    [selectedTool]
  );

  const handleCreateAnnotation = async () => {
    if (!newAnnotationPosition || !newAnnotationText.trim()) return;

    try {
      const newAnnotation = await annotationService.current.createAnnotation(
        contentId,
        workflowItemId,
        {
          annotator_id: currentUserId,
          annotator_name: currentUserName,
          x_position: newAnnotationPosition.x,
          y_position: newAnnotationPosition.y,
          width: newAnnotationPosition.width,
          height: newAnnotationPosition.height,
          annotation_text: newAnnotationText,
          annotation_type: newAnnotationType,
          priority: "medium",
        }
      );

      setAnnotations(prev => [...prev, newAnnotation]);
      setIsCreatingAnnotation(false);
      setNewAnnotationPosition(null);
      setNewAnnotationText("");
      setSelectedTool("select");
    } catch (error) {
      console.error("Error creating annotation:", error);
    }
  };

  const handleResolveAnnotation = async (annotationId: string) => {
    try {
      await annotationService.current.resolveAnnotation(
        annotationId,
        currentUserId,
        "Resolved by reviewer"
      );
      await loadAnnotations();
    } catch (error) {
      console.error("Error resolving annotation:", error);
    }
  };

  const handleAddReaction = async (annotationId: string, reaction: any) => {
    try {
      await annotationService.current.addReaction(
        annotationId,
        currentUserId,
        currentUserName,
        reaction
      );
      await loadAnnotations();
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  const handleReplyToAnnotation = async (parentId: string) => {
    if (!replyText.trim()) return;

    try {
      await annotationService.current.createAnnotation(
        contentId,
        workflowItemId,
        {
          annotator_id: currentUserId,
          annotator_name: currentUserName,
          x_position: 0,
          y_position: 0,
          annotation_text: replyText,
          annotation_type: "comment",
          priority: "low",
          parent_annotation_id: parentId,
        }
      );

      setReplyingTo(null);
      setReplyText("");
      await loadAnnotations();
    } catch (error) {
      console.error("Error replying to annotation:", error);
    }
  };

  const getAnnotationIcon = (type: ContentAnnotation["annotation_type"]) => {
    switch (type) {
      case "comment":
        return <MessageSquare className="h-4 w-4" />;
      case "suggestion":
        return <Edit className="h-4 w-4" />;
      case "correction":
        return <Flag className="h-4 w-4" />;
      case "approval":
        return <Check className="h-4 w-4" />;
      case "rejection":
        return <X className="h-4 w-4" />;
      case "question":
        return <AlertCircle className="h-4 w-4" />;
      case "highlight":
        return <Highlight className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "text-blue-600";
      case "resolved":
        return "text-green-600";
      case "dismissed":
        return "text-gray-600";
      case "in_progress":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const threadedAnnotations = annotations.filter(
    ann => !ann.parent_annotation_id
  );
  const getReplies = (parentId: string) =>
    annotations.filter(ann => ann.parent_annotation_id === parentId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex h-screen">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  Content Review
                </h1>
                <Badge variant="outline" className="text-sm">
                  {contentType}
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                {/* Annotation Tools */}
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <NormalButton
                          variant={
                            selectedTool === "select" ? "default" : "ghost"
                          }
                          size="sm"
                          onClick={() => setSelectedTool("select")}
                        >
                          <Eye className="h-4 w-4" />
                        </NormalButton>
                      </TooltipTrigger>
                      <TooltipContent>Select tool</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <NormalButton
                          variant={
                            selectedTool === "comment" ? "default" : "ghost"
                          }
                          size="sm"
                          onClick={() => setSelectedTool("comment")}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </NormalButton>
                      </TooltipTrigger>
                      <TooltipContent>Add comment</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <NormalButton
                          variant={
                            selectedTool === "highlight" ? "default" : "ghost"
                          }
                          size="sm"
                          onClick={() => setSelectedTool("highlight")}
                        >
                          <Highlight className="h-4 w-4" />
                        </NormalButton>
                      </TooltipTrigger>
                      <TooltipContent>Highlight text</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <NormalButton
                          variant={
                            selectedTool === "suggest" ? "default" : "ghost"
                          }
                          size="sm"
                          onClick={() => setSelectedTool("suggest")}
                        >
                          <Edit className="h-4 w-4" />
                        </NormalButton>
                      </TooltipTrigger>
                      <TooltipContent>Suggest changes</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <Separator orientation="vertical" className="h-6" />

                <NormalButton variant="outline" size="sm">
                  <Compare className="h-4 w-4 mr-2" />
                  Compare Versions
                </NormalButton>

                <NormalButton variant="outline" size="sm">
                  <History className="h-4 w-4 mr-2" />
                  History
                </NormalButton>

                <NormalButton variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </NormalButton>
              </div>
            </div>
          </div>

          {/* Content Display */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full flex">
              {/* Content Preview */}
              <div className="flex-1 bg-white m-4 rounded-lg shadow-lg overflow-auto">
                <div className="p-8 relative">
                  <div
                    ref={contentRef}
                    className="prose prose-lg max-w-none relative cursor-crosshair"
                    onClick={handleContentClick}
                  >
                    <div dangerouslySetInnerHTML={{ __html: contentData }} />

                    {/* Render annotations */}
                    {annotations.map(annotation => (
                      <div
                        key={annotation.id}
                        className={`absolute pointer-events-auto ${
                          annotation.annotation_type === "highlight"
                            ? "bg-yellow-200 bg-opacity-50"
                            : ""
                        }`}
                        style={{
                          left: annotation.x_position,
                          top: annotation.y_position,
                          width: annotation.width,
                          height: annotation.height,
                        }}
                      >
                        <div
                          className={`w-6 h-6 rounded-full shadow-lg cursor-pointer flex items-center justify-center text-white text-xs ${
                            annotation.status === "resolved"
                              ? "bg-green-500"
                              : annotation.priority === "critical"
                                ? "bg-red-500"
                                : annotation.priority === "high"
                                  ? "bg-orange-500"
                                  : annotation.priority === "medium"
                                    ? "bg-blue-500"
                                    : "bg-gray-500"
                          }`}
                          onClick={() => setActiveAnnotation(annotation.id)}
                        >
                          {getAnnotationIcon(annotation.annotation_type)}
                        </div>
                      </div>
                    ))}

                    {/* New annotation preview */}
                    {isCreatingAnnotation && newAnnotationPosition && (
                      <div
                        className="absolute pointer-events-none"
                        style={{
                          left: newAnnotationPosition.x,
                          top: newAnnotationPosition.y,
                        }}
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-500 shadow-lg animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Annotations Panel */}
              <div className="w-96 bg-white m-4 ml-0 rounded-lg shadow-lg flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Annotations</h3>
                    <div className="flex items-center space-x-2">
                      <NormalButton
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setShowResolvedAnnotations(!showResolvedAnnotations)
                        }
                      >
                        {showResolvedAnnotations
                          ? "Hide Resolved"
                          : "Show Resolved"}
                      </NormalButton>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>
                      {annotations.filter(a => a.status === "open").length} open
                    </span>
                    <span>
                      {annotations.filter(a => a.status === "resolved").length}{" "}
                      resolved
                    </span>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {threadedAnnotations.map(annotation => (
                      <Card
                        key={annotation.id}
                        className={`${activeAnnotation === annotation.id ? "ring-2 ring-blue-500" : ""}`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={annotation.annotator_avatar}
                                />
                                <AvatarFallback className="text-xs">
                                  {annotation.annotator_name
                                    .split(" ")
                                    .map(n => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="text-sm font-medium">
                                  {annotation.annotator_name}
                                </span>
                                <span className="text-xs text-gray-500 ml-2">
                                  {formatTimeAgo(annotation.created_at)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Badge
                                variant="outline"
                                className={`text-xs ${getStatusColor(annotation.status)}`}
                              >
                                {annotation.status}
                              </Badge>
                              <div
                                className={`w-2 h-2 rounded-full ${getPriorityColor(annotation.priority)}`}
                              />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-start space-x-2 mb-3">
                            {getAnnotationIcon(annotation.annotation_type)}
                            <span className="text-sm text-gray-600 capitalize">
                              {annotation.annotation_type}
                            </span>
                          </div>

                          <p className="text-sm mb-3">
                            {annotation.annotation_text}
                          </p>

                          {/* Reactions */}
                          {annotation.reactions.length > 0 && (
                            <div className="flex items-center space-x-1 mb-3">
                              {annotation.reactions.map(reaction => (
                                <div
                                  key={reaction.id}
                                  className="flex items-center space-x-1 text-xs bg-gray-100 rounded px-2 py-1"
                                >
                                  <span>{reaction.reaction_type}</span>
                                  <span>{reaction.user_name}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <NormalButton
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleAddReaction(annotation.id, "👍")
                                }
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </NormalButton>
                              <NormalButton
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleAddReaction(annotation.id, "❤️")
                                }
                              >
                                <Heart className="h-3 w-3" />
                              </NormalButton>
                              <NormalButton
                                variant="ghost"
                                size="sm"
                                onClick={() => setReplyingTo(annotation.id)}
                              >
                                <Reply className="h-3 w-3" />
                              </NormalButton>
                            </div>

                            {annotation.status === "open" && (
                              <NormalButton
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleResolveAnnotation(annotation.id)
                                }
                              >
                                <CheckCircle className="h-3 w-3" />
                              </NormalButton>
                            )}
                          </div>

                          {/* Reply form */}
                          {replyingTo === annotation.id && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <Textarea
                                placeholder="Write a reply..."
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                className="mb-2"
                                rows={2}
                              />
                              <div className="flex justify-end space-x-2">
                                <NormalButton
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setReplyingTo(null)}
                                >
                                  Cancel
                                </NormalButton>
                                <NormalButton
                                  size="sm"
                                  onClick={() =>
                                    handleReplyToAnnotation(annotation.id)
                                  }
                                >
                                  Reply
                                </NormalButton>
                              </div>
                            </div>
                          )}

                          {/* Thread replies */}
                          {getReplies(annotation.id).map(reply => (
                            <div
                              key={reply.id}
                              className="mt-3 pt-3 border-t border-gray-100 ml-4"
                            >
                              <div className="flex items-start space-x-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={reply.annotator_avatar} />
                                  <AvatarFallback className="text-xs">
                                    {reply.annotator_name
                                      .split(" ")
                                      .map(n => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs font-medium">
                                      {reply.annotator_name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {formatTimeAgo(reply.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-xs mt-1">
                                    {reply.annotation_text}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>

                {/* Approval Actions */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="space-y-3">
                    <NormalButton
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => onApprovalDecision?.("approve")}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve Content
                    </NormalButton>
                    <div className="flex space-x-2">
                      <NormalButton
                        variant="outline"
                        className="flex-1"
                        onClick={() => onApprovalDecision?.("request_revision")}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Request Revision
                      </NormalButton>
                      <NormalButton
                        variant="destructive"
                        className="flex-1"
                        onClick={() => onApprovalDecision?.("reject")}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </NormalButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Participants Panel */}
        {showParticipants && (
          <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Participants</h3>
                <NormalButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowParticipants(false)}
                >
                  <X className="h-4 w-4" />
                </NormalButton>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {participants.filter(p => p.active).length} active
              </p>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {participants.map(participant => (
                  <div
                    key={participant.user_id}
                    className="flex items-center space-x-3"
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={participant.user_avatar} />
                        <AvatarFallback className="text-xs">
                          {participant.user_name
                            .split(" ")
                            .map(n => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {participant.active && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {participant.user_name}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {participant.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* New Annotation Modal */}
      {isCreatingAnnotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Add Annotation</CardTitle>
              <CardDescription>
                Add your feedback to this content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  value={newAnnotationType}
                  onChange={e => setNewAnnotationType(e.target.value as any)}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                >
                  <option value="comment">Comment</option>
                  <option value="suggestion">Suggestion</option>
                  <option value="correction">Correction</option>
                  <option value="question">Question</option>
                  <option value="highlight">Highlight</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={newAnnotationText}
                  onChange={e => setNewAnnotationText(e.target.value)}
                  placeholder="Enter your feedback..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <NormalButton
                  variant="outline"
                  onClick={() => {
                    setIsCreatingAnnotation(false);
                    setNewAnnotationPosition(null);
                    setNewAnnotationText("");
                  }}
                >
                  Cancel
                </NormalButton>
                <NormalButton onClick={handleCreateAnnotation}>
                  Add Annotation
                </NormalButton>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
