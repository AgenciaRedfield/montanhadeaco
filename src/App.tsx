import { BattleScreen } from "@/features/game/BattleScreen";
import { MainMenu } from "@/features/game/MainMenu";
import { ResultScreen } from "@/features/game/ResultScreen";
import { useUiStore } from "@/store/uiStore";

const App = () => {
  const screen = useUiStore((state) => state.screen);

  if (screen === "menu") return <MainMenu />;
  if (screen === "battle") return <BattleScreen />;
  return <ResultScreen />;
};

export default App;