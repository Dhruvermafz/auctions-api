const express = require("express");
const router = express.Router();
const isAuth = require("../middlewares/isAuth");
const uploadController = require("../controllers/upload");

router.post("/upload", isAuth, uploadController.uploadImage);

module.exports = router;
