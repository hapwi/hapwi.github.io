import React from "react";
import { useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Leaderboard";
      case "/players":
        return "Tournament Players";
      case "/form":
        return "Form";
      default:
        return "";
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-900 bg-opacity-90 backdrop-filter backdrop-blur-sm z-10 shadow-md">
      <div className="max-w-2xl mx-auto px-2 py-2 mb-4">
        <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
          {getPageTitle()}
        </h2>
        {location.pathname === "/" && (
          <p className="text-center text-gray-400 text-sm">
            Stay updated with the latest scores and rankings
          </p>
        )}
        {location.pathname === "/players" && (
          <p className="text-center text-gray-400 text-sm">
            Current scores for all players in the tournament
          </p>
        )}
        {location.pathname === "/form" && (
          <p className="text-center text-gray-400 text-sm">
            Submit your lineup for the tournament
          </p>
        )}
      </div>
    </header>
  );
};

export default Header;
