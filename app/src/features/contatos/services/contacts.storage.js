// src/features/contatos/services/contacts.storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@contacts_by_user_v1';

async function loadContactsMap() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }

    // fallback se algum dia tiver sido salvo como array solto
    return {};
  } catch (error) {
    console.warn('Erro ao carregar contatos:', error);
    return {};
  }
}

/**
 * Carrega contatos do usuário informado.
 * @param {string|number} userId
 * @returns {Promise<Array>}
 */
export async function loadContacts(userId) {
  if (!userId) return [];
  const map = await loadContactsMap();
  const list = map[userId] || [];
  return Array.isArray(list) ? list : [];
}

/**
 * Salva contatos do usuário informado.
 * @param {string|number} userId
 * @param {Array} list
 */
export async function saveContacts(userId, list) {
  if (!userId) return;

  try {
    const map = await loadContactsMap();
    map[userId] = Array.isArray(list) ? list : [];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (error) {
    console.warn('Erro ao salvar contatos:', error);
  }
}
