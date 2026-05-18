const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const PORT = parseInt(process.env.PORT || '4000', 10);
const EMIT_SECRET = process.env.SOCKET_EMIT_SECRET || 'dev-secret';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';

const app = express();
app.use(express.json());
app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }));

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: ALLOWED_ORIGIN, credentials: true },
  transports: ['websocket', 'polling'],
});

// userId -> socketId
const onlineUsers = new Map();

// Health check
app.get('/', (req, res) => res.json({ ok: true, online: onlineUsers.size }));

// HTTP endpoint so Vercel API routes can emit events
app.post('/emit', (req, res) => {
  const auth = req.headers.authorization || '';
  if (auth !== `Bearer ${EMIT_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { room, event, data } = req.body;
  if (!room || !event) {
    return res.status(400).json({ error: 'room and event are required' });
  }

  io.to(room).emit(event, data);
  res.json({ ok: true });
});

io.on('connection', (socket) => {
  const userId = socket.handshake.auth?.userId;

  if (!userId) {
    socket.disconnect(true);
    return;
  }

  onlineUsers.set(userId, socket.id);
  socket.join(`user:${userId}`);
  socket.broadcast.emit('user:status', { userId, online: true });

  socket.on('conversation:join', (conversationId) => {
    socket.join(`conv:${conversationId}`);
  });

  socket.on('conversation:leave', (conversationId) => {
    socket.leave(`conv:${conversationId}`);
  });

  socket.on('typing:start', ({ conversationId }) => {
    socket.to(`conv:${conversationId}`).emit('typing:start', { userId, conversationId });
  });

  socket.on('typing:stop', ({ conversationId }) => {
    socket.to(`conv:${conversationId}`).emit('typing:stop', { userId, conversationId });
  });

  socket.on('user:check_status', ({ userIds }) => {
    const statuses = {};
    for (const uid of userIds) statuses[uid] = onlineUsers.has(uid);
    socket.emit('user:statuses', statuses);
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    socket.broadcast.emit('user:status', { userId, online: false });
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});
