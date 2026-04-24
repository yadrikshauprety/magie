import { SharkAd } from "./sharkAds";

export default function SharkAdOverlay({ ad, onClose }: { ad: SharkAd; onClose: () => void }) {
  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center anim-bubble"
      style={{ background: "hsl(220 30% 5% / 0.85)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="anim-pop relative w-[90%] max-w-md overflow-hidden rounded-3xl border-[4px] border-[hsl(var(--ink))] comic-shadow-lg"
        style={{ background: ad.bg, color: ad.fg }}
      >
        <div className="px-6 py-6 text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] opacity-80">— Sponsored —</p>
          <div className="my-2 text-7xl anim-wiggle">{ad.emoji}</div>
          <h2 className="text-stroke text-3xl font-black uppercase">{ad.brand}</h2>
          <p className="mt-2 text-sm font-bold italic opacity-95">"{ad.tagline}"</p>
          <p className="mt-3 rounded-xl bg-black/30 px-3 py-2 text-xs font-semibold">
            {ad.punchline}
          </p>
          <button
            onClick={onClose}
            className="mt-5 rounded-xl border-[3px] border-[hsl(var(--ink))] bg-white px-5 py-2 text-xs font-black text-[hsl(var(--ink))] comic-shadow transition-transform hover:-translate-y-0.5"
          >
            SKIP AD ⏭ (let shark stay)
          </button>
        </div>
      </div>
    </div>
  );
}
