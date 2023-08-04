const express = require("express");
require("dotenv").config();
const connectDb = require("./db/dbconnect");
const http = require("http");
const { Server } = require("socket.io");
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./documentation/swaggerSetup");
const cors = require("cors");
const multer = require("multer");

const app = express();
const server = http.createServer(app);
const upload = multer({ dest: "uploads/" });
const firebaseApp = require("./utils/firebase");

// Middleware
app.use(express.json());
// app.use(cors()); // Enable CORS for all routes

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

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

// Routes
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use("/auth", require("./routes/auth"));
app.use("/user", require("./routes/user"));
app.use("/ad", require("./routes/ad"));
app.use("/bid", require("./routes/bid"));
app.use("/room", require("./routes/room"));
app.use("/auction", require("./routes/auction"));
app.use("/upload", require("./routes/uploads"));

// Default route
app.get("/", (req, res) => {
  res.send("Server running");
});

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
