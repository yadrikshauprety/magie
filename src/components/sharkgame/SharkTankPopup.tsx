import { useState } from "react";
import SharkTankGame from "./SharkTankGame";

/**
 * SharkTankPopup
 * Drop-in floating launcher (Grammarly/Clippy style).
 * Just render <SharkTankPopup /> anywhere in any project — it positions itself.
 */
export default function SharkTankPopup() {
  const [open, setOpen] = useState(false);
  const [teasing, setTeasing] = useState(true);

  return (
    <>
      {!open && (
        <div className="fixed bottom-5 right-5 z-[9998] flex flex-col items-end gap-2">
          {teasing && (
            <div className="anim-bubble relative max-w-[220px] rounded-2xl border-[3px] border-[hsl(var(--ink))] bg-card px-3 py-2 text-xs font-semibold text-card-foreground comic-shadow">
              <button
                onClick={() => setTeasing(false)}
                className="absolute -right-2 -top-2 h-5 w-5 rounded-full border-[2px] border-[hsl(var(--ink))] bg-primary text-[10px] text-primary-foreground"
                aria-label="dismiss"
              >
                ×
              </button>
              Bored? 🦈 Pitch your Maggi crisis to Indian Sharks!
              <span className="absolute -bottom-2 right-6 h-3 w-3 rotate-45 border-b-[3px] border-r-[3px] border-[hsl(var(--ink))] bg-card" />
            </div>
          )}
          <button
            onClick={() => setOpen(true)}
            className="anim-float group relative flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[hsl(var(--ink))] bg-accent text-3xl comic-shadow transition-transform hover:scale-110 active:scale-95"
            aria-label="Open Shark Tank game"
          >
            <span className="absolute inset-0 rounded-full anim-pulse-ring bg-primary/60" />
            <span className="relative">🦈</span>
          </button>
        </div>
      )}
      {open && <SharkTankGame onClose={() => setOpen(false)} />}
    </>
  );
}
