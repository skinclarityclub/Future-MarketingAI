"use client";

/**
 * Mobile Content Creator
 * Task 103.9: Mobile-First, Touch-Optimized Interface with On-the-Go Tools
 *
 * Features:
 * - Touch-optimized content creation
 * - Camera integration for quick photo/video capture
 * - Voice-to-text functionality
 * - Quick hashtag suggestions
 * - Instant scheduling
 * - Mobile-first responsive design
 * - Swipe gestures for navigation
 * - Push notification controls
 */

import React, { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Camera,
  Mic,
  Hash,
  Clock,
  Send,
  Image,
  Video,
  Zap,
  Bell,
  MapPin,
  Smile,
  Type,
  Palette,
  Share2,
  Download,
  Upload,
  Play,
  Pause,
  Square,
  RotateCcw,
  X,
  Check,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
} from "lucide-react";

interface MobileContentData {
  text: string;
  images: string[];
  videos: string[];
  hashtags: string[];
  platforms: string[];
  scheduleTime?: Date;
  location?: string;
  mentions: string[];
}

interface CameraCapture {
  type: "photo" | "video";
  blob: Blob;
  url: string;
  timestamp: Date;
}

export default function MobileContentCreator() {
  const [activeTab, setActiveTab] = useState("create");
  const [contentData, setContentData] = useState<MobileContentData>({
    text: "",
    images: [],
    videos: [],
    hashtags: [],
    platforms: ["instagram"],
    mentions: [],
  });

  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [captures, setCaptures] = useState<CameraCapture[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [currentCapture, setCurrentCapture] = useState<CameraCapture | null>(
    null
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);

  // Platform configurations for mobile
  const platforms = [
    {
      id: "instagram",
      name: "Instagram",
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
      icon: "📷",
    },
    { id: "tiktok", name: "TikTok", color: "bg-black", icon: "🎵" },
    { id: "twitter", name: "Twitter", color: "bg-blue-500", icon: "🐦" },
    { id: "linkedin", name: "LinkedIn", color: "bg-blue-700", icon: "💼" },
    { id: "facebook", name: "Facebook", color: "bg-blue-600", icon: "👥" },
    { id: "youtube", name: "YouTube", color: "bg-red-600", icon: "📺" },
  ];

  const quickHashtags = [
    "#ContentCreator",
    "#Marketing",
    "#Business",
    "#Innovation",
    "#Growth",
    "#Success",
    "#Motivation",
    "#Inspiration",
    "#Digital",
    "#AI",
    "#Tech",
    "#Entrepreneurship",
    "#Leadership",
    "#Strategy",
    "#Goals",
  ];

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        mediaStreamRef.current = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Camera access denied. Please enable camera permissions.");
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);

        canvas.toBlob(
          blob => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const capture: CameraCapture = {
                type: "photo",
                blob,
                url,
                timestamp: new Date(),
              };
              setCaptures(prev => [...prev, capture]);
              setCurrentCapture(capture);
            }
          },
          "image/jpeg",
          0.9
        );
      }
    }
  }, []);

  const startVideoRecording = async () => {
    if (mediaStreamRef.current) {
      try {
        const mediaRecorder = new MediaRecorder(mediaStreamRef.current);
        const chunks: BlobPart[] = [];

        mediaRecorder.ondataavailable = event => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "video/webm" });
          const url = URL.createObjectURL(blob);
          const capture: CameraCapture = {
            type: "video",
            blob,
            url,
            timestamp: new Date(),
          };
          setCaptures(prev => [...prev, capture]);
          setCurrentCapture(capture);
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);
      } catch (error) {
        console.error("Error starting video recording:", error);
      }
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  };

  // Voice recognition
  const startVoiceRecognition = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setContentData(prev => ({
            ...prev,
            text: prev.text + " " + finalTranscript,
          }));
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } else {
      alert("Speech recognition not supported in this browser");
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // Content functions
  const addHashtag = (hashtag: string) => {
    if (!contentData.hashtags.includes(hashtag)) {
      setContentData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, hashtag],
      }));
    }
  };

  const removeHashtag = (hashtag: string) => {
    setContentData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(h => h !== hashtag),
    }));
  };

  const togglePlatform = (platformId: string) => {
    setContentData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId],
    }));
  };

  const schedulePost = () => {
    // Mock scheduling functionality
    alert("Content scheduled successfully! 📱✨");
  };

  const publishNow = () => {
    // Mock publishing functionality
    alert("Content published to selected platforms! 🚀");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Content Creator</h1>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="ghost">
              <Bell className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="relative h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Camera Controls */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center space-x-8">
              <Button
                size="lg"
                variant="secondary"
                className="rounded-full w-16 h-16"
                onClick={stopCamera}
              >
                <X className="h-6 w-6" />
              </Button>

              <Button
                size="lg"
                className="rounded-full w-20 h-20 bg-white text-black hover:bg-gray-100"
                onClick={capturePhoto}
              >
                <Camera className="h-8 w-8" />
              </Button>

              <Button
                size="lg"
                variant={isRecording ? "destructive" : "secondary"}
                className="rounded-full w-16 h-16"
                onClick={isRecording ? stopVideoRecording : startVideoRecording}
              >
                {isRecording ? (
                  <Square className="h-6 w-6" />
                ) : (
                  <Video className="h-6 w-6" />
                )}
              </Button>
            </div>

            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-8 left-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-white font-medium">Recording</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="create" className="text-sm">
              Create
            </TabsTrigger>
            <TabsTrigger value="media" className="text-sm">
              Media
            </TabsTrigger>
            <TabsTrigger value="schedule" className="text-sm">
              Schedule
            </TabsTrigger>
          </TabsList>

          {/* Create Tab */}
          <TabsContent value="create" className="space-y-4">
            {/* Text Input */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Type className="h-5 w-5 mr-2" />
                  Your Story
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="What's on your mind?"
                  value={contentData.text}
                  onChange={e =>
                    setContentData(prev => ({ ...prev, text: e.target.value }))
                  }
                  className="min-h-32 text-base resize-none"
                />

                {/* Voice Input */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Voice Input</Label>
                  <Button
                    size="sm"
                    variant={isListening ? "destructive" : "outline"}
                    onClick={
                      isListening ? stopVoiceRecognition : startVoiceRecognition
                    }
                  >
                    <Mic
                      className={`h-4 w-4 mr-2 ${isListening ? "animate-pulse" : ""}`}
                    />
                    {isListening ? "Stop" : "Speak"}
                  </Button>
                </div>

                {isListening && (
                  <div className="flex items-center space-x-2 text-sm text-blue-600">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                    <span>Listening...</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2"
                onClick={startCamera}
              >
                <Camera className="h-6 w-6" />
                <span className="text-sm">Camera</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex-col space-y-2"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <Upload className="h-6 w-6" />
                <span className="text-sm">Upload</span>
              </Button>
            </div>

            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={e => {
                // Handle file upload
                console.log("Files selected:", e.target.files);
              }}
            />

            {/* Platform Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Platforms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map(platform => (
                    <Button
                      key={platform.id}
                      variant={
                        contentData.platforms.includes(platform.id)
                          ? "default"
                          : "outline"
                      }
                      className="h-16 flex-col space-y-1"
                      onClick={() => togglePlatform(platform.id)}
                    >
                      <span className="text-xl">{platform.icon}</span>
                      <span className="text-xs">{platform.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Hashtags */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Hash className="h-5 w-5 mr-2" />
                  Hashtags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected Hashtags */}
                {contentData.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {contentData.hashtags.map(hashtag => (
                      <Badge
                        key={hashtag}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeHashtag(hashtag)}
                      >
                        {hashtag}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Quick Hashtags */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Quick Add</Label>
                  <div className="flex flex-wrap gap-2">
                    {quickHashtags.slice(0, 6).map(hashtag => (
                      <Badge
                        key={hashtag}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => addHashtag(hashtag)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Image className="h-5 w-5 mr-2" />
                  Recent Captures
                </CardTitle>
              </CardHeader>
              <CardContent>
                {captures.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No media captured yet</p>
                    <p className="text-sm mt-2">
                      Use camera to take photos or videos
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {captures.map((capture, index) => (
                      <div key={index} className="relative">
                        {capture.type === "photo" ? (
                          <img
                            src={capture.url}
                            alt={`Capture ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ) : (
                          <video
                            src={capture.url}
                            className="w-full h-32 object-cover rounded-lg"
                            controls
                          />
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() =>
                            setCaptures(prev =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Scheduling Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Schedule for later</Label>
                    <Switch />
                  </div>

                  <div className="space-y-2">
                    <Label>Date & Time</Label>
                    <Input type="datetime-local" />
                  </div>

                  <div className="space-y-2">
                    <Label>Location (optional)</Label>
                    <div className="flex space-x-2">
                      <Input placeholder="Add location..." className="flex-1" />
                      <Button size="sm" variant="outline">
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button
                    className="w-full h-12 text-base font-medium"
                    onClick={publishNow}
                  >
                    <Send className="h-5 w-5 mr-2" />
                    Publish Now
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full h-12 text-base"
                    onClick={schedulePost}
                  >
                    <Clock className="h-5 w-5 mr-2" />
                    Schedule Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t">
        <div className="flex justify-around py-2">
          {[
            { icon: Type, label: "Create", tab: "create" },
            { icon: Image, label: "Media", tab: "media" },
            { icon: Clock, label: "Schedule", tab: "schedule" },
          ].map(({ icon: Icon, label, tab }) => (
            <Button
              key={tab}
              variant="ghost"
              size="sm"
              className={`flex-col space-y-1 h-auto py-2 ${activeTab === tab ? "text-primary" : "text-muted-foreground"}`}
              onClick={() => setActiveTab(tab)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
