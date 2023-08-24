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
    let addedUser = false;

    // Handle new usernames
    socket.on('add user', (username) => {
        if (addedUser) return;
        
        onlineUsers.add(username);
        addedUser = true;
        
        io.emit('users', Array.from(onlineUsers)); // Emit updated user list
        io.emit('onlineUsers', onlineUsers.size);
    });
    

    // Handle user disconnect
    socket.on('disconnect', () => {
        if (socket.username) {
            onlineUsers.delete(socket.username);
            io.emit('users', Array.from(onlineUsers));  // Updated user list
            io.emit('onlineUsers', onlineUsers.size);   // Updated user count
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
