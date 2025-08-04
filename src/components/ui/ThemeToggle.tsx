import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

type ThemeMode = "light" | "dark" | "system";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes: { key: ThemeMode; icon: React.ElementType; label: string }[] = [
    { key: "light", icon: Sun, label: "Light" },
    { key: "dark", icon: Moon, label: "Dark" },
    { key: "system", icon: Monitor, label: "System" },
  ];

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {themes.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => setTheme(key)}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${
            theme === key
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
          aria-pressed={theme === key}
          title={label}
        >
          <Icon size={14} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
