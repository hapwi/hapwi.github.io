import React, { useState, useEffect } from "react";

const apiKey = "AIzaSyCTIOtXB0RDa5Y5gubbRn328WIrqHwemrc";
const leaderboardSheetId = "1iTNStqnadp4ZyR7MRkSmvX5WeialS4WST6Yy-Qv8Reo";
const entriesSheetId = "1_bP0NUG6XqrF0XQvKXNm3b07QuHABfvWotsemGToyYg";
const playersSheetId = "1zCKMy2jgG9QoIhxFqRviDm4oxEFK_ixv_tN66GmCXTc";

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

const LeaderboardRow = ({
  entry,
  index,
  expandedId,
  setExpandedId,
  compareUsers,
  setCompareUsers,
}) => {
  const isExpanded = expandedId === entry.id;
  const isSelected = compareUsers.includes(entry.id);

  const handleCompare = (e) => {
    e.stopPropagation();
    if (isSelected) {
      setCompareUsers((prevUsers) => prevUsers.filter((id) => id !== entry.id));
    } else if (compareUsers.length < 3) {
      setCompareUsers((prevUsers) => [...prevUsers, entry.id]);
    }
  };

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        isExpanded ? "bg-gray-800" : "hover:bg-gray-750"
      } border-b border-gray-700`}
    >
      <div
        className="grid grid-cols-12 items-center py-3 px-2 sm:px-4 cursor-pointer"
        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
      >
        <div className="col-span-1 font-bold text-lg sm:text-xl text-center text-gray-400">
          {index + 1}
        </div>
        <div className="col-span-7 sm:col-span-8 font-medium text-left pl-2">
          <span className="text-white text-sm sm:text-base">{entry.user}</span>
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
          {entry.totalScore === 0 ? "E" : entry.totalScore}
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
                  <p
                    className={`text-xs ${
                      golfIndex === 5 ? "text-black" : "text-gray-500"
                    }`}
                  ></p>
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
          <div className="mt-3 text-sm text-gray-300">
            <span className="font-semibold">Tiebreaker:</span>{" "}
            {entry.tiebreaker}
          </div>
          <button
            onClick={handleCompare}
            className={`mt-3 px-3 py-1 text-white text-sm rounded transition-colors duration-300 ${
              isSelected
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-500 hover:bg-blue-600"
            } ${
              compareUsers.length >= 3 && !isSelected
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={compareUsers.length >= 3 && !isSelected}
          >
            {isSelected ? "Remove" : "Compare"}
          </button>
        </div>
      )}
    </div>
  );
};

