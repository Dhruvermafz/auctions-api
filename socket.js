const { Server } = require("socket.io");
let io;
let adIo;

exports.init = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      allowedHeaders: ["*"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  return io;
};

exports.initAdIo = (server, path = "/socket/adpage") => {
  adIo = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      allowedHeaders: ["*"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: path,
  });
  return adIo;
};

exports.getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

exports.getAdIo = () => {
  if (!adIo) {
    throw new Error("Socket.io not initialized");
  }
  return adIo;
};
