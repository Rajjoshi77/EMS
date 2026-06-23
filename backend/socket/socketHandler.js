const socketIo = require('socket.io');
const Notification = require('../models/Notification');

let io;
const userSockets = new Map(); 

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    
    socket.on('register', (userId) => {
      if (userId) {
        socket.userId = userId;
        if (!userSockets.has(userId)) {
          userSockets.set(userId, []);
        }
        userSockets.get(userId).push(socket.id);
        console.log(`Socket ${socket.id} registered for User ${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      if (socket.userId && userSockets.has(socket.userId)) {
        const sockets = userSockets.get(socket.userId);
        const index = sockets.indexOf(socket.id);
        if (index !== -1) {
          sockets.splice(index, 1);
        }
        if (sockets.length === 0) {
          userSockets.delete(socket.userId);
        }
      }
    });
  });

  return io;
};


const emitNotification = async (userId, title, message) => {
  try {
    
    const notification = await Notification.create({
      userId,
      title,
      message,
    });

    
    if (io && userSockets.has(userId.toString())) {
      const socketIds = userSockets.get(userId.toString());
      socketIds.forEach((socketId) => {
        io.to(socketId).emit('notification', notification);
      });
    }

    return notification;
  } catch (error) {
    console.error('Error emitting notification:', error);
  }
};

module.exports = {
  initSocket,
  emitNotification,
};
