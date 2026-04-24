import { useEffect, useRef } from "react";

/**
 * Browser TTS hook using Web Speech API.
 * Free, no API keys. Tries hard to pick the most "Indian"-sounding voice
 * available on the user's OS so each shark / character sounds distinct.
 */
export function useVoice(enabled: boolean) {
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  /**
   * Pick the best Indian-leaning voice.
   * Priority:
   *  1. Voice whose name explicitly contains a desired Indian voice name (Veena, Rishi, Lekha, Ravi, Aditi, Kalpana, Heera, Hemant, Neel, Priya)
   *  2. Voice with lang exactly matching (en-IN / hi-IN)
   *  3. Voice with lang prefix matching
   *  4. First voice
   */
  const pickVoice = (lang: string, prefer?: "male" | "female") => {
    const v = voicesRef.current;
    if (!v.length) return null;

    const indianMaleNames = ["rishi", "ravi", "hemant", "neel", "prabhat"];
    const indianFemaleNames = ["veena", "lekha", "aditi", "kalpana", "heera", "priya", "isha"];
    const wanted = prefer === "male" ? indianMaleNames : prefer === "female" ? indianFemaleNames : [...indianMaleNames, ...indianFemaleNames];

    const byName = v.find((x) => wanted.some((n) => x.name.toLowerCase().includes(n)));
    if (byName) return byName;

    const indianLang = v.filter((x) => x.lang === lang || x.lang === "en-IN" || x.lang === "hi-IN");
    if (indianLang.length) {
      // try to bias by gender hint in name if requested
      if (prefer) {
        const maleHint = indianLang.find((x) => /male|rishi|ravi|hemant/i.test(x.name));
        const femaleHint = indianLang.find((x) => /female|veena|aditi|priya/i.test(x.name));
        if (prefer === "male" && maleHint) return maleHint;
        if (prefer === "female" && femaleHint) return femaleHint;
      }
      return indianLang[0];
    }

    return (
      v.find((x) => x.lang.startsWith(lang.split("-")[0])) ||
      v.find((x) => /india|hindi/i.test(x.name)) ||
      v[0]
    );
  };

  const speak = (
    text: string,
    opts?: { lang?: string; pitch?: number; rate?: number; gender?: "male" | "female" }
  ) => {
    if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(stripEmoji(text));
    const lang = opts?.lang ?? "en-IN";
    const v = pickVoice(lang, opts?.gender);
    if (v) u.voice = v;
    u.lang = lang;
    u.pitch = opts?.pitch ?? 1;
    u.rate = opts?.rate ?? 1;
    u.volume = 1;
    window.speechSynthesis.speak(u);
  };

  const stop = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  return { speak, stop };
}

function stripEmoji(s: string) {
  return s
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}
