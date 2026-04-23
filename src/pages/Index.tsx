import SharkTankPopup from "@/components/sharkgame/SharkTankPopup";

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Mock "host" page — pretend this is your LLM testing UI */}
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-3xl border-[3px] border-[hsl(var(--ink))] bg-card p-8 text-card-foreground comic-shadow-lg">
          <h1 className="mb-2 text-4xl font-black">🦈 Shark Tank: Maggi Edition</h1>
          <p className="mb-4 text-muted-foreground">
            A drop-in popup game (Grammarly / Clippy style) for any React project.
            While your LLM is thinking, pitch your Maggi crisis to the Sharks.
          </p>

          <div className="rounded-xl border-[3px] border-dashed border-[hsl(var(--ink))]/40 bg-muted p-4">
            <p className="text-sm font-semibold">How to drop into any project:</p>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-[hsl(var(--ink))] p-3 text-xs text-white">
{`import SharkTankPopup from "@/components/sharkgame/SharkTankPopup";

// anywhere in your app:
<SharkTankPopup />`}
            </pre>
            <p className="mt-3 text-sm text-muted-foreground">
              👉 Click the floating 🦈 button at the bottom-right to start the pitch.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {["Confident pitch 🎤", "5 Shark roasts 🔥", "Choose your ending 🎬"].map((f) => (
              <div
                key={f}
                className="rounded-xl border-[3px] border-[hsl(var(--ink))] bg-accent px-3 py-3 text-center text-sm font-bold text-[hsl(var(--ink))] comic-shadow"
              >
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <SharkTankPopup />
    </div>
  );
};

export default Index;
