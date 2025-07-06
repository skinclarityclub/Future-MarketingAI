import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const dashboardConfig = {
  updateInterval: 30000, // 30 seconds
  performanceTarget: 1000, // 1 second
  isDevelopment: process.env.NODE_ENV === "development",
};
