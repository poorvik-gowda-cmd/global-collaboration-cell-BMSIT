"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { UserIdentity } from "@gcc-portal/contracts";

interface AuthContextType {
  user: UserIdentity | null;
  isLoading: boolean;
  error: Error | null;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserIdentity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

  const fetchSession = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${apiUrl}/auth/me`, {
        credentials: "include", // Essential for HttpOnly cookie
      });

      if (res.ok) {
        const data = (await res.json()) as { user?: UserIdentity };
        setUser(data.user ?? null);
        setError(null);
      } else {
        setUser(null);
      }
    } catch (err: unknown) {
      setUser(null);
      setError(err instanceof Error ? err : new Error("Failed to fetch session"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchSession();
  }, []);

  const logout = async () => {
    try {
      await fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
    } catch (err: unknown) {
      console.error("Failed to logout:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        logout,
        refreshSession: fetchSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
