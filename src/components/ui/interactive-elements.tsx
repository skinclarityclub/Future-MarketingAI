"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import {
  ChevronDown,
  ChevronRight,
  Sparkles,
  Lock,
  ArrowRight,
  Zap,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

// Types
interface RippleEffect {
  x: number;
  y: number;
  size: number;
  id: number;
}

interface TooltipProps {
  children: ReactNode;
  text: string;
  className?: string;
}

interface ProgressiveTooltipProps {
  children: ReactNode;
  content: ReactNode;
  trigger?: "hover" | "click" | "focus";
  position?: "top" | "bottom" | "left" | "right";
  showDelay?: number;
  hideDelay?: number;
  interactive?: boolean;
  maxWidth?: string;
  className?: string;
}

interface UpgradeHintProps {
  children: ReactNode;
  featureName: string;
  requiredTier: string;
  currentTier: string;
  benefits: string[];
  onUpgrade?: () => void;
  showCondition?: () => boolean;
  timing?: "immediate" | "delayed" | "contextual";
  placement?: "tooltip" | "overlay" | "sidebar";
  className?: string;
}

interface FeaturePreviewProps {
  children: ReactNode;
  previewContent: ReactNode;
  previewTitle?: string;
  previewDescription?: string;
  locked?: boolean;
  onUnlock?: () => void;
  className?: string;
}

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
}

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  className?: string;
}

interface TabsProps {
  tabs: Array<{ id: string; label: string; content: ReactNode }>;
  defaultTab?: string;
  className?: string;
}

interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

interface ProgressStepsProps {
  steps: Array<{ id: string; label: string; completed?: boolean }>;
  currentStep?: string;
  onStepClick?: (stepId: string) => void;
  className?: string;
}

// Ripple Hook
const useRipple = () => {
  const [ripples, setRipples] = useState<RippleEffect[]>([]);

  const addRipple = (event: React.MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple: RippleEffect = {
      x,
      y,
      size,
      id: Date.now(),
    };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  return { ripples, addRipple };
};

// Progressive Disclosure Hook
const useProgressiveDisclosure = (
  element: HTMLElement | null,
  condition?: () => boolean,
  timing: "immediate" | "delayed" | "contextual" = "delayed"
) => {
  const [shouldShow, setShouldShow] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const interactionCountRef = useRef(0);

  useEffect(() => {
    if (!element) return;

    const handleInteraction = () => {
      interactionCountRef.current++;
      setHasInteracted(true);

      if (timing === "immediate") {
        setShouldShow(condition ? condition() : true);
      } else if (timing === "delayed") {
        timeoutRef.current = setTimeout(() => {
          setShouldShow(condition ? condition() : true);
        }, 1500);
      } else if (timing === "contextual" && interactionCountRef.current > 2) {
        setShouldShow(condition ? condition() : true);
      }
    };

    const handleLeave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setShouldShow(false);
    };

    element.addEventListener("mouseenter", handleInteraction);
    element.addEventListener("focus", handleInteraction);
    element.addEventListener("mouseleave", handleLeave);
    element.addEventListener("blur", handleLeave);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      element.removeEventListener("mouseenter", handleInteraction);
      element.removeEventListener("focus", handleInteraction);
      element.removeEventListener("mouseleave", handleLeave);
      element.removeEventListener("blur", handleLeave);
    };
  }, [element, condition, timing]);

  return {
    shouldShow,
    hasInteracted,
    interactionCount: interactionCountRef.current,
  };
};

// Premium Button with Ripple Effect
export const PremiumButton = ({
  children,
  onClick,
  variant = "primary",
  size = "medium",
  disabled = false,
  className = "",
  ...props
}: {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { ripples, addRipple } = useRipple();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      addRipple(e);
      onClick?.(e);
    }
  };

  const sizeClasses = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg",
  };

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500",
    secondary: "bg-white/10 text-white border-white/20 hover:bg-white/20",
    ghost: "bg-transparent text-white border-transparent hover:bg-white/10",
  };

  return (
    <button
      className={`
        btn-interactive-premium ripple-container focus-ring-premium
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-xl font-medium
        disabled:opacity-50 disabled:cursor-not-allowed
        interactive-element
        ${className}
      `}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="ripple-effect"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
    </button>
  );
};

