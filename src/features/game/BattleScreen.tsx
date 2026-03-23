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
      <div className="grid min-h-[calc(100vh-2rem)] gap-5 xl:grid-cols-[1fr_320px]">
        <div className="grid gap-5">
          <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[2.3rem] border border-brass-500/16 bg-black/28 p-5 shadow-copper backdrop-blur-xl">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.45em] text-brass-100/50">Nucleo Inimigo</p>
                  <h2 className="font-display text-4xl text-brass-50">{enemy.name}</h2>
                </div>
                <div className="rounded-[1.4rem] border border-brass-100/12 bg-white/[0.04] px-4 py-3 text-right text-xs uppercase tracking-[0.3em] text-brass-100/60">
                  Mao Inimiga
                  <div className="mt-2 text-2xl font-semibold tracking-normal text-brass-50">{enemy.hand.length}</div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <StructuralIntegrityDisplay value={enemy.structuralIntegrity} max={enemy.maxStructuralIntegrity} />
                <SteamPressureDisplay value={enemy.steamPressure} max={enemy.maxSteamPressure} />
              </div>
            </div>

            <TurnIndicator turn={turn} turnNumber={turnNumber} />
          </section>

          <BoardRow title="Linha Superior" subtitle="Formacao Inimiga" cards={enemy.board} attackMode onCardClick={turn === "player" && selectedAttackerId ? (card) => onTarget({ type: "card", id: card.instanceId, owner: "enemy" }) : undefined} onCardHover={setHoveredCard} />

          <section className="rounded-[2.2rem] border border-brass-700/30 bg-[radial-gradient(circle_at_center,rgba(216,138,99,0.08),transparent_48%),linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.3))] p-5 shadow-insetPanel backdrop-blur-xl">
            <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:items-center">
              <div>
                <p className="text-[11px] uppercase tracking-[0.4em] text-brass-100/50">Plataforma Industrial</p>
                <h3 className="mt-2 font-display text-4xl text-brass-50">Camara de guerra mecanica</h3>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-brass-100/70">{status}</p>
              </div>
              <div className="rounded-[1.8rem] border border-copper-400/15 bg-black/30 p-4">
                <EndTurnButton disabled={turn !== "player"} onClick={endTurn} />
                <button type="button" onClick={() => onTarget({ type: "player", id: enemy.id, owner: "enemy" })} disabled={turn !== "player" || !selectedAttackerId} className="mt-3 w-full rounded-[1.2rem] border border-brass-100/12 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-brass-50 disabled:opacity-40">
                  Ataque Direto
                </button>
              </div>
            </div>
            <div className="mt-5 h-16 rounded-[1.6rem] border border-brass-200/8 bg-[linear-gradient(90deg,rgba(255,255,255,0.02),rgba(216,138,99,0.08),rgba(255,255,255,0.02))]" />
          </section>

          <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[2.3rem] border border-brass-500/16 bg-black/28 p-5 shadow-copper backdrop-blur-xl">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.45em] text-brass-100/50">Seu Nucleo</p>
                  <h2 className="font-display text-4xl text-brass-50">{player.name}</h2>
                </div>
                <div className="rounded-[1.4rem] border border-brass-100/12 bg-white/[0.04] px-4 py-3 text-right text-xs uppercase tracking-[0.3em] text-brass-100/60">
                  Mao Atual
                  <div className="mt-2 text-2xl font-semibold tracking-normal text-brass-50">{player.hand.length}</div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <StructuralIntegrityDisplay value={player.structuralIntegrity} max={player.maxStructuralIntegrity} />
                <SteamPressureDisplay value={player.steamPressure} max={player.maxSteamPressure} />
              </div>
            </div>

            <div className="grid gap-4">
              <OverpressureGauge value={player.overpressure} />
              <CardTooltip card={hoveredCard} />
            </div>
          </section>

          <BoardRow title="Linha Inferior" subtitle="Sua Formacao" cards={player.board} selectedId={selectedAttackerId} onCardClick={turn === "player" ? (card) => onSelectAttacker(card.instanceId) : undefined} onCardHover={setHoveredCard} />

          <HandArea cards={player.hand} disabled={turn !== "player" || player.board.length >= 5} onPlay={(card) => playCard("player", card.instanceId)} onCardHover={setHoveredCard} />
        </div>

        <aside className="grid gap-5">
          <ActionLog entries={logs} />
          <div className="rounded-[2rem] border border-brass-700/30 bg-black/30 p-4 shadow-insetPanel backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-[0.36em] text-brass-100/52">Painel Tatico</p>
            <p className="mt-2 font-display text-2xl text-brass-50">Leituras da Caldeira</p>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-brass-100/70">
              <p>Jogador ativo: {turn === "player" ? "Comandante" : turn === "enemy" ? "Automato" : "Resolucao"}</p>
              <p>Overpressure inimigo: {enemy.overpressure}</p>
              <p>Capacidade da plataforma: {player.board.length}/5</p>
              <p>Estado final: {winner ?? screen}</p>
            </div>
          </div>
        </aside>
      </div>

      {screen === "victory" ? <VictoryModal onPlayAgain={startGame} onBackToMenu={() => setScreen("menu")} /> : null}
      {screen === "defeat" ? <DefeatModal onPlayAgain={startGame} onBackToMenu={() => setScreen("menu")} /> : null}
    </GameLayout>
  );
};