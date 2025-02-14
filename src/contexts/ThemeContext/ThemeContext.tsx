import { createContext, useEffect, useState } from "react";

// Création du contexte du thème
export const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

import { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme");

    if (currentTheme === theme) {
      return;
    }

    document.body.classList.add("theme-transition");

    if (theme === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
    localStorage.setItem("theme", theme);

    setTimeout(() => {
      document.body.classList.remove("theme-transition");
    }, 1000);

    setIsFading(true);
    setTimeout(() => setIsFading(false), 500);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`fade ${isFading ? "" : "show"}`}>{children}</div>
    </ThemeContext.Provider>
  );
}
