import anupam from "@/assets/shark-anupam.png";
import anupamAngry from "@/assets/shark-anupam-angry.png";
import namita from "@/assets/shark-namita.png";
import namitaOut from "@/assets/shark-namita-out.png";
import ashneer from "@/assets/shark-ashneer.png";
import ashneerAngry from "@/assets/shark-ashneer-angry.png";
import aman from "@/assets/shark-aman.png";
import amanLaugh from "@/assets/shark-aman-laugh.png";
import peyush from "@/assets/shark-peyush.png";
import peyushThink from "@/assets/shark-peyush-think.png";

export type Mood = "confident" | "nervous" | "cry" | "shock" | "smug";
export type SharkId = "anupam" | "namita" | "ashneer" | "aman" | "peyush";

export type Shark = {
  id: SharkId;
  name: string;
  title: string;
  imgIdle: string;
  imgActive: string;
  color: string;
  voice: { pitch: number; rate: number; lang: string; gender: "male" | "female" };
};

export const SHARKS: Record<SharkId, Shark> = {
  anupam: {
    id: "anupam", name: "Anupam", title: "The Data King 🧐",
    imgIdle: anupam, imgActive: anupamAngry,
    color: "hsl(200 85% 50%)",
    voice: { pitch: 0.85, rate: 1.0, lang: "en-IN", gender: "male" },
  },
  namita: {
    id: "namita", name: "Namita", title: "I'm Out 💁‍♀️",
    imgIdle: namita, imgActive: namitaOut,
    color: "hsl(330 75% 55%)",
    voice: { pitch: 1.35, rate: 1.0, lang: "en-IN", gender: "female" },
  },
  ashneer: {
    id: "ashneer", name: "Ashneer", title: "Doglapan King 🔥",
    imgIdle: ashneer, imgActive: ashneerAngry,
    color: "hsl(14 90% 55%)",
    voice: { pitch: 0.65, rate: 1.18, lang: "hi-IN", gender: "male" },
  },
  aman: {
    id: "aman", name: "Aman", title: "Bhai Energy 😎",
    imgIdle: aman, imgActive: amanLaugh,
    color: "hsl(280 70% 55%)",
    voice: { pitch: 1.05, rate: 1.12, lang: "hi-IN", gender: "male" },
  },
  peyush: {
    id: "peyush", name: "Peyush", title: "The Visionary 👓",
    imgIdle: peyush, imgActive: peyushThink,
    color: "hsl(160 70% 40%)",
    voice: { pitch: 1.0, rate: 0.95, lang: "en-IN", gender: "male" },
  },
};

export const SHARK_ORDER: SharkId[] = ["anupam", "namita", "ashneer", "aman", "peyush"];

export type Beat = {
  speaker: "pitcher" | SharkId | "narrator";
  mood?: Mood;
  text: string;
};

export type Branch = {
  id: string;
  label: string;
  emoji: string;
  beats: Beat[];
  next?: string;
};

export type DecisionNode = {
  id: string;
  intro?: Beat[];
  prompt: string;
  branches: Branch[];
};

type Tone = "savage" | "desperate" | "chaotic";

