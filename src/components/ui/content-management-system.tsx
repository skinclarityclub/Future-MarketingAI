"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLocale } from "@/lib/i18n/context";
import { Edit3, Save, X, Globe, DollarSign, Euro } from "lucide-react";
import {
  PremiumButton,
  GlassContainer,
  PremiumCard,
} from "./premium-design-system";
import NormalButton from "./normal-button";

// Content types
interface ContentItem {
  id: string;
  key: string;
  en: string;
  nl: string;
  type: "text" | "number" | "currency" | "percentage";
  category: string;
  metadata?: {
    description?: string;
    maxLength?: number;
    format?: string;
  };
}

interface ContentState {
  isEditing: boolean;
  currentLocale: "en" | "nl";
  isDirty: boolean;
  items: ContentItem[];
}

// Currency formatting utility
const formatCurrency = (value: number, locale: "en" | "nl") => {
  const currency = locale === "nl" ? "EUR" : "USD";
  return new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-US", {
    style: "currency",
    currency,
  }).format(value);
};

// Number formatting utility
const formatNumber = (value: number, locale: "en" | "nl") => {
  return new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-US").format(
    value
  );
};

// Percentage formatting utility
const formatPercentage = (value: number, locale: "en" | "nl") => {
  return new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

// Sample content data for customer journey
const INITIAL_CONTENT: ContentItem[] = [
  {
    id: "1",
    key: "heroTitle",
    en: "Turn Content Into Growth On Autopilot",
    nl: "Zet Content Om In Groei Op Autopilot",
    type: "text",
    category: "hero",
    metadata: { description: "Main hero title", maxLength: 100 },
  },
  {
    id: "2",
    key: "heroSubtitle",
    en: "AI-Powered Marketing Machine That Works 24/7",
    nl: "AI-Gedreven Marketing Machine Die 24/7 Werkt",
    type: "text",
    category: "hero",
    metadata: { description: "Hero subtitle", maxLength: 150 },
  },
  {
    id: "3",
    key: "marketingMachinePrice",
    en: "15000",
    nl: "15000",
    type: "currency",
    category: "pricing",
    metadata: {
      description: "Marketing Machine monthly price",
      format: "monthly",
    },
  },
  {
    id: "4",
    key: "biDashboardPrice",
    en: "15000",
    nl: "15000",
    type: "currency",
    category: "pricing",
    metadata: { description: "BI Dashboard monthly price", format: "monthly" },
  },
  {
    id: "5",
    key: "completeBundlePrice",
    en: "25000",
    nl: "25000",
    type: "currency",
    category: "pricing",
    metadata: {
      description: "Complete bundle monthly price",
      format: "monthly",
    },
  },
  {
    id: "6",
    key: "roiIncrease",
    en: "120",
    nl: "120",
    type: "percentage",
    category: "stats",
    metadata: { description: "ROI increase percentage" },
  },
  {
    id: "7",
    key: "efficiencyIncrease",
    en: "130",
    nl: "130",
    type: "percentage",
    category: "stats",
    metadata: { description: "Efficiency increase percentage" },
  },
  {
    id: "8",
    key: "growthIncrease",
    en: "180",
    nl: "180",
    type: "percentage",
    category: "stats",
    metadata: { description: "Growth increase percentage" },
  },
];

// Content Editor Component
interface ContentEditorProps {
  item: ContentItem;
  locale: "en" | "nl";
  onUpdate: (id: string, field: "en" | "nl", value: string) => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  item,
  locale,
  onUpdate,
}) => {
  const [value, setValue] = useState(item[locale]);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUpdate(item.id, locale, value);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(item[locale]);
    setIsEditing(false);
  };

  const renderValue = () => {
    const numValue = parseFloat(value);

    switch (item.type) {
      case "currency":
        return formatCurrency(numValue, locale);
      case "number":
        return formatNumber(numValue, locale);
      case "percentage":
        return formatPercentage(numValue, locale);
      default:
        return value;
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
        <div className="flex-1">
          <div className="text-sm text-gray-400">{item.key}</div>
          <div className="text-white font-medium">{renderValue()}</div>
          {item.metadata?.description && (
            <div className="text-xs text-gray-500">
              {item.metadata.description}
            </div>
          )}
        </div>
        <NormalButton
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
        >
          <Edit3 className="w-4 h-4" />
        </NormalButton>
      </div>
    );
  }

  return (
    <div className="p-3 bg-gray-700/50 rounded-lg border border-purple-500/30">
      <div className="text-sm text-gray-400 mb-2">{item.key}</div>
      <div className="flex gap-2">
        <input
          type={item.type === "text" ? "text" : "number"}
          value={value}
          onChange={e => setValue(e.target.value)}
          maxLength={item.metadata?.maxLength}
          className="flex-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
          placeholder={`Enter ${item.type} in ${locale.toUpperCase()}`}
        />
        <NormalButton size="sm" variant="primary" onClick={handleSave}>
          <Save className="w-4 h-4" />
        </NormalButton>
        <NormalButton size="sm" variant="ghost" onClick={handleCancel}>
          <X className="w-4 h-4" />
        </NormalButton>
      </div>
      {item.metadata?.description && (
        <div className="text-xs text-gray-500 mt-1">
          {item.metadata.description}
        </div>
      )}
    </div>
  );
};

