import React, { useState, useEffect } from "react";

const apiKey = "AIzaSyCTIOtXB0RDa5Y5gubbRn328WIrqHwemrc";
const spreadsheetId = "1zCKMy2jgG9QoIhxFqRviDm4oxEFK_ixv_tN66GmCXTc";

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchGoogleSheetsData() {
      setLoading(true);
      try {
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:B200?key=${apiKey}`
        );
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message);
        }

        setPlayers(data.values || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGoogleSheetsData();
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
            <div className="col-span-9 sm:col-span-10 text-left pl-2">
              Player
            </div>
            <div className="col-span-3 sm:col-span-2 text-right">Score</div>
          </div>
          {players.map((player, index) => (
            <div
              key={index}
              className="grid grid-cols-12 items-center py-3 px-2 sm:px-4 border-b border-gray-700 hover:bg-gray-750"
            >
              <div className="col-span-9 sm:col-span-10 font-medium text-left pl-2">
                <span className="text-white text-sm sm:text-base">
                  {player[0]}
                </span>
              </div>
              <div className="col-span-3 sm:col-span-2 text-right font-bold text-lg sm:text-xl text-emerald-400">
                {player[1]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Players;
