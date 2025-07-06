"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  connected: boolean;
  className?: string;
}

export function ConnectionStatus({
  connected,
  className,
}: ConnectionStatusProps) {
  return (
    <Card className={cn("border-0 bg-transparent", className)}>
      <CardContent className="p-2">
        <div className="flex items-center gap-2">
          {connected ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm font-medium">
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
