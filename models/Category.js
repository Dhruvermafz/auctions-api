const mongoose = require("mongoose");

// Define the schema
const categorySchema = new mongoose.Schema({
  category_name: {
    type: String,
    required: true,
  },
});

// Create the model
const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
