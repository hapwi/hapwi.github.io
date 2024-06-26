import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const apiKey = "AIzaSyCTIOtXB0RDa5Y5gubbRn328WIrqHwemrc";
const leaderboardSheetId = "1iTNStqnadp4ZyR7MRkSmvX5WeialS4WST6Yy-Qv8Reo";
const entriesSheetId = "1_bP0NUG6XqrF0XQvKXNm3b07QuHABfvWotsemGToyYg";

async function fetchGoogleSheetsData(spreadsheetId, range) {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`
    );
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.values;
  } catch (error) {
    console.error("Error fetching Google Sheets data:", error);
    return null;
  }
}

const PopupMessage = ({ message, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
      <p className="text-white text-center mb-4">{message}</p>
      <button
        onClick={onClose}
        className="w-full bg-blue-500 text-white rounded py-2 hover:bg-blue-600 transition-colors duration-300"
      >
        Close
      </button>
    </div>
  </div>
);

const LeaderboardRow = ({ entry, index, expandedIds, setExpandedIds }) => {
  const [showPopup, setShowPopup] = useState(false);
  const isExpanded = expandedIds.includes(entry.id);

  const handleRowClick = () => {
    const unlockDate = new Date("06/13/2024 3:45 AM EST");
    const currentDate = new Date();

    if (currentDate < unlockDate) {
      setShowPopup(true);
    } else {
      setExpandedIds((prevExpandedIds) =>
        prevExpandedIds.includes(entry.id)
          ? prevExpandedIds.filter((id) => id !== entry.id)
          : [...prevExpandedIds, entry.id]
      );
    }
  };

  const displayScore = (score) => {
    if (score === "#VALUE!" || score === 0 || score === "0") {
      return "E";
    }
    return score;
  };

  return (
    <>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? "bg-gray-800" : "hover:bg-gray-750"
        } border-b border-gray-700`}
      >
        <div
          className="grid grid-cols-12 items-center py-3 px-2 sm:px-4 cursor-pointer"
          onClick={handleRowClick}
        >
          <div className="col-span-1 font-bold text-lg sm:text-xl text-center text-gray-400">
            {index + 1}
          </div>
          <div className="col-span-7 sm:col-span-8 font-medium text-left pl-2">
            <span className="text-white text-sm sm:text-base">
              {entry.user}
            </span>
            <span
              className={`ml-2 text-xs ${
                entry.change > 0
                  ? "text-green-400"
                  : entry.change < 0
                  ? "text-red-400"
                  : "text-gray-400"
              }`}
            >
              {entry.change > 0
                ? `▲${entry.change}`
                : entry.change < 0
                ? `▼${Math.abs(entry.change)}`
                : "−"}
            </span>
          </div>
          <div className="col-span-3 sm:col-span-2 text-right font-bold text-lg sm:text-xl text-emerald-400">
            {displayScore(entry.totalScore)}
          </div>
          <div className="col-span-1 flex justify-end">
            <svg
              className={`w-4 h-4 sm:w-5 sm:h-5 transform transition-transform duration-300 text-gray-400 ${
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
          <div className="px-2 sm:px-4 py-3 bg-gray-750 transition-all duration-300 ease-in-out">
            <h4 className="text-lg font-semibold mb-2 text-gray-300">
              Picked Golfers
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {entry.golfers.map((golfer, golfIndex) => (
                <div
                  key={`${entry.id}-${golfIndex}`}
                  className={`p-2 rounded-lg shadow-md flex justify-between items-center border ${
                    golfIndex === 5
                      ? "bg-red-200 border-red-300"
                      : "bg-gray-700 border-gray-600"
                  }`}
                >
                  <div className="flex-grow">
                    <p
                      className={`text-xs sm:text-sm font-medium truncate ${
                        golfIndex === 5 ? "text-black" : "text-gray-300"
                      }`}
                    >
                      {golfer.name}
                    </p>
                  </div>
                  <p
                    className={`text-sm sm:text-base font-bold ${
                      golfIndex === 5 ? "text-black" : "text-emerald-400"
                    } ml-2`}
                  >
                    {golfer.score === 0 ? "E" : golfer.score}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 text-sm text-center text-gray-300">
              <span className="font-semibold">Tiebreaker:</span>{" "}
              {entry.tiebreaker}
            </div>
          </div>
        )}
      </div>
      {showPopup && (
        <PopupMessage
          message="This feature will be available on July 13, 2024 at 3:45 AM EST."
          onClose={() => setShowPopup(false)}
        />
      )}
    </>
  );
};

const GolfPoolLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [expandedIds, setExpandedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [entriesData, picksScoresData, leaderboardTotalScores] =
        await Promise.all([
          fetchGoogleSheetsData(entriesSheetId, "Sheet1!A1:K"),
          fetchGoogleSheetsData(entriesSheetId, "PicksScores!A2:B1000"),
          fetchGoogleSheetsData(
            leaderboardSheetId,
            "Copy%20of%20Leaderboard!A1:Z"
          ),
        ]);

      if (entriesData && picksScoresData && leaderboardTotalScores) {
        // Create a map of golfer names to their scores
        const scoresMap = new Map();
        picksScoresData.forEach(([golferName, score]) => {
          scoresMap.set(golferName, score);
        });

        // Create a map of player names to their total scores
        const totalScoresMap = new Map();
        leaderboardTotalScores.forEach((row, index) => {
          if (index > 0 && row.length === 2) {
            const [playerName, score] = row;
            totalScoresMap.set(playerName, score);
          }
        });

        const [headers, ...rows] = entriesData;

        function customSortScore(a, b) {
          const scoreOrder = {
            CUT: 1000,
            WD: 1001,
            DQ: 1002,
            E: 0,
          };

          const aScore =
            a.score === "E" || a.score === ""
              ? 0
              : scoreOrder[a.score] !== undefined
              ? scoreOrder[a.score]
              : parseInt(a.score);
          const bScore =
            b.score === "E" || b.score === ""
              ? 0
              : scoreOrder[b.score] !== undefined
              ? scoreOrder[b.score]
              : parseInt(b.score);

          return aScore - bScore;
        }

        const formattedData = rows.map((row, index) => {
          const golfers = [
            { name: row[1], score: scoresMap.get(row[1]) || "" },
            { name: row[2], score: scoresMap.get(row[2]) || "" },
            { name: row[3], score: scoresMap.get(row[3]) || "" },
            { name: row[4], score: scoresMap.get(row[4]) || "" },
            { name: row[5], score: scoresMap.get(row[5]) || "" },
            { name: row[6], score: scoresMap.get(row[6]) || "" },
          ];

          golfers.forEach((golfer) => {
            if (golfer.name && golfer.score === "") {
              golfer.score = "E";
            }
          });

          golfers.sort(customSortScore);

          const playerName = row[0];
          const totalScore = totalScoresMap.get(playerName) || "E";

          return {
            id: index + 1,
            user: playerName,
            totalScore: totalScore,
            change: 0,
            tiebreaker: row[7],
            golfers,
          };
        });

        function customSortTotalScore(a, b) {
          const scoreA = a.totalScore === "E" ? 0 : parseInt(a.totalScore);
          const scoreB = b.totalScore === "E" ? 0 : parseInt(b.totalScore);
          return scoreA - scoreB;
        }

        formattedData.sort(customSortTotalScore);

        setLeaderboardData(formattedData); // Update the state here
      } else {
        throw new Error("Failed to fetch leaderboard data");
      }
    } catch (err) {
      console.error("Error in fetchLeaderboardData:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  useEffect(() => {
    // Set up an interval to refresh data every 1 minute (60000 milliseconds)
    const intervalId = setInterval(() => {
      fetchLeaderboardData();
    }, 60000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchLeaderboardData]);

  if (loading) {
    return;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      <div className="max-w-2xl mx-auto px-4 pb-28">
        <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-700">
          <div className="grid grid-cols-12 items-center py-2 px-2 sm:px-4 bg-gray-750 text-gray-300 font-semibold text-xs uppercase tracking-wider">
            <div className="col-span-1 text-center">Pos</div>
            <div className="col-span-7 sm:col-span-8 text-left pl-2">
              Player
            </div>
            <div className="col-span-3 sm:col-span-2 text-right">Score</div>
            <div className="col-span-1"></div>
          </div>
          {leaderboardData.map((entry, index) => (
            <LeaderboardRow
              key={entry.id}
              entry={entry}
              index={index}
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
