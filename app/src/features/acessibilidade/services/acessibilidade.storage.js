// src/features/acessibilidade/services/acessibilidade.storage.js

// RESPONSÁVEL POR:
// - Definir os valores padrão de acessibilidade
// - Carregar e salvar as configurações no AsyncStorage
//   AGORA por usuário (quando houver userId)

import AsyncStorage from '@react-native-async-storage/async-storage';

export const GLOBAL_ACCESSIBILITY_SETTINGS_KEY =
  '@cuidabem:acessibilidade-settings-v1';

export const ACCESSIBILITY_SETTINGS_BY_USER_PREFIX =
  '@cuidabem:acessibilidade-settings_user_';

export const DEFAULT_ACCESSIBILITY_SETTINGS = {
  theme: 'light',          // 'light' | 'dark'
  fontScale: 1.0,          // 1.0 (normal), 1.2, 1.4...
  highContrast: false,     // alto contraste ON/OFF
  largeButtons: true,      // áreas de toque / ícones maiores
  vibrationStrong: true,   // vibração intensa para alarmes/ações
};

function getStorageKey(userId) {
  if (userId != null && userId !== undefined) {
    return `${ACCESSIBILITY_SETTINGS_BY_USER_PREFIX}${userId}`;
  }
  // fallback global (antes do login ou se der algum problema)
  return GLOBAL_ACCESSIBILITY_SETTINGS_KEY;
}

/**
 * Carrega as configurações de acessibilidade.
 * - Se receber userId, usa chave específica daquele usuário
 * - Se NÃO receber userId, usa a chave global antiga
 */
export async function loadAccessibilitySettings(userId) {
  try {
    const key = getStorageKey(userId);
    const json = await AsyncStorage.getItem(key);

    if (!json) {
      return DEFAULT_ACCESSIBILITY_SETTINGS;
    }

    const parsed = JSON.parse(json);

    return {
      ...DEFAULT_ACCESSIBILITY_SETTINGS,
      ...parsed,
    };
  } catch (error) {
    console.warn('Erro ao carregar configurações de acessibilidade:', error);
    return DEFAULT_ACCESSIBILITY_SETTINGS;
  }
}

/**
 * Salva as configurações de acessibilidade.
 * - Se receber userId, salva por usuário
 * - Se NÃO receber userId, salva global (pré-login)
 */
export async function saveAccessibilitySettings(settings, userId) {
  try {
    const key = getStorageKey(userId);
    const json = JSON.stringify(settings);
    await AsyncStorage.setItem(key, json);
  } catch (error) {
    console.warn('Erro ao salvar configurações de acessibilidade:', error);
  }
}
