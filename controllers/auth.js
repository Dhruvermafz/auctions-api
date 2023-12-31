const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/nodemailer");
const cloudinary = require("cloudinary");
const predefinedAvatars = require("../utils/avatars.json");
const User = require("../models/User");
const BadRequestError = require("../errors/badRequest");

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    // Check if user exists
    const { email, password } = req.body;
    let user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
    }

    // Match password
    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
    }

    // Return jwt
    const payload = {
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 36000 },
      (err, token) => {
        if (err) {
          throw err;
        }
        res.status(200).json({ token });
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// @route    GET /api/profile
// @desc     Get details of logged in user
// @access   Private
exports.getUserProfile = async (req, res, next) => {
  let user = req.user;

  if (!user) return next(new BadRequestError(401, "Unauthorized access!"));

  const auctionsWonCount = await Auction.find({ winner: user._id }).count();
  const auctionsInitiatedCount = await Auction.find({
    seller: user._id,
  }).count();

  user = { ...req.user._doc };
  user.auctionsWonCount = auctionsWonCount;
  user.auctionsInitiatedCount = auctionsInitiatedCount;
  delete user.password;
  delete user.updatedAt;
  delete user.__v;

  res.status(200).json({
    success: true,
    status: 200,
    data: user,
  });
};

// @route    PATCH /api/profile/changeAvatar
// @desc     Change avatar of user.
// @access   Private
exports.changeUserAvatar = async (req, res, next) => {
  const userId = req.user._id;
  const { avatar } = req.body;
  let avatarUrl = avatar;

  if (!avatar)
    return next(new BadRequestError(422, "Please provide an avatar!"));

  // When data uri (custom image/avatar) is received in request body.
  if (!avatar.startsWith("https://")) {
    try {
      const { isValid, error } = isValidUserAvatar(avatar);
      if (!isValid) return next(new BadRequestError(400, error));

      const uploadResponse = await cloudinary.uploader.upload(avatar, {
        folder: `live-auctions/users_avatars/${userId}`,
        eager: [
          { aspect_ratio: "1.1", gravity: "face", crop: "fill", radius: "max" },
        ],
      });

      avatarUrl =
        uploadResponse.eager[0]?.secure_url || uploadResponse.secure_url;
    } catch (error) {
      const message = "Unable to change avatar. Try again after some time!";
      return next(new BadRequestError(500, message));
    }
  } else {
    // When avatar is one of predefined avatars then validate link.
    const matchAvatars = (predefinedAvatar) => predefinedAvatar === avatarUrl;
    const validPredefinedAvatar = predefinedAvatars.some(matchAvatars);

    if (!validPredefinedAvatar)
      return next(new ErrorResponse(400, "Predefined avatar URL is incorrect"));
  }

  await User.findByIdAndUpdate(userId, { avatar: avatarUrl });

  res.status(200).json({
    success: true,
    status: 200,
    data: {
      message: "Your avatar has been updated",
    },
  });
};
