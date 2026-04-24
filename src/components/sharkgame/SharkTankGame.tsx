import introClip from "@/assets/intro-clip.mp4.asset.json";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import pitcherIdle from "@/assets/pitcher.png";
import pitcherCry from "@/assets/pitcher-crying.png";
import pitcherShock from "@/assets/pitcher-shock.png";
import level1Void from "@/assets/level1-void.png";
import { Beat, buildGraph, Mood, SHARK_ORDER, SHARKS, SharkId } from "./sharkData";
import { motion, AnimatePresence } from "framer-motion";
import { useVoice } from "./useVoice";
import { getGeminiResponse } from "@/lib/gemini";
import KbcGame from "./KbcGame";

interface Props { onClose: () => void; }

const PITCHER_IMG: Record<Mood, string> = {
  confident: pitcherIdle,
  nervous: pitcherIdle,
  smug: pitcherIdle,
  cry: pitcherCry,
  shock: pitcherShock,
  sleeping: level1Void,
  opening: level1Void,
};

type View =
  | { kind: "menu" }
  | { kind: "video" }
  | { kind: "playing"; nodeId: string; beats: Beat[]; idx: number; nextNodeId: string }
  | { kind: "choosing"; nodeId: string }
  | { kind: "typing"; nodeId: string; nextNodeId: string }
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
    
    if (branchId === "type") {
      setView({ kind: "typing", nodeId: view.nodeId, nextNodeId: b.next ?? "exit" });
      return;
    }

    if (b.beats.length === 0) {
      enterNode(b.next ?? "exit");
    } else {
      setView({ kind: "playing", nodeId: view.nodeId, beats: b.beats, idx: 0, nextNodeId: b.next ?? "exit" });
    }
  };

  const submitTyping = async (text: string) => {
    if (view.kind !== "typing") return;
    const nodeId = view.nodeId;
    const nextNodeId = view.nextNodeId;
    
    try {
      const aiBeats = await getGeminiResponse(text);
      setView({ kind: "playing", nodeId, beats: aiBeats, idx: 0, nextNodeId });
    } catch (err: any) {
      setView({ 
        kind: "playing", 
        nodeId, 
        beats: [{ speaker: "narrator", text: err.message || "Gemini connection failed." }], 
        idx: 0, 
        nextNodeId 
      });
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
              {view.kind === "kbc" ? "🎬" : "🦈"}
            </span>
            <h2 className="font-cinematic text-stroke text-base font-black tracking-wide text-white sm:text-xl uppercase">
              {view.kind === "kbc" ? "LEVEL 3 — KBC: MAGGI EDITION" : "MAGGI CINEMATIC UNIVERSE"}
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
          {view.kind === "typing" && (
            <TypingScreen onSubmit={submitTyping} onCancel={() => setView({ kind: "choosing", nodeId: view.nodeId })} />
          )}
          {view.kind === "kbc" && (
            <KbcGame onClose={onClose} onComplete={() => enterNode("court")} speak={speak} />
          )}
        </div>
      </div>
    </div>
  );
}

function ModeMenu({ onPickShark, onPickKbc }: { onPickShark: () => void; onPickKbc: () => void }) {
  return (
    <div className="anim-pop flex flex-col items-center gap-8 py-10">
      <div className="flex flex-col items-center gap-2">
        <h2 className="font-cinematic text-stroke-lg text-center text-4xl font-black text-white sm:text-6xl uppercase tracking-tighter">
          The Maggi <span className="text-accent">Saga</span>
        </h2>
        <div className="h-1 w-24 bg-accent rounded-full" />
      </div>

      <div className="grid w-full gap-6 sm:grid-cols-2 max-w-4xl">
        <button 
          onClick={onPickShark} 
          className="group relative flex flex-col items-center gap-4 rounded-3xl border-[4px] border-[hsl(var(--ink))] bg-white p-8 text-[hsl(var(--ink))] comic-shadow-lg transition-all hover:-translate-y-2 hover:rotate-[-1deg] active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[22px]" />
          <span className="text-8xl drop-shadow-xl transition-transform group-hover:scale-110">🌙</span>
          <div className="flex flex-col items-center gap-1">
            <span className="font-cinematic text-3xl font-black uppercase tracking-tight">START SAGA</span>
            <span className="text-xs font-bold opacity-60 uppercase tracking-widest">Level 1 — The Void</span>
          </div>
        </button>

        <button 
          onClick={onPickKbc} 
          className="group relative flex flex-col items-center gap-4 rounded-3xl border-[4px] border-[hsl(var(--ink))] bg-white p-8 text-[hsl(var(--ink))] comic-shadow-lg transition-all hover:-translate-y-2 hover:rotate-[1deg] active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[22px]" />
          <span className="text-8xl drop-shadow-xl transition-transform group-hover:scale-110">🎬</span>
          <div className="flex flex-col items-center gap-1">
            <span className="font-cinematic text-3xl font-black uppercase tracking-tight">SKIP TO KBC</span>
            <span className="text-xs font-bold opacity-60 uppercase tracking-widest">Level 3 — Billionaire</span>
          </div>
        </button>
      </div>

      <p className="text-center text-sm font-bold text-white/70 italic max-w-md">
        "In a world where packets disappear, one founder must pitch for justice."
      </p>
    </div>
  );
}

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
      <video ref={ref} src={introClip.url} muted playsInline className="absolute inset-0 h-full w-full rounded-2xl object-cover comic-border" />
      <button onClick={onSkip} className="relative z-10 mt-auto mb-4 rounded-xl border-[3px] border-[hsl(var(--ink))] bg-primary px-5 py-2 font-black text-primary-foreground comic-shadow transition-transform hover:-translate-y-0.5">
        ⏭ SKIP INTRO & PITCH
      </button>
    </div>
  );
}

