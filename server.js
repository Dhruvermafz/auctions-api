const express = require("express");
require("dotenv").config();
const connectDb = require("./db/dbconnect");
const { createServer } = require("http");
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./documentation/swaggerSetup");
const socketio = require("./socket");
const multer = require("multer");
const cors = require("cors");
const httpProxy = require("http-proxy");
const fileUpload = require("express-fileupload");

const app = express();
const server = createServer(app);
const io = socketio.init(server);
const adIo = socketio.initAdIo(server, "/socket/adpage");

app.use(express.json());

// CORS middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "https://live-auctions.vercel.app"],
    credentials: true,
    optionSuccessStatus: 200,
  })
);

// Additional headers for CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

// Routes
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use("/auth", require("./routes/auth"));
app.use("/user", require("./routes/user"));
app.use("/ad", require("./routes/ad"));
app.use("/bid", require("./routes/bid"));
app.use("/room", require("./routes/room"));
app.use("/auction", require("./routes/auction"));
app.use("/upload", require("./routes/uploads"));
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
  socket.on("joinAd", ({ ad }) => {
    socket.join(ad.toString());
    console.log(`User joined room ${ad}`);
  });

  socket.on("leaveAd", ({ ad }) => {
    socket.leave(ad.toString());
    console.log(`Left room ${ad}`);
  });

  socket.on("disconnect", () => {
    console.log("User has disconnected from ad");
  });
});

// Remove express-fileupload middleware if not needed
app.use(
  fileUpload({
    createParentPath: true,
  })
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);

  // Customize error handling based on the type of error
  if (err instanceof MyCustomValidationError) {
    return res.status(400).json({ error: "Validation error" });
  }

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
