import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';

const ProfileTag = ({ nome, onClose, onPress }) => {
  return (
    <Chip
      style={styles.chip}
      mode="flat"
      onPress={onPress}
      onClose={onClose}
      closeIcon="close"

    >
      {nome}
    </Chip>
  );
};

const styles = StyleSheet.create({
  chip: {
    margin: 5,
    backgroundColor: '#e3f2fd',
  }
});

export default ProfileTag;
