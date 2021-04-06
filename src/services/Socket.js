import http from 'http';
import socket from 'socket.io';

let io;
let httpServer;

const Socket = {
  createServer: (app) => {
    if (!app) {
      httpServer = http.createServer();
    } else {
      httpServer = http.createServer(app);
    }

    if (!io) {
      io = new socket.Server(httpServer);
    }

    return io;
  },

  getSocketServer: () => io,
  getHttpServer: () => httpServer,
};

export default Socket;
