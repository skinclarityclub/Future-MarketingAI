/**
 * Data Seeding Orchestrator Page
 * Task 72: Ontwikkel Geïntegreerde Data Seeding Strategie voor Alle AI/ML Systemen
 *
 * Centrale interface voor het beheren van de geïntegreerde data seeding orchestrator
 * die alle AI/ML systemen voorziet van intelligente startdata
 */

import React from "react";
import { Metadata } from "next";
import { DataSeedingOrchestratorDashboard } from "@/components/dashboard/data-seeding-orchestrator-dashboard";

export const metadata: Metadata = {
  title: "Data Seeding Orchestrator | SKC BI Dashboard",
  description:
    "Centrale data seeding orchestrator voor alle AI/ML systemen - verzameling, normalisatie en distributie van intelligente startdata",
};

export default function DataSeedingOrchestratorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Data Seeding Orchestrator
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl">
          Centrale data seeding orchestrator die automatisch historische,
          gesynthetiseerde en benchmark data verzamelt, normaliseert en
          distribueert naar alle AI/ML engines binnen het SKC BI Dashboard
          project voor optimale machine learning prestaties.
        </p>
      </div>

      <DataSeedingOrchestratorDashboard />
    </div>
  );
}
