// client-side deterministic pet generator
function createLCG(seedStr) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
  let seed = h >>> 0;
  return function random() { seed = (seed * 1664525 + 1013904223) >>> 0; return (seed & 0xffffffff) / 0x100000000; };
}
function pickRandom(arr, rnd) { return arr[Math.floor(rnd()*arr.length)]; }
function weightedPick(list, rnd) { const total = list.reduce((s,x)=>s+x.weight,0); let r = rnd()*total; for (const x of list) { if (r < x.weight) return x.item; r -= x.weight; } return list[0].item; }

const SPECIES = ['Forest Fox','Mystic Bunny','Robo Cat','Water Duck','Shadow Wolf','Pixel Sloth','Chonk Hamster','Glitch Moth'];
const BODY_SHAPES = ['chibi','round','long','fluffy','slim'];
const PALETTES = { pastel: ['#FFD1DC','#C5E1A5','#B3E5FC','#FFE0B2','#E1BEE7'], classic8: ['#FF3B3B','#FFD93D','#3BFF89','#3DB7FF','#A45FFF'], neon: ['#00FF99','#FF44AA','#00CCFF','#FFAA00','#AAFF00'] };
const PATTERNS = [{item:'none',weight:60},{item:'stripes',weight:15},{item:'spots',weight:15},{item:'rune',weight:6},{item:'glow-lines',weight:4}];
const EYES = ['round','almond','sleepy','sparkle','one-eye'];
const MOUTHS = ['smile','open','grin','pout','tongue'];
const ACCESSORIES = [{item:'none',weight:50},{item:'scarf',weight:12},{item:'tiny-hat',weight:10},{item:'cyber-goggles',weight:8},{item:'wings',weight:4},{item:'halo',weight:2},{item:'glitch-aura',weight:2}];
const SPECIAL_FX = [{item:'none',weight:80},{item:'sparkles',weight:10},{item:'trail',weight:6},{item:'glow',weight:4}];

function determineRarity(rnd) {
  const r = rnd();
  if (r > 0.997) return 'legendary';
  if (r > 0.99) return 'epic';
  if (r > 0.94) return 'rare';
  return 'common';
}
function personalityFromSeed(rnd) {
  const friendly = rnd(); const sarcastic = rnd() * (1 - friendly); const adventurous = rnd(); const lazy = rnd() * (1 - adventurous); const curious = rnd();
  let tone = 'neutral';
  if (friendly > 0.7) tone = 'friendly'; else if (sarcastic > 0.6) tone = 'sarcastic'; else if (adventurous > 0.65) tone = 'brave'; else if (lazy > 0.6) tone = 'grumpy';
  return { friendly, sarcastic, adventurous, lazy, curious, tone };
}

export function generatePet(seed=null){
  const seedStr = seed || `seed-${Date.now()}`; const rnd = createLCG(seedStr);
  const species = pickRandom(SPECIES, rnd);
  const paletteKey = pickRandom(Object.keys(PALETTES), rnd); const palette = PALETTES[paletteKey];
  const bodyShape = pickRandom(BODY_SHAPES, rnd); const pattern = weightedPick(PATTERNS, rnd); const eyes = pickRandom(EYES, rnd); const mouth = pickRandom(MOUTHS, rnd);
  const accessory = weightedPick(ACCESSORIES, rnd); const specialFX = weightedPick(SPECIAL_FX, rnd); const rarity = determineRarity(rnd); const personality = personalityFromSeed(rnd);
  const baseHp = Math.floor(60 + rnd() * 60 + (rarity === 'rare' ? 10 : 0) + (rarity==='epic'?30:0));
  const baseAttack = Math.floor(8 + rnd() * 18 + (rarity==='legendary'?8:0)); const baseDefense = Math.floor(4 + rnd() * 12); const speed = Math.floor(5 + rnd() * 20);
  return { seed: seedStr, species, bodyShape, paletteKey, palette, pattern, eyes, mouth, accessory, specialFX, rarity, personality, stats:{hp:baseHp, attack:baseAttack, defense:baseDefense, speed}, createdAt:Date.now() };
}

// Import the improved renderer
import { renderImprovedPet } from './improvedPetRenderer';

// Original simple renderer (kept for backwards compatibility)
export function renderPetCanvasSimple(petObj, canvas, opts={}) {
  if (!canvas) return; const ctx = canvas.getContext('2d'); const w = canvas.width = opts.width || 128; const h = canvas.height = opts.height || 128;
  ctx.clearRect(0,0,w,h); ctx.fillStyle = '#0e0e0e'; ctx.fillRect(0,0,w,h);
  const pal = petObj.palette; const main = pal[0] || '#DDD'; const accent = pal[1] || '#AAA';
  ctx.fillStyle = main; ctx.beginPath(); ctx.ellipse(w/2, h*0.55, w*0.28, h*0.22, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = accent; ctx.beginPath(); ctx.ellipse(w/2, h*0.35, w*0.18, h*0.16, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#111'; const eyeY = h*0.34;
  if (petObj.eyes === 'one-eye') { ctx.beginPath(); ctx.arc(w/2, eyeY, 8, 0, Math.PI*2); ctx.fill(); }
  else { ctx.beginPath(); ctx.arc(w*0.43, eyeY, 6, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(w*0.57, eyeY, 6, 0, Math.PI*2); ctx.fill(); }
  ctx.fillStyle = '#222'; if (petObj.mouth === 'smile') ctx.fillRect(w*0.47, h*0.4, w*0.06, 4); else if (petObj.mouth === 'tongue') { ctx.fillRect(w*0.47, h*0.4, w*0.06, 4); ctx.fillStyle = '#FF6B6B'; ctx.fillRect(w*0.49, h*0.42, w*0.02, 3); } else ctx.fillRect(w*0.47, h*0.4, w*0.06, 3);
  if (petObj.accessory === 'tiny-hat') { ctx.fillStyle = '#333'; ctx.fillRect(w*0.40, h*0.24, w*0.2, 8); ctx.fillStyle = '#FFD'; ctx.fillRect(w*0.46, h*0.20, w*0.08, 8); }
  if (petObj.specialFX === 'sparkles') { ctx.fillStyle = '#fff'; for (let i=0;i<6;i++){ ctx.fillRect(Math.random()*w, Math.random()*h*0.7, 2,2); } }
  ctx.font = '10px monospace'; ctx.fillStyle = (petObj.rarity === 'legendary') ? '#FFD700' : '#00FF99'; ctx.fillText(petObj.rarity.toUpperCase(), 6, h - 6);
}

// Use improved renderer by default
export function renderPetCanvas(petObj, canvas, opts={}) {
  // Use improved renderer for better looking pets
  return renderImprovedPet(petObj, canvas, opts);
}
