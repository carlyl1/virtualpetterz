import React, { useState, useEffect } from 'react';
import { generatePet } from '../generators/petGenerator';

function calculateDamage(attacker, defender) {
  const base = Math.max(1, Math.floor(attacker.attack - defender.defense*0.6));
  return base;
}

export default function Battle() {
  const [player] = useState(generatePet('player-1'));
  const [opp] = useState(generatePet('opponent-1'));
  const [pStats, setPStats] = useState({...player.stats});
  const [oStats, setOStats] = useState({...opp.stats});
  const [log, setLog] = useState([]);
  const [turn, setTurn] = useState('player');
  const [over, setOver] = useState(false);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    if (over) return;
    const t = setTimeout(() => {
      if (turn === 'player') {
        const dmg = calculateDamage(pStats, oStats);
        const newHp = Math.max(0, oStats.hp - dmg);
        setOStats(s => ({...s, hp: newHp}));
        setLog(l => [...l, `You hit for ${dmg}`]);
        if (newHp === 0) { setOver(true); setWinner('player'); }
        else setTurn('opponent');
      } else {
        const dmg = calculateDamage(oStats, pStats);
        const newHp = Math.max(0, pStats.hp - dmg);
        setPStats(s => ({...s, hp: newHp}));
        setLog(l => [...l, `Opponent hits for ${dmg}`]);
        if (newHp === 0) { setOver(true); setWinner('opponent'); }
        else setTurn('player');
      }
    }, 900);
    return () => clearTimeout(t);
  }, [turn, over, pStats, oStats]);

  return (
    <div className="panel">
      <h3 style={{color:'#00ff99'}}>Battle Arena</h3>
      <div style={{display:'flex', justifyContent:'space-between'}}>
        <div style={{width:'45%'}}><div style={{fontSize:11}}>You</div><div>HP: {pStats.hp}</div><div>ATK: {pStats.attack}</div></div>
        <div style={{width:'45%'}}><div style={{fontSize:11}}>Opponent</div><div>HP: {oStats.hp}</div><div>ATK: {oStats.attack}</div></div>
      </div>
      <div style={{marginTop:10, height:120, overflowY:'auto', border:'2px solid #00ff99', padding:8}}>
        {log.map((l,i)=><div key={i} style={{fontSize:11, color:'#ccc'}}>{l}</div>)}
      </div>
      {over ? <div style={{marginTop:8, color:'#ffaa00'}}>Winner: {winner}</div> : <div style={{marginTop:8}}>Turn: {turn}</div>}
    </div>
  )
}
