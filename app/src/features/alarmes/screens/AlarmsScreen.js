// app/src/features/alarmes/screens/AlarmsScreen.js
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  FlatList,
  Alert,
} from 'react-native';
import { useTheme, Card, Divider, FAB } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { ROUTES } from '@/navigation/routes';
import {
  loadMeds,
  saveMeds,
} from '@/features/medicamentos/services/medicamentos.storage';
import {
  loadPresets,
  loadNonPresets,
  addAlarm,
  updateAlarm,
  removeAlarm,
  saveAlarms, // ADICIONADO: para salvar seed remoto
} from '@/features/alarmes/services/alarms.storage';
import {
  scheduleDailyAt,
  scheduleEveryIntervalMinutes,
  cancel,
  triggerTest,
} from '@/features/medicamentos/services/notifications.service';
import {
  setSilenceToday,
  isSilencedToday,
} from '@/features/alarmes/services/alarmSettings.storage';
import { useAccessibility } from '@/features/acessibilidade/store/acessibilidade.context';
import { useAuth } from '@/features/AuthContext';
import api from '@/api/client'; // ADICIONADO: client HTTP (Vercel / JSON Server)

const LILAC_TEXT = '#3B0764';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatMedTitle(item) {
  if (!item) return 'Medicamento';
  // tenta reaproveitar os campos mais comuns
  if (item.displayName) return item.displayName;

  const name = item.name || item.nome || '';
  const dosage = item.dosage || item.dosagem || '';
  const extra = item.type || item.tipo || '';

  const parts = [];
  if (name) parts.push(name);
  if (dosage) parts.push(dosage);
  if (extra) parts.push(extra);

  const result = parts.join(' - ').trim();
  return result || 'Medicamento';
}

/**
 * Converte um alarme vindo do backend (db.json / JSON Server)
 * para o formato interno de alarmes pessoais do app.
 *
 * Exemplo de remoto (db.json):
 * {
 *   "id": 1,
 *   "userId": 1,
 *   "titulo": "Alarme exercício",
 *   "tipo": "intervalo",
 *   "intervaloMinutos": 120,
 *   "ativo": false
 * }
 */
function mapRemoteAlarmToLocal(remote) {
  if (!remote) return null;

  const isInterval =
    remote.tipo === 'intervalo' ||
    remote.tipo === 'interval' ||
    remote.mode === 'interval';

  const baseTime = remote.hora || remote.time || '09:00';

  return {
    id: String(remote.id ?? Date.now().toString()),
    label: remote.titulo || remote.label || 'Alarme',
    profile: remote.profile || '',
    mode: isInterval ? 'interval' : 'daily',
    time: isInterval ? null : baseTime,
    intervalMinutes: isInterval
      ? Number(remote.intervaloMinutos ?? remote.intervalMinutes ?? 120)
      : null,
    enabled: remote.ativo !== false,
    sound: remote.sound || 'default',
    vibrate: remote.vibrate !== false,
    notificationId: null,
    isPreset: false, // seed remoto vira alarme pessoal, não preset
  };
}

/**
 * Carrega presets + alarmes pessoais do AsyncStorage.
 * Se estiver tudo vazio para esse usuário e ele tiver um ID numérico,
 * tenta buscar seed em /alarmes?userId={id} (Vercel read-only),
 * converte para o formato interno e salva com saveAlarms.
 */