const sharkLines: Record<SharkId, Record<Tone, { shark: string; pitcher: string; pitcherMood: Mood }>> = {
  anupam: {
    savage: {
      shark: "Bhai 0.1% equity for 100 crore? Tu Maggi bech raha hai ya moonwalk? Pehle hostel ke 4 customers laa, fir aana — UNIT ECONOMICS!",
      pitcher: "Sir Unit Economics ka matlab packet me kitne pieces aate hain wahi na? 🥲",
      pitcherMood: "shock",
    },
    desperate: {
      shark: "Tu data dikha raha hai ya tear-jerker dikha raha hai? Excel kholun ya tissue paper du?",
      pitcher: "Dono de do sir... pyaaz bhi kaata hai zindagi ne 😭",
      pitcherMood: "cry",
    },
    chaotic: {
      shark: "Drawer me biometric? Bhai ye founder hai ya RAW agent? Mossad bhi confused hai.",
      pitcher: "Sir Mossad me apply karu kya? 🥹",
      pitcherMood: "shock",
    },
  },
  namita: {
    savage: {
      shark: "Beta itna attitude? Mere pharma me intern bhi nahi rakhungi. For that reason... I AM OUT.",
      pitcher: "Ma'am ek baar try toh karti... 💔",
      pitcherMood: "cry",
    },
    desperate: {
      shark: "Aww beta. Lekin mujhe tumhara pain feel nahi ho raha. For that reason... I AM OUT.",
      pitcher: "Ma'am pain hi pain hai ma'am, pain hi pain 😭",
      pitcherMood: "cry",
    },
    chaotic: {
      shark: "Ye kya tamasha hai? Studio me chillane ke liye nahi aaye hum. For that reason... I AM OUT.",
      pitcher: "Ma'am mujhe laga energy chahiye 😨",
      pitcherMood: "shock",
    },
  },
  ashneer: {
    savage: {
      shark: "Bhai ye DOGLAPAN hai!! 100 crore?! 12 rupaye ke packet ke liye?! Ja ghar ja, soja, school ja — kuch toh kar!",
      pitcher: "Sir aapne school ka naam liya, mummy yaad aa gayi 😭",
      pitcherMood: "cry",
    },
    desperate: {
      shark: "Tu ro raha hai? Main bhi roun? Chal dono ro lete hain. Lekin paisa nahi milega — ye certain hai.",
      pitcher: "Sir saath me ro lete hain, pitch baad me 🥲",
      pitcherMood: "cry",
    },
    chaotic: {
      shark: "Tu startup founder hai ya stand-up comedian? Kapil ke show me ja, yahan time barbad mat kar.",
      pitcher: "Sir referral mil sakta hai? 🙏",
      pitcherMood: "nervous",
    },
  },
  aman: {
    savage: {
      shark: "Boss ek baat bata — tu Maggi pe pitch kar raha hai aur Yippee se compete bhi nahi kar paayega. Wapas ja bhai.",
      pitcher: "Bhai Yippee ka naam mat lo, mera ex hai woh 💔",
      pitcherMood: "cry",
    },
    desperate: {
      shark: "Tension nahi lene ka. Le ek boAt headphone, gaana sun, bhool ja. Paisa nahi mil raha bhai.",
      pitcher: "Headphone se Maggi nahi pakti bhai 🥲",
      pitcherMood: "nervous",
    },
    chaotic: {
      shark: "Bhai ye banger hai!! 'Maggi Maggi Re' — Honey Singh feature, 500 crore views. Equity nahi, vibes lega tu.",
      pitcher: "Vibes se EMI nahi bharti bhai 😵",
      pitcherMood: "shock",
    },
  },
  peyush: {
    savage: {
      shark: "Mujhe tech dikh raha hai. Smart fork — agar koi aur uthaye toh 440V ka jhatka. 90% equity, 10 lakh — abhi.",
      pitcher: "90%?! Sir mera roommate bhi itna nahi maangta 😭",
      pitcherMood: "cry",
    },
    desperate: {
      shark: "Tera dard scalable hai. App banayenge — MaggiMitra. Bhookh trigger ho toh notification. 80% for 5 lakh.",
      pitcher: "Notification se pet nahi bharta sir 🥺",
      pitcherMood: "nervous",
    },
    chaotic: {
      shark: "Tu pure chaos hai aur main chaos pe bet karta hun. 99% for 1 crore — Maggi Empire khada karenge bhai!",
      pitcher: "99% me toh sirf wrapper bachega mere paas 😱",
      pitcherMood: "shock",
    },
  },
};

const TONES: { id: Tone; label: string; emoji: string }[] = [
  { id: "savage", label: "Go SAVAGE", emoji: "🔥" },
  { id: "desperate", label: "Beg HARDER", emoji: "😭" },
  { id: "chaotic", label: "Pure CHAOS", emoji: "🤡" },
];

