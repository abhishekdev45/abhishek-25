const mongoose = require('mongoose');

const memeCoinSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  votes: { type: Number, default: 0 },
  votingStartTime: { type: Date }
});

const MemeCoin = mongoose.model('MemeCoin', memeCoinSchema);

module.exports = MemeCoin;
