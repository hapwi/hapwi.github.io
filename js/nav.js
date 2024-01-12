document.addEventListener("DOMContentLoaded", function() {
    // Load the navigation
    fetch('bottom-nav.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('bottom-nav-placeholder').innerHTML = html;

            // Define your page-button mappings
            const pageButtonMap = {
                "/index.html": "btn-leaderboard",
                "/players.html": "btn-players",
                "/entries.html": "btn-entries",
                "/form.html": "btn-form"
            };

            // Get the current pathname
            const currentPage = window.location.pathname;

            // Find the corresponding button for the current page
            const activeButtonId = pageButtonMap[currentPage];
            if (activeButtonId) {
                document.getElementById(activeButtonId).classList.add("active-button");
            }

            // Attach click event listeners to buttons for navigation
            document.querySelectorAll('.navigation-button').forEach(button => {
                button.addEventListener('click', function() {
                    window.location.href = this.getAttribute('data-href');
                });
            });

            console.log("Current page:", currentPage);
            console.log("Active Button ID:", activeButtonId);
        })
        .catch(error => console.error('Error loading bottom navigation:', error));
});