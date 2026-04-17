import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '@/features/AuthContext';
import { ROUTES } from '@/navigation/routes';

export default function SignupScreen({ navigation }) {
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async () => {
    setError('');
    setSuccess('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password || !passwordConfirm) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    const result = await signup(
      trimmedName,
      trimmedEmail,
      password,
      passwordConfirm
    );
    setLoading(false);

    if (result.success) {
      setSuccess('Conta criada com sucesso! Redirecionando para login...');
      setName('');
      setEmail('');
      setPassword('');
      setPasswordConfirm('');

      setTimeout(() => {
        navigation.replace(ROUTES.LOGIN);
      }, 2000);
    } else {
      setError(result.error);
    }
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
              {/* Botão voltar para login */}
              <TouchableOpacity
                onPress={() => navigation.replace(ROUTES.LOGIN)}
                disabled={loading}
                style={styles.backBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.backBtnText}>← Voltar para login</Text>
              </TouchableOpacity>

              {/* Logo */}
              <View style={styles.logoWrapper}>
                <Image
                  source={require('../../../assets/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>

              {/* Título */}
              <Text style={styles.title}>Criar conta</Text>
              <Text style={styles.subtitle}>Junte-se à família CuidaBem</Text>

              {/* Mensagens */}
              {success ? (
                <View style={styles.successBox}>
                  <Text style={styles.successText}>{success}</Text>
                </View>
              ) : null}

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Formulário */}
              <View style={styles.form}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Nome completo</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="João da Silva"
                    placeholderTextColor="#9C7ACB"
                    value={name}
                    onChangeText={setName}
                    editable={!loading}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="seu@email.com"
                    placeholderTextColor="#9C7ACB"
                    value={email}
                    onChangeText={setEmail}
                    editable={!loading}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Senha</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Digite sua senha"
                    placeholderTextColor="#9C7ACB"
                    value={password}
                    onChangeText={setPassword}
                    editable={!loading}
                    secureTextEntry
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Confirmar senha</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Repita sua senha"
                    placeholderTextColor="#9C7ACB"
                    value={passwordConfirm}
                    onChangeText={setPasswordConfirm}
                    editable={!loading}
                    secureTextEntry
                  />
                </View>

                {/* Botão Criar conta */}
                <TouchableOpacity
                  style={[styles.mainBtn, loading && { opacity: 0.7 }]}
                  onPress={handleSignup}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.mainBtnText}>
                    {loading ? 'Criando conta...' : 'Criar conta'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Link para login */}
              <View style={styles.linkContainer}>
                <Text style={styles.linkText}>Já tem conta? </Text>
                <TouchableOpacity
                  onPress={() => navigation.replace(ROUTES.LOGIN)}
                  disabled={loading}
                >
                  <Text style={[styles.linkText, styles.link]}>
                    Fazer login
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

  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(124,58,237,0.06)',
    marginBottom: 10,
  },
  backBtnText: {
    fontSize: 13,
    color: '#4B1D7A',
    fontWeight: '500',
  },

  logoWrapper: { alignItems: 'center', marginBottom: 6 },
  logoImage: {
    width: 140,
    height: 140,
    marginBottom: 6,
  },

  title: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 22,
    color: '#3B0764',
    marginTop: 10,
  },

  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#512772',
    opacity: 0.8,
    marginBottom: 18,
  },

  successBox: {
    backgroundColor: '#E6F4EA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#81C784',
  },
  successText: {
    color: '#2E7D32',
    textAlign: 'center',
    fontSize: 13,
  },

  errorBox: {
    backgroundColor: '#FFE5E9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FF8A9A',
  },
  errorText: {
    color: '#C62828',
    textAlign: 'center',
    fontSize: 13,
  },

  form: { marginTop: 6 },

  formGroup: { marginBottom: 14 },

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

  mainBtn: {
    backgroundColor: '#E2C4FF',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
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
