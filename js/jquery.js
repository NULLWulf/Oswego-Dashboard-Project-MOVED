$(document).ready(function () {
  var width = $(window).width();
  if (width < 767) {
    alert(
      "Not currently optimized for mobile devices" +
        "\nuse on Ipad Mini size or higher"
    );
  }
});
