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
  /** Voice hint for browser TTS */
  voice: { pitch: number; rate: number; lang: string };
};

export const SHARKS: Record<SharkId, Shark> = {
  anupam: {
    id: "anupam", name: "Anupam", title: "The Data King 🧐",
    imgIdle: anupam, imgActive: anupamAngry,
    color: "hsl(200 85% 50%)",
    voice: { pitch: 0.9, rate: 1.05, lang: "hi-IN" },
  },
  namita: {
    id: "namita", name: "Namita", title: "The 'Out' Expert 💁‍♀️",
    imgIdle: namita, imgActive: namitaOut,
    color: "hsl(330 75% 55%)",
    voice: { pitch: 1.4, rate: 1.0, lang: "en-IN" },
  },
  ashneer: {
    id: "ashneer", name: "Ashneer", title: "The Reality Check 👓",
    imgIdle: ashneer, imgActive: ashneerAngry,
    color: "hsl(14 90% 55%)",
    voice: { pitch: 0.7, rate: 1.15, lang: "hi-IN" },
  },
  aman: {
    id: "aman", name: "Aman", title: "The Swag Boss 😎",
    imgIdle: aman, imgActive: amanLaugh,
    color: "hsl(280 70% 55%)",
    voice: { pitch: 1.1, rate: 1.1, lang: "hi-IN" },
  },
  peyush: {
    id: "peyush", name: "Peyush", title: "The Visionary 👓",
    imgIdle: peyush, imgActive: peyushThink,
    color: "hsl(160 70% 40%)",
    voice: { pitch: 1.0, rate: 0.95, lang: "en-IN" },
  },
};

export const SHARK_ORDER: SharkId[] = ["anupam", "namita", "ashneer", "aman", "peyush"];

/* ─────────────────  STORY GRAPH  ──────────────────── */
/**
 * Each "Beat" = one screen of the story.
 * Player picks a tone branch at each shark turn → changes pitcher reaction
 * AND the next shark's roast.
 */
export type Beat = {
  speaker: "pitcher" | SharkId | "narrator";
  mood?: Mood;
  text: string;
};

export type Branch = {
  id: string;
  label: string; // button label
  emoji: string;
  beats: Beat[]; // played out turn-by-turn
  next?: string; // id of next decision node
};

export type DecisionNode = {
  id: string;
  /** Optional "intro" beats played before showing choices */
  intro?: Beat[];
  prompt: string;
  branches: Branch[];
};

/** Three tones available at every shark turn */
type Tone = "savage" | "desperate" | "chaotic";

