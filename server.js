const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const authRoutes = require('./authRoutes');

const app = express();
const server = http.createServer(app);

const JWT_SECRET = 'e2f7c0cbb7e439e4a781578fe403c3aaf45d8f6c4b8a9f6b2d07b0ab0a4f8d94';

// Middlewares
app.use(cors({
    origin: 'http://localhost:8888',
    credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

// JWT Middleware for protected routes
function checkAuth(req, res, next) {
    console.log("Checking authentication...");

    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login');
    }

    // Verify JWT
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log("JWT verification failed:", err.message);  // Log the error for debugging
            return res.redirect('/login');
        }

        req.user = decoded;
        next();
    });
}

// Serve HTML Pages
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'registration.html'));
});

app.get('/', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.use('/api', authRoutes);

// Static assets (images, CSS, JS files)
app.use(express.static(path.join(__dirname, 'public')));

// Socket.IO configuration
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:8888',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Socket.IO Authentication middleware
io.use((socket, next) => {
    const token = socket.handshake.headers['authorization']?.split(' ')[1];  // Extract token from 'Authorization' header

    if (!token) {
        return next(new Error('No token provided'));  // Reject connection if no token is provided
    }

    // Verify the token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new Error('Invalid token'));  // Reject connection if token is invalid
        }

        socket.user = decoded;  // Attach decoded user data to the socket object
        next();  // Proceed with the connection
    });
});

// Socket.IO events
io.on('connection', (socket) => {
    console.log('A user connected:', socket.user);  // Log user info after successful authentication

    // Handle join room event
    socket.on('join', (room) => {
        socket.join(room);  // Join the specified room
        console.log(`User joined room: ${room}`);
    });

    // Handle leave room event
    socket.on('leave', (room) => {
        socket.leave(room);  // Leave the specified room
        console.log(`User left room: ${room}`);
    });

    // Handle message event
    socket.on('message', (data) => {
        const { room, message, username } = data;
        // Emit the message to the room with the username
        io.to(room).emit('message', { message, username });
        console.log(`Message sent to room: ${room} by ${username}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start the server
server.listen(3000, () => {
    console.log('Socket.IO server running on http://localhost:3000');
});
