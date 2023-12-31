const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a name"],
    minlength: 3,
    maxlength: 32,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please provide an email"],
  },
  password: {
    type: String,
    required: [true, "Password can not be empty!"],
  },
  phone: {
    type: String,
    required: [true, "Please provide a mobile number"],
    minlength: 10,
    maxlength: 10,
    trim: true,
  },
  address: {
    type: String,
    required: [true, "Please provide an address!"],
  },
  purchasedProducts: [
    {
      type: mongoose.Types.ObjectId,
      ref: "ad",
    },
  ],
  avatar: {
    type: String,
    default: process.env.DEFAULT_AVATAR,
    trim: true,
  },
  postedAds: [
    {
      type: mongoose.Types.ObjectId,
      ref: "ad",
    },
  ],
  bids: [
    {
      type: mongoose.Types.ObjectId,
      ref: "ad",
    },
  ],
});

module.exports = mongoose.model("user", userSchema);
