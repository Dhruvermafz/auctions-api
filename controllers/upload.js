const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const path = require("path");
const { StatusCodes } = require("http-status-codes");
const fs = require("fs");
const { imageObject } = require("../utils/imageObject");

const uploadImage = async (req, res, next) => {
  const files = req.files.images;
  const url = [];

  if (files.length > 1) {
    await Promise.all(
      files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          use_filename: true,
          folder: "uploads",
        });
        fs.unlinkSync(file.tempFilePath);
        const newImage = imageObject({
          url: result.secure_url,
          id: result.public_id,
        });
        url.unshift(newImage);
      })
    );
  } else {
    const result = await cloudinary.uploader.upload(files.tempFilePath, {
      use_filename: true,
      folder: "uploads",
    });
    fs.unlinkSync(files.tempFilePath);
    const newImage = imageObject({
      url: result.secure_url,
      id: result.public_id,
    });
    url.push(newImage);
  }

  console.log(url);
  return res.status(StatusCodes.OK).json({ url });
};

exports.getDownloadURLFromCloud = async (req, res, next) => {
  const imageId = req.params.public_id;

  try {
    const result = await cloudinary.api.resource(imageId);

    if (!result.secure_url) {
      return res.status(404).json({ error: "Image not found" });
    }

    const downloadURL = result.secure_url;
    res.json({ downloadURL });
  } catch (error) {
    console.error("Error fetching image from Cloudinary:", error);
    next(error);
  }
};

exports.errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: "Internal server error" });
};

const deleteUploadedImage = async (req, res) => {
  const { id } = req.body;
  await cloudinary.uploader.destroy(id);
  res.status(StatusCodes.OK).json({ msg: "Image Deleted!" });
};

module.exports = {
  uploadImage,

  deleteUploadedImage,
};
