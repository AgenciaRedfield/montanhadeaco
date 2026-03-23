import { useGameStore } from "@/store/gameStore";
import { useUiStore } from "@/store/uiStore";
import { DefeatModal } from "@/components/DefeatModal";
import { VictoryModal } from "@/components/VictoryModal";
import { GameLayout } from "@/features/game/GameLayout";

export const ResultScreen = () => {
  const screen = useUiStore((state) => state.screen);
  const setScreen = useUiStore((state) => state.setScreen);
  const startGame = useGameStore((state) => state.startGame);

  return (
    <GameLayout>
      {screen === "victory" ? <VictoryModal onPlayAgain={() => startGame()} onBackToMenu={() => setScreen("menu")} /> : null}
      {screen === "defeat" ? <DefeatModal onPlayAgain={() => startGame()} onBackToMenu={() => setScreen("menu")} /> : null}
    </GameLayout>
  );
};