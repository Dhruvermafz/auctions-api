const express = require("express");
require("dotenv").config();
const connectDb = require("./db/dbconnect");
const { createServer } = require("http");
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./documentation/swaggerSetup");
const socketio = require("./socket");
const multer = require("multer");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const httpProxy = require("http-proxy");
const proxy = httpProxy.createProxyServer({});
const app = express();
const server = createServer(app);
const io = socketio.init(server);
const adIo = socketio.initAdIo(server, "/socket/adpage");

app.use(express.json());
const corsOptions = {
  origin: ["http://localhost:3000", "https://live-auctions.vercel.app"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "*");

  next();
});
// Middleware

// Routes
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Default route
app.get("/", (req, res) => {
  res.send("Server running");
});

app.use("/auth", require("./routes/auth"));
app.use("/user", require("./routes/user"));
app.use("/ad", require("./routes/ad"));
app.use("/bid", require("./routes/bid"));
app.use("/room", require("./routes/room"));
app.use("/auction", require("./routes/auction"));
app.use("/upload", require("./routes/upload"));
app.use("/feedback", require("./routes/feedback"));

// Socket.io logic (move to a separate module if it gets more complex)
io.on("connection", (socket) => {
  console.log("Socket IO client connected");

  socket.on("disconnect", (reason) => {
    console.log("Socket IO client disconnected");
  });

  socket.on("leaveHome", () => {
    socket.disconnect();
  });
});

adIo.on("connect", (socket) => {
  // socket.join('testroom')
  socket.on("joinAd", ({ ad }) => {
    socket.join(ad.toString());
    console.log(`User joined room ${ad}`);
  });
  socket.on("leaveAd", ({ ad }) => {
    socket.leave(ad.toString());
    console.log(`Left room ${ad}`);
  });
  socket.on("disconnect", () => {
    console.log("User has disconnect from ad");
  });
});

app.use(
  fileUpload({
    createParentPath: true,
  })
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// Connect to MongoDB and Initialize server
connectDb()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err);
    process.exit(1);
  });
