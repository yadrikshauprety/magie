import introClip from "@/assets/intro-clip.mp4.asset.json";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import pitcherIdle from "@/assets/pitcher.png";
import pitcherCry from "@/assets/pitcher-crying.png";
import pitcherShock from "@/assets/pitcher-shock.png";
import { Beat, buildGraph, Mood, SHARK_ORDER, SHARKS, SharkId } from "./sharkData";
import { useVoice } from "./useVoice";
import KbcGame from "./KbcGame";

interface Props { onClose: () => void; }

const PITCHER_IMG: Record<Mood, string> = {
  confident: pitcherIdle,
  nervous: pitcherIdle,
  smug: pitcherIdle,
  cry: pitcherCry,
  shock: pitcherShock,
};

type View =
  | { kind: "menu" }
  | { kind: "video" }
  | { kind: "playing"; nodeId: string; beats: Beat[]; idx: number; nextNodeId: string }
  | { kind: "choosing"; nodeId: string }
  | { kind: "kbc" };

export default function SharkTankGame({ onClose }: Props) {
  const graph = useMemo(buildGraph, []);
  const [muted, setMuted] = useState(false);
  const [view, setView] = useState<View>({ kind: "menu" });
  const { speak, stop } = useVoice(!muted);
  const sfxRef = useRef<AudioContext | null>(null);

  const sfx = useCallback((freq: number, dur = 0.1, type: OscillatorType = "square", vol = 0.05) => {
    if (muted) return;
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return;
    if (!sfxRef.current) sfxRef.current = new Ctor();
    const ctx = sfxRef.current!;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = vol;
    o.connect(g).connect(ctx.destination); o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.stop(ctx.currentTime + dur);
  }, [muted]);

  const startGame = () => { sfx(660, 0.15, "triangle"); enterNode("drawer"); };

  const enterNode = (nodeId: string) => {
    if (nodeId === "exit") { onClose(); return; }
    if (nodeId === "kbc") { stop(); setView({ kind: "kbc" }); return; }
    const node = graph[nodeId];
    if (!node) return;
    if (node.intro && node.intro.length > 0) {
      setView({ kind: "playing", nodeId, beats: node.intro, idx: 0, nextNodeId: nodeId });
    } else {
      setView({ kind: "choosing", nodeId });
    }
  };

  const pickBranch = (branchId: string) => {
    if (view.kind !== "choosing") return;
    const node = graph[view.nodeId];
    const b = node.branches.find((x) => x.id === branchId);
    if (!b) return;
    sfx(880, 0.08, "triangle");
    if (b.beats.length === 0) {
      enterNode(b.next ?? "exit");
    } else {
      setView({ kind: "playing", nodeId: view.nodeId, beats: b.beats, idx: 0, nextNodeId: b.next ?? "exit" });
    }
  };

  const advance = () => {
    if (view.kind !== "playing") return;
    if (view.idx < view.beats.length - 1) {
      setView({ ...view, idx: view.idx + 1 });
    } else {
      const currentNode = graph[view.nodeId];
      const wasIntro = currentNode.intro === view.beats;
      if (wasIntro) {
        setView({ kind: "choosing", nodeId: view.nodeId });
      } else {
        enterNode(view.nextNodeId);
      }
    }
  };

  // Speak each beat
  useEffect(() => {
    if (view.kind !== "playing") return;
    const beat = view.beats[view.idx];
    if (!beat) return;
    if (beat.speaker === "pitcher") {
      speak(beat.text, { lang: "en-IN", pitch: 1.05, rate: 1.05, gender: "male" });
      sfx(beat.mood === "cry" ? 280 : 520, 0.12, "sine");
    } else if (beat.speaker === "narrator") {
      speak(beat.text, { lang: "en-IN", pitch: 0.85, rate: 0.95, gender: "male" });
      sfx(180, 0.18, "sawtooth");
    } else {
      const s = SHARKS[beat.speaker as SharkId];
      speak(beat.text, s.voice);
      sfx(160, 0.12, "sawtooth");
    }
  }, [view, speak, sfx]);

  const reset = () => { stop(); setView({ kind: "menu" }); };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 anim-bubble"
      style={{ background: "hsl(220 30% 8% / 0.78)" }}
      onClick={() => { stop(); onClose(); }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl comic-border comic-shadow-lg"
        style={{ background: "var(--gradient-tank)" }}
      >
        <div className="pointer-events-none absolute inset-0" style={{ background: "var(--gradient-spotlight)" }} />
        <div className="pointer-events-none absolute -top-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-accent/40 blur-3xl anim-spotlight" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between border-b-[3px] border-[hsl(var(--ink))] bg-accent px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {view.kind === "kbc" ? "🎬"
                : view.kind === "playing" || view.kind === "choosing"
                ? (view.nodeId === "drawer" ? "🌙"
                  : view.nodeId === "court" || view.nodeId === "verdict" ? "⚖️"
                  : "🦈")
                : "🦈"}
            </span>
            <h2 className="text-stroke text-base font-black tracking-wide text-white sm:text-xl">
              {view.kind === "kbc" ? "LEVEL 3 — KBC: MAGGI EDITION"
                : view.kind === "playing" || view.kind === "choosing"
                ? (view.nodeId === "drawer" ? "LEVEL 1 — THE DRAWER"
                  : view.nodeId === "court" || view.nodeId === "verdict" ? "LEVEL 4 — SUPREME COURT"
                  : "LEVEL 2 — SHARK TANK")
                : "MAGGI CINEMATIC UNIVERSE"}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => { setMuted((m) => { const n = !m; if (n) stop(); return n; }); }}
              className="rounded-full p-2 text-[hsl(var(--ink))] hover:bg-white/30" aria-label="toggle sound">
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button onClick={reset} className="rounded-full p-2 text-[hsl(var(--ink))] hover:bg-white/30" aria-label="restart">
              <RotateCcw size={18} />
            </button>
            <button onClick={() => { stop(); onClose(); }} className="rounded-full p-2 text-[hsl(var(--ink))] hover:bg-white/30" aria-label="close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Stage */}
        <div className="relative min-h-[480px] px-4 pb-6 pt-4 sm:px-8">
          {view.kind === "menu" && <ModeMenu onPickShark={() => setView({ kind: "video" })} onPickKbc={() => setView({ kind: "kbc" })} />}
          {view.kind === "video" && <IntroVideo onSkip={startGame} />}
          {view.kind === "playing" && (
            <PlayingScene
              beat={view.beats[view.idx]}
              onAdvance={advance}
              progress={`${view.idx + 1}/${view.beats.length}`}
            />
          )}
          {view.kind === "choosing" && (
            <ChoiceScreen
              prompt={graph[view.nodeId].prompt}
              branches={graph[view.nodeId].branches}
              onPick={pickBranch}
            />
          )}
          {view.kind === "kbc" && (
            <KbcGame onClose={onClose} onComplete={() => enterNode("court")} speak={speak} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────── Mode picker ───────────── */
function ModeMenu({ onPickShark, onPickKbc }: { onPickShark: () => void; onPickKbc: () => void }) {
  return (
    <div className="anim-pop flex flex-col items-center gap-5 py-6">
      <h2 className="text-stroke text-center text-2xl font-black text-white sm:text-3xl">
        The Maggi Cinematic Universe
      </h2>
      <p className="text-center text-sm font-semibold text-white/85">
        4 levels. 1 missing packet. Zero justice.
        <br />
        <span className="text-white/70">Drawer → Shark Tank → KBC → Supreme Court.</span>
      </p>
      <div className="grid w-full gap-4 sm:grid-cols-2">
        <button
          onClick={onPickShark}
          className="group flex flex-col items-center gap-2 rounded-2xl border-[3px] border-[hsl(var(--ink))] bg-card px-4 py-6 text-card-foreground comic-shadow transition-transform hover:-translate-y-1 hover:rotate-[-1deg] hover:bg-accent"
        >
          <span className="text-6xl transition-transform group-hover:scale-125">🌙</span>
          <span className="text-stroke text-lg font-black">START FROM LEVEL 1</span>
          <span className="text-center text-xs font-bold">
            Drawer khaali hai. Pitch karo, KBC khelo, court me jao. Full saga.
          </span>
        </button>
        <button
          onClick={onPickKbc}
          className="group flex flex-col items-center gap-2 rounded-2xl border-[3px] border-[hsl(var(--ink))] bg-card px-4 py-6 text-card-foreground comic-shadow transition-transform hover:-translate-y-1 hover:rotate-[1deg] hover:bg-accent"
        >
          <span className="text-6xl transition-transform group-hover:scale-125">🎬</span>
          <span className="text-stroke text-lg font-black">SKIP TO KBC</span>
          <span className="text-center text-xs font-bold">
            Bachchan sahab seedha. 5 sawaal. ₹7 crore — ya brahmand ka chakkar.
          </span>
        </button>
      </div>
    </div>
  );
}

/* ───────────── Intro AI video ───────────── */
function IntroVideo({ onSkip }: { onSkip: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current; if (!v) return;
    v.play().catch(() => {});
    const t = setTimeout(onSkip, 5200);
    return () => clearTimeout(t);
  }, [onSkip]);
  return (
    <div className="anim-pop relative flex h-[380px] flex-col items-center justify-center sm:h-[420px]">
      <video ref={ref} src={introClip.url} muted playsInline
        className="absolute inset-0 h-full w-full rounded-2xl object-cover comic-border" />
      <div className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ background: "linear-gradient(180deg, transparent 50%, hsl(220 30% 5% / 0.7))" }} />
      <button onClick={onSkip}
        className="relative z-10 mt-auto mb-4 rounded-xl border-[3px] border-[hsl(var(--ink))] bg-primary px-5 py-2 font-black text-primary-foreground comic-shadow transition-transform hover:-translate-y-0.5">
        ⏭ SKIP INTRO &amp; PITCH
      </button>
    </div>
  );
}

