const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const socketIo = require("socket.io");
const http = require('http');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const postRouter = require('./routes/posts');
const achievementRouter = require('./routes/achievements');
require('dotenv').config();
const PORT = process.env.PORT || 5000;
connectDB();
const app = express(); // ← This was missing
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use('/profile-images', express.static("profile-images"));

app.use('/api', userRouter);
app.use('/api', authRouter);
app.use('/api', postRouter);
app.use("/api", achievementRouter);
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  },
});


app.set('io', io);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('latency:ping', (clientSentAt, ack) => {            
    if (typeof ack === 'function') {
      ack({
        clientSentAt,
        serverReceivedAt: Date.now(),
      });
    }
  });

  socket.on('join', (roomName) => {
    if (roomName) {
      socket.join(roomName);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

module.exports = { app, server, io };
