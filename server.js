// Import required modules and initialize Express and Socket.io
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

// Set up static directory and initiate a set for online users
app.use(express.static(__dirname));
let onlineUsers = new Set();

// Socket.io connection handler
io.on('connection', (socket) => {

    // Handle new usernames
    socket.on('username', (username) => {
        onlineUsers.add(username);
        socket.emit('users', Array.from(onlineUsers));
        io.emit('users', Array.from(onlineUsers));
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        if (socket.username) {
            onlineUsers.delete(socket.username);
            io.emit('users', Array.from(onlineUsers));
        }
    });

    // Handle incoming messages
    socket.on('message', (data) => {
        socket.broadcast.emit('message', data);
        if (!socket.username) {
            socket.username = data.username;
        }
    });
});

// Serve the HTML page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
