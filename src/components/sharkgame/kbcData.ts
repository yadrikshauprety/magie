/**
 * KBC ("Kaun Banega Crorepati") — Maggi Edition.
 * 5 questions, 4 options each. Funnier writing, branch-then-converge.
 * Endings decided by cumulative chaos score.
 */

export type KbcOption = {
  letter: "A" | "B" | "C" | "D";
  text: string;
  chaos: number;
  reaction: string;
  next: string;
};

export type KbcQuestion = {
  id: string;
  prize: string;
  bachchan: string;
  question: string;
  options: KbcOption[];
};

export const KBC_QUESTIONS: Record<string, KbcQuestion> = {
  q1: {
    id: "q1",
    prize: "₹1,000",
    bachchan:
      "Devi-yon aur sajjano. Yadriksha ji, Shark Tank se seedha Sony ke studio me. Aaiye, pehla sawaal — sirf ek hazaar rupaye ke liye:",
    question: "Maggi packet pe likha hota hai '2-Minute Noodles'. Sach kya hai?",
    options: [
      { letter: "A", text: "2 minute (Nestle ka jhooth)", chaos: 1, next: "q2", reaction: "Confident! Lekin computer ji haste hain." },
      { letter: "B", text: "5 minute (real)", chaos: 0, next: "q2", reaction: "Eemaandari ka inaam milega beta." },
      { letter: "C", text: "Jab tak roommate so raha hai", chaos: 3, next: "q2", reaction: "Trauma response detect kar liya 😅" },
      { letter: "D", text: "Time ek illusion hai sahab", chaos: 5, next: "q2", reaction: "Aap Osho ke chele lagte ho." },
    ],
  },
  q2: {
    id: "q2",
    prize: "₹10,000",
    bachchan: "Wah wah! Hosh me aaiye, ab das hazaar ke liye:",
    question: "Tastemaker ka asli rang kya hai?",
    options: [
      { letter: "A", text: "Pila-bhura (Yellowish-brown)", chaos: 0, next: "q3", reaction: "Logical. Lock kiya jaaye." },
      { letter: "B", text: "MSG ka rang", chaos: 2, next: "q3", reaction: "Chemistry student detected!" },
      { letter: "C", text: "Roommate ke aansoo ka rang", chaos: 4, next: "q3", reaction: "Poetic. Lekin sawaal poetry nahi tha." },
      { letter: "D", text: "Audience poll lo bhai", chaos: 2, next: "q3", reaction: "Audience bhi bhookhi hai, kuch nahi pata." },
    ],
  },
  q3: {
    id: "q3",
    prize: "₹1 Lakh",
    bachchan: "Khel garam ho raha hai. Ek lakh rupaye ke liye, agla sawaal:",
    question: "Hostel-grade Maggi ka 'gold standard' kya hai?",
    options: [
      { letter: "A", text: "1.5 cup paani + tastemaker, bas", chaos: 0, next: "q4", reaction: "Approved by every wing in the hostel." },
      { letter: "B", text: "Cheese, butter, andaa, pyaaz, magic", chaos: 2, next: "q4", reaction: "Maharaja edition! Bahut khoob." },
      { letter: "C", text: "Bathroom me lock karke khao", chaos: 4, next: "q4", reaction: "Tactical genius 🔒" },
      { letter: "D", text: "Microwave me 12 minute", chaos: 6, next: "q4", reaction: "Aap warden ko warning bhej dijiye." },
    ],
  },
  q4: {
    id: "q4",
    prize: "₹25 Lakh",
    bachchan: "Computer ji, agla sawaal dikhayiye. Pacchees lakh ke liye:",
    question: "Roommate Maggi chura le toh constitutional remedy kya hai?",
    options: [
      { letter: "A", text: "Article 21 — Right to Snack", chaos: 1, next: "q5", reaction: "Constitution ke vidvaan!" },
      { letter: "B", text: "FIR — tastemaker is Exhibit A", chaos: 3, next: "q5", reaction: "Police bhi has rahi hai aapke saath." },
      { letter: "C", text: "Twitter pe PMO ko tag karo", chaos: 5, next: "q5", reaction: "Modern problem, modern panga 📱" },
      { letter: "D", text: "Uska shampoo flush kar do", chaos: 4, next: "q5", reaction: "Equal and opposite reaction 🚽" },
    ],
  },
  q5: {
    id: "q5",
    prize: "₹7 CRORE 🏆",
    bachchan:
      "Ye hai aakhri sawaal. Saat crore ke liye. Jeet gaye toh history. Haar gaye toh pure desh ka meme.",
    question: "Agar 3 AM ko Maggi paki aur kisi ne slurp nahi suna — kya woh asli me bani thi?",
    options: [
      { letter: "A", text: "Haan — smell legally binding hai", chaos: 1, next: "ending", reaction: "Philosophical — lekin lawyer-approved!" },
      { letter: "B", text: "Nahi — NPA hai", chaos: 2, next: "ending", reaction: "Banker mindset detected 💼" },
      { letter: "C", text: "Sirf agar roommate uthe aur bite maange", chaos: 0, next: "ending", reaction: "HIMMAT HAI!! Lock kiya jaaye!" },
      { letter: "D", text: "Sab kuch maya hai", chaos: 6, next: "ending", reaction: "Ye jawab nahi, ek poora dharm-granth hai." },
    ],
  },
};

export type KbcEnding = {
  id: "triumph" | "disaster" | "cosmic";
  emoji: string;
  title: string;
  bachchan: string[];
  pitcher: string;
};

export const KBC_ENDINGS: Record<KbcEnding["id"], KbcEnding> = {
  triumph: {
    id: "triumph",
    emoji: "🏆",
    title: "JEET GAYE — ₹7 CROOOOORE!",
    bachchan: [
      "Computer ji, lock kiya jaaye.",
      "Yadriksha ji... aap... JEET GAYE HAIN! Saat crore aapke!",
      "Ab zindagi bhar Maggi khareedo. Roommate ko 1000 packet bhej do — courier se. With LOVE.",
    ],
    pitcher: "Ye toh Shark Tank se bhi badi cheez ho gayi! 🎉",
  },
  disaster: {
    id: "disaster",
    emoji: "💀",
    title: "GHAR JAAIYE",
    bachchan: [
      "Aapka jawab... galat hai.",
      "Computer ji ne kaha 'D'. Aap ghar jaa rahe hain — ek packet Maggi le ke.",
      "Lekin yaad rakhiye — aap sirf KBC ka show nahi, ek poori generation ka dard ho.",
    ],
    pitcher: "Sirf ek packet?! Roommate ko nahi dunga! 😤",
  },
  cosmic: {
    id: "cosmic",
    emoji: "🌌",
    title: "BRAHMAND HIL GAYA",
    bachchan: [
      "Aapka jawab… computer ko hi crash kar gaya.",
      "Studio ki light flicker kar rahi hai. Ye sawaal humne nahi, brahmand ne pucha tha.",
      "Aap KBC se PARE chale gaye ho. Ab aap ek philosophy ho — 'The Slurping Paradox'.",
    ],
    pitcher: "Toh kya main… ab god ban gaya?? 🫥",
  },
};

export function endingFromChaos(chaos: number): KbcEnding["id"] {
  if (chaos <= 4) return "triumph";
  if (chaos <= 12) return "disaster";
  return "cosmic";
}
