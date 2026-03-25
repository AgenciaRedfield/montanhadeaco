import { useState } from "react";
import { motion } from "framer-motion";
import { ArenaModeModal } from "@/components/ArenaModeModal";
import { CloudAuthPanel } from "@/components/CloudAuthPanel";
import { GameLayout } from "@/features/game/GameLayout";
import { useGameStore } from "@/store/gameStore";

/* ── DEFINIÇÃO DOS ESTÁGIOS DA CAMPANHA ── */
const CAMPAIGN_STAGES = [
  { id: 1, name: "O Portao da Fundicao", boss: "Vigia Aether", reward: "35 Creditos", difficulty: "Facil", icon: "🚪" },
  { id: 2, name: "Minas de Ferro Velho", boss: "Escavadeira Alpha", reward: "40 Creditos", difficulty: "Fácil", icon: "⛏️" },
  { id: 3, name: "Setor de Engrenagens", boss: "Engrenador Senior", reward: "50 Creditos", difficulty: "Media", icon: "⚙️" },
  { id: 4, name: "Laboratorio de Vapor", boss: "Dr. Alquimista de Vapor", reward: "60 Creditos", difficulty: "Media", icon: "🧪" },
  { id: 5, name: "O Nucleo da Montanha", boss: "Titã de Aço", reward: "100 Creditos", difficulty: "Dificil", icon: "🔥" },
];