async function seedAlarmsIfEmpty(userId) {
  // 1) Lê o que já existe localmente
  let [p, a] = await Promise.all([
    loadPresets(userId),
    loadNonPresets(userId),
  ]);

  const presets = Array.isArray(p) ? p : [];
  const alarms = Array.isArray(a) ? a : [];

  // Se já tiver qualquer coisa local, não mexe
  if (presets.length > 0 || alarms.length > 0) {
    return { presets, alarms };
  }

  // Sem dados locais: tenta seed remoto apenas se o userId for numérico
  const numericId =
    typeof userId === 'number' ? userId : Number(userId);

  if (!numericId || Number.isNaN(numericId)) {
    // Usuário local / anon / email: continua vazio
    return { presets, alarms };
  }

  try {
    const response = await api.get('/alarmes', {
      params: { userId: numericId },
    });

    const remote = Array.isArray(response.data) ? response.data : [];
    if (remote.length === 0) {
      return { presets, alarms };
    }

    const mapped = remote.map(mapRemoteAlarmToLocal).filter(Boolean);
    if (mapped.length === 0) {
      return { presets, alarms };
    }

    // Salva todos como "alarmes pessoais" (isPreset: false)
    await saveAlarms(numericId, mapped);

    return {
      presets: [],
      alarms: mapped,
    };
  } catch (e) {
    console.warn('Erro sincronizando alarmes remotos:', e);
    return { presets, alarms };
  }
}

