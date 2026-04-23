import { useEffect, useRef, useState } from "react";
import { X, Volume2, VolumeX, RotateCcw } from "lucide-react";
import pitcherImg from "@/assets/pitcher.png";
import pitcherCryImg from "@/assets/pitcher-crying.png";
import { ENDINGS, EndingKey, OPENING, PITCHER_REACTIONS, SHARKS } from "./sharkData";

type Phase =
  | { kind: "intro"; step: number }
  | { kind: "shark"; index: number }
  | { kind: "react"; index: number }
  | { kind: "choose" }
  | { kind: "ending"; key: EndingKey };

interface Props {
  onClose: () => void;
}

// Tiny WebAudio sound generator (no asset files needed)
function useSfx(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const get = () => {
    if (!enabled) return null;
    if (!ctxRef.current) {
      const Ctor = (window.AudioContext || (window as any).webkitAudioContext);
      if (Ctor) ctxRef.current = new Ctor();
    }
    return ctxRef.current;
  };
  const beep = (freq: number, dur = 0.08, type: OscillatorType = "square", vol = 0.06) => {
    const ctx = get();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g).connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.stop(ctx.currentTime + dur);
  };
  return {
    pop: () => beep(520, 0.06, "triangle"),
    shark: () => { beep(180, 0.1, "sawtooth"); setTimeout(() => beep(140, 0.12, "sawtooth"), 90); },
    cry: () => { beep(380, 0.18, "sine", 0.05); setTimeout(() => beep(280, 0.22, "sine", 0.05), 160); },
    drum: () => { [220, 220, 220, 220, 660].forEach((f, i) => setTimeout(() => beep(f, 0.12, "square"), i * 140)); },
    ding: () => beep(880, 0.18, "triangle", 0.07),
  };
}

