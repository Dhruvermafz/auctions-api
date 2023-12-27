const express = require("express");
const { body } = require("express-validator");
const bug = require("../controllers/feedback");
const feedback = require("../controllers/feedback");

const router = express.Router();

const isAuth = require("../middlewares/isAuth");

router.post("/bug", isAuth, bug);

router.post("/feedback", isAuth, feedback);

module.exports = router;