function buildSharkDecision(sid: SharkId, nextId: string): DecisionNode {
  const lines = sharkLines[sid];
  return {
    id: `${sid}-tone`,
    intro: [{ speaker: sid, mood: "smug", text: "Reaction sun liya. Ab tu kaise jawab dega?" }],
    prompt: `${SHARKS[sid].name} just clapped back. Your move:`,
    branches: TONES.map((t) => ({
      id: `${sid}-${t.id}`,
      label: t.label,
      emoji: t.emoji,
      beats: [
        { speaker: sid, mood: "smug", text: lines[t.id].shark },
        { speaker: "pitcher", mood: lines[t.id].pitcherMood, text: lines[t.id].pitcher },
      ],
      next: nextId,
    })),
  };
}

const ENDING_NODE: DecisionNode = {
  id: "ending",
  intro: [
    { speaker: "narrator", text: "Saare 5 sharks ne tujhe roast kar diya. Ek final move bacha hai." },
  ],
  prompt: "Choose your destiny:",
  branches: [
    {
      id: "counter",
      label: '"Counter-offer!"',
      emoji: "💥",
      beats: [
        { speaker: "pitcher", mood: "confident", text: "Sharks! Counter-offer: 1 rupaya royalty PER SLURP in hostels of India!" },
        { speaker: "ashneer", mood: "smug", text: "Security!! Isko Andheri station tak chhod ke aana!" },
        { speaker: "aman", mood: "smug", text: "Bhai mujhe ek slurp bhej de demo ke liye 😂" },
        { speaker: "narrator", text: "Tu bhaagta hai. CCTV pe sab record ho raha hai." },
      ],
      next: "twist",
    },
    {
      id: "politics",
      label: '"Pivot to Politics"',
      emoji: "🗳️",
      beats: [
        { speaker: "pitcher", mood: "confident", text: "Shark hona too much kaam hai. Main HOSTEL PRESIDENT banunga!" },
        { speaker: "aman", mood: "smug", text: "Manifesto bata bhai." },
        { speaker: "pitcher", mood: "confident", text: "'FREE TASTEMAKER FOR ALL'. Landslide guaranteed 🚀" },
        { speaker: "anupam", mood: "smug", text: "Yahi data tha jo mujhe chahiye tha." },
      ],
      next: "twist",
    },
    {
      id: "emotional",
      label: '"Emotional Card"',
      emoji: "🎻",
      beats: [
        { speaker: "narrator", text: "🎻 Sad violin loads in the background..." },
        { speaker: "pitcher", mood: "cry", text: "Sharks... ye mahine ki AAKHRI Maggi thi. Roommate ne mera bachpan chura liya." },
        { speaker: "namita", mood: "smug", text: "Beta... *sniff*... but I am still OUT." },
        { speaker: "narrator", text: "Studio me sannata. Sab ro rahe hain. Phir bhi paisa nahi dete. 💸" },
      ],
      next: "twist",
    },
  ],
};

const TWIST_NODE: DecisionNode = {
  id: "twist",
  intro: [
    { speaker: "narrator", text: "📹 BREAKING: CCTV footage leak from your hostel..." },
    { speaker: "narrator", text: "3:14 AM. Tu hi tha. Sleep-walking. Maggi pakaayi. Spoon se khaayi. Wrapper apne hi pillow me chhupaaya." },
    { speaker: "pitcher", mood: "shock", text: "Ye... ye toh main hi hun?? 🫥" },
    { speaker: "narrator", text: "🦈 Tu thief hai. Tu victim hai. Tu hi ecosystem hai." },
  ],
  prompt: "Tank se nikal gaya. Ab agla stage — Bachchan sahab bula rahe hain.",
  branches: [
    { id: "kbc", label: "🎬 GO TO KBC", emoji: "🎬", beats: [], next: "kbc" },
    { id: "restart", label: "🔁 PITCH AGAIN", emoji: "🔁", beats: [], next: "intro" },
    { id: "exit", label: "✌️ EXIT TANK", emoji: "✌️", beats: [], next: "exit" },
  ],
};

