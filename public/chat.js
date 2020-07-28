$(function () {
  let socket = io();
  let messages = $("#messages");
  let username = $("#username");
  let changeUsername = $("#change-username");
  let activity = $("#activity");
  let onlineUsers = $("#online-users");
  let notification = $("#notification");

  let timer;

  function clearTimer() {
    clearTimeout(timer);
  }

  // send new message
  $("form").submit(function (e) {
    e.preventDefault();
    let msg = $("#msg");
    if (msg.val()) {
      socket.emit("new-message", msg.val());
      messages.append($("<li>").addClass("u-text-right").text(msg.val()));
      msg.val("");
    }
    return false;
  });

  socket.on("new-message", function (data) {
    activity.text("");
    messages.append($("<li>").text(`${data.username} : ${data.message}`));
  });

  // listen for typing
  $("#msg").bind("keydown", () => {
    socket.emit("typing");
  });

  socket.on("on-typing", (username) => {
    clearTimer();
    activity.text(`${username} is typing...`);
    timer = setTimeout(() => {
      activity.text("");
    }, 1000);
  });

  // change username
  changeUsername.click(() => {
    if (username.val()) {
      socket.emit("change-username", username.val());
    }
  });

  // update user's username
  socket.on("username-updated", (data) => {
    $(`li#${data.id}`).text(data.username);
  });

  // new user connected
  socket.on("new-user-connected", (data) => {
    onlineUsers.append(`<li id=${data.id}>${data.username}</li>`);
    notification.text("New user connected");
    setTimeout(() => {
      notification.text("Online");
    }, 2000);
  });

  // make already active users visible to new user
  socket.on("add-existing-users", (list) => {
    for (key in list) {
      onlineUsers.append(`<li id=${key}>${list[key]}</li>`);
    }
  });

  // user disconnected
  socket.on("user-disconnected", (data) => {
    $(`#${data.id}`).remove();
    notification.text(`${data.username} left`);
    setTimeout(() => {
      notification.text("Online");
    }, 2000);
  });
});
