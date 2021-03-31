import socket from 'socket.io';

const io = socket({ path: '/groups' });

export default io;
