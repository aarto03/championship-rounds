const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  userId: { type: String, default: "mock_user_123" }, 
  matchId: { type: String, required: true },
  matchup: { type: String, required: true },
  weightClass: { type: String, required: true },
  predictedWinner: { type: String, required: true },
  method: { type: String, required: true },
  round: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prediction', PredictionSchema);