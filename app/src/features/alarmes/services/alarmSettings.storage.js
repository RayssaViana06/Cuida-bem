import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_PREFIX = '@alarms_settings_v2_';

function getKey(userId) {
  return `${SETTINGS_PREFIX}${userId || 'guest'}`;
}

export async function getSettings(userId) {
  try {
    const raw = await AsyncStorage.getItem(getKey(userId));
    return raw ? JSON.parse(raw) : { silenceToday: '' };
  } catch {
    return { silenceToday: '' };
  }
}

export async function setSilenceToday(userId, isoDate) {
  const cur = await getSettings(userId);
  const next = { ...cur, silenceToday: isoDate || '' };
  await AsyncStorage.setItem(getKey(userId), JSON.stringify(next));
  return next;
}

export async function isSilencedToday(userId, isoDate) {
  const s = await getSettings(userId);
  return !!s.silenceToday && s.silenceToday === isoDate;
}
