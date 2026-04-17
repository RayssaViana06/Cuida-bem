import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/api/client';

const CURRENT_USER_KEY = 'currentUser';

/**
 * LOGIN REMOTO REAL (VERCEL 1º)
 *
 * Fluxo:
 * 1) Chama /usuarios com email + password via query string.
 * 2) Mesmo que a API retorne mais de um usuário, fazemos um filtro
 *    defensivo no CLIENT para garantir email+senha exatos.
 * 3) Se não achar combinação exata, lança erro -> AuthContext faz
 *    fallback para login LOCAL.
 */
export async function signIn(email, password) {
  try {
    const res = await api.get('/usuarios', {
      params: { email, password },
    });

    const list = Array.isArray(res.data) ? res.data : [];

    // 🔒 Filtro defensivo no client:
    // garante que NUNCA vamos logar com outro usuário "parecido".
    const user = list.find(
      (u) =>
        typeof u.email === 'string' &&
        typeof u.password === 'string' &&
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password
    );

    if (!user) {
      // Aqui significa: a API respondeu, mas não há usuário com esse par email+senha.
      // Lançamos erro genérico para o AuthContext cair no fallback LOCAL.
      throw new Error('Email ou senha incorretos');
    }

    // salvar no device
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    return {
      success: true,
      user,
    };
  } catch (error) {
    // Se já é nosso erro de credencial, só repassa
    if (error.message === 'Email ou senha incorretos') {
      throw error;
    }

    // Se veio resposta do servidor (4xx/5xx)
    if (error.response) {
      // Tratamos 401/404 como credenciais inválidas
      if (error.response.status === 401 || error.response.status === 404) {
        throw new Error('Email ou senha incorretos');
      }

      // Outros status -> problema de servidor
      throw new Error('Erro ao comunicar com o servidor');
    }

    // Qualquer outra coisa (timeout, sem rede, etc)
    throw new Error('Falha ao conectar à API');
  }
}

/**
 * SIGNUP — por enquanto 100% local
 * (não mexer)
 */
export async function signUp(payload) {
  throw new Error(
    'Cadastro remoto desativado. O cadastro agora é local (SQLite futuramente).'
  );
}

/**
 * LOGOUT
 */
export async function signOut() {
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
}

export async function getCurrentUser() {
  const stored = await AsyncStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

export default {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
};
