import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '@/features/auth/services/authService'; // serviço para login via API

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]); // apenas usuários LOCAIS

  // Debug do estado do usuário
  useEffect(() => {
    console.log(
      '👤 AuthProvider: Estado do user mudou:',
      user ? `${user.name} (${user.email}) [${user.origin}]` : 'null'
    );
  }, [user]);

  // Carregar dados ao inicializar
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // 🔹 Carrega usuários LOCAIS se existirem
      const storageUsers = await AsyncStorage.getItem('users');
      const parsedUsers = storageUsers ? JSON.parse(storageUsers) : [];
      setUsers(Array.isArray(parsedUsers) ? parsedUsers : []);

      // 🔹 Verifica se há usuário logado
      const currentUser = await AsyncStorage.getItem('currentUser');
      if (currentUser) {
        const parsed = JSON.parse(currentUser);
        setUser(parsed);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de auth:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * LOGIN
   * 1) tenta API
   * 2) SEMPRE tenta fallback local se API falhar (inclusive credenciais)
   */
  const login = async (email, password) => {
    console.log('🔐 AuthContext: iniciando login para', email);

    // 1) TENTAR LOGIN VIA API REAL (authService)
    try {
      const result = await authService.signIn(email, password);
      console.log('✅ AuthContext: login via API bem-sucedido');

      const apiUserRaw = result?.user || result;

      if (!apiUserRaw) {
        throw new Error('Usuário inválido retornado pela API');
      }

      const apiUser = {
        ...apiUserRaw,
        origin: 'api',
      };

      await AsyncStorage.setItem('currentUser', JSON.stringify(apiUser));
      setUser(apiUser);

      return { success: true, source: 'api', user: apiUser };
    } catch (apiError) {
      console.log(
        '⚠️ AuthContext: falha no login via API, tentando fallback local. Motivo:',
        apiError?.message || apiError
      );
      // ⚠️ IMPORTANTE:
      // Não retornamos aqui. Mesmo que a API diga "Email ou senha incorretos",
      // ainda vamos tentar o login LOCAL (para contas criadas só no app).
    }

    // 2) FALLBACK: LOGIN LOCAL
    try {
      const foundUser = users.find(
        (u) => u.email === email && u.password === password
      );

      if (!foundUser) {
        return { success: false, error: 'Email ou senha incorretos' };
      }

      const localUser = {
        ...foundUser,
        origin: 'local',
      };

      await AsyncStorage.setItem('currentUser', JSON.stringify(localUser));
      setUser(localUser);

      console.log('✅ AuthContext: login local bem-sucedido');
      return { success: true, source: 'local', user: localUser };
    } catch (error) {
      console.error('❌ AuthContext: erro no login local:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * SIGNUP (100% local por enquanto)
   */
  const signup = async (name, email, password, passwordConfirm) => {
  try {
    // Validações
    if (!name || !email || !password || !passwordConfirm) {
      return { success: false, error: 'Todos os campos são obrigatórios' };
    }

    if (!email.includes('@')) {
      return { success: false, error: 'Email inválido' };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: 'Senha deve ter no mínimo 6 caracteres',
      };
    }

    if (password !== passwordConfirm) {
      return { success: false, error: 'Senhas não correspondem' };
    }

    // Verificar se email já existe (local)
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'Este email já está registrado' };
    }

    // 🔐 Geração de ID local SAFE:
    // usa timestamp, praticamente impossível colidir com IDs da API (2,3,4,5,6...)
    const newId = Date.now();

    const newUser = {
      id: newId,
      origin: 'local',
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    console.log('🆕 AuthContext: usuário local criado ->', email, newId);

    return { success: true, user: newUser };
  } catch (error) {
    console.error('❌ AuthContext: erro no signup:', error);
    return { success: false, error: error.message };
  }
};


  const logout = async () => {
    try {
      console.log('🔓 AuthContext: Iniciando logout...');

      setUser(null);
      console.log('⚡ AuthContext: Estado do usuário limpo imediatamente');

      await AsyncStorage.removeItem('currentUser');
      console.log('🗑️ AuthContext: currentUser removido do AsyncStorage');

      // aqui NÃO apagamos 'users', porque são os cadastros locais
      console.log('✅ AuthContext: Logout completo!');
      return { success: true };
    } catch (error) {
      console.error('❌ AuthContext: Erro no logout:', error);
      setUser(null);
      return { success: false, error: error.message };
    }
  };

  // 🔎 helper opcional pra você debugar usuários locais pelo console
  const debugPrintLocalUsers = async () => {
    const storageUsers = await AsyncStorage.getItem('users');
    const parsed = storageUsers ? JSON.parse(storageUsers) : [];
    console.log('👥 Usuários locais salvos:', parsed);
  };

  const value = {
    user,
    users,
    loading,
    login,
    signup,
    logout,
    debugPrintLocalUsers, // se não quiser expor, pode remover
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
