import { createContext, useEffect, useState } from "react";

// Création du contexte du thème
export const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

import { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    // Apply theme using data-theme attribute
    document.documentElement.setAttribute('data-theme', theme);
    
    // Store theme preference
    localStorage.setItem("theme", theme);

    // Add transition class
    document.documentElement.classList.add('theme-transition');

    // Remove transition class after animation
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);

    return () => clearTimeout(timer);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
