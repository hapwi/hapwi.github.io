document.addEventListener("DOMContentLoaded", () => {
    const loggedInUser = localStorage.getItem('loggedInUser');

    // Function to handle login menu item click
    function handleLoginItemClick(e) {
        e.preventDefault();
        if (loggedInUser) {
            window.location.href = "../login/username.html";
        } else {
            window.location.href = e.target.getAttribute('href');
        }
    }

    // Add event listener only to the login menu item
    const loginMenuItem = document.getElementById('menu-item-login');

    if (loginMenuItem) {
        loginMenuItem.addEventListener('click', handleLoginItemClick);
    }
});