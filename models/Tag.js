const mongoose = require("mongoose");

// Define the schema
const tagSchema = new mongoose.Schema({
  tag_name: {
    type: String,
    required: true,
  },
});

// Create the model
const Tag = mongoose.model("Tag", tagSchema);

module.exports = Tag;
