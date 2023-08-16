const toggleButton = document.getElementById('toggleDarkMode');

if (toggleButton) { // Ensure the button exists before adding the event listener
    toggleButton.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            toggleButton.innerHTML = '<i class="far fa-sun"></i>';
        } else {
            toggleButton.innerHTML = '<i class="far fa-moon"></i>';
        }
    });
}