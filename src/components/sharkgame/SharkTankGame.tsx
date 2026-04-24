import introClip from "@/assets/intro-clip.mp4.asset.json";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import pitcherIdle from "@/assets/pitcher.png";
import pitcherCry from "@/assets/pitcher-crying.png";
import pitcherShock from "@/assets/pitcher-shock.png";
import { Beat, buildGraph, Mood, SHARK_ORDER, SHARKS, SharkId } from "./sharkData";
import { useVoice } from "./useVoice";
import { SHARK_ADS, SharkAd } from "./sharkAds";
import SharkAdOverlay from "./SharkAdOverlay";
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
  | { kind: "choosing"; nodeId: string; deadlineAt: number }
  | { kind: "kbc" };

export default function SharkTankGame({ onClose }: Props) {
  const graph = useMemo(buildGraph, []);
  const [muted, setMuted] = useState(false);
  const [view, setView] = useState<View>({ kind: "menu" });
  const [crossedOff, setCrossedOff] = useState<Set<SharkId>>(new Set());
  const [activeAd, setActiveAd] = useState<SharkAd | null>(null);
  const [namitaRocket, setNamitaRocket] = useState(false);
  const [zoomShake, setZoomShake] = useState(false);
  const [bp, setBp] = useState(20); // ashneer blood pressure 0-100
  const [arnab, setArnab] = useState(20); // arnab volume slider
  const { speak, stop } = useVoice(!muted);
  const sfxRef = useRef<AudioContext | null>(null);

  /* ───── helpers ───── */
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

  const dhumDhumDhum = useCallback(() => {
    [0, 140, 280].forEach((d, i) => setTimeout(() => sfx(120 - i * 20, 0.18, "sawtooth", 0.08), d));
  }, [sfx]);

  const vibrate = useCallback((p: number | number[] = 30) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try { navigator.vibrate(p); } catch {}
    }
  }, []);

  const triggerZoomShake = useCallback(() => {
    setZoomShake(true);
    dhumDhumDhum();
    vibrate([60, 30, 60, 30, 60]);
    setTimeout(() => setZoomShake(false), 700);
  }, [dhumDhumDhum, vibrate]);

  /* ───── flow ───── */
  const startGame = () => { sfx(660, 0.15, "triangle"); enterNode("intro"); };

  const enterNode = (nodeId: string) => {
    if (nodeId === "exit") { onClose(); return; }
    if (nodeId === "kbc") { stop(); setView({ kind: "kbc" }); return; }
    const node = graph[nodeId];
    if (!node) return;
    if (node.intro && node.intro.length > 0) {
      setView({ kind: "playing", nodeId, beats: node.intro, idx: 0, nextNodeId: nodeId });
    } else {
      setView({ kind: "choosing", nodeId, deadlineAt: Date.now() + 6000 });
    }
  };

  const pickBranch = (branchId: string) => {
    if (view.kind !== "choosing") return;
    const node = graph[view.nodeId];
    const b = node.branches.find((x) => x.id === branchId);
    if (!b) return;
    sfx(880, 0.08, "triangle");
    triggerZoomShake();
    setBp((v) => Math.max(0, v - 15));
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
        setView({ kind: "choosing", nodeId: view.nodeId, deadlineAt: Date.now() + 6000 });
      } else {
        // After twist node ending → flow into KBC
        if (view.nextNodeId === "twist" || view.nodeId === "twist") {
          // twist completes → KBC
          if (currentNode.id === "twist" && currentNode.intro === view.beats) {
            setView({ kind: "choosing", nodeId: view.nodeId, deadlineAt: Date.now() + 6000 });
            return;
          }
        }
        enterNode(view.nextNodeId);
      }
    }
  };

  /* ───── speak each beat ───── */
  useEffect(() => {
    if (view.kind !== "playing") return;
    const beat = view.beats[view.idx];
    if (!beat) return;
    if (beat.speaker === "pitcher") {
      speak(beat.text, { lang: "en-IN", pitch: 1.1, rate: 1.05 });
      sfx(beat.mood === "cry" ? 280 : 520, 0.12, "sine");
    } else if (beat.speaker === "narrator") {
      speak(beat.text, { lang: "en-IN", pitch: 0.85, rate: 0.95 });
      sfx(180, 0.18, "sawtooth");
    } else {
      const s = SHARKS[beat.speaker as SharkId];
      speak(beat.text, s.voice);
      sfx(160, 0.12, "sawtooth");
      // Bump Ashneer BP when he yells
      if (beat.speaker === "ashneer") setBp((v) => Math.min(100, v + 25));
    }
  }, [view, speak, sfx]);

  /* ───── BP meter rises if user is slow on choices ───── */
  useEffect(() => {
    if (view.kind !== "choosing") return;
    const t = setInterval(() => {
      const remaining = view.deadlineAt - Date.now();
      if (remaining <= 0) {
        setBp((v) => Math.min(100, v + 8));
      }
    }, 600);
    return () => clearInterval(t);
  }, [view]);

  /* ───── Arnab slider auto-resets to 100 in narrator beats ───── */
  useEffect(() => {
    if (view.kind !== "playing") return;
    const beat = view.beats[view.idx];
    if (beat?.speaker === "narrator") {
      setArnab(100);
    }
  }, [view]);

  const reset = () => { stop(); setView({ kind: "menu" }); setCrossedOff(new Set()); setBp(20); setArnab(20); setNamitaRocket(false); };

  /* ───── shark cross-off handler ───── */
  const tryCrossOff = (sid: SharkId) => {
    if (crossedOff.has(sid)) return;
    setActiveAd(SHARK_ADS[sid]);
    vibrate(40);
    sfx(440, 0.2, "square");
    if (sid === "namita") {
      setNamitaRocket(true);
      setTimeout(() => setCrossedOff((s) => new Set(s).add(sid)), 900);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 anim-bubble shark-cursor"
      style={{ background: "hsl(220 30% 8% / 0.78)" }}
      onClick={() => { stop(); onClose(); }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-3xl overflow-hidden rounded-3xl comic-border comic-shadow-lg ${zoomShake ? "anim-zoom-shake" : ""}`}
        style={{ background: "var(--gradient-tank)" }}
      >
        <div className="pointer-events-none absolute inset-0" style={{ background: "var(--gradient-spotlight)" }} />
        <div className="pointer-events-none absolute -top-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-accent/40 blur-3xl anim-spotlight" />

        {/* white flash for zoom-shake */}
        {zoomShake && <div className="pointer-events-none absolute inset-0 z-20 anim-flash bg-white" />}

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between border-b-[3px] border-[hsl(var(--ink))] bg-accent px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{view.kind === "kbc" ? "🎬" : "🦈"}</span>
            <h2 className="text-stroke text-base font-black tracking-wide text-white sm:text-xl">
              {view.kind === "kbc" ? "KBC: MAGGI EDITION" : "SHARK TANK: MAGGI EDITION"}
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
              crossedOff={crossedOff}
              onCrossOff={tryCrossOff}
              namitaRocket={namitaRocket}
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
            <KbcGame onClose={onClose} onZoomShake={triggerZoomShake} speak={speak} vibrate={vibrate} muted={muted} />
          )}
        </div>

        {/* HUD: Ashneer BP meter (Shark Tank only) */}
        {view.kind !== "menu" && view.kind !== "kbc" && view.kind !== "video" && (
          <BpMeter bp={bp} />
        )}

        {/* HUD: Arnab volume slider (during narrator) */}
        {view.kind === "playing" && view.beats[view.idx]?.speaker === "narrator" && (
          <ArnabSlider value={arnab} onTry={() => { setArnab(100); vibrate(20); }} />
        )}

        {/* Breaking news ticker (during narrator) */}
        {view.kind === "playing" && view.beats[view.idx]?.speaker === "narrator" && <NewsTicker />}

        {/* Ad overlay */}
        {activeAd && <SharkAdOverlay ad={activeAd} onClose={() => setActiveAd(null)} />}
      </div>
    </div>
  );
}

/* ───────────── Mode picker ───────────── */
function ModeMenu({ onPickShark, onPickKbc }: { onPickShark: () => void; onPickKbc: () => void }) {
  return (
    <div className="anim-pop flex flex-col items-center gap-5 py-6">
      <h2 className="text-stroke text-center text-2xl font-black text-white sm:text-3xl">
        Bored? Pick your destiny.
      </h2>
      <p className="text-center text-sm font-semibold text-white/80">
        Two arenas. Two ways to embarrass yourself on national television.
      </p>
      <div className="grid w-full gap-4 sm:grid-cols-2">
        <button
          onClick={onPickShark}
          className="group flex flex-col items-center gap-2 rounded-2xl border-[3px] border-[hsl(var(--ink))] bg-card px-4 py-6 text-card-foreground comic-shadow transition-transform hover:-translate-y-1 hover:rotate-[-1deg] hover:bg-accent"
        >
          <span className="text-6xl transition-transform group-hover:scale-125">🦈</span>
          <span className="text-stroke text-lg font-black">SHARK TANK</span>
          <span className="text-center text-xs font-bold">
            Pitch your Maggi crisis to 5 billionaires. Cross them off (at your own risk).
          </span>
        </button>
        <button
          onClick={onPickKbc}
          className="group flex flex-col items-center gap-2 rounded-2xl border-[3px] border-[hsl(var(--ink))] bg-card px-4 py-6 text-card-foreground comic-shadow transition-transform hover:-translate-y-1 hover:rotate-[1deg] hover:bg-accent"
        >
          <span className="text-6xl transition-transform group-hover:scale-125">🎬</span>
          <span className="text-stroke text-lg font-black">KAUN BANEGA CROREPATI</span>
          <span className="text-center text-xs font-bold">
            5 questions. 4 options each. Bachchan sahab ka pyaar — ya brahmand ka chakra.
          </span>
        </button>
      </div>
      <p className="text-[11px] font-bold text-white/70">
        💡 Tip: hover over the screen — your cursor becomes a magnifying glass 🔍
      </p>
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
function PlayingScene({
  beat, onAdvance, progress, crossedOff, onCrossOff, namitaRocket,
}: {
  beat: Beat; onAdvance: () => void; progress: string;
  crossedOff: Set<SharkId>; onCrossOff: (s: SharkId) => void; namitaRocket: boolean;
}) {
  const isPitcher = beat.speaker === "pitcher";
  const isNarrator = beat.speaker === "narrator";
  const sharkId = !isPitcher && !isNarrator ? (beat.speaker as SharkId) : null;
  const mood: Mood = beat.mood ?? "confident";

  return (
    <div className="anim-pop flex flex-col gap-3" onClick={onAdvance} role="button" tabIndex={0}>
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        {/* Pitcher */}
        <div className="relative flex flex-col items-center justify-end">
          {isPitcher && (mood === "cry") && (
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
          {sharkId && !crossedOff.has(sharkId) ? (
            <ActiveShark id={sharkId} talking onCrossOff={(e) => { e.stopPropagation(); onCrossOff(sharkId); }} rocket={sharkId === "namita" && namitaRocket} />
          ) : (
            <SharksLineup activeId={null} dim={isPitcher || isNarrator} crossedOff={crossedOff} onCrossOff={onCrossOff} />
          )}
          <Label active={!!sharkId && !crossedOff.has(sharkId!)}>{sharkId ? SHARKS[sharkId].title : "THE SHARKS"}</Label>
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
        <span>👆 click anywhere to continue · ❌ click a shark to cross them off</span>
        <span>{progress}</span>
      </div>
    </div>
  );
}

function ActiveShark({ id, talking, onCrossOff, rocket }: { id: SharkId; talking: boolean; onCrossOff: (e: React.MouseEvent) => void; rocket?: boolean }) {
  const s = SHARKS[id];
  return (
    <div className={`relative anim-pop ${rocket ? "anim-rocket" : ""}`}>
      {talking && <span className="absolute inset-0 rounded-full anim-pulse-ring" style={{ background: s.color, opacity: 0.5 }} />}
      <img
        src={s.imgActive}
        alt={s.name}
        className={`relative h-40 w-40 rounded-full border-[4px] border-[hsl(var(--ink))] bg-white object-cover sm:h-52 sm:w-52 ${talking ? "anim-wiggle" : ""}`}
        style={{ boxShadow: `8px 8px 0 hsl(var(--ink)), 0 0 0 6px ${s.color}` }}
      />
      <button
        onClick={onCrossOff}
        className="absolute -right-2 -top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-[hsl(var(--ink))] bg-destructive text-white comic-shadow transition-transform hover:scale-110 active:scale-95"
        aria-label={`cross off ${s.name}`}
      >
        <X size={18} strokeWidth={4} />
      </button>
      {rocket && (
        <div className="pointer-events-none absolute inset-x-0 -bottom-4 flex justify-center text-2xl">
          💊💊💊
        </div>
      )}
    </div>
  );
}

function SharksLineup({ activeId, dim, crossedOff, onCrossOff }: { activeId: SharkId | null; dim: boolean; crossedOff: Set<SharkId>; onCrossOff: (s: SharkId) => void }) {
  return (
    <div className={`flex flex-wrap items-end justify-center gap-1 ${dim ? "opacity-70" : ""}`}>
      {SHARK_ORDER.map((sid, i) => {
        const s = SHARKS[sid];
        const isActive = sid === activeId;
        const isOut = crossedOff.has(sid);
        return (
          <div key={sid} className="relative">
            <img
              src={isActive ? s.imgActive : s.imgIdle}
              alt={s.name}
              className={`h-16 w-16 rounded-full border-[3px] border-[hsl(var(--ink))] bg-white object-cover comic-shadow sm:h-20 sm:w-20 ${isActive ? "anim-wiggle" : ""} ${isOut ? "opacity-30 grayscale" : ""}`}
              style={{ animation: isActive || isOut ? undefined : `float-bob 3s ease-in-out ${i * 0.2}s infinite` }}
            />
            {!isOut && (
              <button
                onClick={(e) => { e.stopPropagation(); onCrossOff(sid); }}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[hsl(var(--ink))] bg-destructive text-white"
                aria-label={`cross off ${s.name}`}
              >
                <X size={10} strokeWidth={4} />
              </button>
            )}
            {isOut && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-3xl text-destructive">❌</div>
            )}
          </div>
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

/* ───────────── Choice screen ───────────── */
function ChoiceScreen({
  prompt, branches, onPick,
}: {
  prompt: string;
  branches: { id: string; label: string; emoji: string }[];
  onPick: (id: string) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 anim-pop">
      <h3 className="text-stroke text-center text-xl font-black text-white sm:text-2xl">
        {prompt}
      </h3>
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

/* ───────────── HUD: Ashneer BP meter ───────────── */
function BpMeter({ bp }: { bp: number }) {
  const danger = bp > 70;
  return (
    <div className="pointer-events-none absolute right-2 top-16 z-10 flex flex-col items-center gap-1">
      <div className="rounded-full border-[2px] border-[hsl(var(--ink))] bg-white/90 px-2 py-0.5 text-[9px] font-black uppercase">
        Ashneer BP
      </div>
      <div className="relative h-32 w-4 overflow-hidden rounded-full border-[2px] border-[hsl(var(--ink))] bg-white">
        <div
          className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${danger ? "anim-shake" : ""}`}
          style={{ height: `${bp}%`, background: danger ? "hsl(0 90% 55%)" : "hsl(48 98% 55%)" }}
        />
      </div>
      <div className="text-[10px] font-black text-white">{bp}</div>
    </div>
  );
}

