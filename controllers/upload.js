const cloudinary = require("cloudinary").v2;
const formidable = require("formidable");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.KEY,
  api_secret: process.env.SECRET,
});

exports.uploadImage = async (req, res) => {
  try {
    // Basic user authentication check (customize as needed)
    if (!req.userid) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Formidable error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      // Generate a unique identifier for the image using uuid
      const uniqueIdentifier = uuidv4();

      const image = await cloudinary.uploader.upload(files.image.path, {
        resource_type: "image",
        public_id: `users/${req.userid}/${uniqueIdentifier}`,
        crop: "scale",
        quality: "auto",
      });

      console.log("Image uploaded:", image.secure_url);

      return res.status(200).json({ image: image.secure_url });
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
