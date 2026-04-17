import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useContacts } from '../store/contacts.context';
import { useAccessibility } from '@/features/acessibilidade/store/acessibilidade.context';

export default function EditarContato({ route, navigation }) {
  const { colors } = useTheme();
  const { settings } = useAccessibility();
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
  const buttonFontSize = isLargeButtons ? 18 : 16;
  const inputPadding = isLargeButtons ? 18 : 12;

  const { contacts, add, update } = useContacts();

  const id = route?.params?.id ?? null;
  const editing = useMemo(
    () => contacts.find((c) => c.id === id) || null,
    [contacts, id],
  );

  const [name, setName] = useState(editing?.name || '');
  const [phone, setPhone] = useState(editing?.phone || '');
  const [specialty, setSpecialty] = useState(editing?.specialty || '');
  const [location, setLocation] = useState(editing?.location || '');
  const [address, setAddress] = useState(editing?.address || '');

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Preencha o nome do contato antes de salvar.');
      return;
    }

    const payload = {
      id: editing?.id ?? undefined,
      name: name.trim(),
      phone: phone.trim(),
      specialty: specialty.trim(),
      location: location.trim(),
      address: address.trim(),
    };

    if (payload.id) await update(payload);
    else await add(payload);

    navigation.goBack();
  };

  const isValidToSave = Boolean(name.trim());

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          <Ionicons name="arrow-back" size={backIconSize} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            { fontSize: applyFontScale(22) },
          ]}
        >
          {editing ? 'Editar contato' : 'Novo contato'}
        </Text>
      </View>

      <View style={styles.form}>

        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 16,
            fontWeight: '600',
          }}
        >
          Nome do contato
        </Text>

        <TextInput
          mode="outlined"
          placeholder="ex.: Dr. ..."
          value={name}
          onChangeText={setName}
          style={[
            styles.input,
            { paddingVertical: inputPadding, fontSize: applyFontScale(16) },
          ]}
          outlineColor={colors.pillLight}
          activeOutlineColor={colors.primary}
          textColor={colors.textPrimary}
          placeholderTextColor={colors.pillDark}
        />

        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 16,
            fontWeight: '600',
          }}
        >
          Telefone
        </Text>

        <TextInput
          mode="outlined"
          placeholder="ex.: (XX) XXXXX-XXXX"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={[
            styles.input,
            { paddingVertical: inputPadding, fontSize: applyFontScale(16) },
          ]}
          outlineColor={colors.pillLight}
          activeOutlineColor={colors.primary}
          textColor={colors.textPrimary}
          placeholderTextColor={colors.pillDark}
        />

        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 16,
            fontWeight: '600',
          }}
        >
          Especialidade
        </Text>

        <TextInput
          mode="outlined"
          placeholder="ex.: Neurologista"
          value={specialty}
          onChangeText={setSpecialty}
          style={[
            styles.input,
            { paddingVertical: inputPadding, fontSize: applyFontScale(16) },
          ]}
          outlineColor={colors.pillLight}
          activeOutlineColor={colors.primary}
          textColor={colors.textPrimary}
          placeholderTextColor={colors.pillDark}
        />

        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 16,
            fontWeight: '600',
          }}
        >
          Nome do local
        </Text>

        <TextInput
          mode="outlined"
          placeholder="ex.: Clínica Bem Viver"
          value={location}
          onChangeText={setLocation}
          style={[
            styles.input,
            { paddingVertical: inputPadding, fontSize: applyFontScale(16) },
          ]}
          outlineColor={colors.pillLight}
          activeOutlineColor={colors.primary}
          textColor={colors.textPrimary}
          placeholderTextColor={colors.pillDark}
        />

        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 16,
            fontWeight: '600',
          }}
        >
          Endereço
        </Text>

        <TextInput
          mode="outlined"
          placeholder="Rua, Nº, Bairro, Cidade"
          value={address}
          onChangeText={setAddress}
          style={[
            styles.input,
            { paddingVertical: inputPadding, fontSize: applyFontScale(16) },
          ]}
          outlineColor={colors.pillLight}
          activeOutlineColor={colors.primary}
          textColor={colors.textPrimary}
          placeholderTextColor={colors.pillDark}
        />

        <Button
          mode="contained"
          onPress={handleSave}
          disabled={!isValidToSave}
          style={[
            styles.button,
            isLargeButtons && {
              paddingVertical: 14,
              borderRadius: 24,
            },
          ]}
          labelStyle={{
            ...styles.buttonLabel,
            fontSize: applyFontScale(buttonFontSize),
          }}
        >
          SALVAR
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
      fontWeight: '700',
      color: colors.textPrimary,
    },

    form: { paddingHorizontal: 16, paddingTop: 12 },
    input: {
      marginBottom: 12,
      backgroundColor: colors.surface,
      borderRadius: 12,
    },
    button: {
      marginTop: 16,
      borderRadius: 20,
      backgroundColor: colors.primary,
    },
    buttonLabel: {
      letterSpacing: 1,
      fontWeight: '600',
    },
  });
