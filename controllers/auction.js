const { BadRequestError } = require("../errors/badRequest");
const Ad = require("../models/Ad");
const User = require("../models/User");
const io = require("../socket");

// @route   POST /auction/start/:adId
// @desc    Start auction
exports.startAuction = async (req, res, next) => {
  const { adId } = req.params;
  try {
    let ad = await Ad.findById(adId).populate("owner", { password: 0 });
    if (!ad) return res.status(400).json({ errors: [{ msg: "Ad not found" }] });
    if (ad.owner._id != req.user.id)
      return res
        .status(400)
        .json({ errors: [{ msg: "Unauthorized to start" }] });
    if (ad.auctionEnded)
      return res
        .status(400)
        .json({ errors: [{ msg: "Auction has already ended" }] });
    if (ad.auctionStarted)
      return res.status(400).json({ errors: [{ msg: "Already started" }] });
    ad.auctionStarted = true;
    await ad.save();
    // io.getIo().emit('auctionStarted', { action: 'started', data: ad });
    io.getAdIo()
      .to(ad._id.toString())
      .emit("auctionStarted", { action: "started", data: ad });
    res.status(200).json({ msg: "Auction started" });

    // Run down timer
    ad.timer = parseInt(ad.duration);
    ad.auctionEnded = false;
    let duration = parseInt(ad.duration);
    let timer = parseInt(ad.timer);
    let intervalTimer = setInterval(async () => {
      timer -= 1;
      await ad.updateOne({ timer: timer });
      io.getAdIo()
        .to(ad._id.toString())
        .emit("timer", {
          action: "timerUpdate",
          data: { timer: timer, _id: ad._id },
        });
    }, 1000);
    setTimeout(async () => {
      clearInterval(intervalTimer);
      let auctionEndAd = await Ad.findById(ad._id).populate("owner", {
        password: 0,
      });
      auctionEndAd.auctionEnded = true;
      auctionEndAd.timer = 0;
      if (auctionEndAd.currentBidder) {
        console.log("ad sold");
        auctionEndAd.purchasedBy = auctionEndAd.currentBidder;
        auctionEndAd.sold = true;
        await auctionEndAd.save();
        // Add product to winner
        let winner = await User.findById(auctionEndAd.currentBidder);
        winner.purchasedProducts.push(auctionEndAd._id);
        await winner.save();
        io.getAdIo().to(auctionEndAd._id.toString()).emit("auctionEnded", {
          action: "sold",
          ad: auctionEndAd,
          winner: winner,
        });
      } else {
        io.getAdIo()
          .to(auctionEndAd._id.toString())
          .emit("auctionEnded", { action: "notSold", data: auctionEndAd });
        await auctionEndAd.save();
      }
    }, (duration + 1) * 1000);
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

exports.runTimer = async (ad) => {
  try {
    // Initialize the timer to the duration of the auction
    let timer = parseInt(ad.duration);

    // Create an interval to update the timer every second
    let intervalTimer = setInterval(async () => {
      // Decrease the timer by 1 second
      timer -= 1;

      // Update the timer in the database for the specific ad
      await Ad.updateOne({ _id: ad._id }, { timer: timer });

      // Emit a timer update event to notify clients
      io.getAdIo()
        .to(ad._id.toString())
        .emit("timer", {
          action: "timerUpdate",
          data: { timer: timer, _id: ad._id },
        });

      // Check if the timer has reached 0 (auction ended)
      if (timer === 0) {
        clearInterval(intervalTimer); // Clear the interval

        // Retrieve the ad from the database with owner details
        let auctionEndAd = await Ad.findById(ad._id).populate("owner", {
          password: 0,
        });

        // Set the auction as ended
        auctionEndAd.auctionEnded = true;
        auctionEndAd.timer = 0;

        if (auctionEndAd.currentBidder) {
          // If there is a current bidder, the ad is sold
          console.log("Ad sold");
          auctionEndAd.purchasedBy = auctionEndAd.currentBidder;
          auctionEndAd.sold = true;

          // Save the updated ad
          await auctionEndAd.save();

          // Add the product to the winner's purchasedProducts array
          let winner = await User.findById(auctionEndAd.currentBidder);
          winner.purchasedProducts.push(auctionEndAd._id);
          await winner.save();

          // Emit an event to notify clients that the auction is sold
          io.getAdIo().to(auctionEndAd._id.toString()).emit("auctionEnded", {
            action: "sold",
            ad: auctionEndAd,
            winner: winner,
          });
        } else {
          // If there is no current bidder, the ad is not sold
          io.getAdIo()
            .to(auctionEndAd._id.toString())
            .emit("auctionEnded", { action: "notSold", data: auctionEndAd });

          // Save the updated ad
          await auctionEndAd.save();
        }
      }
    }, 1000);
  } catch (err) {
    console.log(err);
  }
};

// @route   POST /auction/winner/:adId
// @desc    Declare auction winner
exports.declareWinner = async (req, res, next) => {
  const { adId } = req.params;
  try {
    let ad = await Ad.findById(adId).populate("owner", { password: 0 });
    if (!ad) return res.status(400).json({ errors: [{ msg: "Ad not found" }] });

    // Check if the auction has ended
    if (!ad.auctionEnded)
      return res
        .status(400)
        .json({ errors: [{ msg: "Auction not ended yet" }] });

    // Check if the user making the request is the owner of the ad
    if (ad.owner._id != req.user.id)
      return res
        .status(400)
        .json({ errors: [{ msg: "Unauthorized to declare winner" }] });

    // Check if the ad has already been declared as sold
    if (ad.sold)
      return res
        .status(400)
        .json({ errors: [{ msg: "Ad has already been sold" }] });

    // Check if there is a current bidder
    if (!ad.currentBidder)
      return res.status(400).json({ errors: [{ msg: "No current bidder" }] });

    // Set the ad as sold
    ad.sold = true;
    ad.purchasedBy = ad.currentBidder;
    await ad.save();

    // Add the product to the winner's purchasedProducts array
    let winner = await User.findById(ad.currentBidder);
    winner.purchasedProducts.push(ad._id);
    await winner.save();

    // Emit an event to notify clients that the auction is sold
    io.getAdIo()
      .to(ad._id.toString())
      .emit("auctionEnded", { action: "sold", ad: ad, winner: winner });

    res.status(200).json({ msg: "Auction winner declared" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// @route   POST /auction/end/:adId
// @desc    End auction without a winner
exports.endAuction = async (req, res, next) => {
  const { adId } = req.params;
  try {
    let ad = await Ad.findById(adId).populate("owner", { password: 0 });
    if (!ad) return res.status(400).json({ errors: [{ msg: "Ad not found" }] });

    // Check if the auction has ended
    if (!ad.auctionEnded)
      return res
        .status(400)
        .json({ errors: [{ msg: "Auction not ended yet" }] });

    // Check if the user making the request is the owner of the ad
    if (ad.owner._id != req.user.id)
      return res
        .status(400)
        .json({ errors: [{ msg: "Unauthorized to end auction" }] });

    // Check if the ad has already been declared as sold
    if (ad.sold)
      return res
        .status(400)
        .json({ errors: [{ msg: "Ad has already been sold" }] });

    // Set the ad as not sold
    ad.sold = false;
    await ad.save();

    // Emit an event to notify clients that the auction is not sold
    io.getAdIo()
      .to(ad._id.toString())
      .emit("auctionEnded", { action: "notSold", data: ad });

    res.status(200).json({ msg: "Auction ended without winner" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};
