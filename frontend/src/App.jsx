import React, { useState, useEffect } from 'react';
import Leaderboards from './pages/Leaderboards';

const divisionRankings = {
  "Men's Flyweight": {
    champion: "Joshua Van",
    contenders: ["Alexandre Pantoja", "Manel Kape", "Tatsuro Taira", "Brandon Royval", "Lone'er Kavanagh", "Asu Almabayev", "Kyoji Horiguchi", "Amir Albazi", "Brandon Moreno", "Kevin Borjas", "Mitch Raposo", "Sumudaerji", "Steve Erceg", "Alex Perez", "Joseph Morales"]
  },
  "Men's Bantamweight": {
    champion: "Petr Yan",
    contenders: ["Merab Dvalishvili", "Umar Nurmagomedov", "Sean O'Malley", "Cory Sandhagen", "Mario Bautista", "Song Yadong", "David Martinez", "Raoni Barcelos", "Marcus McGhee", "Farid Basharat", "Deiveson Figueiredo", "Aiemann Zahabi", "Charles Jourdain", "Bryce Mitchell", "Montel Jackson"]
  },
  "Men's Featherweight": {
    champion: "Alexander Volkanovski",
    contenders: ["Movsar Evloev", "Diego Lopes", "Lerone Murphy", "Aljamain Sterling", "Arnold Allen", "Jean Silva", "Pat Sabatini", "Youssef Zalal", "Nathaniel Wood", "Kevin Vallejos", "Melquizael Costa", "Steve Garcia", "Aaron Pico", "Joanderson Brito", "Jose Miguel Delgado"]
  },
  "Men's Lightweight": {
    champion: "Justin Gaethje",
    contenders: ["Ilia Topuria", "Arman Tsarukyan", "Charles Oliveira", "Max Holloway", "Benoît Saint Denis", "Mateusz Gamrot", "Renato Moicano", "Quillan Salkilld", "Paddy Pimblett", "Mauricio Ruffy", "Dan Hooker", "Tom Nolan", "Rafael Fiziev", "Grant Dawson", "Rafa Garcia"]
  },
  "Men's Welterweight": {
    champion: "Islam Makhachev",
    contenders: ["Carlos Prates", "Ian Machado Garry", "Michael Morales", "Jack Della Maddalena", "Sean Brady", "Gabriel Bonfim", "Belal Muhammad", "Leon Edwards", "Joaquin Buckley", "Kamaru Usman", "Mike Malott", "Michael Venom Page", "Daniel Rodriguez", "Uroš Medić", "Yaroslav Amosov"]
  },
  "Men's Middleweight": {
    champion: "Sean Strickland",
    contenders: ["Khamzat Chimaev", "Dricus Du Plessis", "Nassourdine Imavov", "Joe Pyfer", "Brendan Allen", "Caio Borralho", "Anthony Hernandez", "Israel Adesanya", "Gregory Rodrigues", "Ikram Aliskerov", "Jared Cannonier", "Christian Leroy Duncan", "Bo Nickal", "Paulo Costa", "Abus Magomedov"]
  },
  "Men's Light Heavyweight": {
    champion: "Carlos Ulberg",
    contenders: ["Alex Pereira", "Magomed Ankalaev", "Jiří Procházka", "Paulo Costa", "Jamahal Hill", "Khalil Rountree Jr.", "Dominick Reyes", "Volkan Oezdemir", "Azamat Murzakanov", "Bogdan Guskov", "Dustin Jacoby", "Navajo Stirling", "Alonzo Menifield", "Johnny Walker", "Jan Błachowicz"]
  },
  "Men's Heavyweight": {
    champion: "Tom Aspinall",
    contenders: ["Ciryl Gane", "Alexander Volkov", "Sergei Pavlovich", "Alex Pereira", "Josh Hokit", "Waldo Cortes-Acosta", "Rizvan Kuniev", "Curtis Blaydes", "Serghei Spivac", "Vitor Petrino", "Valter Walker", "Brando Peričić", "Mario Pinto", "Mick Parkin", "Ryan Spann"]
  },
  "Women's Strawweight": {
    champion: "Mackenzie Dern",
    contenders: ["Zhang Weili", "Virna Jandiroba", "Tatiana Suarez", "Gillian Robertson", "Yan Xiaonan", "Piera Rodriguez", "Tabatha Ricci", "Denise Gomes", "Mizuki", "Alexia Thainara", "Amanda Lemos", "Loopy Godinez", "Jaqueline Amorim", "Fatima Kline", "Talita Alencar"]
  },
  "Women's Flyweight": {
    champion: "Valentina Shevchenko",
    contenders: ["Natalia Silva", "Manon Fiorot", "Alexa Grasso", "Erin Blanchfield", "Zhang Weili", "Jasmine Jasudavicius", "Rose Namajunas", "Tracy Cortez", "Maycee Barber", "Wang Cong", "Miranda Maverick", "JJ Aldrich", "Karine Silva", "Eduarda Moura", "Casey O'Neill"]
  },
  "Women's Bantamweight": {
    champion: "Kayla Harrison",
    contenders: ["Joselyne Edwards", "Norma Dumont", "Luana Santos", "Julianna Peña", "Ailin Perez", "Yana Santos", "Jacqueline Cavalcanti", "Michelle Montague", "Melissa Croden", "Karol Rosa", "Bia Mesquita", "Irene Aldana", "Macy Chiasson", "Daria Zhelezniakova", "Raquel Pennington"]
  }
};

