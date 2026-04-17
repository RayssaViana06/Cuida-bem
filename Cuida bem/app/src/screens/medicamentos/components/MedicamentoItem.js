import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAccessibility } from '@/features/acessibilidade/store/acessibilidade.context';

const LILAC_TEXT = '#3B0764';

export default function MedicamentoItem({ name, onPress, onDelete }) {
  const { colors } = useTheme();
  const { settings } = useAccessibility();
  const styles = makeStyles(colors, settings);

  const iconSize = settings.largeButtons ? 22 : 20;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.info}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Text style={styles.title} numberOfLines={1}>
          {name}
        </Text>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onPress}
          style={styles.editBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Editar medicamento"
        >
          <MaterialCommunityIcons
            name="pencil"
            size={iconSize}
            color="#4C1D95"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Remover medicamento"
        >
          <Ionicons
            name="trash"
            size={iconSize}
            color="#7F1D1D"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (colors, settings) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#ECD5FF',
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: settings.largeButtons ? 16 : 14,
      minHeight: settings.largeButtons ? 72 : 64,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
      marginHorizontal: 2,
    },
    info: {
      flex: 1,
    },
    title: {
      fontSize: 16 * settings.fontScale,
      fontWeight: '600',
      color: LILAC_TEXT,
      marginBottom: 2,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: settings.largeButtons ? 12 : 10,
    },
    editBtn: {
      width: settings.largeButtons ? 46 : 40,
      height: settings.largeButtons ? 46 : 40,
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
      width: settings.largeButtons ? 46 : 40,
      height: settings.largeButtons ? 46 : 40,
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
  });
