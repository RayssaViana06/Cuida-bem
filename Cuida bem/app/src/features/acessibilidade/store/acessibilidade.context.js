// src/features/acessibilidade/store/acessibilidade.context.js

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  DEFAULT_ACCESSIBILITY_SETTINGS,
  loadAccessibilitySettings,
  saveAccessibilitySettings,
} from '../services/acessibilidade.storage';

import { theme as baseLightTheme } from '@/styles/theme';
import { useAuth } from '@/features/AuthContext';

const AccessibilityContext = createContext(null);

export function AccessibilityProvider({ children }) {
  const { user, loading: authLoading } = useAuth();

  const [settings, setSettings] = useState(DEFAULT_ACCESSIBILITY_SETTINGS);
  const [loading, setLoading] = useState(true);

  const currentUserId = user?.id ?? null;

  // 🔄 Carrega configurações salvas (por usuário ou global) quando o user mudar
  useEffect(() => {
    let mounted = true;

    async function init() {
      // espera Auth terminar pra não carregar duas vezes à toa
      if (authLoading && !user) return;

      setLoading(true);
      try {
        const loaded = await loadAccessibilitySettings(currentUserId);
        if (!mounted) return;

        setSettings({
          theme: loaded.theme ?? DEFAULT_ACCESSIBILITY_SETTINGS.theme,
          fontScale:
            loaded.fontScale ?? DEFAULT_ACCESSIBILITY_SETTINGS.fontScale,
          highContrast:
            loaded.highContrast ?? DEFAULT_ACCESSIBILITY_SETTINGS.highContrast,
          largeButtons:
            loaded.largeButtons ?? DEFAULT_ACCESSIBILITY_SETTINGS.largeButtons,
          vibrationStrong:
            loaded.vibrationStrong ??
            DEFAULT_ACCESSIBILITY_SETTINGS.vibrationStrong,
        });
      } catch (e) {
        console.warn('Erro ao inicializar acessibilidade:', e);
        if (!mounted) return;
        setSettings(DEFAULT_ACCESSIBILITY_SETTINGS);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [currentUserId, authLoading]);

  // 💾 Sempre que settings mudar (e não estiver carregando), salva para o usuário atual
  useEffect(() => {
    if (loading) return;
    // se ainda não tem user (pré-login), salva na chave global
    saveAccessibilitySettings(settings, currentUserId);
  }, [settings, loading, currentUserId]);

  // Ações de acessibilidade
  const toggleTheme = () =>
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));

  const setFontScale = value =>
    setSettings(prev => ({
      ...prev,
      fontScale: Math.min(1.6, Math.max(0.9, value)),
    }));

  const increaseFont = () => setFontScale(settings.fontScale + 0.2);
  const decreaseFont = () => setFontScale(settings.fontScale - 0.2);

  const toggleHighContrast = () =>
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));

  const toggleLargeButtons = () =>
    setSettings(prev => ({ ...prev, largeButtons: !prev.largeButtons }));

  // 🎨 Tema dinâmico do react-native-paper + react-navigation
  const paperTheme = useMemo(() => {
    const isDark = settings.theme === 'dark';

    const base = {
      ...baseLightTheme,
      dark: isDark,
      colors: {
        ...baseLightTheme.colors,
        ...(isDark
          ? {
              // 🌙 MODO ESCURO – lilás suave com bom contraste
              primary: '#C4B5FD',
              onPrimary: '#1E1033',
              background: '#050816',
              surface: '#111827',
              text: '#F9FAFB',
              textPrimary: '#F9FAFB',
              textLight: '#E5E7EB',
              onSurface: '#F9FAFB',
              card: '#111827',
              border: '#1F2937',
              notification: '#F97316',
            }
          : {
              // ☀️ MODO CLARO – pastel lilás
              primary: '#E3C2FF',
              onPrimary: '#3B0764',

              background: '#F5E9FF',
              surface: '#E9D0FF',

              text: '#3B0764',
              textPrimary: '#3B0764',
              textLight: '#4B5563',
              onSurface: '#3B0764',

              card: '#E9D0FF',
              border: '#D1C4E9',
              notification: '#9333EA',
            }),
      },
    };

    // 🔳 Alto contraste – reforça cores para leitura
    const contrastColors = settings.highContrast
      ? {
          primary: '#000000',
          onPrimary: '#FFFFFF',
          background: isDark ? '#000000' : '#FFFFFF',
          surface: isDark ? '#111111' : '#FFFFFF',
          text: isDark ? '#FFFFFF' : '#000000',
          textPrimary: isDark ? '#FFFFFF' : '#000000',
          onSurface: isDark ? '#FFFFFF' : '#000000',
          card: isDark ? '#111111' : '#FFFFFF',
          border: isDark ? '#FFFFFF' : '#000000',
        }
      : {};

    // 🔠 Escala de fontes baseada no fontScale
    const baseFonts = base.fonts || {};
    const scaledFonts = {};
    Object.keys(baseFonts).forEach(key => {
      const f = baseFonts[key] || {};
      const baseSize = f.fontSize || 14;
      scaledFonts[key] = {
        ...f,
        fontSize: Math.round(baseSize * settings.fontScale),
      };
    });

    return {
      ...base,
      colors: {
        ...base.colors,
        ...contrastColors,
      },
      fonts: {
        ...baseFonts,
        ...scaledFonts,
      },
    };
  }, [settings.theme, settings.highContrast, settings.fontScale]);

  return (
    <AccessibilityContext.Provider
      value={{
        loading,
        settings,
        paperTheme,
        toggleTheme,
        setFontScale,
        increaseFont,
        decreaseFont,
        toggleHighContrast,
        toggleLargeButtons,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error(
      'useAccessibility deve ser usado dentro de AccessibilityProvider',
    );
  }
  return ctx;
}
