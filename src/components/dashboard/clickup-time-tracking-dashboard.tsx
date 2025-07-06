"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Clock,
  Play,
  Square,
  Edit,
  Trash2,
  Download,
  TrendingUp,
  Users,
  Target,
  Timer,
  Activity,
  BarChart3,
  Calendar,
  DollarSign,
  Zap,
  CheckCircle,
  AlertTriangle,
  Trophy,
  Gauge,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";

// Interfaces voor time tracking data
interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  description?: string;
  start_time: Date;
  end_time?: Date;
  duration: number;
  billable: boolean;
  created_at: Date;
  updated_at: Date;
}

interface ProjectProgress {
  project_id: string;
  project_name: string;
  total_estimated_time: number;
  total_tracked_time: number;
  completion_percentage: number;
  team_members: number;
  active_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  average_daily_hours: number;
  productivity_score: number;
  last_activity: Date;
}

interface TeamProductivity {
  user_id: string;
  user_name: string;
  total_hours_today: number;
  total_hours_week: number;
  total_hours_month: number;
  productivity_score: number;
  tasks_completed_today: number;
  tasks_completed_week: number;
  average_task_time: number;
  billable_hours_percentage: number;
  last_activity: Date;
}

interface TimeTrackingStats {
  total_tracked_time: number;
  billable_time: number;
  non_billable_time: number;
  active_timers: number;
  team_productivity_average: number;
  most_productive_hour: number;
  least_productive_hour: number;
  top_performer: string;
  projects_in_progress: number;
  overdue_projects: number;
}

interface ActiveTimer {
  id: string;
  task_id: string;
  task_name: string;
  user_id: string;
  user_name: string;
  start_time: Date;
  current_duration: number;
  description?: string;
  project_name: string;
  billable: boolean;
}