/* ───────────── Playing scene ───────────── */
function PlayingScene({ beat, onAdvance, progress }: { beat: Beat; onAdvance: () => void; progress: string }) {
  const isPitcher = beat.speaker === "pitcher";
  const isNarrator = beat.speaker === "narrator";
  const sharkId = !isPitcher && !isNarrator ? (beat.speaker as SharkId) : null;
  const mood: Mood = beat.mood ?? "confident";

  return (
    <div className="anim-pop flex flex-col gap-3" onClick={onAdvance} role="button" tabIndex={0}>
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        {/* Pitcher */}
        <div className="relative flex flex-col items-center justify-end">
          {isPitcher && mood === "cry" && (
            <>
              <span className="absolute left-[28%] top-[42%] text-2xl anim-tear">💧</span>
              <span className="absolute right-[28%] top-[42%] text-2xl anim-tear" style={{ animationDelay: "0.3s" }}>💧</span>
            </>
          )}
          <img
            key={`p-${mood}-${isPitcher}`}
            src={PITCHER_IMG[mood]}
            alt="pitcher"
            className={`h-44 w-auto sm:h-56 ${isPitcher ? (mood === "cry" || mood === "shock" ? "anim-shake" : "anim-wiggle") : "opacity-60 grayscale"} ${isPitcher ? "anim-pop" : ""}`}
            style={{ filter: "drop-shadow(4px 6px 0 hsl(var(--ink)))" }}
          />
          <Label active={isPitcher}>YOU</Label>
        </div>

        {/* Sharks side */}
        <div className="relative flex flex-col items-center justify-end">
          {sharkId ? (
            <ActiveShark id={sharkId} talking />
          ) : (
            <SharksLineup activeId={null} dim={isPitcher || isNarrator} />
          )}
          <Label active={!!sharkId}>{sharkId ? SHARKS[sharkId].title : "THE SHARKS"}</Label>
        </div>
      </div>

      {/* Speech */}
      <div className="mt-2">
        {isNarrator ? (
          <div className="anim-bubble mx-auto max-w-xl rounded-2xl border-[3px] border-dashed border-white/80 bg-[hsl(var(--ink))]/50 px-4 py-3 text-center text-sm font-bold italic text-white sm:text-base">
            🎬 {beat.text}
          </div>
        ) : (
          <SpeechBubble side={isPitcher ? "right" : "left"} tone={isPitcher ? "you" : "shark"}>
            {sharkId && <span className="font-black">{SHARKS[sharkId].name}: </span>}
            {beat.text}
          </SpeechBubble>
        )}
      </div>

      <div className="mt-1 flex items-center justify-between text-[11px] font-bold text-white/80">
        <span>👆 click anywhere to continue</span>
        <span>{progress}</span>
      </div>
    </div>
  );
}

