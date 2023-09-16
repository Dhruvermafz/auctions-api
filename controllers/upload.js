const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.KEY,
  api_secret: process.env.SECRET,
});

exports.uploadImage = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const uploadOptions = { resource_type: "auto" };

    cloudinary.uploader
      .upload(uploadOptions, (error, result) => {
        if (error) {
          console.error("Error uploading image to Cloudinary:", error);
          return res.status(500).json({ error: "Error uploading image" });
        }

        const uploadedImage = {
          public_id: result.public_id,
          secure_url: result.secure_url,
          format: result.format,
          width: result.width,
          height: result.height,
        };

        res.json({ message: "Image uploaded to Cloudinary", uploadedImage });
      })
      .end(req.file.buffer);
  } catch (error) {
    console.error("Error during image upload:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// exports.upload = upload.single("image");

exports.getDownloadURLFromCloud = async (req, res) => {
  const imageId = req.params.public_id;

  try {
    const result = await cloudinary.api.resource(imageId);

    if (!result.secure_url) {
      return res.status(404).json({ error: "Image not found" });
    }

    const downloadURL = result.secure_url;
    res.json({ downloadURL });
  } catch (error) {
    console.error("Error fetching image from Cloudinary:", error);
    res.status(500).json({ error: "Error fetching image from Cloudinary" });
  }
};
