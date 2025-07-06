# SKC BI Dashboard - Animation Pattern Library

## Overview

This document serves as a comprehensive reference for all animation patterns, variants, and implementations used in the SKC BI Dashboard. It provides detailed examples, performance guidelines, and best practices for creating smooth, meaningful animations that enhance the user experience.

---

## 🎯 Animation Philosophy

### Core Principles

1. **Performance First**: All animations target 60fps with GPU acceleration
2. **Meaningful Motion**: Every animation serves a purpose - guiding attention, providing feedback, or enhancing usability
3. **Accessibility Respect**: All animations honor `prefers-reduced-motion` settings
4. **Progressive Enhancement**: Animations enhance but never block core functionality
5. **Consistent Timing**: Standardized duration and easing curves across the application

### Animation Categories

- **Micro-interactions**: Button hovers, form feedback, loading states
- **Page Transitions**: Route changes, modal appearances
- **Data Visualization**: Chart animations, metric counters
- **Spatial Animations**: Layout shifts, element positioning
- **Ambient Effects**: Background particles, subtle movements

---

## ⏱️ Timing & Easing System

### Duration Scale

```css
:root {
  /* Micro-interactions */
  --duration-instant: 0.1s; /* Immediate feedback */
  --duration-fast: 0.15s; /* Quick hover states */
  --duration-quick: 0.2s; /* Button presses */

  /* Standard interactions */
  --duration-normal: 0.3s; /* Default transitions */
  --duration-comfortable: 0.4s; /* Modal appearances */
  --duration-relaxed: 0.5s; /* Page transitions */

  /* Complex animations */
  --duration-slow: 0.8s; /* Data visualizations */
  --duration-deliberate: 1.2s; /* Hero animations */
  --duration-cinematic: 2s; /* Ambient effects */
}
```

### Easing Functions

```css
:root {
  /* Standard easing */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

  /* Premium easing curves */
  --ease-premium: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-luxury: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-enterprise: cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Specialized curves */
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-elastic: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  --ease-neural: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-quantum: cubic-bezier(0.19, 1, 0.22, 1);

  /* Data visualization */
  --ease-data-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-data-dramatic: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

---

## 🎨 Framer Motion Variants

### Core Animation Variants

#### Fade Animations

```typescript
// Basic fade variants
export const fadeVariants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  },

  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    }
  },

  fadeInDown: {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    }
  },

  fadeInScale: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  }
};

// Usage Example
<motion.div
  variants={fadeVariants.fadeInUp}
  initial="hidden"
  animate="visible"
>
  Content
</motion.div>
```

#### Slide Animations

```typescript
export const slideVariants = {
  slideInLeft: {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  },

  slideInRight: {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  },

  slideInFromBottom: {
    hidden: { opacity: 0, y: 100 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  },
};
```

#### Scale & Zoom Animations

```typescript
export const scaleVariants = {
  scaleIn: {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        scale: { type: "spring", stiffness: 200, damping: 20 },
      },
    },
  },

  zoomIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },

  pulseScale: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
};
```

### Premium Animation Variants

#### Neural Network Animations

```typescript
export const neuralVariants = {
  neuralFadeIn: {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
      filter: "blur(10px)",
      rotateX: 15,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },

  neuralGlow: {
    animate: {
      boxShadow: [
        "0 0 20px rgba(59, 130, 246, 0.3)",
        "0 0 40px rgba(59, 130, 246, 0.6)",
        "0 0 20px rgba(59, 130, 246, 0.3)",
      ],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },

  neuralPulse: {
    animate: {
      scale: [1, 1.02, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
};
```

#### Quantum Effects

```typescript
export const quantumVariants = {
  quantumSlide: {
    hidden: {
      opacity: 0,
      x: -50,
      rotateY: -15,
      scale: 0.9,
      filter: "blur(5px)",
    },
    visible: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.7,
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  },

  quantumShimmer: {
    animate: {
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "linear",
      },
    },
  },

  quantumFloat: {
    animate: {
      y: [-5, 5, -5],
      rotateZ: [-1, 1, -1],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
};
```

#### Holographic Effects

```typescript
export const holographicVariants = {
  holographicReveal: {
    hidden: {
      opacity: 0,
      rotateX: 45,
      rotateY: 45,
      scale: 0.8,
      z: -100,
      filter: "blur(8px)",
    },
    visible: {
      opacity: 1,
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      z: 0,
      filter: "blur(0px)",
      transition: {
        duration: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  },

  holographicScan: {
    animate: {
      background: [
        "linear-gradient(90deg, transparent 0%, rgba(34, 211, 238, 0.1) 50%, transparent 100%)",
        "linear-gradient(90deg, transparent 100%, rgba(34, 211, 238, 0.1) 150%, transparent 200%)",
      ],
      backgroundPosition: ["0% 0%", "100% 0%"],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear",
      },
    },
  },
};
```

---

## 🎭 Stagger & Orchestration Patterns

### List Animations

```typescript
export const listVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
        when: "beforeChildren",
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  },
};

// Usage
<motion.ul variants={listVariants.container} initial="hidden" animate="visible">
  {items.map((item, index) => (
    <motion.li key={item.id} variants={listVariants.item}>
      {item.content}
    </motion.li>
  ))}
</motion.ul>
```

### Grid Animations

```typescript
export const gridVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  },
};
```

### Card Deck Animations

```typescript
export const cardDeckVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  },
  card: {
    hidden: {
      opacity: 0,
      y: 50,
      rotateX: 45,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  },
};
```

---

## 🎪 Micro-interaction Patterns

### Button Animations

```css
/* Hover Effects */
.btn-hover-lift {
  transition: transform var(--duration-fast) var(--ease-premium);
}

.btn-hover-lift:hover {
  transform: translateY(-2px) scale(1.02);
}

.btn-hover-glow {
  transition: all var(--duration-normal) var(--ease-premium);
}

.btn-hover-glow:hover {
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.4);
}

