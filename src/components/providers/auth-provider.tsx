"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  tier?: "free" | "starter" | "professional" | "enterprise";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock user for development - replace with actual auth logic
    const mockUser: User = {
      id: "demo-user-123",
      email: "admin@intelligencehub.com",
      name: "Admin User",
      role: "admin",
      tier: "enterprise",
    };

    setUser(mockUser);
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    // Mock sign in logic
    const user: User = {
      id: "demo-user-123",
      email,
      name: "Demo User",
      role: "admin",
      tier: "professional",
    };
    setUser(user);
    setLoading(false);
  };

  const signOut = async () => {
    setLoading(true);
    setUser(null);
    setLoading(false);
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    // Mock sign up logic
    const user: User = {
      id: "new-user-" + Date.now(),
      email,
      name: "New User",
      role: "user",
      tier: "free",
    };
    setUser(user);
    setLoading(false);
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    signUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export type { User, AuthContextType };
