import React, { useRef, useEffect, useState } from 'react';
import { generatePet, renderPetCanvas, savePetToLocal, listLocalPets } from '../generators/petGenerator';

export default function PetDemo() {
  const canvasRef = useRef();
  const [pet, setPet] = useState(null);
  const [seed, setSeed] = useState('');

  useEffect(() => {
    const local = listLocalPets();
    if (local && local.length) {
      setPet(local[0]); setSeed(local[0].seed); renderPetCanvas(local[0], canvasRef.current);
    } else {
      const p = generatePet('guest-' + Math.floor(Math.random()*999999));
      setPet(p); setSeed(p.seed); renderPetCanvas(p, canvasRef.current); savePetToLocal(p);
    }
  }, []);

  const regen = () => {
    const p = generatePet(seed || ('guest-'+Math.floor(Math.random()*999999)));
    setPet(p); setSeed(p.seed); renderPetCanvas(p, canvasRef.current); savePetToLocal(p);
  };

  return (
    <div className="panel">
      <div style={{textAlign:'center'}}>
        <canvas ref={canvasRef} width={128} height={128} />
        <div style={{fontSize:11, color:'#ccc'}}>Seed: {seed}</div>
        <div style={{marginTop:8}}><button className="btn" onClick={regen}>Regenerate (same seed)</button></div>
      </div>
    </div>
  )
}