/** LEVEL 1 — THE DRAWER. The original sin. */
const DRAWER_NODE: DecisionNode = {
  id: "drawer",
  intro: [
    { speaker: "narrator", text: "🌙 LEVEL 1 — THE DRAWER. 2:47 AM. Hostel room 304. Bhookh: maximum." },
    { speaker: "pitcher", mood: "confident", text: "Strategy clear hai. Drawer kholo. Maggi nikaalo. Khao. Soja." },
    { speaker: "narrator", text: "Tu drawer kholta hai... ek khaali Lays packet. Ek charger. Ek tastemaker — bina noodles ke. 💀" },
    { speaker: "pitcher", mood: "shock", text: "Maggi… kahan hai meri Maggi?? Ye toh CRIME SCENE hai!" },
  ],
  prompt: "Drawer khaali hai. Pehla move?",
  branches: [
    {
      id: "blame",
      label: "Roommate ko gaali",
      emoji: "🤬",
      beats: [
        { speaker: "pitcher", mood: "shock", text: "ROHAAAAAN!! Tune Maggi khaayi?! Bata sach sach!" },
        { speaker: "narrator", text: "Roommate so raha hai. Muskura raha hai. Neend me bhi smug. 😴" },
      ],
      next: "tank-intro",
    },
    {
      id: "investigate",
      label: "Detective mode",
      emoji: "🔍",
      beats: [
        { speaker: "pitcher", mood: "confident", text: "Magnifying glass nikaalo. Tastemaker pe DNA hoga. Sherlock Yadriksha — at your service." },
        { speaker: "narrator", text: "Subooth: 1 wrapper, 1 spoon, 1 betrayed dil. FIR pakka." },
      ],
      next: "tank-intro",
    },
    {
      id: "monetize",
      label: "Iska business banao",
      emoji: "💸",
      beats: [
        { speaker: "pitcher", mood: "confident", text: "Ruk… ye toh OPPORTUNITY hai. Mera dard scalable hai. SHARK TANK ke liye fly karo!" },
        { speaker: "narrator", text: "Tum Mumbai ke flight me ho. Lapel mic laga hua hai. Lights on. 🦈" },
      ],
      next: "tank-intro",
    },
  ],
};

/** LEVEL 2 — Shark Tank pitch */
const TANK_INTRO_NODE: DecisionNode = {
  id: "tank-intro",
  intro: [
    { speaker: "narrator", text: "🦈 LEVEL 2 — SHARK TANK INDIA, Maggi Edition. Dhun dhun dhun dhun DAAAA!" },
    { speaker: "pitcher", mood: "confident", text: "Namaste Sharks 🙏 Main Yadriksha — founder of 'Meri Maggi Kahan Hai? Pvt. Ltd.'" },
    { speaker: "pitcher", mood: "confident", text: "Har raat 140 crore log sote hain. 40% students 2 AM ko uthke dekhte hain — drawer KHAALI. Roommate ne LIQUIDATE kar diya!" },
    { speaker: "pitcher", mood: "confident", text: "₹100 Crore chahiye for 0.1% equity. Mera dard SCALABLE hai. 😤" },
  ],
  prompt: "Sharks ready hain. Kaunse shark se shuru?",
  branches: SHARK_ORDER.map((sid, i) => ({
    id: `start-${sid}`,
    label: SHARKS[sid].name,
    emoji: ["🧐", "💁‍♀️", "🔥", "😎", "👓"][i],
    beats: [],
    next: `${sid}-tone`,
  })),
};

