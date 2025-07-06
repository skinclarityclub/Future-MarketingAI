"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NormalButton from "@/components/ui/normal-button";
import {
  Calendar,
  Clock,
  Zap,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Activity,
  Target,
  Bell,
  Play,
  Pause,
} from "lucide-react";

interface AgendaItem {
  id: string;
  title: string;
  status: "scheduled" | "emergency" | "published";
  priority: "urgent" | "high" | "medium";
  platforms: string[];
  scheduled_time: string;
  engagement_prediction: number;
}

export default function RealtimeClickUpBlotutoAgenda() {
  const [items, setItems] = useState<AgendaItem[]>([
    {
      id: "1",
      title: "Summer Sale Campaign Launch",
      status: "scheduled",
      priority: "high",
      platforms: ["twitter", "linkedin"],
      scheduled_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      engagement_prediction: 87,
    },
    {
      id: "2",
      title: "Breaking Product Update",
      status: "emergency",
      priority: "urgent",
      platforms: ["twitter"],
      scheduled_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      engagement_prediction: 94,
    },
  ]);

  const [isLive, setIsLive] = useState(true);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor(
      (date.getTime() - now.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 60) {
      return `over ${diffMinutes}m`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      return `over ${hours}u`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-900/30 text-blue-300";
      case "emergency":
        return "bg-red-900/30 text-red-300";
      case "published":
        return "bg-green-900/30 text-green-300";
      default:
        return "bg-gray-900/30 text-gray-300";
    }
  };

  const getPlatformEmoji = (platform: string) => {
    switch (platform) {
      case "twitter":
        return "🐦";
      case "linkedin":
        return "💼";
      case "instagram":
        return "📷";
      default:
        return "📱";
    }
  };

  return (
    <Card className="bg-gray-900/50 border-gray-700 h-[600px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5" />
            ClickUp → Blotato Agenda
            {isLive && (
              <Badge className="bg-green-900/30 text-green-300 ml-2">
                <Activity className="h-3 w-3 mr-1" />
                LIVE
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <NormalButton
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
              className="text-white border-gray-600"
            >
              {isLive ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </NormalButton>
            <NormalButton
              variant="outline"
              size="sm"
              className="text-white border-gray-600"
            >
              <RefreshCw className="h-3 w-3" />
            </NormalButton>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-gray-800/50 rounded-lg">
            <div className="text-lg font-bold text-white">3</div>
            <div className="text-xs text-gray-400">Vandaag</div>
          </div>
          <div className="text-center p-2 bg-gray-800/50 rounded-lg">
            <div className="text-lg font-bold text-red-400">1</div>
            <div className="text-xs text-gray-400">Urgent</div>
          </div>
          <div className="text-center p-2 bg-gray-800/50 rounded-lg">
            <div className="text-lg font-bold text-green-400">93%</div>
            <div className="text-xs text-gray-400">Success</div>
          </div>
        </div>

        {/* Content List */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Target className="h-4 w-4" />
            Geplande Content ({items.length})
          </h4>
          {items.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1">
                {item.status === "emergency" ? (
                  <Zap className="h-4 w-4 text-red-400" />
                ) : (
                  <Clock className="h-4 w-4 text-blue-400" />
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium text-white truncate">
                    {item.title}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span>{formatTime(item.scheduled_time)}</span>
                    <span>
                      {item.platforms.map(p => getPlatformEmoji(p)).join("")}
                    </span>
                    <span>{item.engagement_prediction}%</span>
                  </div>
                </div>
              </div>
              <Badge className={getStatusColor(item.status)} variant="outline">
                {item.status === "emergency" ? "🚨" : item.status}
              </Badge>
            </div>
          ))}
        </div>

        {/* Recent Events */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Recent Events
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 bg-gray-800/30 rounded-lg text-sm">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <div className="flex-1">
                <div className="text-white">
                  Content goedgekeurd en ingepland
                </div>
                <div className="text-xs text-gray-400">5m geleden</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-gray-800/30 rounded-lg text-sm">
              <Zap className="h-4 w-4 text-red-400" />
              <div className="flex-1">
                <div className="text-white">
                  🚨 Emergency content gedetecteerd
                </div>
                <div className="text-xs text-gray-400">15m geleden</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
