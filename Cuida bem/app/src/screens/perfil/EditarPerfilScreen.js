import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '@/features/AuthContext';
import { useAccessibility } from '@/features/acessibilidade/store/acessibilidade.context';

export default function EditarPerfilScreen({ navigation }) {
  const theme = useTheme();
  const isDark = theme.dark;

  const { user } = useAuth();
  const { settings } = useAccessibility();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // CAMPOS
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');

  // FONTES DO ACESSIBILIDADE
  const fontScale = settings?.fontScale ?? 1;
  const applyFontScale = useCallback((base) => base * fontScale, [fontScale]);

  // -----------------------------------------------------------------------------
  // 🔥 CARREGAR PERFIL CORRETO E SOMENTE DE userProfile_${user.id}
  // -----------------------------------------------------------------------------
  const loadProfile = useCallback(async () => {
    try {
      if (!user?.id) return;

      const key = `userProfile_${user.id}`;
      const stored = await AsyncStorage.getItem(key);

      let profile = stored ? JSON.parse(stored) : null;

      if (!profile) {
        profile = {
          id: user.id,
          name: user.name ?? '',
          email: user.email ?? '',
          age: user.age ?? '',
          bio: '',
          avatar: (user.name || 'U')[0].toUpperCase(),
          avatarUri: null,
        };
        await AsyncStorage.setItem(key, JSON.stringify(profile));
      }

      setName(profile.name);
      setAge(profile.age ? String(profile.age) : '');
      setBio(profile.bio || '');
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.name, user?.email, user?.age]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // -----------------------------------------------------------------------------
  // 🔥 SALVAR PERFIL (PRESERVANDO avatarUri E OUTROS CAMPOS)
  // -----------------------------------------------------------------------------
  const handleSave = async () => {
    if (!user?.id) return;

    const key = `userProfile_${user.id}`;

    const trimmedName = name.trim();
    const trimmedBio = bio.trim();

    if (!trimmedName) {
      Alert.alert('Atenção', 'O nome é obrigatório.');
      return;
    }

    let parsedAge = null;
    if (age) {
      const n = parseInt(age, 10);
      if (isNaN(n) || n < 0 || n > 150) {
        Alert.alert('Atenção', 'Informe uma idade válida entre 0 e 150.');
        return;
      }
      parsedAge = n;
    }

    try {
      setSaving(true);

      // Carrega o que já existe para NÃO perder avatarUri, preferences etc.
      const stored = await AsyncStorage.getItem(key);
      const previous = stored ? JSON.parse(stored) : {};

      const updated = {
        ...previous, // mantém avatarUri, preferences, etc.
        id: user.id,
        name: trimmedName,
        email: user.email, // email não editável
        age: parsedAge,
        bio: trimmedBio,
        // Recalcula a letra do avatar, mas preserva avatarUri já salvo
        avatar: (trimmedName || previous.name || 'U')[0].toUpperCase(),
      };

      await AsyncStorage.setItem(key, JSON.stringify(updated));

      Alert.alert('Pronto', 'Perfil atualizado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error('Erro ao salvar:', err);
      Alert.alert('Erro', 'Não foi possível salvar o perfil.');
    } finally {
      setSaving(false);
    }
  };

  const titleColor = isDark ? '#FFFFFF' : '#3B0764';

  if (loading) {
    return (
      <SafeAreaView style={[styles.container]}>
        <Text
          style={{
            color: titleColor,
            textAlign: 'center',
            marginTop: 40,
            fontSize: applyFontScale(16),
          }}
        >
          Carregando perfil...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={26} color={titleColor} />
          </TouchableOpacity>
          <Text
            style={[
              styles.title,
              { color: titleColor, fontSize: applyFontScale(24) },
            ]}
          >
            Editar perfil
          </Text>
        </View>

        {/* CARD */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#1F2933' : '#F7ECFF',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E4C7FF',
            },
          ]}
        >
          {/* Nome */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: titleColor }]}>Nome completo</Text>
            <TextInput
              style={[styles.input]}
              value={name}
              onChangeText={setName}
              placeholder="Seu nome"
              placeholderTextColor={isDark ? '#6B7280' : '#9C7ACB'}
            />
          </View>

          {/* Idade */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: titleColor }]}>Idade</Text>
            <TextInput
              style={[styles.input]}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              placeholder="Sua idade"
              placeholderTextColor={isDark ? '#6B7280' : '#9C7ACB'}
            />
          </View>

          {/* Bio */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: titleColor }]}>Sobre você (bio)</Text>
            <TextInput
              style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Uma frase ou pequena descrição"
              placeholderTextColor={isDark ? '#6B7280' : '#9C7ACB'}
              multiline
            />
          </View>

          {/* Botão Salvar */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={[styles.saveBtnText]}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { marginRight: 12 },
  title: { fontWeight: '800' },
  card: { borderRadius: 20, padding: 18, borderWidth: 1 },
  field: { marginBottom: 14 },
  label: { marginBottom: 6, fontWeight: '600' },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4C7FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    color: '#3B0764',
  },
  saveBtn: {
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#3B0764',
    fontSize: 16,
    fontWeight: '700',
  },
});
