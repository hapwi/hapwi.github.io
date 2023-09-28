class AppHeader extends HTMLElement {

    constructor() {
        super();
        // The template now directly modifies the innerHTML of the component
        this.innerHTML = /*html*/ `
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
        <link rel="stylesheet" href="../components/app-header.css">

        <header>
          <div class="header-container">
            <a class="logo" href="#">Logo</a>
            <div id="countdown-timer"></div>
            <a id="countdown-timer" href="../pickem/peindex.html"
              style="color:var(--link-white); text-decoration: none; margin-right:15px;">
              <i class="fa-solid fa-football"></i>
            </a>
        </header>
        `;
    }
}

const pageTitles = {
    "form": "Form",
    "leaderboard": "Leaderboard",
    "players": "Players",
    "entries": "Entries",
    "about-page": "About"
};

function setPageTitle() {
    const bodyId = document.body.getAttribute('id');
    const logo = document.querySelector(".logo");
    if (logo && pageTitles[bodyId]) {
        logo.textContent = pageTitles[bodyId];
    } else {
        logo.textContent = "Unknown";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    setPageTitle();
});

customElements.define('app-header', AppHeader);