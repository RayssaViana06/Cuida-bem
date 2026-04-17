// serviços de persistência dos medicamentos
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_BASE = '@meds_v1';

// Gera a chave específica por usuário
function getMedsKey(userId) {
  if (!userId) {
    // fallback pra compatibilidade / modo legado
    return STORAGE_KEY_BASE;
  }
  return `${STORAGE_KEY_BASE}_${userId}`;
}

export async function loadMeds(userId) {
  const key = getMedsKey(userId);

  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }

    // Fallback: se não houver nada por usuário mas existir a chave antiga global,
    // usamos como base (útil enquanto só existe um usuário real usando o app).
    if (userId) {
      const legacyRaw = await AsyncStorage.getItem(STORAGE_KEY_BASE);
      return legacyRaw ? JSON.parse(legacyRaw) : [];
    }

    return [];
  } catch (e) {
    console.warn('Erro carregando medicamentos:', e);
    return [];
  }
}

export async function saveMeds(userId, list) {
  const key = getMedsKey(userId);
  try {
    await AsyncStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    console.warn('Erro salvando medicamentos:', e);
  }
}

export async function getMedById(userId, id) {
  const list = await loadMeds(userId);
  const targetId = String(id);
  return list.find((m) => String(m.id) === targetId) || null;
}

/**
 * Insere ou atualiza um medicamento.
 * - Se payload.id existir e for encontrado, atualiza.
 * - Se payload.id existir e NÃO for encontrado, insere com esse id.
 * - Se payload.id não existir, gera um id novo.
 *
 * Retorna SEMPRE o item salvo (objeto), não mais a lista inteira.
 */
export async function upsertMed(userId, payload) {
  const list = await loadMeds(userId);
  let updated = list;
  let savedItem = null;

  const hasId = payload.id !== undefined && payload.id !== null;
  const targetId = hasId ? String(payload.id) : null;

  if (hasId) {
    // Atualização com comparação normalizada
    updated = list.map((m) => {
      if (String(m.id) === targetId) {
        savedItem = { ...m, ...payload, id: targetId };
        return savedItem;
      }
      return m;
    });

    // Se não encontrou nenhum com esse id, tratamos como novo com esse id
    if (!savedItem) {
      savedItem = { ...payload, id: targetId };
      updated = [savedItem, ...list];
    }
  } else {
    // Criação com id novo
    const id = Date.now().toString();
    savedItem = { ...payload, id };
    updated = [savedItem, ...list];
  }

  await saveMeds(userId, updated);
  return savedItem;
}

export async function deleteMedById(userId, id) {
  const list = await loadMeds(userId);
  const targetId = String(id);
  const updated = list.filter((m) => String(m.id) !== targetId);
  await saveMeds(userId, updated);
  return updated;
}
