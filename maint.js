// maintenance

/* in order to get maintance screen date needs to be on or before current date */

{
  if (new Date() >= new Date("03/31/23 9:00 MST")) {
    location.href = "beback.html";
  }
}
