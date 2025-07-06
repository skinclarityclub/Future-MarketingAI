"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useLocale } from "@/lib/i18n/context";
import {
  Mic,
  MicOff,
  Bell,
  BellOff,
  Keyboard,
  Accessibility,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Globe,
  Settings,
  Palette,
  Monitor,
  Smartphone,
  Search,
  Download,
  Upload,
  RotateCw,
  Zap,
  Eye,
  EyeOff,
  MessageSquare,
  Languages,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Types
interface VoiceToTextConfig {
  enabled: boolean;
  language: "nl-NL" | "en-US";
  continuous: boolean;
  interimResults: boolean;
}

interface NotificationConfig {
  enabled: boolean;
  types: {
    dataChanges: boolean;
    anomalies: boolean;
    insights: boolean;
    system: boolean;
  };
  sound: boolean;
  desktop: boolean;
}

interface AccessibilityConfig {
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  reduceMotion: boolean;
}

interface ThemeConfig {
  mode: "light" | "dark" | "auto";
  accentColor: string;
  fontSize: number;
  animations: boolean;
  transparency: boolean;
}

interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
}

interface UserPreferences {
  voice: VoiceToTextConfig;
  notifications: NotificationConfig;
  accessibility: AccessibilityConfig;
  theme: ThemeConfig;
  language: "nl" | "en";
  panelLayout: "default" | "compact" | "expanded";
  autoSave: boolean;
}

interface PremiumUXFeaturesProps {
  onVoiceInput?: (text: string) => void;
  onNotificationSettings?: (config: NotificationConfig) => void;
  onThemeChange?: (theme: ThemeConfig) => void;
  onPreferencesSave?: (preferences: UserPreferences) => void;
  initialPreferences?: Partial<UserPreferences>;
  className?: string;
}

// Default preferences
const defaultPreferences: UserPreferences = {
  voice: {
    enabled: false,
    language: "nl-NL",
    continuous: false,
    interimResults: true,
  },
  notifications: {
    enabled: true,
    types: {
      dataChanges: true,
      anomalies: true,
      insights: true,
      system: false,
    },
    sound: true,
    desktop: true,
  },
  accessibility: {
    highContrast: false,
    largeText: false,
    screenReader: false,
    keyboardNavigation: true,
    focusIndicators: true,
    reduceMotion: false,
  },
  theme: {
    mode: "auto",
    accentColor: "#3b82f6",
    fontSize: 14,
    animations: true,
    transparency: true,
  },
  language: "nl",
  panelLayout: "default",
  autoSave: true,
};

// Keyboard shortcuts
const keyboardShortcuts: KeyboardShortcut[] = [
  { key: "Ctrl+/", description: "Toon keyboard shortcuts", action: () => {} },
  { key: "Ctrl+K", description: "Open snelle zoek", action: () => {} },
  { key: "Ctrl+M", description: "Toggle voice input", action: () => {} },
  { key: "Ctrl+D", description: "Open dashboard panel", action: () => {} },
  { key: "Ctrl+F", description: "Open financieel panel", action: () => {} },
  { key: "Ctrl+Enter", description: "Verstuur chat bericht", action: () => {} },
  { key: "Esc", description: "Sluit actieve panel", action: () => {} },
  { key: "Tab", description: "Navigeer tussen elementen", action: () => {} },
];

