// lock submissions until tournament start
{


  if (new Date() >= new Date("08/11/22 9:00")) {

    document.getElementById("link92").innerHTML += " <a href='../subs.html' class='menu__link r-link'>Entries</a>";

  } else {

    document.getElementById("link92").innerHTML += "Entries (Locked)";
  }
}

// lock form when tournament starts
{
  if (new Date() >= new Date("07/28/22 9:00")) {

    document.getElementById("time92").innerHTML += "Form (Locked)";

  } else {

    document.getElementById("time92").innerHTML += " <a href='../form.html' class='menu__link r-link'>Form</a>";
  }
}


