export function formatWeekData(userWeekData) {
    const weekDataDiv = document.getElementById('week-data').querySelector('tbody');

    if (userWeekData) {
        const pickList = userWeekData.picks.map((pick, index) => `<tr><td>Pick ${index + 1}</td><td>${pick}</td></tr>`).join('');
        weekDataDiv.innerHTML = `
            ${pickList}
            <tr><td>Tiebreaker</td><td>${userWeekData.tiebreaker}</td></tr>
        `;
    } else {
        weekDataDiv.innerHTML = '<tr><td colspan="2">No data available for this week.</td></tr>';
    }
}

export function findUserWeekData(weekData, loggedInUser) {
    return weekData.find(user => user.username === loggedInUser);
}