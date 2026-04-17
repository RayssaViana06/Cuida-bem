import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Switch, Alert, Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { toISODate, toTimeHHMM } from '@/utils/datetime';
import { ROUTES } from '@/navigation/routes';
import {
  getReminderById,
  upsertReminder,
} from '@/features/lembretes/services/reminders.storage';
import {
  scheduleDailyAt,
  scheduleAtDateTime,
  cancel as cancelNotification,
} from '@/features/medicamentos/services/notifications.service';
import { useAccessibility } from '@/features/acessibilidade/store/acessibilidade.context';
import { useAuth } from '@/features/AuthContext';
import { resolveAuthUserKey } from '@/features/auth/resolveAuthUserKey';

export default function EditReminderScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { settings } = useAccessibility();
  const { user } = useAuth();
  const userKey = resolveAuthUserKey(user); // 🔐 chave estável por usuário (id ou email)

  const applyFontScale = (baseSize) => {
    const fontScale = settings?.fontScale ?? 1;
    if (fontScale === 1) return baseSize;
    if (baseSize >= 24) {
      return baseSize * fontScale * 0.95;
    }
    if (baseSize >= 16) {
      return baseSize * fontScale;
    }
    return baseSize * fontScale * 1.05;
  };

  const isLargeButtons = !!settings?.largeButtons;
  const backIconSize = isLargeButtons ? 30 : 24;
  const primaryBtnBaseFont = isLargeButtons ? 18 : 16;

  const id = route?.params?.id ?? null;
  const [loaded, setLoaded] = useState(false);

  const [form, setForm] = useState({
    id: null,
    title: '',
    notes: '',
    date: '',
    time: '',
    repeatDaily: false,
    sound: 'default',
    vibrate: true,
    notificationId: null,
  });

  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id || !userKey) {
        setLoaded(true);
        return;
      }
      const r = await getReminderById(userKey, id);
      if (r) {
        setForm({
          id: r.id,
          title: r.title || '',
          notes: r.notes || '',
          date: toISODate(r.date || ''),
          time: toTimeHHMM(r.time || ''),
          repeatDaily: !!r.repeatDaily,
          sound: r.sound ?? 'default',
          vibrate: r.vibrate ?? true,
          notificationId: r.notificationId || null,
        });
      }
      setLoaded(true);
    })();
  }, [id, userKey]);

  function change(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function onSave() {
    if (!userKey) {
      Alert.alert('Erro', 'Não foi possível identificar o usuário.');
      return;
    }

    const date = toISODate(form.date || '');
    const time = toTimeHHMM(form.time || '');
    const hasTime = /^\d{2}:\d{2}$/.test(time || '');

    if (!form.title.trim()) {
      Alert.alert('Título obrigatório', 'Dê um nome para o lembrete.');
      return;
    }

    if (form.repeatDaily) {
      if (!hasTime) {
        Alert.alert(
          'Horário obrigatório',
          'Para lembretes diários, informe um horário no formato HH:MM.'
        );
        return;
      }
    } else {
      if (date && !hasTime) {
        Alert.alert(
          'Horário obrigatório',
          'Selecione um horário (HH:MM) para a data escolhida.'
        );
        return;
      }
      if (!date && !hasTime) {
        Alert.alert(
          'Defina quando lembrar',
          'Informe uma data e horário, ou ative "Repetir diariamente" para agendar o lembrete.'
        );
        return;
      }
    }

    if (form.notificationId) {
      try {
        await cancelNotification(form.notificationId);
      } catch {}
    }

    let notificationId = null;
    try {
      if (form.repeatDaily && hasTime) {
        notificationId = await scheduleDailyAt(time, {
          title: form.title,
          body: form.notes,
          data: { type: 'reminder' },
          sound: form.sound,
          vibrate: form.vibrate,
        });
      } else if (date && hasTime) {
        notificationId = await scheduleAtDateTime(date, time, {
          title: form.title,
          body: form.notes,
          data: { type: 'reminder' },
          sound: form.sound,
          vibrate: form.vibrate,
        });
      }
    } catch (e) {
      console.warn('Erro ao agendar notificação de lembrete:', e);
    }

    await upsertReminder(userKey, {
      ...form,
      date,
      time,
      notificationId,
      repeatDaily: !!form.repeatDaily,
    });

    navigation.navigate(ROUTES.LEMBRETES);
  }

  if (!loaded) return null;

  const headerTitle = form.id ? 'Editar lembrete' : 'Novo lembrete';

  return (
    <View style={styles.container}>
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
            {
              color: colors.textPrimary,
              fontSize: applyFontScale(22),
            },
          ]}
        >
          {headerTitle}
        </Text>
      </View>

      <View style={styles.content}>
        <TextInput
          style={[
            styles.input,
            {
              fontSize: applyFontScale(16),
              paddingVertical: isLargeButtons ? 18 : 12,
            },
          ]}
          placeholder="Título (ex.: Pagar conta)"
          placeholderTextColor={colors.pillDark}
          value={form.title}
          onChangeText={(v) => change('title', v)}
        />

        <TextInput
          style={[
            styles.input,
            {
              fontSize: applyFontScale(16),
              paddingVertical: isLargeButtons ? 18 : 12,
            },
          ]}
          placeholder="Notas (opcional)"
          placeholderTextColor={colors.pillDark}
          value={form.notes}
          onChangeText={(v) => change('notes', v)}
        />

        <TouchableOpacity
          style={[
            styles.input,
            {
              paddingVertical: isLargeButtons ? 18 : 12,
            },
          ]}
          onPress={() => setShowDate(true)}
        >
          <Text
            style={[
              styles.inputText,
              {
                fontSize: applyFontScale(16),
              },
              !form.date && { color: colors.pillDark },
            ]}
          >
            {form.date ? form.date : 'Data (YYYY-MM-DD, opcional)'}
          </Text>
        </TouchableOpacity>
        {showDate && (
          <DateTimePicker
            value={form.date ? new Date(form.date + 'T12:00:00') : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(_, d) => {
              setShowDate(false);
              if (d) change('date', toISODate(d));
            }}
          />
        )}

        <TouchableOpacity
          style={[
            styles.input,
            {
              paddingVertical: isLargeButtons ? 18 : 12,
            },
          ]}
          onPress={() => setShowTime(true)}
        >
          <Text
            style={[
              styles.inputText,
              {
                fontSize: applyFontScale(16),
              },
              !form.time && { color: colors.pillDark },
            ]}
          >
            {form.time ? form.time : 'Hora (HH:MM, opcional)'}
          </Text>
        </TouchableOpacity>
        {showTime && (
          <DateTimePicker
            value={
              form.time
                ? new Date(`1970-01-01T${form.time}:00`)
                : new Date()
            }
            mode="time"
            is24Hour
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, d) => {
              setShowTime(false);
              if (d) {
                const hh = String(d.getHours()).padStart(2, '0');
                const mm = String(d.getMinutes()).padStart(2, '0');
                change('time', `${hh}:${mm}`);
              }
            }}
          />
        )}

        <View style={styles.row}>
          <Text
            style={[
              styles.label,
              {
                fontSize: applyFontScale(16),
              },
            ]}
          >
            Repetir diariamente
          </Text>
          <Switch
            value={form.repeatDaily}
            onValueChange={(v) => change('repeatDaily', v)}
            trackColor={{ false: colors.pillLight, true: '#7c4af0' }}
            thumbColor={form.repeatDaily ? '#3B0764' : '#f9fafb'}
          />
        </View>

        <View style={styles.row}>
          <Text
            style={[
              styles.label,
              {
                fontSize: applyFontScale(16),
              },
            ]}
          >
            Vibrar
          </Text>
          <Switch
            value={form.vibrate}
            onValueChange={(v) => change('vibrate', v)}
            trackColor={{ false: colors.pillLight, true: '#7c4af0' }}
            thumbColor={form.vibrate ? '#3B0764' : '#f9fafb'}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            isLargeButtons && {
              paddingVertical: 24,
              borderRadius: 12,
            },
          ]}
          onPress={onSave}
        >
          <Text
            style={[
              styles.buttonText,
              {
                fontSize: applyFontScale(primaryBtnBaseFont),
              },
            ]}
          >
            {form.id ? 'Salvar' : 'Concluir'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

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
  },

  content: { flex: 1, padding: 16, paddingTop: 8 },

  input: {
    borderWidth: 1,
    borderColor: colors.pillLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  inputText: { color: colors.textPrimary },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  label: { color: colors.textPrimary },

  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: colors.onPrimary, fontWeight: 'bold' },
});
