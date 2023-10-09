const scriptHash = 'WEEK-5'; // Replace this with the hash whenever winners.js changes
const localStorageKey = `winners.js-${scriptHash}`;

async function loadWinnersScript() {
    let scriptContent = localStorage.getItem(localStorageKey);

    if (!scriptContent) {
        const response = await fetch('../login/winners.js');
        if (!response.ok) {
            throw new Error('Failed to fetch winners.js');
        }
        scriptContent = await response.text();
        localStorage.setItem(localStorageKey, scriptContent);
    }

    const scriptElement = document.createElement('script');
    scriptElement.textContent = scriptContent;
    document.head.appendChild(scriptElement);
}

// Wrap your existing DOMContentLoaded logic in an async function so we can await loadWinnersScript()
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await loadWinnersScript();
    } catch (error) {
        console.error('Error loading winners.js:', error);
    }

    const loggedInUser = localStorage.getItem('loggedInUser');

    function handleLoginItemClick(e) {
        e.preventDefault();
        if (loggedInUser) {
            window.location.href = "../login/username.html";
        } else {
            window.location.href = "../login/user-picks-login.html";
        }
    }

    const loginMenuItem = document.getElementById('menu-item-login');

    if (loginMenuItem) {
        loginMenuItem.addEventListener('click', handleLoginItemClick);
    }
});