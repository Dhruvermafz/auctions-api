const express = require("express");
const { body } = require("express-validator");
const adController = require("../controllers/ad");
const { uploadImage } = require("../controllers/upload");
const router = express.Router();

const isAuth = require("../middlewares/isAuth");
const { multer } = require("../utils/multermediaupload");

// @route   POST /ad
// @desc    Post a new ad
// @access  protected
router.post(
  "/",
  isAuth,
  [
    body("productName", "Invalid productName").trim().not().isEmpty(),
    body("basePrice", "Inval id basePrice").trim().isNumeric(),
    body("duration", "Invalid duration").trim().isNumeric(),
  ],
  adController.addAd
);

router.route("/uploads").post(uploadImage);

// @route   GET /ad?user=<userId>&option=<active>
// @desc    Retrieve list of all ads. Optional query param of user.
// @access  protected
router.get("/?", isAuth, adController.retrieveAds);

// @route   GET /ad/:id
// @desc    Find one ad
// @access  protected
router.get("/:id", isAuth, adController.findAd);

// @route   PUT /ad/:id
// @desc    Update an ad
// @access  protected
router.put("/:id", isAuth, adController.updateAd);

// @route   DELETE /ad/:id
// @desc    Delete an ad
// @access  protected
router.delete("/:id", isAuth, adController.deleteAd);

module.exports = router;
