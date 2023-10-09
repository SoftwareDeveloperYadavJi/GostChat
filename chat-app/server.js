const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Define a route to serve your HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    console.log('User connected: ' + socket.id);

    socket.on('message', (message) => {
        // Generate a unique ID for the message
        var messageId = 'message-' + new Date().getTime();
        message.id = messageId;

        // Broadcast the message to all other clients
        socket.broadcast.emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected: ' + socket.id);
    });
});



server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
