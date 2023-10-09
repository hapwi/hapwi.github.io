document.addEventListener("DOMContentLoaded", () => {
    const loggedInUser = localStorage.getItem('loggedInUser');

    // Function to handle login menu item click
    function handleLoginItemClick(e) {
        e.preventDefault();
        if (loggedInUser) {
            window.location.href = "../login/username.html";
        } else {
            window.location.href = "../login/user-picks-login.html";
        }
    }

    // Add event listener only to the login menu item
    const loginMenuItem = document.getElementById('menu-item-login');

    if (loginMenuItem) {
        loginMenuItem.addEventListener('click', handleLoginItemClick);
    }
});

function loadWinnersScript() {
    const scriptElement = document.createElement('script');
    scriptElement.src = '../login/winners.js';
    document.head.appendChild(scriptElement);
}

loadWinnersScript();