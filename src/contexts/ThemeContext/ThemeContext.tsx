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

  // Appliquer le thème au chargement
  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
    localStorage.setItem("theme", theme);

    setIsFading(true);
    setTimeout(() => setIsFading(false), 500);
  }, [theme]);

  // Fonction pour basculer entre light/dark
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`fade ${isFading ? "" : "show"}`}>{children}</div>
    </ThemeContext.Provider>
  );
}
