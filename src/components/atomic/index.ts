/**
 * ATOMIC DESIGN COMPONENT LIBRARY
 * Organizing existing components into atomic design structure
 * Following Brad Frost's Atomic Design methodology
 */

// ============================
// ATOMS (Basic Building Blocks)
// ============================

// Buttons - Already existing, well-designed components
export { Button, buttonVariants } from "../ui/button";
export { PremiumButton } from "../ui/premium-button";
export { QuantumButton } from "../ui/neural-components";
export { PremiumButton as GlassButton } from "../ui/premium-design-system";

// Form Controls
export {
  Input,
  Label,
  Textarea,
  Checkbox,
  Switch,
  Slider,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/input";
export { Label } from "../ui/label";
export { Textarea } from "../ui/textarea";
export { Checkbox } from "../ui/checkbox";
export { Switch } from "../ui/switch";
export { Slider } from "../ui/slider";
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// Visual Elements
export { Badge } from "../ui/badge";
export { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
export { Skeleton } from "../ui/skeleton";
export { Progress } from "../ui/progress";
export { LoadingSpinner } from "../ui/loading-spinner";

// Glass & Neural Effects
export {
  NeuralGlassCard,
  NeuralTypewriter,
  HolographicNav,
  NeuralDataPoint,
  AIProcessing,
  QuantumModal,
} from "../ui/neural-components";

export {
  GlassContainer,
  PremiumCard,
  AnimatedGradient,
  PremiumHeading,
  PremiumIcon,
} from "../ui/premium-design-system";

// ============================
// MOLECULES (Simple Combinations)
// ============================

// Navigation & Layout
export { NavigationBar } from "../navigation/navigation-bar";
export { MobileBottomNavigation } from "../ui/mobile-navigation";

// Data Display
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

// Overlays
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

export { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

// ============================
// ORGANISMS (Complex Components)
// ============================

// Command Center Components
export { CommandCenterDashboard } from "../command-center/command-center-dashboard";
export { CommandCenterWidget } from "../command-center/command-center-widget";

// Dashboard Components
export { DashboardLayout } from "../layout/dashboard-layout";
export { DashboardHeader } from "../layout/dashboard-header";
export { DashboardSidebar } from "../layout/dashboard-sidebar";

// Analytics & Charts
export { AdvancedChart } from "../charts/advanced-chart";
export { RealtimeChart } from "../charts/realtime-chart";

// Admin Components
export { AdminDashboard } from "../admin/admin-dashboard";
export { UserManagement } from "../admin/user-management";

// AI Assistant
export { AIAssistant } from "../ai-assistant/ai-assistant";
export { ChatInterface } from "../ai-assistant/chat-interface";

// ============================
// TEMPLATES (Layout Structures)
// ============================

// Page Templates
export { DashboardTemplate } from "../layout/dashboard-template";
export { AdminTemplate } from "../layout/admin-template";

// ============================
// UTILITIES & PROVIDERS
// ============================

export { ThemeProvider } from "../providers/theme-provider";
export { LocaleProvider } from "../providers/locale-provider";

// ============================
// TYPE EXPORTS
// ============================

export type { Locale } from "../../i18n/request";
export type { ComponentProps } from "react";

// Re-export commonly used utilities
export { cn } from "../../lib/utils";
