import type { TutorialState } from "@/features/game/tutorial";

interface BattleTutorialPanelProps {
  tutorial: TutorialState;
}

export const BattleTutorialPanel = ({ tutorial }: BattleTutorialPanelProps) => {
  if (tutorial.battleNumber < 1 || tutorial.battleNumber > 2) return null;

  return (
    <div className="rounded-[1.6rem] border border-copper-300/18 bg-[linear-gradient(180deg,rgba(216,138,99,0.14),rgba(0,0,0,0.24))] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.24)] backdrop-blur-[2px]">
      <p className="text-[10px] uppercase tracking-[0.34em] text-copper-200/68">{tutorial.title}</p>
      <h3 className="mt-1 font-display text-xl text-brass-50">{tutorial.subtitle}</h3>
      <div className="mt-4 rounded-[1rem] border border-white/8 bg-black/18 p-3">
        <p className="text-[10px] uppercase tracking-[0.24em] text-brass-100/48">{tutorial.narrator}</p>
        <p className="mt-2 text-sm leading-relaxed text-brass-100/80">{tutorial.message}</p>
      </div>
      <div className="mt-4 grid gap-2 text-xs leading-relaxed text-brass-100/74">
        {tutorial.checklist.map((item) => (
          <div key={item} className="rounded-[0.95rem] border border-white/6 bg-white/[0.03] px-3 py-2">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};
