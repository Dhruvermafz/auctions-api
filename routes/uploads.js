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

const upload = multer({ dest: "uploads" });

// @route   GET /upload/image/:key
// @desc    Get image with key
// @access  protected
router.get("/image/:imageId", async (req, res) => {
  try {
    const fileBuffer = await getDownloadURLFromCloud(req.params.key);

    res.status(200).send(fileBuffer);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: { msg: "Server Error" } });
  }
});

router.post("/image", isAuth, upload.single("image"), async (req, res) => {
  const file = req.file;

  try {
    const result = await uploadImage(file);
    await unlinkFile(file.path);
    res.status(200).json({ imagePath: `/upload/image/${result.public_id}` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: { msg: "Server Error" } });
  }
});

module.exports = router;
