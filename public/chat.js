$(function () {
  // Make connection
  let socket = io.connect("http://localhost:3000");

  // Buttons and inputs
  let message = $("#message");
  let username = $("#username");
  let sendMessage = $("#send-message");
  let sendUsername = $("#send-username");
  let chatroom = $("#chatroom");
  let feedback = $("#feedback");

  // Emit a message
  sendMessage.click(function () {
    console.log(message.val());
    socket.emit("new-message", { message: message.val() });
    message.val("");
  });

  // Listen on new-message
  socket.on("new-message", (data) => {
    console.log(data);
    chatroom.append(
      `<li class='message'>${data.username} : ${data.message}</li>`
    );
    feedback.html("");
  });

  // Emit a username
  sendUsername.click(function () {
    console.log(username.val());
    socket.emit("change-username", { username: username.val() });
  });

  //   Emit typing event
  message.bind("keypress", () => {
    socket.emit("typing");
  });

  //   Listen on typing
  socket.on("typing", (data) => {
    feedback.html(`<p><i>${data.username} is typing a message...</i></p>`);
  });
});
