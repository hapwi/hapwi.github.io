import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeContext } from "./themeContext"; // Import ThemeContext

const NavButton = ({ to, iconClass, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const theme = useContext(ThemeContext); // Use ThemeContext

  return (
    <Link
      to={to}
      className={`flex-1 py-3 px-2 text-center flex flex-col items-center focus:outline-none ${
        isActive ? theme.scoreText : `${theme.headerText} hover:${theme.text}`
      }`}
    >
      <i className={`bi ${iconClass} mb-1`} style={{ fontSize: "1.3rem" }}></i>
      <span className="text-xs">{label}</span>
    </Link>
  );
};

const BottomNav = () => {
  const theme = useContext(ThemeContext); // Use ThemeContext
  const cutoffDate = new Date("07/13/2024 3:45 AM EST");
  const currentDate = new Date();
  const showSubmitPicks = currentDate < cutoffDate;

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 ${theme.cardBackground} border-t ${theme.cardBorder}`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="max-w-2xl mx-auto px-2">
        <div className="flex justify-around">
          <NavButton to="/" iconClass="bi bi-trophy" label="Leaderboard" />
          <NavButton to="/players" iconClass="bi bi-people" label="Players" />
          {showSubmitPicks && (
            <NavButton
              to="/form"
              iconClass="bi bi-ui-checks-grid"
              label="Submit Picks"
            />
          )}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
