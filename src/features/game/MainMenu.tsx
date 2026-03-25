import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import heroImg from "@/assets/hero_bg.png"; 
import { CloudAuthPanel } from "@/components/CloudAuthPanel";
import { GameLayout } from "@/features/game/GameLayout";
import { useGameStore } from "@/store/gameStore";
import { CardView } from "@/components/CardView";
import { cards } from "@/data/cards";
import { useRef } from "react";

export const MainMenu = () => {
  const openDashboard = useGameStore((state) => state.openDashboard);
  const resetProgress = useGameStore((state) => state.resetProgress);
  const setScreen = useGameStore((state) => state.setScreen);
  const status = useGameStore((state) => state.ui.status);
  const unlockMusic = useGameStore((state) => state.unlockMusic);
  
  const featuredCards = [cards[0], cards[4], cards[12], cards[18]]; 
  
  const stats = [
    { label: "Unidades de Combate", value: "20+" },
    { label: "Batalhas Diarias", value: "1.2k" },
    { label: "Comandantes Ativos", value: "500+" },
  ];

  return (
    <GameLayout>
      <div className="relative flex flex-col gap-20 pb-20">
        
        {/* ── HERO SECTION ── */}
        <section className="relative h-[85vh] w-full overflow-hidden rounded-[3rem] border border-brass-500/20 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 z-0"
          >
            <img src={heroImg} alt="Montanha de Aco" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
          </motion.div>

          <div className="relative z-10 flex h-full flex-col items-center justify-center bg-black/30 px-6 backdrop-blur-[2px]">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-full max-w-[32rem] md:max-w-[42rem]">
                <img src={logo} alt="Montanha de Aco" className="w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]" />
              </div>
              <p className="mt-8 text-sm uppercase tracking-[0.7em] text-copper-200/90 drop-shadow-lg">
                Onde o aco reina, e o vapor decide o destino.
              </p>
              
              <div className="mt-12 flex flex-wrap justify-center gap-5">
                <button 
                  onClick={() => { 
                    if (!useGameStore.getState().auth.userId) {
                      const el = document.getElementById('auth-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                      useGameStore.getState().setStatus("⚠️ Conecte sua conta para desbloquear o Mapa de Campanha e salvar seu progresso.");
                      return;
                    }
                    unlockMusic(); 
                    openDashboard(); 
                  }} 
                  className="group relative overflow-hidden rounded-[1.4rem] border border-brass-100/30 bg-[linear-gradient(135deg,#d88a63_0%,#ebcb71_48%,#8d4326_100%)] px-10 py-5 text-sm font-bold uppercase tracking-[0.4em] text-smoke-900 shadow-xl transition-all hover:scale-105"
                >
                  <span className="relative z-10">Entrar na Arena</span>
                  <div className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] transition-transform duration-500 group-hover:translate-x-full" />
                </button>
                <button 
                  onClick={() => {
                    const el = document.getElementById('lore-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="rounded-[1.4rem] border border-brass-100/20 bg-white/5 px-10 py-5 text-sm font-bold uppercase tracking-[0.3em] text-brass-50 backdrop-blur-md transition hover:bg-white/10"
                >
                  Ver Historia
                </button>
              </div>
              <p className="mt-6 text-[10px] uppercase tracking-[0.35em] text-brass-100/40">
                {!useGameStore.getState().auth.userId ? "🔐 Login necessário para o Mapa de Campanha" : "🔋 Sistema de Progressão Ativo"}
              </p>
            </motion.div>

            <button 
              onDoubleClick={() => setScreen("admin")} 
              className="absolute bottom-6 right-6 h-10 w-10 rounded-full border border-white/5 bg-transparent opacity-10 transition hover:opacity-100"
              title="Acesso Administrador (Clique Duplo)"
            >
              ⚙️
            </button>
          </div>
        </section>

        {/* ── LORE SECTION ── */}
        <section id="lore-section" className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="text-[12px] uppercase tracking-[0.5em] text-copper-300">Crônicas da Fundição</p>
            <h2 className="font-display text-5xl text-brass-50">O Surgimento da Montanha de Aço</h2>
            <div className="space-y-4 text-lg leading-relaxed text-brass-100/70">
              <p>
                Nas profundezas do setor vitoriano proibido, uma colossal forja automatizada despertou de um sono de séculos. Conhecida como a <strong>Montanha de Aço</strong>, esta fortaleza industrial não apenas produz máquinas, ela cria vida movida a puro vapor.
              </p>
              <p>
                Como Comandante da Fundição, sua missão é liderar legiões de autômatos, tanques aether e engenheiros em uma batalha tática pelo controle da Pressão de Vapor. Aqui, cada engrenagem conta e cada explosão de calor pode ser a diferença entre a glória e o ferro-velho.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6 pt-6">
              {stats.map(s => (
                <div key={s.label}>
                  <p className="text-3xl font-bold text-brass-100">{s.value}</p>
                  <p className="text-[10px] uppercase tracking-widest text-copper-300">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-[2.8rem] border border-brass-500/18 bg-black/40 p-10 shadow-copper backdrop-blur-xl"
          >
            <div className="absolute -left-4 -top-4 text-4xl">⚙️</div>
            <div className="absolute -bottom-4 -right-4 text-4xl opacity-40">💨</div>
            <p className="text-xl italic leading-relaxed text-brass-100/90">
              "Não é apenas sobre força bruta, comandante. É sobre gerenciar a pressão. Se a caldeira estourar, não sobrará nada para contar a história."
            </p>
            <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-copper-400">
              — Grão-Engenheiro da Forja
            </p>
          </motion.div>
        </section>

        {/* ── FEATURED CARDS SECTION ── */}
        <section className="space-y-12">
          <div className="flex flex-col items-center text-center">
            <p className="text-[12px] uppercase tracking-[0.5em] text-copper-300">Coleção Premium</p>
            <h2 className="mt-4 font-display text-5xl text-brass-50">Arsenal da Montanha</h2>
            <p className="mt-4 max-w-2xl text-brass-100/60">
              Conheça as unidades de combate que compõem as legiões de aço. De operários aetherblade a titãs lendários do vapor.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredCards.map((card, idx) => (
              <motion.div 
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex justify-center"
              >
                <div className="scale-110">
                  <CardView card={{ 
                    ...card, 
                    instanceId: `featured-${idx}`, 
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
              </motion.div>
            ))}
          </div>
          
          <div className="flex justify-center pt-8">
            <button 
              onClick={() => { unlockMusic(); openDashboard(); }} 
              className="rounded-full border border-brass-100/20 bg-white/5 px-8 py-3 text-sm font-bold uppercase tracking-[0.2em] text-brass-400 transition hover:bg-white/10"
            >
              Ver Todas as Cartas no Painel
            </button>
          </div>
        </section>

        {/* ── FOOTER AUTH ── */}
        <section id="auth-section" className="mt-20 border-t border-brass-500/10 pt-20">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="rounded-[3rem] border border-brass-500/12 bg-black/40 p-12 shadow-inner backdrop-blur-md"
          >
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="space-y-6">
                <h3 className="font-display text-3xl text-brass-50">Pronto para assumir o comando?</h3>
                <p className="text-lg text-brass-100/70">
                  Crie sua conta na Fundição Supabase para sincronizar seu progresso, salvar seu deck personalizado e se preparar para as futuras batalhas online.
                </p>
                <div className="flex items-center gap-4 text-sm text-copper-300/80">
                  <span>✅ Sincronização em Nuvem</span>
                  <span>✅ Deck Persistente</span>
                  <span>✅ Ranking Global</span>
                </div>
              </div>
              <CloudAuthPanel />
            </div>
          </motion.div>
        </section>

        <footer className="flex flex-col items-center justify-between gap-6 border-t border-brass-700/20 pt-10 text-center sm:flex-row">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-8 opacity-60" />
            <p className="text-xs text-brass-100/40 uppercase tracking-widest">© 2026 Montanha de Aço • Alpha v0.8.4</p>
          </div>
          <div className="flex gap-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-brass-100/40">
            <button onClick={() => resetProgress()} className="hover:text-red-400">Resetar Dados</button>
            <a href="#" className="hover:text-brass-300">Termos da Forja</a>
            <a href="#" className="hover:text-brass-300">Comunidade</a>
          </div>
        </footer>
      </div>
    </GameLayout>
  );
};
