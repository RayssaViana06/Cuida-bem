import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

import { toISODate, toTimeHHMM } from '@/utils/datetime';
import { useAgenda } from '@/features/agenda/store/agenda.context';
import { useAccessibility } from '@/features/acessibilidade/store/acessibilidade.context';

const LILAC_TEXT = '#3B0764';

function isValidHHMM(v) {
  return /^\d{2}:\d{2}$/.test(v || '');
}

export default function AddCompromissoScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { settings } = useAccessibility();
  const styles = makeStyles(colors, settings);
  const { add, update, getById } = useAgenda();

  const id = route?.params?.id ?? null;
  const baseDate = route?.params?.date ?? '';

  const editing = useMemo(() => (id ? getById(id) : null), [id, getById]);

  const [form, setForm] = useState({
    id: editing?.id || null,
    date: toISODate(editing?.date || baseDate || ''),
    time: toTimeHHMM(editing?.time || ''),
    category: editing?.category || '',
    specialty: editing?.specialty || '',
    doctor: editing?.doctor || '',
    profile: editing?.profile || '',
    reminder: editing?.reminder || '',
  });

  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleChange = (field, value) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    const date = toISODate(form.date);
    const time = toTimeHHMM(form.time);

    if (!date) {
      Alert.alert('Data inválida', 'Selecione uma data válida (YYYY-MM-DD).');
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      Alert.alert('Hora inválida', 'Use o formato HH:MM, por exemplo 09:30.');
      return;
    }

    const payload = { ...form, date, time };
    if (payload.id) await update(payload);
    else await add(payload);

    navigation.goBack();
  };

  const isEditing = Boolean(form.id);

  const openTimePicker = () => {
    setShowTimePicker(true);
  };

  const onChangeTime = (_event, selectedDate) => {
    if (Platform.OS === 'android') setShowTimePicker(false);

    if (selectedDate) {
      const hh = String(selectedDate.getHours()).padStart(2, '0');
      const mm = String(selectedDate.getMinutes()).padStart(2, '0');
      handleChange('time', `${hh}:${mm}`);
    }
  };

  const timeToDate = () => {
    const now = new Date();
    const base = isValidHHMM(form.time) ? form.time : '09:00';
    const [hh, mm] = base.split(':').map(n => parseInt(n, 10));
    now.setHours(Number.isNaN(hh) ? 9 : hh, Number.isNaN(mm) ? 0 : mm, 0, 0);
    return now;
  };

  return (
    <View style={styles.outer}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="arrow-back"
              size={settings.largeButtons ? 26 : 24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>

          <Text style={styles.title}>
            {isEditing ? 'Editar compromisso' : 'Novo compromisso'}
          </Text>
        </View>

        <Text style={styles.subtitle}>{form.date || 'Sem data'}</Text>

        <TouchableOpacity
          style={styles.inputPill}
          onPress={openTimePicker}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.inputPillText,
              { color: form.time ? LILAC_TEXT : colors.pillDark },
            ]}
          >
            {form.time || 'Horário'}
          </Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={timeToDate()}
            mode="time"
            is24Hour
            display="default"
            onChange={onChangeTime}
          />
        )}

        <TextInput
          style={[styles.inputPill, styles.inputPillText]}
          placeholder="Categoria"
          placeholderTextColor={colors.pillDark}
          value={form.category}
          onChangeText={v => handleChange('category', v)}
        />

        <TextInput
          style={[styles.inputPill, styles.inputPillText]}
          placeholder="Especialidade"
          placeholderTextColor={colors.pillDark}
          value={form.specialty}
          onChangeText={v => handleChange('specialty', v)}
        />

        <TextInput
          style={[styles.inputPill, styles.inputPillText]}
          placeholder="Médico"
          placeholderTextColor={colors.pillDark}
          value={form.doctor}
          onChangeText={v => handleChange('doctor', v)}
        />

        <TextInput
          style={[styles.inputPill, styles.inputPillText]}
          placeholder="Lembrete"
          placeholderTextColor={colors.pillDark}
          value={form.reminder}
          onChangeText={v => handleChange('reminder', v)}
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>
            {isEditing ? 'Salvar alterações' : 'Concluir'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (colors, settings) =>
  StyleSheet.create({
    outer: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingTop: 32,
    },
    card: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    backBtn: {
      width: settings.largeButtons ? 48 : 44,
      height: settings.largeButtons ? 48 : 44,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    title: {
      fontSize: 20 * settings.fontScale,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    subtitle: {
      color: colors.pillDark,
      marginBottom: 16,
      fontSize: 14 * settings.fontScale * 1.05,
    },
    inputPill: {
      backgroundColor: '#F4EBFF',
      borderRadius: 20,
      paddingHorizontal: settings.largeButtons ? 20 : 16,
      paddingVertical: settings.largeButtons ? 14 : 10,
      marginBottom: 12,
    },
    inputPillText: {
      color: LILAC_TEXT,
      fontSize: 14 * settings.fontScale * 1.05,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: settings.largeButtons ? 18 : 14,
      borderRadius: 20,
      alignItems: 'center',
      marginTop: 16,
    },
    buttonText: {
      fontWeight: '600',
      fontSize: 15 * settings.fontScale * 1.05,
      color: '#3B0764',
    },
  });