const sharkLines: Record<SharkId, Record<Tone, { shark: string; pitcher: string; pitcherMood: Mood }>> = {
  anupam: {
    savage: {
      shark: "Bhai tu bola '0.1% equity for ₹100 crore'? Ye DOGLAPAN hai! Tera roommate already pitch kar chuka — distressed inventory bata raha tha. Build an ECOSYSTEM!",
      pitcher: "Ecosystem kya hota hai sir... mujhe toh bas Maggi chahiye thi 💀",
      pitcherMood: "shock",
    },
    desperate: {
      shark: "Dekh, data mat dikha — pain dikha. Tu ro raha hai pitch me. Itna bhi market nahi hai. DOGLAPAN!",
      pitcher: "Sir please... ek packet hi de do na 😭",
      pitcherMood: "cry",
    },
    chaotic: {
      shark: "Tu drawer me biometric lagaane ki baat kar raha tha? Bhai pagal hai kya? Ye founder nahi, fugitive hai!",
      pitcher: "Fugitive?? Maine bas Maggi mangi thi... ya rabba 😵",
      pitcherMood: "shock",
    },
  },
  namita: {
    savage: {
      shark: "Beta itna attitude? Pharma me aati toh sikhati. But empty drawer? I don't connect. For that reason... I AM OUT.",
      pitcher: "Ma'am ek baar try toh karti... 😢",
      pitcherMood: "cry",
    },
    desperate: {
      shark: "Aww beta. Lekin emotion me business nahi hota. Indigestion hota toh help karti. I am OUT.",
      pitcher: "Ma'am stomach bhi khaali hai aur dil bhi 🥺",
      pitcherMood: "cry",
    },
    chaotic: {
      shark: "Tu screaming kyun kar raha hai studio me? Security! I am out before I even came in.",
      pitcher: "Ma'am main toh shaant tha... 😨",
      pitcherMood: "shock",
    },
  },
  ashneer: {
    savage: {
      shark: "TAMASHA hai ye?! ₹100 crore ka pitch ek 12 rupaye ke packet ke liye?! Bhai dhanda band kar aur SOJA. Bilkul GHATIYA pitch!",
      pitcher: "Sir aapki chai bhi gas pe ubal ke gir gayi hogi... 😭😭",
      pitcherMood: "cry",
    },
    desperate: {
      shark: "Tu ro mat. Tu ro raha hai toh main bhi roun? Naya drawer khareed le 200 rupaye ka. Khatam baat.",
      pitcher: "200 rupaye hote toh Maggi nahi khaata sir 😭",
      pitcherMood: "cry",
    },
    chaotic: {
      shark: "Bhai ye startup hai ya stand-up? Tujhe Kapil Sharma ke show me jaana chahiye, yahan nahi.",
      pitcher: "Sir I'll consider it 🥲",
      pitcherMood: "nervous",
    },
  },
  aman: {
    savage: {
      shark: "Tension mat le boss. Hum naya brand nikalenge — boAt-Noodles. Tasty kam, sound zyada. HIT hai!",
      pitcher: "Bhaiya mera dard product nahi hai... 😢",
      pitcherMood: "cry",
    },
    desperate: {
      shark: "Aww bhai. Le ek noodle bowl mere ghar se. Lekin paisa nahi dunga. Bro-code.",
      pitcher: "Bro-code accept hai bhai 🥲",
      pitcherMood: "nervous",
    },
    chaotic: {
      shark: "Bhai tu jo abhi bola wo banger hai! Hum item song banayenge — 'Maggi Maggi Re'. 50 crore views guaranteed!",
      pitcher: "Item song?? Mujhe paisa chahiye gaana nahi 😵",
      pitcherMood: "shock",
    },
  },
  peyush: {
    savage: {
      shark: "Mujhe tech dikh raha hai. AI fork — koi aur pakde toh 440V jhatka. Offer: ₹10 lakhs for 90% soul + ek garam bowl. ABHI.",
      pitcher: "90%?! Itna toh roommate ne bhi nahi liya tha sir 😭",
      pitcherMood: "cry",
    },
    desperate: {
      shark: "Tera dard scalable hai. Hum ek app banayenge — MaggiMitra. ₹5 lakh for 80%. Final.",
      pitcher: "80%... ek packet ke liye? 🥺 Soch lunga sir",
      pitcherMood: "nervous",
    },
    chaotic: {
      shark: "Bhai tu pure chaos hai aur main chaos invest karta hun. ₹1 crore for 99% — Maggi Empire banayenge!",
      pitcher: "99%?? Mera kya bachega sir?! 😱",
      pitcherMood: "shock",
    },
  },
};

const TONES: { id: Tone; label: string; emoji: string }[] = [
  { id: "savage", label: "Go SAVAGE 🔥", emoji: "🔥" },
  { id: "desperate", label: "Beg HARDER 😭", emoji: "😭" },
  { id: "chaotic", label: "Pure CHAOS 🤡", emoji: "🤡" },
];

