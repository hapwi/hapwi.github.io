// maintenance 

/* in order to get maintance screen date needs to be on or before current date */



{
    if (new Date() >= new Date("07/01/22 9:00")) {
      location.href = 'http://www.golf.contact/beback.html';
    } else{
      location.href = 'http://www.golf.contact/';
    }
  
  
  }