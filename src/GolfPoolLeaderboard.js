import React, { useState, useCallback, useMemo, useContext } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { ThemeContext } from "./themeContext"; // Import ThemeContext

// Constants
const UNLOCK_DATE = new Date("06/13/2024 1:45 AM");

const fetchKeys = async () => {
  const response = await fetch("https://servergolfpoolapi.vercel.app/api-keys");
  const data = await response.json();
  if (!response.ok) {
    throw new Error("Failed to fetch API keys");
  }
  return data;
};

const fetchGoogleSheetsData = async (spreadsheetId, range) => {
  const { apiKey } = await fetchKeys();
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`
  );
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.values;
};


const displayScore = (score) => {
  if (score === "#VALUE!" || score === 0 || score === "0") return "E";
  return score;
};

const customSortScore = (a, b) => {
  const scoreOrder = { "-": Infinity, CUT: 1000, WD: 1001, DQ: 1002, E: 0 };
  const getNumericScore = (score) => {
    if (score in scoreOrder) return scoreOrder[score];
    if (score === "" || score === "E") return 0;
    return parseInt(score);
  };
  return getNumericScore(a.score) - getNumericScore(b.score);
};

const customSortTotalScore = (a, b) => {
  const getNumericTotalScore = (score) => {
    if (score === "-") return Infinity;
    if (score === "E") return 0;
    return parseInt(score);
  };
  return (
    getNumericTotalScore(a.totalScore) - getNumericTotalScore(b.totalScore)
  );
};

// Components
const PopupMessage = ({ message, onClose }) => {
  const theme = useContext(ThemeContext);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`${theme.cardBackground} p-6 rounded-lg shadow-xl max-w-sm w-full mx-4`}
      >
        <p className={`${theme.text} text-center mb-4`}>{message}</p>
        <button
          onClick={onClose}
          className={`w-full bg-blue-500 ${theme.text} rounded py-2 hover:bg-blue-600 transition-colors duration-300`}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const GolferCard = ({ golfer, index }) => {
  const theme = useContext(ThemeContext);
  return (
    <div
      className={`p-2 rounded-lg shadow-md flex justify-between items-center border ${
        index === 5
          ? "bg-red-200 border-red-300"
          : `${theme.cardBackground} ${theme.cardBorder} ${theme.golferBackground}`
      }`}
    >
      <div className="flex-grow">
        <p
          className={`text-xs sm:text-sm font-medium truncate ${
            index === 5 ? "text-black" : theme.text
          }`}
        >
          {golfer.name}
        </p>
      </div>
      <p
        className={`text-sm sm:text-base font-bold ${
          index === 5 ? "text-black" : theme.scoreText
        } ml-2`}
      >
        {displayScore(golfer.score)}
      </p>
    </div>
  );
};

const LeaderboardRow = ({ entry, index, expandedIds, setExpandedIds }) => {
  const theme = useContext(ThemeContext);
  const [showPopup, setShowPopup] = useState(false);
  const isExpanded = expandedIds.includes(entry.id);

  const handleRowClick = () => {
    const currentDate = new Date();
    if (currentDate < UNLOCK_DATE) {
      setShowPopup(true);
    } else {
      setExpandedIds((prevIds) =>
        prevIds.includes(entry.id)
          ? prevIds.filter((id) => id !== entry.id)
          : [...prevIds, entry.id]
      );
    }
  };

  const renderChangeIndicator = () => {
    const changeValue = Math.abs(entry.change);
    if (entry.change === 0) {
      return <span className={`ml-2 text-xs ${theme.headerText}`}>−</span>;
    }

    const color = entry.change < 0 ? "text-red-400" : "text-green-400";
    const arrow = entry.change < 0 ? "▼" : "▲";
    return (
      <span
        className={`ml-2 text-xs ${color}`}
      >{`${arrow} ${changeValue}`}</span>
    );
  };

  return (
    <>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded
            ? theme.cardBackground
            : `hover:${theme.expandedBackground}`
        } border-b ${theme.cardBorder}`}
      >
        <div
          className="grid grid-cols-12 items-center py-3 px-2 sm:px-4 cursor-pointer"
          onClick={handleRowClick}
        >
          <div
            className={`col-span-1 font-bold text-sm sm:text-sm text-center ${theme.headerText}`}
          >
            {index}
          </div>
          <div className="col-span-7 sm:col-span-8 font-medium text-left pl-2 flex items-center">
            <span className={`${theme.text} text-lg sm:text-xl`}>
              {entry.user}
            </span>
            {renderChangeIndicator()}
          </div>
          <div
            className={`col-span-3 sm:col-span-2 text-right font-bold text-lg sm:text-xl ${theme.scoreText}`}
          >
            {displayScore(entry.totalScore)}
          </div>
          <div className="col-span-1 flex justify-end">
            <svg
              className={`w-4 h-4 sm:w-5 sm:h-5 ${theme.headerText} transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {isExpanded && (
          <div
            className={`px-2 sm:px-4 py-3 ${theme.expandedBackground} overflow-hidden`}
          >
            <h4 className={`text-lg font-semibold mb-2 ${theme.headerText} `}>
              Picked Golfers
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {entry.golfers.map((golfer, golfIndex) => (
                <GolferCard
                  key={`${entry.id}-${golfIndex}`}
                  golfer={golfer}
                  index={golfIndex}
                />
              ))}
            </div>
            <div className={`mt-3 text-sm text-center ${theme.text}`}>
              <span className="font-semibold">Tiebreaker:</span>{" "}
              {entry.tiebreaker}
            </div>
          </div>
        )}
      </div>
      {showPopup && (
        <PopupMessage
          message={`This feature will be available on ${format(
            UNLOCK_DATE,
            "MMMM d, yyyy 'at' h:mm a 'EST'"
          )}.`}
          onClose={() => setShowPopup(false)}
        />
      )}
    </>
  );
};

const GolfPoolLeaderboard = () => {
  const theme = useContext(ThemeContext);
  const [expandedIds, setExpandedIds] = useState([]);

  const fetchLeaderboardData = useCallback(async () => {
    const { entriesSheetId, leaderboardSheetId } = await fetchKeys();

    const [
      entriesData,
      picksScoresData,
      leaderboardTotalScores,
      changeTrackerData,
    ] = await Promise.all([
      fetchGoogleSheetsData(entriesSheetId, "Sheet1!A1:K"),
      fetchGoogleSheetsData(entriesSheetId, "PicksScores!A2:B1000"),
      fetchGoogleSheetsData(leaderboardSheetId, "CurrentLeaderboard!A1:Z"),
      fetchGoogleSheetsData(leaderboardSheetId, "ChangeTracker!A1:D1000"),
    ]);

    const scoresMap = new Map(picksScoresData);
    const totalScoresMap = new Map(
      leaderboardTotalScores.slice(1).map((row) => [row[0], row[1]])
    );

    const changeMap = new Map(
      changeTrackerData.slice(1).map((row) => {
        const changeValue = row[3];
        if (typeof changeValue === "string" && changeValue.startsWith("+")) {
          return [row[0], parseInt(changeValue.substring(1))];
        } else {
          return [row[0], parseInt(changeValue) || 0];
        }
      })
    );

    console.log("Change Tracker Data:", changeTrackerData);
    console.log("Change Map:", changeMap);

    const [, ...rows] = entriesData;

    const formattedData = rows.map((row, index) => {
      const golfers = row
        .slice(1, 7)
        .map((name) => ({
          name,
          score: scoresMap.get(name) || "-",
        }))
        .sort(customSortScore);

      const playerName = row[0];
      const totalScore = totalScoresMap.get(playerName) || "-";
      const change = changeMap.get(playerName) || 0;

      return {
        id: index + 1,
        user: playerName,
        totalScore,
        change,
        tiebreaker: row[7],
        golfers,
      };
    });

    // Sort by total score
    const sortedData = formattedData.sort(customSortTotalScore);

    // Assign positions with handling ties
    let currentPosition = 1;
    let previousTotalScore = sortedData[0]?.totalScore || "-";
    sortedData.forEach((entry, index) => {
      if (entry.totalScore !== previousTotalScore) {
        currentPosition = index + 1;
      }
      entry.position =
        entry.totalScore === previousTotalScore
          ? `T\u2009${currentPosition}`
          : currentPosition;
      previousTotalScore = entry.totalScore;
    });

    console.log("Formatted Data with Positions:", sortedData);

    return sortedData;
  }, []);

  const {
    data: leaderboardData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["leaderboardData"],
    queryFn: fetchLeaderboardData,
    refetchInterval: 60000, // Refetch every minute
  });

  const memoizedLeaderboardData = useMemo(
    () => leaderboardData,
    [leaderboardData]
  );

  if (isLoading) {
    return null;
  }

  if (error) {
    return (
      <div
        className={`min-h-screen ${theme.background} flex items-center justify-center`}
      >
        <div className="text-center text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text}`}>
      <div className="max-w-4xl mx-auto px-4 pb-28">
        <div
          className={`${theme.cardBackground} rounded-lg overflow-hidden border ${theme.cardBorder}`}
        >
          <div
            className={`grid grid-cols-12 items-center py-2 px-2 sm:px-4 ${theme.headerBackground} ${theme.headerText} font-semibold text-xs uppercase tracking-wider`}
          >
            <div className="col-span-1 text-center">Pos</div>
            <div className="col-span-7 sm:col-span-8 text-left pl-2">
              Player
            </div>
            <div className="col-span-3 sm:col-span-2 text-right">Score</div>
            <div className="col-span-1"></div>
          </div>
          {memoizedLeaderboardData.map((entry, index) => (
            <LeaderboardRow
              key={entry.id}
              entry={entry}
              index={entry.position}
              expandedIds={expandedIds}
              setExpandedIds={setExpandedIds}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GolfPoolLeaderboard;
