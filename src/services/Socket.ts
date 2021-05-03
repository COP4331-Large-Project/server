import { Server } from 'socket.io';
import { Server as HTTPServer } from 'node:http';

let io: Server;

const makeIo = (httpServer: HTTPServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: true,
      methods: ['GET', 'POST'],
    },
  });

  // once a connection to a socket has been made
  io.on('connection', (socket) => {
    // get the groupId from the socket's 'join' event, and put them into a room with that groupId
    socket.on('join', (groupId) => {
      socket.join(groupId);
    });
  });

  return io;
};

const getIo = (): Server => io;

export default makeIo;

export { getIo };
