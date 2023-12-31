const Room = require("../models/Room");

// @route   POST /room/join/:roomId
// @desc    Add user to a room
exports.joinRoom = async (req, res, next) => {
  const { user } = req;
  const { roomId } = req.params;

  try {
    let room = await Room.findById(roomId);
    // Check if user already in room
    const userInRoom = room.users.find((roomUser) => {
      return roomUser._id == user.id ? true : false;
    });
    if (userInRoom) {
      return res.status(400).json({ errors: [{ msg: "Already joined" }] });
    }
    room.users.push(user.id);
    room.populate("users", { password: 0 });
    room = await room.save();
    res.status(200).json({ msg: "Successfully joined", room });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// @route   GET /room/:roomId
// @desc    Get room details
exports.getRoom = async (req, res, next) => {
  const { roomId } = req.params;

  try {
    let room = await Room.findById(roomId).populate("users", { password: 0 });
    res.status(200).json(room);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// @route   DELETE /room/delete/:roomId
// @desc    Delete a room (can only be done by the owner)
exports.deleteRoom = async (req, res, next) => {
  const { user } = req;
  const { roomId } = req.params;

  try {
    let room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ errors: [{ msg: "Room not found" }] });
    }

    // Check if the user making the request is the owner of the room
    if (room.owner.toString() !== user.id) {
      return res
        .status(403)
        .json({ errors: [{ msg: "Unauthorized to delete room" }] });
    }

    // Delete the room
    await Room.findByIdAndDelete(roomId);

    // You might want to remove references to this room in other places,
    // such as removing the room from the users' joined rooms, etc.

    res.status(200).json({ msg: "Room deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};
