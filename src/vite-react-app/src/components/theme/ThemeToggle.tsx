
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun size={24} className="white" />
      ) : (
        <Moon 
          size={24} 
          className="text-white flex justify-end" 
          fill={isDark ? "white" : "transparent"}
        />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