// Main Content Management System
interface ContentManagementSystemProps {
  onContentUpdate?: (items: ContentItem[]) => void;
  className?: string;
}

export const ContentManagementSystem: React.FC<
  ContentManagementSystemProps
> = ({ onContentUpdate, className = "" }) => {
  const { locale } = useLocale();
  const [state, setState] = useState<ContentState>({
    isEditing: false,
    currentLocale: (locale as "en" | "nl") || "en",
    isDirty: false,
    items: INITIAL_CONTENT,
  });

  const handleContentUpdate = useCallback(
    (id: string, field: "en" | "nl", value: string) => {
      setState(prev => {
        const newItems = prev.items.map(item =>
          item.id === id ? { ...item, [field]: value } : item
        );
        return {
          ...prev,
          items: newItems,
          isDirty: true,
        };
      });
    },
    []
  );

  const handleSaveAll = useCallback(() => {
    setState(prev => ({ ...prev, isDirty: false }));
    onContentUpdate?.(state.items);
  }, [state.items, onContentUpdate]);

  const handleToggleLocale = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentLocale: prev.currentLocale === "en" ? "nl" : "en",
    }));
  }, []);

  const groupedItems = state.items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, ContentItem[]>
  );

  return (
    <GlassContainer className={`p-6 ${className}`} intensity="medium">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Content Management</h3>
        <div className="flex gap-3">
          <NormalButton variant="ghost" size="sm" onClick={handleToggleLocale}>
            <Globe className="w-4 h-4 mr-2" />
            {state.currentLocale.toUpperCase()}
            {state.currentLocale === "nl" ? (
              <Euro className="w-4 h-4 ml-2" />
            ) : (
              <DollarSign className="w-4 h-4 ml-2" />
            )}
          </NormalButton>
          {state.isDirty && (
            <NormalButton variant="primary" size="sm" onClick={handleSaveAll}>
              <Save className="w-4 h-4 mr-2" />
              Save All
            </NormalButton>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category}>
            <h4 className="text-lg font-medium text-white capitalize mb-3">
              {category}
            </h4>
            <div className="space-y-3">
              {items.map(item => (
                <ContentEditor
                  key={item.id}
                  item={item}
                  locale={state.currentLocale}
                  onUpdate={handleContentUpdate}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {state.isDirty && (
        <div className="mt-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="text-amber-400 text-sm">
            You have unsaved changes. Don't forget to save!
          </div>
        </div>
      )}
    </GlassContainer>
  );
};

// Content Provider Hook
export const useContentManagement = () => {
  const [content, setContent] = useState<Record<string, string>>({});
  const { locale } = useLocale();

  const updateContent = useCallback(
    (items: ContentItem[]) => {
      const contentMap = items.reduce(
        (acc, item) => {
          acc[item.key] = item[locale as "en" | "nl"] || item.en;
          return acc;
        },
        {} as Record<string, string>
      );
      setContent(contentMap);
    },
    [locale]
  );

  const getContent = useCallback(
    (key: string, fallback: string = "") => {
      return content[key] || fallback;
    },
    [content]
  );

  const getFormattedContent = useCallback(
    (
      key: string,
      type: "currency" | "number" | "percentage",
      fallback: number = 0
    ) => {
      const value = parseFloat(content[key]) || fallback;
      const currentLocale = locale as "en" | "nl";

      switch (type) {
        case "currency":
          return formatCurrency(value, currentLocale);
        case "number":
          return formatNumber(value, currentLocale);
        case "percentage":
          return formatPercentage(value, currentLocale);
        default:
          return value.toString();
      }
    },
    [content, locale]
  );

  return {
    content,
    updateContent,
    getContent,
    getFormattedContent,
  };
};

// Export utilities
export {
  formatCurrency,
  formatNumber,
  formatPercentage,
  type ContentItem,
  type ContentState,
};
