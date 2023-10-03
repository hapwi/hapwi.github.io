document.addEventListener("DOMContentLoaded", async () => {
    // Populate week dropdown
    const dropdown = document.getElementById("week-dropdown");
    const currentWeek = 1; // Change this to your desired current week

    // Clear existing options in the dropdown
    dropdown.innerHTML = "";

    for (let i = 1; i <= 18; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = `Week ${i}`;
        dropdown.appendChild(option);
    }

    // Set the selected option to the new current week
    dropdown.value = currentWeek;




    // Display username
    const loggedInUser = localStorage.getItem("loggedInUser");
    document.getElementById("username-display").textContent = loggedInUser;

    // Function to load week data
    const loadWeekData = async (weekNumber) => {
        const response = await fetch("weekly-data.json"); // Adjust the path as needed
        const allWeeksData = await response.json();

        if (!allWeeksData[`Week${weekNumber}`]) {
            // Display a message when no data is found for the week
            const weekDataDiv = document.getElementById("week-data").querySelector("tbody");
            weekDataDiv.innerHTML = '<tr><td colspan="2">No data available for this week.</td></tr>';
            return;
        }

        const weekData = allWeeksData[`Week${weekNumber}`];
        const userData = weekData.find(user => user.username === loggedInUser);
        const weekDataDiv = document.getElementById("week-data").querySelector("tbody");

        if (userData) {
            const pickList = userData.picks.map((pick, index) => `<tr><td>Pick ${index + 1}</td><td>${pick}</td></tr>`).join('');
            weekDataDiv.innerHTML = `
            ${pickList}
            <tr><td>Tiebreaker</td><td>${userData.tiebreaker}</td></tr>
        `;
        } else {
            // Display a message when no data is found for the user
            weekDataDiv.innerHTML = '<tr><td colspan="2">No data available for this user in this week.</td></tr>';
        }
    };



    // Initial load with default week (Week 1)
    loadWeekData(currentWeek);

    // Dropdown change event
    dropdown.addEventListener("change", (e) => {
        const selectedWeek = e.target.value;
        loadWeekData(selectedWeek);
    });

    // Logout functionality
    document.getElementById("logout-button").addEventListener("click", () => {
        localStorage.removeItem("loggedInUser");
        window.location.href = "../login/user-picks-login.html";
    });
});