"use client";

import { useEffect } from "react";
import { autoInitializeImageOptimization } from "@/lib/optimization/asset-optimization-service";

export function AssetOptimizationInit() {
  useEffect(() => {
    autoInitializeImageOptimization();
  }, []);

  return null;
}
