// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { users, messages, typingUsers, rooms } = require('./data/memoryStore');
const messageRoutes = require('./api/messages');
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/messages', messageRoutes);

// Utility
const getUsersInRoom = (room) => {
  return Object.values(users).filter((user) => user.room === room);
};

// Socket.io logic
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  socket.on('user_join', (username) => {
    users[socket.id] = { username, id: socket.id, room: 'general' };
    socket.join('general');

    io.to('general').emit('user_list', getUsersInRoom('general'));
    io.to('general').emit('user_joined', { username, id: socket.id });
    socket.emit('room_list', rooms);

    console.log(`${username} joined room: general`);
  });

  socket.on('join_room', (newRoom) => {
    const user = users[socket.id];
    if (user) {
      const oldRoom = user.room;
      socket.leave(oldRoom);
      socket.join(newRoom);
      user.room = newRoom;

      io.to(oldRoom).emit('user_list', getUsersInRoom(oldRoom));
      io.to(newRoom).emit('user_list', getUsersInRoom(newRoom));
      io.to(newRoom).emit('user_joined', { username: user.username, id: socket.id });

      console.log(`${user.username} switched from ${oldRoom} to ${newRoom}`);
    }
  });

  socket.on('send_message', (data, callback) => {
    const user = users[socket.id];
    if (!user) return;

    const message = {
      ...data,
      id: Date.now(),
      sender: user.username,
      senderId: socket.id,
      room: user.room,
      timestamp: new Date().toISOString(),
      reactions: {},
      readers: [],
    };

    messages.push(message);
    if (messages.length > 500) messages.shift();

    io.to(user.room).emit('receive_message', message);
    if (callback) callback({ status: 'delivered', id: message.id });
  });

  socket.on('typing', (isTyping) => {
    const user = users[socket.id];
    if (!user) return;

    if (isTyping) {
      typingUsers[socket.id] = user.username;
    } else {
      delete typingUsers[socket.id];
    }

    const roomTypingUsers = Object.entries(typingUsers)
      .filter(([id]) => users[id]?.room === user.room)
      .map(([_, name]) => name);

    io.to(user.room).emit('typing_users', roomTypingUsers);
  });

  socket.on('private_message', ({ to, message }) => {
    const sender = users[socket.id];
    if (!sender) return;

    const messageData = {
      id: Date.now(),
      sender: sender.username,
      senderId: socket.id,
      message,
      timestamp: new Date().toISOString(),
      isPrivate: true,
    };

    socket.to(to).emit('private_message', messageData);
    socket.emit('private_message', messageData);
  });

  socket.on('add_reaction', ({ msgId, emoji }) => {
    const msg = messages.find((m) => m.id === msgId);
    if (msg) {
      if (!msg.reactions) msg.reactions = {};
      msg.reactions[emoji] = (msg.reactions[emoji] || 0) + 1;
      io.to(msg.room).emit('update_reactions', { msgId, emoji });
    }
  });

  socket.on('mark_read', (room) => {
    messages.forEach((msg) => {
      if (msg.room === room) {
        if (!msg.readers) msg.readers = [];
        const username = users[socket.id]?.username;
        if (username && !msg.readers.includes(username)) {
          msg.readers.push(username);
          io.to(room).emit('read_receipt', { msgId: msg.id, readers: msg.readers });
        }
      }
    });
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      const room = user.room;
      io.to(room).emit('user_left', { username: user.username, id: socket.id });
      delete typingUsers[socket.id];
      delete users[socket.id];
      io.to(room).emit('user_list', getUsersInRoom(room));
      io.to(room).emit(
        'typing_users',
        Object.values(typingUsers).filter((name) =>
          getUsersInRoom(room).some((u) => u.username === name)
        )
      );
    }
  });
});

// REST endpoints
app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = { app, server, io };
