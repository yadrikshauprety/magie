/** Brand ad payloads triggered when user tries to "cross off" a shark. */
import { SharkId } from "./sharkData";

export type SharkAd = {
  brand: string;
  tagline: string;
  emoji: string;
  bg: string; // tailwind bg-* class or arbitrary hsl
  fg: string; // text color
  punchline: string;
};

export const SHARK_ADS: Record<SharkId, SharkAd> = {
  peyush: {
    brand: "LENSKART",
    tagline: "Don't close your eyes to a 1.5x vision.",
    emoji: "👓",
    bg: "linear-gradient(135deg, hsl(160 80% 35%), hsl(160 70% 25%))",
    fg: "white",
    punchline: "BUY 1 GET 1 FREE — but only if you UN-close Peyush sir.",
  },
  aman: {
    brand: "boAt",
    tagline: "Crossing me? Cross-fade kar le bhai.",
    emoji: "🎧",
    bg: "linear-gradient(135deg, hsl(0 90% 55%), hsl(280 70% 40%))",
    fg: "white",
    punchline: "boAt Airdopes — noise cancel kar de, founder mat kar.",
  },
  ashneer: {
    brand: "BharatPe (allegedly)",
    tagline: "Doglapan dikha raha hai? Cross? KAISE?!",
    emoji: "💸",
    bg: "linear-gradient(135deg, hsl(14 90% 55%), hsl(40 95% 50%))",
    fg: "white",
    punchline: "Tu yahan ad band kar raha hai, mera dimaag ghum gaya hai!",
  },
  namita: {
    brand: "Sugar Cosmetics",
    tagline: "Beta itni jaldi out? Lipstick laga ke aati hun.",
    emoji: "💄",
    bg: "linear-gradient(135deg, hsl(330 75% 55%), hsl(350 80% 60%))",
    fg: "white",
    punchline: "MATTE-AS-HELL lipstick — for sharks who exit dramatically.",
  },
  anupam: {
    brand: "Emcure / Shaadi.com",
    tagline: "Data dikha — Shaadi karle.",
    emoji: "💍",
    bg: "linear-gradient(135deg, hsl(200 85% 50%), hsl(220 80% 35%))",
    fg: "white",
    punchline: "90% of cross-attempts end in marriage. (Source: Anupam ji.)",
  },
};
