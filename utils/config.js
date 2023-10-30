require("dotenv").config();
const cloudinary = require("cloudinary").v2;

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const UPLOAD_PRESET = process.env.UPLOAD_PRESET || "";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.KEY,
  api_secret: process.env.SECRET,
});

module.exports = { PORT, MONGO_URI, JWT_SECRET, UPLOAD_PRESET, cloudinary };
