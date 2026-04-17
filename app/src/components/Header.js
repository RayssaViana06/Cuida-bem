import React from 'react';
import { StyleSheet } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Header({ title, onBack }) {
  const theme = useTheme() || {};
  const colors = theme.colors || {};

  return (
    <SafeAreaView edges={['top']}>
      <Appbar.Header
        style={[
          styles.header,
          { backgroundColor: 'transparent' }
        ]}
        elevated={false}
      >
        {onBack ? <Appbar.BackAction onPress={onBack} /> : null}
        <Appbar.Content
          title={title}
          titleStyle={[styles.title, { color: colors.textPrimary || '#fff' }]}
        />
      </Appbar.Header>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { elevation: 0, shadowOpacity: 0 },
  title: { fontWeight: '700' },
});
