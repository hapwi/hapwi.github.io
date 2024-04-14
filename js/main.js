const apiKey = 'AIzaSyCTIOtXB0RDa5Y5gubbRn328WIrqHwemrc';
const spreadsheetId = '1iTNStqnadp4ZyR7MRkSmvX5WeialS4WST6Yy-Qv8Reo'; //? leaderboard api
const spreadsheetId2 = '1_bP0NUG6XqrF0XQvKXNm3b07QuHABfvWotsemGToyYg'; //? entires api
const spreadsheetId3 = '1zCKMy2jgG9QoIhxFqRviDm4oxEFK_ixv_tN66GmCXTc'; //? players api

// Function to fetch data from Google Sheets
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
        console.error('Error fetching Google Sheets data:', error);
        return null;
    }
}

// Function to display the leaderboard data
async function displayLeaderboard() {
        const leaderboardData = await fetchGoogleSheetsData(spreadsheetId, 'Copy%20of%20Leaderboard!A1:Z');

    if (!leaderboardData) {
        console.log('No data found in the Google Sheet.');
        return;
    }

    const table = document.querySelector('#main-table');
    table.innerHTML = '';
    table.classList.add('table', 'table-striped', 'table-bordered');

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    leaderboardData[0].forEach((header) => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    leaderboardData.slice(1).forEach((row, rowIndex) => {
        const tableRow = document.createElement('tr');
        tableRow.classList.add('align-items-center', 'rounded-row');
        let playerName = null;

        row.forEach((cell, index) => {
            const td = document.createElement('td');

            if (index === 0) {
                playerName = cell;
                const div = document.createElement('div');
                div.textContent = cell;
                div.style.overflow = 'hidden';
                div.style.textOverflow = 'ellipsis';
                div.style.whiteSpace = 'nowrap';
                div.style.display = 'block';
                div.style.maxWidth = '100%';
                div.style.paddingLeft = '15px';
                div.style.color = rowIndex % 2 === 0 ? 'white' : 'white';
                td.style.verticalAlign = 'middle';
                td.appendChild(div);
                }
                else if (index === 1) {
                const scoreDiv = document.createElement('div');
                scoreDiv.textContent = cell;
                scoreDiv.style.width = '50px';
                scoreDiv.style.textAlign = 'right';
                scoreDiv.style.paddingRight = '15px';
                scoreDiv.style.color = rowIndex % 2 === 0 ? 'white' : 'white';

                const buttonDiv = document.createElement('div');
                const button = document.createElement('button');
                button.textContent = 'Picks';
                button.classList.add('custom-button');
                button.addEventListener('click', (event) => {
                    console.log('Picks button clicked!');
                    showPlayerPicks(event, playerName);
                });
                buttonDiv.appendChild(button);

                td.classList.add('d-flex', 'justify-content-end', 'align-items-center');
                td.appendChild(buttonDiv);
                td.appendChild(scoreDiv);
            } else {
                td.textContent = cell;
            }

            tableRow.appendChild(td);
        });

        tbody.appendChild(tableRow);
    });

    table.appendChild(tbody);
    document.querySelector('.table-responsive').replaceWith(table);
}

// Function to show the player's picks
async function showPlayerPicks(event, playerName) {
    event.preventDefault();

    const entriesData = await fetchGoogleSheetsData(spreadsheetId2, 'Sheet1!A1:K');
    const picksScoresData = await fetchGoogleSheetsData(spreadsheetId2, 'PicksScores!A2:B1000');

    if (!entriesData || !picksScoresData) {
        console.error('Error fetching Google Sheets data.');
        return;
    }

    const golferScores = Object.fromEntries(picksScoresData);
    displayPlayerPicks(entriesData, golferScores, playerName);
}

// Function to display the player's picks inside the picks button
function displayPlayerPicks(entriesData, golferScores, playerName) {
    const desiredDate = new Date("04/11/2024 7:30 AM MST");
    const now = new Date();
    if (now < desiredDate) {
        return;
    }

    const playerRow = entriesData.find((row) => row[0] === playerName);

    if (!playerRow) {
        console.log('No picks found for player:', playerName);
        return;
    }

    const golferNames = playerRow.slice(1, 7);

    const picksTable = document.getElementById('picks-table');
    picksTable.innerHTML = '';
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const th1 = document.createElement('th');
    th1.textContent = 'Golfer';
    const th2 = document.createElement('th');
    th2.textContent = 'Score';
    th2.style.textAlign = 'center';
    headerRow.appendChild(th1);
    headerRow.appendChild(th2);
    thead.appendChild(headerRow);
    picksTable.appendChild(thead);

    const tbody = document.createElement('tbody');

    golferNames.forEach((golferName) => {
        const score = golferScores[golferName] || 'N/A';

        const tableRow = document.createElement('tr');
        const td1 = document.createElement('td');
        td1.textContent = golferName;
        const td2 = document.createElement('td');
        td2.textContent = score;
        td2.style.textAlign = 'center';
        tableRow.appendChild(td1);
        tableRow.appendChild(td2);
        tbody.appendChild(tableRow);
    });

    picksTable.appendChild(tbody);

    $('#picksModal').modal('show');
}
document.getElementById('close-picks').addEventListener('click', () => {
    document.getElementById('player-picks').style.display = 'none';
});

displayLeaderboard();