import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { useAccessibility } from '@/features/acessibilidade/store/acessibilidade.context';

import { ROUTES } from '@/navigation/routes';
import { toISODate } from '@/utils/datetime';
import { useAgenda } from '@/features/agenda/store/agenda.context';

const LILAC_TEXT = '#3B0764';

export default function AgendaScreen({ navigation }) {
  const { colors } = useTheme();
  const { settings } = useAccessibility();
  const styles = makeStyles(colors);

  const { items, remove } = useAgenda();

  const applyFontScale = (base) => {
    const fs = settings?.fontScale ?? 1;
    if (fs === 1) return base;
    if (base >= 22) return base * fs * 0.95;
    if (base >= 16) return base * fs;
    return base * fs * 1.05;
  };

  const isLargeButtons = !!settings?.largeButtons;
  const backIconSize = isLargeButtons ? 30 : 24;

  const [selected, setSelected] = useState('');

  const compromissosDia = useMemo(() => {
    if (!selected) return [];
    return items
      .filter(c => c.date === selected)
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }, [items, selected]);

  const onDeletePress = id => {
    Alert.alert(
      'Excluir compromisso',
      'Tem certeza que deseja excluir este compromisso?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => remove(id) },
      ],
    );
  };

  const selectedBg = '#C084FC';
  const selectedText = '#3B0764';

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={[
            styles.backBtn,
            isLargeButtons && { width: 52, height: 52 },
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
            styles.title,
            { fontSize: applyFontScale(24) },
          ]}
        >
          Agenda
        </Text>
      </View>

      <Calendar
        onDayPress={day => setSelected(toISODate(day?.dateString || day))}
        markedDates={
          selected
            ? {
                [selected]: {
                  selected: true,
                  marked: true,
                  selectedColor: selectedBg,
                  selectedTextColor: selectedText,
                },
              }
            : {}
        }
        style={styles.calendar}
        theme={{
          calendarBackground: colors.surface,
          dayTextColor: colors.textPrimary,
          monthTextColor: colors.textPrimary,
          textDisabledColor: colors.pillDark,
          todayTextColor: '#7C3AED',
          arrowColor: '#7C3AED',
          selectedDayBackgroundColor: selectedBg,
          selectedDayTextColor: selectedText,
          textMonthFontSize: applyFontScale(20),
          textDayFontSize: applyFontScale(14),
          textDayHeaderFontSize: applyFontScale(13),
        }}
      />

      <Text
        style={[
          styles.subTitle,
          { fontSize: applyFontScale(16) },
        ]}
      >
        {selected ? `Compromissos de ${selected}` : 'Selecione um dia'}
      </Text>

      <FlatList
        data={compromissosDia}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.cardTime,
                  { fontSize: applyFontScale(14) },
                ]}
              >
                {item.time} - {item.category}
              </Text>

              <Text
                style={[
                  styles.cardText,
                  { fontSize: applyFontScale(13) },
                ]}
              >
                {item.specialty}
              </Text>

              <Text
                style={[
                  styles.cardText,
                  { fontSize: applyFontScale(13) },
                ]}
              >
                Dr. {item.doctor}
              </Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(ROUTES.ADICIONAR_COMPROMISSO, {
                    id: item.id,
                  })
                }
                style={isLargeButtons && { padding: 6 }}
              >
                <Ionicons
                  name="pencil"
                  size={isLargeButtons ? 28 : 22}
                  color="#7C3AED"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onDeletePress(item.id)}
                style={isLargeButtons && { padding: 6 }}
              >
                <Ionicons
                  name="trash"
                  size={isLargeButtons ? 28 : 22}
                  color="#E11D48"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          selected ? (
            <Text
              style={[
                styles.empty,
                { fontSize: applyFontScale(14) },
              ]}
            >
              Nenhum compromisso
            </Text>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <TouchableOpacity
        style={[
          styles.addButton,
          isLargeButtons && {
            padding: 18,
            borderRadius: 32,
          },
          { opacity: selected ? 1 : 0.6 },
        ]}
        onPress={() =>
          navigation.navigate(ROUTES.ADICIONAR_COMPROMISSO, { date: selected })
        }
        disabled={!selected}
      >
        <Ionicons
          name="add"
          size={isLargeButtons ? 36 : 30}
          color={colors.onPrimary}
        />
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingTop: 24,
    },

    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    backBtn: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    title: {
      fontWeight: 'bold',
      color: colors.textPrimary,
    },

    calendar: {
      borderRadius: 10,
      marginBottom: 20,
      backgroundColor: colors.surface,
    },

    subTitle: {
      fontWeight: '600',
      marginBottom: 8,
      color: colors.textPrimary,
    },

    card: {
      flexDirection: 'row',
      backgroundColor: '#F9F5FF',
      borderRadius: 12,
      padding: 12,
      marginVertical: 5,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },

    cardTime: { fontWeight: 'bold', color: LILAC_TEXT },
    cardText: { color: LILAC_TEXT },

    actions: {
      flexDirection: 'row',
      gap: 12,
      paddingLeft: 6,
    },

    empty: {
      textAlign: 'center',
      marginTop: 10,
      color: colors.pillDark,
    },

    addButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: colors.primary,
      borderRadius: 30,
      padding: 14,
      elevation: 4,
    },
  });
