import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import { CloudAuthPanel } from "@/components/CloudAuthPanel";
import { GameLayout } from "@/features/game/GameLayout";
import { useGameStore } from "@/store/gameStore";

export const MainMenu = () => {
  const openDashboard = useGameStore((state) => state.openDashboard);
  const resetProgress = useGameStore((state) => state.resetProgress);
  const status = useGameStore((state) => state.ui.status);
  const unlockMusic = useGameStore((state) => state.unlockMusic);

  return (
    <GameLayout>
      <div className="flex min-h-[calc(100vh-6rem)] flex-col justify-between gap-8 lg:min-h-[calc(100vh-7rem)]">
        <section className="grid flex-1 gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[2.8rem] border border-brass-500/18 bg-[radial-gradient(circle_at_top,rgba(216,138,99,0.18),transparent_35%),linear-gradient(145deg,rgba(8,9,13,0.82),rgba(16,18,25,0.94))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)] md:p-12">
            <div className="absolute right-8 top-8 h-24 w-24 rounded-full border border-copper-300/15 bg-copper-500/10 blur-sm" />
            <div className="absolute bottom-10 left-10 h-32 w-32 rounded-full bg-brass-300/10 blur-3xl" />
            <div className="relative z-10 flex flex-col items-start">
              <div className="logo-hero-wrap mx-auto w-full max-w-[28rem] md:mx-0 md:max-w-[30rem]">
                <img src={logo} alt="Montanha de Aco" className="logo-hero w-full" />
              </div>
              <p className="mt-6 text-[11px] uppercase tracking-[0.55em] text-copper-200/70">Onde o aco reina, e o vapor decide o destino.</p>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brass-100/74">
                Entre na central da forja, acompanhe seu progresso persistido e conecte sua fundicao em nuvem para salvar campanha, deck e colecao.
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5 rounded-[2.6rem] border border-brass-500/18 bg-black/30 p-8 shadow-copper backdrop-blur-xl md:p-10">
            <div>
              <p className="text-[11px] uppercase tracking-[0.45em] text-brass-100/50">Portao da Fundicao</p>
              <p className="mt-3 font-display text-4xl text-brass-50">Sala de Comando</p>
              <p className="mt-5 rounded-[1.5rem] border border-white/6 bg-white/[0.03] p-4 text-sm leading-relaxed text-brass-100/72">{status}</p>
              <div className="mt-8 space-y-3">
                <button type="button" onClick={() => { unlockMusic(); openDashboard(); }} className="w-full rounded-[1.3rem] border border-brass-100/20 bg-[linear-gradient(135deg,#d88a63_0%,#ebcb71_48%,#8d4326_100%)] px-5 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-smoke-900">
                  Entrar na Montanha
                </button>
                <button type="button" onClick={() => resetProgress()} className="w-full rounded-[1.3rem] border border-brass-100/15 bg-white/5 px-5 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-brass-50">
                  Reiniciar Progresso
                </button>
              </div>
            </div>

            <CloudAuthPanel />
          </motion.div>
        </section>
      </div>
    </GameLayout>
  );
};
