"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Image,
  Calendar,
  Video,
  FileText,
  Settings,
  Loader2,
  CheckCircle,
} from "lucide-react";

export interface WorkflowTriggerProps {
  onWorkflowTriggered?: (execution: any) => void;
}

const WORKFLOW_CONFIGS = {
  PostBuilder: {
    icon: Image,
    color: "blue",
    description: "Create social media posts with AI-generated images",
    fields: [
      {
        name: "imageTitle",
        label: "Image Title",
        type: "text",
        required: true,
      },
      {
        name: "imagePrompt",
        label: "Image Prompt",
        type: "textarea",
        required: true,
      },
    ],
  },
  CarouselBuilder: {
    icon: Calendar,
    color: "green",
    description: "Generate multi-slide carousel content",
    fields: [
      {
        name: "carouselTopic",
        label: "Carousel Topic",
        type: "text",
        required: true,
      },
      {
        name: "numberOfSlides",
        label: "Number of Slides",
        type: "number",
        required: true,
      },
    ],
  },
  StoryBuilder: {
    icon: FileText,
    color: "purple",
    description: "Create Instagram story content",
    fields: [
      {
        name: "storyTopic",
        label: "Story Topic",
        type: "text",
        required: true,
      },
      {
        name: "storyStyle",
        label: "Story Style",
        type: "text",
        required: false,
      },
    ],
  },
  ReelBuilder: {
    icon: Video,
    color: "red",
    description: "Generate video reel content",
    fields: [
      { name: "reelTopic", label: "Reel Topic", type: "text", required: true },
      { name: "reelStyle", label: "Reel Style", type: "text", required: false },
    ],
  },
  MarketingManager: {
    icon: Settings,
    color: "amber",
    description: "Coordinate marketing automation workflows",
    fields: [
      {
        name: "messageText",
        label: "Message Text",
        type: "textarea",
        required: true,
      },
      {
        name: "messageType",
        label: "Message Type",
        type: "text",
        required: false,
      },
    ],
  },
};

export default function LiveWorkflowTriggers({
  onWorkflowTriggered,
}: WorkflowTriggerProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [contentStrategy, setContentStrategy] = useState<string>("premium");
  const [priority, setPriority] = useState<string>("high");
  const [loading, setLoading] = useState(false);
  const [lastExecution, setLastExecution] = useState<any>(null);
  const [imageTitle, setImageTitle] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleTriggerWorkflow = async () => {
    if (!selectedWorkflow) return;

    setLoading(true);
    try {
      const response = await fetch("/api/marketing/n8n-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "trigger_workflow",
          workflowName: selectedWorkflow,
          inputData: formData,
          chatId: "control_center_live",
          contentStrategy,
          priority,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setLastExecution(result.data.execution);
        onWorkflowTriggered?.(result.data.execution);

        // Reset form
        setFormData({});
        setSelectedWorkflow("");
      } else {
        console.error("Failed to trigger workflow");
      }
    } catch (error) {
      console.error("Error triggering workflow:", error);
    } finally {
      setLoading(false);
    }
  };

  const triggerPostBuilder = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/marketing/n8n-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "trigger_workflow",
          workflowName: "PostBuilder",
          inputData: { imageTitle, imagePrompt },
          chatId: "control_center",
          contentStrategy: "premium",
          priority: "high",
        }),
      });

      if (response.ok) {
        console.log("PostBuilder triggered successfully");
        setImageTitle("");
        setImagePrompt("");
      }
    } catch (error) {
      console.error("Error triggering PostBuilder:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderWorkflowForm = () => {
    if (!selectedWorkflow) return null;

    const config =
      WORKFLOW_CONFIGS[selectedWorkflow as keyof typeof WORKFLOW_CONFIGS];
    if (!config) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <config.icon className="h-6 w-6 text-gray-600" />
          <div>
            <h3 className="font-semibold text-gray-900">{selectedWorkflow}</h3>
            <p className="text-sm text-gray-600">{config.description}</p>
          </div>
        </div>

        {config.fields.map(field => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            {field.type === "textarea" ? (
              <Textarea
                id={field.name}
                placeholder={`Enter ${field.label.toLowerCase()}...`}
                value={formData[field.name] || ""}
                onChange={e => handleInputChange(field.name, e.target.value)}
                className="min-h-[100px]"
              />
            ) : field.type === "number" ? (
              <Input
                id={field.name}
                type="number"
                placeholder={`Enter ${field.label.toLowerCase()}...`}
                value={formData[field.name] || ""}
                onChange={e =>
                  handleInputChange(field.name, parseInt(e.target.value) || "")
                }
              />
            ) : (
              <Input
                id={field.name}
                type="text"
                placeholder={`Enter ${field.label.toLowerCase()}...`}
                value={formData[field.name] || ""}
                onChange={e => handleInputChange(field.name, e.target.value)}
              />
            )}
          </div>
        ))}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contentStrategy">Content Strategy</Label>
            <Select value={contentStrategy} onValueChange={setContentStrategy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (75% quality)</SelectItem>
                <SelectItem value="premium">Premium (85% quality)</SelectItem>
                <SelectItem value="campaign">Campaign (90% quality)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-blue-500" />
            Live Workflow Triggers
          </CardTitle>
          <CardDescription>
            Trigger live n8n workflows directly from the Control Center
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Workflow Selection */}
          <div className="space-y-2">
            <Label htmlFor="workflowSelect">Select Workflow</Label>
            <Select
              value={selectedWorkflow}
              onValueChange={setSelectedWorkflow}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a workflow to trigger..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(WORKFLOW_CONFIGS).map(([name, config]) => (
                  <SelectItem key={name} value={name}>
                    <div className="flex items-center gap-2">
                      <config.icon className="h-4 w-4" />
                      {name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dynamic Form */}
          {renderWorkflowForm()}

          {/* Action Buttons */}
          {selectedWorkflow && (
            <div className="flex gap-3 pt-4 border-t">
              <NormalButton
                onClick={handleTriggerWorkflow}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Triggering...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Trigger {selectedWorkflow}
                  </>
                )}
              </NormalButton>

              <NormalButton
                variant="secondary"
                onClick={() => {
                  setSelectedWorkflow("");
                  setFormData({});
                }}
              >
                Cancel
              </NormalButton>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last Execution Status */}
      {lastExecution && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Last Execution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Execution ID:</span>
                <p className="text-gray-600">{lastExecution.executionId}</p>
              </div>
              <div>
                <span className="font-medium">Workflow:</span>
                <p className="text-gray-600">{lastExecution.workflowName}</p>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <Badge
                  variant={
                    lastExecution.status === "running" ? "default" : "secondary"
                  }
                >
                  {lastExecution.status}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Started:</span>
                <p className="text-gray-600">
                  {new Date(lastExecution.startTime).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>PostBuilder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="imageTitle">Image Title</Label>
            <Input
              id="imageTitle"
              value={imageTitle}
              onChange={e => setImageTitle(e.target.value)}
              placeholder="Enter image title..."
            />
          </div>

          <div>
            <Label htmlFor="imagePrompt">Image Prompt</Label>
            <Input
              id="imagePrompt"
              value={imagePrompt}
              onChange={e => setImagePrompt(e.target.value)}
              placeholder="Enter image prompt..."
            />
          </div>

          <NormalButton
            onClick={triggerPostBuilder}
            disabled={loading || !imageTitle || !imagePrompt}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Triggering...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Trigger PostBuilder
              </>
            )}
          </NormalButton>
        </CardContent>
      </Card>
    </div>
  );
}
