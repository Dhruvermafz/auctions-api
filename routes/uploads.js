const express = require("express");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const router = express.Router();
const multer = require("multer");
const isAuth = require("../middlewares/isAuth");

const {
  uploadFileToFirebase,
  getDownloadURLFromFirebase,
} = require("../utils/firebase");

const upload = multer({ dest: "uploads" });

// Error handling middleware
const asyncErrorHandler = (handler) => (req, res, next) => {
  handler(req, res).catch(next);
};

router.post(
  "/image",
  isAuth,
  upload.single("image"),
  asyncErrorHandler(async (req, res) => {
    try {
      const file = req.file;
      const result = await uploadFileToFirebase(file);
      await unlinkFile(file.path);
      res.status(200).json({ imagePath: `/uploads/image/${result.Key}` });
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ error: "Internal Server Error" });
    }
  })
);

// @route   GET /upload/image/:key
// @desc    Get image with key
// @access  protected
router.get(
  "/image/:key",
  asyncErrorHandler(async (req, res) => {
    const fileURL = await getDownloadURLFromFirebase(req.params.key);
    res.redirect(fileURL); // Redirect to the image URL
  })
);

router.post("/uploads", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file received" });
    }

    const snapshot = await uploadFileToFirebase(file);

    res.status(200).json({ message: "File uploaded successfully" });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Error handling middleware for catching all unhandled errors
router.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ errors: { msg: "Server error" } });
});

module.exports = router;
