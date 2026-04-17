import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  editable = true,
  icon,
  autoCapitalize = 'sentences',
}) {
  const { colors } = useTheme();
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.primary }]}>{label}</Text>}

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: error ? '#ff4757' : colors.primary,
            backgroundColor: 'rgba(255,255,255,0.05)',
          },
        ]}
      >
        {icon && <Text style={styles.icon}>{icon}</Text>}

        <TextInput
          style={[
            styles.input,
            { color: '#fff', flex: 1 },
            !editable && styles.inputDisabled,
          ]}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsSecure(!isSecure)}
            style={styles.eyeIcon}
          >
            <MaterialIcons
              name={isSecure ? 'visibility-off' : 'visibility'}
              size={20}
              color="rgba(255,255,255,0.6)"
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 48,
  },

  input: {
    fontSize: 14,
    paddingVertical: 12,
  },

  inputDisabled: {
    opacity: 0.5,
  },

  icon: {
    fontSize: 20,
    marginRight: 8,
  },

  eyeIcon: {
    padding: 8,
    marginRight: -8,
  },

  error: {
    fontSize: 12,
    color: '#ff4757',
    marginTop: 6,
  },
});
