import React from "react";
import themes from "./themes";

// Set the initial theme here
export const currentTheme = "dark"; // Change this to "light" when you want to switch themes

// Create a context with the current theme
export const ThemeContext = React.createContext(themes[currentTheme]);

// Optional: Create a provider component if you want to be able to change the theme dynamically
export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={themes[currentTheme]}>
      {children}
    </ThemeContext.Provider>
  );
};
