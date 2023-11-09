
function incrementVersion(currentVersion) {
    let [major, minor, patch] = currentVersion.split('.').map(Number);

    patch++;
    if (patch >= 10) {
        patch = 0;
        minor++;
    }
    if (minor >= 10) {
        minor = 0;
        major++;
    }

    return `${major}.${minor}.${patch}`;
}

document.addEventListener('DOMContentLoaded', () => {
    // Increment the version and return the updated version string
  

    // Load the script with updated version
    function loadScript(version) {
        const script = document.createElement('script');
        script.src = `../login/winners.js?v=${version}`;
        script.onload = function() {
            initializeApp();
        };
        document.body.appendChild(script);
    }

    // Get and update the version
    let version = localStorage.getItem('version') || '1.0.0';
    version = incrementVersion(version);
    localStorage.setItem('version', version);

    // Load the winners script
    loadScript(version);
});



// Utility to fetch JSON data
const fetchJSON = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Could not fetch from ${url}`);
    }
    return await response.json();
};


    

// Function to update count of green highlighted items
const updateHighlightCount = (weekDataDiv, countSpan) => {
    const highlightedRows = weekDataDiv.querySelectorAll('tr');
    let count = 0;

    highlightedRows.forEach((row) => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.some((cell) => cell.style.color === "green")) {
            count++;
        }
    });

    countSpan.style.fontSize = '1.5rem';
    countSpan.style.color = 'white';
    countSpan.style.fontWeight = 'bold';
    countSpan.style.marginLeft = '1rem';

    countSpan.textContent = `  ${count} correct`;
};

// Function to load weekly data
const loadWeekData = async (weekNumber, loggedInUser, weekDataDiv, countSpan) => {
    
    let jsonVersion = localStorage.getItem('jsonVersion') || '1.0.0';
    jsonVersion = incrementVersion(jsonVersion);
    localStorage.setItem('jsonVersion', jsonVersion);
    console.log("json version:" , jsonVersion);

    try {
        const allWeeksData = await fetchJSON(`../login/weekly-data.json?v=${jsonVersion}`);
        const weekData = allWeeksData[`Week${weekNumber}`];

        const weekWinners = winners[weekNumber] || [];

        if (weekData) {
            const userData = weekData.find((user) => user.username === loggedInUser);

            if (userData) {
                let pickList = '';
                for (let idx = 0; idx < userData.picks.length; idx++) {
                    let pick = userData.picks[idx];
                    let isWinner = weekWinners.includes(pick) ? 'style="color: green;"' : '';
                    pickList += `<tr><td ${isWinner}>${idx + 1}</td><td ${isWinner}>${pick}</td></tr>`;
                }
                weekDataDiv.innerHTML = `${pickList}<tr><td>Tiebreaker</td><td>${userData.tiebreaker}</td></tr>`;
                updateHighlightCount(weekDataDiv, countSpan);
                return;
            } else {
                weekDataDiv.innerHTML = "<tr><td colspan='2'>No data available for this user this week.</td></tr>";
            }
        } else {
            weekDataDiv.innerHTML = "<tr><td colspan='2'>Picks are not available yet for this week.</td></tr>";
        }

        // If function reaches here, then there's no data for the selected week or user.
        // Reset the highlight count to 0.
        countSpan.textContent = '';
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
    }
};


function initializeApp() {
    const dropdown = document.getElementById("week-dropdown");
    const currentWeek = 10;
    const loggedInUser = localStorage.getItem("loggedInUser") || "Guest";
    const weekDataDiv = document.querySelector("#week-data tbody");
    const countSpan = document.createElement("span");
    countSpan.id = "highlighted-count";

    document.getElementById("username-display").textContent = loggedInUser;
    document.getElementById("username-display").appendChild(countSpan);

    dropdown.innerHTML = Array.from({
        length: 18
    }, (_, i) => `<option value='${i + 1}'>Week ${i + 1}</option>`).join("");

    dropdown.value = currentWeek;
    loadWeekData(currentWeek, loggedInUser, weekDataDiv, countSpan);

    dropdown.addEventListener("change", (e) => loadWeekData(e.target.value, loggedInUser, weekDataDiv, countSpan));

    document.getElementById("logout-button").addEventListener("click", () => {
        localStorage.removeItem("loggedInUser");
        window.location.href = "../login/user-picks-login.html";
    });
}


