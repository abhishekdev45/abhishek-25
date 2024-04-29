const express = require("express");
const router = express.Router();

const Vote = require("../models/Vote");

router.route("/vote/:coinId").post(async (req, res) => {
  const { coinId } = req.params;

  try {
    // Check if the voting window is open
    if (!votingStartTime || Date.now() - votingStartTime > 3600000) { // 3600000 milliseconds = 1 hour
      return res.status(403).json({ message: "Voting is not currently active" });
    }

    // Check if the user has already voted 
    const existingVote = await Vote.findOne( {userId: req.userId });
    if (existingVote) {
      return res.status(403).json({ message: "You have already voted for this meme coin" });
    }

    // Increment the votes for the meme coin
    const memeCoin = await MemeCoin.findById(coinId);
    if (!memeCoin) {
      return res.status(404).json({ message: "Meme coin not found" });
    }
    memeCoin.votes += 1;
    await memeCoin.save();

    // Record the user's vote
    const vote = new Vote({
      memeCoinId: coinId,
      userId: req.userId
    });
    await vote.save();

    res.status(200).json({ message: "Vote added successfully", memeCoin });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error voting for the meme coin");
  }
});
module.exports = router;