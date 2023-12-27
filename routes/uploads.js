const express = require("express");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const router = express.Router();
const multer = require("multer");
const isAuth = require("../middlewares/isAuth");
const { uploadImage } = require("../controllers/upload");

const cloudinaryStorage = multer.memoryStorage();
const uploadImage = multer({ storage: cloudinaryStorage });

router.post("/upload", auth, uploadImage);
module.exports = router;