// Enhanced Progressive Tooltip
export const ProgressiveTooltip = ({
  children,
  content,
  trigger = "hover",
  position = "top",
  showDelay = 500,
  hideDelay = 200,
  interactive = false,
  maxWidth = "300px",
  className = "",
}: ProgressiveTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, showDelay);
  };

  const hideTooltip = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      if (!isHovering) {
        setIsVisible(false);
      }
    }, hideDelay);
  };

  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 transform -translate-x-1/2 border-t-gray-900 border-t-8 border-x-transparent border-x-8 border-b-0",
    bottom:
      "bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-900 border-b-8 border-x-transparent border-x-8 border-t-0",
    left: "left-full top-1/2 transform -translate-y-1/2 border-l-gray-900 border-l-8 border-y-transparent border-y-8 border-r-0",
    right:
      "right-full top-1/2 transform -translate-y-1/2 border-r-gray-900 border-r-8 border-y-transparent border-y-8 border-l-0",
  };

  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={trigger === "hover" ? showTooltip : undefined}
      onMouseLeave={trigger === "hover" ? hideTooltip : undefined}
      onClick={trigger === "click" ? () => setIsVisible(!isVisible) : undefined}
      onFocus={trigger === "focus" ? showTooltip : undefined}
      onBlur={trigger === "focus" ? hideTooltip : undefined}
    >
      {children}

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`
            absolute z-50 ${positionClasses[position]}
            bg-gray-900 text-white text-sm rounded-lg shadow-xl
            p-3 animate-in fade-in-0 zoom-in-95 duration-200
            ${interactive ? "pointer-events-auto" : "pointer-events-none"}
          `}
          style={{ maxWidth }}
          onMouseEnter={() => interactive && setIsHovering(true)}
          onMouseLeave={() => interactive && setIsHovering(false)}
        >
          {content}
          <div className={`absolute w-0 h-0 ${arrowClasses[position]}`} />
        </div>
      )}
    </div>
  );
};

// Smart Upgrade Hint Component
export const SmartUpgradeHint = ({
  children,
  featureName,
  requiredTier,
  currentTier: _currentTier,
  benefits,
  onUpgrade,
  showCondition,
  timing = "contextual",
  placement = "tooltip",
  className = "",
}: UpgradeHintProps) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const { shouldShow } = useProgressiveDisclosure(
    triggerRef.current,
    showCondition,
    timing
  );

  const upgradeContent = (
    <div className="w-64 space-y-3">
      <div className="flex items-center gap-2">
        <Crown className="h-4 w-4 text-yellow-400" />
        <span className="font-semibold text-white">
          Upgrade naar {requiredTier}
        </span>
      </div>

      <p className="text-gray-300 text-sm">
        {featureName} is beschikbaar in {requiredTier}
      </p>

      <div className="space-y-1">
        {benefits.slice(0, 3).map((benefit, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-xs text-gray-300"
          >
            <Sparkles className="h-3 w-3 text-blue-400" />
            <span>{benefit}</span>
          </div>
        ))}
      </div>

      {onUpgrade && (
        <button
          onClick={onUpgrade}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          <ArrowRight className="h-3 w-3" />
          Upgrade Nu
        </button>
      )}
    </div>
  );

  if (placement === "tooltip") {
    return (
      <div ref={triggerRef} className={className}>
        {shouldShow ? (
          <ProgressiveTooltip
            content={upgradeContent}
            position="top"
            interactive={true}
            maxWidth="280px"
          >
            {children}
          </ProgressiveTooltip>
        ) : (
          children
        )}
      </div>
    );
  }

  // Other placement options can be implemented here
  return (
    <div ref={triggerRef} className={className}>
      {children}
    </div>
  );
};

// Feature Preview Component
export const FeaturePreview = ({
  children,
  previewContent,
  previewTitle = "Feature Preview",
  previewDescription,
  locked = false,
  onUnlock,
  className = "",
}: FeaturePreviewProps) => {
  const [showPreview, setShowPreview] = useState(false);

  const previewOverlay = (
    <div className="w-80 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-white">{previewTitle}</h4>
        {locked && <Lock className="h-4 w-4 text-yellow-400" />}
      </div>

      {previewDescription && (
        <p className="text-gray-300 text-sm">{previewDescription}</p>
      )}

      <div className="border border-gray-700 rounded-lg p-3 bg-gray-800/50">
        {previewContent}
      </div>

      {locked && onUnlock && (
        <button
          onClick={onUnlock}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Zap className="h-3 w-3" />
          Ontgrendel Deze Feature
        </button>
      )}
    </div>
  );

  return (
    <div className={className}>
      <ProgressiveTooltip
        content={previewOverlay}
        trigger="hover"
        position="right"
        interactive={true}
        maxWidth="340px"
        showDelay={800}
      >
        <div
          className={`
            relative cursor-pointer transition-all duration-200
            ${locked ? "opacity-75 hover:opacity-100" : ""}
            ${showPreview ? "ring-2 ring-blue-400 ring-opacity-50" : ""}
          `}
          onMouseEnter={() => setShowPreview(true)}
          onMouseLeave={() => setShowPreview(false)}
        >
          {children}
          {locked && (
            <div className="absolute top-2 right-2">
              <Lock className="h-4 w-4 text-yellow-400" />
            </div>
          )}
        </div>
      </ProgressiveTooltip>
    </div>
  );
};

