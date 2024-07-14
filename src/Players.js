import React, { useContext } from "react";
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

  if (isLoading) {
    return (
      <div
        className={`min-h-screen ${theme.background} flex items-center justify-center`}
      >
        <div className={theme.text}></div>
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
