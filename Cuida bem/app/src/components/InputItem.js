import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';

const InputItem = (props) => {
  const [valor, setValor] = useState('');

  // Define o placeholder e o rótulo com base na propriedade passada
  let label = '';
  if (props.Nome) label = '';
  else if (props.Especialidade) label = 'Especialidade';
  else if (props.Local) label = 'Local';
  else if (props.Endereco) label = 'Endereço';
  else if (props.Telefone) label = 'Telefone';
  else if (props.Relation) label = '';

  let placeholder = '';
  if (props.pNome) placeholder = 'nome';
  else if (props.pRelation) placeholder = 'parentesco';

  return (
    <View style={styles.container}>
      {/* Label do campo (renderiza só se tiver texto) */}
      {label !== '' && <Text style={styles.text}>{label}</Text>}

      {/* Campo de entrada de texto */}
      <TextInput
        style={styles.item}
        mode="outlined"
        placeholder={
          placeholder
            ? `Digite o ${placeholder.toLowerCase()}...`
            : 'Digite aqui...'
        }
        value={valor}
        onChangeText={(texto) => {
          setValor(texto);
          if (props.onChange) props.onChange(texto); // envia para o componente pai
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  item: {
    backgroundColor: 'white',
    paddingBottom: 5,
  },
  text: {
    fontSize: 16,
    textAlign: 'left', // FIX: 'start' -> 'left' para evitar warning
    fontWeight: 'bold',
    marginBottom: 4,
  },
});

export default InputItem;
