const express = require("express");
const fs = require("fs");
const util = require("util");

const router = express.Router();

const isAuth = require("../middlewares/isAuth");
const upload = require("../controllers/upload");

// @route   GET /upload/image/:key
// @desc    Get image with key
// @access  protected
router.get("/image/:imageId", upload.getDownloadURLFromCloud);

router.post("/image", isAuth, upload.upload);

module.exports = router;