/* ───────────── HUD: Arnab volume slider ───────────── */
function ArnabSlider({ value, onTry }: { value: number; onTry: () => void }) {
  return (
    <div className="absolute left-2 top-16 z-10 flex flex-col items-center gap-1">
      <div className="rounded-full border-[2px] border-[hsl(var(--ink))] bg-white/90 px-2 py-0.5 text-[9px] font-black uppercase">
        Nation Volume
      </div>
      <input
        type="range"
        value={value}
        min={0}
        max={100}
        onChange={onTry}
        className="h-32 w-4 cursor-not-allowed accent-destructive"
        style={{ writingMode: "vertical-lr" as any, direction: "rtl" } as React.CSSProperties}
      />
      <div className="text-[10px] font-black text-white">100%</div>
    </div>
  );
}

/* ───────────── Breaking news ticker ───────────── */
function NewsTicker() {
  const items = [
    "STOCKS IN NOODLES PLUMMET",
    "ROOMMATE SEEN LICKING FORK AT 3:14 AM",
    "BREAKING: TASTEMAKER SUPPLY CHAIN UNDER PRESSURE",
    "CCTV REVEALS HOSTEL CONSPIRACY",
    "NATIONAL EMERGENCY: MAGGI SHORTAGE",
  ];
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center gap-2 border-t-[3px] border-[hsl(var(--ink))] bg-destructive px-2 py-1 text-white">
      <span className="rounded bg-white px-2 py-0.5 text-[10px] font-black text-destructive">BREAKING</span>
      <div className="flex-1 overflow-hidden">
        <div className="anim-ticker whitespace-nowrap text-xs font-black">
          {items.concat(items).map((t, i) => <span key={i} className="mx-6">⚡ {t}</span>)}
        </div>
      </div>
    </div>
  );
}
