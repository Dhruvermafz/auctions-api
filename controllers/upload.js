const router = require("express").Router();
const cloudinary = require("cloudinary");
const formidable = require("formidable");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.KEY,
  api_secret: process.env.SECRET,
});

router.post("/upload", async (req, res) => {
  try {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Formidable error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      const image = await cloudinary.uploader.upload(files.image.path, {
        resource_type: "image",
        public_id: `users/${req.userid}/${files.name}`,
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
});

module.exports = router;
