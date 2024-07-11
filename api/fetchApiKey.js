const fetch = require("node-fetch");

module.exports = async (req, res) => {
  const apiKey = process.env.API_KEY;
  const spreadsheetId = process.env.LEADERBOARD_SHEET_ID;

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:B200?key=${apiKey}`
    );
    const data = await response.json();

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

    res.status(200).json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
