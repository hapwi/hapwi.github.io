// Utility to fetch JSON data
const fetchJSON = async (url) => {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Could not fetch from ${url}`);
    }
    return await response.json();

};



// Function to load weekly data
const loadWeekData = async (weekNumber, loggedInUser) => {
    try {
        const allWeeksData = await fetchJSON("weekly-data.json"); // Path can be adjusted
        const weekData = allWeeksData[`Week${weekNumber}`];
        const weekDataDiv = document.querySelector("#week-data tbody");

        const weekWinners = winners[weekNumber] || []; // Fetch the winners for the given week

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
            } else {
                weekDataDiv.innerHTML = "<tr><td colspan='2'>No data available for this user this week.</td></tr>";
            }
        } else {
            weekDataDiv.innerHTML = "<tr><td colspan='2'>Picks are not available yet for this week.</td></tr>";
        }
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
    }
};



document.addEventListener("DOMContentLoaded", async () => {
    const dropdown = document.getElementById("week-dropdown");
    const currentWeek = 5; // Default week, adjustable
    const loggedInUser = localStorage.getItem("loggedInUser") || "Guest";

    document.getElementById("username-display").textContent = loggedInUser;

    // Populate dropdown
    dropdown.innerHTML = Array.from({
        length: 18
    }, (_, i) => `<option value='${i + 1}'>Week ${i + 1}</option>`).join("");

    dropdown.value = currentWeek;
    loadWeekData(currentWeek, loggedInUser);

    // Event handlers
    dropdown.addEventListener("change", (e) => loadWeekData(e.target.value, loggedInUser));

    document.getElementById("logout-button").addEventListener("click", () => {
        localStorage.removeItem("loggedInUser");
        window.location.href = "../login/user-picks-login.html";
    });
});