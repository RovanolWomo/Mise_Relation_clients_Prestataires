const jwt = require('jsonwebtoken');
const prisma = require('./lib/prisma');

function setupSocket(io) {
  // Auth middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user_${socket.userId}`);

    socket.on('join_conversation', (conversationId) => {
      socket.join(`conv_${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conv_${conversationId}`);
    });

    socket.on('send_message', async ({ conversationId, content }) => {
      if (!content?.trim()) return;
      try {
        const participant = await prisma.conversationParticipant.findFirst({
          where: { conversationId: parseInt(conversationId), userId: socket.userId }
        });
        if (!participant) return;

        const message = await prisma.message.create({
          data: { content: content.trim(), conversationId: parseInt(conversationId), senderId: socket.userId },
          include: { sender: { select: { id: true, nom: true, prenom: true, avatar: true } } }
        });
        io.to(`conv_${conversationId}`).emit('new_message', message);

        // Notify other participants
        const others = await prisma.conversationParticipant.findMany({
          where: { conversationId: parseInt(conversationId), userId: { not: socket.userId } }
        });
        for (const p of others) {
          io.to(`user_${p.userId}`).emit('message_notification', {
            conversationId,
            senderId: socket.userId,
            preview: content.slice(0, 50),
          });
        }
      } catch (e) {
        console.error('Socket send_message error:', e.message);
      }
    });

    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conv_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping,
      });
    });

    socket.on('mark_read', async ({ conversationId }) => {
      try {
        await prisma.message.updateMany({
          where: { conversationId: parseInt(conversationId), senderId: { not: socket.userId }, read: false },
          data: { read: true }
        });
      } catch (e) {}
    });

    socket.on('disconnect', () => {});
  });
}

module.exports = setupSocket;
