import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { useUiStore } from "@/store/uiStore";
import { SteamBackdrop } from "@/features/ui/SteamBackdrop";

export const MainMenu = () => {
  const startGame = useGameStore((state) => state.startGame);
  const busy = useUiStore((state) => state.busy);
  const status = useUiStore((state) => state.status);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#4b2f19_0%,#161009_30%,#08090d_100%)] text-brass-50">
      <SteamBackdrop />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-6 py-10 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-brass-200/60">Montanha de Aco</p>
            <h1 className="font-display text-6xl leading-none md:text-8xl">Montanha de Aco</h1>
          </div>
          <div className="hidden rounded-full border border-brass-200/10 bg-black/25 px-5 py-3 text-xs uppercase tracking-[0.35em] text-brass-100/60 md:block">
            Living Structure • Steam Sovereignty
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
            <p className="mb-5 text-sm uppercase tracking-[0.55em] text-copper-300/80">Where steel reigns, and steam decides destiny</p>
            <h2 className="mb-6 max-w-2xl font-display text-4xl leading-tight text-brass-50 md:text-6xl">
              A war of pistons, plating and pressure inside the supreme industrial citadel.
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-brass-100/75">
              Raise your battle line, channel Steam Pressure and dominate a mechanized rival inside the living heart of the Mountain of Steel.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="rounded-[2rem] border border-brass-500/20 bg-black/35 p-6 shadow-copper backdrop-blur-xl">
            <p className="mb-3 text-xs uppercase tracking-[0.45em] text-brass-100/50">Foundry Status</p>
            <p className="mb-6 font-display text-3xl">Ready for ignition</p>
            <p className="mb-8 text-sm leading-relaxed text-brass-100/70">{status}</p>
            <button
              type="button"
              onClick={() => void startGame()}
              disabled={busy}
              className="w-full rounded-[1.25rem] border border-brass-100/30 bg-gradient-to-r from-copper-500 to-brass-400 px-5 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-smoke-900 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
            >
              {busy ? "Pressurizing..." : "Enter Battle"}
            </button>
          </motion.div>
        </section>
      </div>
    </main>
  );
};
