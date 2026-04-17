import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

import { ROUTES } from '@/navigation/routes';
import { useAgenda } from '@/features/agenda/store/agenda.context';
import {
  loadReminders,
  deleteReminderById,
  toggleDone,
} from '@/features/lembretes/services/reminders.storage';
import { useAccessibility } from '@/features/acessibilidade/store/acessibilidade.context';
import { useAuth } from '@/features/AuthContext';
import { resolveAuthUserKey } from '@/features/auth/resolveAuthUserKey';

export default function RemindersScreen({ navigation }) {
  const { colors } = useTheme();
  const { settings } = useAccessibility();
  const { user } = useAuth();
  const userKey = resolveAuthUserKey(user); // 🔐 chave única do usuário logado

  const styles = makeStyles(colors);
  const { items: agendaItems } = useAgenda();

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
  const checkIconSize = isLargeButtons ? 22 : 18;
  const actionIconSize = isLargeButtons ? 26 : 20;
  const fabIconSize = isLargeButtons ? 34 : 28;
  const fabSecondaryIconSize = isLargeButtons ? 30 : 24;

  const fromAgenda = useMemo(
    () =>
      agendaItems.filter(
        (c) =>
          typeof c?.reminder === 'string' &&
          c.reminder.trim().length > 0
      ),
    [agendaItems]
  );

  const [personal, setPersonal] = useState([]);
  const [showDone, setShowDone] = useState(false);

  const makeSortKey = (r) => {
    const d = (r.date || '').trim();
    const t = (r.time || '').trim();
    if (!d && !t) return '9999-12-31T23:59';
    const datePart = d || '9999-12-31';
    const timePart = t || '23:59';
    return `${datePart}T${timePart}`;
  };

  const pending = useMemo(
    () =>
      [...personal.filter((r) => !r.done)].sort((a, b) =>
        makeSortKey(a).localeCompare(makeSortKey(b))
      ),
    [personal]
  );

  const completed = useMemo(
    () =>
      [...personal.filter((r) => r.done)].sort((a, b) =>
        makeSortKey(a).localeCompare(makeSortKey(b))
      ),
    [personal]
  );

  async function refresh() {
    if (!userKey) {
      setPersonal([]);
      return;
    }
    const p = await loadReminders(userKey);
    setPersonal(p);
  }

  useEffect(() => {
    refresh();
    const unsub = navigation.addListener('focus', refresh);
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, userKey]);

  const SectionHeader = ({ title }) => (
    <Text
      style={[
        styles.section,
        {
          fontSize: applyFontScale(16),
        },
      ]}
    >
      {title}
    </Text>
  );

  const PersonalItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={async () => {
          await toggleDone(userKey, item.id, !item.done);
          refresh();
        }}
        style={[
          styles.check,
          isLargeButtons && {
            width: 32,
            height: 32,
            borderRadius: 16,
          },
          item.done && { backgroundColor: colors.primary },
        ]}
      >
        <Ionicons
          name="checkmark"
          size={checkIconSize}
          color={item.done ? colors.onPrimary : colors.pillDark}
        />
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.cardTitle,
            {
              fontSize: applyFontScale(16),
            },
            item.done && { textDecorationLine: 'line-through', opacity: 0.6 },
          ]}
        >
          {item.title || 'Lembrete'}
        </Text>

        {(item.date || item.time || item.repeatDaily) ? (
          <Text
            style={[
              styles.cardSub,
              {
                fontSize: applyFontScale(14),
              },
            ]}
          >
            {(item.date || '').trim()}
            {item.time ? ` • ${item.time}` : ''}
            {item.repeatDaily ? ' • diário' : ''}
          </Text>
        ) : null}

        {!!item.notes && (
          <Text
            style={[
              styles.cardNote,
              {
                fontSize: applyFontScale(14),
              },
            ]}
          >
            {item.notes}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.editBtn,
          isLargeButtons && {
            width: 50,
            height: 50,
            borderRadius: 16,
          },
        ]}
        onPress={() =>
          navigation.navigate(ROUTES.EDITAR_LEMBRETE, { id: item.id })
        }
      >
        <Ionicons name="pencil" size={actionIconSize} color="#4C1D95" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.deleteBtn,
          isLargeButtons && {
            width: 50,
            height: 50,
            borderRadius: 16,
          },
        ]}
        onPress={async () => {
          await deleteReminderById(userKey, item.id);
          refresh();
        }}
      >
        <Ionicons name="trash" size={actionIconSize} color="#7F1D1D" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container]}>
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
          Lembretes
        </Text>
      </View>

      <View style={styles.content}>
        <SectionHeader title="Da Agenda" />

        {fromAgenda.length === 0 ? (
          <Text
            style={[
              styles.empty,
              {
                fontSize: applyFontScale(14),
              },
            ]}
          >
            Nenhum lembrete de agenda.
          </Text>
        ) : (
          <FlatList
            data={fromAgenda}
            keyExtractor={(i) => String(i.id)}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.cardTitle,
                      {
                        fontSize: applyFontScale(16),
                      },
                    ]}
                  >
                    {item.category || 'Compromisso'}
                  </Text>
                  <Text
                    style={[
                      styles.cardSub,
                      {
                        fontSize: applyFontScale(14),
                      },
                    ]}
                  >
                    {item.date} • {item.time}
                  </Text>
                  {!!item.reminder && (
                    <Text
                      style={[
                        styles.cardNote,
                        {
                          fontSize: applyFontScale(14),
                        },
                      ]}
                    >
                      {item.reminder}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.editBtn,
                    isLargeButtons && {
                      width: 50,
                      height: 50,
                      borderRadius: 16,
                    },
                  ]}
                  onPress={() =>
                    navigation.navigate(ROUTES.ADICIONAR_COMPROMISSO, {
                      id: item.id,
                    })
                  }
                >
                  <Ionicons name="pencil" size={actionIconSize} color="#4C1D95" />
                </TouchableOpacity>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        )}

        <SectionHeader title="Pessoais" />

        {pending.length === 0 ? (
          <Text
            style={[
              styles.empty,
              {
                fontSize: applyFontScale(14),
              },
            ]}
          >
            Nenhum lembrete pessoal.
          </Text>
        ) : (
          <FlatList
            data={pending}
            keyExtractor={(i) => String(i.id)}
            renderItem={({ item }) => <PersonalItem item={item} />}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            contentContainerStyle={{ paddingBottom: 90 }}
          />
        )}

        {showDone && (
          <>
            <SectionHeader title="Concluídos" />
            {completed.length === 0 ? (
              <Text
                style={[
                  styles.empty,
                  {
                    fontSize: applyFontScale(14),
                  },
                ]}
              >
                Nenhum concluído.
              </Text>
            ) : (
              <FlatList
                data={completed}
                keyExtractor={(i) => String(i.id)}
                renderItem={({ item }) => <PersonalItem item={item} />}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                contentContainerStyle={{ paddingBottom: 90 }}
              />
            )}
          </>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.fab,
          isLargeButtons && {
            width: 70,
            height: 70,
            borderRadius: 35,
          },
        ]}
        onPress={() =>
          navigation.navigate(ROUTES.EDITAR_LEMBRETE, { id: null })
        }
      >
        <Ionicons name="add" size={fabIconSize} color={colors.onPrimary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.fabSecondary,
          isLargeButtons && {
            width: 60,
            height: 60,
            borderRadius: 30,
          },
        ]}
        onPress={() => setShowDone((v) => !v)}
      >
        <Ionicons
          name={showDone ? 'checkmark-done' : 'checkmark-circle-outline'}
          size={fabSecondaryIconSize}
          color={colors.onPrimary}
        />
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
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

    content: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
    section: {
      marginTop: 16,
      marginBottom: 8,
      fontWeight: '700',
      color: colors.textPrimary,
      fontSize: 16,
    },
    empty: { color: colors.pillDark, marginBottom: 6 },

    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
    },

    cardTitle: { color: colors.textPrimary, fontWeight: '700' },
    cardSub: { color: colors.pillDark, marginTop: 2 },
    cardNote: { color: colors.textPrimary, opacity: 0.8, marginTop: 2 },

    check: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: colors.pillDark,
      alignItems: 'center',
      justifyContent: 'center',
    },

    editBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: '#E9D8FF',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,
    },

    deleteBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: '#ECD5FF',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,
    },

    fab: {
      position: 'absolute',
      right: 20,
      bottom: 20,
      backgroundColor: colors.primary,
      borderRadius: 28,
      width: 56,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
    },

    fabSecondary: {
      position: 'absolute',
      right: 92,
      bottom: 20,
      backgroundColor: colors.primary,
      borderRadius: 24,
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      opacity: 0.95,
    },
  });
