"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Locale } from "@/lib/i18n/config";
import { AwarenessStage } from "./stages/awareness-stage";
import { ConsiderationStage } from "./stages/consideration-stage";
import { DecisionStage } from "./stages/decision-stage";
import { ActionStage } from "./stages/action-stage";
import {
  Brain,
  Target,
  Calculator,
  Rocket,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

interface JourneyOrchestratorProps {
  locale: Locale;
}

export type JourneyStage =
  | "awareness"
  | "consideration"
  | "decision"
  | "action";

interface UserProgress {
  currentStage: JourneyStage;
  completedStages: JourneyStage[];
  stageProgress: Record<JourneyStage, number>;
  personalizedData: Record<string, any>;
  sessionStartTime: number;
  interactions: {
    stage: JourneyStage;
    action: string;
    timestamp: number;
    data?: any;
  }[];
}

interface StageConfig {
  id: JourneyStage;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  estimatedTime: string;
}

const stageConfigs: StageConfig[] = [
  {
    id: "awareness",
    title: "Herkenning",
    description: "Identificeer je uitdagingen",
    icon: Brain,
    estimatedTime: "2 min",
  },
  {
    id: "consideration",
    title: "Verkenning",
    description: "Ontdek de mogelijkheden",
    icon: Target,
    estimatedTime: "3 min",
  },
  {
    id: "decision",
    title: "Beslissing",
    description: "Bereken je ROI",
    icon: Calculator,
    estimatedTime: "2 min",
  },
  {
    id: "action",
    title: "Actie",
    description: "Start je transformatie",
    icon: Rocket,
    estimatedTime: "1 min",
  },
];

export default function JourneyOrchestrator({
  locale,
}: JourneyOrchestratorProps) {
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("skc-customer-journey");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn("Failed to parse saved journey progress");
        }
      }
    }

    return {
      currentStage: "awareness" as JourneyStage,
      completedStages: [],
      stageProgress: {
        awareness: 0,
        consideration: 0,
        decision: 0,
        action: 0,
      },
      personalizedData: {},
      sessionStartTime: Date.now(),
      interactions: [],
    };
  });

  // Save progress to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "skc-customer-journey",
        JSON.stringify(userProgress)
      );
    }
  }, [userProgress]);

  // Track analytics
  const trackInteraction = useCallback(
    (action: string, data?: any) => {
      const interaction = {
        stage: userProgress.currentStage,
        action,
        timestamp: Date.now(),
        data,
      };

      setUserProgress(prev => ({
        ...prev,
        interactions: [...prev.interactions, interaction],
      }));

      // Send to analytics service (placeholder)
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "customer_journey_interaction", {
          stage: userProgress.currentStage,
          action,
          session_duration: Date.now() - userProgress.sessionStartTime,
        });
      }
    },
    [userProgress.currentStage, userProgress.sessionStartTime]
  );

  // Update stage progress
  const updateStageProgress = useCallback(
    (stage: JourneyStage, progress: number) => {
      setUserProgress(prev => ({
        ...prev,
        stageProgress: {
          ...prev.stageProgress,
          [stage]: progress,
        },
      }));
    },
    []
  );

  // Navigate to stage
  const navigateToStage = useCallback(
    (stage: JourneyStage) => {
      // Mark previous stage as completed if moving forward
      const currentIndex = stageConfigs.findIndex(
        s => s.id === userProgress.currentStage
      );
      const newIndex = stageConfigs.findIndex(s => s.id === stage);

      if (newIndex > currentIndex) {
        const completedStages = [...userProgress.completedStages];
        if (!completedStages.includes(userProgress.currentStage)) {
          completedStages.push(userProgress.currentStage);
        }

        setUserProgress(prev => ({
          ...prev,
          currentStage: stage,
          completedStages,
        }));
      } else {
        setUserProgress(prev => ({
          ...prev,
          currentStage: stage,
        }));
      }

      trackInteraction("stage_navigation", {
        from: userProgress.currentStage,
        to: stage,
      });
    },
    [userProgress.currentStage, userProgress.completedStages, trackInteraction]
  );

  // Update personalized data
  const updatePersonalizedData = useCallback((key: string, value: any) => {
    setUserProgress(prev => ({
      ...prev,
      personalizedData: {
        ...prev.personalizedData,
        [key]: value,
      },
    }));
  }, []);

  // Calculate overall progress
  const overallProgress =
    Object.values(userProgress.stageProgress).reduce(
      (acc, curr) => acc + curr,
      0
    ) / 4;

  // Get current stage component
  const getCurrentStageComponent = () => {
    const commonProps = {
      locale,
      progress: userProgress.stageProgress[userProgress.currentStage],
      updateProgress: (progress: number) =>
        updateStageProgress(userProgress.currentStage, progress),
      trackInteraction,
      personalizedData: userProgress.personalizedData,
      updatePersonalizedData,
      navigateToStage,
    };

    switch (userProgress.currentStage) {
      case "awareness":
        return <AwarenessStage {...commonProps} />;
      case "consideration":
        return <ConsiderationStage {...commonProps} />;
      case "decision":
        return <DecisionStage {...commonProps} />;
      case "action":
        return <ActionStage {...commonProps} />;
      default:
        return <AwarenessStage {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Progress Header */}
      <div className="sticky top-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">
              SKC Marketing Machine Journey
            </h1>
            <div className="text-sm text-gray-300">
              {Math.round(overallProgress)}% voltooid
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Stage Navigation */}
          <div className="flex items-center justify-between">
            {stageConfigs.map((stage, index) => {
              const isActive = stage.id === userProgress.currentStage;
              const isCompleted = userProgress.completedStages.includes(
                stage.id
              );
              const isAccessible =
                index === 0 ||
                userProgress.completedStages.includes(
                  stageConfigs[index - 1].id
                );

              return (
                <NormalButton
                  key={stage.id}
                  onClick={() => isAccessible && navigateToStage(stage.id)}
                  disabled={!isAccessible}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : isCompleted
                        ? "bg-green-600 text-white hover:bg-green-500"
                        : isAccessible
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-800 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <stage.icon className="w-4 h-4" />
                  )}
                  <div className="text-left hidden md:block">
                    <div className="text-sm font-medium">{stage.title}</div>
                    <div className="text-xs opacity-75">
                      {stage.estimatedTime}
                    </div>
                  </div>
                </NormalButton>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stage Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={userProgress.currentStage}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          {getCurrentStageComponent()}
        </motion.div>
      </AnimatePresence>

      {/* Stage Navigation Buttons */}
      <div className="fixed bottom-6 right-6 flex space-x-4">
        {/* Previous Button */}
        {userProgress.currentStage !== "awareness" && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => {
              const currentIndex = stageConfigs.findIndex(
                s => s.id === userProgress.currentStage
              );
              if (currentIndex > 0) {
                navigateToStage(stageConfigs[currentIndex - 1].id);
              }
            }}
            className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full shadow-lg transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
        )}

        {/* Next Button */}
        {userProgress.currentStage !== "action" &&
          userProgress.stageProgress[userProgress.currentStage] >= 80 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => {
                const currentIndex = stageConfigs.findIndex(
                  s => s.id === userProgress.currentStage
                );
                if (currentIndex < stageConfigs.length - 1) {
                  navigateToStage(stageConfigs[currentIndex + 1].id);
                }
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white p-3 rounded-full shadow-lg transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          )}
      </div>
    </div>
  );
}
