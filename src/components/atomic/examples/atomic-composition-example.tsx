"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

// Import atoms (basic building blocks)
import { QuantumButton } from "../ui/neural-components";
import { GlassContainer, PremiumCard } from "../ui/premium-design-system";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

// Import molecules (simple combinations)
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

/**
 * ATOMIC COMPOSITION EXAMPLE
 *
 * Demonstrates how to combine existing atoms and molecules
 * into complex organisms following atomic design principles
 */

// ============================
// MOLECULE: AI Status Card
// ============================
interface AIStatusCardProps {
  title: string;
  status: "processing" | "idle" | "success" | "error";
  progress?: number;
  children?: React.ReactNode;
  className?: string;
}

const AIStatusCard: React.FC<AIStatusCardProps> = ({
  title,
  status,
  progress = 0,
  children,
  className,
}) => {
  const statusColors = {
    processing: "bg-blue-500",
    idle: "bg-gray-500",
    success: "bg-green-500",
    error: "bg-red-500",
  };

  const statusLabels = {
    processing: "Processing",
    idle: "Idle",
    success: "Complete",
    error: "Error",
  };

  return (
    <PremiumCard className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <Badge className={statusColors[status]}>{statusLabels[status]}</Badge>
      </div>

      {status === "processing" && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-300">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {children}
    </PremiumCard>
  );
};

// ============================
// ORGANISM: Command Center Widget
// ============================
interface CommandCenterWidgetProps {
  title: string;
  className?: string;
}

const CommandCenterWidget: React.FC<CommandCenterWidgetProps> = ({
  title,
  className,
}) => {
  const [aiStatus, setAiStatus] = useState<"idle" | "processing" | "success">(
    "idle"
  );
  const [progress, setProgress] = useState(0);
  const [showDialog, setShowDialog] = useState(false);

  const startAIProcess = () => {
    setAiStatus("processing");
    setProgress(0);

    // Simulate AI processing
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setAiStatus("success");
          setTimeout(() => setAiStatus("idle"), 2000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <GlassContainer
      intensity="strong"
      animated
      className={cn("p-6 space-y-6", className)}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <QuantumButton variant="quantum" size="sm">
              Settings
            </QuantumButton>
          </DialogTrigger>
          <DialogContent className="bg-gray-900/95 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Widget Settings</DialogTitle>
              <DialogDescription className="text-gray-300">
                Configure your command center widget settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-white">
              <p>Widget configuration options would go here...</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AIStatusCard
          title="Neural Processing"
          status={aiStatus}
          progress={progress}
        >
          <QuantumButton
            variant="neural"
            onClick={startAIProcess}
            processing={aiStatus === "processing"}
            className="w-full"
          >
            {aiStatus === "processing" ? "Processing..." : "Start Analysis"}
          </QuantumButton>
        </AIStatusCard>

        <AIStatusCard title="Quantum Analytics" status="idle">
          <QuantumButton variant="quantum" className="w-full">
            Initialize Quantum
          </QuantumButton>
        </AIStatusCard>
      </div>

      <div className="flex gap-3">
        <QuantumButton variant="primary" className="flex-1">
          Primary Action
        </QuantumButton>
        <QuantumButton variant="secondary" className="flex-1">
          Secondary
        </QuantumButton>
      </div>
    </GlassContainer>
  );
};

// ============================
// MAIN EXAMPLE COMPONENT
// ============================
const AtomicCompositionExample: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Atomic Design Component Library
          </h1>
          <p className="text-xl text-gray-300">
            Demonstrating composition of atoms, molecules, and organisms
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CommandCenterWidget title="AI Command Center" />
          <CommandCenterWidget title="Analytics Hub" />
        </div>

        <div className="text-center">
          <PremiumCard className="inline-block p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Component Hierarchy
            </h3>
            <div className="text-left space-y-2 text-gray-300">
              <div>
                <strong>Atoms:</strong> QuantumButton, Badge, Progress
              </div>
              <div>
                <strong>Molecules:</strong> AIStatusCard, Dialog
              </div>
              <div>
                <strong>Organisms:</strong> CommandCenterWidget
              </div>
              <div>
                <strong>Templates:</strong> Full page layout
              </div>
            </div>
          </PremiumCard>
        </div>
      </div>
    </div>
  );
};

export default AtomicCompositionExample;
