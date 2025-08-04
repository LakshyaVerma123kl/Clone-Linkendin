"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

type ThemeMode = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: ThemeMode; // User preference
  resolvedTheme: ResolvedTheme; // Actual applied theme
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void; // Switches between light/dark
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as ThemeMode | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Apply and update resolved theme
  useEffect(() => {
    const root = document.documentElement;

    const updateTheme = () => {
      let effectiveTheme: ResolvedTheme;

      if (theme === "system") {
        effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
      } else {
        effectiveTheme = theme;
      }

      setResolvedTheme(effectiveTheme);

      // Update HTML class
      root.classList.remove("light", "dark");
      root.classList.add(effectiveTheme);

      // Save user preference
      localStorage.setItem("theme", theme);
    };

    updateTheme();

    // Listen for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") updateTheme();
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Toggle between light and dark (ignores "system")
  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const newTheme: ThemeMode = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      return newTheme;
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme, setTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
