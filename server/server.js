const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const socketIo = require("socket.io");
const http = require('http');  // ✅ Import http module
const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const postRouter = require('./routes/posts');

const app = express();
const PORT = process.env.PORT || 3000;

require('dotenv').config();
connectDB();
app.use(cors({
  origin: "http://localhost:5173", // ✅ Set frontend URL instead of "*"
  credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use('/api', userRouter);
app.use('/api', authRouter);
app.use('/api', postRouter);

// ✅ Create HTTP Server
const server = http.createServer(app);

// ✅ Setup Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Allow frontend requests
    methods: ["GET", "POST"],
    credentials: true // This is crucial
  },
});

app.set('io', io);

// ✅ Handle Socket.IO Connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// ✅ Start the server
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

module.exports = { app, server, io };
