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
const port = 3000 || process.env.PORT;
server.listen(port, () => {
  console.log("server running on port " + port);
});

// --- do socket stuff
// connect server to socket
const io = socketio(server);

// listen for connection on socket
io.on("connection", onConnection);

function onConnection(socket) {
  console.log("a user connected");
  socket.username = "Anonymous";
  socket.on("new-message", (msg) => {
    // console.log("message: " + msg);
    io.emit("new-message", { username: socket.username, message: msg });
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
}
