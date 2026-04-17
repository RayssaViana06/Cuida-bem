import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Switch,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/features/AuthContext';
import { ROUTES } from '@/navigation/routes';

const REMEMBER_EMAIL_KEY = '@cuidabem_login_email';

export default function LoginScreen({ navigation }) {
  const { colors } = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const eyeScale = useRef(new Animated.Value(1)).current;

  // Carrega email salvo (se existir)
  useEffect(() => {
    const loadRememberedEmail = async () => {
      try {
        const stored = await AsyncStorage.getItem(REMEMBER_EMAIL_KEY);
        if (stored) {
          setEmail(stored);
          setRememberEmail(true);
        }
      } catch (e) {
        console.warn('Erro ao carregar email lembrado:', e);
      }
    };
    loadRememberedEmail();
  }, []);

  const persistEmail = async (emailValue, shouldRemember) => {
    try {
      if (shouldRemember && emailValue) {
        await AsyncStorage.setItem(REMEMBER_EMAIL_KEY, emailValue);
      } else {
        await AsyncStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
    } catch (e) {
      console.warn('Erro ao salvar email lembrado:', e);
    }
  };

  const handleLogin = async () => {
    setError('');

    const loginEmail = email.trim();

    if (!loginEmail || !password.trim()) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    const result = await login(loginEmail, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
    } else {
      await persistEmail(loginEmail, rememberEmail);
    }
  };

  const handleTogglePassword = () => {
    Animated.sequence([
      Animated.timing(eyeScale, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(eyeScale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();

    setShowPassword(prev => !prev);
  };

  return (
    <LinearGradient
      colors={['#F5E8FF', '#F0DFFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>

            {/* CARD CENTRAL */}
            <View style={styles.card}>

              {/* Logo */}
              <View style={styles.logoWrapper}>
                <Image
                  source={require('../../../assets/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>

              {/* Título */}
              <Text style={styles.title}>Bem-vindo</Text>
              <Text style={styles.subtitle}>Faça login para continuar</Text>

              {/* Erro */}
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Formulário */}
              <View style={styles.form}>
                <View className="formGroup" style={styles.formGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    editable={!loading}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="Digite seu email"
                    placeholderTextColor="#9C7ACB"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Senha</Text>

                  <View style={styles.passwordWrapper}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      value={password}
                      onChangeText={setPassword}
                      editable={!loading}
                      secureTextEntry={!showPassword}
                      placeholder="Digite sua senha"
                      placeholderTextColor="#9C7ACB"
                    />

                    <TouchableOpacity
                      onPress={handleTogglePassword}
                      activeOpacity={0.7}
                      style={styles.eyeBtn}
                    >
                      <Animated.View style={{ transform: [{ scale: eyeScale }] }}>
                        <Ionicons
                          name={showPassword ? 'eye-off' : 'eye'}
                          size={22}
                          color="#7C3AED"
                        />
                      </Animated.View>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Lembrar email */}
                <View style={styles.rememberRow}>
                  <Switch
                    value={rememberEmail}
                    onValueChange={setRememberEmail}
                    trackColor={{ false: '#E4C7FF', true: '#C084FC' }}
                    thumbColor={rememberEmail ? '#7C3AED' : '#F9FAFB'}
                  />
                  <Text style={styles.rememberText}>Lembrar meu email</Text>
                </View>

                {/* Entrar */}
                <TouchableOpacity
                  style={styles.mainBtn}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.mainBtnText}>ENTRAR</Text>
                </TouchableOpacity>
              </View>

              {/* Link para signup */}
              <View style={styles.linkContainer}>
                <Text style={styles.linkText}>Não tem conta? </Text>
                <TouchableOpacity
                  onPress={() => navigation.replace(ROUTES.SIGNUP)}
                  disabled={loading}
                >
                  <Text style={[styles.linkText, styles.link]}>
                    Criar conta
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'stretch',
  },

  card: {
    backgroundColor: '#F7ECFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  logoWrapper: { alignItems: 'center', marginBottom: 6 },
  logoImage: {
    width: 140,
    height: 140,
  },

  title: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 22,
    color: '#3B0764',
    marginTop: 6,
  },

  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#512772',
    opacity: 0.8,
    marginBottom: 22,
  },

  errorBox: {
    backgroundColor: '#FFE5E9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FF8A9A',
  },
  errorText: {
    color: '#C62828',
    textAlign: 'center',
    fontSize: 13,
  },

  form: { marginTop: 10 },

  formGroup: { marginBottom: 18 },

  label: {
    fontSize: 13,
    color: '#5B1F84',
    marginBottom: 6,
    fontWeight: '600',
  },

  input: {
    backgroundColor: '#FFFFFFEE',
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E4C7FF',
    color: '#3B0764',
  },

  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFFEE',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4C7FF',
  },

  passwordInput: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 16,
  },

  eyeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  rememberText: {
    marginLeft: 8,
    color: '#4B1D7A',
    fontSize: 14,
  },

  mainBtn: {
    backgroundColor: '#E2C4FF',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  mainBtnText: {
    fontWeight: '700',
    color: '#3B0764',
    fontSize: 16,
  },

  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  linkText: {
    color: '#4B1D7A',
    fontSize: 14,
    opacity: 0.8,
  },
  link: {
    color: '#7C3AED',
    fontWeight: '700',
    opacity: 1,
  },
});
