"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Shield,
  Database,
  Settings,
  Users,
  BarChart3,
  Loader2,
  RefreshCcw,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useSeamlessUpgrade,
  useDataPreservationMonitor,
} from "@/hooks/use-seamless-upgrade";
import { SubscriptionTier } from "@/lib/rbac/access-tier-service";
import { useUser } from "@/hooks/use-user";

interface SeamlessUpgradeFlowProps {
  targetTier: SubscriptionTier;
  billingInterval?: "monthly" | "yearly";
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function SeamlessUpgradeFlow({
  targetTier,
  billingInterval = "monthly",
  onSuccess,
  onCancel,
  className = "",
}: SeamlessUpgradeFlowProps) {
  const { user } = useUser();
  const {
    performUpgrade,
    upgradeProgress,
    isUpgrading,
    dataSnapshot,
    preservationStatus,
    upgradeError,
    canRollback,
    performRollback,
    estimatedUpgradeTime,
    clearUpgradeState,
  } = useSeamlessUpgrade({
    enableProgressTracking: true,
    enableDataMonitoring: true,
    autoRetryOnFailure: false,
  });

  const {
    preservationStatus: monitorStatus,
    startMonitoring,
    stopMonitoring,
  } = useDataPreservationMonitor(user?.id);

  const [step, setStep] = useState<
    "confirm" | "upgrading" | "completed" | "failed"
  >("confirm");
  const [showDataDetails, setShowDataDetails] = useState(false);

  // Update step based on upgrade progress
  useEffect(() => {
    if (upgradeProgress) {
      if (upgradeProgress.step === "completed") {
        setStep("completed");
        stopMonitoring();
        if (onSuccess) {
          setTimeout(onSuccess, 2000);
        }
      } else if (upgradeProgress.step === "failed") {
        setStep("failed");
        stopMonitoring();
      } else if (upgradeProgress.step !== "starting") {
        setStep("upgrading");
      }
    }
  }, [upgradeProgress, onSuccess, stopMonitoring]);

  const handleStartUpgrade = async () => {
    try {
      setStep("upgrading");
      startMonitoring();

      await performUpgrade(targetTier, {
        billingInterval,
        preserveContext: true,
      });
    } catch (error) {
      console.error("Upgrade failed:", error);
      setStep("failed");
      stopMonitoring();
    }
  };

  const handleRollback = async () => {
    const success = await performRollback();
    if (success) {
      setStep("confirm");
      clearUpgradeState();
    }
  };

  const handleCancel = () => {
    if (isUpgrading) {
      // Show warning about canceling during upgrade
      return;
    }
    clearUpgradeState();
    onCancel?.();
  };

  const getStepIcon = (stepName: string) => {
    if (!upgradeProgress) return <Loader2 className="h-4 w-4 animate-spin" />;

    const currentStep = upgradeProgress.step;
    const stepOrder = [
      "starting",
      "backing_up",
      "upgrading",
      "migrating",
      "restoring",
      "finalizing",
      "completed",
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    const targetIndex = stepOrder.indexOf(stepName);

    if (targetIndex < currentIndex || currentStep === "completed") {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (targetIndex === currentIndex) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    } else {
      return <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />;
    }
  };

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Ready to Upgrade</h3>
        <p className="text-muted-foreground">
          Your data will be preserved during the upgrade process
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Data Preservation Guarantee
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm">User Profile & Settings</span>
              <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Session Data & Context</span>
              <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Analytics & Reports</span>
              <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
            </div>
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Dashboard Layouts</span>
              <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleStartUpgrade} className="min-w-32">
          <ArrowRight className="h-4 w-4 mr-2" />
          Start Upgrade
        </Button>
      </div>
    </div>
  );

