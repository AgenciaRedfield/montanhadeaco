import { useState } from "react";
import { ActionLog } from "@/components/ActionLog";
import { BattleFeedback } from "@/components/BattleFeedback";
import { BoardRow } from "@/components/BoardRow";
import { CardTooltip } from "@/components/CardTooltip";
import { CardLoreModal } from "@/components/CardLoreModal";
import { BattleTutorialPanel } from "@/components/BattleTutorialPanel";
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
import { getTutorialState } from "@/features/game/tutorial";
import { useGameStore } from "@/store/gameStore";
import { VFXController, useScreenShake } from "@/components/VFXController";
import type { GameCard } from "@/types/game";

const highlightFrame = (active: boolean) =>
  active
    ? "rounded-[2rem] ring-2 ring-copper-200/70 ring-offset-2 ring-offset-black/0 shadow-[0_0_0_1px_rgba(255,220,170,0.12),0_0_34px_rgba(216,138,99,0.22)] transition"
    : "transition";

export const BattleScreen = () => {
  const player = useGameStore((state) => state.player);
  const enemy = useGameStore((state) => state.enemy);
  const profile = useGameStore((state) => state.profile);
  const logs = useGameStore((state) => state.battle.logs);
  const winner = useGameStore((state) => state.battle.winner);
  const status = useGameStore((state) => state.ui.status);
  const screen = useGameStore((state) => state.ui.screen);
  const setScreen = useGameStore((state) => state.setScreen);
  const setStatus = useGameStore((state) => state.setStatus);
  const playCard = useGameStore((state) => state.playCard);
  const endTurn = useGameStore((state) => state.endTurn);
  const startGame = useGameStore((state) => state.startGame);
  const turnNumber = useGameStore((state) => state.turnNumber);
  const { selectedAttackerId, turn, onSelectAttacker, onTarget } = useBattleController();
  const [hoveredCard, setHoveredCard] = useState<GameCard | null>(null);
  const [inspectingCard, setInspectingCard] = useState<GameCard | null>(null);
  const isShaking = useScreenShake();

  const turnLabel = turn === "player" ? "Comandante" : turn === "enemy" ? "Automato" : "Resolucao";
  const latestEntry = logs[0];
  const tutorialBattle = profile.battlesPlayed <= 2 ? profile.battlesPlayed : 0;
  const tutorial = getTutorialState(tutorialBattle, player, enemy, turn, selectedAttackerId, logs);

  const blockTutorialAction = () => {
    if (tutorial.step !== "none") {
      setStatus(tutorial.lockMessage);
      return true;
    }
    return false;
  };

  const handlePlayCard = (card: GameCard) => {
    if (["play_card", "spend_steam", "tutorial1_complete", "tutorial2_complete", "none"].includes(tutorial.step)) {
      playCard("player", card.instanceId);
      return;
    }
    blockTutorialAction();
  };

  const handleSelectAttacker = (card: GameCard) => {
    if (["select_attacker", "read_board", "choose_target", "select_attack", "tutorial1_complete", "tutorial2_complete", "none"].includes(tutorial.step)) {
      onSelectAttacker(card.instanceId);
      return;
    }
    blockTutorialAction();
  };

  const handleTarget = (target: { type: "player" | "card"; id: string; owner: "player" | "enemy" }) => {
    if (["choose_target", "select_attack", "tutorial1_complete", "tutorial2_complete", "none"].includes(tutorial.step)) {
      onTarget(target);
      return;
    }
    blockTutorialAction();
  };

  const handleEndTurn = () => {
    if (["end_turn", "finish_turn", "tutorial1_complete", "tutorial2_complete", "none"].includes(tutorial.step)) {
      endTurn();
      return;
    }
    blockTutorialAction();
  };

  const directAttackAllowed = ["choose_target", "select_attack", "tutorial1_complete", "tutorial2_complete", "none"].includes(tutorial.step);

  return (
    <GameLayout>
      {/* ── LAYOUT PRINCIPAL: arena + painel lateral ── */}
      <div className="flex min-h-[calc(100vh-7rem)] gap-3 lg:gap-4">

        {/* ════════════════════════════════════
            ARENA PRINCIPAL
        ════════════════════════════════════ */}
        <motion.div 
          animate={isShaking ? { x: [-4, 4, -4, 4, 0], y: [-2, 2, -2, 2, 0] } : {}}
          transition={{ duration: 0.35 }}
          className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[2.4rem] border border-[rgba(80,50,25,0.7)] shadow-[0_30px_90px_rgba(0,0,0,0.5)]"
        >
          <BattleFeedback latestEntry={latestEntry} selectedAttackerId={selectedAttackerId} turn={turn} winner={winner} />
          <VFXController />

          {/* ── ZONA DO INIMIGO (vermelho/escuro) ── */}
          <div className="relative flex-shrink-0 bg-[linear-gradient(180deg,rgba(120,20,20,0.82)_0%,rgba(80,25,15,0.88)_60%,rgba(60,20,12,0.92)_100%)] pb-2 pt-3 px-4">
            {/* Textura de grade sutil */}
            <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,100,100,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,100,100,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />

            {/* Header inimigo */}
            <div className="relative z-10 mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Avatar / ícone inimigo */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-red-400/40 bg-red-900/60 shadow-[0_0_16px_rgba(255,60,60,0.3)]">
                  <span className="text-lg">⚙️</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.38em] text-red-200/60">Nucleo Inimigo</p>
                  <h2 className="font-display text-xl text-red-50">{enemy.name}</h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Overpressure inimigo */}
                <div className={`rounded-[1rem] border px-3 py-2 text-center ${
                  enemy.overpressure >= 5
                    ? "border-orange-400/50 bg-orange-950/60 shadow-[0_0_14px_rgba(251,146,60,0.3)]"
                    : enemy.overpressure > 0
                    ? "border-orange-600/30 bg-orange-950/30"
                    : "border-red-200/10 bg-red-950/20"
                }`}>
                  <p className="text-[9px] uppercase tracking-[0.22em] text-orange-200/60">Ovpr.</p>
                  <p className={`text-base font-bold ${
                    enemy.overpressure >= 5 ? "text-orange-300" : enemy.overpressure > 0 ? "text-orange-400/80" : "text-red-200/40"
                  }`}>{enemy.overpressure}</p>
                </div>
                <div className="rounded-[1rem] border border-red-200/15 bg-red-950/40 px-3 py-2 text-center">
                  <p className="text-[9px] uppercase tracking-[0.26em] text-red-200/55">Mao</p>
                  <p className="text-base font-bold text-red-100">{enemy.hand.length}</p>
                </div>
                <div className="w-36 space-y-1.5">
                  <StructuralIntegrityDisplay value={enemy.structuralIntegrity} max={enemy.maxStructuralIntegrity} />
                  <SteamPressureDisplay value={enemy.steamPressure} max={enemy.maxSteamPressure} />
                </div>
              </div>
            </div>

            {/* Linha do campo inimigo */}
            <div className={`relative z-10 ${highlightFrame(tutorial.highlights.enemyBoard)}`}>
              <BoardRow
                title="Linha Superior"
                subtitle="Formacao Inimiga"
                cards={enemy.board}
                attackMode
                battlefield
                highlightTargets={turn === "player" && !!selectedAttackerId}
                onCardClick={
                  turn === "player" && selectedAttackerId
                    ? (card) => handleTarget({ type: "card", id: card.instanceId, owner: "enemy" })
                    : undefined
                }
                onCardHover={setHoveredCard}
                onInspect={setInspectingCard}
              />
            </div>
          </div>

          {/* ── FAIXA CENTRAL — Canal de Impacto ── */}
          <div className={`relative flex-shrink-0 ${highlightFrame(tutorial.highlights.endTurn || tutorial.highlights.directAttack)}`}>
            {/* Fundo metálico da faixa */}
            <div className="relative z-10 flex items-center justify-between gap-3 border-y border-[rgba(90,55,25,0.8)] bg-[linear-gradient(90deg,rgba(50,28,15,0.98),rgba(70,42,22,0.98),rgba(50,28,15,0.98))] px-5 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,210,140,0.06)]">
              {/* Ornamento esquerdo */}
              <div className="flex items-center gap-3">
                <div className="h-8 w-[2px] rounded-full bg-gradient-to-b from-brass-300/60 to-transparent" />
                <div>
                  <p className="text-[9px] uppercase tracking-[0.36em] text-brass-100/50">Ponte Central</p>
                  <p className="font-display text-base text-brass-50">Canal de Impacto</p>
                </div>
              </div>

              {/* Painel de ações centrais */}
              <div className="flex items-center gap-2">
                <p className="max-w-[180px] text-center text-[10px] leading-relaxed text-brass-100/65">{status}</p>
                <div className="flex flex-col gap-1.5">
                  <EndTurnButton disabled={turn !== "player"} onClick={handleEndTurn} />
                  <button
                    type="button"
                    onClick={() => handleTarget({ type: "player", id: enemy.id, owner: "enemy" })}
                    disabled={turn !== "player" || !selectedAttackerId || !directAttackAllowed}
                    className={`w-full rounded-[0.8rem] border border-brass-100/12 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.28em] text-brass-50 transition disabled:opacity-40 ${tutorial.highlights.directAttack ? "bg-copper-300/18 shadow-[0_0_20px_rgba(216,138,99,0.24)]" : "bg-white/5 hover:bg-white/10"}`}
                  >
                    ⚡ Ataque Direto
                  </button>
                </div>
              </div>

              {/* Indicador de turno direito */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-[0.36em] text-brass-100/50">Jogador Ativo</p>
                  <p className={`font-display text-base ${turn === "player" ? "text-emerald-300" : "text-red-300"}`}>{turnLabel}</p>
                </div>
                <div className="h-8 w-[2px] rounded-full bg-gradient-to-b from-brass-300/60 to-transparent" />
              </div>
            </div>

            {/* Símbolo central decorativo (pokébola style) */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full border-2 border-brass-400/20 bg-[radial-gradient(circle,rgba(216,138,99,0.18),transparent_65%)] shadow-[0_0_30px_rgba(216,138,99,0.15)]" />
            </div>
          </div>

          {/* ── ZONA DO JOGADOR (azul/escuro) ── */}
          <div className="relative flex flex-1 flex-col bg-[linear-gradient(180deg,rgba(15,35,80,0.92)_0%,rgba(12,28,65,0.88)_50%,rgba(8,20,50,0.95)_100%)] px-4 pb-3 pt-2">
            {/* Textura de grade sutil */}
            <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(100,140,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(100,140,255,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />

            {/* Linha do campo do jogador */}
            <div className={`relative z-10 mb-2 ${highlightFrame(tutorial.highlights.playerBoard)}`}>
              <BoardRow
                title="Linha Inferior"
                subtitle="Sua Formacao"
                cards={player.board}
                selectedId={selectedAttackerId}
                battlefield
                onCardClick={turn === "player" ? handleSelectAttacker : undefined}
                onCardHover={setHoveredCard}
                onInspect={setInspectingCard}
              />
            </div>

            {/* Header do jogador */}
            <div className="relative z-10 mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Avatar jogador */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-sky-400/40 bg-sky-900/60 shadow-[0_0_16px_rgba(56,189,248,0.3)]">
                  <span className="text-lg">🛡️</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.38em] text-sky-200/60">Seu Nucleo</p>
                  <h2 className="font-display text-xl text-sky-50">{player.name}</h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-36 space-y-1.5">
                  <StructuralIntegrityDisplay value={player.structuralIntegrity} max={player.maxStructuralIntegrity} />
                  <SteamPressureDisplay value={player.steamPressure} max={player.maxSteamPressure} />
                </div>
                <div className="rounded-[1rem] border border-sky-200/15 bg-sky-950/40 px-3 py-2 text-center">
                  <p className="text-[9px] uppercase tracking-[0.26em] text-sky-200/55">Mao</p>
                  <p className="text-base font-bold text-sky-100">{player.hand.length}</p>
                </div>
              </div>
            </div>

            {/* Mão do jogador */}
            <div className={`relative z-10 ${highlightFrame(tutorial.highlights.hand)}`}>
              <HandArea
                cards={player.hand}
                battlefield
                disabled={turn !== "player" || player.board.length >= 5}
                onPlay={handlePlayCard}
                onCardHover={setHoveredCard}
                onInspect={setInspectingCard}
              />
            </div>
          </div>
        </motion.div>

        {/* ════════════════════════════════════
            PAINEL LATERAL DIREITO
        ════════════════════════════════════ */}
        <aside className="flex w-[280px] flex-shrink-0 flex-col gap-3 xl:w-[300px]">
          {/* Indicador de turno */}
          <TurnIndicator turn={turn} turnNumber={turnNumber} />

          {/* Tutorial */}
          <BattleTutorialPanel tutorial={tutorial} />

          {/* Overpressure — dois jogadores lado a lado */}
          <div className="rounded-[1.6rem] border border-black/30 bg-black/30 p-3 backdrop-blur-md">
            <p className="mb-2 text-[9px] uppercase tracking-[0.36em] text-brass-100/50">Sobrepressao</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="mb-1 text-[8px] uppercase tracking-[0.24em] text-sky-200/55">Jogador</p>
                <OverpressureGauge value={player.overpressure} />
              </div>
              <div>
                <p className="mb-1 text-[8px] uppercase tracking-[0.24em] text-red-200/55">Inimigo</p>
                <OverpressureGauge value={enemy.overpressure} />
              </div>
            </div>
          </div>

          {/* Painel tático compacto */}
          <div className="rounded-[1.6rem] border border-black/20 bg-black/20 p-4 backdrop-blur-[2px]">
            <p className="text-[10px] uppercase tracking-[0.34em] text-brass-100/52">Painel Tatico</p>
            <p className="mt-1 font-display text-lg text-brass-50">Leituras da Arena</p>
            <div className="mt-3 space-y-2 text-xs leading-relaxed text-brass-100/72">
              <div className="flex justify-between">
                <span>Jogador ativo</span>
                <span className={`font-semibold ${turn === "player" ? "text-emerald-300" : "text-red-300"}`}>{turnLabel}</span>
              </div>
              <div className="flex justify-between">
                <span>Deck inimigo</span>
                <span className="font-semibold text-brass-200">{enemy.deck.length} cartas</span>
              </div>
              <div className="flex justify-between">
                <span>Plataforma jogador</span>
                <span className="font-semibold text-brass-200">{player.board.length}/5</span>
              </div>
              <div className="flex justify-between">
                <span>Plataforma inimiga</span>
                <span className="font-semibold text-red-200/80">{enemy.board.length}/5</span>
              </div>
              <div className="flex justify-between">
                <span>Turno</span>
                <span className="font-semibold text-brass-300">{turnNumber}</span>
              </div>
            </div>
          </div>

          {/* Log de ações */}
          <div className="min-h-0 flex-1">
            <ActionLog entries={logs} />
          </div>

          {/* Tooltip da carta (desktop) */}
          <div className="hidden lg:block">
            <CardTooltip card={hoveredCard} />
          </div>
        </aside>
      </div>

      {/* Tooltip mobile */}
      <div className="mt-3 lg:hidden">
        <CardTooltip card={hoveredCard} />
      </div>

      {screen === "victory" ? <VictoryModal onPlayAgain={startGame} onBackToMenu={() => setScreen("menu")} /> : null}
      {screen === "defeat" ? <DefeatModal onPlayAgain={startGame} onBackToMenu={() => setScreen("menu")} /> : null}
      {inspectingCard ? <CardLoreModal card={inspectingCard} onClose={() => setInspectingCard(null)} /> : null}
    </GameLayout>
  );
};
