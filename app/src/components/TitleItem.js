import React, { useState } from 'react';
import { StyleSheet, Text} from 'react-native';

const TitleItem = (props) => {
  let texto = '';

  if (props.Nome) texto = 'Nome';
  else if (props.Especialidade) texto = 'Especialidade';
  else if (props.Local) texto = 'Local';
  else if (props.Endereco) texto = 'Endereço';
  else if (props.Telefone) texto = 'Telefone';
  else if (props.Coment) texto = 'Comentários';
  else texto = 'Título'; // padrão, caso nenhuma prop seja passada

  return <Text style={styles.text}>{texto}</Text>;
};

// Estilos

const styles = StyleSheet.create({
  item: {
    backgroundColor: 'white',
    paddingBottom: 5,
  },

  text: {
    fontSize: 20,
    textAlign: 'start',
    fontWeight: 'bold',
  },
});

export default TitleItem;
