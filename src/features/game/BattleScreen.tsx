import { useState } from "react";
import { ActionLog } from "@/components/ActionLog";
import { BattleFeedback } from "@/components/BattleFeedback";
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

  const turnLabel = turn === "player" ? "Comandante" : turn === "enemy" ? "Automato" : "Resolucao";
  const latestEntry = logs[0];

  return (
    <GameLayout>
      <div className="grid min-h-[calc(100vh-2rem)] gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="order-2 grid auto-rows-min gap-4 xl:order-1">
          <section className="relative overflow-hidden rounded-[2.2rem] border border-[rgba(111,72,41,0.8)] bg-[radial-gradient(circle_at_top,rgba(238,180,104,0.09),transparent_28%),linear-gradient(180deg,rgba(119,77,44,0.96),rgba(101,64,35,0.98)_18%,rgba(90,56,31,0.98)_52%,rgba(73,45,27,1)_100%)] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.38)] sm:p-5">
            <BattleFeedback latestEntry={latestEntry} selectedAttackerId={selectedAttackerId} turn={turn} winner={winner} />
            <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_8%_16%,rgba(33,23,15,0.55)_0,transparent_9%),radial-gradient(circle_at_88%_20%,rgba(33,23,15,0.48)_0,transparent_8%),radial-gradient(circle_at_15%_82%,rgba(28,18,12,0.5)_0,transparent_8%),radial-gradient(circle_at_90%_78%,rgba(28,18,12,0.55)_0,transparent_9%)]" />
            <div className="pointer-events-none absolute inset-x-[5%] top-[19%] h-16 rounded-full bg-[radial-gradient(circle,rgba(44,24,12,0.28),transparent_70%)] blur-2xl" />
            <div className="pointer-events-none absolute inset-x-[5%] bottom-[17%] h-16 rounded-full bg-[radial-gradient(circle,rgba(44,24,12,0.24),transparent_70%)] blur-2xl" />

            <div className="relative z-10 grid gap-4 lg:grid-cols-[1fr_280px] lg:items-start">
              <div className="grid gap-4">
                <div className="grid gap-4 lg:grid-cols-[1fr_250px]">
                  <div className="rounded-[1.7rem] border border-black/20 bg-black/20 p-4 backdrop-blur-[2px]">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.38em] text-brass-100/55">Nucleo Inimigo</p>
                        <h2 className="font-display text-2xl sm:text-3xl text-brass-50">{enemy.name}</h2>
                      </div>
                      <div className="rounded-[1.1rem] border border-brass-100/12 bg-white/[0.05] px-4 py-2.5 text-right text-[10px] uppercase tracking-[0.26em] text-brass-100/58">
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

                <div className="relative rounded-[2rem] border border-[rgba(71,44,24,0.8)] bg-[linear-gradient(180deg,rgba(149,98,57,0.22),rgba(58,35,21,0.06))] p-4 shadow-[inset_0_1px_0_rgba(255,214,162,0.08)]">
                  <div className="pointer-events-none absolute left-4 right-4 top-[17.6rem] h-20 rounded-[1.8rem] border border-[rgba(65,41,23,0.8)] bg-[linear-gradient(180deg,rgba(70,43,25,0.95),rgba(43,25,16,1))] shadow-[inset_0_2px_0_rgba(255,216,172,0.05)]" />
                  <div className="pointer-events-none absolute left-[calc(50%-3rem)] top-[18.3rem] h-24 w-24 rounded-full border border-red-300/25 bg-[radial-gradient(circle,rgba(255,90,90,0.28),rgba(120,20,20,0.52),transparent_75%)] shadow-[0_0_30px_rgba(255,60,60,0.3)]" />
                  <div className="pointer-events-none absolute left-[calc(50%-1.2rem)] top-[20rem] h-14 w-[2.4rem] rounded-full bg-[linear-gradient(180deg,rgba(255,240,220,0.55),rgba(255,255,255,0))] blur-md" />
                  <div className="relative z-10">
                    <BoardRow title="Linha Superior" subtitle="Formacao Inimiga" cards={enemy.board} attackMode battlefield onCardClick={turn === "player" && selectedAttackerId ? (card) => onTarget({ type: "card", id: card.instanceId, owner: "enemy" }) : undefined} onCardHover={setHoveredCard} />

                    <div className="my-5 grid gap-4 lg:grid-cols-[1fr_290px_1fr] lg:items-center">
                      <div className="hidden lg:block" />
                      <div className="rounded-[1.5rem] border border-[rgba(74,46,28,0.9)] bg-[linear-gradient(180deg,rgba(58,34,21,0.95),rgba(35,20,12,0.98))] p-3.5 text-center shadow-[0_16px_34px_rgba(0,0,0,0.3)]">
                        <p className="text-[10px] uppercase tracking-[0.36em] text-brass-100/50">Ponte Central</p>
                        <p className="mt-1 font-display text-2xl text-brass-50">Canal de Impacto</p>
                        <p className="mt-2 text-xs leading-relaxed text-brass-100/70">{status}</p>
                        <div className="mt-3 grid gap-2">
                          <EndTurnButton disabled={turn !== "player"} onClick={endTurn} />
                          <button type="button" onClick={() => onTarget({ type: "player", id: enemy.id, owner: "enemy" })} disabled={turn !== "player" || !selectedAttackerId} className="w-full rounded-[1rem] border border-brass-100/12 bg-white/5 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-brass-50 disabled:opacity-40">
                            Ataque Direto
                          </button>
                        </div>
                      </div>
                      <div className="hidden lg:flex justify-end">
                        <div className="rounded-[1.25rem] border border-black/20 bg-black/15 px-4 py-3 text-right text-[10px] uppercase tracking-[0.28em] text-brass-100/55">
                          Jogador ativo
                          <div className="mt-1 text-lg font-semibold tracking-normal text-brass-50">{turnLabel}</div>
                        </div>
                      </div>
                    </div>

                    <BoardRow title="Linha Inferior" subtitle="Sua Formacao" cards={player.board} selectedId={selectedAttackerId} battlefield onCardClick={turn === "player" ? (card) => onSelectAttacker(card.instanceId) : undefined} onCardHover={setHoveredCard} />
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_290px]">
                  <div className="rounded-[1.7rem] border border-black/20 bg-black/20 p-4 backdrop-blur-[2px]">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.38em] text-brass-100/55">Seu Nucleo</p>
                        <h2 className="font-display text-2xl sm:text-3xl text-brass-50">{player.name}</h2>
                      </div>
                      <div className="rounded-[1.1rem] border border-brass-100/12 bg-white/[0.05] px-4 py-2.5 text-right text-[10px] uppercase tracking-[0.26em] text-brass-100/58">
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
                </div>

                <HandArea cards={player.hand} battlefield disabled={turn !== "player" || player.board.length >= 5} onPlay={(card) => playCard("player", card.instanceId)} onCardHover={setHoveredCard} />
              </div>

              <aside className="grid auto-rows-min gap-4">
                <div className="rounded-[1.6rem] border border-black/20 bg-black/20 p-4 backdrop-blur-[2px]">
                  <p className="text-[10px] uppercase tracking-[0.34em] text-brass-100/52">Painel Tatico</p>
                  <p className="mt-1 font-display text-lg sm:text-xl text-brass-50">Leituras da Arena</p>
                  <div className="mt-3 space-y-2.5 text-xs leading-relaxed text-brass-100/72">
                    <p>Jogador ativo: {turnLabel}</p>
                    <p>Overpressure inimigo: {enemy.overpressure}</p>
                    <p>Capacidade da plataforma: {player.board.length}/5</p>
                    <p>Estado final: {winner ?? screen}</p>
                  </div>
                </div>
                <ActionLog entries={logs} />
                <div className="lg:hidden">
                  <CardTooltip card={hoveredCard} />
                </div>
              </aside>
            </div>
          </section>
        </div>
      </div>

      {screen === "victory" ? <VictoryModal onPlayAgain={startGame} onBackToMenu={() => setScreen("menu")} /> : null}
      {screen === "defeat" ? <DefeatModal onPlayAgain={startGame} onBackToMenu={() => setScreen("menu")} /> : null}
    </GameLayout>
  );
};
