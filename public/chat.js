$(function () {
  let socket = io();
  $("form").submit(function (e) {
    e.preventDefault();
    socket.emit("new-message", $("#msg").val());
    $("#msg").val("");
    return false;
  });

  socket.on("new-message", function (data) {
    $("#messages").append($("<li>").text(`${data.username} : ${data.message}`));
  });
});
