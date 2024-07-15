import React, { useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ThemeContext } from "./themeContext";

const fetchPlayers = async () => {
  const response = await fetch("https://servergolfpoolapi.vercel.app/players");
  const data = await response.json();
  if (!response.ok) {
    throw new Error("Failed to fetch players data");
  }
  return data;
};

const Players = () => {
  const theme = useContext(ThemeContext);

  const {
    data: players,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["players"],
    queryFn: fetchPlayers,
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (!isLoading && players) {
    }
  }, [isLoading, players]);

  if (isLoading) {
    return (
      <div
        className={`min-h-screen ${theme.background} flex items-center justify-center`}
      >
        <button
          type="button"
          className="bg-indigo-500 text-white font-bold py-2 px-4 rounded inline-flex items-center"
          disabled
        >
          <svg
            className="animate-spin h-5 w-5 mr-3 text-white"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </button>
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
          <div>
            {players.map((player, index) => (
              <div
                key={index}
                className={`grid grid-cols-12 items-center py-3 px-4 border-b-[1px] ${theme.cardBorder}`}
              >
                <div className="col-span-9 sm:col-span-10 flex items-center font-medium">
                  <div className="h-12 w-12 rounded-full overflow-hidden mr-3">
                    <img
                      className="h-full w-full object-cover"
                      src={player.imageUrl}
                      alt={`${player.name}'s avatar`}
                    />
                  </div>
                  <span className={`${theme.text} text-sm sm:text-base`}>
                    {player.name}
                  </span>
                </div>
                <div
                  className={`col-span-3 sm:col-span-2 text-right font-bold text-lg sm:text-xl ${theme.scoreText}`}
                >
                  {player.score}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Players;
