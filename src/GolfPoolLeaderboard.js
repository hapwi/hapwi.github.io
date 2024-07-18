import React, { useState, useMemo, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { ThemeContext } from "./themeContext"; // Import ThemeContext
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Constants
const UNLOCK_DATE = new Date("2024-07-18T01:35:00-04:00");

const fetchLeaderboardData = async () => {
  const response = await fetch(
    "https://servergolfpoolapi.vercel.app/leaderboard-data"
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error("There is no data available at this time.");
  }
  return data;
};

const displayScore = (score) => {
  if (score === "#VALUE!" || score === 0 || score === "0") return "E";
  return score;
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
      <span className={`ml-2 text-xs ${color}`}>
        {`${arrow} ${changeValue}`}
      </span>
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
            {entry.position}
          </div>
          <div className="col-span-8 sm:col-span-9 font-medium text-left pl-2 flex items-center">
            <span className={`${theme.text} text-lg sm:text-xl flex-grow`}>
              {entry.user}
            </span>
            {renderChangeIndicator()}
          </div>
          <div
            className={`col-span-2 sm:col-span-1 text-right font-bold text-lg sm:text-xl ${theme.scoreText}`}
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
          message={`This feature will be available on ${new Intl.DateTimeFormat(
            "en-US",
            {
              timeZone: "America/New_York",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            }
          ).format(UNLOCK_DATE)} EST.`}
          onClose={() => setShowPopup(false)}
        />
      )}
    </>
  );
};


const GolfPoolLeaderboard = () => {
  const theme = useContext(ThemeContext);
  const [expandedIds, setExpandedIds] = useState([]);

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
    return (
      <div
        className={`min-h-screen ${theme.background} flex items-center justify-center`}
      >
        <div className="max-w-4xl mx-auto px-4 pb-28 w-full">
          <SkeletonTheme
            baseColor={theme.skeletonBase}
            highlightColor={theme.skeletonHighlight}
          >
            <div
              className={`${theme.cardBackground} rounded-lg overflow-hidden border ${theme.cardBorder} p-4`}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 19].map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 items-center py-3 px-4 border-b-[1px] pt-4"
                >
                  <div className="col-span-9 sm:col-span-10 flex items-center font-medium">
                    <div className="h-12 w-12 rounded-full overflow-hidden mr-3">
                      <Skeleton circle={true} height={48} width={48} />
                    </div>
                    <Skeleton width="80%" height={20} />
                  </div>
                  <div className="col-span-3 sm:col-span-2 text-right font-bold text-lg sm:text-xl">
                    <Skeleton width="50%" height={20} />
                  </div>
                </div>
              ))}
            </div>
          </SkeletonTheme>
        </div>
      </div>
    );
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
