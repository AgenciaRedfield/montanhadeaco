import type { User } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase";

const getRedirectUrl = () => (typeof window !== "undefined" ? window.location.origin : undefined);

export const getCurrentAuthUser = async (): Promise<User | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user ?? null;
};

export const sendMagicLink = async (email: string) => {
  if (!supabase) {
    return { error: new Error("Supabase nao configurado.") };
  }

  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: getRedirectUrl(),
    },
  });
};

export const signOutAuth = async () => {
  if (!supabase) return { error: null };
  return supabase.auth.signOut();
};
