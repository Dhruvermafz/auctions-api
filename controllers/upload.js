const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const storage = multer.memoryStorage(); // Store files in memory

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Set file size limit to 5 MB
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.KEY,
  api_secret: process.env.SECRET,
});

exports.uploadImage = [
  upload.single("image"), // "image" should match the name attribute in your HTML form
  async (req, res) => {
    try {
      // Basic user authentication check (customize as needed)
      if (!req.userid) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      // Generate a unique identifier for the image using uuid
      const uniqueIdentifier = uuidv4();

      const image = await cloudinary.uploader.upload(req.file.buffer, {
        resource_type: "image",
        public_id: `users/${req.userid}/${uniqueIdentifier}`,
        crop: "scale",
        quality: "auto",
      });

      console.log("Image uploaded:", image.secure_url);

      return res.status(200).json({ image: image.secure_url });
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
];
