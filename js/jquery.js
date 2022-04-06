$(document).keydown(function (e) {
  var key = e.key;
  if (key == 116) {
    // if the user pressed 't':
    if (!$("body").hasClass(".info-panel"))
      $("body").addClass(".info-panel").css("opacity", "0");
    else $("body").removeClass(".info-panel").css("opacity", "1");
  }
});