export const DashboardScreen = () => {
  const profile = useGameStore((state) => state.profile);
  const auth = useGameStore((state) => state.auth);
  const startGame = useGameStore((state) => state.startGame);
  const setScreen = useGameStore((state) => state.setScreen);
  const openForge = useGameStore((state) => state.openForge);
  const openDeckBuilder = useGameStore((state) => state.openDeckBuilder);
  const unlockMusic = useGameStore((state) => state.unlockMusic);
  
  const [arenaModalOpen, setArenaModalOpen] = useState(false);

  /* O estágio atual é baseado nas vitórias (simplificado para o MVP) */
  const currentStageIndex = Math.min(profile.victories, CAMPAIGN_STAGES.length - 1);
  const currentStage = CAMPAIGN_STAGES[currentStageIndex];

  const handleStartMission = () => {
    unlockMusic();
    startGame();
  };

  const winRate = profile.battlesPlayed > 0 ? Math.round((profile.victories / profile.battlesPlayed) * 100) : 0;

  return (
    <GameLayout>
      {!auth.userId ? (
        <div className="flex min-h-[70vh] flex-col items-center justify-center p-8 text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl rounded-[3rem] border border-brass-500/20 bg-black/40 p-12 shadow-2xl backdrop-blur-xl"
            >
               <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-brass-500/10 text-4xl mb-6">🔒</div>
               <h2 className="font-display text-4xl text-brass-50 uppercase tracking-widest italic">Acesso Restrito</h2>
               <p className="mt-4 text-lg text-brass-100/60 leading-relaxed">
                  Para acessar o Mapa de Campanha e registrar sua progressão na Montanha de Aço, você precisa conectar sua Fundição à nuvem.
               </p>
               <div className="mt-10">
                  <CloudAuthPanel />
               </div>
               <button 
                onClick={() => setScreen("menu")}
                className="mt-8 text-xs uppercase tracking-[0.4em] text-brass-100/30 hover:text-brass-100/60 underline"
               >
                 Voltar ao Menu Principal
               </button>
            </motion.div>
        </div>
      ) : (
        <div className="grid gap-8 pb-10 xl:grid-cols-[1.2fr_0.8fr]">
          
          {/* ── MAPA DE CAMPANHA ── */}
          <section className="flex flex-col gap-6">
            <header className="rounded-[2.5rem] border border-brass-500/18 bg-[linear-gradient(135deg,rgba(42,26,16,0.8),rgba(10,12,18,0.95))] p-8 shadow-2xl backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.6em] text-copper-300">Mapa de Operações</p>
              <h1 className="mt-2 font-display text-5xl text-brass-50 uppercase tracking-tighter italic">A Ascensão da Montanha</h1>
              <p className="mt-4 text-brass-100/60 leading-relaxed font-medium">
                Conquiste os setores da Fundição para coletar créditos e desbloquear tecnologias ancestrais de vapor.
              </p>
            </header>

            <div className="relative flex flex-col gap-4 rounded-[3rem] border border-brass-500/10 bg-black/40 p-10 shadow-inner">
               {/* Linha do Mapa (Background) */}
               <div className="absolute left-[3.25rem] top-20 bottom-20 w-1 bg-gradient-to-b from-brass-600/5 via-brass-600/20 to-brass-600/5 hidden sm:block" />

               {CAMPAIGN_STAGES.map((stage, idx) => {
                 const isLocked = idx > currentStageIndex;
                 const isCurrent = idx === currentStageIndex;
                 const isCompleted = idx < currentStageIndex;

                 return (
                   <motion.div 
                      key={stage.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`relative flex items-center gap-6 group ${isLocked ? "opacity-40" : "opacity-100"}`}
                   >
                      {/* Indicador de Estágio (O Terminal) */}
                      <div className={`relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 transition-all duration-500 
                        ${isCurrent ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.3)] scale-110" : 
                          isCompleted ? "border-brass-500/40 bg-brass-500/20" : "border-white/10 bg-white/5"}`}
                      >
                        <span className="text-2xl">{isLocked ? "🔒" : stage.icon}</span>
                        {isCurrent && (
                          <div className="absolute -inset-1 rounded-2xl border-2 border-emerald-400/50 animate-ping opacity-20" />
                        )}
                      </div>

                      {/* Card de Detalhes do Estágio */}
                      <div className={`flex-1 rounded-[1.8rem] border p-6 transition-all duration-300 
                        ${isCurrent ? "border-brass-100/20 bg-emerald-500/5 shadow-emerald" : 
                          "border-white/5 bg-white/[0.03] hover:bg-white/[0.05]"}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                             <div className="flex items-center gap-3">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-copper-400">Estágio {stage.id}</p>
                                {isCompleted && <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-400">Finalizado ✅</span>}
                                {isCurrent && <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-400 animate-pulse">Disponível Agora</span>}
                             </div>
                             <h3 className="mt-1 font-display text-2xl text-brass-50">{stage.name}</h3>
                             <p className="mt-1 text-sm text-brass-100/50">Chefe: <span className="text-brass-100/80">{stage.boss}</span></p>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2 text-right">
                            <p className="text-[10px] uppercase tracking-widest text-brass-100/40">Recompensa</p>
                            <p className="font-bold text-emerald-400">{stage.reward}</p>
                            {isCurrent && (
                              <button 
                                onClick={handleStartMission} 
                                className="mt-2 rounded-xl border border-emerald-400/30 bg-emerald-500/20 px-6 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-100 hover:bg-emerald-500/40 transition-colors"
                              >
                                Iniciar Combate
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                   </motion.div>
                 );
               })}
            </div>
          </section>

          {/* ── PAINEL DE COMANDANTE ── */}
          <aside className="flex flex-col gap-6">
            <div className="rounded-[2.4rem] border border-brass-500/18 bg-black/40 p-8 shadow-copper backdrop-blur-xl">
               <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-brass-600 to-copper-900 flex items-center justify-center text-2xl">👤</div>
                  <div>
                     <h2 className="font-display text-2xl text-brass-50">{profile.commanderName}</h2>
                     <p className="text-[10px] uppercase tracking-widest text-copper-300 font-bold">{profile.rank}</p>
                  </div>
               </div>
               
               <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center">
                     <p className="text-[10px] uppercase tracking-widest text-brass-100/40">Créditos</p>
                     <p className="text-3xl font-bold text-emerald-400">{profile.forgeCredits}</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center">
                     <p className="text-[10px] uppercase tracking-widest text-brass-100/40">Nível</p>
                     <p className="text-3xl font-bold text-sky-400">{profile.level}</p>
                  </div>
               </div>

               <div className="mt-8 space-y-4 text-sm text-brass-100/60">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                     <span>Batalhas:</span> <span className="text-brass-50 font-bold">{profile.battlesPlayed}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                     <span>Vitórias:</span> <span className="text-emerald-400 font-bold">{profile.victories}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                     <span>Win Rate:</span> <span className="text-brass-50 font-bold">{winRate}%</span>
                  </div>
               </div>
            </div>

            <div className="rounded-[2.4rem] border border-brass-500/18 bg-black/40 p-8 shadow-copper backdrop-blur-xl">
               <h3 className="font-display text-xl text-brass-50 uppercase tracking-widest mb-6">Oficina da Montanha</h3>
               <div className="grid gap-4">
                  <button onClick={() => openDeckBuilder()} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-4 group hover:bg-white/[0.07] transition">
                     <div className="flex items-center gap-4">
                        <span className="text-xl">🎴</span>
                        <div className="text-left">
                           <p className="text-sm font-bold text-brass-50">Ajustar Deck</p>
                           <p className="text-[10px] text-brass-100/40 uppercase tracking-widest">{profile.selectedDeck.length}/20 cartas</p>
                        </div>
                     </div>
                     <span className="opacity-0 group-hover:opacity-100 transition-opacity">➡️</span>
                  </button>
                  <button onClick={() => openForge()} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-4 group hover:bg-white/[0.07] transition">
                     <div className="flex items-center gap-4">
                        <span className="text-xl">🔥</span>
                        <div className="text-left">
                           <p className="text-sm font-bold text-brass-50">Abrir Forja</p>
                           <p className="text-[10px] text-brass-100/40 uppercase tracking-widest">Gastar créditos</p>
                      </div>
                   </div>
                   <span className="opacity-0 group-hover:opacity-100 transition-opacity">➡️</span>
                </button>
             </div>
          </div>

          <CloudAuthPanel />
        </aside>

      </div>
      )}

      {arenaModalOpen ? <ArenaModeModal onChoosePvp={() => setArenaModalOpen(false)} onChooseAi={handleStartMission} onClose={() => setArenaModalOpen(false)} /> : null}
    </GameLayout>
  );
};
