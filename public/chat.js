$(function () {
  let socket = io();
  let messages = $("#messages");
  let username = $("#username");
  let changeUsername = $("#change-username");
  let activity = $("#activity");
  let onlineUsers = $("#online-users");
  let notification = $("#notification");
  let msg = $("#msg");

  let timer;

  function clearTimer() {
    clearTimeout(timer);
  }

  // send new message
  $("form").submit(function (e) {
    e.preventDefault();
    if (msg.val()) {
      socket.emit("new-message", msg.val());
      iSentAMessage();
      msg.val("");
    }
    return false;
  });

  socket.on("new-message", function (data) {
    activity.text("");
    messages.append(
      $("<li>").html(
        `<span class='u-bolder'>${data.username}<span> : ${data.message}`
      )
    );
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
    createOnlineLi(data.id, data.username);
    notification.text("New user connected");
    restoreNotification();
  });

  // make already active users visible to new user
  socket.on("add-existing-users", (list) => {
    for (key in list) {
      createOnlineLi(key, list[key]);
    }
  });

  // user disconnected
  socket.on("user-disconnected", (data) => {
    $(`#${data.id}`).remove();
    notification.text(`${data.username} left`);
    restoreNotification();
  });

  // Utility Functions
  function createOnlineLi(id, value) {
    let li = document.createElement("li");
    li.setAttribute("id", id);
    li.className = "u-pointer";
    li.innerText = value;
    li.addEventListener("click", function () {
      // send a private message event on username click
      if (msg.val()) {
        socket.emit("private-message", { target: id, message: msg.val() });
        iSentAMessage();
        msg.val("");
      }
    });
    onlineUsers.append(li);
  }

  function iSentAMessage() {
    messages.append($("<li>").addClass("u-text-right").text(msg.val()));
  }

  function restoreNotification() {
    setTimeout(() => {
      notification.text("Online");
    }, 2000);
  }
});
