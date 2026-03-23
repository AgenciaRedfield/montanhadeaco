import { AnimatePresence, motion } from "framer-motion";
import { CardView } from "@/components/CardView";
import { StatusPanel } from "@/components/StatusPanel";
import { useBattleController } from "@/hooks/useBattleController";
import { SteamBackdrop } from "@/features/ui/SteamBackdrop";
import { useBattleStore } from "@/store/battleStore";
import { useEnemyStore } from "@/store/enemyStore";
import { useGameStore } from "@/store/gameStore";
import { usePlayerStore } from "@/store/playerStore";
import { useUiStore } from "@/store/uiStore";

export const BattleScreen = () => {
  const player = usePlayerStore();
  const enemy = useEnemyStore();
  const { selectedAttackerId, turn, onSelectAttacker, onTarget } = useBattleController();
  const log = useBattleStore((state) => state.log);
  const status = useUiStore((state) => state.status);
  const playCard = useGameStore((state) => state.playCard);
  const endTurn = useGameStore((state) => state.endTurn);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#3b2617_0%,#121114_30%,#050608_100%)] text-brass-50">
      <SteamBackdrop />
      <div className="relative mx-auto flex min-h-screen max-w-[1600px] flex-col gap-5 px-4 py-4 lg:px-8 lg:py-6">
        <section className="grid gap-4 lg:grid-cols-[360px_1fr_320px]">
          <StatusPanel
            name={enemy.name}
            structuralIntegrity={enemy.structuralIntegrity}
            steamPressure={enemy.steamPressure}
            maxSteamPressure={enemy.maxSteamPressure}
            shield={enemy.shield}
            side="enemy"
          />

          <div className="rounded-[2rem] border border-brass-700/30 bg-black/25 px-6 py-4 shadow-insetPanel backdrop-blur-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.45em] text-brass-100/50">Industrial Platform</p>
                <p className="font-display text-3xl">Pressure chamber engagement</p>
              </div>
              <div className="rounded-full border border-brass-200/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-brass-100/65">
                {turn === "player" ? "Your Turn" : turn === "enemy" ? "Enemy Turn" : "Resolving"}
              </div>
            </div>
            <p className="mt-3 text-sm text-brass-100/70">{status}</p>
          </div>

          <div className="rounded-[2rem] border border-brass-700/30 bg-black/25 p-4 shadow-insetPanel backdrop-blur-lg">
            <p className="mb-3 text-xs uppercase tracking-[0.4em] text-brass-100/55">Foundry Log</p>
            <div className="space-y-2">
              {log.map((entry, index) => (
                <motion.p key={`${entry}-${index}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl border border-brass-200/8 bg-white/5 px-3 py-2 text-sm text-brass-50/80">
                  {entry}
                </motion.p>
              ))}
            </div>
          </div>
        </section>

        <section className="grid flex-1 gap-5 lg:grid-rows-[1fr_auto_1fr]">
          <div className="rounded-[2rem] border border-brass-700/30 bg-black/20 p-4 shadow-insetPanel backdrop-blur-lg">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-brass-100/50">Upper Line</p>
                <p className="font-display text-2xl">Enemy Formation</p>
              </div>
              <button
                type="button"
                onClick={() => onTarget({ type: "player", id: "enemy-core", owner: "enemy" })}
                className="rounded-full border border-copper-400/30 bg-copper-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-copper-200 transition hover:bg-copper-400/20"
              >
                Direct Attack
              </button>
            </div>
            <div className="grid min-h-56 grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
              <AnimatePresence>
                {enemy.board.map((card) => (
                  <motion.div key={card.instanceId} layout initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
                    <CardView card={card} compact selectable={turn === "player" && !!selectedAttackerId} onClick={() => onTarget({ type: "card", id: card.instanceId, owner: "enemy" })} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[360px_1fr_360px]">
            <StatusPanel
              name={player.name}
              structuralIntegrity={player.structuralIntegrity}
              steamPressure={player.steamPressure}
              maxSteamPressure={player.maxSteamPressure}
              shield={player.shield}
              side="player"
            />

            <div className="rounded-[2rem] border border-brass-700/30 bg-gradient-to-r from-brass-950/60 via-black/25 to-smoke-900/60 px-6 py-5 shadow-insetPanel">
              <p className="text-xs uppercase tracking-[0.45em] text-brass-100/55">Command Core</p>
              <h2 className="font-display text-4xl">Steam and Steel</h2>
              <p className="mt-3 text-sm leading-relaxed text-brass-100/70">
                Select one of your deployed units on the lower line, then target an enemy unit or strike the enemy core directly.
              </p>
            </div>

            <div className="rounded-[2rem] border border-brass-700/30 bg-black/25 p-5 shadow-insetPanel backdrop-blur-lg">
              <p className="text-xs uppercase tracking-[0.4em] text-brass-100/55">Turn Control</p>
              <p className="mt-2 font-display text-3xl">Boiler Cycle</p>
              <button
                type="button"
                onClick={() => void endTurn()}
                disabled={turn !== "player"}
                className="mt-6 w-full rounded-[1.15rem] border border-brass-100/30 bg-gradient-to-r from-copper-500 to-brass-400 px-5 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-smoke-900 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                End Turn
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-brass-700/30 bg-black/20 p-4 shadow-insetPanel backdrop-blur-lg">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-brass-100/50">Lower Line</p>
                <p className="font-display text-2xl">Your Arsenal</p>
              </div>
              <button type="button" onClick={() => onTarget({ type: "player", id: "enemy-core", owner: "enemy" })} className="rounded-full border border-brass-200/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-brass-100/65">
                Strike Core
              </button>
            </div>

            <div className="mb-5 grid min-h-56 grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
              <AnimatePresence>
                {player.board.map((card) => (
                  <motion.div key={card.instanceId} layout initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
                    <CardView
                      card={card}
                      compact
                      selectable={turn === "player"}
                      selected={selectedAttackerId === card.instanceId}
                      disabled={turn !== "player" || card.hasActed}
                      onClick={() => onSelectAttacker(card.instanceId)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="rounded-[1.75rem] border border-brass-700/25 bg-black/25 p-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-brass-100/50">Commander Hand</p>
                  <p className="font-display text-2xl">Available Cards</p>
                </div>
                <p className="text-xs uppercase tracking-[0.28em] text-brass-100/55">Platform Capacity: {player.board.length}/5</p>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {player.hand.map((card, index) => (
                  <motion.div key={card.instanceId} initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                    <CardView
                      card={card}
                      selectable={turn === "player"}
                      disabled={turn !== "player" || player.board.length >= 5}
                      onClick={() => playCard("player", card.instanceId)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
