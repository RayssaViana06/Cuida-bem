// app/src/screens/perfil/PerfilScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/features/AuthContext';
import { ROUTES } from '@/navigation/routes';

import { listMedicines } from '@/features/medicamentos/services/medicamentos.service';
import { useAgenda } from '@/features/agenda/store/agenda.context';
import { loadReminders } from '@/features/lembretes/services/reminders.storage';
import { loadAlarms } from '@/features/alarmes/services/alarms.storage';
import { useContacts } from '@/features/contatos/store/contacts.context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAccessibility } from '@/features/acessibilidade/store/acessibilidade.context';

export default function PerfilScreen({ navigation }) {
  const { user } = useAuth();
  const theme = useTheme();
  const isDark = theme.dark;
  const { settings } = useAccessibility();

  // Agenda e Contatos via contexto (já filtrados por usuário)
  const { items: agenda } = useAgenda();
  const { contacts } = useContacts();

  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    medicamentos: 0,
    compromissosTotal: 0,
    compromissosConcluidos: 0,
    alarmesTotal: 0,
    contatos: 0,
    lembretesAtivos: 0,
    lembretesConcluidos: 0,
  });

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

  const loadUserProfile = useCallback(async () => {
    try {
      if (!user?.id) {
        setUserData(null);
        return;
      }

      const key = `userProfile_${user.id}`;
      const stored = await AsyncStorage.getItem(key);

      if (stored) {
        setUserData(JSON.parse(stored));
      } else {
        const defaultProfile = {
          id: user.id,
          name: user.name || 'Usuário',
          email: user.email || '',
          age: user.age || '',
          bio: '',
          avatar: (user.name || 'U')[0].toUpperCase(),
          avatarUri: null,
          preferences: {
            notifications: true,
            darkMode: false,
          },
        };
        setUserData(defaultProfile);
        await AsyncStorage.setItem(key, JSON.stringify(defaultProfile));
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  }, [user?.id, user?.name, user?.email, user?.age]);

  const loadStats = useCallback(async () => {
    try {
      if (!user?.id) return;
      const userId = user.id;

      const meds = (await listMedicines(userId)) || [];
      const medicamentos = meds.length;

      const now = new Date();

      const compromissosTotal = agenda.length;
      const compromissosConcluidos = agenda.filter((item) => {
        if (!item.date) return false;
        const time = item.time || '00:00';
        const dt = new Date(`${item.date}T${time}:00`);
        return !isNaN(dt) && dt < now;
      }).length;

      const reminders = (await loadReminders(userId)) || [];
      const lembretesPessoaisAtivos = reminders.filter((r) => !r.done).length;
      const lembretesPessoaisConcluidos = reminders.filter((r) => r.done).length;

      const agendaRemindersAtivos = agenda.filter((item) => {
        if (!item.reminder) return false;
        if (!item.date) return false;
        const time = item.time || '00:00';
        const dt = new Date(`${item.date}T${time}:00`);
        if (isNaN(dt)) return false;
        return dt >= now;
      }).length;

      const lembretesAtivos =
        lembretesPessoaisAtivos + agendaRemindersAtivos;
      const lembretesConcluidos = lembretesPessoaisConcluidos;

      const alarms = (await loadAlarms(userId)) || [];
      const medsComAlarme = meds.filter((m) => m.alarme);
      const alarmesTotal = alarms.length + medsComAlarme.length;

      const contatos = contacts.length;

      setStats({
        medicamentos,
        compromissosTotal,
        compromissosConcluidos,
        alarmesTotal,
        contatos,
        lembretesAtivos,
        lembretesConcluidos,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas de perfil:', error);
    }
  }, [agenda, contacts, user?.id]);

  // 🔄 Sempre que a tela ganha foco, recarrega dados e estatísticas
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserProfile();
      loadStats();
    });
    return unsubscribe;
  }, [navigation, loadUserProfile, loadStats]);

  const handlePickAvatar = async () => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert(
          'Função não disponível',
          'Alterar o avatar funciona apenas em dispositivo/emulador nativo.'
        );
        return;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de acesso às suas fotos para alterar o avatar.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        allowsMultipleSelection: false,
      });

      if (result.canceled) return;

      const asset = result.assets && result.assets[0];
      if (!asset?.uri) {
        Alert.alert(
          'Não foi possível usar a foto',
          'Tente selecionar outra imagem.'
        );
        return;
      }

      if (!userData) return;

      const updatedProfile = {
        ...userData,
        avatarUri: asset.uri,
      };

      setUserData(updatedProfile);
      await AsyncStorage.setItem(
        `userProfile_${userData.id}`,
        JSON.stringify(updatedProfile)
      );
    } catch (error) {
      // Em modo dev, console.error vira tela vermelha; vamos logar em console normal
      console.log('Erro bruto ao atualizar avatar:', error);
      Alert.alert(
        'Erro ao atualizar avatar',
        'Não foi possível selecionar a foto. Tente novamente.'
      );
    }
  };

  if (!userData) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text
          style={[
            styles.loading,
            {
              color: isDark ? '#F9FAFB' : '#111827',
              fontSize: applyFontScale(16),
            },
          ]}
        >
          Carregando perfil...
        </Text>
      </SafeAreaView>
    );
  }

  const titleColor = isDark ? '#F9FAFB' : '#3B0764';

  const sectionTitleColor = isDark ? '#FFFFFF' : '#3B0764';
  const statNumberColor   = isDark ? '#FFFFFF' : '#3B0764';
  const statLabelColor    = isDark ? '#FFFFFF' : '#3B0764';

  const profileCardBg = isDark ? 'rgba(30, 30, 40, 0.95)' : '#FFFFFF';
  const profileCardBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)';

  const nameColor = isDark ? '#FFFFFF' : '#3B0764';
  const emailColor = isDark ? '#A0A0B0' : '#666666';
  const bioColor = isDark ? '#808090' : '#888888';

  const backIconColor = titleColor;

  const statsCardBg = isDark ? '#1B1D28' : '#E5C9FF';

  const isLargeButtons = !!settings?.largeButtons;
  const backIconSize = isLargeButtons ? 32 : 24;
  const editBtnBaseFont = isLargeButtons ? 18 : 16;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.backBtn,
              isLargeButtons && {
                paddingVertical: 10,
                paddingRight: 10,
              },
            ]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={backIconSize}
              color={backIconColor}
            />
          </TouchableOpacity>
          <Text
            style={[
              styles.title,
              {
                color: titleColor,
                fontSize: applyFontScale(24),
              },
            ]}
          >
            Perfil
          </Text>
        </View>

        {/* CARD DO PERFIL */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: profileCardBg,
              borderColor: profileCardBorder,
              shadowColor: isDark ? '#000' : '#888',
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.avatar,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.primary,
              },
            ]}
            onPress={handlePickAvatar}
            activeOpacity={0.9}
          >
            {userData.avatarUri ? (
              <Image
                source={{ uri: userData.avatarUri }}
                style={styles.avatarImage}
              />
            ) : (
              <Text
                style={[
                  styles.avatarText,
                  {
                    color: theme.colors.primary,
                    fontSize: applyFontScale(40),
                  },
                ]}
              >
                {userData.avatar}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <Text
              style={[
                styles.name,
                {
                  color: nameColor,
                  fontSize: applyFontScale(26),
                },
              ]}
            >
              {userData?.age
                ? `${userData.name}, ${userData.age} anos`
                : userData.name}
            </Text>
            <Text
              style={[
                styles.email,
                {
                  color: emailColor,
                  fontSize: applyFontScale(16),
                },
              ]}
            >
              {userData.email}
            </Text>

            {!!userData.bio && (
              <View style={styles.bioContainer}>
                <Text
                  style={[
                    styles.bio,
                    {
                      color: bioColor,
                      fontSize: applyFontScale(15),
                    },
                  ]}
                >
                  "{userData.bio}"
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* BOTÃO EDITAR PERFIL */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.editBtn,
              {
                backgroundColor: theme.colors.primary,
                shadowColor: theme.colors.primary,
              },
              isLargeButtons && {
                paddingVertical: 24,
                minHeight: 60,
                borderRadius: 20,
              },
            ]}
            onPress={() =>
              navigation.navigate(ROUTES.EDITAR_PERFIL, { userData })
            }
          >
            <Text
              style={[
                styles.editBtnText,
                {
                  fontSize: applyFontScale(editBtnBaseFont),
                },
              ]}
            >
              Editar Perfil
            </Text>
          </TouchableOpacity>
        </View>

        {/* ESTATÍSTICAS */}
        <View
          style={[
            styles.statsCard,
            {
              backgroundColor: statsCardBg,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color: sectionTitleColor,
                fontSize: applyFontScale(18),
              },
            ]}
          >
            Estatísticas da conta
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statNumber,
                  {
                    color: statNumberColor,
                    fontSize: applyFontScale(20),
                  },
                ]}
              >
                {stats.medicamentos}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: statLabelColor,
                    fontSize: applyFontScale(11),
                  },
                ]}
              >
                💊 Medicamentos cadastrados
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statNumber,
                  {
                    color: statNumberColor,
                    fontSize: applyFontScale(20),
                  },
                ]}
              >
                {stats.compromissosTotal}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: statLabelColor,
                    fontSize: applyFontScale(11),
                  },
                ]}
              >
                📅 Compromissos agendados
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statNumber,
                  {
                    color: statNumberColor,
                    fontSize: applyFontScale(20),
                  },
                ]}
              >
                {stats.compromissosConcluidos}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: statLabelColor,
                    fontSize: applyFontScale(11),
                  },
                ]}
              >
                ✅ Compromissos concluídos
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statNumber,
                  {
                    color: statNumberColor,
                    fontSize: applyFontScale(20),
                  },
                ]}
              >
                {stats.alarmesTotal}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: statLabelColor,
                    fontSize: applyFontScale(11),
                  },
                ]}
              >
                🔔 Alarmes cadastrados
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statNumber,
                  {
                    color: statNumberColor,
                    fontSize: applyFontScale(20),
                  },
                ]}
              >
                {stats.contatos}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: statLabelColor,
                    fontSize: applyFontScale(11),
                  },
                ]}
              >
                📇 Contatos adicionados
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statNumber,
                  {
                    color: statNumberColor,
                    fontSize: applyFontScale(20),
                  },
                ]}
              >
                {stats.lembretesAtivos}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: statLabelColor,
                    fontSize: applyFontScale(11),
                  },
                ]}
              >
                📝 Lembretes ativos
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statNumber,
                  {
                    color: statNumberColor,
                    fontSize: applyFontScale(20),
                  },
                ]}
              >
                {stats.lembretesConcluidos}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: statLabelColor,
                    fontSize: applyFontScale(11),
                  },
                ]}
              >
                ✅ Lembretes concluídos
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  loading: { textAlign: 'center', marginTop: 50, fontSize: 16 },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backBtn: { marginRight: 12, paddingVertical: 4, paddingRight: 4 },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: 0.5 },

  profileCard: {
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  avatarText: { fontSize: 40, fontWeight: 'bold' },
  avatarImage: { width: '100%', height: '100%', borderRadius: 55 },

  userInfo: { alignItems: 'center', width: '100%' },
  name: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    marginBottom: 16,
    fontWeight: '500',
    opacity: 0.9,
  },
  bioContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    width: '90%',
  },
  bio: {
    fontSize: 15,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },

  actions: {
    marginBottom: 20,
    alignItems: 'stretch',
    paddingHorizontal: 10,
  },
  editBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  editBtnText: {
    color: '#3B0764',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  statsCard: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#1B1D28',
    borderWidth: 1,
    borderColor: 'rgba(148, 112, 255, 0.25)',
    marginTop: 4,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  statNumber: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 11, marginTop: 3, textAlign: 'center', opacity: 0.9 },
});
