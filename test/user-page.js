import {
    formatWeekData,
    findUserWeekData
} from './utils.js'; // Utility functions to keep the code DRY

document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.getElementById('week-dropdown');
    populateWeekDropdown(dropdown);
    handleWeekDropdownChange(dropdown);
    displayLoggedInUser();
    handleLogout();
});

function populateWeekDropdown(dropdown) {
    for (let i = 1; i <= 18; i++) {
        const option = new Option(`Week ${i}`, i);
        dropdown.add(option);
    }
    dropdown.addEventListener('change', (e) => {
        loadWeekData(e.target.value).catch(err => console.error(err));
    });
    loadWeekData(1).catch(err => console.error(err)); // Initial data load
}

async function loadWeekData(weekNumber) {
    try {
        const response = await fetch('weekly-data.json');
        if (!response.ok) throw new Error('Failed to fetch weekly data');

        const allWeeksData = await response.json();
        const weekData = allWeeksData[`Week${weekNumber}`];
        const loggedInUser = localStorage.getItem('loggedInUser');

        const userWeekData = findUserWeekData(weekData, loggedInUser);
        formatWeekData(userWeekData);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

function displayLoggedInUser() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        document.getElementById('username-display').textContent = loggedInUser;
    } else {
        window.location.href = 'user-picks-login.html';
    }
}

function handleLogout() {
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'user-picks-login.html';
    });
}

function handleWeekDropdownChange(dropdown) {
    dropdown.addEventListener('change', (e) => {
        loadWeekData(e.target.value).catch(err => console.error(err));
    });
}