import { useEffect } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DashboardScreen } from "@/features/game/DashboardScreen";
import { DeckBuilderScreen } from "@/features/game/DeckBuilderScreen";
import { ForgeScreen } from "@/features/game/ForgeScreen";
import { BattleScreen } from "@/features/game/BattleScreen";
import { MainMenu } from "@/features/game/MainMenu";
import { ResultScreen } from "@/features/game/ResultScreen";
import { AmbientAudio } from "@/features/ui/AmbientAudio";
import { supabase } from "@/services/supabase";
import { useGameStore } from "@/store/gameStore";

const AppContent = () => {
  const screen = useGameStore((state) => state.ui.screen);
  const hydrated = useGameStore((state) => state.hydrated);
  const hydrateProgress = useGameStore((state) => state.hydrateProgress);
  const handleAuthSession = useGameStore((state) => state.handleAuthSession);

  useEffect(() => {
    if (!hydrated) {
      void hydrateProgress();
    }
  }, [hydrateProgress, hydrated]);

  useEffect(() => {
    if (!supabase) return undefined;

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => {
        void handleAuthSession(session?.user?.id ?? null, session?.user?.email ?? null);
      }, 0);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [handleAuthSession]);

  if (screen === "menu") return <MainMenu />;
  if (screen === "dashboard") return <DashboardScreen />;
  if (screen === "forge") return <ForgeScreen />;
  if (screen === "deck-builder") return <DeckBuilderScreen />;
  if (screen === "battle") return <BattleScreen />;
  if (screen === "victory" || screen === "defeat") return <ResultScreen />;
  return <MainMenu />;
};

const App = () => {
  return (
    <ErrorBoundary>
      <AmbientAudio />
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;
