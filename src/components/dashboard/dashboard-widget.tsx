"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardWidgetProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function DashboardWidget({
  title,
  children,
  className,
}: DashboardWidgetProps) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
}
