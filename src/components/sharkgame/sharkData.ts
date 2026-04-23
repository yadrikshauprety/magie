import anupam from "@/assets/shark-anupam.png";
import namita from "@/assets/shark-namita.png";
import ashneer from "@/assets/shark-ashneer.png";
import aman from "@/assets/shark-aman.png";
import peyush from "@/assets/shark-peyush.png";

export type Shark = {
  id: string;
  name: string;
  title: string;
  img: string;
  color: string;
  line: string;
};

export const SHARKS: Shark[] = [
  {
    id: "anupam",
    name: "Anupam",
    title: "The Data King 🧐",
    img: anupam,
    color: "hsl(200 85% 50%)",
    line: "Bhai, tumne investigation kiya? Tera roommate already pitch kar chuka hai — claiming 'distressed inventory'. Ye sab DOGLAPAN hai! Drawers me biometric lagao.",
  },
  {
    id: "namita",
    name: "Namita",
    title: "The 'Out' Expert 💁‍♀️",
    img: namita,
    color: "hsl(330 75% 55%)",
    line: "Mera expertise pharma me hai. Indigestion hota toh help karti, but empty drawer se main connect nahi kar paa rahi. For that reason... I am OUT.",
  },
  {
    id: "ashneer",
    name: "Ashneer",
    title: "The Reality Check 👓",
    img: ashneer,
    color: "hsl(14 90% 55%)",
    line: "Kya kar raha hai tu? Tamasha hai ye? ₹100 crore?! Bhai naye drawer khareed le. Tu dhanda band kar aur SOJA. Bilkul ghatiya pitch hai!",
  },
  {
    id: "aman",
    name: "Aman",
    title: "The Swag Boss 😎",
    img: aman,
    color: "hsl(280 70% 55%)",
    line: "Tension kyun le raha hai? Hum naya brand nikalenge — 'boAt-Noodles'. Tasty kam, sound zyada. Ek item song daal denge, HIT hai boss!",
  },
  {
    id: "peyush",
    name: "Peyush",
    title: "The Visionary 👓",
    img: peyush,
    color: "hsl(160 70% 40%)",
    line: "Mujhe isme tech dikh raha hai. AI-powered forks — koi aur pakde toh 440V ka jhatka. Offer: ₹10 lakhs for 90% of your soul + ek garam bowl noodles. ABHI.",
  },
];

export type PitcherLine = {
  text: string;
  mood: "confident" | "nervous" | "cry" | "shock";
};

export const OPENING: PitcherLine[] = [
  { text: "Namaste Sharks 🙏 Main Yadriksha — founder of 'Meri Maggi Kahan Hai? Pvt. Ltd.'", mood: "confident" },
  { text: "Har raat 140 crore log sote hain. Lekin 40% students 2 AM ko uthke dekhte hain — assets liquidated by roommate!", mood: "confident" },
  { text: "Ye ek NATIONAL CRISIS market hai. I am asking ₹100 Crores for 0.1% equity. Mera dard scalable hai. 😤", mood: "confident" },
];

export const PITCHER_REACTIONS: Record<string, PitcherLine> = {
  anupam: { text: "Doglapan?? Maine toh bas Maggi maangi thi sir... 😭", mood: "cry" },
  namita: { text: "Ma'am ek bowl toh try kar leti... 🥺", mood: "cry" },
  ashneer: { text: "SOJA?? Maggi ke bina neend nahi aati sir!! 😭😭", mood: "cry" },
  aman: { text: "boAt-Noodles?? Mera dard product nahi hai bhaiya... 😢", mood: "cry" },
  peyush: { text: "90% soul?? Itna toh roommate ne bhi nahi liya tha... 😭", mood: "cry" },
};

export const ENDINGS = {
  counter: {
    title: "💥 COUNTER-OFFER",
    text: "Tu maangta hai ₹1 royalty per slurp in hostel. Sharks call SECURITY. Tu bhaagta hai. CCTV pe.",
  },
  politics: {
    title: "🗳️ PIVOT TO POLITICS",
    text: "Shark hona too much kaam hai. Tu Hostel President banta hai — manifesto: 'Free Tastemaker For All'. LANDSLIDE.",
  },
  emotional: {
    title: "🎻 THE EMOTIONAL CARD",
    text: "Background music: sad violin. 'Ye mahine ki AAKHRI Maggi thi.' Sharks ROTE hain. Paisa phir bhi nahi dete.",
  },
} as const;

export type EndingKey = keyof typeof ENDINGS;