export function PremiumUXFeatures({
  onVoiceInput,
  onNotificationSettings,
  onThemeChange,
  onPreferencesSave,
  initialPreferences = {},
  className,
}: PremiumUXFeaturesProps) {
  const { t } = useLocale();
  const [preferences, setPreferences] = useState<UserPreferences>({
    ...defaultPreferences,
    ...initialPreferences,
  });

  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [voiceTranscript, setVoiceTranscript] = useState("");

  const recognitionRef = useRef<any>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setVoiceSupported(true);
        recognitionRef.current = new SpeechRecognition();

        const recognition = recognitionRef.current;
        recognition.continuous = preferences.voice.continuous;
        recognition.interimResults = preferences.voice.interimResults;
        recognition.lang = preferences.voice.language;

        recognition.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              transcript += event.results[i][0].transcript;
            }
          }
          if (transcript) {
            setVoiceTranscript(transcript);
            onVoiceInput?.(transcript);
            addNotification("voice", `Voice input: "${transcript}"`, "success");
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsVoiceActive(false);
          addNotification("voice", `Voice error: ${event.error}`, "error");
        };

        recognition.onend = () => {
          setIsVoiceActive(false);
        };
      }
    }
  }, [preferences.voice, onVoiceInput]);

  // Request notification permission
  useEffect(() => {
    if (preferences.notifications.desktop && "Notification" in window) {
      Notification.requestPermission();
    }
  }, [preferences.notifications.desktop]);

  // Apply theme changes
  useEffect(() => {
    const root = document.documentElement;

    // Apply theme mode
    if (preferences.theme.mode === "dark") {
      root.classList.add("dark");
    } else if (preferences.theme.mode === "light") {
      root.classList.remove("dark");
    } else {
      // Auto mode - check system preference
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", isDark);
    }

    // Apply font size
    root.style.setProperty("--font-size", `${preferences.theme.fontSize}px`);

    // Apply accent color
    root.style.setProperty("--accent-color", preferences.theme.accentColor);

    // Apply accessibility settings
    if (preferences.accessibility.reduceMotion) {
      root.style.setProperty("--animation-duration", "0s");
    } else {
      root.style.setProperty(
        "--animation-duration",
        preferences.theme.animations ? "0.3s" : "0s"
      );
    }

    // Apply high contrast
    root.classList.toggle(
      "high-contrast",
      preferences.accessibility.highContrast
    );

    // Apply large text
    root.classList.toggle("large-text", preferences.accessibility.largeText);

    onThemeChange?.(preferences.theme);
  }, [preferences.theme, preferences.accessibility, onThemeChange]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!preferences.accessibility.keyboardNavigation) return;

      const isCtrl = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      // Handle specific shortcuts
      if (isCtrl) {
        switch (key) {
          case "/":
            event.preventDefault();
            setShowKeyboardHelp(true);
            break;
          case "k":
            event.preventDefault();
            addNotification("shortcut", "Snelle zoek geopend", "info");
            break;
          case "m":
            event.preventDefault();
            toggleVoiceInput();
            break;
        }
      }

      if (key === "escape") {
        setShowSettings(false);
        setShowKeyboardHelp(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [preferences.accessibility.keyboardNavigation]);

  // Auto-save preferences
  useEffect(() => {
    if (preferences.autoSave) {
      const timer = setTimeout(() => {
        localStorage.setItem(
          "premium-ux-preferences",
          JSON.stringify(preferences)
        );
        onPreferencesSave?.(preferences);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [preferences, onPreferencesSave]);

  // Load saved preferences on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("premium-ux-preferences");
      if (saved) {
        const savedPrefs = JSON.parse(saved);
        setPreferences(prev => ({ ...prev, ...savedPrefs }));
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  }, []);

  const toggleVoiceInput = useCallback(() => {
    if (!voiceSupported || !preferences.voice.enabled) {
      addNotification("voice", "Voice input niet beschikbaar", "error");
      return;
    }

    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isVoiceActive) {
      recognition.stop();
      setIsVoiceActive(false);
    } else {
      recognition.start();
      setIsVoiceActive(true);
      addNotification("voice", "Voice input gestart", "success");
    }
  }, [voiceSupported, preferences.voice.enabled, isVoiceActive]);

  const addNotification = useCallback(
    (
      type: string,
      message: string,
      level: "info" | "success" | "warning" | "error" = "info"
    ) => {
      const notification = {
        id: Date.now().toString(),
        type,
        message,
        level,
        timestamp: new Date(),
      };

      setNotifications(prev => [notification, ...prev.slice(0, 4)]);

      // Show toast notification
      switch (level) {
        case "success":
          toast.success(message);
          break;
        case "error":
          toast.error(message);
          break;
        case "warning":
          toast.warning(message);
          break;
        default:
          toast.info(message);
      }

      // Desktop notification
      if (
        preferences.notifications.desktop &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification("BI Dashboard", {
          body: message,
          icon: "/favicon.ico",
        });
      }

      // Play sound
      if (preferences.notifications.sound) {
        try {
          const audio = new Audio("/notification.mp3");
          audio.volume = 0.3;
          audio.play().catch(console.error);
        } catch (error) {
          // Fallback to system beep
          console.beep?.();
        }
      }
    },
    [preferences.notifications]
  );

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, []);

  // Voice input component
  const VoiceInputButton = () => (
    <NormalButton
      onClick={toggleVoiceInput}
      disabled={!voiceSupported || !preferences.voice.enabled}
      variant={isVoiceActive ? "default" : "outline"}
      size="sm"
      className={cn(
        "transition-all duration-300",
        isVoiceActive && "animate-pulse bg-red-500 hover:bg-red-600"
      )}
      title={isVoiceActive ? "Stop voice input" : "Start voice input"}
    >
      {isVoiceActive ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
      {isVoiceActive && <span className="ml-1 text-xs">Listening...</span>}
    </NormalButton>
  );

  // Notification panel
  const NotificationPanel = () => (
    <Card className="absolute top-2 right-2 max-w-sm z-50 animate-in slide-in-from-top-2">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm">Notifications</h4>
          <NormalButton
            variant="ghost"
            size="sm"
            onClick={() => setNotifications([])}
          >
            Clear
          </NormalButton>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No new notifications
            </p>
          ) : (
            notifications.map(notif => (
              <div key={notif.id} className="flex items-start gap-2 text-xs">
                <Badge
                  variant={
                    notif.level === "error" ? "destructive" : "secondary"
                  }
                >
                  {notif.type}
                </Badge>
                <span className="flex-1">{notif.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );

  // Settings panel
  const SettingsPanel = () => (
    <Card
      className="absolute top-12 right-2 w-80 max-h-96 overflow-y-auto z-50 animate-in slide-in-from-top-2"
      ref={settingsRef}
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{t("ui.premiumUXSettings")}</h3>
          <NormalButton
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(false)}
          >
            <X className="h-4 w-4" />
          </NormalButton>
        </div>

        {/* Voice Settings */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Voice Input
          </h4>
          <div className="space-y-2 ml-6">
            <div className="flex items-center justify-between">
              <span className="text-sm">Enabled</span>
              <Switch
                checked={preferences.voice.enabled}
                onCheckedChange={enabled =>
                  updatePreferences({
                    voice: { ...preferences.voice, enabled },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Language</span>
              <select
                className="text-sm border rounded px-2 py-1"
                value={preferences.voice.language}
                onChange={e =>
                  updatePreferences({
                    voice: {
                      ...preferences.voice,
                      language: e.target.value as "nl-NL" | "en-US",
                    },
                  })
                }
                title="Select voice input language"
                aria-label="Voice input language selection"
              >
                <option value="nl-NL">Nederlands</option>
                <option value="en-US">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Bell className="h-4 w-4" />
            {t("common.notifications")}
          </h4>
          <div className="space-y-2 ml-6">
            <div className="flex items-center justify-between">
              <span className="text-sm">{t("common.desktop")}</span>
              <Switch
                checked={preferences.notifications.desktop}
                onCheckedChange={desktop =>
                  updatePreferences({
                    notifications: { ...preferences.notifications, desktop },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{t("common.sound")}</span>
              <Switch
                checked={preferences.notifications.sound}
                onCheckedChange={sound =>
                  updatePreferences({
                    notifications: { ...preferences.notifications, sound },
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Accessibility Settings */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Accessibility className="h-4 w-4" />
            Accessibility
          </h4>
          <div className="space-y-2 ml-6">
            <div className="flex items-center justify-between">
              <span className="text-sm">High Contrast</span>
              <Switch
                checked={preferences.accessibility.highContrast}
                onCheckedChange={highContrast =>
                  updatePreferences({
                    accessibility: {
                      ...preferences.accessibility,
                      highContrast,
                    },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Large Text</span>
              <Switch
                checked={preferences.accessibility.largeText}
                onCheckedChange={largeText =>
                  updatePreferences({
                    accessibility: { ...preferences.accessibility, largeText },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Reduce Motion</span>
              <Switch
                checked={preferences.accessibility.reduceMotion}
                onCheckedChange={reduceMotion =>
                  updatePreferences({
                    accessibility: {
                      ...preferences.accessibility,
                      reduceMotion,
                    },
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme
          </h4>
          <div className="space-y-2 ml-6">
            <div className="flex items-center justify-between">
              <span className="text-sm">Mode</span>
              <select
                className="text-sm border rounded px-2 py-1"
                value={preferences.theme.mode}
                onChange={e =>
                  updatePreferences({
                    theme: {
                      ...preferences.theme,
                      mode: e.target.value as "light" | "dark" | "auto",
                    },
                  })
                }
                title="Select theme mode"
                aria-label="Theme mode selection"
              >
                <option value="auto">Auto</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-sm">
                Font Size: {preferences.theme.fontSize}px
              </span>
              <Slider
                value={[preferences.theme.fontSize]}
                onValueChange={([fontSize]) =>
                  updatePreferences({
                    theme: { ...preferences.theme, fontSize },
                  })
                }
                min={12}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Animations</span>
              <Switch
                checked={preferences.theme.animations}
                onCheckedChange={animations =>
                  updatePreferences({
                    theme: { ...preferences.theme, animations },
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  // Keyboard shortcuts help
  const KeyboardHelpPanel = () => (
    <Card className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 max-h-80 overflow-y-auto z-50 animate-in fade-in">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            Keyboard Shortcuts
          </h3>
          <NormalButton
            variant="ghost"
            size="sm"
            onClick={() => setShowKeyboardHelp(false)}
          >
            <X className="h-4 w-4" />
          </NormalButton>
        </div>
        <div className="space-y-2">
          {keyboardShortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <span>{shortcut.description}</span>
              <Badge variant="outline" className="font-mono text-xs">
                {shortcut.key}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  return (
    <div className={cn("relative", className)}>
      {/* Main controls */}
      <div className="flex items-center gap-2">
        <VoiceInputButton />

        <NormalButton
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          title="Premium UX Settings"
        >
          <Settings className="h-4 w-4" />
        </NormalButton>

        <NormalButton
          variant="outline"
          size="sm"
          onClick={() => setShowKeyboardHelp(true)}
          title="Keyboard Shortcuts (Ctrl+/)"
        >
          <Keyboard className="h-4 w-4" />
        </NormalButton>

        <NormalButton
          variant="outline"
          size="sm"
          onClick={() => addNotification("test", "Test notification", "info")}
          title="Test Notifications"
        >
          <Bell className="h-4 w-4" />
          {notifications.length > 0 && (
            <Badge className="ml-1 h-4 w-4 p-0 text-xs">
              {notifications.length}
            </Badge>
          )}
        </NormalButton>
      </div>

      {/* Voice transcript display */}
      {voiceTranscript && (
        <Card className="mt-2 p-2 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            <Mic className="h-3 w-3 inline mr-1" />"{voiceTranscript}"
          </p>
        </Card>
      )}

      {/* Overlays */}
      {showSettings && <SettingsPanel />}
      {showKeyboardHelp && <KeyboardHelpPanel />}
      {notifications.length > 0 && <NotificationPanel />}
    </div>
  );
}