export default function AlarmsScreen({ navigation }) {
  const { colors } = useTheme();
  const { settings } = useAccessibility();
  const { user } = useAuth();
  const userId = user?.id ?? 'anon';

  const styles = makeStyles(colors);

  const applyFontScale = (baseSize) => {
    const fontScale = settings?.fontScale ?? 1;
    if (fontScale === 1) return baseSize;
    if (baseSize >= 24) return baseSize * fontScale * 0.95;
    if (baseSize >= 16) return baseSize * fontScale;
    return baseSize * fontScale * 1.05;
  };

  const isLargeButtons = !!settings?.largeButtons;
  const backIconSize = isLargeButtons ? 30 : 24;

  const [meds, setMeds] = useState([]);
  const [presets, setPresets] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [silenced, setSilenced] = useState(false);

  const refresh = useCallback(async () => {
    // 1) Carrega meds do usuário
    const medsPromise = loadMeds(userId);

    // 2) Carrega alarmes locais e, se vazio, tenta seed remoto
    const alarmsPromise = seedAlarmsIfEmpty(userId);

    const [m, alarmData] = await Promise.all([
      medsPromise,
      alarmsPromise,
    ]);

    const presetsList = alarmData?.presets ?? [];
    const alarmsList = alarmData?.alarms ?? [];

    setMeds((m || []).filter((x) => x.alarme));
    setPresets(presetsList);
    setAlarms(alarmsList);
    setSilenced(await isSilencedToday(todayISO()));
  }, [userId]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', refresh);
    refresh();
    return unsub;
  }, [navigation, refresh]);

  async function ensureScheduled(item) {
    if (!item.enabled) return null;
    if (item.notificationId) return item.notificationId;

    const base = {
      title: item.label || 'Alarme',
      vibrate: item.vibrate ?? true,
    };

    let id = null;
    if (item.mode === 'interval') {
      id = await scheduleEveryIntervalMinutes(
        item.intervalMinutes || 120,
        base,
      );
    } else if (item.time) {
      id = await scheduleDailyAt(item.time, base);
    }
    if (id) {
      const upd = await updateAlarm(userId, {
        id: item.id,
        notificationId: id,
      });
      if (item.isPreset) {
        setPresets((prev) => prev.map((x) => (x.id === item.id ? upd : x)));
      } else {
        setAlarms((prev) => prev.map((x) => (x.id === item.id ? upd : x)));
      }
    }
    return id;
  }

  async function toggleSilenceToday(value) {
    if (value) {
      await setSilenceToday(todayISO());

      setPresets((prev) => prev.map((x) => ({ ...x, notificationId: null })));
      setAlarms((prev) => prev.map((x) => ({ ...x, notificationId: null })));

      const newMeds = meds.map((m) => ({ ...m, notificationId: null }));
      await saveMeds(userId, newMeds);
      setMeds(newMeds);

      setSilenced(true);
      Alert.alert(
        'Silenciado para hoje',
        'Presets e alarmes pessoais foram silenciados. Alarmes de medicamentos continuam ativos para sua segurança.',
      );
    } else {
      await setSilenceToday('');
      for (const item of [...presets, ...alarms].filter((x) => x.enabled)) {
        await ensureScheduled(item);
      }
      setSilenced(false);
      Alert.alert(
        'Ativado',
        'Presets e alarmes pessoais foram reativados a partir de agora.',
      );
    }
  }

  function handlePressSilenceToday() {
    if (!silenced) {
      Alert.alert(
        'Silenciar hoje',
        'Somente alarmes pessoais e presets serão silenciados. Alarmes de medicamentos continuam ativos para sua segurança.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'OK', onPress: () => toggleSilenceToday(true) },
        ],
        { cancelable: true },
      );
    } else {
      toggleSilenceToday(false);
    }
  }

  async function createQuickPreset(kind) {
    if (await isSilencedToday(todayISO())) {
      Alert.alert('Silenciado hoje', 'Reative os alarmes para criar novos.');
      return;
    }
    let payload;
    if (kind === 'water') {
      payload = {
        label: 'Beber água',
        mode: 'interval',
        intervalMinutes: 120,
        enabled: true,
        vibrate: true,
        isPreset: true,
      };
    } else if (kind === 'stretch') {
      payload = {
        label: 'Alongar',
        mode: 'daily',
        time: '15:00',
        enabled: true,
        vibrate: true,
        isPreset: true,
      };
    } else if (kind === 'sun') {
      payload = {
        label: 'Tomar sol',
        mode: 'daily',
        time: '10:00',
        enabled: true,
        vibrate: true,
        isPreset: true,
      };
    } else {
      payload = {
        label: 'Meu preset',
        mode: 'daily',
        time: '09:00',
        enabled: true,
        vibrate: true,
        isPreset: true,
      };
    }
    const added = await addAlarm(userId, payload);
    setPresets((prev) => [added, ...prev]);
    await ensureScheduled(added);
  }

  async function togglePresetEnabled(preset) {
    const nowSilenced = await isSilencedToday(todayISO());
    const willEnable = !preset.enabled;
    const upd = await updateAlarm(userId, {
      id: preset.id,
      enabled: willEnable,
    });
    setPresets((prev) =>
      prev.map((x) => (x.id === upd.id ? { ...x, enabled: willEnable } : x)),
    );
    if (willEnable) {
      if (!nowSilenced) {
        await ensureScheduled({ ...preset, ...upd, enabled: true });
      }
    } else {
      if (preset.notificationId) await cancel(preset.notificationId);
      await updateAlarm(userId, { id: preset.id, notificationId: null });
      setPresets((prev) =>
        prev.map((x) =>
          x.id === preset.id ? { ...upd, notificationId: null } : x,
        ),
      );
    }
  }

  async function deletePreset(preset) {
    if (preset.notificationId) await cancel(preset.notificationId);
    await removeAlarm(userId, preset.id);
    setPresets((prev) => prev.filter((x) => x.id !== preset.id));
  }

  const PresetRow = ({ item }) => {
    const active = !!item.enabled;
    return (
      <View style={styles.presetRow}>
        <TouchableOpacity
          onPress={() => togglePresetEnabled(item)}
          onLongPress={() =>
            navigation.navigate(ROUTES.EDITAR_ALARME, {
              id: item.id,
              isPreset: true,
            })
          }
          activeOpacity={0.9}
          style={[
            styles.presetBubble,
            active && { backgroundColor: '#ECD5FF' },
            isLargeButtons && {
              paddingVertical: 16,
            },
          ]}
        >
          <Text
            style={[
              styles.presetText,
              {
                color: LILAC_TEXT,
                fontSize: applyFontScale(14),
              },
            ]}
          >
            {item.label}
            {item.mode === 'interval'
              ? ` • ${item.intervalMinutes}m`
              : ` • ${item.time}`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.iconBtn,
            isLargeButtons && {
              paddingHorizontal: 6,
              paddingVertical: 6,
            },
          ]}
          onPress={() =>
            navigation.navigate(ROUTES.EDITAR_ALARME, {
              id: item.id,
              isPreset: true,
            })
          }
        >
          <Text
            style={{
              fontSize: applyFontScale(16),
              color: LILAC_TEXT,
            }}
          >
            ✏️
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.iconBtn,
            isLargeButtons && {
              paddingHorizontal: 6,
              paddingVertical: 6,
            },
          ]}
          onPress={() => deletePreset(item)}
        >
          <Text
            style={{
              fontSize: applyFontScale(16),
              color: colors.danger,
            }}
          >
            🗑️
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  async function togglePersonalEnabled(a) {
    const nowSilenced = await isSilencedToday(todayISO());
    const willEnable = !a.enabled;
    const upd = await updateAlarm(userId, { id: a.id, enabled: willEnable });
    setAlarms((prev) =>
      prev.map((x) => (x.id === upd.id ? { ...x, enabled: willEnable } : x)),
    );
    if (willEnable) {
      if (!nowSilenced) {
        await ensureScheduled({ ...a, ...upd, enabled: true });
      }
    } else {
      if (a.notificationId) await cancel(a.notificationId);
      await updateAlarm(userId, { id: a.id, notificationId: null });
      setAlarms((prev) =>
        prev.map((x) =>
          x.id === a.id ? { ...upd, notificationId: null } : x,
        ),
      );
    }
  }

  async function deletePersonal(a) {
    if (a.notificationId) await cancel(a.notificationId);
    await removeAlarm(userId, a.id);
    setAlarms((prev) => prev.filter((x) => x.id !== a.id));
  }

  function renderMedItem({ item }) {
    const title = formatMedTitle(item);
    return (
      <Card style={[styles.card, { marginBottom: 8 }]}>
        <Card.Content>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.title,
                  { color: LILAC_TEXT, fontSize: applyFontScale(16) },
                ]}
              >
                {title}
              </Text>
              {!!item.horario && (
                <Text
                  style={{
                    color: colors.pillDark,
                    fontSize: applyFontScale(13),
                  }}
                >
                  ⏰ {item.horario}
                </Text>
              )}
            </View>
            <View style={styles.row}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(ROUTES.ADICIONAR_MEDICAMENTO, {
                    id: item.id,
                  })
                }
                style={[
                  styles.textActionBtn,
                  isLargeButtons && {
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.textActionEdit,
                    { fontSize: applyFontScale(13) },
                  ]}
                >
                  EDITAR
                </Text>
              </TouchableOpacity>
              {/* Botão DESATIVAR removido: desativação será feita pela edição do medicamento */}
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  }

  function renderPersonalItem({ item }) {
    return (
      <Card style={[styles.card, { marginBottom: 8 }]}>
        <Card.Content>
          <View style={styles.personalHeaderRow}>
            <Text
              style={[
                styles.title,
                { color: LILAC_TEXT, fontSize: applyFontScale(16) },
              ]}
            >
              {item.label}
            </Text>
            <View style={styles.personalStatusRow}>
              <Text
                style={{
                  color: LILAC_TEXT,
                  marginRight: 6,
                  fontSize: applyFontScale(13),
                }}
              >
                {item.enabled ? 'Ativo' : 'Inativo'}
              </Text>
              <Switch
                value={item.enabled}
                onValueChange={() => togglePersonalEnabled(item)}
                trackColor={{
                  false: '#E5DEFF',
                  true: '#C4B5FD',
                }}
                thumbColor={item.enabled ? '#7C3AED' : '#F9FAFB'}
                style={isLargeButtons ? { transform: [{ scale: 1.05 }] } : null}
              />
            </View>
          </View>

          <Text
            style={{
              color: colors.pillDark,
              fontSize: applyFontScale(13),
              marginTop: 2,
            }}
          >
            {item.mode === 'interval'
              ? `🔁 a cada ${item.intervalMinutes} min`
              : `⏰ ${item.time || '--:--'} (diário)`}
          </Text>

          <Text
            style={{
              color: colors.pillDark,
              fontSize: applyFontScale(13),
              marginTop: 2,
            }}
          >
            {item.vibrate ? '📳 vibra' : '🚫 vibração off'}
          </Text>

          <View
            style={[
              styles.personalActionsRow,
              isLargeButtons && { marginTop: 10 },
            ]}
          >
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(ROUTES.EDITAR_ALARME, {
                  id: item.id,
                })
              }
              style={[
                styles.textActionBtn,
                isLargeButtons && {
                  paddingHorizontal: 8,
                  paddingVertical: 6,
                },
              ]}
            >
              <Text
                style={[
                  styles.textActionEdit,
                  { fontSize: applyFontScale(13) },
                ]}
              >
                EDITAR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => triggerTest({ title: item.label })}
              style={[
                styles.textActionBtn,
                isLargeButtons && {
                  paddingHorizontal: 8,
                  paddingVertical: 6,
                },
              ]}
            >
              <Text
                style={[
                  styles.textActionEdit,
                  { fontSize: applyFontScale(13) },
                ]}
              >
                TESTAR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => deletePersonal(item)}
              style={[
                styles.textActionBtn,
                isLargeButtons && {
                  paddingHorizontal: 8,
                  paddingVertical: 6,
                },
              ]}
            >
              <Text
                style={[
                  styles.textActionDanger,
                  { fontSize: applyFontScale(13) },
                ]}
              >
                EXCLUIR
              </Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={[
            styles.backBtn,
            isLargeButtons && {
              width: 52,
              height: 52,
            },
          ]}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="arrow-back"
            size={backIconSize}
            color={colors.textPrimary}
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            { fontSize: applyFontScale(22) },
          ]}
        >
          Alarmes
        </Text>
      </View>

      <View style={styles.top}>
        <TouchableOpacity
          onPress={handlePressSilenceToday}
          style={[
            styles.silenceBtn,
            silenced && styles.silenceBtnActive,
            isLargeButtons && {
              paddingVertical: 14,
              paddingHorizontal: 20,
            },
          ]}
          activeOpacity={0.9}
        >
          <Text
            style={[
              styles.silenceText,
              silenced && styles.silenceTextActive,
              { fontSize: applyFontScale(14) },
            ]}
          >
            {silenced ? 'Silenciado hoje' : 'Silenciar hoje'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.presetsContainer}>
        <Text
          style={[
            styles.presetsTitle,
            { fontSize: applyFontScale(16) },
          ]}
        >
          Presets rápidos
        </Text>

        <View style={styles.presetsButtonsRow}>
          <TouchableOpacity
            style={[
              styles.presetQuickBtn,
              isLargeButtons && {
                paddingVertical: 16,
                paddingHorizontal: 18,
              },
            ]}
            onPress={() => createQuickPreset('water')}
          >
            <Text
              style={[
                styles.presetQuickLabel,
                { fontSize: applyFontScale(13) },
              ]}
            >
              ÁGUA
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.presetQuickBtn,
              isLargeButtons && {
                paddingVertical: 16,
                paddingHorizontal: 18,
              },
            ]}
            onPress={() => createQuickPreset('stretch')}
          >
            <Text
              style={[
                styles.presetQuickLabel,
                { fontSize: applyFontScale(13) },
              ]}
            >
              ALONGAR
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.presetQuickBtn,
              isLargeButtons && {
                paddingVertical: 16,
                paddingHorizontal: 18,
              },
            ]}
            onPress={() => createQuickPreset('sun')}
          >
            <Text
              style={[
                styles.presetQuickLabel,
                { fontSize: applyFontScale(13) },
              ]}
            >
              SOL
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.presetQuickBtn,
              styles.presetQuickBtnOutline,
              isLargeButtons && {
                paddingVertical: 16,
                paddingHorizontal: 18,
              },
            ]}
            onPress={() =>
              navigation.navigate(ROUTES.EDITAR_ALARME, {
                id: null,
                isPreset: true,
              })
            }
          >
            <Text
              style={[
                styles.presetQuickLabel,
                { fontSize: applyFontScale(13) },
              ]}
            >
              CRIAR PRESET
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ gap: 8 }}>
          {presets.length === 0 ? (
            <Text
              style={{
                color: colors.pillDark,
                fontSize: applyFontScale(13),
              }}
            >
              Nenhum preset criado.
            </Text>
          ) : (
            presets.map((p) => <PresetRow key={p.id} item={p} />)
          )}
        </View>
      </View>

      <FlatList
        ListHeaderComponent={
          <View>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.textPrimary,
                  marginHorizontal: 16,
                  fontSize: applyFontScale(16),
                },
              ]}
            >
              De Medicamentos
            </Text>
            <FlatList
              data={meds}
              keyExtractor={(i) => i.id}
              renderItem={renderMedItem}
              contentContainerStyle={{
                padding: 16,
                paddingTop: 8,
                paddingBottom: 0,
              }}
              ListEmptyComponent={
                <Text
                  style={{
                    color: colors.pillDark,
                    marginHorizontal: 16,
                    fontSize: applyFontScale(13),
                  }}
                >
                  Nenhum alarme de medicamento ativo.
                </Text>
              }
            />
            <Divider />
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.textPrimary,
                  marginHorizontal: 16,
                  marginTop: 8,
                  fontSize: applyFontScale(16),
                },
              ]}
            >
              Pessoais
            </Text>
          </View>
        }
        data={alarms}
        keyExtractor={(i) => i.id}
        renderItem={renderPersonalItem}
        contentContainerStyle={{
          padding: 16,
          paddingTop: 8,
          paddingBottom: 120,
        }}
        ListEmptyComponent={
          <Text
            style={{
              color: colors.pillDark,
              marginHorizontal: 16,
              fontSize: applyFontScale(13),
            }}
          >
            Nenhum alarme pessoal.
          </Text>
        }
      />

      <FAB
        icon="plus"
        label="Novo alarme pessoal"
        style={[
          styles.fab,
          isLargeButtons && {
            height: 64,
            borderRadius: 32,
          },
        ]}
        color="#3B0764"
        labelStyle={[
          styles.fabLabel,
          { fontSize: applyFontScale(14) },
        ]}
        onPress={() =>
          navigation.navigate(ROUTES.EDITAR_ALARME, { id: null })
        }
      />
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1 },

    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 8,
    },
    backBtn: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.textPrimary,
    },

    top: {
      paddingHorizontal: 16,
      paddingTop: 6,
      paddingBottom: 8,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    silenceBtn: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 24,
      backgroundColor: '#ECD5FF',
    },
    silenceBtnActive: {
      backgroundColor: '#7C3AED',
    },
    silenceText: {
      fontWeight: '700',
      color: LILAC_TEXT,
    },
    silenceTextActive: {
      color: '#FFFFFF',
    },

    card: {
      backgroundColor: '#ECD5FF',
      borderRadius: 16,
    },

    row: { flexDirection: 'row', alignItems: 'center' },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
    title: { fontSize: 16, fontWeight: '700' },

    presetsContainer: {
      marginHorizontal: 16,
      marginBottom: 12,
      paddingTop: 8,
      paddingBottom: 4,
    },
    presetsTitle: {
      color: colors.textPrimary,
      fontWeight: '600',
      fontSize: 16,
      marginBottom: 8,
    },
    presetsButtonsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
      alignItems: 'center',
    },
    presetQuickBtn: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: '#ECD5FF',
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    presetQuickBtnOutline: {
      backgroundColor: '#ECD5FF',
    },
    presetQuickLabel: {
      fontWeight: '600',
      letterSpacing: 0.3,
      color: '#3B0764',
      fontSize: 13,
    },

    presetRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    presetBubble: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 22,
      backgroundColor: '#F4EBFF',
      flexGrow: 1,
    },
    presetText: {
      fontWeight: '600',
    },
    iconBtn: { marginLeft: 10 },

    textActionBtn: {
      paddingHorizontal: 4,
      paddingVertical: 2,
    },
    textActionEdit: {
      fontSize: 13,
      fontWeight: '700',
      color: '#3B0764',
    },
    textActionDanger: {
      fontSize: 13,
      fontWeight: '700',
      color: '#7d4bf1',
    },

    personalHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    personalStatusRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    personalActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
    },

    fab: {
      position: 'absolute',
      right: 16,
      bottom: 24,
      backgroundColor: '#E3C2FF',
    },
    fabLabel: {
      color: '#3B0764',
      fontWeight: '600',
      textTransform: 'none',
    },
  });
