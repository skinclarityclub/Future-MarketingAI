"use client";

import React from "react";
import { motion } from "framer-motion";
import { Rocket, Calendar, Phone } from "lucide-react";

interface ActionStageProps {
  onProgressUpdate: (progress: number) => void;
  onDataUpdate: (data: Record<string, any>) => void;
}

export function ActionStage({
  onProgressUpdate,
  onDataUpdate,
}: ActionStageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <Rocket className="w-16 h-16 mx-auto mb-4 text-orange-500" />
        <h2 className="text-3xl font-bold text-white mb-2">Actie Fase</h2>
        <p className="text-gray-300">
          Start uw transformatie en neem de volgende stap
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/5 rounded-lg p-6 border border-white/10"
        >
          <Calendar className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Plan een Demo
          </h3>
          <p className="text-gray-300 text-sm">
            Boek een persoonlijke demonstratie van het platform
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/5 rounded-lg p-6 border border-white/10"
        >
          <Phone className="w-8 h-8 text-purple-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Neem Contact Op
          </h3>
          <p className="text-gray-300 text-sm">
            Spreek met onze experts over uw specifieke behoeften
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/5 rounded-lg p-6 border border-white/10"
        >
          <Rocket className="w-8 h-8 text-green-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Start Vandaag
          </h3>
          <p className="text-gray-300 text-sm">
            Begin meteen met het transformeren van uw marketing
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