/* Press Effects */
.btn-press-scale {
  transition: transform var(--duration-instant) var(--ease-premium);
}

.btn-press-scale:active {
  transform: scale(0.98);
}

/* Loading States */
@keyframes btn-loading-pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.btn-loading {
  animation: btn-loading-pulse 1.5s ease-in-out infinite;
}
```

### Form Field Animations

```css
/* Focus States */
.input-focus {
  transition: all var(--duration-normal) var(--ease-premium);
}

.input-focus:focus {
  transform: scale(1.02);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

/* Validation States */
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.input-error {
  animation: shake 0.4s ease-in-out;
}

.input-success {
  animation: success-pulse 0.6s ease-out;
}

@keyframes success-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
  }
  100% {
    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
  }
}
```

### Loading Animations

```css
/* Spinner Variants */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  animation: spin 1s linear infinite;
}

/* Pulse Loading */
@keyframes pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}

.pulse-loader {
  animation: pulse 2s ease-in-out infinite;
}

/* Skeleton Loading */
@keyframes skeleton-loading {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.1) 100%
  );
  background-size: 200px 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

/* Dots Loading */
@keyframes dot-bounce {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.dots-loader span {
  animation: dot-bounce 1.4s ease-in-out infinite both;
}

.dots-loader span:nth-child(1) {
  animation-delay: -0.32s;
}
.dots-loader span:nth-child(2) {
  animation-delay: -0.16s;
}
.dots-loader span:nth-child(3) {
  animation-delay: 0s;
}
```

---

## 📊 Data Visualization Animations

### Chart Entry Animations

```typescript
// Bar Chart Animation
export const barChartVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },
  bar: {
    hidden: { scaleY: 0, opacity: 0 },
    visible: {
      scaleY: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  },
};

// Line Chart Animation
export const lineChartVariants = {
  path: {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 2, ease: "easeInOut" },
        opacity: { duration: 0.3 },
      },
    },
  },
  point: {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: 1.5,
        duration: 0.3,
        ease: "easeOut",
      },
    },
  },
};
```

### Counter Animations

```typescript
// Animated Number Counter
export const useCounterAnimation = (
  end: number,
  duration: number = 2000
) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
};

// Usage
const AnimatedCounter: React.FC<{ value: number }> = ({ value }) => {
  const count = useCounterAnimation(value, 2000);

  return (
    <motion.span
      key={value}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {count.toLocaleString()}
    </motion.span>
  );
};
```

### Progress Animations

```css
/* Progress Bar */
@keyframes progress-fill {
  from {
    width: 0%;
  }
  to {
    width: var(--progress-value);
  }
}

.progress-bar {
  animation: progress-fill 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

/* Circular Progress */
@keyframes circle-progress {
  from {
    stroke-dashoffset: 283;
  }
  to {
    stroke-dashoffset: calc(283 - (283 * var(--progress-value) / 100));
  }
}

.circle-progress {
  stroke-dasharray: 283;
  animation: circle-progress 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}
```

---

## 🌊 Page Transition Patterns

### Route Transitions

```typescript
// Page transition variants
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  },
};

// Layout component
const PageTransition: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
    >
      {children}
    </motion.div>
  );
};
```

### Modal Animations

```typescript
export const modalVariants = {
  backdrop: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  },
  modal: {
    hidden: {
      opacity: 0,
      scale: 0.9,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 10,
      transition: {
        duration: 0.2,
      },
    },
  },
};
```

---

## 🎨 Ambient & Background Animations

### Particle Systems

```typescript
// Floating particles
export const particleVariants = {
  float: {
    y: [0, -20, 0],
    x: [0, 10, 0],
    opacity: [0.3, 0.8, 0.3],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Neural network connections
export const connectionVariants = {
  pulse: {
    pathLength: [0, 1, 0],
    opacity: [0, 0.6, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
      times: [0, 0.5, 1],
    },
  },
};
```

### Background Gradients

```css
/* Animated gradient backgrounds */
@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animated-gradient {
  background: linear-gradient(
    -45deg,
    rgba(59, 130, 246, 0.1),
    rgba(139, 92, 246, 0.1),
    rgba(34, 211, 238, 0.1),
    rgba(59, 130, 246, 0.1)
  );
  background-size: 400% 400%;
  animation: gradient-shift 15s ease infinite;
}

/* Mesh gradient animation */
@keyframes mesh-float {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) rotate(120deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(240deg);
  }
}

.mesh-gradient {
  animation: mesh-float 20s ease-in-out infinite;
}
```

---

## ♿ Accessibility & Performance

### Reduced Motion Support

```css
/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Maintain essential feedback */
  .essential-feedback {
    animation-duration: 0.2s !important;
    transition-duration: 0.2s !important;
  }
}
```

### Performance Optimization

```typescript
// Use React.memo for animated components
const AnimatedComponent = React.memo<Props>(({ children, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      {...props}
    >
      {children}
    </motion.div>
  );
});

