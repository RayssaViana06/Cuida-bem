import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from './routes';
import { useAuth } from '@/features/AuthContext';
import { ActivityIndicator, View } from 'react-native';

//Tela de reset do banco local (para testes)
//import ResetScreen from '@/screens/debug/ResetScreen';

// Auth
import LoginScreen from '@/screens/auth/LoginScreen';
import SignupScreen from '@/screens/auth/SignupScreen';

// Home
import Home from '@/screens/home';

// Medicamentos
import Medicamentos from '@/screens/medicamentos';
import AddMedicamento from '@/screens/medicamentos/AddMedicamento';

// Agenda
import Agenda from '@/screens/agenda';
import AddCompromisso from '@/screens/agenda/AddCompromisso';

// Contatos
import IndexContatos from '@/features/contatos/screens/IndexContatos';
import EditarContato from '@/features/contatos/screens/EditarContato';

// Alarmes
import AlarmsScreen from '@/features/alarmes/screens/AlarmsScreen';
import EditAlarmScreen from '@/features/alarmes/screens/EditAlarmScreen';

// Lembretes
import RemindersScreen from '@/features/lembretes/screens/RemindersScreen';
import EditReminderScreen from '@/features/lembretes/screens/EditReminderScreen';

// Perfil Familiar
import FamilyProfileScreen from '@/features/perfil-familiar/screens/FamilyProfileScreen';

// Perfil Usuário
import PerfilScreen from '@/screens/perfil/PerfilScreen';
import EditarPerfilScreen from '@/screens/perfil/EditarPerfilScreen';

// Tela de Acessibilidade / Configurações
import AcessibilidadeScreen from '@/screens/acessibilidade/AcessibilidadeScreen';

const Stack = createNativeStackNavigator();

// ---------------------------------------------------------
// Auth Stack
// ---------------------------------------------------------
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.SIGNUP} component={SignupScreen} />
    </Stack.Navigator>
  );
}

// ---------------------------------------------------------
// App Stack
// ---------------------------------------------------------
function AppStack() {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.HOME}
      screenOptions={{ headerShown: false }}
    >

       {/* Reset 
      <Stack.Screen name="RESET" component={ResetScreen} options={{ headerShown: false }} /> */}

      {/* Home */}
      <Stack.Screen name={ROUTES.HOME} component={Home} />

      {/* Medicamentos */}
      <Stack.Screen name={ROUTES.MEDICAMENTOS} component={Medicamentos} />
      <Stack.Screen name={ROUTES.ADICIONAR_MEDICAMENTO} component={AddMedicamento} />

      {/* Agenda */}
      <Stack.Screen name={ROUTES.AGENDA} component={Agenda} />
      <Stack.Screen name={ROUTES.ADICIONAR_COMPROMISSO} component={AddCompromisso} />

      {/* Alarmes */}
      <Stack.Screen name={ROUTES.ALARMES} component={AlarmsScreen} />
      <Stack.Screen name={ROUTES.EDITAR_ALARME} component={EditAlarmScreen} />

      {/* Contatos */}
      <Stack.Screen name={ROUTES.CONTATOS} component={IndexContatos} />
      <Stack.Screen name={ROUTES.EDITAR_CONTATO} component={EditarContato} />

      {/* Lembretes */}
      <Stack.Screen name={ROUTES.LEMBRETES} component={RemindersScreen} />
      <Stack.Screen name={ROUTES.EDITAR_LEMBRETE} component={EditReminderScreen} />

      {/* Perfil Familiar */}
      <Stack.Screen name={ROUTES.PERFIL_FAMILIAR} component={FamilyProfileScreen} />

      {/* Perfil Usuario */}
      <Stack.Screen name={ROUTES.PERFIL} component={PerfilScreen} />
      <Stack.Screen name={ROUTES.EDITAR_PERFIL} component={EditarPerfilScreen} />

      {/* ⚙️ Acessibilidade / Configurações */}
      <Stack.Screen
        name={ROUTES.ACESSIBILIDADE}
        component={AcessibilidadeScreen}
      />
    </Stack.Navigator>
  );
}

// ---------------------------------------------------------
// MAIN — Controla qual stack mostrar (Auth ou App)
// ---------------------------------------------------------
export default function Main() {
  const { user, loading } = useAuth();

  // Debug
  React.useEffect(() => {
    if (user) {
      console.log('🏠 Main: Usuário logado ->', user.name, user.email);
      console.log('📱 Main: AppStack ativo');
    } else {
      console.log('🔐 Main: Usuário deslogado');
      console.log('🔑 Main: AuthStack ativo');
    }
  }, [user]);

  console.log(
    '🔄 Main: Renderizando | User:',
    user ? 'Logado' : 'Não logado',
    '| Loading:',
    loading
  );

  if (loading) {
    console.log('⏳ Main: Carregando dados de autenticação...');
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#121212',
        }}
      >
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  const shouldShowAuthStack = !user;

  return shouldShowAuthStack ? <AuthStack /> : <AppStack />;
}
