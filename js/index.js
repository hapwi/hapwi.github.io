// lock submissions until tournament start
{


  if (new Date() >= new Date("Thu Jul 28 2022 9:00")) {

    document.getElementById("link92").innerHTML += " <a href='../subs.html' class='menu__link r-link'>Entries</a>";

  } else {

    document.getElementById("link92").innerHTML += "Submissions (Locked)";
  }
}

// lock form when tournament starts
{
  if (new Date() >= new Date("Thu Jul 28 2022 9:00")) {

    document.getElementById("time92").innerHTML += "Form (Locked)";

  } else {

    document.getElementById("time92").innerHTML += " <a href='../form.html' class='menu__link r-link'>Form</a>";
  }
}

// maintenance 

/* in order to get maintance screen date needs to be on or before current date */



{
  if (new Date() >= new Date("07/21/22 9:00")) {
    location.href = 'http://www.golf.contact/beback.html';
  } 


}
