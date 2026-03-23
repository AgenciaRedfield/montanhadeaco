import { motion } from "framer-motion";
import { GameLayout } from "@/features/game/GameLayout";
import { useGameStore } from "@/store/gameStore";
import { useUiStore } from "@/store/uiStore";

export const MainMenu = () => {
  const startGame = useGameStore((state) => state.startGame);
  const resetGame = useGameStore((state) => state.resetGame);
  const busy = useUiStore((state) => state.busy);
  const status = useUiStore((state) => state.status);

  return (
    <GameLayout>
      <div className="flex min-h-[calc(100vh-2rem)] flex-col justify-between gap-8 lg:min-h-[calc(100vh-3rem)]">
        <header className="flex items-center justify-between gap-4 rounded-[2rem] border border-brass-400/12 bg-black/20 px-6 py-5 backdrop-blur-xl">
          <div>
            <p className="text-[11px] uppercase tracking-[0.6em] text-brass-100/52">Montanha de Aco</p>
            <h1 className="mt-2 font-display text-5xl leading-none text-brass-50 md:text-7xl">Montanha de Aco</h1>
          </div>
          <div className="hidden rounded-full border border-brass-200/10 bg-white/5 px-5 py-3 text-xs uppercase tracking-[0.36em] text-brass-100/58 lg:block">
            Onde o aco reina, e o vapor decide o destino.
          </div>
        </header>

        <section className="grid flex-1 gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[2.8rem] border border-brass-500/18 bg-[radial-gradient(circle_at_top,rgba(216,138,99,0.18),transparent_35%),linear-gradient(145deg,rgba(8,9,13,0.82),rgba(16,18,25,0.94))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)] md:p-12">
            <div className="absolute right-8 top-8 h-24 w-24 rounded-full border border-copper-300/15 bg-copper-500/10 blur-sm" />
            <div className="absolute bottom-10 left-10 h-32 w-32 rounded-full bg-brass-300/10 blur-3xl" />
            <p className="text-[11px] uppercase tracking-[0.55em] text-copper-200/70">Steampunk Strategy Card Battle</p>
            <h2 className="mt-5 max-w-3xl font-display text-5xl leading-tight text-brass-50 md:text-7xl">
              A guerra de vapor dentro da cidadela viva de ferro e bronze.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brass-100/74">
              Controle a Pressao de Vapor, mobilize sua linha na Plataforma Industrial e esmague um rival mecanizado em confrontos taticos de alto impacto.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 text-sm uppercase tracking-[0.32em] text-brass-100/58">
              <span className="rounded-full border border-brass-100/12 bg-white/5 px-4 py-3">Vapor</span>
              <span className="rounded-full border border-brass-100/12 bg-white/5 px-4 py-3">Aco</span>
              <span className="rounded-full border border-brass-100/12 bg-white/5 px-4 py-3">Overpressure</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-[2.6rem] border border-brass-500/18 bg-black/30 p-8 shadow-copper backdrop-blur-xl md:p-10">
            <p className="text-[11px] uppercase tracking-[0.45em] text-brass-100/50">Painel da Forja</p>
            <p className="mt-3 font-display text-4xl text-brass-50">Caldeiras prontas</p>
            <p className="mt-5 rounded-[1.5rem] border border-white/6 bg-white/[0.03] p-4 text-sm leading-relaxed text-brass-100/72">{status}</p>
            <div className="mt-8 space-y-3">
              <button type="button" onClick={() => startGame()} disabled={busy} className="w-full rounded-[1.3rem] border border-brass-100/20 bg-[linear-gradient(135deg,#d88a63_0%,#ebcb71_48%,#8d4326_100%)] px-5 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-smoke-900 disabled:opacity-60">
                {busy ? "Pressurizando" : "Jogar"}
              </button>
              <button type="button" onClick={() => resetGame()} className="w-full rounded-[1.3rem] border border-brass-100/15 bg-white/5 px-5 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-brass-50">
                Resetar Jogo
              </button>
            </div>
          </motion.div>
        </section>
      </div>
    </GameLayout>
  );
};