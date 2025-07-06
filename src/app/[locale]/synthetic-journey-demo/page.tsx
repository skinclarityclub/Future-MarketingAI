"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react";
import SyntheticUserJourneyGenerator, {
  SyntheticJourney,
  GenerationSummary,
  ValidationReport,
} from "@/lib/data-seeding/synthetic-user-journey-generator";

interface DemoState {
  isGenerating: boolean;
  progress: number;
  journeys: SyntheticJourney[];
  summary: GenerationSummary | null;
  validationReport: ValidationReport | null;
  error: string | null;
}

export default function SyntheticJourneyDemoPage() {
  const [demoState, setDemoState] = useState<DemoState>({
    isGenerating: false,
    progress: 0,
    journeys: [],
    summary: null,
    validationReport: null,
    error: null,
  });

  const [generationConfig, setGenerationConfig] = useState({
    journey_count: 50,
    edge_case_coverage: 0.15,
    validation_level: "standard" as const,
  });

  const generateJourneys = async () => {
    setDemoState(prev => ({
      ...prev,
      isGenerating: true,
      progress: 0,
      error: null,
    }));

    try {
      const generator = new SyntheticUserJourneyGenerator();

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setDemoState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }));
      }, 200);

      const result = await generator.generateUserJourneys({
        journey_count: generationConfig.journey_count,
        edge_case_coverage: generationConfig.edge_case_coverage,
        validation_level: generationConfig.validation_level,
        persona_distribution: {
          data_analyst: 0.4,
          executive: 0.3,
          mobile_user: 0.2,
          accessibility_user: 0.1,
        },
      });

      clearInterval(progressInterval);

      setDemoState(prev => ({
        ...prev,
        isGenerating: false,
        progress: 100,
        journeys: result.journeys,
        summary: result.generation_summary,
        validationReport: result.validation_report,
      }));
    } catch (error) {
      setDemoState(prev => ({
        ...prev,
        isGenerating: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }));
    }
  };

  const renderJourneyCard = (journey: SyntheticJourney, index: number) => (
    <Card key={journey.journey_id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">
            Journey #{index + 1} - {journey.persona.name}
          </CardTitle>
          <Badge
            variant={
              journey.validation_results.overall_validity
                ? "default"
                : "destructive"
            }
          >
            {journey.validation_results.overall_validity ? "Valid" : "Invalid"}
          </Badge>
        </div>
        <CardDescription>
          {journey.generated_steps.length} steps •{" "}
          {journey.edge_cases_triggered.length} edge cases
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Experience Level:</span>{" "}
              {journey.persona.demographics.experience_level}
            </div>
            <div>
              <span className="font-medium">Device:</span>{" "}
              {journey.persona.demographics.device_preference}
            </div>
            <div>
              <span className="font-medium">Navigation Style:</span>{" "}
              {journey.persona.preferred_navigation_style}
            </div>
            <div>
              <span className="font-medium">Session Duration:</span>{" "}
              {journey.persona.typical_session_duration}s
            </div>
          </div>

          {journey.edge_cases_triggered.length > 0 && (
            <div>
              <div className="font-medium text-sm mb-2">
                Edge Cases Triggered:
              </div>
              <div className="flex flex-wrap gap-1">
                {journey.edge_cases_triggered.map(edgeCase => (
                  <Badge key={edgeCase} variant="outline" className="text-xs">
                    {edgeCase.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-muted rounded">
              <div className="font-medium">
                {(journey.quality_metrics.realism_score * 100).toFixed(0)}%
              </div>
              <div>Realism</div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="font-medium">
                {(
                  journey.quality_metrics.accessibility_compliance * 100
                ).toFixed(0)}
                %
              </div>
              <div>Accessibility</div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="font-medium">
                {(journey.quality_metrics.ux_coherence_score * 100).toFixed(0)}%
              </div>
              <div>UX Coherence</div>
            </div>
          </div>

          <details className="text-sm">
            <summary className="cursor-pointer font-medium">
              Journey Steps ({journey.generated_steps.length})
            </summary>
            <div className="mt-2 space-y-1">
              {journey.generated_steps.map(step => (
                <div
                  key={step.step_sequence}
                  className="flex items-center gap-2 text-xs"
                >
                  <Badge
                    variant="secondary"
                    className="w-6 h-6 rounded-full text-xs p-0 flex items-center justify-center"
                  >
                    {step.step_sequence}
                  </Badge>
                  <span className="flex-1">{step.page_url}</span>
                  <span className="text-muted-foreground">
                    {step.action_type}
                  </span>
                  <span className="text-muted-foreground">
                    {step.duration_seconds}s
                  </span>
                </div>
              ))}
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Synthetische User Journey Generator
        </h1>
        <p className="text-muted-foreground mt-2">
          Task 74.5: Genereer en valideer synthetische navigatiescenario&apos;s
          en edge cases voor het Navigation & User Experience AI systeem.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Generation Config
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Journey Count</label>
                <input
                  type="number"
                  value={generationConfig.journey_count}
                  onChange={e =>
                    setGenerationConfig(prev => ({
                      ...prev,
                      journey_count: parseInt(e.target.value) || 50,
                    }))
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  min="1"
                  max="1000"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Edge Case Coverage
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={generationConfig.edge_case_coverage}
                  onChange={e =>
                    setGenerationConfig(prev => ({
                      ...prev,
                      edge_case_coverage: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full mt-1"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {(generationConfig.edge_case_coverage * 100).toFixed(0)}%
                </div>
              </div>
              <Button
                onClick={generateJourneys}
                disabled={demoState.isGenerating}
                className="w-full"
              >
                {demoState.isGenerating ? "Generating..." : "Generate Journeys"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {demoState.summary && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Generation Summary
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Journeys:</span>
                    <span className="font-medium">
                      {demoState.summary.total_journeys_generated}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Generation Time:</span>
                    <span className="font-medium">
                      {(demoState.summary.generation_time_ms / 1000).toFixed(2)}
                      s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Quality Score:</span>
                    <span className="font-medium">
                      {(demoState.summary.overall_quality_score * 100).toFixed(
                        1
                      )}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Validation Pass Rate:</span>
                    <span className="font-medium">
                      {(demoState.summary.validation_pass_rate * 100).toFixed(
                        1
                      )}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Validation Report
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        demoState.validationReport
                          ?.overall_validation_status === "passed"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {demoState.validationReport?.overall_validation_status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Validations Run:</span>
                    <span className="font-medium">
                      {demoState.validationReport?.total_validations_run}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Critical Violations:</span>
                    <span className="font-medium">
                      {demoState.validationReport?.critical_violations}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {demoState.isGenerating && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Generating synthetic journeys...
                </span>
                <span className="text-sm text-muted-foreground">
                  {demoState.progress}%
                </span>
              </div>
              <Progress value={demoState.progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {demoState.error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{demoState.error}</AlertDescription>
        </Alert>
      )}

      {demoState.journeys.length > 0 && (
        <Tabs defaultValue="journeys" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="journeys">
              Generated Journeys ({demoState.journeys.length})
            </TabsTrigger>
            <TabsTrigger value="personas">Persona Distribution</TabsTrigger>
            <TabsTrigger value="edgecases">Edge Case Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="journeys" className="space-y-4">
            <div className="max-h-96 overflow-y-auto">
              {demoState.journeys
                .slice(0, 10)
                .map((journey, index) => renderJourneyCard(journey, index))}
              {demoState.journeys.length > 10 && (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">
                      Showing 10 of {demoState.journeys.length} journeys.
                      {demoState.journeys.length - 10} more available.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="personas" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {demoState.summary &&
                Object.entries(demoState.summary.persona_distribution).map(
                  ([persona, count]) => (
                    <Card key={persona}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">
                          {persona.replace(/_/g, " ").toUpperCase()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-sm text-muted-foreground">
                          {(
                            (count /
                              demoState.summary!.total_journeys_generated) *
                            100
                          ).toFixed(1)}
                          % of total
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
            </div>
          </TabsContent>

          <TabsContent value="edgecases" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {demoState.summary &&
                Object.entries(demoState.summary.edge_case_coverage).map(
                  ([edgeCase, count]) => (
                    <Card key={edgeCase}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">
                          {edgeCase.replace(/_/g, " ").toUpperCase()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">{count}</div>
                        <div className="text-sm text-muted-foreground">
                          occurrences in journeys
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