  const renderUpgradingStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Upgrading Your Account</h3>
        <p className="text-muted-foreground">
          Please wait while we safely upgrade your account...
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{upgradeProgress?.message || "Initializing..."}</span>
          <span>{upgradeProgress?.progress || 0}%</span>
        </div>
        <Progress value={upgradeProgress?.progress || 0} className="h-2" />
        {estimatedUpgradeTime > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Estimated time remaining: {Math.ceil(estimatedUpgradeTime / 1000)}s
          </p>
        )}
      </div>

      {/* Step Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[
              {
                key: "backing_up",
                label: "Creating Data Backup",
                description: "Securing your existing data",
              },
              {
                key: "upgrading",
                label: "Processing Subscription",
                description: "Updating billing and access",
              },
              {
                key: "migrating",
                label: "Migrating Data",
                description: "Transferring to new tier capabilities",
              },
              {
                key: "restoring",
                label: "Restoring Context",
                description: "Preserving your session state",
              },
              {
                key: "finalizing",
                label: "Finalizing Upgrade",
                description: "Completing the process",
              },
            ].map(stepInfo => (
              <div key={stepInfo.key} className="flex items-center gap-3">
                {getStepIcon(stepInfo.key)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{stepInfo.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {stepInfo.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Preservation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Data Preservation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(preservationStatus).map(([key, status]) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${status ? "bg-green-500" : "bg-gray-300"}`}
                />
                <span className="text-xs capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Snapshot Details */}
      {dataSnapshot && (
        <Card>
          <CardHeader>
            <CardTitle
              className="text-sm cursor-pointer flex items-center justify-between"
              onClick={() => setShowDataDetails(!showDataDetails)}
            >
              Data Snapshot Details
              <ArrowRight
                className={`h-4 w-4 transition-transform ${showDataDetails ? "rotate-90" : ""}`}
              />
            </CardTitle>
          </CardHeader>
          <AnimatePresence>
            {showDataDetails && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <CardContent>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Session Memories:</span>
                      <span>{dataSnapshot.sessionMemories?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conversation Entries:</span>
                      <span>
                        {dataSnapshot.conversationEntries?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Learning Insights:</span>
                      <span>{dataSnapshot.learningInsights?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saved Reports:</span>
                      <span>{dataSnapshot.savedReports?.length || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}
    </div>
  );

  const renderCompletedStep = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Upgrade Completed!</h3>
        <p className="text-muted-foreground">
          Your account has been successfully upgraded to {targetTier}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">All data preserved</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Session continuity maintained</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">New features enabled</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => onSuccess?.()} className="w-full">
        Continue to Dashboard
      </Button>
    </div>
  );

  const renderFailedStep = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
        <XCircle className="h-8 w-8 text-red-600" />
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Upgrade Failed</h3>
        <p className="text-muted-foreground">
          Don't worry - your data is safe and unchanged
        </p>
      </div>

      {upgradeError && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{upgradeError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Original data intact</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">No charges applied</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            {canRollback && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Rollback available</span>
                <Badge variant="outline">Available</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleCancel} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
        {canRollback && (
          <Button onClick={handleRollback} variant="outline" className="flex-1">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Rollback
          </Button>
        )}
        <Button onClick={handleStartUpgrade} className="flex-1">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    </div>
  );

  return (
    <div className={`max-w-2xl mx-auto p-6 ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === "confirm" && renderConfirmStep()}
          {step === "upgrading" && renderUpgradingStep()}
          {step === "completed" && renderCompletedStep()}
          {step === "failed" && renderFailedStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/**
 * Data Preservation Monitor Component
 */
interface DataPreservationMonitorProps {
  isActive: boolean;
  preservationStatus: any;
  className?: string;
}

export function DataPreservationMonitor({
  isActive,
  preservationStatus,
  className = "",
}: DataPreservationMonitorProps) {
  if (!isActive) return null;

  return (
    <Card className={`border-blue-200 bg-blue-50/50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-500" />
          Data Preservation Monitor
          <Badge variant="outline" className="ml-auto">
            {preservationStatus.dataIntegrity}% Integrity
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Items Preserved:</span>
            <span>
              {preservationStatus.preservedItems}/
              {preservationStatus.totalItems}
            </span>
          </div>

          <Progress
            value={
              (preservationStatus.preservedItems /
                preservationStatus.totalItems) *
              100
            }
            className="h-2"
          />

          {preservationStatus.issues.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-amber-700">
                Issues Detected:
              </span>
              {preservationStatus.issues.map((issue: string, index: number) => (
                <p key={index} className="text-xs text-amber-600">
                  • {issue}
                </p>
              ))}
            </div>
          )}

          {preservationStatus.lastCheck && (
            <p className="text-xs text-muted-foreground">
              Last check:{" "}
              {new Date(preservationStatus.lastCheck).toLocaleTimeString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Upgrade Progress Indicator
 */
interface UpgradeProgressIndicatorProps {
  progress: number;
  step: string;
  message: string;
  estimatedTime?: number;
  className?: string;
}

export function UpgradeProgressIndicator({
  progress,
  step,
  message,
  estimatedTime,
  className = "",
}: UpgradeProgressIndicatorProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium capitalize">
            {step.replace(/_/g, " ")}
          </p>
          <p className="text-xs text-muted-foreground">{message}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{progress}%</p>
          {estimatedTime && (
            <p className="text-xs text-muted-foreground">
              {Math.ceil(estimatedTime / 1000)}s left
            </p>
          )}
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        <span className="text-xs text-muted-foreground">
          Ensuring data integrity...
        </span>
      </div>
    </div>
  );
}