// DEV CONFIG: Switch 'http://localhost:5000/api' to your public Render backend URL when ready to host
const API_BASE = 'https://championship-rounds-backend.onrender.com/api';

function App() {
  const [serverStatus, setServerStatus] = useState('Connecting to API...');
  const [activeTab, setActiveTab] = useState('Fight Card');
  const [fights, setFights] = useState([]);
  const [predictions, setPredictions] = useState({});
  
  // App Global Sync States
  const [players, setPlayers] = useState([]);
  const [currentPlayerId, setCurrentPlayerId] = useState(localStorage.getItem('activeCompetitionPlayerId') || "user_1");
  const [profilePicks, setProfilePicks] = useState([]);
  const [hypeTrainSelections, setHypeTrainSelections] = useState({});

  const [newPlayerName, setNewPlayerName] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("Men's Bantamweight");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editNameVal, setEditNameVal] = useState("");

  const activeUser = players.find(p => p.userId === currentPlayerId) || players[0];
  const score = activeUser?.score || 0;

  // 1. Initial Load: Check API Status, Load Fights & Group Profiles
  useEffect(() => {
    fetch(`${API_BASE}/test`)
      .then((res) => res.json())
      .then((data) => setServerStatus(data.message))
      .catch(() => setServerStatus('Offline (Backend server not running)'));

    fetch(`${API_BASE}/fights`)
      .then((res) => res.json())
      .then((data) => { if (data && data.length > 0) setFights(data); })
      .catch(() => console.error("Fight card could not load from server."));

    fetchProfiles();
  }, []);

  // 2. Secondary Sync: Fetch User-Specific Info when Current Player Swaps
  useEffect(() => {
    if (!currentPlayerId) return;
    localStorage.setItem('activeCompetitionPlayerId', currentPlayerId);
    fetchUserPredictions(currentPlayerId);
    fetchUserHypeTrains(currentPlayerId);
  }, [currentPlayerId]);

  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${API_BASE}/profiles`);
      const resData = await res.json();
      if (resData.success) {
        setPlayers(resData.data);
        if (resData.data.length > 0 && !resData.data.some(p => p.userId === currentPlayerId)) {
          setCurrentPlayerId(resData.data[0].userId);
        }
      }
    } catch (e) {
      console.error("Error loading network player records:", e);
    }
  };

  const fetchUserPredictions = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/predictions/${userId}`);
      const resData = await res.json();
      if (resData.success) {
        setProfilePicks(resData.data);
      }
    } catch (e) {
      console.error("Failed syncing slips:", e);
    }
  };

  const fetchUserHypeTrains = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/hypetrain/${userId}`);
      const resData = await res.json();
      if (resData.success) {
        setHypeTrainSelections(resData.data || {});
      }
    } catch (e) {
      console.error("Failed syncing hype trains:", e);
    }
  };

  const handleSelection = (fightId, field, value) => {
    setPredictions((prev) => ({
      ...prev,
      [fightId]: { ...prev[fightId], [field]: value }
    }));
  };

  const addNewCompetitor = async (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    
    const generatedId = `user_${Date.now()}`;

    try {
      const res = await fetch(`${API_BASE}/profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: newPlayerName.trim(),
          userId: generatedId
        })
      });
      const resData = await res.json();
      if (resData.success) {
        setPlayers(prev => [...prev, resData.data]);
        setCurrentPlayerId(resData.data.userId);
        setNewPlayerName("");
      }
    } catch (err) {
      alert("Error generating your network account registry configuration.");
    }
  };

  const handleDeletePlayer = async (userId, e) => {
    e.stopPropagation(); 
    if (players.length <= 1) {
      alert("You must keep at least one profile in the local cluster!");
      return;
    }
    if (!window.confirm("Are you sure you want to permanently delete this profile and all its locked predictions?")) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/profile/${userId}`, {
        method: 'DELETE'
      });
      const resData = await res.json();
      if (resData.success) {
        const remainingPlayers = players.filter(p => p.userId !== userId);
        setPlayers(remainingPlayers);
        if (currentPlayerId === userId) {
          setCurrentPlayerId(remainingPlayers[0].userId);
        }
      }
    } catch (err) {
      alert("Failed to delete the database entry.");
    }
  };

  const handlePlayerSwap = (id) => {
    setCurrentPlayerId(id);
    setPredictions({});
  };

  const lockInPick = async (fightId) => {
    const pick = predictions[fightId];
    const fightDetails = fights.find(f => f.id === fightId);

    if (!pick?.predictedWinner || !pick?.method || !pick?.round) {
      alert("Please complete all pick criteria!");
      return;
    }

    const payload = {
      matchId: fightId,
      weightClass: fightDetails?.weightClass || 'MMA Bout',
      matchup: `${fightDetails?.fighterA?.name} vs. ${fightDetails?.fighterB?.name}`,
      predictedWinner: pick.predictedWinner,
      method: pick.method,
      round: parseInt(pick.round)
    };

    try {
      const res = await fetch(`${API_BASE}/predictions/${currentPlayerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (resData.success) {
        fetchUserPredictions(currentPlayerId);
        alert(`🎯 Pick Logged for ${payload.matchup}!`);
      }
    } catch (e) {
      alert("Could not process choice execution securely.");
    }
  };

  const handleDeselectPick = async (fightId) => {
    try {
      const res = await fetch(`${API_BASE}/predictions/${currentPlayerId}/${fightId}`, {
        method: 'DELETE'
      });
      const resData = await res.json();
      if (resData.success) {
        fetchUserPredictions(currentPlayerId);
      }
    } catch (e) {
      console.error("Error wiping item selection execution metadata:", e);
    }
  };

  const handleHypeTrainBoarding = async (division, contenderName) => {
    const isCurrentlyBoarded = hypeTrainSelections[division] === contenderName;
    const targetChampion = isCurrentlyBoarded ? null : contenderName;

    try {
      const res = await fetch(`${API_BASE}/hypetrain/${currentPlayerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ division, predictedChampion: targetChampion })
      });
      const resData = await res.json();
      if (resData.success) {
        fetchUserHypeTrains(currentPlayerId);
      }
    } catch (e) {
      console.error("Error mapping hype update matrix:", e);
    }
  };

  const saveUsernameChange = async () => {
    if (!editNameVal.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/profile/${currentPlayerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: editNameVal.trim() })
      });
      const resData = await res.json();
      if (resData.success) {
        setPlayers(prev => prev.map(p => p.userId === currentPlayerId ? { ...p, username: resData.data.username } : p));
        setIsEditingUsername(false);
      }
    } catch (e) {
      console.error("Username mutation failure.");
    }
  };

  const gradeLocalScores = async (payload) => {
    try {
      const res = await fetch(`${API_BASE}/sim-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (resData.success) {
        fetchProfiles(); 
        fetchUserPredictions(currentPlayerId);
        fetchUserHypeTrains(currentPlayerId);
        alert("Scores updated across database clusters successfully.");
      }
    } catch (e) {
      console.error("Failed cascading score changes across cluster nodes:", e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-yellow-500 selection:text-black pb-20">
      
      {/* Top Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black tracking-widest text-yellow-500 uppercase">CHAMPIONSHIP ROUNDS</h1>
          <span className="hidden sm:inline bg-gray-950 border border-gray-800 text-[10px] text-gray-400 font-mono px-2 py-1 rounded">
            👤 Profile: <span className="text-yellow-400 font-bold">{activeUser?.username || "Guest"}</span>
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm font-semibold text-gray-400">
          {['Fight Card', 'Leaderboards', 'My Profile'].map((tab) => (
            <span key={tab} onClick={() => setActiveTab(tab)} className={`hover:text-white cursor-pointer pb-1 transition ${activeTab === tab ? 'text-yellow-500 border-b-2 border-yellow-500' : ''}`}>{tab}</span>
          ))}
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-14">
        
        {activeTab === 'Fight Card' && (
          <>
            <section className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Lock In Your Picks. Build Your Streak.</h2>
              <p className="text-gray-400">Logged in as <span className="text-yellow-500 font-bold">{activeUser?.username || "Guest"}</span>. Submit predictions to stack your point tokens.</p>
            </section>

            {/* EVENT MATCHUPS */}
            <section className="space-y-10">
              <div className="space-y-4">
                <h3 className="text-lg font-bold uppercase tracking-wider text-yellow-500 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span> Main Card Predictions
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {fights.filter(f => f.cardType === 'Main').map((fight) => {
                    const currentPick = predictions[fight.id] || {};
                    return (
                      <div key={fight.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-between hover:border-gray-700 transition">
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-955 px-2.5 py-1 rounded">{fight.stage}</span>
                          <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2.5 py-1 rounded">{fight.weightClass}</span>
                        </div>
                        <div className="flex justify-between items-center text-center px-2 gap-4">
                          <button onClick={() => handleSelection(fight.id, 'predictedWinner', fight.fighterA?.name)} className={`w-5/12 p-3 rounded-lg border transition text-center ${currentPick.predictedWinner === fight.fighterA?.name ? 'border-yellow-500 bg-yellow-500/10 shadow-yellow-500/5' : 'border-gray-800 bg-gray-950/50'}`}>
                            <h4 className="font-bold text-sm">{fight.fighterA?.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">{fight.fighterA?.record}</p>
                          </button>
                          <span className="text-xs italic font-black text-gray-600 bg-gray-955 p-2 rounded-full border border-gray-800 shrink-0">VS</span>
                          <button onClick={() => handleSelection(fight.id, 'predictedWinner', fight.fighterB?.name)} className={`w-5/12 p-3 rounded-lg border transition text-center ${currentPick.predictedWinner === fight.fighterB?.name ? 'border-yellow-500 bg-yellow-500/10 shadow-yellow-500/5' : 'border-gray-800 bg-gray-950/50'}`}>
                            <h4 className="font-bold text-sm">{fight.fighterB?.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">{fight.fighterB?.record}</p>
                          </button>
                        </div>
                        <div className="mt-8 pt-4 border-t border-gray-800/60 space-y-4">
                          <div className="grid grid-cols-3 gap-2">
                            {['KO/TKO', 'Submission', 'Decision'].map((method) => (
                              <button key={method} onClick={() => handleSelection(fight.id, 'method', method)} className={`py-2 text-xs font-bold rounded uppercase transition ${currentPick.method === method ? 'bg-yellow-500 text-black font-black' : 'bg-gray-950 text-gray-400'}`}>{method}</button>
                            ))}
                          </div>
                          <div className="grid grid-cols-5 gap-1.5">
                            {[1, 2, 3, 4, 5].map((round) => (
                              <button key={round} onClick={() => handleSelection(fight.id, 'round', round)} className={`py-1.5 text-xs font-bold rounded transition ${currentPick.round === round ? 'bg-red-600 text-white font-black' : 'bg-gray-950 text-gray-500'}`}>R{round}</button>
                            ))}
                          </div>
                          {currentPick.predictedWinner && currentPick.method && currentPick.round && (
                            <button onClick={() => lockInPick(fight.id)} className="w-full bg-yellow-500 text-black font-black py-2 rounded text-xs uppercase tracking-wider transition">Lock In Pick</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PRELIMS */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-600 rounded-full"></span> Preliminary Bouts
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {fights.filter(f => f.cardType === 'Prelims').map((fight) => {
                    const currentPick = predictions[fight.id] || {};
                    return (
                      <div key={fight.id} className="bg-gray-900/60 border border-gray-800/80 rounded-xl p-6 flex flex-col justify-between hover:border-gray-700 transition">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-semibold text-gray-500 bg-gray-955/80 px-2 py-0.5 rounded">{fight.stage}</span>
                          <span className="text-xs font-semibold text-gray-400 bg-gray-800/40 px-2 py-0.5 rounded">{fight.weightClass}</span>
                        </div>
                        <div className="flex justify-between items-center text-center gap-2">
                          <button onClick={() => handleSelection(fight.id, 'predictedWinner', fight.fighterA?.name)} className={`w-5/12 p-2 rounded border text-xs transition ${currentPick.predictedWinner === fight.fighterA?.name ? 'border-yellow-500 text-yellow-500 bg-yellow-500/5' : 'border-gray-800 bg-gray-950/30'}`}>
                            <span className="font-bold block">{fight.fighterA?.name}</span>
                            <span className="text-[10px] text-gray-500 block mt-0.5">{fight.fighterA?.record}</span>
                          </button>
                          <span className="text-xs font-bold text-gray-700">VS</span>
                          <button onClick={() => handleSelection(fight.id, 'predictedWinner', fight.fighterB?.name)} className={`w-5/12 p-2 rounded border text-xs transition ${currentPick.predictedWinner === fight.fighterB?.name ? 'border-yellow-500 text-yellow-500 bg-yellow-500/5' : 'border-gray-800 bg-gray-950/30'}`}>
                            <span className="font-bold block">{fight.fighterB?.name}</span>
                            <span className="text-[10px] text-gray-500 block mt-0.5">{fight.fighterB?.record}</span>
                          </button>
                        </div>
                        {currentPick.predictedWinner && (
                          <div className="mt-4 pt-3 border-t border-gray-800/40 grid grid-cols-2 gap-2">
                            <select onChange={(e) => handleSelection(fight.id, 'method', e.target.value)} className="bg-gray-950 border border-gray-700 text-xs rounded p-1 text-gray-300 focus:outline-none" defaultValue=""><option value="" disabled>Method...</option><option value="KO/TKO">KO/TKO</option><option value="Submission">Submission</option><option value="Decision">Decision</option></select>
                            <select onChange={(e) => handleSelection(fight.id, 'round', e.target.value)} className="bg-gray-950 border border-gray-700 text-xs rounded p-1 text-gray-300 focus:outline-none" defaultValue=""><option value="" disabled>Round...</option><option value="1">R1</option><option value="2">R2</option><option value="3">R3</option><option value="4">R4</option><option value="5">R5</option></select>
                            {currentPick.method && currentPick.round && (
                              <button onClick={() => lockInPick(fight.id)} className="col-span-2 bg-yellow-500 text-black text-[11px] font-black py-1 rounded uppercase tracking-wider mt-1">Lock Prelim Pick</button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* HYPE TRAIN CONTENDER MATRIX */}
            <section className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-5">
                <div className="space-y-1">
                  <span className="text-[10px] font-black tracking-widest text-red-500 uppercase bg-red-500/10 px-2.5 py-0.5 rounded">Future Champions Pipeline</span>
                  <h3 className="text-xl font-bold">The Next Champion "Hype Train"</h3>
                  <p className="text-xs text-gray-400">Select a division, review the top 15 ranks, and pick who will claim the belt next.</p>
                </div>
                <select value={selectedDivision} onChange={(e) => setSelectedDivision(e.target.value)} className="bg-gray-950 border border-gray-700 rounded px-3 py-1.5 text-sm font-semibold text-yellow-500 focus:outline-none w-full md:w-auto">
                  {Object.keys(divisionRankings).map(div => <option key={div} value={div}>{div}</option>)}
                </select>
              </div>
              <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-lg px-4 py-3 flex justify-between items-center text-xs">
                <div><span className="text-gray-500 block font-bold uppercase tracking-wider text-[9px]">Reigning Titleholder</span><span className="text-sm font-black text-white uppercase tracking-wide">{divisionRankings[selectedDivision]?.champion}</span></div>
                <span className="text-yellow-500 font-extrabold uppercase tracking-widest bg-yellow-500/10 px-2.5 py-1 rounded text-[10px]">C</span>
              </div>
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-2">
                {divisionRankings[selectedDivision]?.contenders.map((contender, index) => {
                  const isOnTrain = hypeTrainSelections[selectedDivision] === contender;
                  return (
                    <div key={contender} className="bg-gray-900/40 border border-gray-800 rounded-lg p-3 flex justify-between items-center hover:border-gray-700 transition">
                      <div className="flex items-center gap-3"><span className="font-mono text-xs font-black text-gray-600 w-5 text-right">#{index + 1}</span><span className="text-xs font-bold text-gray-200">{contender}</span></div>
                      <button onClick={() => handleHypeTrainBoarding(selectedDivision, contender)} className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded transition ${isOnTrain ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-950 text-gray-400 hover:bg-gray-800'}`}>{isOnTrain ? '🚂 Boarded!' : 'Board Hype Train'}</button>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {activeTab === 'Leaderboards' && (
          <Leaderboards 
            players={players.map(p => ({
              ...p,
              id: p.userId, 
              username: p.username
            }))}
            currentPlayerId={currentPlayerId}
            username={activeUser?.username}
            score={score}
            fights={fights}
            divisionRankings={divisionRankings}
            gradeLocalScores={gradeLocalScores}
          />
        )}

        {activeTab === 'My Profile' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-yellow-500">Manage Local Group Profiles</h4>
                <p className="text-xs text-gray-400 mt-0.5">Swap profiles or remove challengers from the local competition circle.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {players.map(p => (
                  <div key={p.userId} className="flex items-center bg-gray-950 rounded border border-gray-800 overflow-hidden">
                    <button onClick={() => handlePlayerSwap(p.userId)} className={`text-xs px-3 py-1.5 font-bold transition ${p.userId === currentPlayerId ? 'bg-yellow-500 text-black font-black' : 'text-gray-400 hover:bg-gray-800'}`}>
                      👤 {p.username || "Anonymous"} ({p.score || 0} pts)
                    </button>
                    <button 
                      onClick={(e) => handleDeletePlayer(p.userId, e)}
                      className="px-2.5 py-1.5 bg-red-950/20 hover:bg-red-900/40 text-red-500 hover:text-red-400 text-xs transition border-l border-gray-850"
                      title="Delete Profile"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
              <form onSubmit={addNewCompetitor} className="flex gap-2 pt-2 border-t border-gray-800/60">
                <input type="text" placeholder="Add New Challenger Name..." value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} className="bg-gray-950 border border-gray-700 text-xs text-white px-3 py-1.5 rounded focus:outline-none focus:border-yellow-500 flex-1 max-w-sm" maxLength={20} />
                <button type="submit" className="bg-gray-800 hover:bg-yellow-500 text-gray-300 hover:text-black font-bold text-xs px-4 py-1.5 rounded transition border border-gray-700 hover:border-yellow-500">+ Add Player</button>
              </form>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
              <div className="border-b border-gray-800 pb-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider block">Championship Profile Card</span>
                  {isEditingUsername ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input type="text" value={editNameVal} onChange={(e) => setEditNameVal(e.target.value)} className="bg-gray-950 border border-gray-700 text-lg font-bold text-white px-3 py-1 rounded max-w-[200px]" maxLength={20} />
                      <button onClick={saveUsernameChange} className="bg-yellow-500 text-black text-xs font-black px-3 py-2 rounded uppercase">Save</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mt-1">
                      <h3 className="text-2xl font-black text-white uppercase tracking-wide">{activeUser?.username || "Guest"}</h3>
                      <button onClick={() => { setEditNameVal(activeUser?.username || "Guest"); setIsEditingUsername(true); }} className="text-[10px] text-gray-500 hover:text-yellow-500 uppercase font-bold border border-gray-800 px-2 py-0.5 rounded bg-gray-950/40">Edit</button>
                    </div>
                  )}
                  <p className="text-[11px] text-gray-500 font-mono">Mock ID: {activeUser?.userId}</p>
                </div>
                <div className="bg-gray-950 border border-gray-800 px-4 py-2 rounded text-center sm:text-right min-w-[140px]">
                  <span className="text-[9px] uppercase font-bold text-gray-500 block tracking-widest">Running Score</span>
                  <span className="text-xl font-black text-yellow-500 font-mono">{score} PTS</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400">Active Hype Trains Bracket Predictions</h4>
                {Object.keys(hypeTrainSelections).filter(div => hypeTrainSelections[div]).length === 0 ? (
                  <div className="text-center py-4 text-xs text-gray-600 border border-dashed border-gray-800 rounded-lg">No title forecasts locked. Choose a division on the "Fight Card" tab to invest your picks.</div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {Object.keys(hypeTrainSelections).map(div => {
                      const candidate = hypeTrainSelections[div];
                      if (!candidate) return null;
                      return (
                        <div key={div} className="bg-gray-950 border border-gray-800 p-3 rounded-lg flex justify-between items-center">
                          <div>
                            <span className="text-[9px] font-bold uppercase text-gray-500 block">{div}</span>
                            <span className="text-xs font-black text-yellow-400 mt-0.5 block">🔮 Next Champ: {candidate}</span>
                          </div>
                          <span className="text-sm">🚂</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400">Your Active Slip Predictions ({profilePicks.length})</h4>
                {profilePicks.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-600 border border-dashed border-gray-800 rounded-lg">No fight predictions locked in yet.</div>
                ) : (
                  <div className="space-y-2">
                    {profilePicks.map((pick, index) => (
                      <div key={index} className="bg-gray-950 border border-gray-800 p-3 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="flex-1">
                          <span className="text-[9px] font-bold text-yellow-500 uppercase bg-yellow-500/5 border border-yellow-500/10 px-1.5 py-0.5 rounded mr-2">{pick.weightClass}</span>
                          <span className="text-xs font-semibold text-gray-300">{pick.matchup}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto text-xs">
                          <div>
                            <span className="text-gray-500">Winner:</span>
                            <span className="text-white font-bold mr-1">{pick.predictedWinner}</span>
                            <span className="bg-red-600/10 text-red-400 font-extrabold px-1.5 py-0.5 rounded text-[10px] uppercase border border-red-500/10">{pick.method} • R{pick.round}</span>
                          </div>
                          
                          <button 
                            onClick={() => handleDeselectPick(pick.matchId)}
                            className="bg-gray-950 hover:bg-red-950 text-gray-500 hover:text-red-400 border border-gray-800 hover:border-red-900 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded transition duration-150"
                          >
                            ❌ Deselect
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      <footer className="border-t border-gray-900 bg-gray-950/80 backdrop-blur fixed bottom-0 left-0 right-0 px-6 py-2 flex justify-between items-center text-xs text-gray-500">
        <p>© 2026 Championship Rounds App</p>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${serverStatus.startsWith('Online') ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="font-mono">{serverStatus}</span>
        </div>
      </footer>

    </div>
  );
}

export default App;