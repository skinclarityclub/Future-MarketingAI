"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Brain,
  Cpu,
  Database,
  Globe,
  Lock,
  Rocket,
} from "lucide-react";

interface ParticleProps {
  x: number;
  y: number;
  delay: number;
}

const FloatingParticle: React.FC<ParticleProps> = ({ x, y, delay }) => (
  <motion.div
    className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60"
    style={{ left: `${x}%`, top: `${y}%` }}
    animate={{
      y: [0, -20, 0],
      opacity: [0.3, 0.8, 0.3],
      scale: [0.5, 1, 0.5],
    }}
    transition={{
      duration: 3 + Math.random() * 2,
      repeat: Infinity,
      delay: delay,
      ease: "easeInOut",
    }}
  />
);

const HolographicCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}> = ({ icon: Icon, title, description, delay }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative bg-gradient-to-br from-slate-800/40 via-slate-700/30 to-slate-800/40 
        backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 
        transform transition-all duration-300 hover:scale-105
        hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/20"
      >
        {/* Holographic glow effect */}
        <div
          className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 
          rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"
        />

        <div className="relative z-10">
          <div
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-br 
            from-cyan-500/20 to-blue-500/20 rounded-xl mb-4 group-hover:from-cyan-400/30 
            group-hover:to-blue-400/30 transition-all duration-300"
          >
            <Icon className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300" />
          </div>

          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Animated border */}
        <motion.div
          className="absolute inset-0 rounded-2xl border border-cyan-400/0"
          animate={
            isHovered
              ? {
                  borderColor: [
                    "rgba(34, 211, 238, 0)",
                    "rgba(34, 211, 238, 0.4)",
                    "rgba(34, 211, 238, 0)",
                  ],
                }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
};

export const FuturisticHeroSection: React.FC = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [particles, setParticles] = useState<ParticleProps[]>([]);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  useEffect(() => {
    // Generate random particles
    const particleArray: ParticleProps[] = [];
    for (let i = 0; i < 25; i++) {
      particleArray.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3,
      });
    }
    setParticles(particleArray);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analytics",
      description:
        "Machine learning algorithms that adapt to your business patterns and provide predictive insights.",
    },
    {
      icon: Zap,
      title: "Real-time Processing",
      description:
        "Lightning-fast data processing with sub-second response times for critical business decisions.",
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description:
        "Bank-grade encryption and compliance standards to protect your most sensitive business data.",
    },
  ];

  return (
    <div
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5" />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] 
          from-cyan-500/10 via-transparent to-transparent"
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, index) => (
          <FloatingParticle key={index} {...particle} />
        ))}
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative z-10 w-full">
        <motion.div
          className="container mx-auto px-6 lg:px-8"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Main content */}
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="space-y-6">
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r 
                    from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-300">Powered by Advanced AI</span>
                </motion.div>

                <motion.h1
                  className="text-5xl lg:text-7xl font-bold leading-tight"
                  variants={itemVariants}
                >
                  <span
                    className="bg-gradient-to-r from-white via-slate-200 to-slate-300 
                    bg-clip-text text-transparent"
                  >
                    Future of
                  </span>
                  <br />
                  <span
                    className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 
                    bg-clip-text text-transparent"
                  >
                    Business Intelligence
                  </span>
                </motion.h1>

                <motion.p
                  className="text-xl text-slate-300 leading-relaxed max-w-xl"
                  variants={itemVariants}
                >
                  Transform your data into actionable insights with our
                  next-generation BI platform. Experience the perfect fusion of
                  artificial intelligence and intuitive design.
                </motion.p>
              </div>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                variants={itemVariants}
              >
                <motion.button
                  className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 
                    text-white font-semibold rounded-xl overflow-hidden transition-all duration-300
                    hover:from-cyan-400 hover:to-blue-400 hover:shadow-lg hover:shadow-cyan-500/25"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                    translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                  />
                </motion.button>

                <motion.button
                  className="px-8 py-4 border border-slate-600 text-slate-200 font-semibold rounded-xl 
                    hover:border-slate-500 hover:bg-slate-800/50 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Watch Demo
                </motion.button>
              </motion.div>

              {/* Statistics */}
              <motion.div
                className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-700/50"
                variants={itemVariants}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">99.9%</div>
                  <div className="text-sm text-slate-400">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">50ms</div>
                  <div className="text-sm text-slate-400">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">10k+</div>
                  <div className="text-sm text-slate-400">Enterprises</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Feature cards */}
            <motion.div variants={itemVariants} className="space-y-6">
              {features.map((feature, index) => (
                <HolographicCard key={index} {...feature} delay={0.1 * index} />
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Floating elements */}
      <motion.div
        className="absolute top-1/4 right-10 w-4 h-4 bg-cyan-400 rounded-full opacity-60"
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/3 left-10 w-6 h-6 border-2 border-blue-400 rounded-full opacity-40"
        animate={{
          rotate: [0, 360],
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
};
