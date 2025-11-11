// src/context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

// 1. Create the context
const ThemeContext = createContext();

// 2. Create the provider component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // This logic is from your LandingPage.jsx
    if (typeof window === "undefined") return "dark";
    return (
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
    );
  });

  // 3. Create the effect to apply the theme
  useEffect(() => {
    // We apply the theme to the <html> tag (document.documentElement)
    // This makes it globally available for all CSS
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 4. The function to toggle the theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 5. Create a custom hook to use the context easily
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};