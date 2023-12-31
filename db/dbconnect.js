const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("### Mongo DB connected...");
  } catch (err) {
    console.log(err);
    console.log(`Connection Failed to DB: ${err}`);
    process.exit(1);
  }
};

module.exports = connectDb;
