// const express = require("express");
// const fs = require("fs");
// const util = require("util");
// const unlinkFile = util.promisify(fs.unlink);
// const router = express.Router();
// const multer = require("multer");
// const isAuth = require("../middlewares/isAuth");
// const {
//   uploadImage,
//   getDownloadURLFromCloud,
// } = require("../controllers/upload");

// const cloudinaryStorage = multer.memoryStorage();
// const uploadCloudinary = multer({ storage: cloudinaryStorage });

// // @route   GET /upload/image/:imageId
// // @desc    Get image with public ID
// // @access  protected
// router.get("/image/:imageId", async (req, res, next) => {
//   try {
//     const downloadURL = await getDownloadURLFromCloud(req.params.imageId);
//     res.status(200).json(downloadURL);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // @route   POST /upload/image
// // @desc    Upload image to Cloudinary
// // @access  private (requires authentication)
// router.post(
//   "/image",
//   isAuth,
//   uploadCloudinary.single("image"),
//   async (req, res, next) => {
//     try {
//       const file = req.file;

//       if (!file) {
//         return res.status(400).json({ error: "No file uploaded" });
//       }

//       const result = await uploadImage(file);
//       await unlinkFile(file.path);

//       res.status(200).json({ imagePath: `/upload/image/${result.public_id}` });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   }
// );

// module.exports = router;
