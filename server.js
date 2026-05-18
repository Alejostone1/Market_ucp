const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// userId -> { socketId, lastSeen }
const onlineUsers = new Map();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${port}`,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Expose globally so API routes can emit events
  global.io = io;
  global.onlineUsers = onlineUsers;

  io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId;

    if (!userId) {
      socket.disconnect(true);
      return;
    }

    onlineUsers.set(userId, { socketId: socket.id, lastSeen: new Date() });

    // Join personal room for direct notifications
    socket.join(`user:${userId}`);

    // Notify others this user is online
    socket.broadcast.emit('user:status', { userId, online: true });

    console.log(`[Socket] User ${userId} connected (${socket.id})`);

    // Join a conversation room to receive messages
    socket.on('conversation:join', (conversationId) => {
      socket.join(`conv:${conversationId}`);
      console.log(`[Socket] User ${userId} joined conv:${conversationId}`);
    });

    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conv:${conversationId}`);
    });

    // Typing indicators
    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('typing:start', {
        userId,
        conversationId,
      });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('typing:stop', {
        userId,
        conversationId,
      });
    });

    // Batch status check for a list of user IDs
    socket.on('user:check_status', ({ userIds }) => {
      const statuses = {};
      for (const uid of userIds) {
        statuses[uid] = onlineUsers.has(uid);
      }
      socket.emit('user:statuses', statuses);
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      socket.broadcast.emit('user:status', { userId, online: false });
      console.log(`[Socket] User ${userId} disconnected`);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