// GPU acceleration utilities
const gpuAccelerated = {
  transform: "translateZ(0)",
  willChange: "transform",
  backfaceVisibility: "hidden" as const,
};

// Conditional animations
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
};
```

---

## 🛠️ Implementation Utilities

### Animation Hook

```typescript
// Custom animation hook
export const useAnimation = (variants: any, dependencies: any[] = []) => {
  const controls = useAnimationControls();
  const prefersReducedMotion = useReducedMotion();

  const animate = useCallback(
    (variant: string) => {
      if (prefersReducedMotion) {
        return controls.set(variants[variant].visible || variants[variant]);
      }
      return controls.start(variant);
    },
    [controls, variants, prefersReducedMotion, ...dependencies]
  );

  return { controls, animate };
};
```

### Intersection Observer Animation

```typescript
// Animate on scroll
export const useScrollAnimation = (
  variants: any,
  options: IntersectionObserverInit = {}
) => {
  const ref = useRef<HTMLElement>(null);
  const controls = useAnimationControls();
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          controls.start("visible");
          setHasAnimated(true);
        }
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [controls, hasAnimated, options]);

  return { ref, controls, variants };
};
```

### Animation Debugging

```typescript
// Development animation debugger
export const AnimationDebugger: React.FC<{
  children: React.ReactNode;
  name: string;
}> = ({ children, name }) => {
  if (process.env.NODE_ENV !== 'development') {
    return <>{children}</>;
  }

  return (
    <motion.div
      onAnimationStart={() => console.log(`${name}: Animation started`)}
      onAnimationComplete={() => console.log(`${name}: Animation completed`)}
      style={{ position: 'relative' }}
    >
      {children}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          fontSize: '10px',
          color: '#ff0000',
          background: 'rgba(0,0,0,0.8)',
          padding: '2px 4px',
          pointerEvents: 'none',
        }}
      >
        {name}
      </div>
    </motion.div>
  );
};
```

---

## 📋 Animation Checklist

### Before Implementation

- [ ] Define animation purpose and user benefit
- [ ] Choose appropriate duration and easing
- [ ] Consider reduced motion preferences
- [ ] Plan for performance optimization
- [ ] Test on various devices and screen sizes

### During Development

- [ ] Use GPU-accelerated properties (transform, opacity)
- [ ] Implement proper loading states
- [ ] Add appropriate delays and stagger effects
- [ ] Test animation smoothness at 60fps
- [ ] Validate accessibility compliance

### After Implementation

- [ ] Test with reduced motion settings
- [ ] Verify performance on low-end devices
- [ ] Check animation consistency across browsers
- [ ] Validate user experience improvements
- [ ] Document animation patterns for reuse

---

## 🎬 Animation Showcase Examples

### Hero Section Animation

```typescript
const HeroAnimation: React.FC = () => {
  return (
    <motion.section
      variants={neuralVariants.neuralFadeIn}
      initial="hidden"
      animate="visible"
      className="hero-section"
    >
      <motion.h1
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0 }
        }}
        className="hero-title"
      >
        Welcome to the Future
      </motion.h1>

      <motion.p
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0 }
        }}
        className="hero-subtitle"
      >
        Experience next-generation analytics
      </motion.p>

      <motion.div
        variants={{
          hidden: { opacity: 0, scale: 0.8 },
          visible: { opacity: 1, scale: 1 }
        }}
        className="hero-cta"
      >
        <PremiumButton variant="neural" size="lg">
          Get Started
        </PremiumButton>
      </motion.div>
    </motion.section>
  );
};
```

### Dashboard Card Grid

```typescript
const DashboardGrid: React.FC = () => {
  return (
    <motion.div
      variants={gridVariants.container}
      initial="hidden"
      animate="visible"
      className="dashboard-grid"
    >
      {cards.map((card) => (
        <motion.div
          key={card.id}
          variants={gridVariants.item}
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          className="dashboard-card"
        >
          <NeuralGlassCard variant="neural" hoverable>
            {card.content}
          </NeuralGlassCard>
        </motion.div>
      ))}
    </motion.div>
  );
};
```

---

_This animation pattern library is continuously updated as new patterns are developed and refined. All animations should follow these established patterns for consistency and optimal user experience._

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Next Review**: April 2025
