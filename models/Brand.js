const mongoose = require("mongoose");

// Define the schema
const brandSchema = new mongoose.Schema({
  brand_name: {
    type: String,
    required: true,
  },
});

// Create the model
const Brand = mongoose.model("Brand", brandSchema);

module.exports = Brand;
