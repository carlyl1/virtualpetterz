const locations = ['Meme Forest','Pixel Plains','Crypto Canyon','Neon Swamp','404 Desert'];
const objectives = ['find the lost snack','rescue a fellow pet','retrieve the golden USB','track down the missing meme coin','discover the source of mysterious noises'];
const obstacles = ['a rival pet gang','a blockchain glitch','a pixel storm','a suspicious rugpull wizard','a swarm of tiny bugs'];
const rewards = ['a shiny pixel hat','extra happiness points','a bag of rare snacks','1 adventure token','a mystery loot box'];

const intros = ['🌟 Breaking news!', '🚀 Big day ahead —', '🎮 Quest accepted!'];

function pick(arr, rnd=Math.random){ return arr[Math.floor(rnd()*arr.length)]; }

export function generateAdventure() {
  const intro = pick(intros);
  const loc = pick(locations);
  const obj = pick(objectives);
  const obs = pick(obstacles);
  const rew = pick(rewards);
  return `${intro} Your pet heads to <b>${loc}</b> to <b>${obj}</b>, but faces <b>${obs}</b>. Reward: <b>${rew}</b>.`;
}

export default generateAdventure;
