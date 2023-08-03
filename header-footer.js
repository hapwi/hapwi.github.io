 // Include your header.html file
 $("body").prepend('<div id="header-placeholder"></div>');
 $("#header-placeholder").load("header.html", function () {
     setPageTitle();
 });

 // Include your bottom-nav.html file
 $("body").prepend('<div id="bottom-nav-placeholder"></div>');
 $("#bottom-nav-placeholder").load("bottom-nav.html");

 function setPageTitle() {
     var pageTitle;
     var bodyId = $('body').attr('id');

     switch (bodyId) {
         case "form":
             pageTitle = "Form";
             break;
         case "about-page":
             pageTitle = "About";
             break;
             // Add more cases for other pages
         default:
             pageTitle = "Unknown";
     }

     var logo = document.querySelector(".logo");
     logo.textContent = pageTitle;
 }