/** LEVEL 4 — SUPREME COURT. Final justice. The judge is… your roommate. */
const COURT_NODE: DecisionNode = {
  id: "court",
  intro: [
    { speaker: "narrator", text: "⚖️ LEVEL 4 — SUPREME COURT OF INDIA. Case No. 304/MAGGI/2025." },
    { speaker: "narrator", text: "Court rise. Honourable judge enters. Black robe. White wig. Familiar smirk…" },
    { speaker: "pitcher", mood: "shock", text: "RUKO… ye judge toh… ROHAN hai?! MERA ROOMMATE?!" },
    { speaker: "narrator", text: "Judge Rohan strikes the gavel. Tastemaker ki khushboo hawa me. 🔨" },
  ],
  prompt: "Judge sahab waiting hain. Plea kya hai?",
  branches: [
    {
      id: "guilty",
      label: '"Guilty hun, my lord"',
      emoji: "🙇",
      beats: [
        { speaker: "pitcher", mood: "cry", text: "My lord… maine roommate ko gaali di. Mafi chahta hun. Aur thoda Maggi bhi." },
        { speaker: "narrator", text: "Judge Rohan: 'Mafi swikaar. Saza — tu mere liye Maggi banayega. Lifelong. With andaa.'" },
        { speaker: "pitcher", mood: "shock", text: "YE TO LIFE SENTENCE HAI 😭" },
      ],
      next: "verdict",
    },
    {
      id: "counter",
      label: '"Counter-FIR!"',
      emoji: "📜",
      beats: [
        { speaker: "pitcher", mood: "confident", text: "Objection! Judge sahab KHUD accused hain! Conflict of interest! Recusal demand karta hun!" },
        { speaker: "narrator", text: "Judge Rohan: 'Objection overruled. Kyunki main bhi judge hun aur main bhi gawaah hun. Bahut convenient.'" },
        { speaker: "pitcher", mood: "shock", text: "Constitution rote-rote so gaya 😩" },
      ],
      next: "verdict",
    },
    {
      id: "deal",
      label: '"Out-of-court settlement"',
      emoji: "🤝",
      beats: [
        { speaker: "pitcher", mood: "confident", text: "My lord… 2 packet abhi, 2 packet diwali pe. Case withdraw. Deal?" },
        { speaker: "narrator", text: "Judge Rohan stares for 7 seconds. Phir gavel. 'Deal. Lekin tastemaker mera.'" },
        { speaker: "pitcher", mood: "nervous", text: "Tastemaker hi toh sab kuch hai sir 🥲" },
      ],
      next: "verdict",
    },
  ],
};

/** Final verdict screen */
const VERDICT_NODE: DecisionNode = {
  id: "verdict",
  intro: [
    { speaker: "narrator", text: "🔨 ORDER. ORDER. ORDER. Judge Rohan reads the final verdict:" },
    { speaker: "narrator", text: "'In the matter of Yadriksha vs. The Empty Drawer — the court finds that nobody is innocent. Maggi belongs to whoever cooks it first. Case closed.'" },
    { speaker: "pitcher", mood: "cry", text: "Justice system has failed me. But also… mujhe bhookh lagi hai phir se. 😭🍜" },
    { speaker: "narrator", text: "🎬 THE END. (Ya shayad shuruwaat. Drawer phir se khaali hai.)" },
  ],
  prompt: "Game over. Aage kya?",
  branches: [
    { id: "again", label: "🔁 Phir se shuru", emoji: "🔁", beats: [], next: "drawer" },
    { id: "exit", label: "✌️ Exit", emoji: "✌️", beats: [], next: "exit" },
  ],
};

/** Backwards-compat alias */
const INTRO_NODE = DRAWER_NODE;

export function buildGraph(): Record<string, DecisionNode> {
  const nodes: Record<string, DecisionNode> = {
    drawer: DRAWER_NODE,
    intro: INTRO_NODE,
    "tank-intro": TANK_INTRO_NODE,
    ending: ENDING_NODE,
    twist: TWIST_NODE,
    court: COURT_NODE,
    verdict: VERDICT_NODE,
  };
  SHARK_ORDER.forEach((sid, idx) => {
    const next = idx < SHARK_ORDER.length - 1 ? `${SHARK_ORDER[idx + 1]}-tone` : "ending";
    nodes[`${sid}-tone`] = buildSharkDecision(sid, next);
  });
  return nodes;
}

