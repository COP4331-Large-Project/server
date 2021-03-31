import http from 'http';
import socket from 'socket.io';

const Socket = {
  initSocket: (app) => {
    const httpServer = http.createServer(app);
    this.server = socket(httpServer);

    this.server.on('connection', (client) => {
      client.on('fetch', async (groupId) => {
        client.rooms.clear();
        client.join(groupId);
      });
    });

    httpServer.listen(3000);
  },
};

export default Socket;