function ActiveShark({ id, talking }: { id: SharkId; talking: boolean }) {
  const s = SHARKS[id];
  return (
    <div className="relative anim-pop">
      {talking && <span className="absolute inset-0 rounded-full anim-pulse-ring" style={{ background: s.color, opacity: 0.5 }} />}
      <img
        src={s.imgActive}
        alt={s.name}
        className={`relative h-40 w-40 rounded-full border-[4px] border-[hsl(var(--ink))] bg-white object-cover sm:h-52 sm:w-52 ${talking ? "anim-wiggle" : ""}`}
        style={{ boxShadow: `8px 8px 0 hsl(var(--ink)), 0 0 0 6px ${s.color}` }}
      />
    </div>
  );
}

function SharksLineup({ activeId, dim }: { activeId: SharkId | null; dim: boolean }) {
  return (
    <div className={`flex flex-wrap items-end justify-center gap-1 ${dim ? "opacity-70" : ""}`}>
      {SHARK_ORDER.map((sid, i) => {
        const s = SHARKS[sid];
        const isActive = sid === activeId;
        return (
          <img
            key={sid}
            src={isActive ? s.imgActive : s.imgIdle}
            alt={s.name}
            className={`h-16 w-16 rounded-full border-[3px] border-[hsl(var(--ink))] bg-white object-cover comic-shadow sm:h-20 sm:w-20 ${isActive ? "anim-wiggle" : ""}`}
            style={{ animation: isActive ? undefined : `float-bob 3s ease-in-out ${i * 0.2}s infinite` }}
          />
        );
      })}
    </div>
  );
}

