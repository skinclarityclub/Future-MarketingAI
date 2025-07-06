"use client";

import Link from "next/link";
// import { motion } from "framer-motion";
const motion = { section: "section", div: "div" } as any;
import {
  BookOpen,
  Code2,
  Palette,
  Zap,
  Settings,
  FileText,
  ExternalLink,
  Download,
  Star,
  GitBranch,
  Users,
  Sparkles,
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

interface DocumentationCard {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  isExternal?: boolean;
  badge?: string;
  stats?: {
    components?: number;
    patterns?: number;
    examples?: number;
  };
}

const documentationCards: DocumentationCard[] = [
  {
    title: "Design System Guide",
    description:
      "Complete visual design language, component library, and implementation standards for the SKC BI Dashboard",
    icon: Palette,
    href: "/docs/SKC-BI-DASHBOARD-DESIGN-SYSTEM.md",
    isExternal: true,
    badge: "Core",
    stats: {
      components: 25,
      patterns: 15,
      examples: 40,
    },
  },
  {
    title: "Developer Guidelines",
    description:
      "Comprehensive coding standards, implementation patterns, and best practices for Next.js 14, TypeScript, and TailwindCSS",
    icon: Code2,
    href: "/docs/DEVELOPER-GUIDELINES.md",
    isExternal: true,
    badge: "Essential",
    stats: {
      patterns: 30,
      examples: 50,
    },
  },
  {
    title: "Animation Pattern Library",
    description:
      "Complete animation framework with Framer Motion variants, timing systems, and performance-optimized patterns",
    icon: Zap,
    href: "/docs/ANIMATION-PATTERN-LIBRARY.md",
    isExternal: true,
    badge: "Premium",
    stats: {
      patterns: 20,
      examples: 35,
    },
  },
  {
    title: "Lead Generation Flow",
    description:
      "Interactive multi-step form system with progressive disclosure and conversion optimization",
    icon: Users,
    href: "/lead-generation-demo",
    badge: "Live Demo",
  },
  {
    title: "SEO Optimization",
    description:
      "Advanced SEO system with traditional and LLM optimization for maximum discoverability",
    icon: Settings,
    href: "/seo-optimization-demo",
    badge: "Live Demo",
  },
  {
    title: "Component Documentation",
    description:
      "Interactive examples and usage guidelines for all UI components and design patterns",
    icon: BookOpen,
    href: "#components",
    badge: "Interactive",
  },
];

const features = [
  {
    title: "Enterprise-Grade Components",
    description:
      "Premium UI components with glass morphism, neural themes, and 60fps animations",
    icon: Sparkles,
    color: "from-blue-500 to-purple-600",
  },
  {
    title: "Performance Optimized",
    description:
      "GPU-accelerated animations, code splitting, and React optimization patterns",
    icon: Zap,
    color: "from-purple-500 to-cyan-500",
  },
  {
    title: "Accessibility First",
    description:
      "WCAG 2.1 AA compliant with reduced motion support and screen reader optimization",
    icon: Users,
    color: "from-cyan-500 to-blue-500",
  },
  {
    title: "Developer Experience",
    description:
      "TypeScript strict mode, comprehensive testing, and detailed documentation",
    icon: Code2,
    color: "from-green-500 to-blue-500",
  },
];

const stats = [
  { label: "Components", value: "25+", description: "Premium UI components" },
  { label: "Patterns", value: "65+", description: "Design & code patterns" },
  { label: "Examples", value: "125+", description: "Implementation examples" },
  { label: "Performance", value: "60fps", description: "Animation target" },
];

export default function DesignSystemShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.1),transparent_50%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Design System v1.0.0
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-6">
              SKC BI Dashboard
              <br />
              <span className="text-4xl md:text-6xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Design System
              </span>
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              A comprehensive design system and component library for building
              enterprise-grade business intelligence dashboards with premium
              UI/UX, advanced animations, and developer-first experience.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="#documentation"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <BookOpen className="w-5 h-5" />
                  Explore Documentation
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="#components"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <Code2 className="w-5 h-5" />
                  View Components
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={cardVariants}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-blue-400 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-400">{stat.description}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-24 bg-gray-900/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for Modern Development
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Every component and pattern is designed with performance,
              accessibility, and developer experience in mind.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                whileHover="hover"
                className="relative group"
              >
                <div className="h-full p-6 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
                  <div
                    className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.color} mb-4`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-gray-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Documentation Section */}
      <motion.section
        id="documentation"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Comprehensive Documentation
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to build exceptional user interfaces with our
              design system.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {documentationCards.map((card, index) => (
              <motion.div
                key={card.title}
                variants={cardVariants}
                whileHover="hover"
                className="group relative"
              >
                <Link
                  href={card.href}
                  target={card.isExternal ? "_blank" : undefined}
                  rel={card.isExternal ? "noopener noreferrer" : undefined}
                  className="block h-full"
                >
                  <div className="h-full p-6 rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 group-hover:border-blue-500/50 transition-all duration-300">
                    {/* Badge */}
                    {card.badge && (
                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            card.badge === "Core"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : card.badge === "Essential"
                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                : card.badge === "Premium"
                                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                  : "bg-green-500/20 text-green-400 border border-green-500/30"
                          }`}
                        >
                          {card.badge}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                        <card.icon className="w-6 h-6 text-blue-400" />
                      </div>
                      {card.isExternal && (
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                      )}
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">
                      {card.title}
                    </h3>

                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      {card.description}
                    </p>

                    {/* Stats */}
                    {card.stats && (
                      <div className="flex gap-4 text-xs text-gray-400">
                        {card.stats.components && (
                          <span>{card.stats.components} components</span>
                        )}
                        {card.stats.patterns && (
                          <span>{card.stats.patterns} patterns</span>
                        )}
                        {card.stats.examples && (
                          <span>{card.stats.examples} examples</span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Quick Access Section */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-24 bg-gradient-to-br from-blue-900/10 to-purple-900/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Quick Access</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Jump directly to the resources you need most.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={cardVariants} whileHover="hover">
              <Link
                href="/docs/SKC-BI-DASHBOARD-DESIGN-SYSTEM.md"
                target="_blank"
                className="block p-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 text-center group"
              >
                <Palette className="w-8 h-8 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white mb-2">Design Tokens</h3>
                <p className="text-sm text-gray-300">
                  Colors, typography, spacing
                </p>
              </Link>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover">
              <Link
                href="/docs/DEVELOPER-GUIDELINES.md"
                target="_blank"
                className="block p-6 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 text-center group"
              >
                <Code2 className="w-8 h-8 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white mb-2">
                  Code Standards
                </h3>
                <p className="text-sm text-gray-300">
                  TypeScript, React patterns
                </p>
              </Link>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover">
              <Link
                href="/docs/ANIMATION-PATTERN-LIBRARY.md"
                target="_blank"
                className="block p-6 rounded-lg bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300 text-center group"
              >
                <Zap className="w-8 h-8 text-cyan-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white mb-2">Animations</h3>
                <p className="text-sm text-gray-300">Framer Motion variants</p>
              </Link>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover">
              <div className="p-6 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 text-center">
                <GitBranch className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">
                  Version Control
                </h3>
                <p className="text-sm text-gray-300">Git workflow, commits</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-24 bg-gradient-to-r from-blue-900/20 to-purple-900/20"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Build Something Amazing?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Start using our design system to create exceptional user
            experiences.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/docs/SKC-BI-DASHBOARD-DESIGN-SYSTEM.md"
                target="_blank"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5" />
                Get Started
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="https://github.com"
                target="_blank"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <GitBranch className="w-5 h-5" />
                View on GitHub
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
