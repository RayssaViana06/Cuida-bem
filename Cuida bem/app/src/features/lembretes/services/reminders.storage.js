// src/features/lembretes/services/reminders.storage.js

// serviços de persistência de lembretes
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cancel as cancelNotification } from '@/features/medicamentos/services/notifications.service';
import api from '@/api/client';

const STORAGE_BASE_KEY = '@reminders_v2';
const LEGACY_GLOBAL_KEY = `${STORAGE_BASE_KEY}_anonymous`; // chave antiga usada quando tudo era "anonymous"

function storageKey(userKey) {
  return `${STORAGE_BASE_KEY}_${userKey}`;
}

/**
 * Busca lembretes iniciais no backend (db.json) para o usuário.
 * Formato esperado no backend:
 * {
 *   id: number,
 *   userId: number,
 *   titulo: string,
 *   descricao: string,
 *   tipo: "diario" | "unico" | ...,
 *   hora: "HH:MM",
 *   ativo: boolean,
 *   done: boolean
 * }
 *
 * Converte para o formato interno usado pelo app:
 * {
 *   id: string,
 *   title: string,
 *   notes: string,
 *   date: string,
 *   time: string,
 *   repeatDaily: boolean,
 *   sound: string,
 *   vibrate: boolean,
 *   notificationId: string | null,
 *   done: boolean,
 *   source: "remote"
 * }
 */
async function fetchRemoteReminders(userKey) {
  // se a chave não for numérica, não tem userId para filtrar no backend
  const numericId = Number(userKey);
  if (!numericId || Number.isNaN(numericId)) {
    return [];
  }

  try {
    // ajusta a rota conforme seu client (provavelmente /lembretes)
    const response = await api.get(`/lembretes`, {
      params: { userId: numericId },
    });

    const data = Array.isArray(response.data) ? response.data : [];

    return data.map((item) => ({
      id: String(item.id), // mantém o id do backend como string
      title: item.titulo || '',
      notes: item.descricao || '',
      // seu JSON não tem data, só tipo/hora -> deixamos date vazio
      date: '',
      time: item.hora || '',
      repeatDaily: item.tipo === 'diario',
      sound: 'default',
      vibrate: true,
      notificationId: null,
      done: !!item.done,
      source: 'remote',
    }));
  } catch (e) {
    console.warn('Erro buscando lembretes remotos:', e);
    return [];
  }
}

export async function loadReminders(userKey) {
  if (!userKey) return [];

  try {
    // 1) tenta carregar pela chave do usuário atual
    const raw = await AsyncStorage.getItem(storageKey(userKey));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // 2) se não tiver nada salvo, tenta reaproveitar o legado "anonymous"
    const legacyRaw = await AsyncStorage.getItem(LEGACY_GLOBAL_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw);
      if (Array.isArray(legacy) && legacy.length > 0) {
        // já aproveita, salva na chave nova e retorna
        await AsyncStorage.setItem(storageKey(userKey), JSON.stringify(legacy));
        return legacy;
      }
    }

    // 3) se ainda estiver vazio, tenta buscar do backend (db.json)
    const remote = await fetchRemoteReminders(userKey);
    if (remote.length > 0) {
      await AsyncStorage.setItem(storageKey(userKey), JSON.stringify(remote));
      return remote;
    }

    // 4) nada encontrado em lugar nenhum
    return [];
  } catch (e) {
    console.warn('Erro carregando lembretes:', e);
    return [];
  }
}

async function save(userKey, list) {
  if (!userKey) return;

  try {
    await AsyncStorage.setItem(storageKey(userKey), JSON.stringify(list));
  } catch (e) {
    console.warn('Erro salvando lembretes:', e);
  }
}

export async function getReminderById(userKey, id) {
  const list = await loadReminders(userKey);
  return list.find((r) => r.id === id) || null;
}

export async function upsertReminder(userKey, payload) {
  const list = await loadReminders(userKey);
  let updated;

  if (payload.id) {
    updated = list.map((r) =>
      r.id === payload.id ? { ...r, ...payload } : r
    );
  } else {
    const id = Date.now().toString();
    updated = [{ ...payload, id, done: false }, ...list];
  }

  await save(userKey, updated);
  return updated;
}

export async function deleteReminderById(userKey, id) {
  const list = await loadReminders(userKey);
  const toDelete = list.find((r) => r.id === id);

  if (toDelete?.notificationId) {
    try {
      await cancelNotification(toDelete.notificationId);
    } catch {
      // ignora erro de cancelamento
    }
  }

  const updated = list.filter((r) => r.id !== id);
  await save(userKey, updated);
  return updated;
}

export async function toggleDone(userKey, id, value) {
  const list = await loadReminders(userKey);
  const updated = list.map((r) =>
    r.id === id ? { ...r, done: !!value } : r
  );
  await save(userKey, updated);
  return updated;
}

export default {
  loadReminders,
  getReminderById,
  upsertReminder,
  deleteReminderById,
  toggleDone,
};
