"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calculator, DollarSign, TrendingUp } from "lucide-react";

interface DecisionStageProps {
  onProgressUpdate: (progress: number) => void;
  onDataUpdate: (data: Record<string, any>) => void;
}

export function DecisionStage({
  onProgressUpdate,
  onDataUpdate,
}: DecisionStageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <Calculator className="w-16 h-16 mx-auto mb-4 text-green-500" />
        <h2 className="text-3xl font-bold text-white mb-2">Beslissing Fase</h2>
        <p className="text-gray-300">
          Bereken de ROI en maak een geïnformeerde beslissing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/5 rounded-lg p-6 border border-white/10"
        >
          <DollarSign className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">
            ROI Berekening
          </h3>
          <p className="text-gray-300 text-sm">
            Bereken het verwachte rendement op uw investering
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/5 rounded-lg p-6 border border-white/10"
        >
          <TrendingUp className="w-8 h-8 text-purple-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Groei Projectie
          </h3>
          <p className="text-gray-300 text-sm">
            Zie hoe uw bedrijf kan groeien met AI marketing automatisering
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/5 rounded-lg p-6 border border-white/10"
        >
          <Calculator className="w-8 h-8 text-green-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Kosten Analyse
          </h3>
          <p className="text-gray-300 text-sm">
            Vergelijk de kosten met de verwachte voordelen
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
