import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import {
  useTheme,
  Button,
  RadioButton,
  Switch,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import {
  getAlarmById,
  addAlarm,
  updateAlarm,
} from '@/features/alarmes/services/alarms.storage';
import {
  scheduleDailyAt,
  scheduleEveryIntervalMinutes,
  cancel,
} from '@/features/medicamentos/services/notifications.service';
import { isSilencedToday } from '@/features/alarmes/services/alarmSettings.storage';
import { useAccessibility } from '@/features/acessibilidade/store/acessibilidade.context';
import { useAuth } from '@/features/AuthContext';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function EditAlarmScreen({ navigation, route }) {
  const { id = null, isPreset = false } = route.params || {};
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { settings } = useAccessibility();
  const { user } = useAuth();
  const userId = user?.id ?? 'anon';

  const applyFontScale = (base) => {
    const fontScale = settings?.fontScale ?? 1;
    if (fontScale === 1) return base;
    if (base >= 20) return base * fontScale * 0.95;
    if (base >= 14) return base * fontScale;
    return base * fontScale * 1.05;
  };

  const isLargeButtons = !!settings?.largeButtons;
  const backIconSize = isLargeButtons ? 30 : 24;

  const [label, setLabel] = useState('');
  const [mode, setMode] = useState('daily');
  const [time, setTime] = useState('09:00');
  const [intervalMinutes, setIntervalMinutes] = useState('120');
  const [profile, setProfile] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [vibrate, setVibrate] = useState(true);
  const [showTime, setShowTime] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const a = await getAlarmById(userId, id);
      if (!a) return;
      setLabel(a.label || '');
      setMode(a.mode || 'daily');
      setTime(a.time || '09:00');
      setIntervalMinutes(String(a.intervalMinutes || '120'));
      setProfile(a.profile || '');
      setEnabled(!!a.enabled);
      setVibrate(a.vibrate !== false);
    })();
  }, [id, userId]);

  async function onSave() {
    if (!label.trim()) {
      Alert.alert('Informe um nome');
      return;
    }
    const base = {
      label: label.trim(),
      mode,
      time: mode === 'daily' ? time : null,
      intervalMinutes:
        mode === 'interval' ? Number(intervalMinutes || 120) : null,
      profile: profile || '',
      enabled,
      vibrate,
      isPreset,
    };

    let saved;
    if (id) {
      saved = await updateAlarm(userId, { id, ...base });
      if (saved?.notificationId && !enabled) {
        await cancel(saved.notificationId);
        saved = await updateAlarm(userId, { id, notificationId: null });
      }
    } else {
      saved = await addAlarm(userId, base);
    }

    if (saved?.enabled && !(await isSilencedToday(todayISO()))) {
      let nid = null;
      if (saved.mode === 'interval') {
        nid = await scheduleEveryIntervalMinutes(
          saved.intervalMinutes || 120,
          { title: saved.label, vibrate },
        );
      } else if (saved.time) {
        nid = await scheduleDailyAt(saved.time, {
          title: saved.label,
          vibrate,
        });
      }
      if (nid) {
        await updateAlarm(userId, { id: saved.id, notificationId: nid });
      }
    }

    navigation.goBack();
  }

  function onChangeTime(_e, d) {
    setShowTime(Platform.OS === 'ios');
    if (!d) return;
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    setTime(`${hh}:${mm}`);
  }

  const headerTitle = id
    ? 'Editar alarme'
    : isPreset
    ? 'Novo preset'
    : 'Novo alarme';

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            styles.backBtn,
            isLargeButtons && { width: 52, height: 52 },
          ]}
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
            { fontSize: applyFontScale(20) },
          ]}
        >
          {headerTitle}
        </Text>
      </View>

      <View style={styles.content}>
        <Text
          style={[
            styles.label,
            { fontSize: applyFontScale(13) },
          ]}
        >
          Nome
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              fontSize: applyFontScale(14),
            },
            isLargeButtons && { paddingVertical: 12 },
          ]}
          value={label}
          onChangeText={setLabel}
          placeholder="Ex.: Beber água"
          placeholderTextColor={colors.pillDark}
        />

        <Text
          style={[
            styles.label,
            { fontSize: applyFontScale(13) },
          ]}
        >
          Modo
        </Text>
        <RadioButton.Group onValueChange={setMode} value={mode}>
          <View style={styles.row}>
            <RadioButton
              value="daily"
              color="#7C3AED"
              uncheckedColor="#A855F7"
            />
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: applyFontScale(14),
              }}
            >
              Diário (hora fixa)
            </Text>
          </View>
          <View style={styles.row}>
            <RadioButton
              value="interval"
              color="#7C3AED"
              uncheckedColor="#A855F7"
            />
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: applyFontScale(14),
              }}
            >
              Intervalo (em minutos)
            </Text>
          </View>
        </RadioButton.Group>

        {mode === 'daily' ? (
          <>
            <Text
              style={[
                styles.label,
                { fontSize: applyFontScale(13) },
              ]}
            >
              Horário
            </Text>
            <TouchableOpacity
              onPress={() => setShowTime(true)}
              style={[
                styles.pill,
                isLargeButtons && {
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                },
              ]}
            >
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: applyFontScale(14),
                }}
              >
                {time}
              </Text>
            </TouchableOpacity>
            {showTime && (
              <DateTimePicker
                value={(() => {
                  const [hh, mm] = time
                    .split(':')
                    .map((n) => parseInt(n, 10));
                  const d = new Date();
                  d.setHours(
                    Number.isNaN(hh) ? 9 : hh,
                    Number.isNaN(mm) ? 0 : mm,
                    0,
                    0,
                  );
                  return d;
                })()}
                mode="time"
                is24Hour
                display="default"
                onChange={onChangeTime}
              />
            )}
          </>
        ) : (
          <>
            <Text
              style={[
                styles.label,
                { fontSize: applyFontScale(13) },
              ]}
            >
              Intervalo (min)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  fontSize: applyFontScale(14),
                },
                isLargeButtons && { paddingVertical: 12 },
              ]}
              value={intervalMinutes}
              onChangeText={setIntervalMinutes}
              keyboardType="numeric"
            />
          </>
        )}

        <View
          style={[
            styles.row,
            { justifyContent: 'space-between', marginTop: 12 },
          ]}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: applyFontScale(14),
            }}
          >
            Ativo
          </Text>
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            trackColor={{ false: '#E5DEFF', true: '#C4B5FD' }}
            thumbColor={enabled ? '#7C3AED' : '#F9FAFB'}
            style={isLargeButtons ? { transform: [{ scale: 1.05 }] } : null}
          />
        </View>

        <View
          style={[
            styles.row,
            { justifyContent: 'space-between', marginTop: 12 },
          ]}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: applyFontScale(14),
            }}
          >
            Vibração
          </Text>
          <Switch
            value={vibrate}
            onValueChange={setVibrate}
            trackColor={{ false: '#E5DEFF', true: '#C4B5FD' }}
            thumbColor={vibrate ? '#7C3AED' : '#F9FAFB'}
            style={isLargeButtons ? { transform: [{ scale: 1.05 }] } : null}
          />
        </View>

        <Button
          mode="contained"
          onPress={onSave}
          style={[
            styles.saveButton,
            isLargeButtons && { paddingVertical: 14 },
          ]}
          color="#ECD5FF"
          labelStyle={[
            styles.saveButtonLabel,
            { fontSize: applyFontScale(15) },
          ]}
        >
          Salvar
        </Button>
      </View>
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
      fontSize: 20,
      fontWeight: '700',
      color: colors.textPrimary,
    },

    content: { padding: 16, paddingTop: 8 },
    label: {
      color: colors.textPrimary,
      marginTop: 8,
      marginBottom: 6,
      fontSize: 13,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.textPrimary,
    },
    row: { flexDirection: 'row', alignItems: 'center' },
    pill: {
      backgroundColor: colors.surface,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 10,
      alignSelf: 'flex-start',
    },
    saveButton: {
      marginTop: 18,
      borderRadius: 10,
    },
    saveButtonLabel: {
      color: '#371162',
      fontWeight: '600',
    },
  });
