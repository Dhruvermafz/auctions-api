const express = require("express");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const router = express.Router();
const multer = require("multer");
const isAuth = require("../middlewares/isAuth");
const {
  uploadImage,
  getDownloadURLFromCloud,
} = require("../controllers/upload");

const cloudinaryStorage = multer.memoryStorage();
const uploadCloudinary = multer({ storage: cloudinaryStorage });

// @route   GET /upload/image/:key
// @desc    Get image with key
// @access  protected
router.get("/image/:imageId", async (req, res, next) => {
  try {
    const downloadURL = await getDownloadURLFromCloud(req.params.key);

    res.status(200).json(downloadURL);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post(
  "/image",
  isAuth,
  uploadCloudinary.single("image"),
  async (req, res, next) => {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const result = await uploadImage(file);
      await unlinkFile(file.path);
      res.status(200).json({ imagePath: `/upload/image/${result.public_id}` });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

module.exports = router;
