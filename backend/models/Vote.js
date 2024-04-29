const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  memeCoinId: { type: mongoose.Schema.Types.ObjectId, ref: 'MemeCoin', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true , unique: true },
  createdAt: { type: Date, default: Date.now }
});

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
