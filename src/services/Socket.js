import http from 'http';
import socketio from 'socket.io';

class Socket {
  constructor(app) {
    this.httpServer = http.createServer(app);
    this.io = new socketio.Server(this.httpServer);

    this.httpServer.listen(3000);
  }
}

export default Socket;
