import React from "react";
import { Link, useLocation } from "react-router-dom";

const NavButton = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex-1 py-3 px-2 text-center focus:outline-none ${
        isActive ? "text-emerald-400" : "text-gray-400 hover:text-gray-200"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mx-auto mb-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {icon}
      </svg>
      <span className="text-xs">{label}</span>
    </Link>
  );
};

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
      <div className="max-w-2xl mx-auto px-2">
        <div className="flex justify-around">
          <NavButton
            to="/"
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            }
            label="Leaderboard"
          />
          <NavButton
            to="/players"
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            }
            label="Players"
          />
          <NavButton
            to="/form"
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            }
            label="Submit Picks"
          />
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
