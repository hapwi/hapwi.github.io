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

const version = '5.0.5';
// Define a function to set the version number dynamically
function setVersion(version) {
    // Create a new script element
    const script = document.createElement('script');

    // Set the source attribute with the version number
    script.src = `../login/winners.js?v=${version}`;

    // Append the script element to the HTML document
    document.head.appendChild(script);
}

setVersion(version);