const express = require("express");
const app = express();
const socketIO = require("socket.io");

// Set the template engine ejs
app.set("view-engine", "ejs");

// Middleware
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => {
  //   res.send("Hello, World!");
  res.render("index.ejs");
});

// Listen on port 3000
server = app.listen(3000);

// Create a socket on the the server
const io = socketIO(server);

// Listen on every connection
io.on("connection", onConnection);

function onConnection(socket) {
  console.log("New user connected with id " + socket.id);

  socket.broadcast.emit("connected");

  // Default Username
  socket.username = "Anonymous";
  // Listen to change in username
  socket.on("change-username", (data) => {
    socket.username = data.username;
  });

  // Listen on new message
  socket.on("new-message", (data) => {
    // Broadcast the new message
    io.sockets.emit("new-message", {
      message: data.message,
      username: socket.username,
    });
  });

  //   Listen on typing
  socket.on("typing", () => {
    socket.broadcast.emit("typing", { username: socket.username });
  });
}
