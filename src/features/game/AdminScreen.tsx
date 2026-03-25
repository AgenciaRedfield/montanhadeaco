import { motion } from "framer-motion";
import { GameLayout } from "@/features/game/GameLayout";
import { useGameStore } from "@/store/gameStore";
import { cards as ALL_CARDS } from "@/data/cards";
import { CardView } from "@/components/CardView";

export const AdminScreen = () => {
  const profile = useGameStore((state) => state.profile);
  const setScreen = useGameStore((state) => state.setScreen);
  const setStatus = useGameStore((state) => state.setStatus);
  
  return (
    <GameLayout>
      <div className="flex flex-col gap-8 pb-10">
        <header className="flex items-center justify-between rounded-[2rem] border border-red-500/20 bg-red-950/20 p-6 backdrop-blur-md">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-red-300/60">Console de Comando</p>
            <h1 className="font-display text-4xl text-red-50">Painel do Fundidor (ADMIN)</h1>
          </div>
          <button 
            onClick={() => setScreen("menu")}
            className="rounded-full border border-red-300/20 bg-red-400/10 px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-red-100 transition hover:bg-red-400/20"
          >
            Sair do Admin
          </button>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          {/* GERENCIAMENTO DE PERFIL */}
          <div className="rounded-[2.2rem] border border-brass-500/18 bg-black/40 p-6 shadow-copper">
            <h3 className="mb-4 font-display text-2xl text-brass-50">Controle de Perfil</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 text-sm text-brass-100/70">
                <span>Créditos de Forja</span>
                <span className="font-bold text-emerald-400">{profile.forgeCredits}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setStatus("Cheat: +500 créditos adicionados.")} className="rounded-lg border border-white/10 bg-white/5 py-2 text-[10px] font-semibold uppercase tracking-wider text-brass-100 hover:bg-white/10">Add +500</button>
                <button onClick={() => setStatus("Cheat: +10k créditos adicionados.")} className="rounded-lg border border-white/10 bg-white/5 py-2 text-[10px] font-semibold uppercase tracking-wider text-brass-100 hover:bg-white/10">Add +10k</button>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2 text-sm text-brass-100/70 pt-2">
                <span>Nível do Comandante</span>
                <span className="font-bold text-sky-400">{profile.level}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="rounded-lg border border-white/10 bg-white/5 py-2 text-[10px] font-semibold uppercase tracking-wider text-brass-100">Set Lv. 99</button>
                <button className="rounded-lg border border-white/10 bg-white/5 py-2 text-[10px] font-semibold uppercase tracking-wider text-brass-100">Reset Progresso</button>
              </div>
            </div>
          </div>

          {/* CONTROLE DE ARENA (BATTLE) */}
          <div className="rounded-[2.2rem] border border-red-500/18 bg-black/40 p-6 shadow-red-900/10">
            <h3 className="mb-4 font-display text-2xl text-red-50">Ajustes de Batalha</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-red-300/70">Saúde do Jogador</p>
                <div className="flex gap-2">
                  <button className="flex-1 rounded-lg bg-emerald-600/20 py-2 text-xs text-emerald-100">Heal 100%</button>
                  <button className="flex-1 rounded-lg bg-red-600/20 py-2 text-xs text-red-100">Insta-Kill</button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-red-300/70">Vapor e Pressão</p>
                <div className="flex gap-2">
                  <button className="flex-1 rounded-lg bg-sky-600/20 py-2 text-xs text-sky-100">Infinito Steam</button>
                  <button className="flex-1 rounded-lg bg-orange-600/20 py-2 text-xs text-orange-100">Limpar Overpressure</button>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-[10px] leading-relaxed text-red-200/60 italic">
                Aviso: Alterar estados de batalha em tempo real pode causar dessincronização visual temporária.
              </div>
            </div>
          </div>

          {/* STATUS GLOBAIS */}
          <div className="rounded-[2.2rem] border border-brass-500/18 bg-black/40 p-6 shadow-copper">
            <h3 className="mb-4 font-display text-2xl text-brass-50">Stats Globais</h3>
            <div className="space-y-3 text-sm text-brass-100/70">
              <div className="flex justify-between"><span>Cartas Desbloqueadas:</span> <span className="text-brass-50 font-bold">{profile.unlockedCards.length}/20</span></div>
              <div className="flex justify-between"><span>Batalhas:</span> <span className="text-brass-50 font-bold">{profile.battlesPlayed}</span></div>
              <div className="flex justify-between"><span>Vitorias:</span> <span className="text-emerald-400 font-bold">{profile.victories}</span></div>
            </div>
            <button className="mt-6 w-full rounded-xl border border-brass-100/20 bg-[linear-gradient(135deg,rgba(216,138,99,0.3),rgba(235,203,113,0.3))] py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-brass-50">Baixar Snapshot de Dados</button>
          </div>
        </section>

        {/* LISTA COMPLETA DE CARTAS (TOOLSET) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-3xl text-brass-50">Biblioteca da Fundição ({ALL_CARDS.length})</h2>
            <div className="flex gap-4">
              <span className="text-[10px] text-brass-100/40 uppercase tracking-widest italic">Passe o mouse para inspecionar</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {ALL_CARDS.map(card => (
              <div key={card.id} className="group relative">
                <div className="scale-90 transition group-hover:scale-100">
                  <CardView card={{ 
                    ...card, 
                    instanceId: `admin-${card.id}`, 
                    baseId: card.id,
                    ownerId: "player", 
                    currentAttack: card.attack, 
                    currentDefense: card.defense, 
                    maxDefense: card.defense,
                    shield: 0, 
                    hasActed: false, 
                    attackCount: 0, 
                    statusEffects: [],
                    canAttack: true,
                    summonSickness: false,
                  }} />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex justify-center translate-y-2 opacity-0 transition group-hover:translate-y-4 group-hover:opacity-100">
                  <button className="rounded-full bg-red-600 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">Editar Stats</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </GameLayout>
  );
};