// Premium Tooltip (Enhanced version of existing)
export const PremiumTooltip = ({
  children,
  text,
  className = "",
}: TooltipProps) => {
  return (
    <ProgressiveTooltip
      content={<span>{text}</span>}
      className={`tooltip-premium ${className}`}
    >
      {children}
    </ProgressiveTooltip>
  );
};

// Premium Dropdown
export const PremiumDropdown = ({
  trigger,
  children,
  className = "",
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div
      ref={dropdownRef}
      className={cn("dropdown-premium relative", isOpen && "open", className)}
    >
      <div
        className="dropdown-trigger cursor-pointer"
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle(e as any);
          }
        }}
        aria-expanded={isOpen ? "true" : "false"}
        aria-haspopup="true"
      >
        {trigger}
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-200 ml-auto",
            isOpen && "rotate-180"
          )}
        />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="dropdown-content absolute top-full left-0 mt-2 z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <div className="menu-interactive-premium">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Premium Toggle Switch
export const PremiumToggle = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = "",
}: ToggleProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-neutral-200">{label}</label>
      )}
      <label
        className={`toggle-premium ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          disabled={disabled}
          className="focus-ring-premium"
          aria-label={label || "Toggle switch"}
        />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );
};

// Premium Slider
export const PremiumSlider = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  className = "",
}: SliderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const percentage = ((value - min) / (max - min)) * 100;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateValue(e);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateValue(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateValue = (e: MouseEvent | React.MouseEvent) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const newValue = Math.round((percentage / 100) * (max - min) + min);
    const steppedValue = Math.round(newValue / step) * step;

    onChange(Math.max(min, Math.min(max, steppedValue)));
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-neutral-200">
            {label}
          </label>
          <span className="text-sm text-neutral-400">{value}</span>
        </div>
      )}
      <div
        ref={sliderRef}
        className="slider-premium interactive-element"
        onMouseDown={handleMouseDown}
        style={
          { "--slider-percentage": `${percentage}%` } as React.CSSProperties
        }
      >
        <div className="slider-thumb" style={{ left: `${percentage}%` }} />
      </div>
    </div>
  );
};

// Premium Tabs
export const PremiumTabs = ({
  tabs,
  defaultTab,
  className = "",
}: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="tabs-premium">
        {tabs.map(tab => (
          <NormalButton
            key={tab.id}
            className={`tab-premium ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </NormalButton>
        ))}
      </div>
      <div className="tab-content">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

// Premium Accordion
export const PremiumAccordion = ({
  items,
  allowMultiple = false,
  className = "",
}: AccordionProps) => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (itemId: string) => {
    if (allowMultiple) {
      setOpenItems(prev =>
        prev.includes(itemId)
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      setOpenItems(prev => (prev.includes(itemId) ? [] : [itemId]));
    }
  };

  return (
    <div className={`accordion-premium space-y-1 ${className}`}>
      {items.map(item => {
        const isOpen = openItems.includes(item.id);
        return (
          <div
            key={item.id}
            className="border-b border-white/5 last:border-b-0"
          >
            <NormalButton
              className={`accordion-header w-full ${isOpen ? "active" : ""}`}
              onClick={() => toggleItem(item.id)}
            >
              <span className="font-medium text-left">{item.title}</span>
              <ChevronRight
                className={`accordion-icon w-5 h-5 ${isOpen ? "rotate-90" : ""}`}
              />
            </NormalButton>
            <div className={`accordion-content ${isOpen ? "open" : ""}`}>
              <div className="accordion-body">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Premium Progress Steps
export const PremiumProgressSteps = ({
  steps,
  currentStep,
  onStepClick,
  className = "",
}: ProgressStepsProps) => {
  return (
    <div className={`progress-steps ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = step.completed;
        const isCurrent = currentStep === step.id;
        const isClickable = onStepClick && (isCompleted || isCurrent);

        return (
          <div
            key={step.id}
            className={`
              progress-step
              ${isCompleted ? "completed" : ""}
              ${isCurrent ? "active" : ""}
              ${isClickable ? "cursor-pointer" : "cursor-default"}
            `}
            onClick={() => isClickable && onStepClick(step.id)}
            title={step.label}
          >
            {isCompleted ? "✓" : index + 1}
          </div>
        );
      })}
    </div>
  );
};

// Menu Item Component
export const PremiumMenuItem = ({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) => {
  return (
    <div className={`menu-item-interactive ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

// Interactive Card Component
export const PremiumInteractiveCard = ({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) => {
  return (
    <div className={`card-interactive-premium ${className}`} onClick={onClick}>
      <div className="card-interactive-content">{children}</div>
    </div>
  );
};
