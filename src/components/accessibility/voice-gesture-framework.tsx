"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mic,
  MicOff,
  Hand,
  Eye,
  Settings,
  Accessibility,
  Camera,
  AlertTriangle,
  Activity,
  Square,
} from "lucide-react";

interface VoiceCommand {
  command: string;
  action: string;
  description: string;
  enabled: boolean;
  confidence: number;
}

interface AccessibilitySettings {
  voiceEnabled: boolean;
  gestureEnabled: boolean;
  eyeTrackingEnabled: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  voiceVolume: number;
}

export function VoiceGestureFramework() {
  const [isListening, setIsListening] = useState(false);
  const [isGestureActive, setIsGestureActive] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<AccessibilitySettings>({
    voiceEnabled: false,
    gestureEnabled: false,
    eyeTrackingEnabled: false,
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    voiceVolume: 80,
  });

  const recognitionRef = useRef<any>(null);

  const voiceCommands: VoiceCommand[] = [
    {
      command: "show dashboard",
      action: "navigate_dashboard",
      description: "Navigate to main dashboard",
      enabled: true,
      confidence: 0.8,
    },
    {
      command: "show analytics",
      action: "navigate_analytics",
      description: "Navigate to analytics page",
      enabled: true,
      confidence: 0.8,
    },
    {
      command: "export report",
      action: "export_current_report",
      description: "Export the current report",
      enabled: true,
      confidence: 0.9,
    },
    {
      command: "refresh data",
      action: "refresh_dashboard",
      description: "Refresh dashboard data",
      enabled: true,
      confidence: 0.85,
    },
  ];

  useEffect(() => {
    checkBrowserSupport();

    return () => {
      cleanup();
    };
  }, []);

  const checkBrowserSupport = () => {
    const speechRecognitionSupported =
      "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
    const cameraSupported =
      "mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices;

    setIsSupported(speechRecognitionSupported && cameraSupported);

    if (!speechRecognitionSupported) {
      setError("Voice recognition not supported in this browser");
    }
  };

  const updateSettings = (key: keyof AccessibilitySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem("accessibility-settings", JSON.stringify(newSettings));
  };

  const cleanup = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
  };

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Voice & Gesture Controls
            </h1>
            <p className="text-gray-400">
              Accessibility features and advanced interaction methods
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant={isSupported ? "default" : "destructive"}>
              {isSupported ? "Supported" : "Not Supported"}
            </Badge>

            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 hover:border-blue-500 transition-colors"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {!isSupported && (
          <Alert className="border-red-500/30 bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertTitle className="text-red-400">
              Browser Compatibility
            </AlertTitle>
            <AlertDescription className="text-gray-300">
              Voice and gesture controls require a modern browser with camera
              and microphone access.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Voice Controls
              </CardTitle>
              <CardDescription className="text-gray-400">
                Control the dashboard with voice commands
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Voice Recognition</span>
                <Switch
                  checked={settings.voiceEnabled}
                  onCheckedChange={checked =>
                    updateSettings("voiceEnabled", checked)
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button
                  disabled={!isSupported || !settings.voiceEnabled}
                  variant={isListening ? "destructive" : "default"}
                  className="flex-1"
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-4 w-4 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Start
                    </>
                  )}
                </Button>
              </div>

              {isListening && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-400 animate-pulse" />
                    <span className="text-green-400 text-sm">Listening...</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Hand className="h-5 w-5" />
                Gesture Controls
              </CardTitle>
              <CardDescription className="text-gray-400">
                Control with hand gestures and eye tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Hand Gestures</span>
                <Switch
                  checked={settings.gestureEnabled}
                  onCheckedChange={checked =>
                    updateSettings("gestureEnabled", checked)
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button
                  disabled={!isSupported || !settings.gestureEnabled}
                  variant={isGestureActive ? "destructive" : "default"}
                  className="flex-1"
                >
                  {isGestureActive ? (
                    <>
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Start
                    </>
                  )}
                </Button>
              </div>

              {isGestureActive && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-400 animate-pulse" />
                    <span className="text-blue-400 text-sm">
                      Detecting gestures...
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Accessibility className="h-5 w-5" />
                Accessibility
              </CardTitle>
              <CardDescription className="text-gray-400">
                Visual and audio accessibility options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">High Contrast</span>
                <Switch
                  checked={settings.highContrast}
                  onCheckedChange={checked =>
                    updateSettings("highContrast", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">Large Text</span>
                <Switch
                  checked={settings.largeText}
                  onCheckedChange={checked =>
                    updateSettings("largeText", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">Reduced Motion</span>
                <Switch
                  checked={settings.reducedMotion}
                  onCheckedChange={checked =>
                    updateSettings("reducedMotion", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="voice" className="space-y-6">
          <TabsList className="grid w-full lg:w-fit grid-cols-2 bg-gray-800/50 border border-gray-700">
            <TabsTrigger
              value="voice"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Voice Commands
            </TabsTrigger>
            <TabsTrigger
              value="gestures"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Gesture Patterns
            </TabsTrigger>
          </TabsList>

          <TabsContent value="voice">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">
                  Available Voice Commands
                </CardTitle>
                <CardDescription className="text-gray-400">
                  List of supported voice commands and their actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {voiceCommands.map((command, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-gray-700/30 border border-gray-600/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">
                          "{command.command}"
                        </span>
                        <Badge
                          variant={command.enabled ? "default" : "secondary"}
                        >
                          {command.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">
                        {command.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gestures">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Gesture Patterns</CardTitle>
                <CardDescription className="text-gray-400">
                  Supported gesture patterns (coming soon)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Hand className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Gesture Recognition
                  </h3>
                  <p className="text-gray-400">
                    Advanced gesture patterns will be available in future
                    updates
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
