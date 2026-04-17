import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_BASE = '@agenda_v1';

function getAgendaKey(userId) {
  if (!userId) {
    // modo legado / sem usuário
    return STORAGE_KEY_BASE;
  }
  return `${STORAGE_KEY_BASE}_${userId}`;
}

export async function loadAgenda(userId) {
  const key = getAgendaKey(userId);

  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }

    // Fallback: se não houver nada por usuário mas existir a chave antiga global,
    // usamos como base (útil enquanto só existe 1 usuário real usando o app).
    if (userId) {
      const legacyRaw = await AsyncStorage.getItem(STORAGE_KEY_BASE);
      return legacyRaw ? JSON.parse(legacyRaw) : [];
    }

    return [];
  } catch (e) {
    console.warn('agenda.storage.loadAgenda error:', e);
    return [];
  }
}

export async function saveAgenda(userId, items) {
  const key = getAgendaKey(userId);

  try {
    await AsyncStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    console.warn('agenda.storage.saveAgenda error:', e);
  }
}
