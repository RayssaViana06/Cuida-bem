import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import { List } from 'react-native-paper';
import ProfileTag from './ProfileTag';

const ProfileList = () => {
  const [perfis, setPerfis] = useState([]); // todos os perfis do banco
  const [selecionados, setSelecionados] = useState([]); // perfis selecionados (tags)
  const [carregando, setCarregando] = useState(true);

  // Simulação de busca no banco de dados
  useEffect(() => {
    setTimeout(() => {
      setPerfis([
        { id: 1, nome: 'Ana Clara' },
        { id: 2, nome: 'Bruno Souza' },
        { id: 3, nome: 'Clara Mendes' },
        { id: 4, nome: 'Diego Alves' },
      ]);
      setCarregando(false);
    }, 1000);
  }, []);

  const adicionarPerfil = (perfil) => {
    // evita duplicados
    if (!selecionados.find((p) => p.id === perfil.id)) {
      setSelecionados([...selecionados, perfil]);
    }
  };

  const removerPerfil = (id) => {
    setSelecionados(selecionados.filter((p) => p.id !== id));
  };

  if (carregando) {
    return <ActivityIndicator style={{ marginTop: 20 }} />;
  }

  return (
    <ScrollView style={{ padding: 10 }}>
      {/* Accordion com todos os perfis */}
      <List.Section style={styles.button}>
        <List.Accordion
          title="Selecionar Perfis"
          left={(props) => <List.Icon {...props} icon="account-multiple" />}>
          {perfis.map((perfil) => (
            <List.Item
              key={perfil.id}
              title={perfil.nome}
              onPress={() => adicionarPerfil(perfil)}
            />
          ))}
        </List.Accordion>
      </List.Section>

      {/* Perfis selecionados como tags */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
        {selecionados.map((perfil) => (
          <ProfileTag
            key={perfil.id}
            nome={perfil.nome}
            onClose={() => removerPerfil(perfil.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

// Estilos

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12, // bordas arredondadas
    overflow: 'hidden', // importante para que os cantos fiquem arredondados
    marginVertical: 5,
  },
});

export default ProfileList;
