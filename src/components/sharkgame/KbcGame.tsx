import { useEffect, useState } from "react";
import { KBC_ENDINGS, KBC_QUESTIONS, KbcOption, endingFromChaos } from "./kbcData";

interface Props {
  onClose: () => void;
  onZoomShake: () => void;
  speak: (text: string, opts?: { lang?: string; pitch?: number; rate?: number }) => void;
  vibrate: (pattern?: number | number[]) => void;
  muted: boolean;
}

type View =
  | { kind: "intro" }
  | { kind: "question"; id: string; chaos: number; pickedLetter?: string; locking?: boolean }
  | { kind: "reaction"; id: string; chaos: number; option: KbcOption }
  | { kind: "ending"; chaos: number };

export default function KbcGame({ onClose, onZoomShake, speak, vibrate, muted }: Props) {
  const [view, setView] = useState<View>({ kind: "intro" });

  useEffect(() => {
    if (view.kind === "intro") {
      speak(
        "Devi-yon aur sajjano. Yadriksha ji, Shark Tank se seedha KBC me. Aaiye khelte hain.",
        { lang: "hi-IN", pitch: 0.6, rate: 0.92 }
      );
      const t = setTimeout(() => setView({ kind: "question", id: "q1", chaos: 0 }), 3500);
      return () => clearTimeout(t);
    }
    if (view.kind === "question") {
      const q = KBC_QUESTIONS[view.id];
      speak(`${q.bachchan} ${q.question}`, { lang: "hi-IN", pitch: 0.6, rate: 0.95 });
    }
    if (view.kind === "reaction") {
      speak(view.option.reaction, { lang: "hi-IN", pitch: 0.6, rate: 0.98 });
    }
    if (view.kind === "ending") {
      const e = KBC_ENDINGS[endingFromChaos(view.chaos)];
      speak(e.bachchan.join(" "), { lang: "hi-IN", pitch: 0.6, rate: 0.95 });
      vibrate([60, 40, 60, 40, 200]);
    }
  }, [view, speak, vibrate]);

  const pick = (q: string, opt: KbcOption) => {
    if (view.kind !== "question") return;
    onZoomShake();
    vibrate(80);
    setView({ kind: "question", id: q, chaos: view.chaos, pickedLetter: opt.letter, locking: true });
    setTimeout(() => {
      setView({ kind: "reaction", id: q, chaos: view.chaos + opt.chaos, option: opt });
    }, 1100);
  };

  const next = () => {
    if (view.kind !== "reaction") return;
    if (view.option.next === "ending") {
      setView({ kind: "ending", chaos: view.chaos });
    } else {
      setView({ kind: "question", id: view.option.next, chaos: view.chaos });
    }
  };

  if (view.kind === "intro") {
    return (
      <div className="anim-pop flex h-[420px] flex-col items-center justify-center gap-3 text-center">
        <div className="text-6xl">🎬</div>
        <h2 className="text-stroke text-3xl font-black text-accent sm:text-4xl">KAUN BANEGA CROREPATI</h2>
        <p className="text-sm font-bold text-white/90">presenting: Yadriksha — fresh from the Shark Tank.</p>
        <div className="anim-pulse-ring mt-4 h-3 w-40 rounded-full bg-accent" />
      </div>
    );
  }

  if (view.kind === "ending") {
    const e = KBC_ENDINGS[endingFromChaos(view.chaos)];
    return (
      <div className="anim-pop flex flex-col items-center gap-4 py-6 text-center">
        <div className="text-7xl anim-shake">{e.emoji}</div>
        <h2 className="text-stroke text-2xl font-black text-accent sm:text-3xl">{e.title}</h2>
        <div className="space-y-2">
          {e.bachchan.map((l, i) => (
            <p key={i} className="rounded-xl border-[3px] border-[hsl(var(--ink))] bg-card px-3 py-2 text-sm font-semibold text-card-foreground comic-shadow">
              👴 {l}
            </p>
          ))}
        </div>
        <p className="rounded-xl border-[3px] border-[hsl(var(--ink))] bg-primary px-3 py-2 text-sm font-bold text-primary-foreground comic-shadow">
          🧑 {e.pitcher}
        </p>
        <p className="text-xs font-bold text-white/80">Chaos score: {view.chaos}</p>
        <button
          onClick={onClose}
          className="rounded-xl border-[3px] border-[hsl(var(--ink))] bg-accent px-5 py-2 font-black text-accent-foreground comic-shadow"
        >
          ✌️ EXIT KBC
        </button>
      </div>
    );
  }

  if (view.kind === "reaction") {
    const q = KBC_QUESTIONS[view.id];
    return (
      <div className="anim-pop flex flex-col gap-3" onClick={next} role="button">
        <div className="rounded-2xl border-[3px] border-[hsl(var(--ink))] bg-card px-4 py-3 text-card-foreground comic-shadow">
          <p className="text-xs font-black text-primary">👴 BACHCHAN SAHAB</p>
          <p className="mt-1 text-sm font-semibold sm:text-base">"{view.option.reaction}"</p>
        </div>
        <div className="rounded-2xl border-[3px] border-dashed border-white/70 bg-[hsl(var(--ink))]/40 px-4 py-3 text-center text-sm font-bold text-white">
          You picked <span className="text-accent">[{view.option.letter}] {view.option.text}</span>
          <div className="mt-1 text-[11px] opacity-80">+{view.option.chaos} chaos</div>
        </div>
        <p className="text-center text-[11px] font-bold text-white/80">👆 click to continue</p>
      </div>
    );
  }

  // question view
  const q = KBC_QUESTIONS[view.id];
  return (
    <div className="anim-pop flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="rounded-full border-[3px] border-[hsl(var(--ink))] bg-accent px-3 py-0.5 text-xs font-black text-accent-foreground comic-shadow">
          PRIZE: {q.prize}
        </span>
        <span className="rounded-full border-[3px] border-[hsl(var(--ink))] bg-card px-3 py-0.5 text-xs font-black comic-shadow">
          CHAOS: {view.chaos}
        </span>
      </div>
      <div className="rounded-2xl border-[3px] border-[hsl(var(--ink))] bg-card px-4 py-3 text-card-foreground comic-shadow">
        <p className="text-xs font-black text-primary">👴 BACHCHAN SAHAB</p>
        <p className="mt-1 text-sm font-semibold italic sm:text-base">"{q.bachchan}"</p>
        <p className="mt-2 rounded-lg bg-accent px-3 py-2 text-sm font-black text-accent-foreground sm:text-base">
          ❓ {q.question}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {q.options.map((o) => {
          const picked = view.pickedLetter === o.letter;
          return (
            <button
              key={o.letter}
              onClick={() => pick(q.id, o)}
              disabled={view.locking}
              className={`group flex items-start gap-3 rounded-xl border-[3px] border-[hsl(var(--ink))] px-3 py-3 text-left text-sm font-bold transition-transform comic-shadow disabled:opacity-60 ${
                picked ? "bg-accent text-accent-foreground anim-shake" : "bg-card text-card-foreground hover:-translate-y-1 hover:bg-accent"
              }`}
            >
              <span className="rounded-full bg-[hsl(var(--ink))] px-2 py-0.5 text-xs font-black text-white">
                {o.letter}
              </span>
              <span className="flex-1">{o.text}</span>
            </button>
          );
        })}
      </div>
      <p className="text-center text-[11px] font-bold text-white/80">Lock kiya jaaye?</p>
    </div>
  );
}
