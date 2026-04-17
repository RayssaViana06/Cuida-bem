// src/features/acessibilidade/screens/AcessibilidadeScreen.js

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Switch, IconButton, useTheme, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAccessibility } from '@/features/acessibilidade/store/acessibilidade.context';
import { useAuth } from '@/features/AuthContext';

export default function AcessibilidadeScreen({ navigation }) {
  const { colors } = useTheme();
  const {
    settings,
    toggleTheme,
    increaseFont,
    decreaseFont,
    // toggleHighContrast, // mantido no contexto, opção visual desativada
    toggleLargeButtons,
  } = useAccessibility();

  const { logout } = useAuth();

  const fontLabel =
    settings.fontScale <= 1.0
      ? 'Normal'
      : settings.fontScale < 1.4
      ? 'Média'
      : 'Grande';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* HEADER PRÓPRIO */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.textPrimary}
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            { color: colors.textPrimary },
          ]}
        >
          Acessibilidade visual
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* BLOCO PRINCIPAL */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          {/* MODO ESCURO */}
          <View style={styles.row}>
            <View style={styles.textBlock}>
              <Text style={[styles.label, { color: colors.text }]}>
                Modo escuro
              </Text>
              <Text style={[styles.help, { color: colors.text }]}>
                Alivia o brilho da tela em ambientes escuros.
              </Text>
            </View>
            <Switch
              value={settings.theme === 'dark'}
              onValueChange={toggleTheme}
            />
          </View>

          {/* TAMANHO DA FONTE */}
          <View style={styles.row}>
            <View style={styles.textBlock}>
              <Text style={[styles.label, { color: colors.text }]}>
                Tamanho da letra
              </Text>
              <Text style={[styles.help, { color: colors.text }]}>
                Atual: {fontLabel}
              </Text>
            </View>
            <View style={styles.fontButtons}>
              <IconButton icon="minus" size={22} onPress={decreaseFont} />
              <IconButton icon="plus" size={22} onPress={increaseFont} />
            </View>
          </View>

          {/* ALTO CONTRASTE - DESATIVADO POR ENQUANTO */}
          {/*
          <View style={styles.row}>
            <View style={styles.textBlock}>
              <Text style={[styles.label, { color: colors.text }]}>
                Alto contraste
              </Text>
              <Text style={[styles.help, { color: colors.text }]}>
                Cores mais fortes para facilitar leitura.
              </Text>
            </View>
            <Switch
              value={settings.highContrast}
              onValueChange={toggleHighContrast}
            />
          </View>
          */}

          {/* BOTÕES MAIORES */}
          <View style={styles.row}>
            <View style={styles.textBlock}>
              <Text style={[styles.label, { color: colors.text }]}>
                Botões / ícones maiores
              </Text>
              <Text style={[styles.help, { color: colors.text }]}>
                Aumenta áreas de toque no app.
              </Text>
            </View>
            <Switch
              value={settings.largeButtons}
              onValueChange={toggleLargeButtons}
            />
          </View>
        </View>

        {/* SAIR */}
        <View style={styles.footer}>
          <Text style={[styles.help, { color: colors.text }]}>
            Para sair do aplicativo, use o botão abaixo.
          </Text>

          <Button mode="contained" onPress={logout} style={styles.logout}>
            SAIR DO APLICATIVO
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

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

  scroll: { paddingHorizontal: 16, paddingBottom: 30 },

  section: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 28,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  textBlock: { flex: 1, paddingRight: 12 },
  label: { fontSize: 15, fontWeight: '600' },
  help: { fontSize: 12, opacity: 0.75 },
  fontButtons: { flexDirection: 'row' },
  footer: { alignItems: 'center' },
  logout: { marginTop: 10, width: '100%', borderRadius: 12 },
});