function buildSharkDecision(sid: SharkId, nextId: string): DecisionNode {
  const lines = sharkLines[sid];
  return {
    id: `${sid}-tone`,
    intro: [{ speaker: sid, mood: "smug", text: "Pehle reaction sun. Ab tu kaise jawab dega?" }],
    prompt: `${SHARKS[sid].name} just roasted you. Your move:`,
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

/** Final ending node — three classic outcomes */
const ENDING_NODE: DecisionNode = {
  id: "ending",
  intro: [
    { speaker: "narrator", text: "Saare 5 sharks ne tujhe roast kar diya. Ab final move kya hai?" },
  ],
  prompt: "Choose your destiny:",
  branches: [
    {
      id: "counter",
      label: '"Counter-offer!"',
      emoji: "💥",
      beats: [
        { speaker: "pitcher", mood: "confident", text: "Sharks! Counter-offer: ₹1 royalty per slurping sound in HOSTEL India!" },
        { speaker: "ashneer", mood: "smug", text: "SECURITY!! Isko bahar nikaalo!" },
        { speaker: "narrator", text: "Tu bhaagta hai. CCTV pe. Sab dekh rahe hain." },
      ],
      next: "twist",
    },
    {
      id: "politics",
      label: '"Pivot to Politics"',
      emoji: "🗳️",
      beats: [
        { speaker: "pitcher", mood: "confident", text: "Shark hona too much kaam hai. Main HOSTEL PRESIDENT banunga!" },
        { speaker: "aman", mood: "smug", text: "Manifesto kya hai bhai?" },
        { speaker: "pitcher", mood: "confident", text: "'FREE TASTEMAKER FOR ALL'. Landslide victory guaranteed 🚀" },
      ],
      next: "twist",
    },
    {
      id: "emotional",
      label: '"Emotional Card"',
      emoji: "🎻",
      beats: [
        { speaker: "narrator", text: "🎻 Background music: sad violin..." },
        { speaker: "pitcher", mood: "cry", text: "Sharks... ye mahine ki AAKHRI Maggi thi. Roommate ne mera bachpan chura liya. 😭" },
        { speaker: "namita", mood: "smug", text: "Beta... *tears up*" },
        { speaker: "narrator", text: "Sab sharks RO rahe hain. Studio me sannata. Fir bhi paisa NAHI dete." },
      ],
      next: "twist",
    },
  ],
};

/** The CCTV plot-twist outro */
const TWIST_NODE: DecisionNode = {
  id: "twist",
  intro: [
    { speaker: "narrator", text: "📹 BREAKING: CCTV Footage Leak from your hostel..." },
    { speaker: "narrator", text: "3:00 AM. Tu hi tha. Sleep-walking. Maggi pakaayi. Spoon se khaayi (ULTIMATE crime). Wrapper apne hi pillow me chhupaaya." },
    { speaker: "pitcher", mood: "shock", text: "Ye... ye toh main hi hun?? 🫥" },
    { speaker: "narrator", text: "🦈 Tu THIEF hai. Tu VICTIM hai. Tu hi ECOSYSTEM hai." },
  ],
  prompt: "Tank se nikal gaya. Ab agla stage — Bachchan sahab bula rahe hain!",
  branches: [
    { id: "kbc", label: "🎬 GO TO KBC", emoji: "🎬", beats: [], next: "kbc" },
    { id: "restart", label: "🔁 PITCH AGAIN", emoji: "🔁", beats: [], next: "intro" },
    { id: "exit", label: "✌️ EXIT TANK", emoji: "✌️", beats: [], next: "exit" },
  ],
};

/** Opening pitch — same every time */
const INTRO_NODE: DecisionNode = {
  id: "intro",
  intro: [
    { speaker: "narrator", text: "🦈 Welcome to SHARK TANK INDIA — Maggi Edition. Dhun dhun dhun dhun DAAAA!" },
    { speaker: "pitcher", mood: "confident", text: "Namaste Sharks 🙏 Main Yadriksha — founder of 'Meri Maggi Kahan Hai? Pvt. Ltd.'" },
    { speaker: "pitcher", mood: "confident", text: "Har raat 140 crore log sote hain. 40% students 2 AM ko uthke dekhte hain — assets LIQUIDATED by roommate!" },
    { speaker: "pitcher", mood: "confident", text: "₹100 Crores chahiye — for 0.1% equity. Mera dard SCALABLE hai. 😤" },
  ],
  prompt: "Sharks ready hain. Kaunse shark se shuru?",
  branches: SHARK_ORDER.map((sid, i) => ({
    id: `start-${sid}`,
    label: SHARKS[sid].name,
    emoji: ["🧐", "💁‍♀️", "👓", "😎", "🔬"][i],
    beats: [],
    next: `${sid}-tone`,
  })),
};

/** Build full graph: intro → pick shark → tone → next shark in default order → ... → ending → twist */
export function buildGraph(): Record<string, DecisionNode> {
  const nodes: Record<string, DecisionNode> = {
    intro: INTRO_NODE,
    ending: ENDING_NODE,
    twist: TWIST_NODE,
  };
  // After each shark, go to the next un-visited one — but for simplicity here we
  // route every shark → next in fixed order, ending → ending node.
  SHARK_ORDER.forEach((sid, idx) => {
    const next = idx < SHARK_ORDER.length - 1 ? `${SHARK_ORDER[idx + 1]}-tone` : "ending";
    nodes[`${sid}-tone`] = buildSharkDecision(sid, next);
  });
  return nodes;
}
