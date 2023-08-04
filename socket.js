const { Server } = require("socket.io");

let io;
let adPageIo;

const commonConfig = {
  cors: {
    origin: clientBaseUrl,
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
  },
};

/**
 * Initialize the main Socket.io instance.
 * @param {http.Server} server - The HTTP server instance to attach to.
 * @param {string} clientBaseUrl - The allowed client base URL.
 * @returns {Server} - The initialized Socket.io instance.
 */
exports.init = (server, clientBaseUrl) => {
  if (io) {
    throw new Error(
      "Socket.io is already initialized for the main application."
    );
  }

  io = new Server(server, commonConfig);

  return io;
};

/**
 * Initialize the ad page Socket.io instance.
 * @param {http.Server} server - The HTTP server instance to attach to.
 * @param {string} clientBaseUrl - The allowed client base URL.
 * @param {string} path - The path for the ad page instance.
 * @returns {Server} - The initialized ad page Socket.io instance.
 */
exports.initAdIo = (server, clientBaseUrl, path = "/socket/adpage") => {
  if (adPageIo) {
    throw new Error("Ad Socket.io is already initialized.");
  }

  adPageIo = new Server(server, { ...commonConfig, path });

  return adPageIo;
};

/**
 * Get the main Socket.io instance.
 * @returns {Server} - The main Socket.io instance.
 * @throws Will throw an error if Socket.io is not initialized.
 */
exports.getIo = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized for the main application.");
  }
  return io;
};

/**
 * Get the ad page Socket.io instance.
 * @returns {Server} - The ad page Socket.io instance.
 * @throws Will throw an error if ad Socket.io is not initialized.
 */
exports.getAdIo = () => {
  if (!adPageIo) {
    throw new Error("Ad Socket.io is not initialized.");
  }
  return adPageIo;
};
