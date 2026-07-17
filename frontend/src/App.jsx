import React, { useState, useEffect } from 'react';

// 1. Production API Base Routing Endpoint Setup
const API_BASE = 'https://championship-rounds-backend.onrender.com/api';

function App() {
  // --- Core Application State Matrix ---
  const [activeTab, setActiveTab] = useState('predictions'); // tabs: 'predictions' | 'leaderboard'
  const [profiles, setProfiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // --- Mock Data: Sample Card Structure ---
  const activeFights = [
    {
      id: 'ufc_281_01',
      division: "Men's Middleweight",
      fighterA: 'Dricus Du Plessis',
      fighterB: 'Kamaru Usman',
      methods: ['KO/TKO', 'Submission', 'Decision'],
      rounds: [1, 2, 3, 4, 5]
    },
    {
      id: 'ufc_281_02',
      division: "Men's Bantamweight",
      fighterA: 'Petr Yan',
      fighterB: 'Marlon Vera',
      methods: ['KO/TKO', 'Submission', 'Decision'],
      rounds: [1, 2, 3, 4, 5]
    }
  ];

  // --- Lifecycles & Sync Hooks ---
  useEffect(() => {
    // Standard initialization: Initialize or pull current player profile framework
    initUserProfile();
  }, []);

  useEffect(() => {
    // Automatically query database updates whenever switching tab focus views
    if (activeTab === 'leaderboard') {
      fetchLeaderboards();
    }
  }, [activeTab]);

  // --- Network API Actions ---
  const initUserProfile = async () => {
    try {
      setLoading(true);
      // Look for an existing profile session or generate a persistent test user
      const savedUserId = localStorage.getItem('cr_user_id') || `user_${Date.now()}`;
      localStorage.setItem('cr_user_id', savedUserId);

      // Register or fetch user details from backend registry
      const response = await fetch(`${API_BASE}/profiles`);
      const data = await response.json();
      
      if (data.success && data.data) {
        let existingUser = data.data.find(p => p.userId === savedUserId);
        
        if (!existingUser) {
          // If profile is fresh, write the mapping document to MongoDB
          const createRes = await fetch(`${API_BASE}/profiles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: savedUserId, username: 'test_fighter' })
          });
          const createdData = await createRes.json();
          existingUser = createdData.data;
        }
        setCurrentUser(existingUser);
        fetchUserPredictions(savedUserId);
      }
    } catch (err) {
      console.error("Initialization pipeline breakdown:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPredictions = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/predictions/${userId}`);
      const data = await response.json();
      if (data.success && data.data) {
        // Map records into localized key-value layout state
        const predictionMap = {};
        data.data.forEach(p => {
          predictionMap[p.matchId] = p;
        });
        setPredictions(predictionMap);
      }
    } catch (err) {
      console.error("Failed fetching active prediction slips:", err);
    }
  };

  const fetchLeaderboards = async () => {
    try {
      setLoading(true);
      // CACHE BUSTING FIX: Append unique dynamic string token sequence to dodge 304 browser locks
      const response = await fetch(`${API_BASE}/profiles?t=${Date.now()}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        // Sort descending by highest numeric score evaluation values
        const sorted = data.data.sort((a, b) => b.score - a.score);
        setProfiles(sorted);
      }
    } catch (err) {
      console.error("Error building leaderboard profile sets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPrediction = async (matchId, fighter, method, round) => {
    if (!currentUser) return;
    try {
      const targetPayload = {
        userId: currentUser.userId,
        matchId,
        predictedWinner: fighter,
        predictedMethod: method,
        predictedRound: parseInt(round)
      };

      const response = await fetch(`${API_BASE}/predictions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetPayload)
      });
      
      const data = await response.json();
      if (data.success) {
        setPredictions(prev => ({ ...prev, [matchId]: data.data }));
        flashAlert('Prediction locked and synchronized to cloud cluster!');
      }
    } catch (err) {
      console.error("Failed pushing submission card array:", err);
    }
  };

  const handleClearPrediction = async (matchId) => {
    if (!currentUser || !predictions[matchId]) return;
    try {
      const response = await fetch(`${API_BASE}/predictions/${matchId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.userId })
      });
      
      const data = await response.json();
      if (data.success) {
        setPredictions(prev => {
          const updated = { ...prev };
          delete updated[matchId];
          return updated;
        });
        flashAlert('Prediction cleared from database schema.');
      }
    } catch (err) {
      console.error("Deletion target routing pipeline failed:", err);
    }
  };

  // --- Simulated Trigger Request (Trigger Multi-User Scoring Engine) ---
  const handleTriggerSimulation = async (type, matchId, fighter, method, round) => {
    try {
      setLoading(true);
      const payload = type === 'fight' 
        ? { type, id: matchId, actualWinner: fighter, actualMethod: method, actualRound: round.toString() }
        : { type, division: "Men's Bantamweight", actualWinner: fighter };

      const response = await fetch(`${API_BASE}/sim-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        flashAlert('⚡ Engine execution complete: Match scored and points distributed!');
        // Instantly force-fetch the fresh scores rather than waiting on component reload cycles
        await fetchLeaderboards();
        if (currentUser) await initUserProfile();
      }
    } catch (err) {
      console.error("Simulation sequence engine failure:", err);
    } finally {
      setLoading(false);
    }
  };

  const flashAlert = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // --- UI Layout Render ---
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans antialiased">
      {/* Global Header Bar */}
      <header className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-black tracking-wider text-red-500 uppercase">🏆 Championship Rounds</h1>
          {currentUser && (
            <div className="bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700 text-sm">
              User: <span className="font-mono text-yellow-400 font-bold">{currentUser.username}</span> | 
              Score: <span className="text-emerald-400 font-bold ml-1">{currentUser.score} PTS</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Container Core */}
      <main className="max-w-4xl mx-auto p-4 md:p-6 pb-24">
        {/* Status System Prompts Notification Banner */}
        {statusMessage && (
          <div className="mb-4 bg-emerald-950/80 border border-emerald-500 text-emerald-300 px-4 py-3 rounded-xl text-sm font-semibold text-center animate-pulse shadow-lg shadow-emerald-950/20">
            {statusMessage}
          </div>
        )}

        {/* Tab Selection Row Layout Controls */}
        <div className="flex bg-gray-800 p-1 rounded-xl mb-6 border border-gray-700 max-w-sm">
          <button 
            onClick={() => setActiveTab('predictions')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'predictions' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Fight Cards
          </button>
          <button 
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'leaderboard' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Leaderboards
          </button>
        </div>

        {loading && <div className="text-center text-sm text-gray-400 py-8 animate-bounce">Processing database streams...</div>}

        {/* --- VIEW TAB 1: CARD PREDICTION MATRICES --- */}
        {!loading && activeTab === 'predictions' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {activeFights.map(fight => {
                const existing = predictions[fight.id];
                return (
                  <div key={fight.id} className="bg-gray-800 p-5 rounded-2xl border border-gray-700 relative overflow-hidden shadow-xl flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-1">{fight.division}</span>
                      <div className="flex items-center justify-between my-3">
                        <span className={`text-base font-bold ${existing?.predictedWinner === fight.fighterA ? 'text-yellow-400' : ''}`}>{fight.fighterA}</span>
                        <span className="text-xs font-black text-gray-500 px-2">VS</span>
                        <span className={`text-base font-bold text-right ${existing?.predictedWinner === fight.fighterB ? 'text-yellow-400' : ''}`}>{fight.fighterB}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-700/60 space-y-3">
                      {existing ? (
                        <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-700/50 text-xs space-y-1">
                          <p className="text-gray-400">Your Lock: <span className="text-white font-bold">{existing.predictedWinner}</span></p>
                          <p className="text-gray-400">Method: <span className="text-white font-bold">{existing.predictedMethod} (RD {existing.predictedRound})</span></p>
                          <button 
                            onClick={() => handleClearPrediction(fight.id)}
                            className="w-full mt-2 bg-gray-700 hover:bg-red-900/60 hover:text-red-200 text-gray-300 py-1 rounded-lg text-xs font-bold transition-all duration-150"
                          >
                            Change Selection
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => handleSelectPrediction(fight.id, fight.fighterA, fight.methods[0], fight.rounds[1])}
                            className="bg-gray-700 hover:bg-gray-650 text-white py-2 px-3 rounded-xl text-xs font-bold transition-colors"
                          >
                            Pick {fight.fighterA.split(' ').pop()} (KO - R2)
                          </button>
                          <button 
                            onClick={() => handleSelectPrediction(fight.id, fight.fighterB, fight.methods[2], fight.rounds[4])}
                            className="bg-gray-700 hover:bg-gray-650 text-white py-2 px-3 rounded-xl text-xs font-bold transition-colors"
                          >
                            Pick {fight.fighterB.split(' ').pop()} (DEC)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hidden Built-in Administrative Panel for Scoring Operations */}
            <div className="mt-8 bg-gray-950 p-5 rounded-2xl border border-gray-800 shadow-inner">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                ⚙️ Admin Sandbox Grading Simulation Panel
              </h3>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Clicking these execution shortcuts bypasses terminal inputs and fires structured payload scripts directly down your live API node endpoint to parse and evaluate target scores instantly.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleTriggerSimulation('fight', 'ufc_281_01', 'Dricus Du Plessis', 'KO/TKO', 2)}
                  className="bg-red-950/40 hover:bg-red-900 border border-red-800 text-red-200 text-xs px-3 py-2 rounded-xl font-bold transition-all"
                >
                  Grade Match: Du Plessis (KO/TKO - R2)
                </button>
                <button
                  onClick={() => handleTriggerSimulation('hypetrain', null, 'Petr Yan', null, null)}
                  className="bg-blue-950/40 hover:bg-blue-900 border border-blue-800 text-blue-200 text-xs px-3 py-2 rounded-xl font-bold transition-all"
                >
                  Grade Hype Train: Petr Yan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW TAB 2: LIVE COMPETITION LEADERBOARDS --- */}
        {!loading && activeTab === 'leaderboard' && (
          <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
            <div className="p-4 bg-gray-950/40 border-b border-gray-700/60 flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase text-gray-400 tracking-wider">Global Standing Leaderboard</h2>
              <button 
                onClick={fetchLeaderboards} 
                className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-2.5 py-1 rounded-md font-bold transition-colors"
              >
                🔄 Manual Force Refresh
              </button>
            </div>
            {profiles.length === 0 ? (
              <div className="text-center text-gray-500 py-12 text-sm">No profile data streams registered in MongoDB Atlas.</div>
            ) : (
              <div className="divide-y divide-gray-700/50 font-mono">
                {profiles.map((profile, index) => (
                  <div 
                    key={profile._id} 
                    className={`flex items-center justify-between p-4 transition-colors ${profile.userId === currentUser?.userId ? 'bg-yellow-500/5 hover:bg-yellow-500/10' : 'hover:bg-gray-700/30'}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`text-sm font-black w-6 text-center ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-600' : 'text-gray-600'}`}>
                        {index + 1}
                      </span>
                      <span className={`text-sm font-medium text-gray-200 ${profile.userId === currentUser?.userId ? 'text-yellow-400 font-bold' : ''}`}>
                        {profile.username} {profile.userId === currentUser?.userId && ' (You)'}
                      </span>
                    </div>
                    <span className="text-sm font-black text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded">
                      {profile.score} PTS
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;