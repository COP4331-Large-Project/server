import Server from 'http';
import http from 'socket.io';

let io;
let httpServer;

const createServer = (app) => {
  httpServer = http(app);
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });
};

export default Socket;

export { io, httpServer, createServer };
