import React from "react";
import { useQuery } from "@tanstack/react-query";

const apiKey = "AIzaSyCTIOtXB0RDa5Y5gubbRn328WIrqHwemrc";
const spreadsheetId = "1zCKMy2jgG9QoIhxFqRviDm4oxEFK_ixv_tN66GmCXTc";

const fetchPlayers = async () => {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:B200?key=${apiKey}`
  );
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.values
    .slice(1)
    .filter((row) => row[0] && row[1])
    .map(([name, score]) => ({
      name,
      score: score === "#VALUE!" || score === "0" ? "E" : score,
    }));
};

const Players = () => {
  const {
    data: players,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["players"],
    queryFn: fetchPlayers,
    refetchInterval: 60000, // Refetch every minute
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white">Loading players...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      <div className="max-w-2xl mx-auto px-4 pb-28">
        <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-700">
          <div className="divide-y divide-gray-700">
            {players.map((player, index) => (
              <div
                key={index}
                className="grid grid-cols-12 items-center py-3 px-4 hover:bg-gray-750"
              >
                <div className="col-span-9 sm:col-span-10 font-medium">
                  <span className="text-white text-sm sm:text-base">
                    {player.name}
                  </span>
                </div>
                <div className="col-span-3 sm:col-span-2 text-right font-bold text-lg sm:text-xl text-emerald-400">
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
