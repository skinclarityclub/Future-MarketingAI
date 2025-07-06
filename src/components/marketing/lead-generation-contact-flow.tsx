"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Globe,
  Calendar,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Send,
  Sparkles,
  Target,
  Users,
  TrendingUp,
  Award,
  Clock,
  Zap,
  Shield,
  Star,
  Heart,
  Gift,
  MessageCircle,
  PhoneCall,
  Video,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface ContactFormData {
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;

  // Company Info
  company: string;
  companySize: string;
  industry: string;
  website: string;

  // Project Info
  projectType: string;
  budget: string;
  timeline: string;
  goals: string[];

  // Communication Preferences
  preferredContact: string;
  urgency: string;
  bestTimeToCall: string;

  // Additional Info
  message: string;
  source: string;
  consent: boolean;
}

interface FormStep {
  id: string;
  title: string;
  description: string;
  fields: (keyof ContactFormData)[];
  validation: Record<string, (value: any) => string | null>;
}

interface LeadFlowProps {
  onLeadCapture?: (leadData: ContactFormData) => void;
  preset?: "demo" | "consultation" | "general" | "enterprise";
  source?: string;
}

export default function LeadGenerationContactFlow({
  onLeadCapture,
  preset = "general",
  source = "website",
}: LeadFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobTitle: "",
    company: "",
    companySize: "",
    industry: "",
    website: "",
    projectType: "",
    budget: "",
    timeline: "",
    goals: [],
    preferredContact: "email",
    urgency: "normal",
    bestTimeToCall: "",
    message: "",
    source,
    consent: false,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [activeFlow, setActiveFlow] = useState<"form" | "calendar" | "chat">(
    "form"
  );

  // Form validation rules
  const validationRules = {
    email: (value: string) => {
      if (!value) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "Please enter a valid email";
      return null;
    },
    firstName: (value: string) => (value ? null : "First name is required"),
    lastName: (value: string) => (value ? null : "Last name is required"),
    company: (value: string) => (value ? null : "Company name is required"),
    phone: (value: string) => {
      if (!value) return null; // Optional
      if (!/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, "")))
        return "Please enter a valid phone number";
      return null;
    },
    consent: (value: boolean) =>
      value ? null : "Please agree to our terms to continue",
  };

  // Define form steps based on preset
  const getFormSteps = (preset: string): FormStep[] => {
    const baseSteps: FormStep[] = [
      {
        id: "personal",
        title: "Personal Information",
        description: "Tell us about yourself",
        fields: ["firstName", "lastName", "email", "jobTitle"],
        validation: {
          firstName: validationRules.firstName,
          lastName: validationRules.lastName,
          email: validationRules.email,
        },
      },
      {
        id: "company",
        title: "Company Details",
        description: "Tell us about your organization",
        fields: ["company", "companySize", "industry", "website"],
        validation: {
          company: validationRules.company,
        },
      },
      {
        id: "project",
        title: "Project Requirements",
        description: "What are you looking to achieve?",
        fields: ["projectType", "budget", "timeline", "goals"],
        validation: {},
      },
      {
        id: "contact",
        title: "Contact Preferences",
        description: "How should we reach you?",
        fields: [
          "phone",
          "preferredContact",
          "urgency",
          "bestTimeToCall",
          "message",
        ],
        validation: {
          phone: validationRules.phone,
        },
      },
      {
        id: "consent",
        title: "Confirmation",
        description: "Review and confirm your information",
        fields: ["consent"],
        validation: {
          consent: validationRules.consent,
        },
      },
    ];

    if (preset === "demo") {
      return [
        {
          id: "demo-info",
          title: "Book Your Demo",
          description: "Schedule a personalized demonstration",
          fields: ["firstName", "lastName", "email", "company", "jobTitle"],
          validation: {
            firstName: validationRules.firstName,
            lastName: validationRules.lastName,
            email: validationRules.email,
            company: validationRules.company,
          },
        },
        {
          id: "demo-preferences",
          title: "Demo Preferences",
          description: "What would you like to see?",
          fields: ["goals", "urgency", "bestTimeToCall"],
          validation: {},
        },
        {
          id: "demo-consent",
          title: "Confirmation",
          description: "Confirm your demo booking",
          fields: ["consent"],
          validation: {
            consent: validationRules.consent,
          },
        },
      ];
    }

    return baseSteps;
  };

  const formSteps = getFormSteps(preset);

  // Handle form field changes
  const handleFieldChange = (field: keyof ContactFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field if it exists
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate current step
  const validateCurrentStep = () => {
    const currentStepData = formSteps[currentStep];
    const errors: Record<string, string> = {};

    currentStepData.fields.forEach(field => {
      const validator = currentStepData.validation[field];
      if (validator) {
        const error = validator(formData[field]);
        if (error) {
          errors[field] = error;
        }
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < formSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmitForm();
      }
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit form
  const handleSubmitForm = async () => {
    setIsSubmitting(true);

    try {
      // Simulate API call to backend
      const response = await fetch("/api/integration/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "trigger_capture",
          trigger: preset === "demo" ? "demo_requested" : "form_submit",
          leadData: {
            ...formData,
            source,
            timestamp: new Date().toISOString(),
            preset,
          },
        }),
      });

      const result = await response.json();
      setSubmissionResult(result);
      setIsSubmitted(true);

      if (onLeadCapture) {
        onLeadCapture(formData);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmissionResult({
        success: false,
        error: "Failed to submit form. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate form progress
  const progress = ((currentStep + 1) / formSteps.length) * 100;

  // Preset configurations
  const presetConfig = {
    demo: {
      title: "Book Your Personalized Demo",
      subtitle: "See our platform in action in just 30 minutes",
      primaryColor: "from-blue-500 to-purple-600",
      benefits: [
        "Personalized platform walkthrough",
        "Custom ROI analysis for your business",
        "Integration roadmap planning",
        "Exclusive pricing discussion",
      ],
    },
    consultation: {
      title: "Schedule Free Consultation",
      subtitle: "Get expert advice tailored to your needs",
      primaryColor: "from-green-500 to-blue-600",
      benefits: [
        "Expert strategy consultation",
        "Custom solution recommendations",
        "Implementation timeline",
        "Priority support access",
      ],
    },
    general: {
      title: "Get In Touch",
      subtitle: "Tell us about your project and goals",
      primaryColor: "from-purple-500 to-pink-600",
      benefits: [
        "Quick response within 24 hours",
        "Dedicated account manager",
        "Custom solution proposal",
        "Flexible engagement options",
      ],
    },
    enterprise: {
      title: "Enterprise Solutions",
      subtitle: "Scalable solutions for large organizations",
      primaryColor: "from-orange-500 to-red-600",
      benefits: [
        "Enterprise-grade security",
        "Dedicated implementation team",
        "Custom integrations available",
        "Priority support & SLA",
      ],
    },
  };

  const config = presetConfig[preset];

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            {submissionResult?.success ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>

                <h2 className="text-3xl font-bold text-white mb-4">
                  Thank You!
                </h2>

                <p className="text-slate-300 text-lg mb-6">
                  Your {preset === "demo" ? "demo request" : "message"} has been
                  received. We'll get back to you within 24 hours.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-white/10 rounded-xl">
                    <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-300">Response Time</p>
                    <p className="text-white font-semibold">Within 24 hours</p>
                  </div>
                  <div className="text-center p-4 bg-white/10 rounded-xl">
                    <Shield className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-300">Data Security</p>
                    <p className="text-white font-semibold">100% Secure</p>
                  </div>
                  <div className="text-center p-4 bg-white/10 rounded-xl">
                    <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-300">Success Rate</p>
                    <p className="text-white font-semibold">98% Satisfied</p>
                  </div>
                </div>

                <NormalButton
                  onClick={() => {
                    setIsSubmitted(false);
                    setCurrentStep(0);
                    setFormData({
                      firstName: "",
                      lastName: "",
                      email: "",
                      phone: "",
                      jobTitle: "",
                      company: "",
                      companySize: "",
                      industry: "",
                      website: "",
                      projectType: "",
                      budget: "",
                      timeline: "",
                      goals: [],
                      preferredContact: "email",
                      urgency: "normal",
                      bestTimeToCall: "",
                      message: "",
                      source,
                      consent: false,
                    });
                  }}
                  variant="secondary"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  Submit Another Request
                </NormalButton>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center"
                >
                  <AlertTriangle className="w-10 h-10 text-white" />
                </motion.div>

                <h2 className="text-3xl font-bold text-white mb-4">
                  Something went wrong
                </h2>

                <p className="text-slate-300 text-lg mb-6">
                  {submissionResult?.error ||
                    "Please try again or contact us directly."}
                </p>

                <div className="flex gap-4 justify-center">
                  <NormalButton
                    onClick={() => {
                      setIsSubmitted(false);
                      setSubmissionResult(null);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    Try Again
                  </NormalButton>

                  <NormalButton
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    onClick={() =>
                      window.open("mailto:support@example.com", "_blank")
                    }
                  >
                    Contact Support
                  </NormalButton>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          {config.title}
        </h1>
        <p className="text-xl text-slate-400">{config.subtitle}</p>
      </motion.div>

      {/* Benefits Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {config.benefits.map((benefit, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10"
          >
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <span className="text-sm text-slate-300">{benefit}</span>
          </div>
        ))}
      </motion.div>

      {/* Flow Selection Tabs */}
      <Tabs
        value={activeFlow}
        onValueChange={(value: any) => setActiveFlow(value)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="form" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Form
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Live Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>
                Step {currentStep + 1} of {formSteps.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Form Content */}
          <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <motion.div
                  key={currentStep}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`w-8 h-8 rounded-full bg-gradient-to-r ${config.primaryColor} flex items-center justify-center text-white font-bold text-sm`}
                >
                  {currentStep + 1}
                </motion.div>
                {formSteps[currentStep].title}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {formSteps[currentStep].description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {renderFormStep(formSteps[currentStep])}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <NormalButton
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 disabled:opacity-30"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </NormalButton>

                <NormalButton
                  onClick={handleNextStep}
                  disabled={isSubmitting}
                  className={`bg-gradient-to-r ${config.primaryColor} hover:opacity-90 text-white`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : currentStep === formSteps.length - 1 ? (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </NormalButton>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Calendar className="w-6 h-6 text-blue-400" />
                Schedule a Meeting
              </CardTitle>
              <CardDescription className="text-slate-400">
                Book a time that works best for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Calendar Integration
                </h3>
                <p className="text-slate-400 mb-6">
                  This would integrate with Calendly, Acuity, or similar
                  scheduling service
                </p>
                <NormalButton className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Open Calendar
                </NormalButton>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-green-400" />
                Live Chat Support
              </CardTitle>
              <CardDescription className="text-slate-400">
                Chat with our team in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Live Chat Widget
                </h3>
                <p className="text-slate-400 mb-6">
                  This would integrate with Intercom, Drift, or similar chat
                  service
                </p>
                <div className="flex gap-4 justify-center">
                  <NormalButton className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start Chat
                  </NormalButton>
                  <NormalButton
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    <PhoneCall className="w-4 h-4 mr-2" />
                    Request Callback
                  </NormalButton>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Render form step content
  function renderFormStep(step: FormStep) {
    const { fields } = step;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(field => renderFormField(field))}
      </div>
    );
  }

  // Render individual form field
  function renderFormField(field: keyof ContactFormData) {
    const error = formErrors[field];
    const value = formData[field];
    const stringValue = value as string;
    const booleanValue = value as boolean;
    const arrayValue = value as string[];

    const baseClasses = `bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20 ${
      error ? "border-red-500 focus:border-red-500" : ""
    }`;

    switch (field) {
      case "firstName":
        return (
          <div key={field} className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <User className="w-4 h-4" />
              First Name *
            </Label>
            <Input
              value={stringValue}
              onChange={e => handleFieldChange(field, e.target.value)}
              placeholder="Enter your first name"
              className={baseClasses}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        );

      case "lastName":
        return (
          <div key={field} className="space-y-2">
            <Label className="text-slate-300">Last Name *</Label>
            <Input
              value={stringValue}
              onChange={e => handleFieldChange(field, e.target.value)}
              placeholder="Enter your last name"
              className={baseClasses}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        );

      case "email":
        return (
          <div key={field} className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address *
            </Label>
            <Input
              type="email"
              value={stringValue}
              onChange={e => handleFieldChange(field, e.target.value)}
              placeholder="your.email@company.com"
              className={baseClasses}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        );

      case "phone":
        return (
          <div key={field} className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </Label>
            <Input
              type="tel"
              value={stringValue}
              onChange={e => handleFieldChange(field, e.target.value)}
              placeholder="+1 (555) 123-4567"
              className={baseClasses}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        );

      case "jobTitle":
        return (
          <div key={field} className="space-y-2">
            <Label className="text-slate-300">Job Title</Label>
            <Input
              value={stringValue}
              onChange={e => handleFieldChange(field, e.target.value)}
              placeholder="e.g. Marketing Director"
              className={baseClasses}
            />
          </div>
        );

      case "company":
        return (
          <div key={field} className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Company Name *
            </Label>
            <Input
              value={stringValue}
              onChange={e => handleFieldChange(field, e.target.value)}
              placeholder="Your company name"
              className={baseClasses}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        );

      case "companySize":
        return (
          <div key={field} className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Company Size
            </Label>
            <Select
              value={stringValue}
              onValueChange={val => handleFieldChange(field, val)}
            >
              <SelectTrigger className={baseClasses}>
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10 employees</SelectItem>
                <SelectItem value="11-50">11-50 employees</SelectItem>
                <SelectItem value="51-200">51-200 employees</SelectItem>
                <SelectItem value="201-1000">201-1000 employees</SelectItem>
                <SelectItem value="1000+">1000+ employees</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "industry":
        return (
          <div key={field} className="space-y-2">
            <Label className="text-slate-300">Industry</Label>
            <Select
              value={stringValue}
              onValueChange={val => handleFieldChange(field, val)}
            >
              <SelectTrigger className={baseClasses}>
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="saas">SaaS / Software</SelectItem>
                <SelectItem value="ecommerce">E-commerce</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="fintech">FinTech</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="consulting">Consulting</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "website":
        return (
          <div key={field} className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Website
            </Label>
            <Input
              type="url"
              value={stringValue}
              onChange={e => handleFieldChange(field, e.target.value)}
              placeholder="https://your-website.com"
              className={baseClasses}
            />
          </div>
        );

      case "projectType":
        return (
          <div key={field} className="space-y-2 md:col-span-2">
            <Label className="text-slate-300">Project Type</Label>
            <Select
              value={stringValue}
              onValueChange={val => handleFieldChange(field, val)}
            >
              <SelectTrigger className={baseClasses}>
                <SelectValue placeholder="What type of project are you working on?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="marketing-automation">
                  Marketing Automation
                </SelectItem>
                <SelectItem value="bi-dashboard">BI Dashboard</SelectItem>
                <SelectItem value="lead-generation">Lead Generation</SelectItem>
                <SelectItem value="content-strategy">
                  Content Strategy
                </SelectItem>
                <SelectItem value="data-analytics">Data Analytics</SelectItem>
                <SelectItem value="integration">System Integration</SelectItem>
                <SelectItem value="consulting">Strategy Consulting</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "budget":
        return (
          <div key={field} className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Budget Range
            </Label>
            <Select
              value={value}
              onValueChange={val => handleFieldChange(field, val)}
            >
              <SelectTrigger className={baseClasses}>
                <SelectValue placeholder="Select budget range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5k-15k">€5K - €15K</SelectItem>
                <SelectItem value="15k-30k">€15K - €30K</SelectItem>
                <SelectItem value="30k-50k">€30K - €50K</SelectItem>
                <SelectItem value="50k-100k">€50K - €100K</SelectItem>
                <SelectItem value="100k+">€100K+</SelectItem>
                <SelectItem value="not-sure">Not sure yet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "timeline":
        return (
          <div key={field} className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Project Timeline
            </Label>
            <Select
              value={value}
              onValueChange={val => handleFieldChange(field, val)}
            >
              <SelectTrigger className={baseClasses}>
                <SelectValue placeholder="When do you need this completed?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asap">ASAP (within 1 month)</SelectItem>
                <SelectItem value="1-3months">1-3 months</SelectItem>
                <SelectItem value="3-6months">3-6 months</SelectItem>
                <SelectItem value="6-12months">6-12 months</SelectItem>
                <SelectItem value="flexible">Flexible timeline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "goals":
        return (
          <div key={field} className="space-y-2 md:col-span-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Primary Goals (select all that apply)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                "Increase leads",
                "Improve conversion",
                "Automate processes",
                "Better analytics",
                "Cost reduction",
                "Team efficiency",
                "Customer retention",
                "Brand awareness",
                "Data insights",
              ].map(goal => {
                const isSelected = (formData.goals as string[]).includes(goal);
                return (
                  <motion.div
                    key={goal}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <NormalButton
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const currentGoals = formData.goals as string[];
                        const newGoals = isSelected
                          ? currentGoals.filter(g => g !== goal)
                          : [...currentGoals, goal];
                        handleFieldChange("goals", newGoals);
                      }}
                      className={`w-full text-left justify-start h-auto p-3 ${
                        isSelected
                          ? `bg-gradient-to-r ${config.primaryColor} text-white`
                          : "border-slate-600 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {goal}
                    </NormalButton>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );

      case "preferredContact":
        return (
          <div key={field} className="space-y-2">
            <Label className="text-slate-300">Preferred Contact Method</Label>
            <Select
              value={value}
              onValueChange={val => handleFieldChange(field, val)}
            >
              <SelectTrigger className={baseClasses}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone Call</SelectItem>
                <SelectItem value="video">Video Call</SelectItem>
                <SelectItem value="text">Text Message</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "urgency":
        return (
          <div key={field} className="space-y-2">
            <Label className="text-slate-300">Urgency Level</Label>
            <Select
              value={value}
              onValueChange={val => handleFieldChange(field, val)}
            >
              <SelectTrigger className={baseClasses}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - No rush</SelectItem>
                <SelectItem value="normal">Normal - This week</SelectItem>
                <SelectItem value="high">High - Within 24 hours</SelectItem>
                <SelectItem value="urgent">Urgent - ASAP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "bestTimeToCall":
        return (
          <div key={field} className="space-y-2">
            <Label className="text-slate-300">Best Time to Call</Label>
            <Select
              value={value}
              onValueChange={val => handleFieldChange(field, val)}
            >
              <SelectTrigger className={baseClasses}>
                <SelectValue placeholder="When should we call?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning (9-12 AM)</SelectItem>
                <SelectItem value="afternoon">Afternoon (12-5 PM)</SelectItem>
                <SelectItem value="evening">Evening (5-8 PM)</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "message":
        return (
          <div key={field} className="space-y-2 md:col-span-2">
            <Label className="text-slate-300">Additional Information</Label>
            <Textarea
              value={value}
              onChange={e => handleFieldChange(field, e.target.value)}
              placeholder="Tell us more about your project, specific requirements, or any questions you have..."
              rows={4}
              className={baseClasses}
            />
          </div>
        );

      case "consent":
        return (
          <div key={field} className="space-y-4 md:col-span-2">
            <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
              <input
                type="checkbox"
                id="consent"
                checked={value}
                onChange={e => handleFieldChange(field, e.target.checked)}
                className="mt-1 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
              <div className="space-y-2">
                <label
                  htmlFor="consent"
                  className="text-sm text-slate-300 cursor-pointer"
                >
                  I agree to receive communications about this inquiry and
                  understand that I can unsubscribe at any time. *
                </label>
                <p className="text-xs text-slate-500">
                  By submitting this form, you agree to our Terms of Service and
                  Privacy Policy. We'll only use your information to respond to
                  your inquiry and provide relevant updates.
                </p>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  }
}
