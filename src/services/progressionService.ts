import { supabase } from "@/services/supabase";
import type { AuthState, ProgressProfile, SettingsState } from "@/types/game";

const PROFILE_KEY = "montanha_de_aco_profile";
const SETTINGS_KEY = "montanha_de_aco_settings";

export const STARTER_UNLOCK_IDS = [
  "guardiao-de-ferro",
  "automato-defensor",
  "medico-do-vapor",
  "tecnico-de-campo",
  "lamina-fantasma",
  "torre-de-vapor-mk1",
  "sabotador-mecanico",
  "torre-mecanica",
];

export const STARTER_DECK_IDS = [
  "guardiao-de-ferro",
  "guardiao-de-ferro",
  "guardiao-de-ferro",
  "automato-defensor",
  "automato-defensor",
  "automato-defensor",
  "medico-do-vapor",
  "medico-do-vapor",
  "tecnico-de-campo",
  "tecnico-de-campo",
  "lamina-fantasma",
  "lamina-fantasma",
  "lamina-fantasma",
  "torre-de-vapor-mk1",
  "torre-de-vapor-mk1",
  "torre-de-vapor-mk1",
  "sabotador-mecanico",
  "sabotador-mecanico",
  "torre-mecanica",
  "torre-mecanica",
];

export const FORGE_COST = 90;
export const FORGE_PACK_SIZE = 3;
export const DECK_SIZE = 20;
export const DECK_COPY_LIMIT = 3;

export const defaultProfile: ProgressProfile = {
  commanderName: "Comandante da Forja",
  rank: "Operador da Caldeira",
  level: 1,
  forgeCredits: 120,
  battlesPlayed: 0,
  victories: 0,
  unlockedCards: STARTER_UNLOCK_IDS,
  selectedDeck: STARTER_DECK_IDS,
  lastPlayedAt: null,
  cloudEnabled: false,
  syncStatus: "local-only",
};

export const defaultSettings: SettingsState = {
  musicEnabled: true,
  musicUnlocked: false,
  musicVolume: 0.45,
};

export const defaultAuth: AuthState = {
  userId: null,
  email: null,
  initialized: false,
  magicLinkSentTo: null,
};

type CloudProgressRow = {
  commander_name: string | null;
  rank: string | null;
  level: number | null;
  forge_credits: number | null;
  battles_played: number | null;
  victories: number | null;
  unlocked_cards: string[] | null;
  selected_deck: string[] | null;
  last_played_at: string | null;
  music_enabled: boolean | null;
  music_volume: number | null;
};

const hasWindow = () => typeof window !== "undefined";

const normalizeDeck = (deck: string[] | null | undefined, unlockedCards: string[]) => {
  const allowed = new Set(unlockedCards);
  const filtered = Array.isArray(deck) ? deck.filter((cardId) => allowed.has(cardId)) : [];
  return filtered.length > 0 ? filtered.slice(0, DECK_SIZE) : STARTER_DECK_IDS.filter((cardId) => allowed.has(cardId));
};

export const normalizeProfile = (profile: Partial<ProgressProfile> | null | undefined): ProgressProfile => {
  const merged = { ...defaultProfile, ...(profile ?? {}) };
  const unlockedCards = Array.isArray(merged.unlockedCards) && merged.unlockedCards.length > 0
    ? Array.from(new Set(merged.unlockedCards))
    : STARTER_UNLOCK_IDS;
  const selectedDeck = normalizeDeck(merged.selectedDeck, unlockedCards);

  return {
    ...merged,
    unlockedCards,
    selectedDeck,
  };
};

const mapCloudRowToSnapshot = (row: CloudProgressRow) => {
  const profile = normalizeProfile({
    commanderName: row.commander_name ?? defaultProfile.commanderName,
    rank: row.rank ?? defaultProfile.rank,
    level: row.level ?? defaultProfile.level,
    forgeCredits: row.forge_credits ?? defaultProfile.forgeCredits,
    battlesPlayed: row.battles_played ?? defaultProfile.battlesPlayed,
    victories: row.victories ?? defaultProfile.victories,
    unlockedCards: row.unlocked_cards ?? defaultProfile.unlockedCards,
    selectedDeck: row.selected_deck ?? defaultProfile.selectedDeck,
    lastPlayedAt: row.last_played_at,
    cloudEnabled: true,
    syncStatus: "synced",
  });

  const settings: SettingsState = {
    ...defaultSettings,
    musicEnabled: row.music_enabled ?? defaultSettings.musicEnabled,
    musicVolume: row.music_volume ?? defaultSettings.musicVolume,
  };

  return { profile, settings };
};

export const loadLocalSnapshot = async () => {
  if (!hasWindow()) {
    return { profile: defaultProfile, settings: defaultSettings };
  }

  const localProfile = window.localStorage.getItem(PROFILE_KEY);
  const localSettings = window.localStorage.getItem(SETTINGS_KEY);

  const profile = normalizeProfile(localProfile ? JSON.parse(localProfile) : defaultProfile);
  const settings = localSettings ? { ...defaultSettings, ...JSON.parse(localSettings) } : defaultSettings;

  return { profile, settings };
};

export const loadCloudSnapshot = async (userId: string) => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("player_progress")
    .select("commander_name, rank, level, forge_credits, battles_played, victories, unlocked_cards, selected_deck, last_played_at, music_enabled, music_volume")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapCloudRowToSnapshot(data as CloudProgressRow);
};

export const mergeSnapshots = (local: { profile: ProgressProfile; settings: SettingsState }, cloud: { profile: ProgressProfile; settings: SettingsState }) => {
  // O merge prioriza o maior progresso (vitorias, nivel, creditos e uniao de cartas)
  const mergedProfile: ProgressProfile = {
    ...cloud.profile,
    victories: Math.max(local.profile.victories, cloud.profile.victories),
    level: Math.max(local.profile.level, cloud.profile.level),
    forgeCredits: Math.max(local.profile.forgeCredits, cloud.profile.forgeCredits),
    battlesPlayed: Math.max(local.profile.battlesPlayed, cloud.profile.battlesPlayed),
    unlockedCards: Array.from(new Set([...local.profile.unlockedCards, ...cloud.profile.unlockedCards])),
    selectedDeck: local.profile.victories >= cloud.profile.victories ? local.profile.selectedDeck : cloud.profile.selectedDeck,
    lastPlayedAt: local.profile.lastPlayedAt && cloud.profile.lastPlayedAt 
      ? (new Date(local.profile.lastPlayedAt) > new Date(cloud.profile.lastPlayedAt) ? local.profile.lastPlayedAt : cloud.profile.lastPlayedAt)
      : (local.profile.lastPlayedAt || cloud.profile.lastPlayedAt),
    cloudEnabled: true,
    syncStatus: "synced",
  };

  const mergedSettings: SettingsState = {
    ...cloud.settings,
    musicUnlocked: local.settings.musicUnlocked || cloud.settings.musicUnlocked,
  };

  return { profile: normalizeProfile(mergedProfile), settings: mergedSettings };
};

export const loadProgressSnapshot = async (userId?: string | null) => {
  const local = await loadLocalSnapshot();
  if (!userId) return local;

  const cloud = await loadCloudSnapshot(userId);
  
  if (cloud) {
    // Se existe na nuvem, fazemos o merge com o local para nao perder o que foi feito offline/pre-login
    const merged = mergeSnapshots(local, cloud);
    // Salva o resultado do merge de volta na nuvem e local
    await saveProgressSnapshot(merged.profile, merged.settings, userId);
    return merged;
  }

  // Se nao existe na nuvem, sobe o local
  await saveProgressSnapshot({ ...local.profile, cloudEnabled: true, syncStatus: "saving" }, local.settings, userId);
  return {
    profile: { ...local.profile, cloudEnabled: true, syncStatus: "synced" },
    settings: local.settings,
  };
};

export const saveProgressSnapshot = async (profile: ProgressProfile, settings: SettingsState, userId?: string | null) => {
  if (!hasWindow()) return;

  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

  if (!supabase || !userId) return;

  await supabase.from("player_progress").upsert({
    user_id: userId,
    commander_name: profile.commanderName,
    rank: profile.rank,
    level: profile.level,
    forge_credits: profile.forgeCredits,
    battles_played: profile.battlesPlayed,
    victories: profile.victories,
    unlocked_cards: profile.unlockedCards,
    selected_deck: profile.selectedDeck,
    last_played_at: profile.lastPlayedAt,
    music_enabled: settings.musicEnabled,
    music_volume: settings.musicVolume,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
};

export const clearProgressSnapshot = async () => {
  if (!hasWindow()) return;
  window.localStorage.removeItem(PROFILE_KEY);
  window.localStorage.removeItem(SETTINGS_KEY);
};