const ClickUpTimeTrackingDashboard = () => {
  // State management
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<TimeTrackingStats | null>(null);
  const [projectProgress, setProjectProgress] =
    useState<ProjectProgress | null>(null);
  const [teamProductivity, setTeamProductivity] = useState<TeamProductivity[]>(
    []
  );
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStartTimerDialogOpen, setIsStartTimerDialogOpen] = useState(false);

  // Form state for starting timer
  const [timerForm, setTimerForm] = useState({
    task_id: "",
    description: "",
    billable: true,
  });

  // Mock data generators
  const generateMockStats = (): TimeTrackingStats => ({
    total_tracked_time: 28800000, // 8 hours in ms
    billable_time: 25200000, // 7 hours in ms
    non_billable_time: 3600000, // 1 hour in ms
    active_timers: 3,
    team_productivity_average: 78.5,
    most_productive_hour: 10,
    least_productive_hour: 15,
    top_performer: "Mike Johnson",
    projects_in_progress: 5,
    overdue_projects: 2,
  });

  const generateMockProgress = (): ProjectProgress => ({
    project_id: "proj_001",
    project_name: "ClickUp Integration",
    total_estimated_time: 144000000, // 40 hours in ms
    total_tracked_time: 100800000, // 28 hours in ms
    completion_percentage: 70.0,
    team_members: 4,
    active_tasks: 12,
    completed_tasks: 8,
    overdue_tasks: 2,
    average_daily_hours: 6.5,
    productivity_score: 82.5,
    last_activity: new Date(),
  });

  const generateMockProductivity = (): TeamProductivity[] => [
    {
      user_id: "user_001",
      user_name: "John Doe",
      total_hours_today: 7.5,
      total_hours_week: 38.0,
      total_hours_month: 152.0,
      productivity_score: 85.2,
      tasks_completed_today: 4,
      tasks_completed_week: 18,
      average_task_time: 2.1,
      billable_hours_percentage: 87.5,
      last_activity: new Date(),
    },
    {
      user_id: "user_002",
      user_name: "Jane Smith",
      total_hours_today: 6.8,
      total_hours_week: 35.5,
      total_hours_month: 145.0,
      productivity_score: 78.9,
      tasks_completed_today: 3,
      tasks_completed_week: 15,
      average_task_time: 2.3,
      billable_hours_percentage: 82.1,
      last_activity: new Date(),
    },
    {
      user_id: "user_003",
      user_name: "Mike Johnson",
      total_hours_today: 8.2,
      total_hours_week: 41.0,
      total_hours_month: 158.0,
      productivity_score: 91.3,
      tasks_completed_today: 5,
      tasks_completed_week: 22,
      average_task_time: 1.8,
      billable_hours_percentage: 93.2,
      last_activity: new Date(),
    },
    {
      user_id: "user_004",
      user_name: "Sarah Wilson",
      total_hours_today: 5.9,
      total_hours_week: 32.0,
      total_hours_month: 128.0,
      productivity_score: 72.4,
      tasks_completed_today: 2,
      tasks_completed_week: 12,
      average_task_time: 2.8,
      billable_hours_percentage: 78.9,
      last_activity: new Date(),
    },
  ];

  const generateMockActiveTimers = (): ActiveTimer[] => [
    {
      id: "timer_001",
      task_id: "task_123",
      task_name: "Implementeer time tracking dashboard",
      user_id: "user_001",
      user_name: "John Doe",
      start_time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      current_duration: 2 * 60 * 60 * 1000, // 2 hours
      description: "Werken aan React componenten voor dashboard",
      project_name: "ClickUp Integration",
      billable: true,
    },
    {
      id: "timer_002",
      task_id: "task_124",
      task_name: "API testing en debugging",
      user_id: "user_002",
      user_name: "Jane Smith",
      start_time: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      current_duration: 45 * 60 * 1000, // 45 minutes
      description: "Testen van ClickUp API endpoints",
      project_name: "ClickUp Integration",
      billable: true,
    },
    {
      id: "timer_003",
      task_id: "task_125",
      task_name: "Database optimalisatie",
      user_id: "user_003",
      user_name: "Mike Johnson",
      start_time: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      current_duration: 30 * 60 * 1000, // 30 minutes
      description: "Performance tuning voor time tracking queries",
      project_name: "ClickUp Integration",
      billable: false,
    },
  ];

  // Data fetching
  const fetchData = async () => {
    try {
      setLoading(true);

      // Voor demo doeleinden gebruiken we mock data
      setStats(generateMockStats());
      setProjectProgress(generateMockProgress());
      setTeamProductivity(generateMockProductivity());
      setActiveTimers(generateMockActiveTimers());

      // In een echte implementatie zou je hier API calls maken:
      // const response = await fetch('/api/clickup/time-tracking?action=mock_data');
      // const data = await response.json();
      // setStats(data.data.stats);
      // setProjectProgress(data.data.progress);
      // setTeamProductivity(data.data.productivity);
      // setActiveTimers(data.data.active_timers);
    } catch (error) {
      console.error("Error fetching time tracking data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-refresh every 30 seconds for active timers
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Helper functions
  const formatDuration = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}u ${minutes}m`;
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const getProductivityColor = (score: number): string => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProductivityLevel = (score: number): string => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Goed";
    return "Heeft Verbetering Nodig";
  };

  // Handle timer start
  const handleStartTimer = async () => {
    try {
      // Mock timer start
      const newTimer: ActiveTimer = {
        id: `timer_${Date.now()}`,
        task_id: timerForm.task_id || "task_demo",
        task_name: "Nieuwe Taak",
        user_id: "user_current",
        user_name: "Huidige Gebruiker",
        start_time: new Date(),
        current_duration: 0,
        description: timerForm.description,
        project_name: "Demo Project",
        billable: timerForm.billable,
      };

      setActiveTimers(prev => [...prev, newTimer]);
      setIsStartTimerDialogOpen(false);
      setTimerForm({ task_id: "", description: "", billable: true });
    } catch (error) {
      console.error("Error starting timer:", error);
    }
  };

  // Handle timer stop
  const handleStopTimer = async (timerId: string) => {
    try {
      setActiveTimers(prev => prev.filter(timer => timer.id !== timerId));
    } catch (error) {
      console.error("Error stopping timer:", error);
    }
  };

  // Chart data generators
  const weeklyHoursData = [
    { dag: "Ma", uren: 7.5, factureerbaar: 6.8 },
    { dag: "Di", uren: 8.2, factureerbaar: 7.9 },
    { dag: "Wo", uren: 6.9, factureerbaar: 6.1 },
    { dag: "Do", uren: 8.5, factureerbaar: 8.0 },
    { dag: "Vr", uren: 7.1, factureerbaar: 6.5 },
  ];

  const productivityDistribution = [
    { naam: "Excellent", waarde: 2, kleur: "#10b981" },
    { naam: "Goed", waarde: 1, kleur: "#f59e0b" },
    { naam: "Verbetering", waarde: 1, kleur: "#ef4444" },
  ];

  const dailyProductivityTrend = [
    { tijd: "09:00", score: 75 },
    { tijd: "10:00", score: 82 },
    { tijd: "11:00", score: 88 },
    { tijd: "12:00", score: 65 },
    { tijd: "13:00", score: 55 },
    { tijd: "14:00", score: 78 },
    { tijd: "15:00", score: 85 },
    { tijd: "16:00", score: 90 },
    { tijd: "17:00", score: 75 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-muted-foreground">
            Laden van time tracking data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ClickUp Time Tracking Dashboard
        </h1>
        <p className="text-muted-foreground">
          Beheer en analyseer tijd tracking, project voortgang en team
          productiviteit
        </p>
      </div>

      {/* Quick Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Totale Uren Vandaag
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatDuration(stats.total_tracked_time)}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Factureerbare Uren
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatDuration(stats.billable_time)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Actieve Timers
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.active_timers}
                  </p>
                </div>
                <Timer className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Team Productiviteit
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatPercentage(stats.team_productivity_average)}
                  </p>
                </div>
                <Gauge className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-5 bg-white/50 backdrop-blur-sm">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white"
          >
            Overzicht
          </TabsTrigger>
          <TabsTrigger value="timers" className="data-[state=active]:bg-white">
            Actieve Timers
          </TabsTrigger>
          <TabsTrigger
            value="progress"
            className="data-[state=active]:bg-white"
          >
            Project Voortgang
          </TabsTrigger>
          <TabsTrigger
            value="productivity"
            className="data-[state=active]:bg-white"
          >
            Team Productiviteit
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-white"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Hours Chart */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Weekoverzicht Uren
                </CardTitle>
                <CardDescription>
                  Getrackte uren per dag deze week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyHoursData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dag" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(1)}u`,
                        name === "uren" ? "Totaal" : "Factureerbaar",
                      ]}
                    />
                    <Bar dataKey="uren" fill="#3b82f6" name="uren" />
                    <Bar
                      dataKey="factureerbaar"
                      fill="#10b981"
                      name="factureerbaar"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Productivity Distribution */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Productiviteit Verdeling
                </CardTitle>
                <CardDescription>Team performance levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productivityDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="waarde"
                      label={({ naam, waarde }) => `${naam}: ${waarde}`}
                    >
                      {productivityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.kleur} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Project Progress Overview */}
          {projectProgress && (
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Project Voortgang: {projectProgress.project_name}
                </CardTitle>
                <CardDescription>
                  Huidige status en statistieken
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Voltooiingspercentage
                      </p>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={projectProgress.completion_percentage}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium">
                          {formatPercentage(
                            projectProgress.completion_percentage
                          )}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Productiviteitsscore
                      </p>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={projectProgress.productivity_score}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium">
                          {formatPercentage(projectProgress.productivity_score)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Team Leden:
                      </span>
                      <span className="text-sm font-medium">
                        {projectProgress.team_members}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Actieve Taken:
                      </span>
                      <span className="text-sm font-medium">
                        {projectProgress.active_tasks}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Voltooide Taken:
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        {projectProgress.completed_tasks}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Verlopen Taken:
                      </span>
                      <span className="text-sm font-medium text-red-600">
                        {projectProgress.overdue_tasks}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Geschatte Tijd:
                      </span>
                      <span className="text-sm font-medium">
                        {formatDuration(projectProgress.total_estimated_time)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Getrackte Tijd:
                      </span>
                      <span className="text-sm font-medium">
                        {formatDuration(projectProgress.total_tracked_time)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Gemiddeld per Dag:
                      </span>
                      <span className="text-sm font-medium">
                        {projectProgress.average_daily_hours.toFixed(1)}u
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Active Timers Tab */}
        <TabsContent value="timers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Actieve Timers</h2>
            <Dialog
              open={isStartTimerDialogOpen}
              onOpenChange={setIsStartTimerDialogOpen}
            >
              <DialogTrigger asChild>
                <NormalButton className="bg-green-600 hover:bg-green-700">
                  <Play className="w-4 h-4 mr-2" />
                  Start Timer
                </NormalButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nieuwe Timer Starten</DialogTitle>
                  <DialogDescription>
                    Start een nieuwe timer voor een taak
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="task_id">Taak ID</Label>
                    <Input
                      id="task_id"
                      value={timerForm.task_id}
                      onChange={e =>
                        setTimerForm(prev => ({
                          ...prev,
                          task_id: e.target.value,
                        }))
                      }
                      placeholder="Bijv. TASK-123"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Beschrijving</Label>
                    <Textarea
                      id="description"
                      value={timerForm.description}
                      onChange={e =>
                        setTimerForm(prev => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Waar ga je aan werken?"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="billable"
                      checked={timerForm.billable}
                      onCheckedChange={checked =>
                        setTimerForm(prev => ({ ...prev, billable: checked }))
                      }
                    />
                    <Label htmlFor="billable">Factureerbaar</Label>
                  </div>
                </div>
                <DialogFooter>
                  <NormalButton
                    variant="outline"
                    onClick={() => setIsStartTimerDialogOpen(false)}
                  >
                    Annuleren
                  </NormalButton>
                  <NormalButton onClick={handleStartTimer}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Timer
                  </NormalButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTimers.map(timer => (
              <Card
                key={timer.id}
                className="bg-white/70 backdrop-blur-sm border-0 shadow-lg"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {timer.task_name}
                      </CardTitle>
                      <CardDescription>{timer.user_name}</CardDescription>
                    </div>
                    <Badge variant={timer.billable ? "default" : "secondary"}>
                      {timer.billable ? "Factureerbaar" : "Niet-factureerbaar"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Project</p>
                      <p className="font-medium">{timer.project_name}</p>
                    </div>

                    {timer.description && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Beschrijving
                        </p>
                        <p className="text-sm">{timer.description}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Lopende Tijd
                      </p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatDuration(timer.current_duration)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Gestart</p>
                      <p className="text-sm">
                        {timer.start_time.toLocaleTimeString("nl-NL")}
                      </p>
                    </div>

                    <NormalButton
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => handleStopTimer(timer.id)}
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop Timer
                    </NormalButton>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {activeTimers.length === 0 && (
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <Timer className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  Geen Actieve Timers
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start een nieuwe timer om tijd te beginnen tracken
                </p>
                <NormalButton onClick={() => setIsStartTimerDialogOpen(true)}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Eerste Timer
                </NormalButton>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Team Productivity Tab */}
        <TabsContent value="productivity" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Team Productiviteit</h2>
            <NormalButton variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Rapport
            </NormalButton>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {teamProductivity.map((member, index) => (
              <Card
                key={member.user_id}
                className="bg-white/70 backdrop-blur-sm border-0 shadow-lg"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {member.user_name}
                    </CardTitle>
                    {index === 0 && (
                      <Trophy className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <CardDescription>
                    Productiviteit:{" "}
                    <span
                      className={`font-medium ${getProductivityColor(member.productivity_score)}`}
                    >
                      {getProductivityLevel(member.productivity_score)}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-muted-foreground">
                          Productiviteitsscore
                        </span>
                        <span className="text-sm font-medium">
                          {member.productivity_score.toFixed(1)}
                        </span>
                      </div>
                      <Progress
                        value={member.productivity_score}
                        className="h-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Vandaag</p>
                        <p className="font-medium">
                          {member.total_hours_today.toFixed(1)}u
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Deze Week</p>
                        <p className="font-medium">
                          {member.total_hours_week.toFixed(1)}u
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Taken Vandaag</p>
                        <p className="font-medium">
                          {member.tasks_completed_today}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Taken Week</p>
                        <p className="font-medium">
                          {member.tasks_completed_week}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Factureerbaar:
                        </span>
                        <span className="font-medium">
                          {formatPercentage(member.billable_hours_percentage)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Gem. Taaktijd:
                        </span>
                        <span className="font-medium">
                          {member.average_task_time.toFixed(1)}u
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Time Tracking Analytics</h2>
            <div className="flex gap-2">
              <Select defaultValue="7d">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Vandaag</SelectItem>
                  <SelectItem value="7d">Deze Week</SelectItem>
                  <SelectItem value="30d">Deze Maand</SelectItem>
                  <SelectItem value="90d">Laatste 3 Maanden</SelectItem>
                </SelectContent>
              </Select>
              <NormalButton variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </NormalButton>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Productivity Trend */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Dagelijkse Productiviteit Trend
                </CardTitle>
                <CardDescription>
                  Productiviteit per uur vandaag
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyProductivityTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tijd" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      formatter={(value: number) => [
                        `${value}%`,
                        "Productiviteit",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Summary Statistics */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Samenvatting Statistieken
                </CardTitle>
                <CardDescription>Key metrics voor deze periode</CardDescription>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                        <p className="text-2xl font-bold text-blue-600">
                          {formatDuration(stats.total_tracked_time)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Totale Tijd
                        </p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-600" />
                        <p className="text-2xl font-bold text-green-600">
                          {(
                            (stats.billable_time / stats.total_tracked_time) *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Factureerbaar
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Meest Productieve Uur:
                        </span>
                        <span className="font-medium">
                          {stats.most_productive_hour}:00
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Minst Productieve Uur:
                        </span>
                        <span className="font-medium">
                          {stats.least_productive_hour}:00
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Top Performer:
                        </span>
                        <span className="font-medium">
                          {stats.top_performer}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Projecten In Uitvoering:
                        </span>
                        <span className="font-medium">
                          {stats.projects_in_progress}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Verlopen Projecten:
                        </span>
                        <span className="font-medium text-red-600">
                          {stats.overdue_projects}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">
                        Team Productiviteit Gemiddelde
                      </p>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={stats.team_productivity_average}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium">
                          {formatPercentage(stats.team_productivity_average)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClickUpTimeTrackingDashboard;
