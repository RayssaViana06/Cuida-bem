// Persistência de alarmes pessoais por usuário (AsyncStorage)
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = '@alarms_v2:';

function getKey(userId) {
  const safeId = userId ? String(userId) : 'anon';
  return `${STORAGE_PREFIX}${safeId}`;
}

export async function loadAlarms(userId) {
  try {
    const raw = await AsyncStorage.getItem(getKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Erro carregando alarmes:', e);
    return [];
  }
}

export async function saveAlarms(userId, list) {
  try {
    const finalList = Array.isArray(list) ? list : [];
    await AsyncStorage.setItem(getKey(userId), JSON.stringify(finalList));
  } catch (e) {
    console.warn('Erro salvando alarmes:', e);
  }
}

export async function getAlarmById(userId, id) {
  const list = await loadAlarms(userId);
  return list.find((a) => a.id === id) || null;
}

export async function addAlarm(userId, payload = {}) {
  const list = await loadAlarms(userId);
  const id = Date.now().toString();

  const isInterval = payload.mode === 'interval';
  const item = {
    id,
    label: payload.label || 'Alarme',
    profile: payload.profile || '',
    mode: payload.mode || 'daily', // 'daily' | 'interval'
    time: !isInterval ? payload.time || '09:00' : null,
    intervalMinutes: isInterval
      ? Number(payload.intervalMinutes ?? 120)
      : null,
    enabled: payload.enabled !== false,
    sound: payload.sound || 'default',
    vibrate: payload.vibrate !== false,
    notificationId: payload.notificationId || null,
    isPreset: !!payload.isPreset,
  };

  const updated = [item, ...list];
  await saveAlarms(userId, updated);
  return item;
}

export async function updateAlarm(userId, partial) {
  const list = await loadAlarms(userId);
  const updated = list.map((a) =>
    a.id === partial.id ? { ...a, ...partial } : a,
  );
  await saveAlarms(userId, updated);
  return updated.find((a) => a.id === partial.id) || null;
}

export async function removeAlarm(userId, id) {
  const list = await loadAlarms(userId);
  const updated = list.filter((a) => a.id !== id);
  await saveAlarms(userId, updated);
  return updated;
}

// Ajudantes
export async function loadPresets(userId) {
  const list = await loadAlarms(userId);
  return list.filter((a) => a.isPreset);
}

export async function loadNonPresets(userId) {
  const list = await loadAlarms(userId);
  return list.filter((a) => !a.isPreset);
}
