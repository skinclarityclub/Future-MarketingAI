"use client";

import React from "react";
import { motion } from "framer-motion";
import { Brain, Search, Lightbulb } from "lucide-react";

interface AwarenessStageProps {
  onProgressUpdate: (progress: number) => void;
  onDataUpdate: (data: Record<string, any>) => void;
}

export function AwarenessStage({
  onProgressUpdate,
  onDataUpdate,
}: AwarenessStageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <Brain className="w-16 h-16 mx-auto mb-4 text-blue-500" />
        <h2 className="text-3xl font-bold text-white mb-2">
          Bewustwording Fase
        </h2>
        <p className="text-gray-300">
          Identificeer uw marketing uitdagingen en ontdek nieuwe mogelijkheden
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/5 rounded-lg p-6 border border-white/10"
        >
          <Search className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Probleem Identificatie
          </h3>
          <p className="text-gray-300 text-sm">
            Identificeer uw huidige marketing uitdagingen en pijnpunten
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/5 rounded-lg p-6 border border-white/10"
        >
          <Lightbulb className="w-8 h-8 text-purple-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Oplossing Verkenning
          </h3>
          <p className="text-gray-300 text-sm">
            Ontdek hoe AI uw marketing processen kan transformeren
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/5 rounded-lg p-6 border border-white/10"
        >
          <Brain className="w-8 h-8 text-green-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">
            AI Mogelijkheden
          </h3>
          <p className="text-gray-300 text-sm">
            Leer over de kracht van AI-gedreven marketing automatisering
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
