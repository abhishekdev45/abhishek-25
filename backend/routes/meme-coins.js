const express = require("express");
const dotenv = require("dotenv");
const { OpenAI } = require("openai");
const MemeCoin = require("../models/MemeCoins");
const Vote = require("../models/Vote");
const { verifyToken } = require("./verifyToken");

dotenv.config();

const router = express.Router();

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let votingStartTime = null;

router.route("/").get((req, res) => {
  res.status(200).json({ message: "Hello from DALL-E!" });
});

router.post("/vote/:coinId", verifyToken, async (req, res) => {
  const { coinId } = req.params;

  try {
    // Check if the voting window is open
    const memeCoin = await MemeCoin.findById(coinId);
    if (!memeCoin) {
      return res.status(404).json({ message: "Meme coin not found" });
    }
    const votingStartTime = memeCoin.votingStartTime;

    if (!votingStartTime || Date.now() - votingStartTime > 3600000) {
      // 3600000 milliseconds = 1 hour
      console.log("Voting is not currently active");
      return res
        .status(403)
        .json({ message: "Voting is not currently active" });
    }

    // Check if the user has already voted
    const existingVote = await Vote.findOne({ userId: req.user.userId });
    if (existingVote) {
      return res.status(403).json({ message: "You have already voted " });
    }

    // Increment the votes for the meme coin

    memeCoin.votes += 1;
    await memeCoin.save();

    // Record the user's vote
    const vote = new Vote({
      memeCoinId: coinId,
      userId: req.user.userId,
    });
    await vote.save();

    res.status(200).json({ message: "Vote added successfully", memeCoin });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error voting for the meme coin");
  }
});

router.get('/winner', async (req, res) => {
    try {
      // Find the token with the highest votes
      const winner = await MemeCoin.findOne().sort({ votes: -1 }).limit(1);
      res.status(200).json(winner);
    } catch (error) {
      console.error('Error fetching winner:', error);
      res.status(500).json({ message: 'Error fetching winner' });
    }
  });
router.route("/coins").get(async (req, res) => {
  try {
    const memeCoins = await MemeCoin.find();
    res.status(200).json(memeCoins);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching meme coins from the database");
  }
});

router.route("/generate").post(async (req, res) => {
  try {
    const { prompt } = req.body;
    const numImages = 20; // Number of images to generate

    const imageGenerationPromises = [];

    for (let i = 0; i < numImages; i++) {
      const imageGenerationPromise = openaiClient.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
      });

      imageGenerationPromises.push(imageGenerationPromise);
    }

    // Execute all promises simultaneously
    const responses = await Promise.all(imageGenerationPromises);

    const memeCoins = responses.map((response) => ({
      imageUrl: response.data[0].url,
      votes: 0, // Initialize votes to 0
    }));

    votingStartTime = Date.now();

    // Save meme coins along with the start time
    const memeCoinsWithTime = memeCoins.map((coin) => ({
      ...coin,
      votingStartTime: votingStartTime,
    }));
    await MemeCoin.insertMany(memeCoinsWithTime);

    res.status(200).json({
      message: "Meme tokens generated and stored successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error?.response?.data || "Something went wrong");
  }
});

module.exports = router;
