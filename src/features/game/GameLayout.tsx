import type { PropsWithChildren } from "react";
import { SteamBackdrop } from "@/features/ui/SteamBackdrop";

export const GameLayout = ({ children }: PropsWithChildren) => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#4a2c18_0%,#15110e_26%,#08090d_100%)] text-brass-50">
      <SteamBackdrop />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(216,138,99,0.12),transparent_25%),radial-gradient(circle_at_80%_70%,rgba(235,203,113,0.08),transparent_25%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="relative mx-auto min-h-screen max-w-[1680px] px-4 py-4 lg:px-8 lg:py-6">{children}</div>
    </main>
  );
};