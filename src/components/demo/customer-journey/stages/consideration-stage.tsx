"use client";

import React from "react";
import { motion } from "framer-motion";
import { Target, BarChart, Users } from "lucide-react";

interface ConsiderationStageProps {
  onProgressUpdate: (progress: number) => void;
  onDataUpdate: (data: Record<string, any>) => void;
}

export function ConsiderationStage({
  onProgressUpdate,
  onDataUpdate,
}: ConsiderationStageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <Target className="w-16 h-16 mx-auto mb-4 text-purple-500" />
        <h2 className="text-3xl font-bold text-white mb-2">Verkenning Fase</h2>
        <p className="text-gray-300">
          Ontdek de mogelijkheden en evalueer verschillende opties
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/5 rounded-lg p-6 border border-white/10"
        >
          <BarChart className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Prestatie Analyse
          </h3>
          <p className="text-gray-300 text-sm">
            Analyseer uw huidige marketing prestaties en identificeer
            verbeterpunten
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/5 rounded-lg p-6 border border-white/10"
        >
          <Users className="w-8 h-8 text-purple-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Doelgroep Targeting
          </h3>
          <p className="text-gray-300 text-sm">
            Verbeter uw doelgroep targeting met AI-gedreven inzichten
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/5 rounded-lg p-6 border border-white/10"
        >
          <Target className="w-8 h-8 text-green-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Strategie Optimalisatie
          </h3>
          <p className="text-gray-300 text-sm">
            Optimaliseer uw marketing strategie met geavanceerde AI algoritmes
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
