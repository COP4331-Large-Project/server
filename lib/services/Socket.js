"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIo = void 0;
const socket_io_1 = require("socket.io");
let io;
const makeIo = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
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
const getIo = () => io;
exports.getIo = getIo;
exports.default = makeIo;
