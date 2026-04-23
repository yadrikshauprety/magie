import { useEffect, useRef } from "react";

/**
 * Browser TTS hook using Web Speech API.
 * Free, no API keys, supports Hindi + Indian English voices.
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

  const pickVoice = (lang: string) => {
    const v = voicesRef.current;
    if (!v.length) return null;
    return (
      v.find((x) => x.lang === lang) ||
      v.find((x) => x.lang.startsWith(lang.split("-")[0])) ||
      v.find((x) => /india|hindi/i.test(x.name)) ||
      v[0]
    );
  };

  const speak = (text: string, opts?: { lang?: string; pitch?: number; rate?: number }) => {
    if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(stripEmoji(text));
    const lang = opts?.lang ?? "en-IN";
    const v = pickVoice(lang);
    if (v) u.voice = v;
    u.lang = lang;
    u.pitch = opts?.pitch ?? 1;
    u.rate = opts?.rate ?? 1;
    u.volume = 0.95;
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
  // Remove emoji + non-speech chars so TTS doesn't say "smiling face"
  return s
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}
