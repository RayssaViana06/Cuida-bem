import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/features/AuthContext';

export default function CadastroLoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('joao@email.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try { await Haptics.selectionAsync(); } catch (e) {}
    
    if (!email.trim() || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.success) {
      // Nada aqui: AuthContext/Main troca o stack para o AppStack (HOME).
    } else {
      Alert.alert('Erro', result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>💜</Text>
          <Text style={styles.title}>Bem-vindo</Text>
          <Text style={styles.subtitle}>Acesse sua conta CuidaBem</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>✉️ Email</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>🔒 Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.loginBtn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.btnText}>
            {loading ? '⏳ Entrando...' : '🚀 Entrar'}
          </Text>
        </TouchableOpacity>

        <View style={styles.linkSection}>
          <Text style={styles.linkText}>Não tem conta? </Text>
          <TouchableOpacity onPress={() => navigation.replace('CadastroSignup')} disabled={loading}>
            <Text style={styles.linkButton}>Criar agora</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>📱 Demo</Text>
          <Text style={styles.demoText}>Email: joao@email.com</Text>
          <Text style={styles.demoText}>Senha: 123456</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 80, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#999' },
  form: { marginBottom: 30 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#ccc', marginBottom: 8 },
  input: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 12, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)' },
  loginBtn: { backgroundColor: '#7C3AED', borderRadius: 12, padding: 15, alignItems: 'center', marginBottom: 20 },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkSection: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  linkText: { color: '#999', fontSize: 14 },
  linkButton: { color: '#7C3AED', fontSize: 14, fontWeight: '600' },
  demoBox: { backgroundColor: 'rgba(124,58,237,0.1)', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)' },
  demoTitle: { color: '#7C3AED', fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  demoText: { color: '#999', fontSize: 12, marginVertical: 2 }
});
