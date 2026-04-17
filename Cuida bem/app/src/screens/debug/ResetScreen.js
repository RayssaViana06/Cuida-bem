import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResetScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  /**
   * ⚠️ RESET DESATIVADO TEMPORARIAMENTE
   * Basta remover o comentário do botão lá embaixo para reativar.
   */

  // ❌ Função original comentada
  /*
  const handleReset = async () => {
    Alert.alert(
      "Confirmar limpeza",
      "Tem certeza que deseja apagar TODOS os dados do dispositivo?\n(Usuários locais, perfis, medicamentos, contatos, agenda, alarmes, lembretes, etc.)",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar tudo",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await AsyncStorage.clear();
              console.log("Limpou tudo");

              Alert.alert("Pronto!", "Todos os dados foram apagados.", [
                {
                  text: "OK",
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              console.log("Erro ao limpar AsyncStorage:", error);
              Alert.alert("Erro", "Não foi possível limpar.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };
  */

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Limpar todos os dados</Text>

      {/* 🚫 BOTÃO DESATIVADO — não chama mais a função handleReset */}
      <TouchableOpacity
        style={[styles.btn, { opacity: 0.4 }]}
        // onPress={handleReset}  // <<< desativado
        disabled={true}
      >
        <Text style={styles.btnText}>APAGAR TUDO (desativado)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7ecff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#3b0764",
  },
  btn: {
    backgroundColor: "#e2c4ff",
    paddingVertical: 16,
    paddingHorizontal: 26,
    borderRadius: 16,
    marginBottom: 20,
  },
  btnText: {
    color: "#3b0764",
    fontSize: 18,
    fontWeight: "bold",
  },
  backBtn: {
    paddingVertical: 10,
  },
  backText: {
    color: "#3b0764",
    fontSize: 16,
    opacity: 0.7,
  },
});
