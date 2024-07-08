import React, { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { ThemeContext } from "./themeContext";

const apiKey = "AIzaSyCTIOtXB0RDa5Y5gubbRn328WIrqHwemrc";
const spreadsheetId = "1zCKMy2jgG9QoIhxFqRviDm4oxEFK_ixv_tN66GmCXTc";

const fetchPlayers = async () => {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:B200?key=${apiKey}`
    );
    const data = await response.json();

    // Log the raw data for debugging
    console.log("Raw data from Google Sheets API:", data);

    if (data.error) {
      throw new Error(data.error.message);
    }

    const players = data.values
      .slice(1)
      .filter((row) => row[0] && row[1])
      .map(([name, score]) => ({
        name,
        score: score === "#VALUE!" || score === "0" ? "E" : score,
      }));

    // Log the processed player data
    console.log("Processed player data:", players);

    return players;
  } catch (error) {
    console.error("Error fetching players:", error);
    throw error;
  }
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
                <div className="col-span-9 sm:col-span-10 font-medium">
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
