import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BattleScreen } from "@/features/game/BattleScreen";
import { MainMenu } from "@/features/game/MainMenu";
import { ResultScreen } from "@/features/game/ResultScreen";
import { useUiStore } from "@/store/uiStore";

const AppContent = () => {
  const screen = useUiStore((state) => state.screen);

  if (screen === "menu") return <MainMenu />;
  if (screen === "battle") return <BattleScreen />;
  if (screen === "victory" || screen === "defeat") return <ResultScreen />;
  return <MainMenu />;
};

const App = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;