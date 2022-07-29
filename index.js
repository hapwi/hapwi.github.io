// lock submissions until tournament start
{


  if (new Date() >= new Date("Thu Jul 28 2022 9:00")) {

    document.getElementById("link").innerHTML += "<a href='subs.html'>Submissions</a>";

  } else {

    document.getElementById("link").innerHTML += "Submissions (Locked)";
  }
}

// lock form when tournament starts
{
  if (new Date() >= new Date("Thu Jul 28 2022 9:00")) {

    document.getElementById("time").innerHTML += "Form (Locked)";

  } else {

    document.getElementById("time").innerHTML += "<a href='form.html'>Form</a>";
  }
}

// maintenance 

/* in order to get maintance screen date needs to be on or before current date */

{

  {
    if (new Date() >= new Date("07/30/22 9:00")) {
      location.href = 'http://golfpooll.herokuapp.com/beback.html';


    } else {
      location.href = 'http://golfpooll.herokuapp.com';

    }
  }


} 