function SpeechBubble({ children, side, tone = "you" }: { children: React.ReactNode; side: "left" | "right"; tone?: "you" | "shark" }) {
  const bg = tone === "shark" ? "bg-accent" : "bg-card";
  const fg = tone === "shark" ? "text-[hsl(var(--ink))]" : "text-card-foreground";
  return (
    <div className={`anim-bubble relative mx-auto max-w-2xl rounded-2xl border-[3px] border-[hsl(var(--ink))] ${bg} ${fg} px-4 py-3 text-sm leading-snug comic-shadow sm:text-[15px]`}>
      {children}
      <span className={`absolute -top-3 ${side === "left" ? "left-10" : "right-10"} h-4 w-4 rotate-45 border-l-[3px] border-t-[3px] border-[hsl(var(--ink))] ${bg}`} />
    </div>
  );
}

function Label({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <div className={`mt-2 rounded-full border-[3px] border-[hsl(var(--ink))] px-3 py-0.5 text-[10px] font-black uppercase tracking-wider comic-shadow ${active ? "bg-primary text-primary-foreground" : "bg-white/70 text-[hsl(var(--ink))]"}`}>
      {children}
    </div>
  );
}

function ChoiceScreen({ prompt, branches, onPick }: {
  prompt: string;
  branches: { id: string; label: string; emoji: string }[];
  onPick: (id: string) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 anim-pop">
      <h3 className="text-stroke text-center text-xl font-black text-white sm:text-2xl">{prompt}</h3>
      <div className={`grid w-full gap-3 ${branches.length <= 3 ? "sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-5"}`}>
        {branches.map((b) => (
          <button
            key={b.id}
            onClick={() => onPick(b.id)}
            className="group flex flex-col items-center gap-2 rounded-2xl border-[3px] border-[hsl(var(--ink))] bg-card px-3 py-4 text-card-foreground comic-shadow transition-transform hover:-translate-y-1 hover:rotate-[-1deg] hover:bg-accent"
          >
            <span className="text-3xl transition-transform group-hover:scale-125">{b.emoji}</span>
            <span className="text-center text-xs font-bold sm:text-sm">{b.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
