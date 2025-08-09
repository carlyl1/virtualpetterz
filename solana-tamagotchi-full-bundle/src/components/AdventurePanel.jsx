import React, { useState } from 'react';
import { generateAdventure } from '../generators/adventureGenerator';

export default function AdventurePanel() {
  const [story, setStory] = useState(generateAdventure());
  const [status, setStatus] = useState('idle');

  const start = () => {
    setStatus('running');
    setTimeout(() => {
      const win = Math.random() > 0.35;
      setStatus(win ? 'success' : 'fail');
    }, 1200);
  };

  return (
    <div className="panel">
      <h3 style={{color:'#00ff99'}}>Adventure</h3>
      <div style={{fontSize:12, color:'#ccc'}} dangerouslySetInnerHTML={{__html:story}} />
      <div style={{marginTop:8}}>
        <button className="btn" onClick={()=>{setStory(generateAdventure()); setStatus('idle')}}>New Adventure</button>
        <button className="btn" style={{marginLeft:8}} onClick={start}>Send Pet</button>
      </div>
      <div style={{marginTop:8, color:'#ccc'}}>Status: {status}</div>
    </div>
  )
}
