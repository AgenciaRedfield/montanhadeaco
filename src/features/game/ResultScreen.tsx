import { DefeatModal } from "@/components/DefeatModal";
import { VictoryModal } from "@/components/VictoryModal";
import { GameLayout } from "@/features/game/GameLayout";
import { useGameStore } from "@/store/gameStore";

export const ResultScreen = () => {
  const screen = useGameStore((state) => state.ui.screen);
  const startGame = useGameStore((state) => state.startGame);
  const setScreen = useGameStore((state) => state.setScreen);

  return (
    <GameLayout>
      {screen === "victory" ? <VictoryModal onPlayAgain={startGame} onBackToMenu={() => setScreen("dashboard")} /> : null}
      {screen === "defeat" ? <DefeatModal onPlayAgain={startGame} onBackToMenu={() => setScreen("dashboard")} /> : null}
    </GameLayout>
  );
};
