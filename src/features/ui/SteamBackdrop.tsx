export const SteamBackdrop = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(187,131,48,0.15),transparent_40%),radial-gradient(circle_at_bottom,rgba(83,122,147,0.18),transparent_35%)]" />
      <div className="absolute -left-16 top-20 h-40 w-40 animate-steam rounded-full bg-white/10 blur-3xl" />
      <div className="absolute right-10 top-1/3 h-52 w-52 animate-steam rounded-full bg-copper-300/10 blur-3xl [animation-delay:1.5s]" />
      <div className="absolute bottom-16 left-1/3 h-48 w-48 animate-steam rounded-full bg-brass-100/10 blur-3xl [animation-delay:2.8s]" />
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-brass-100/60 to-transparent" />
    </div>
  );
};
