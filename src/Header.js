import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { ThemeContext } from "./themeContext"; // Import ThemeContext

const Header = () => {
  const location = useLocation();
  const theme = useContext(ThemeContext); // Use ThemeContext
  const [cutScore, setCutScore] = useState(null); // State for cut score

  useEffect(() => {
    const fetchCutScore = async () => {
      try {
        const response = await axios.get(
          "https://site.api.espn.com/apis/site/v2/sports/golf/leaderboard?tournamentId=401580360"
        );
        const cutScore = response.data.events[0].tournament.cutScore;
        setCutScore(cutScore);
      } catch (error) {
        console.error("Error fetching cut score:", error);
      }
    };

    fetchCutScore();

    const intervalId = setInterval(fetchCutScore, 600000); // 600,000 ms = 10 minutes

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

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

  const formatCutScore = (score) => {
    if (score > 0) {
      return `+${score}`;
    }
    return score;
  };

  const getCutScoreColor = () => {
    return "text-white-500";
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 ${theme.headerBg} bg-opacity-90 backdrop-filter backdrop-blur-sm z-10 shadow-md pt-safe`}
    >
      <div className="max-w-2xl mx-auto px-2 py-2 mb-4">
        <h2
          className={`text-xl sm:text-2xl font-bold mb-1 text-center text-transparent bg-clip-text bg-gradient-to-r ${theme.headerTextHeader}`}
        >
          {getPageTitle()}
        </h2>
        {(location.pathname === "/" || location.pathname === "/players") && (
          <div className="flex justify-center items-center mt-2">
            <div className="flex items-center justify-center bg-white bg-opacity-20 rounded-md py-1 px-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <p
                className={`text-center ${
                  theme.headerTextSub
                } text-sm font-medium ${getCutScoreColor()}`}
              >
                Projected Cut:{" "}
                {cutScore !== null ? formatCutScore(cutScore) : "Loading..."}
              </p>
            </div>
          </div>
        )}
        {location.pathname === "/form" && (
          <p className={`text-center ${theme.headerText} text-sm`}>
            Submit your lineup for the tournament
          </p>
        )}
      </div>
    </header>
  );
};

export default Header;
