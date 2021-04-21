import { Server } from 'socket.io';

let io;

const makeIo = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3000',
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

const getIo = () => io;

export default makeIo;

export { getIo };
