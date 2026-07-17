import React, { useState, useEffect } from 'react';

export default function Leaderboards({ players, currentPlayerId, fights, divisionRankings, gradeLocalScores }) {
  const [selectedSimFightId, setSelectedSimFightId] = useState("");
  const [selectedSimDivision, setSelectedSimDivision] = useState("Men's Bantamweight");
  const [simValues, setSimValues] = useState({});

  // Safely update selected fight target once fights array is hydrated
  useEffect(() => {
    if (fights && fights.length > 0 && !selectedSimFightId) {
      setSelectedSimFightId(fights[0].id);
    }
  }, [fights, selectedSimFightId]);

  const runRandomFightSimulation = () => {
    const targetFight = fights.find(f => f.id === selectedSimFightId);
    if (!targetFight) {
      alert("Please select a valid target fight card slip first.");
      return;
    }

    const randomWinner = Math.random() < 0.5 ? targetFight.fighterA?.name : targetFight.fighterB?.name;
    const methods = ['KO/TKO', 'Submission', 'Decision'];
    const randomMethod = methods[Math.floor(Math.random() * methods.length)];
    
    let randomRound = Math.floor(Math.random() * 3) + 1;
    if (targetFight.stage?.includes("Main") || targetFight.stage?.includes("Co-Main")) {
      randomRound = Math.floor(Math.random() * 5) + 1;
    }
    if (randomMethod === 'Decision') {
      randomRound = (targetFight.stage?.includes("Main") || targetFight.stage?.includes("Co-Main")) ? 5 : 3;
    }

    gradeLocalScores({
      type: 'fight',
      id: selectedSimFightId,
      actualWinner: randomWinner,
      actualMethod: randomMethod,
      actualRound: randomRound
    });

    alert(`🎲 Simulated Result for ${targetFight.fighterA?.name} vs. ${targetFight.fighterB?.name}:\n🏆 Winner: ${randomWinner}\n📊 Method: ${randomMethod}\n⏱️ Round: R${randomRound}\n\nScores updated!`);
  };

  const runRandomHypeTrainSimulation = () => {
    const targetDiv = divisionRankings[selectedSimDivision];
    if (!targetDiv) return;

    const randomChamp = targetDiv.contenders[Math.floor(Math.random() * targetDiv.contenders.length)];

    gradeLocalScores({
      type: 'hypetrain',
      division: selectedSimDivision,
      actualWinner: randomChamp
    });

    alert(`🎲 Simulated Coronation for ${selectedSimDivision}:\n👑 New Champion: ${randomChamp}\n\nPlayers who boarded this train receive +50 points!`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* COMPARISON STANDINGS SCOREBOARD */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div className="text-center md:text-left border-b border-gray-800 pb-4">
          <h3 className="text-xl font-bold text-yellow-500 uppercase tracking-wide">Local Competition Standings</h3>
          <p className="text-xs text-gray-400">Real-time score totals aggregated across all active profiles.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider text-[11px]">
                <th className="py-2 pl-4">Rank</th>
                <th className="py-2">Competitor</th>
                <th className="py-2 text-center">Active Slips</th>
                <th className="py-2 text-right pr-4">Total Points</th>
              </tr>
            </thead>
            <tbody>
              {(players || []).sort((a, b) => (b.score || 0) - (a.score || 0)).map((p, index) => (
                <tr key={p.id || index} className={`border-b border-gray-900/60 ${p.id === currentPlayerId ? 'bg-yellow-500/5 text-yellow-400' : 'text-gray-300'}`}>
                  <td className="py-3 pl-4 font-mono font-black">#{index + 1}</td>
                  <td className="py-3 font-bold">{p.username || "Anonymous"} {p.id === currentPlayerId && '👑'}</td>
                  <td className="py-3 text-center font-mono">{(p.picks || []).length} Card Picks</td>
                  <td className="py-3 text-right pr-4 font-mono font-black text-white">{p.score || 0} PTS</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RANDOMIZED OUTCOME CHALLENGE GENERATOR */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <div>
          <h4 className="text-base font-bold text-white uppercase tracking-wider">🎲 Fight Night Randomized Challenge Generator</h4>
          <p className="text-xs text-gray-400 mt-0.5">Let chance decide! Target a pre-chosen fight or weight division to generate randomized results and grade all slates simultaneously.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-950 border border-gray-800 p-5 rounded-lg space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-yellow-500 tracking-wider block">Target Fight Slips</span>
              <select 
                value={selectedSimFightId}
                onChange={(e) => setSelectedSimFightId(e.target.value)}
                className="w-full bg-gray-900 text-xs border border-gray-700 p-2.5 rounded text-white focus:outline-none focus:border-yellow-500"
              >
                <option value="" disabled>Select a fight...</option>
                {fights.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.fighterA?.name || "Fighter A"} vs. {f.fighterB?.name || "Fighter B"} ({f.stage || "Undercard"})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500 leading-relaxed">Generates a random winner, random victory method, and random ending round sequence. Awards 1.5x or 3x multipliers to correct slates.</p>
            </div>
            <button 
              onClick={runRandomFightSimulation}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-black py-2.5 rounded text-xs uppercase tracking-wider transition mt-2"
            >
              ⚡ Roll Random Fight Outcome
            </button>
          </div>

          <div className="bg-gray-950 border border-gray-800 p-5 rounded-lg space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider block">Target Hype Train Divisions</span>
              <select 
                value={selectedSimDivision}
                onChange={(e) => setSelectedSimDivision(e.target.value)}
                className="w-full bg-gray-900 text-xs border border-gray-700 p-2.5 rounded text-white focus:outline-none focus:border-red-500"
              >
                {Object.keys(divisionRankings).map(div => <option key={div} value={div}>{div}</option>)}
              </select>
              <p className="text-[11px] text-gray-500 leading-relaxed">Selects a random contender out of the division's top 15 ranks to win the belt. Correct forecasts immediately clear a flat +50 point bonus.</p>
            </div>
            <button 
              onClick={runRandomHypeTrainSimulation}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded text-xs uppercase tracking-wider transition mt-2"
            >
              👑 Coronation Randomizer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}