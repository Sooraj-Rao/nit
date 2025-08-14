const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const ChatMessage = require('./models/ChatMessage'); // ✅ Load model
const paymentRoute = require('./routes/payment');






const app = express();
const server = http.createServer(app);

// ✅ Socket.IO Setup
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ✅ Socket.IO Events
io.on('connection', (socket) => {
  console.log("🟢 User connected:", socket.id);

  // ✅ Join room for a specific alert
  socket.on('joinRoom', ({ alertId }) => {
    socket.join(alertId);
    console.log(`🟢 Socket ${socket.id} joined room: ${alertId}`);
  });

  // ✅ Send & Save message
  socket.on('sendMessage', async ({ alertId, sender, message }) => {
    try {
      // Save to MongoDB
      const newMessage = await ChatMessage.create({
        alertId,
        sender,     // should be a user ObjectId
        message
      });

      // Populate sender name
      const populated = await newMessage.populate('sender', 'name');

      // Send to all users in alert room
      io.to(alertId).emit('receiveMessage', {
        sender: populated.sender.name,
        message: newMessage.message,
        timestamp: newMessage.createdAt
      });

    } catch (error) {
      console.error('❌ Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔴 User disconnected: ${socket.id}`);
  });
  socket.on('typing', ({ alertId, sender }) => {
  socket.to(alertId).emit('typing', { sender });
});
});




// ✅ Middleware and Routes
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

app.use(cors());
app.use(express.json());

// ✅ API routes
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/user-alerts', require('./routes/userRoutesAlert'));
app.use('/api/chat', require('./routes/chat'));  // For GET /chat/:alertId
app.use('/api', paymentRoute);
app.use('/uploads', express.static('uploads'));
app.use('/api/events', require('./routes/events'));

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
