import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { ROUTES } from '@/navigation/routes';
import {
  listMedicines,
  deleteMedicine,
} from '@/features/medicamentos/services/medicamentos.service';
import MedicamentoItem from './components/MedicamentoItem';
import { useAccessibility } from '@/features/acessibilidade/store/acessibilidade.context';

const LILAC_TEXT = '#3B0764';

export default function MedicamentosScreen({ navigation }) {
  const [meds, setMeds] = useState([]);
  const { colors } = useTheme();
  const { settings } = useAccessibility();
  const styles = makeStyles(colors, settings);

  async function refresh() {
    try {
      const data = await listMedicines();
      setMeds(data);
    } catch {
      setMeds([]);
    }
  }

  useEffect(() => {
    refresh();
    const unsub = navigation.addListener('focus', refresh);
    return unsub;
  }, [navigation]);

  function openAdd(id) {
    navigation.navigate(ROUTES.ADICIONAR_MEDICAMENTO, { id: id ?? null });
  }

  async function handleDelete(item) {
    try {
      if (item?.notificationId) {
        try {
          await Notifications.cancelScheduledNotificationAsync(
            item.notificationId
          );
        } catch {}
      }

      await deleteMedicine(item.id);
      await refresh();
    } catch {}
  }

  function confirmDelete(item) {
    Alert.alert(
      'Remover medicamento',
      `Deseja realmente remover "${item.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => handleDelete(item),
        },
      ]
    );
  }

  const renderItem = ({ item }) => {
    const label = item.dosagem ? `${item.nome} - ${item.dosagem}` : item.nome;
    return (
      <MedicamentoItem
        name={label}
        onPress={() => openAdd(item.id)}
        onDelete={() => confirmDelete(item)}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.screen}>
        
        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="arrow-back"
              size={settings.largeButtons ? 26 : 24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>

          <Text style={styles.title}>Medicamentos</Text>
        </View>

        <Text style={styles.description}>
          Adicione seus medicamentos e, se quiser, ative um alarme diário.
        </Text>

        <FlatList
          data={meds}
          keyExtractor={i => String(i.id)}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum medicamento</Text>
          }
        />

        {/* FAB */}
        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab} onPress={() => openAdd(null)}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors, settings) =>
  StyleSheet.create({
    safe: { flex: 1 },

    screen: {
      flex: 1,
      margin: 16,
      backgroundColor: colors.background,
      borderRadius: 14,
      padding: 20,
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
      marginRight: 10,
    },

    title: {
      fontSize: 22 * settings.fontScale,
      fontWeight: '700',
      color: colors.textPrimary,
    },

    description: {
      color: colors.pillDark,
      fontSize: 13 * settings.fontScale * 1.05,
      marginTop: 2,
    },

    list: {
      marginTop: 16,
      paddingBottom: 120,
    },

    emptyText: {
      marginTop: 20,
      color: colors.pillDark,
      fontSize: 14 * settings.fontScale,
      textAlign: 'center',
    },

    /** FAB */
    fabContainer: {
      position: 'absolute',
      bottom: 24,
      left: 0,
      right: 0,
      alignItems: 'center',
    },

    fab: {
      width: settings.largeButtons ? 74 : 64,
      height: settings.largeButtons ? 74 : 64,
      borderRadius: settings.largeButtons ? 37 : 32,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
    },

    fabText: {
      fontSize: settings.largeButtons ? 40 : 34,
      color: colors.onPrimary,
      marginTop: -4,
      fontWeight: '700',
    },
  });
