"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Github,
  Sparkles,
  Chrome, // Using Chrome icon instead of Google
} from "lucide-react";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import { QuantumModal, QuantumButton } from "@/components/ui/neural-components";
import { createClient } from "@/lib/supabase/client";
import type { AuthError } from "@supabase/supabase-js";

// ============================
// SCHEMAS & TYPES
// ============================

const loginSchema = z.object({
  email: z.string().email("Voer een geldig e-mailadres in"),
  password: z.string().min(6, "Wachtwoord moet minimaal 6 karakters hebben"),
});

const signupSchema = z
  .object({
    email: z.string().email("Voer een geldig e-mailadres in"),
    password: z.string().min(8, "Wachtwoord moet minimaal 8 karakters hebben"),
    confirmPassword: z.string(),
    firstName: z.string().min(2, "Voornaam is verplicht"),
    lastName: z.string().min(2, "Achternaam is verplicht"),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Wachtwoorden komen niet overeen",
    path: ["confirmPassword"],
  });

const forgotPasswordSchema = z.object({
  email: z.string().email("Voer een geldig e-mailadres in"),
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;
type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

type AuthMode = "login" | "signup" | "forgot-password";

interface AuthenticationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  onSuccess?: () => void;
}

// ============================
// PREMIUM ANIMATIONS
// ============================

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    rotateY: -15,
    y: 50,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
      duration: 0.6,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    rotateY: 15,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

const formVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

// ============================
// MAIN COMPONENT
// ============================

export function AuthenticationModal({
  isOpen,
  onClose,
  initialMode = "login",
  onSuccess,
}: AuthenticationModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();

  // Form configurations
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  // Reset forms and state when mode changes
  useEffect(() => {
    setAuthError(null);
    setSuccessMessage(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    loginForm.reset();
    signupForm.reset();
    forgotPasswordForm.reset();
  }, [mode, loginForm, signupForm, forgotPasswordForm]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMode(initialMode);
      setAuthError(null);
      setSuccessMessage(null);
      setIsLoading(false);
    }
  }, [isOpen, initialMode]);

  // ============================
  // AUTH HANDLERS
  // ============================

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      setSuccessMessage("Succesvol ingelogd! Je wordt doorgestuurd...");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (error) {
      const authError = error as AuthError;
      setAuthError(
        authError.message || "Er is een fout opgetreden bij het inloggen"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data: SignupForm) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            full_name: `${data.firstName} ${data.lastName}`,
          },
        },
      });

      if (error) throw error;

      setSuccessMessage(
        "Account aangemaakt! Controleer je e-mail voor verificatie."
      );
      setTimeout(() => {
        setMode("login");
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      const authError = error as AuthError;
      setAuthError(
        authError.message ||
          "Er is een fout opgetreden bij het aanmaken van je account"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setSuccessMessage(
        "Reset link verzonden! Controleer je e-mail voor instructies."
      );
      setTimeout(() => {
        setMode("login");
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      const authError = error as AuthError;
      setAuthError(
        authError.message ||
          "Er is een fout opgetreden bij het versturen van de reset link"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      setAuthError(
        authError.message || `Er is een fout opgetreden bij ${provider} login`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ============================
  // RENDER FUNCTIONS
  // ============================

  const renderModeTitle = () => {
    switch (mode) {
      case "login":
        return "Welkom terug";
      case "signup":
        return "Account aanmaken";
      case "forgot-password":
        return "Wachtwoord vergeten";
      default:
        return "Authenticatie";
    }
  };

  const renderModeSubtitle = () => {
    switch (mode) {
      case "login":
        return "Log in om door te gaan naar FutureMarketingAI";
      case "signup":
        return "Maak een account aan en begin je AI-gedreven groeireis";
      case "forgot-password":
        return "Voer je e-mailadres in om je wachtwoord te resetten";
      default:
        return "";
    }
  };

  const renderLoginForm = () => (
    <motion.form
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onSubmit={loginForm.handleSubmit(handleLogin)}
      className="space-y-6"
    >
      <motion.div variants={fieldVariants} className="space-y-2">
        <label className="text-sm font-medium text-white/90">E-mailadres</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            {...loginForm.register("email")}
            type="email"
            placeholder="je@bedrijf.com"
            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-blue-400/20"
            disabled={isLoading}
          />
        </div>
        {loginForm.formState.errors.email && (
          <p className="text-red-400 text-sm">
            {loginForm.formState.errors.email.message}
          </p>
        )}
      </motion.div>

      <motion.div variants={fieldVariants} className="space-y-2">
        <label className="text-sm font-medium text-white/90">Wachtwoord</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            {...loginForm.register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-blue-400/20"
            disabled={isLoading}
          />
          <NormalButton
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </NormalButton>
        </div>
        {loginForm.formState.errors.password && (
          <p className="text-red-400 text-sm">
            {loginForm.formState.errors.password.message}
          </p>
        )}
      </motion.div>

      <motion.div variants={fieldVariants} className="flex justify-end">
        <NormalButton
          type="button"
          onClick={() => setMode("forgot-password")}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          disabled={isLoading}
        >
          Wachtwoord vergeten?
        </NormalButton>
      </motion.div>

      <motion.div variants={fieldVariants}>
        <QuantumButton
          variant="primary"
          size="lg"
          processing={isLoading}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Inloggen..." : "Inloggen"}
        </QuantumButton>
      </motion.div>
    </motion.form>
  );

  const renderSignupForm = () => (
    <motion.form
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onSubmit={signupForm.handleSubmit(handleSignup)}
      className="space-y-6"
    >
      <div className="grid grid-cols-2 gap-4">
        <motion.div variants={fieldVariants} className="space-y-2">
          <label className="text-sm font-medium text-white/90">Voornaam</label>
          <Input
            {...signupForm.register("firstName")}
            placeholder="John"
            className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-blue-400/20"
            disabled={isLoading}
          />
          {signupForm.formState.errors.firstName && (
            <p className="text-red-400 text-sm">
              {signupForm.formState.errors.firstName.message}
            </p>
          )}
        </motion.div>

        <motion.div variants={fieldVariants} className="space-y-2">
          <label className="text-sm font-medium text-white/90">
            Achternaam
          </label>
          <Input
            {...signupForm.register("lastName")}
            placeholder="Doe"
            className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-blue-400/20"
            disabled={isLoading}
          />
          {signupForm.formState.errors.lastName && (
            <p className="text-red-400 text-sm">
              {signupForm.formState.errors.lastName.message}
            </p>
          )}
        </motion.div>
      </div>

      <motion.div variants={fieldVariants} className="space-y-2">
        <label className="text-sm font-medium text-white/90">E-mailadres</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            {...signupForm.register("email")}
            type="email"
            placeholder="je@bedrijf.com"
            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-blue-400/20"
            disabled={isLoading}
          />
        </div>
        {signupForm.formState.errors.email && (
          <p className="text-red-400 text-sm">
            {signupForm.formState.errors.email.message}
          </p>
        )}
      </motion.div>

      <motion.div variants={fieldVariants} className="space-y-2">
        <label className="text-sm font-medium text-white/90">Wachtwoord</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            {...signupForm.register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-blue-400/20"
            disabled={isLoading}
          />
          <NormalButton
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </NormalButton>
        </div>
        {signupForm.formState.errors.password && (
          <p className="text-red-400 text-sm">
            {signupForm.formState.errors.password.message}
          </p>
        )}
      </motion.div>

      <motion.div variants={fieldVariants} className="space-y-2">
        <label className="text-sm font-medium text-white/90">
          Bevestig wachtwoord
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            {...signupForm.register("confirmPassword")}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-blue-400/20"
            disabled={isLoading}
          />
          <NormalButton
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
            disabled={isLoading}
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </NormalButton>
        </div>
        {signupForm.formState.errors.confirmPassword && (
          <p className="text-red-400 text-sm">
            {signupForm.formState.errors.confirmPassword.message}
          </p>
        )}
      </motion.div>

      <motion.div variants={fieldVariants}>
        <QuantumButton
          variant="primary"
          size="lg"
          processing={isLoading}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Account aanmaken..." : "Account aanmaken"}
        </QuantumButton>
      </motion.div>
    </motion.form>
  );

  const renderForgotPasswordForm = () => (
    <motion.form
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)}
      className="space-y-6"
    >
      <motion.div variants={fieldVariants} className="space-y-2">
        <label className="text-sm font-medium text-white/90">E-mailadres</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            {...forgotPasswordForm.register("email")}
            type="email"
            placeholder="je@bedrijf.com"
            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-blue-400/20"
            disabled={isLoading}
          />
        </div>
        {forgotPasswordForm.formState.errors.email && (
          <p className="text-red-400 text-sm">
            {forgotPasswordForm.formState.errors.email.message}
          </p>
        )}
      </motion.div>

      <motion.div variants={fieldVariants}>
        <QuantumButton
          variant="primary"
          size="lg"
          processing={isLoading}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Versturen..." : "Reset link versturen"}
        </QuantumButton>
      </motion.div>

      <motion.div variants={fieldVariants} className="text-center">
        <NormalButton
          type="button"
          onClick={() => setMode("login")}
          className="text-sm text-white/60 hover:text-white/80 transition-colors inline-flex items-center gap-1"
          disabled={isLoading}
        >
          ← Terug naar inloggen
        </NormalButton>
      </motion.div>
    </motion.form>
  );

  const renderOAuthButtons = () => (
    <motion.div variants={fieldVariants} className="grid grid-cols-2 gap-3">
      <QuantumButton
        variant="secondary"
        onClick={() => handleOAuthLogin("google")}
        disabled={isLoading}
        className="flex items-center justify-center gap-2"
      >
        <Chrome className="w-4 h-4" />
        Google
      </QuantumButton>
      <QuantumButton
        variant="secondary"
        onClick={() => handleOAuthLogin("github")}
        disabled={isLoading}
        className="flex items-center justify-center gap-2"
      >
        <Github className="w-4 h-4" />
        GitHub
      </QuantumButton>
    </motion.div>
  );

  const renderModeToggle = () => {
    if (mode === "forgot-password") return null;

    return (
      <motion.div variants={fieldVariants} className="text-center">
        <p className="text-white/60 text-sm">
          {mode === "login" ? "Nog geen account?" : "Al een account?"}
          <NormalButton
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="ml-1 text-blue-400 hover:text-blue-300 transition-colors font-medium"
            disabled={isLoading}
          >
            {mode === "login" ? "Account aanmaken" : "Inloggen"}
          </NormalButton>
        </p>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {renderModeTitle()}
                    </h2>
                    <p className="text-white/60 text-sm">
                      {renderModeSubtitle()}
                    </p>
                  </div>
                </div>
                <QuantumButton
                  variant="secondary"
                  size="sm"
                  onClick={onClose}
                  className="px-3 py-1 text-white/60 hover:text-white"
                  disabled={isLoading}
                >
                  <X className="w-4 h-4" />
                </QuantumButton>
              </div>

              {/* Success Message */}
              <AnimatePresence>
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <p className="text-green-300 text-sm">{successMessage}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              <AnimatePresence>
                {authError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-300 text-sm">{authError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* OAuth Buttons (only for login/signup) */}
              {mode !== "forgot-password" && (
                <>
                  {renderOAuthButtons()}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-slate-900/95 text-white/60">
                        of via e-mail
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Forms */}
              <AnimatePresence mode="wait">
                {mode === "login" && renderLoginForm()}
                {mode === "signup" && renderSignupForm()}
                {mode === "forgot-password" && renderForgotPasswordForm()}
              </AnimatePresence>

              {/* Mode Toggle */}
              <div className="mt-6">{renderModeToggle()}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