function PlayingScene({ beat, onAdvance, progress }: { beat: Beat; onAdvance: () => void; progress: string }) {
  const isPitcher = beat.speaker === "pitcher";
  const isNarrator = beat.speaker === "narrator";
  const sharkId = !isPitcher && !isNarrator ? (beat.speaker as SharkId) : null;
  const mood: Mood = beat.mood ?? "confident";

  return (
    <div className="anim-pop flex flex-col gap-3" onClick={onAdvance} role="button" tabIndex={0}>
      <div className={`grid ${mood === 'sleeping' || mood === 'opening' ? 'grid-cols-1' : 'grid-cols-2'} gap-3 sm:gap-6`}>
        <div className="relative flex flex-col items-center justify-end">
          {mood === "sleeping" || mood === "opening" ? (
            <div className="relative h-72 w-full overflow-hidden rounded-2xl border-[4px] border-[hsl(var(--ink))] bg-white sm:h-96">
              <img src={level1Void} alt="level 1 scene" className="absolute inset-0 h-[200%] w-full object-contain transition-transform duration-700 ease-in-out" style={{ transform: mood === "sleeping" ? "translateY(0)" : "translateY(-50%)" }} />
            </div>
          ) : (
            <div className="relative">
              {isPitcher && <span className="absolute inset-0 rounded-full anim-pulse-ring" style={{ background: "hsl(var(--primary))", opacity: 0.4 }} />}
              <img 
                src={PITCHER_IMG[mood]} 
                alt="pitcher" 
                className={`relative h-48 w-48 rounded-full border-[4px] border-[hsl(var(--ink))] bg-white object-cover object-top sm:h-64 sm:w-64 ${isPitcher ? "anim-wiggle" : "opacity-70"} scale-110 transition-transform`} 
                style={{ boxShadow: `8px 8px 0 hsl(var(--ink)), 0 0 0 6px hsl(var(--primary))` }}
              />
            </div>
          )}
          <Label active={isPitcher || mood === 'sleeping' || mood === 'opening'}>
            {mood === 'sleeping' ? 'SHHH...' : mood === 'opening' ? 'THE DISCOVERY' : 'YOU'}
          </Label>
        </div>
        {mood !== "sleeping" && mood !== "opening" && (
          <div className="relative flex flex-col items-center justify-end">
            {sharkId ? <ActiveShark id={sharkId} talking text={beat.text} /> : <SharksLineup activeId={null} dim={isPitcher || isNarrator} />}
            <Label active={!!sharkId}>{sharkId ? SHARKS[sharkId].title : "THE SHARKS"}</Label>
          </div>
        )}
      </div>
      <div className="mt-2">
        {isNarrator ? (
          <div className="anim-bubble mx-auto max-w-xl rounded-2xl border-[3px] border-dashed border-white/80 bg-[hsl(var(--ink))]/50 px-4 py-3 text-center text-sm font-bold italic text-white">
            🎬 {beat.text}
          </div>
        ) : (
          <SpeechBubble side={isPitcher ? "left" : "right"} tone={isPitcher ? "you" : "shark"}>
            {sharkId && <span className="font-black">{SHARKS[sharkId].name}: </span>}{beat.text}
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

function ActiveShark({ id, talking, text }: { id: SharkId; talking: boolean; text: string }) {
  const s = SHARKS[id];
  const isNimitaOut = id === "namita" && text.toUpperCase().includes("OUT");
  const displayImg = isNimitaOut && s.imgSpecial ? s.imgSpecial : s.imgActive;

  if (isNimitaOut) {
    return (
      <div className="relative z-50">
        <motion.div drag whileDrag={{ scale: 1.1, rotate: 15 }} dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }} className="cursor-grab active:cursor-grabbing">
          <img src={displayImg} alt={s.name} className="h-56 w-auto drop-shadow-2xl sm:h-80 scale-125" />
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-4 py-1.5 text-xs font-black text-white comic-shadow anim-wiggle">FLING HER OUT! 🚀</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative anim-pop">
      {talking && <span className="absolute inset-0 rounded-full anim-pulse-ring" style={{ background: s.color, opacity: 0.5 }} />}
      <img src={displayImg} alt={s.name} className={`relative h-48 w-48 rounded-full border-[4px] border-[hsl(var(--ink))] bg-white object-cover object-top sm:h-64 sm:w-64 ${talking ? "anim-wiggle" : ""} scale-110`} style={{ boxShadow: `8px 8px 0 hsl(var(--ink)), 0 0 0 6px ${s.color}` }} />
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
          <img key={sid} src={isActive ? s.imgActive : s.imgIdle} alt={s.name} className={`h-16 w-16 rounded-full border-[3px] border-[hsl(var(--ink))] bg-white object-cover object-top sm:h-20 sm:w-20 ${isActive ? "anim-wiggle" : ""} scale-110`} style={{ animation: isActive ? undefined : `float-bob 3s ease-in-out ${i * 0.2}s infinite` }} />
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
    <div className={`mt-2 rounded-full border-[3px] border-[hsl(var(--ink))] px-3 py-0.5 text-[11px] font-comic font-black uppercase tracking-wider comic-shadow ${active ? "bg-primary text-primary-foreground" : "bg-white/70 text-[hsl(var(--ink))]"}`}>
      {children}
    </div>
  );
}

function ChoiceScreen({ prompt, branches, onPick }: { prompt: string; branches: { id: string; label: string; emoji: string }[]; onPick: (id: string) => void; }) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 anim-pop">
      <h3 className="font-cinematic text-stroke text-center text-xl font-black text-white sm:text-2xl uppercase tracking-wider">{prompt}</h3>
      <div className={`grid w-full gap-3 ${branches.length <= 3 ? "sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-5"}`}>
        {branches.map((b) => (
          <button key={b.id} onClick={() => onPick(b.id)} className="group flex flex-col items-center gap-2 rounded-2xl border-[3px] border-[hsl(var(--ink))] bg-card px-3 py-4 text-card-foreground comic-shadow transition-transform hover:-translate-y-1 hover:bg-accent">
            <span className="text-3xl transition-transform group-hover:scale-125">{b.emoji}</span>
            <span className="text-center text-xs font-bold sm:text-sm">{b.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TypingScreen({ onSubmit, onCancel }: { onSubmit: (text: string) => void; onCancel: () => void }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const handleGo = () => { if (!text.trim()) return; setLoading(true); onSubmit(text); };
  return (
    <div className="flex flex-col items-center gap-6 py-6 anim-pop max-w-lg mx-auto">
      <h3 className="font-cinematic text-stroke text-center text-3xl font-black text-white uppercase tracking-widest">TYPE YOUR REACTION</h3>
      <div className="relative w-full">
        <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. 'This is a conspiracy!'" className="w-full h-32 rounded-2xl border-[4px] border-[hsl(var(--ink))] bg-white p-4 font-bold text-[hsl(var(--ink))] comic-shadow focus:outline-none" disabled={loading} />
        {loading && <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-2xl"><div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" /></div>}
      </div>
      <div className="flex w-full gap-3">
        <button onClick={onCancel} className="flex-1 rounded-xl border-[3px] border-[hsl(var(--ink))] bg-white px-4 py-3 font-black text-[hsl(var(--ink))] comic-shadow transition-transform hover:-translate-y-0.5" disabled={loading}>CANCEL</button>
        <button onClick={handleGo} disabled={loading || !text.trim()} className="flex-1 rounded-xl border-[3px] border-[hsl(var(--ink))] bg-primary px-4 py-3 font-black text-primary-foreground comic-shadow transition-transform hover:-translate-y-0.5 disabled:opacity-50">{loading ? "THINKING..." : "TELL THE WORLD"}</button>
      </div>
    </div>
  );
}
