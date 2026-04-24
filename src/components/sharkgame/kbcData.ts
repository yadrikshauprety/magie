/**
 * KBC ("Kaun Banega Crorepati") branching game.
 * After Shark Tank verdict, pitcher walks into KBC studio.
 * Each question has 4 options A/B/C/D and ALWAYS branches.
 * Branch-then-converge: every path eventually hits a 3-way ending
 * (TRIUMPH / DISASTER / COSMIC) based on cumulative chaos score.
 */

export type KbcOption = {
  letter: "A" | "B" | "C" | "D";
  text: string;
  /** chaos delta — added to score; ending decided from total */
  chaos: number;
  /** Bachchan's reaction line */
  reaction: string;
  /** id of next question, or "ending" */
  next: string;
};

export type KbcQuestion = {
  id: string;
  prize: string;
  bachchan: string; // intro line
  question: string;
  options: KbcOption[];
};

export const KBC_QUESTIONS: Record<string, KbcQuestion> = {
  q1: {
    id: "q1",
    prize: "₹1,000",
    bachchan:
      "Devi-yon aur sajjano... aaiye khelte hain. Yadriksha ji, Shark Tank se seedha KBC me. Pehla sawaal — ₹1,000 ke liye:",
    question: "Maggi 2-minute me banti hai... but actually kitna time lagta hai?",
    options: [
      { letter: "A", text: "2 minute (jhooth)", chaos: 1, next: "q2", reaction: "Confident lag rahe ho!" },
      { letter: "B", text: "5 minute (sach)", chaos: 0, next: "q2", reaction: "Eemaandari! Bahut khoob." },
      { letter: "C", text: "Roommate khaa leta hai", chaos: 3, next: "q2", reaction: "Trauma response detect kiya 😅" },
      { letter: "D", text: "Maggi banti hi nahi", chaos: 5, next: "q2", reaction: "Ye toh existential crisis hai!" },
    ],
  },
  q2: {
    id: "q2",
    prize: "₹10,000",
    bachchan: "Bahut khoob. Ab agla sawaal — ₹10,000 ke liye:",
    question: "Tastemaker ka asli rang kaunsa hai?",
    options: [
      { letter: "A", text: "Pila (Yellow)", chaos: 0, next: "q3", reaction: "Logical." },
      { letter: "B", text: "Bhura (Brown)", chaos: 1, next: "q3", reaction: "Hmm... half right." },
      { letter: "C", text: "Roommate ke aansoo ka rang", chaos: 4, next: "q3", reaction: "Poetic — but yahan poetry nahi chalti!" },
      { letter: "D", text: "Lifeline lo, audience pucho", chaos: 2, next: "q3", reaction: "Audience bhi confused hai..." },
    ],
  },
  q3: {
    id: "q3",
    prize: "₹1 Lakh",
    bachchan: "Khel ab dilchasp ho raha hai. ₹1 lakh ke liye:",
    question: "Hostel ka 'Gold Standard Maggi Recipe' kya hai?",
    options: [
      { letter: "A", text: "1.5 cup paani + tastemaker", chaos: 0, next: "q4", reaction: "Classic. Approved." },
      { letter: "B", text: "Cheese, andaa, butter — sab daal", chaos: 2, next: "q4", reaction: "Maharaja edition!" },
      { letter: "C", text: "Roommate ke saamne band darwaze me", chaos: 4, next: "q4", reaction: "Tactical brilliance 🔒" },
      { letter: "D", text: "Microwave me 12 minute", chaos: 6, next: "q4", reaction: "AAG LAG GAYI HOGI!" },
    ],
  },
  q4: {
    id: "q4",
    prize: "₹25 Lakh",
    bachchan: "Computer ji, agla sawaal dikhayiye. ₹25 lakh ke liye:",
    question: "Agar roommate Maggi chura le, toh constitutional remedy kya hai?",
    options: [
      { letter: "A", text: "Article 21 — Right to Snack", chaos: 1, next: "q5", reaction: "Constitution scholar!" },
      { letter: "B", text: "FIR with Tastemaker as evidence", chaos: 3, next: "q5", reaction: "Police bhi hasega!" },
      { letter: "C", text: "Twitter pe tag karo PMO", chaos: 5, next: "q5", reaction: "Modern problem, modern solution 📱" },
      { letter: "D", text: "Khud bhi uska Maggi chura lo", chaos: 4, next: "q5", reaction: "Eye for an eye, packet for a packet!" },
    ],
  },
  q5: {
    id: "q5",
    prize: "₹7 CRORE 🏆",
    bachchan:
      "Ye hai aakhri sawaal. Saat crore ke liye. Jeet gaye toh history. Haar gaye toh viral meme.",
    question: "If a Maggi packet is cooked at 3 AM and no one hears it slurp... did it exist?",
    options: [
      { letter: "A", text: "Haan — smell legally binding hai", chaos: 1, next: "ending", reaction: "Philosophical!" },
      { letter: "B", text: "Nahi — NPA hai", chaos: 2, next: "ending", reaction: "Banker mindset!" },
      { letter: "C", text: "Sirf agar roommate uthe aur bite maange", chaos: 0, next: "ending", reaction: "HIMMAT HAI! Sahi jawab!" },
      { letter: "D", text: "Sab kuch Maya hai", chaos: 6, next: "ending", reaction: "Ye sawaal ka jawab nahi, sawaal ka sawaal hai!" },
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
    title: "JEET GAYE! ₹7 CRORE!",
    bachchan: [
      "Ye hai aapka jawab? Computer ji lock kiya jaaye.",
      "Yadriksha ji... aap... JEET GAYE HAIN! SAAT CROOOOOORE!",
      "Ab aap zindagi bhar Maggi khareed sakte ho. Roommate ko 1000 packet bhejo!",
    ],
    pitcher: "Ye toh Shark Tank se bhi bada hai!! 🎉🎉🎉",
  },
  disaster: {
    id: "disaster",
    emoji: "💀",
    title: "GHAR JAAIYE",
    bachchan: [
      "Aapka jawab galat hai.",
      "Computer ji ne 'D' galat bataya. Aap ghar jaa rahe hain... ek Maggi packet ke saath.",
      "Lekin Yadriksha ji — aap sirf KBC ka show nahi, aap ek generation ka dard ho.",
    ],
    pitcher: "Sirf ek packet?? Roommate ko nahi dunga ye baar! 😤",
  },
  cosmic: {
    id: "cosmic",
    emoji: "🌌",
    title: "BRAHMAND HIL GAYA",
    bachchan: [
      "Aapka jawab... computer crash kar gaya.",
      "Studio ki light flicker kar rahi hai. Ye sawaal asambhav tha.",
      "Aap KBC se PARE chale gaye ho. Aap ab ek philosophy ho — 'The Slurping Paradox'.",
    ],
    pitcher: "Toh kya main… ab god ban gaya?? 🫥🌌",
  },
};

export function endingFromChaos(chaos: number): KbcEnding["id"] {
  if (chaos <= 4) return "triumph";
  if (chaos <= 12) return "disaster";
  return "cosmic";
}
