"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  DollarSign,
  Target,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface RealTimeDataWidgetProps {
  title: string;
  type: "kpis" | "system-metrics" | "clickup" | "n8n" | "blotato" | "roi";
  className?: string;
  variant?: "compact" | "detailed";
}

export default function RealTimeDataWidget({
  title,
  type,
  className,
  variant = "detailed",
}: RealTimeDataWidgetProps) {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const renderKPIWidget = () => {
    const kpis = [
      {
        label: "Total Revenue",
        value: "$2.45M",
        change: "+12.5%",
        trend: "up",
        icon: DollarSign,
        color: "text-green-400",
      },
      {
        label: "ROI",
        value: "23.5%",
        change: "+3.2%",
        trend: "up",
        icon: TrendingUp,
        color: "text-cyan-400",
      },
      {
        label: "Conversion Rate",
        value: "4.2%",
        change: "-0.8%",
        trend: "down",
        icon: Target,
        color: "text-purple-400",
      },
      {
        label: "Active Users",
        value: "24",
        change: "+5",
        trend: "up",
        icon: Users,
        color: "text-amber-400",
      },
    ];

    return (
      <div className="grid grid-cols-2 gap-4">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
          >
            <div className="flex items-center justify-between mb-2">
              <kpi.icon className={cn("w-5 h-5", kpi.color)} />
              <Badge
                variant={kpi.trend === "up" ? "default" : "destructive"}
                className="text-xs"
              >
                {kpi.change}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {kpi.value}
            </div>
            <div className="text-sm text-slate-400">{kpi.label}</div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderSystemMetricsWidget = () => {
    const metrics = [
      {
        label: "CPU Usage",
        value: 45,
        color: "text-green-400",
        bgColor: "bg-green-500",
      },
      {
        label: "Memory",
        value: 62,
        color: "text-cyan-400",
        bgColor: "bg-cyan-500",
      },
      {
        label: "Network",
        value: 78,
        color: "text-purple-400",
        bgColor: "bg-purple-500",
      },
    ];

    return (
      <div className="space-y-4">
        {metrics.map(metric => (
          <div key={metric.label} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300">{metric.label}</span>
              <span className={cn("text-sm font-bold", metric.color)}>
                {metric.value}%
              </span>
            </div>
            <Progress value={metric.value} className="h-2" />
          </div>
        ))}
      </div>
    );
  };

  const renderClickUpWidget = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-slate-300">Connected</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/30 rounded-lg p-3">
            <div className="text-xl font-bold text-white">342</div>
            <div className="text-xs text-slate-400">Total Tasks</div>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-3">
            <div className="text-xl font-bold text-green-400">198</div>
            <div className="text-xs text-slate-400">Completed</div>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-3">
            <div className="text-xl font-bold text-cyan-400">87</div>
            <div className="text-xs text-slate-400">In Progress</div>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-3">
            <div className="text-xl font-bold text-orange-400">12</div>
            <div className="text-xs text-slate-400">Overdue</div>
          </div>
        </div>
      </div>
    );
  };

  const renderN8NWidget = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-slate-300">n8n Workflows</span>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse ml-auto" />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Active Workflows</span>
            <span className="text-lg font-bold text-cyan-400">38/45</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Success Rate</span>
            <span className="text-lg font-bold text-green-400">96.8%</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Today's Executions</span>
            <span className="text-lg font-bold text-purple-400">1,240</span>
          </div>
        </div>
      </div>
    );
  };

  const renderBlototoWidget = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-pink-400" />
          <span className="text-sm text-slate-300">Blototo Campaigns</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg p-3 border border-pink-500/20">
            <div className="text-lg font-bold text-pink-400">8</div>
            <div className="text-xs text-slate-400">Active Campaigns</div>
          </div>

          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-3 border border-green-500/20">
            <div className="text-lg font-bold text-green-400">156</div>
            <div className="text-xs text-slate-400">Leads Generated</div>
          </div>
        </div>
      </div>
    );
  };

  const renderROIWidget = () => {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">23.5%</div>
          <div className="text-sm text-slate-400">Current ROI</div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-slate-400">Revenue</span>
            <span className="text-sm font-medium text-white">$2.45M</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-slate-400">Marketing Spend</span>
            <span className="text-sm font-medium text-white">$245K</span>
          </div>
        </div>
      </div>
    );
  };

  const renderWidgetContent = () => {
    switch (type) {
      case "kpis":
        return renderKPIWidget();
      case "system-metrics":
        return renderSystemMetricsWidget();
      case "clickup":
        return renderClickUpWidget();
      case "n8n":
        return renderN8NWidget();
      case "blotato":
        return renderBlototoWidget();
      case "roi":
        return renderROIWidget();
      default:
        return (
          <div className="text-slate-400">Widget type not implemented</div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">
              {title}
            </CardTitle>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400">
                {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">{renderWidgetContent()}</CardContent>
      </Card>
    </motion.div>
  );
}
