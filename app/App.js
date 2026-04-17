import 'react-native-gesture-handler';
import * as React from 'react';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { LogBox, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';

import Main from '@/navigation/Main';
import { ContactsProvider } from '@/features/contatos/store/contacts.context';
import { AgendaProvider } from '@/features/agenda/store/agenda.context';
import { AuthProvider } from '@/features/AuthContext';

import { ROUTES } from '@/navigation/routes';
import { AccessibilityProvider, useAccessibility } from '@/features/acessibilidade/store/acessibilidade.context';

// Silenciar warnings do Gesture Handler
LogBox.ignoreLogs(['Cannot record touch end without a touch start']);

// Configurações de notificações em foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority:
      Platform.OS === 'android'
        ? Notifications.AndroidNotificationPriority.MAX
        : undefined,
  }),
});

function AppContent() {
  const { paperTheme } = useAccessibility();

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={paperTheme}>
        <ContactsProvider>
          <AgendaProvider>
            <Main />
          </AgendaProvider>
        </ContactsProvider>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  React.useEffect(() => {
    if (__DEV__) {
      console.log('✔️ ROUTES carregado:', ROUTES);
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* StatusBar do Expo respeitando tema claro/escuro do paperTheme */}
      <StatusBar style="auto" />
      {/* Opcional: garantir que a StatusBar nativa não fique com cor estranha */}
      <RNStatusBar translucent backgroundColor="transparent" />

      {/* Agora o AuthProvider vem POR FORA,
          e o AccessibilityProvider vem logo dentro dele */}
      <AuthProvider>
        <AccessibilityProvider>
          <AppContent />
        </AccessibilityProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
