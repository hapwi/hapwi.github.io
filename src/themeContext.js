import React, { useEffect } from "react";
import themes from "./themes";

// Set the initial theme here
export const currentTheme = "main"; // Change this to "light" when you want to switch themes

// Create a context with the current theme
export const ThemeContext = React.createContext(themes[currentTheme]);

// Optional: Create a provider component if you want to be able to change the theme dynamically
export const ThemeProvider = ({ children }) => {
  const theme = themes[currentTheme];

  useEffect(() => {
    // Function to extract the color code from a theme property
    const extractColorCode = (colorString) => {
      const match = colorString.match(/#([0-9a-f]{6}|[0-9a-f]{3})/i);
      return match ? match[0] : "#111827"; // Default to a fallback color if no match is found
    };

    // Update the meta tag for theme color
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", extractColorCode(theme.headerBg));
    }

    // Update the body's background color
    document.body.style.backgroundColor = extractColorCode(
      theme.cardBackground
    );
  }, [theme]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};
