// src/contexts/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { IUser } from "@/models";

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    bio?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include", // Include cookies
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setError(null);
      } else {
        setUser(null);
        // Don't set error for unauthorized - user just isn't logged in
        if (response.status !== 401) {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.error || "Authentication check failed");
        }
      }
    } catch (error: any) {
      console.error("Auth check failed:", error);
      setUser(null);
      setError("Network error during authentication check");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.user) {
        throw new Error(data.error || "Login failed");
      }

      setUser(data.user);
      setError(null);
    } catch (error: any) {
      setError(error.message || "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, bio?: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ name, email, password, bio }),
        });

        const data = await response.json();

        if (!response.ok || !data.user) {
          throw new Error(data.error || "Registration failed");
        }

        setUser(data.user);
        setError(null);
      } catch (error: any) {
        setError(error.message || "Registration failed");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setError(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        refreshUser,
        clearError,
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
