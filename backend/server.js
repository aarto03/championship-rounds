const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Cloud Connection Configuration String Fallback Matrix
const productionURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/championship_rounds';
const localBackupURI = 'mongodb+srv://aarto02:Doom1315%5E%26@cluster0.vfp8t6j.mongodb.net/championship_rounds?appName=Cluster0';

// Connect to MongoDB (Tries production environment variables first, then falls back securely)
mongoose.connect(productionURI)
  .then(() => console.log('🔥 MongoDB Connected Successfully to Environment Target!'))
  .catch(() => {
    console.log('🔄 Environment loader failed. Connecting via secure hardcoded fallback string...');
    mongoose.connect(localBackupURI)
      .then(() => console.log('🔥 MongoDB Connected Successfully via Fallback Cluster!'))
      .catch(err => console.warn('⚠️ MongoDB completely offline. Error:', err.message));
  });

// --- DATA SCHEMAS ---
const UserProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  score: { type: Number, default: 0 } 
});
const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', UserProfileSchema);

const PredictionSchema = new mongoose.Schema({
  userId: { type: String, required: true }, 
  matchId: { type: String, required: true },
  matchup: { type: String, required: true },
  weightClass: { type: String, required: true },
  predictedWinner: { type: String, required: true },
  method: { type: String, required: true },
  round: { type: Number, required: true },
  isGraded: { type: Boolean, default: false },
  pointsEarned: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
PredictionSchema.index({ userId: 1, matchId: 1 }, { unique: true });
const Prediction = mongoose.models.Prediction || mongoose.model('Prediction', PredictionSchema);

const HypeTrainSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  division: { type: String, required: true },
  predictedChampion: { type: String, required: true },
  isGraded: { type: Boolean, default: false },
  pointsEarned: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
HypeTrainSchema.index({ userId: 1, division: 1 }, { unique: true });
const HypeTrain = mongoose.models.HypeTrain || mongoose.model('HypeTrain', HypeTrainSchema);

const upcomingFightCard = [
  { id: "ufc_281_01", stage: "Main Event", cardType: "Main", weightClass: "Middleweight", fighterA: { name: "Dricus Du Plessis", record: "23-3-0" }, fighterB: { name: "Kamaru Usman", record: "21-4-0" } },
  { id: "ufc_281_02", stage: "Co-Main Event", cardType: "Main", weightClass: "Middleweight", fighterA: { name: "Jared Cannonier", record: "18-9-0" }, fighterB: { name: "Christian Leroy Duncan", record: "14-2-0" } },
  { id: "ufc_281_03", stage: "Main Card", cardType: "Main", weightClass: "Lightweight", fighterA: { name: "Chase Hooper", record: "16-5-1" }, fighterB: { name: "Mitch Ramirez", record: "8-3-0" } },
  { id: "ufc_281_04", stage: "Main Card", cardType: "Main", weightClass: "Women's Strawweight", fighterA: { name: "Tabatha Ricci", record: "12-4-0" }, fighterB: { name: "Fatima Kline", record: "9-1-0" } },
  { id: "ufc_281_05", stage: "Main Card", cardType: "Main", weightClass: "Featherweight", fighterA: { name: "Tommy McMillen", record: "10-0-0" }, fighterB: { name: "Alberto Montes", record: "12-1-0" } },
  { id: "ufc_281_06", stage: "Prelims", cardType: "Prelims", weightClass: "Featherweight", fighterA: { name: "Austin Bashi", record: "14-1-0" }, fighterB: { name: "Jose Delgado", record: "11-2-0" } },
  { id: "ufc_281_07", stage: "Prelims", cardType: "Prelims", weightClass: "Welterweight", fighterA: { name: "Jean-Paul Lebosnoyani", record: "10-2-0" }, fighterB: { name: "Ko Seok-hyeon", record: "13-2-0" } },
  { id: "ufc_281_08", stage: "Prelims", cardType: "Prelims", weightClass: "Light Heavyweight", fighterA: { name: "Levi Rodrigues Jr.", record: "5-0-0, 1NC" }, fighterB: { name: "Felipe Franco", record: "10-2-0" } },
  { id: "ufc_281_09", stage: "Prelims", cardType: "Prelims", weightClass: "Flyweight", fighterA: { name: "Alden Coria", record: "12-3-0, 1NC" }, fighterB: { name: "Stewart Nicoll", record: "8-3-0" } },
  { id: "ufc_281_10", stage: "Prelims", cardType: "Prelims", weightClass: "Heavyweight", fighterA: { name: "RJ Harris", record: "5-0-0" }, fighterB: { name: "Alvin Hines", record: "7-1-0" } },
  { id: "ufc_281_11", stage: "Prelims", cardType: "Prelims", weightClass: "Women's Flyweight", fighterA: { name: "Anna Melisano", record: "6-1-0" }, fighterB: { name: "Dione Barbosa", record: "9-4-0" } }
];

// --- API ENDPOINTS ---

app.get('/api/test', (req, res) => {
  res.json({ message: "Online (Connected to Backend API)" });
});

app.get('/api/fights', (req, res) => {
  res.json(upcomingFightCard);
});

// GET: Fetch All User Profiles
app.get('/api/profiles', async (req, res) => {
  try {
    const profiles = await UserProfile.find({});
    res.json({ success: true, data: profiles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST: Create New Profile
app.post('/api/profiles', async (req, res) => {
  try {
    const { username, userId } = req.body;
    if (!username) return res.status(400).json({ success: false, message: "Username is required." });
    
    const id = userId || `user_${Date.now()}`;
    const newProfile = await UserProfile.create({ userId: id, username, score: 0 });
    res.status(201).json({ success: true, data: newProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE: Remove Profile and Cascade Delete Predictions/Hype Trains
app.delete('/api/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await UserProfile.findOneAndDelete({ userId });
    await Prediction.deleteMany({ userId });
    await HypeTrain.deleteMany({ userId });
    res.json({ success: true, message: "Profile and associated data purged successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET: Fetch Specific User Profile
app.get('/api/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST: Update Specific Username
app.post('/api/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { username } = req.body;
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId }, 
      { username }, 
      { new: true, upsert: true }
    );
    res.json({ success: true, data: updatedProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET: Fetch Predictions for Specific User
app.get('/api/predictions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userPicks = await Prediction.find({ userId });
    res.json({ success: true, data: userPicks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST: Save/Update Prediction for Specific User
app.post('/api/predictions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { matchId, matchup, weightClass, predictedWinner, method, round } = req.body;
    const updatedPrediction = await Prediction.findOneAndUpdate(
      { userId, matchId },
      { matchup, weightClass, predictedWinner, method, round: parseInt(round), isGraded: false, pointsEarned: 0 },
      { new: true, upsert: true }
    );
    res.status(201).json({ success: true, data: updatedPrediction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE: Remove/Deselect a Prediction for Specific User
app.delete('/api/predictions/:userId/:matchId', async (req, res) => {
  try {
    const { userId, matchId } = req.params;
    const deletedPick = await Prediction.findOneAndDelete({ userId, matchId });
    if (!deletedPick) {
      return res.status(404).json({ success: false, message: "Prediction slot not found." });
    }
    res.status(200).json({ success: true, message: "Prediction cleared successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET: Fetch Hype Trains for Specific User
app.get('/api/hypetrain/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userHype = await HypeTrain.find({ userId });
    const hypeMap = {};
    userHype.forEach(item => {
      hypeMap[item.division] = item.predictedChampion;
    });
    res.json({ success: true, data: hypeMap });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST: Save Hype Train Selection for Specific User
app.post('/api/hypetrain/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { division, predictedChampion } = req.body;
    if (!predictedChampion) {
      await HypeTrain.findOneAndDelete({ userId, division });
      return res.status(200).json({ success: true, message: "Removed from Hype Train." });
    }
    const updatedHype = await HypeTrain.findOneAndUpdate(
      { userId, division },
      { predictedChampion, isGraded: false, pointsEarned: 0 },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, data: updatedHype });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- DYNAMIC MULTI-USER GAME SCORING SIMULATOR ENGINE ---
app.post('/api/sim-results', async (req, res) => {
  try {
    const { type, id, actualWinner, actualMethod, actualRound, division } = req.body;

    if (type === 'fight') {
      const predictionsToGrade = await Prediction.find({ matchId: id, isGraded: false });
      
      for (const pred of predictionsToGrade) {
        let pointDelta = 0;
        if (pred.predictedWinner === actualWinner) {
          let calculatedPoints = 10; 
          const roundCorrect = pred.round === parseInt(actualRound);
          const methodCorrect = pred.method === actualMethod;

          if (roundCorrect && methodCorrect) {
            calculatedPoints = 30; 
          } else if (roundCorrect || methodCorrect) {
            calculatedPoints = 15; 
          }
          pointDelta = calculatedPoints;
          pred.pointsEarned = calculatedPoints;
        }
        pred.isGraded = true;
        await pred.save();

        if (pointDelta > 0) {
          await UserProfile.findOneAndUpdate(
            { userId: pred.userId },
            { $inc: { score: pointDelta } }
          );
        }
      }
    } else if (type === 'hypetrain') {
      const trainsToGrade = await HypeTrain.find({ division: division, isGraded: false });

      for (const train of trainsToGrade) {
        if (train.predictedChampion === actualWinner) {
          train.pointsEarned = 50;
          train.isGraded = true;
          await train.save();

          await UserProfile.findOneAndUpdate(
            { userId: train.userId },
            { $inc: { score: 50 } }
          );
        }
      }
    }

    res.json({ success: true, message: "Scores compiled globally for all competitors!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server listening smoothly on port ${PORT}`));