export default function SharkTankGame({ onClose }: Props) {
  const [phase, setPhase] = useState<Phase>({ kind: "intro", step: 0 });
  const [muted, setMuted] = useState(false);
  const sfx = useSfx(!muted);

  // Auto-advance intro lines
  useEffect(() => {
    if (phase.kind === "intro") {
      sfx.pop();
      const t = setTimeout(() => {
        if (phase.step < OPENING.length - 1) {
          setPhase({ kind: "intro", step: phase.step + 1 });
        } else {
          sfx.drum();
          setTimeout(() => setPhase({ kind: "shark", index: 0 }), 800);
        }
      }, 2600);
      return () => clearTimeout(t);
    }
    if (phase.kind === "shark") {
      sfx.shark();
      const t = setTimeout(() => setPhase({ kind: "react", index: phase.index }), 2800);
      return () => clearTimeout(t);
    }
    if (phase.kind === "react") {
      sfx.cry();
      const t = setTimeout(() => {
        if (phase.index < SHARKS.length - 1) {
          setPhase({ kind: "shark", index: phase.index + 1 });
        } else {
          setPhase({ kind: "choose" });
        }
      }, 2400);
      return () => clearTimeout(t);
    }
    if (phase.kind === "ending") sfx.ding();
  }, [phase]);

  const reset = () => setPhase({ kind: "intro", step: 0 });

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 anim-bubble"
      style={{ background: "hsl(220 30% 8% / 0.75)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl comic-border comic-shadow-lg"
        style={{ background: "var(--gradient-tank)" }}
      >
        {/* Spotlight */}
        <div className="pointer-events-none absolute inset-0" style={{ background: "var(--gradient-spotlight)" }} />
        <div className="pointer-events-none absolute -top-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-accent/40 blur-3xl anim-spotlight" />

        {/* Header */}
        <div className="relative flex items-center justify-between border-b-[3px] border-[hsl(var(--ink))] bg-accent px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦈</span>
            <h2 className="text-stroke text-xl font-black tracking-wide text-white sm:text-2xl">
              SHARK TANK: MAGGI EDITION
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMuted((m) => !m)}
              className="rounded-full p-2 text-[hsl(var(--ink))] hover:bg-white/30"
              aria-label="toggle sound"
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button
              onClick={reset}
              className="rounded-full p-2 text-[hsl(var(--ink))] hover:bg-white/30"
              aria-label="restart"
            >
              <RotateCcw size={18} />
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-[hsl(var(--ink))] hover:bg-white/30"
              aria-label="close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Stage */}
        <div className="relative min-h-[440px] px-4 pb-6 pt-4 sm:px-8">
          {phase.kind !== "ending" && phase.kind !== "choose" && <Stage phase={phase} />}
          {phase.kind === "choose" && <Choices onPick={(k) => setPhase({ kind: "ending", key: k })} />}
          {phase.kind === "ending" && <Ending k={phase.key} onReset={reset} onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}

/* ---------- STAGE: pitcher + active shark + bubbles ---------- */
function Stage({ phase }: { phase: Extract<Phase, { kind: "intro" | "shark" | "react" }> }) {
  const isShark = phase.kind === "shark";
  const isReact = phase.kind === "react";
  const isIntro = phase.kind === "intro";

  const activeShark = !isIntro ? SHARKS[(phase as any).index] : null;
  const pitcherLine = isIntro
    ? OPENING[phase.step]
    : isReact
    ? PITCHER_REACTIONS[activeShark!.id]
    : null;
  const sharkLine = isShark ? activeShark!.line : null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6">
      {/* Pitcher */}
      <div className="relative flex flex-col items-center justify-end">
        <div className="relative">
          {/* Tears */}
          {isReact && (
            <>
              <span className="absolute left-[28%] top-[40%] text-2xl anim-tear">💧</span>
              <span className="absolute right-[28%] top-[40%] text-2xl anim-tear" style={{ animationDelay: "0.3s" }}>💧</span>
            </>
          )}
          <img
            src={isReact ? pitcherCryImg : pitcherImg}
            alt="pitcher"
            className={`h-48 w-auto sm:h-64 ${isReact ? "anim-shake" : "anim-float"}`}
            style={{ filter: "drop-shadow(4px 6px 0 hsl(var(--ink)))" }}
          />
        </div>
        {/* Pitcher bubble */}
        {pitcherLine && (
          <SpeechBubble key={`p-${phase.kind}-${(phase as any).step ?? (phase as any).index}`} side="right">
            {pitcherLine.text}
          </SpeechBubble>
        )}
        <Label>YOU</Label>
      </div>

      {/* Sharks panel */}
      <div className="relative flex flex-col items-center justify-end">
        {isIntro ? (
          <SharksLineup />
        ) : (
          <ActiveShark shark={activeShark!} talking={isShark} />
        )}
        {sharkLine && (
          <SpeechBubble key={`s-${(phase as any).index}`} side="left" tone="shark">
            <span className="font-black">{activeShark!.name}:</span> {sharkLine}
          </SpeechBubble>
        )}
        <Label>{isIntro ? "THE SHARKS" : activeShark!.title}</Label>
      </div>
    </div>
  );
}

function SharksLineup() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-1 anim-pop">
      {SHARKS.map((s, i) => (
        <img
          key={s.id}
          src={s.img}
          alt={s.name}
          className="h-20 w-20 rounded-full border-[3px] border-[hsl(var(--ink))] bg-white object-cover comic-shadow sm:h-24 sm:w-24"
          style={{ animation: `float-bob 3s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  );
}

function ActiveShark({ shark, talking }: { shark: typeof SHARKS[number]; talking: boolean }) {
  return (
    <div className="relative">
      {talking && (
        <span
          className="absolute inset-0 rounded-full anim-pulse-ring"
          style={{ background: shark.color, opacity: 0.5 }}
        />
      )}
      <img
        src={shark.img}
        alt={shark.name}
        className={`relative h-40 w-40 rounded-full border-[4px] border-[hsl(var(--ink))] bg-white object-cover comic-shadow-lg sm:h-52 sm:w-52 ${
          talking ? "anim-wiggle" : ""
        }`}
        style={{ boxShadow: `8px 8px 0 hsl(var(--ink)), 0 0 0 6px ${shark.color}` }}
      />
    </div>
  );
}

function SpeechBubble({
  children,
  side,
  tone = "you",
}: {
  children: React.ReactNode;
  side: "left" | "right";
  tone?: "you" | "shark";
}) {
  const bg = tone === "shark" ? "bg-accent" : "bg-card";
  const fg = tone === "shark" ? "text-[hsl(var(--ink))]" : "text-card-foreground";
  return (
    <div
      className={`anim-bubble relative mb-2 max-w-[95%] rounded-2xl border-[3px] border-[hsl(var(--ink))] ${bg} ${fg} px-3 py-2 text-sm leading-snug comic-shadow sm:text-[15px]`}
    >
      {children}
      <span
        className={`absolute -bottom-3 ${side === "left" ? "left-6" : "right-6"} h-4 w-4 rotate-45 border-b-[3px] border-r-[3px] border-[hsl(var(--ink))] ${bg}`}
      />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 rounded-full border-[3px] border-[hsl(var(--ink))] bg-primary px-3 py-0.5 text-[11px] font-black uppercase tracking-wider text-primary-foreground comic-shadow">
      {children}
    </div>
  );
}

/* ---------- CHOICES ---------- */
function Choices({ onPick }: { onPick: (k: EndingKey) => void }) {
  const opts: { k: EndingKey; label: string; emoji: string }[] = [
    { k: "counter", label: '"I have a counter-offer."', emoji: "💥" },
    { k: "politics", label: '"Pivot to Politics."', emoji: "🗳️" },
    { k: "emotional", label: '"The Emotional Card."', emoji: "🎻" },
  ];
  return (
    <div className="flex flex-col items-center gap-4 py-6 anim-pop">
      <h3 className="text-stroke text-center text-2xl font-black text-white sm:text-3xl">
        🔘 CHOOSE YOUR RESPONSE
      </h3>
      <p className="text-center text-sm font-semibold text-white/90">
        Sharks are watching. Roommate is sleeping. Maggi is gone. What now?
      </p>
      <div className="grid w-full gap-3 sm:grid-cols-3">
        {opts.map((o) => (
          <button
            key={o.k}
            onClick={() => onPick(o.k)}
            className="group flex flex-col items-center gap-2 rounded-2xl border-[3px] border-[hsl(var(--ink))] bg-card px-4 py-4 text-card-foreground comic-shadow transition-transform hover:-translate-y-1 hover:rotate-[-1deg] hover:bg-accent"
          >
            <span className="text-3xl transition-transform group-hover:scale-125">{o.emoji}</span>
            <span className="text-center text-sm font-bold">{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- ENDING ---------- */
function Ending({ k, onReset, onClose }: { k: EndingKey; onReset: () => void; onClose: () => void }) {
  const e = ENDINGS[k];
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center anim-pop">
      <div className="rounded-2xl border-[3px] border-[hsl(var(--ink))] bg-accent px-4 py-2 text-2xl font-black text-[hsl(var(--ink))] comic-shadow">
        {e.title}
      </div>
      <img src={pitcherCryImg} alt="ending" className="h-40 w-auto anim-float" style={{ filter: "drop-shadow(4px 6px 0 hsl(var(--ink)))" }} />
      <p className="max-w-md rounded-2xl border-[3px] border-[hsl(var(--ink))] bg-card px-4 py-3 text-sm font-semibold text-card-foreground comic-shadow sm:text-base">
        {e.text}
      </p>
      <div className="rounded-xl border-[3px] border-dashed border-white/70 bg-[hsl(var(--ink))]/30 px-4 py-3 text-xs font-bold text-white sm:text-sm">
        📹 CCTV LEAK: 3:00 AM — tu hi tha. Sleep-walking. Maggi pakaayi. Spoon se khaayi. Wrapper apne hi pillow me chhupaaya.
        <br />
        <span className="text-accent">Tu thief hai. Tu victim hai. Tu hi ecosystem hai. 🦈</span>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="rounded-xl border-[3px] border-[hsl(var(--ink))] bg-primary px-4 py-2 font-black text-primary-foreground comic-shadow transition-transform hover:-translate-y-0.5"
        >
          🔁 PITCH AGAIN
        </button>
        <button
          onClick={onClose}
          className="rounded-xl border-[3px] border-[hsl(var(--ink))] bg-card px-4 py-2 font-black text-card-foreground comic-shadow transition-transform hover:-translate-y-0.5"
        >
          ✌️ EXIT TANK
        </button>
      </div>
    </div>
  );
}
