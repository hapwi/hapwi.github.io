const fetch = require('node-fetch');

const apiKey = 'AIzaSyCTIOtXB0RDa5Y5gubbRn328WIrqHwemrc';
const spreadsheetId = '1iTNStqnadp4ZyR7MRkSmvX5WeialS4WST6Yy-Qv8Reo';

async function fetchGoogleSheetsData() {
  try {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Copy%20of%20Leaderboard!A1:Z?key=${apiKey}`);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    displayTable(data);
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
  }
}

function displayTable(data) { 
  const { values } = data;

  if (!values || values.length === 0) {
    console.log('No data found in the Google Sheet.');
    return;
  }

  console.log('Table Headers:', values[0]);
  console.log('Table Rows:');
  values.slice(1).forEach((row) => {
    console.log(row);
  });
}

fetchGoogleSheetsData();
