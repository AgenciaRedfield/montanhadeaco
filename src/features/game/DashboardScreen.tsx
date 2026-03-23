import { useState } from "react";
import { motion } from "framer-motion";
import { ArenaModeModal } from "@/components/ArenaModeModal";
import { CloudAuthPanel } from "@/components/CloudAuthPanel";
import { FORGE_COST } from "@/services/progressionService";
import { GameLayout } from "@/features/game/GameLayout";
import { useGameStore } from "@/store/gameStore";

export const DashboardScreen = () => {
  const profile = useGameStore((state) => state.profile);
  const auth = useGameStore((state) => state.auth);
  const startGame = useGameStore((state) => state.startGame);
  const resetProgress = useGameStore((state) => state.resetProgress);
  const setScreen = useGameStore((state) => state.setScreen);
  const setStatus = useGameStore((state) => state.setStatus);
  const openForge = useGameStore((state) => state.openForge);
  const openDeckBuilder = useGameStore((state) => state.openDeckBuilder);
  const unlockMusic = useGameStore((state) => state.unlockMusic);
  const [arenaModalOpen, setArenaModalOpen] = useState(false);

  const winRate = profile.battlesPlayed > 0 ? Math.round((profile.victories / profile.battlesPlayed) * 100) : 0;
  const collectionProgress = Math.round((profile.unlockedCards.length / 20) * 100);
  const deckProgress = Math.round((profile.selectedDeck.length / 20) * 100);

  const handleChooseAi = () => {
    unlockMusic();
    setArenaModalOpen(false);
    startGame();
  };

  const handleChoosePvp = () => {
    setArenaModalOpen(false);
    if (!auth.userId) {
      setStatus("Conecte sua conta Supabase para liberar a arena PvP quando a fila online entrar em operacao.");
      return;
    }
    setStatus("Modo PvP preparado no menu da arena. A fila online sera a proxima etapa da fundicao.");
  };

  return (
    <GameLayout>
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="grid gap-5">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2.2rem] border border-brass-500/18 bg-[radial-gradient(circle_at_top,rgba(216,138,99,0.18),transparent_36%),linear-gradient(145deg,rgba(8,9,13,0.82),rgba(16,18,25,0.94))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <p className="text-[11px] uppercase tracking-[0.55em] text-copper-200/70">Central de Comando</p>
            <h1 className="mt-4 font-display text-6xl text-brass-50">Sala da Forja</h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-brass-100/74">
              Gerencie sua campanha, monte seu deck e abra boosters da Forja antes de entrar em combate dentro da Montanha de Aco.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => setArenaModalOpen(true)} className="rounded-[1.25rem] border border-brass-100/20 bg-[linear-gradient(135deg,#d88a63_0%,#ebcb71_48%,#8d4326_100%)] px-6 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-smoke-900">
                Entrar na Arena
              </button>
              <button type="button" onClick={() => openDeckBuilder()} className="rounded-[1.25rem] border border-brass-100/15 bg-white/5 px-6 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-brass-50">
                Editar Deck
              </button>
              <button type="button" onClick={() => openForge()} className="rounded-[1.25rem] border border-brass-100/15 bg-white/5 px-6 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-brass-50">
                Abrir Forja
              </button>
              <button type="button" onClick={() => setScreen("menu")} className="rounded-[1.25rem] border border-brass-100/15 bg-white/5 px-6 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-brass-50">
                Voltar ao Menu
              </button>
            </div>
          </motion.div>

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-[1.8rem] border border-brass-500/16 bg-black/28 p-5 shadow-copper backdrop-blur-xl">
              <p className="text-[10px] uppercase tracking-[0.34em] text-brass-100/50">Comandante</p>
              <h2 className="mt-2 font-display text-3xl text-brass-50">{profile.commanderName}</h2>
              <p className="mt-2 text-sm text-brass-100/70">{profile.rank}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-[1rem] border border-white/6 bg-white/[0.03] p-3">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-brass-100/55">Nivel</p>
                  <p className="text-2xl font-semibold text-brass-50">{profile.level}</p>
                </div>
                <div className="rounded-[1rem] border border-white/6 bg-white/[0.03] p-3">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-brass-100/55">Creditos</p>
                  <p className="text-2xl font-semibold text-brass-50">{profile.forgeCredits}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-brass-500/16 bg-black/28 p-5 shadow-copper backdrop-blur-xl">
              <p className="text-[10px] uppercase tracking-[0.34em] text-brass-100/50">Campanha</p>
              <div className="mt-4 space-y-3 text-sm text-brass-100/72">
                <p>Batalhas Jogadas: <span className="font-semibold text-brass-50">{profile.battlesPlayed}</span></p>
                <p>Vitorias: <span className="font-semibold text-brass-50">{profile.victories}</span></p>
                <p>Taxa de Vitoria: <span className="font-semibold text-brass-50">{winRate}%</span></p>
                <p>Ultima Acao: <span className="font-semibold text-brass-50">{profile.lastPlayedAt ? new Date(profile.lastPlayedAt).toLocaleString() : "Nenhuma"}</span></p>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-brass-500/16 bg-black/28 p-5 shadow-copper backdrop-blur-xl">
              <p className="text-[10px] uppercase tracking-[0.34em] text-brass-100/50">Deck e Colecao</p>
              <div className="mt-4 space-y-3 text-sm text-brass-100/72">
                <p>Cartas Desbloqueadas: <span className="font-semibold text-brass-50">{profile.unlockedCards.length}/20</span></p>
                <p>Deck Ativo: <span className="font-semibold text-brass-50">{profile.selectedDeck.length}/20</span></p>
                <p>Booster da Forja: <span className="font-semibold text-brass-50">3 cartas por {FORGE_COST} creditos</span></p>
              </div>
              <div className="mt-4 space-y-2">
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-[0.24em] text-brass-100/48">Colecao</p>
                  <div className="h-3 overflow-hidden rounded-full border border-brass-100/10 bg-black/40">
                    <div className="h-full rounded-full bg-[linear-gradient(90deg,#d88a63_0%,#ebcb71_100%)]" style={{ width: `${collectionProgress}%` }} />
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-[0.24em] text-brass-100/48">Deck</p>
                  <div className="h-3 overflow-hidden rounded-full border border-brass-100/10 bg-black/40">
                    <div className="h-full rounded-full bg-[linear-gradient(90deg,#8d4326_0%,#d88a63_100%)]" style={{ width: `${deckProgress}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="grid gap-5 auto-rows-min">
          <CloudAuthPanel />

          <div className="rounded-[1.9rem] border border-brass-500/16 bg-black/28 p-5 shadow-copper backdrop-blur-xl">
            <p className="text-[10px] uppercase tracking-[0.34em] text-brass-100/50">Pontes do Progresso</p>
            <h3 className="mt-2 font-display text-3xl text-brass-50">Supabase Integrado</h3>
            <p className="mt-3 text-sm leading-relaxed text-brass-100/72">
              Perfil, deck ativo e colecao podem ser sincronizados com a nuvem por email magic link. Isso ja prepara a base para filas, lobbies e batalhas online futuramente.
            </p>
          </div>

          <div className="rounded-[1.9rem] border border-brass-500/16 bg-black/28 p-5 shadow-copper backdrop-blur-xl">
            <p className="text-[10px] uppercase tracking-[0.34em] text-brass-100/50">Manutencao da Forja</p>
            <div className="mt-4 grid gap-3">
              <button type="button" onClick={() => openDeckBuilder()} className="rounded-[1.15rem] border border-brass-100/20 bg-[linear-gradient(135deg,rgba(216,138,99,0.22),rgba(235,203,113,0.16),rgba(141,67,38,0.28))] px-5 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-brass-50">
                Ajustar Deck
              </button>
              <button type="button" onClick={() => openForge()} className="rounded-[1.15rem] border border-brass-100/20 bg-[linear-gradient(135deg,rgba(216,138,99,0.18),rgba(235,203,113,0.12),rgba(141,67,38,0.2))] px-5 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-brass-50">
                Abrir Booster
              </button>
              <button type="button" onClick={() => setArenaModalOpen(true)} className="rounded-[1.15rem] border border-brass-100/20 bg-[linear-gradient(135deg,#d88a63_0%,#ebcb71_48%,#8d4326_100%)] px-5 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-smoke-900">
                Entrar na Arena
              </button>
              <button type="button" onClick={() => resetProgress()} className="rounded-[1.15rem] border border-brass-100/15 bg-white/5 px-5 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-brass-50">
                Zerar Progresso
              </button>
            </div>
          </div>
        </aside>
      </div>

      {arenaModalOpen ? <ArenaModeModal onChoosePvp={handleChoosePvp} onChooseAi={handleChooseAi} onClose={() => setArenaModalOpen(false)} /> : null}
    </GameLayout>
  );
};
