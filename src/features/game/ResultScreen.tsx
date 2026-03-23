import { motion } from "framer-motion";
import { useBattleStore } from "@/store/battleStore";
import { useGameStore } from "@/store/gameStore";
import { useUiStore } from "@/store/uiStore";
import { SteamBackdrop } from "@/features/ui/SteamBackdrop";

export const ResultScreen = () => {
  const winner = useBattleStore((state) => state.winner);
  const status = useUiStore((state) => state.status);
  const startGame = useGameStore((state) => state.startGame);
  const setScreen = useUiStore((state) => state.setScreen);
  const victory = winner === "player";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#52331d_0%,#130d09_35%,#06070b_100%)] text-brass-50">
      <SteamBackdrop />
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="w-full rounded-[2.5rem] border border-brass-500/20 bg-black/35 p-10 shadow-copper backdrop-blur-xl">
          <p className="mb-4 text-xs uppercase tracking-[0.55em] text-brass-100/55">Boiler Outcome</p>
          <h1 className="mb-5 font-display text-6xl">{victory ? "Victory" : "Defeat"}</h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-brass-100/75">{status}</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button type="button" onClick={() => void startGame()} className="rounded-[1.25rem] border border-brass-100/30 bg-gradient-to-r from-copper-500 to-brass-400 px-6 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-smoke-900">
              New Assault
            </button>
            <button type="button" onClick={() => setScreen("menu")} className="rounded-[1.25rem] border border-brass-200/20 bg-white/5 px-6 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-brass-50">
              Back to Menu
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
};
