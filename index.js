// require needed modules
const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");

// create an express app
const app = express();

// create http server and run the callback fcn app
const server = http.createServer(app);

// setup middleware
app.use(express.static(path.join(__dirname, "public")));

// routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/views" + "/index.html"));
});

// start server and listen on port 3000 or any specified port
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log("server running on port " + port);
});

// --- do socket stuff
// connect server to socket
const io = socketio(server);

// listen for connection on socket
io.on("connection", onConnection);

const online = {}; // online list

function onConnection(socket) {
  // default username of connected client
  socket.username = "Anonymous";

  // listen for connection and broadcast it
  // console.log("a user connected");

  // add user to online list
  online[socket.id] = socket.username;
  socket.broadcast.emit("new-user-connected", {
    id: socket.id,
    username: socket.username,
  });

  io.to(socket.id).emit("add-existing-users", online);

  // emit new message to other clients
  socket.on("new-message", (msg) => {
    // console.log("message: " + msg);
    socket.broadcast.emit("new-message", {
      username: socket.username,
      message: msg,
    });
  });

  // notify other's that someone is typing
  socket.on("typing", () => {
    socket.broadcast.emit("on-typing", socket.username);
  });

  // update username
  socket.on("change-username", (username) => {
    socket.username = username;
    // update username in list
    online[socket.id] = username;
    io.emit("username-updated", { id: socket.id, username: socket.username });
  });

  // listen for private message and forward to target user
  socket.on("private-message", (data) => {
    console.log(data.target);
    if (data.target !== socket.id) {
      io.to(data.target).emit("new-message", {
        username: socket.username,
        message: data.message,
      });
    }
  });

  // listen for disconnection
  socket.on("disconnect", () => {
    // console.log("user disconnected");
    // delete user from online list
    delete online[socket.id];
    io.emit("user-disconnected", {
      id: socket.id,
      username: socket.username,
    });
  });
}
