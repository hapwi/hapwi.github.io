const apiKey = 'AIzaSyCTIOtXB0RDa5Y5gubbRn328WIrqHwemrc';
const spreadsheetId = '1iTNStqnadp4ZyR7MRkSmvX5WeialS4WST6Yy-Qv8Reo'; //? leaderboard api
const spreadsheetId2 = '1_bP0NUG6XqrF0XQvKXNm3b07QuHABfvWotsemGToyYg'; //? entires api
const spreadsheetId3 = '1zCKMy2jgG9QoIhxFqRviDm4oxEFK_ixv_tN66GmCXTc'; //? players api

// ! function to get the leaderboard data
async function fetchGoogleSheetsData() {
    try {
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Copy%20of%20Leaderboard!A1:Z?key=${apiKey}`
        );
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);

        }

        displayTable(data);
    } catch (error) {
        console.error('Error fetching Google Sheets data:', error);
    }
}

// ! function to display the leaderboard data
function displayTable(data) {
    const {
        values
    } = data;

    if (!values || values.length === 0) {
        console.log('No data found in the Google Sheet.');
        return;
    }



    const table = document.querySelector('#main-table'); // Select the main table directly
    table.innerHTML = ''; // Clear the existing contents of the table
    table.classList.add('table', 'table-striped', 'table-bordered');

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    values[0].forEach((header) => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    values.slice(1).forEach((row, rowIndex) => { // Added rowIndex
        const tableRow = document.createElement('tr');
        tableRow.classList.add('align-items-center', 'rounded-row');
        let playerName = null; // Initialize a variable to store the player's name

        row.forEach((cell, index) => {
            const td = document.createElement('td');

            if (index === 0) {
                playerName = cell; // Store the player's name
                const div = document.createElement('div');
                div.textContent = cell;
                div.style.overflow = 'hidden';
                div.style.textOverflow = 'ellipsis';
                div.style.whiteSpace = 'nowrap';
                div.style.display = 'block'; // Ensure the div takes the width restriction into account
                div.style.maxWidth = '100%'; // Set a maximum width for the div
                div.style.paddingLeft = '15px'; // Add padding to the left of the div
                if (rowIndex % 2 === 0) {
                    // For even rows (including the first one), set the text color to black
                    div.style.color = 'white';
                } else {
                    // For odd rows, set the text color to white
                    div.style.color = 'black';
                }
                td.style.verticalAlign = 'middle'; // Apply vertical alignment to the cell
                td.appendChild(div); // Add the div to the cell
            } else if (index === 1) { // second column
                const scoreDiv = document.createElement('div');
                scoreDiv.textContent = cell;
                scoreDiv.style.width = '50px'; // Set a fixed width for the div containing the score
                scoreDiv.style.textAlign = 'right'; // Align the text to the right
                scoreDiv.style.paddingRight = '15px'; // Add padding to the right of the div
                if (rowIndex % 2 === 0) {
                    // For even rows (including the first one), set the text color to black
                    scoreDiv.style.color = 'white';
                } else {
                    // For odd rows, set the text color to white
                    scoreDiv.style.color = 'black';
                }

                const buttonDiv = document.createElement('div');
                const button = document.createElement('button');
                button.textContent = 'Picks';
                button.classList.add('custom-button'); // Add margin to the right of the button
                button.addEventListener('click', (event) => {
                    console.log(
                        'Picks button clicked!'); // This will log to the console when the button is clicked.
                    showPlayerPicks(event, playerName); // Pass the player's name as an argument
                });
                buttonDiv.appendChild(button);

                td.classList.add('d-flex', 'justify-content-end',
                    'align-items-center'); // Add Bootstrap classes for alignment and spacing
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
    // Replace the table inside the responsive div
    document.querySelector('.table-responsive').replaceWith(table);
}

// ! function to show the player's picks
async function showPlayerPicks(event, playerName) {
    event.preventDefault();

    try {
        const response1 = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId2}/values/Sheet1!A1:K?key=${apiKey}`);
        const data1 = await response1.json();
        const response2 = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId2}/values/PicksScores!A2:B1000?key=${apiKey}`
        );
        const data2 = await response2.json();

        if (data1.error) {
            throw new Error(data1.error.message);
        }

        if (data2.error) {
            throw new Error(data2.error.message);
        }

        const golferScores = {};
        data2.values.forEach(([golferName, golferScore]) => {
            golferScores[golferName] = golferScore;
        });

        displayPlayerPicks(data1, golferScores, playerName);
    } catch (error) {
        console.error('Error fetching Google Sheets data:', error);
    }
}

// //comment out function below before tournament starts so the picks button does not work 
//! function to display the player's picks inside the picks button
function displayPlayerPicks(data1, golferScores, playerName) {
    //! Set the date and time when the button should start working
    const desiredDate = new Date("02/05/2024 8:00 AM MST"); //? Adjust this to your desired date and time

    // Get the current date and time
    const now = new Date();

    // If the current date and time is before the desired date and time, return early
    if (now < desiredDate) {
        return;
    }
    const {
        values: values1
    } = data1;

    if (!values1 || values1.length === 0) {
        console.log('No data found in the Google Sheet.');
        return;
    }

    const playerRow = values1.find((row) => row[0] === playerName);

    if (!playerRow) {
        console.log('No picks found for player:', playerName);
        return;
    }

    const golferNames = playerRow.slice(1, 7);

    const picksTable = document.getElementById('picks-table');
    picksTable.innerHTML = '';
    //test
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const th1 = document.createElement('th');
    th1.textContent = 'Golfer';
    // th1.style.textAlign = 'center';
    const th2 = document.createElement('th');
    th2.textContent = 'Score';
    th2.style.textAlign = 'center';
    headerRow.appendChild(th1);
    headerRow.appendChild(th2);
    thead.appendChild(headerRow);
    picksTable.appendChild(thead);

    const tbody = document.createElement('tbody');

    golferNames.forEach((golferName) => {
        const score = golferScores[golferName] || 'N/A'; // If the golfer's score is not found, display 'N/A'

        const tableRow = document.createElement('tr');
        const td1 = document.createElement('td');
        // td1.style.textAlign = 'center';
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

fetchGoogleSheetsData();