const mongoose = require('mongoose');

const HypeTrainSchema = new mongoose.Schema({
  userId: { type: String, default: "mock_user_123" },
  division: { type: String, required: true },
  predictedChampion: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HypeTrain', HypeTrainSchema);