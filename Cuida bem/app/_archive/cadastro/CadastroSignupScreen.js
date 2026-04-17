import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Text, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/features/AuthContext';

export default function CadastroSignupScreen({ navigation }) {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async () => {
    try { await Haptics.selectionAsync(); } catch (e) {}
    
    if (!name.trim() || !email.trim() || !age || !password || !passwordConfirm) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    
    if (password !== passwordConfirm) {
      Alert.alert('Erro', 'Senhas não coincidem');
      return;
    }

    setLoading(true);
    const result = await signup(name.trim(), email.trim(), parseInt(age) || 0, password, passwordConfirm);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        setName(''); setEmail(''); setAge(''); setPassword(''); setPasswordConfirm('');
        navigation.replace('CadastroLogin');
      }, 2000);
    } else {
      Alert.alert('Erro', result.error);
    }
  };

  const renderInput = (label, value, onChangeText, placeholder, props = {}) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#666"
        value={value}
        onChangeText={onChangeText}
        editable={!loading}
        {...props}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.replace('CadastroLogin')} disabled={loading}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.logo}>💜</Text>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Junte-se à família CuidaBem</Text>
        </View>

        {success && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✅ Conta criada com sucesso!</Text>
          </View>
        )}

        <View style={styles.form}>
          {renderInput('👤 Nome Completo', name, setName, 'João Silva')}
          {renderInput('✉️ Email', email, setEmail, 'seu@email.com', { keyboardType: 'email-address', autoCapitalize: 'none' })}
          {renderInput('📅 Idade', age, setAge, '65', { keyboardType: 'number-pad' })}
          {renderInput('🔒 Senha', password, setPassword, '••••••••', { secureTextEntry: true })}
          {renderInput('✔️ Confirmar Senha', passwordConfirm, setPasswordConfirm, '••••••••', { secureTextEntry: true })}
        </View>

        <TouchableOpacity
          style={[styles.signupBtn, loading && styles.btnDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.btnText}>
            {loading ? '⏳ Criando...' : '🎉 Criar Conta'}
          </Text>
        </TouchableOpacity>

        <View style={styles.linkSection}>
          <Text style={styles.linkText}>Já tem conta? </Text>
          <TouchableOpacity onPress={() => navigation.replace('CadastroLogin')} disabled={loading}>
            <Text style={styles.linkButton}>Fazer login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { flex: 1, padding: 20 },
  backBtn: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 20 },
  backText: { color: '#7C3AED', fontSize: 14 },
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { fontSize: 60, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#999' },
  successBox: { backgroundColor: 'rgba(76,175,80,0.1)', borderWidth: 1, borderColor: 'rgba(76,175,80,0.5)', padding: 12, borderRadius: 8, marginBottom: 20 },
  successText: { color: '#4caf50', fontSize: 14, textAlign: 'center' },
  form: { marginBottom: 30 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, color: '#ccc', marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 12, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)' },
  signupBtn: { backgroundColor: '#7C3AED', borderRadius: 12, padding: 15, alignItems: 'center', marginBottom: 20 },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkSection: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  linkText: { color: '#999', fontSize: 14 },
  linkButton: { color: '#7C3AED', fontSize: 14, fontWeight: '600' }
});
