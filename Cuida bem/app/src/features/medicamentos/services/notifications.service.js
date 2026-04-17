// Serviço de notificações (Expo)
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const ANDROID_CHANNEL_ID = 'meds-alarms';

export function parseHHMM(hhmm) {
  if (!hhmm || typeof hhmm !== 'string') return null;
  const m = hhmm.match(/^(\d{2}):(\d{2})$/);
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

export async function ensurePermissions() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    return req.status === 'granted';
  }
  return true;
}

export async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Alarmes do App',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

function buildContent({ title, body, data, sound = 'default', vibrate = true } = {}) {
  return {
    title: title || 'Lembrete',
    body: body || 'Alarme',
    data: data || {},
    sound: sound === 'default' ? 'default' : null,
    vibrate: vibrate ? [0, 200, 200, 200] : undefined,
  };
}

// Diário em HH:MM
export async function scheduleDailyAt(hhmm, opts = {}) {
  const ok = await ensurePermissions();
  if (!ok) return null;
  await ensureAndroidChannel();

  const t = parseHHMM(hhmm);
  if (!t) return null;

  const trigger = Platform.select({
    android: { hour: t.hour, minute: t.minute, repeats: true, channelId: ANDROID_CHANNEL_ID },
    ios:     { hour: t.hour, minute: t.minute, repeats: true },
    default: { hour: t.hour, minute: t.minute, repeats: true },
  });

  return Notifications.scheduleNotificationAsync({
    content: buildContent(opts),
    trigger,
  });
}

// One-shot em DATA + HH:MM
export async function scheduleAtDateTime(dateISO, hhmm, opts = {}) {
  const ok = await ensurePermissions();
  if (!ok) return null;
  await ensureAndroidChannel();

  if (!dateISO || !hhmm) return null;
  const m = hhmm.match(/^(\d{2}):(\d{2})$/);
  if (!m) return null;

  const dt = new Date(`${dateISO}T${hhmm}:00`);
  if (Number.isNaN(dt.getTime())) return null;

  return Notifications.scheduleNotificationAsync({
    content: buildContent(opts),
    trigger: dt, // dispara uma única vez
  });
}

// Intervalo em minutos (ex.: 120m)
export async function scheduleEveryIntervalMinutes(intervalMinutes = 120, opts = {}) {
  const ok = await ensurePermissions();
  if (!ok) return null;
  await ensureAndroidChannel();

  const minutes = Math.max(1, Number(intervalMinutes) || 120);
  const trigger = { seconds: minutes * 60, repeats: true, channelId: ANDROID_CHANNEL_ID };

  return Notifications.scheduleNotificationAsync({
    content: buildContent(opts),
    trigger,
  });
}

// Cancelar uma notificação por id
export async function cancel(id) {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {}
}

// Teste rápido (1s)
export async function triggerTest(opts = {}) {
  const ok = await ensurePermissions();
  if (!ok) return null;
  await ensureAndroidChannel();
  return Notifications.scheduleNotificationAsync({
    content: buildContent(opts),
    trigger: { seconds: 1 },
  });
}

export default {
  parseHHMM,
  ensurePermissions,
  ensureAndroidChannel,
  scheduleDailyAt,
  scheduleAtDateTime,
  scheduleEveryIntervalMinutes,
  cancel,
  triggerTest,
};
