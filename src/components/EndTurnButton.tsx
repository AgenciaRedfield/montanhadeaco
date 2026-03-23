interface EndTurnButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

export const EndTurnButton = ({ disabled = false, onClick }: EndTurnButtonProps) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full rounded-[1.4rem] border border-brass-100/25 bg-[linear-gradient(135deg,#d88a63_0%,#ebcb71_48%,#8d4326_100%)] px-5 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-smoke-900 shadow-[0_10px_30px_rgba(190,101,61,0.28)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
    >
      Encerrar Turno
    </button>
  );
};