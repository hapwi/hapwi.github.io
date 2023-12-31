//! Include your header.html file
$("body").prepend('<div id="header-placeholder"></div>');
$("#header-placeholder").load("header.html", function () {
    setPageTitle();
});

//! Include your bottom-nav.html file
$("body").prepend('<div id="bottom-nav-placeholder"></div>');
$("#bottom-nav-placeholder").load("bottom-nav.html", function () {
    setActiveNavItem();

    // Get all the menu items
    var menuItems = $("#pillNav2 .nav-item a");

    // Add event listener to each menu item
    menuItems.each(function () {
        $(this).on('click', function () {
            // Remove active class from all menu items
            menuItems.removeClass('active');

            // Add active class to the clicked item
            $(this).addClass('active');
        });
    });
});

//! Set the active navigation item based on the body's ID
function setActiveNavItem() {
    var bodyId = $('body').attr('id');

    // Remove active class from all navigation items
    $("#pillNav2 .nav-item a").removeClass('active');

    switch (bodyId) {
        case "form":
            $("#menu-item-4").addClass('active');
            break;
        case "leaderboard":
            $("#menu-item-1").addClass('active');
            break;
        case "players":
            $("#menu-item-2").addClass('active');
            break;
        case "entries":
            $("#menu-item-3").addClass('active');
            break;
            // Add more cases for other pages
    }
}

//! Set the page title
function setPageTitle() {
    var pageTitle;
    var bodyId = $('body').attr('id');

    switch (bodyId) {
        case "form":
            pageTitle = "FORM";
            break;
        case "leaderboard":
            pageTitle = "LEADERBOARD";
            break;
        case "players":
            pageTitle = "PLAYERS";
            break;
        case "entries":
            pageTitle = "ENTRIES";
            break;
        case "about-page":
            pageTitle = "ABOUT";
            break;
            // Add more cases for other pages
        default:
            pageTitle = "Unknown";
    }

    var logo = $(".logo");
    logo.text(pageTitle);
}