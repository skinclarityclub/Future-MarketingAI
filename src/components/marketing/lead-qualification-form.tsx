"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Mail,
  Phone,
  DollarSign,
  Target,
  Users,
  Calendar,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { translations } from "@/lib/i18n/translations";

interface LeadQualificationData {
  // Basic Info
  companyName: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  jobTitle: string;

  // Business Intel
  companySize: string;
  industry: string;
  monthlyMarketingBudget: string;
  currentMarketingApproach: string;

  // Goals & Challenges
  primaryGoals: string[];
  biggestChallenges: string[];
  desiredTimeline: string;

  // Platform & Tech
  currentPlatforms: string[];
  expectedROI: string;

  // Context
  hearAboutUs: string;
  additionalInfo: string;
}

interface LeadQualificationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeadQualificationData) => void;
  product?: string;
}

// Hook to get current locale
const useCurrentLocale = () => {
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname;
    const locale = pathname.startsWith("/nl") ? "nl" : "en";
    return locale as "nl" | "en";
  }
  return "en" as "nl" | "en";
};

export default function LeadQualificationForm({
  isOpen,
  onClose,
  onSubmit,
  product = "MarketingMachine",
}: LeadQualificationFormProps) {
  const [step, setStep] = useState(1);
  const locale = useCurrentLocale();
  const t = translations.waitlist[locale];

  const [formData, setFormData] = useState<LeadQualificationData>({
    companyName: "",
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    jobTitle: "",
    companySize: "",
    industry: "",
    monthlyMarketingBudget: "",
    currentMarketingApproach: "",
    primaryGoals: [],
    biggestChallenges: [],
    desiredTimeline: "",
    currentPlatforms: [],
    expectedROI: "",
    hearAboutUs: "",
    additionalInfo: "",
  });

  const handleFieldChange = (
    field: keyof LeadQualificationData,
    value: string | string[]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (
    field: keyof LeadQualificationData,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(value)
        ? (prev[field] as string[]).filter(item => item !== value)
        : [...(prev[field] as string[]), value],
    }));
  };

  const handleSubmit = async () => {
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const getProductDisplayName = (productKey: string) => {
    return t.products[productKey as keyof typeof t.products] || productKey;
  };

  // Get localized arrays
  const goalOptions = Object.keys(t.goals);
  const challengeOptions = Object.keys(t.challenges);
  const platformOptions = Object.keys(t.platforms);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl h-[90vh] max-h-[800px] bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border border-slate-700/50 backdrop-blur-xl shadow-2xl mx-4">
        {/* Header */}
        <div className="relative overflow-hidden rounded-t-lg p-4 md:p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-slate-700/30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl" />
          <div className="relative">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <div className="p-1.5 md:p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <DialogTitle className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {t.joinWaitlist.replace(
                  "{product}",
                  getProductDisplayName(product)
                )}
              </DialogTitle>
            </div>
            <DialogDescription className="text-slate-300 text-sm md:text-lg">
              {t.helpTailor}
            </DialogDescription>

            {/* Progress Bar */}
            <div className="mt-3 md:mt-4 flex items-center gap-1 md:gap-2">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                    i <= step
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 flex-1"
                      : "bg-slate-700 w-6 md:w-8"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
          {step === 1 && (
            <div className="space-y-4 md:space-y-6">
              <div className="text-center mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
                  {t.stepTitles.step1}
                </h3>
                <p className="text-slate-400 text-sm md:text-base">
                  {t.stepDescriptions.step1}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2 mb-2 text-sm md:text-base">
                    <Users className="h-4 w-4" />
                    {t.fields.firstName}
                  </Label>
                  <Input
                    value={formData.firstName}
                    onChange={e =>
                      handleFieldChange("firstName", e.target.value)
                    }
                    className="w-full bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 transition-colors h-10 md:h-12 text-sm md:text-base"
                    placeholder={t.placeholders.firstName}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2 mb-2 text-sm md:text-base">
                    <Users className="h-4 w-4 opacity-0" />
                    {t.fields.lastName}
                  </Label>
                  <Input
                    value={formData.lastName}
                    onChange={e =>
                      handleFieldChange("lastName", e.target.value)
                    }
                    className="w-full bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 transition-colors h-10 md:h-12 text-sm md:text-base"
                    placeholder={t.placeholders.lastName}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2 mb-2 text-sm md:text-base">
                  <Building2 className="h-4 w-4" />
                  {t.fields.companyName}
                </Label>
                <Input
                  value={formData.companyName}
                  onChange={e =>
                    handleFieldChange("companyName", e.target.value)
                  }
                  className="w-full bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 transition-colors h-10 md:h-12 text-sm md:text-base"
                  placeholder={t.placeholders.companyName}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2 mb-2 text-sm md:text-base">
                  <Users className="h-4 w-4" />
                  {t.fields.jobTitle}
                </Label>
                <Input
                  value={formData.jobTitle}
                  onChange={e => handleFieldChange("jobTitle", e.target.value)}
                  className="w-full bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 transition-colors h-10 md:h-12 text-sm md:text-base"
                  placeholder={t.placeholders.jobTitle}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2 mb-2 text-sm md:text-base">
                    <Mail className="h-4 w-4" />
                    {t.fields.email}
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={e => handleFieldChange("email", e.target.value)}
                    className="w-full bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 transition-colors h-10 md:h-12 text-sm md:text-base"
                    placeholder={t.placeholders.email}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2 mb-2 text-sm md:text-base">
                    <Phone className="h-4 w-4" />
                    {t.fields.phone}
                  </Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={e => handleFieldChange("phone", e.target.value)}
                    className="w-full bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 transition-colors h-10 md:h-12 text-sm md:text-base"
                    placeholder={t.placeholders.phone}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 md:space-y-6">
              <div className="text-center mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
                  {t.stepTitles.step2}
                </h3>
                <p className="text-slate-400 text-sm md:text-base">
                  {t.stepDescriptions.step2}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2 mb-2 text-sm md:text-base">
                    <Users className="h-4 w-4" />
                    {t.fields.companySize}
                  </Label>
                  <Select
                    value={formData.companySize}
                    onValueChange={value =>
                      handleFieldChange("companySize", value)
                    }
                  >
                    <SelectTrigger className="w-full bg-slate-800/50 border-slate-600 text-white h-10 md:h-12 text-sm md:text-base">
                      <SelectValue
                        placeholder={t.options.companySize.placeholder}
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="1-10">
                        {t.options.companySize["1-10"]}
                      </SelectItem>
                      <SelectItem value="11-50">
                        {t.options.companySize["11-50"]}
                      </SelectItem>
                      <SelectItem value="51-200">
                        {t.options.companySize["51-200"]}
                      </SelectItem>
                      <SelectItem value="201-1000">
                        {t.options.companySize["201-1000"]}
                      </SelectItem>
                      <SelectItem value="1000+">
                        {t.options.companySize["1000+"]}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2 mb-2 text-sm md:text-base">
                    <Building2 className="h-4 w-4" />
                    {t.fields.industry}
                  </Label>
                  <Select
                    value={formData.industry}
                    onValueChange={value =>
                      handleFieldChange("industry", value)
                    }
                  >
                    <SelectTrigger className="w-full bg-slate-800/50 border-slate-600 text-white h-10 md:h-12 text-sm md:text-base">
                      <SelectValue
                        placeholder={t.options.industry.placeholder}
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="technology">
                        {t.options.industry.technology}
                      </SelectItem>
                      <SelectItem value="healthcare">
                        {t.options.industry.healthcare}
                      </SelectItem>
                      <SelectItem value="finance">
                        {t.options.industry.finance}
                      </SelectItem>
                      <SelectItem value="retail">
                        {t.options.industry.retail}
                      </SelectItem>
                      <SelectItem value="manufacturing">
                        {t.options.industry.manufacturing}
                      </SelectItem>
                      <SelectItem value="services">
                        {t.options.industry.services}
                      </SelectItem>
                      <SelectItem value="other">
                        {t.options.industry.other}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2 mb-2 text-sm md:text-base">
                  <DollarSign className="h-4 w-4" />
                  {t.fields.monthlyMarketingBudget}
                </Label>
                <Select
                  value={formData.monthlyMarketingBudget}
                  onValueChange={value =>
                    handleFieldChange("monthlyMarketingBudget", value)
                  }
                >
                  <SelectTrigger className="w-full bg-slate-800/50 border-slate-600 text-white h-10 md:h-12 text-sm md:text-base">
                    <SelectValue placeholder={t.options.budget.placeholder} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="<1k">
                      {t.options.budget["<1k"]}
                    </SelectItem>
                    <SelectItem value="1k-5k">
                      {t.options.budget["1k-5k"]}
                    </SelectItem>
                    <SelectItem value="5k-10k">
                      {t.options.budget["5k-10k"]}
                    </SelectItem>
                    <SelectItem value="10k-25k">
                      {t.options.budget["10k-25k"]}
                    </SelectItem>
                    <SelectItem value="25k-50k">
                      {t.options.budget["25k-50k"]}
                    </SelectItem>
                    <SelectItem value="50k+">
                      {t.options.budget["50k+"]}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2 mb-2 text-sm md:text-base">
                  <TrendingUp className="h-4 w-4" />
                  {t.fields.currentMarketingApproach}
                </Label>
                <Select
                  value={formData.currentMarketingApproach}
                  onValueChange={value =>
                    handleFieldChange("currentMarketingApproach", value)
                  }
                >
                  <SelectTrigger className="w-full bg-slate-800/50 border-slate-600 text-white h-10 md:h-12 text-sm md:text-base">
                    <SelectValue placeholder={t.options.approach.placeholder} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="traditional">
                      {t.options.approach.traditional}
                    </SelectItem>
                    <SelectItem value="digital">
                      {t.options.approach.digital}
                    </SelectItem>
                    <SelectItem value="mixed">
                      {t.options.approach.mixed}
                    </SelectItem>
                    <SelectItem value="none">
                      {t.options.approach.none}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 md:space-y-6">
              <div className="text-center mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
                  {t.stepTitles.step3}
                </h3>
                <p className="text-slate-400 text-sm md:text-base">
                  {t.stepDescriptions.step3}
                </p>
              </div>

              <div className="space-y-4">
                <Label className="text-slate-300 flex items-center gap-2 mb-3 text-sm md:text-base">
                  <Target className="h-4 w-4" />
                  {t.fields.primaryGoals}
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                  {goalOptions.map(goal => (
                    <Badge
                      key={goal}
                      variant={
                        formData.primaryGoals.includes(goal)
                          ? "default"
                          : "outline"
                      }
                      className={`cursor-pointer transition-all duration-200 p-3 md:p-4 text-center justify-center hover:scale-105 text-xs md:text-sm ${
                        formData.primaryGoals.includes(goal)
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-lg"
                          : "border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-800/30"
                      }`}
                      onClick={() => handleArrayToggle("primaryGoals", goal)}
                    >
                      {t.goals[goal as keyof typeof t.goals]}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-slate-300 flex items-center gap-2 mb-3 text-sm md:text-base">
                  <TrendingUp className="h-4 w-4" />
                  {t.fields.biggestChallenges}
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                  {challengeOptions.map(challenge => (
                    <Badge
                      key={challenge}
                      variant={
                        formData.biggestChallenges.includes(challenge)
                          ? "default"
                          : "outline"
                      }
                      className={`cursor-pointer transition-all duration-200 p-3 md:p-4 text-center justify-center hover:scale-105 text-xs md:text-sm ${
                        formData.biggestChallenges.includes(challenge)
                          ? "bg-gradient-to-r from-red-500 to-orange-500 text-white border-transparent shadow-lg"
                          : "border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-800/30"
                      }`}
                      onClick={() =>
                        handleArrayToggle("biggestChallenges", challenge)
                      }
                    >
                      {t.challenges[challenge as keyof typeof t.challenges]}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2 mb-2 text-sm md:text-base">
                  <Calendar className="h-4 w-4" />
                  {t.fields.desiredTimeline}
                </Label>
                <Select
                  value={formData.desiredTimeline}
                  onValueChange={value =>
                    handleFieldChange("desiredTimeline", value)
                  }
                >
                  <SelectTrigger className="w-full bg-slate-800/50 border-slate-600 text-white h-10 md:h-12 text-sm md:text-base">
                    <SelectValue placeholder={t.options.timeline.placeholder} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="immediately">
                      {t.options.timeline.immediately}
                    </SelectItem>
                    <SelectItem value="1-month">
                      {t.options.timeline["1-month"]}
                    </SelectItem>
                    <SelectItem value="2-3-months">
                      {t.options.timeline["2-3-months"]}
                    </SelectItem>
                    <SelectItem value="6-months">
                      {t.options.timeline["6-months"]}
                    </SelectItem>
                    <SelectItem value="evaluating">
                      {t.options.timeline.evaluating}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 md:space-y-6">
              <div className="text-center mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
                  {t.stepTitles.step4}
                </h3>
                <p className="text-slate-400 text-sm md:text-base">
                  {t.stepDescriptions.step4}
                </p>
              </div>

              <div className="space-y-4">
                <Label className="text-slate-300 flex items-center gap-2 mb-3 text-sm md:text-base">
                  <TrendingUp className="h-4 w-4" />
                  {t.fields.currentPlatforms}
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
                  {platformOptions.map(platform => (
                    <Badge
                      key={platform}
                      variant={
                        formData.currentPlatforms.includes(platform)
                          ? "default"
                          : "outline"
                      }
                      className={`cursor-pointer transition-all duration-200 p-2 md:p-3 text-center justify-center hover:scale-105 text-xs ${
                        formData.currentPlatforms.includes(platform)
                          ? "bg-gradient-to-r from-green-500 to-blue-500 text-white border-transparent shadow-lg"
                          : "border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-800/30"
                      }`}
                      onClick={() =>
                        handleArrayToggle("currentPlatforms", platform)
                      }
                    >
                      {t.platforms[platform as keyof typeof t.platforms]}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2 mb-2 text-sm md:text-base">
                  <Target className="h-4 w-4" />
                  {t.fields.expectedROI}
                </Label>
                <Select
                  value={formData.expectedROI}
                  onValueChange={value =>
                    handleFieldChange("expectedROI", value)
                  }
                >
                  <SelectTrigger className="w-full bg-slate-800/50 border-slate-600 text-white h-10 md:h-12 text-sm md:text-base">
                    <SelectValue placeholder={t.options.roi.placeholder} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="10-25%">
                      {t.options.roi["10-25%"]}
                    </SelectItem>
                    <SelectItem value="25-50%">
                      {t.options.roi["25-50%"]}
                    </SelectItem>
                    <SelectItem value="50-100%">
                      {t.options.roi["50-100%"]}
                    </SelectItem>
                    <SelectItem value="100%+">
                      {t.options.roi["100%+"]}
                    </SelectItem>
                    <SelectItem value="not-sure">
                      {t.options.roi["not-sure"]}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2 mb-2 text-sm md:text-base">
                  <Users className="h-4 w-4" />
                  {t.fields.hearAboutUs}
                </Label>
                <Select
                  value={formData.hearAboutUs}
                  onValueChange={value =>
                    handleFieldChange("hearAboutUs", value)
                  }
                >
                  <SelectTrigger className="w-full bg-slate-800/50 border-slate-600 text-white h-10 md:h-12 text-sm md:text-base">
                    <SelectValue placeholder={t.options.source.placeholder} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="google">
                      {t.options.source.google}
                    </SelectItem>
                    <SelectItem value="social-media">
                      {t.options.source["social-media"]}
                    </SelectItem>
                    <SelectItem value="referral">
                      {t.options.source.referral}
                    </SelectItem>
                    <SelectItem value="linkedin">
                      {t.options.source.linkedin}
                    </SelectItem>
                    <SelectItem value="podcast">
                      {t.options.source.podcast}
                    </SelectItem>
                    <SelectItem value="other">
                      {t.options.source.other}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2 mb-2 text-sm md:text-base">
                  <Building2 className="h-4 w-4" />
                  {t.fields.additionalInfo}
                </Label>
                <Textarea
                  value={formData.additionalInfo}
                  onChange={e =>
                    handleFieldChange("additionalInfo", e.target.value)
                  }
                  className="w-full bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 transition-colors min-h-[100px] md:min-h-[120px] resize-none text-sm md:text-base"
                  placeholder={t.placeholders.additionalInfo}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700/30 p-4 md:p-6 bg-slate-900/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-xs md:text-sm text-slate-400 order-2 sm:order-1">
              {t.step} {step} {t.of} 4
            </div>
            <div className="flex gap-2 md:gap-3 order-1 sm:order-2">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 text-sm md:text-base px-3 md:px-4 py-2"
                >
                  {t.buttons.previous}
                </Button>
              )}
              {step < 4 ? (
                <Button
                  onClick={nextStep}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white text-sm md:text-base px-3 md:px-4 py-2"
                >
                  {t.buttons.next}{" "}
                  <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:opacity-90 text-white text-sm md:text-base px-3 md:px-4 py-2"
                >
                  {t.buttons.joinWaitlist}{" "}
                  <Sparkles className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
