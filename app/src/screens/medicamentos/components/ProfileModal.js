import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from 'react-native-paper';

const PROFILES = ['José', 'Lara', 'Ana', 'Paulo'];

export default function ProfileModal({ onClose = () => {}, onSelect = () => {} }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.title}>Selecionar perfil</Text>

        {PROFILES.map((p) => (
          <TouchableOpacity
            key={p}
            style={styles.item}
            onPress={() => onSelect(p)}
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.itemText}>{p}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.cancel}
          onPress={onClose}
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    container: {
      backgroundColor: colors.surface,
      padding: 20,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 12,
      color: colors.textPrimary,
    },
    item: {
      paddingVertical: 12,
      borderBottomColor: colors.pillLight,
      borderBottomWidth: 1,
    },
    itemText: {
      fontSize: 16,
      color: colors.textPrimary,
    },
    cancel: {
      marginTop: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },
    cancelText: {
      color: colors.pillDark,
    },
  });
