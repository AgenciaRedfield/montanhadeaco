import { useState } from "react";
import { ActionLog } from "@/components/ActionLog";
import { BoardRow } from "@/components/BoardRow";
import { CardTooltip } from "@/components/CardTooltip";
import { DefeatModal } from "@/components/DefeatModal";
import { EndTurnButton } from "@/components/EndTurnButton";
import { HandArea } from "@/components/HandArea";
import { OverpressureGauge } from "@/components/OverpressureGauge";
import { SteamPressureDisplay } from "@/components/SteamPressureDisplay";
import { StructuralIntegrityDisplay } from "@/components/StructuralIntegrityDisplay";
import { TurnIndicator } from "@/components/TurnIndicator";
import { VictoryModal } from "@/components/VictoryModal";
import { useBattleController } from "@/hooks/useBattleController";
import { GameLayout } from "@/features/game/GameLayout";
import { useGameStore } from "@/store/gameStore";
import type { GameCard } from "@/types/game";

export const BattleScreen = () => {
  const player = useGameStore((state) => state.player);
  const enemy = useGameStore((state) => state.enemy);
  const logs = useGameStore((state) => state.battle.logs);
  const winner = useGameStore((state) => state.battle.winner);
  const status = useGameStore((state) => state.ui.status);
  const screen = useGameStore((state) => state.ui.screen);
  const setScreen = useGameStore((state) => state.setScreen);
  const playCard = useGameStore((state) => state.playCard);
  const endTurn = useGameStore((state) => state.endTurn);
  const startGame = useGameStore((state) => state.startGame);
  const turnNumber = useGameStore((state) => state.turnNumber);
  const { selectedAttackerId, turn, onSelectAttacker, onTarget } = useBattleController();
  const [hoveredCard, setHoveredCard] = useState<GameCard | null>(null);

  return (
    <GameLayout>
      <div className="grid min-h-[calc(100vh-2rem)] gap-4 xl:grid-cols-[1fr_290px]">
        <div className="grid auto-rows-min gap-4 order-2 xl:order-1">
          <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
              <div className="rounded-[1.7rem] border border-brass-500/16 bg-black/28 p-4 shadow-copper backdrop-blur-xl">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.38em] text-brass-100/48">Nucleo Inimigo</p>
                    <h2 className="font-display text-2xl sm:text-3xl text-brass-50">{enemy.name}</h2>
                  </div>
                  <div className="rounded-[1.1rem] border border-brass-100/12 bg-white/[0.04] px-4 py-2.5 text-right text-[10px] uppercase tracking-[0.26em] text-brass-100/58">
                    Mao Inimiga
                    <div className="mt-1 text-xl font-semibold tracking-normal text-brass-50">{enemy.hand.length}</div>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <StructuralIntegrityDisplay value={enemy.structuralIntegrity} max={enemy.maxStructuralIntegrity} />
                  <SteamPressureDisplay value={enemy.steamPressure} max={enemy.maxSteamPressure} />
                </div>
              </div>

              <TurnIndicator turn={turn} turnNumber={turnNumber} />
            </div>
            <div className="hidden lg:block">
              <ActionLog entries={logs} />
            </div>
          </section>

          <BoardRow title="Linha Superior" subtitle="Formacao Inimiga" cards={enemy.board} attackMode onCardClick={turn === "player" && selectedAttackerId ? (card) => onTarget({ type: "card", id: card.instanceId, owner: "enemy" }) : undefined} onCardHover={setHoveredCard} />

          <section className="rounded-[1.7rem] border border-brass-700/30 bg-[radial-gradient(circle_at_center,rgba(216,138,99,0.08),transparent_48%),linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.3))] p-4 shadow-insetPanel backdrop-blur-xl">
            <div className="grid gap-4 lg:grid-cols-[1fr_280px] lg:items-center">
              <div>
                <p className="text-[10px] uppercase tracking-[0.36em] text-brass-100/50">Plataforma Industrial</p>
                <h3 className="mt-1 font-display text-2xl sm:text-3xl text-brass-50">Arena de combate</h3>
                <p className="mt-2 max-w-3xl text-xs leading-relaxed text-brass-100/68">{status}</p>
              </div>
              <div className="rounded-[1.35rem] border border-copper-400/15 bg-black/30 p-3">
                <EndTurnButton disabled={turn !== "player"} onClick={endTurn} />
                <button type="button" onClick={() => onTarget({ type: "player", id: enemy.id, owner: "enemy" })} disabled={turn !== "player" || !selectedAttackerId} className="mt-2.5 w-full rounded-[1rem] border border-brass-100/12 bg-white/5 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-brass-50 disabled:opacity-40">
                  Ataque Direto
                </button>
              </div>
            </div>
            <div className="mt-4 h-8 sm:h-10 rounded-[1.2rem] border border-brass-200/8 bg-[linear-gradient(90deg,rgba(255,255,255,0.02),rgba(216,138,99,0.08),rgba(255,255,255,0.02))]" />
          </section>

          <section className="grid gap-4 lg:grid-cols-[1fr_290px]">
            <div className="rounded-[1.7rem] border border-brass-500/16 bg-black/28 p-4 shadow-copper backdrop-blur-xl">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.38em] text-brass-100/48">Seu Nucleo</p>
                  <h2 className="font-display text-2xl sm:text-3xl text-brass-50">{player.name}</h2>
                </div>
                <div className="rounded-[1.1rem] border border-brass-100/12 bg-white/[0.04] px-4 py-2.5 text-right text-[10px] uppercase tracking-[0.26em] text-brass-100/58">
                  Mao Atual
                  <div className="mt-1 text-xl font-semibold tracking-normal text-brass-50">{player.hand.length}</div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <StructuralIntegrityDisplay value={player.structuralIntegrity} max={player.maxStructuralIntegrity} />
                <SteamPressureDisplay value={player.steamPressure} max={player.maxSteamPressure} />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-rows-[auto_1fr]">
              <OverpressureGauge value={player.overpressure} />
              <div className="hidden lg:block">
                <CardTooltip card={hoveredCard} />
              </div>
            </div>
          </section>

          <BoardRow title="Linha Inferior" subtitle="Sua Formacao" cards={player.board} selectedId={selectedAttackerId} onCardClick={turn === "player" ? (card) => onSelectAttacker(card.instanceId) : undefined} onCardHover={setHoveredCard} />

          <HandArea cards={player.hand} disabled={turn !== "player" || player.board.length >= 5} onPlay={(card) => playCard("player", card.instanceId)} onCardHover={setHoveredCard} />
        </div>

        <aside className="grid auto-rows-min gap-4 order-1 xl:order-2">
          <div className="rounded-[1.6rem] border border-brass-700/30 bg-black/30 p-4 shadow-insetPanel backdrop-blur-xl">
            <p className="text-[10px] uppercase tracking-[0.34em] text-brass-100/52">Painel Tatico</p>
            <p className="mt-1 font-display text-lg sm:text-xl text-brass-50">Leituras da Caldeira</p>
            <div className="mt-3 space-y-2.5 text-xs leading-relaxed text-brass-100/70">
              <p>Jogador ativo: {turn === "player" ? "Comandante" : turn === "enemy" ? "Automato" : "Resolucao"}</p>
              <p>Overpressure inimigo: {enemy.overpressure}</p>
              <p>Capacidade da plataforma: {player.board.length}/5</p>
              <p>Estado final: {winner ?? screen}</p>
            </div>
          </div>
          <div className="lg:hidden">
            <ActionLog entries={logs} />
          </div>
          <div className="lg:hidden">
            <CardTooltip card={hoveredCard} />
          </div>
        </aside>
      </div>

      {screen === "victory" ? <VictoryModal onPlayAgain={startGame} onBackToMenu={() => setScreen("menu")} /> : null}
      {screen === "defeat" ? <DefeatModal onPlayAgain={startGame} onBackToMenu={() => setScreen("menu")} /> : null}
    </GameLayout>
  );
};
