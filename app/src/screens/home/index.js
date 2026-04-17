import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Text as RNText,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text, useTheme } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { ROUTES } from '@/navigation/routes';
import { useAuth } from '@/features/AuthContext';
import { useAccessibility } from '@/features/acessibilidade/store/acessibilidade.context';

const MESSAGES = [
  'Cuide de quem você ama, todos os dias 💜',
  'Pequenos lembretes, grandes cuidados ✨',
  'Saúde organizada é vida com mais calma 🌿',
  'Você está fazendo um ótimo trabalho 🙌',
  'Cuidar também é um ato de amor 💖',
];

function getFooterMessage() {
  const idx = (new Date().getDate() - 1) % MESSAGES.length;
  return MESSAGES[idx];
}

export default function Home({ navigation }) {
  const theme = useTheme();
  const { colors } = theme;
  const isDark = theme.dark;

  const { user } = useAuth();
  const { settings } = useAccessibility();

  const fs = settings.fontScale || 1;
  const large = settings.largeButtons;

  const footer = getFooterMessage();

  const [userProfile, setUserProfile] = useState(null);

  const avatarSize = large ? 64 : 50;
  const buttonHeight = large ? 78 : 56;

  const loadProfile = useCallback(async () => {
    if (!user?.id) {
      setUserProfile(null);
      return;
    }

    try {
      const key = `userProfile_${user.id}`;
      const stored = await AsyncStorage.getItem(key);

      if (stored) {
        setUserProfile(JSON.parse(stored));
      } else {
        const fallback = {
          id: user.id,
          name: user.name || 'Usuário',
          email: user.email || '',
          avatar: (user.name || 'U')[0].toUpperCase(),
          avatarUri: null,
        };
        setUserProfile(fallback);
        await AsyncStorage.setItem(key, JSON.stringify(fallback));
      }
    } catch (e) {
      console.error('Erro ao carregar perfil na Home:', e);
    }
  }, [user?.id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfile();
    });
    return unsubscribe;
  }, [navigation, loadProfile]);

  const runHaptics = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}
  };

  const onNavigate = async route => {
    await runHaptics();
    navigation.navigate(route);
  };

  const openAccessibility = async () => {
    await runHaptics();
    navigation.navigate(ROUTES.ACESSIBILIDADE);
  };

  const displayName = userProfile?.name || user?.name || 'Usuário';
  const displayEmail = userProfile?.email || user?.email || '';
  const avatarLetter =
    userProfile?.avatar || (user?.name || 'U')[0].toUpperCase();
  const avatarUri = userProfile?.avatarUri || null;

  return (
    <View style={[styles.gradient, { backgroundColor: colors.background }]}>
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>

            {/* 👇 BOTÃO DE RESET — apenas para testes 
            <TouchableOpacity
              onPress={() => navigation.navigate('RESET')}
              style={{
                backgroundColor: '#f0d7ff',
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 10,
                marginBottom: 10,
                alignSelf: 'flex-start',
              }}
            >
              <RNText style={{ color: '#3B0764', fontWeight: 'bold' }}>
                🧹 Resetar AsyncStorage
              </RNText>
            </TouchableOpacity> */}

            {/* HEADER */}
            <View style={styles.header}>
              <View style={styles.userInfo}>
                <View
                  style={[
                    styles.userAvatar,
                    {
                      width: avatarSize,
                      height: avatarSize,
                      borderRadius: avatarSize / 2,
                    },
                  ]}
                >
                  {avatarUri ? (
                    <Image
                      source={{ uri: avatarUri }}
                      style={[
                        styles.userAvatarImage,
                        { borderRadius: avatarSize / 2 },
                      ]}
                    />
                  ) : (
                    <RNText
                      style={[
                        styles.userAvatarText,
                        { fontSize: large ? 24 : 20 },
                      ]}
                    >
                      {avatarLetter}
                    </RNText>
                  )}
                </View>

                <View>
                  <RNText
                    style={[
                      styles.welcomeText,
                      {
                        color: isDark ? '#FFFFFF' : '#3B0764',
                        fontSize: 18 * fs,
                      },
                    ]}
                  >
                    Olá, {displayName}!
                  </RNText>

                  <RNText
                    style={[
                      styles.userEmail,
                      {
                        color: isDark ? '#FFFFFF' : '#3B0764',
                        opacity: 0.7,
                        fontSize: 14 * fs,
                      },
                    ]}
                  >
                    {displayEmail}
                  </RNText>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.settingsBtn,
                  {
                    width: large ? 52 : 44,
                    height: large ? 52 : 44,
                    borderRadius: large ? 26 : 22,
                  },
                ]}
                onPress={openAccessibility}
              >
                <Ionicons
                  name="settings-outline"
                  size={large ? 30 : 28}
                  color="#daaeff"
                />
              </TouchableOpacity>
            </View>

            {/* LOGO */}
            <View style={styles.logoWrap}>
              <Image
                source={require('../../../assets/logo.png')}
                style={[
                  styles.logo,
                  { width: large ? 210 : 180, height: large ? 210 : 180 },
                ]}
                resizeMode="contain"
              />
            </View>

            {/* TÍTULO PRINCIPAL */}
            <Text
              variant="headlineMedium"
              style={[
                styles.title,
                {
                  color: isDark ? '#FFFFFF' : '#3B0764',
                  fontSize: 22 * fs,
                },
              ]}
            >
              {`Que bom te ver aqui, ${displayName}!`}
            </Text>

            {/* MENU */}
            <View style={styles.menu}>
              {[
                { label: 'Medicamentos', route: ROUTES.MEDICAMENTOS },
                { label: 'Agenda', route: ROUTES.AGENDA },
                { label: 'Alarmes', route: ROUTES.ALARMES },
                { label: 'Contatos', route: ROUTES.CONTATOS },
                { label: 'Lembretes', route: ROUTES.LEMBRETES },
                { label: 'Perfil Familiar', route: ROUTES.PERFIL_FAMILIAR },
                { label: 'Perfil', route: ROUTES.PERFIL },
              ].map(item => (
                <Button
                  key={item.route}
                  mode="contained"
                  style={[styles.btn, { borderRadius: large ? 20 : 16 }]}
                  contentStyle={[
                    styles.btnContent,
                    { height: buttonHeight },
                  ]}
                  labelStyle={[
                    styles.btnLabel,
                    { fontSize: large ? 20 * fs : 18 * fs },
                  ]}
                  onPress={() => onNavigate(item.route)}
                >
                  {item.label}
                </Button>
              ))}
            </View>

            <RNText
              style={[
                styles.footer,
                {
                  color: colors.text,
                  fontSize: 15 * fs,
                  marginTop: large ? 48 : 36,
                },
              ]}
            >
              {footer}
            </RNText>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  container: { flex: 1, padding: 20, alignItems: 'stretch' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  userAvatar: {
    backgroundColor: '#E3C2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  userAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  userAvatarImage: {
    width: '100%',
    height: '100%',
  },

  welcomeText: { marginBottom: 2 },
  userEmail: {},

  settingsBtn: {
    backgroundColor: 'rgba(124,58,237,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoWrap: { alignItems: 'center', marginTop: 12 },
  logo: {},

  title: {
    marginTop: 12,
    marginBottom: 24,
    textAlign: 'center',
  },

  menu: { marginTop: 24 },

  btn: {
    marginVertical: 8,
  },
  btnContent: {},
  btnLabel: {
    letterSpacing: 1,
    fontWeight: '600',
    color: '#3B0764',
  },

  footer: {
    textAlign: 'center',
    opacity: 0.8,
    fontStyle: 'italic',
  },
});
