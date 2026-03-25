import { canDirectAttack, canUnitAttack } from "@/utils/combat";
import type { PlayerState, TurnPhase } from "@/types/game";

export type TutorialStep =
  | "none"
  | "play_card"
  | "end_turn"
  | "observe_enemy"
  | "select_attacker"
  | "choose_target"
  | "tutorial1_complete"
  | "spend_steam"
  | "read_board"
  | "select_attack"
  | "finish_turn"
  | "tutorial2_complete";

export type TutorialState = {
  battleNumber: number;
  step: TutorialStep;
  title: string;
  subtitle: string;
  narrator: string;
  message: string;
  lockMessage: string;
  checklist: string[];
  highlights: {
    hand: boolean;
    playerBoard: boolean;
    enemyBoard: boolean;
    endTurn: boolean;
    directAttack: boolean;
  };
};

const hasAnyAttack = (cards: PlayerState["board"] | PlayerState["graveyard"]) => cards.some((card) => card.attackCount > 0);

const withCheck = (done: boolean, text: string) => `${done ? "[x]" : "[ ]"} ${text}`;

export const getTutorialState = (
  battleNumber: number,
  player: PlayerState,
  enemy: PlayerState,
  turn: TurnPhase,
  selectedAttackerId: string | null,
  logs: string[],
): TutorialState => {
  if (battleNumber < 1 || battleNumber > 2) {
    return {
      battleNumber: 0,
      step: "none",
      title: "",
      subtitle: "",
      narrator: "",
      message: "",
      lockMessage: "",
      checklist: [],
      highlights: { hand: false, playerBoard: false, enemyBoard: false, endTurn: false, directAttack: false },
    };
  }

  const playedCard = logs.some((entry) => entry.includes("mobiliza") && entry.includes(player.name));
  const attackedAlready = hasAnyAttack(player.board) || hasAnyAttack(player.graveyard);
  const selectedCard = player.board.find((card) => card.instanceId === selectedAttackerId) ?? null;
  const playerCanAttack = player.board.some((card) => canUnitAttack(card));
  const directAttackOpen = canDirectAttack(enemy.board);
  const spentSteam = player.steamPressure < player.maxSteamPressure;
  const sawEnemyTurn = turn === "enemy" || turn === "resolving" || logs.some((entry) => entry.includes(enemy.name));

  if (battleNumber === 1) {
    let step: TutorialStep = "tutorial1_complete";
    let message = "Boa. Agora voce ja conhece o fluxo basico da arena.";
    let lockMessage = "O treinamento pede para concluir o ciclo basico antes de seguir.";
    let highlights = { hand: false, playerBoard: false, enemyBoard: false, endTurn: false, directAttack: false };

    if (!playedCard) {
      step = "play_card";
      message = "Instrutora Lyra: primeiro, mobilize uma carta da sua mao. Ela vai descer para a sua linha de combate.";
      lockMessage = "Comece jogando uma carta da mao para aprender a mobilizacao.";
      highlights = { ...highlights, hand: true };
    } else if (!sawEnemyTurn && turn === "player") {
      step = "end_turn";
      message = "Instrutora Lyra: unidade recem-mobilizada ainda nao ataca. Agora encerre o turno para ver a resposta do Automato.";
      lockMessage = "Agora o proximo passo e encerrar o turno para observar a troca de iniciativa.";
      highlights = { ...highlights, endTurn: true };
    } else if (turn !== "player") {
      step = "observe_enemy";
      message = "Instrutora Lyra: observe o campo. O inimigo compra, gasta pressao e tenta pressionar sua linha.";
      lockMessage = "Aguarde o turno inimigo terminar para continuar o treinamento.";
    } else if (!attackedAlready && playerCanAttack && !selectedCard) {
      step = "select_attacker";
      message = "Instrutora Lyra: agora escolha uma das suas unidades prontas para atacar. Clique nela para armar o golpe.";
      lockMessage = "Selecione uma unidade pronta na sua linha antes de tentar qualquer outra acao.";
      highlights = { ...highlights, playerBoard: true };
    } else if (!attackedAlready && selectedCard) {
      step = "choose_target";
      message = directAttackOpen
        ? "Instrutora Lyra: o caminho esta livre. Se quiser, voce ja pode atingir o nucleo inimigo direto."
        : "Instrutora Lyra: com a unidade selecionada, clique em um alvo inimigo na linha superior.";
      lockMessage = directAttackOpen
        ? "Finalize o passo escolhendo um alvo: unidade inimiga ou o ataque direto ao nucleo."
        : "Agora escolha o alvo inimigo para concluir o primeiro ataque do tutorial.";
      highlights = { ...highlights, enemyBoard: !directAttackOpen, directAttack: directAttackOpen };
    }

    return {
      battleNumber,
      step,
      title: "Treinamento 1 de 2",
      subtitle: "Fundamentos da plataforma",
      narrator: "Instrutora Lyra",
      message,
      lockMessage,
      checklist: [
        withCheck(playedCard, "Mobilizar uma carta da mao"),
        withCheck(sawEnemyTurn, "Observar a troca de turnos"),
        withCheck(attackedAlready, "Realizar o primeiro ataque"),
      ],
      highlights,
    };
  }

  let step: TutorialStep = "tutorial2_complete";
  let message = "Instrutora Lyra: agora voce ja pode improvisar melhor. Leia a mesa e escolha a linha de maior valor.";
  let lockMessage = "O tutorial ainda quer que voce feche esse ciclo tatico.";
  let highlights = { hand: false, playerBoard: false, enemyBoard: false, endTurn: false, directAttack: false };

  if (!spentSteam && turn === "player") {
    step = "spend_steam";
    message = "Instrutora Lyra: nesta segunda luta, note os custos. Gaste Pressao de Vapor com uma jogada que faca sentido para sua linha.";
    lockMessage = "Comece usando sua Pressao de Vapor em uma jogada antes de passar o turno.";
    highlights = { ...highlights, hand: true };
  } else if (turn === "player" && !attackedAlready && playerCanAttack && !selectedCard) {
    step = "read_board";
    message = directAttackOpen
      ? "Instrutora Lyra: o nucleo inimigo esta exposto. Mesmo assim, avalie se vale pressionar a estrutura ou limpar a mesa."
      : "Instrutora Lyra: repare na frente inimiga. Em geral, limpar a linha abre espaco para ataques diretos depois.";
    lockMessage = "Leia sua linha e selecione uma unidade pronta para atacar.";
    highlights = { ...highlights, playerBoard: true };
  } else if (turn === "player" && !attackedAlready && selectedCard) {
    step = "select_attack";
    message = directAttackOpen
      ? "Instrutora Lyra: caminho aberto. Voce pode escolher entre pressionar uma unidade ou ir direto ao nucleo inimigo."
      : "Instrutora Lyra: agora conclua a leitura tatica escolhendo o melhor alvo na linha superior.";
    lockMessage = "Escolha o alvo do ataque para concluir esta etapa tática.";
    highlights = { ...highlights, enemyBoard: !directAttackOpen, directAttack: directAttackOpen };
  } else if (turn === "player" && attackedAlready) {
    step = "finish_turn";
    message = "Instrutora Lyra: bom. Feche o ciclo do turno e observe como o combate se reorganiza.";
    lockMessage = "Agora encerre o turno para consolidar a leitura da rodada.";
    highlights = { ...highlights, endTurn: true };
  }

  return {
    battleNumber,
    step,
    title: "Treinamento 2 de 2",
    subtitle: "Leitura tatica da forja",
    narrator: "Instrutora Lyra",
    message,
    lockMessage,
    checklist: [
      withCheck(spentSteam, "Gastar Pressao de Vapor com intencao"),
      withCheck(attackedAlready || enemy.structuralIntegrity < enemy.maxStructuralIntegrity, "Pressionar a mesa ou o nucleo inimigo"),
      withCheck(player.overpressure > 0 || enemy.overpressure > 0 || directAttackOpen, "Perceber vantagem de ritmo, overpressure ou abertura de linha"),
    ],
    highlights,
  };
};
