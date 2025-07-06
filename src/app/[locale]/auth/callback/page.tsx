"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          // Redirect to homepage with error
          router.push("/?auth=error");
          return;
        }

        if (data.session) {
          // Successful authentication
          console.log("Authentication successful:", data.session.user);

          // Check for redirect parameter
          const urlParams = new URLSearchParams(window.location.search);
          const redirectTo = urlParams.get("redirect_to");

          if (redirectTo === "marketing-control-center") {
            router.push("/marketing-control-center");
          } else if (redirectTo === "command-center") {
            router.push("/command-center");
          } else {
            // Default redirect to Fortune 500 Command Center
            router.push("/command-center");
          }
        } else {
          // No session, redirect to login
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Unexpected error during auth callback:", error);
        router.push("/?auth=error");
      }
    };

    handleAuthCallback();
  }, [router, supabase.auth]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 dark">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
        >
          <Loader2 className="w-8 h-8 text-white" />
        </motion.div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Authenticatie verwerken...
        </h1>

        <p className="text-slate-400">
          Je wordt doorgestuurd naar FutureMarketingAI.
        </p>
      </motion.div>
    </div>
  );
}
