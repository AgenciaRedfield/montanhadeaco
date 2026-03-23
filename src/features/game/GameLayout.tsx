import type { PropsWithChildren } from "react";
import logo from "@/assets/logo.png";
import { MusicToggle } from "@/components/MusicToggle";
import { SteamBackdrop } from "@/features/ui/SteamBackdrop";
import { useGameStore } from "@/store/gameStore";

export const GameLayout = ({ children }: PropsWithChildren) => {
  const profile = useGameStore((state) => state.profile);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#4a2c18_0%,#15110e_26%,#08090d_100%)] text-brass-50">
      <SteamBackdrop />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(216,138,99,0.12),transparent_25%),radial-gradient(circle_at_80%_70%,rgba(235,203,113,0.08),transparent_25%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="relative mx-auto min-h-screen max-w-[1680px] px-4 py-4 lg:px-8 lg:py-6">
        <div className="mb-4 flex items-center justify-between gap-4 rounded-[1.4rem] border border-brass-500/12 bg-black/22 px-4 py-3 backdrop-blur-xl">
          <div className="flex min-w-0 items-center gap-4">
            <div className="logo-frame hidden rounded-[1rem] px-3 py-2 md:block">
              <img src={logo} alt="Montanha de Aco" className="logo-crest h-14 w-auto" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.42em] text-brass-100/48">Montanha de Aco</p>
              <p className="truncate font-display text-2xl text-brass-50">{profile.commanderName}</p>
            </div>
          </div>
          <MusicToggle />
        </div>
        {children}
      </div>
    </main>
  );
};
