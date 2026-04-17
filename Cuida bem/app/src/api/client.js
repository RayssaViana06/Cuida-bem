import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Axios client configurado com baseURL da API.
 * Interceptor de request anexa token (se existir) ao header Authorization.
 *
 * Ajustes:
 * - Se quiser usar outro nome de storage para o token, altere TOKEN_KEY.
 * - Se a API usar esquema diferente (bearer vs outro), atualize o header na linha correspondente.
 */

const BASE_URL = 'https://cuida-bem-api.vercel.app';
// const BASE_URL = 'http://localhost:3000/';
const TOKEN_KEY = '@cuida-bem:token';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // não falhar o request se AsyncStorage der erro
      // só loga
      // console.warn('Erro ao recuperar token do AsyncStorage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Aqui você pode detectar 401 e disparar algum evento global para deslogar o usuário.
    // Exemplo: if (error.response?.status === 401) { /* trigger signOut */ }
    return Promise.reject(error);
  }
);

export default api;