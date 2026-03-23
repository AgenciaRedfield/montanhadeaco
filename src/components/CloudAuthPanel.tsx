import { useState } from "react";
import { isSupabaseConfigured } from "@/services/supabase";
import { useGameStore } from "@/store/gameStore";

export const CloudAuthPanel = () => {
  const auth = useGameStore((state) => state.auth);
  const profile = useGameStore((state) => state.profile);
  const busy = useGameStore((state) => state.ui.busy);
  const sendMagicLink = useGameStore((state) => state.sendMagicLink);
  const signOutCloud = useGameStore((state) => state.signOutCloud);
  const syncCloudProgress = useGameStore((state) => state.syncCloudProgress);
  const [email, setEmail] = useState(auth.email ?? auth.magicLinkSentTo ?? "");

  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-[1.4rem] border border-brass-100/10 bg-black/25 p-4 text-sm text-brass-100/68">
        Supabase ainda nao configurado. Defina `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` para ativar login e nuvem.
      </div>
    );
  }

  return (
    <div className="rounded-[1.4rem] border border-brass-100/10 bg-black/25 p-4">
      <p className="text-[10px] uppercase tracking-[0.28em] text-brass-100/48">Fundicao em Nuvem</p>
      {auth.userId ? (
        <div className="mt-3 space-y-3 text-sm text-brass-100/70">
          <p>Conta conectada: <span className="font-semibold text-brass-50">{auth.email}</span></p>
          <p>Sincronizacao: <span className="font-semibold text-brass-50">{profile.syncStatus}</span></p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void syncCloudProgress()} className="rounded-[0.95rem] border border-brass-100/14 bg-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-brass-50">
              Sincronizar
            </button>
            <button type="button" onClick={() => void signOutCloud()} className="rounded-[0.95rem] border border-brass-100/14 bg-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-brass-50">
              Sair
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="comandante@forja.com"
            className="w-full rounded-[1rem] border border-brass-100/12 bg-black/30 px-4 py-3 text-sm text-brass-50 outline-none placeholder:text-brass-100/28"
          />
          <button type="button" disabled={busy} onClick={() => void sendMagicLink(email)} className="w-full rounded-[1rem] border border-brass-100/20 bg-[linear-gradient(135deg,#d88a63_0%,#ebcb71_48%,#8d4326_100%)] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-smoke-900 disabled:opacity-50">
            Receber Link Magico
          </button>
          <p className="text-xs leading-relaxed text-brass-100/58">
            {auth.magicLinkSentTo ? `Link enviado para ${auth.magicLinkSentTo}. Abra o email e volte para o jogo.` : "Entre com email para salvar progresso, deck e colecao na nuvem."}
          </p>
        </div>
      )}
    </div>
  );
};
