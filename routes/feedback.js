const express = require("express");
const { body } = require("express-validator");

const feedback = require("../controllers/feedback");
const router = express.Router();

const isAuth = require("../middlewares/isAuth");

router.post("/bug", isAuth, feedback.bug);

router.post("/feedback", isAuth, feedback.feedback);

module.exports = router;
