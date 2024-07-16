import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeContext } from "./themeContext";

const NavButton = ({ to, iconClass, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const theme = useContext(ThemeContext);

  return (
    <Link
      to={to}
      className={`flex-1 py-3 px-2 text-center flex flex-col items-center focus:outline-none ${
        isActive ? theme.navText : `${theme.headerText} hover:${theme.text}`
      }`}
    >
      <i className={`bi ${iconClass} mb-1`} style={{ fontSize: "1.3rem" }}></i>
      <span className="text-xs">{label}</span>
    </Link>
  );
};

const BottomNav = () => {
  const theme = useContext(ThemeContext);
  const [showSubmitPicks, setShowSubmitPicks] = useState(false);

  useEffect(() => {
    const checkCutoffTime = () => {
      // Define the cutoff time in EST -4 for summer and -5 for winter
      const cutoffTime = new Date("2024-07-18T01:35:00-04:00");

      // Get the current time in the user's local time zone
      const now = new Date();

      // Convert both times to UTC for comparison
      const cutoffTimeUTC =
        cutoffTime.getTime() + cutoffTime.getTimezoneOffset() * 60000;
      const nowUTC = now.getTime() + now.getTimezoneOffset() * 60000;

      // Compare and set state
      setShowSubmitPicks(nowUTC < cutoffTimeUTC);
    };

    // Check immediately
    checkCutoffTime();

    // Set up an interval to check every minute
    const intervalId = setInterval(checkCutoffTime, 60000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

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