const CompareModal = ({ users, closeModal }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto p-2 sm:p-4">
      <div className="mb-2 flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Compare Picks
        </h2>
        <button
          onClick={closeModal}
          className="px-4 py-2 bg-blue-500 text-white text-sm sm:text-base rounded hover:bg-blue-600 transition-colors duration-300"
        >
          Close
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {users.map((user) => (
          <div
            key={`compare-${user.id}`}
            className="bg-gray-700 p-3 sm:p-4 rounded-lg"
          >
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white text-center">
              {user.user}
            </h3>
            <p className="text-sm sm:text-base text-emerald-400 mb-2 text-center">
              Total: {user.totalScore === 0 ? "E" : user.totalScore}
            </p>
            {user.golfers.map((golfer, golferIndex) => (
              <div
                key={`compare-${user.id}-${golferIndex}`}
                className="text-sm sm:text-base mb-1 flex justify-between"
              >
                <span className="text-gray-300 truncate mr-2">
                  {golfer.name}
                </span>
                <span className="text-emerald-400">
                  {golfer.score === 0 ? "E" : golfer.score}
                </span>
              </div>
            ))}
            <div className="text-sm sm:text-base mt-2 text-gray-300 text-center">
              <span className="font-semibold">Tiebreaker:</span>{" "}
              {user.tiebreaker}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);





const GolfPoolLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [compareUsers, setCompareUsers] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLeaderboardData() {
      setLoading(true);
      try {
        const entriesData = await fetchGoogleSheetsData(
          entriesSheetId,
          "Sheet1!A1:K"
        );
        const picksScoresData = await fetchGoogleSheetsData(
          entriesSheetId,
          "PicksScores!A2:B1000"
        );

        if (entriesData && picksScoresData) {
          // Create a map of golfer names to their scores
          const scoresMap = new Map();
          picksScoresData.forEach(([golferName, score]) => {
            scoresMap.set(golferName, score === "E" ? 0 : parseInt(score));
          });

          const [headers, ...rows] = entriesData;
          function customSortScore(a, b) {
            const scoreOrder = {
              CUT: Infinity,
              WD: Infinity,
              DQ: Infinity,
              E: 0,
            };

            const aScore =
              scoreOrder[a.score] !== undefined
                ? scoreOrder[a.score]
                : parseInt(a.score);
            const bScore =
              scoreOrder[b.score] !== undefined
                ? scoreOrder[b.score]
                : parseInt(b.score);

            // Handle cases where scores are non-numeric
            if (isNaN(aScore)) aScore = Infinity;
            if (isNaN(bScore)) bScore = Infinity;

            return aScore - bScore;
          }

          const formattedData = rows.map((row, index) => {
            const golfers = [
              {
                name: row[1],
                score: scoresMap.get(row[1]) || "CUT",
              },
              {
                name: row[2],
                score: scoresMap.get(row[2]) || "CUT",
              },
              {
                name: row[3],
                score: scoresMap.get(row[3]) || "CUT",
              },
              {
                name: row[4],
                score: scoresMap.get(row[4]) || "CUT",
              },
              {
                name: row[5],
                score: scoresMap.get(row[5]) || "CUT",
              },
              {
                name: row[6],
                score: scoresMap.get(row[6]) || "CUT",
              },
            ];

            // Sort golfers array using the custom sorting function
            golfers.sort(customSortScore);

            return {
              id: index + 1,
              user: row[0],
              totalScore: golfers.reduce((total, golfer) => {
                return (
                  total +
                  (isNaN(golfer.score) ||
                  golfer.score === "CUT" ||
                  golfer.score === "WD" ||
                  golfer.score === "DQ"
                    ? 0
                    : parseInt(golfer.score))
                );
              }, 0),
              change: 0, // Placeholder, update as needed
              tiebreaker: row[7],
              golfers,
            };
          });

          // Calculate total scores
          formattedData.forEach((entry) => {
            entry.totalScore = entry.golfers.reduce((total, golfer) => {
              return total + (isNaN(golfer.score) ? 0 : parseInt(golfer.score));
            }, 0);
          });

          // Sort the data by totalScore (ascending order)
          formattedData.sort((a, b) => a.totalScore - b.totalScore);

          setLeaderboardData(formattedData);
        } else {
          throw new Error("Failed to fetch leaderboard data");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboardData();
  }, []);

  if (loading) {
    return <div className="text-center text-white"></div>;
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
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              compareUsers={compareUsers}
              setCompareUsers={setCompareUsers}
            />
          ))}
        </div>
        {compareUsers.length > 0 && (
          <div className="fixed bottom-16 left-0 right-0 bg-gray-800 p-4 flex justify-center space-x-4">
            <button
              onClick={() => setCompareUsers([])}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-300"
            >
              Clear Selection ({compareUsers.length})
            </button>
            <button
              onClick={() => setShowCompareModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300"
              disabled={compareUsers.length < 2}
            >
              Compare Selections
            </button>
          </div>
        )}
        {showCompareModal && (
          <CompareModal
            users={leaderboardData.filter((user) =>
              compareUsers.includes(user.id)
            )}
            closeModal={() => setShowCompareModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default GolfPoolLeaderboard;
