// v4 do react-native-paper
import { DefaultTheme as PaperDefaultTheme } from 'react-native-paper';

export const theme = {
  ...PaperDefaultTheme,
  colors: {
    ...PaperDefaultTheme.colors,

    // principais
    primary: '#7C3AED',
    accent: '#03DAC6',

    // base clara
    background: '#F5E9FF',  // ⬅️ novo fundo lilás claro
    surface: '#F3F4F6',     // cards claros

    // texto
    text: '#111827',
    textPrimary: '#111827',
    textLight: '#FFFFFF',

    // extras que você usa nas telas
    onPrimary: '#FFFFFF',
    pillDark: '#6B7280',
    pillLight: '#E5E7EB',
    danger: '#EF4444',
  },
  roundness: 8,
};
